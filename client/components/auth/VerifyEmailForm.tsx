'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useAuth } from '@/hooks/useAuth';
import { useMutation } from '@/hooks/useMutation';
import { authService } from '@/lib/api/authApi';
import { verifyEmailSchema } from '@/lib/validation';
import { useForm } from '@/hooks/useForm';
import { Features } from '@/lib/constants';
import { logger } from '@/lib/utils/logger';
import {
	handleAuthError,
	showVerificationSuccess,
	authToastSuccess,
	authToastError,
} from '@/lib/utils/authToast';

interface VerifyEmailFormData extends Record<string, unknown> {
	code: string;
}

export const VerifyEmailForm: React.FC = () => {
	const router = useRouter();
	const searchParams = useSearchParams();
	const { login } = useAuth();
	const [email, setEmail] = useState('');
	const [timer, setTimer] = useState(0);

	// Mutation for resending verification code
	const { mutate: resendCode, loading: resendLoading } = useMutation(
		async (email: string) => {
			return await authService.resendVerificationCode(email);
		},
		{
			onSuccess: (response) => {
				if (response.success) {
					authToastSuccess(
						Features.Auth.AUTH_TOAST_MESSAGES.CODE_RESENT,
					);
					setTimer(60);
				} else {
					authToastError(
						response.message ||
							Features.Auth.AUTH_TOAST_MESSAGES.CODE_RESENT_ERROR,
					);
				}
			},
			onError: (error) => {
				handleAuthError(error);
			},
		},
	);

	const {
		values,
		errors,
		isSubmitting,
		handleInputChange,
		handleSubmit,
		setErrors,
	} = useForm<VerifyEmailFormData>({
		initialValues: {
			code: '',
		},
		onSubmit: async (data) => {
			logger.debug('[VerifyEmailForm] Form submission started', {
				email,
				hasCode: !!data.code,
			});
			try {
				if (!email) {
					logger.error('[VerifyEmailForm] No email found');
					setErrors({ email: 'Email requis' });
					authToastError('❌ Email requis');
					return;
				}

				logger.debug('[VerifyEmailForm] Validating with Zod...');
				verifyEmailSchema.parse({ email, code: data.code });

				logger.debug('[VerifyEmailForm] Calling API...');
				const response = await authService.verifyEmail({
					email,
					code: data.code,
				});

				logger.debug('[VerifyEmailForm] API Response received', {
					success: response.success,
				});

				if (response.success && response.user) {
					logger.success('[VerifyEmailForm] Login successful');
					// Tokens are in httpOnly cookies
					login(response.user);
					showVerificationSuccess();

					if (response.requiresProfileCompletion) {
						router.push(Features.Auth.AUTH_ROUTES.COMPLETE_PROFILE);
					} else {
						router.push(Features.Auth.AUTH_ROUTES.WELCOME);
					}
				} else {
					logger.error('[VerifyEmailForm] API returned error');
					setErrors({ code: response.message });
					handleAuthError(new Error(response.message));
				}
			} catch (error: unknown) {
				logger.error('[VerifyEmailForm] Exception caught:', error);
				setErrors({
					code:
						error instanceof Error
							? error.message
							: 'Erreur de vérification',
				});
				handleAuthError(error);
			}
		},
	});

	useEffect(() => {
		const emailParam = searchParams.get('email');
		logger.debug('[VerifyEmailForm] Email from URL:', emailParam);
		if (emailParam) {
			setEmail(emailParam);
		} else {
			logger.warn('[VerifyEmailForm] No email in URL query parameters');
		}
	}, [searchParams]);

	useEffect(() => {
		if (timer > 0) {
			const interval = setInterval(() => {
				setTimer((prev) => prev - 1);
			}, 1000);
			return () => clearInterval(interval);
		}
	}, [timer]);

	const handleResendCode = async () => {
		if (!email || timer > 0) return;
		await resendCode(email);
	};

	return (
		<div className="min-h-screen bg-white flex flex-col">
			{/* Header */}
			<div className="text-center pt-8 sm:pt-12 pb-6 sm:pb-8 px-4 sm:px-6">
				<h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6 sm:mb-8">
					mon<span className="text-cyan-500">hubimmo</span>
				</h1>

				<div className="space-y-3 sm:space-y-4">
					<h2 className="text-lg sm:text-xl font-semibold text-gray-800">
						Vérification de votre e-mail
					</h2>
					<p className="text-sm sm:text-base text-gray-600 max-w-md mx-auto px-4">
						Nous avons envoyé un code à 6 chiffres à
					</p>
					{email ? (
						<p className="text-sm sm:text-base font-semibold text-gray-900">
							{email}
						</p>
					) : (
						<p className="text-sm text-red-600 font-semibold">
							⚠️ Email manquant. Veuillez vous inscrire à nouveau.
						</p>
					)}
				</div>
			</div>

			{/* Content */}
			<div className="flex-1 px-4 sm:px-6">
				<div className="max-w-sm mx-auto">
					<form
						onSubmit={handleSubmit}
						className="space-y-6 sm:space-y-8"
					>
						{/* Code Input */}
						<div className="space-y-2">
							<Input
								label=""
								type="text"
								name="code"
								value={values.code}
								onChange={(e) => {
									const value = e.target.value
										.replace(/[^0-9A-Z]/gi, '')
										.toUpperCase()
										.slice(0, 8);
									handleInputChange({
										target: {
											name: 'code',
											value,
											type: 'text',
										},
									} as React.ChangeEvent<HTMLInputElement>);
								}}
								error={errors.code}
								placeholder={
									Features.Auth.AUTH_PLACEHOLDERS
										.VERIFICATION_CODE
								}
								maxLength={8}
								className="text-center text-xl sm:text-2xl tracking-[0.3em] font-mono uppercase"
								required
							/>
						</div>

						{/* Verify Button */}
						<Button
							type="submit"
							loading={isSubmitting}
							className="w-full bg-cyan-500 hover:bg-cyan-600 text-white"
							size="lg"
							disabled={isSubmitting || values.code.length !== 6}
						>
							Vérifier
						</Button>

						{/* Debug info - remove after testing */}
						{process.env.NODE_ENV === 'development' && (
							<div className="text-xs text-gray-500 text-center">
								Code length: {values.code.length} | Value:{' '}
								{values.code}
							</div>
						)}
					</form>
					{/* Resend and Navigation */}
					<div className="text-center mt-8 sm:mt-10 space-y-4">
						{/* Resend Code */}
						<div>
							<button
								type="button"
								onClick={handleResendCode}
								disabled={timer > 0 || resendLoading}
								className="text-cyan-600 hover:text-cyan-500 font-medium text-sm disabled:text-gray-400 disabled:cursor-not-allowed transition-colors"
							>
								{resendLoading
									? 'Envoi en cours...'
									: timer > 0
										? `Renvoyer le code dans ${timer}s`
										: 'Renvoyer le code de vérification'}
							</button>
						</div>

						{/* Back to Login */}
						<div>
							<button
								type="button"
								onClick={() =>
									router.push(Features.Auth.AUTH_ROUTES.LOGIN)
								}
								className="text-gray-600 hover:text-gray-500 text-sm font-medium transition-colors"
							>
								Retour à la connexion
							</button>
						</div>
					</div>{' '}
					{/* Helper Text */}
					<div className="text-center mt-6 sm:mt-8 pb-8">
						<p className="text-xs text-gray-500">
							Le code expire dans 24 heures
						</p>
					</div>
				</div>
			</div>
		</div>
	);
};
