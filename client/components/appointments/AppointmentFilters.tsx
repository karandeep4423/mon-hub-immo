import React from 'react';

type AppointmentStatus =
	| 'pending'
	| 'confirmed'
	| 'cancelled'
	| 'completed'
	| 'rejected';

interface AppointmentFiltersProps {
	filter: AppointmentStatus | 'all';
	onFilterChange: (filter: AppointmentStatus | 'all') => void;
	counts: {
		all: number;
		pending: number;
		confirmed: number;
		cancelled: number;
		completed: number;
	};
	userType: 'agent' | 'apporteur';
}

export const AppointmentFilters: React.FC<AppointmentFiltersProps> = ({
	filter,
	onFilterChange,
	counts,
	userType,
}) => {
	const filters: { value: AppointmentStatus | 'all'; label: string }[] = [
		{ value: 'all', label: `Tous (${counts.all})` },
		{ value: 'pending', label: `En attente (${counts.pending})` },
		{ value: 'confirmed', label: `Confirmés (${counts.confirmed})` },
		...(userType === 'agent'
			? [
					{
						value: 'completed' as const,
						label: `Terminés (${counts.completed})`,
					},
				]
			: []),
		{ value: 'cancelled', label: `Annulés (${counts.cancelled})` },
	];

	return (
		<div className="flex flex-wrap gap-2">
			{filters.map(({ value, label }) => (
				<button
					key={value}
					onClick={() => onFilterChange(value)}
					className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
						filter === value
							? 'bg-brand text-white'
							: 'bg-gray-100 text-gray-700 hover:bg-gray-200'
					}`}
				>
					{label}
				</button>
			))}
		</div>
	);
};
