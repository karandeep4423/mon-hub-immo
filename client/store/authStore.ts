import { create } from 'zustand';
import { User } from '@/types/auth';
import { authService } from '@/lib/api/authApi';
import { logger } from '@/lib/utils/logger';
import { useFavoritesStore } from './favoritesStore';
import { Features } from '@/lib/constants';
import { usePageStateStore } from './pageStateStore';
import { toast } from 'react-toastify';

interface AuthState {
	user: User | null;
	loading: boolean;
	isInitialized: boolean;

	// Actions
	login: (user: User) => void;
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
		const { isInitialized, refreshUser } = get();
		if (isInitialized) return;

		// Check for existing session from httpOnly cookies
		set({ isInitialized: true });
		await refreshUser();
	},

	login: (userData: User) => {
		logger.debug('[AuthStore] User logged in', { userId: userData._id });
		// Tokens are stored in httpOnly cookies by server
		set({ user: userData, loading: false });
		// Initialize favorites when user logs in
		useFavoritesStore.getState().initializeFavorites();
	},

	logout: async () => {
		logger.debug('[AuthStore] User logged out');

		// Call logout endpoint to clear httpOnly cookies
		try {
			await authService.logout();
			toast.success(Features.Auth.AUTH_TOAST_MESSAGES.LOGOUT_SUCCESS);
		} catch (error) {
			logger.error('[AuthStore] Logout API call failed', error);
		}

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
		// Auth token is in httpOnly cookie, try to fetch profile
		try {
			const response = await authService.getProfile();
			if (response.success && response.user) {
				set({ user: response.user, loading: false });

				// If the user is an agent and has not completed their profile,
				// force them to the complete-profile flow before allowing navigation.
				if (
					response.user.userType === 'agent' &&
					!response.user.profileCompleted
				) {
					try {
						toast.info('Veuillez compléter votre profil pour accéder à la plateforme');
						if (typeof window !== 'undefined') {
							const currentPath = window.location.pathname || '';
							if (!currentPath.startsWith('/auth/complete-profile')) {
								window.location.replace('/auth/complete-profile');
							}
						}
					} catch (e) {
						// ignore redirect errors during SSR
					}
				}
			} else {
				set({ user: null, loading: false });
			}
		} catch (error: unknown) {
			// Silently handle auth errors (401/400) - user just not logged in
			const hasResponse =
				error && typeof error === 'object' && 'response' in error;
			const status = hasResponse
				? (error as { response?: { status?: number } }).response?.status
				: 0;
			const isAuthError = status === 401 || status === 400;

			if (isAuthError) {
				logger.debug(
					'[AuthStore] No active session (user not logged in)',
				);
			} else {
				logger.error('[AuthStore] Failed to refresh user', error);
			}
			set({ user: null, loading: false });
		}
	},
}));
