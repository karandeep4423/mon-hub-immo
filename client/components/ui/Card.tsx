import React from 'react';
import { UI } from '@/lib/constants/components';

interface CardProps {
	children: React.ReactNode;
	className?: string;
	padding?: 'none' | 'sm' | 'md' | 'lg';
	shadow?: 'none' | 'sm' | 'md' | 'lg';
	rounded?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
	hover?: boolean;
}

export const Card: React.FC<CardProps> = ({
	children,
	className = '',
	padding = 'md',
	shadow = 'sm',
	rounded = 'lg',
	hover = false,
}) => {
	const hoverClass = hover ? UI.CARD_HOVER.shadow : '';

	return (
		<div
			className={`${UI.CARD_BASE_CLASSES} ${UI.CARD_PADDING_CLASSES[padding]} ${UI.CARD_SHADOW_CLASSES[shadow]} ${UI.CARD_ROUNDED_CLASSES[rounded]} ${hoverClass} ${className}`}
		>
			{children}
		</div>
	);
};
