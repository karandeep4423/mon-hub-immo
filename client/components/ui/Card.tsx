import React from 'react';

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
	const paddingClasses = {
		none: '',
		sm: 'p-3',
		md: 'p-6',
		lg: 'p-8',
	};

	const shadowClasses = {
		none: '',
		sm: 'shadow-sm',
		md: 'shadow-md',
		lg: 'shadow-lg',
	};

	const roundedClasses = {
		none: '',
		sm: 'rounded-sm',
		md: 'rounded-md',
		lg: 'rounded-lg',
		xl: 'rounded-xl',
	};

	const hoverClass = hover ? 'hover:shadow-md transition-shadow' : '';

	return (
		<div
			className={`bg-white border border-gray-200 ${paddingClasses[padding]} ${shadowClasses[shadow]} ${roundedClasses[rounded]} ${hoverClass} ${className}`}
		>
			{children}
		</div>
	);
};
