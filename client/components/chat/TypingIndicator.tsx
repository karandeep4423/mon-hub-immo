'use client';

import React from 'react';
import { getUserDisplayName, isUserTyping } from './messageUtils';
import { TypingDots } from './ui';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

interface User {
	_id: string;
	firstName?: string;
	lastName?: string;
	name?: string;
	email: string;
}

interface TypingIndicatorProps {
	/** Currently selected user */
	selectedUser: User | null;
	/** Array of user IDs who are currently typing */
	typingUsers: string[];
	/** Custom styling classes */
	className?: string;
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

/**
 * TypingIndicator Component
 *
 * Displays a smooth typing indicator when the selected user is typing.
 * Features:
 * - Animated bouncing dots
 * - User name display
 * - Smooth show/hide transitions
 * - Optimized with React.memo for performance
 *
 * @param selectedUser - Currently selected user in chat
 * @param typingUsers - Array of user IDs currently typing
 * @param className - Optional custom styling
 */
const TypingIndicator: React.FC<TypingIndicatorProps> = React.memo(
	({ selectedUser, typingUsers, className = '' }) => {
		const isTyping = isUserTyping(selectedUser, typingUsers);

		if (!isTyping || !selectedUser) {
			return null;
		}

		const displayName = getUserDisplayName(selectedUser);

		return (
			<div
				className={`px-4 py-2 text-sm text-gray-500 border-b bg-gray-50 ${className}`}
			>
				<div className="flex items-center space-x-2">
					<TypingDots size="md" color="bg-gray-400" />
					<span className="select-none">
						{displayName} is typing...
					</span>
				</div>
			</div>
		);
	},
);

TypingIndicator.displayName = 'TypingIndicator';

export default TypingIndicator;
