import React from 'react';
import { STATUS_COLORS, StatusType } from '../../lib/constants/statusColors';

interface StatusBadgeProps {
	status: StatusType;
	size?: 'sm' | 'md' | 'lg';
	className?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
	status,
	size = 'md',
	className = '',
}) => {
	const config = STATUS_COLORS[status];

	const sizeClasses = {
		sm: 'text-xs px-2 py-0.5',
		md: 'text-sm px-2.5 py-0.5',
		lg: 'text-base px-3 py-1',
	};

	return (
		<span
			className={`inline-flex items-center rounded-full font-medium border ${config.bg} ${config.text} ${config.border} ${sizeClasses[size]} ${className}`}
		>
			{config.label}
		</span>
	);
};
