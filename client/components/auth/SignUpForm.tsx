// client/components/auth/SignUpForm.tsx
'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { authService } from '@/lib/api/authApi';
import { signUpSchema, type SignUpFormData } from '@/lib/validation';
import { AUTH_TEXT } from '@/lib/constants/text';
import { ZodError } from 'zod';
import { StepIndicator } from './StepIndicator';

export const SignUpForm: React.FC = () => {
	const router = useRouter();
	const [loading, setLoading] = useState(false);
	const [currentStep, setCurrentStep] = useState(1);
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

	const steps = [
		{ id: 1, label: 'Informations' },
		{ id: 2, label: 'Rôle' },
		{ id: 3, label: 'Professionnel' },
		{ id: 4, label: 'Sécurité' },
		{ id: 5, label: 'Confirmation' },
	];

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

	const validateStep = (step: number): boolean => {
		const newErrors: Record<string, string> = {};

		switch (step) {
			case 1: // Basic Information
				if (!formData.firstName.trim())
					newErrors.firstName = 'Prénom requis';
				if (!formData.lastName.trim())
					newErrors.lastName = 'Nom requis';
				if (!formData.email.trim()) newErrors.email = 'Email requis';
				else if (!/\S+@\S+\.\S+/.test(formData.email))
					newErrors.email = 'Email invalide';
				if (!formData.phone.trim())
					newErrors.phone = 'Téléphone requis';
				else if (!/^0[1-9]\d{8}$/.test(formData.phone))
					newErrors.phone = 'Format: 0123456789';
				break;

			case 2: // User Type
				if (!formData.userType)
					newErrors.userType = 'Veuillez choisir un rôle';
				break;

			case 3: // Agent Professional Info (if agent)
				if (formData.userType === 'agent') {
					if (!formData.agentType)
						newErrors.agentType = "Type d'agent requis";

					if (formData.agentType === 'independent') {
						if (!formData.tCard && !formData.sirenNumber) {
							newErrors.tCard = 'Carte T ou SIREN requis';
						}
					} else if (formData.agentType === 'commercial') {
						if (!formData.sirenNumber && !formData.rsacNumber) {
							newErrors.sirenNumber = 'SIREN ou RSAC requis';
						}
					} else if (formData.agentType === 'employee') {
						if (!formData.collaboratorCertificate) {
							newErrors.collaboratorCertificate =
								'Certificat requis';
						}
					}
				}
				break;

			case 4: // Password
				if (!formData.password)
					newErrors.password = 'Mot de passe requis';
				else if (formData.password.length < 8)
					newErrors.password = 'Minimum 8 caractères';
				else if (
					!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)
				)
					newErrors.password = '1 majuscule, 1 minuscule, 1 chiffre';

				if (!formData.confirmPassword)
					newErrors.confirmPassword = 'Confirmation requise';
				else if (formData.password !== formData.confirmPassword)
					newErrors.confirmPassword =
						'Les mots de passe ne correspondent pas';
				break;
		}

		setErrors(newErrors);
		return Object.keys(newErrors).length === 0;
	};

	const handleNext = () => {
		if (validateStep(currentStep)) {
			// Skip step 3 if user is not an agent
			if (currentStep === 2 && formData.userType !== 'agent') {
				setCurrentStep(4);
			} else {
				setCurrentStep((prev) => Math.min(prev + 1, steps.length));
			}
		}
	};

	const handlePrevious = () => {
		// Skip step 3 if user is not an agent when going back
		if (currentStep === 4 && formData.userType !== 'agent') {
			setCurrentStep(2);
		} else {
			setCurrentStep((prev) => Math.max(prev - 1, 1));
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

		// Validate final step
		if (!validateStep(4)) {
			return;
		}

		// Validate entire form
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
				confirmPassword: validatedData.confirmPassword,
				userType: validatedData.userType as '' | 'agent' | 'apporteur',
			});

			if (response.success) {
				toast.success(AUTH_TEXT.signupSuccess);
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
						AUTH_TEXT.somethingWentWrong,
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
		<div className="min-h-screen bg-gradient-to-br from-white via-brand-50 to-brand-100 flex flex-col">
			{/* Header */}
			<div className="text-center pt-8 pb-4 px-6">
				<h1 className="text-3xl font-bold text-gray-900 mb-2">
					mon<span className="text-brand">hubimmo</span>
				</h1>
				<p className="text-sm text-gray-600">Créer votre compte</p>
			</div>

			{/* Step Indicator */}
			<StepIndicator steps={steps} currentStep={currentStep} />

			{/* Form Container */}
			<div className="flex-1 px-4 sm:px-6 pb-8">
				<div className="max-w-lg mx-auto">
					<div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8">
						<form onSubmit={handleSubmit} noValidate>
							{/* Step Content with Slide Animation */}
							<div className="relative overflow-hidden">
								{/* Step 1: Basic Information */}
								<div
									className={`transition-all duration-500 ease-in-out ${
										currentStep === 1
											? 'opacity-100 translate-x-0'
											: currentStep > 1
												? 'opacity-0 -translate-x-full absolute inset-0'
												: 'opacity-0 translate-x-full absolute inset-0'
									}`}
								>
									<div className="space-y-4">
										<div className="text-center mb-6">
											<h2 className="text-xl font-semibold text-gray-800">
												Informations personnelles
											</h2>
											<p className="text-sm text-gray-500 mt-1">
												Commençons par vos informations
												de base
											</p>
										</div>

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
									</div>
								</div>

								{/* Step 2: User Type Selection */}
								<div
									className={`transition-all duration-500 ease-in-out ${
										currentStep === 2
											? 'opacity-100 translate-x-0'
											: currentStep > 2
												? 'opacity-0 -translate-x-full absolute inset-0'
												: 'opacity-0 translate-x-full absolute inset-0'
									}`}
								>
									<div className="space-y-6">
										<div className="text-center mb-6">
											<h2 className="text-xl font-semibold text-gray-800">
												Choisissez votre rôle
											</h2>
											<p className="text-sm text-gray-500 mt-1">
												Sélectionnez votre type de
												profil
											</p>
										</div>

										<div className="space-y-3">
											<label
												className={`block p-6 border-2 rounded-xl cursor-pointer transition-all duration-200 ${
													formData.userType ===
													'apporteur'
														? 'border-brand bg-brand-50 ring-2 ring-brand'
														: 'border-gray-200 hover:border-brand-200 bg-white'
												}`}
											>
												<input
													type="radio"
													name="userType"
													value="apporteur"
													checked={
														formData.userType ===
														'apporteur'
													}
													onChange={handleChange}
													className="sr-only"
												/>
												<div className="flex items-center">
													<div
														className={`w-5 h-5 rounded-full border-2 flex items-center justify-center mr-3 ${
															formData.userType ===
															'apporteur'
																? 'border-brand'
																: 'border-gray-300'
														}`}
													>
														{formData.userType ===
															'apporteur' && (
															<div className="w-3 h-3 rounded-full bg-brand"></div>
														)}
													</div>
													<div className="flex-1">
														<p className="font-semibold text-gray-900">
															Apporteur
														</p>
														<p className="text-sm text-gray-500">
															Je souhaite apporter
															des opportunités
														</p>
													</div>
												</div>
											</label>

											<label
												className={`block p-6 border-2 rounded-xl cursor-pointer transition-all duration-200 ${
													formData.userType ===
													'agent'
														? 'border-brand bg-brand-50 ring-2 ring-brand'
														: 'border-gray-200 hover:border-brand-200 bg-white'
												}`}
											>
												<input
													type="radio"
													name="userType"
													value="agent"
													checked={
														formData.userType ===
														'agent'
													}
													onChange={handleChange}
													className="sr-only"
												/>
												<div className="flex items-center">
													<div
														className={`w-5 h-5 rounded-full border-2 flex items-center justify-center mr-3 ${
															formData.userType ===
															'agent'
																? 'border-brand'
																: 'border-gray-300'
														}`}
													>
														{formData.userType ===
															'agent' && (
															<div className="w-3 h-3 rounded-full bg-brand"></div>
														)}
													</div>
													<div className="flex-1">
														<p className="font-semibold text-gray-900">
															Agent immobilier
														</p>
														<p className="text-sm text-gray-500">
															Je suis un
															professionnel de
															l&apos;immobilier
														</p>
													</div>
												</div>
											</label>
										</div>

										{errors.userType && (
											<p className="text-sm text-red-600 text-center">
												{errors.userType}
											</p>
										)}
									</div>
								</div>

								{/* Step 3: Agent Professional Info */}
								<div
									className={`transition-all duration-500 ease-in-out ${
										currentStep === 3
											? 'opacity-100 translate-x-0'
											: currentStep > 3
												? 'opacity-0 -translate-x-full absolute inset-0'
												: 'opacity-0 translate-x-full absolute inset-0'
									}`}
								>
									<div className="space-y-4">
										<div className="text-center mb-6">
											<h2 className="text-xl font-semibold text-gray-800">
												Informations professionnelles
											</h2>
											<p className="text-sm text-gray-500 mt-1">
												Détails de votre activité
												d&apos;agent
											</p>
										</div>

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
												className={`block w-full px-4 py-3 text-base border-2 border-gray-200 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-brand focus:border-brand transition-all duration-200 ${
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
													Choisissez votre type
													d&apos;agent
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

										{formData.agentType ===
											'independent' && (
											<div className="space-y-4 p-4 bg-brand-50 rounded-lg border border-brand-200">
												<Input
													label="Carte professionnelle (T card)"
													type="text"
													name="tCard"
													value={formData.tCard}
													onChange={handleChange}
													error={errors.tCard}
													placeholder="Numéro de carte T"
												/>
												<Input
													label="Numéro SIREN"
													type="text"
													name="sirenNumber"
													value={formData.sirenNumber}
													onChange={handleChange}
													error={errors.sirenNumber}
													placeholder="Numéro SIREN"
												/>
												<p className="text-xs text-gray-600">
													* Au moins une carte T ou un
													numéro SIREN requis
												</p>
											</div>
										)}

										{formData.agentType ===
											'commercial' && (
											<div className="space-y-4 p-4 bg-brand-50 rounded-lg border border-brand-200">
												<Input
													label="Numéro SIREN"
													type="text"
													name="sirenNumber"
													value={formData.sirenNumber}
													onChange={handleChange}
													error={errors.sirenNumber}
													placeholder="Numéro SIREN"
												/>
												<Input
													label={AUTH_TEXT.rsacNumber}
													type="text"
													name="rsacNumber"
													value={formData.rsacNumber}
													onChange={handleChange}
													error={errors.rsacNumber}
													placeholder="Numéro RSAC"
												/>
												<p className="text-xs text-gray-600">
													* Au moins un numéro SIREN
													ou RSAC requis
												</p>
											</div>
										)}

										{formData.agentType === 'employee' && (
											<div className="p-4 bg-brand-50 rounded-lg border border-brand-200">
												<Input
													label="Certificat d'autorisation"
													type="text"
													name="collaboratorCertificate"
													value={
														formData.collaboratorCertificate
													}
													onChange={handleChange}
													error={
														errors.collaboratorCertificate
													}
													placeholder="Référence du certificat"
												/>
												<p className="text-xs text-gray-600 mt-1">
													* Certificat
													d&apos;autorisation de votre
													employeur requis
												</p>
											</div>
										)}
									</div>
								</div>

								{/* Step 4: Password */}
								<div
									className={`transition-all duration-500 ease-in-out ${
										currentStep === 4
											? 'opacity-100 translate-x-0'
											: currentStep > 4
												? 'opacity-0 -translate-x-full absolute inset-0'
												: 'opacity-0 translate-x-full absolute inset-0'
									}`}
								>
									<div className="space-y-4">
										<div className="text-center mb-6">
											<h2 className="text-xl font-semibold text-gray-800">
												Sécurisez votre compte
											</h2>
											<p className="text-sm text-gray-500 mt-1">
												Créez un mot de passe sécurisé
											</p>
										</div>

										<div className="relative">
											<Input
												label=""
												type={
													showPassword
														? 'text'
														: 'password'
												}
												name="password"
												value={formData.password}
												onChange={handleChange}
												error={errors.password}
												placeholder="Mot de passe *"
												required
											/>
											<button
												type="button"
												onClick={() =>
													setShowPassword(
														!showPassword,
													)
												}
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

										{formData.password && (
											<div className="space-y-2">
												<div className="flex items-center space-x-2">
													<div className="flex-1 bg-gray-200 rounded-full h-2">
														<div
															className={`h-2 rounded-full transition-all duration-300 ${getPasswordStrengthColor()}`}
															style={{
																width:
																	formData
																		.password
																		.length <
																	6
																		? '33%'
																		: formData
																					.password
																					.length <
																			  8
																			? '66%'
																			: !/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(
																						formData.password,
																				  )
																				? '66%'
																				: '100%',
															}}
														></div>
													</div>
													<span className="text-xs text-gray-600 min-w-[50px]">
														{getPasswordStrengthText()}
													</span>
												</div>
												<p className="text-xs text-gray-500">
													Minimum 8 caractères, 1
													majuscule, 1 minuscule, 1
													chiffre
												</p>
											</div>
										)}

										<div className="relative">
											<Input
												label=""
												type={
													showConfirmPassword
														? 'text'
														: 'password'
												}
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
													setShowConfirmPassword(
														!showConfirmPassword,
													)
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
								</div>

								{/* Step 5: Review & Confirm */}
								<div
									className={`transition-all duration-500 ease-in-out ${
										currentStep === 5
											? 'opacity-100 translate-x-0'
											: 'opacity-0 translate-x-full absolute inset-0'
									}`}
								>
									<div className="space-y-6">
										<div className="text-center mb-6">
											<h2 className="text-xl font-semibold text-gray-800">
												Vérifiez vos informations
											</h2>
											<p className="text-sm text-gray-500 mt-1">
												Confirmez avant de créer votre
												compte
											</p>
										</div>

										<div className="space-y-4">
											<div className="bg-gray-50 rounded-lg p-4">
												<h3 className="text-sm font-semibold text-gray-700 mb-3">
													Informations personnelles
												</h3>
												<div className="space-y-2 text-sm">
													<p>
														<span className="text-gray-600">
															Nom:
														</span>{' '}
														<span className="font-medium">
															{formData.firstName}{' '}
															{formData.lastName}
														</span>
													</p>
													<p>
														<span className="text-gray-600">
															Email:
														</span>{' '}
														<span className="font-medium">
															{formData.email}
														</span>
													</p>
													<p>
														<span className="text-gray-600">
															Téléphone:
														</span>{' '}
														<span className="font-medium">
															{formData.phone}
														</span>
													</p>
												</div>
											</div>

											<div className="bg-gray-50 rounded-lg p-4">
												<h3 className="text-sm font-semibold text-gray-700 mb-3">
													Rôle
												</h3>
												<p className="text-sm">
													<span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-brand text-white">
														{formData.userType ===
														'agent'
															? 'Agent immobilier'
															: 'Apporteur'}
													</span>
												</p>
											</div>

											{formData.userType === 'agent' &&
												formData.agentType && (
													<div className="bg-gray-50 rounded-lg p-4">
														<h3 className="text-sm font-semibold text-gray-700 mb-3">
															Informations
															professionnelles
														</h3>
														<p className="text-sm text-gray-600 mb-2">
															Type:{' '}
															<span className="font-medium text-gray-900">
																{formData.agentType ===
																'independent'
																	? 'Indépendant'
																	: formData.agentType ===
																		  'commercial'
																		? 'Commercial'
																		: 'Employé'}
															</span>
														</p>
														{formData.tCard && (
															<p className="text-sm text-gray-600">
																Carte T:{' '}
																<span className="font-medium text-gray-900">
																	{
																		formData.tCard
																	}
																</span>
															</p>
														)}
														{formData.sirenNumber && (
															<p className="text-sm text-gray-600">
																SIREN:{' '}
																<span className="font-medium text-gray-900">
																	{
																		formData.sirenNumber
																	}
																</span>
															</p>
														)}
														{formData.rsacNumber && (
															<p className="text-sm text-gray-600">
																RSAC:{' '}
																<span className="font-medium text-gray-900">
																	{
																		formData.rsacNumber
																	}
																</span>
															</p>
														)}
														{formData.collaboratorCertificate && (
															<p className="text-sm text-gray-600">
																Certificat:{' '}
																<span className="font-medium text-gray-900">
																	{
																		formData.collaboratorCertificate
																	}
																</span>
															</p>
														)}
													</div>
												)}
										</div>

										<div className="text-xs text-gray-500 text-center px-4">
											En créant un compte, vous acceptez
											nos conditions d&apos;utilisation
										</div>
									</div>
								</div>
							</div>

							{/* Navigation Buttons */}
							<div className="flex gap-3 mt-8">
								{currentStep > 1 && (
									<Button
										type="button"
										onClick={handlePrevious}
										variant="outline"
										className="flex-1"
										disabled={loading}
									>
										<svg
											className="w-5 h-5 mr-2"
											fill="none"
											stroke="currentColor"
											viewBox="0 0 24 24"
										>
											<path
												strokeLinecap="round"
												strokeLinejoin="round"
												strokeWidth="2"
												d="M15 19l-7-7 7-7"
											/>
										</svg>
										Précédent
									</Button>
								)}

								{currentStep < 5 ? (
									<Button
										type="button"
										onClick={handleNext}
										className={`bg-brand hover:bg-brand-dark text-white ${
											currentStep === 1
												? 'w-full'
												: 'flex-1'
										}`}
									>
										Suivant
										<svg
											className="w-5 h-5 ml-2"
											fill="none"
											stroke="currentColor"
											viewBox="0 0 24 24"
										>
											<path
												strokeLinecap="round"
												strokeLinejoin="round"
												strokeWidth="2"
												d="M9 5l7 7-7 7"
											/>
										</svg>
									</Button>
								) : (
									<Button
										type="submit"
										loading={loading}
										className="flex-1 bg-brand hover:bg-brand-dark text-white"
									>
										Créer mon compte
									</Button>
								)}
							</div>
						</form>
					</div>

					<div className="text-center mt-8">
						<button
							type="button"
							onClick={() => router.push('/auth/login')}
							className="text-brand hover:text-brand-dark font-medium transition-colors"
						>
							Déjà inscrit ? Se connecter
						</button>
					</div>
				</div>
			</div>
		</div>
	);
};
