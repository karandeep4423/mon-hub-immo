import { Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import { verifyToken } from '../utils/jwt';
import { AuthRequest } from '../types/auth';
import { User } from '../models/User';
import { getAccessTokenFromCookies } from '../utils/cookieHelper';
import { isTokenBlacklisted } from '../utils/redisClient';

export const authenticateToken = async (
	req: AuthRequest,
	res: Response,
	next: NextFunction,
): Promise<void> => {
	// Get token from httpOnly cookies only
	const token = getAccessTokenFromCookies(req.cookies);

	if (!token) {
		res.status(401).json({
			success: false,
			message: 'Authentification requise',
		});
		return;
	}

	// Check if token is blacklisted (revoked during logout)
	const isBlacklisted = await isTokenBlacklisted(token);
	if (isBlacklisted) {
		res.status(401).json({
			success: false,
			message: 'Token révoqué - veuillez vous reconnecter',
		});
		return;
	}

	try {
		const decoded = verifyToken(token);

		// Fetch user data from database
		const user = await User.findById(decoded.userId);
		if (!user) {
			res.status(401).json({
				success: false,
				message: 'Utilisateur non trouvé',
			});
			return;
		}

		// Attach user data to request
		req.userId = (user._id as mongoose.Types.ObjectId).toString();
		req.user = {
			id: (user._id as mongoose.Types.ObjectId).toString(),
			userType: user.userType as 'agent' | 'apporteur',
		};

		next();
		// eslint-disable-next-line @typescript-eslint/no-unused-vars
	} catch (error) {
		res.status(403).json({
			success: false,
			message: 'Token invalide ou expiré',
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
