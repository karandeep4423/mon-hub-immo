import React from 'react';
import { Button } from '@/components/ui';

export interface PropertyFiltersState {
	searchTerm: string;
	statusFilter: string;
	propertyTypeFilter: string;
	transactionTypeFilter: string;
}

interface PropertyFiltersProps {
	filters: PropertyFiltersState;
	onFiltersChange: (filters: PropertyFiltersState) => void;
	onReset: () => void;
	hasActiveFilters: boolean;
	resultsCount?: number;
	totalCount?: number;
}

export const PropertyFilters: React.FC<PropertyFiltersProps> = ({
	filters,
	onFiltersChange,
	onReset,
	hasActiveFilters,
	resultsCount,
	totalCount,
}) => {
	const handleSearchChange = (value: string) => {
		onFiltersChange({ ...filters, searchTerm: value });
	};

	const handleStatusChange = (value: string) => {
		onFiltersChange({ ...filters, statusFilter: value });
	};

	const handlePropertyTypeChange = (value: string) => {
		onFiltersChange({ ...filters, propertyTypeFilter: value });
	};

	const handleTransactionTypeChange = (value: string) => {
		onFiltersChange({ ...filters, transactionTypeFilter: value });
	};

	return (
		<div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mb-6">
			<div className="flex flex-wrap gap-4 items-center">
				{/* Search Input */}
				<div className="flex-1 min-w-[200px]">
					<div className="relative">
						<input
							type="text"
							placeholder="Rechercher par titre, ville ou description..."
							value={filters.searchTerm}
							onChange={(e) => handleSearchChange(e.target.value)}
							className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
						/>
						<div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
							<svg
								className="h-5 w-5 text-gray-400"
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
				</div>

				{/* Status Filter */}
				<div className="w-full lg:w-48">
					<select
						value={filters.statusFilter}
						onChange={(e) => handleStatusChange(e.target.value)}
						className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
					>
						<option value="all">Tous les statuts</option>
						<option value="draft">Brouillon</option>
						<option value="active">Actif</option>
						<option value="sold">Vendu</option>
						<option value="rented">Loué</option>
						<option value="archived">Archivé</option>
					</select>
				</div>

				{/* Property Type Filter */}
				<div className="w-full lg:w-48">
					<select
						value={filters.propertyTypeFilter}
						onChange={(e) =>
							handlePropertyTypeChange(e.target.value)
						}
						className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
					>
						<option value="all">Tous les types</option>
						<option value="Appartement">Appartement</option>
						<option value="Maison">Maison</option>
						<option value="Terrain">Terrain</option>
						<option value="Local commercial">
							Local commercial
						</option>
						<option value="Bureaux">Bureaux</option>
					</select>
				</div>

				{/* Transaction Type Filter */}
				<div className="w-full lg:w-40">
					<select
						value={filters.transactionTypeFilter}
						onChange={(e) =>
							handleTransactionTypeChange(e.target.value)
						}
						className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
					>
						<option value="all">Tous</option>
						<option value="Vente">Vente</option>
						<option value="Location">Location</option>
					</select>
				</div>

				{/* Reset Filters Button */}
				{hasActiveFilters && (
					<Button
						variant="outline"
						onClick={onReset}
						className="lg:w-auto w-full"
					>
						<svg
							className="w-4 h-4 mr-2"
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24"
						>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth="2"
								d="M6 18L18 6M6 6l12 12"
							/>
						</svg>
						Réinitialiser
					</Button>
				)}
			</div>

			{/* Filter Results Count */}
			{hasActiveFilters &&
				resultsCount !== undefined &&
				totalCount !== undefined && (
					<div className="mt-4 pt-4 border-t">
						<p className="text-sm text-gray-600">
							<span className="font-semibold text-gray-900">
								{resultsCount}
							</span>{' '}
							résultat
							{resultsCount !== 1 ? 's' : ''} sur{' '}
							<span className="font-semibold text-gray-900">
								{totalCount}
							</span>{' '}
							bien{totalCount !== 1 ? 's' : ''}
						</p>
					</div>
				)}
		</div>
	);
};
