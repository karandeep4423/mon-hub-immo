/**
 * Centralized Toast Messages
 * All toast notification messages used across the application
 * Organized by feature/domain for easy maintenance
 */

export const TOAST_MESSAGES = {
	// ============================================================================
	// AUTHENTICATION
	// ============================================================================
	AUTH: {
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
		PASSWORD_RESET_ERROR:
			'Erreur lors de la réinitialisation du mot de passe',
		NO_CHANGES_DETECTED: 'Aucune modification détectée',
		AGENT_ONLY_ACCESS: 'Cette page est réservée aux agents',
	},

	// ============================================================================
	// APPOINTMENTS
	// ============================================================================
	APPOINTMENTS: {
		FETCH_ERROR: 'Échec du chargement des rendez-vous',
		CREATE_SUCCESS: 'Rendez-vous créé avec succès',
		CREATE_ERROR: 'Erreur lors de la création du rendez-vous',
		UPDATE_SUCCESS: 'Rendez-vous mis à jour',
		UPDATE_ERROR: 'Erreur lors de la mise à jour du rendez-vous',
		CANCEL_SUCCESS: 'Rendez-vous annulé',
		CANCEL_ERROR: "Erreur lors de l'annulation du rendez-vous",
		CONFIRM_SUCCESS: 'Rendez-vous confirmé',
		CONFIRM_ERROR: 'Erreur lors de la confirmation du rendez-vous',
		RESCHEDULE_SUCCESS: 'Rendez-vous reprogrammé avec succès !',
		RESCHEDULE_ERROR:
			'Une erreur est survenue lors de la reprogrammation du rendez-vous',
		COMPLETE_SUCCESS: 'Rendez-vous marqué comme complété',
		COMPLETE_ERROR: 'Erreur lors du marquage comme complété',
		NO_SLOTS_AVAILABLE: 'Aucun créneau disponible pour cette date',
		SELECT_DATE_TIME: 'Veuillez sélectionner une date et une heure',
		LOAD_SLOTS_ERROR: 'Erreur lors du chargement des créneaux',
	},

	// ============================================================================
	// AVAILABILITY
	// ============================================================================
	AVAILABILITY: {
		AUTO_SAVE_SUCCESS: 'Modifications enregistrées automatiquement',
		SAVE_ERROR: 'Erreur lors de la sauvegarde',
		FETCH_ERROR: 'Erreur lors du chargement des disponibilités',
		UPDATE_SUCCESS: 'Disponibilités mises à jour',
		BLOCK_DATE_SUCCESS: 'Date bloquée avec succès',
		UNBLOCK_DATE_SUCCESS: 'Date débloquée avec succès',
		OVERLAPPING_SLOTS: 'Les créneaux horaires se chevauchent',
		INVALID_TIME_RANGE: 'Plage horaire invalide',
	},

	// ============================================================================
	// PROPERTIES
	// ============================================================================
	PROPERTIES: {
		FETCH_ERROR: 'Erreur lors de la récupération de vos biens',
		CREATE_SUCCESS: 'Bien créé avec succès',
		CREATE_ERROR: 'Erreur lors de la création du bien',
		UPDATE_SUCCESS: 'Bien mis à jour avec succès',
		UPDATE_ERROR: 'Erreur lors de la mise à jour du bien',
		DELETE_SUCCESS: 'Bien supprimé avec succès !',
		DELETE_ERROR: 'Erreur lors de la suppression du bien',
		STATUS_UPDATE_SUCCESS: 'Statut mis à jour avec succès !',
		STATUS_UPDATE_ERROR: 'Erreur lors de la mise à jour du statut',
	},

	// ============================================================================
	// SEARCH ADS
	// ============================================================================
	SEARCH_ADS: {
		FETCH_ERROR: 'Impossible de charger les annonces',
		CREATE_SUCCESS: 'Annonce de recherche créée avec succès',
		CREATE_ERROR: "Erreur lors de la création de l'annonce",
		UPDATE_SUCCESS: 'Annonce mise à jour avec succès',
		UPDATE_ERROR: "Erreur lors de la mise à jour de l'annonce",
		DELETE_SUCCESS: 'Annonce supprimée avec succès',
		DELETE_ERROR: "Erreur lors de la suppression de l'annonce",
		STATUS_UPDATE_SUCCESS: "Statut de l'annonce mis à jour",
		STATUS_UPDATE_ERROR: 'Erreur lors de la mise à jour du statut',
	},

	// ============================================================================
	// COLLABORATION
	// ============================================================================
	COLLABORATION: {
		PROPOSE_SUCCESS: 'Collaboration proposée avec succès',
		PROPOSE_ERROR: 'Erreur lors de la proposition de collaboration',
		ACCEPT_SUCCESS: 'Collaboration acceptée',
		ACCEPT_ERROR: "Erreur lors de l'acceptation de la collaboration",
		REJECT_SUCCESS: 'Collaboration refusée',
		REJECT_ERROR: 'Erreur lors du refus de la collaboration',
		CANCEL_SUCCESS: 'Collaboration annulée',
		CANCEL_ERROR: "Erreur lors de l'annulation de la collaboration",
		COMPLETE_SUCCESS: 'Collaboration terminée',
		COMPLETE_ERROR: 'Erreur lors de la finalisation',
		FETCH_ERROR: 'Erreur lors du chargement des collaborations',
		STEP_VALIDATED: 'Étape validée avec succès',
		STEP_VALIDATION_ERROR: "Erreur lors de la validation de l'étape",
		STATUS_UPDATE_SUCCESS: 'Statut global mis à jour',
		STATUS_UPDATE_ERROR: 'Erreur lors de la mise à jour du statut',
	},

	// ============================================================================
	// CONTRACTS
	// ============================================================================
	CONTRACTS: {
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
	},

	// ============================================================================
	// FAVORITES
	// ============================================================================
	FAVORITES: {
		ADD_SUCCESS: 'Ajouté aux favoris',
		REMOVE_SUCCESS: 'Retiré des favoris',
		TOGGLE_ERROR: 'Erreur lors de la modification des favoris',
		FETCH_ERROR: 'Erreur lors du chargement des favoris',
	},

	// ============================================================================
	// CHAT / MESSAGES
	// ============================================================================
	CHAT: {
		SEND_SUCCESS: 'Message envoyé',
		SEND_ERROR: "Erreur lors de l'envoi du message",
		DELETE_SUCCESS: 'Message supprimé',
		DELETE_ERROR: 'Failed to delete message',
		FETCH_ERROR: 'Erreur lors du chargement des messages',
		FILE_TOO_LARGE: 'Fichier trop volumineux (max 10MB)',
		FILE_UPLOAD_ERROR: 'Erreur lors du téléchargement du fichier',
		INVALID_FILE_TYPE: 'Type de fichier non supporté',
	},

	// ============================================================================
	// NOTIFICATIONS
	// ============================================================================
	NOTIFICATIONS: {
		MARK_READ_SUCCESS: 'Notification marquée comme lue',
		MARK_ALL_READ_SUCCESS: 'Toutes les notifications marquées comme lues',
		DELETE_SUCCESS: 'Notification supprimée',
		FETCH_ERROR: 'Erreur lors du chargement des notifications',
	},

	// ============================================================================
	// FILE UPLOADS
	// ============================================================================
	FILE_UPLOAD: {
		SUCCESS: 'Fichier téléchargé avec succès',
		ERROR: 'Erreur lors du téléchargement du fichier',
		IMAGE_SUCCESS: 'Image téléchargée avec succès',
		IMAGE_ERROR: "Erreur lors du téléchargement de l'image",
		DELETE_SUCCESS: 'Fichier supprimé',
		DELETE_ERROR: 'Erreur lors de la suppression du fichier',
		SIZE_LIMIT: 'La taille du fichier dépasse la limite autorisée',
		INVALID_FORMAT: 'Format de fichier non supporté',
	},

	// ============================================================================
	// CONTACT FORM
	// ============================================================================
	CONTACT: {
		SEND_SUCCESS:
			'Votre message a été envoyé avec succès. Nous vous contacterons bientôt.',
		SEND_ERROR: "Erreur lors de l'envoi du message",
		VALIDATION_ERROR: 'Veuillez remplir tous les champs requis',
	},

	// ============================================================================
	// GENERAL / COMMON
	// ============================================================================
	GENERAL: {
		SUCCESS: 'Opération réussie',
		ERROR: 'Une erreur est survenue',
		SAVE_SUCCESS: 'Enregistré avec succès',
		SAVE_ERROR: "Erreur lors de l'enregistrement",
		DELETE_SUCCESS: 'Supprimé avec succès',
		DELETE_ERROR: 'Erreur lors de la suppression',
		UPDATE_SUCCESS: 'Mis à jour avec succès',
		UPDATE_ERROR: 'Erreur lors de la mise à jour',
		LOADING: 'Chargement en cours...',
		SOMETHING_WENT_WRONG: "Quelque chose s'est mal passé",
		NETWORK_ERROR: 'Erreur de connexion réseau',
		PERMISSION_DENIED:
			"Vous n'avez pas la permission d'effectuer cette action",
		VALIDATION_ERROR: 'Veuillez vérifier les informations saisies',
		REQUIRED_FIELDS: 'Veuillez remplir tous les champs obligatoires',
	},
} as const;

// Type helper for accessing messages
export type ToastMessageKey = keyof typeof TOAST_MESSAGES;
export type ToastMessage<T extends ToastMessageKey> =
	keyof (typeof TOAST_MESSAGES)[T];
