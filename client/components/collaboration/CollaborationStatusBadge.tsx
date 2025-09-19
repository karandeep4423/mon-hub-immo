import React from 'react';
import { StatusBadge } from '../ui/StatusBadge';
import { StatusType } from '../../lib/constants/statusColors';

interface CollaborationStatusBadgeProps {
	status: StatusType;
	className?: string;
}

export const CollaborationStatusBadge: React.FC<
	CollaborationStatusBadgeProps
> = ({ status, className = '' }) => {
	return <StatusBadge status={status} className={className} />;
};
