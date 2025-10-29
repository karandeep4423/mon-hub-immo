/**
 * Collaboration Feature Constants
 * All collaboration-related constants: statuses, steps, routes, messages, UI text
 */

// ============================================================================
// COLLABORATION STATUSES
// ============================================================================

/**
 * Collaboration Status Values (lowercase - matches database)
 * Use these for comparisons and API calls
 */
export const COLLABORATION_STATUS_VALUES = {
	PENDING: 'pending',
	ACCEPTED: 'accepted',
	ACTIVE: 'active',
	COMPLETED: 'completed',
	REJECTED: 'rejected',
	CANCELLED: 'cancelled',
} as const;

/**
 * Collaboration Status Labels (French display text)
 * @deprecated Use COLLABORATION_STATUS_CONFIG for display labels
 */
export const COLLABORATION_STATUSES = {
	PENDING: 'En attente',
	ACCEPTED: 'Accepté',
	ACTIVE: 'Actif',
	COMPLETED: 'Terminé',
	REJECTED: 'Refusé',
	CANCELLED: 'Annulé',
} as const;

export type CollaborationStatus =
	(typeof COLLABORATION_STATUS_VALUES)[keyof typeof COLLABORATION_STATUS_VALUES];

/**
 * Collaboration Status Configuration
 */
export interface StatusConfig {
	label: string;
	variant: 'success' | 'warning' | 'error' | 'info' | 'default';
	className: string;
}

export const COLLABORATION_STATUS_CONFIG: Record<string, StatusConfig> = {
	pending: {
		label: 'En attente',
		variant: 'warning',
		className: 'bg-yellow-100 text-yellow-800',
	},
	accepted: {
		label: 'Acceptée',
		variant: 'info',
		className: 'bg-blue-100 text-blue-800',
	},
	active: {
		label: 'Active',
		variant: 'success',
		className: 'bg-green-100 text-green-800',
	},
	completed: {
		label: 'Complétée',
		variant: 'info',
		className: 'bg-blue-100 text-blue-800',
	},
	rejected: {
		label: 'Refusée',
		variant: 'error',
		className: 'bg-red-100 text-red-800',
	},
	cancelled: {
		label: 'Annulée',
		variant: 'error',
		className: 'bg-red-100 text-red-800',
	},
	terminated: {
		label: 'Résiliée',
		variant: 'error',
		className: 'bg-red-100 text-red-800',
	},
} as const;

// ============================================================================
// COLLABORATION PROGRESS STEPS
// ============================================================================

export const STEP_STATUS_VALUES = {
	IN_PROGRESS: 'in-progress',
	PENDING: 'pending',
	COMPLETED: 'completed',
} as const;

export type ProgressStep =
	| 'accord_collaboration'
	| 'premier_contact'
	| 'visite_programmee'
	| 'visite_realisee'
	| 'retour_client'
	| 'offre_en_cours'
	| 'negociation_en_cours'
	| 'compromis_signe'
	| 'signature_notaire'
	| 'affaire_conclue';

export const STEP_ORDER: ProgressStep[] = [
	'accord_collaboration',
	'premier_contact',
	'visite_programmee',
	'visite_realisee',
	'retour_client',
	'offre_en_cours',
	'negociation_en_cours',
	'compromis_signe',
	'signature_notaire',
	'affaire_conclue',
] as const;

export const STEP_LABELS: Record<ProgressStep, string> = {
	accord_collaboration: 'Accord de collaboration',
	premier_contact: 'Premier contact',
	visite_programmee: 'Visite programmée',
	visite_realisee: 'Visite réalisée',
	retour_client: 'Retour client',
	offre_en_cours: 'Offre en cours',
	negociation_en_cours: 'Négociation en cours',
	compromis_signe: 'Compromis signé',
	signature_notaire: 'Signature notaire',
	affaire_conclue: 'Affaire conclue',
} as const;

// ============================================================================
// UI TEXT
// ============================================================================

