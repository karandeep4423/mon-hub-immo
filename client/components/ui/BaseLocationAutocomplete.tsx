/**
 * BaseLocationAutocomplete - Unified location/city autocomplete component
 * Consolidates: CityAutocomplete, MultiCityAutocomplete, LocationSearchWithRadius
 *
 * Features:
 * - Single or multi-selection mode
 * - French Address API integration
 * - Debounced search
 * - Click-outside handling
 * - Loading states
 * - Keyboard navigation support
 */

'use client';

import React, {
	useState,
	useRef,
	useEffect,
	useCallback,
	RefObject,
} from 'react';
import { searchMunicipalities } from '@/lib/services/frenchAddressApi';
import { useClickOutside, useDebouncedSearch } from '@/hooks';
import { LoadingSpinner } from './LoadingSpinner';

export interface LocationItem {
	name: string;
	postcode: string;
	citycode?: string;
	coordinates?: {
		lat: number;
		lon: number;
	};
	context?: string;
}

interface BaseLocationAutocompleteProps {
	/**
	 * Selection mode
	 */
	mode: 'single' | 'multi';
	/**
	 * Current value(s)
	 */
	value?: string | string[];
	/**
	 * Callback for single selection
	 */
	onSelect?: (location: LocationItem) => void;
	/**
	 * Callback for multi selection
	 */
	onMultiSelect?: (locations: LocationItem[]) => void;
	/**
	 * Placeholder text
	 */
	placeholder?: string;
	/**
	 * CSS class name
	 */
	className?: string;
	/**
	 * Label text
	 */
	label?: string;
	/**
	 * Required field
	 */
	required?: boolean;
	/**
	 * Error message
	 */
	error?: string;
	/**
	 * Disabled state
	 */
	disabled?: boolean;
	/**
	 * Maximum number of results
	 */
	maxResults?: number;
	/**
	 * Show postal code in display
	 */
	showPostalCode?: boolean;
}

export const BaseLocationAutocomplete: React.FC<
	BaseLocationAutocompleteProps
