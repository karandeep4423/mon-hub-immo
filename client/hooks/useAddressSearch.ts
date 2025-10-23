'use client';

import { useState, useEffect, useCallback } from 'react';
import { useDebounce } from './useDebounce';
import { logger } from '@/lib/utils/logger';

// ============================================================================
// TYPES
// ============================================================================

export interface AddressSuggestion {
	label: string;
	name: string;
	street?: string;
	housenumber?: string;
	postcode: string;
	city: string;
	context: string;
	coordinates: {
		lat: number;
		lon: number;
	};
}

interface UseAddressSearchOptions {
	/** Minimum characters before search triggers */
	minLength?: number;
	/** Debounce delay in ms */
	debounceMs?: number;
	/** Maximum number of suggestions */
	limit?: number;
}

interface UseAddressSearchReturn {
	/** Current input value */
	inputValue: string;
	/** Set input value */
	setInputValue: (value: string) => void;
	/** Address suggestions */
	suggestions: AddressSuggestion[];
	/** Loading state */
	isLoading: boolean;
	/** Error state */
	error: string | null;
	/** Select a suggestion */
	selectSuggestion: (suggestion: AddressSuggestion) => void;
	/** Clear suggestions */
	clearSuggestions: () => void;
}

// ============================================================================
// HOOK
// ============================================================================

const API_BASE = 'https://api-adresse.data.gouv.fr';

/**
 * Custom hook for French address autocomplete
 * Uses api-adresse.data.gouv.fr for real-time address lookup
 */
export const useAddressSearch = (
	initialValue: string = '',
	onSelect?: (suggestion: AddressSuggestion) => void,
	options: UseAddressSearchOptions = {},
): UseAddressSearchReturn => {
	const { minLength = 3, debounceMs = 300, limit = 8 } = options;

	const [inputValue, setInputValue] = useState(initialValue);
	const [suggestions, setSuggestions] = useState<AddressSuggestion[]>([]);
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	// Debounce input value
	const debouncedValue = useDebounce(inputValue, debounceMs);

	// Sync with external value changes
	useEffect(() => {
		setInputValue(initialValue);
	}, [initialValue]);

	// Fetch suggestions
	useEffect(() => {
		const trimmedInput = debouncedValue.trim();

		// Reset if input too short
		if (!trimmedInput || trimmedInput.length < minLength) {
			setSuggestions([]);
			setError(null);
			return;
		}

		const fetchSuggestions = async () => {
			setIsLoading(true);
			setError(null);

			try {
				const params = new URLSearchParams({
					q: trimmedInput,
					limit: limit.toString(),
					autocomplete: '1',
				});

				const url = `${API_BASE}/search/?${params}`;
				const response = await fetch(url);

				if (!response.ok) {
					throw new Error(
						'Erreur lors de la récupération des adresses',
					);
				}

				const data = await response.json();

				if (!data.features || !Array.isArray(data.features)) {
					setSuggestions([]);
					return;
				}

				const results: AddressSuggestion[] = data.features.map(
					(feature: {
						properties: {
							label: string;
							name?: string;
							street?: string;
							housenumber?: string;
							postcode: string;
							city: string;
							context: string;
						};
						geometry: { coordinates: [number, number] };
					}) => ({
						label: feature.properties.label,
						name: feature.properties.name || '',
						street: feature.properties.street,
						housenumber: feature.properties.housenumber,
						postcode: feature.properties.postcode,
						city: feature.properties.city,
						context: feature.properties.context,
						coordinates: {
							lon: feature.geometry.coordinates[0],
							lat: feature.geometry.coordinates[1],
						},
					}),
				);

				setSuggestions(results);
				logger.debug('[useAddressSearch] Found suggestions', {
					count: results.length,
					query: trimmedInput,
				});
			} catch (err) {
				logger.error('[useAddressSearch] Error', err);
				setError(
					err instanceof Error
						? err.message
						: 'Erreur lors de la recherche',
				);
				setSuggestions([]);
			} finally {
				setIsLoading(false);
			}
		};

		fetchSuggestions();
	}, [debouncedValue, minLength, limit]);

	// Select suggestion handler
	const selectSuggestion = useCallback(
		(suggestion: AddressSuggestion) => {
			setInputValue(suggestion.label);
			setSuggestions([]);
			onSelect?.(suggestion);
		},
		[onSelect],
	);

	// Clear suggestions
	const clearSuggestions = useCallback(() => {
		setSuggestions([]);
	}, []);

	return {
		inputValue,
		setInputValue,
		suggestions,
		isLoading,
		error,
		selectSuggestion,
		clearSuggestions,
	};
};
