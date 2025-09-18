import React from 'react';
import {
	OVERALL_STATUS_CONFIG,
	OverallStatusBadgeProps,
} from './types';

export const OverallStatusBadge: React.FC<OverallStatusBadgeProps> = ({
	status,
	size = 'md',
}) => {
	const config = OVERALL_STATUS_CONFIG[status];

	const sizeClasses = {
		sm: 'text-xs px-2 py-1',
		md: 'text-sm px-3 py-1',
		lg: 'text-base px-4 py-2',
	};

	return (
		<span
			className={`
				inline-flex items-center rounded-full font-medium
				${config.bgColor} ${config.textColor} ${config.borderColor}
				${sizeClasses[size]}
				border
			`}
		>
			{config.label}
		</span>
	);
};
