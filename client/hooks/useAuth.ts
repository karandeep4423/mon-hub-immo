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

// Additional auth-related hooks
export const useRequireAuth = () => {
	const { user, loading, refreshUser } = useAuth();

	return {
		user,
		loading,
		refreshUser,
		isAuthenticated: !!user && !loading,
		isLoading: loading,
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

// Hook for profile status checks
export const useProfileStatus = () => {
	const { user } = useAuth();

	const isAgent = user?.userType === 'agent';
	const profileCompleted = user?.profileCompleted || false;
	const needsProfileCompletion = isAgent && !profileCompleted;

	return {
		isAgent,
		profileCompleted,
		needsProfileCompletion,
		hasProfile: !!user,
	};
};

// Hook for user type specific functionality
export const useUserTypeHelpers = () => {
	const { user } = useAuth();

	const getUserTypeDisplay = (userType?: string) => {
		switch (userType || user?.userType) {
			case 'agent':
				return 'Agent Immobilier';
			case 'apporteur':
				return "Apporteur d'affaires";
			case 'partenaire':
				return 'Partenaire';
			default:
				return userType || 'Utilisateur';
		}
	};

	const getUserPermissions = () => {
		const userType = user?.userType;
		return {
			canAddProperties: ['agent', 'apporteur'].includes(userType || ''),
			canViewListings: ['agent', 'apporteur'].includes(userType || ''),
			canManageProfile: !!user,
			canCollaborate: userType === 'agent' && user?.profileCompleted,
		};
	};

	return {
		getUserTypeDisplay,
		getUserPermissions,
		currentUserType: user?.userType,
	};
};
