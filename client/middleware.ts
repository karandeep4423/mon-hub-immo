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
 * Check if user has a valid access token cookie
 */
const hasAccessToken = (request: NextRequest): boolean => {
	return !!request.cookies.get('accessToken')?.value;
};

/**
 * Main middleware function
 */
export function middleware(request: NextRequest) {
	const { pathname } = request.nextUrl;
	const isAuthenticated = hasAccessToken(request);

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
		if (!isAuthenticated) {
			// Redirect to login with return URL
			const loginUrl = new URL(REDIRECT_PATHS.LOGIN, request.url);
			loginUrl.searchParams.set('from', pathname);

			return NextResponse.redirect(loginUrl);
		}
	}

	// Auth routes - redirect if already authenticated
	if (shouldRedirectAuthenticated(pathname)) {
		if (isAuthenticated) {
			return NextResponse.redirect(
				new URL(REDIRECT_PATHS.DASHBOARD, request.url),
			);
		}
	}

	// Redirect authenticated users from landing page to home
	if (pathname === '/' && isAuthenticated) {
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
