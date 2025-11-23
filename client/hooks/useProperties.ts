/**
 * SWR Hooks for Properties Management
 * Provides data fetching and mutations for real estate properties
 */

import useSWR, { useSWRConfig } from 'swr';
import {
	PropertyService,
	Property,
	PropertyFilters,
} from '@/lib/api/propertyApi';
import { swrKeys } from '@/lib/swrKeys';
import { toast } from 'react-toastify';
import { handleApiError } from '@/lib/utils/errorHandler';
import { logger } from '@/lib/utils/logger';
import { Features } from '@/lib/constants';

// ============ QUERIES ============

/**
 * Fetch all properties with optional filters
 * Used in: Property listings, search pages
 */
export function useProperties(filters?: PropertyFilters) {
	const key = filters
		? swrKeys.properties.filtered(filters as Record<string, unknown>)
		: swrKeys.properties.all;

	return useSWR(key, () => PropertyService.getAllProperties(filters), {
		revalidateOnFocus: true,
		dedupingInterval: 5000,
	});
}

/**
 * Fetch single property by ID
 * Used in: Property detail pages
 */
export function useProperty(id?: string) {
	return useSWR(
		id ? swrKeys.properties.detail(id) : null,
		() => PropertyService.getPropertyById(id!),
		{
			revalidateOnFocus: false,
			dedupingInterval: 10000,
		},
	);
}

/**
 * Fetch current user's properties with pagination support
 * Used in: PropertyManager, Dashboard
 */
export function useMyProperties(
	userId?: string,
	page: number = 1,
	limit: number = 10,
	status?: string,
) {
	const key =
		userId && page && limit
			? swrKeys.properties.myProperties(userId, { page, limit, status })
			: null;

	return useSWR(
		key,
		() => PropertyService.getMyProperties(page, limit, status),
		{
			revalidateOnFocus: true,
			dedupingInterval: 3000,
		},
	);
}

/**
 * Fetch current user's property statistics
 * Used in: Dashboard stats
 */
export function useMyPropertyStats(userId?: string) {
	return useSWR(
		userId ? swrKeys.properties.stats(userId) : null,
		() => PropertyService.getMyPropertyStats(),
		{
			revalidateOnFocus: true,
			dedupingInterval: 5000,
		},
	);
}

// ============ MUTATIONS ============

/**
 * Hook for all property mutations
 * Provides functions for create, update, delete, updateStatus with auto cache invalidation
 */
