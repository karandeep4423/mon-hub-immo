// client/lib/validation.ts
import { z } from 'zod';

export const signUpSchema = z
	.object({
		firstName: z
			.string()
			.min(1, 'Prénom requis')
			.min(2, 'Le prénom doit contenir au moins 2 caractères')
			.trim(),
		lastName: z
			.string()
			.min(1, 'Nom requis')
			.min(2, 'Le nom doit contenir au moins 2 caractères')
			.trim(),
		email: z
			.string()
			.min(1, 'Email requis')
			.email('Email invalide')
			.transform((email) => email.toLowerCase()),
		phone: z
			.string()
			.min(1, 'Téléphone requis')
			.regex(
				/^(?:(?:\+33|0)[1-9])(?:[0-9]{8})$/,
				'Téléphone invalide (format français)',
			)
			.transform((phone) => phone.replace(/\s/g, '')),
		password: z
			.string()
			.min(1, 'Mot de passe requis')
			.min(8, 'Mot de passe minimum 8 caractères')
			.regex(
				/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
				'Doit contenir majuscule, minuscule et chiffre',
			),
		confirmPassword: z.string().min(1, 'Confirmation requis'),
		userType: z
			.string()
			.min(1, 'Veuillez choisir votre rôle')
			.refine((val) => ['agent', 'apporteur'].includes(val), {
				message: 'Veuillez sélectionner Agent ou Apporteur',
			}),
		// Agent-specific fields
		agentType: z.string().optional(),
		tCard: z.string().optional(),
		sirenNumber: z.string().optional(),
		rsacNumber: z.string().optional(),
		collaboratorCertificate: z.string().optional(),
	})
	.refine((data) => data.password === data.confirmPassword, {
		message: 'Les mots de passe ne correspondent pas',
		path: ['confirmPassword'],
	})
	.refine(
		(data) => {
			if (data.userType === 'agent') {
				return (
					data.agentType &&
					['independent', 'commercial', 'employee'].includes(
						data.agentType,
					)
				);
			}
			return true;
		},
		{
			message: "Veuillez choisir votre type d'agent",
			path: ['agentType'],
		},
	)
	.refine(
		(data) => {
			if (data.userType === 'agent' && data.agentType === 'independent') {
				return data.tCard || data.sirenNumber;
			}
			return true;
		},
		{
			message: 'Veuillez fournir au moins une carte T ou un numéro SIREN',
			path: ['tCard'],
		},
	)
	.refine(
		(data) => {
			if (data.userType === 'agent' && data.agentType === 'commercial') {
				return data.sirenNumber || data.rsacNumber;
			}
			return true;
		},
		{
			message: 'Veuillez fournir au moins un numéro SIREN ou RSAC',
			path: ['sirenNumber'],
		},
	)
	.refine(
		(data) => {
			if (data.userType === 'agent' && data.agentType === 'employee') {
				return (
					data.collaboratorCertificate &&
					data.collaboratorCertificate.trim().length > 0
				);
			}
			return true;
		},
		{
			message: "Certificat d'autorisation de l'employeur requis",
			path: ['collaboratorCertificate'],
		},
	);

export const loginSchema = z.object({
	email: z
		.string()
		.min(1, 'Email requis')
		.email('Veuillez entrer une adresse email valide'),
	password: z.string().min(1, 'Mot de passe requis'),
});

export const verifyEmailSchema = z.object({
	email: z
		.string()
		.min(1, 'Email requis')
		.email('Veuillez entrer une adresse email valide'),
	code: z
		.string()
		.length(6, 'Le code de vérification doit contenir 6 caractères')
		.regex(
			/^[0-9A-Z]+$/,
			'Le code doit contenir uniquement des chiffres et lettres majuscules',
		),
});

export const forgotPasswordSchema = z.object({
	email: z
		.string()
		.min(1, 'Email requis')
		.email('Veuillez entrer une adresse email valide'),
});

export const resetPasswordSchema = z.object({
	email: z
		.string()
		.min(1, 'Email requis')
		.email('Veuillez entrer une adresse email valide'),
	code: z
		.string()
		.length(6, 'Le code de réinitialisation doit contenir 6 caractères')
		.regex(
			/^[0-9A-Z]+$/,
			'Le code doit contenir uniquement des chiffres et lettres majuscules',
		),
	newPassword: z
		.string()
		.min(8, 'Le mot de passe doit contenir au moins 8 caractères')
		.regex(
			/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
			'Le mot de passe doit contenir majuscule, minuscule et chiffre',
		),
});

export const setPasswordSchema = z.object({
	email: z
 		.string()
 		.min(1, 'Email requis')
 		.email('Veuillez entrer une adresse email valide'),
	token: z.string().min(6, 'Token invalide'),
	newPassword: z
 		.string()
 		.min(8, 'Le mot de passe doit contenir au moins 8 caractères')
 		.regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Le mot de passe doit contenir majuscule, minuscule et chiffre'),
});

export type SetPasswordFormData = z.infer<typeof setPasswordSchema>;

// Type exports for TypeScript
export type SignUpFormData = z.infer<typeof signUpSchema>;
export type LoginFormData = z.infer<typeof loginSchema>;
export type VerifyEmailFormData = z.infer<typeof verifyEmailSchema>;
export type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;
