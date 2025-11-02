'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { authService } from '@/lib/api/authApi';
import { forgotPasswordSchema } from '@/lib/validation';
import { useForm } from '@/hooks/useForm';
import { Features } from '@/lib/constants';
import { handleAuthError, authToastSuccess } from '@/lib/utils/authToast';

interface ForgotPasswordFormData extends Record<string, unknown> {
	email: string;
}

export const ForgotPasswordForm: React.FC = () => {
	const router = useRouter();
	const [success, setSuccess] = useState(false);

	const { values, errors, isSubmitting, handleInputChange, handleSubmit } =
		useForm<ForgotPasswordFormData>({
			initialValues: { email: '' },
			onSubmit: async (data) => {
				try {
					forgotPasswordSchema.parse(data);
					const response = await authService.forgotPassword(data);
					if (response.success) {
						setSuccess(true);
						authToastSuccess(
							Features.Auth.AUTH_TOAST_MESSAGES
								.FORGOT_PASSWORD_SUCCESS,
						);
					} else {
						handleAuthError(new Error(response.message));
					}
				} catch (error) {
					handleAuthError(error);
				}
			},
		});

	if (success) {
		return (
			<div className="min-h-screen bg-white flex flex-col">
				{/* Header */}
				<div className="text-center pt-8 sm:pt-12 pb-6 sm:pb-8 px-4 sm:px-6">
					<h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6 sm:mb-8">
						mon<span className="text-brand">hubimmo</span>
					</h1>
				</div>

				{/* Success Content */}
				<div className="flex-1 px-4 sm:px-6 flex items-center justify-center">
					<div className="max-w-sm mx-auto text-center space-y-6">
						{/* Success Icon */}
						<div className="mx-auto w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mb-6">
							<svg
								className="w-8 h-8 text-green-600"
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24"
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth="2"
									d="M5 13l4 4L19 7"
								/>
							</svg>
						</div>

						<div className="space-y-4">
							<h2 className="text-xl font-semibold text-gray-900">
								Email envoyé !
							</h2>
							<p className="text-gray-600 text-sm">
								Nous avons envoyé les instructions de
								réinitialisation à
							</p>
							<p className="font-semibold text-gray-900 text-sm">
								{values.email}
							</p>
						</div>

						<div className="space-y-4 pt-4">
							<Button
								onClick={() =>
									router.push(
										`/auth/reset-password?email=${encodeURIComponent(values.email)}`,
									)
								}
								className="w-full bg-brand hover:bg-brand-600 text-white"
								size="lg"
							>
								Continuer la réinitialisation
							</Button>

							<button
								type="button"
								onClick={() =>
									router.push(Features.Auth.AUTH_ROUTES.LOGIN)
								}
								className="text-brand hover:text-brand text-sm font-medium"
							>
								Retour à la connexion
							</button>
						</div>
					</div>
				</div>
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-white flex flex-col">
			{/* Header */}
			<div className="text-center pt-8 sm:pt-12 pb-6 sm:pb-8 px-4 sm:px-6">
				<h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6 sm:mb-8">
					mon<span className="text-brand">hubimmo</span>
				</h1>

				<div className="space-y-3 sm:space-y-4">
					<h2 className="text-lg sm:text-xl font-semibold text-gray-800">
						Mot de passe oublié
					</h2>
					<p className="text-sm sm:text-base text-gray-600 max-w-md mx-auto px-4">
						Entrez votre adresse email et nous vous enverrons les
						instructions pour réinitialiser votre mot de passe
					</p>
				</div>
			</div>

			{/* Form Content */}
			<div className="flex-1 px-4 sm:px-6">
				<div className="max-w-sm mx-auto">
					<form
						onSubmit={handleSubmit}
						className="space-y-6 sm:space-y-8"
					>
						{/* Email Input */}
						<div className="space-y-2">
							<Input
								label=""
								type="email"
								name="email"
								value={values.email}
								onChange={handleInputChange}
								error={errors.email}
								placeholder={
									Features.Auth.AUTH_PLACEHOLDERS.YOUR_EMAIL
								}
								required
								className="text-center"
							/>
							{errors.email && (
								<div className="flex items-center justify-center text-red-600 text-sm mt-2">
									<svg
										className="w-4 h-4 mr-1"
										fill="currentColor"
										viewBox="0 0 20 20"
									>
										<path
											fillRule="evenodd"
											d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
											clipRule="evenodd"
										/>
									</svg>
									{errors.email}
								</div>
							)}
						</div>

						{/* Submit Button */}
						<Button
							type="submit"
							loading={isSubmitting}
							className="w-full bg-brand hover:bg-brand-600 text-white"
							size="lg"
						>
							{isSubmitting
								? 'Envoi en cours...'
								: 'Envoyer les instructions'}
						</Button>
					</form>

					{/* Navigation */}
					<div className="text-center mt-8 sm:mt-10 pb-8">
						<button
							type="button"
							onClick={() =>
								router.push(Features.Auth.AUTH_ROUTES.LOGIN)
							}
							className="text-brand hover:text-brand text-sm font-medium transition-colors"
						>
							Retour à la connexion
						</button>
					</div>
				</div>
			</div>
		</div>
	);
};
