'use client';

import { useState, useRef, useEffect } from 'react';
import { searchCities } from '@/lib/utils/cityPostalCodeData';
import { useLocationHistory } from '@/hooks/useLocationHistory';
import type {
	LocationItem,
	LocationSearchProps,
	UnifiedSearchProps,
} from '@/types/location';

/**
 * Consolidated LocationSearch component
 * Replaces: LocationSearchInput, UnifiedSearchBar, SingleUnifiedSearch
 *
 * @param variant - Display mode:
 *   - 'separate': Location input only (default)
 *   - 'unified': Separate search + location inputs
 *   - 'inline': Single input with inline chips
 */

// Separate location input only
export const LocationSearch: React.FC<LocationSearchProps> = (props) => {
	return (
		<LocationSearchBase
			variant="separate"
			searchTerm=""
			onSearchChange={() => {}}
			{...props}
		/>
	);
};

// Unified search with separate inputs
export const UnifiedSearchBar: React.FC<UnifiedSearchProps> = (props) => {
	return <LocationSearchBase variant="unified" {...props} />;
};

// Single input with inline chips
export const SingleUnifiedSearch: React.FC<UnifiedSearchProps> = (props) => {
	return <LocationSearchBase variant="inline" {...props} />;
};

// Base component with all logic
const LocationSearchBase: React.FC<
	UnifiedSearchProps & { variant: 'separate' | 'unified' | 'inline' }
