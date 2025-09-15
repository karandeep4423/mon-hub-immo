/**
 * Chat utilities index
 * Centralized exports for all chat utility functions
 */

// ============================================================================
// TYPE EXPORTS
// ============================================================================

export type { User } from './userUtils';
export type { Message, MessageCursor } from './messageUtils';
export type { ScrollAnchor } from './scrollUtils';
export type { MessageDateGroup } from './dateUtils';

// ============================================================================
// USER UTILITIES
// ============================================================================

export {
	getUserDisplayName,
	getUserInitials,
	isUserOnline,
	isUserTyping,
	formatLastSeen,
	getDetailedUserPresenceText,
	getUserStatusText,
} from './userUtils';

// ============================================================================
// MESSAGE UTILITIES
// ============================================================================

export {
	isValidMessageContent,
	canSendMessage,
	isMessageWithinLimit,
	formatMessageTime,
	formatMessageDate,
	truncateMessage,
	isSameMessage,
	isMyMessage,
	sortMessagesByTime,
	shouldShowDateSeparator,
	deduplicateMessages,
	mergeMessages,
	findMessageById,
} from './messageUtils';

// ============================================================================
// SCROLL UTILITIES
// ============================================================================

export {
	isNearBottom,
	isNearTop,
	calculateScrollDelta,
	createScrollAnchor,
	restoreScrollPosition,
	findBestAnchorMessage,
	shouldAutoScrollToBottom,
	scrollToBottom,
	debounce,
} from './scrollUtils';

// ============================================================================
// DATE UTILITIES
// ============================================================================

export {
	getRelativeDateText,
	groupMessagesByDate,
	formatTime,
} from './dateUtils';

// ============================================================================
// KEYBOARD UTILITIES
// ============================================================================

export {
	isEnterKeyPress,
	isEscapeKeyPress,
	isCtrlEnterPress,
} from './keyboardUtils';
