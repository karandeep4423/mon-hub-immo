'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import { Property, PropertyFilters } from '@/lib/api/propertyApi';
import { SearchAdFilters } from '@/lib/api/searchAdApi';
import { useFavoritesStore } from '@/store/favoritesStore';
import { useAuth } from '@/hooks/useAuth';
import { useProperties } from '@/hooks/useProperties';
import { useSearchAds } from '@/hooks/useSearchAds';
import {
	GeolocationPrompt,
	ErrorBoundary,
	FilterErrorFallback,
} from '@/components/ui';
import type { LocationItem } from '@/components/ui/LocationSearchWithRadius';
import { authService } from '@/lib/api/authApi';
import { PageLoader } from '@/components/ui/LoadingSpinner';
import {
	HomeHeader,
	SearchFiltersPanel,
	PropertiesSection,
	SearchAdsSection,
} from '@/components/home';
import {
	getMunicipalitiesNearby,
	searchMunicipalities,
} from '@/lib/services/frenchAddressApi';
import {
	requestGeolocation,
	checkGeolocationPermission,
	setGeolocationPreference,
	getGeolocationPreference,
} from '@/lib/services/geolocationService';
import { logger } from '@/lib/utils/logger';
import { useDebounce } from '@/hooks/useDebounce';
import { Features } from '@/lib/constants';
import { usePageState } from '@/hooks/usePageState';
import { useScrollRestoration } from '@/hooks/useScrollRestoration';
import { FILTER_DEFAULTS } from '@/lib/constants/filters';
import type {
	ContentFilter,
	PriceRange,
	SurfaceRange,
	RestorationState,
} from '@/types/filters';

