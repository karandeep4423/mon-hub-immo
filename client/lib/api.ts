// client/lib/api.ts
import axios from 'axios';
import { logger } from './utils/logger';
import { TokenManager } from './utils/tokenManager';
import { Features } from './constants';

const API_BASE_URL =
	process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

export const api = axios.create({
	baseURL: API_BASE_URL,
	timeout: 60000, // 60 seconds timeout for image uploads
	headers: {
		'Content-Type': 'application/json',
	},
});

// Request interceptor to add auth token
api.interceptors.request.use(
	(config) => {
		const token = TokenManager.get();
		if (token) {
			config.headers.Authorization = `Bearer ${token}`;
		}
		return config;
	},
	(error) => Promise.reject(error),
);

// Response interceptor for error handling
api.interceptors.response.use(
	(response) => response,
	(error) => {
		if (error.response?.status === 401) {
			logger.warn('[API] Unauthorized - redirecting to login');
			TokenManager.remove();
			window.location.href = Features.Auth.AUTH_ROUTES.LOGIN;
		}
		return Promise.reject(error);
	},
);
