import { api } from '../api';
import { Property } from './propertyApi';
import { SearchAd } from '@/types/searchAd';
import { handleApiError } from '../utils/errorHandler';

export interface FavoritesResponse {
	success: boolean;
	data: Property[];
	pagination: {
		currentPage: number;
		totalPages: number;
		totalItems: number;
		hasNext: boolean;
		hasPrev: boolean;
	};
}

export interface ToggleFavoriteResponse {
	success: boolean;
	isFavorite: boolean;
	message: string;
}

export interface FavoriteStatusResponse {
	success: boolean;
	isFavorite: boolean;
}

export interface FavoriteIdsResponse {
	success: boolean;
	favoriteIds: string[];
}

export type MixedFavoriteItem =
	| { type: 'property'; item: Property }
	| { type: 'searchAd'; item: SearchAd };

export interface MixedFavoritesResponse {
	success: boolean;
	data: MixedFavoriteItem[];
	pagination: {
		currentPage: number;
		totalPages: number;
		totalItems: number;
		hasNext: boolean;
		hasPrev: boolean;
	};
}

export class FavoritesService {
	/**
	 * Toggle favorite status for a property
	 */
	static async toggleFavorite(
		propertyId: string,
	): Promise<ToggleFavoriteResponse> {
		try {
			const response = await api.post(
				`/favorites/properties/${propertyId}/toggle`,
			);
			return response.data;
		} catch (error) {
			throw handleApiError(
				error,
				'favoritesService.toggleFavorite',
				'Erreur lors de la gestion du favori',
			);
		}
	}

	/** Toggle favorite status for a search ad */
	static async toggleSearchAdFavorite(
		searchAdId: string,
	): Promise<ToggleFavoriteResponse> {
		try {
			const response = await api.post(
				`/favorites/search-ads/${searchAdId}/toggle`,
			);
			return response.data;
		} catch (error) {
			throw handleApiError(
				error,
				'favoritesService.toggleSearchAdFavorite',
				"Erreur lors de la gestion du favori d'annonce",
			);
		}
	}

	/**
	 * Get user's favorite properties
	 */
	static async getUserFavorites(
		page: number = 1,
		limit: number = 12,
	): Promise<FavoritesResponse> {
		try {
			const response = await api.get(`/favorites`, {
				params: { page, limit },
			});
			return response.data;
		} catch (error) {
			throw handleApiError(
				error,
				'favoritesService.getUserFavorites',
				'Erreur lors de la récupération des favoris',
			);
		}
	}

	/**
	 * Check if a specific property is favorited by user
	 */
	static async checkFavoriteStatus(
		propertyId: string,
	): Promise<FavoriteStatusResponse> {
		try {
			const response = await api.get(`/favorites/status/${propertyId}`);
			return response.data;
		} catch (error) {
			throw handleApiError(
				error,
				'favoritesService.checkFavoriteStatus',
				'Erreur lors de la vérification du statut favori',
			);
		}
	}

	/**
	 * Get user's favorite property IDs (for bulk status checks)
	 */
	static async getUserFavoriteIds(): Promise<FavoriteIdsResponse> {
		try {
			const response = await api.get('/favorites/ids');
			return response.data;
		} catch (error) {
			throw handleApiError(
				error,
				'favoritesService.getUserFavoriteIds',
				'Erreur lors de la récupération des IDs favoris',
			);
		}
	}

	/** Get user's favorite search ad IDs */
	static async getUserFavoriteSearchAdIds(): Promise<FavoriteIdsResponse> {
		try {
			const response = await api.get('/favorites/search-ads/ids');
			return response.data;
		} catch (error) {
			throw handleApiError(
				error,
				'favoritesService.getUserFavoriteSearchAdIds',
				"Erreur lors de la récupération des IDs favoris d'annonces",
			);
		}
	}

	/** Get user's mixed favorites */
	static async getUserMixedFavorites(
		page: number = 1,
		limit: number = 12,
	): Promise<MixedFavoritesResponse> {
		try {
			const response = await api.get('/favorites/mixed', {
				params: { page, limit },
			});
			return response.data;
		} catch (error) {
			throw handleApiError(
				error,
				'favoritesService.getUserMixedFavorites',
				'Erreur lors de la récupération des favoris mixtes',
			);
		}
	}
}

export default FavoritesService;
