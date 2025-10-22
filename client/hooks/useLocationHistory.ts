import { useCallback } from 'react';
import { storage, STORAGE_KEYS } from '@/lib/utils/storageManager';
import type { LocationItem } from '@/types/location';

const MAX_HISTORY = 5;

/**
 * Hook for managing location search history in localStorage
 * Centralizes localStorage logic that was duplicated across multiple components
 */
export const useLocationHistory = () => {
	/**
	 * Get previously selected locations from localStorage
	 */
	const getPreviousLocations = useCallback((): LocationItem[] => {
		return (
			storage.get<LocationItem[]>(STORAGE_KEYS.PREVIOUS_LOCATIONS) || []
		);
	}, []);

	/**
	 * Save location to localStorage (keeps only last MAX_HISTORY items)
	 */
	const saveToPreviousLocations = useCallback(
		(location: LocationItem): void => {
			const previous = getPreviousLocations();
			const exists = previous.some((loc) => loc.value === location.value);

			// Don't save special locations or duplicates
			if (!exists && location.type !== 'special') {
				const updated = [location, ...previous].slice(0, MAX_HISTORY);
				storage.set(STORAGE_KEYS.PREVIOUS_LOCATIONS, updated);
			}
		},
		[getPreviousLocations],
	);

	/**
	 * Clear location history
	 */
	const clearLocationHistory = useCallback((): void => {
		storage.remove(STORAGE_KEYS.PREVIOUS_LOCATIONS);
	}, []);

	return {
		getPreviousLocations,
		saveToPreviousLocations,
		clearLocationHistory,
	};
};
