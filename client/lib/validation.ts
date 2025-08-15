import { z } from 'zod';

export const signUpSchema = z.object({
	firstName: z.string().min(2, 'First name must be at least 2 characters'),
	lastName: z.string().min(2, 'Last name must be at least 2 characters'),
	email: z.string().email('Please enter a valid email address'),
	password: z
		.string()
		.min(8, 'Password must be at least 8 characters')
		.regex(
			/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
			'Password must contain uppercase, lowercase, and number',
		),
	phone: z.string().min(10, 'Please enter a valid phone number'),
	userType: z.enum(['agent', 'apporteur']),
});

export const loginSchema = z.object({
	email: z.string().email('Please enter a valid email address'),
	password: z.string().min(1, 'Password is required'),
});

export const verifyEmailSchema = z.object({
	email: z.string().email('Please enter a valid email address'),
	code: z.string().length(6, 'Verification code must be 6 digits'),
});

export const forgotPasswordSchema = z.object({
	email: z.string().email('Please enter a valid email address'),
});

export const resetPasswordSchema = z.object({
	email: z.string().email('Please enter a valid email address'),
	code: z.string().length(6, 'Reset code must be 6 digits'),
	newPassword: z
		.string()
		.min(8, 'Password must be at least 8 characters')
		.regex(
			/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
			'Password must contain uppercase, lowercase, and number',
		),
});
