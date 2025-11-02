/**
 * Location Filtering Utilities
 * Shared functions for location-based filtering logic
 */

import type { LocationItem } from '@/components/ui/LocationSearchWithRadius';

/**
 * Normalize city name for robust comparisons
 * Removes accents, trims whitespace, converts to lowercase
 *
 * @param value - City name to normalize
 * @returns Normalized city name
 *
 * @example
 * normalizeCity('  Paris  ') // 'paris'
 * normalizeCity('Montréal') // 'montreal'
 */
export const normalizeCity = (value: string): string => {
	return value
		.normalize('NFD')
		.replace(/[\u0300-\u036f]/g, '')
		.replace(/\s+/g, ' ')
		.trim()
		.toLowerCase();
};

/**
 * Check if an item matches location criteria by postal code or city name
 *
 * @param itemPostalCode - Postal code of the item being checked
 * @param itemCity - City name of the item being checked
 * @param targetLocations - Array of target locations to match against
 * @returns True if item matches any target location
 *
 * @example
 * matchesLocationCriteria('75001', 'Paris', parisLocations) // true
 * matchesLocationCriteria('69000', 'Lyon', parisLocations) // false
 */
export const matchesLocationCriteria = (
	itemPostalCode: string | undefined,
	itemCity: string | undefined,
	targetLocations: LocationItem[],
): boolean => {
	if (targetLocations.length === 0) {
		return true; // No filter applied
	}

	const targetPostalCodes = targetLocations.map((loc) =>
		String(loc.postcode).trim(),
	);
	const targetCities = targetLocations.map((loc) => normalizeCity(loc.name));

	// Normalize item values
	const itemPostal = itemPostalCode ? String(itemPostalCode).trim() : '';
	const itemCityNorm = itemCity ? normalizeCity(itemCity) : '';

	// Check postal code match
	const matchesByPostalCode =
		itemPostal.length > 0 && targetPostalCodes.includes(itemPostal);

	// Check city name match (exact or partial)
	const matchesByCity =
		itemCityNorm.length > 0 &&
		(targetCities.includes(itemCityNorm) ||
			targetCities.some((targetCity) =>
				itemCityNorm.includes(targetCity),
			));

	return matchesByPostalCode || matchesByCity;
};

/**
 * Check if an item matches any of the postal codes in an array
 * Handles both single postal codes and arrays of postal codes
 *
 * @param itemPostalCodes - Postal code(s) of the item (string or array)
 * @param targetLocations - Array of target locations to match against
 * @returns True if item matches any target postal code
 *
 * @example
 * matchesPostalCodes(['75001', '75002'], parisLocations) // true
 * matchesPostalCodes('75001', parisLocations) // true
 */
export const matchesPostalCodes = (
	itemPostalCodes: string | string[] | undefined,
	targetLocations: LocationItem[],
): boolean => {
	if (!itemPostalCodes || targetLocations.length === 0) {
		return targetLocations.length === 0; // Return true only if no filter applied
	}

	const targetPostalCodes = targetLocations.map((loc) =>
		String(loc.postcode).trim(),
	);

	// Handle array of postal codes
	if (Array.isArray(itemPostalCodes)) {
		return itemPostalCodes.some((pc) =>
			targetPostalCodes.includes(String(pc).trim()),
		);
	}

	// Handle single postal code
	return targetPostalCodes.includes(String(itemPostalCodes).trim());
};

/**
 * Check if an item matches any of the cities in an array
 * Handles both single cities and arrays of cities
 *
 * @param itemCities - City name(s) of the item (string or array)
 * @param targetLocations - Array of target locations to match against
 * @returns True if item matches any target city
 *
 * @example
 * matchesCities(['Paris', 'Lyon'], parisLocations) // true
 * matchesCities('Paris', parisLocations) // true
 */
export const matchesCities = (
	itemCities: string | string[] | undefined,
	targetLocations: LocationItem[],
): boolean => {
	if (!itemCities || targetLocations.length === 0) {
		return targetLocations.length === 0; // Return true only if no filter applied
	}

	const targetCities = targetLocations.map((loc) => normalizeCity(loc.name));

	// Handle array of cities
	if (Array.isArray(itemCities)) {
		return itemCities.some((city) => {
			const normalized = normalizeCity(city);
			return (
				targetCities.includes(normalized) ||
				targetCities.some((targetCity) =>
					normalized.includes(targetCity),
				)
			);
		});
	}

	// Handle single city
	const normalized = normalizeCity(itemCities);
	return (
		targetCities.includes(normalized) ||
		targetCities.some((targetCity) => normalized.includes(targetCity))
	);
};

/**
 * Check if a search ad matches location criteria
 * Handles the specific structure of SearchAd location data
 *
 * @param searchAdLocation - Location object from SearchAd
 * @param targetLocations - Array of target locations to match against
 * @returns True if search ad matches any target location
 */
export const matchesSearchAdLocation = (
	searchAdLocation: {
		postalCodes?: string[];
		cities?: string[];
	},
	targetLocations: LocationItem[],
): boolean => {
	if (targetLocations.length === 0) {
		return true; // No filter applied
	}

	const matchesByPostalCode = matchesPostalCodes(
		searchAdLocation.postalCodes,
		targetLocations,
	);

	const matchesByCity = matchesCities(
		searchAdLocation.cities,
		targetLocations,
	);

	return matchesByPostalCode || matchesByCity;
};
