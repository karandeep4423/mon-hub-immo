import { api } from '../api';
import { Property } from './propertyApi';
import { SearchAd } from '@/types/searchAd';

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
		const response = await api.post(
			`/favorites/properties/${propertyId}/toggle`,
		);
		return response.data;
	}

	/** Toggle favorite status for a search ad */
	static async toggleSearchAdFavorite(
		searchAdId: string,
	): Promise<ToggleFavoriteResponse> {
		const response = await api.post(
			`/favorites/search-ads/${searchAdId}/toggle`,
		);
		return response.data;
	}

	/**
	 * Get user's favorite properties
	 */
	static async getUserFavorites(
		page: number = 1,
		limit: number = 12,
	): Promise<FavoritesResponse> {
		const response = await api.get(`/favorites`, {
			params: { page, limit },
		});
		return response.data;
	}

	/**
	 * Check if a specific property is favorited by user
	 */
	static async checkFavoriteStatus(
		propertyId: string,
	): Promise<FavoriteStatusResponse> {
		const response = await api.get(`/favorites/status/${propertyId}`);
		return response.data;
	}

	/**
	 * Get user's favorite property IDs (for bulk status checks)
	 */
	static async getUserFavoriteIds(): Promise<FavoriteIdsResponse> {
		const response = await api.get('/favorites/ids');
		return response.data;
	}

	/** Get user's favorite search ad IDs */
	static async getUserFavoriteSearchAdIds(): Promise<FavoriteIdsResponse> {
		const response = await api.get('/favorites/search-ads/ids');
		return response.data;
	}

	/** Get user's mixed favorites */
	static async getUserMixedFavorites(
		page: number = 1,
		limit: number = 12,
	): Promise<MixedFavoritesResponse> {
		const response = await api.get('/favorites/mixed', {
			params: { page, limit },
		});
		return response.data;
	}
}

export default FavoritesService;
