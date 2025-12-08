import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import {
	isProtectedRoute,
	shouldRedirectAuthenticated,
	REDIRECT_PATHS,
} from './lib/config/routes.config';

/**
 * Next.js Middleware for Route Protection
 * Runs on the Edge before pages are rendered
 * Provides server-side route protection for better performance and security
 *
 * Benefits:
 * - Prevents unauthorized access before component rendering
 * - No flash of protected content
 * - Better performance (Edge runtime)
 * - SEO-friendly redirects
 */

/**
 * Check if request has an active session indicator.
 * We allow passage when either:
 * - accessToken exists (fresh session), or
 * - refreshToken exists (expired access token but refreshable session)
 */
const getSessionFlags = (
	request: NextRequest,
): {
	hasAccess: boolean;
	hasRefresh: boolean;
} => {
	const hasAccess = !!request.cookies.get('accessToken')?.value;
	const hasRefresh = !!request.cookies.get('refreshToken')?.value;
	return { hasAccess, hasRefresh };
};

/**
 * Main middleware function
 */
export function middleware(request: NextRequest) {
	const { pathname } = request.nextUrl;
	const { hasAccess, hasRefresh } = getSessionFlags(request);
	const canAccessProtected = hasAccess || hasRefresh;

	// Skip middleware for:
	// 1. Static files (_next/static, favicon, etc.)
	// 2. API routes (handled by backend)
	// 3. Public assets
	if (
		pathname.startsWith('/_next') ||
		pathname.startsWith('/api') ||
		pathname.includes('/favicon') ||
		pathname.includes('.')
	) {
		return NextResponse.next();
	}

	// Protected routes - require authentication
	if (isProtectedRoute(pathname)) {
		if (!canAccessProtected) {
			// Redirect to login with return URL
			const loginUrl = new URL(REDIRECT_PATHS.LOGIN, request.url);
			loginUrl.searchParams.set('from', pathname);

			return NextResponse.redirect(loginUrl);
		}
	}

	// Auth routes - redirect if already authenticated
	if (shouldRedirectAuthenticated(pathname)) {
		// Only redirect away from auth pages when a fresh access token exists.
		// A refresh-only session should be allowed to load the page so the client can refresh silently.
		if (hasAccess) {
			// Note: We redirect to /dashboard here since we can't access user type in middleware
			// The dashboard page will handle redirecting admins to /admin
			return NextResponse.redirect(
				new URL(REDIRECT_PATHS.DASHBOARD, request.url),
			);
		}
	}

	// Redirect authenticated users from landing page to home
	if (pathname === '/' && hasAccess) {
		return NextResponse.redirect(new URL(REDIRECT_PATHS.HOME, request.url));
	}

	// Allow request to proceed
	return NextResponse.next();
}

/**
 * Matcher configuration
 * Defines which routes this middleware should run on
 * Using negative lookahead to exclude static assets
 */
export const config = {
	matcher: [
		/*
		 * Match all request paths except:
		 * - _next/static (static files)
		 * - _next/image (image optimization files)
		 * - favicon.ico (favicon file)
		 * - public folder files (public assets)
		 */
		'/((?!_next/static|_next/image|favicon.ico|.*\\..*|api/).*)',
	],
};
