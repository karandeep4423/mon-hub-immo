import { SWRConfiguration } from 'swr';

/**
 * Global SWR configuration
 * Optimized for real estate platform with real-time updates
 */
export const swrConfig: SWRConfiguration = {
	// Automatic revalidation
	revalidateOnFocus: true, // Refetch when user returns to tab
	revalidateOnReconnect: true, // Refetch on network reconnect
	revalidateIfStale: true, // Refetch if data is stale

	// Performance optimizations
	dedupingInterval: 2000, // Prevent duplicate requests within 2s
	focusThrottleInterval: 5000, // Throttle focus revalidation to 5s

	// Error handling
	errorRetryCount: 2, // Retry failed requests twice
	errorRetryInterval: 5000, // Wait 5s between retries
	shouldRetryOnError: true,

	// Caching
	keepPreviousData: true, // Keep previous data while revalidating
};
