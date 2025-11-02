'use client';

import React from 'react';
import { formatMessageTime } from '../utils/messageUtils';
import { logger } from '@/lib/utils/logger';

// ============================================================================
// MESSAGE TIME COMPONENT
// ============================================================================

interface MessageTimeProps {
	/** ISO timestamp string */
	timestamp: string;
	/** Whether this is current user's message */
	isMyMessage?: boolean;
	/** Whether to show full date */
	showDate?: boolean;
	/** Custom format function */
	format?: (timestamp: string) => string;
	/** Custom className */
	className?: string;
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Get text color based on message ownership
 */
const getTimeColor = (isMyMessage: boolean): string => {
	return isMyMessage ? 'text-white/70' : 'text-gray-500';
};

/**
 * Format with date and time
 */
const formatWithDate = (timestamp: string): string => {
	try {
		const date = new Date(timestamp);
		const today = new Date();
		const yesterday = new Date(today);
		yesterday.setDate(yesterday.getDate() - 1);

		// Same day - show only time
		if (date.toDateString() === today.toDateString()) {
			return formatMessageTime(timestamp);
		}

		// Yesterday
		if (date.toDateString() === yesterday.toDateString()) {
			return `Yesterday ${formatMessageTime(timestamp)}`;
		}

		// Same year - show month/day and time
		if (date.getFullYear() === today.getFullYear()) {
			return `${date.toLocaleDateString([], { month: 'short', day: 'numeric' })} ${formatMessageTime(timestamp)}`;
		}

		// Different year - show full date and time
		return `${date.toLocaleDateString()} ${formatMessageTime(timestamp)}`;
	} catch (error) {
		logger.error('Error formatting date with time:', error);
		return formatMessageTime(timestamp);
	}
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

/**
 * MessageTime Component
 *
 * Displays formatted timestamp for messages
 * Features:
 * - Automatic color based on message ownership
 * - Optional date display
 * - Custom format function support
 * - Intelligent date formatting (today/yesterday/full date)
 *
 * @param timestamp - ISO timestamp string
 * @param isMyMessage - Whether this is current user's message
 * @param showDate - Whether to include date information
 * @param format - Custom format function
 * @param className - Custom styling
 */
export const MessageTime: React.FC<MessageTimeProps> = React.memo(
	({
		timestamp,
		isMyMessage = false,
		showDate = false,
		format,
		className = '',
	}) => {
		// Use custom format if provided, otherwise use appropriate formatter
		const formattedTime = format
			? format(timestamp)
			: showDate
				? formatWithDate(timestamp)
				: formatMessageTime(timestamp);

		const colorClass = getTimeColor(isMyMessage);

		return (
			<span
				className={`text-xs ${colorClass} ${className}`}
				title={new Date(timestamp).toLocaleString()} // Full timestamp on hover
			>
				{formattedTime}
			</span>
		);
	},
);

MessageTime.displayName = 'MessageTime';

export default MessageTime;
