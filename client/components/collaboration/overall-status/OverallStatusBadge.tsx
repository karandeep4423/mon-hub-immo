import React from 'react';
import { StatusBadge } from '../../ui/StatusBadge';
import { OverallStatusBadgeProps } from './types';

export const OverallStatusBadge: React.FC<OverallStatusBadgeProps> = ({
	status,
	size = 'md',
}) => {
	return <StatusBadge status={status} size={size} />;
};
