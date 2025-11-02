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

// Use LoadingSpinner from @/components/ui/LoadingSpinner instead
export { default as LoadingOlderMessages } from './LoadingOlderMessages';

// ============================================================================
// USER COMPONENTS (USE ProfileAvatar from @/components/ui instead)
// ============================================================================

// UserAvatar removed - use ProfileAvatar from @/components/ui/ProfileAvatar

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
