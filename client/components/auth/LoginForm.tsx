'use client';
import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { toast } from 'react-toastify';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { useAuth } from '@/hooks/useAuth';
import { authService } from '@/lib/auth';
import { loginSchema } from '@/lib/validation';
import { LoginData } from '@/types/auth';
import Link from 'next/link';
export const LoginWithUserType: React.FC = () => {
	const router = useRouter();
	const searchParams = useSearchParams();
	const { login } = useAuth();

	const [selectedUserType, setSelectedUserType] = useState('agent');
	const [loading, setLoading] = useState(false);
	const [formData, setFormData] = useState<LoginData>({
		email: '',
		password: '',
	});
	const [errors, setErrors] = useState<Record<string, string>>({});

	useEffect(() => {
		const typeFromUrl = searchParams.get('type');
		if (typeFromUrl) {
			setSelectedUserType(typeFromUrl);
		}
	}, [searchParams]);

	const userTypes = [
		{ id: 'agent', icon: '👤', title: 'Agent Immobilier' },
		{ id: 'apporteur', icon: '💝', title: "Apporteur d'affaires" },
		// { id: 'partenaire', icon: '🏢', title: 'Accès Partenaire' },
	];

	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const { name, value } = e.target;
		setFormData((prev) => ({ ...prev, [name]: value }));
		if (errors[name]) {
			setErrors((prev) => ({ ...prev, [name]: '' }));
		}
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setErrors({});

		try {
			loginSchema.parse(formData);
			setLoading(true);

			const response = await authService.login({
				...formData,
			});

			if (response.success && response.token && response.user) {
				login(response.token, response.user);
				toast.success(response.message);

				// Check if profile completion is required
				if (response.requiresProfileCompletion) {
					router.push('/auth/complete-profile');
				} else {
					router.push('/dashboard');
				}
			} else if (response.requiresVerification) {
				toast.warning(response.message);
				router.push(
					`/auth/verify-email?email=${encodeURIComponent(formData.email)}`,
				);
			} else {
				toast.error(response.message);
			}
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
		} catch (error: any) {
			if (error.errors) {
				const validationErrors: Record<string, string> = {};
				// eslint-disable-next-line @typescript-eslint/no-explicit-any
				error.errors.forEach((err: any) => {
					validationErrors[err.path[0]] = err.message;
				});
				setErrors(validationErrors);
			} else {
				toast.error(
					error.response?.data?.message || 'Something went wrong',
				);
			}
		} finally {
			setLoading(false);
		}
	};

	const selectedType = userTypes.find((type) => type.id === selectedUserType);

	return (
		<div className="min-h-screen bg-white flex flex-col">
			{/* Header */}
			<div className="text-center pt-8 sm:pt-12 pb-6 sm:pb-8 px-4 sm:px-6">
				<h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-4 sm:mb-6">
					mon<span className="text-cyan-500">hubimmo</span>
				</h1>
				<p className="text-sm sm:text-base text-gray-600 mb-6 sm:mb-8 max-w-md mx-auto">
					Le 1er réseau social immobilier collaboratif
				</p>
				<h2 className="text-base sm:text-lg font-medium text-gray-800 mb-4 sm:mb-6">
					Choisissez votre accès:
				</h2>
			</div>

			{/* Content Container */}
			<div className="flex-1 px-4 sm:px-6 lg:px-8">
				<div className="max-w-sm sm:max-w-md mx-auto">
					{/* User Type Selection */}
					<div className="mb-6 sm:mb-8">
						<div className="bg-gray-50 rounded-xl p-4 mb-6 transition-all duration-200">
							<div className="flex items-center justify-center sm:justify-start space-x-3">
								<div className="text-2xl sm:text-3xl">
									{selectedType?.icon}
								</div>
								<span className="font-semibold text-gray-900 text-sm sm:text-base text-center sm:text-left">
									{selectedType?.title}
								</span>
							</div>
						</div>

						{/* Login Form */}
						<form
							onSubmit={handleSubmit}
							className="space-y-4 sm:space-y-5"
						>
							<Input
								label=""
								type="email"
								name="email"
								value={formData.email}
								onChange={handleChange}
								error={errors.email}
								placeholder="E-mail"
								required
								className="text-base sm:text-sm"
							/>

							<Input
								label=""
								type="password"
								name="password"
								value={formData.password}
								onChange={handleChange}
								error={errors.password}
								placeholder="Mot de passe"
								required
								className="text-base sm:text-sm"
							/>
							<Link
								className="text-sm left hover:text-blue-600 hover:font-semibold"
								href="/auth/forgot-password"
							>
								Mot de passe oublié ?
							</Link>
							<div className="pt-2">
								<Button
									type="submit"
									loading={loading}
									className="w-full bg-cyan-500 hover:bg-cyan-600 text-white transition-colors duration-200"
									size="lg"
								>
									<span className="text-sm sm:text-base">
										Connexion{' '}
										{selectedType?.title.split(' ')[0]}
									</span>
								</Button>
							</div>
						</form>

						{/* Alternative Access Types */}
						<div className="mt-6 sm:mt-8 space-y-3">
							<p className="text-xs sm:text-sm text-gray-500 text-center mb-4">
								Ou choisir un autre type d&apos;accès:
							</p>
							{userTypes
								.filter((type) => type.id !== selectedUserType)
								.map((type) => (
									<button
										key={type.id}
										onClick={() =>
											setSelectedUserType(type.id)
										}
										className="w-full bg-white border border-gray-300 rounded-xl p-3 sm:p-4 text-left hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 active:scale-[0.98]"
									>
										<div className="flex items-center justify-center sm:justify-start space-x-3">
											<div className="text-lg sm:text-xl">
												{type.icon}
											</div>
											<span className="font-medium text-gray-700 text-sm sm:text-base">
												{type.title}
											</span>
										</div>
									</button>
								))}
						</div>

						{/* Sign Up Link */}
						<div className="text-center mt-8 sm:mt-10 pb-6">
							<button
								type="button"
								onClick={() =>
									router.push(
										"/auth/signup",
									)
								}
								className="text-cyan-600 hover:text-cyan-500 font-medium text-sm sm:text-base transition-colors duration-200 underline-offset-4 hover:underline"
							>
								Pas encore inscrit ? Créer un compte
							</button>
						</div>
					</div>
				</div>
			</div>

			{/* Bottom Safe Area for Mobile */}
			<div className="pb-safe-area-inset-bottom sm:pb-0"></div>
		</div>
	);
};
