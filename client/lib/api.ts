// client/lib/api.ts
import axios from 'axios';
import { logger } from './utils/logger';
import { Features } from './constants';
import { toast } from 'react-toastify';
import { AUTH_ENDPOINTS } from './constants/api/endpoints';

// Normalize NEXT_PUBLIC_API_URL so it always ends with a single '/api' segment
const _rawApi = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
const API_BASE_URL =
	_rawApi.replace(/\/+$/, '').replace(/\/api$/i, '') + '/api';

export const api = axios.create({
	baseURL: API_BASE_URL,
	timeout: 60000, // 60 seconds timeout for image uploads
	headers: {
		'Content-Type': 'application/json',
	},
	withCredentials: true, // Enable sending cookies with requests
});

let isRefreshing = false;
let failedQueue: Array<{
	resolve: (value?: unknown) => void;
	reject: (reason?: unknown) => void;
}> = [];

// CSRF token management
let csrfToken: string | null = null;

const fetchCsrfToken = async (): Promise<string> => {
	try {
		const response = await axios.get(`${API_BASE_URL}/csrf-token`, {
			withCredentials: true,
		});
		csrfToken = response.data.csrfToken;
		return response.data.csrfToken as string;
	} catch (error) {
		logger.error('[API] Failed to fetch CSRF token', error);
		throw error;
	}
};

const processQueue = (error: unknown) => {
	failedQueue.forEach((prom) => {
		if (error) {
			prom.reject(error);
		} else {
			prom.resolve();
		}
	});
	failedQueue = [];
};

// Request interceptor - Auth token automatically sent via httpOnly cookies
api.interceptors.request.use(
	async (config) => {
		// Add CSRF token for state-changing requests
		if (
			config.method &&
			['post', 'put', 'patch', 'delete'].includes(
				config.method.toLowerCase(),
			)
		) {
			// Fetch CSRF token if we don't have one
			if (!csrfToken) {
				try {
					await fetchCsrfToken();
				} catch (error) {
					logger.warn('[API] Could not fetch CSRF token', error);
				}
			}

			// Add CSRF token to headers
			if (csrfToken) {
				config.headers['X-CSRF-Token'] = csrfToken;
			}
		}

		return config;
	},
	(error) => Promise.reject(error),
);

