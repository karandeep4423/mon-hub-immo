import { create } from 'zustand';
import { User } from '@/types/auth';
import { authService } from '@/lib/api/authApi';
import { logger } from '@/lib/utils/logger';
import { TokenManager } from '@/lib/utils/tokenManager';
import { useFavoritesStore } from './favoritesStore';
import { Features } from '@/lib/constants';
import { usePageStateStore } from './pageStateStore';

interface AuthState {
	user: User | null;
	loading: boolean;
	isInitialized: boolean;

	// Actions
	login: (token: string, user: User) => void;
	logout: () => void;
	updateUser: (user: User) => void;
	refreshUser: () => Promise<void>;
	initialize: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
	user: null,
	loading: true,
	isInitialized: false,

	initialize: async () => {
		const { isInitialized } = get();
		if (isInitialized) return;

		if (TokenManager.exists()) {
			await get().refreshUser();
			// Initialize favorites after user is refreshed
			useFavoritesStore.getState().initializeFavorites();
		}
		set({ loading: false, isInitialized: true });
	},

	login: (token: string, userData: User) => {
		logger.debug('[AuthStore] User logged in', { userId: userData._id });
		TokenManager.set(token);
		set({ user: userData, loading: false });
		// Initialize favorites when user logs in
		useFavoritesStore.getState().initializeFavorites();
	},

	logout: () => {
		logger.debug('[AuthStore] User logged out');
		TokenManager.clearAll();
		// Clear page-level UI state persisted in session
		try {
			usePageStateStore.getState().clearAll();
		} catch (e) {
			logger.warn('[AuthStore] Failed to clear page state on logout', e);
		}
		set({ user: null, loading: false });
		// Reset favorites when user logs out
		useFavoritesStore.getState().reset();
		window.location.href = Features.Auth.AUTH_ROUTES.LOGIN;
	},

	updateUser: (userData: User) => {
		logger.debug('[AuthStore] User updated', { userId: userData._id });
		set({ user: userData });
	},

	refreshUser: async () => {
		if (!TokenManager.exists()) {
			set({ user: null, loading: false });
			return;
		}

		try {
			const response = await authService.getProfile();
			if (response.success && response.user) {
				set({ user: response.user, loading: false });
			} else {
				logger.warn('[AuthStore] Invalid token, clearing session');
				TokenManager.remove();
				set({ user: null, loading: false });
			}
		} catch (error) {
			logger.error('[AuthStore] Failed to refresh user', error);
			TokenManager.remove();
			set({ user: null, loading: false });
		}
	},
}));
