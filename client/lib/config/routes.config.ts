/**
 * Route Configuration
 * Centralized definition of route access patterns
 * Follows DRY principle - single source of truth for route protection
 */

/**
 * Routes that require authentication
 * User must be logged in to access these routes
 */
export const PROTECTED_ROUTES = [
	'/dashboard',
	'/admin',
	'/search-ads/create',
	'/search-ads/edit',
	'/collaboration',
	'/messages',
	'/favorites',
	'/appointments/my',
] as const;

/**
 * Routes that are public (no authentication required)
 */
export const PUBLIC_ROUTES = [
	'/',
	'/auth/login',
	'/auth/signup',
	'/auth/verify-email',
	'/auth/forgot-password',
	'/auth/reset-password',
	'/auth/welcome',
	'/home',
	'/property',
	'/search-ads',
	'/monagentimmo',
] as const;

/**
 * Routes that should redirect authenticated users away
 * (e.g., login page - if already logged in, go to dashboard)
 */
export const AUTH_ROUTES = [
	'/auth/login',
	'/auth/signup',
	'/auth/forgot-password',
] as const;

/**
 * Route patterns for dynamic routes
 */
export const DYNAMIC_PROTECTED_PATTERNS = [
	'/search-ads/edit/',
	'/collaboration/',
	'/dashboard/',
	'/admin/',
] as const;

/**
 * Default redirect paths
 */
export const REDIRECT_PATHS = {
	LOGIN: '/auth/login',
	DASHBOARD: '/dashboard',
	HOME: '/home',
} as const;

/**
 * Check if a route requires authentication
 * @param pathname - The route pathname to check
 * @returns true if route requires authentication
 */
export const isProtectedRoute = (pathname: string): boolean => {
	// Check exact matches
	if (PROTECTED_ROUTES.some((route) => pathname.startsWith(route))) {
		return true;
	}

	// Check dynamic patterns
	if (
		DYNAMIC_PROTECTED_PATTERNS.some((pattern) =>
			pathname.startsWith(pattern),
		)
	) {
		return true;
	}

	return false;
};

/**
 * Check if a route is public
 * @param pathname - The route pathname to check
 * @returns true if route is public
 */
export const isPublicRoute = (pathname: string): boolean => {
	// Root and home are public
	if (pathname === '/' || pathname === '/home') {
		return true;
	}

	// Check if it's an auth route (public by nature)
	if (AUTH_ROUTES.some((route) => pathname.startsWith(route))) {
		return true;
	}

	// Check public route patterns
	return PUBLIC_ROUTES.some((route) => {
		if (route === '/') return pathname === '/';
		return pathname.startsWith(route);
	});
};

/**
 * Check if authenticated user should be redirected from this route
 * @param pathname - The route pathname to check
 * @returns true if authenticated users should be redirected
 */
export const shouldRedirectAuthenticated = (pathname: string): boolean => {
	return AUTH_ROUTES.some((route) => pathname.startsWith(route));
};
