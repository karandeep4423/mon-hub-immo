// ============================================================================
// MESSAGE UTILITY FUNCTIONS
// ============================================================================

/**
 * Pure utility functions for message handling, formatting, and validation
 * These functions are framework-agnostic and easily testable
 */

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export interface User {
	_id: string;
	firstName?: string;
	lastName?: string;
	name?: string;
	email: string;
	isOnline?: boolean;
	lastSeen?: string;
	isTyping?: boolean;
	unreadCount?: number;
}

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

// ============================================================================
// USER UTILITIES
// ============================================================================

/**
 * Get display name for a user (firstName > name > email)
 */
export const getUserDisplayName = (user: User | null): string => {
	if (!user) return '';
	return user.firstName || user.name || user.email;
};

/**
 * Get user initials for avatar display
 */
export const getUserInitials = (user: User | null): string => {
	if (!user) return '';

	const displayName = getUserDisplayName(user);
	const nameParts = displayName.split(' ');

	if (nameParts.length >= 2) {
		return `${nameParts[0][0]}${nameParts[1][0]}`.toUpperCase();
	}

	return displayName.substring(0, 2).toUpperCase();
};

/**
 * Check if user is currently online
 */
export const isUserOnline = (user: User | null): boolean => {
	return Boolean(user?.isOnline);
};

/**
 * Check if user is currently typing
 */
export const isUserTyping = (
	user: User | null,
	typingUsers: string[],
): boolean => {
	return Boolean(user && typingUsers.includes(user._id));
};

// ============================================================================
// MESSAGE VALIDATION
// ============================================================================

/**
 * Validate if message content is valid for sending
 */
export const isValidMessageContent = (
	text?: string,
	image?: string,
): boolean => {
	return Boolean(text?.trim() || image?.trim());
};

/**
 * Validate if message can be sent (has content and recipient)
 */
export const canSendMessage = (
	text?: string,
	image?: string,
	selectedUser?: User | null,
): boolean => {
	return Boolean(selectedUser && isValidMessageContent(text, image));
};

/**
 * Validate message length
 */
export const isMessageWithinLimit = (
	text: string,
	maxLength: number = 1000,
): boolean => {
	return text.length <= maxLength;
};

// ============================================================================
// MESSAGE FORMATTING
// ============================================================================

/**
 * Format timestamp for message display (HH:MM format)
 */
export const formatMessageTime = (timestamp: string): string => {
	try {
		return new Date(timestamp).toLocaleTimeString([], {
			hour: '2-digit',
			minute: '2-digit',
		});
	} catch (error) {
		console.error('Error formatting message time:', error);
		return '';
	}
};

/**
 * Format timestamp for full date display
 */
export const formatMessageDate = (timestamp: string): string => {
	try {
		return new Date(timestamp).toLocaleDateString([], {
			year: 'numeric',
			month: 'short',
			day: 'numeric',
		});
	} catch (error) {
		console.error('Error formatting message date:', error);
		return '';
	}
};

/**
 * Format last seen timestamp with relative time
 */
export const formatLastSeen = (lastSeen: string): string => {
	try {
		const date = new Date(lastSeen);
		const now = new Date();
		const diffMs = now.getTime() - date.getTime();
		const diffMinutes = Math.floor(diffMs / (1000 * 60));
		const diffHours = Math.floor(diffMinutes / 60);
		const diffDays = Math.floor(diffHours / 24);

		if (diffMinutes < 1) return 'Just now';
		if (diffMinutes < 60) return `${diffMinutes}m ago`;
		if (diffHours < 24) return `${diffHours}h ago`;
		if (diffDays < 7) return `${diffDays}d ago`;

		return date.toLocaleDateString();
	} catch (error) {
		console.error('Error formatting last seen:', error);
		return 'Unknown';
	}
};

/**
 * Truncate message text for preview
 */
export const truncateMessage = (
	text: string,
	maxLength: number = 50,
): string => {
	if (text.length <= maxLength) return text;
	return `${text.substring(0, maxLength)}...`;
};

// ============================================================================
// MESSAGE COMPARISON & SORTING
// ============================================================================

/**
 * Check if two messages are the same
 */
export const isSameMessage = (msg1: Message, msg2: Message): boolean => {
	return msg1._id === msg2._id;
};

/**
 * Check if message belongs to current user
 */
export const isMyMessage = (
	message: Message,
	currentUserId?: string,
): boolean => {
	if (!currentUserId) return false;
	return String(message.senderId) === String(currentUserId);
};

/**
 * Sort messages by creation time (oldest first)
 */
export const sortMessagesByTime = (messages: Message[]): Message[] => {
	return [...messages].sort(
		(a, b) =>
			new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
	);
};

/**
 * Get relative date text for chat grouping (WhatsApp-style)
 */
