'use client';

import { useContext } from 'react';
import { AuthContext } from '@/context/AuthContext';

// Custom hook to use the Auth context
export const useAuth = () => {
	const context = useContext(AuthContext);

	if (context === undefined) {
		throw new Error('useAuth must be used within an AuthProvider');
	}

	return context;
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
