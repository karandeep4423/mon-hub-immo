import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from './useAuth';

/**
 * Hook to require authentication and redirect to login if not authenticated
 * Replaces the common pattern of manually checking auth and redirecting
 *
 * @example
 * ```tsx
 * // Instead of:
 * const router = useRouter();
 * const { user, loading } = useAuth();
 * useEffect(() => {
 *   if (!loading && !user) {
 *     router.push('/auth/login');
 *   }
 * }, [user, loading, router]);
 *
 * // Use:
 * const { user, loading } = useRequireAuth();
 * ```
 *
 * @param redirectPath - Path to redirect to if not authenticated (default: '/auth/login')
 * @returns Auth state with user and loading
 */
export const useRequireAuth = (redirectPath = '/auth/login') => {
	const router = useRouter();
	const { user, loading, refreshUser } = useAuth();

	useEffect(() => {
		if (!loading && !user) {
			router.push(redirectPath);
		}
	}, [user, loading, router, redirectPath]);

	return { user, loading, refreshUser };
};
