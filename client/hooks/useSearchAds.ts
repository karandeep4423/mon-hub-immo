/**
 * SWR Hooks for Search Ads Management
 * Provides data fetching and mutations for search advertisements
 */

import useSWR, { useSWRConfig } from 'swr';
import { SearchAdApi, SearchAdFilters } from '@/lib/api/searchAdApi';
import { SearchAd } from '@/types/searchAd';
import { CreateSearchAdPayload } from '@/types/createSearchAd';
import { swrKeys } from '@/lib/swrKeys';
import { toast } from 'react-toastify';
import { handleApiError } from '@/lib/utils/errorHandler';
import { logger } from '@/lib/utils/logger';
import { Features } from '@/lib/constants';

// ============ QUERIES ============

/**
 * Fetch all search ads with optional filters
 * Used in: Home page, search listings
 */
export function useSearchAds(filters?: SearchAdFilters) {
	const key = filters
		? swrKeys.searchAds.list(filters as Record<string, unknown>)
		: swrKeys.searchAds.all;

	return useSWR(key, () => SearchAdApi.getAllSearchAds(filters), {
		revalidateOnFocus: true,
		dedupingInterval: 5000,
	});
}

/**
 * Fetch single search ad by ID
 * Used in: Search ad detail pages
 */
export function useSearchAd(id?: string) {
	return useSWR(
		id ? swrKeys.searchAds.detail(id) : null,
		() => SearchAdApi.getSearchAdById(id!),
		{
			revalidateOnFocus: false,
			dedupingInterval: 10000,
		},
	);
}

/**
 * Fetch current user's search ads
 * Used in: MySearches component, Dashboard
 */
export function useMySearchAds(userId?: string) {
	return useSWR(
		userId ? swrKeys.searchAds.myAds(userId) : null,
		() => SearchAdApi.getMySearchAds(),
		{
			revalidateOnFocus: true,
			dedupingInterval: 3000,
		},
	);
}

// ============ MUTATIONS ============

/**
 * Hook for all search ad mutations
 * Provides functions for create, update, delete, updateStatus with auto cache invalidation
 */
