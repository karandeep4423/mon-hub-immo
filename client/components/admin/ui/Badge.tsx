import React from 'react';

interface BadgeProps {
	label: string;
	variant?: 'success' | 'warning' | 'error' | 'info' | 'default';
	size?: 'sm' | 'md' | 'lg';
	icon?: React.ReactNode;
}

const variantClasses = {
	success: 'bg-emerald-100 text-emerald-700 border-emerald-200',
	warning: 'bg-amber-100 text-amber-700 border-amber-200',
	error: 'bg-red-100 text-red-700 border-red-200',
	info: 'bg-blue-100 text-blue-700 border-blue-200',
	default: 'bg-gray-100 text-gray-700 border-gray-200',
};

const sizeClasses = {
	sm: 'px-2 py-1 text-xs',
	md: 'px-3 py-1.5 text-sm',
	lg: 'px-4 py-2 text-base',
};

export const Badge: React.FC<BadgeProps> = ({
	label,
	variant = 'default',
	size = 'md',
	icon,
}) => {
	return (
		<span className={`inline-flex items-center gap-1 rounded-full font-medium border ${variantClasses[variant]} ${sizeClasses[size]}`}>
			{icon && <span>{icon}</span>}
			{label}
		</span>
	);
};

export default Badge;
