'use client';

import React, { createContext, useEffect, useState, useCallback } from 'react';
import { User } from '@/types/auth';
import { authService } from '@/lib/api/authApi';
import { useFavoritesStore } from '@/store/favoritesStore';

interface AuthContextType {
	user: User | null;
	loading: boolean;
	login: (token: string, user: User) => void;
	logout: () => void;
	updateUser: (user: User) => void;
	refreshUser: () => Promise<void>; // Add this
}

// Create the context
export const AuthContext = createContext<AuthContextType | undefined>(
	undefined,
);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
	children,
}) => {
	const [user, setUser] = useState<User | null>(null);
	const [loading, setLoading] = useState(true);
	const { initializeFavorites, reset: resetFavorites } = useFavoritesStore();

	const refreshUser = useCallback(async () => {
		const token = localStorage.getItem('token');
		if (!token) return;

		try {
			const response = await authService.getProfile();
			if (response.success && response.user) {
				setUser(response.user);
			} else {
				localStorage.removeItem('token');
				setUser(null);
			}
		} catch (error) {
			console.error('Failed to refresh user:', error);
		}
	}, []);

	useEffect(() => {
		const initAuth = async () => {
			const token = localStorage.getItem('token');
			if (token) {
				await refreshUser();
				// Initialize favorites after user is refreshed
				initializeFavorites();
			}
			setLoading(false);
		};

		initAuth();
	}, [refreshUser, initializeFavorites]);

	const login = (token: string, userData: User) => {
		localStorage.setItem('token', token);
		setUser(userData);
		// Initialize favorites when user logs in
		initializeFavorites();
	};

	const logout = () => {
		localStorage.removeItem('token');
		setUser(null);
		// Reset favorites when user logs out
		resetFavorites();
		window.location.href = '/auth/login';
	};

	const updateUser = (userData: User) => {
		setUser(userData);
	};

	const value = {
		user,
		loading,
		login,
		logout,
		updateUser,
		refreshUser, // Add this
	};

	return (
		<AuthContext.Provider value={value}>{children}</AuthContext.Provider>
	);
};
