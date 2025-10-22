'use client';

import React from 'react';
import { ClientInfoForm } from './ClientInfoForm';
import { PropertyFormData, Property } from '@/lib/api/propertyApi';

interface PropertyFormStep5Props {
	formData: PropertyFormData;
	handleInputChange: (
		field: keyof PropertyFormData,
		value: Property['clientInfo'] | undefined,
	) => void;
}

export const PropertyFormStep5: React.FC<PropertyFormStep5Props> = ({
	formData,
	handleInputChange,
}) => {
	return (
		<div className="space-y-6">
			<h3 className="text-lg font-semibold mb-4">Informations client</h3>
			<p className="text-sm text-gray-600 mb-4">
				Ces informations seront visibles uniquement pour les agents avec
				lesquels vous collaborez.
			</p>
			<ClientInfoForm
				clientInfo={formData.clientInfo || {}}
				onChange={(clientInfo) =>
					handleInputChange('clientInfo', clientInfo)
				}
			/>
		</div>
	);
};
