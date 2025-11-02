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
 */
export const getSecureCookieOptions = (maxAge: number): CookieOptions => {
	const isProduction = process.env.NODE_ENV === 'production';

	const options: CookieOptions = {
		httpOnly: true, // Prevents XSS attacks by making cookie inaccessible to JavaScript
		secure: isProduction, // Only send over HTTPS in production
		sameSite: isProduction ? 'none' : 'lax', // 'none' for cross-site in production, 'lax' for localhost
		maxAge, // Cookie expiration in milliseconds
		expires: new Date(Date.now() + maxAge), // Explicit expiration date for persistent cookies
		path: '/', // Cookie available for entire domain
	};

	// In production, set domain to allow cross-subdomain cookies
	if (isProduction) {
		options.domain = '.monhubimmo.fr';
	}

	return options;
};

/**
 * Set access token cookie
 */
export const setAccessTokenCookie = (res: Response, token: string): void => {
	try {
		res.cookie(
			COOKIE_NAMES.ACCESS_TOKEN,
			token,
			getSecureCookieOptions(COOKIE_MAX_AGE.ACCESS_TOKEN),
		);
		logger.debug('[CookieHelper] Access token cookie set');
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
		res.cookie(
			COOKIE_NAMES.REFRESH_TOKEN,
			token,
			getSecureCookieOptions(COOKIE_MAX_AGE.REFRESH_TOKEN),
		);
		logger.debug('[CookieHelper] Refresh token cookie set');
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
		const clearOptions: CookieOptions = { path: '/' };
		if (isProduction) {
			clearOptions.domain = '.monhubimmo.fr';
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
		const clearOptions: CookieOptions = { path: '/' };
		if (isProduction) {
			clearOptions.domain = '.monhubimmo.fr';
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
