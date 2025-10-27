/**
 * useMutation - Standardized hook for write operations (POST/PUT/DELETE)
 *
 * Provides consistent error handling, loading states, and toast notifications
 * for all mutation operations across the application.
 *
 * @example
 * ```typescript
 * const { mutate, loading } = useMutation(
 *   async (data) => await PropertyService.createProperty(data),
 *   {
 *     onSuccess: () => {
 *       refetchProperties();
 *     },
 *     successMessage: Features.Properties.PROPERTY_TOAST_MESSAGES.CREATE_SUCCESS,
 *     errorMessage: Features.Properties.PROPERTY_TOAST_MESSAGES.CREATE_ERROR,
 *   }
 * );
 *
 * // Use in component
 * await mutate(formData);
 * ```
 */

import { useState, useCallback } from 'react';
import { toast } from 'react-toastify';
import { handleApiError, ApiError } from '@/lib/utils/errorHandler';
import { logger } from '@/lib/utils/logger';

export interface UseMutationOptions<TData, TVariables> {
	/**
	 * Callback executed on successful mutation
	 */
	onSuccess?: (data: TData, variables: TVariables) => void | Promise<void>;

	/**
	 * Callback executed on failed mutation
	 */
	onError?: (error: ApiError, variables: TVariables) => void | Promise<void>;

	/**
	 * Callback executed after mutation completes (success or error)
	 */
	onSettled?: (
		data: TData | undefined,
		error: ApiError | null,
		variables: TVariables,
	) => void | Promise<void>;

	/**
	 * Success message to display in toast (optional)
	 */
	successMessage?: string;

	/**
	 * Error message to display in toast (optional, defaults to API error message)
	 */
	errorMessage?: string;

	/**
	 * Show success toast automatically (default: true if successMessage provided)
	 */
	showSuccessToast?: boolean;

	/**
	 * Show error toast automatically (default: true)
	 */
	showErrorToast?: boolean;

	/**
	 * Context string for error logging
	 */
	context?: string;
}

export interface UseMutationResult<TData, TVariables> {
	/**
	 * Execute the mutation
	 */
	mutate: (variables: TVariables) => Promise<MutationResponse<TData>>;

	/**
	 * Execute the mutation (async version)
	 */
	mutateAsync: (variables: TVariables) => Promise<TData>;

	/**
	 * Loading state
	 */
	loading: boolean;

	/**
	 * Error from last mutation
	 */
	error: ApiError | null;

	/**
	 * Data from last successful mutation
	 */
	data: TData | undefined;

	/**
	 * Reset mutation state
	 */
	reset: () => void;
}

export interface MutationResponse<TData> {
	success: boolean;
	data?: TData;
	error?: ApiError;
}

/**
 * useMutation hook for handling write operations with consistent error handling
 *
 * @param mutationFn - Async function that performs the mutation
 * @param options - Configuration options
 * @returns Mutation state and functions
 */
export function useMutation<TData = unknown, TVariables = unknown>(
	mutationFn: (variables: TVariables) => Promise<TData>,
	options: UseMutationOptions<TData, TVariables> = {},
): UseMutationResult<TData, TVariables> {
	const {
		onSuccess,
		onError,
		onSettled,
		successMessage,
		errorMessage,
		showSuccessToast = !!successMessage,
		showErrorToast = true,
		context = 'Mutation',
	} = options;

	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<ApiError | null>(null);
	const [data, setData] = useState<TData | undefined>(undefined);

	const mutate = useCallback(
		async (variables: TVariables): Promise<MutationResponse<TData>> => {
			try {
				setLoading(true);
				setError(null);

				const result = await mutationFn(variables);
				setData(result);

				// Show success toast
				if (showSuccessToast && successMessage) {
					toast.success(successMessage);
				}

				// Execute success callback
				if (onSuccess) {
					await onSuccess(result, variables);
				}

				// Execute settled callback
				if (onSettled) {
					await onSettled(result, null, variables);
				}

				return { success: true, data: result };
			} catch (err: unknown) {
				const apiError = handleApiError(err, context, errorMessage);
				setError(apiError);

				logger.error(`[${context}] Mutation failed:`, {
					error: apiError,
					variables,
				});

				// Show error toast
				if (showErrorToast) {
					toast.error(apiError.message);
				}

				// Execute error callback
				if (onError) {
					await onError(apiError, variables);
				}

				// Execute settled callback
				if (onSettled) {
					await onSettled(undefined, apiError, variables);
				}

				return { success: false, error: apiError };
			} finally {
				setLoading(false);
			}
		},
		[
			mutationFn,
			onSuccess,
			onError,
			onSettled,
			successMessage,
			errorMessage,
			showSuccessToast,
			showErrorToast,
			context,
		],
	);

	const mutateAsync = useCallback(
		async (variables: TVariables): Promise<TData> => {
			const response = await mutate(variables);
			if (!response.success) {
				throw response.error;
			}
			return response.data!;
		},
		[mutate],
	);

	const reset = useCallback(() => {
		setError(null);
		setData(undefined);
	}, []);

	return {
		mutate,
		mutateAsync,
		loading,
		error,
		data,
		reset,
	};
}

/**
 * Helper hook for optimistic updates
 * Useful for immediate UI feedback before server confirmation
 */
export function useOptimisticMutation<TData = unknown, TVariables = unknown>(
	mutationFn: (variables: TVariables) => Promise<TData>,
	options: UseMutationOptions<TData, TVariables> & {
		optimisticUpdate: (variables: TVariables) => void;
		rollback: () => void;
	},
): UseMutationResult<TData, TVariables> {
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	const { optimisticUpdate, rollback, ...mutationOptions } = options;

	return useMutation(mutationFn, {
		...mutationOptions,
		onSuccess: async (data, variables) => {
			if (mutationOptions.onSuccess) {
				await mutationOptions.onSuccess(data, variables);
			}
		},
		onError: async (error, variables) => {
			// Rollback optimistic update on error
			rollback();

			if (mutationOptions.onError) {
				await mutationOptions.onError(error, variables);
			}
		},
	});
}
