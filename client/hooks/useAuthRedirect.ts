'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from './useAuth';

/**
 * Hook to redirect authenticated users away from auth pages
 * Use this on login, signup, forgot-password, etc.
 */
export const useAuthRedirect = () => {
	const { user, loading } = useAuth();
	const router = useRouter();

	useEffect(() => {
		// Wait for auth initialization to complete
		if (loading) return;

		// If user is authenticated, redirect to home
		if (user) {
			router.replace('/home');
		}
	}, [user, loading, router]);

	return { loading };
};
