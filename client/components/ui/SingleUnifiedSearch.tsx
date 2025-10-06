'use client';

import { useState, useRef, useEffect } from 'react';
import { searchCities } from '@/lib/utils/cityPostalCodeData';

export interface LocationItem {
	type: 'city' | 'postalCode' | 'special';
	city?: string;
	postalCode?: string;
	display: string;
	value: string;
}

interface SingleUnifiedSearchProps {
	searchTerm: string;
	onSearchChange: (value: string) => void;
	selectedLocations: LocationItem[];
	onLocationsChange: (locations: LocationItem[]) => void;
	placeholder?: string;
	className?: string;
}

export const SingleUnifiedSearch: React.FC<SingleUnifiedSearchProps> = ({
	searchTerm,
	onSearchChange,
	selectedLocations,
	onLocationsChange,
	placeholder = 'Rechercher dans les biens et recherches...',
	className = '',
}) => {
	const [showLocationDropdown, setShowLocationDropdown] = useState(false);
	const [suggestions, setSuggestions] = useState<LocationItem[]>([]);
	const inputRef = useRef<HTMLInputElement>(null);
	const dropdownRef = useRef<HTMLDivElement>(null);

	// Get previously selected locations from localStorage
	const getPreviousLocations = (): LocationItem[] => {
		try {
			const stored = localStorage.getItem('previousLocations');
			if (stored) {
				return JSON.parse(stored);
			}
		} catch (error) {
			console.error('Error loading previous locations:', error);
		}
		return [];
	};

	// Save location to localStorage
	const saveToPreviousLocations = (location: LocationItem) => {
		try {
			const previous = getPreviousLocations();
			const exists = previous.some((loc) => loc.value === location.value);
			if (!exists && location.type !== 'special') {
				const updated = [location, ...previous].slice(0, 5);
				localStorage.setItem(
					'previousLocations',
					JSON.stringify(updated),
				);
			}
		} catch (error) {
			console.error('Error saving location:', error);
		}
	};

	// Detect if user is searching for location (city or postal code)
	const isLocationSearch = (query: string): boolean => {
		// If it's numeric or contains common French city patterns
		if (/^\d+$/.test(query.trim())) return true;

		// If it's short text that could be a city name (not a full sentence)
		const words = query.trim().split(/\s+/);
		if (words.length <= 3 && query.length <= 30) return true;

		return false;
	};

	// Generate suggestions based on input
	useEffect(() => {
		// Show location suggestions when input is focused but empty
		if (showLocationDropdown && !searchTerm.trim()) {
			const previous = getPreviousLocations();
			const defaultSuggestions: LocationItem[] = [
				{
					type: 'special',
					display: 'Autour de moi',
					value: 'near_me',
				},
				{
					type: 'special',
					display: 'Toute la France',
					value: 'all_france',
				},
			];

			if (previous.length > 0) {
				setSuggestions([...previous, ...defaultSuggestions]);
			} else {
				setSuggestions(defaultSuggestions);
			}
			return;
		}

		// If user is typing, check if it's a location search
		if (searchTerm && isLocationSearch(searchTerm)) {
			const searchResults = searchCities(searchTerm, 10);
			const matches: LocationItem[] = [];

			searchResults.forEach((item) => {
				const locationValue = `${item.city}-${item.postalCode}`;
				const alreadySelected = selectedLocations.some(
					(loc) => loc.value === locationValue,
				);

				if (alreadySelected) return;

				matches.push({
					type: /^\d+$/.test(searchTerm.trim())
						? 'postalCode'
						: 'city',
					city: item.city,
					postalCode: item.postalCode,
					display: `${item.city} (${item.postalCode})`,
					value: locationValue,
				});
			});

			if (matches.length > 0) {
				setSuggestions(matches);
				setShowLocationDropdown(true);
			} else {
				setShowLocationDropdown(false);
			}
		} else {
			setShowLocationDropdown(false);
		}
	}, [searchTerm, selectedLocations, showLocationDropdown]);

	// Handle click outside to close dropdown
	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (
				dropdownRef.current &&
				!dropdownRef.current.contains(event.target as Node) &&
				inputRef.current &&
				!inputRef.current.contains(event.target as Node)
			) {
				setShowLocationDropdown(false);
			}
		};

		document.addEventListener('mousedown', handleClickOutside);
		return () => {
			document.removeEventListener('mousedown', handleClickOutside);
		};
	}, []);

	const handleSelectLocation = (location: LocationItem) => {
		if (selectedLocations.some((loc) => loc.value === location.value)) {
			return;
		}

		saveToPreviousLocations(location);
		onLocationsChange([...selectedLocations, location]);
		onSearchChange(''); // Clear search after selecting location
		setShowLocationDropdown(false);
	};

	const handleRemoveLocation = (valueToRemove: string) => {
		onLocationsChange(
			selectedLocations.filter((loc) => loc.value !== valueToRemove),
		);
	};

	const handleInputFocus = () => {
		if (!searchTerm.trim()) {
			setShowLocationDropdown(true);
		}
	};

	const handleInputChange = (value: string) => {
		onSearchChange(value);

		// Auto-show dropdown if it looks like location search
		if (isLocationSearch(value)) {
			setShowLocationDropdown(true);
		}
	};

	return (
		<div className={`relative ${className}`}>
			{/* Single unified search input with chips inside */}
			<div className="relative">
				{/* Location icon on the left */}
				<div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 z-10">
					<svg
						className="w-5 h-5"
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

				{/* Input container with chips inside */}
				<div className="flex items-center flex-wrap gap-2 border rounded-lg p-2 pl-10 pr-10 min-h-[48px] focus-within:ring-2 focus-within:ring-brand focus-within:border-brand">
					{/* Selected locations as chips inside input */}
					{selectedLocations.map((location) => (
						<div
							key={location.value}
							className="inline-flex items-center gap-1.5 bg-blue-100 text-blue-800 px-2.5 py-1 rounded-full text-sm whitespace-nowrap"
						>
							<span>{location.display}</span>
							<button
								type="button"
								onClick={() =>
									handleRemoveLocation(location.value)
								}
								className="hover:bg-blue-200 rounded-full p-0.5 transition-colors"
								aria-label="Supprimer"
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
						</div>
					))}

					{/* Actual input field */}
					<input
						ref={inputRef}
						type="text"
						placeholder={
							selectedLocations.length > 0 ? '' : placeholder
						}
						value={searchTerm}
						onChange={(e) => handleInputChange(e.target.value)}
						onFocus={handleInputFocus}
						className="flex-1 min-w-[200px] outline-none bg-transparent py-1"
					/>
				</div>

				{/* Search icon on the right */}
				<button className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-brand">
					<svg
						className="h-5 w-5"
						fill="none"
						stroke="currentColor"
						viewBox="0 0 24 24"
					>
						<path
							strokeLinecap="round"
							strokeLinejoin="round"
							strokeWidth="2"
							d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
						/>
					</svg>
				</button>
			</div>

			{/* Location suggestions dropdown */}
			{showLocationDropdown && suggestions.length > 0 && (
				<div
					ref={dropdownRef}
					className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-64 overflow-y-auto"
				>
					{searchTerm.trim() === '' &&
						getPreviousLocations().length > 0 && (
							<div className="px-3 py-2 text-xs font-semibold text-gray-500 bg-gray-50">
								Suggestions
							</div>
						)}
					{suggestions.map((suggestion, index) => (
						<button
							key={`${suggestion.value}-${index}`}
							type="button"
							onClick={() => handleSelectLocation(suggestion)}
							className="w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors flex items-center gap-3 border-b border-gray-100 last:border-0"
						>
							{suggestion.type === 'special' ? (
								<>
									{suggestion.value === 'near_me' ? (
										<svg
											className="w-5 h-5 text-gray-500 flex-shrink-0"
											fill="none"
											stroke="currentColor"
											viewBox="0 0 24 24"
										>
											<path
												strokeLinecap="round"
												strokeLinejoin="round"
												strokeWidth="2"
												d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5a2.5 2.5 0 010-5 2.5 2.5 0 010 5z"
											/>
										</svg>
									) : (
										<svg
											className="w-5 h-5 text-gray-500 flex-shrink-0"
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
										</svg>
									)}
									<span className="text-gray-700">
										{suggestion.display}
									</span>
								</>
							) : (
								<>
									<svg
										className="w-5 h-5 text-gray-500 flex-shrink-0"
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
									<span className="text-gray-700">
										{suggestion.display}
									</span>
								</>
							)}
						</button>
					))}
				</div>
			)}
		</div>
	);
};
