import React from 'react';

interface CollaborationStatusBadgeProps {
	status:
		| 'pending'
		| 'accepted'
		| 'active'
		| 'completed'
		| 'cancelled'
		| 'rejected';
	className?: string;
}

export const CollaborationStatusBadge: React.FC<
	CollaborationStatusBadgeProps
> = ({ status, className = '' }) => {
	const getStatusConfig = () => {
		switch (status) {
			case 'pending':
				return {
					text: 'En attente',
					bgColor: 'bg-yellow-100',
					textColor: 'text-yellow-800',
					borderColor: 'border-yellow-200',
				};
			case 'accepted':
				return {
					text: 'Acceptée',
					bgColor: 'bg-blue-100',
					textColor: 'text-blue-800',
					borderColor: 'border-blue-200',
				};
			case 'active':
				return {
					text: 'Active',
					bgColor: 'bg-green-100',
					textColor: 'text-green-800',
					borderColor: 'border-green-200',
				};
			case 'completed':
				return {
					text: 'Terminée',
					bgColor: 'bg-gray-100',
					textColor: 'text-gray-800',
					borderColor: 'border-gray-200',
				};
			case 'rejected':
				return {
					text: 'Refusée',
					bgColor: 'bg-red-100',
					textColor: 'text-red-800',
					borderColor: 'border-red-200',
				};
			case 'cancelled':
				return {
					text: 'Annulée',
					bgColor: 'bg-gray-100',
					textColor: 'text-gray-600',
					borderColor: 'border-gray-200',
				};
			default:
				return {
					text: status,
					bgColor: 'bg-gray-100',
					textColor: 'text-gray-800',
					borderColor: 'border-gray-200',
				};
		}
	};

	const config = getStatusConfig();

	return (
		<span
			className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${config.bgColor} ${config.textColor} ${config.borderColor} ${className}`}
		>
			{config.text}
		</span>
	);
};