export const COLLABORATION_UI_TEXT = {
	// Page titles
	title: 'Collaboration',
	myCollaborations: 'Mes collaborations',
	pendingCollaborations: 'Collaborations en attente',
	activeCollaborations: 'Collaborations actives',

	// Progress tracking
	lastUpdate: 'Dernière mise à jour',
	currentStep: 'Étape actuelle',
	progressTracking: 'Suivi de progression',

	// Contract
	contractContent: 'Contenu du contrat',
	additionalTerms: 'Conditions supplémentaires',
	signature: 'Signature',
	noContentDefined: 'Aucun contenu défini',
	signContract: 'Signer le contrat',
	viewContract: 'Voir le contrat',

	// Actions
	propose: 'Proposer une collaboration',
	accept: 'Accepter',
	reject: 'Refuser',
	cancel: 'Annuler',
	complete: 'Complété',
	validateStep: "Valider l'étape",

	// Status messages
	loading: 'Chargement des collaborations...',
	noCollaborations: 'Aucune collaboration pour le moment',
	waitingForSignature: "En attente de signature de l'autre partie",
	bothPartiesSigned: 'Les deux parties ont signé le contrat',

	// Empty states
	noActiveCollaborations: 'Aucune collaboration active',
	noPendingCollaborations: 'Aucune collaboration en attente',
} as const;

// ============================================================================
// TOAST MESSAGES
// ============================================================================

export const COLLABORATION_TOAST_MESSAGES = {
	// Proposal
	PROPOSE_SUCCESS: 'Collaboration proposée avec succès',
	PROPOSE_ERROR: 'Erreur lors de la proposition de collaboration',

	// Accept/Reject
	ACCEPT_SUCCESS: 'Collaboration acceptée',
	ACCEPT_ERROR: "Erreur lors de l'acceptation de la collaboration",
	REJECT_SUCCESS: 'Collaboration refusée',
	REJECT_ERROR: 'Erreur lors du refus de la collaboration',

	// Cancel/Complete
	CANCEL_SUCCESS: 'Collaboration annulée',
	CANCEL_ERROR: "Erreur lors de l'annulation de la collaboration",
	COMPLETE_SUCCESS: 'Collaboration complétée',
	COMPLETE_ERROR: 'Erreur lors de la finalisation',

	// Notes
	NOTE_ADDED: 'Note ajoutée',
	NOTE_ADD_ERROR: "Erreur lors de l'ajout de la note",

	// Progress tracking
	PROGRESS_UPDATED: 'Statut de progression mis à jour',
	PROGRESS_UPDATE_ERROR: 'Erreur lors de la mise à jour du statut',

	// Contract signing
	CONTRACT_SIGNED: 'Contrat signé',
	CONTRACT_SIGN_ERROR: 'Erreur lors de la signature du contrat',

	// Step validation
	STEP_VALIDATED: 'Étape validée avec succès',
	STEP_VALIDATION_ERROR: "Erreur lors de la validation de l'étape",

	// Status updates
	STATUS_UPDATE_SUCCESS: 'Statut global mis à jour',
	STATUS_UPDATE_ERROR: 'Erreur lors de la mise à jour du statut',

	// Fetch
	FETCH_ERROR: 'Erreur lors du chargement des collaborations',
} as const;

// ============================================================================
// CONTRACT MESSAGES
// ============================================================================

export const CONTRACT_TOAST_MESSAGES = {
	FETCH_ERROR: 'Erreur lors du chargement du contrat',
	UPDATE_SUCCESS: 'Contrat mis à jour avec succès',
	UPDATE_ERROR: 'Erreur lors de la mise à jour du contrat',
	UPDATE_REQUIRES_RESIGN:
		'Le contrat a été modifié. Les deux parties doivent signer à nouveau.',
	SIGN_SUCCESS_BOTH:
		'Félicitations ! Le contrat a été signé par les deux parties. La collaboration est maintenant active.',
	SIGN_SUCCESS_WAITING:
		"Contrat signé avec succès. En attente de la signature de l'autre partie.",
	SIGN_ERROR: 'Erreur lors de la signature du contrat',
	NOT_FOUND: 'Contrat non trouvé ou données incomplètes',
} as const;

// ============================================================================
// API ENDPOINTS
// ============================================================================

export const COLLABORATION_ENDPOINTS = {
	LIST: '/collaborations',
	CREATE: '/collaborations',
	GET_BY_ID: (id: string) => `/collaborations/${id}`,
	UPDATE: (id: string) => `/collaborations/${id}`,
	DELETE: (id: string) => `/collaborations/${id}`,
	ACCEPT: (id: string) => `/collaborations/${id}/accept`,
	REJECT: (id: string) => `/collaborations/${id}/reject`,
	CANCEL: (id: string) => `/collaborations/${id}/cancel`,
	COMPLETE: (id: string) => `/collaborations/${id}/complete`,
	UPDATE_PROGRESS: (id: string) => `/collaborations/${id}/progress`,
	BY_PROPERTY: (propertyId: string) =>
		`/collaborations/property/${propertyId}`,
	BY_SEARCH_AD: (searchAdId: string) =>
		`/collaborations/search-ad/${searchAdId}`,
} as const;

