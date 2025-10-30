import { Response } from 'express';
import { UserFavorite } from '../models/UserFavorite';
import { Property } from '../models/Property';
import { AuthRequest } from '../types/auth';
import { UserFavoriteSearchAd } from '../models/UserFavoriteSearchAd';
import { SearchAd } from '../models/SearchAd';
import mongoose from 'mongoose';
import { logger } from '../utils/logger';

/**
 * Toggle favorite status for a property
 */
export const toggleFavorite = async (
	req: AuthRequest,
	res: Response,
): Promise<void> => {
	try {
		const { propertyId } = req.params;
		const userId = req.userId;

		if (!userId) {
			res.status(401).json({
				success: false,
				message: 'Authentification requise',
			});
			return;
		}

		if (!mongoose.Types.ObjectId.isValid(propertyId)) {
			res.status(400).json({
				success: false,
				message: 'ID de propriété invalide',
			});
			return;
		}

		// Check if property exists
		const property = await Property.findById(propertyId);
		if (!property) {
			res.status(404).json({
				success: false,
				message: 'Propriété non trouvée',
			});
			return;
		}

		// Check if favorite already exists
		const existingFavorite = await UserFavorite.findOne({
			userId: new mongoose.Types.ObjectId(userId),
			propertyId: new mongoose.Types.ObjectId(propertyId),
		});

		if (existingFavorite) {
			// Remove favorite
			await UserFavorite.deleteOne({ _id: existingFavorite._id });

			// Decrement favorite count on property
			await Property.findByIdAndUpdate(propertyId, {
				$inc: { favoriteCount: -1 },
			});

			res.json({
				success: true,
				isFavorite: false,
				message: 'Propriété retirée des favoris',
			});
			return;
		} else {
			// Add favorite
			await UserFavorite.create({
				userId: new mongoose.Types.ObjectId(userId),
				propertyId: new mongoose.Types.ObjectId(propertyId),
			});

			// Increment favorite count on property
			await Property.findByIdAndUpdate(propertyId, {
				$inc: { favoriteCount: 1 },
			});

			res.json({
				success: true,
				isFavorite: true,
				message: 'Propriété ajoutée aux favoris',
			});
			return;
		}
	} catch (error) {
		logger.error('[FavoritesController] Error toggling favorite', error);
		res.status(500).json({
			success: false,
			message: 'Erreur serveur lors de la modification des favoris',
		});
		return;
	}
};

/**
 * Get user's favorite properties
 */
export const getUserFavorites = async (
	req: AuthRequest,
	res: Response,
): Promise<void> => {
	try {
		const userId = req.userId;
		const { page = 1, limit = 12 } = req.query;

		if (!userId) {
			res.status(401).json({
				success: false,
				message: 'Authentification requise',
			});
			return;
		}

		const skip = (Number(page) - 1) * Number(limit);

		// Get favorites with property details
		const favorites = await UserFavorite.find({
			userId: new mongoose.Types.ObjectId(userId),
		})
			.populate({
				path: 'propertyId',
				populate: {
					path: 'owner',
					select: 'firstName lastName profileImage userType',
				},
			})
			.sort({ createdAt: -1 })
			.skip(skip)
			.limit(Number(limit));

		// Filter out favorites where property was deleted
		const validFavorites = favorites.filter((fav) => fav.propertyId);

		// Clean up orphaned favorites
		const orphanedFavorites = favorites.filter((fav) => !fav.propertyId);
		if (orphanedFavorites.length > 0) {
			await UserFavorite.deleteMany({
				_id: { $in: orphanedFavorites.map((f) => f._id) },
			});
		}

		const totalFavorites = await UserFavorite.countDocuments({
			userId: new mongoose.Types.ObjectId(userId),
		});

		const properties = validFavorites.map((fav) => fav.propertyId);

		res.json({
			success: true,
			data: properties,
			pagination: {
				currentPage: Number(page),
				totalPages: Math.ceil(totalFavorites / Number(limit)),
				totalItems: totalFavorites,
				hasNext: skip + validFavorites.length < totalFavorites,
				hasPrev: Number(page) > 1,
			},
		});
		return;
	} catch (error) {
		logger.error(
			'[FavoritesController] Error getting user favorites',
			error,
		);
		res.status(500).json({
			success: false,
			message: 'Erreur serveur lors de la récupération des favoris',
		});
		return;
	}
};

/**
 * Check if property is favorited by user
 */
