'use client';

import React from 'react';
import { Input } from '@/components/ui/Input';
import { NumberInput, Select, EnergyRatingSelector } from '@/components/ui';
import { PropertyFormData, Property } from '@/lib/api/propertyApi';
import {
	Layers,
	BedDouble,
	Bath,
	Building2,
	Compass,
	ParkingCircle,
	Trees,
	Calendar,
	Hammer,
	Flame,
	Zap,
	Leaf,
} from 'lucide-react';

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
			<h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
				<Layers className="w-5 h-5 text-indigo-600" />
				Détails du bien
			</h3>
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
						icon={<Building2 className="w-4 h-4 text-blue-600" />}
					/>

					<NumberInput
						label="Nombre de chambres"
						value={formData.bedrooms}
						onChange={(value) =>
							handleInputChange('bedrooms', value)
						}
						name="bedrooms"
						placeholder="2"
						min={0}
						max={10}
						icon={<BedDouble className="w-4 h-4 text-purple-600" />}
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
						icon={<Bath className="w-4 h-4 text-cyan-600" />}
					/>

					<NumberInput
						label="Nombre de niveaux"
						value={formData.levels}
						onChange={(value) => handleInputChange('levels', value)}
						name="levels"
						placeholder="1"
						min={1}
						max={20}
						icon={<Layers className="w-4 h-4 text-slate-600" />}
					/>
				</div>
			)}
			<div className="grid grid-cols-2 md:grid-cols-3 gap-4">
				{!['Terrain', 'Local commercial'].includes(
					formData.propertyType,
				) && (
					<Select
						label="Exposition"
						name="orientation"
						value={formData.orientation}
						onChange={(value) =>
							handleInputChange('orientation', value)
						}
						icon={<Compass className="w-4 h-4 text-amber-600" />}
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
						name="parkingSpaces"
						value={formData.parkingSpaces?.toString()}
						onChange={(value) =>
							handleInputChange(
								'parkingSpaces',
								parseInt(value) || undefined,
							)
						}
						icon={
							<ParkingCircle className="w-4 h-4 text-blue-600" />
						}
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
						name="exterior"
						value={formData.exterior?.[0] || ''}
						onChange={(value) =>
							handleInputChange('exterior', value ? [value] : [])
						}
						icon={<Trees className="w-4 h-4 text-green-600" />}
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
			</div>{' '}
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
					icon={<Calendar className="w-4 h-4 text-pink-600" />}
				/>

				<Select
					label="État du bien"
					name="condition"
					value={formData.condition}
					onChange={(value) => handleInputChange('condition', value)}
					icon={<Hammer className="w-4 h-4 text-orange-600" />}
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
							name="heatingType"
							value={formData.heatingType}
							onChange={(value) =>
								handleInputChange('heatingType', value)
							}
							icon={<Flame className="w-4 h-4 text-red-600" />}
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
					</div>{' '}
					<div className="flex items-start gap-2">
						<Zap className="w-5 h-5 text-yellow-600 mt-1 flex-shrink-0" />
						<div className="flex-1">
							<EnergyRatingSelector
								label="Classé énergie *"
								value={formData.energyRating}
								onChange={(value) =>
									handleInputChange('energyRating', value)
								}
								name="energyRating"
							/>
						</div>
					</div>
					<div className="flex items-start gap-2">
						<Leaf className="w-5 h-5 text-green-600 mt-1 flex-shrink-0" />
						<div className="flex-1">
							<EnergyRatingSelector
								label="GES *"
								value={formData.gasEmissionClass}
								onChange={(value) =>
									handleInputChange('gasEmissionClass', value)
								}
								name="gasEmissionClass"
							/>
						</div>
					</div>
				</>
			)}
		</div>
	);
};
