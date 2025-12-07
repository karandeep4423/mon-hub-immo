import { Request, Response } from 'express';
import { SearchAd } from '../models/SearchAd';
import { Collaboration } from '../models/Collaboration';
import { UserFavoriteSearchAd } from '../models/UserFavoriteSearchAd';
import { notificationService } from '../services/notificationService';
import { User } from '../models/User';
import { AuthRequest } from '../types/auth';
import { logger } from '../utils/logger'; // Corrected import
import { sanitizeHtmlContent, createSafeRegex } from '../utils/sanitize';

export const createSearchAd = async (
	req: AuthRequest,
	res: Response,
): Promise<void> => {
	try {
		if (!req.user?.id) {
			res.status(401).json({
				success: false,
				message: 'Authentification requise',
			});
			return;
		}

		const adData = {
			...req.body,
			authorId: req.user.id,
			authorType: req.user.userType,
		};

		// Sanitize HTML description
		if (adData.description) {
			adData.description = sanitizeHtmlContent(adData.description);
		}

		const searchAd = new SearchAd(adData);
		await searchAd.save();
		res.status(201).json({ success: true, data: searchAd });
	} catch (error) {
		res.status(400).json({
			success: false,
			message: "Échec de la création de l'annonce de recherche",
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
				$in: mappedTypes.map((t) => createSafeRegex(`^${t}$`)),
			};
		}

		// Text search across title, description, and cities
		if (search) {
			const searchRegex = createSafeRegex(search as string);
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
				$in: cities.map((c) => createSafeRegex(c)),
			};
		}

		// Location filtering by postal codes
		if (postalCode) {
			// Support comma-separated postal codes
			const postalCodes = (postalCode as string)
				.split(',')
				.map((pc) => pc.trim());
			// Check both postalCodes array and cities array (cities may contain "City (PostalCode)")
			filter.$or = filter.$or || [];
			filter.$or.push(
				{ 'location.postalCodes': { $in: postalCodes } },
				{
					'location.cities': {
						$in: postalCodes.map((pc) => createSafeRegex(pc)),
					},
				},
			);
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
			message: 'Échec du chargement des annonces de recherche',
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
				message: 'Authentification requise',
			});
			return;
		}

		// Admin can see all search ads, others see only their own
		const filter =
			req.user.userType === 'admin' ? {} : { authorId: req.user.id };
		const searchAds = await SearchAd.find(filter)
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
			message: 'Échec du chargement de vos annonces de recherche',
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
				message: 'Annonce de recherche introuvable',
				deleted: true,
			});
			return;
		}

		// Check if search ad is archived (soft deleted)
		if (searchAd.status === 'archived') {
			res.status(410).json({
				success: false,
				message:
					'Cette annonce de recherche a été supprimée ou archivée',
				deleted: true,
			});
			return;
		}

		res.status(200).json({ success: true, data: searchAd });
	} catch (error) {
		res.status(500).json({
			success: false,
			message: "Échec du chargement de l'annonce de recherche",
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
				message: 'Annonce de recherche introuvable',
			});
			return;
		}

		// Sanitize HTML description if being updated
		const updateData = { ...req.body };
		if (updateData.description) {
			updateData.description = sanitizeHtmlContent(
				updateData.description,
			);
		}

		Object.assign(searchAd, updateData);
		await searchAd.save();
		res.status(200).json({ success: true, data: searchAd });
	} catch (error) {
		res.status(400).json({
			success: false,
			message: "Échec de la mise à jour de l'annonce de recherche",
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
				message: 'Annonce de recherche introuvable',
			});
			return;
		}

		const searchAdId = searchAd._id.toString();

		// Find and delete related collaborations
		const relatedCollaborations = await Collaboration.find({
			postId: searchAdId,
			postType: 'SearchAd',
		});

		// Notify all collaborators before deletion
		const ownerUser = await User.findById(req.user?.id).select(
			'firstName lastName',
		);
		const ownerName = ownerUser
			? `${ownerUser.firstName} ${ownerUser.lastName}`
			: 'Le créateur';

		for (const collab of relatedCollaborations) {
			// Notify both parties
			const notifyUsers = [
				collab.postOwnerId.toString(),
				collab.collaboratorId.toString(),
			].filter((uid) => uid !== req.user?.id);

			for (const userId of notifyUsers) {
				try {
					await notificationService.create({
						recipientId: userId,
						actorId: req.user?.id || collab.postOwnerId,
						type: 'collab:cancelled',
						entity: { type: 'collaboration', id: collab._id },
						title: 'Recherche supprimée',
						message: `${ownerName} a supprimé l'annonce de recherche. La collaboration a été annulée.`,
						data: {
							actorName: ownerName,
							searchAdTitle: searchAd.title,
						},
					});
				} catch (error) {
					logger.error(
						'[SearchAdController] Error sending notification',
						error,
					);
				}
			}
		}

		// Delete collaborations
		const deletedCollabs = await Collaboration.deleteMany({
			postId: searchAdId,
			postType: 'SearchAd',
		});
		logger.info(
			`[SearchAdController] Deleted ${deletedCollabs.deletedCount} collaborations for search ad ${searchAdId}`,
		);

		// Delete favorites
		const deletedFavorites = await UserFavoriteSearchAd.deleteMany({
			searchAdId: searchAdId,
		});
		logger.info(
			`[SearchAdController] Deleted ${deletedFavorites.deletedCount} favorites for search ad ${searchAdId}`,
		);

		await searchAd.deleteOne();
		res.status(200).json({
			success: true,
			message: 'Annonce de recherche supprimée',
		});
	} catch (error) {
		res.status(500).json({
			success: false,
			message: "Échec de la suppression de l'annonce de recherche",
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
				message: 'Le statut est requis',
			});
			return;
		}

		const searchAd =
			req.resource || (await SearchAd.findById(req.params.id));

		if (!searchAd) {
			res.status(404).json({
				success: false,
				message: 'Annonce de recherche introuvable',
			});
			return;
		}

		searchAd.status = status;
		await searchAd.save();
		res.status(200).json({
			success: true,
			message: "Statut de l'annonce mis à jour",
			searchAd,
		});
	} catch (error) {
		res.status(500).json({
			success: false,
			message: 'Échec de la mise à jour du statut',
			error: (error as Error).message,
		});
	}
};

