/**
 * Multi-City Autocomplete Input
 * Allows users to select multiple cities with French Address API suggestions
 */

'use client';

import React, { useState, useEffect, useRef } from 'react';
import { searchMunicipalities } from '@/lib/services/frenchAddressApi';
import { logger } from '@/lib/utils/logger';

interface City {
	name: string;
	postcode: string;
	display: string;
}

interface MultiCityAutocompleteProps {
	value: string; // Comma-separated city names
	onChange: (value: string) => void;
	placeholder?: string;
	className?: string;
	label?: string;
	required?: boolean;
}

export const MultiCityAutocomplete: React.FC<MultiCityAutocompleteProps> = ({
	value,
	onChange,
	placeholder = 'Ex: Paris, Lyon, Marseille...',
	className = '',
	label,
	required = false,
}) => {
	const [inputValue, setInputValue] = useState('');
	const [selectedCities, setSelectedCities] = useState<City[]>([]);
	const [suggestions, setSuggestions] = useState<City[]>([]);
	const [showDropdown, setShowDropdown] = useState(false);
	const [loading, setLoading] = useState(false);
	const dropdownRef = useRef<HTMLDivElement>(null);
	const inputRef = useRef<HTMLInputElement>(null);

	// Initialize selected cities from value prop
	useEffect(() => {
		if (value && selectedCities.length === 0) {
			const cityNames = value
				.split(',')
				.map((c) => c.trim())
				.filter(Boolean);
			const cities = cityNames.map((name) => ({
				name,
				postcode: '',
				display: name,
			}));
			setSelectedCities(cities);
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [value]);

	// Fetch suggestions from API
	useEffect(() => {
		const fetchSuggestions = async () => {
			const trimmedInput = inputValue.trim();

			if (!trimmedInput || trimmedInput.length < 2) {
				setSuggestions([]);
				setLoading(false);
				return;
			}

			setLoading(true);
			try {
				const municipalities = await searchMunicipalities(
					inputValue,
					8,
				);

				const cityItems: City[] = municipalities.map((m) => ({
					name: m.name,
					postcode: m.postcode,
					display: `${m.name} (${m.postcode})`,
				}));

				// Filter out already selected cities
				const filtered = cityItems.filter(
					(city) =>
						!selectedCities.some(
							(selected) => selected.display === city.display,
						),
				);

				setSuggestions(filtered);
				setShowDropdown(filtered.length > 0);
			} catch (error) {
				logger.error('Error fetching city suggestions:', error);
				setSuggestions([]);
			} finally {
				setLoading(false);
			}
		};

		const debounceTimer = setTimeout(fetchSuggestions, 300);
		return () => clearTimeout(debounceTimer);
	}, [inputValue, selectedCities]);

	// Close dropdown when clicking outside
	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (
				dropdownRef.current &&
				!dropdownRef.current.contains(event.target as Node) &&
				inputRef.current &&
				!inputRef.current.contains(event.target as Node)
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

	const handleSuggestionClick = (city: City) => {
		const newSelectedCities = [...selectedCities, city];
		setSelectedCities(newSelectedCities);

		// Update parent with comma-separated string
		const cityString = newSelectedCities.map((c) => c.display).join(', ');
		onChange(cityString);

		setInputValue('');
		setShowDropdown(false);
		setSuggestions([]);
		inputRef.current?.focus();
	};

	const handleRemoveCity = (indexToRemove: number) => {
		const newSelectedCities = selectedCities.filter(
			(_, index) => index !== indexToRemove,
		);
		setSelectedCities(newSelectedCities);

		// Update parent with comma-separated string
		const cityString = newSelectedCities.map((c) => c.display).join(', ');
		onChange(cityString);
	};

	const handleFocus = () => {
		if (suggestions.length > 0) {
			setShowDropdown(true);
		}
	};

	return (
		<div className="space-y-2">
			{label && (
				<label className="block text-sm font-medium text-gray-700">
					{label}
					{required && <span className="text-red-500 ml-1">*</span>}
				</label>
			)}

			{/* Selected Cities Tags */}
			{selectedCities.length > 0 && (
				<div className="flex flex-wrap gap-2 p-2 bg-gray-50 rounded-lg border border-gray-200">
					{selectedCities.map((city, index) => (
						<span
							key={`${city.display}-${index}`}
							className="inline-flex items-center gap-1 px-3 py-1 bg-brand text-white text-sm rounded-full"
						>
							{city.display}
							<button
								type="button"
								onClick={() => handleRemoveCity(index)}
								className="hover:bg-brand-dark rounded-full p-0.5 transition-colors"
								aria-label={`Remove ${city.name}`}
							>
								<svg
									className="w-3.5 h-3.5"
									fill="none"
									stroke="currentColor"
									viewBox="0 0 24 24"
								>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth="2"
										d="M6 18L18 6M6 6l12 12"
									/>
								</svg>
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
					className={`w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand focus:border-brand transition-all ${className}`}
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
						className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto"
					>
						{suggestions.map((suggestion, index) => (
							<button
								key={`${suggestion.display}-${index}`}
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
									<div className="text-sm text-gray-500">
										{suggestion.postcode}
									</div>
								</div>
							</button>
						))}
					</div>
				)}
			</div>

			<p className="text-xs text-gray-500">
				Tapez pour rechercher et sélectionner des villes
			</p>
		</div>
	);
};
