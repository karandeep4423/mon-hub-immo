import React from 'react';

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
	variant?:
		| 'text'
		| 'title'
		| 'avatar'
		| 'image'
		| 'button'
		| 'card'
		| 'rectangle';
	width?: string;
	height?: string;
	rounded?: 'none' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
}

const variantClasses = {
	text: 'h-4 w-full',
	title: 'h-6 w-3/4',
	avatar: 'h-12 w-12 rounded-full',
	image: 'h-48 w-full',
	button: 'h-12 w-32 rounded-xl',
	card: 'h-64 w-full rounded-2xl',
	rectangle: 'h-full w-full',
};

const roundedClasses = {
	none: 'rounded-none',
	sm: 'rounded-sm',
	md: 'rounded-md',
	lg: 'rounded-lg',
	xl: 'rounded-xl',
	'2xl': 'rounded-2xl',
	full: 'rounded-full',
};

export const SkeletonLoader: React.FC<SkeletonProps> = ({
	variant = 'rectangle',
	width,
	height,
	rounded = 'md',
	className = '',
	...props
}) => {
	const variantClass = variantClasses[variant];
	const roundedClass = roundedClasses[rounded];

	const style: React.CSSProperties = {
		...(width && { width }),
		...(height && { height }),
	};

	return (
		<div
			className={`animate-shimmer bg-gray-200 ${variantClass} ${roundedClass} ${className}`}
			style={style}
			{...props}
		/>
	);
};

// Preset skeleton components for common use cases
export const SkeletonText: React.FC<{ lines?: number; className?: string }> = ({
	lines = 1,
	className = '',
}) => (
	<div className={`space-y-2 ${className}`}>
		{Array.from({ length: lines }).map((_, i) => (
			<SkeletonLoader
				key={i}
				variant="text"
				width={i === lines - 1 ? '80%' : '100%'}
			/>
		))}
	</div>
);

export const SkeletonCard: React.FC<{ className?: string }> = ({
	className = '',
}) => (
	<div className={`bg-white rounded-2xl shadow-card p-6 ${className}`}>
		<SkeletonLoader variant="image" className="mb-4" />
		<SkeletonLoader variant="title" className="mb-3" />
		<SkeletonText lines={3} />
		<div className="flex gap-2 mt-4">
			<SkeletonLoader variant="button" />
			<SkeletonLoader variant="button" />
		</div>
	</div>
);

export const SkeletonAvatar: React.FC<{
	size?: 'sm' | 'md' | 'lg';
	className?: string;
}> = ({ size = 'md', className = '' }) => {
	const sizeClasses = {
		sm: 'h-8 w-8',
		md: 'h-12 w-12',
		lg: 'h-16 w-16',
	};

	return (
		<SkeletonLoader
			rounded="full"
			className={`${sizeClasses[size]} ${className}`}
		/>
	);
};

export const SkeletonTable: React.FC<{
	rows?: number;
	columns?: number;
	className?: string;
}> = ({ rows = 5, columns = 4, className = '' }) => (
	<div className={`space-y-3 ${className}`}>
		<div
			className="grid gap-4"
			style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}
		>
			{Array.from({ length: columns }).map((_, i) => (
				<SkeletonLoader key={i} variant="title" />
			))}
		</div>
		{Array.from({ length: rows }).map((_, rowIndex) => (
			<div
				key={rowIndex}
				className="grid gap-4"
				style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}
			>
				{Array.from({ length: columns }).map((_, colIndex) => (
					<SkeletonLoader key={colIndex} variant="text" />
				))}
			</div>
		))}
	</div>
);
