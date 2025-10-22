/**
 * useFetch - Generic data fetching hook with loading, error, and retry states
 *
 * Provides consistent API call patterns across components with:
 * - Loading states
 * - Error handling
 * - Automatic retry
 * - Manual refetch
 * - Dependency-based refetching
 *
 * @example
 * ```typescript
 * const { data, loading, error, refetch } = useFetch(
 *   () => PropertyService.getAllProperties(),
 *   { retry: true }
 * );
 * ```
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { logger } from '@/lib/utils/logger';
import { toast } from 'react-toastify';

interface UseFetchOptions<T> {
	/**
	 * Initial data value
	 */
	initialData?: T;
	/**
	 * Enable automatic retry on error
	 * @default false
	 */
	retry?: boolean;
	/**
	 * Number of retry attempts
	 * @default 3
	 */
	retryAttempts?: number;
	/**
	 * Delay between retries in ms
	 * @default 1000
	 */
	retryDelay?: number;
	/**
	 * Show toast notification on error
	 * @default false
	 */
	showErrorToast?: boolean;
	/**
	 * Custom error message for toast
	 */
	errorMessage?: string;
	/**
	 * Dependencies that trigger refetch when changed
	 */
	deps?: unknown[];
	/**
	 * Callback when data is successfully fetched
	 */
	onSuccess?: (data: T) => void;
	/**
	 * Callback when error occurs
	 */
	onError?: (error: Error) => void;
	/**
	 * Skip initial fetch (useful for manual triggers)
	 * @default false
	 */
	skip?: boolean;
}

interface UseFetchResult<T> {
	data: T | undefined;
	loading: boolean;
	error: Error | null;
	refetch: () => Promise<void>;
	isInitialLoad: boolean;
}

export function useFetch<T>(
	fetchFn: () => Promise<T>,
	options: UseFetchOptions<T> = {},
): UseFetchResult<T> {
	const {
		initialData,
		retry = false,
		retryAttempts = 3,
		retryDelay = 1000,
		showErrorToast = false,
		errorMessage = 'Failed to fetch data',
		deps = [],
		onSuccess,
		onError,
		skip = false,
	} = options;

	const [data, setData] = useState<T | undefined>(initialData);
	const [loading, setLoading] = useState(!skip);
	const [error, setError] = useState<Error | null>(null);
	const [isInitialLoad, setIsInitialLoad] = useState(true);
	const isMountedRef = useRef(true);
	const currentAttemptRef = useRef(0);

	const fetchFnRef = useRef(fetchFn);

	// Update ref on every render but don't trigger re-fetch
	useEffect(() => {
		fetchFnRef.current = fetchFn;
	});

	const executeWithRetry = useCallback(
		async (attempt: number = 0): Promise<T> => {
			try {
				const result = await fetchFnRef.current();
				return result;
			} catch (err) {
				if (retry && attempt < retryAttempts) {
					logger.warn(
						`[useFetch] Fetch failed, retrying (${attempt + 1}/${retryAttempts})`,
						err,
					);
					await new Promise((resolve) =>
						setTimeout(resolve, retryDelay),
					);
					return executeWithRetry(attempt + 1);
				}
				throw err;
			}
		},
		[retry, retryAttempts, retryDelay],
	);

	const fetch = useCallback(async () => {
		if (skip) return;

		setLoading(true);
		setError(null);
		currentAttemptRef.current = 0;

		try {
			const result = await executeWithRetry(0);

			if (!isMountedRef.current) return;

			setData(result);
			setError(null);
			onSuccess?.(result);

			logger.debug('[useFetch] Fetch successful');
		} catch (err) {
			if (!isMountedRef.current) return;

			const error = err instanceof Error ? err : new Error(String(err));
			setError(error);
			onError?.(error);

			if (showErrorToast) {
				toast.error(errorMessage);
			}

			logger.error('[useFetch] Fetch failed', error);
		} finally {
			if (isMountedRef.current) {
				setLoading(false);
				setIsInitialLoad(false);
			}
		}
	}, [
		skip,
		executeWithRetry,
		onSuccess,
		onError,
		showErrorToast,
		errorMessage,
	]);

	// Initial fetch and dependency-based refetch
	useEffect(() => {
		isMountedRef.current = true;
		fetch();

		return () => {
			isMountedRef.current = false;
		};
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, deps);

	return {
		data,
		loading,
		error,
		refetch: fetch,
		isInitialLoad,
	};
}

/**
 * Variant for paginated data fetching
 */
interface UsePaginatedFetchOptions<T> extends UseFetchOptions<T> {
	/**
	 * Initial page number
	 * @default 1
	 */
	initialPage?: number;
	/**
	 * Items per page
	 * @default 10
	 */
	pageSize?: number;
}

interface UsePaginatedFetchResult<T> extends UseFetchResult<T> {
	page: number;
	hasMore: boolean;
	loadMore: () => Promise<void>;
	reset: () => void;
}

export function usePaginatedFetch<T extends { length?: number }>(
	fetchFn: (page: number, pageSize: number) => Promise<T>,
	options: UsePaginatedFetchOptions<T> = {},
): UsePaginatedFetchResult<T> {
	const { initialPage = 1, pageSize = 10, ...fetchOptions } = options;

	const [page, setPage] = useState(initialPage);
	const [hasMore, setHasMore] = useState(true);

	const { data, loading, error, refetch, isInitialLoad } = useFetch(
		() => fetchFn(page, pageSize),
		{
			...fetchOptions,
			deps: [...(fetchOptions.deps || []), page],
			onSuccess: (result) => {
				// Check if we have more data
				const itemCount = result?.length ?? 0;
				setHasMore(itemCount >= pageSize);
				fetchOptions.onSuccess?.(result);
			},
		},
	);

	const loadMore = useCallback(async () => {
		if (hasMore && !loading) {
			setPage((p) => p + 1);
		}
	}, [hasMore, loading]);

	const reset = useCallback(() => {
		setPage(initialPage);
		setHasMore(true);
	}, [initialPage]);

	return {
		data,
		loading,
		error,
		refetch,
		isInitialLoad,
		page,
		hasMore,
		loadMore,
		reset,
	};
}
