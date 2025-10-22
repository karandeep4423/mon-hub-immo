'use client';

import React from 'react';
import { Input } from '@/components/ui/Input';
import { NumberInput, Select, EnergyRatingSelector } from '@/components/ui';
import { PropertyFormData, Property } from '@/lib/api/propertyApi';

interface PropertyFormStep3Props {
	formData: PropertyFormData;
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

export const PropertyFormStep3: React.FC<PropertyFormStep3Props> = ({
	formData,
	handleInputChange,
}) => {
	return (
		<div className="space-y-6">
			<h3 className="text-lg font-semibold mb-4">Détails du bien</h3>

			{!['Terrain', 'Local commercial'].includes(
				formData.propertyType,
			) && (
				<div className="grid grid-cols-2 md:grid-cols-4 gap-4">
					<NumberInput
						label="Nombre de pièces"
						value={formData.rooms}
						onChange={(value) => handleInputChange('rooms', value)}
						name="rooms"
						unit="pièce(s)"
						placeholder="3"
						min={1}
						max={50}
					/>

					<Select
						label="Nombre de chambres"
						value={formData.bedrooms?.toString()}
						onChange={(value) =>
							handleInputChange(
								'bedrooms',
								parseInt(value) || undefined,
							)
						}
						name="bedrooms"
						options={Array.from({ length: 10 }, (_, i) => ({
							value: (i + 1).toString(),
							label: (i + 1).toString(),
						}))}
						placeholder="Choisissez..."
					/>

					<NumberInput
						label="Nombre de salles de bain"
						value={formData.bathrooms}
						onChange={(value) =>
							handleInputChange('bathrooms', value)
						}
						name="bathrooms"
						placeholder="1"
						min={0}
						max={10}
					/>

					<NumberInput
						label="Nombre de niveaux"
						value={formData.levels}
						onChange={(value) => handleInputChange('levels', value)}
						name="levels"
						placeholder="1"
						min={1}
						max={20}
					/>
				</div>
			)}

			<div className="grid grid-cols-2 md:grid-cols-3 gap-4">
				{!['Terrain', 'Local commercial'].includes(
					formData.propertyType,
				) && (
					<Select
						label="Exposition"
						value={formData.orientation}
						onChange={(value) =>
							handleInputChange('orientation', value)
						}
						name="orientation"
						options={[
							{ value: 'Nord', label: 'Nord' },
							{ value: 'Sud', label: 'Sud' },
							{ value: 'Est', label: 'Est' },
							{ value: 'Ouest', label: 'Ouest' },
							{ value: 'Nord-Est', label: 'Nord-Est' },
							{ value: 'Nord-Ouest', label: 'Nord-Ouest' },
							{ value: 'Sud-Est', label: 'Sud-Est' },
							{ value: 'Sud-Ouest', label: 'Sud-Ouest' },
						]}
						placeholder="Choisissez..."
					/>
				)}

				{formData.propertyType !== 'Terrain' && (
					<Select
						label="Places de parking"
						value={formData.parkingSpaces?.toString()}
						onChange={(value) =>
							handleInputChange(
								'parkingSpaces',
								parseInt(value) || undefined,
							)
						}
						name="parkingSpaces"
						options={Array.from({ length: 11 }, (_, i) => ({
							value: i.toString(),
							label: i === 0 ? 'Aucune' : i.toString(),
						}))}
						placeholder="Choisissez..."
					/>
				)}

				{formData.propertyType !== 'Local commercial' && (
					<Select
						label="Extérieur"
						value={formData.exterior?.[0] || ''}
						onChange={(value) =>
							handleInputChange('exterior', value ? [value] : [])
						}
						name="exterior"
						options={[
							{ value: 'garden', label: 'Jardin' },
							{ value: 'balcony', label: 'Balcon' },
							{ value: 'terrace', label: 'Terrasse' },
							{ value: 'courtyard', label: 'Cour' },
							{ value: 'none', label: 'Aucun' },
						]}
						placeholder="Choisissez..."
					/>
				)}
			</div>

			<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
				<Input
					type="text"
					value={formData.availableFrom || ''}
					onChange={(e) => {
						let value = e.target.value.replace(/\D/g, '');
						if (value.length >= 2) {
							value =
								value.substring(0, 2) +
								'/' +
								value.substring(2, 6);
						}
						handleInputChange('availableFrom', value);
					}}
					placeholder="MM / AAAA"
					label="Disponible à partir de"
					name="availableFrom"
					maxLength={7}
				/>

				<Select
					label="État du bien"
					value={formData.condition}
					onChange={(value) => handleInputChange('condition', value)}
					name="condition"
					options={[
						{ value: 'new', label: 'Neuf' },
						{ value: 'good', label: 'Bon état' },
						{ value: 'refresh', label: 'À rafraîchir' },
						{ value: 'renovate', label: 'À rénover' },
					]}
					placeholder="Choisissez..."
				/>
			</div>

			{!['Terrain', 'Local commercial'].includes(
				formData.propertyType,
			) && (
				<>
					<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
						<Select
							label="Mode de chauffage"
							value={formData.heatingType}
							onChange={(value) =>
								handleInputChange('heatingType', value)
							}
							name="heatingType"
							options={[
								{ value: 'Gaz', label: 'Gaz' },
								{ value: 'Électrique', label: 'Électrique' },
								{ value: 'Fioul', label: 'Fioul' },
								{
									value: 'Pompe à chaleur',
									label: 'Pompe à chaleur',
								},
								{ value: 'Solaire', label: 'Solaire' },
								{ value: 'Bois', label: 'Bois' },
							]}
							placeholder="Choisissez..."
						/>
					</div>

					<EnergyRatingSelector
						label="Classé énergie *"
						value={formData.energyRating}
						onChange={(value) =>
							handleInputChange('energyRating', value)
						}
						name="energyRating"
					/>

					<EnergyRatingSelector
						label="GES *"
						value={formData.gasEmissionClass}
						onChange={(value) =>
							handleInputChange('gasEmissionClass', value)
						}
						name="gasEmissionClass"
					/>
				</>
			)}
		</div>
	);
};
