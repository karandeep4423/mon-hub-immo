'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { PropertyFormData } from '@/lib/propertyService';

interface PropertyFormProps {
	onSubmit: (data: PropertyFormData) => Promise<void>;
	initialData?: Partial<PropertyFormData>;
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
		yearBuilt: undefined,
		heatingType: undefined,
		orientation: undefined,
		mainImage: '',
		images: [],
		isExclusive: false,
		status: 'draft',
		...initialData,
	});

	const [errors, setErrors] = useState<Record<string, string>>({});
	const [currentStep, setCurrentStep] = useState(1);
	const totalSteps = 4;

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
				if (!formData.mainImage) {
					newErrors.mainImage = "L'image principale est requise";
				}
				// Validate additional images if they exist
				if (formData.images && formData.images.length > 0) {
					const invalidImages = formData.images.filter((img) => {
						try {
							new URL(img);
							return !(
								img.startsWith('http://') ||
								img.startsWith('https://')
							);
						} catch {
							return true;
						}
					});
					if (invalidImages.length > 0) {
						newErrors.images =
							"Certaines URLs d'images sont invalides";
					}
				}
				break;
		}

		setErrors(newErrors);
		return Object.keys(newErrors).length === 0;
	};

	const handleInputChange = (
		field: keyof PropertyFormData,
		value: string | number | boolean | string[] | undefined,
	) => {
		setFormData((prev) => ({ ...prev, [field]: value }));
		// Clear error when user starts typing
		if (errors[field]) {
			setErrors((prev) => ({ ...prev, [field]: '' }));
		}
	};

	const handleNext = () => {
		if (validateStep(currentStep)) {
			setCurrentStep((prev) => Math.min(prev + 1, totalSteps));
		}
	};

	const handlePrevious = () => {
		setCurrentStep((prev) => Math.max(prev - 1, 1));
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		// Only allow submission on the final step
		if (currentStep !== totalSteps) {
			console.warn('Form submitted before reaching final step');
			return;
		}

		// Validate the final step
		if (!validateStep(currentStep)) {
			console.warn('Validation failed on final step');
			return;
		}

		try {
			console.log('Submitting form data:', formData);
			await onSubmit(formData);
		} catch (error) {
			console.error('Error submitting form:', error);
		}
	};

	const addImage = () => {
		const newImage = prompt("URL de l'image:");
		if (newImage) {
			setFormData((prev) => ({
				...prev,
				images: [...(prev.images || []), newImage],
			}));
		}
	};

	const removeImage = (index: number) => {
		setFormData((prev) => ({
			...prev,
			images: (prev.images || []).filter((_, i) => i !== index),
		}));
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
					className={errors.title ? 'border-red-500' : ''}
				/>
				{errors.title && (
					<p className="text-red-500 text-sm mt-1">{errors.title}</p>
				)}
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
					className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
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
				<div>
					<label className="block text-sm font-medium text-gray-700 mb-2">
						Prix * (€)
					</label>
					<Input
						type="number"
						value={formData.price || ''}
						onChange={(e) =>
							handleInputChange(
								'price',
								parseInt(e.target.value) || 0,
							)
						}
						placeholder="250000"
						className={errors.price ? 'border-red-500' : ''}
					/>
					{errors.price && (
						<p className="text-red-500 text-sm mt-1">
							{errors.price}
						</p>
					)}
				</div>

				<div>
					<label className="block text-sm font-medium text-gray-700 mb-2">
						Surface * (m²)
					</label>
					<Input
						type="number"
						value={formData.surface || ''}
						onChange={(e) =>
							handleInputChange(
								'surface',
								parseInt(e.target.value) || 0,
							)
						}
						placeholder="100"
						className={errors.surface ? 'border-red-500' : ''}
					/>
					{errors.surface && (
						<p className="text-red-500 text-sm mt-1">
							{errors.surface}
						</p>
					)}
				</div>
			</div>

			<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
				<div>
					<label className="block text-sm font-medium text-gray-700 mb-2">
						Type de bien *
					</label>
					<select
						value={formData.propertyType}
						onChange={(e) =>
							handleInputChange(
								'propertyType',
								e.target
									.value as PropertyFormData['propertyType'],
							)
						}
						className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
					>
						<option value="Appartement">Appartement</option>
						<option value="Maison">Maison</option>
						<option value="Terrain">Terrain</option>
						<option value="Local commercial">
							Local commercial
						</option>
						<option value="Bureaux">Bureaux</option>
					</select>
				</div>

				<div>
					<label className="block text-sm font-medium text-gray-700 mb-2">
						Type de transaction *
					</label>
					<select
						value={formData.transactionType}
						onChange={(e) =>
							handleInputChange(
								'transactionType',
								e.target
									.value as PropertyFormData['transactionType'],
							)
						}
						className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
					>
						<option value="Vente">Vente</option>
						<option value="Location">Location</option>
					</select>
				</div>
			</div>
		</div>
	);

	const renderStep2 = () => (
		<div className="space-y-6">
			<h3 className="text-lg font-semibold mb-4">Localisation</h3>

			<div>
				<label className="block text-sm font-medium text-gray-700 mb-2">
					Adresse *
				</label>
				<Input
					type="text"
					value={formData.address}
					onChange={(e) =>
						handleInputChange('address', e.target.value)
					}
					placeholder="123 Rue de la Paix"
					className={errors.address ? 'border-red-500' : ''}
				/>
				{errors.address && (
					<p className="text-red-500 text-sm mt-1">
						{errors.address}
					</p>
				)}
			</div>

			<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
				<div>
					<label className="block text-sm font-medium text-gray-700 mb-2">
						Ville *
					</label>
					<Input
						type="text"
						value={formData.city}
						onChange={(e) =>
							handleInputChange('city', e.target.value)
						}
						placeholder="Paris"
						className={errors.city ? 'border-red-500' : ''}
					/>
					{errors.city && (
						<p className="text-red-500 text-sm mt-1">
							{errors.city}
						</p>
					)}
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
						className={errors.postalCode ? 'border-red-500' : ''}
					/>
					{errors.postalCode && (
						<p className="text-red-500 text-sm mt-1">
							{errors.postalCode}
						</p>
					)}
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
						className={errors.sector ? 'border-red-500' : ''}
					/>
					{errors.sector && (
						<p className="text-red-500 text-sm mt-1">
							{errors.sector}
						</p>
					)}
				</div>
			</div>
		</div>
	);

	const renderStep3 = () => (
		<div className="space-y-6">
			<h3 className="text-lg font-semibold mb-4">Détails du bien</h3>

			<div className="grid grid-cols-2 md:grid-cols-4 gap-4">
				<div>
					<label className="block text-sm font-medium text-gray-700 mb-2">
						Pièces
					</label>
					<Input
						type="number"
						value={formData.rooms || ''}
						onChange={(e) =>
							handleInputChange(
								'rooms',
								parseInt(e.target.value) || undefined,
							)
						}
						placeholder="3"
					/>
				</div>

				<div>
					<label className="block text-sm font-medium text-gray-700 mb-2">
						Chambres
					</label>
					<Input
						type="number"
						value={formData.bedrooms || ''}
						onChange={(e) =>
							handleInputChange(
								'bedrooms',
								parseInt(e.target.value) || undefined,
							)
						}
						placeholder="2"
					/>
				</div>

				<div>
					<label className="block text-sm font-medium text-gray-700 mb-2">
						Salles de bain
					</label>
					<Input
						type="number"
						value={formData.bathrooms || ''}
						onChange={(e) =>
							handleInputChange(
								'bathrooms',
								parseInt(e.target.value) || undefined,
							)
						}
						placeholder="1"
					/>
				</div>

				<div>
					<label className="block text-sm font-medium text-gray-700 mb-2">
						Étage
					</label>
					<Input
						type="number"
						value={formData.floor || ''}
						onChange={(e) =>
							handleInputChange(
								'floor',
								parseInt(e.target.value) || undefined,
							)
						}
						placeholder="2"
					/>
				</div>
			</div>

			<div className="grid grid-cols-2 md:grid-cols-3 gap-4">
				<div>
					<label className="block text-sm font-medium text-gray-700 mb-2">
						Classe énergétique
					</label>
					<select
						value={formData.energyRating || ''}
						onChange={(e) =>
							handleInputChange(
								'energyRating',
								e.target.value || undefined,
							)
						}
						className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
					>
						<option value="">Non renseigné</option>
						<option value="A">A</option>
						<option value="B">B</option>
						<option value="C">C</option>
						<option value="D">D</option>
						<option value="E">E</option>
						<option value="F">F</option>
						<option value="G">G</option>
					</select>
				</div>

				<div>
					<label className="block text-sm font-medium text-gray-700 mb-2">
						Année de construction
					</label>
					<Input
						type="number"
						value={formData.yearBuilt || ''}
						onChange={(e) =>
							handleInputChange(
								'yearBuilt',
								parseInt(e.target.value) || undefined,
							)
						}
						placeholder="2000"
					/>
				</div>

				<div>
					<label className="block text-sm font-medium text-gray-700 mb-2">
						Orientation
					</label>
					<select
						value={formData.orientation || ''}
						onChange={(e) =>
							handleInputChange(
								'orientation',
								e.target.value || undefined,
							)
						}
						className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
					>
						<option value="">Non renseigné</option>
						<option value="Nord">Nord</option>
						<option value="Sud">Sud</option>
						<option value="Est">Est</option>
						<option value="Ouest">Ouest</option>
						<option value="Nord-Est">Nord-Est</option>
						<option value="Nord-Ouest">Nord-Ouest</option>
						<option value="Sud-Est">Sud-Est</option>
						<option value="Sud-Ouest">Sud-Ouest</option>
					</select>
				</div>
			</div>

			<div>
				<label className="block text-sm font-medium text-gray-700 mb-2">
					Type de chauffage
				</label>
				<Input
					type="text"
					value={formData.heatingType || ''}
					onChange={(e) =>
						handleInputChange('heatingType', e.target.value)
					}
					placeholder="Gaz, électrique, etc."
				/>
			</div>

			<div>
				<h4 className="font-medium text-gray-700 mb-3">Équipements</h4>
				<div className="grid grid-cols-2 md:grid-cols-3 gap-3">
					{[
						{ key: 'hasParking', label: 'Parking' },
						{ key: 'hasGarden', label: 'Jardin' },
						{ key: 'hasElevator', label: 'Ascenseur' },
						{ key: 'hasBalcony', label: 'Balcon' },
						{ key: 'hasTerrace', label: 'Terrasse' },
						{ key: 'hasGarage', label: 'Garage' },
					].map(({ key, label }) => (
						<label
							key={key}
							className="flex items-center space-x-2"
						>
							<input
								type="checkbox"
								checked={
									formData[
										key as keyof PropertyFormData
									] as boolean
								}
								onChange={(e) =>
									handleInputChange(
										key as keyof PropertyFormData,
										e.target.checked,
									)
								}
								className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
							/>
							<span className="text-sm text-gray-700">
								{label}
							</span>
						</label>
					))}
				</div>
			</div>
		</div>
	);

	const renderStep4 = () => (
		<div className="space-y-6">
			<h3 className="text-lg font-semibold mb-4">
				Images et finalisation
			</h3>

			<div>
				<label className="block text-sm font-medium text-gray-700 mb-2">
					Image principale * (URL)
				</label>
				<Input
					type="url"
					value={formData.mainImage}
					onChange={(e) =>
						handleInputChange('mainImage', e.target.value)
					}
					placeholder="https://example.com/image.jpg"
					className={errors.mainImage ? 'border-red-500' : ''}
				/>
				{errors.mainImage && (
					<p className="text-red-500 text-sm mt-1">
						{errors.mainImage}
					</p>
				)}
			</div>

			<div>
				<label className="block text-sm font-medium text-gray-700 mb-2">
					Images supplémentaires
				</label>
				<div className="space-y-2">
					{(formData.images || []).map((image, index) => (
						<div
							key={index}
							className="flex items-center space-x-2"
						>
							<Input
								type="url"
								value={image}
								onChange={(e) => {
									const newImages = [
										...(formData.images || []),
									];
									newImages[index] = e.target.value;
									handleInputChange('images', newImages);
								}}
								placeholder="https://example.com/image.jpg"
								className={
									errors.images ? 'border-red-500' : ''
								}
							/>
							<Button
								type="button"
								variant="outline"
								size="sm"
								onClick={() => removeImage(index)}
							>
								Supprimer
							</Button>
						</div>
					))}
					<Button type="button" variant="outline" onClick={addImage}>
						Ajouter une image
					</Button>
					{errors.images && (
						<p className="text-red-500 text-sm mt-1">
							{errors.images}
						</p>
					)}
				</div>
			</div>

			<div className="space-y-3">
				<label className="flex items-center space-x-2">
					<input
						type="checkbox"
						checked={formData.isExclusive}
						onChange={(e) =>
							handleInputChange('isExclusive', e.target.checked)
						}
						className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
					/>
					<span className="text-sm text-gray-700">
						Annonce exclusive
					</span>
				</label>
			</div>

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
					className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
				>
					<option value="draft">Brouillon</option>
					<option value="active">Publier immédiatement</option>
					<option value="sold">Vendu</option>
					<option value="rented">Loué</option>
					<option value="archived">Archivé</option>
				</select>
			</div>
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
										? 'bg-blue-600 text-white'
										: 'bg-gray-200 text-gray-600'
								}`}
							>
								{i + 1}
							</div>
							{i < totalSteps - 1 && (
								<div
									className={`w-12 h-1 ${
										i + 1 < currentStep
											? 'bg-blue-600'
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
								disabled={isLoading}
								className="bg-green-600 hover:bg-green-700"
							>
								{isLoading
									? 'Enregistrement...'
									: isEditing
										? 'Mettre à jour'
										: "Créer l'annonce"}
							</Button>
						)}
					</div>
				</div>
			</form>
		</div>
	);
};

export default PropertyForm;
