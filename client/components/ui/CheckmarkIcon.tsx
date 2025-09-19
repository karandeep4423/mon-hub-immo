import React from 'react';

interface CheckmarkIconProps {
	className?: string;
	size?: 'sm' | 'md' | 'lg';
}

export const CheckmarkIcon: React.FC<CheckmarkIconProps> = ({
	className = '',
	size = 'md',
}) => {
	const sizeClasses = {
		sm: 'w-4 h-4',
		md: 'w-5 h-5',
		lg: 'w-6 h-6',
	};

	return (
		<svg
			className={`${sizeClasses[size]} ${className}`}
			fill="none"
			stroke="currentColor"
			viewBox="0 0 24 24"
			aria-label="Completed"
		>
			<path
				strokeLinecap="round"
				strokeLinejoin="round"
				strokeWidth="2"
				d="M5 13l4 4L19 7"
			/>
		</svg>
	);
};
