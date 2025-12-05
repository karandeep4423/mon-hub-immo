'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { AuthLayout } from '@/components/auth/AuthLayout';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { authService } from '@/lib/api/authApi';
import { setPasswordSchema } from '@/lib/validation';
import { useForm } from '@/hooks/useForm';
import {
	authToastError,
	showPasswordResetSuccess,
} from '@/lib/utils/authToast';

export default function SetPasswordClient() {
	const router = useRouter();
	const searchParams = useSearchParams();
	const [email, setEmail] = useState('');
	const [token, setToken] = useState('');

	useEffect(() => {
		const e = searchParams.get('email');
		if (e) setEmail(e);
		const t = searchParams.get('token');
		if (t) setToken(t);
	}, [searchParams]);

	const {
		values,
		errors,
		handleInputChange,
		setErrors,
		isSubmitting,
		handleSubmit,
	} = useForm({
		initialValues: { token: '', newPassword: '', confirmPassword: '' },
		onSubmit: async (data: unknown) => {
			try {
				const payloadData = data as {
					token?: string;
					newPassword?: string;
					confirmPassword?: string;
				};
				if (payloadData.newPassword !== payloadData.confirmPassword) {
					setErrors({
						confirmPassword:
							'Les mots de passe ne correspondent pas',
					});
					authToastError('Les mots de passe ne correspondent pas');
					return;
				}

				// Always use the token from URL (state) to avoid missing value from hidden input
				const payload = {
					email,
					token,
					newPassword: payloadData.newPassword,
				};
				if (!token || !payload.newPassword) {
					setErrors({
						confirmPassword: 'Token et mot de passe requis',
					});
					authToastError('Token et mot de passe requis');
					return;
				}

				setPasswordSchema.parse(
					payload as {
						email: string;
						token: string;
						newPassword: string;
					},
				);

				const res = await authService.setPasswordFromInvite(
					payload as {
						email: string;
						token: string;
						newPassword: string;
					},
				);
				if (res.success) {
					showPasswordResetSuccess();
					// Email is already verified (done before reaching this page)
					// Redirect to login page
					setTimeout(() => router.push('/auth/login'), 1200);
				} else if (
					'requiresEmailVerification' in res &&
					res.requiresEmailVerification
				) {
					// User needs to verify email first
					authToastError("Veuillez d'abord vérifier votre email.");
					setTimeout(
						() =>
							router.push(
								`/auth/verify-email?email=${encodeURIComponent(email)}`,
							),
						1500,
					);
				} else {
					authToastError(
						res.message ||
							'Erreur lors de la mise à jour du mot de passe',
					);
				}
			} catch (err: unknown) {
				// Log for debugging and show a user-friendly message
				console.error(err);
				authToastError('Erreur lors de la mise à jour du mot de passe');
			}
		},
	});

	return (
		<AuthLayout title="Définir mon mot de passe">
			<div className="min-h-screen bg-white flex flex-col">
				{/* Header with Logo */}
				<div className="text-center pt-8 sm:pt-12 pb-6 sm:pb-8 px-4 sm:px-6">
					<h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6 sm:mb-8">
						mon<span className="text-brand">hubimmo</span>
					</h1>

					<div className="space-y-3 sm:space-y-4">
						<h2 className="text-lg sm:text-xl font-semibold text-gray-800">
							Définir un nouveau mot de passe
						</h2>
						<p className="text-sm sm:text-base text-gray-600 max-w-md mx-auto px-4">
							Définissez votre mot de passe pour activer votre
							compte
						</p>
						{email && (
							<p className="text-sm sm:text-base font-semibold text-gray-900">
								{email}
							</p>
						)}
					</div>
				</div>

				{/* Form Content */}
				<div className="flex-1 px-4 sm:px-6">
					<div className="max-w-sm mx-auto">
						<form onSubmit={handleSubmit} className="space-y-6">
							{/* Token warning */}
							{!token && (
								<div className="text-sm text-yellow-700 bg-yellow-100 p-2 rounded">
									Le token d&apos;invitation est manquant dans
									l&apos;URL. Veuillez utiliser le lien reçu
									par email ou contacter un administrateur.
								</div>
							)}
							<input
								type="hidden"
								name="token"
								value={token || values.token}
							/>

							{/* New Password */}
							<div className="space-y-2">
								<Input
									label=""
									type="password"
									name="newPassword"
									value={values.newPassword}
									onChange={handleInputChange}
									error={errors.newPassword}
									placeholder="Nouveau mot de passe"
									required
								/>
								<p className="text-xs text-gray-500 text-center">
									Minimum 12 caractères avec majuscule,
									minuscule, chiffre et caractère spécial
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
									placeholder="Confirmer le mot de passe *"
									required
								/>
								{values.newPassword &&
									values.confirmPassword && (
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
														Les mots de passe
														correspondent
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
									className="w-full"
									disabled={!token}
								>
									Définir le mot de passe
								</Button>
							</div>
						</form>
					</div>
				</div>
			</div>
		</AuthLayout>
	);
}
