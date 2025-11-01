/**
 * Frontend Authorization Utilities
 * Reusable functions for client-side authorization checks
 * Follows SRP (Single Responsibility Principle) and KISS
 */

import { User } from '@/types/auth';
import {
	PROTECTED_ROUTES,
	PUBLIC_ROUTES,
	AUTH_ROUTES,
	DYNAMIC_PROTECTED_PATTERNS,
	REDIRECT_PATHS,
} from '@/lib/config/routes.config';

/**
 * Check if user has a specific role
 * @param user - Current user object
 * @param allowedRoles - Array of allowed roles
 * @returns true if user has one of the allowed roles
 */
export const hasRequiredRole = (
	user: User | null | undefined,
	allowedRoles: Array<'agent' | 'apporteur'>,
): boolean => {
	if (!user || !user.userType) return false;
	return allowedRoles.includes(user.userType);
};

/**
 * Check if user is the owner of a resource
 * @param user - Current user object
 * @param resourceOwnerId - ID of the resource owner
 * @returns true if user owns the resource
 */
export const isResourceOwner = (
	user: User | null | undefined,
	resourceOwnerId: string | undefined,
): boolean => {
	if (!user || !resourceOwnerId) return false;
	return user.id === resourceOwnerId || user._id === resourceOwnerId;
};

/**
 * Check if user can access a specific route
 * @param path - Route path to check
 * @param isAuthenticated - Whether user is authenticated
 * @returns true if user can access the route
 */
export const canAccessRoute = (
	path: string,
	isAuthenticated: boolean,
): boolean => {
	// Public routes are always accessible
	if ((PUBLIC_ROUTES as readonly string[]).includes(path)) return true;

	// Protected routes require authentication
	if ((PROTECTED_ROUTES as readonly string[]).includes(path))
		return isAuthenticated;

	// Check dynamic protected patterns
	const isDynamicProtected = DYNAMIC_PROTECTED_PATTERNS.some((pattern) =>
		path.startsWith(pattern),
	);
	if (isDynamicProtected) return isAuthenticated;

	// Default: allow access
	return true;
};

/**
 * Check if user should be redirected from auth pages
 * @param path - Current route path
 * @param isAuthenticated - Whether user is authenticated
 * @returns true if user should be redirected
 */
export const shouldRedirectFromAuth = (
	path: string,
	isAuthenticated: boolean,
): boolean => {
	if (!isAuthenticated) return false;
	return (AUTH_ROUTES as readonly string[]).includes(path);
};

/**
 * Get redirect path based on authentication state
 * @param isAuthenticated - Whether user is authenticated
 * @returns Redirect path
 */
export const getRedirectPath = (isAuthenticated: boolean): string => {
	return isAuthenticated ? REDIRECT_PATHS.DASHBOARD : REDIRECT_PATHS.LOGIN;
};

/**
 * Check if user can create properties (agents only)
 * @param user - Current user object
 * @returns true if user can create properties
 */
export const canCreateProperty = (user: User | null | undefined): boolean => {
	return hasRequiredRole(user, ['agent']);
};

/**
 * Check if user can create search ads (apporteurs only)
 * @param user - Current user object
 * @returns true if user can create search ads
 */
export const canCreateSearchAd = (user: User | null | undefined): boolean => {
	return hasRequiredRole(user, ['apporteur']);
};

/**
 * Check if user can edit a resource
 * @param user - Current user object
 * @param resourceOwnerId - ID of the resource owner
 * @returns true if user can edit the resource
 */
export const canEditResource = (
	user: User | null | undefined,
	resourceOwnerId: string | undefined,
): boolean => {
	return isResourceOwner(user, resourceOwnerId);
};

/**
 * Check if user can delete a resource
 * @param user - Current user object
 * @param resourceOwnerId - ID of the resource owner
 * @returns true if user can delete the resource
 */
export const canDeleteResource = (
	user: User | null | undefined,
	resourceOwnerId: string | undefined,
): boolean => {
	return isResourceOwner(user, resourceOwnerId);
};

/**
 * Check if user is a collaboration participant
 * @param user - Current user object
 * @param postOwnerId - ID of the post owner
 * @param collaboratorId - ID of the collaborator
 * @returns true if user is a participant
 */
export const isCollaborationParticipant = (
	user: User | null | undefined,
	postOwnerId: string | undefined,
	collaboratorId: string | undefined,
): boolean => {
	if (!user) return false;

	const userId = user.id || user._id;
	const isOwner = userId === postOwnerId;
	const isCollaborator = userId === collaboratorId;

	return isOwner || isCollaborator;
};

