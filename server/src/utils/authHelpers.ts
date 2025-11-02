/**
 * Authorization Helpers
 * Reusable utility functions for authorization checks
 * Follows SRP (Single Responsibility Principle) and DRY
 */

import { Types } from 'mongoose';

/**
 * Check if two IDs match (handles both string and ObjectId)
 * @param id1 - First ID (can be string, ObjectId, or object with _id)
 * @param id2 - Second ID (can be string, ObjectId, or object with _id)
 * @returns true if IDs match
 */
export const idsMatch = (
	id1: string | Types.ObjectId | { _id?: Types.ObjectId } | undefined,
	id2: string | Types.ObjectId | { _id?: Types.ObjectId } | undefined,
): boolean => {
	if (!id1 || !id2) return false;

	const getId = (
		id: string | Types.ObjectId | { _id?: Types.ObjectId },
	): string => {
		if (typeof id === 'string') return id;
		if (id instanceof Types.ObjectId) return id.toString();
		return id._id?.toString() || '';
	};

	return getId(id1) === getId(id2);
};

/**
 * Check if user is owner of a resource
 * @param userId - Current user's ID
 * @param resourceOwnerId - Resource owner's ID
 * @returns true if user is the owner
 */
export const isOwner = (
	userId: string | undefined,
	resourceOwnerId:
		| string
		| Types.ObjectId
		| { _id?: Types.ObjectId }
		| undefined,
): boolean => {
	if (!userId || !resourceOwnerId) return false;
	return idsMatch(userId, resourceOwnerId);
};

/**
 * Check if user has access to collaboration
 * User must be either post owner or collaborator
 * @param userId - Current user's ID
 * @param collaboration - Collaboration object
 * @returns true if user has access
 */
export const hasCollaborationAccess = (
	userId: string | undefined,
	collaboration: {
		postOwnerId?:
			| string
			| Types.ObjectId
			| { _id?: Types.ObjectId }
			| undefined;
		collaboratorId?:
			| string
			| Types.ObjectId
			| { _id?: Types.ObjectId }
			| undefined;
	},
): boolean => {
	if (!userId) return false;

	const isPostOwner = isOwner(userId, collaboration.postOwnerId);
	const isCollaborator = isOwner(userId, collaboration.collaboratorId);

	return isPostOwner || isCollaborator;
};

/**
 * Check if user has specific role(s)
 * @param userRole - User's current role
 * @param allowedRoles - Array of allowed roles
 * @returns true if user has one of the allowed roles
 */
export const hasRole = (
	userRole: 'agent' | 'apporteur' | undefined,
	allowedRoles: Array<'agent' | 'apporteur'>,
): boolean => {
	if (!userRole) return false;
	return allowedRoles.includes(userRole);
};

/**
 * Authorization error messages
 * Centralized error messages for consistent responses
 */
export const AUTH_ERRORS = {
	AUTHENTICATION_REQUIRED: 'Authentification requise',
	INSUFFICIENT_ROLE: 'Accès refusé - rôle insuffisant',
	RESOURCE_NOT_FOUND: 'Ressource non trouvée',
	MISSING_RESOURCE_ID: 'ID de ressource manquant',
	OWNERSHIP_REQUIRED:
		'Accès refusé - vous ne pouvez modifier que vos propres ressources',
	NOT_OWNER:
		'Accès refusé - vous ne pouvez modifier que vos propres ressources',
	COLLABORATION_ACCESS_REQUIRED:
		'Accès refusé - vous devez être propriétaire ou collaborateur',
	NOT_COLLABORATION_PARTICIPANT:
		'Accès refusé - vous devez être propriétaire ou collaborateur',
	AUTHORIZATION_ERROR: 'Erreur lors de la vérification des autorisations',
	AUTHORIZATION_CHECK_ERROR:
		'Erreur lors de la vérification des autorisations',
} as const;
