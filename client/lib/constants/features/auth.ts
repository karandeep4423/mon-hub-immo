/**
 * Authentication Feature Constants
 * All auth-related constants: routes, errors, messages, validation rules
 */

// ============================================================================
// ROUTES
// ============================================================================

export const AUTH_ROUTES = {
	LOGIN: '/auth/login',
	SIGNUP: '/auth/signup',
	WELCOME: '/auth/welcome',
	COMPLETE_PROFILE: '/auth/complete-profile',
	VERIFY_EMAIL: '/auth/verify-email',
	FORGOT_PASSWORD: '/auth/forgot-password',
	RESET_PASSWORD: '/auth/reset-password',
} as const;

// ============================================================================
// API ENDPOINTS
// ============================================================================

export const AUTH_ENDPOINTS = {
	SIGNUP: '/auth/signup',
	LOGIN: '/auth/login',
	VERIFY_EMAIL: '/auth/verify-email',
	RESEND_VERIFICATION: '/auth/resend-verification',
	FORGOT_PASSWORD: '/auth/forgot-password',
	RESET_PASSWORD: '/auth/reset-password',
	GET_PROFILE: '/auth/profile',
	UPDATE_PROFILE: '/auth/profile',
	COMPLETE_PROFILE: '/auth/complete-profile',
	UPDATE_PREFERENCES: '/auth/search-preferences',
} as const;

// ============================================================================
// ERROR MESSAGES
// ============================================================================

export const AUTH_ERRORS = {
	SIGNUP_FAILED: "Erreur lors de l'inscription",
	LOGIN_FAILED: 'Erreur lors de la connexion',
	VERIFY_EMAIL_FAILED: "Erreur lors de la vérification de l'email",
	RESEND_CODE_FAILED: "Erreur lors de l'envoi du code",
	FORGOT_PASSWORD_FAILED:
		'Erreur lors de la réinitialisation du mot de passe',
	RESET_PASSWORD_FAILED: 'Erreur lors de la réinitialisation du mot de passe',
	GET_PROFILE_FAILED: 'Erreur lors de la récupération du profil',
	UPDATE_PROFILE_FAILED: 'Erreur lors de la mise à jour du profil',
	COMPLETE_PROFILE_FAILED: 'Erreur lors de la complétion du profil',
	UPDATE_PREFERENCES_FAILED: 'Erreur lors de la mise à jour des préférences',
} as const;

// ============================================================================
// TOAST MESSAGES
// ============================================================================

export const AUTH_TOAST_MESSAGES = {
	LOGIN_SUCCESS: 'Connexion réussie',
	LOGIN_ERROR: 'Erreur lors de la connexion',
	LOGOUT_SUCCESS: 'Déconnexion réussie',
	SIGNUP_SUCCESS: 'Inscription réussie ! Vérifiez votre email.',
	SIGNUP_ERROR: "Erreur lors de l'inscription",
	EMAIL_VERIFIED: 'Email vérifié avec succès',
	EMAIL_VERIFICATION_ERROR: "Erreur lors de la vérification de l'email",
	PROFILE_UPDATED: 'Profil mis à jour avec succès',
	PROFILE_UPDATE_ERROR: 'Erreur lors de la mise à jour du profil',
	PROFILE_COMPLETED: 'Profil complété avec succès !',
	PASSWORD_RESET_SUCCESS: 'Mot de passe réinitialisé avec succès',
	PASSWORD_RESET_ERROR: 'Erreur lors de la réinitialisation du mot de passe',
	NO_CHANGES_DETECTED: 'Aucune modification détectée',
	AGENT_ONLY_ACCESS: 'Cette page est réservée aux agents',
	VALIDATION_ERROR: 'Veuillez corriger les erreurs avant de continuer',
} as const;

// ============================================================================
// UI TEXT
// ============================================================================

export const AUTH_UI_TEXT = {
	// Buttons
	LOGIN: 'Se connecter',
	SIGNUP: "S'inscrire",
	LOGOUT: 'Déconnexion',
	CONTINUE: 'Continuer',
	SUBMIT: 'Valider',
	CANCEL: 'Annuler',
	BACK: 'Retour',

	// Form labels
	EMAIL: 'Email',
	PASSWORD: 'Mot de passe',
	CONFIRM_PASSWORD: 'Confirmer le mot de passe',
	FIRST_NAME: 'Prénom',
	LAST_NAME: 'Nom',
	PHONE: 'Téléphone',

	// Links
	FORGOT_PASSWORD: 'Mot de passe oublié ?',
	ALREADY_HAVE_ACCOUNT: 'Déjà inscrit ?',
	NO_ACCOUNT: 'Pas encore de compte ?',

	// User type titles
	agentTitle: 'Agent Immobilier',
	providerTitle: "Apporteur d'affaires",

	// Form placeholders
	emailPlaceholder: 'E-mail',
	passwordPlaceholder: 'Mot de passe',

	// Login-specific
	forgotPassword: 'Mot de passe oublié ?',
	loginButton: 'Connexion',
	noAccount: 'Pas encore inscrit ?',
	signUpHere: 'Créer un compte',

	// Messages
	REDIRECTING: 'Redirection...',
	LOADING: 'Chargement...',
	CHECKING_AUTH: 'Vérification...',
} as const;

// ============================================================================
// VALIDATION RULES
// ============================================================================

export const AUTH_VALIDATION = {
	PASSWORD_MIN_LENGTH: 8,
	PASSWORD_MAX_LENGTH: 128,
	NAME_MIN_LENGTH: 2,
	NAME_MAX_LENGTH: 50,
	PHONE_MIN_LENGTH: 10,
	PHONE_MAX_LENGTH: 20,
	BIO_MAX_LENGTH: 1000,
} as const;

// ============================================================================
// USER TYPES
// ============================================================================

export const USER_TYPES = {
	AGENT: 'agent',
	APPORTEUR: 'apporteur',
} as const;

export type UserType = (typeof USER_TYPES)[keyof typeof USER_TYPES];

// ============================================================================
// FORM PLACEHOLDERS
// ============================================================================

export const AUTH_PLACEHOLDERS = {
	// Basic info
	FIRST_NAME: 'Prénom *',
	LAST_NAME: 'Nom *',
	EMAIL: 'E-mail professionnel *',
	PHONE: 'Téléphone * (ex: 0123456789)',
	PHONE_SIMPLE: '0123456789',

	// Password
	PASSWORD: 'Mot de passe *',
	CONFIRM_PASSWORD: 'Confirmer le mot de passe *',
	NEW_PASSWORD: 'Nouveau mot de passe',

	// Verification
	VERIFICATION_CODE: 'Code à 6 chiffres',

	// Professional info (Agent)
	CARTE_T: 'Numéro de carte T',
	SIREN: 'Numéro SIREN',
	RSAC: 'Numéro RSAC',
	CERTIFICATE_REF: 'Référence du certificat',
	SIRET: '12345678901234',
	YEARS_EXPERIENCE: '5',

	// Location
	SEARCH_CITY: 'Rechercher une ville...',
	POSTAL_CODE: '22100',
	CITIES: 'Dinan, Saint-Malo, Dinard...',

	// Bio
	BIO: 'Présentez-vous en quelques mots...',

	// Email forms
	YOUR_EMAIL: 'Votre adresse email',
} as const;