// Admin delete search ad (no ownership check)
export const deleteAdminSearchAd = async (
	req: AuthRequest,
	res: Response,
): Promise<void> => {
	try {
		const { id } = req.params;
		const searchAd = await SearchAd.findById(id);

		if (!searchAd) {
			res.status(404).json({
				success: false,
				message: 'Annonce de recherche introuvable',
			});
			return;
		}

		// Find and delete related collaborations
		const relatedCollaborations = await Collaboration.find({
			postId: id,
			postType: 'SearchAd',
		});

		// Notify all collaborators before deletion
		const adminUser = await User.findById(req.user?.id).select(
			'firstName lastName',
		);
		const adminName = adminUser
			? `${adminUser.firstName} ${adminUser.lastName}`
			: 'Un administrateur';

		for (const collab of relatedCollaborations) {
			// Notify both parties
			const notifyUsers = [
				collab.postOwnerId.toString(),
				collab.collaboratorId.toString(),
			];

			for (const userId of notifyUsers) {
				try {
					await notificationService.create({
						recipientId: userId,
						actorId: req.user?.id || 'admin',
						type: 'collab:cancelled',
						entity: { type: 'collaboration', id: collab._id },
						title: 'Recherche supprimée par admin',
						message: `${adminName} a supprimé l'annonce de recherche "${searchAd.title}". La collaboration a été annulée.`,
						data: {
							actorName: adminName,
							searchAdTitle: searchAd.title,
							deletedByAdmin: true,
						},
					});
				} catch (error) {
					logger.error(
						'[SearchAdController] Error sending notification',
						error,
					);
				}
			}
		}

		// Delete collaborations
		const deletedCollabs = await Collaboration.deleteMany({
			postId: id,
			postType: 'SearchAd',
		});
		logger.info(
			`[SearchAdController] Admin deleted ${deletedCollabs.deletedCount} collaborations for search ad ${id}`,
		);

		// Delete favorites
		const deletedFavorites = await UserFavoriteSearchAd.deleteMany({
			searchAdId: id,
		});
		logger.info(
			`[SearchAdController] Admin deleted ${deletedFavorites.deletedCount} favorites for search ad ${id}`,
		);

		await searchAd.deleteOne();
		logger.info('[Admin] Search ad deleted', {
			adminId: req.user?.id,
			searchAdId: id,
		});

		res.status(200).json({
			success: true,
			message: 'Annonce de recherche supprimée',
		});
	} catch (error) {
		logger.error('[Admin] Failed to delete search ad', {
			error: (error as Error).message,
			searchAdId: req.params.id,
		});
		res.status(500).json({
			success: false,
			message: "Échec de la suppression de l'annonce de recherche",
			error: (error as Error).message,
		});
	}
};
