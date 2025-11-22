import { Response, NextFunction } from 'express';
import { AuthRequest } from '../types/auth';
import { User } from '../models/User';
import { logger } from '../utils/logger';

/**
 * Middleware to require an active subscription for agents.
 * Allows admins and non-agent users to pass. Also allows agents who are not yet validated
 * or who have incomplete profiles to continue (those flows should be handled separately).
 * Allows agents who have been manually granted access by an admin.
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

    const user = await User.findById(req.userId).select('+isPaid +isValidated +profileCompleted +accessGrantedByAdmin');
    if (!user) {
      res.status(401).json({ success: false, message: 'Utilisateur non trouvé' });
      return;
    }

    // Allow admins full access
    if (user.userType === 'admin') {
      return next();
    }

    // Enforce profile completion: agents must complete their profile before navigating the platform
    if (user.userType === 'agent' && !user.profileCompleted) {
      logger.info(`[Subscription] Blocking access for agent with incomplete profile ${user.email}`);
      res.status(403).json({
        success: false,
        code: 'PROFILE_INCOMPLETE',
        message: 'Veuillez compléter votre profil avant d\'accéder à cette fonctionnalité.',
        profileUrl: '/auth/complete-profile',
      });
      return;
    }

    // Enforce subscription/payment requirement for agents who completed their profile
    // Once an agent has completed their profile they must pay to access protected areas
    if (user.userType === 'agent' && user.profileCompleted) {
      // Block if user has not paid AND has not been granted manual access by an admin
      if (!user.isPaid && !user.accessGrantedByAdmin) {
        logger.info(`[Subscription] Blocking access for unpaid user ${user.email} with no admin access grant.`);
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
