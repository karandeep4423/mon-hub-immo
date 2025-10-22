'use client';

import React, { useState, useEffect, useRef } from 'react';
import { logger } from '@/lib/utils/logger';

interface AddressAutocompleteProps {
	label?: string;
	value: string;
	onAddressSelect: (
		address: string,
		city: string,
		postalCode: string,
		coordinates?: { lat: number; lon: number },
	) => void;
	placeholder?: string;
	error?: string;
	required?: boolean;
}

interface AddressSuggestion {
	label: string; // Full address (e.g., "8 Boulevard du Port 80000 Amiens")
	name: string; // Street name
	housenumber?: string;
	postcode: string;
	city: string;
	context: string;
	coordinates: {
		lat: number;
		lon: number;
	};
}

const API_BASE = 'https://api-adresse.data.gouv.fr';

export const AddressAutocomplete: React.FC<AddressAutocompleteProps> = ({
	label,
	value,
	onAddressSelect,
	placeholder = 'Rechercher une adresse...',
	error,
	required,
}) => {
	const [inputValue, setInputValue] = useState(value);
	const [suggestions, setSuggestions] = useState<AddressSuggestion[]>([]);
	const [showDropdown, setShowDropdown] = useState(false);
	const [isLoading, setIsLoading] = useState(false);
	const dropdownRef = useRef<HTMLDivElement>(null);

	// Sync with parent value
	useEffect(() => {
		setInputValue(value);
	}, [value]);

	// Debounced search
	useEffect(() => {
		const trimmedInput = inputValue.trim();

		if (!trimmedInput || trimmedInput.length < 3) {
			setSuggestions([]);
			setShowDropdown(false);
			return;
		}

		const fetchSuggestions = async () => {
			setIsLoading(true);
			try {
				const params = new URLSearchParams({
					q: trimmedInput,
					limit: '8',
					autocomplete: '1',
				});

				const url = `${API_BASE}/search/?${params}`;
				const response = await fetch(url);

				if (!response.ok) {
					setSuggestions([]);
					return;
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
						name:
							feature.properties.name ||
							feature.properties.street ||
							'',
						housenumber: feature.properties.housenumber,
						postcode: feature.properties.postcode,
						city: feature.properties.city,
						context: feature.properties.context,
						coordinates: {
							lat: feature.geometry.coordinates[1],
							lon: feature.geometry.coordinates[0],
						},
					}),
				);

				setSuggestions(results);
				setShowDropdown(results.length > 0);
			} catch (error) {
				logger.error('Error fetching address suggestions:', error);
				setSuggestions([]);
			} finally {
				setIsLoading(false);
			}
		};

		const debounceTimer = setTimeout(fetchSuggestions, 300);

		return () => clearTimeout(debounceTimer);
	}, [inputValue]);

	// Close dropdown on outside click
	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (
				dropdownRef.current &&
				!dropdownRef.current.contains(event.target as Node)
			) {
				setShowDropdown(false);
			}
		};

		document.addEventListener('mousedown', handleClickOutside);
		return () =>
			document.removeEventListener('mousedown', handleClickOutside);
	}, []);

	const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setInputValue(e.target.value);
		setShowDropdown(true);
	};

	const handleSelectAddress = (suggestion: AddressSuggestion) => {
		// Use full label for address field
		setInputValue(suggestion.label);
		setShowDropdown(false);

		// Extract just the street part (without postal code and city)
		const streetAddress = suggestion.housenumber
			? `${suggestion.housenumber} ${suggestion.name}`
			: suggestion.name;

		onAddressSelect(
			streetAddress,
			suggestion.city,
			suggestion.postcode,
			suggestion.coordinates,
		);
	};

	return (
		<div className="relative" ref={dropdownRef}>
			{label && (
				<label className="block text-sm font-medium text-gray-700 mb-2">
					{label}
					{required && <span className="text-red-500 ml-1">*</span>}
				</label>
			)}

			<div className="relative">
				<input
					type="text"
					value={inputValue}
					onChange={handleInputChange}
					onFocus={() =>
						suggestions.length > 0 && setShowDropdown(true)
					}
					placeholder={placeholder}
					className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
						error ? 'border-red-500' : 'border-gray-300'
					}`}
				/>

				{isLoading && (
					<div className="absolute right-3 top-1/2 transform -translate-y-1/2">
						<div className="animate-spin h-4 w-4 border-2 border-blue-500 border-t-transparent rounded-full"></div>
					</div>
				)}
			</div>

			{error && <p className="text-red-500 text-sm mt-1">{error}</p>}

			{showDropdown && suggestions.length > 0 && (
				<div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
					{suggestions.map((suggestion, index) => (
						<button
							key={index}
							type="button"
							onClick={() => handleSelectAddress(suggestion)}
							className="w-full text-left px-4 py-2 hover:bg-blue-50 focus:bg-blue-50 focus:outline-none border-b border-gray-100 last:border-b-0"
						>
							<div className="font-medium text-gray-900">
								{suggestion.label}
							</div>
							{suggestion.context && (
								<div className="text-xs text-gray-500 mt-1">
									{suggestion.context}
								</div>
							)}
						</button>
					))}
				</div>
			)}
		</div>
	);
};
