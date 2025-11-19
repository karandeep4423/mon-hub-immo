import { Response, NextFunction } from 'express';
import { AuthRequest } from '../types/auth';
import { User } from '../models/User';
import { logger } from '../utils/logger';

/**
 * Middleware to require an active subscription for agents.
 * Allows admins and non-agent users to pass. Also allows agents who are not yet validated
 * or who have incomplete profiles to continue (those flows should be handled separately).
 */
export const requireActiveSubscription = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
): Promise<Response | void> => {
  try {
    if (!req.userId) {
      // Not authenticated - let authenticateToken handle this normally
      res.status(401).json({ success: false, message: 'Authentification requise' });
      return;
    }

    const user = await User.findById(req.userId).select('+isPaid +isValidated +profileCompleted');
    if (!user) {
      res.status(401).json({ success: false, message: 'Utilisateur non trouvé' });
      return;
    }

    // Allow admins full access
    if (user.userType === 'admin') {
      return next();
    }

    // Only enforce for agents who are validated and have completed profile
    if (user.userType === 'agent' && user.isValidated && user.profileCompleted) {
      if (!user.isPaid) {
        logger.info(`[Subscription] Blocking access for unpaid user ${user.email}`);
        res.status(402).json({
          success: false,
          code: 'PAYMENT_REQUIRED',
          message: "Votre compte nécessite un paiement pour accéder à cette fonctionnalité. Rendez-vous sur /payment pour finaliser.",
          paymentUrl: '/payment',
        });
        return;
      }
    }

    // Otherwise allow
    return next();
  } catch (error) {
    logger.error('[Subscription] Error in requireActiveSubscription', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
    return;
  }
};

export default requireActiveSubscription;
