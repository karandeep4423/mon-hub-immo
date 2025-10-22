'use client';

import React from 'react';
import { Input } from '@/components/ui/Input';
import { NumberInput, Select, PropertyTypeSelector } from '@/components/ui';
import { PropertyFormData, Property } from '@/lib/api/propertyApi';

interface PropertyFormStep1Props {
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

export const PropertyFormStep1: React.FC<PropertyFormStep1Props> = ({
	formData,
	errors,
	handleInputChange,
}) => {
	return (
		<div className="space-y-6">
			<h3 className="text-lg font-semibold mb-4">
				Informations générales
			</h3>

			<div>
				<label className="block text-sm font-medium text-gray-700 mb-2">
					Titre de l&apos;annonce *
				</label>
				<Input
					type="text"
					value={formData.title}
					onChange={(e) => handleInputChange('title', e.target.value)}
					placeholder="Ex: Bel appartement 3 pièces avec balcon"
					error={errors.title}
				/>
			</div>

			<div>
				<label className="block text-sm font-medium text-gray-700 mb-2">
					Description *
				</label>
				<textarea
					value={formData.description}
					onChange={(e) =>
						handleInputChange('description', e.target.value)
					}
					placeholder="Décrivez votre bien en détail..."
					rows={4}
					className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 ${
						errors.description
							? 'border-red-500'
							: 'border-gray-300'
					}`}
				/>
				{errors.description && (
					<p className="text-red-500 text-sm mt-1">
						{errors.description}
					</p>
				)}
			</div>

			<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
				<NumberInput
					label="Prix de vente"
					value={formData.price}
					onChange={(value) => handleInputChange('price', value || 0)}
					name="price"
					unit="€"
					placeholder="250000"
					min={1000}
					max={50000000}
					required
				/>

				<NumberInput
					label="Surface habitable"
					value={formData.surface}
					onChange={(value) =>
						handleInputChange('surface', value || 0)
					}
					name="surface"
					unit="m²"
					placeholder="100"
					min={1}
					max={10000}
					required
				/>
			</div>

			<PropertyTypeSelector
				value={formData.propertyType}
				onChange={(value) => handleInputChange('propertyType', value)}
				name="propertyType"
			/>

			<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
				<Select
					label="Type de vente"
					value={formData.saleType}
					onChange={(value) => handleInputChange('saleType', value)}
					name="saleType"
					options={
						formData.propertyType === 'Terrain'
							? [
									{
										value: 'constructible',
										label: 'Constructible',
									},
									{
										value: 'terrain_loisirs',
										label: 'Terrain de loisirs',
									},
									{ value: 'jardin', label: 'Jardin' },
									{
										value: 'champs_agricole',
										label: 'Champs agricole',
									},
									{ value: 'autre', label: 'Autre' },
								]
							: [
									{
										value: 'vente_classique',
										label: 'Vente classique',
									},
									{
										value: 'vente_viager',
										label: 'Vente en viager',
									},
									{
										value: 'vente_lot',
										label: 'Vente en lot / Ensemble immobilier',
									},
									{
										value: 'vente_vefa',
										label: 'Vente en VEFA',
									},
									{
										value: 'vente_location',
										label: 'Vente en cours de location (Investissement locatif)',
									},
									{
										value: 'vente_usufruit',
										label: 'Vente en usufruit / Nu-propriété',
									},
									{
										value: 'vente_indivisions',
										label: 'Vente en indivisions',
									},
								]
					}
					placeholder="Choisissez..."
				/>

				<Select
					label="Type de transaction"
					value={formData.transactionType}
					onChange={(value) =>
						handleInputChange('transactionType', value)
					}
					name="transactionType"
					options={[
						{ value: 'Vente', label: 'Vente' },
						{ value: 'Location', label: 'Location' },
					]}
					placeholder="Choisissez..."
					required
				/>
			</div>

			<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
				{formData.propertyType !== 'Terrain' && (
					<Select
						label="Nature du bien"
						value={formData.propertyNature}
						onChange={(value) =>
							handleInputChange('propertyNature', value)
						}
						name="propertyNature"
						options={
							formData.propertyType === 'Maison'
								? [
										{
											value: 'maison_individuelle',
											label: 'Maison individuelle',
										},
										{
											value: 'maison_ville',
											label: 'Maison de ville',
										},
										{
											value: 'maison_plain_pied',
											label: 'Maison de plain-pied',
										},
										{
											value: 'maison_mitoyenne',
											label: 'Maison mitoyenne',
										},
										{ value: 'ferme', label: 'Ferme' },
										{ value: 'villa', label: 'Villa' },
										{ value: 'autre', label: 'Autre' },
									]
								: formData.propertyType === 'Appartement'
									? [
											{
												value: 'appartement_mansarde',
												label: 'Appartement mansardé',
											},
											{
												value: 'duplex',
												label: 'Duplex',
											},
											{ value: 'loft', label: 'Loft' },
											{
												value: 'rdc_sureleve',
												label: 'Rez-de-chaussée surélevé',
											},
											{
												value: 'penthouse',
												label: 'Penthouse',
											},
											{
												value: 'souplex',
												label: 'Souplex',
											},
											{ value: 'autre', label: 'Autre' },
										]
									: formData.propertyType ===
										  'Local commercial'
										? [
												{
													value: 'place_parking',
													label: 'Place de parking',
												},
												{
													value: 'garage',
													label: 'Garage',
												},
												{
													value: 'autres',
													label: 'Autres',
												},
											]
										: formData.propertyType === 'Bureaux'
											? [
													{
														value: 'locaux_commercial',
														label: 'Locaux à usage commercial',
													},
													{
														value: 'locaux_professionnel',
														label: 'Locaux à usage professionnel',
													},
													{
														value: 'locaux_artisanaux',
														label: 'Locaux artisanaux / Industriels',
													},
													{
														value: 'immeuble_commercial',
														label: 'Immeuble ou ensemble commerciaux',
													},
													{
														value: 'locaux_atypique',
														label: 'Locaux atypique',
													},
												]
											: [
													{
														value: 'neuf',
														label: 'Neuf',
													},
													{
														value: 'ancien',
														label: 'Ancien',
													},
													{
														value: 'loft',
														label: 'Loft',
													},
													{
														value: 'duplex',
														label: 'Duplex',
													},
													{
														value: 'triplex',
														label: 'Triplex',
													},
													{
														value: 'penthouse',
														label: 'Penthouse',
													},
												]
						}
						placeholder="Choisissez..."
					/>
				)}
			</div>

			<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
				{formData.propertyType !== 'Terrain' && (
					<Input
						type="text"
						value={formData.yearBuilt?.toString() || ''}
						onChange={(e) =>
							handleInputChange(
								'yearBuilt',
								parseInt(e.target.value) || undefined,
							)
						}
						placeholder="AAAA"
						label="Année de construction"
						name="yearBuilt"
					/>
				)}

				{formData.propertyType === 'Terrain' && (
					<NumberInput
						label="Surface totale du terrain"
						value={formData.landArea}
						onChange={(value) =>
							handleInputChange('landArea', value)
						}
						name="landArea"
						unit="m²"
						placeholder="500"
						min={1}
						max={1000000}
					/>
				)}
			</div>

			{formData.propertyType === 'Appartement' && (
				<div>
					<NumberInput
						label="Charges annuelles de copropriété"
						value={formData.annualCondoFees}
						onChange={(value) =>
							handleInputChange('annualCondoFees', value)
						}
						name="annualCondoFees"
						unit="€"
						placeholder="1200"
						min={0}
						max={100000}
					/>
				</div>
			)}

			{formData.propertyType === 'Terrain' && (
				<div>
					<Input
						type="url"
						value={formData.tariffLink || ''}
						onChange={(e) =>
							handleInputChange('tariffLink', e.target.value)
						}
						placeholder="https://example.com/tarifs"
						label="Lien de redirection vers vos tarifs"
						name="tariffLink"
					/>
				</div>
			)}

			<div className="border-t pt-6 mt-6">
				<h4 className="text-md font-semibold mb-4 text-gray-800">
					💰 Frais d&apos;agence (optionnel)
				</h4>
				<p className="text-sm text-gray-600 mb-4">
					Le prix saisi ci-dessus correspond au{' '}
					<strong>prix net vendeur</strong>. Les informations
					ci-dessous servent au calcul interne et à la transparence
					entre agents.
				</p>

				<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
					<NumberInput
						label="% frais d'agence"
						value={formData.agencyFeesPercentage}
						onChange={(value) => {
							handleInputChange('agencyFeesPercentage', value);
							if (value && formData.price) {
								const feesAmount =
									(formData.price * value) / 100;
								const priceWithFees =
									formData.price + feesAmount;
								handleInputChange(
									'agencyFeesAmount',
									feesAmount,
								);
								handleInputChange(
									'priceIncludingFees',
									priceWithFees,
								);
							}
						}}
						name="agencyFeesPercentage"
						unit="%"
						placeholder="8"
						min={0}
						max={100}
					/>

					<div>
						<label className="block text-sm font-medium text-gray-700 mb-2">
							Frais d&apos;agence (montant)
						</label>
						<div className="relative">
							<input
								type="text"
								value={
									formData.agencyFeesAmount
										? `${Math.round(formData.agencyFeesAmount).toLocaleString()} €`
										: ''
								}
								disabled
								className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-700"
								placeholder="Calculé automatiquement"
							/>
						</div>
						<p className="text-xs text-gray-500 mt-1">
							Calculé automatiquement
						</p>
					</div>
				</div>

				<div className="mt-4">
					<label className="block text-sm font-medium text-gray-700 mb-2">
						Prix FAI (Frais d&apos;Acquéreur Inclus)
					</label>
					<div className="relative">
						<input
							type="text"
							value={
								formData.priceIncludingFees
									? `${Math.round(formData.priceIncludingFees).toLocaleString()} €`
									: ''
							}
							disabled
							className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-700"
							placeholder="Prix net vendeur + Frais d'agence"
						/>
					</div>
					<p className="text-xs text-gray-500 mt-1">
						Prix net vendeur + Frais d&apos;agence
					</p>
				</div>
			</div>
		</div>
	);
};
