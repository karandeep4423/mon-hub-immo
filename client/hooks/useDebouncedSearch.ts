import { useState, useEffect } from 'react';
import { useDebounce } from './useDebounce';
import { logger } from '@/lib/utils/logger';

interface UseDebouncedSearchOptions<T> {
	/**
	 * Debounce delay in milliseconds
	 * @default 300
	 */
	delay?: number;
	/**
	 * Minimum query length before search
	 * @default 2
	 */
	minLength?: number;
	/**
	 * Transform search results before setting state
	 */
	transform?: (results: T[]) => T[];
	/**
	 * Callback when search completes successfully
	 */
	onSuccess?: (results: T[]) => void;
	/**
	 * Callback when search fails
	 */
	onError?: (error: Error) => void;
}

interface UseDebouncedSearchResult<T> {
	results: T[];
	loading: boolean;
	error: Error | null;
	hasSearched: boolean;
}

/**
 * Custom hook for debounced search with loading and error states
 * Combines useDebounce with async search functionality
 *
 * @example
 * ```typescript
 * const { results, loading } = useDebouncedSearch(
 *   searchQuery,
 *   async (query) => await searchMunicipalities(query, 8),
 *   { minLength: 2, delay: 300 }
 * );
 * ```
 *
 * @param query - Search query string
 * @param searchFn - Async function that performs the search
 * @param options - Configuration options
 */
export function useDebouncedSearch<T>(
	query: string,
	searchFn: (query: string) => Promise<T[]>,
	options: UseDebouncedSearchOptions<T> = {},
): UseDebouncedSearchResult<T> {
	const {
		delay = 300,
		minLength = 2,
		transform,
		onSuccess,
		onError,
	} = options;

	const [results, setResults] = useState<T[]>([]);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<Error | null>(null);
	const [hasSearched, setHasSearched] = useState(false);

	const debouncedQuery = useDebounce(query, delay);

	useEffect(() => {
		const performSearch = async () => {
			const trimmedQuery = debouncedQuery.trim();

			// Reset if query is too short
			if (!trimmedQuery || trimmedQuery.length < minLength) {
				setResults([]);
				setLoading(false);
				setError(null);
				return;
			}

			setLoading(true);
			setError(null);

			try {
				const searchResults = await searchFn(trimmedQuery);
				const finalResults = transform
					? transform(searchResults)
					: searchResults;

				setResults(finalResults);
				setHasSearched(true);

				if (onSuccess) {
					onSuccess(finalResults);
				}
			} catch (err) {
				const error =
					err instanceof Error ? err : new Error('Search failed');
				setError(error);
				setResults([]);
				logger.error('Debounced search error', {
					error,
					query: trimmedQuery,
				});

				if (onError) {
					onError(error);
				}
			} finally {
				setLoading(false);
			}
		};

		performSearch();
	}, [debouncedQuery, minLength, searchFn, transform, onSuccess, onError]);

	return {
		results,
		loading,
		error,
		hasSearched,
	};
}
