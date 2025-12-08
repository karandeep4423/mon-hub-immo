import { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import { verifyToken } from '../utils/jwt';
import { AuthRequest } from '../types/auth';
import { User } from '../models/User';
import { getAccessTokenFromCookies } from '../utils/cookieHelper';
import { logger } from '../utils/logger';
import { isTokenBlacklisted } from '../utils/redisClient';

export const authenticateToken = async (
	req: AuthRequest,
	res: Response,
	next: NextFunction,
): Promise<void> => {
	try {
		const authDebug = process.env.AUTH_DEBUG === 'true';

		if (authDebug) {
			logger.info('[authenticateToken] incoming', {
				method: (req as Request).method,
				url: (req as Request).originalUrl,
				origin: req.headers.origin,
				cookieKeys: Object.keys(req.cookies || {}),
				authHeader: req.headers.authorization
					? '(present)'
					: '(absent)',
			});
		}

		// Get token from httpOnly cookies first
		let token = getAccessTokenFromCookies(req.cookies);
		if (authDebug)
			logger.debug('[authenticateToken] Token from cookie', {
				tokenPresent: !!token,
			});

		// Fallback to Authorization: Bearer <token> for diagnostics when cookie not present
		if (!token) {
			const rawAuth = (req.headers.authorization || '') as string;
			if (rawAuth.startsWith('Bearer ')) {
				token = rawAuth.slice(7);
				if (authDebug)
					logger.info(
						'[authenticateToken] token found in Authorization header (fallback)',
					);
			}
		}

		if (!token) {
			if (authDebug)
				logger.warn(
					'[authenticateToken] Pas de token d\u2019acc\u00e8s dans les cookies ou header',
					{ url: (req as Request).originalUrl },
				);
			res.status(401).json({
				success: false,
				message: 'Authentification requise',
			});
			return;
		}

		// Check if token is blacklisted (revoked during logout)
		const isBlacklisted = await isTokenBlacklisted(token);
		if (isBlacklisted) {
			if (authDebug)
				logger.warn(
					'[authenticateToken] Token r\u00e9voqu\u00e9 d\u00e9tect\u00e9',
				);
			res.status(401).json({
				success: false,
				message: 'Token r\u00e9voqu\u00e9 - veuillez vous reconnecter',
			});
			return;
		}

		const decoded = verifyToken(token);
		if (authDebug)
			logger.debug('[authenticateToken] Token d\u00e9cod\u00e9', {
				decoded,
			});

		// Fetch user data from database
		const user = await User.findById(decoded.userId);
		if (!user) {
			if (authDebug)
				logger.warn(
					'[authenticateToken] Utilisateur non trouvé en base (hard deleted)',
					{ userId: decoded.userId },
				);
			res.status(401).json({
				success: false,
				code: 'ACCOUNT_DELETED',
				message: 'Utilisateur non trouvé',
			});
			return;
		}

		// Reject if account is administratively blocked
		if (user.isBlocked) {
			if (authDebug)
				logger.warn(
					'[authenticateToken] Attempted access with blocked user account',
					{ userId: user._id },
				);
			res.status(403).json({
				success: false,
				code: 'ACCOUNT_BLOCKED',
				message: 'Account blocked by admin',
			});
			return;
		}

		// Reject if account is soft deleted
		if (user.isDeleted) {
			if (authDebug)
				logger.warn(
					'[authenticateToken] Attempted access with deleted user account',
					{ userId: user._id },
				);
			res.status(403).json({
				success: false,
				code: 'ACCOUNT_DELETED',
				message: 'Account has been deleted',
			});
			return;
		}

		// Reject if account is not yet validated by admin (for non-admin users)
		if (!user.isValidated && user.userType !== 'admin') {
			if (authDebug)
				logger.warn(
					'[authenticateToken] Attempted access with unvalidated user account',
					{ userId: user._id },
				);
			res.status(403).json({
				success: false,
				code: 'ACCOUNT_UNVALIDATED',
				message: "Compte non valid\u00e9 par l'administrateur",
			});
			return;
		}

		// Attach user data to request
		req.userId = (user._id as mongoose.Types.ObjectId).toString();
		req.userType = user.userType as
			| 'agent'
			| 'apporteur'
			| 'admin'
			| 'guest';
		req.user = {
			id: (user._id as mongoose.Types.ObjectId).toString(),
			userType: user.userType as 'agent' | 'apporteur' | 'admin',
		};
		if (authDebug)
			logger.info(
				'[authenticateToken] User attach\u00e9 \u00e0 la requ\u00eate',
				{ user: req.user },
			);

		next();
	} catch (error) {
		logger.error('[authenticateToken] Erreur attrap\u00e9e:', error);
		res.status(403).json({
			success: false,
			message: 'Token invalide ou expir\u00e9',
		});
	}
};

// Optional authentication - doesn't fail if no token provided
export const optionalAuth = async (
	req: AuthRequest,
	res: Response,
	next: NextFunction,
): Promise<void> => {
	// Get token from httpOnly cookies only
	const token = getAccessTokenFromCookies(req.cookies);

	// No token? Continue without auth
	if (!token) {
		next();
		return;
	}

	try {
		const decoded = verifyToken(token);

		// Fetch user data from database
		const user = await User.findById(decoded.userId);
		if (user) {
			// Attach user data to request if valid
			req.userId = (user._id as mongoose.Types.ObjectId).toString();
			req.user = {
				id: (user._id as mongoose.Types.ObjectId).toString(),
				userType: user.userType as 'agent' | 'apporteur',
			};
		}

		next();
		// eslint-disable-next-line @typescript-eslint/no-unused-vars
	} catch (error) {
		// Invalid token? Continue without auth (don't block)
		next();
	}
};

export const requireAdmin = (
	req: AuthRequest,
	res: Response,
	next: NextFunction,
) => {
	logger.debug('[Middleware] Admin role verification:', {
		userType: req.user?.userType,
	});

	if (req.user?.userType !== 'admin') {
		logger.warn('[Middleware] Unauthorized access - insufficient role');
		return res
			.status(403)
			.json({ error: "Accès réservé à l'administration." });
	}
	next();
};