export const CONTRACT_ENDPOINTS = {
	GET: (collaborationId: string) => `/contracts/${collaborationId}`,
	UPDATE: (collaborationId: string) => `/contracts/${collaborationId}`,
	SIGN: (collaborationId: string) => `/contracts/${collaborationId}/sign`,
	DOWNLOAD: (collaborationId: string) =>
		`/contracts/${collaborationId}/download`,
} as const;

// ============================================================================
// ROUTES
// ============================================================================

export const COLLABORATION_ROUTES = {
	LIST: '/collaborations',
	DETAIL: (id: string) => `/collaborations/${id}`,
	MY_COLLABORATIONS: '/dashboard/my-collaborations',
	PROPOSE: '/collaborations/propose',
} as const;

// ============================================================================
// ERROR MESSAGES
// ============================================================================

export const COLLABORATION_ERRORS = {
	NOT_FOUND: 'Collaboration non trouvée',
	LOADING_FAILED: 'Erreur lors du chargement de la collaboration',
	STATUS_UPDATE_FAILED: 'Erreur lors de la mise à jour du statut',
	PROGRESS_UPDATE_FAILED: 'Erreur lors de la mise à jour du progrès',
} as const;

// ============================================================================
// LOADING MESSAGES
// ============================================================================

export const COLLABORATION_LOADING = {
	PAGE: 'Chargement...',
	DETAILS: 'Chargement des détails de la collaboration...',
} as const;

// ============================================================================
// CONTRACT UI TEXT
// ============================================================================

export const CONTRACT_UI_TEXT = {
	// Titles & Headers
	TITLE: 'Contrat de Collaboration',

	// Status Labels
	YOU_SIGNED: '✓ Vous avez signé',
	PARTNER_SIGNED: '✓ Partenaire a signé',

	// Warning Messages
	MODIFIED_TITLE: 'Le contrat a été modifié',
	MODIFIED_DESCRIPTION: 'Les deux parties doivent signer à nouveau.',

	// Section Headers
	OWNER_SECTION: 'Propriétaire',
	COLLABORATOR_SECTION: 'Apporteur',
	CONTRACT_CONTENT_SECTION: 'Contenu du Contrat',
	TERMS_SECTION: 'Conditions Supplémentaires',

	// Button Labels
	CLOSE_BUTTON: 'Fermer',
	EDIT_BUTTON: 'Modifier le contrat',
	CANCEL_EDIT_BUTTON: 'Annuler',
	SAVE_BUTTON: 'Enregistrer les modifications',
	SIGN_BUTTON: 'Signer le contrat',

	// Dialog
	SIGN_DIALOG_TITLE: 'Signer le contrat ?',
	SIGN_DIALOG_DESCRIPTION:
		'Êtes-vous sûr de vouloir signer ce contrat ? Cette action sera enregistrée.',
	SIGN_CONFIRM_TEXT: 'Oui, signer',
	SIGN_CANCEL_TEXT: 'Non, revenir',

	// Errors
	DEFAULT_ERROR: 'Une erreur est survenue',
} as const;

// ============================================================================
// CONFIRMATION DIALOGS
// ============================================================================

export const COLLABORATION_CONFIRMATION_DIALOGS = {
	// Cancel Collaboration
	CANCEL_TITLE: 'Annuler la collaboration ?',
	CANCEL_DESCRIPTION:
		'Cette action annulera la collaboration en cours. Voulez-vous continuer ?',
	CANCEL_PENDING_DESCRIPTION:
		'Cette action annulera la collaboration en attente. Voulez-vous continuer ?',
	CANCEL_CONFIRM: 'Oui, annuler',
	CANCEL_CANCEL: 'Non, revenir',

	// Complete Collaboration
	COMPLETE_TITLE: 'Marquer la collaboration comme complétée ?',
	COMPLETE_DESCRIPTION:
		'Cette action marquera la collaboration comme complétée. Voulez-vous continuer ?',
	COMPLETE_CONFIRM: 'Oui, complété',
	COMPLETE_CANCEL: 'Non, revenir',
} as const;

// ============================================================================
// FORM PLACEHOLDERS
// ============================================================================

export const COLLABORATION_FORM_PLACEHOLDERS = {
	// Activity Manager
	ACTIVITY_NOTE: 'Ajouter une note sur cette collaboration...',

	// Progress Status Modal
	STATUS_UPDATE_NOTE: 'Ajouter une note sur cette mise à jour...',

	// Contract Management
	CONTRACT_CONTENT: 'Saisissez le contenu du contrat...',
	CONTRACT_TERMS: 'Conditions supplémentaires...',
} as const;
