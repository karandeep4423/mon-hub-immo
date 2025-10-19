'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import {
	EnergyRatingSelector,
	PropertyTypeSelector,
	NumberInput,
	Select,
	CityAutocomplete,
	AddressAutocomplete,
} from '@/components/ui';
import { PropertyImageManager } from './PropertyImageManager';
import { ClientInfoForm } from './ClientInfoForm';
import BadgeSelector from './BadgeSelector';
import {
	PropertyFormData,
	PropertyService,
	Property,
} from '@/lib/api/propertyApi';

interface ImageFile {
	file: File;
	preview: string;
	id: string;
}

interface ExistingImage {
	url: string;
	key: string;
}

interface PropertyFormProps {
	onSubmit: (data: PropertyFormData) => Promise<void>;
	initialData?: Partial<PropertyFormData> | Property;
	isEditing?: boolean;
	isLoading?: boolean;
}

const PropertyForm: React.FC<PropertyFormProps> = ({
	onSubmit,
	initialData = {},
	isEditing = false,
	isLoading = false,
}) => {
	const [formData, setFormData] = useState<PropertyFormData>({
		title: '',
		description: '',
		price: 0,
		surface: 0,
		propertyType: 'Appartement',
		transactionType: 'Vente',
		address: '',
		city: '',
		postalCode: '',
		sector: '',
		rooms: undefined,
		bedrooms: undefined,
		bathrooms: undefined,
		floor: undefined,
		totalFloors: undefined,
		hasParking: false,
		hasGarden: false,
		hasElevator: false,
		hasBalcony: false,
		hasGarage: false,
		energyRating: undefined,
		gasEmissionClass: undefined,
		condition: undefined,
		propertyNature: undefined,
		saleType: undefined,
		annualCondoFees: undefined,
		tariffLink: undefined,
		agencyFeesPercentage: undefined,
		agencyFeesAmount: undefined,
		priceIncludingFees: undefined,
		landArea: undefined,
		levels: undefined,
		parkingSpaces: undefined,
		exterior: undefined,
		yearBuilt: undefined,
		heatingType: undefined,
		orientation: undefined,
		mainImage: '',
		images: [],
		badges: [],
		status: 'draft',
		clientInfo: undefined,
		...initialData,
	});

	const [errors, setErrors] = useState<Record<string, string>>({});
	const [currentStep, setCurrentStep] = useState(1);
	const [mainImageFiles, setMainImageFiles] = useState<ImageFile[]>([]);
	const [galleryImageFiles, setGalleryImageFiles] = useState<ImageFile[]>([]);
	const [existingMainImage, setExistingMainImage] =
		useState<ExistingImage | null>(null);
	const [existingGalleryImages, setExistingGalleryImages] = useState<
		ExistingImage[]
	>([]);
	const [isUploading, setIsUploading] = useState(false);
	const [justNavigated, setJustNavigated] = useState(false);
	const totalSteps = 5;

	// Populate existing images when editing
	useEffect(() => {
		if (isEditing && initialData) {
			// Set existing main image
			if (
				initialData.mainImage &&
				typeof initialData.mainImage === 'object' &&
				'url' in initialData.mainImage
			) {
				setExistingMainImage({
					url: initialData.mainImage.url,
					key: initialData.mainImage.key,
				});
			}

			// Set existing gallery images
			if (
				initialData.galleryImages &&
				Array.isArray(initialData.galleryImages)
			) {
				const galleryImages = initialData.galleryImages.filter(
					(img): img is ExistingImage =>
						typeof img === 'object' &&
						img !== null &&
						'url' in img &&
						'key' in img,
				);
				setExistingGalleryImages(galleryImages);
			}
		}
	}, [isEditing, initialData]);

	// Handlers for removing existing images
	const handleExistingMainImageRemove = () => {
		setExistingMainImage(null);
	};

	const handleExistingGalleryImageRemove = (imageKey: string) => {
		setExistingGalleryImages((prev) =>
			prev.filter((img) => img.key !== imageKey),
		);
	};

	const validateStep = (step: number): boolean => {
		const newErrors: Record<string, string> = {};

		switch (step) {
			case 1:
				// Basic info validation
				if (!formData.title || formData.title.length < 10) {
					newErrors.title =
						'Le titre doit contenir au moins 10 caractères';
				}
				if (!formData.description || formData.description.length < 50) {
					newErrors.description =
						'La description doit contenir au moins 50 caractères';
				}
				if (!formData.price || formData.price < 1000) {
					newErrors.price = 'Le prix doit être supérieur à 1000€';
				}
				if (!formData.surface || formData.surface < 1) {
					newErrors.surface =
						'La surface doit être supérieure à 1 m²';
				}
				break;
			case 2:
				// Location validation
				if (!formData.address || formData.address.length < 5) {
					newErrors.address =
						"L'adresse doit contenir au moins 5 caractères";
				}
				if (!formData.city || formData.city.length < 2) {
					newErrors.city =
						'La ville doit contenir au moins 2 caractères';
				}
				if (
					!formData.postalCode ||
					!/^[0-9]{5}$/.test(formData.postalCode)
				) {
					newErrors.postalCode =
						'Le code postal doit contenir 5 chiffres';
				}
				if (!formData.sector || formData.sector.length < 2) {
					newErrors.sector =
						'Le secteur doit contenir au moins 2 caractères';
				}
				break;
			case 3:
				// Property details validation - no required fields, allow progression
				break;
			case 4:
				// Images validation
				if (mainImageFiles.length === 0 && !existingMainImage) {
					newErrors.mainImage = "L'image principale est requise";
				}
				break;
		}

		setErrors(newErrors);
		return Object.keys(newErrors).length === 0;
	};

	const handleInputChange = (
		field: keyof PropertyFormData,
		value:
			| string
			| number
			| boolean
			| string[]
			| Property['clientInfo']
			| undefined,
	) => {
		setFormData((prev) => ({ ...prev, [field]: value }));
		// Clear error when user starts typing
		if (errors[field]) {
			setErrors((prev) => ({ ...prev, [field]: '' }));
		}
	};

	const handleNext = () => {
		console.log('🔄 handleNext called:', {
			currentStep,
			totalSteps,
			isValidStep: validateStep(currentStep),
		});

		if (validateStep(currentStep)) {
			const nextStep = Math.min(currentStep + 1, totalSteps);
			console.log('✅ Moving to step:', nextStep);
			setJustNavigated(true);
			setCurrentStep(nextStep);
			// Clear the navigation flag after a short delay
			setTimeout(() => setJustNavigated(false), 100);
		} else {
			console.log('❌ Validation failed, staying on step:', currentStep);
		}
	};

	const handlePrevious = () => {
		setCurrentStep((prev) => Math.max(prev - 1, 1));
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		console.log('🔍 Form submission attempted:', {
			currentStep,
			totalSteps,
			isEditing,
			hasInitialData: !!initialData,
			mainImageFiles: mainImageFiles.length,
			existingMainImage: !!existingMainImage,
			galleryImageFiles: galleryImageFiles.length,
			existingGalleryImages: existingGalleryImages.length,
			justNavigated,
		});

		// Prevent submission if we just navigated to this step
		if (justNavigated) {
			console.warn(
				'🚫 Preventing submission - just navigated to this step',
			);
			return;
		}

		// Only allow submission on the final step
		if (currentStep !== totalSteps) {
			console.warn('❌ Form submitted before reaching final step');
			return;
		}

		// Validate the final step
		if (!validateStep(currentStep)) {
			console.warn('❌ Validation failed on final step');
			return;
		}

		console.log('✅ Proceeding with form submission...');
		setIsUploading(true);

		try {
			// Prepare form data without image fields
			// eslint-disable-next-line @typescript-eslint/no-unused-vars
			const { mainImage, galleryImages, images, ...cleanFormData } =
				formData;

			let property: Property;

			if (isEditing && initialData && '_id' in initialData) {
				// Update existing property with images
				const propertyId = (initialData as Property)._id;
				property = await PropertyService.updateProperty(
					propertyId,
					cleanFormData,
					mainImageFiles[0]?.file,
					galleryImageFiles.map((img) => img.file),
					existingMainImage,
					existingGalleryImages,
				);
				console.log('Property updated successfully:', property);
			} else {
				// Create new property with images
				property = await PropertyService.createProperty(
					cleanFormData,
					mainImageFiles[0]?.file,
					galleryImageFiles.map((img) => img.file),
				);
				console.log('Property created successfully:', property);
			}

			// Call the onSubmit callback with the property data
			await onSubmit(property as unknown as PropertyFormData);
		} catch (error) {
			console.error('Error submitting form:', error);
			setErrors({
				submit:
					error instanceof Error
						? error.message
						: "Erreur lors de la création de l'annonce",
			});
		} finally {
			setIsUploading(false);
		}
	};

	const renderStep1 = () => (
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

			{/* Agency Fees Section */}
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
							// Auto-calculate agency fees amount and price including fees
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

	const renderStep2 = () => (
		<div className="space-y-6">
			<h3 className="text-lg font-semibold mb-4">Localisation</h3>

			<AddressAutocomplete
				label="Adresse"
				value={formData.address || ''}
				onAddressSelect={(address, city, postalCode, coordinates) => {
					handleInputChange('address', address);
					handleInputChange('city', city);
					handleInputChange('postalCode', postalCode);
					if (coordinates) {
						console.log('Address coordinates:', coordinates);
					}
				}}
				placeholder="Rechercher une adresse..."
				error={errors.address}
				required
			/>

			<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
				<div>
					<CityAutocomplete
						value={formData.city}
						onCitySelect={(city, postalCode) => {
							handleInputChange('city', city);
							handleInputChange('postalCode', postalCode);
						}}
						placeholder="Ex: Paris, Lyon, Marseille..."
						error={errors.city}
						label="Ville"
						required
					/>
				</div>

				<div>
					<label className="block text-sm font-medium text-gray-700 mb-2">
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
					<label className="block text-sm font-medium text-gray-700 mb-2">
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

	const renderStep3 = () => (
		<div className="space-y-6">
			<h3 className="text-lg font-semibold mb-4">Détails du bien</h3>

			{/* Hide room details for Terrain and Parking */}
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
				{/* Hide Exposition for Terrain and Parking */}
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

				{/* Show Places de parking only for non-Terrain */}
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

				{/* Hide Extérieur for Parking */}
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
						let value = e.target.value.replace(/\D/g, ''); // Remove non-digits

						// Auto-format as user types
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
					maxLength={7} // MM/AAAA format
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

			{/* Hide heating and energy for Terrain and Parking */}
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

	const renderStep4 = () => (
		<div className="space-y-6">
			<h3 className="text-lg font-semibold mb-4">
				Images et finalisation
			</h3>

			<PropertyImageManager
				onMainImageChange={setMainImageFiles}
				onGalleryImagesChange={setGalleryImageFiles}
				existingMainImage={existingMainImage}
				existingGalleryImages={existingGalleryImages}
				onExistingMainImageRemove={handleExistingMainImageRemove}
				onExistingGalleryImageRemove={handleExistingGalleryImageRemove}
				disabled={isUploading}
			/>

			{errors.mainImage && (
				<p className="text-red-500 text-sm">{errors.mainImage}</p>
			)}

			<BadgeSelector
				selectedBadges={formData.badges || []}
				onChange={(badges) => handleInputChange('badges', badges)}
				disabled={isUploading}
			/>

			<div>
				<label className="block text-sm font-medium text-gray-700 mb-2">
					Statut de publication
				</label>
				<select
					value={formData.status}
					onChange={(e) =>
						handleInputChange(
							'status',
							e.target.value as PropertyFormData['status'],
						)
					}
					className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
					disabled={isUploading}
				>
					<option value="draft">Brouillon</option>
					<option value="active">Publier immédiatement</option>
					<option value="sold">Vendu</option>
					<option value="rented">Loué</option>
					<option value="archived">Archivé</option>
				</select>
			</div>

			{errors.submit && (
				<div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
					{errors.submit}
				</div>
			)}
		</div>
	);

	return (
		<div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
			<div className="mb-8">
				<h2 className="text-2xl font-bold text-gray-900 mb-4">
					{isEditing
						? 'Modifier le bien'
						: 'Créer une nouvelle annonce'}
				</h2>

				{/* Progress bar */}
				<div className="flex items-center space-x-4 mb-6">
					{Array.from({ length: totalSteps }, (_, i) => (
						<div key={i} className="flex items-center">
							<div
								className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
									i + 1 <= currentStep
										? 'bg-brand-600 text-white'
										: 'bg-gray-200 text-gray-600'
								}`}
							>
								{i + 1}
							</div>
							{i < totalSteps - 1 && (
								<div
									className={`w-12 h-1 ${
										i + 1 < currentStep
											? 'bg-brand-600'
											: 'bg-gray-200'
									}`}
								/>
							)}
						</div>
					))}
				</div>
			</div>

			{/* Error Display */}
			{Object.keys(errors).length > 0 && (
				<div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
					<h3 className="text-sm font-medium text-red-800 mb-2">
						Veuillez corriger les erreurs suivantes :
					</h3>
					<ul className="text-sm text-red-700 space-y-1">
						{Object.entries(errors).map(([field, error]) => (
							<li key={field}>• {error}</li>
						))}
					</ul>
				</div>
			)}

			<form onSubmit={handleSubmit}>
				{currentStep === 1 && renderStep1()}
				{currentStep === 2 && renderStep2()}
				{currentStep === 3 && renderStep3()}
				{currentStep === 4 && renderStep4()}
				{currentStep === 5 && (
					<div className="space-y-6">
						<h3 className="text-lg font-semibold mb-4">
							Informations client
						</h3>
						<p className="text-sm text-gray-600 mb-4">
							Ces informations seront visibles uniquement pour les
							agents avec lesquels vous collaborez.
						</p>
						<ClientInfoForm
							clientInfo={formData.clientInfo || {}}
							onChange={(clientInfo) =>
								handleInputChange('clientInfo', clientInfo)
							}
						/>
					</div>
				)}

				<div className="flex justify-between pt-6 mt-8 border-t">
					<Button
						type="button"
						variant="outline"
						onClick={handlePrevious}
						disabled={currentStep === 1 || isLoading}
					>
						Précédent
					</Button>

					<div className="space-x-3">
						{currentStep < totalSteps ? (
							<Button
								type="button"
								onClick={handleNext}
								disabled={isLoading}
							>
								Suivant
							</Button>
						) : (
							<Button
								type="submit"
								disabled={isLoading || isUploading}
								className="bg-brand-600 hover:bg-brand-700"
							>
								{isUploading ? (
									<>
										<div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
										Upload des images...
									</>
								) : isLoading ? (
									'Enregistrement...'
								) : isEditing ? (
									'Mettre à jour'
								) : (
									"Créer l'annonce"
								)}
							</Button>
						)}
					</div>
				</div>
			</form>
		</div>
	);
};

export default PropertyForm;
