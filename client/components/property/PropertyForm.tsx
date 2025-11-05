'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { PropertyFormData, Property } from '@/lib/api/propertyApi';
import { usePropertyForm } from '@/hooks/usePropertyForm';
import { PropertyFormStep1 } from './PropertyFormStep1';
import { PropertyFormStep2 } from './PropertyFormStep2';
import { PropertyFormStep3 } from './PropertyFormStep3';
import { PropertyFormStep4 } from './PropertyFormStep4';
import { PropertyFormStep5 } from './PropertyFormStep5';
import { logger } from '@/lib/utils/logger';
import { Components, UI_TRANSITION_MS } from '@/lib/constants';
import { usePropertyMutations } from '@/hooks/useProperties';
import { useAuth } from '@/hooks/useAuth';
import { PlusCircle, Edit, ArrowLeft } from 'lucide-react';

interface ExistingImage {
	url: string;
	key: string;
}

interface PropertyFormProps {
	onSubmit: (data: PropertyFormData) => Promise<void>;
	initialData?: Partial<PropertyFormData> | Property;
	isEditing?: boolean;
	isLoading?: boolean;
	onCancel?: () => void;
}

export const PropertyForm: React.FC<PropertyFormProps> = ({
	onSubmit,
	initialData = {},
	isEditing = false,
	isLoading = false,
	onCancel,
}) => {
	const { user } = useAuth();
	const { createProperty, updateProperty } = usePropertyMutations(user?._id);

	const {
		formData,
		errors,
		setErrors,
		currentStep,
		setCurrentStep,
		mainImageFiles,
		setMainImageFiles,
		galleryImageFiles,
		setGalleryImageFiles,
		existingMainImage,
		setExistingMainImage,
		existingGalleryImages,
		setExistingGalleryImages,
		handleInputChange,
		validateStep,
	} = usePropertyForm({ initialData, isEditing });

	const [isUploading, setIsUploading] = useState(false);
	const [justNavigated, setJustNavigated] = useState(false);
	const totalSteps = 5;

	// Populate existing images when editing
	useEffect(() => {
		if (isEditing && initialData) {
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
	}, [
		isEditing,
		initialData,
		setExistingMainImage,
		setExistingGalleryImages,
	]);

	const handleExistingMainImageRemove = () => {
		setExistingMainImage(null);
	};

	const handleExistingGalleryImageRemove = (imageKey: string) => {
		setExistingGalleryImages((prev) =>
			prev.filter((img) => img.key !== imageKey),
		);
	};

	const handleNext = () => {
		logger.debug('[PropertyForm] handleNext called:', {
			currentStep,
			totalSteps,
			isValidStep: validateStep(currentStep),
		});

		if (validateStep(currentStep)) {
			const nextStep = Math.min(currentStep + 1, totalSteps);
			logger.debug('[PropertyForm] Moving to step:', nextStep);
			setJustNavigated(true);
			setCurrentStep(nextStep);
			setTimeout(() => setJustNavigated(false), UI_TRANSITION_MS);
		} else {
			logger.warn(
				'[PropertyForm] Validation failed, staying on step:',
				currentStep,
			);
		}
	};

	const handlePrevious = () => {
		setCurrentStep((prev) => Math.max(prev - 1, 1));
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		logger.debug('[PropertyForm] Form submission attempted:', {
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

		if (justNavigated) {
			logger.warn(
				'[PropertyForm] Preventing submission - just navigated to this step',
			);
			return;
		}

		if (currentStep !== totalSteps) {
			logger.warn(
				'[PropertyForm] Form submitted before reaching final step',
			);
			return;
		}

		if (!validateStep(currentStep)) {
			logger.warn('[PropertyForm] Validation failed on final step');
			return;
		}

		logger.info('[PropertyForm] Proceeding with form submission...');
		setIsUploading(true);

		try {
			// eslint-disable-next-line @typescript-eslint/no-unused-vars
			const { mainImage, galleryImages, images, ...cleanFormData } =
				formData;

			let property: Property;

			if (isEditing && initialData && '_id' in initialData) {
				const propertyId = (initialData as Property)._id;
				const result = await updateProperty(
					propertyId,
					cleanFormData,
					mainImageFiles[0]?.file,
					galleryImageFiles.map((img) => img.file),
					existingMainImage,
					existingGalleryImages,
				);

				if (!result.success || !result.data) {
					// Extract field errors from API error
					const fieldErrors = result.error?.fieldErrors || {};
					setErrors({
						submit: result.error?.message || 'Update failed',
						...fieldErrors,
					});
					throw new Error(result.error?.message || 'Update failed');
				}

				property = result.data;
				logger.info(
					'[PropertyForm] Property updated successfully:',
					property,
				);
			} else {
				const result = await createProperty(
					cleanFormData,
					mainImageFiles[0]?.file,
					galleryImageFiles.map((img) => img.file),
				);

				if (!result.success || !result.data) {
					// Extract field errors from API error
					const fieldErrors = result.error?.fieldErrors || {};
					setErrors({
						submit: result.error?.message || 'Create failed',
						...fieldErrors,
					});
					throw new Error(result.error?.message || 'Create failed');
				}

				property = result.data;
				logger.info(
					'[PropertyForm] Property created successfully:',
					property,
				);
			}
			await onSubmit(property as unknown as PropertyFormData);
		} catch (error) {
			logger.error('[PropertyForm] Error submitting form:', error);
			// Errors already set in the if blocks above
		} finally {
			setIsUploading(false);
		}
	};

	return (
		<div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
			<div className="mb-8">
				<div className="flex items-center justify-between mb-4">
					<h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
						{isEditing ? (
							<>
								<Edit className="w-6 h-6 text-blue-600" />
								{Components.UI.BUTTON_TEXT.editProperty}
							</>
						) : (
							<>
								<PlusCircle className="w-6 h-6 text-green-600" />
								Créer une nouvelle annonce
							</>
						)}
					</h2>
					{onCancel && (
						<button
							onClick={onCancel}
							className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors duration-200 shadow-sm hover:shadow"
						>
							<ArrowLeft className="w-4 h-4" />
							Retour à la liste
						</button>
					)}
				</div>

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
				{currentStep === 1 && (
					<PropertyFormStep1
						formData={formData}
						errors={errors}
						handleInputChange={handleInputChange}
						userType={user?.userType}
					/>
				)}
				{currentStep === 2 && (
					<PropertyFormStep2
						formData={formData}
						errors={errors}
						handleInputChange={handleInputChange}
					/>
				)}
				{currentStep === 3 && (
					<PropertyFormStep3
						formData={formData}
						handleInputChange={handleInputChange}
					/>
				)}
				{currentStep === 4 && (
					<PropertyFormStep4
						formData={formData}
						errors={errors}
						handleInputChange={handleInputChange}
						mainImageFiles={mainImageFiles}
						setMainImageFiles={setMainImageFiles}
						galleryImageFiles={galleryImageFiles}
						setGalleryImageFiles={setGalleryImageFiles}
						existingMainImage={existingMainImage}
						existingGalleryImages={existingGalleryImages}
						handleExistingMainImageRemove={
							handleExistingMainImageRemove
						}
						handleExistingGalleryImageRemove={
							handleExistingGalleryImageRemove
						}
						isUploading={isUploading}
					/>
				)}
				{currentStep === 5 && (
					<PropertyFormStep5
						formData={formData}
						handleInputChange={handleInputChange}
					/>
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
								loading={isLoading || isUploading}
								className="bg-brand-600 hover:bg-brand-700"
							>
								{isEditing
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