export const getRelativeDateText = (date: Date): string => {
	const now = new Date();
	const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
	const yesterday = new Date(today);
	yesterday.setDate(yesterday.getDate() - 1);

	const messageDate = new Date(
		date.getFullYear(),
		date.getMonth(),
		date.getDate(),
	);

	// Today
	if (messageDate.getTime() === today.getTime()) {
		return 'Today';
	}

	// Yesterday
	if (messageDate.getTime() === yesterday.getTime()) {
		return 'Yesterday';
	}

	// This week (show day name)
	const diffDays = Math.floor(
		(today.getTime() - messageDate.getTime()) / (1000 * 60 * 60 * 24),
	);
	if (diffDays <= 7 && diffDays > 1) {
		return date.toLocaleDateString('en-US', { weekday: 'long' });
	}

	// Older dates (show full date)
	return date.toLocaleDateString('en-US', {
		day: '2-digit',
		month: '2-digit',
		year: 'numeric',
	});
};

/**
 * Group messages by date with relative date keys
 */
export const groupMessagesByDate = (
	messages: Message[],
): { dateKey: string; date: Date; messages: Message[] }[] => {
	// Group messages by date string
	const groups = messages.reduce(
		(acc, message) => {
			const date = new Date(message.createdAt);
			const dateString = date.toDateString(); // Use date string as key for grouping

			if (!acc[dateString]) {
				acc[dateString] = {
					date,
					messages: [],
				};
			}

			acc[dateString].messages.push(message);
			return acc;
		},
		{} as Record<string, { date: Date; messages: Message[] }>,
	);

	// Convert to array and sort by date (newest first)
	return Object.entries(groups)
		.map(([_, group]) => ({
			dateKey: getRelativeDateText(group.date),
			date: group.date,
			messages: group.messages.sort(
				(a, b) =>
					new Date(a.createdAt).getTime() -
					new Date(b.createdAt).getTime(),
			),
		}))
		.sort((a, b) => a.date.getTime() - b.date.getTime());
};

/**
 * Check if a date should show as a separator (different day from previous message)
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

// ============================================================================
// SCROLL & PAGINATION UTILITIES
// ============================================================================

/**
 * Check if user is near the bottom of scroll container
 */
export const isNearBottom = (
	scrollTop: number,
	scrollHeight: number,
	clientHeight: number,
	threshold: number = 100,
): boolean => {
	const distanceFromBottom = scrollHeight - clientHeight - scrollTop;
	return distanceFromBottom <= threshold;
};

/**
 * Check if user is near the top of scroll container
 */
export const isNearTop = (
	scrollTop: number,
	threshold: number = 24,
): boolean => {
	return scrollTop <= threshold;
};

/**
 * Calculate scroll position delta for infinite scroll (legacy method)
 */
export const calculateScrollDelta = (
	oldHeight: number,
	newHeight: number,
	oldScrollTop: number,
): number => {
	return newHeight - oldHeight + oldScrollTop;
};

/**
 * Enhanced scroll anchor interface for better position preservation
 */
export interface ScrollAnchor {
	messageId: string;
	offsetFromTop: number;
	elementHeight: number;
}

/**
 * Create a scroll anchor from a visible message element
 */
export const createScrollAnchor = (
	container: HTMLElement,
	messageElement: HTMLElement,
	messageId: string,
): ScrollAnchor => {
	const containerRect = container.getBoundingClientRect();
	const messageRect = messageElement.getBoundingClientRect();

	return {
		messageId,
		offsetFromTop: messageRect.top - containerRect.top,
		elementHeight: messageRect.height,
	};
};

/**
 * Find the best anchor message (first visible message from the top)
 */
export const findBestAnchorMessage = (
	container: HTMLElement,
): ScrollAnchor | null => {
	const messageElements = container.querySelectorAll('[data-message-id]');

	for (const element of messageElements) {
		const rect = element.getBoundingClientRect();
		const containerRect = container.getBoundingClientRect();

		// Find first message that's visible in the viewport
		if (
			rect.bottom > containerRect.top &&
			rect.top < containerRect.bottom
		) {
			const messageId = element.getAttribute('data-message-id');
			if (messageId) {
				return createScrollAnchor(
					container,
					element as HTMLElement,
					messageId,
				);
			}
		}
	}

	return null;
};

/**
 * Restore scroll position using an anchor message
 */
export const restoreScrollPosition = (
	container: HTMLElement,
	anchor: ScrollAnchor,
): void => {
	const messageElement = container.querySelector(
		`[data-message-id="${anchor.messageId}"]`,
	);
	if (!messageElement) {
		console.warn(
			'Could not find anchor message for scroll restoration:',
			anchor.messageId,
		);
		return;
	}

	const messageRect = messageElement.getBoundingClientRect();
	const containerRect = container.getBoundingClientRect();

	// Calculate the new scroll position to maintain the same visual position
	const currentOffsetFromTop = messageRect.top - containerRect.top;
	const scrollAdjustment = currentOffsetFromTop - anchor.offsetFromTop;

	container.scrollTop += scrollAdjustment;
};

