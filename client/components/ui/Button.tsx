// components/ui/Button.tsx
import React from 'react';
import { ButtonLoader } from './LoadingSpinner';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
	variant?: 'primary' | 'secondary' | 'outline';
	size?: 'sm' | 'md' | 'lg';
	loading?: boolean;
	children: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
	variant = 'primary',
	size = 'md',
	loading = false,
	children,
	className = '',
	disabled,
	...props
}) => {
	const baseClasses =
		'inline-flex items-center justify-center rounded-xl font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 active:scale-95';

	const variantClasses = {
		primary:
			'bg-brand-600 text-white hover:bg-brand-700 focus:ring-brand-600 shadow-lg hover:shadow-xl',
		secondary:
			'bg-gray-600 text-white hover:bg-gray-700 focus:ring-gray-500',
		outline:
			'border-2 border-gray-300 text-gray-700 hover:bg-gray-50 focus:ring-brand-600',
	};

	const sizeClasses = {
		sm: 'px-4 py-2 text-sm h-10',
		md: 'px-6 py-3 text-base h-12',
		lg: 'px-8 py-4 text-lg h-14 sm:h-12 sm:text-base', // Larger on mobile
	};

	return (
		<button
			className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
			disabled={disabled || loading}
			{...props}
		>
			{loading && <ButtonLoader />}
			{children}
		</button>
	);
};
