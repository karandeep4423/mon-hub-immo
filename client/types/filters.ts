/**
 * Filter Type Definitions
 * Centralized TypeScript interfaces for filter state management
 */

import type { LocationItem } from '@/components/ui/LocationSearchWithRadius';

/**
 * Price range filter
 */
export interface PriceRange {
	min: number;
	max: number;
}

/**
 * Surface area range filter
 */
export interface SurfaceRange {
	min: number;
	max: number;
}

/**
 * Content filter types for home page
 */
export type ContentFilter =
	| 'all'
	| 'myArea'
	| 'properties'
	| 'searchAds'
	| 'favorites';

/**
 * Complete home page filter state
 */
export interface HomeFiltersState {
	searchTerm: string;
	typeFilter: string;
	selectedLocations: LocationItem[];
	radiusKm: number;
	profileFilter: string;
	priceFilter: PriceRange;
	surfaceFilter: SurfaceRange;
	contentFilter: ContentFilter;
	propPage: number;
	adPage: number;
}

/**
 * Restoration state for managing scroll and filter restoration
 */
export interface RestorationState {
	status: 'pending' | 'in-progress' | 'complete';
	completedAt: number | null;
	skipNextReset: boolean;
	lastFiltersSignature: string | null;
}

/**
 * Filter change handlers
 */
export interface FilterHandlers {
	onSearchTermChange: (value: string) => void;
	onTypeFilterChange: (type: string) => void;
	onLocationsChange: (locations: LocationItem[]) => void;
	onRadiusChange: (radius: number) => void;
	onProfileFilterChange: (profile: string) => void;
	onPriceFilterChange: (filter: PriceRange) => void;
	onSurfaceFilterChange: (filter: SurfaceRange) => void;
	onContentFilterChange: (filter: ContentFilter) => void;
}
