import { LocationSearchWithRadius } from '@/components/ui';
import type { LocationItem } from '@/components/ui/LocationSearchWithRadius';

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
	priceFilter: { min: number; max: number };
	onPriceFilterChange: (filter: { min: number; max: number }) => void;
	surfaceFilter: { min: number; max: number };
	onSurfaceFilterChange: (filter: { min: number; max: number }) => void;
	filteredPropertiesCount: number;
	filteredSearchAdsCount: number;
	isAuthenticated: boolean;
	hasMyArea: boolean;
	myAreaLocationsCount: number;
	favoritePropertyIds: Set<string>;
	favoriteSearchAdIds: Set<string>;
}

export const SearchFiltersPanel = ({
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
	myAreaLocationsCount,
	favoritePropertyIds,
	favoriteSearchAdIds,
}: SearchFiltersPanelProps) => {
	return (
		<div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
			{/* Text Search */}
			<div className="mb-4">
				<input
					type="text"
					value={searchTerm}
					onChange={(e) => onSearchTermChange(e.target.value)}
					placeholder="Rechercher par mot-clé..."
					className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand focus:border-brand"
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
					className={`px-4 py-2 rounded-lg font-medium transition-colors ${
						contentFilter === 'all'
							? 'bg-brand text-white'
							: 'bg-gray-100 text-gray-700 hover:bg-gray-200'
					}`}
				>
					Tout ({filteredPropertiesCount + filteredSearchAdsCount})
				</button>
				{isAuthenticated && hasMyArea && (
					<button
						onClick={() => onContentFilterChange('myArea')}
						className={`px-4 py-2 rounded-lg font-medium transition-colors ${
							contentFilter === 'myArea'
								? 'bg-brand text-white'
								: 'bg-gray-100 text-gray-700 hover:bg-gray-200'
						}`}
					>
						Mon secteur ({myAreaLocationsCount} villes)
					</button>
				)}
				<button
					onClick={() => onContentFilterChange('properties')}
					className={`px-4 py-2 rounded-lg font-medium transition-colors ${
						contentFilter === 'properties'
							? 'bg-brand text-white'
							: 'bg-gray-100 text-gray-700 hover:bg-gray-200'
					}`}
				>
					Biens à vendre ({filteredPropertiesCount})
				</button>
				<button
					onClick={() => onContentFilterChange('searchAds')}
					className={`px-4 py-2 rounded-lg font-medium transition-colors ${
						contentFilter === 'searchAds'
							? 'bg-brand text-white'
							: 'bg-gray-100 text-gray-700 hover:bg-gray-200'
					}`}
				>
					Recherche de biens ({filteredSearchAdsCount})
				</button>
				{isAuthenticated && (
					<button
						onClick={() => onContentFilterChange('favorites')}
						className={`px-4 py-2 rounded-lg font-medium transition-colors ${
							contentFilter === 'favorites'
								? 'bg-brand text-white'
								: 'bg-gray-100 text-gray-700 hover:bg-gray-200'
						}`}
					>
						Favoris (
						{favoritePropertyIds.size + favoriteSearchAdIds.size})
					</button>
				)}
			</div>

			{/* Property-specific Filters */}
			{(contentFilter === 'all' ||
				contentFilter === 'properties' ||
				contentFilter === 'favorites') && (
				<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
					<select
						value={typeFilter}
						onChange={(e) => onTypeFilterChange(e.target.value)}
						className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand"
					>
						<option value="">Type de bien</option>
						<option value="Appartement">Appartement</option>
						<option value="Maison">Maison</option>
						<option value="Terrain">Terrain</option>
						<option value="Local commercial">
							Local commercial
						</option>
						<option value="Bureaux">Bureaux</option>
						<option value="Parking">Parking</option>
						<option value="Autre">Autre</option>
					</select>

					<select
						value={profileFilter}
						onChange={(e) => onProfileFilterChange(e.target.value)}
						className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand"
					>
						<option value="">Tous les profils</option>
						<option value="agent">Agent</option>
						<option value="apporteur">Apporteur</option>
					</select>

					<div className="flex items-center gap-2">
						<input
							type="number"
							placeholder="Prix min"
							value={priceFilter.min || ''}
							onChange={(e) =>
								onPriceFilterChange({
									...priceFilter,
									min: parseInt(e.target.value) || 0,
								})
							}
							className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand"
						/>
						<span className="text-gray-500">-</span>
						<input
							type="number"
							placeholder="Prix max"
							value={
								priceFilter.max === 10000000
									? ''
									: priceFilter.max
							}
							onChange={(e) =>
								onPriceFilterChange({
									...priceFilter,
									max: parseInt(e.target.value) || 10000000,
								})
							}
							className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand"
						/>
					</div>

					{/* Surface habitable */}
					<div className="flex items-center gap-2">
						<input
							type="number"
							placeholder="Surface min (m²)"
							value={surfaceFilter.min || ''}
							onChange={(e) =>
								onSurfaceFilterChange({
									...surfaceFilter,
									min: parseInt(e.target.value) || 0,
								})
							}
							className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand"
						/>
						<span className="text-gray-500">-</span>
						<input
							type="number"
							placeholder="Surface max (m²)"
							value={
								surfaceFilter.max === 100000
									? ''
									: surfaceFilter.max
							}
							onChange={(e) =>
								onSurfaceFilterChange({
									...surfaceFilter,
									max: parseInt(e.target.value) || 100000,
								})
							}
							className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand"
						/>
					</div>
				</div>
			)}
		</div>
	);
};
