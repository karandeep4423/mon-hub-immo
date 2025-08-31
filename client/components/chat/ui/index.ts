// ============================================================================
// UI COMPONENTS INDEX
// ============================================================================

/**
 * Micro UI components for message functionality
 * These are small, focused, reusable components
 */

// ============================================================================
// LOADING COMPONENTS
// ============================================================================

export {
	LoadingSpinner,
	CenteredLoading,
	ButtonSpinner,
} from './LoadingSpinner';

export { default as LoadingOlderMessages } from './LoadingOlderMessages';

// ============================================================================
// USER COMPONENTS
// ============================================================================

export { UserAvatar, OnlineIndicator } from './UserAvatar';

// ============================================================================
// EMPTY STATE COMPONENTS
// ============================================================================

export {
	NoConversationSelected,
	EmptyConversation,
	LoadingMessages,
	LoadingUsers,
} from './EmptyStates';

// ============================================================================
// ANIMATION COMPONENTS
// ============================================================================

export {
	TypingDots,
	TypingIndicator as AnimatedTypingIndicator,
} from './AnimatedDots';

// ============================================================================
// BADGE COMPONENTS
// ============================================================================

export { UnreadBadge } from './UnreadBadge';

// ============================================================================
// TIME COMPONENTS
// ============================================================================

export { MessageTime } from './MessageTime';

// ============================================================================
// DATE COMPONENTS
// ============================================================================

export { default as DateSeparator } from './DateSeparator';
