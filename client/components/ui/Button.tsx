// components/ui/Button.tsx
import React from 'react';
import { ButtonLoader } from './LoadingSpinner';
import { UI } from '@/lib/constants/components';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
	variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'success' | 'accent';
	size?: 'sm' | 'md' | 'lg' | 'xl';
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
	return (
		<button
			className={`${UI.BUTTON_BASE_CLASSES} ${UI.BUTTON_VARIANT_CLASSES[variant]} ${UI.BUTTON_SIZE_CLASSES[size]} ${className}`}
			disabled={disabled || loading}
			{...props}
		>
			{loading && <ButtonLoader />}
			{children}
		</button>
	);
};
