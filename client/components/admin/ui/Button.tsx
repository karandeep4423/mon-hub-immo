import React from 'react';
import { designTokens } from '@/lib/constants/designTokens';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
	variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
	size?: 'sm' | 'md' | 'lg';
	icon?: React.ReactNode;
	loading?: boolean;
}

const variantClasses = {
	primary: 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white hover:shadow-lg hover:scale-105',
	secondary: 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white hover:shadow-lg hover:scale-105',
	outline: 'border-2 border-gray-300 text-gray-700 hover:border-cyan-500 hover:text-cyan-600',
	ghost: 'text-gray-700 hover:bg-gray-100',
	danger: 'bg-red-500 text-white hover:bg-red-600 hover:shadow-lg',
};

const sizeClasses = {
	sm: 'px-3 py-1.5 text-sm',
	md: 'px-4 py-2 text-base',
	lg: 'px-6 py-3 text-lg',
};

export const Button: React.FC<ButtonProps> = ({
	variant = 'primary',
	size = 'md',
	icon,
	loading,
	children,
	className,
	...props
}) => {
	return (
		<button
			{...props}
			className={`
				inline-flex items-center gap-2 rounded-lg font-semibold transition-all duration-300
				disabled:opacity-50 disabled:cursor-not-allowed
				${variantClasses[variant]} ${sizeClasses[size]} ${className || ''}
			`}
			disabled={loading || props.disabled}
		>
			{loading ? (
				<span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
			) : icon ? (
				icon
			) : null}
			{children}
		</button>
	);
};

export default Button;