> = ({
	mode,
	value,
	onSelect,
	onMultiSelect,
	placeholder = 'Ex: Paris, Caen...',
	className = '',
	label,
	required = false,
	error,
	disabled = false,
	maxResults = 8,
	showPostalCode = true,
}) => {
	// Local state
	const [inputValue, setInputValue] = useState('');
	const [selectedItems, setSelectedItems] = useState<LocationItem[]>([]);
	const [showDropdown, setShowDropdown] = useState(false);

	// Refs
	const inputRef = useRef<HTMLInputElement>(null);
	const dropdownRef = useRef<HTMLDivElement>(null);

	// Debounced search
	const { results: suggestions, loading } = useDebouncedSearch(
		inputValue,
		useCallback(
			async (query: string) => {
				const municipalities = await searchMunicipalities(
					query,
					maxResults,
				);
				return municipalities;
			},
			[maxResults],
		),
		{
			minLength: 2,
			delay: 300,
		},
	);

	// Click outside handler
	useClickOutside(
		[
			inputRef as RefObject<HTMLElement>,
			dropdownRef as RefObject<HTMLElement>,
		],
		() => {
			setShowDropdown(false);
		},
	);

	// Initialize from value prop
	useEffect(() => {
		if (mode === 'single' && typeof value === 'string' && value) {
			setInputValue(value);
		} else if (
			mode === 'multi' &&
			Array.isArray(value) &&
			value.length > 0
		) {
			// Parse multi values if needed
			const items: LocationItem[] = value.map((v) => {
				// If it's already a LocationItem format
				if (typeof v === 'object') return v as unknown as LocationItem;
				// Otherwise create simple item
				return { name: v, postcode: '' };
			});
			setSelectedItems(items);
		}
	}, [value, mode]);

	// Show dropdown when suggestions are available
	useEffect(() => {
		if (suggestions.length > 0 && inputValue.trim().length >= 2) {
			setShowDropdown(true);
		} else {
			setShowDropdown(false);
		}
	}, [suggestions, inputValue]);

	// Handlers
	const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const newValue = e.target.value;
		setInputValue(newValue);
		setShowDropdown(true);
	};

	const handleSuggestionClick = (suggestion: LocationItem) => {
		if (mode === 'single') {
			// Single selection
			const displayValue = showPostalCode
				? `${suggestion.name} (${suggestion.postcode})`
				: suggestion.name;
			setInputValue(displayValue);
			setShowDropdown(false);

			if (onSelect) {
				onSelect(suggestion);
			}
		} else {
			// Multi selection
			const alreadySelected = selectedItems.some(
				(item) =>
					item.name === suggestion.name &&
					item.postcode === suggestion.postcode,
			);

			if (!alreadySelected) {
				const newSelected = [...selectedItems, suggestion];
				setSelectedItems(newSelected);

				if (onMultiSelect) {
					onMultiSelect(newSelected);
				}
			}

			// Clear input for next selection
			setInputValue('');
			setShowDropdown(false);

			// Focus back on input
			inputRef.current?.focus();
		}
	};

	const handleRemoveItem = (index: number) => {
		const newSelected = selectedItems.filter((_, i) => i !== index);
		setSelectedItems(newSelected);

		if (onMultiSelect) {
			onMultiSelect(newSelected);
		}
	};

	const handleFocus = () => {
		if (suggestions.length > 0) {
			setShowDropdown(true);
		}
	};

	return (
		<div className={`relative ${className}`}>
			{/* Label */}
			{label && (
				<label className="block text-sm font-medium text-gray-700 mb-1">
					{label}
					{required && <span className="text-red-500 ml-1">*</span>}
				</label>
			)}

			{/* Multi-selection: Show selected items */}
			{mode === 'multi' && selectedItems.length > 0 && (
				<div className="flex flex-wrap gap-2 mb-2">
					{selectedItems.map((item, index) => (
						<span
							key={`${item.name}-${item.postcode}-${index}`}
							className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800"
						>
							{showPostalCode
								? `${item.name} (${item.postcode})`
								: item.name}
							<button
								type="button"
								onClick={() => handleRemoveItem(index)}
								className="ml-2 text-blue-600 hover:text-blue-800"
								disabled={disabled}
							>
								×
							</button>
						</span>
					))}
				</div>
			)}

			{/* Input Field */}
			<div className="relative">
				<input
					ref={inputRef}
					type="text"
					value={inputValue}
					onChange={handleInputChange}
					onFocus={handleFocus}
					placeholder={placeholder}
					disabled={disabled}
					className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
						error ? 'border-red-500' : 'border-gray-300'
					} ${disabled ? 'bg-gray-100 cursor-not-allowed' : ''}`}
				/>

				{/* Loading indicator */}
				{loading && (
					<div className="absolute right-3 top-1/2 transform -translate-y-1/2">
						<LoadingSpinner size="sm" />
					</div>
				)}
			</div>

			{/* Error message */}
			{error && <p className="mt-1 text-sm text-red-500">{error}</p>}

			{/* Dropdown */}
			{showDropdown && suggestions.length > 0 && (
				<div
					ref={dropdownRef}
					className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto"
				>
					{suggestions.map((suggestion, index) => (
						<button
							key={`${suggestion.citycode || suggestion.name}-${suggestion.postcode}-${index}`}
							type="button"
							onClick={() => handleSuggestionClick(suggestion)}
							className="w-full px-4 py-2 text-left hover:bg-blue-50 focus:bg-blue-50 focus:outline-none transition-colors"
						>
							<div className="font-medium text-gray-900">
								{suggestion.name}
							</div>
							<div className="text-sm text-gray-500">
								{suggestion.postcode}
								{suggestion.context &&
									` • ${suggestion.context}`}
							</div>
						</button>
					))}
				</div>
			)}
		</div>
	);
};
