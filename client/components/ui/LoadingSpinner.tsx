import React from 'react';

interface LoadingSpinnerProps {
	size?: 'sm' | 'md' | 'lg' | 'xl';
	color?: 'blue' | 'white' | 'gray';
	className?: string;
	message?: string;
}

// Universal base spinner component
export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
	size = 'md',
	color = 'blue',
	className = '',
	message,
}) => {
	const sizeClasses = {
		sm: 'h-4 w-4',
		md: 'h-6 w-6',
		lg: 'h-8 w-8',
		xl: 'h-12 w-12',
	};

	const colorClasses = {
		blue: 'text-brand-600',
		white: 'text-white',
		gray: 'text-gray-600',
	};

	return (
		<div
			className={`inline-flex flex-col items-center justify-center ${className}`}
		>
			<svg
				className={`animate-spin ${sizeClasses[size]} ${colorClasses[color]}`}
				xmlns="http://www.w3.org/2000/svg"
				fill="none"
				viewBox="0 0 24 24"
			>
				<circle
					className="opacity-25"
					cx="12"
					cy="12"
					r="10"
					stroke="currentColor"
					strokeWidth="4"
				/>
				<path
					className="opacity-75"
					fill="currentColor"
					d="M4 12a8 8 0 018-8v8H4z"
				/>
			</svg>
			{message && <p className="mt-3 text-sm text-gray-600">{message}</p>}
		</div>
	);
};

// Universal page/section loader - use for all loading states
export const PageLoader: React.FC<{
	message?: string;
	fullScreen?: boolean;
}> = ({ message = 'Chargement...', fullScreen = false }) => {
	const containerClass = fullScreen
		? 'min-h-screen bg-gray-50 flex items-center justify-center'
		: 'flex items-center justify-center py-12';

	return (
		<div className={containerClass}>
			<LoadingSpinner size="lg" message={message} />
		</div>
	);
};

// Universal button loader - use for all button loading states
export const ButtonLoader: React.FC = () => {
	return <LoadingSpinner size="sm" color="white" className="mr-2" />;
};
