'use client';

import React from 'react';

// ============================================================================
// LOADING SPINNER COMPONENTS
// ============================================================================

interface LoadingSpinnerProps {
	/** Size of the spinner */
	size?: 'sm' | 'md' | 'lg';
	/** Custom color classes */
	color?: string;
	/** Custom text to display */
	text?: string;
	/** Whether to show text */
	showText?: boolean;
	/** Custom className */
	className?: string;
}

/**
 * Get spinner size classes
 */
const getSpinnerSize = (size: 'sm' | 'md' | 'lg'): string => {
	switch (size) {
		case 'sm':
			return 'h-4 w-4';
		case 'md':
			return 'h-8 w-8';
		case 'lg':
			return 'h-12 w-12';
		default:
			return 'h-8 w-8';
	}
};

/**
 * Basic Loading Spinner
 */
export const LoadingSpinner: React.FC<LoadingSpinnerProps> = React.memo(
	({
		size = 'md',
		color = 'border-blue-500',
		text = 'Loading...',
		showText = false,
		className = '',
	}) => {
		const sizeClass = getSpinnerSize(size);

		return (
			<div className={`flex items-center justify-center ${className}`}>
				<div
					className={`animate-spin rounded-full border-2 border-gray-200 border-t-transparent ${sizeClass} ${color}`}
				/>
				{showText && text && (
					<span className="ml-2 text-gray-500">{text}</span>
				)}
			</div>
		);
	},
);

LoadingSpinner.displayName = 'LoadingSpinner';

/**
 * Centered Loading with Text
 */
export const CenteredLoading: React.FC<{
	text?: string;
	className?: string;
}> = React.memo(({ text = 'Loading...', className = '' }) => (
	<div className={`flex-1 flex items-center justify-center ${className}`}>
		<div className="text-center">
			<LoadingSpinner size="md" showText />
			<p className="text-gray-500 mt-2">{text}</p>
		</div>
	</div>
));

CenteredLoading.displayName = 'CenteredLoading';

/**
 * Small inline spinner for buttons
 */
export const ButtonSpinner: React.FC<{
	color?: string;
}> = React.memo(({ color = 'border-white' }) => (
	<LoadingSpinner size="sm" color={color} />
));

ButtonSpinner.displayName = 'ButtonSpinner';
