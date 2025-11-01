import { Request, Response } from 'express';
import { SearchAd } from '../models/SearchAd';
import { AuthRequest } from '../types/auth';
import { logger } from '../utils/logger'; // Corrected import

export const createSearchAd = async (
	req: AuthRequest,
	res: Response,
): Promise<void> => {
	try {
		if (!req.user?.id) {
			res.status(401).json({
				success: false,
				message: 'Authentication required',
			});
			return;
		}

		const adData = {
			...req.body,
			authorId: req.user.id,
			authorType: req.user.userType,
		};
		const searchAd = new SearchAd(adData);
		await searchAd.save();
		res.status(201).json({ success: true, data: searchAd });
	} catch (error) {
		res.status(400).json({
			success: false,
			message: 'Error creating search ad',
			error: (error as Error).message,
		});
	}
};

export const getAllSearchAds = async (
	req: Request,
	res: Response,
): Promise<void> => {
	try {
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		const filter: any = { status: 'active' };

		// Extract all filter parameters
		const {
			city,
			postalCode,
			propertyType,
			authorType,
			search,
			minBudget,
			maxBudget,
		} = req.query;

		// Filter by author type (profile filter: agent or apporteur)
		if (authorType) {
			filter.authorType = authorType;
		}

		// Filter by property types
		if (propertyType) {
			// Map from Property types to SearchAd types
			const typeMapping: Record<string, string[]> = {
				Appartement: ['apartment'],
				Maison: ['house'],
				Terrain: ['land'],
				'Local commercial': ['commercial'],
				Bureaux: ['building', 'commercial'],
				Parking: ['parking', 'garage'],
				Autre: ['other'],
			};
			const mappedTypes = typeMapping[propertyType as string] || [
				propertyType,
			];
			filter.propertyTypes = {
				$in: mappedTypes.map((t) => new RegExp(`^${t}$`, 'i')),
			};
		}

		// Text search across title, description, and cities
		if (search) {
			const searchRegex = new RegExp(search as string, 'i');
			filter.$or = [
				{ title: searchRegex },
				{ description: searchRegex },
				{ 'location.cities': searchRegex },
			];
		}

		// Location filtering by cities
		if (city) {
			// Support comma-separated cities
			const cities = (city as string).split(',').map((c) => c.trim());
			filter['location.cities'] = {
				$in: cities.map((c) => new RegExp(c, 'i')),
			};
		}

		// Location filtering by postal codes
		if (postalCode) {
			// Support comma-separated postal codes
			const postalCodes = (postalCode as string)
				.split(',')
				.map((pc) => pc.trim());
			filter['location.postalCodes'] = { $in: postalCodes };
		}

		// Budget filtering (compare against budget.max)
		if (minBudget || maxBudget) {
			filter['budget.max'] = {};
			if (minBudget) {
				filter['budget.max'].$gte = Number(minBudget);
			}
			if (maxBudget) {
				filter['budget.max'].$lte = Number(maxBudget);
			}
		}

		const searchAds = await SearchAd.find(filter)
			.populate('authorId', 'firstName lastName profileImage userType')
			.sort({ createdAt: -1 });
		res.status(200).json({ success: true, data: searchAds });
	} catch (error) {
		res.status(500).json({
			success: false,
			message: 'Error fetching search ads',
			error: (error as Error).message,
		});
	}
};

export const getMySearchAds = async (
	req: AuthRequest,
	res: Response,
): Promise<void> => {
	try {
		if (!req.user?.id) {
			res.status(401).json({
				success: false,
				message: 'Authentication required',
			});
			return;
		}

		const searchAds = await SearchAd.find({ authorId: req.user.id })
			.populate('authorId', 'firstName lastName profileImage userType')
			.sort({ createdAt: -1 });
		res.status(200).json({ success: true, data: searchAds });
	} catch (error) {
		logger.error('[SearchAdController] Error fetching my search ads', {
			error: error instanceof Error ? error.message : String(error),
			userId: req.user?.id,
		});
		res.status(500).json({
			success: false,
			message: 'Error fetching search ads',
			error: (error as Error).message,
		});
	}
};

export const getSearchAdById = async (
	req: Request,
	res: Response,
): Promise<void> => {
	try {
		const searchAd = await SearchAd.findById(req.params.id).populate(
			'authorId',
			'firstName lastName profileImage',
		);
		if (!searchAd) {
			res.status(404).json({
				success: false,
				message: 'Search ad not found',
			});
			return;
		}
		res.status(200).json({ success: true, data: searchAd });
	} catch (error) {
		res.status(500).json({
			success: false,
			message: 'Error fetching search ad',
			error: (error as Error).message,
		});
	}
};

export const updateSearchAd = async (
	req: AuthRequest,
	res: Response,
): Promise<void> => {
	try {
		// Middleware has already verified authentication and ownership
		// Resource is attached to req.resource by requireOwnership middleware
		const searchAd =
			req.resource || (await SearchAd.findById(req.params.id));

		if (!searchAd) {
			res.status(404).json({
				success: false,
				message: 'Search ad not found',
			});
			return;
		}

		Object.assign(searchAd, req.body);
		await searchAd.save();
		res.status(200).json({ success: true, data: searchAd });
	} catch (error) {
		res.status(400).json({
			success: false,
			message: 'Error updating search ad',
			error: (error as Error).message,
		});
	}
};

export const deleteSearchAd = async (
	req: AuthRequest,
	res: Response,
): Promise<void> => {
	try {
		// Middleware has already verified authentication and ownership
		const searchAd =
			req.resource || (await SearchAd.findById(req.params.id));

		if (!searchAd) {
			res.status(404).json({
				success: false,
				message: 'Search ad not found',
			});
			return;
		}

		await searchAd.deleteOne();
		res.status(200).json({ success: true, message: 'Search ad deleted' });
	} catch (error) {
		res.status(500).json({
			success: false,
			message: 'Error deleting search ad',
			error: (error as Error).message,
		});
	}
};

export const updateSearchAdStatus = async (req: AuthRequest, res: Response) => {
	try {
		// Middleware has already verified authentication and ownership
		const { status } = req.body;
		if (!status) {
			res.status(400).json({
				success: false,
				message: 'Status is required',
			});
			return;
		}

		const searchAd =
			req.resource || (await SearchAd.findById(req.params.id));

		if (!searchAd) {
			res.status(404).json({
				success: false,
				message: 'Search ad not found',
			});
			return;
		}

		searchAd.status = status;
		await searchAd.save();
		res.status(200).json({
			success: true,
			message: 'Search ad status updated',
			searchAd,
		});
	} catch (error) {
		res.status(500).json({
			success: false,
			message: 'Error updating search ad status',
			error: (error as Error).message,
		});
	}
};
