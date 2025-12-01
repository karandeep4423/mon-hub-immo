import React from 'react';
import { LocationSearchWithRadius } from '@/components/ui';
import type { LocationItem } from '@/components/ui/LocationSearchWithRadius';
import {
	validatePriceInput,
	validateSurfaceInput,
} from '@/lib/utils/filterValidation';
import { FILTER_DEFAULTS } from '@/lib/constants/filters';
import { PROPERTY_TYPES } from '@/lib/constants/features/properties';
import type { PriceRange, SurfaceRange } from '@/types/filters';
import { Select } from '@/components/ui/CustomSelect';

type ContentFilter =
	| 'all'
	| 'myArea'
	| 'properties'
	| 'searchAds'
	| 'favorites';

interface SearchFiltersPanelProps {
	searchTerm: string;
	onSearchTermChange: (value: string) => void;
	selectedLocations: LocationItem[];
	onLocationsChange: (locations: LocationItem[]) => void;
	radiusKm: number;
	onRadiusChange: (radius: number) => void;
	contentFilter: ContentFilter;
	onContentFilterChange: (filter: ContentFilter) => void;
	typeFilter: string;
	onTypeFilterChange: (type: string) => void;
	profileFilter: string;
	onProfileFilterChange: (profile: string) => void;
	priceFilter: PriceRange;
	onPriceFilterChange: (filter: PriceRange) => void;
	surfaceFilter: SurfaceRange;
	onSurfaceFilterChange: (filter: SurfaceRange) => void;
	filteredPropertiesCount: number;
	filteredSearchAdsCount: number;
	isAuthenticated: boolean;
	hasMyArea: boolean;
	myAreaCount: number;
	favoritePropertyIds: Set<string>;
	favoriteSearchAdIds: Set<string>;
}

const SearchFiltersPanelComponent = ({
	searchTerm,
	onSearchTermChange,
	selectedLocations,
	onLocationsChange,
	radiusKm,
	onRadiusChange,
	contentFilter,
	onContentFilterChange,
	typeFilter,
	onTypeFilterChange,
	profileFilter,
	onProfileFilterChange,
	priceFilter,
	onPriceFilterChange,
	surfaceFilter,
	onSurfaceFilterChange,
	filteredPropertiesCount,
	filteredSearchAdsCount,
	isAuthenticated,
	hasMyArea,
	myAreaCount,
	favoritePropertyIds,
	favoriteSearchAdIds,
}: SearchFiltersPanelProps) => {
	return (
		<div className="bg-white rounded-lg shadow-sm border p-4 sm:p-6 mb-6">
			{/* Text Search */}
			<div className="mb-4">
				<input
					type="text"
					value={searchTerm}
					onChange={(e) => onSearchTermChange(e.target.value)}
					placeholder="Rechercher par mot-clé..."
					className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand focus:border-brand transition-smooth"
				/>
			</div>

			{/* Location Search with Radius */}
			<div className="mb-4">
				<LocationSearchWithRadius
					selectedLocations={selectedLocations}
					onLocationsChange={onLocationsChange}
					radiusKm={radiusKm}
					onRadiusChange={onRadiusChange}
					placeholder="Ville ou code postal (ex: Dinan, 22100)"
				/>
			</div>

			{/* Content Type Filter */}
			<div className="flex flex-wrap gap-2 mb-4">
				<button
					onClick={() => onContentFilterChange('all')}
					className={`px-3 sm:px-4 py-2 rounded-lg font-medium text-sm transition-smooth whitespace-nowrap ${
						contentFilter === 'all'
							? 'bg-brand text-white shadow-md'
							: 'bg-gray-100 text-gray-700 hover:bg-gray-200 hover:shadow-sm'
					}`}
				>
					Tout ({filteredPropertiesCount + filteredSearchAdsCount})
				</button>
				{isAuthenticated && hasMyArea && (
					<button
						onClick={() => onContentFilterChange('myArea')}
						className={`px-3 sm:px-4 py-2 rounded-lg font-medium text-sm transition-smooth whitespace-nowrap ${
							contentFilter === 'myArea'
								? 'bg-brand text-white shadow-md'
								: 'bg-gray-100 text-gray-700 hover:bg-gray-200 hover:shadow-sm'
						}`}
					>
						Mon secteur ({myAreaCount})
					</button>
				)}
				<button
					onClick={() => onContentFilterChange('properties')}
					className={`px-3 sm:px-4 py-2 rounded-lg font-medium text-sm transition-smooth whitespace-nowrap ${
						contentFilter === 'properties'
							? 'bg-brand text-white shadow-md'
							: 'bg-gray-100 text-gray-700 hover:bg-gray-200 hover:shadow-sm'
					}`}
				>
					Biens ({filteredPropertiesCount})
				</button>
				<button
					onClick={() => onContentFilterChange('searchAds')}
					className={`px-3 sm:px-4 py-2 rounded-lg font-medium text-sm transition-smooth whitespace-nowrap ${
						contentFilter === 'searchAds'
							? 'bg-brand text-white shadow-md'
							: 'bg-gray-100 text-gray-700 hover:bg-gray-200 hover:shadow-sm'
					}`}
				>
					Recherches ({filteredSearchAdsCount})
				</button>
				{isAuthenticated && (
					<button
						onClick={() => onContentFilterChange('favorites')}
						className={`px-3 sm:px-4 py-2 rounded-lg font-medium text-sm transition-smooth whitespace-nowrap ${
							contentFilter === 'favorites'
								? 'bg-brand text-white shadow-md'
								: 'bg-gray-100 text-gray-700 hover:bg-gray-200 hover:shadow-sm'
						}`}
					>
						Favoris (
						{favoritePropertyIds.size + favoriteSearchAdIds.size})
					</button>
				)}
			</div>

			{/* Filters - Always visible for all content types */}
			<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
				<Select
					value={typeFilter}
					onChange={(value) => onTypeFilterChange(value)}
					options={[
						{ value: '', label: 'Type de bien' },
						...PROPERTY_TYPES.map((type) => ({
							value: type,
							label: type,
						})),
					]}
				/>
				<Select
					value={profileFilter}
					onChange={(value) => onProfileFilterChange(value)}
					options={[
						{ value: '', label: 'Tous les profils' },
						{ value: 'agent', label: 'Agent' },
						{ value: 'apporteur', label: 'Apporteur' },
					]}
				/>{' '}
				<div className="flex items-center gap-1 sm:gap-2">
					<input
						type="number"
						placeholder="Prix min"
						value={priceFilter.min === 0 ? '' : priceFilter.min}
						onChange={(e) => {
							const validated = validatePriceInput(
								e.target.value,
								'min',
								priceFilter,
							);
							onPriceFilterChange(validated);
						}}
						className="w-full px-2 sm:px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand transition-smooth"
					/>
					<span className="text-gray-500 flex-shrink-0">-</span>
					<input
						type="number"
						placeholder="Prix max"
						value={
							priceFilter.max === FILTER_DEFAULTS.PRICE_MAX
								? ''
								: priceFilter.max
						}
						onChange={(e) => {
							const validated = validatePriceInput(
								e.target.value,
								'max',
								priceFilter,
							);
							onPriceFilterChange(validated);
						}}
						className="w-full px-2 sm:px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand transition-smooth"
					/>
				</div>
				{/* Surface habitable */}
				<div className="flex items-center gap-1 sm:gap-2">
					<input
						type="number"
						placeholder="Min m²"
						value={surfaceFilter.min === 0 ? '' : surfaceFilter.min}
						onChange={(e) => {
							const validated = validateSurfaceInput(
								e.target.value,
								'min',
								surfaceFilter,
							);
							onSurfaceFilterChange(validated);
						}}
						className="w-full px-2 sm:px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand transition-smooth"
					/>
					<span className="text-gray-500 flex-shrink-0">-</span>
					<input
						type="number"
						placeholder="Max m²"
						value={
							surfaceFilter.max === FILTER_DEFAULTS.SURFACE_MAX
								? ''
								: surfaceFilter.max
						}
						onChange={(e) => {
							const validated = validateSurfaceInput(
								e.target.value,
								'max',
								surfaceFilter,
							);
							onSurfaceFilterChange(validated);
						}}
						className="w-full px-2 sm:px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand transition-smooth"
					/>
				</div>
			</div>
		</div>
	);
};

