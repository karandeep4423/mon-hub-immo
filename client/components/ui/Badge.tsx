import React from 'react';

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
	variant?:
		| 'primary'
		| 'secondary'
		| 'success'
		| 'warning'
		| 'error'
		| 'info'
		| 'gray';
	size?: 'sm' | 'md' | 'lg';
	children: React.ReactNode;
}

const variantClasses = {
	primary: 'bg-brand-100 text-brand-700 border-brand-200',
	secondary: 'bg-secondary-100 text-secondary-700 border-secondary-200',
	success: 'bg-success-light text-green-700 border-green-200',
	warning: 'bg-warning-light text-yellow-700 border-yellow-200',
	error: 'bg-error-light text-red-700 border-red-200',
	info: 'bg-info-light text-info border-info',
	gray: 'bg-gray-100 text-gray-700 border-gray-200',
};

const sizeClasses = {
	sm: 'px-2 py-0.5 text-xs',
	md: 'px-3 py-1 text-sm',
	lg: 'px-4 py-1.5 text-base',
};

export const Badge: React.FC<BadgeProps> = ({
	variant = 'gray',
	size = 'md',
	className = '',
	children,
	...props
}) => {
	return (
		<span
			className={`inline-flex items-center font-semibold rounded-full border ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
			{...props}
		>
			{children}
		</span>
	);
};
