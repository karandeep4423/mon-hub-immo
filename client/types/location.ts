// Shared location types
export interface LocationItem {
	type: 'city' | 'postalCode' | 'special';
	city?: string;
	postalCode?: string;
	display: string;
	value: string;
}

export interface LocationSearchProps {
	selectedLocations: LocationItem[];
	onLocationsChange: (locations: LocationItem[]) => void;
	placeholder?: string;
	className?: string;
}

export interface UnifiedSearchProps extends LocationSearchProps {
	searchTerm: string;
	onSearchChange: (value: string) => void;
	variant?: 'separate' | 'unified' | 'inline';
}
