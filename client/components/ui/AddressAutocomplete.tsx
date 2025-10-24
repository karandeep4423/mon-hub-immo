'use client';

import React, { useEffect, useRef } from 'react';
import {
	useAddressSearch,
	type AddressSuggestion,
} from '@/hooks/useAddressSearch';
import { useClickOutside } from '@/hooks/useClickOutside';
import { LoadingSpinner } from './LoadingSpinner';

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

export const AddressAutocomplete: React.FC<AddressAutocompleteProps> = ({
	label,
	value,
	onAddressSelect,
	placeholder = 'Rechercher une adresse...',
	error,
	required,
}) => {
	const dropdownRef = useRef<HTMLDivElement>(null);
	const [showDropdown, setShowDropdown] = React.useState(false);

	// Use the custom hook
	const {
		inputValue,
		setInputValue,
		suggestions,
		isLoading,
		selectSuggestion,
	} = useAddressSearch(value, (suggestion) => {
		// Extract street address for the field
		const streetAddress = suggestion.housenumber
			? `${suggestion.housenumber} ${suggestion.name}`
			: suggestion.name;

		onAddressSelect(
			streetAddress,
			suggestion.city,
			suggestion.postcode,
			suggestion.coordinates,
		);
		setShowDropdown(false);
	});

	// Show dropdown when suggestions are available
	useEffect(() => {
		if (suggestions.length > 0) {
			setShowDropdown(true);
		}
	}, [suggestions]);

	// Close dropdown on outside click
	useClickOutside([dropdownRef], () => setShowDropdown(false));

	const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setInputValue(e.target.value);
		setShowDropdown(true);
	};

	const handleSelectAddress = (suggestion: AddressSuggestion) => {
		selectSuggestion(suggestion);
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
						<LoadingSpinner size="sm" />
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
