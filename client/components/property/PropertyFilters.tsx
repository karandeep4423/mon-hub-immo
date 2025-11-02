import React from 'react';
import { Button } from '@/components/ui';
import { Select } from '@/components/ui/CustomSelect';

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
					<Select
						value={filters.statusFilter}
						onChange={handleStatusChange}
						options={[
							{ value: 'all', label: 'Tous les statuts' },
							{ value: 'draft', label: 'Brouillon' },
							{ value: 'active', label: 'Actif' },
							{ value: 'sold', label: 'Vendu' },
							{ value: 'rented', label: 'Loué' },
							{ value: 'archived', label: 'Archivé' },
						]}
					/>
				</div>
				{/* Property Type Filter */}
				<div className="w-full lg:w-48">
					<Select
						value={filters.propertyTypeFilter}
						onChange={handlePropertyTypeChange}
						options={[
							{ value: 'all', label: 'Tous les types' },
							{ value: 'Appartement', label: 'Appartement' },
							{ value: 'Maison', label: 'Maison' },
							{ value: 'Terrain', label: 'Terrain' },
							{
								value: 'Local commercial',
								label: 'Local commercial',
							},
							{ value: 'Bureaux', label: 'Bureaux' },
						]}
					/>
				</div>
				{/* Transaction Type Filter */}
				<div className="w-full lg:w-40">
					<Select
						value={filters.transactionTypeFilter}
						onChange={handleTransactionTypeChange}
						options={[
							{ value: 'all', label: 'Tous' },
							{ value: 'Vente', label: 'Vente' },
							{ value: 'Location', label: 'Location' },
						]}
					/>
				</div>{' '}
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