export default function Home() {
	const { user, refreshUser } = useAuth();
	const { favoritePropertyIds, favoriteSearchAdIds, initializeFavorites } =
		useFavoritesStore();
	const [searchTerm, setSearchTerm] = useState('');
	const [typeFilter, setTypeFilter] = useState('');
	const [selectedLocations, setSelectedLocations] = useState<LocationItem[]>(
		[],
	);
	const [radiusKm, setRadiusKm] = useState<number>(FILTER_DEFAULTS.RADIUS_KM);
	const [profileFilter, setProfileFilter] = useState('');
	const [priceFilter, setPriceFilter] = useState<PriceRange>({
		min: FILTER_DEFAULTS.PRICE_MIN,
		max: FILTER_DEFAULTS.PRICE_MAX,
	});
	const [surfaceFilter, setSurfaceFilter] = useState<SurfaceRange>({
		min: FILTER_DEFAULTS.SURFACE_MIN,
		max: FILTER_DEFAULTS.SURFACE_MAX,
	});
	const [contentFilter, setContentFilter] = useState<ContentFilter>('all');
	const [propPage, setPropPage] = useState(1);
	const [adPage, setAdPage] = useState(1);
	const [showGeolocationPrompt, setShowGeolocationPrompt] = useState(false);
	const [geolocationError, setGeolocationError] = useState<string | null>(
		null,
	);
	const [myAreaLocations, setMyAreaLocations] = useState<LocationItem[]>([]);
	const [isInitialLoad, setIsInitialLoad] = useState(true);

	// Simplified restoration state management
	const restorationStateRef = useRef<RestorationState>({
		status: 'pending',
		completedAt: null,
		skipNextReset: true,
		lastFiltersSignature: null,
	});

	// Persist filters and dual pagination for Home; restore window scroll
	const {
		key: pageKey,
		savedState,
		save,
	} = usePageState({
		key: 'home',
		getCurrentState: () => ({
			filters: {
				searchTerm,
				typeFilter,
				selectedLocations,
				radiusKm,
				profileFilter,
				priceFilter,
				surfaceFilter,
				contentFilter,
				propPage,
				adPage,
			},
		}),
	});

	// Debounce search term with standard delay
	const debouncedSearchTerm = useDebounce(
		searchTerm,
		Features.Common.DEBOUNCE.SEARCH,
	);

	const isAuthenticated = !!user;

	// Fetch user profile when home page loads (if cookie exists)
	useEffect(() => {
		if (!user) {
			refreshUser();
		}
	}, []); // eslint-disable-line react-hooks/exhaustive-deps

	// Restore saved filters/pages once on mount
	useEffect(() => {
		// Check what's in session storage directly
		const rawSessionData = sessionStorage.getItem(`pageState:${pageKey}`);
		logger.debug('[Home] Raw session storage:', {
			key: pageKey,
			rawData: rawSessionData,
			parsed: rawSessionData ? JSON.parse(rawSessionData) : null,
		});

		const filters =
			(savedState?.filters as Record<string, unknown>) || undefined;

		logger.debug('[Home] Restoration attempt:', {
			hasSavedState: !!savedState,
			filters,
			scrollY: savedState?.scrollY,
			scrollX: savedState?.scrollX,
			fullState: savedState,
		});

		if (!filters) {
			// No saved state, mark restoration as complete to allow normal operation
			restorationStateRef.current.status = 'complete';
			return;
		}

		// Mark that restoration is in progress to block reset effects
		restorationStateRef.current.status = 'in-progress';

		if (typeof filters.searchTerm === 'string')
			setSearchTerm(filters.searchTerm);
		if (typeof filters.typeFilter === 'string')
			setTypeFilter(filters.typeFilter);
		if (typeof filters.radiusKm === 'number') setRadiusKm(filters.radiusKm);
		if (typeof filters.profileFilter === 'string')
			setProfileFilter(filters.profileFilter);
		if (typeof filters.priceFilter === 'object' && filters.priceFilter)
			setPriceFilter(filters.priceFilter as { min: number; max: number });
		if (typeof filters.surfaceFilter === 'object' && filters.surfaceFilter)
			setSurfaceFilter(
				filters.surfaceFilter as { min: number; max: number },
			);
		if (typeof filters.contentFilter === 'string')
			setContentFilter(filters.contentFilter as ContentFilter);
		if (typeof filters.propPage === 'number') {
			logger.debug('[Home] Restoring propPage:', filters.propPage);
			setPropPage(filters.propPage);
		}
		if (typeof filters.adPage === 'number') {
			logger.debug('[Home] Restoring adPage:', filters.adPage);
			setAdPage(filters.adPage);
		}
		if (Array.isArray(filters.selectedLocations))
			setSelectedLocations(filters.selectedLocations as LocationItem[]);

		// prevent auto-activation overriding restored state
		setIsInitialLoad(false);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	// Mark restoration complete AFTER all state updates have been processed
	useEffect(() => {
		if (restorationStateRef.current.status === 'in-progress') {
			logger.debug(
				'[Home] Restoration complete - enabling normal operations',
			);
			restorationStateRef.current.status = 'complete';
			restorationStateRef.current.completedAt = Date.now();
		}
	}, [propPage, adPage, contentFilter]);

	// Save radius preference when it changes
	const handleRadiusChange = async (newRadius: number) => {
		setRadiusKm(newRadius);
		if (user) {
			try {
				await authService.updateSearchPreferences({
					preferredRadius: newRadius,
				});
			} catch (error) {
				logger.error('Error saving radius preference:', error);
			}
		}
	};

	// Reset to 'all' if favorites is selected but user is not authenticated
	useEffect(() => {
		if (contentFilter === 'favorites' && !isAuthenticated) {
			setContentFilter('all');
		}
	}, [contentFilter, isAuthenticated]);

	// Initialize favorites store when user is authenticated
	useEffect(() => {
		if (isAuthenticated) {
			initializeFavorites();
		}
	}, [isAuthenticated, initializeFavorites]);

	// Auto-activate "Mon secteur" filter for agents on initial load (skip if restored state exists)
	useEffect(() => {
		if (!user || !isInitialLoad) return;
		if (savedState?.filters) return;
		if (user.userType !== 'agent') return;

		const city = user.professionalInfo?.city;
		const postalCode = user.professionalInfo?.postalCode;

		if (!city || !postalCode) return;

		// Auto-select "Mon secteur" filter to show agent's registered city area
		setContentFilter('myArea');
		setIsInitialLoad(false);

		logger.debug(
			'[Home] Auto-activated "Mon secteur" for agent:',
			city,
			postalCode,
		);
	}, [user, isInitialLoad, savedState?.filters]);

	// Load "Mon secteur" locations from user's registered city
	useEffect(() => {
		const loadMyAreaLocations = async () => {
			if (!user) return;

			const city = user.professionalInfo?.city;
			const postalCode = user.professionalInfo?.postalCode;

			if (!city || !postalCode) return;

			try {
				logger.debug(
					'[Home] Loading "Mon secteur" locations:',
					city,
					postalCode,
				);

				// First, get the exact coordinates of the agent's city
				const citySearchResults = await searchMunicipalities(
					`${city} ${postalCode}`,
					5,
				);

				const agentCity = citySearchResults.find(
					(m) =>
						m.name.toLowerCase() === city.toLowerCase() &&
						m.postcode === postalCode,
				);

				if (!agentCity) {
					logger.error(
						'[Home] Could not find coordinates for agent city:',
						city,
						postalCode,
					);
					return;
				}

				logger.debug('[Home] Agent city coordinates:', agentCity);

				// Get all cities within 50km radius using coordinates
				const nearbyCities = await getMunicipalitiesNearby(
					agentCity.coordinates.lat,
					agentCity.coordinates.lon,
					50, // 50km radius
				);

				// Convert to LocationItem format
				const locationItems: LocationItem[] = nearbyCities.map(
					(municipality) => ({
						name: municipality.name,
						postcode: municipality.postcode,
						citycode: municipality.citycode,
						coordinates: municipality.coordinates,
						context: municipality.context,
						display: `${municipality.name} (${municipality.postcode})`,
						value: `${municipality.name}-${municipality.postcode}`,
					}),
				);

				setMyAreaLocations(locationItems);
				logger.debug(
					'[Home] "Mon secteur" locations loaded:',
					locationItems.length,
					'cities within 50km',
				);
				logger.debug(
					'[Home] Postal codes:',
					locationItems.map((l) => l.postcode),
				);
			} catch (error) {
				logger.error(
					'[Home] Error loading "Mon secteur" locations:',
					error,
				);
			}
		};

		loadMyAreaLocations();
	}, [user]);

	// Check geolocation permission and show prompt on first visit
	useEffect(() => {
		const checkAndPromptGeolocation = async () => {
			if (!user) return;

			const storedPref = getGeolocationPreference();
			if (storedPref) {
				// User already made a choice
				logger.debug(
					'[Home] Geolocation preference already set:',
					storedPref,
				);
				return;
			}

			// Check browser permission
			const permission = await checkGeolocationPermission();
			logger.debug('[Home] Geolocation permission status:', permission);

			if (permission === 'prompt') {
				// Show custom prompt
				setShowGeolocationPrompt(true);
			} else if (permission === 'granted') {
				// Auto-request location
				handleRequestGeolocation();
			}
		};

		checkAndPromptGeolocation();
	}, [user]);

	// Handle geolocation request
	const handleRequestGeolocation = async () => {
		try {
			const location = await requestGeolocation();
			setGeolocationPreference(true);
			setShowGeolocationPrompt(false);
			setGeolocationError(null);
			logger.debug('[Home] Geolocation granted:', location);
		} catch (error: unknown) {
			const err = error as { message: string };
			setGeolocationError(err.message);
			setGeolocationPreference(false);
			logger.error('[Home] Geolocation error:', err.message);
		}
	};

	// Handle geolocation denial
	const handleDenyGeolocation = () => {
		setGeolocationPreference(false);
		setShowGeolocationPrompt(false);
		logger.debug('[Home] Geolocation denied by user');
	};

	// Build property filters based on current state
	const propertyFilters = useMemo((): PropertyFilters => {
		const filters: PropertyFilters = {};
		if (debouncedSearchTerm) filters.search = debouncedSearchTerm;
		if (typeFilter) filters.propertyType = typeFilter;

		// Add location filters - use myArea locations when in "Mon secteur" mode
		const locationsToFilter =
			contentFilter === 'myArea' && myAreaLocations.length > 0
				? myAreaLocations
				: selectedLocations;

		if (locationsToFilter.length > 0) {
			const postalCodes = locationsToFilter.map((loc) => loc.postcode);
			if (postalCodes.length > 0) {
				filters.postalCode = postalCodes.join(',');
			}
		}

		if (priceFilter.min > 0) filters.minPrice = priceFilter.min;
		if (priceFilter.max < FILTER_DEFAULTS.PRICE_MAX)
			filters.maxPrice = priceFilter.max;
		if (surfaceFilter.min > 0) filters.minSurface = surfaceFilter.min;
		if (surfaceFilter.max < FILTER_DEFAULTS.SURFACE_MAX)
			filters.maxSurface = surfaceFilter.max;

		return filters;
	}, [
		debouncedSearchTerm,
		typeFilter,
		selectedLocations,
		myAreaLocations,
		contentFilter,
		priceFilter,
		surfaceFilter,
	]);

	// Build search ad filters based on current state
	const searchAdFilters = useMemo((): SearchAdFilters => {
		const filters: SearchAdFilters = {};
		if (debouncedSearchTerm) filters.search = debouncedSearchTerm;
		if (typeFilter) filters.propertyType = typeFilter;
		if (profileFilter) filters.authorType = profileFilter;

		// Add location filters - use myArea locations when in "Mon secteur" mode
		const locationsToFilter =
			contentFilter === 'myArea' && myAreaLocations.length > 0
				? myAreaLocations
				: selectedLocations;

		if (locationsToFilter.length > 0) {
			const postalCodes = locationsToFilter.map((loc) => loc.postcode);
			if (postalCodes.length > 0) {
				filters.postalCode = postalCodes.join(',');
			}
		}

		if (priceFilter.min > 0) filters.minBudget = priceFilter.min;
		if (priceFilter.max < FILTER_DEFAULTS.PRICE_MAX)
			filters.maxBudget = priceFilter.max;

		return filters;
	}, [
		debouncedSearchTerm,
		typeFilter,
		profileFilter,
		selectedLocations,
		myAreaLocations,
		contentFilter,
		priceFilter,
	]);

	// Fetch properties using SWR
	const {
		data: swrProperties,
		isLoading: loadingProperties,
		error: propertiesError,
	} = useProperties(propertyFilters);
	const properties: Property[] = swrProperties || [];

	// Fetch search ads using SWR with server-side filtering
	const {
		data: swrSearchAds = [],
		isLoading: loadingSearchAds,
		error: searchAdsError,
	} = useSearchAds(searchAdFilters);
	const searchAds = swrSearchAds || [];

	// Combined loading and error states
	const loading = loadingProperties || loadingSearchAds;
	const error = propertiesError || searchAdsError;

	// Restore scroll only after data and restored state are settled
	useScrollRestoration({
		key: pageKey,
		ready: () =>
			restorationStateRef.current.status === 'complete' && !loading,
		debug: true,
	});

	const filtersForSave = useMemo(
		() => ({
			searchTerm,
			typeFilter,
			selectedLocations,
			radiusKm,
			profileFilter,
			priceFilter,
			surfaceFilter,
			contentFilter,
		}),
		[
			searchTerm,
			typeFilter,
			selectedLocations,
			radiusKm,
			priceFilter,
			surfaceFilter,
			profileFilter,
			contentFilter,
		],
	);

	const filtersSignature = useMemo(
		() => JSON.stringify(filtersForSave),
		[filtersForSave],
	);

	// Reset pagination when filters/content change, but skip restoration-driven updates
	useEffect(() => {
		if (restorationStateRef.current.status !== 'complete') {
			logger.debug(
				'[Home] Skipping pagination reset - restoration not complete',
			);
			return;
		}

		if (restorationStateRef.current.skipNextReset) {
			restorationStateRef.current.skipNextReset = false;
			restorationStateRef.current.lastFiltersSignature = filtersSignature;
			logger.debug(
				'[Home] Skipping pagination reset - flagged to skip once',
				{ filtersSignature },
			);
			return;
		}

		// Short cooldown after restoration to allow dependent effects to settle
		if (
			restorationStateRef.current.completedAt &&
			Date.now() - restorationStateRef.current.completedAt <
				FILTER_DEFAULTS.RESTORATION_COOLDOWN_MS
		) {
			if (
				restorationStateRef.current.lastFiltersSignature !==
				filtersSignature
			) {
				restorationStateRef.current.lastFiltersSignature =
					filtersSignature;
			}
			logger.debug('[Home] Skipping pagination reset during cooldown');
			return;
		}

		if (
			restorationStateRef.current.lastFiltersSignature ===
			filtersSignature
		) {
			logger.debug('[Home] Filters unchanged; no pagination reset');
			return;
		}

		restorationStateRef.current.lastFiltersSignature = filtersSignature;
		logger.debug('[Home] Resetting pagination due to filter change');
		// Reset only the relevant pagination for current contentFilter
		if (contentFilter === 'properties') {
			setPropPage(1);
		} else if (contentFilter === 'searchAds') {
			setAdPage(1);
		} else {
			setPropPage(1);
			setAdPage(1);
		}
		save({ filters: filtersForSave });
	}, [filtersForSave, filtersSignature, save, contentFilter]);

	// Persist page changes
	useEffect(() => {
		if (restorationStateRef.current.status !== 'complete') {
			logger.debug(
				'[Home] Skipping pagination save - restoration not complete',
			);
			return;
		}
		logger.debug('[Home] Saving pagination:', { propPage, adPage });
		save({
			filters: { propPage, adPage },
		});
	}, [propPage, adPage, save]);

	// Server-side filtering now handles all cases including "Mon secteur"
	// Filter favorites client-side only
	const filteredProperties =
		contentFilter === 'favorites'
			? properties.filter((prop) => favoritePropertyIds.has(prop._id))
			: properties;

	const filteredSearchAds =
		contentFilter === 'favorites'
			? searchAds.filter((ad) => favoriteSearchAdIds.has(ad._id))
			: searchAds;

	const filteredPropertiesCount = filteredProperties.length;
	const filteredSearchAdsCount = filteredSearchAds.length;

	return (
		<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
			{/* Geolocation Permission Prompt */}
			{showGeolocationPrompt && (
				<GeolocationPrompt
					onAllow={handleRequestGeolocation}
					onDeny={handleDenyGeolocation}
					error={geolocationError}
				/>
			)}

			{/* Header with unified title and stats */}
			<HomeHeader
				filteredPropertiesCount={filteredPropertiesCount}
				filteredSearchAdsCount={filteredSearchAdsCount}
			/>

			{/* Unified Search and Filters - Wrapped with ErrorBoundary */}
			<ErrorBoundary fallback={<FilterErrorFallback />}>
				<SearchFiltersPanel
					searchTerm={searchTerm}
					onSearchTermChange={setSearchTerm}
					selectedLocations={selectedLocations}
					onLocationsChange={setSelectedLocations}
					radiusKm={radiusKm}
					onRadiusChange={handleRadiusChange}
					contentFilter={contentFilter}
					onContentFilterChange={setContentFilter}
					typeFilter={typeFilter}
					onTypeFilterChange={setTypeFilter}
					profileFilter={profileFilter}
					onProfileFilterChange={setProfileFilter}
					priceFilter={priceFilter}
					onPriceFilterChange={setPriceFilter}
					surfaceFilter={surfaceFilter}
					onSurfaceFilterChange={setSurfaceFilter}
					filteredPropertiesCount={filteredPropertiesCount}
					filteredSearchAdsCount={filteredSearchAdsCount}
					isAuthenticated={isAuthenticated}
					hasMyArea={
						!!user?.professionalInfo?.city &&
						myAreaLocations.length > 0
					}
					myAreaLocationsCount={myAreaLocations.length}
					favoritePropertyIds={favoritePropertyIds}
					favoriteSearchAdIds={favoriteSearchAdIds}
				/>
			</ErrorBoundary>

			{/* Unified Feed */}
			{loading ? (
				<div className="text-center py-12">
					<PageLoader message="Chargement des annonces..." />
				</div>
			) : error ? (
				<div className="text-center py-12 bg-red-50 rounded-lg">
					<p className="text-red-600">
						{error.message ||
							'Erreur lors du chargement des données'}
					</p>
					<button
						onClick={() => window.location.reload()}
						className="mt-4 px-4 py-2 bg-brand text-white rounded-lg hover:bg-brand-dark"
					>
						Réessayer
					</button>
				</div>
			) : (
				<div className="space-y-8">
					{/* Properties Section */}
					{(contentFilter === 'all' ||
						contentFilter === 'properties' ||
						contentFilter === 'favorites' ||
						contentFilter === 'myArea') && (
						<PropertiesSection
							properties={filteredProperties}
							contentFilter={contentFilter}
							favoritePropertyIds={favoritePropertyIds}
							currentPage={propPage}
							pageSize={FILTER_DEFAULTS.PAGE_SIZE}
							onPageChange={setPropPage}
						/>
					)}

					{/* Search Ads Section */}
					{(contentFilter === 'all' ||
						contentFilter === 'searchAds' ||
						contentFilter === 'favorites' ||
						contentFilter === 'myArea') && (
						<SearchAdsSection
							searchAds={
								contentFilter === 'favorites'
									? filteredSearchAds.filter((ad) =>
											favoriteSearchAdIds.has(ad._id),
										)
									: filteredSearchAds
							}
							currentPage={adPage}
							pageSize={FILTER_DEFAULTS.PAGE_SIZE}
							onPageChange={setAdPage}
						/>
					)}
				</div>
			)}
		</div>
	);
}