export function usePropertyMutations(userId?: string) {
	const { mutate } = useSWRConfig();

	/**
	 * Invalidate all property-related caches
	 */
	const invalidatePropertyCaches = () => {
		// Invalidate all property queries
		mutate((key) => Array.isArray(key) && key[0] === 'properties');

		// Also invalidate dashboard stats (properties affect stats)
		if (userId) {
			mutate(swrKeys.dashboard.stats(userId));
		}

		logger.info('[useProperties] Property caches invalidated');
	};

	/**
	 * Create a new property
	 */
	const createProperty = async (
		propertyData: Parameters<typeof PropertyService.createProperty>[0],
		mainImageFile?: File,
		galleryImageFiles?: File[],
	) => {
		try {
			const result = await PropertyService.createProperty(
				propertyData,
				mainImageFile,
				galleryImageFiles,
			);

			toast.success(
				Features.Properties.PROPERTY_TOAST_MESSAGES.CREATE_SUCCESS,
			);
			invalidatePropertyCaches();

			logger.info('[useProperties] Property created:', result._id);
			return { success: true, data: result };
		} catch (error) {
			const apiError = handleApiError(
				error,
				'useProperties.createProperty',
				'Erreur lors de la création du bien',
			);
			logger.error('[useProperties] Create failed:', apiError);

			// Show general error toast
			toast.error(apiError.message);

			// Log field-specific errors for debugging
			if (apiError.fieldErrors) {
				logger.debug(
					'[useProperties] Field errors:',
					apiError.fieldErrors,
				);
			}

			return { success: false, error: apiError };
		}
	};

	/**
	 * Update an existing property
	 */
	const updateProperty = async (
		propertyId: string,
		propertyData: Parameters<typeof PropertyService.updateProperty>[1],
		newMainImageFile?: File,
		newGalleryImageFiles?: File[],
		existingMainImage?: { url: string; key: string } | null,
		existingGalleryImages?: Array<{ url: string; key: string }>,
	) => {
		try {
			const result = await PropertyService.updateProperty(
				propertyId,
				propertyData,
				newMainImageFile,
				newGalleryImageFiles,
				existingMainImage,
				existingGalleryImages,
			);

			toast.success(
				Features.Properties.PROPERTY_TOAST_MESSAGES.UPDATE_SUCCESS,
			);
			invalidatePropertyCaches();

			logger.info('[useProperties] Property updated:', propertyId);
			return { success: true, data: result };
		} catch (error) {
			const apiError = handleApiError(
				error,
				'useProperties.updateProperty',
				'Erreur lors de la mise à jour du bien',
			);
			logger.error('[useProperties] Update failed:', apiError);

			// Show general error toast
			toast.error(apiError.message);

			// Log field-specific errors for debugging
			if (apiError.fieldErrors) {
				logger.debug(
					'[useProperties] Field errors:',
					apiError.fieldErrors,
				);
			}

			return { success: false, error: apiError };
		}
	};

	/**
	 * Delete a property
	 */
	const deleteProperty = async (propertyId: string) => {
		try {
			await PropertyService.deleteProperty(propertyId);

			toast.success(
				Features.Properties.PROPERTY_TOAST_MESSAGES.DELETE_SUCCESS,
			);
			invalidatePropertyCaches();

			logger.info('[useProperties] Property deleted:', propertyId);
			return { success: true };
		} catch (error) {
			const apiError = handleApiError(
				error,
				'useProperties.deleteProperty',
				'Erreur lors de la suppression du bien',
			);
			logger.error('[useProperties] Delete failed:', apiError);
			toast.error(apiError.message);
			return { success: false, error: apiError };
		}
	};

	/**
	 * Update property status
	 */
	const updatePropertyStatus = async (
		propertyId: string,
		status: Property['status'],
	) => {
		try {
			const result = await PropertyService.updatePropertyStatus(
				propertyId,
				status,
			);

			const statusMessages: Record<string, string> = {
				draft: 'Bien mis en brouillon',
				active: 'Bien activé',
				sold: 'Bien marqué comme vendu',
				rented: 'Bien marqué comme loué',
				archived: 'Bien archivé',
			};

			toast.success(statusMessages[status] || 'Statut mis à jour');
			invalidatePropertyCaches();

			logger.info('[useProperties] Status updated:', propertyId, status);
			return { success: true, data: result };
		} catch (error) {
			const apiError = handleApiError(
				error,
				'useProperties.updatePropertyStatus',
				'Erreur lors de la mise à jour du statut',
			);
			logger.error('[useProperties] Status update failed:', apiError);
			toast.error(apiError.message);
			return { success: false, error: apiError };
		}
	};

	/**
	 * Search properties
	 */
	const searchProperties = async (query: string) => {
		try {
			const results = await PropertyService.searchProperties(query);

			logger.info(
				'[useProperties] Search completed:',
				results.length,
				'results',
			);
			return { success: true, data: results };
		} catch (error) {
			const apiError = handleApiError(
				error,
				'useProperties.searchProperties',
				'Erreur lors de la recherche',
			);
			logger.error('[useProperties] Search failed:', apiError);
			toast.error(apiError.message);
			return { success: false, error: apiError, data: [] };
		}
	};

	return {
		createProperty,
		updateProperty,
		deleteProperty,
		updatePropertyStatus,
		searchProperties,
		invalidatePropertyCaches,
	};
}

// ============ UTILITY HOOKS ============

/**
 * Client-side filtering hook for properties
 * Used when you have the full property list and want to filter locally
 */
export function useFilteredProperties(
	properties: Property[],
	filters: PropertyFilters,
) {
	return useSWR(
		['properties', 'filtered-local', filters],
		() => {
			let filtered = properties;

			if (filters.city) {
				filtered = filtered.filter((p) =>
					p.city.toLowerCase().includes(filters.city!.toLowerCase()),
				);
			}

			if (filters.propertyType) {
				filtered = filtered.filter(
					(p) => p.propertyType === filters.propertyType,
				);
			}

			if (filters.transactionType) {
				filtered = filtered.filter(
					(p) => p.transactionType === filters.transactionType,
				);
			}

			if (filters.minPrice) {
				filtered = filtered.filter((p) => p.price >= filters.minPrice!);
			}

			if (filters.maxPrice) {
				filtered = filtered.filter((p) => p.price <= filters.maxPrice!);
			}

			if (filters.minSurface) {
				filtered = filtered.filter(
					(p) => p.surface >= filters.minSurface!,
				);
			}

			if (filters.maxSurface) {
				filtered = filtered.filter(
					(p) => p.surface <= filters.maxSurface!,
				);
			}

			return filtered;
		},
		{
			revalidateOnFocus: false,
			dedupingInterval: 0, // No deduping for local filtering
		},
	);
}

/**
 * Get property counts by status
 */
export function usePropertyCounts(properties: Property[]) {
	return useSWR(
		['properties', 'counts', properties.length],
		() => {
			return {
				total: properties.length,
				draft: properties.filter((p) => p.status === 'draft').length,
				active: properties.filter((p) => p.status === 'active').length,
				sold: properties.filter((p) => p.status === 'sold').length,
				rented: properties.filter((p) => p.status === 'rented').length,
				archived: properties.filter((p) => p.status === 'archived')
					.length,
			};
		},
		{
			revalidateOnFocus: false,
			dedupingInterval: 0,
		},
	);
}
