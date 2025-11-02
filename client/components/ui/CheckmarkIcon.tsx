import React from 'react';
import { UI } from '@/lib/constants/components';

interface CheckmarkIconProps {
	className?: string;
	size?: 'sm' | 'md' | 'lg';
}

export const CheckmarkIcon: React.FC<CheckmarkIconProps> = ({
	className = '',
	size = 'md',
}) => {
	return (
		<svg
			className={`${UI.ICON_SIZE_CLASSES[size]} ${className}`}
			fill="none"
			stroke="currentColor"
			viewBox={UI.CHECKMARK_ICON.viewBox}
			aria-label={UI.CHECKMARK_ICON.ariaLabel}
		>
			<path
				strokeLinecap="round"
				strokeLinejoin="round"
				strokeWidth={UI.CHECKMARK_ICON.strokeWidth}
				d={UI.CHECKMARK_ICON.path}
			/>
		</svg>
	);
};
