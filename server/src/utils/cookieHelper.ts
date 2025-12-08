/**
 * Cookie Management Utility
 * Secure cookie configuration for JWT tokens
 */

import { Response } from 'express';
import { logger } from './logger';

export interface CookieOptions {
	httpOnly?: boolean;
	secure?: boolean;
	sameSite?: 'strict' | 'lax' | 'none';
	maxAge?: number;
	expires?: Date;
	path?: string;
	domain?: string;
}

export const COOKIE_NAMES = {
	ACCESS_TOKEN: 'accessToken',
	REFRESH_TOKEN: 'refreshToken',
} as const;

// Cookie expiry times (in milliseconds)
export const COOKIE_MAX_AGE = {
	ACCESS_TOKEN: 15 * 60 * 1000, // 15 minutes
	REFRESH_TOKEN: 30 * 24 * 60 * 60 * 1000, // 30 days
} as const;

/**
 * Get secure cookie options based on environment
 * SECURITY: Always enforces secure cookies in production
 */
export const getSecureCookieOptions = (maxAge: number): CookieOptions => {
	const isProduction = process.env.NODE_ENV === 'production';

	// Allow configuring cookie behavior per environment/deployment
	const cookieDomain =
		process.env.COOKIE_DOMAIN ||
		(isProduction ? '.monhubimmo.fr' : undefined);

	// If running in production, we assume frontend and API may be on different
	// subdomains (www.monhubimmo.fr -> api.monhubimmo.fr). In that case cookies
	// must be cross-site (SameSite=None and Secure=true). Allow overriding via
	// CROSS_SITE_COOKIES env var for special deployments, but default to true
	// in production.
	const crossSite =
		process.env.CROSS_SITE_COOKIES === 'true' ||
		(isProduction && Boolean(cookieDomain));

	const forceSecure = process.env.FORCE_SECURE_COOKIES === 'true';

	// SECURITY FIX: Always enforce secure cookies in production
	// In production: secure is ALWAYS true regardless of crossSite
	// In development: secure is true if crossSite OR forceSecure is set
	const secure = isProduction ? true : crossSite || forceSecure;

	// SECURITY FIX: Use stricter SameSite in production when not cross-site
	// Production: 'strict' if same-site, 'none' if cross-site
	// Development: 'lax' if same-site, 'none' if cross-site
	const sameSite: 'strict' | 'lax' | 'none' = crossSite
		? 'none'
		: isProduction
			? 'strict'
			: 'lax';

	const options: CookieOptions = {
		httpOnly: true,
		secure,
		sameSite,
		maxAge,
		expires: new Date(Date.now() + maxAge),
		path: '/',
	};

	if (cookieDomain) {
		options.domain = cookieDomain;
	}

	return options;
};

/**
 * Set access token cookie
 */
export const setAccessTokenCookie = (res: Response, token: string): void => {
	try {
		const opts = getSecureCookieOptions(COOKIE_MAX_AGE.ACCESS_TOKEN);
		res.cookie(COOKIE_NAMES.ACCESS_TOKEN, token, opts);
		// Log cookie options (do not log token value)
		logger.debug('[CookieHelper] Access token cookie set', {
			name: COOKIE_NAMES.ACCESS_TOKEN,
			domain: opts.domain || null,
			sameSite: opts.sameSite,
			secure: opts.secure,
			httpOnly: opts.httpOnly,
			path: opts.path,
			maxAge: opts.maxAge,
		});
	} catch (error) {
		logger.error('[CookieHelper] Failed to set access token cookie', error);
		throw error;
	}
};

/**
 * Set refresh token cookie
 */
export const setRefreshTokenCookie = (res: Response, token: string): void => {
	try {
		const opts = getSecureCookieOptions(COOKIE_MAX_AGE.REFRESH_TOKEN);
		res.cookie(COOKIE_NAMES.REFRESH_TOKEN, token, opts);
		logger.debug('[CookieHelper] Refresh token cookie set', {
			name: COOKIE_NAMES.REFRESH_TOKEN,
			domain: opts.domain || null,
			sameSite: opts.sameSite,
			secure: opts.secure,
			httpOnly: opts.httpOnly,
			path: opts.path,
			maxAge: opts.maxAge,
		});
	} catch (error) {
		logger.error(
			'[CookieHelper] Failed to set refresh token cookie',
			error,
		);
		throw error;
	}
};

/**
 * Set both access and refresh token cookies
 */
export const setAuthCookies = (
	res: Response,
	accessToken: string,
	refreshToken: string,
): void => {
	setAccessTokenCookie(res, accessToken);
	setRefreshTokenCookie(res, refreshToken);
};

/**
 * Clear access token cookie
 */
export const clearAccessTokenCookie = (res: Response): void => {
	try {
		const isProduction = process.env.NODE_ENV === 'production';
		const cookieDomain =
			process.env.COOKIE_DOMAIN ||
			(isProduction ? '.monhubimmo.fr' : undefined);

		const clearOptions: CookieOptions = { path: '/' };
		if (cookieDomain) {
			clearOptions.domain = cookieDomain;
		}
		res.clearCookie(COOKIE_NAMES.ACCESS_TOKEN, clearOptions);
		logger.debug('[CookieHelper] Access token cookie cleared');
	} catch (error) {
		logger.error(
			'[CookieHelper] Failed to clear access token cookie',
			error,
		);
	}
};

/**
 * Clear refresh token cookie
 */
export const clearRefreshTokenCookie = (res: Response): void => {
	try {
		const isProduction = process.env.NODE_ENV === 'production';
		const cookieDomain =
			process.env.COOKIE_DOMAIN ||
			(isProduction ? '.monhubimmo.fr' : undefined);

		const clearOptions: CookieOptions = { path: '/' };
		if (cookieDomain) {
			clearOptions.domain = cookieDomain;
		}
		res.clearCookie(COOKIE_NAMES.REFRESH_TOKEN, clearOptions);
		logger.debug('[CookieHelper] Refresh token cookie cleared');
	} catch (error) {
		logger.error(
			'[CookieHelper] Failed to clear refresh token cookie',
			error,
		);
	}
};

/**
 * Clear all auth cookies
 */
export const clearAuthCookies = (res: Response): void => {
	clearAccessTokenCookie(res);
	clearRefreshTokenCookie(res);
	logger.info('[CookieHelper] All auth cookies cleared');
};

/**
 * Get access token from request cookies
 */
export const getAccessTokenFromCookies = (
	cookies: Record<string, string>,
): string | undefined => {
	return cookies[COOKIE_NAMES.ACCESS_TOKEN];
};

/**
 * Get refresh token from request cookies
 */
export const getRefreshTokenFromCookies = (
	cookies: Record<string, string>,
): string | undefined => {
	return cookies[COOKIE_NAMES.REFRESH_TOKEN];
};
