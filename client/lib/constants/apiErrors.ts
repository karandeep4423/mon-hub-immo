/**
 * API Error Messages Constants
 * Centralized error messages for all API services
 */

// Authentication Errors
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

// Search Ad Errors
export const SEARCH_AD_ERRORS = {
	CREATE_FAILED: "Erreur lors de la création de l'annonce de recherche",
	GET_MY_ADS_FAILED: 'Erreur lors de la récupération de vos annonces',
	GET_AD_FAILED: "Erreur lors de la récupération de l'annonce",
	UPDATE_FAILED: "Erreur lors de la mise à jour de l'annonce",
	UPDATE_STATUS_FAILED:
		"Erreur lors de la mise à jour du statut de l'annonce",
	DELETE_FAILED: "Erreur lors de la suppression de l'annonce",
	GET_ALL_FAILED: 'Erreur lors de la récupération des annonces',
} as const;

// Appointment Errors
export const APPOINTMENT_ERRORS = {
	CREATE_FAILED: 'Erreur lors de la création du rendez-vous',
	GET_MY_APPOINTMENTS_FAILED:
		'Erreur lors de la récupération des rendez-vous',
	GET_APPOINTMENT_FAILED: 'Erreur lors de la récupération du rendez-vous',
	UPDATE_STATUS_FAILED: 'Erreur lors de la mise à jour du rendez-vous',
	RESCHEDULE_FAILED: 'Erreur lors de la reprogrammation du rendez-vous',
	GET_STATS_FAILED: 'Erreur lors de la récupération des statistiques',
	GET_AVAILABILITY_FAILED:
		'Erreur lors de la récupération des disponibilités',
	UPDATE_AVAILABILITY_FAILED:
		'Erreur lors de la mise à jour des disponibilités',
	GET_SLOTS_FAILED: 'Erreur lors de la récupération des créneaux disponibles',
} as const;

// Collaboration Errors
export const COLLABORATION_ERRORS = {
	PROPOSE_FAILED: 'Erreur lors de la proposition de collaboration',
	GET_USER_COLLABS_FAILED:
		'Erreur lors de la récupération des collaborations',
	GET_PROPERTY_COLLABS_FAILED:
		'Erreur lors de la récupération des collaborations de la propriété',
	GET_AD_COLLABS_FAILED:
		"Erreur lors de la récupération des collaborations de l'annonce",
	RESPOND_FAILED: 'Erreur lors de la réponse à la collaboration',
	ADD_NOTE_FAILED: "Erreur lors de l'ajout de la note",
	CANCEL_FAILED: "Erreur lors de l'annulation de la collaboration",
	UPDATE_PROGRESS_FAILED:
		'Erreur lors de la mise à jour du statut de progression',
	SIGN_FAILED: 'Erreur lors de la signature du contrat',
	COMPLETE_FAILED: 'Erreur lors de la finalisation de la collaboration',
} as const;

// Contract Errors
export const CONTRACT_ERRORS = {
	GET_FAILED: 'Erreur lors de la récupération du contrat',
	UPDATE_FAILED: 'Erreur lors de la mise à jour du contrat',
	SIGN_FAILED: 'Erreur lors de la signature du contrat',
} as const;

// Chat Errors
export const CHAT_ERRORS = {
	GET_USERS_FAILED: 'Erreur lors de la récupération des conversations',
	GET_USER_FAILED: "Erreur lors de la récupération de l'utilisateur",
	GET_MESSAGES_FAILED: 'Erreur lors de la récupération des messages',
	SEND_MESSAGE_FAILED: "Erreur lors de l'envoi du message",
	UPLOAD_FILE_FAILED: 'Erreur lors du téléchargement du fichier',
	MARK_READ_FAILED: 'Erreur lors du marquage des messages comme lus',
	DELETE_MESSAGE_FAILED: 'Erreur lors de la suppression du message',
} as const;

// Property Errors
export const PROPERTY_ERRORS = {
	CREATE_FAILED: 'Erreur lors de la création du bien',
	GET_MY_PROPERTIES_FAILED: 'Erreur lors de la récupération de vos biens',
	GET_PROPERTY_FAILED: 'Erreur lors de la récupération du bien',
	UPDATE_FAILED: 'Erreur lors de la mise à jour du bien',
	UPDATE_STATUS_FAILED: 'Erreur lors de la mise à jour du statut',
	DELETE_FAILED: 'Erreur lors de la suppression du bien',
	GET_ALL_FAILED: 'Erreur lors de la récupération des biens',
	GET_STATS_FAILED: 'Erreur lors de la récupération des statistiques',
	UPLOAD_IMAGES_FAILED: 'Erreur lors du téléchargement des images',
} as const;

// Favorites Errors
export const FAVORITES_ERRORS = {
	TOGGLE_FAILED: 'Erreur lors de la gestion du favori',
	GET_FAILED: 'Erreur lors de la récupération des favoris',
	GET_IDS_FAILED: 'Erreur lors de la récupération des identifiants favoris',
	CHECK_STATUS_FAILED: 'Erreur lors de la vérification du statut favori',
} as const;

// Contact Errors
export const CONTACT_ERRORS = {
	SEND_FAILED: "Erreur lors de l'envoi du message",
} as const;
