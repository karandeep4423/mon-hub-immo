import { useState, useCallback, ChangeEvent } from 'react';
import { logger } from '@/lib/utils/logger';

interface UseFormOptions<T> {
	initialValues: T;
	onSubmit?: (values: T) => Promise<void> | void;
}

interface UseFormReturn<T> {
	values: T;
	errors: Record<string, string>;
	isSubmitting: boolean;
	handleChange: (field: keyof T, value: unknown) => void;
	handleInputChange: (
		e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
	) => void;
	setFieldValue: (field: keyof T, value: unknown) => void;
	setFieldError: (field: keyof T, error: string) => void;
	setErrors: (errors: Record<string, string>) => void;
	clearErrors: () => void;
	handleSubmit: (e?: React.FormEvent) => Promise<void>;
	resetForm: () => void;
	setValues: (values: T) => void;
}

export const useForm = <T extends Record<string, unknown>>({
	initialValues,
	onSubmit,
}: UseFormOptions<T>): UseFormReturn<T> => {
	const [values, setValues] = useState<T>(initialValues);
	const [errors, setErrors] = useState<Record<string, string>>({});
	const [isSubmitting, setIsSubmitting] = useState(false);

	const handleChange = useCallback(
		(field: keyof T, value: unknown) => {
			setValues((prev) => ({ ...prev, [field]: value }));
			if (errors[field as string]) {
				setErrors((prev) => {
					const newErrors = { ...prev };
					delete newErrors[field as string];
					return newErrors;
				});
			}
		},
		[errors],
	);

	const handleInputChange = useCallback(
		(e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
			const { name, value, type } = e.target;
			const fieldValue =
				type === 'checkbox'
					? (e.target as HTMLInputElement).checked
					: value;
			handleChange(name as keyof T, fieldValue);
		},
		[handleChange],
	);

	const setFieldValue = useCallback((field: keyof T, value: unknown) => {
		setValues((prev) => ({ ...prev, [field]: value }));
	}, []);

	const setFieldError = useCallback((field: keyof T, error: string) => {
		setErrors((prev) => ({ ...prev, [field as string]: error }));
	}, []);

	const clearErrors = useCallback(() => {
		setErrors({});
	}, []);

	const handleSubmit = useCallback(
		async (e?: React.FormEvent) => {
			if (e) {
				e.preventDefault();
			}

			if (!onSubmit) return;

			setIsSubmitting(true);
			setErrors({});

			try {
				await onSubmit(values);
			} catch (error) {
				// Error handling is done in onSubmit callback
				logger.error('[useForm] Form submission error:', error);
			} finally {
				setIsSubmitting(false);
			}
		},
		[onSubmit, values],
	);
	const resetForm = useCallback(() => {
		setValues(initialValues);
		setErrors({});
		setIsSubmitting(false);
	}, [initialValues]);

	return {
		values,
		errors,
		isSubmitting,
		handleChange,
		handleInputChange,
		setFieldValue,
		setFieldError,
		setErrors,
		clearErrors,
		handleSubmit,
		resetForm,
		setValues,
	};
};
