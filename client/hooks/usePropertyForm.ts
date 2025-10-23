import { useState, useCallback } from 'react';
import { PropertyFormData, Property } from '@/lib/api/propertyApi';
import {
	useFormValidation,
	commonValidationRules,
	type StepValidationSchema,
} from './useFormValidation';

// Property form validation schema
const propertyValidationSchema: StepValidationSchema = {
	1: {
		title: {
			required: 'Le titre est requis',
			minLength: {
				value: 10,
				message: 'Le titre doit contenir au moins 10 caractères',
			},
		},
		description: {
			required: 'La description est requise',
			minLength: {
				value: 50,
				message: 'La description doit contenir au moins 50 caractères',
			},
		},
		price: {
			required: 'Le prix est requis',
			min: {
				value: 1000,
				message: 'Le prix doit être supérieur à 1000€',
			},
		},
		surface: {
			required: 'La surface est requise',
			min: {
				value: 1,
				message: 'La surface doit être supérieure à 1 m²',
			},
		},
	},
	2: {
		address: {
			required: "L'adresse est requise",
			minLength: {
				value: 5,
				message: "L'adresse doit contenir au moins 5 caractères",
			},
		},
		city: {
			required: 'La ville est requise',
			minLength: {
				value: 2,
				message: 'La ville doit contenir au moins 2 caractères',
			},
		},
		postalCode: commonValidationRules.postalCode,
		sector: {
			required: 'Le secteur est requis',
			minLength: {
				value: 2,
				message: 'Le secteur doit contenir au moins 2 caractères',
			},
		},
	},
	3: {
		// Property details validation - no required fields
	},
	4: {
		// Image validation - handled separately due to file state
	},
};

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

	// Use FormValidation hook
	const {
		errors,
		setErrors,
		validateStep: validateStepBase,
		setFieldError,
		clearFieldError,
	} = useFormValidation(propertyValidationSchema);

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
				clearFieldError(field);
			}
		},
		[errors, clearFieldError],
	);

	const validateStep = useCallback(
		(step: number): boolean => {
			// Use base validation from useFormValidation
			const isValid = validateStepBase(
				step,
				formData as unknown as Record<string, unknown>,
			);

			// Step 4: Special image validation
			if (step === 4) {
				if (mainImageFiles.length === 0 && !existingMainImage) {
					setFieldError(
						'mainImage',
						"L'image principale est requise",
					);
					return false;
				}
			}

			return isValid;
		},
		[
			formData,
			mainImageFiles,
			existingMainImage,
			validateStepBase,
			setFieldError,
		],
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
