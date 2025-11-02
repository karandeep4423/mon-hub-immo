/**
 * HTTP Status Codes
 * Centralized status code constants
 */

// ============================================================================
// SUCCESS CODES (2xx)
// ============================================================================

export const HTTP_STATUS = {
	// Success
	OK: 200,
	CREATED: 201,
	NO_CONTENT: 204,

	// Client Errors
	BAD_REQUEST: 400,
	UNAUTHORIZED: 401,
	FORBIDDEN: 403,
	NOT_FOUND: 404,
	CONFLICT: 409,
	UNPROCESSABLE_ENTITY: 422,

	// Server Errors
	INTERNAL_SERVER_ERROR: 500,
	BAD_GATEWAY: 502,
	SERVICE_UNAVAILABLE: 503,
} as const;

// ============================================================================
// STATUS MESSAGES (Localized)
// ============================================================================

export const STATUS_MESSAGES = {
	[HTTP_STATUS.UNAUTHORIZED]: 'Non autorisé',
	[HTTP_STATUS.FORBIDDEN]: 'Accès refusé',
	[HTTP_STATUS.NOT_FOUND]: 'Ressource introuvable',
	[HTTP_STATUS.INTERNAL_SERVER_ERROR]: 'Erreur serveur',
	[HTTP_STATUS.BAD_REQUEST]: 'Requête invalide',
	[HTTP_STATUS.CONFLICT]: 'Conflit',
	[HTTP_STATUS.SERVICE_UNAVAILABLE]: 'Service indisponible',
} as const;
