import { api } from '@/lib/api';
import { SearchAd } from '@/types/searchAd';
import { CreateSearchAdPayload } from '@/types/createSearchAd';
import { handleApiError } from '../utils/errorHandler';

/**
 * SearchAd API Service
 * Centralized API operations for search advertisements
 *
 * @class SearchAdApi
 * @description Provides methods for managing search advertisements (apporteur looking for properties)
 * @example
 * ```typescript
 * // Create search ad
 * const ad = await SearchAdApi.createSearchAd({ title: '...', cities: '...' });
 *
 * // Get user's ads
 * const myAds = await SearchAdApi.getMySearchAds();
 * ```
 */
export class SearchAdApi {
	/**
	 * Create a new search ad
	 *
	 * @static
	 * @async
	 * @param {CreateSearchAdPayload} adData - Search ad data
	 * @returns {Promise<SearchAd>} The created search ad
	 * @throws {Error} If the API request fails
	 *
	 * @example
	 * ```typescript
	 * const ad = await SearchAdApi.createSearchAd({
	 *   title: 'Recherche appartement Paris',
	 *   cities: 'Paris,Lyon',
	 *   minPrice: 200000,
	 *   maxPrice: 500000
	 * });
	 * ```
	 */
	static async createSearchAd(
		adData: CreateSearchAdPayload,
	): Promise<SearchAd> {
		try {
			const { data } = await api.post('/search-ads', adData);
			return data.data;
		} catch (error) {
			throw handleApiError(
				error,
				'SearchAdApi.createSearchAd',
				"Erreur lors de la création de l'annonce de recherche",
			);
		}
	}

	/**
	 * Get current user's search ads
	 *
	 * @static
	 * @async
	 * @returns {Promise<SearchAd[]>} Array of user's search ads
	 * @throws {Error} If the API request fails
	 *
	 * @example
	 * ```typescript
	 * const myAds = await SearchAdApi.getMySearchAds();
	 * console.log(`You have ${myAds.length} active search ads`);
	 * ```
	 */
	static async getMySearchAds(): Promise<SearchAd[]> {
		try {
			const { data } = await api.get('/search-ads/my-ads');
			return data.data;
		} catch (error) {
			throw handleApiError(
				error,
				'SearchAdApi.getMySearchAds',
				'Erreur lors de la récupération de vos annonces',
			);
		}
	}

	/**
	 * Get single search ad by ID
	 *
	 * @static
	 * @async
	 * @param {string} id - Search ad ID
	 * @returns {Promise<SearchAd>} Search ad details
	 * @throws {Error} If not found or unauthorized
	 *
	 * @example
	 * ```typescript
	 * const ad = await SearchAdApi.getSearchAdById('ad-id-123');
	 * console.log(ad.title, ad.cities);
	 * ```
	 */
	static async getSearchAdById(id: string): Promise<SearchAd> {
		try {
			const { data } = await api.get(`/search-ads/${id}`);
			return data.data;
		} catch (error) {
			throw handleApiError(
				error,
				'SearchAdApi.getSearchAdById',
				"Erreur lors de la récupération de l'annonce",
			);
		}
	}

	/**
	 * Update an existing search ad
	 *
	 * @static
	 * @async
	 * @param {string} id - Search ad ID
	 * @param {Partial<CreateSearchAdPayload>} adData - Updated ad data (partial)
	 * @returns {Promise<SearchAd>} The updated search ad
	 * @throws {Error} If the API request fails
	 *
	 * @example
	 * ```typescript
	 * const updated = await SearchAdApi.updateSearchAd('ad-id', {
	 *   maxPrice: 600000
	 * });
	 * ```
	 */
	static async updateSearchAd(
		id: string,
		adData: Partial<CreateSearchAdPayload>,
	): Promise<SearchAd> {
		try {
			const { data } = await api.put(`/search-ads/${id}`, adData);
			return data.data;
		} catch (error) {
			throw handleApiError(
				error,
				'SearchAdApi.updateSearchAd',
				"Erreur lors de la mise à jour de l'annonce",
			);
		}
	}

	/**
	 * Update search ad status
	 *
	 * @static
	 * @async
	 * @param {string} id - Search ad ID
	 * @param {SearchAd['status']} status - New status (active, paused, archived)
	 * @returns {Promise<SearchAd>} The updated search ad
	 * @throws {Error} If the API request fails
	 *
	 * @example
	 * ```typescript
	 * const ad = await SearchAdApi.updateSearchAdStatus('ad-id', 'paused');
	 * ```
	 */
	static async updateSearchAdStatus(
		id: string,
		status: SearchAd['status'],
	): Promise<SearchAd> {
		try {
			const { data } = await api.patch(`/search-ads/${id}/status`, {
				status,
			});
			return data.data;
		} catch (error) {
			throw handleApiError(
				error,
				'SearchAdApi.updateSearchAdStatus',
				"Erreur lors de la mise à jour du statut de l'annonce",
			);
		}
	}

	/**
	 * Delete a search ad
	 *
	 * @static
	 * @async
	 * @param {string} id - Search ad ID to delete
	 * @returns {Promise<void>}
	 * @throws {Error} If the API request fails
	 *
	 * @example
	 * ```typescript
	 * await SearchAdApi.deleteSearchAd('ad-id-123');
	 * ```
	 */
	static async deleteSearchAd(id: string): Promise<void> {
		try {
			await api.delete(`/search-ads/${id}`);
		} catch (error) {
			throw handleApiError(
				error,
				'SearchAdApi.deleteSearchAd',
				"Erreur lors de la suppression de l'annonce",
			);
		}
	}

	/**
	 * Get all search ads for home page
	 */
	static async getAllSearchAds(): Promise<SearchAd[]> {
		try {
			const { data } = await api.get('/search-ads');
			return data.data;
		} catch (error) {
			throw handleApiError(
				error,
				'SearchAdApi.getAllSearchAds',
				'Erreur lors de la récupération des annonces',
			);
		}
	}
}

// Export default instance for backward compatibility
export default SearchAdApi;
