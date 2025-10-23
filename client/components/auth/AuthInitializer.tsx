'use client';

import { useEffect } from 'react';
import { useAuthStore } from '@/store/authStore';

/**
 * AuthInitializer - Initializes Zustand auth state on app mount
 *
 * This component:
 * - Checks for existing token in localStorage via TokenManager
 * - Refreshes user session if token exists
 * - Initializes favorites store after successful auth
 *
 * Used in: app/layout.tsx (wraps entire app)
 * Pattern: Zustand store initialization (no Context API)
 */
export const AuthInitializer = ({
	children,
}: {
	children: React.ReactNode;
}) => {
	const initialize = useAuthStore((state) => state.initialize);

	useEffect(() => {
		initialize();
	}, [initialize]);

	return <>{children}</>;
};
