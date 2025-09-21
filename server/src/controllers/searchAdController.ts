import { Request, Response } from 'express';
import { SearchAd } from '../models/SearchAd';
import { AuthRequest } from '../types/auth'; // Corrected import

export const createSearchAd = async (
	req: AuthRequest,
	res: Response,
): Promise<void> => {
	try {
		// Ensure user is attached to the request
		if (!req.user) {
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
		const searchAds = await SearchAd.find({ status: 'active' })
			.populate('authorId', 'firstName lastName avatar userType')
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
		if (!req.user) {
			res.status(401).json({
				success: false,
				message: 'Authentication required',
			});
			return;
		}
		const searchAds = await SearchAd.find({ authorId: req.user.id }).sort({
			createdAt: -1,
		});
		res.status(200).json({ success: true, data: searchAds });
	} catch (error) {
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
			'firstName lastName avatar',
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
		if (!req.user) {
			res.status(401).json({
				success: false,
				message: 'Authentication required',
			});
			return;
		}
		const searchAd = await SearchAd.findById(req.params.id);
		if (!searchAd) {
			res.status(404).json({
				success: false,
				message: 'Search ad not found',
			});
			return;
		}
		if (searchAd.authorId.toString() !== req.user.id.toString()) {
			res.status(403).json({
				success: false,
				message: 'User not authorized to update this ad',
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
		if (!req.user) {
			res.status(401).json({
				success: false,
				message: 'Authentication required',
			});
			return;
		}
		const searchAd = await SearchAd.findById(req.params.id);
		if (!searchAd) {
			res.status(404).json({
				success: false,
				message: 'Search ad not found',
			});
			return;
		}
		if (searchAd.authorId.toString() !== req.user.id.toString()) {
			res.status(403).json({
				success: false,
				message: 'User not authorized to delete this ad',
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
		if (!req.user) {
			res.status(401).json({
				success: false,
				message: 'Authentication required',
			});
			return;
		}
		const { status } = req.body;
		if (!status) {
			res.status(400).json({
				success: false,
				message: 'Status is required',
			});
			return;
		}
		const searchAd = await SearchAd.findById(req.params.id);
		if (!searchAd) {
			res.status(404).json({
				success: false,
				message: 'Search ad not found',
			});
			return;
		}
		if (searchAd.authorId.toString() !== req.user.id.toString()) {
			res.status(403).json({
				success: false,
				message: 'User not authorized to update this ad',
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
