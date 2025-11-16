/**
 * useSignUpForm - Custom hook for signup form state and logic
 *
 * Extracts all signup form management including:
 * - Multi-step navigation
 * - Form data state
 * - Validation logic
 * - File upload handling
 * - Form submission
 */

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { authService } from '@/lib/api/authApi';
import { signUpSchema, type SignUpFormData } from '@/lib/validation';
import { ZodError } from 'zod';
import { useMutation } from '@/hooks/useMutation';
import { Features } from '@/lib/constants';
import {
	useFormValidation,
	commonValidationRules,
	type StepValidationSchema,
} from '@/hooks/useFormValidation';
import {
	handleAuthError,
	showSignupSuccess,
	authToastError,
    authToastInfo,
} from '@/lib/utils/authToast';

// Validation schema for signup form
const signupValidationSchema: StepValidationSchema = {
	1: {
		// Basic Information
		firstName: {
			required: 'Prénom requis',
			minLength: { value: 2, message: 'Minimum 2 caractères' },
		},
		lastName: {
			required: 'Nom requis',
			minLength: { value: 2, message: 'Minimum 2 caractères' },
		},
		email: commonValidationRules.email,
		phone: commonValidationRules.phone,
	},
	2: {
		// User Type
		userType: {
			required: 'Veuillez choisir un rôle',
		},
	},
	3: {
		// Agent Professional Info (conditional validation in validateStep)
		agentType: {
			required: "Type d'agent requis",
		},
	},
	4: {
		// Password
		password: commonValidationRules.password,
		confirmPassword: {
			required: 'Confirmation requise',
			custom: [
				{
					validate: (value, formData) => value === formData?.password,
					message: 'Les mots de passe ne correspondent pas',
				},
			],
		},
	},
};

const initialFormData: SignUpFormData = {
	firstName: '',
	lastName: '',
	email: '',
	phone: '',
	userType: '',
	password: '',
	confirmPassword: '',
	// Agent-specific fields
	agentType: '',
	tCard: '',
	sirenNumber: '',
	rsacNumber: '',
	collaboratorCertificate: '',
};

