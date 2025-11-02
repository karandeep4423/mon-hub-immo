import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { shouldRedirectAuthenticated } from './lib/config/routes.config';

/**
 * Next.js Middleware for Route Protection
 *
 * NOTE: In production with cross-domain setup (frontend on monhubimmo.fr, backend on render.com),
 * the Edge middleware cannot read httpOnly cookies from the backend domain.
 * Therefore, we ONLY handle public route redirects here (e.g., redirect logged-in users from /login).
 *
 * Protected routes are handled by:
 * 1. Client-side <ProtectedRoute> component (immediate protection)
 * 2. Backend API authentication middleware (security layer)
 *
 * This approach works because:
 * - Client-side API calls include credentials (withCredentials: true)
 * - Cookies are sent with API requests, not with page navigation
 * - ProtectedRoute component checks auth before rendering content
 */

/**
 * Check if user has a valid access token cookie
 * NOTE: This only works in localhost. In production with cross-domain,
 * cookies from backend domain are not accessible here.
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

	// REMOVED: Protected route checks - handled by ProtectedRoute component
	// Reason: Cross-domain cookies not accessible in Edge middleware

	// Auth routes - redirect if already authenticated (ONLY works on localhost)
	// In production, this won't redirect but that's okay - login page will handle it
	if (shouldRedirectAuthenticated(pathname) && isAuthenticated) {
		return NextResponse.redirect(new URL('/dashboard', request.url));
	}

	// Allow all requests to proceed - protection happens at component level
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