/**
 * Memoized SearchFiltersPanel to prevent unnecessary re-renders
 * Only re-renders when props actually change
 */
export const SearchFiltersPanel = React.memo(
	SearchFiltersPanelComponent,
	(prevProps, nextProps) => {
		// Custom comparison for better performance
		// Return true if props are equal (skip render), false if different (re-render)
		return (
			prevProps.searchTerm === nextProps.searchTerm &&
			prevProps.typeFilter === nextProps.typeFilter &&
			prevProps.radiusKm === nextProps.radiusKm &&
			prevProps.profileFilter === nextProps.profileFilter &&
			prevProps.contentFilter === nextProps.contentFilter &&
			prevProps.priceFilter.min === nextProps.priceFilter.min &&
			prevProps.priceFilter.max === nextProps.priceFilter.max &&
			prevProps.surfaceFilter.min === nextProps.surfaceFilter.min &&
			prevProps.surfaceFilter.max === nextProps.surfaceFilter.max &&
			prevProps.filteredPropertiesCount ===
				nextProps.filteredPropertiesCount &&
			prevProps.filteredSearchAdsCount ===
				nextProps.filteredSearchAdsCount &&
			prevProps.isAuthenticated === nextProps.isAuthenticated &&
			prevProps.hasMyArea === nextProps.hasMyArea &&
			prevProps.myAreaCount === nextProps.myAreaCount &&
			prevProps.favoritePropertyIds.size ===
				nextProps.favoritePropertyIds.size &&
			prevProps.favoriteSearchAdIds.size ===
				nextProps.favoriteSearchAdIds.size &&
			prevProps.selectedLocations.length ===
				nextProps.selectedLocations.length &&
			prevProps.selectedLocations.every(
				(loc, idx) =>
					loc.value === nextProps.selectedLocations[idx]?.value,
			)
		);
	},
);

SearchFiltersPanel.displayName = 'SearchFiltersPanel';
