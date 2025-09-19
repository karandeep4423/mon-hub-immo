/**
 * Message-related utility functions
 * Functions for message formatting, validation, and manipulation
 */

export interface Message {
	_id: string;
	senderId: string;
	receiverId: string;
	text?: string;
	image?: string;
	createdAt: string;
	isRead?: boolean;
	readAt?: string;
}

export interface MessageCursor {
	hasMore: boolean;
	before?: string;
}

/**
 * Check if message content is valid
 */
export const isValidMessageContent = (
	text?: string,
	image?: string,
): boolean => {
	const hasText = text && text.trim().length > 0;
	const hasImage = image && image.length > 0;
	return Boolean(hasText || hasImage);
};

/**
 * Check if user can send a message
 */
export const canSendMessage = (
	text?: string,
	image?: string,
	receiverId?: string,
): boolean => {
	return isValidMessageContent(text, image) && !!receiverId;
};

/**
 * Check if message is within character limit
 */
export const isMessageWithinLimit = (
	text: string,
	limit: number = 1000,
): boolean => {
	return text.length <= limit;
};

/**
 * Format message timestamp for display
 */
export const formatMessageTime = (timestamp: string): string => {
	const date = new Date(timestamp);
	const now = new Date();
	const diffInHours = Math.abs(now.getTime() - date.getTime()) / 36e5;

	if (diffInHours < 24) {
		return date.toLocaleTimeString('fr-FR', {
			hour: '2-digit',
			minute: '2-digit',
		});
	}

	return date.toLocaleDateString('fr-FR', {
		day: 'numeric',
		month: 'short',
	});
};

/**
 * Format time only (HH:MM) regardless of date
 */
export const formatTimeOnly = (timestamp: string): string => {
	const date = new Date(timestamp);
	return date.toLocaleTimeString('fr-FR', {
		hour: '2-digit',
		minute: '2-digit',
	});
};

/**
 * Format message date for display
 */
export const formatMessageDate = (timestamp: string): string => {
	const date = new Date(timestamp);
	const now = new Date();
	const diffInDays = Math.floor(
		(now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24),
	);

	if (diffInDays === 0) return "Aujourd'hui";
	if (diffInDays === 1) return 'Hier';

	return date.toLocaleDateString('fr-FR', {
		weekday: 'long',
		day: 'numeric',
		month: 'long',
	});
};

/**
 * Truncate message text for preview
 */
export const truncateMessage = (
	text: string,
	maxLength: number = 50,
): string => {
	if (text.length <= maxLength) return text;
	return text.slice(0, maxLength).trim() + '...';
};

/**
 * Check if two messages are the same
 */
export const isSameMessage = (msg1: Message, msg2: Message): boolean => {
	return String(msg1._id) === String(msg2._id);
};

/**
 * Check if message belongs to current user
 */
export const isMyMessage = (
	message: Message,
	currentUserId?: string,
): boolean => {
	return currentUserId ? message.senderId === currentUserId : false;
};

/**
 * Sort messages by timestamp (oldest first)
 */
export const sortMessagesByTime = (messages: Message[]): Message[] => {
	return [...messages].sort(
		(a, b) =>
			new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
	);
};

/**
 * Check if date separator should be shown between messages
 */
export const shouldShowDateSeparator = (
	currentMessage: Message,
	previousMessage?: Message,
): boolean => {
	if (!previousMessage) return true;

	const currentDate = new Date(currentMessage.createdAt);
	const previousDate = new Date(previousMessage.createdAt);

	return currentDate.toDateString() !== previousDate.toDateString();
};

/**
 * Deduplicate messages by ID
 */
export const deduplicateMessages = (messages: Message[]): Message[] => {
	const seen = new Set<string>();
	return messages.filter((message) => {
		const id = String(message._id);
		if (seen.has(id)) {
			return false;
		}
		seen.add(id);
		return true;
	});
};

/**
 * Merge and deduplicate message arrays
 */
export const mergeMessages = (...messageArrays: Message[][]): Message[] => {
	const allMessages = messageArrays.flat();
	const deduplicated = deduplicateMessages(allMessages);
	return sortMessagesByTime(deduplicated);
};

/**
 * Find message by ID
 */
export const findMessageById = (
	messages: Message[],
	messageId: string,
): Message | undefined => {
	return messages.find(
		(message) => String(message._id) === String(messageId),
	);
};
