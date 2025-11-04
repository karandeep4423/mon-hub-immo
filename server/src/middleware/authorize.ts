import { Response, NextFunction } from 'express';
import { AuthRequest } from '../types/auth';
import { logger } from '../utils/logger';
import {
	hasRole,
	isOwner,
	hasCollaborationAccess,
	AUTH_ERRORS,
} from '../utils/authHelpers';

/**
 * Authorization Middleware
 * Provides role-based and ownership-based access control
 */

/**
 * Require specific user role(s) to access a route
 * @param allowedRoles Array of allowed user types
 * @returns Middleware function
 *
 * @example
 * router.post('/property', authenticateToken, requireRole(['agent']), createProperty);
 */
export const requireRole = (allowedRoles: Array<'agent' | 'apporteur'>) => {
	return (req: AuthRequest, res: Response, next: NextFunction): void => {
		if (!req.user) {
			logger.warn('[Authorization] Authentication required', {
				event: 'auth_required',
				path: req.path,
				method: req.method,
				ip: req.ip,
				userAgent: req.get('user-agent'),
			});

			res.status(401).json({
				success: false,
				message: AUTH_ERRORS.AUTHENTICATION_REQUIRED,
			});
			return;
		}

		if (!hasRole(req.user.userType, allowedRoles)) {
			logger.warn('[Authorization] Role check failed', {
				event: 'role_check_failed',
				userId: req.userId,
				userType: req.user.userType,
				requiredRoles: allowedRoles,
				path: req.path,
				method: req.method,
				ip: req.ip,
				timestamp: new Date().toISOString(),
			});

			res.status(403).json({
				success: false,
				message: AUTH_ERRORS.INSUFFICIENT_ROLE,
			});
			return;
		}

		logger.info('[Authorization] Role check passed', {
			event: 'role_check_passed',
			userId: req.userId,
			userType: req.user.userType,
			path: req.path,
		});

		next();
	};
};

/**
 * Check resource ownership before allowing modification
 * Fetches resource from database and verifies ownership
 * Follows YAGNI principle - only implements what's currently needed
 *
 * @param resourceModel Mongoose model to fetch resource from
 * @returns Middleware function
 *
 * @example
 * import { SearchAd } from '../models/SearchAd';
 * router.delete('/:id', authenticateToken, requireOwnership(SearchAd), deleteSearchAd);
 *
 * Note: Assumes resource ID is in req.params.id and ownership field is 'authorId' or 'owner'
 * If you need custom parameters, extend this function when the need arises (YAGNI)
 */
export const requireOwnership = (
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	resourceModel: { findById: (id: string) => Promise<any> },
) => {
	return async (
		req: AuthRequest,
		res: Response,
		next: NextFunction,
	): Promise<void> => {
		try {
			if (!req.userId) {
				logger.warn('[Authorization] Authentication required', {
					event: 'auth_required',
					path: req.path,
					method: req.method,
					ip: req.ip,
				});

				res.status(401).json({
					success: false,
					message: AUTH_ERRORS.AUTHENTICATION_REQUIRED,
				});
				return;
			}

			const resourceId = req.params.id;
			if (!resourceId) {
				logger.warn('[Authorization] Missing resource ID', {
					event: 'missing_resource_id',
					userId: req.userId,
					path: req.path,
				});

				res.status(400).json({
					success: false,
					message: AUTH_ERRORS.MISSING_RESOURCE_ID,
				});
				return;
			}

			const resource = await resourceModel.findById(resourceId);
			if (!resource) {
				logger.warn('[Authorization] Resource not found', {
					event: 'resource_not_found',
					userId: req.userId,
					resourceId,
					path: req.path,
				});

				res.status(404).json({
					success: false,
					message: AUTH_ERRORS.RESOURCE_NOT_FOUND,
				});
				return;
			}

			// Check ownership - handle both 'authorId' (SearchAd) and 'owner' (Property) fields
			const ownerField = resource.authorId || resource.owner;
			if (!isOwner(req.userId, ownerField)) {
				logger.warn('[Authorization] Ownership check failed', {
					event: 'ownership_check_failed',
					userId: req.userId,
					resourceId,
					resourceOwnerId: ownerField?.toString(),
					path: req.path,
					method: req.method,
					ip: req.ip,
					timestamp: new Date().toISOString(),
				});
				res.status(403).json({
					success: false,
					message: AUTH_ERRORS.NOT_OWNER,
				});
				return;
			}

			req.resource = resource;

			logger.info('[Authorization] Ownership check passed', {
				event: 'ownership_check_passed',
				userId: req.userId,
				resourceId,
				path: req.path,
			});

			next();
		} catch (error) {
			logger.error('[Authorization] Ownership check error', {
				event: 'ownership_check_error',
				error: error instanceof Error ? error.message : String(error),
				userId: req.userId,
				path: req.path,
				timestamp: new Date().toISOString(),
			});

			res.status(500).json({
				success: false,
				message: AUTH_ERRORS.AUTHORIZATION_CHECK_ERROR,
			});
		}
	};
};

/**
 * Check if user can access collaboration resource
 * Special authorization for collaborations (owner or collaborator)
 *
 * @returns Middleware function
 *
 * @example
 * router.post('/:id/notes', authenticateToken, requireCollaborationAccess(), addNote);
 */
export const requireCollaborationAccess = () => {
	return async (
		req: AuthRequest,
		res: Response,
		next: NextFunction,
	): Promise<void> => {
		try {
			const { Collaboration } = await import('../models/Collaboration');

			if (!req.userId) {
				logger.warn('[Authorization] Authentication required', {
					event: 'auth_required',
					path: req.path,
					method: req.method,
					ip: req.ip,
				});

				res.status(401).json({
					success: false,
					message: AUTH_ERRORS.AUTHENTICATION_REQUIRED,
				});
				return;
			}

			const collaborationId = req.params.id;
			if (!collaborationId) {
				logger.warn('[Authorization] Missing collaboration ID', {
					event: 'missing_resource_id',
					userId: req.userId,
					path: req.path,
				});

				res.status(400).json({
					success: false,
					message: AUTH_ERRORS.MISSING_RESOURCE_ID,
				});
				return;
			}

			const collaboration = await Collaboration.findById(collaborationId);
			if (!collaboration) {
				logger.warn('[Authorization] Collaboration not found', {
					event: 'collaboration_not_found',
					userId: req.userId,
					collaborationId,
					path: req.path,
				});

				res.status(404).json({
					success: false,
					message: 'Collaboration non trouvée',
				});
				return;
			}

			if (!hasCollaborationAccess(req.userId, collaboration)) {
				logger.warn('[Authorization] Collaboration access denied', {
					event: 'collaboration_access_denied',
					userId: req.userId,
					collaborationId,
					path: req.path,
					method: req.method,
					ip: req.ip,
					timestamp: new Date().toISOString(),
				});

				res.status(403).json({
					success: false,
					message: AUTH_ERRORS.NOT_COLLABORATION_PARTICIPANT,
				});
				return;
			}

			req.resource = collaboration;

			logger.info('[Authorization] Collaboration access granted', {
				event: 'collaboration_access_granted',
				userId: req.userId,
				collaborationId,
				path: req.path,
			});

			next();
		} catch (error) {
			logger.error('[Authorization] Collaboration access check error', {
				event: 'collaboration_check_error',
				error: error instanceof Error ? error.message : String(error),
				userId: req.userId,
				path: req.path,
				timestamp: new Date().toISOString(),
			});

			res.status(500).json({
				success: false,
				message: AUTH_ERRORS.AUTHORIZATION_CHECK_ERROR,
			});
		}
	};
};
