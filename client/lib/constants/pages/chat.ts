/**
 * Chat Page Constants
 * Chat/messaging page at "/chat"
 */

// ============================================================================
// PAGE METADATA
// ============================================================================

export const CHAT_PAGE = {
	title: 'Messages',
	description: 'Communiquez avec vos contacts',
	path: '/chat',
} as const;

// ============================================================================
// HEADER
// ============================================================================

export const CHAT_HEADER = {
	title: 'Messages',
	search: 'Rechercher une conversation',
	newChat: 'Nouvelle conversation',
	backToList: 'Retour aux conversations',
} as const;

// ============================================================================
// CONVERSATION LIST
// ============================================================================

export const CHAT_CONVERSATION_LIST = {
	title: 'Conversations',
	allConversations: 'Toutes',
	unread: 'Non lues',
	archived: 'Archivées',
	online: 'En ligne',
	typing: "en train d'écrire...",
	lastSeen: 'Vu',
	yesterday: 'Hier',
	today: "Aujourd'hui",
	justNow: "À l'instant",
	minutesAgo: (min: number) => `Il y a ${min}min`,
	hoursAgo: (hours: number) => `Il y a ${hours}h`,
	daysAgo: (days: number) => `Il y a ${days}j`,
} as const;

// ============================================================================
// CONVERSATION EMPTY STATES
// ============================================================================

export const CHAT_EMPTY_STATES = {
	noConversations: {
		title: 'Aucune conversation',
		message:
			'Commencez une conversation en contactant un agent ou un apporteur',
		action: 'Parcourir les agents',
	},
	noUnread: {
		title: 'Aucun message non lu',
		message: 'Vous êtes à jour dans vos conversations',
	},
	noArchived: {
		title: 'Aucune conversation archivée',
		message: 'Les conversations archivées apparaîtront ici',
	},
	noSearchResults: {
		title: 'Aucun résultat',
		message: 'Aucune conversation ne correspond à votre recherche',
	},
	selectConversation: {
		title: 'Sélectionnez une conversation',
		message: 'Choisissez une conversation dans la liste pour commencer',
	},
} as const;

// ============================================================================
// MESSAGE INPUT
// ============================================================================

export const CHAT_MESSAGE_INPUT = {
	placeholder: 'Écrivez votre message...',
	send: 'Envoyer',
	sending: 'Envoi...',
	attachFile: 'Joindre un fichier',
	emoji: 'Emoji',
	voiceMessage: 'Message vocal',
	recording: 'Enregistrement...',
	stopRecording: 'Arrêter',
	maxLength: 5000,
	remaining: (count: number) => `${count} caractères restants`,
} as const;

// ============================================================================
// MESSAGE STATES
// ============================================================================

export const CHAT_MESSAGE_STATES = {
	sending: 'Envoi...',
	sent: 'Envoyé',
	delivered: 'Reçu',
	read: 'Lu',
	failed: 'Échec',
	retry: 'Réessayer',
	delete: 'Supprimer',
	edit: 'Modifier',
	copy: 'Copier',
	forward: 'Transférer',
	reply: 'Répondre',
} as const;

// ============================================================================
// ATTACHMENTS
// ============================================================================

export const CHAT_ATTACHMENTS = {
	maxSize: 10, // MB
	maxSizeText: '10 Mo',
	maxCount: 5,
	allowedTypes: [
		'image/jpeg',
		'image/png',
		'image/gif',
		'application/pdf',
		'application/msword',
		'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
	] as const,
	typeLabels: {
		image: 'Image',
		pdf: 'PDF',
		document: 'Document',
		other: 'Fichier',
	},
	uploading: 'Téléchargement...',
	uploaded: 'Téléchargé',
	failed: 'Échec du téléchargement',
	remove: 'Retirer',
	download: 'Télécharger',
	preview: 'Aperçu',
	sizeTooLarge: (max: number) => `Fichier trop volumineux (max ${max}Mo)`,
	tooMany: (max: number) => `Trop de fichiers (max ${max})`,
	invalidType: 'Type de fichier non autorisé',
} as const;

// ============================================================================
// CONVERSATION ACTIONS
// ============================================================================

export const CHAT_CONVERSATION_ACTIONS = {
	markAsRead: 'Marquer comme lu',
	markAsUnread: 'Marquer comme non lu',
	archive: 'Archiver',
	unarchive: 'Désarchiver',
	delete: 'Supprimer',
	mute: 'Couper les notifications',
	unmute: 'Activer les notifications',
	block: 'Bloquer',
	unblock: 'Débloquer',
	viewProfile: 'Voir le profil',
	viewProperties: 'Voir les biens',
	clearHistory: "Effacer l'historique",
} as const;

// ============================================================================
// CONVERSATION HEADER
// ============================================================================

export const CHAT_CONVERSATION_HEADER = {
	online: 'En ligne',
	offline: 'Hors ligne',
	away: 'Absent',
	typing: "En train d'écrire...",
	moreActions: "Plus d'actions",
	callButton: 'Appeler',
	videoButton: 'Appel vidéo',
	infoButton: 'Informations',
} as const;

// ============================================================================
// CONVERSATION INFO PANEL
// ============================================================================

