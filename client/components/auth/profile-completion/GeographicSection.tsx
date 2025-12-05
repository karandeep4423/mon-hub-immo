import React from 'react';
import { Input, Textarea, CityAutocomplete } from '@/components/ui';
import { Select } from '@/components/ui/CustomSelect';
import { Features } from '@/lib/constants';
import {
	ProfileCompletionFormData,
	INTERVENTION_RADIUS_OPTIONS,
} from './types';

interface GeographicSectionProps {
	values: ProfileCompletionFormData;
	errors: Record<string, string>;
	handleChange: (
		e: React.ChangeEvent<
			HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
		>,
	) => void;
}

export const GeographicSection: React.FC<GeographicSectionProps> = ({
	values,
	errors,
	handleChange,
}) => {
	return (
		<div>
			<h3 className="text-lg font-semibold text-gray-900 mb-4">
				Secteur géographique d&apos;activité
			</h3>

			<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
				<CityAutocomplete
					label="Ville principale *"
					value={values.city}
					onCitySelect={(cityName, postalCode) => {
						handleChange({
							target: { name: 'city', value: cityName },
						} as React.ChangeEvent<HTMLInputElement>);
						handleChange({
							target: { name: 'postalCode', value: postalCode },
						} as React.ChangeEvent<HTMLInputElement>);
					}}
					placeholder={Features.Auth.AUTH_PLACEHOLDERS.SEARCH_CITY}
					error={errors.city}
				/>

				<Input
					label="Code postal *"
					name="postalCode"
					value={values.postalCode}
					onChange={handleChange}
					error={errors.postalCode}
					placeholder={Features.Auth.AUTH_PLACEHOLDERS.POSTAL_CODE}
					disabled
				/>

				<div>
					<label className="block text-sm font-medium text-gray-700 mb-1">
						Rayon d&apos;intervention *
					</label>
					<Select
						label=""
						value={values.interventionRadius?.toString() || ''}
						onChange={(value) => {
							handleChange({
								target: { name: 'interventionRadius', value },
							} as React.ChangeEvent<HTMLSelectElement>);
						}}
						name="interventionRadius"
						options={INTERVENTION_RADIUS_OPTIONS}
						error={errors.interventionRadius}
					/>
				</div>
			</div>

			<div className="mt-4">
				<Textarea
					label="Communes couvertes *"
					name="coveredCities"
					value={values.coveredCities}
					onChange={handleChange}
					rows={3}
					placeholder={Features.Auth.AUTH_PLACEHOLDERS.CITIES}
					error={errors.coveredCities}
				/>
			</div>
		</div>
	);
};
