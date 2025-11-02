/**
 * Chat Feature Constants
 * Centralized constants for real-time messaging, Socket.IO events, and chat UI
 */

// ============================================================================
// SOCKET EVENTS
// ============================================================================

/**
 * Socket.IO event constants (mirrors server/src/chat/socketConfig.ts)
 */
export const SOCKET_EVENTS = {
	CONNECTION: 'connection',
	DISCONNECT: 'disconnect',
	USER_STATUS_UPDATE: 'userStatusUpdate',
	UPDATE_STATUS: 'updateStatus',
	GET_ONLINE_USERS: 'getOnlineUsers',
	TYPING: 'typing',
	USER_TYPING: 'userTyping',
	NEW_MESSAGE: 'newMessage',
	MESSAGES_READ: 'messagesRead',
	MESSAGE_DELETED: 'messageDeleted',
	// Chat thread focus tracking (for suppressing noisy notifications)
	CHAT_ACTIVE_THREAD: 'chat:activeThread',
	CHAT_INACTIVE_THREAD: 'chat:inactiveThread',
} as const;

export type SocketEventName =
	(typeof SOCKET_EVENTS)[keyof typeof SOCKET_EVENTS];

// ============================================================================
// UI TEXT
// ============================================================================

export const CHAT_UI_TEXT = {
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
// MESSAGE STATUSES
// ============================================================================

export const MESSAGE_STATUSES = {
	SENDING: 'sending',
	SENT: 'sent',
	DELIVERED: 'delivered',
	READ: 'read',
	FAILED: 'failed',
} as const;

export type MessageStatus =
	(typeof MESSAGE_STATUSES)[keyof typeof MESSAGE_STATUSES];

// ============================================================================
// PRESENCE STATUSES
// ============================================================================

export const PRESENCE_STATUSES = {
	ONLINE: 'online',
	OFFLINE: 'offline',
	AWAY: 'away',
} as const;

export type PresenceStatus =
	(typeof PRESENCE_STATUSES)[keyof typeof PRESENCE_STATUSES];

// ============================================================================
// TYPING INDICATOR TIMING
// ============================================================================

/**
 * Typing indicator timeout in milliseconds
 * How long to show "user is typing" before hiding it
 */
export const TYPING_INDICATOR_TIMEOUT = 3000;

/**
 * Typing event throttle in milliseconds
 * How often to emit typing events to prevent spam
 */
export const TYPING_EVENT_THROTTLE = 1000;

// ============================================================================
// MESSAGE PAGINATION
// ============================================================================

/**
 * Number of messages to load per page
 */
export const MESSAGES_PER_PAGE = 50;

/**
 * Number of older messages to load when scrolling
 */
export const LOAD_MORE_MESSAGES_COUNT = 20;

// ============================================================================
// TOAST MESSAGES
// ============================================================================

export const CHAT_TOAST_MESSAGES = {
	SEND_SUCCESS: 'Message envoyé',
	SEND_ERROR: "Erreur lors de l'envoi du message",
	DELETE_SUCCESS: 'Message supprimé',
	DELETE_ERROR: 'Failed to delete message',
	FETCH_ERROR: 'Erreur lors du chargement des messages',
	FILE_TOO_LARGE: 'Fichier trop volumineux (max 10MB)',
	FILE_UPLOAD_ERROR: 'Erreur lors du téléchargement du fichier',
	INVALID_FILE_TYPE: 'Type de fichier non supporté',
} as const;

// ============================================================================
// API ENDPOINTS
// ============================================================================

export const CHAT_ENDPOINTS = {
	CONVERSATIONS: '/chat/conversations',
	MESSAGES: (userId: string) => `/chat/messages/${userId}`,
	SEND: '/chat/messages',
	READ: (userId: string) => `/chat/messages/read/${userId}`,
	DELETE: (messageId: string) => `/chat/messages/${messageId}`,
	TYPING: '/chat/typing',
} as const;

// ============================================================================
// ROUTES
// ============================================================================

export const CHAT_ROUTES = {
	MAIN: '/chat',
	CONVERSATION: (userId: string) => `/chat/${userId}`,
} as const;

// ============================================================================
// TYPE EXPORTS
// ============================================================================

export type ChatUITextKeys = keyof typeof CHAT_UI_TEXT;
