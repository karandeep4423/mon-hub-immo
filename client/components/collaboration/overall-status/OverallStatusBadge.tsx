import React from 'react';
import { StatusBadge } from '../../ui/StatusBadge';
import { OverallStatusBadgeProps } from './types';

export const OverallStatusBadge: React.FC<OverallStatusBadgeProps> = ({
	status,
	size = 'md',
}) => {
	return (
		<StatusBadge entityType="collaboration" status={status} size={size} />
	);
};
