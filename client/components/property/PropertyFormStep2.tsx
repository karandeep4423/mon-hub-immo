'use client';

import React from 'react';
import { Input } from '@/components/ui/Input';
import { AddressAutocomplete } from '@/components/ui';
import { PropertyFormData, Property } from '@/lib/api/propertyApi';
import { logger } from '@/lib/utils/logger';
import { MapPin, Home, Mail, Map } from 'lucide-react';

interface PropertyFormStep2Props {
	formData: PropertyFormData;
	errors: Record<string, string>;
	handleInputChange: (
		field: keyof PropertyFormData,
		value:
			| string
			| number
			| boolean
			| string[]
			| Property['clientInfo']
			| undefined,
	) => void;
}

export const PropertyFormStep2: React.FC<PropertyFormStep2Props> = ({
	formData,
	errors,
	handleInputChange,
}) => {
	return (
		<div className="space-y-6">
			<h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
				<MapPin className="w-5 h-5 text-red-600" />
				Localisation
			</h3>

			<AddressAutocomplete
				label="Adresse"
				value={formData.address || ''}
				onAddressSelect={(address, city, postalCode, coordinates) => {
					handleInputChange('address', address);
					handleInputChange('city', city);
					handleInputChange('postalCode', postalCode);
					if (coordinates) {
						logger.debug(
							'[PropertyFormStep2] Address coordinates:',
							coordinates,
						);
					}
				}}
				placeholder="Rechercher une adresse..."
				error={errors.address}
				required
			/>

			<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
				<div>
					<label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
						<Home className="w-4 h-4 text-blue-600" />
						Ville *
					</label>
					<Input
						type="text"
						value={formData.city}
						onChange={(e) =>
							handleInputChange('city', e.target.value)
						}
						placeholder="Ex: Paris, Lyon, Marseille..."
						error={errors.city}
					/>
				</div>

				<div>
					<label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
						<Mail className="w-4 h-4 text-purple-600" />
						Code postal *
					</label>
					<Input
						type="text"
						value={formData.postalCode}
						onChange={(e) =>
							handleInputChange('postalCode', e.target.value)
						}
						placeholder="75001"
						error={errors.postalCode}
						disabled
					/>
				</div>

				<div>
					<label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
						<Map className="w-4 h-4 text-green-600" />
						Secteur *
					</label>
					<Input
						type="text"
						value={formData.sector}
						onChange={(e) =>
							handleInputChange('sector', e.target.value)
						}
						placeholder="Centre-ville"
						error={errors.sector}
					/>
				</div>
			</div>
		</div>
	);
};
