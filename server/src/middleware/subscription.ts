import { Response, NextFunction } from 'express';
import { AuthRequest } from '../types/auth';
import { User } from '../models/User';
import { logger } from '../utils/logger';

/**
 * Middleware to require an active subscription for agents.
 * - Apporteurs and admins pass through without subscription check
 * - Agents must have isPaid=true OR accessGrantedByAdmin=true
 * - Returns 403 with SUBSCRIPTION_REQUIRED code if not paid
 */
export const requireSubscription = async (
	req: AuthRequest,
	res: Response,
	next: NextFunction,
): Promise<void> => {
	try {
		const userId = req.userId;
		const userType = req.userType;

		// Only agents need subscription
		if (userType !== 'agent') {
			return next();
		}

		const user = await User.findById(userId).select(
			'isPaid accessGrantedByAdmin subscriptionStatus subscriptionEndDate',
		);

		if (!user) {
			res.status(401).json({
				success: false,
				message: 'Utilisateur non trouvé',
			});
			return;
		}

		// Admin granted free access bypasses payment
		if (user.accessGrantedByAdmin) {
			return next();
		}

		// Check if paid
		if (user.isPaid) {
			// Double-check subscription hasn't expired
			if (
				user.subscriptionEndDate &&
				user.subscriptionEndDate < new Date()
			) {
				// Subscription expired, update status
				await User.findByIdAndUpdate(userId, {
					isPaid: false,
					subscriptionStatus: 'expired',
				});

				logger.info(
					`[Subscription] Subscription expired for user ${userId}`,
				);

				res.status(403).json({
					success: false,
					code: 'SUBSCRIPTION_EXPIRED',
					message: 'Votre abonnement a expiré',
					redirectTo: '/payment',
				});
				return;
			}

			return next();
		}

		// Not paid - return subscription required error
		logger.info(`[Subscription] Access denied for unpaid agent ${userId}`);

		res.status(403).json({
			success: false,
			code: 'SUBSCRIPTION_REQUIRED',
			message:
				'Un abonnement est requis pour accéder à cette fonctionnalité',
			redirectTo: '/payment',
		});
	} catch (error) {
		logger.error('[Subscription] Middleware error:', error);
		res.status(500).json({
			success: false,
			message: "Erreur lors de la vérification de l'abonnement",
		});
	}
};

// Alias for backward compatibility with existing route imports
export const requireActiveSubscription = requireSubscription;
