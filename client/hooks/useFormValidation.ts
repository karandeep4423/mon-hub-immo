import { useState, useCallback } from 'react';

/**
 * Validation rule types
 */
export interface ValidationRule<T = unknown> {
	validate: (value: T, formData?: Record<string, unknown>) => boolean;
	message: string;
}

export interface FieldValidation {
	required?: boolean | string;
	minLength?: { value: number; message: string };
	maxLength?: { value: number; message: string };
	min?: { value: number; message: string };
	max?: { value: number; message: string };
	pattern?: { value: RegExp; message: string };
	custom?: ValidationRule[];
}

export interface ValidationSchema {
	[fieldName: string]: FieldValidation;
}

export interface StepValidationSchema {
	[step: number]: ValidationSchema;
}

/**
 * Reusable form validation hook
 * Consolidates validation logic from SignUpForm, PropertyForm, and other forms
 *
 * @example
 * ```tsx
 * const validationSchema: StepValidationSchema = {
 *   1: {
 *     firstName: {
 *       required: 'Prénom requis',
 *       minLength: { value: 2, message: 'Minimum 2 caractères' }
 *     },
 *     email: {
 *       required: 'Email requis',
 *       pattern: { value: /\S+@\S+\.\S+/, message: 'Email invalide' }
 *     }
 *   }
 * };
 *
 * const { errors, validateField, validateStep, clearErrors } =
 *   useFormValidation(validationSchema);
 * ```
 */
export const useFormValidation = (schema: StepValidationSchema) => {
	const [errors, setErrors] = useState<Record<string, string>>({});

	/**
	 * Validate a single field
	 */
	const validateField = useCallback(
		(
			fieldName: string,
			value: unknown,
			step: number,
			formData?: Record<string, unknown>,
		): string | null => {
			const stepSchema = schema[step];
			if (!stepSchema || !stepSchema[fieldName]) return null;

			const rules = stepSchema[fieldName];

			// Required validation
			if (rules.required) {
				const isEmpty =
					value === undefined ||
					value === null ||
					value === '' ||
					(typeof value === 'string' && !value.trim());

				if (isEmpty) {
					return typeof rules.required === 'string'
						? rules.required
						: `${fieldName} est requis`;
				}
			}

			// String validations
			if (typeof value === 'string') {
				if (rules.minLength && value.length < rules.minLength.value) {
					return rules.minLength.message;
				}
				if (rules.maxLength && value.length > rules.maxLength.value) {
					return rules.maxLength.message;
				}
				if (rules.pattern && !rules.pattern.value.test(value)) {
					return rules.pattern.message;
				}
			}

			// Number validations
			if (typeof value === 'number') {
				if (rules.min !== undefined && value < rules.min.value) {
					return rules.min.message;
				}
				if (rules.max !== undefined && value > rules.max.value) {
					return rules.max.message;
				}
			}

			// Custom validations
			if (rules.custom) {
				for (const rule of rules.custom) {
					if (!rule.validate(value, formData)) {
						return rule.message;
					}
				}
			}

			return null;
		},
		[schema],
	);

	/**
	 * Validate all fields in a step
	 */
	const validateStep = useCallback(
		(step: number, formData: Record<string, unknown>): boolean => {
			const stepSchema = schema[step];
			if (!stepSchema) return true;

			const newErrors: Record<string, string> = {};

			Object.keys(stepSchema).forEach((fieldName) => {
				const error = validateField(
					fieldName,
					formData[fieldName],
					step,
					formData,
				);
				if (error) {
					newErrors[fieldName] = error;
				}
			});

			setErrors(newErrors);
			return Object.keys(newErrors).length === 0;
		},
		[schema, validateField],
	);

	/**
	 * Validate entire form across all steps
	 */
	const validateAllSteps = useCallback(
		(formData: Record<string, unknown>): boolean => {
			const allErrors: Record<string, string> = {};

			Object.keys(schema).forEach((stepKey) => {
				const step = Number(stepKey);
				const stepSchema = schema[step];

				Object.keys(stepSchema).forEach((fieldName) => {
					const error = validateField(
						fieldName,
						formData[fieldName],
						step,
						formData,
					);
					if (error) {
						allErrors[fieldName] = error;
					}
				});
			});

			setErrors(allErrors);
			return Object.keys(allErrors).length === 0;
		},
		[schema, validateField],
	);

	/**
	 * Clear all errors
	 */
	const clearErrors = useCallback(() => {
		setErrors({});
	}, []);

	/**
	 * Clear error for specific field
	 */
	const clearFieldError = useCallback((fieldName: string) => {
		setErrors((prev) => {
			const newErrors = { ...prev };
			delete newErrors[fieldName];
			return newErrors;
		});
	}, []);

	/**
	 * Set custom error
	 */
	const setFieldError = useCallback((fieldName: string, message: string) => {
		setErrors((prev) => ({ ...prev, [fieldName]: message }));
	}, []);

	/**
	 * Set multiple errors
	 */
	const setMultipleErrors = useCallback(
		(newErrors: Record<string, string>) => {
			setErrors((prev) => ({ ...prev, ...newErrors }));
		},
		[],
	);

	return {
		errors,
		setErrors: setMultipleErrors,
		validateField,
		validateStep,
		validateAllSteps,
		clearErrors,
		clearFieldError,
		setFieldError,
	};
};

/**
 * Common validation rules (reusable)
 */
export const commonValidationRules = {
	email: {
		required: 'Email requis',
		pattern: {
			value: /\S+@\S+\.\S+/,
			message: 'Email invalide',
		},
	},
	phone: {
		required: 'Téléphone requis',
		pattern: {
			value: /^(?:\+33|0)[1-9](?:\d{2}){4}$/,
			message: 'Format: 06 12 34 56 78 ou +33 6 12 34 56 78',
		},
	},
	postalCode: {
		required: 'Code postal requis',
		pattern: {
			value: /^[0-9]{5}$/,
			message: 'Le code postal doit contenir 5 chiffres',
		},
	},
	password: {
		required: 'Mot de passe requis',
		minLength: { value: 12, message: 'Minimum 12 caractères' },
		pattern: {
			value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&_\-+=])/,
			message:
				'1 majuscule, 1 minuscule, 1 chiffre, 1 caractère spécial (@$!%*?&_-+=)',
		},
	},
};
