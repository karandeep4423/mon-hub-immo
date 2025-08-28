'use client';

import React from 'react';

// ============================================================================
// UNREAD BADGE COMPONENT
// ============================================================================

interface UnreadBadgeProps {
	/** Number of unread messages */
	count: number;
	/** Maximum number to display before showing "+" */
	maxCount?: number;
	/** Size of the badge */
	size?: 'sm' | 'md' | 'lg';
	/** Custom color classes */
	color?: string;
	/** Custom className */
	className?: string;
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Get badge size classes
 */
const getBadgeSize = (size: 'sm' | 'md' | 'lg'): string => {
	switch (size) {
		case 'sm':
			return 'text-xs px-1.5 py-0.5 min-w-[16px] h-4';
		case 'md':
			return 'text-xs px-2 py-1 min-w-[20px] h-5';
		case 'lg':
			return 'text-sm px-2.5 py-1 min-w-[24px] h-6';
		default:
			return 'text-xs px-2 py-1 min-w-[20px] h-5';
	}
};

/**
 * Format count display
 */
const formatCount = (count: number, maxCount: number): string => {
	if (count <= maxCount) {
		return count.toString();
	}
	return `${maxCount}+`;
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

/**
 * UnreadBadge Component
 *
 * Displays unread message count with proper formatting
 * Features:
 * - Shows count up to maxCount, then "maxCount+"
 * - Multiple sizes
 * - Customizable colors
 * - Auto-hide when count is 0
 * - Centered text alignment
 *
 * @param count - Number of unread messages
 * @param maxCount - Maximum number before showing "+"
 * @param size - Badge size (sm|md|lg)
 * @param color - Color classes
 * @param className - Custom styling
 */
export const UnreadBadge: React.FC<UnreadBadgeProps> = React.memo(
	({
		count,
		maxCount = 99,
		size = 'md',
		color = 'bg-blue-500 text-white',
		className = '',
	}) => {
		// Don't render if no unread messages
		if (count <= 0) {
			return null;
		}

		const sizeClass = getBadgeSize(size);
		const displayCount = formatCount(count, maxCount);

		return (
			<span
				className={`${sizeClass} ${color} font-semibold rounded-full text-center flex items-center justify-center ${className}`}
				aria-label={`${count} unread messages`}
			>
				{displayCount}
			</span>
		);
	},
);

UnreadBadge.displayName = 'UnreadBadge';

export default UnreadBadge;
