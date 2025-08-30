'use client';

import React from 'react';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

interface DateSeparatorProps {
	/** Date text to display (e.g., "Today", "Yesterday", "Monday", "22/08/2025") */
	dateText: string;
	/** Custom styling classes */
	className?: string;
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

/**
 * DateSeparator Component
 *
 * Displays a WhatsApp-style date separator in chat messages.
 * Shows relative dates like "Today", "Yesterday", weekday names, or full dates.
 *
 * Features:
 * - WhatsApp-style centered design
 * - Rounded background bubble
 * - Sticky positioning option
 * - Optimized with React.memo
 * - Accessible with proper contrast
 *
 * @param dateText - The date text to display
 * @param className - Optional custom styling
 */
const DateSeparator: React.FC<DateSeparatorProps> = React.memo(
	({ dateText, className = '' }) => {
		return (
			<div className={`flex justify-center my-6 px-4 ${className}`}>
				<div className="bg-blue-600 rounded-lg px-3 py-1.5 shadow-sm border border-blue-600 ">
					<span className="text-xs font-medium text-gray-100  select-none tracking-wide">
						{dateText}
					</span>
				</div>
			</div>
		);
	},
);

DateSeparator.displayName = 'DateSeparator';

export default DateSeparator;
