'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { toast } from 'react-toastify';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useAuth } from '@/hooks/useAuth';
import { useMutation } from '@/hooks/useMutation';
import { authService } from '@/lib/api/authApi';
import { verifyEmailSchema } from '@/lib/validation';
import { useForm } from '@/hooks/useForm';
import { AUTH_ROUTES } from '@/lib/constants';

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
					toast.success(response.message);
					setTimer(60);
				} else {
					toast.error(response.message);
				}
			},
			errorMessage: 'Échec du renvoi du code',
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
			if (!email) {
				setErrors({ email: 'Email requis' });
				return;
			}

			verifyEmailSchema.parse({ email, code: data.code });

			const response = await authService.verifyEmail({
				email,
				code: data.code,
			});

			if (response.success && response.token && response.user) {
				login(response.token, response.user);
				toast.success(response.message);

				if (response.requiresProfileCompletion) {
					router.push(AUTH_ROUTES.COMPLETE_PROFILE);
				} else {
					router.push(AUTH_ROUTES.WELCOME);
				}
			} else {
				setErrors({ code: response.message });
			}
		},
	});

	useEffect(() => {
		const emailParam = searchParams.get('email');
		if (emailParam) {
			setEmail(emailParam);
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
					<p className="text-sm sm:text-base font-semibold text-gray-900">
						{email}
					</p>
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
								placeholder="Code à 6 chiffres"
								maxLength={6}
								className="text-center text-xl sm:text-2xl tracking-[0.5em] font-mono"
								required
							/>
							{errors.code && (
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
									{errors.code}
								</div>
							)}
						</div>

						{/* Verify Button */}
						<Button
							type="submit"
							loading={isSubmitting}
							className="w-full bg-cyan-500 hover:bg-cyan-600 text-white"
							size="lg"
							disabled={values.code.length !== 6}
						>
							{isSubmitting ? 'Vérification...' : 'Vérifier'}
						</Button>
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
								onClick={() => router.push(AUTH_ROUTES.LOGIN)}
								className="text-gray-600 hover:text-gray-500 text-sm font-medium transition-colors"
							>
								Retour à la connexion
							</button>
						</div>
					</div>

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
