/**
 * Next.js Middleware Tests
 * Tests server-side route protection
 */

import { NextRequest } from 'next/server';
import { middleware } from '@/middleware';

// Mock NextResponse
jest.mock('next/server', () => ({
	NextRequest: jest.fn(),
	NextResponse: {
		next: jest.fn(() => ({ type: 'next' })),
		redirect: jest.fn((url) => ({ type: 'redirect', url: url.toString() })),
	},
}));

describe('Next.js Middleware - Route Protection', () => {
	beforeEach(() => {
		jest.clearAllMocks();
	});

	const createMockRequest = (
		pathname: string,
		hasToken = false,
	): NextRequest => {
		const url = `http://localhost:3000${pathname}`;
		return {
			nextUrl: { pathname },
			url,
			cookies: {
				get: jest.fn((name: string) => {
					if (name === 'accessToken' && hasToken) {
						return { value: 'mock-token' };
					}
					return undefined;
				}),
			},
		} as unknown as NextRequest;
	};

	describe('Public Routes', () => {
		it('should allow access to public routes without authentication', () => {
			const publicRoutes = ['/', '/home', '/auth/login', '/auth/signup'];

			publicRoutes.forEach((route) => {
				const request = createMockRequest(route, false);
				const response = middleware(request);
				expect(response).toEqual({ type: 'next' });
			});
		});

		it('should allow access to public routes with authentication', () => {
			const publicRoutes = ['/', '/home', '/property', '/search-ads'];

			publicRoutes.forEach((route) => {
				const request = createMockRequest(route, true);
				const response = middleware(request);
				// Auth users accessing public routes should proceed normally
				expect(response).toBeDefined();
			});
		});
	});

	describe('Protected Routes', () => {
		it('should redirect unauthenticated users from protected routes to login', () => {
			const protectedRoutes = [
				'/dashboard',
				'/messages',
				'/favorites',
				'/search-ads/create',
				'/appointments/my',
			];

			protectedRoutes.forEach((route) => {
				const request = createMockRequest(route, false);
				const response = middleware(request) as {
					type: string;
					url: string;
				};

				expect(response.type).toBe('redirect');
				expect(response.url).toContain('/auth/login');
				expect(response.url).toContain(
					`from=${encodeURIComponent(route)}`,
				);
			});
		});

		it('should allow authenticated users to access protected routes', () => {
			const protectedRoutes = [
				'/dashboard',
				'/messages',
				'/favorites',
				'/search-ads/create',
			];

			protectedRoutes.forEach((route) => {
				const request = createMockRequest(route, true);
				const response = middleware(request);
				expect(response).toEqual({ type: 'next' });
			});
		});
	});

	describe('Auth Routes', () => {
		it('should redirect authenticated users from auth routes to dashboard', () => {
			const authRoutes = ['/auth/login', '/auth/signup'];

			authRoutes.forEach((route) => {
				const request = createMockRequest(route, true);
				const response = middleware(request) as {
					type: string;
					url: string;
				};

				expect(response.type).toBe('redirect');
				expect(response.url).toContain('/dashboard');
			});
		});

		it('should allow unauthenticated users to access auth routes', () => {
			const authRoutes = ['/auth/login', '/auth/signup'];

			authRoutes.forEach((route) => {
				const request = createMockRequest(route, false);
				const response = middleware(request);
				expect(response).toEqual({ type: 'next' });
			});
		});
	});

	describe('Static Assets & API Routes', () => {
		it('should skip middleware for static files', () => {
			const staticPaths = [
				'/_next/static/chunk.js',
				'/favicon.ico',
				'/logo.png',
			];

			staticPaths.forEach((path) => {
				const request = createMockRequest(path, false);
				const response = middleware(request);
				expect(response).toEqual({ type: 'next' });
			});
		});

		it('should skip middleware for API routes', () => {
			const apiPaths = ['/api/auth', '/api/properties', '/api/users'];

			apiPaths.forEach((path) => {
				const request = createMockRequest(path, false);
				const response = middleware(request);
				expect(response).toEqual({ type: 'next' });
			});
		});
	});

	describe('Dynamic Protected Routes', () => {
		it('should block unauthenticated access to dynamic protected routes', () => {
			const dynamicRoutes = [
				'/search-ads/edit/123',
				'/collaboration/456',
				'/dashboard/profile',
			];

			dynamicRoutes.forEach((route) => {
				const request = createMockRequest(route, false);
				const response = middleware(request) as {
					type: string;
					url: string;
				};

				expect(response.type).toBe('redirect');
				expect(response.url).toContain('/auth/login');
			});
		});

		it('should allow authenticated access to dynamic protected routes', () => {
			const dynamicRoutes = [
				'/search-ads/edit/123',
				'/collaboration/456',
				'/dashboard/profile',
			];

			dynamicRoutes.forEach((route) => {
				const request = createMockRequest(route, true);
				const response = middleware(request);
				expect(response).toEqual({ type: 'next' });
			});
		});
	});

	describe('Return URL Functionality', () => {
		it('should preserve return URL when redirecting to login', () => {
			const request = createMockRequest('/dashboard', false);
			const response = middleware(request) as {
				type: string;
				url: string;
			};

			expect(response.type).toBe('redirect');
			expect(response.url).toContain('/auth/login');
			expect(response.url).toContain('from=%2Fdashboard');
		});

		it('should encode complex URLs in return parameter', () => {
			const request = createMockRequest('/search-ads/edit/123', false);
			const response = middleware(request) as {
				type: string;
				url: string;
			};

			expect(response.url).toContain(
				`from=${encodeURIComponent('/search-ads/edit/123')}`,
			);
		});
	});
});
