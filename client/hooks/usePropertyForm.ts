import { useState, useCallback } from 'react';
import { PropertyFormData, Property } from '@/lib/api/propertyApi';

interface ImageFile {
	file: File;
	preview: string;
	id: string;
}

interface ExistingImage {
	url: string;
	key: string;
}

interface UsePropertyFormProps {
	initialData?: Partial<PropertyFormData> | Property;
	isEditing?: boolean;
}

interface ValidationErrors {
	[key: string]: string;
}

export const usePropertyForm = ({
	initialData = {},
	isEditing = false,
}: UsePropertyFormProps = {}) => {
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

	const [errors, setErrors] = useState<ValidationErrors>({});
	const [currentStep, setCurrentStep] = useState(1);
	const [mainImageFiles, setMainImageFiles] = useState<ImageFile[]>([]);
	const [galleryImageFiles, setGalleryImageFiles] = useState<ImageFile[]>([]);
	const [existingMainImage, setExistingMainImage] =
		useState<ExistingImage | null>(null);
	const [existingGalleryImages, setExistingGalleryImages] = useState<
		ExistingImage[]
	>([]);

	const handleInputChange = useCallback(
		(
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
			if (errors[field]) {
				setErrors((prev) => ({ ...prev, [field]: '' }));
			}
		},
		[errors],
	);

	const validateStep = useCallback(
		(step: number): boolean => {
			const newErrors: ValidationErrors = {};

			switch (step) {
				case 1:
					if (!formData.title || formData.title.length < 10) {
						newErrors.title =
							'Le titre doit contenir au moins 10 caractères';
					}
					if (
						!formData.description ||
						formData.description.length < 50
					) {
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
					// Property details validation - no required fields
					break;
				case 4:
					if (mainImageFiles.length === 0 && !existingMainImage) {
						newErrors.mainImage = "L'image principale est requise";
					}
					break;
			}

			setErrors(newErrors);
			return Object.keys(newErrors).length === 0;
		},
		[formData, mainImageFiles, existingMainImage],
	);

	return {
		formData,
		setFormData,
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
		isEditing,
	};
};
