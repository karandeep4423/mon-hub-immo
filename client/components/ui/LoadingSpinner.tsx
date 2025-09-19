import React from 'react';

interface LoadingSpinnerProps {
	size?: 'sm' | 'md' | 'lg' | 'xl';
	color?: 'blue' | 'white' | 'gray';
	className?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
	size = 'md',
	color = 'blue',
	className = '',
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
		<div className={`inline-block ${className}`}>
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
		</div>
	);
};

// Full screen loading component
export const FullScreenLoader: React.FC<{ message?: string }> = ({
	message = 'Loading...',
}) => {
	return (
		<div className="fixed inset-0 bg-white bg-opacity-90 flex items-center justify-center z-50">
			<div className="text-center">
				<LoadingSpinner size="xl" />
				<p className="mt-4 text-gray-600 font-medium">{message}</p>
			</div>
		</div>
	);
};

// Page loading component
export const PageLoader: React.FC<{ message?: string }> = ({
	message = 'Loading...',
}) => {
	return (
		<div className="min-h-screen bg-gray-50 flex items-center justify-center">
			<div className="text-center">
				<LoadingSpinner size="lg" />
				<p className="mt-4 text-gray-600">{message}</p>
			</div>
		</div>
	);
};

// Button loading component (for inline use)
export const ButtonLoader: React.FC = () => {
	return <LoadingSpinner size="sm" color="white" className="mr-2" />;
};
