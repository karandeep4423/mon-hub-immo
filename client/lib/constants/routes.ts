// Centralized route paths to avoid string duplication
export const AUTH_ROUTES = {
	LOGIN: '/auth/login',
	WELCOME: '/auth/welcome',
	COMPLETE_PROFILE: '/auth/complete-profile',
} as const;

export const APP_ROUTES = {
	DASHBOARD: '/dashboard',
} as const;
