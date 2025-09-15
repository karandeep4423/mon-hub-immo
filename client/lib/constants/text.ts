/**
 * UI Text Constants
 * Centralized location for all hardcoded text in the application
 * This improves maintainability and prepares for future internationalization
 */

// ============================================================================
// NAVIGATION & HEADER
// ============================================================================

export const NAV_TEXT = {
	forSale: 'En vente',
	favorites: 'Favoris',
	dashboard: 'Tableau de bord',
	logout: 'Déconnexion',
} as const;

// ============================================================================
// DASHBOARD - AGENT
// ============================================================================

export const DASHBOARD_AGENT = {
	activeProperties: 'Annonces actives',
	totalViews: 'Vues totales',
	messages: 'Messages',
	manageProperties: 'Gérer mes annonces',
	overview: "Vue d'ensemble",
	myProperties: 'Mes annonces',
} as const;

// ============================================================================
// PROPERTY MANAGEMENT
// ============================================================================

export const PROPERTY_TEXT = {
	title: 'Mes annonces immobilières',
	subtitle: 'Gérez et publiez vos biens',
	newProperty: 'Nouvelle annonce',
	noProperties: 'Aucune annonce pour le moment',
	noPropertiesSubtitle:
		'Créez votre première annonce pour commencer à attirer des clients potentiels.',
	loading: 'Chargement de vos biens...',

	// Property actions
	edit: 'Modifier',
	delete: 'Supprimer',

	// Property status
	available: 'Disponible',
	sold: 'Vendu',
	rented: 'Loué',
	archived: 'Archivé',

	// Property features
	new: 'Nouveau',
	exclusive: 'Exclusivité',
} as const;

// ============================================================================
// FORMS & INPUTS
// ============================================================================

export const FORM_TEXT = {
	save: 'Enregistrer',
	cancel: 'Annuler',
	submit: 'Valider',
	loading: 'Chargement...',
	saving: 'Enregistrement...',
} as const;

// ============================================================================
// NOTIFICATIONS & MESSAGES
// ============================================================================

export const NOTIFICATIONS = {
	success: {
		propertySaved: 'Annonce enregistrée avec succès',
		propertyDeleted: 'Annonce supprimée avec succès',
		messageSent: 'Message envoyé',
	},
	error: {
		propertyError: 'Erreur lors de la sauvegarde',
		deleteError: 'Erreur lors de la suppression',
		loadingError: 'Erreur lors du chargement',
		networkError: 'Erreur de connexion',
	},
	loading: {
		loadingProperties: 'Chargement des biens...',
		savingProperty: 'Enregistrement en cours...',
		deletingProperty: 'Suppression en cours...',
	},
} as const;

// ============================================================================
// CHAT & MESSAGING
// ============================================================================

export const CHAT_TEXT = {
	// General
	title: 'Discussions',
	noConversation: 'Sélectionnez une conversation',
	noMessages: 'Aucun message',
	noMessagesYet: 'Pas encore de messages',
	typingIndicator: 'est en train de taper...',
	loadingMessages: 'Chargement des messages...',
	loadingOlderMessages: 'Chargement des anciens messages...',
	loadingUsers: 'Chargement des utilisateurs...',

	// Message input
	sendMessage: 'Envoyer un message...',
	typeMessage: 'Tapez un message...',
	selectUserToChat: 'Sélectionnez un utilisateur pour commencer à discuter',
	sendingMessage: 'Envoi du message...',
	send: 'Envoyer',

	// User presence
	online: 'en ligne',
	offline: 'hors ligne',
	lastSeen: 'Vu il y a',
	justNow: "à l'instant",

	// Search
	searchUsers: 'Rechercher des utilisateurs...',
	noUsersFound: 'Aucun utilisateur trouvé',

	// Message status
	delivered: 'Livré',
	read: 'Lu',
	sending: 'Envoi...',
	failed: 'Échec',

	// Aria labels
	messageInput: 'Saisie de message',
	sendMessageButton: "Bouton d'envoi de message",
	messageAttachment: 'Pièce jointe du message',
	userAvatar: "Avatar de l'utilisateur",
} as const;

// ============================================================================
// COUNTS & PLURALIZATION
// ============================================================================

export const getPropertyCountText = (count: number): string => {
	return `${count} annonce${count !== 1 ? 's' : ''}`;
};

export const getMessageCountText = (count: number): string => {
	return `${count} message${count !== 1 ? 's' : ''}`;
};

// ============================================================================
// TYPE EXPORTS
// ============================================================================

export type NavTextKeys = keyof typeof NAV_TEXT;
export type PropertyTextKeys = keyof typeof PROPERTY_TEXT;
export type FormTextKeys = keyof typeof FORM_TEXT;
