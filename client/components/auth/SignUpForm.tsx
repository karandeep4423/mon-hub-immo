// client/components/auth/SignUpForm.tsx
'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { authService } from '@/lib/auth';
import { signUpSchema, type SignUpFormData } from '@/lib/validation';
import { ZodError } from 'zod';

export const SignUpForm: React.FC = () => {
	const router = useRouter();
	const [loading, setLoading] = useState(false);
	const [formData, setFormData] = useState<SignUpFormData>({
		firstName: '',
		lastName: '',
		email: '',
		phone: '',
		userType: '',
		password: '',
		confirmPassword: '',
		// Agent-specific fields
		agentType: '', // Type of agent
		tCard: '', // T card number
		sirenNumber: '', // SIREN number
		rsacNumber: '', // RSAC registration number
		collaboratorCertificate: '', // Certificate from employer
	});

	const [errors, setErrors] = useState<Record<string, string>>({});
	const [showPassword, setShowPassword] = useState(false);
	const [showConfirmPassword, setShowConfirmPassword] = useState(false);

	const handleChange = (
		e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
	) => {
		const { name, value } = e.target;

		// If userType changes and it's not 'agent', clear agent fields
		if (name === 'userType' && value !== 'agent') {
			setFormData((prev) => ({
				...prev,
				[name]: value,
				agentType: '',
				tCard: '',
				sirenNumber: '',
				rsacNumber: '',
				collaboratorCertificate: '',
			}));
		} else {
			setFormData((prev) => ({ ...prev, [name]: value }));
		}

		// Clear field error when user starts typing
		if (errors[name]) {
			setErrors((prev) => ({ ...prev, [name]: '' }));
		}

		// Clear confirm password error when password changes
		if (name === 'password' && errors.confirmPassword) {
			setErrors((prev) => ({ ...prev, confirmPassword: '' }));
		}

		// Clear confirm password error when confirm password changes and matches
		if (
			name === 'confirmPassword' &&
			errors.confirmPassword &&
			value === formData.password
		) {
			setErrors((prev) => ({ ...prev, confirmPassword: '' }));
		}
	};

	const validateForm = () => {
		try {
			signUpSchema.parse(formData);
			return {};
		} catch (error) {
			if (error instanceof ZodError) {
				const newErrors: Record<string, string> = {};
				error.issues.forEach((err) => {
					if (err.path.length > 0) {
						newErrors[err.path[0] as string] = err.message;
					}
				});
				return newErrors;
			}
			return {};
		}
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setErrors({});

		const validationErrors = validateForm();
		if (Object.keys(validationErrors).length > 0) {
			setErrors(validationErrors);
			return;
		}

		try {
			setLoading(true);

			// Parse and transform data with Zod before sending
			const validatedData = signUpSchema.parse(formData);

			const response = await authService.signUp({
				firstName: validatedData.firstName,
				lastName: validatedData.lastName,
				email: validatedData.email,
				phone: validatedData.phone,
				password: validatedData.password,
				userType: validatedData.userType as '' | 'agent' | 'apporteur',
			});

			if (response.success) {
				toast.success('Inscription réussie ! Vérifiez votre email.');
				router.push(
					`/auth/verify-email?email=${encodeURIComponent(validatedData.email)}&redirect=profile`,
				);
			} else {
				toast.error(response.message);
			}
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
		} catch (error: any) {
			if (error instanceof ZodError) {
				const newErrors: Record<string, string> = {};
				error.issues.forEach((err) => {
					if (err.path.length > 0) {
						newErrors[err.path[0] as string] = err.message;
					}
				});
				setErrors(newErrors);
			} else if (error.response?.data?.errors) {
				const backendErrors: Record<string, string> = {};
				// eslint-disable-next-line @typescript-eslint/no-explicit-any
				error.response.data.errors.forEach((err: any) => {
					const field = err.path || err.param;
					backendErrors[field] = err.msg || err.message;
				});
				setErrors(backendErrors);
			} else {
				toast.error(
					error.response?.data?.message ||
						"Erreur lors de l'inscription",
				);
			}
		} finally {
			setLoading(false);
		}
	};

	const getPasswordStrengthColor = () => {
		if (!formData.password) return 'bg-gray-200';
		if (formData.password.length < 6) return 'bg-red-400';
		if (formData.password.length < 8) return 'bg-yellow-400';
		if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password))
			return 'bg-yellow-400';
		return 'bg-green-400';
	};

	const getPasswordStrengthText = () => {
		if (!formData.password) return '';
		if (formData.password.length < 6) return 'Faible';
		if (formData.password.length < 8) return 'Moyen';
		if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password))
			return 'Moyen';
		return 'Fort';
	};

	return (
		<div className="min-h-screen bg-white flex flex-col">
			{/* Header */}
			<div className="text-center pt-12 pb-8 px-6">
				<h1 className="text-3xl font-bold text-gray-900 mb-8">
					mon<span className="text-cyan-500">hubimmo</span>
				</h1>

				<div className="space-y-2">
					<h2 className="text-xl font-semibold text-gray-800">
						Créer votre compte
					</h2>
					<p className="text-gray-600 text-sm px-4">
						Remplissez le formulaire pour rejoindre HubImmo
					</p>
				</div>
			</div>

			{/* Form */}
			<div className="flex-1 px-6 pb-8">
				<div className="max-w-sm mx-auto">
					<form onSubmit={handleSubmit} className="space-y-4">
						<Input
							label=""
							type="text"
							name="lastName"
							value={formData.lastName}
							onChange={handleChange}
							error={errors.lastName}
							placeholder="Nom *"
							required
						/>

						<Input
							label=""
							type="text"
							name="firstName"
							value={formData.firstName}
							onChange={handleChange}
							error={errors.firstName}
							placeholder="Prénom *"
							required
						/>

						<Input
							label=""
							type="email"
							name="email"
							value={formData.email}
							onChange={handleChange}
							error={errors.email}
							placeholder="E-mail *"
							required
						/>

						<Input
							label=""
							type="tel"
							name="phone"
							value={formData.phone}
							onChange={handleChange}
							error={errors.phone}
							placeholder="Téléphone * (ex: 0123456789)"
							required
						/>

						<div>
							<label
								htmlFor="userType"
								className="block text-sm font-semibold text-gray-700 mb-2"
							>
								Je suis un(e)
							</label>
							<select
								id="userType"
								name="userType"
								value={formData.userType}
								onChange={handleChange}
								className={`block w-full px-4 py-3 sm:py-2 text-base sm:text-sm border-2 border-gray-200 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 ${
									formData.userType === ''
										? 'text-gray-400'
										: 'text-gray-900'
								}`}
								required
							>
								<option
									value=""
									disabled
									className="text-gray-400"
								>
									Choisissez votre rôle
								</option>
								<option
									value="apporteur"
									className="text-gray-900"
								>
									Apporteur
								</option>
								<option value="agent" className="text-gray-900">
									Agent
								</option>
							</select>

							{errors.userType && (
								<p className="mt-1 text-sm text-red-600">
									{errors.userType}
								</p>
							)}
						</div>

						{/* Agent-specific fields */}
						{formData.userType === 'agent' && (
							<div className="space-y-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
								<h3 className="text-sm font-semibold text-blue-900 mb-3">
									Informations professionnelles d&apos;agent
								</h3>

								{/* Agent Type Selection */}
								<div>
									<label
										htmlFor="agentType"
										className="block text-sm font-semibold text-gray-700 mb-2"
									>
										Type d&apos;agent immobilier *
									</label>
									<select
										id="agentType"
										name="agentType"
										value={formData.agentType}
										onChange={handleChange}
										className={`block w-full px-4 py-3 sm:py-2 text-base sm:text-sm border-2 border-gray-200 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 ${
											formData.agentType === ''
												? 'text-gray-400'
												: 'text-gray-900'
										}`}
										required
									>
										<option
											value=""
											disabled
											className="text-gray-400"
										>
											Choisissez votre type d&apos;agent
										</option>
										<option
											value="independent"
											className="text-gray-900"
										>
											Agent immobilier indépendant
										</option>
										<option
											value="commercial"
											className="text-gray-900"
										>
											Agent commercial immobilier
										</option>
										<option
											value="employee"
											className="text-gray-900"
										>
											Négociateur VRP employé
											d&apos;agence
										</option>
									</select>
									{errors.agentType && (
										<p className="mt-1 text-sm text-red-600">
											{errors.agentType}
										</p>
									)}
								</div>

								{/* Conditional fields based on agent type */}
								{formData.agentType === 'independent' && (
									<div className="space-y-4">
										<Input
											label="Carte professionnelle (T card)"
											type="text"
											name="tCard"
											value={formData.tCard}
											onChange={handleChange}
											error={errors.tCard}
											placeholder="Numéro de carte T (optionnel)"
										/>
										<Input
											label="Numéro SIREN"
											type="text"
											name="sirenNumber"
											value={formData.sirenNumber}
											onChange={handleChange}
											error={errors.sirenNumber}
											placeholder="Numéro SIREN (optionnel)"
										/>
										<p className="text-xs text-gray-600">
											* Veuillez fournir au moins une
											carte T ou un numéro SIREN
										</p>
									</div>
								)}

								{formData.agentType === 'commercial' && (
									<div className="space-y-4">
										<Input
											label="Numéro SIREN"
											type="text"
											name="sirenNumber"
											value={formData.sirenNumber}
											onChange={handleChange}
											error={errors.sirenNumber}
											placeholder="Numéro SIREN (optionnel)"
										/>
										<Input
											label="Numéro d'inscription RSAC"
											type="text"
											name="rsacNumber"
											value={formData.rsacNumber}
											onChange={handleChange}
											error={errors.rsacNumber}
											placeholder="Numéro RSAC (optionnel)"
										/>
										<p className="text-xs text-gray-600">
											* Veuillez fournir au moins un
											numéro SIREN ou RSAC
										</p>
									</div>
								)}

								{formData.agentType === 'employee' && (
									<div>
										<Input
											label="Certificat d'autorisation de l'employeur"
											type="text"
											name="collaboratorCertificate"
											value={
												formData.collaboratorCertificate
											}
											onChange={handleChange}
											error={
												errors.collaboratorCertificate
											}
											placeholder="Référence du certificat collaborateur"
										/>
										<p className="text-xs text-gray-600 mt-1">
											* Certificat d&apos;autorisation de
											votre employeur ou certificat de
											collaborateur requis
										</p>
									</div>
								)}
							</div>
						)}

						{/* Password Field */}
						<div className="relative">
							<Input
								label=""
								type={showPassword ? 'text' : 'password'}
								name="password"
								value={formData.password}
								onChange={handleChange}
								error={errors.password}
								placeholder="Mot de passe *"
								required
							/>
							<button
								type="button"
								onClick={() => setShowPassword(!showPassword)}
								className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
							>
								{showPassword ? (
									<svg
										className="w-5 h-5"
										fill="none"
										stroke="currentColor"
										viewBox="0 0 24 24"
									>
										<path
											strokeLinecap="round"
											strokeLinejoin="round"
											strokeWidth="2"
											d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21"
										/>
									</svg>
								) : (
									<svg
										className="w-5 h-5"
										fill="none"
										stroke="currentColor"
										viewBox="0 0 24 24"
									>
										<path
											strokeLinecap="round"
											strokeLinejoin="round"
											strokeWidth="2"
											d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
										/>
										<path
											strokeLinecap="round"
											strokeLinejoin="round"
											strokeWidth="2"
											d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
										/>
									</svg>
								)}
							</button>
						</div>

						{/* Password Strength Indicator */}
						{formData.password && (
							<div className="space-y-2">
								<div className="flex items-center space-x-2">
									<div className="flex-1 bg-gray-200 rounded-full h-2">
										<div
											className={`h-2 rounded-full transition-all duration-300 ${getPasswordStrengthColor()}`}
											style={{
												width:
													formData.password.length < 6
														? '33%'
														: formData.password
																	.length < 8
															? '66%'
															: !/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(
																		formData.password,
																  )
																? '66%'
																: '100%',
											}}
										></div>
									</div>
									<span className="text-xs text-gray-600">
										{getPasswordStrengthText()}
									</span>
								</div>
								<p className="text-xs text-gray-500">
									Minimum 8 caractères, 1 majuscule, 1
									minuscule, 1 chiffre
								</p>
							</div>
						)}

						{/* Confirm Password Field */}
						<div className="relative">
							<Input
								label=""
								type={showConfirmPassword ? 'text' : 'password'}
								name="confirmPassword"
								value={formData.confirmPassword}
								onChange={handleChange}
								error={errors.confirmPassword}
								placeholder="Confirmer le mot de passe *"
								required
							/>
							<button
								type="button"
								onClick={() =>
									setShowConfirmPassword(!showConfirmPassword)
								}
								className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
							>
								{showConfirmPassword ? (
									<svg
										className="w-5 h-5"
										fill="none"
										stroke="currentColor"
										viewBox="0 0 24 24"
									>
										<path
											strokeLinecap="round"
											strokeLinejoin="round"
											strokeWidth="2"
											d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21"
										/>
									</svg>
								) : (
									<svg
										className="w-5 h-5"
										fill="none"
										stroke="currentColor"
										viewBox="0 0 24 24"
									>
										<path
											strokeLinecap="round"
											strokeLinejoin="round"
											strokeWidth="2"
											d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
										/>
										<path
											strokeLinecap="round"
											strokeLinejoin="round"
											strokeWidth="2"
											d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
										/>
									</svg>
								)}
							</button>
						</div>

						{/* Password Match Indicator */}
						{formData.confirmPassword && (
							<div className="flex items-center space-x-2">
								{formData.password ===
								formData.confirmPassword ? (
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
											Les mots de passe ne correspondent
											pas
										</span>
									</>
								)}
							</div>
						)}

						<div className="pt-4">
							<Button
								type="submit"
								loading={loading}
								className="w-full bg-cyan-500 hover:bg-cyan-600 text-white"
								size="lg"
							>
								Créer mon compte
							</Button>
						</div>
					</form>

					<div className="text-center mt-6">
						<p className="text-xs text-gray-500 px-4">
							En créant un compte, vous acceptez nos conditions
							d&apos;utilisation
						</p>
					</div>

					<div className="text-center mt-8">
						<button
							type="button"
							onClick={() => router.push('/auth/login')}
							className="text-cyan-600 hover:text-cyan-500 font-medium"
						>
							Déjà inscrit ? Se connecter
						</button>
					</div>
				</div>
			</div>
		</div>
	);
};
