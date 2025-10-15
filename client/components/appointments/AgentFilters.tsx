'use client';

import React from 'react';

interface AgentFiltersProps {
	filters: {
		search: string;
		city: string;
		postalCode: string;
		minExperience: number;
	};
	onFiltersChange: (filters: AgentFiltersProps['filters']) => void;
}

export const AgentFilters: React.FC<AgentFiltersProps> = ({
	filters,
	onFiltersChange,
}) => {
	const handleChange = (
		key: keyof typeof filters,
		value: string | number,
	) => {
		onFiltersChange({
			...filters,
			[key]: value,
		});
	};

	const handleReset = () => {
		onFiltersChange({
			search: '',
			city: '',
			postalCode: '',
			minExperience: 0,
		});
	};

	return (
		<div className="bg-white rounded-xl shadow-sm p-6 mb-8 border border-gray-200">
			<div className="flex items-center justify-between mb-4">
				<h2 className="text-lg font-semibold text-gray-900">
					Rechercher un agent
				</h2>
				<button
					onClick={handleReset}
					className="text-sm text-brand hover:text-brand-dark font-medium"
				>
					Réinitialiser
				</button>
			</div>

			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
				{/* Search by name */}
				<div>
					<label className="block text-sm font-medium text-gray-700 mb-1">
						Nom de l&apos;agent
					</label>
					<div className="relative">
						<input
							type="text"
							value={filters.search}
							onChange={(e) =>
								handleChange('search', e.target.value)
							}
							placeholder="Rechercher..."
							className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand"
						/>
						<svg
							className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2"
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24"
						>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth="2"
								d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
							/>
						</svg>
					</div>
				</div>

				{/* Filter by city */}
				<div>
					<label className="block text-sm font-medium text-gray-700 mb-1">
						Ville
					</label>
					<input
						type="text"
						value={filters.city}
						onChange={(e) => handleChange('city', e.target.value)}
						placeholder="Ex: Paris, Lyon..."
						className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand"
					/>
				</div>

				{/* Filter by postal code */}
				<div>
					<label className="block text-sm font-medium text-gray-700 mb-1">
						Code postal
					</label>
					<input
						type="text"
						value={filters.postalCode}
						onChange={(e) =>
							handleChange('postalCode', e.target.value)
						}
						placeholder="Ex: 75001"
						maxLength={5}
						className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand"
					/>
				</div>

				{/* Filter by experience */}
				<div>
					<label className="block text-sm font-medium text-gray-700 mb-1">
						Expérience minimum
					</label>
					<select
						value={filters.minExperience}
						onChange={(e) =>
							handleChange(
								'minExperience',
								parseInt(e.target.value),
							)
						}
						className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand"
					>
						<option value="0">Toutes</option>
						<option value="1">1 an et plus</option>
						<option value="3">3 ans et plus</option>
						<option value="5">5 ans et plus</option>
						<option value="10">10 ans et plus</option>
					</select>
				</div>
			</div>
		</div>
	);
};
