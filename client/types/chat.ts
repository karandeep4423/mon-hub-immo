// Centralized chat domain types to avoid duplication across the client
// Keep in sync with server contracts (server/src/chat and server/src/controllers)

export interface ChatUser {
	_id: string;
	firstName?: string;
	lastName?: string;
	name?: string;
	email: string;
	avatarUrl?: string;
	isOnline?: boolean;
	lastSeen?: string;
	isTyping?: boolean;
	unreadCount?: number;
	lastMessage?: {
		text: string;
		createdAt: string;
		senderId: string;
	} | null;
}

export interface ChatMessage {
	_id: string;
	senderId: string;
	receiverId: string;
	text?: string;
	image?: string;
	createdAt: string;
	isRead?: boolean;
	readAt?: string;
}

export interface SendMessageData {
	text?: string;
	image?: string;
}

export interface TypingEvent {
	senderId: string;
	isTyping: boolean;
}

export interface ReadReceiptEvent {
	readBy: string;
	senderId: string;
}