export const CHAT_CONVERSATION_INFO = {
	title: 'Informations',
	profile: 'Profil',
	sharedFiles: 'Fichiers partagés',
	sharedProperties: 'Biens partagés',
	collaborations: 'Collaborations',
	settings: 'Paramètres',
	muteNotifications: 'Notifications',
	muteOptions: {
		hour: '1 heure',
		day: '24 heures',
		week: '1 semaine',
		forever: 'Toujours',
	},
	clearChat: 'Effacer la conversation',
	deleteChat: 'Supprimer la conversation',
	blockUser: "Bloquer l'utilisateur",
	reportUser: "Signaler l'utilisateur",
} as const;

// ============================================================================
// NEW CONVERSATION
// ============================================================================

export const CHAT_NEW_CONVERSATION = {
	title: 'Nouvelle conversation',
	search: 'Rechercher un contact',
	selectContacts: 'Sélectionnez des contacts',
	selectedCount: (count: number) =>
		`${count} sélectionné${count !== 1 ? 's' : ''}`,
	startChat: 'Démarrer',
	cancel: 'Annuler',
	noContacts: 'Aucun contact trouvé',
	recentContacts: 'Contacts récents',
	allContacts: 'Tous les contacts',
} as const;

// ============================================================================
// TYPING INDICATOR
// ============================================================================

export const CHAT_TYPING_INDICATOR = {
	single: (name: string) => `${name} écrit...`,
	multiple: (names: string[]) =>
		names.length === 2
			? `${names[0]} et ${names[1]} écrivent...`
			: `${names[0]} et ${names.length - 1} autres écrivent...`,
} as const;

// ============================================================================
// CONFIRM DIALOGS
// ============================================================================

export const CHAT_CONFIRM = {
	deleteConversation: {
		title: 'Supprimer la conversation',
		message:
			'Êtes-vous sûr de vouloir supprimer cette conversation ? Cette action est irréversible.',
		confirm: 'Supprimer',
		cancel: 'Annuler',
	},
	clearHistory: {
		title: "Effacer l'historique",
		message:
			"Êtes-vous sûr de vouloir effacer l'historique de cette conversation ?",
		confirm: 'Effacer',
		cancel: 'Annuler',
	},
	deleteMessage: {
		title: 'Supprimer le message',
		message: 'Êtes-vous sûr de vouloir supprimer ce message ?',
		confirm: 'Supprimer',
		cancel: 'Annuler',
	},
	blockUser: {
		title: "Bloquer l'utilisateur",
		message:
			'Êtes-vous sûr de vouloir bloquer cet utilisateur ? Vous ne recevrez plus ses messages.',
		confirm: 'Bloquer',
		cancel: 'Annuler',
	},
} as const;

// ============================================================================
// DATE SEPARATORS
// ============================================================================

export const CHAT_DATE_SEPARATORS = {
	today: "Aujourd'hui",
	yesterday: 'Hier',
	formatDate: (date: Date) => {
		const today = new Date();
		const messageDate = new Date(date);
		const diffTime = Math.abs(today.getTime() - messageDate.getTime());
		const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

		if (diffDays === 0) return CHAT_DATE_SEPARATORS.today;
		if (diffDays === 1) return CHAT_DATE_SEPARATORS.yesterday;

		// Format: "Lundi 15 janvier"
		return messageDate.toLocaleDateString('fr-FR', {
			weekday: 'long',
			day: 'numeric',
			month: 'long',
		});
	},
} as const;

// ============================================================================
// NOTIFICATION BADGES
// ============================================================================

export const CHAT_BADGES = {
	unreadCount: (count: number) => (count > 99 ? '99+' : count.toString()),
	new: 'Nouveau',
	unread: 'Non lu',
	muted: 'Muet',
	archived: 'Archivé',
	blocked: 'Bloqué',
} as const;

// ============================================================================
// LOADING STATES
// ============================================================================

export const CHAT_LOADING = {
	conversations: 'Chargement des conversations...',
	messages: 'Chargement des messages...',
	sending: 'Envoi du message...',
	uploading: 'Téléchargement du fichier...',
	deleting: 'Suppression...',
} as const;

// ============================================================================
// ERROR MESSAGES
// ============================================================================

export const CHAT_ERRORS = {
	loadConversations: 'Erreur lors du chargement des conversations',
	loadMessages: 'Erreur lors du chargement des messages',
	sendMessage: "Erreur lors de l'envoi du message",
	uploadFile: 'Erreur lors du téléchargement du fichier',
	deleteConversation: 'Erreur lors de la suppression de la conversation',
	deleteMessage: 'Erreur lors de la suppression du message',
	networkError: 'Erreur de connexion. Vérifiez votre connexion internet.',
	socketDisconnected: 'Connexion perdue. Reconnexion en cours...',
	socketReconnected: 'Connexion rétablie',
} as const;

// ============================================================================
// ACCESSIBILITY
// ============================================================================

export const CHAT_A11Y = {
	conversationList: 'Liste des conversations',
	messageList: 'Liste des messages',
	messageInput: 'Saisir un message',
	sendButton: 'Envoyer le message',
	attachButton: 'Joindre un fichier',
	emojiButton: 'Sélectionner un emoji',
	moreActions: "Plus d'actions",
	closePanel: 'Fermer le panneau',
	newMessage: 'Nouveau message',
} as const;