// Response interceptor for error handling and token refresh
api.interceptors.response.use(
	(response) => response,
	async (error) => {
		// Handle payment required (402) - redirect user to payment page
		if (error.response?.status === 402) {
			try {
				const code = error.response?.data?.code;
				if (code === 'PAYMENT_REQUIRED') {
					toast.info(
						'Votre compte nécessite un paiement pour accéder à cette fonctionnalité.',
					);
					if (typeof window !== 'undefined') {
						// Avoid redirect loop: don't redirect if we're already on the payment page
						const currentPath = window.location.pathname || '';
						if (!currentPath.startsWith('/payment')) {
							// Use replace to avoid polluting history
							window.location.replace('/payment');
						}
					}
				}
			} catch {
				// ignore
			}
			return Promise.reject(error);
		}

		// Handle profile incomplete (403) - redirect user to complete profile page
		// Note: Toast is handled by authStore.refreshUser to avoid duplicate notifications
		if (error.response?.status === 403) {
			try {
				const code = error.response?.data?.code;
				if (code === 'PROFILE_INCOMPLETE') {
					if (typeof window !== 'undefined') {
						const currentPath = window.location.pathname || '';
						if (!currentPath.startsWith('/auth/complete-profile')) {
							window.location.replace('/auth/complete-profile');
						}
					}
				}
			} catch {
				// ignore
			}
			return Promise.reject(error);
		}
		const originalRequest = error.config;

		// Handle 403 CSRF token errors - fetch new token and retry
		if (
			error.response?.status === 403 &&
			error.response?.data?.code === 'CSRF_TOKEN_INVALID' &&
			!originalRequest._csrfRetry
		) {
			originalRequest._csrfRetry = true;

			try {
				// Fetch new CSRF token
				await fetchCsrfToken();

				// Retry the request with new token
				if (csrfToken) {
					originalRequest.headers['X-CSRF-Token'] = csrfToken;
				}
				return api(originalRequest);
			} catch (csrfError) {
				logger.error('[API] Failed to refresh CSRF token', csrfError);
				return Promise.reject(csrfError);
			}
		}

		// Handle 401 Unauthorized - try to refresh token
		// Skip refresh for auth endpoints (login, signup, etc.) and refresh endpoint itself
		const isAuthEndpoint =
			originalRequest.url?.includes('/auth/login') ||
			originalRequest.url?.includes('/auth/signup') ||
			originalRequest.url?.includes('/auth/verify-email') ||
			originalRequest.url?.includes('/auth/forgot-password') ||
			originalRequest.url?.includes('/auth/reset-password') ||
			originalRequest.url?.includes('/auth/refresh');

		if (
			error.response?.status === 401 &&
			!originalRequest._retry &&
			!isAuthEndpoint
		) {
			if (isRefreshing) {
				return new Promise((resolve, reject) => {
					failedQueue.push({ resolve, reject });
				})
					.then(() => {
						// Token is in cookie, just retry the request
						return api(originalRequest);
					})
					.catch((err) => Promise.reject(err));
			}

			originalRequest._retry = true;
			isRefreshing = true;

			// Refresh token is in httpOnly cookie, no need to send it
			try {
				const response = await axios.post(
					`${API_BASE_URL}${AUTH_ENDPOINTS.REFRESH_TOKEN}`,
					{}, // Empty body - refresh token sent via cookie
					{ withCredentials: true }, // Ensure cookies are sent
				);

				if (response.data.success) {
					// Token is set in httpOnly cookie by server
					processQueue(null);
					return api(originalRequest);
				}
			} catch (refreshError: unknown) {
				// If refresh fails with 400, it means no refresh token exists (user not logged in)
				// Don't log as error in this case
				const isAxiosError =
					refreshError &&
					typeof refreshError === 'object' &&
					'response' in refreshError;
				const is400Error =
					isAxiosError &&
					(refreshError as { response?: { status?: number } })
						.response?.status === 400;

				if (is400Error) {
					logger.debug(
						'[API] No refresh token available (user not logged in)',
					);
				} else {
					logger.error('[API] Token refresh failed', refreshError);
				}

				processQueue(refreshError);

				// Only redirect to login if we're not already on an auth page
				// AND if it's not a "no refresh token" error (400)
				const isOnAuthPage =
					typeof window !== 'undefined' &&
					window.location.pathname.startsWith('/auth');

				if (!isOnAuthPage && !is400Error) {
					toast.error(
						Features.Auth.AUTH_TOAST_MESSAGES.SESSION_EXPIRED,
					);
					window.location.href = Features.Auth.AUTH_ROUTES.LOGIN;
				}

				return Promise.reject(refreshError);
			} finally {
				isRefreshing = false;
			}
		}

		// Transform "Refresh token is required" error message to French
		if (
			error.response?.status === 400 &&
			error.response?.data?.message === 'Refresh token is required'
		) {
			// Replace the error message with a French authentication required message
			const transformedError = {
				...error,
				response: {
					...error.response,
					data: {
						...error.response.data,
						message:
							'🔒 Connexion requise pour accéder à cette ressource',
					},
				},
			};

			// Only show toast for protected routes - don't annoy users on public pages
			const isOnPublicPage =
				typeof window !== 'undefined' &&
				(window.location.pathname === '/' ||
					window.location.pathname === '/home' ||
					window.location.pathname.startsWith('/auth') ||
					window.location.pathname.startsWith('/property') ||
					window.location.pathname.startsWith('/monagentimmo') ||
					window.location.pathname === '/search-ads');

			if (!isOnPublicPage) {
				toast.error('🔒 Veuillez vous connecter pour continuer');
			}

			return Promise.reject(transformedError);
		}

		// Transform 401 "Authentification requise" to more user-friendly message
		if (
			error.response?.status === 401 &&
			error.response?.data?.message === 'Authentification requise'
		) {
			const isOnPublicPage =
				typeof window !== 'undefined' &&
				(window.location.pathname === '/' ||
					window.location.pathname === '/home' ||
					window.location.pathname.startsWith('/auth') ||
					window.location.pathname.startsWith('/property') ||
					window.location.pathname.startsWith('/monagentimmo') ||
					window.location.pathname === '/search-ads');

			if (!isOnPublicPage) {
				toast.error('🔒 Veuillez vous connecter pour continuer');
			}
		}

		return Promise.reject(error);
	},
);
