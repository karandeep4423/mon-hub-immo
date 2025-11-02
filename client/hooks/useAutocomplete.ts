/**
 * useAutocomplete - Shared autocomplete logic
 * Used by CityAutocomplete and LocationSearchWithRadius components
 *
 * Handles:
 * - Debounced API calls
 * - Click outside detection
 * - Loading states
 * - Dropdown visibility
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { logger } from '@/lib/utils/logger';
import { useClickOutside } from './useClickOutside';

interface UseAutocompleteOptions<T> {
	/** Debounce delay in milliseconds */
	debounceMs?: number;
	/** Minimum input length before fetching */
	minLength?: number;
	/** Function to fetch suggestions */
	fetchSuggestions: (query: string, limit: number) => Promise<T[]>;
	/** Maximum number of suggestions to fetch */
	limit?: number;
	/** Filter already selected items */
	filterSelected?: (suggestions: T[], selected: T[]) => T[];
}

interface UseAutocompleteResult<T> {
	inputRef: React.RefObject<HTMLInputElement | null>;
	dropdownRef: React.RefObject<HTMLDivElement | null>;
	inputValue: string;
	setInputValue: (value: string) => void;
	suggestions: T[];
	loading: boolean;
	showDropdown: boolean;
	setShowDropdown: (show: boolean) => void;
	handleInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
	handleFocus: () => void;
}

export function useAutocomplete<T>({
	debounceMs = 300,
	minLength = 2,
	fetchSuggestions,
	limit = 10,
}: UseAutocompleteOptions<T>): UseAutocompleteResult<T> {
	const [inputValue, setInputValue] = useState('');
	const [suggestions, setSuggestions] = useState<T[]>([]);
	const [loading, setLoading] = useState(false);
	const [showDropdown, setShowDropdown] = useState(false);
	const inputRef = useRef<HTMLInputElement>(null);
	const dropdownRef = useRef<HTMLDivElement>(null);

	// Fetch suggestions with debouncing
	useEffect(() => {
		const fetchData = async () => {
			const trimmedInput = inputValue.trim();

			if (!trimmedInput || trimmedInput.length < minLength) {
				setSuggestions([]);
				setLoading(false);
				return;
			}

			setLoading(true);
			try {
				const results = await fetchSuggestions(trimmedInput, limit);
				setSuggestions(results);
				setShowDropdown(results.length > 0);
			} catch (error) {
				logger.error('Error fetching autocomplete suggestions:', error);
				setSuggestions([]);
			} finally {
				setLoading(false);
			}
		};

		const debounceTimer = setTimeout(fetchData, debounceMs);
		return () => clearTimeout(debounceTimer);
	}, [inputValue, debounceMs, minLength, fetchSuggestions, limit]);

	// Close dropdown when clicking outside
	useClickOutside([dropdownRef, inputRef], () => setShowDropdown(false));

	const handleInputChange = useCallback(
		(e: React.ChangeEvent<HTMLInputElement>) => {
			setInputValue(e.target.value);
			setShowDropdown(true);
		},
		[],
	);

	const handleFocus = useCallback(() => {
		if (suggestions.length > 0) {
			setShowDropdown(true);
		}
	}, [suggestions.length]);

	return {
		inputRef,
		dropdownRef,
		inputValue,
		setInputValue,
		suggestions,
		loading,
		showDropdown,
		setShowDropdown,
		handleInputChange,
		handleFocus,
	};
}