export const checkFavoriteStatus = async (
	req: AuthRequest,
	res: Response,
): Promise<void> => {
	try {
		const { propertyId } = req.params;
		const userId = req.userId;

		if (!userId) {
			res.status(401).json({
				success: false,
				message: 'Authentification requise',
			});
			return;
		}

		if (!mongoose.Types.ObjectId.isValid(propertyId)) {
			res.status(400).json({
				success: false,
				message: 'ID de propriété invalide',
			});
			return;
		}

		const favorite = await UserFavorite.findOne({
			userId: new mongoose.Types.ObjectId(userId),
			propertyId: new mongoose.Types.ObjectId(propertyId),
		});

		res.json({
			success: true,
			isFavorite: !!favorite,
		});
		return;
	} catch (error) {
		logger.error(
			'[FavoritesController] Error checking favorite status',
			error,
		);
		res.status(500).json({
			success: false,
			message: 'Erreur serveur lors de la vérification du statut favori',
		});
		return;
	}
};

/**
 * Get user's favorite properties IDs only (for bulk status checks)
 */
export const getUserFavoriteIds = async (
	req: AuthRequest,
	res: Response,
): Promise<void> => {
	try {
		const userId = req.userId;

		if (!userId) {
			res.status(401).json({
				success: false,
				message: 'Authentification requise',
			});
			return;
		}

		// Populate propertyId to detect orphans (deleted properties)
		const favorites = await UserFavorite.find({
			userId: new mongoose.Types.ObjectId(userId),
		})
			.select('propertyId')
			.populate<{ propertyId: { _id: mongoose.Types.ObjectId } | null }>({
				path: 'propertyId',
				select: '_id',
			});

		// Keep only favorites where property still exists
		const validFavorites = favorites.filter(
			(fav) =>
				!!fav.propertyId &&
				!!(fav.propertyId as { _id: mongoose.Types.ObjectId })._id,
		);

		// Optionally clean up orphans in background (non-blocking)
		const orphanIds = favorites
			.filter(
				(fav) =>
					!fav.propertyId ||
					!(fav.propertyId as { _id: mongoose.Types.ObjectId })._id,
			)
			.map((f) => f._id);
		if (orphanIds.length > 0) {
			// Fire and forget
			UserFavorite.deleteMany({ _id: { $in: orphanIds } }).catch((err) =>
				logger.error(
					'[FavoritesController] Failed to clean orphan favorites',
					err,
				),
			);
		}

		const favoriteIds = validFavorites.map((fav) =>
			(fav.propertyId as { _id: mongoose.Types.ObjectId })._id.toString(),
		);

		res.json({
			success: true,
			favoriteIds,
		});
		return;
	} catch (error) {
		logger.error(
			'[FavoritesController] Error getting user favorite IDs',
			error,
		);
		res.status(500).json({
			success: false,
			message:
				'Erreur serveur lors de la récupération des IDs de favoris',
		});
		return;
	}
};

/**
 * Toggle favorite status for a search ad
 */
export const toggleSearchAdFavorite = async (
	req: AuthRequest,
	res: Response,
): Promise<void> => {
	try {
		const { searchAdId } = req.params as { searchAdId: string };
		const userId = req.userId;

		if (!userId) {
			res.status(401).json({
				success: false,
				message: 'Authentification requise',
			});
			return;
		}

		if (!mongoose.Types.ObjectId.isValid(searchAdId)) {
			res.status(400).json({
				success: false,
				message: 'ID de recherche client invalide',
			});
			return;
		}

		// Ensure search ad exists
		const ad = await SearchAd.findById(searchAdId);
		if (!ad) {
			res.status(404).json({
				success: false,
				message: 'Recherche client non trouvée',
			});
			return;
		}

		const existing = await UserFavoriteSearchAd.findOne({
			userId: new mongoose.Types.ObjectId(userId),
			searchAdId: new mongoose.Types.ObjectId(searchAdId),
		});

		if (existing) {
			await UserFavoriteSearchAd.deleteOne({ _id: existing._id });
			res.json({
				success: true,
				isFavorite: false,
				message: 'Recherche retirée des favoris',
			});
			return;
		}

		await UserFavoriteSearchAd.create({
			userId: new mongoose.Types.ObjectId(userId),
			searchAdId: new mongoose.Types.ObjectId(searchAdId),
		});

		res.json({
			success: true,
			isFavorite: true,
			message: 'Recherche ajoutée aux favoris',
		});
		return;
	} catch (error) {
		logger.error(
			'[FavoritesController] Error toggling search ad favorite',
			error,
		);
		res.status(500).json({
			success: false,
			message: 'Erreur serveur lors de la modification des favoris',
		});
		return;
	}
};

/**
 * Get user's favorite search ad IDs
 */
export const getUserFavoriteSearchAdIds = async (
	req: AuthRequest,
	res: Response,
): Promise<void> => {
	try {
		const userId = req.userId;
		if (!userId) {
			res.status(401).json({
				success: false,
				message: 'Authentification requise',
			});
			return;
		}

		const favorites = await UserFavoriteSearchAd.find({
			userId: new mongoose.Types.ObjectId(userId),
		}).select('searchAdId');

		res.json({
			success: true,
			favoriteIds: favorites.map((f) => f.searchAdId.toString()),
		});
		return;
	} catch (error) {
		logger.error(
			'[FavoritesController] Error getting user search ad favorite IDs',
			error,
		);
		res.status(500).json({
			success: false,
			message:
				'Erreur serveur lors de la récupération des IDs de favoris (recherches)',
		});
		return;
	}
};

