// client/lib/api.ts
import axios from 'axios';
import { logger } from './utils/logger';
import { Features } from './constants';
import { toast } from 'react-toastify';
import { AUTH_ENDPOINTS } from './constants/api/endpoints';

const API_BASE_URL =
	process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

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
		// Also skip for profile endpoint when initializing (to avoid console errors on page load)
		const isAuthEndpoint =
			originalRequest.url?.includes('/auth/login') ||
			originalRequest.url?.includes('/auth/signup') ||
			originalRequest.url?.includes('/auth/verify-email') ||
			originalRequest.url?.includes('/auth/forgot-password') ||
			originalRequest.url?.includes('/auth/reset-password') ||
			originalRequest.url?.includes('/auth/refresh') ||
			originalRequest.url?.includes('/auth/profile');

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

		return Promise.reject(error);
	},
);