> = ({
	variant = 'separate',
	searchTerm = '',
	onSearchChange,
	selectedLocations,
	onLocationsChange,
	placeholder = 'Saisissez une localisation',
	className = '',
}) => {
	const [inputValue, setInputValue] = useState('');
	const [showSuggestions, setShowSuggestions] = useState(false);
	const [suggestions, setSuggestions] = useState<LocationItem[]>([]);
	const inputRef = useRef<HTMLInputElement>(null);
	const dropdownRef = useRef<HTMLDivElement>(null);
	const locationDropdownRef = useRef<HTMLDivElement>(null);

	const { getPreviousLocations, saveToPreviousLocations } =
		useLocationHistory();

	// Detect if user is searching for location
	const isLocationSearch = (query: string): boolean => {
		if (/^\d+$/.test(query.trim())) return true;
		const words = query.trim().split(/\s+/);
		if (words.length <= 3 && query.length <= 30) return true;
		return false;
	};

	// Generate suggestions
	useEffect(() => {
		const currentInput = variant === 'inline' ? searchTerm : inputValue;

		if (!currentInput.trim()) {
			if (showSuggestions || variant === 'inline') {
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

				setSuggestions(
					previous.length > 0
						? [...previous, ...defaultSuggestions]
						: defaultSuggestions,
				);
			}
			return;
		}

		// Check if it's a location search
		if (variant === 'inline' && !isLocationSearch(currentInput)) {
			setShowSuggestions(false);
			return;
		}

		const searchResults = searchCities(currentInput, 10);
		const matches: LocationItem[] = [];

		searchResults.forEach((item) => {
			const locationValue = `${item.city}-${item.postalCode}`;
			const alreadySelected = selectedLocations.some(
				(loc) => loc.value === locationValue,
			);

			if (alreadySelected) return;

			matches.push({
				type: /^\d+$/.test(currentInput.trim()) ? 'postalCode' : 'city',
				city: item.city,
				postalCode: item.postalCode,
				display: `${item.city} (${item.postalCode})`,
				value: locationValue,
			});
		});

		setSuggestions(matches);
		if (variant === 'inline' && matches.length > 0) {
			setShowSuggestions(true);
		}
	}, [
		inputValue,
		searchTerm,
		selectedLocations,
		showSuggestions,
		variant,
		getPreviousLocations,
	]);

	// Handle click outside
	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (
				dropdownRef.current &&
				!dropdownRef.current.contains(event.target as Node) &&
				inputRef.current &&
				!inputRef.current.contains(event.target as Node) &&
				locationDropdownRef.current &&
				!locationDropdownRef.current.contains(event.target as Node)
			) {
				setShowSuggestions(false);
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

		if (variant === 'inline') {
			onSearchChange?.('');
		} else {
			setInputValue('');
		}
		setShowSuggestions(false);
	};

	const handleRemoveLocation = (valueToRemove: string) => {
		onLocationsChange(
			selectedLocations.filter((loc) => loc.value !== valueToRemove),
		);
	};

	const handleInputChange = (value: string) => {
		if (variant === 'inline') {
			onSearchChange?.(value);
			if (isLocationSearch(value)) {
				setShowSuggestions(true);
			}
		} else {
			setInputValue(value);
		}
	};

	const handleInputFocus = () => {
		setShowSuggestions(true);
	};

	// Render suggestions dropdown
	const renderSuggestionsDropdown = () => {
		if (!showSuggestions || suggestions.length === 0) return null;

		const currentInput = variant === 'inline' ? searchTerm : inputValue;

		return (
			<div
				ref={variant === 'unified' ? locationDropdownRef : dropdownRef}
				className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-64 overflow-y-auto"
			>
				{currentInput.trim() === '' &&
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
						<LocationIcon
							type={suggestion.type}
							value={suggestion.value}
						/>
						<span className="text-gray-700">
							{suggestion.display}
						</span>
					</button>
				))}
			</div>
		);
	};

	// Render location chips
	const renderLocationChips = () => {
		if (selectedLocations.length === 0) return null;

		return (
			<div className="flex flex-wrap gap-2 mb-2">
				{selectedLocations.map((location) => (
					<div
						key={location.value}
						className="inline-flex items-center gap-2 bg-blue-100 text-blue-800 px-3 py-1.5 rounded-full text-sm"
					>
						<span>{location.display}</span>
						<button
							type="button"
							onClick={() => handleRemoveLocation(location.value)}
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
		);
	};

	// Variant: Separate (location input only)
	if (variant === 'separate') {
		return (
			<div className={`relative ${className}`}>
				<div className="relative">
					{renderLocationChips()}

					<div className="relative">
						<div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
							<LocationIcon type="default" />
						</div>
						<input
							ref={inputRef}
							type="text"
							value={inputValue}
							onChange={(e) => handleInputChange(e.target.value)}
							onFocus={handleInputFocus}
							placeholder={placeholder}
							className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand focus:border-brand"
						/>
					</div>

					{renderSuggestionsDropdown()}
				</div>
			</div>
		);
	}

	// Variant: Unified (separate search + location)
	if (variant === 'unified') {
		return (
			<div className={`relative ${className}`}>
				<div className="flex flex-col gap-3">
					{/* Main search input */}
					<div className="relative">
						<input
							type="text"
							placeholder={placeholder}
							value={searchTerm}
							onChange={(e) => onSearchChange?.(e.target.value)}
							className="w-full border rounded-lg p-3 pr-10 focus:outline-none focus:ring-2 focus:ring-brand focus:border-brand"
						/>
						<button className="absolute right-3 top-3 text-gray-500 hover:text-brand">
							<SearchIcon />
						</button>
					</div>

					{/* Location search area */}
					<div className="relative" ref={dropdownRef}>
						{renderLocationChips()}

						<div className="relative">
							<div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
								<LocationIcon type="default" />
							</div>
							<input
								type="text"
								value={inputValue}
								onChange={(e) =>
									handleInputChange(e.target.value)
								}
								onFocus={handleInputFocus}
								placeholder="Rechercher par ville ou code postal"
								className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand focus:border-brand"
							/>
						</div>

						{renderSuggestionsDropdown()}
					</div>
				</div>
			</div>
		);
	}

	// Variant: Inline (single input with chips)
	return (
		<div className={`relative ${className}`}>
			<div className="relative">
				<div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 z-10">
					<LocationIcon type="default" />
				</div>

				<div className="flex items-center flex-wrap gap-2 border rounded-lg p-2 pl-10 pr-10 min-h-[48px] focus-within:ring-2 focus-within:ring-brand focus-within:border-brand">
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

				<button className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-brand">
					<SearchIcon />
				</button>
			</div>

			{renderSuggestionsDropdown()}
		</div>
	);
};

// Helper components for icons
const LocationIcon: React.FC<{
	type?: 'default' | 'city' | 'postalCode' | 'special';
	value?: string;
}> = ({ type = 'default', value }) => {
	if (type === 'special' && value === 'near_me') {
		return (
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
		);
	}

	return (
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
	);
};

const SearchIcon = () => (
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
);

// Re-export types for convenience
export type { LocationItem, LocationSearchProps, UnifiedSearchProps };
