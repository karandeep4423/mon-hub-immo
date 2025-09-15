'use client';

import React from 'react';

// ============================================================================
// ANIMATED DOTS COMPONENTS
// ============================================================================

interface TypingDotsProps {
	/** Size of dots */
	size?: 'sm' | 'md' | 'lg';
	/** Color of dots */
	color?: string;
	/** Custom className */
	className?: string;
}

interface TypingDotProps {
	/** Animation delay */
	delay?: string;
	/** Size class */
	sizeClass: string;
	/** Color class */
	colorClass: string;
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Get dot size classes
 */
const getDotSize = (size: 'sm' | 'md' | 'lg'): string => {
	switch (size) {
		case 'sm':
			return 'w-1.5 h-1.5';
		case 'md':
			return 'w-2 h-2';
		case 'lg':
			return 'w-3 h-3';
		default:
			return 'w-2 h-2';
	}
};

// ============================================================================
// SUB-COMPONENTS
// ============================================================================

/**
 * Individual Typing Dot
 */
const TypingDot: React.FC<TypingDotProps> = React.memo(
	({ delay = '0s', sizeClass, colorClass }) => (
		<div
			className={`${sizeClass} ${colorClass} rounded-full animate-bounce`}
			style={{ animationDelay: delay }}
		/>
	),
);

TypingDot.displayName = 'TypingDot';

// ============================================================================
// MAIN COMPONENT
// ============================================================================

/**
 * TypingDots Component
 *
 * Animated bouncing dots for typing indicators
 * Features:
 * - Staggered animation timing
 * - Multiple sizes
 * - Customizable colors
 * - Smooth bouncing effect
 *
 * @param size - Size of dots (sm|md|lg)
 * @param color - Color class for dots
 * @param className - Custom styling
 */
export const TypingDots: React.FC<TypingDotsProps> = React.memo(
	({ size = 'md', color = 'bg-gray-400', className = '' }) => {
		const sizeClass = getDotSize(size);

		return (
			<div className={`flex space-x-1 ${className}`}>
				<TypingDot
					sizeClass={sizeClass}
					colorClass={color}
					delay="0s"
				/>
				<TypingDot
					sizeClass={sizeClass}
					colorClass={color}
					delay="0.1s"
				/>
				<TypingDot
					sizeClass={sizeClass}
					colorClass={color}
					delay="0.2s"
				/>
			</div>
		);
	},
);

TypingDots.displayName = 'TypingDots';

/**
 * Typing Indicator with Dots and Text
 */
export const TypingIndicator: React.FC<{
	userName: string;
	dotSize?: 'sm' | 'md' | 'lg';
	className?: string;
}> = React.memo(({ userName, dotSize = 'md', className = '' }) => (
	<div className={`flex items-center space-x-2 ${className}`}>
		<TypingDots size={dotSize} />
		<span className="select-none text-sm text-gray-500">
			{userName} is typing...
		</span>
	</div>
));

TypingIndicator.displayName = 'TypingIndicator';

export default TypingDots;
