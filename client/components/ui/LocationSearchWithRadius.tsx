/**
 * Enhanced Location Search Input with Radius Filter
 * Uses French Address API for real-time municipality lookup
 */

'use client';

import React, { useState, useEffect, useRef } from 'react';
import { LoadingSpinner } from './LoadingSpinner';
import { logger } from '@/lib/utils/logger';
import {
	searchMunicipalities,
	getMunicipalitiesByPostalPrefix,
} from '@/lib/services/frenchAddressApi';
import { DEBOUNCE_AUTOCOMPLETE_MS } from '@/lib/constants';
import { useClickOutside } from '@/hooks/useClickOutside';

export interface LocationItem {
	name: string;
	postcode: string;
	citycode: string;
	coordinates: {
		lat: number;
		lon: number;
	};
	context: string;
	display: string;
	value: string;
}

interface LocationSearchWithRadiusProps {
	selectedLocations: LocationItem[];
	onLocationsChange: (locations: LocationItem[]) => void;
	radiusKm: number;
	onRadiusChange: (radius: number) => void;
	placeholder?: string;
	className?: string;
}

const RADIUS_OPTIONS = [5, 10, 20, 30, 50];

export const LocationSearchWithRadius: React.FC<
	LocationSearchWithRadiusProps
> = ({
	selectedLocations,
	onLocationsChange,
	radiusKm,
	onRadiusChange,
	placeholder = 'Ville ou code postal',
	className = '',
}) => {
	const [inputValue, setInputValue] = useState('');
	const [suggestions, setSuggestions] = useState<LocationItem[]>([]);
	const [nearbyCities, setNearbyCities] = useState<LocationItem[]>([]);
	const [selectedNearby, setSelectedNearby] = useState<Set<string>>(
		new Set(),
	);
	const [showNearbyCities, setShowNearbyCities] = useState(false);
	const [showDropdown, setShowDropdown] = useState(false);
	const [isFetching, setIsFetching] = useState(false);
	const [isFetchingNearby, setIsFetchingNearby] = useState(false);
	const dropdownRef = useRef<HTMLDivElement>(null);
	const inputRef = useRef<HTMLInputElement>(null);

	// Fetch suggestions from API
	useEffect(() => {
		const fetchSuggestions = async () => {
			const trimmedInput = inputValue.trim();

			// Different minimum lengths: postal codes (numeric) need 2+, city names need 3+
			const isPostalCode = /^\d+$/.test(trimmedInput);
			const minLength = isPostalCode ? 2 : 3;

			if (!trimmedInput || trimmedInput.length < minLength) {
				setSuggestions([]);
				setIsFetching(false);
				return;
			}

			setIsFetching(true);
			try {
				const municipalities = await searchMunicipalities(
					inputValue,
					10,
				);

				const locationItems: LocationItem[] = municipalities
					.filter((municipality) => {
						const locationValue = `${municipality.name}-${municipality.postcode}`;
						return !selectedLocations.some(
							(loc) => loc.value === locationValue,
						);
					})
					.map((municipality) => ({
						...municipality,
						display: `${municipality.name} (${municipality.postcode})`,
						value: `${municipality.name}-${municipality.postcode}`,
					}));

				setSuggestions(locationItems);
			} catch (error) {
				logger.error('Error fetching municipalities:', error);
				setSuggestions([]);
			} finally {
				setIsFetching(false);
			}
		};

		const debounceTimer = setTimeout(
			fetchSuggestions,
			DEBOUNCE_AUTOCOMPLETE_MS,
		);
		return () => clearTimeout(debounceTimer);
	}, [inputValue, selectedLocations]);

	// Handle click outside
	useClickOutside([dropdownRef, inputRef], () => setShowDropdown(false));

	const handleSelectLocation = async (location: LocationItem) => {
		// Fetch nearby cities with same postal code prefix
		setIsFetchingNearby(true);
		setShowNearbyCities(true);

		try {
			const nearby = await getMunicipalitiesByPostalPrefix(
				location.postcode,
				20,
			);

			// Convert to LocationItem format and filter out the selected one
			const nearbyItems = nearby
				.map((municipality) => ({
					name: municipality.name,
					postcode: municipality.postcode,
					citycode: municipality.citycode,
					coordinates: municipality.coordinates,
					context: municipality.context,
					display: `${municipality.name} (${municipality.postcode})`,
					value: `${municipality.name}-${municipality.postcode}`,
				}))
				.filter((item) => item.value !== location.value);

			// If only 1 city (no nearby cities), add it directly without showing dropdown
			if (nearbyItems.length === 0) {
				onLocationsChange([location]);
				setInputValue('');
				setSuggestions([]);
				setShowDropdown(false);
				setShowNearbyCities(false);
				setIsFetchingNearby(false);
				return;
			}

			// Multiple cities - show checkbox dropdown
			setNearbyCities([location, ...nearbyItems]);

			// Pre-select the main location
			setSelectedNearby(new Set([location.value]));
		} catch (error) {
			logger.error('Error fetching nearby cities:', error);
			// Fallback: just add the selected location
			onLocationsChange([location]);
		} finally {
			setIsFetchingNearby(false);
		}
	};

	const handleToggleNearbyCity = (value: string) => {
		const newSelected = new Set(selectedNearby);
		if (newSelected.has(value)) {
			newSelected.delete(value);
		} else {
			newSelected.add(value);
		}
		setSelectedNearby(newSelected);
	};

	const handleSelectAllNearby = () => {
		const allValues = new Set(nearbyCities.map((city) => city.value));
		setSelectedNearby(allValues);
	};

	const handleConfirmSelection = () => {
		const selected = nearbyCities.filter((city) =>
			selectedNearby.has(city.value),
		);
		onLocationsChange(selected);
		setInputValue('');
		setSuggestions([]);
		setShowDropdown(false);
		setShowNearbyCities(false);
		setNearbyCities([]);
		setSelectedNearby(new Set());
		inputRef.current?.focus();
	};

	const handleCancelNearby = () => {
		setShowNearbyCities(false);
		setNearbyCities([]);
		setSelectedNearby(new Set());
		setShowDropdown(false);
	};

	const handleRemoveLocation = (value: string) => {
		onLocationsChange(
			selectedLocations.filter((loc) => loc.value !== value),
		);
	};

	return (
		<div className={`space-y-3 ${className}`}>
			{/* Selected locations as chips */}
			{selectedLocations.length > 0 && (
				<div className="flex flex-wrap gap-2">
					{selectedLocations.map((location) => (
						<div
							key={location.value}
							className="inline-flex items-center px-3 py-1.5 bg-brand-50 text-brand-700 rounded-full text-sm font-medium border border-brand-200"
						>
							<svg
								className="w-4 h-4 mr-1.5"
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24"
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth={2}
									d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
								/>
							</svg>
							<span>{location.display}</span>
							<button
								onClick={() =>
									handleRemoveLocation(location.value)
								}
								className="ml-2 hover:text-brand-900 focus:outline-none"
								type="button"
							>
								<svg
									className="w-4 h-4"
									fill="currentColor"
									viewBox="0 0 20 20"
								>
									<path
										fillRule="evenodd"
										d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
										clipRule="evenodd"
									/>
								</svg>
							</button>
						</div>
					))}
				</div>
			)}

			<div className="flex gap-3">
				{/* Location search input */}
				<div className="flex-1 relative">
					<div className="relative">
						<div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
							<svg
								className="h-5 w-5 text-gray-400"
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24"
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth={2}
									d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
								/>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth={2}
									d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
								/>
							</svg>
						</div>
						<input
							ref={inputRef}
							type="text"
							value={inputValue}
							onChange={(e) => setInputValue(e.target.value)}
							onFocus={() => setShowDropdown(true)}
							placeholder={placeholder}
							className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand focus:border-brand text-sm"
						/>
						{isFetching && (
							<div className="absolute inset-y-0 right-0 pr-3 flex items-center">
								<LoadingSpinner size="sm" />
							</div>
						)}
					</div>{' '}
					{/* Dropdown - two modes: nearby cities selection or initial suggestions */}
					{showDropdown &&
						(showNearbyCities ? (
							// Mode 2: Nearby cities with checkboxes
							<div
								ref={dropdownRef}
								className="absolute z-50 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-96 overflow-y-auto"
							>
								<div className="sticky top-0 bg-white border-b border-gray-200 p-3">
									<div className="font-medium text-gray-900 mb-2">
										Sélectionnez les communes (
										{nearbyCities.length})
									</div>
									{isFetchingNearby && (
										<div className="text-sm text-gray-500 flex items-center">
											<LoadingSpinner size="sm" />
											Chargement...
										</div>
									)}
								</div>

								<div className="p-2">
									{nearbyCities.map((city) => (
										<label
											key={city.value}
											className="flex items-center px-3 py-2.5 hover:bg-brand-50 rounded cursor-pointer transition-colors"
										>
											<input
												type="checkbox"
												checked={selectedNearby.has(
													city.value,
												)}
												onChange={() =>
													handleToggleNearbyCity(
														city.value,
													)
												}
												className="w-4 h-4 text-brand border-gray-300 rounded focus:ring-brand mr-3"
											/>
											<div className="flex-1">
												<div className="font-medium text-gray-900">
													{city.display}
												</div>
											</div>
										</label>
									))}
								</div>

								<div className="sticky bottom-0 bg-white border-t border-gray-200 p-3 flex gap-2">
									<button
										type="button"
										onClick={handleSelectAllNearby}
										className="flex-1 px-3 py-2 text-sm font-medium text-brand border border-brand rounded-lg hover:bg-brand-50 transition-colors"
									>
										Tout sélectionner ({nearbyCities.length}
										)
									</button>
									<button
										type="button"
										onClick={handleConfirmSelection}
										className="flex-1 px-3 py-2 text-sm font-medium text-white bg-brand rounded-lg hover:bg-brand/90 transition-colors"
									>
										Confirmer ({selectedNearby.size}{' '}
										sélectionnée
										{selectedNearby.size > 1 ? 's' : ''})
									</button>
									<button
										type="button"
										onClick={handleCancelNearby}
										className="px-3 py-2 text-sm font-medium text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
									>
										Annuler
									</button>
								</div>
							</div>
						) : (
							// Mode 1: Initial suggestions
							suggestions.length > 0 && (
								<div
									ref={dropdownRef}
									className="absolute z-50 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto"
								>
									{suggestions.map((suggestion) => (
										<button
											key={suggestion.value}
											type="button"
											onClick={() =>
												handleSelectLocation(suggestion)
											}
											className="w-full px-4 py-2.5 text-left hover:bg-brand-50 focus:bg-brand-50 focus:outline-none transition-colors border-b border-gray-100 last:border-b-0"
										>
											<div className="flex items-center">
												<svg
													className="w-4 h-4 mr-2 text-brand flex-shrink-0"
													fill="none"
													stroke="currentColor"
													viewBox="0 0 24 24"
												>
													<path
														strokeLinecap="round"
														strokeLinejoin="round"
														strokeWidth={2}
														d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
													/>
												</svg>
												<div className="flex-1">
													<div className="font-medium text-gray-900">
														{suggestion.name}
													</div>
													<div className="text-xs text-gray-500">
														{suggestion.postcode} •{' '}
														{suggestion.context}
													</div>
												</div>
											</div>
										</button>
									))}
								</div>
							)
						))}
				</div>

				{/* Radius selector */}
				<div className="w-40">
					<select
						value={radiusKm}
						onChange={(e) => onRadiusChange(Number(e.target.value))}
						className="block w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand focus:border-brand text-sm bg-white"
					>
						{RADIUS_OPTIONS.map((radius) => (
							<option key={radius} value={radius}>
								{radius} km
							</option>
						))}
					</select>
				</div>
			</div>

			{selectedLocations.length > 0 && (
				<p className="text-xs text-gray-500">
					Affichage dans un rayon de {radiusKm} km autour de{' '}
					{selectedLocations.length === 1
						? selectedLocations[0].name
						: `${selectedLocations.length} communes`}
				</p>
			)}
		</div>
	);
};
