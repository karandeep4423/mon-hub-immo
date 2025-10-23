/**
 * City Autocomplete Input
 * Uses French Address API for real-time city suggestions
 * Provides autocomplete for city + postal code fields
 */

'use client';

import React, { useEffect, useCallback } from 'react';
import { searchMunicipalities } from '@/lib/services/frenchAddressApi';
import { useAutocomplete } from '@/hooks/useAutocomplete';

interface CityAutocompleteSuggestion {
	name: string;
	postcode: string;
	citycode: string;
	context: string;
}

interface CityAutocompleteProps {
	value: string;
	onCitySelect: (city: string, postalCode: string) => void;
	placeholder?: string;
	className?: string;
	error?: string;
	label?: string;
	required?: boolean;
}

export const CityAutocomplete: React.FC<CityAutocompleteProps> = ({
	value,
	onCitySelect,
	placeholder = 'Ex: Paris, Caen...',
	className = '',
	error,
	label,
	required = false,
}) => {
	const {
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
	} = useAutocomplete<CityAutocompleteSuggestion>({
		debounceMs: 300,
		minLength: 2,
		fetchSuggestions: searchMunicipalities,
		limit: 8,
	});

	// Update input value when prop changes
	useEffect(() => {
		setInputValue(value);
	}, [value, setInputValue]);

	const handleSuggestionClick = useCallback(
		(suggestion: CityAutocompleteSuggestion) => {
			setInputValue(suggestion.name);
			onCitySelect(suggestion.name, suggestion.postcode);
			setShowDropdown(false);
		},
		[onCitySelect, setInputValue, setShowDropdown],
	);

	return (
		<div className="relative">
			{label && (
				<label className="block text-sm font-medium text-gray-700 mb-1">
					{label}
					{required && <span className="text-red-500 ml-1">*</span>}
				</label>
			)}
			<div className="relative">
				<input
					ref={inputRef}
					type="text"
					value={inputValue}
					onChange={handleInputChange}
					onFocus={handleFocus}
					placeholder={placeholder}
					className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand focus:border-brand transition-all ${
						error ? 'border-red-500' : 'border-gray-300'
					} ${className}`}
					autoComplete="off"
				/>

				{loading && (
					<div className="absolute right-3 top-1/2 -translate-y-1/2">
						<div className="animate-spin h-4 w-4 border-2 border-brand border-t-transparent rounded-full"></div>
					</div>
				)}

				{/* Suggestions Dropdown */}
				{showDropdown && suggestions.length > 0 && (
					<div
						ref={dropdownRef}
						className="absolute z-[9999] w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-xl max-h-60 overflow-y-auto"
					>
						{suggestions.map((suggestion, index) => (
							<button
								key={`${suggestion.citycode}-${index}`}
								type="button"
								onClick={() =>
									handleSuggestionClick(suggestion)
								}
								className="w-full px-4 py-2.5 text-left hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-b-0 flex items-start gap-2"
							>
								<div className="flex-shrink-0 mt-0.5">
									<svg
										className="w-4 h-4 text-gray-400"
										fill="none"
										stroke="currentColor"
										viewBox="0 0 24 24"
									>
										<path
											strokeLinecap="round"
											strokeLinejoin="round"
											strokeWidth="2"
											d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
										/>
										<path
											strokeLinecap="round"
											strokeLinejoin="round"
											strokeWidth="2"
											d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
										/>
									</svg>
								</div>
								<div className="flex-1 min-w-0">
									<div className="font-medium text-gray-900">
										{suggestion.name}
									</div>
									<div className="text-sm text-gray-500 truncate">
										{suggestion.postcode} •{' '}
										{suggestion.context}
									</div>
								</div>
							</button>
						))}
					</div>
				)}
			</div>

			{error && <p className="mt-1 text-sm text-red-600">{error}</p>}
		</div>
	);
};