export function useSearchAdMutations(userId?: string) {
	const { mutate } = useSWRConfig();

	/**
	 * Invalidate all search ad-related caches
	 */
	const invalidateSearchAdCaches = () => {
		// Invalidate all search ad queries
		mutate((key) => Array.isArray(key) && key[0] === 'searchAds');

		// Also invalidate dashboard stats and collaboration lists (search ads affect both)
		if (userId) {
			mutate(swrKeys.dashboard.stats(userId));
			mutate(swrKeys.collaborations.list(userId));
		}

		logger.info('[useSearchAds] Search ad caches invalidated');
	};

	/**
	 * Create a new search ad
	 */
	const createSearchAd = async (adData: CreateSearchAdPayload) => {
		try {
			const result = await SearchAdApi.createSearchAd(adData);

			toast.success(
				Features.SearchAds.SEARCH_AD_TOAST_MESSAGES.CREATE_SUCCESS,
			);
			invalidateSearchAdCaches();

			logger.info('[useSearchAds] Search ad created:', result._id);
			return { success: true, data: result };
		} catch (error) {
			const apiError = handleApiError(
				error,
				'useSearchAds.createSearchAd',
				"Erreur lors de la création de l'annonce",
			);
			logger.error('[useSearchAds] Create failed:', apiError);
			toast.error(apiError.message);
			return { success: false, error: apiError };
		}
	};

	/**
	 * Update an existing search ad
	 */
	const updateSearchAd = async (
		id: string,
		adData: Partial<CreateSearchAdPayload>,
	) => {
		try {
			const result = await SearchAdApi.updateSearchAd(id, adData);

			toast.success(
				Features.SearchAds.SEARCH_AD_TOAST_MESSAGES.UPDATE_SUCCESS,
			);
			invalidateSearchAdCaches();

			logger.info('[useSearchAds] Search ad updated:', id);
			return { success: true, data: result };
		} catch (error) {
			const apiError = handleApiError(
				error,
				'useSearchAds.updateSearchAd',
				"Erreur lors de la mise à jour de l'annonce",
			);
			logger.error('[useSearchAds] Update failed:', apiError);
			toast.error(apiError.message);
			return { success: false, error: apiError };
		}
	};

	/**
	 * Delete a search ad
	 */
	const deleteSearchAd = async (id: string) => {
		try {
			await SearchAdApi.deleteSearchAd(id);

			toast.success(
				Features.SearchAds.SEARCH_AD_TOAST_MESSAGES.DELETE_SUCCESS,
			);
			invalidateSearchAdCaches();

			logger.info('[useSearchAds] Search ad deleted:', id);
			return { success: true };
		} catch (error) {
			const apiError = handleApiError(
				error,
				'useSearchAds.deleteSearchAd',
				"Erreur lors de la suppression de l'annonce",
			);
			logger.error('[useSearchAds] Delete failed:', apiError);
			toast.error(apiError.message);
			return { success: false, error: apiError };
		}
	};

	/**
	 * Update search ad status
	 */
	const updateSearchAdStatus = async (
		id: string,
		status: SearchAd['status'],
	) => {
		try {
			const result = await SearchAdApi.updateSearchAdStatus(id, status);

			const statusMessages: Record<string, string> = {
				active: 'Annonce activée',
				paused: 'Annonce mise en pause',
				archived: 'Annonce archivée',
			};

			toast.success(statusMessages[status] || 'Statut mis à jour');
			invalidateSearchAdCaches();

			logger.info('[useSearchAds] Status updated:', id, status);
			return { success: true, data: result };
		} catch (error) {
			const apiError = handleApiError(
				error,
				'useSearchAds.updateSearchAdStatus',
				'Erreur lors de la mise à jour du statut',
			);
			logger.error('[useSearchAds] Status update failed:', apiError);
			toast.error(apiError.message);
			return { success: false, error: apiError };
		}
	};

	return {
		createSearchAd,
		updateSearchAd,
		deleteSearchAd,
		updateSearchAdStatus,
		invalidateSearchAdCaches,
	};
}

// ============ UTILITY HOOKS ============

/**
 * Get search ad counts by status
 */
export function useSearchAdCounts(searchAds: SearchAd[]) {
	return useSWR(
		['searchAds', 'counts', searchAds.length],
		() => {
			return {
				total: searchAds.length,
				active: searchAds.filter((ad) => ad.status === 'active').length,
				paused: searchAds.filter((ad) => ad.status === 'paused').length,
				archived: searchAds.filter((ad) => ad.status === 'archived')
					.length,
			};
		},
		{
			revalidateOnFocus: false,
			dedupingInterval: 0,
		},
	);
}

/**
 * Filter search ads by criteria
 */
export function useFilteredSearchAds(
	searchAds: SearchAd[],
	filters: {
		status?: SearchAd['status'];
		propertyType?: string;
		city?: string;
		minBudget?: number;
		maxBudget?: number;
	},
) {
	return useSWR(
		['searchAds', 'filtered-local', filters],
		() => {
			let filtered = searchAds;

			if (filters.status) {
				filtered = filtered.filter(
					(ad) => ad.status === filters.status,
				);
			}

			if (filters.propertyType) {
				filtered = filtered.filter((ad) =>
					ad.propertyTypes.some(
						(type) => type === filters.propertyType,
					),
				);
			}

			if (filters.city) {
				filtered = filtered.filter((ad) =>
					ad.location?.cities.some((city) =>
						city
							.toLowerCase()
							.includes(filters.city!.toLowerCase()),
					),
				);
			}

			if (filters.minBudget) {
				filtered = filtered.filter(
					(ad) =>
						ad.budget?.max && ad.budget.max >= filters.minBudget!,
				);
			}

			if (filters.maxBudget) {
				filtered = filtered.filter(
					(ad) =>
						ad.budget?.max && ad.budget.max <= filters.maxBudget!,
				);
			}

			return filtered;
		},
		{
			revalidateOnFocus: false,
			dedupingInterval: 0,
		},
	);
}
