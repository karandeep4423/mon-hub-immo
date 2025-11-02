/**
 * SWR Mutation Utilities
 * Helper functions for common mutation patterns
 */

import { toast } from 'react-toastify';
import { handleApiError } from '@/lib/utils/errorHandler';
import { logger } from '@/lib/utils/logger';

/**
 * Create optimistic mutation handler
 * Updates cache immediately, rolls back on error
 */
export function createOptimisticMutation<T>(
	mutate: (
		data?: T | Promise<T>,
		options?: unknown,
	) => Promise<T | undefined>,
	optimisticData: T,
) {
	return async (apiCall: () => Promise<T>) => {
		// Optimistically update
		mutate(optimisticData, { revalidate: false });

		try {
			// Perform API call
			const result = await apiCall();
			// Update with real data
			mutate(result);
			return result;
		} catch (error) {
			// Rollback on error
			mutate();
			throw error;
		}
	};
}

/**
 * Mutation wrapper with toast notifications
 */
export async function mutationWithToast<T>(
	apiCall: () => Promise<T>,
	options: {
		successMessage?: string;
		errorMessage?: string;
		onSuccess?: (data: T) => void | Promise<void>;
		onError?: (error: Error) => void | Promise<void>;
	} = {},
): Promise<T | undefined> {
	const { successMessage, errorMessage, onSuccess, onError } = options;

	try {
		const result = await apiCall();

		if (successMessage) {
			toast.success(successMessage);
		}

		await onSuccess?.(result);
		return result;
	} catch (error) {
		const apiError = handleApiError(
			error,
			'mutationWithToast',
			errorMessage || 'Une erreur est survenue',
		);

		logger.error('[mutationWithToast] Error:', apiError);
		toast.error(apiError.message);

		await onError?.(apiError);
		return undefined;
	}
}

/**
 * Helper to invalidate multiple cache keys
 */
export function createCacheInvalidator(
	mutate: (matcher: (key: unknown) => boolean) => Promise<unknown>,
) {
	return {
		/**
		 * Invalidate all keys starting with prefix
		 */
		invalidateByPrefix: (prefix: string) => {
			return mutate((key) => Array.isArray(key) && key[0] === prefix);
		},

		/**
		 * Invalidate multiple prefixes at once
		 */
		invalidateMultiple: (prefixes: string[]) => {
			return mutate(
				(key) =>
					Array.isArray(key) && prefixes.includes(key[0] as string),
			);
		},

		/**
		 * Invalidate all caches
		 */
		invalidateAll: () => {
			return mutate(() => true);
		},
	};
}