/**
 * Check if search ad is favorited by user
 */
export const checkSearchAdFavoriteStatus = async (
	req: AuthRequest,
	res: Response,
): Promise<void> => {
	try {
		const { searchAdId } = req.params as { searchAdId: string };
		const userId = req.userId;
		if (!userId) {
			res.status(401).json({
				success: false,
				message: 'Authentification requise',
			});
			return;
		}
		if (!mongoose.Types.ObjectId.isValid(searchAdId)) {
			res.status(400).json({
				success: false,
				message: 'ID de recherche client invalide',
			});
			return;
		}
		const favorite = await UserFavoriteSearchAd.findOne({
			userId: new mongoose.Types.ObjectId(userId),
			searchAdId: new mongoose.Types.ObjectId(searchAdId),
		});
		res.json({ success: true, isFavorite: !!favorite });
		return;
	} catch (error) {
		logger.error(
			'[FavoritesController] Error checking search ad favorite status',
			error,
		);
		res.status(500).json({
			success: false,
			message:
				'Erreur serveur lors de la vérification du statut favori (recherche)',
		});
		return;
	}
};

/**
 * Get a unified list of user's favorites across properties and search ads
 */
export const getUserMixedFavorites = async (
	req: AuthRequest,
	res: Response,
): Promise<void> => {
	try {
		const userId = req.userId;
		const { page = 1, limit = 12 } = req.query;
		if (!userId) {
			res.status(401).json({
				success: false,
				message: 'Authentification requise',
			});
			return;
		}

		const pageNum = Number(page);
		const lim = Number(limit);
		const skip = (pageNum - 1) * lim;

		// Fetch both favorites lists (IDs first)
		const [propFavs, adFavs] = await Promise.all([
			UserFavorite.find({ userId: new mongoose.Types.ObjectId(userId) })
				.sort({ createdAt: -1 })
				.select('propertyId createdAt')
				.lean(),
			UserFavoriteSearchAd.find({
				userId: new mongoose.Types.ObjectId(userId),
			})
				.sort({ createdAt: -1 })
				.select('searchAdId createdAt')
				.lean(),
		]);

		// Merge with type discriminator and sort by createdAt desc
		const merged = [
			...propFavs.map((f) => ({
				id: f.propertyId as unknown as mongoose.Types.ObjectId,
				type: 'property' as const,
				createdAt: f.createdAt,
			})),
			...adFavs.map((f) => ({
				id: f.searchAdId as unknown as mongoose.Types.ObjectId,
				type: 'searchAd' as const,
				createdAt: f.createdAt,
			})),
		].sort(
			(a, b) =>
				(b.createdAt as unknown as number) -
				(a.createdAt as unknown as number),
		);

		const totalItems = merged.length;
		const pageSlice = merged.slice(skip, skip + lim);

		// Fetch details in bulk
		const propertyIds = pageSlice
			.filter((i) => i.type === 'property')
			.map((i) => i.id);
		const searchAdIds = pageSlice
			.filter((i) => i.type === 'searchAd')
			.map((i) => i.id);

		const [properties, searchAds] = await Promise.all([
			propertyIds.length
				? Property.find({ _id: { $in: propertyIds } })
						.populate({
							path: 'owner',
							select: 'firstName lastName profileImage userType',
						})
						.lean()
				: Promise.resolve([]),
			searchAdIds.length
				? SearchAd.find({ _id: { $in: searchAdIds } })
						.populate({
							path: 'authorId',
							select: 'firstName lastName profileImage userType',
						})
						.lean()
				: Promise.resolve([]),
		]);

		// Map back to original order
		const propertyMap = new Map(
			properties.map((p) => [p._id.toString(), p]),
		);
		const adMap = new Map(searchAds.map((a) => [a._id.toString(), a]));

		const data = pageSlice
			.map((item) => {
				if (item.type === 'property') {
					const doc = propertyMap.get(item.id.toString());
					return doc
						? { type: 'property' as const, item: doc }
						: null;
				}
				const doc = adMap.get(item.id.toString());
				return doc ? { type: 'searchAd' as const, item: doc } : null;
			})
			.filter(Boolean);

		res.json({
			success: true,
			data,
			pagination: {
				currentPage: pageNum,
				totalPages: Math.ceil(totalItems / lim),
				totalItems,
				hasNext: skip + data.length < totalItems,
				hasPrev: pageNum > 1,
			},
		});
		return;
	} catch (error) {
		logger.error(
			'[FavoritesController] Error getting mixed favorites',
			error,
		);
		res.status(500).json({
			success: false,
			message:
				'Erreur serveur lors de la récupération des favoris (mixtes)',
		});
		return;
	}
};
