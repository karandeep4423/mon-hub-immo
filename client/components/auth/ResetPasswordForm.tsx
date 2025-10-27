'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { toast } from 'react-toastify';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { useAuth } from '@/hooks/useAuth';
import { authService } from '@/lib/api/authApi';
import { resetPasswordSchema } from '@/lib/validation';
import { ResetPasswordData } from '@/types/auth';
import { useForm } from '@/hooks/useForm';
import { Features } from '@/lib/constants';

interface ResetPasswordFormData extends Record<string, unknown> {
	code: string;
	newPassword: string;
	confirmPassword: string;
}

export const ResetPasswordForm: React.FC = () => {
	const router = useRouter();
	const searchParams = useSearchParams();
	const { login } = useAuth();
	const [email, setEmail] = useState('');
	const [success, setSuccess] = useState(false);

	const {
		values,
		errors,
		isSubmitting,
		handleInputChange,
		setErrors,
		handleSubmit,
	} = useForm<ResetPasswordFormData>({
		initialValues: {
			code: '',
			newPassword: '',
			confirmPassword: '',
		},
		onSubmit: async (data) => {
			if (data.newPassword !== data.confirmPassword) {
				setErrors({
					confirmPassword: 'Les mots de passe ne correspondent pas',
				});
				return;
			}

			if (!email) {
				setErrors({ email: 'Email requis' });
				return;
			}

			const resetData: ResetPasswordData = {
				email,
				code: data.code,
				newPassword: data.newPassword,
			};

			resetPasswordSchema.parse(resetData);

			const response = await authService.resetPassword(resetData);

			if (response.success) {
				setSuccess(true);
				toast.success(response.message);

				if (response.token && response.user) {
					login(response.token, response.user);
					setTimeout(() => {
						router.push(Features.Dashboard.DASHBOARD_ROUTES.BASE);
					}, 2000);
				} else {
					setTimeout(() => {
						router.push(Features.Auth.AUTH_ROUTES.LOGIN);
					}, 2000);
				}
			} else {
				toast.error(response.message);
			}
		},
	});

	useEffect(() => {
		const emailParam = searchParams.get('email');
		if (emailParam) {
			setEmail(emailParam);
		}
	}, [searchParams]);

	if (success) {
		return (
			<div className="min-h-screen bg-white flex flex-col">
				{/* Header */}
				<div className="text-center pt-8 sm:pt-12 pb-6 sm:pb-8 px-4 sm:px-6">
					<h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6 sm:mb-8">
						mon<span className="text-cyan-500">hubimmo</span>
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
								Mot de passe réinitialisé !
							</h2>
							<p className="text-gray-600 text-sm">
								Votre mot de passe a été réinitialisé avec
								succès. Vous allez être redirigé vers le tableau
								de bord.
							</p>
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
					hub<span className="text-cyan-500">immo</span>
				</h1>

				<div className="space-y-3 sm:space-y-4">
					<h2 className="text-lg sm:text-xl font-semibold text-gray-800">
						Nouveau mot de passe
					</h2>
					<p className="text-sm sm:text-base text-gray-600 max-w-md mx-auto px-4">
						Entrez le code de vérification envoyé à
					</p>
					<p className="text-sm sm:text-base font-semibold text-gray-900">
						{email}
					</p>
				</div>
			</div>

			{/* Form Content */}
			<div className="flex-1 px-4 sm:px-6">
				<div className="max-w-sm mx-auto">
					<form onSubmit={handleSubmit} className="space-y-6">
						{/* Verification Code */}
						<div className="space-y-2">
							<Input
								label=""
								type="text"
								name="code"
								value={values.code}
								onChange={(e) => {
									const value = e.target.value
										.replace(/\D/g, '')
										.slice(0, 6);
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
								maxLength={6}
								className="text-center text-xl tracking-[0.5em] font-mono"
								required
							/>
						</div>

						{/* New Password */}
						<div className="space-y-2">
							<Input
								label=""
								type="password"
								name="newPassword"
								value={values.newPassword}
								onChange={handleInputChange}
								error={errors.newPassword}
								placeholder={
									Features.Auth.AUTH_PLACEHOLDERS.NEW_PASSWORD
								}
								required
							/>
							<p className="text-xs text-gray-500 text-center">
								Doit contenir majuscule, minuscule et chiffre
							</p>
						</div>

						{/* Confirm Password */}
						<div className="space-y-2">
							<Input
								label=""
								type="password"
								name="confirmPassword"
								value={values.confirmPassword}
								onChange={handleInputChange}
								error={errors.confirmPassword}
								placeholder={
									Features.Auth.AUTH_PLACEHOLDERS
										.CONFIRM_PASSWORD
								}
								required
							/>
							{values.newPassword && values.confirmPassword && (
								<div className="flex items-center justify-center space-x-2">
									{values.newPassword ===
									values.confirmPassword ? (
										<>
											<svg
												className="w-4 h-4 text-green-500"
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
											<span className="text-xs text-green-600">
												Les mots de passe correspondent
											</span>
										</>
									) : (
										<>
											<svg
												className="w-4 h-4 text-red-500"
												fill="none"
												stroke="currentColor"
												viewBox="0 0 24 24"
											>
												<path
													strokeLinecap="round"
													strokeLinejoin="round"
													strokeWidth="2"
													d="M6 18L18 6M6 6l12 12"
												/>
											</svg>
											<span className="text-xs text-red-600">
												Les mots de passe ne
												correspondent pas
											</span>
										</>
									)}
								</div>
							)}
						</div>

						{/* Submit Button */}
						<div className="pt-4">
							<Button
								type="submit"
								loading={isSubmitting}
								className="w-full bg-cyan-500 hover:bg-cyan-600 text-white"
								size="lg"
								disabled={
									values.code.length !== 6 ||
									!values.newPassword ||
									!values.confirmPassword ||
									values.newPassword !==
										values.confirmPassword
								}
							>
								{isSubmitting
									? 'Réinitialisation...'
									: 'Réinitialiser le mot de passe'}
							</Button>
						</div>
					</form>

					{/* Navigation */}
					<div className="text-center mt-8 space-y-4 pb-8">
						<div>
							<button
								type="button"
								onClick={() =>
									router.push(
										Features.Auth.AUTH_ROUTES
											.FORGOT_PASSWORD,
									)
								}
								className="text-cyan-600 hover:text-cyan-500 text-sm font-medium"
							>
								Code non reçu ? Réessayer
							</button>
						</div>

						<div>
							<button
								type="button"
								onClick={() =>
									router.push(Features.Auth.AUTH_ROUTES.LOGIN)
								}
								className="text-gray-600 hover:text-gray-500 text-sm"
							>
								Retour à la connexion
							</button>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};
