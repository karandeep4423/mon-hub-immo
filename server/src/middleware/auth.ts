import { Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import { verifyToken } from '../utils/jwt';
import { AuthRequest } from '../types/auth';
import { User } from '../models/User';

export const authenticateToken = async (
	req: AuthRequest,
	res: Response,
	next: NextFunction,
): Promise<void> => {
	const authHeader = req.headers.authorization;
	const token = authHeader && authHeader.split(' ')[1];

	if (!token) {
		res.status(401).json({
			success: false,
			message: 'Authentification requise',
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
