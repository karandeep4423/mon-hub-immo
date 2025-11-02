'use client';

import { useAuthStore } from '@/store/authStore';

// Custom hook to use the Auth store
export const useAuth = () => {
	const user = useAuthStore((state) => state.user);
	const loading = useAuthStore((state) => state.loading);
	const login = useAuthStore((state) => state.login);
	const logout = useAuthStore((state) => state.logout);
	const updateUser = useAuthStore((state) => state.updateUser);
	const refreshUser = useAuthStore((state) => state.refreshUser);

	return {
		user,
		loading,
		login,
		logout,
		updateUser,
		refreshUser,
	};
};

// Hook for protected routes
export const useProtectedRoute = () => {
	const { user, loading, refreshUser } = useAuth();

	const isAuthenticated = !!user && !loading;
	const shouldRedirect = !loading && !user;

	return {
		user,
		loading,
		refreshUser,
		isAuthenticated,
		shouldRedirect,
	};
};