/**
 * Debounce function for scroll handlers
 */
export const debounce = <T extends (...args: any[]) => any>(
	func: T,
	wait: number,
): T => {
	let timeout: NodeJS.Timeout | null = null;

	return ((...args: any[]) => {
		if (timeout) clearTimeout(timeout);
		timeout = setTimeout(() => func(...args), wait);
	}) as T;
};

/**
 * Throttle function for scroll handlers
 */
export const throttle = <T extends (...args: any[]) => any>(
	func: T,
	limit: number,
): T => {
	let inThrottle: boolean;

	return ((...args: any[]) => {
		if (!inThrottle) {
			func(...args);
			inThrottle = true;
			setTimeout(() => (inThrottle = false), limit);
		}
	}) as T;
};

// ============================================================================
// NOTIFICATION UTILITIES
// ============================================================================

/**
 * Get notification text for new message
 */
export const getMessageNotificationText = (
	message: Message,
	senderName: string,
): string => {
	if (message.image && message.text) {
		return `${senderName} sent a photo: ${truncateMessage(message.text, 30)}`;
	}

	if (message.image) {
		return `${senderName} sent a photo`;
	}

	if (message.text) {
		return `${senderName}: ${truncateMessage(message.text, 50)}`;
	}

	return `${senderName} sent a message`;
};

/**
 * Check if message should trigger notification
 */
export const shouldShowNotification = (
	message: Message,
	currentUserId?: string,
	isWindowFocused: boolean = true,
): boolean => {
	// Don't notify for own messages
	if (isMyMessage(message, currentUserId)) {
		return false;
	}

	// Don't notify if window is focused (user is actively chatting)
	if (isWindowFocused) {
		return false;
	}

	return true;
};

// ============================================================================
// KEYBOARD UTILITIES
// ============================================================================

/**
 * Check if Enter key was pressed without modifiers
 */
export const isEnterKeyPress = (event: React.KeyboardEvent): boolean => {
	return (
		event.key === 'Enter' &&
		!event.shiftKey &&
		!event.ctrlKey &&
		!event.metaKey
	);
};

/**
 * Check if Escape key was pressed
 */
export const isEscapeKeyPress = (event: React.KeyboardEvent): boolean => {
	return event.key === 'Escape';
};

// ============================================================================
// STATUS UTILITIES
// ============================================================================

/**
 * Get user status text with online/offline and last seen
 */
export const getUserStatusText = (user: User | null): string => {
	if (!user) return 'Select a conversation to start chatting';

	const displayName = getUserDisplayName(user);

	if (user.isOnline) {
		return `${displayName} is online`;
	}

	if (user.lastSeen) {
		const lastSeenText = formatLastSeen(user.lastSeen);
		return `${displayName} was last seen ${lastSeenText}`;
	}

	return `Ready to chat with ${displayName}`;
};

/**
 * Get detailed user presence text for chat header (moved from ChatPage.tsx)
 */
export const getDetailedUserPresenceText = (
	selectedUser: User | null,
	onlineUsers: string[],
	userStatuses: Record<string, { lastSeen?: string }>,
	users: User[],
): string => {
	if (!selectedUser) return '';

	const isOnline = onlineUsers.includes(selectedUser._id);
	if (isOnline) return 'Online';

	const lastSeen = selectedUser._id
		? userStatuses[selectedUser._id]?.lastSeen ||
			selectedUser.lastSeen ||
			users.find((u) => u._id === selectedUser._id)?.lastSeen
		: undefined;

	if (!lastSeen) return 'Offline';

	const last = new Date(lastSeen);
	const diffMins = Math.floor((Date.now() - last.getTime()) / 60000);

	if (diffMins < 1) return 'Last seen just now';
	if (diffMins < 60) return `Last seen ${diffMins}m ago`;

	const hours = Math.floor(diffMins / 60);
	if (hours < 24) return `Last seen ${hours}h ago`;

	const days = Math.floor(hours / 24);
	if (days < 7) return `Last seen ${days}d ago`;

	return `Last seen ${last.toLocaleDateString()}`;
};

/**
 * Get CSS classes for status indicator
 */
export const getStatusIndicatorClasses = (isOnline?: boolean): string => {
	return isOnline ? 'text-green-500' : 'text-gray-500';
};

// ============================================================================
// ARRAY UTILITIES
// ============================================================================

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

/**
 * Count unread messages for a user
 */
export const countUnreadMessages = (
	messages: Message[],
	userId: string,
	currentUserId: string,
): number => {
	return messages.filter(
		(message) =>
			String(message.senderId) === String(userId) &&
			String(message.receiverId) === String(currentUserId) &&
			!message.isRead,
	).length;
};