export const useSignUpForm = () => {
	const router = useRouter();
	const [currentStep, setCurrentStep] = useState(1);
	const [formData, setFormData] = useState<SignUpFormData>(initialFormData);
	const [showPassword, setShowPassword] = useState(false);
	const [showConfirmPassword, setShowConfirmPassword] = useState(false);
	const [identityCardFile, setIdentityCardFile] = useState<File | null>(null);

	const {
		errors,
		validateStep: validateStepBase,
		clearFieldError,
		setErrors,
	} = useFormValidation(signupValidationSchema);

	const { mutate: signUpMutation, loading } = useMutation(
		async (data: SignUpFormData) => {
			const validatedData = signUpSchema.parse(data);
			// Keep confirmPassword for API call as it's required by SignUpData type
			const result = await authService.signUp(
				validatedData as Parameters<typeof authService.signUp>[0],
				identityCardFile, // Pass identity card file
			);
			return result;
		},
		{
			showErrorToast: false, // Disable automatic error toast to prevent duplicates
			onSuccess: () => {
				// Pass email as query parameter for verification
				const email = formData.email;
				showSignupSuccess();
				router.push(
					`${Features.Auth.AUTH_ROUTES.VERIFY_EMAIL}?email=${encodeURIComponent(email)}`,
				);
				authToastInfo(
					"Votre inscription est reçue et sera vérifiée manuellement par notre équipe. Vous recevrez un email de confirmation une fois validée.",
				);
			},
			onError: (error) => {
				if (error instanceof ZodError && error.errors) {
					const backendErrors: Record<string, string> = {};
					error.errors.forEach((err) => {
						if (err.path && err.path.length > 0) {
							const field = err.path[0] as string;
							backendErrors[field] = err.message;
						}
					});
					setErrors(backendErrors);
				}
				handleAuthError(error); // This already handles toast notifications
			},
		},
	);

	const handleChange = (
		e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
	) => {
		const { name, value } = e.target;

		setFormData((prev) => ({
			...prev,
			[name]: value,
		}));

		clearFieldError(name);

		// Reset agent-specific fields when switching from agent to apporteur
		if (name === 'userType' && value !== 'agent') {
			setFormData((prev) => ({
				...prev,
				agentType: '',
				tCard: '',
				sirenNumber: '',
				rsacNumber: '',
				collaboratorCertificate: '',
			}));
			// Clear errors for agent-specific fields
			clearFieldError('agentType');
			clearFieldError('tCard');
			clearFieldError('sirenNumber');
			clearFieldError('rsacNumber');
			clearFieldError('collaboratorCertificate');
			setIdentityCardFile(null);
		}
	};

	const validateStep = (step: number): boolean => {
		// First, run base validation
		const isValid = validateStepBase(step, formData);

		// Additional validation for Step 3 (Agent Professional Info)
		if (step === 3 && formData.userType === 'agent') {
			const newErrors: Record<string, string> = {};

			if (!formData.agentType) {
				newErrors.agentType = "Type d'agent requis";
			}

			// Validation based on agent type
			if (formData.agentType === 'independent') {
				if (!formData.tCard || formData.tCard.trim() === '') {
					newErrors.tCard =
						'Carte professionnelle (T card) requise pour agent immobilier indépendant';
				}
			} else if (formData.agentType === 'commercial') {
				if (
					!formData.sirenNumber ||
					formData.sirenNumber.trim() === ''
				) {
					newErrors.sirenNumber =
						'Numéro SIREN requis pour agent commercial immobilier';
				}
			} else if (formData.agentType === 'employee') {
				if (
					!formData.collaboratorCertificate ||
					formData.collaboratorCertificate.trim() === ''
				) {
					newErrors.collaboratorCertificate =
						"Certificat d'autorisation requis pour négociateur VRP employé d'agence";
				}
			}

			if (Object.keys(newErrors).length > 0) {
				setErrors(newErrors);
				return false;
			}
		}

		return isValid;
	};

	const handleNext = async () => {
		// Validate current step before proceeding
		const isStepValid = validateStep(currentStep);

		if (!isStepValid) {
			authToastError(Features.Auth.AUTH_TOAST_MESSAGES.VALIDATION_ERROR);
			return;
		}

		// Move to next step (step 3 is skipped for apporteur)
		if (currentStep === 2 && formData.userType === 'apporteur') {
			setCurrentStep(4); // Skip to password step for apporteurs
		} else {
			setCurrentStep((prev) => Math.min(prev + 1, 5));
		}
	};

	const handlePrevious = () => {
		// Skip step 3 when going back from step 4 if user is apporteur
		if (currentStep === 4 && formData.userType === 'apporteur') {
			setCurrentStep(2); // Jump back to user type selection
		} else {
			setCurrentStep((prev) => Math.max(prev - 1, 1));
		}
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		// Final validation before submission
		if (formData.userType === 'agent') {
			// Validate all agent fields before submission
			const newErrors: Record<string, string> = {};

			if (!formData.agentType) {
				newErrors.agentType = "Type d'agent requis";
			}

			// Validation based on agent type
			if (formData.agentType === 'independent') {
				if (!formData.tCard || formData.tCard.trim() === '') {
					newErrors.tCard =
						'Carte professionnelle (T card) requise pour agent immobilier indépendant';
				}
			} else if (formData.agentType === 'commercial') {
				if (
					!formData.sirenNumber ||
					formData.sirenNumber.trim() === ''
				) {
					newErrors.sirenNumber =
						'Numéro SIREN requis pour agent commercial immobilier';
				}
			} else if (formData.agentType === 'employee') {
				if (
					!formData.collaboratorCertificate ||
					formData.collaboratorCertificate.trim() === ''
				) {
					newErrors.collaboratorCertificate =
						"Certificat d'autorisation requis pour négociateur VRP employé d'agence";
				}
			}

			if (Object.keys(newErrors).length > 0) {
				setErrors(newErrors);
				authToastError(
					Features.Auth.AUTH_TOAST_MESSAGES.MISSING_REQUIRED_FIELDS,
				);
				return;
			}
		}

		// Submit the form
		await signUpMutation(formData);
	};

	return {
		// State
		currentStep,
		formData,
		showPassword,
		showConfirmPassword,
		identityCardFile,
		loading,
		errors,

		// Setters
		setCurrentStep,
		setFormData,
		setShowPassword,
		setShowConfirmPassword,
		setIdentityCardFile,

		// Handlers
		handleChange,
		handleNext,
		handlePrevious,
		handleSubmit,
		validateStep,
		clearFieldError,
	};
};
