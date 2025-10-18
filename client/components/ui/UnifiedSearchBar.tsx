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

interface UnifiedSearchBarProps {
	searchTerm: string;
	onSearchChange: (value: string) => void;
	selectedLocations: LocationItem[];
	onLocationsChange: (locations: LocationItem[]) => void;
	placeholder?: string;
	className?: string;
}

export const UnifiedSearchBar: React.FC<UnifiedSearchBarProps> = ({
	searchTerm,
	onSearchChange,
	selectedLocations,
	onLocationsChange,
	placeholder = 'Rechercher dans les biens et recherches...',
	className = '',
}) => {
	const [showLocationDropdown, setShowLocationDropdown] = useState(false);
	const [locationInput, setLocationInput] = useState('');
	const [suggestions, setSuggestions] = useState<LocationItem[]>([]);
	const inputRef = useRef<HTMLInputElement>(null);
	const dropdownRef = useRef<HTMLDivElement>(null);
	const locationDropdownRef = useRef<HTMLDivElement>(null);

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

	// Generate location suggestions
	useEffect(() => {
		if (!locationInput.trim()) {
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

		const searchResults = searchCities(locationInput, 10);
		const matches: LocationItem[] = [];

		searchResults.forEach((item) => {
			const locationValue = `${item.city}-${item.postalCode}`;
			const alreadySelected = selectedLocations.some(
				(loc) => loc.value === locationValue,
			);

			if (alreadySelected) return;

			matches.push({
				type: /^\d+$/.test(locationInput.trim())
					? 'postalCode'
					: 'city',
				city: item.city,
				postalCode: item.postalCode,
				display: `${item.city} (${item.postalCode})`,
				value: locationValue,
			});
		});

		setSuggestions(matches);
	}, [locationInput, selectedLocations]);

	// Handle click outside to close dropdown
	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (
				locationDropdownRef.current &&
				!locationDropdownRef.current.contains(event.target as Node) &&
				dropdownRef.current &&
				!dropdownRef.current.contains(event.target as Node)
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
		setLocationInput('');
		setShowLocationDropdown(false);
	};

	const handleRemoveLocation = (valueToRemove: string) => {
		onLocationsChange(
			selectedLocations.filter((loc) => loc.value !== valueToRemove),
		);
	};

	return (
		<div className={`relative ${className}`}>
			<div className="flex flex-col gap-3">
				{/* Main search input */}
				<div className="relative">
					<input
						ref={inputRef}
						type="text"
						placeholder={placeholder}
						value={searchTerm}
						onChange={(e) => onSearchChange(e.target.value)}
						className="w-full border rounded-lg p-3 pr-10 focus:outline-none focus:ring-2 focus:ring-brand focus:border-brand"
					/>
					<button className="absolute right-3 top-3 text-gray-500 hover:text-brand">
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

				{/* Location search area */}
				<div className="relative" ref={dropdownRef}>
					{/* Selected locations as chips */}
					{selectedLocations.length > 0 && (
						<div className="flex flex-wrap gap-2 mb-2">
							{selectedLocations.map((location) => (
								<div
									key={location.value}
									className="inline-flex items-center gap-2 bg-blue-100 text-blue-800 px-3 py-1.5 rounded-full text-sm"
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
											className="w-4 h-4"
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
						</div>
					)}

					{/* Location input field with icon */}
					<div className="relative">
						<div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
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
						<input
							type="text"
							value={locationInput}
							onChange={(e) => setLocationInput(e.target.value)}
							onFocus={() => setShowLocationDropdown(true)}
							placeholder="Rechercher par ville ou code postal"
							className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand focus:border-brand"
						/>
					</div>

					{/* Location suggestions dropdown */}
					{showLocationDropdown && suggestions.length > 0 && (
						<div
							ref={locationDropdownRef}
							className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-64 overflow-y-auto"
						>
							{locationInput.trim() === '' &&
								getPreviousLocations().length > 0 && (
									<div className="px-3 py-2 text-xs font-semibold text-gray-500 bg-gray-50">
										Suggestions
									</div>
								)}
							{suggestions.map((suggestion, index) => (
								<button
									key={`${suggestion.value}-${index}`}
									type="button"
									onClick={() =>
										handleSelectLocation(suggestion)
									}
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
			</div>
		</div>
	);
};