/**
 * Check if user can sign a collaboration contract
 * @param user - Current user object
 * @param postOwnerId - ID of the post owner
 * @param collaboratorId - ID of the collaborator
 * @param collaborationStatus - Current collaboration status
 * @returns true if user can sign
 */
export const canSignContract = (
	user: User | null | undefined,
	postOwnerId: string | undefined,
	collaboratorId: string | undefined,
	collaborationStatus?: string,
): boolean => {
	if (collaborationStatus !== 'accepted') return false;
	return isCollaborationParticipant(user, postOwnerId, collaboratorId);
};

/**
 * Get user's display name
 * @param user - User object
 * @returns Display name
 */
export const getUserDisplayName = (user: User | null | undefined): string => {
	if (!user) return 'Invité';
	return `${user.firstName} ${user.lastName}`.trim() || user.email;
};

/**
 * Get user's role label (French)
 * @param userType - User type
 * @returns Role label in French
 */
export const getUserRoleLabel = (
	userType: User['userType'] | undefined,
): string => {
	switch (userType) {
		case 'agent':
			return 'Agent Immobilier';
		case 'apporteur':
			return "Apporteur d'Affaires";
		default:
			return 'Utilisateur';
	}
};

/**
 * Check if user profile is complete
 * @param user - User object
 * @returns true if profile is complete
 */
export const isProfileComplete = (user: User | null | undefined): boolean => {
	if (!user) return false;
	return user.profileCompleted && user.isEmailVerified;
};

/**
 * Check if user needs to complete profile
 * @param user - User object
 * @returns true if profile needs completion
 */
export const needsProfileCompletion = (
	user: User | null | undefined,
): boolean => {
	if (!user) return false;
	return !user.profileCompleted || !user.isEmailVerified;
};

/**
 * Authorization error messages (French)
 */
export const AUTH_ERROR_MESSAGES = {
	NOT_AUTHENTICATED: 'Vous devez être connecté pour accéder à cette page',
	NOT_AUTHORIZED: "Vous n'avez pas la permission d'accéder à cette ressource",
	NOT_OWNER: 'Seul le propriétaire peut effectuer cette action',
	INSUFFICIENT_ROLE: "Votre rôle ne vous permet pas d'effectuer cette action",
	NOT_PARTICIPANT:
		'Vous devez être participant à cette collaboration pour y accéder',
	PROFILE_INCOMPLETE:
		'Veuillez compléter votre profil pour accéder à cette fonctionnalité',
	AGENTS_ONLY: 'Cette fonctionnalité est réservée aux agents immobiliers',
	APPORTEURS_ONLY:
		"Cette fonctionnalité est réservée aux apporteurs d'affaires",
} as const;

/**
 * Get appropriate error message for authorization failure
 * @param reason - Reason for authorization failure
 * @returns Error message in French
 */
export const getAuthErrorMessage = (
	reason:
		| 'not_authenticated'
		| 'not_authorized'
		| 'not_owner'
		| 'insufficient_role'
		| 'not_participant'
		| 'profile_incomplete'
		| 'agents_only'
		| 'apporteurs_only',
): string => {
	const messageMap: Record<typeof reason, string> = {
		not_authenticated: AUTH_ERROR_MESSAGES.NOT_AUTHENTICATED,
		not_authorized: AUTH_ERROR_MESSAGES.NOT_AUTHORIZED,
		not_owner: AUTH_ERROR_MESSAGES.NOT_OWNER,
		insufficient_role: AUTH_ERROR_MESSAGES.INSUFFICIENT_ROLE,
		not_participant: AUTH_ERROR_MESSAGES.NOT_PARTICIPANT,
		profile_incomplete: AUTH_ERROR_MESSAGES.PROFILE_INCOMPLETE,
		agents_only: AUTH_ERROR_MESSAGES.AGENTS_ONLY,
		apporteurs_only: AUTH_ERROR_MESSAGES.APPORTEURS_ONLY,
	};

	return messageMap[reason] || AUTH_ERROR_MESSAGES.NOT_AUTHORIZED;
};

/**
 * Check multiple authorization conditions
 * Returns first failed condition or null if all pass
 * @param checks - Array of authorization checks
 * @returns Error reason or null
 */
export const checkAuthorization = (
	checks: Array<{
		condition: boolean;
		reason:
			| 'not_authenticated'
			| 'not_authorized'
			| 'not_owner'
			| 'insufficient_role'
			| 'not_participant'
			| 'profile_incomplete'
			| 'agents_only'
			| 'apporteurs_only';
	}>,
): string | null => {
	for (const check of checks) {
		if (!check.condition) {
			return getAuthErrorMessage(check.reason);
		}
	}
	return null;
};
