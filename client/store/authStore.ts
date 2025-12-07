import { create } from 'zustand';
import { User } from '@/types/auth';
import { authService } from '@/lib/api/authApi';
import { logger } from '@/lib/utils/logger';
import { useFavoritesStore } from './favoritesStore';
import { Features } from '@/lib/constants';
import { usePageStateStore } from './pageStateStore';
import { showToastOnce } from '@/lib/utils/toastUtils';
import { toast } from 'react-toastify';
import { resetCsrfToken } from '@/lib/api';

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
		// Reset CSRF token to get a fresh one after login
		resetCsrfToken();
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

		// Reset CSRF token after logout
		resetCsrfToken();

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
					if (typeof window !== 'undefined') {
						const currentPath = window.location.pathname || '';
						// List of pages that incomplete profile users can access
						const allowedPaths = [
							'/auth/complete-profile',
							'/auth/login',
							'/auth/signup',
							'/auth/logout',
							'/auth/verify-email',
						];
						const isAllowedPath = allowedPaths.some((path) =>
							currentPath.startsWith(path),
						);

						if (!isAllowedPath) {
							showToastOnce(
								'Veuillez compléter votre profil pour accéder à la plateforme',
								'info',
							);
							window.location.replace('/auth/complete-profile');
							return; // Stop execution to prevent further state updates
						}
					}
				}
			} else {
				set({ user: null, loading: false });
			}
		} catch (error: unknown) {
			// Check for blocked user error first
			const hasResponse =
				error && typeof error === 'object' && 'response' in error;
			const errorResponse = hasResponse
				? (
						error as {
							response?: {
								status?: number;
								data?: { message?: string; code?: string };
							};
						}
					).response
				: null;
			const status = errorResponse?.status || 0;
			const errorMessage = errorResponse?.data?.message || '';
			const errorCode = errorResponse?.data?.code || '';

			// Handle blocked user - redirect to blocked page
			const isBlockedUser =
				status === 403 &&
				(errorCode === 'ACCOUNT_BLOCKED' ||
					errorMessage.toLowerCase().includes('blocked'));

			if (isBlockedUser) {
				logger.warn('[AuthStore] Account is blocked by admin');
				// Force logout to clear cookies and prevent middleware redirect loop
				try {
					await authService.logout();
				} catch (e) {
					logger.error(
						'[AuthStore] Failed to logout blocked user',
						e,
					);
				}

				set({ user: null, loading: false });
				// Redirect to blocked page
				if (typeof window !== 'undefined') {
					window.location.replace('/auth/blocked');
				}
				return;
			}

			// Silently handle auth errors (401/400) - user just not logged in
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
