import React from 'react';
import { StatusBadge } from '../ui/StatusBadge';

interface CollaborationStatusBadgeProps {
	status: string;
	className?: string;
}

export const CollaborationStatusBadge: React.FC<
	CollaborationStatusBadgeProps
> = ({ status, className = '' }) => {
	return (
		<StatusBadge
			entityType="collaboration"
			status={status}
			className={className}
		/>
	);
};
