import { useMemo, useState } from 'react';
import { Property } from '@/lib/api/propertyApi';
import { PropertyFiltersState } from '@/components/property/PropertyFilters';

interface UsePropertyFiltersOptions {
	properties: Property[];
}

interface UsePropertyFiltersReturn {
	filteredProperties: Property[];
	filters: PropertyFiltersState;
	setFilters: React.Dispatch<React.SetStateAction<PropertyFiltersState>>;
	resetFilters: () => void;
	hasActiveFilters: boolean;
}

const initialFilters: PropertyFiltersState = {
	searchTerm: '',
	statusFilter: 'all',
	propertyTypeFilter: 'all',
	transactionTypeFilter: 'all',
};

export const usePropertyFilters = ({
	properties,
}: UsePropertyFiltersOptions): UsePropertyFiltersReturn => {
	const [filters, setFilters] =
		useState<PropertyFiltersState>(initialFilters);

	// Filter and search properties
	const filteredProperties = useMemo(() => {
		return properties.filter((property) => {
			// Status filter
			if (
				filters.statusFilter !== 'all' &&
				property.status !== filters.statusFilter
			) {
				return false;
			}

			// Property type filter
			if (
				filters.propertyTypeFilter !== 'all' &&
				property.propertyType !== filters.propertyTypeFilter
			) {
				return false;
			}

			// Transaction type filter
			if (
				filters.transactionTypeFilter !== 'all' &&
				property.transactionType !== filters.transactionTypeFilter
			) {
				return false;
			}

			// Search filter (title, city, or description)
			if (filters.searchTerm) {
				const searchLower = filters.searchTerm.toLowerCase();
				return (
					property.title.toLowerCase().includes(searchLower) ||
					property.city.toLowerCase().includes(searchLower) ||
					property.description.toLowerCase().includes(searchLower)
				);
			}

			return true;
		});
	}, [properties, filters]);

	// Reset all filters
	const resetFilters = () => {
		setFilters(initialFilters);
	};

	// Check if any filters are active
	const hasActiveFilters =
		filters.searchTerm !== '' ||
		filters.statusFilter !== 'all' ||
		filters.propertyTypeFilter !== 'all' ||
		filters.transactionTypeFilter !== 'all';

	return {
		filteredProperties,
		filters,
		setFilters,
		resetFilters,
		hasActiveFilters,
	};
};
