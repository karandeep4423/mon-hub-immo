/**
 * Chat utilities index
 * Centralized exports for all chat utility functions
 */

// ============================================================================
// TYPE EXPORTS
// ============================================================================

export type { ChatUser as User } from '@/types/chat';
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
	formatFileSize,
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

// S3 helpers reused across components
export const extractS3KeyFromUrl = (url: string): string | null => {
	try {
		const u = new URL(url);
		const path = u.pathname.startsWith('/')
			? u.pathname.slice(1)
			: u.pathname;
		// if path begins with bucket name (virtual-hosted style), strip it
		const host = u.hostname;
		// e.g., bucket.s3.amazonaws.com => ignore
		if (/\.s3[.-]([a-z0-9-]+)\.amazonaws\.com$/i.test(host)) {
			return path;
		}
		// s3.amazonaws.com/bucket/key => path includes bucket; drop first segment
		if (/^([^/]+)\//.test(path)) {
			const [, , rest] = path.match(/^([^/]+)\/(.*)$/) || [];
			return rest || path;
		}
		return path;
	} catch {
		return null;
	}
};
