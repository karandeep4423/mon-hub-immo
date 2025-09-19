// ============================================================================
// MESSAGE COMPONENTS INDEX
// ============================================================================

/**
 * Centralized exports for all message-related components and utilities
 * This enables clean imports and better code organization
 */

// ============================================================================
// MAIN COMPONENTS
// ============================================================================

export { default as ChatMessages } from './ChatMessages';
export { default as ChatPage } from './ChatPage';
export { default as ChatSidebar } from './ChatSidebar';
export { default as MessageInput } from './MessageInput';
export { SocketWrapper } from './SocketWrapper';

// ============================================================================
// MODULAR SUB-COMPONENTS
// ============================================================================

export { default as MessageBubble } from './MessageBubble';
export {
	default as MessageStatus,
	ReadReceipt,
	MessageTimestamp,
} from './MessageStatus';
export { default as TypingIndicator } from './TypingIndicator';

// ============================================================================
// MICRO UI COMPONENTS
// ============================================================================

export * from './ui';

// ============================================================================
// UTILITIES
// ============================================================================

// Re-export everything from utils for backwards compatibility
export * from './utils';

// ============================================================================
// DATE GROUPING UTILITIES
// ============================================================================

export { groupMessagesByDate, getRelativeDateText } from './utils/dateUtils';

// ============================================================================
// TYPE EXPORTS
// ============================================================================

export type { User, Message } from './utils';
