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
	// Login & Logout
	LOGIN_SUCCESS: '✅ Connexion réussie ! Bienvenue sur MonHubImmo',
	LOGIN_ERROR: '❌ Erreur lors de la connexion',
	LOGOUT_SUCCESS: '👋 Déconnexion réussie',

	// Login-specific errors
	INVALID_CREDENTIALS: '❌ Email ou mot de passe incorrect',
	EMAIL_NOT_VERIFIED:
		'📧 Veuillez vérifier votre email avant de vous connecter',
	ACCOUNT_NOT_FOUND: '❌ Aucun compte trouvé avec cet email',
	ACCOUNT_LOCKED:
		'🔐 Compte verrouillé temporairement suite à plusieurs tentatives échouées',
	ACCOUNT_LOCKED_WITH_TIME: (minutes: number) =>
		`🔐 Compte verrouillé pour ${minutes} minute${minutes > 1 ? 's' : ''}. Réessayez plus tard.`,
	TOO_MANY_ATTEMPTS:
		'⚠️ Trop de tentatives échouées. Compte verrouillé pour 30 minutes.',

	// Signup & Verification
	SIGNUP_SUCCESS: '🎉 Inscription réussie ! Vérifiez votre email',
	SIGNUP_ERROR: "❌ Erreur lors de l'inscription",
	EMAIL_ALREADY_EXISTS: '❌ Un compte existe déjà avec cet email',
	EMAIL_VERIFIED: '✅ Email vérifié avec succès ! Bienvenue',
	EMAIL_VERIFICATION_ERROR: "❌ Erreur lors de la vérification de l'email",
	INVALID_VERIFICATION_CODE: '❌ Code de vérification invalide ou expiré',
	CODE_RESENT: '📧 Code de vérification renvoyé',
	CODE_RESENT_ERROR: "❌ Erreur lors de l'envoi du code",
	VERIFICATION_CODE_EXPIRED:
		'⏱️ Code expiré. Un nouveau code vous a été envoyé',

	// Profile
	PROFILE_UPDATED: '✅ Profil mis à jour avec succès',
	PROFILE_UPDATE_ERROR: '❌ Erreur lors de la mise à jour du profil',
	PROFILE_COMPLETED: '🎉 Profil complété avec succès !',
	PROFILE_COMPLETE_ERROR: '❌ Erreur lors de la complétion du profil',
	PROFILE_IMAGE_UPLOAD_ERROR: "❌ Erreur lors du téléchargement de l'image",
	IDENTITY_CARD_UPLOAD_ERROR:
		"❌ Erreur lors du téléchargement de la carte d'identité",

	// Password
	FORGOT_PASSWORD_SUCCESS: '📧 Email de réinitialisation envoyé',
	FORGOT_PASSWORD_ERROR: "❌ Erreur lors de l'envoi de l'email",
	PASSWORD_RESET_SUCCESS: '✅ Mot de passe réinitialisé avec succès',
	PASSWORD_RESET_ERROR: '❌ Erreur lors de la réinitialisation',
	PASSWORD_CHANGED: '✅ Mot de passe changé avec succès',
	PASSWORD_MISMATCH: '❌ Les mots de passe ne correspondent pas',
	PASSWORD_TOO_WEAK:
		'❌ Mot de passe trop faible. Minimum 8 caractères requis',
	PASSWORD_SAME_AS_OLD:
		"❌ Le nouveau mot de passe doit être différent de l'ancien",
	PASSWORD_IN_HISTORY:
		'🔒 Ce mot de passe a déjà été utilisé récemment. Veuillez en choisir un nouveau pour votre sécurité.',
	INVALID_RESET_CODE: '❌ Code de réinitialisation invalide ou expiré',

	// Validation & Errors
	NO_CHANGES_DETECTED: 'ℹ️ Aucune modification détectée',
	AGENT_ONLY_ACCESS: '⚠️ Cette page est réservée aux agents',
	VALIDATION_ERROR: '⚠️ Veuillez corriger les erreurs',
	MISSING_REQUIRED_FIELDS: '⚠️ Veuillez remplir tous les champs obligatoires',
	INVALID_EMAIL_FORMAT: "❌ Format d'email invalide",
	INVALID_PHONE_FORMAT: '❌ Format de téléphone invalide',
	SESSION_EXPIRED: '⏱️ Session expirée, veuillez vous reconnecter',
	UNAUTHORIZED: '� Accès non autorisé',
	NETWORK_ERROR: '📡 Erreur de connexion. Vérifiez votre connexion internet',
	SERVER_ERROR: '⚠️ Erreur serveur. Veuillez réessayer plus tard',

	// Redirects & Loading
	REDIRECTING: '🔄 Redirection en cours...',
	LOADING: '⏳ Chargement...',
	CHECKING_AUTH: '🔍 Vérification...',
	PROCESSING: '⏳ Traitement en cours...',
	UPLOADING: '📤 Téléchargement en cours...',
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
	PHONE: 'Téléphone * (ex: 06 12 34 56 78)',
	PHONE_SIMPLE: '06 12 34 56 78',

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
	CITIES: 'Dinan, Saint-Malo, Dinard (séparées par des virgules)',

	// Bio
	BIO: 'Présentez-vous en quelques mots...',

	// Email forms
	YOUR_EMAIL: 'Votre adresse email',
} as const;

// ============================================================================
// FIELD NAME TRANSLATIONS (for validation error messages)
// ============================================================================

export const FIELD_TRANSLATIONS: Record<string, string> = {
	// Basic fields
	email: 'Email',
	password: 'Mot de passe',
	confirmPassword: 'Confirmation du mot de passe',
	newPassword: 'Nouveau mot de passe',
	currentPassword: 'Mot de passe actuel',
	firstName: 'Prénom',
	lastName: 'Nom',
	phone: 'Téléphone',
	userType: 'Type de compte',

	// Professional fields
	carteT: 'Carte T',
	siren: 'SIREN',
	rsac: 'RSAC',
	certificateRef: 'Référence du certificat',
	siret: 'SIRET',
	yearsExperience: "Années d'expérience",

	// Location fields
	city: 'Ville',
	postalCode: 'Code postal',
	cities: 'Villes',

	// Other fields
	bio: 'Biographie',
	verificationCode: 'Code de vérification',
	resetCode: 'Code de réinitialisation',

	// Fallback
	Field: 'Champ',
} as const;
