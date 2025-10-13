// client/components/auth/SignUpForm.tsx
'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { FileUpload } from '../ui/FileUpload';
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
	const [identityCardFile, setIdentityCardFile] = useState<File | null>(null);

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
			setIdentityCardFile(null);
		} else if (name === 'agentType') {
			// Clear identity card when agent type changes
			setIdentityCardFile(null);
			setFormData((prev) => ({ ...prev, [name]: value }));
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
		<div className="min-h-screen bg-white flex">
			{/* Left Side - Branding and Image Section (Hidden on Mobile) */}
			<div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-cyan-600 via-blue-600 to-indigo-700 relative overflow-hidden">
				{/* Decorative Background Pattern */}
				<div className="absolute inset-0 opacity-10">
					<div className="absolute top-0 left-0 w-96 h-96 bg-white rounded-full -translate-x-1/2 -translate-y-1/2"></div>
					<div className="absolute bottom-0 right-0 w-96 h-96 bg-white rounded-full translate-x-1/2 translate-y-1/2"></div>
				</div>

				{/* Content */}
				<div className="relative z-10 flex flex-col justify-between p-12 text-white w-full">
					{/* Logo and Brand */}
					<div>
						<div className="flex items-center space-x-3 mb-8">
							<div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
								<svg
									className="w-7 h-7 text-white"
									fill="none"
									stroke="currentColor"
									viewBox="0 0 24 24"
								>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth="2"
										d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
									/>
								</svg>
							</div>
							<h1 className="text-2xl font-bold">
								mon
								<span className="text-cyan-200">hubimmo</span>
							</h1>
						</div>

						<h2 className="text-4xl font-bold mb-4 leading-tight">
							Rejoignez la plateforme
							<br />
							qui connecte les
							<br />
							professionnels
						</h2>
						<p className="text-lg text-blue-100 mb-12">
							La solution collaborative pour agents immobiliers et
							apporteurs d&apos;affaires
						</p>

						{/* Features List */}
						<div className="space-y-4">
							<div className="flex items-start space-x-3">
								<div className="w-6 h-6 bg-cyan-400/30 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
									<svg
										className="w-4 h-4"
										fill="currentColor"
										viewBox="0 0 20 20"
									>
										<path
											fillRule="evenodd"
											d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
											clipRule="evenodd"
										/>
									</svg>
								</div>
								<div>
									<p className="font-semibold">
										Réseau professionnel qualifié
									</p>
									<p className="text-sm text-blue-100">
										Connectez-vous avec des agents et
										apporteurs vérifiés
									</p>
								</div>
							</div>
							<div className="flex items-start space-x-3">
								<div className="w-6 h-6 bg-cyan-400/30 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
									<svg
										className="w-4 h-4"
										fill="currentColor"
										viewBox="0 0 20 20"
									>
										<path
											fillRule="evenodd"
											d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
											clipRule="evenodd"
										/>
									</svg>
								</div>
								<div>
									<p className="font-semibold">
										Gestion simplifiée
									</p>
									<p className="text-sm text-blue-100">
										Gérez vos biens et collaborations en un
										seul endroit
									</p>
								</div>
							</div>
							<div className="flex items-start space-x-3">
								<div className="w-6 h-6 bg-cyan-400/30 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
									<svg
										className="w-4 h-4"
										fill="currentColor"
										viewBox="0 0 20 20"
									>
										<path
											fillRule="evenodd"
											d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
											clipRule="evenodd"
										/>
									</svg>
								</div>
								<div>
									<p className="font-semibold">
										Transactions sécurisées
									</p>
									<p className="text-sm text-blue-100">
										Vos données et transactions sont
										protégées
									</p>
								</div>
							</div>
						</div>
					</div>

					{/* Stats */}
					<div className="grid grid-cols-3 gap-6 pt-8 border-t border-white/20">
						<div>
							<p className="text-3xl font-bold">500+</p>
							<p className="text-sm text-blue-100">
								Professionnels
							</p>
						</div>
						<div>
							<p className="text-3xl font-bold">1000+</p>
							<p className="text-sm text-blue-100">
								Biens actifs
							</p>
						</div>
						<div>
							<p className="text-3xl font-bold">98%</p>
							<p className="text-sm text-blue-100">
								Satisfaction
							</p>
						</div>
					</div>
				</div>
			</div>

			{/* Right Side - Form Section */}
			<div className="flex-1 flex flex-col lg:w-1/2">
				{/* Mobile Header */}
				<div className="lg:hidden bg-gradient-to-r from-cyan-600 to-blue-600 text-white p-6">
					<div className="flex items-center space-x-3 mb-4">
						<div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center">
							<svg
								className="w-6 h-6 text-white"
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24"
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth="2"
									d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
								/>
							</svg>
						</div>
						<h1 className="text-xl font-bold">
							mon<span className="text-cyan-200">hubimmo</span>
						</h1>
					</div>
					<p className="text-sm text-blue-100">
						Créez votre compte professionnel
					</p>
				</div>

				{/* Step Indicator */}
				<div className="bg-gray-50 px-6 py-4">
					<StepIndicator steps={steps} currentStep={currentStep} />
				</div>

				{/* Form Container */}
				<div className="flex-1 overflow-y-auto px-6 py-8">
					<div className="max-w-lg mx-auto">
						{/* Desktop Header */}
						<div className="hidden lg:block mb-8">
							<h2 className="text-3xl font-bold text-gray-900 mb-2">
								Créer votre compte
							</h2>
							<p className="text-gray-600">
								Rejoignez notre communauté de professionnels de
								l&apos;immobilier
							</p>
							<p className="text-sm text-gray-500 mt-4">
								Vous avez déjà un compte ?{' '}
								<a
									href="/auth/login"
									className="text-brand-600 hover:text-brand-700 font-semibold"
								>
									Se connecter
								</a>
							</p>
						</div>

						<div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
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
										<div className="space-y-5">
											<div className="text-center mb-8">
												<div className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-2xl mb-4">
													<svg
														className="w-7 h-7 text-white"
														fill="none"
														stroke="currentColor"
														viewBox="0 0 24 24"
													>
														<path
															strokeLinecap="round"
															strokeLinejoin="round"
															strokeWidth="2"
															d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
														/>
													</svg>
												</div>
												<h2 className="text-2xl font-bold text-gray-900 mb-2">
													Informations personnelles
												</h2>
												<p className="text-sm text-gray-600">
													Commençons par vos
													informations de base
												</p>
											</div>

											<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
											</div>

											<Input
												label=""
												type="email"
												name="email"
												value={formData.email}
												onChange={handleChange}
												error={errors.email}
												placeholder="E-mail professionnel *"
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
											<div className="text-center mb-8">
												<div className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-2xl mb-4">
													<svg
														className="w-7 h-7 text-white"
														fill="none"
														stroke="currentColor"
														viewBox="0 0 24 24"
													>
														<path
															strokeLinecap="round"
															strokeLinejoin="round"
															strokeWidth="2"
															d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
														/>
													</svg>
												</div>
												<h2 className="text-2xl font-bold text-gray-900 mb-2">
													Choisissez votre rôle
												</h2>
												<p className="text-sm text-gray-600">
													Sélectionnez votre type de
													profil professionnel
												</p>
											</div>

											<div className="space-y-4">
												<label
													className={`group block p-6 border-2 rounded-xl cursor-pointer transition-all duration-200 hover:shadow-md ${
														formData.userType ===
														'apporteur'
															? 'border-brand bg-gradient-to-br from-brand-50 to-cyan-50 shadow-lg'
															: 'border-gray-200 hover:border-brand-300 bg-white'
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
													<div className="flex items-start">
														<div
															className={`flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center mr-4 transition-colors ${
																formData.userType ===
																'apporteur'
																	? 'bg-brand text-white'
																	: 'bg-gray-100 text-gray-400 group-hover:bg-brand-100 group-hover:text-brand'
															}`}
														>
															<svg
																className="w-6 h-6"
																fill="none"
																stroke="currentColor"
																viewBox="0 0 24 24"
															>
																<path
																	strokeLinecap="round"
																	strokeLinejoin="round"
																	strokeWidth="2"
																	d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
																/>
															</svg>
														</div>
														<div className="flex-1">
															<p className="text-lg font-bold text-gray-900 mb-1">
																Apporteur
																d&apos;affaires
															</p>
															<p className="text-sm text-gray-600">
																Je souhaite
																proposer des
																opportunités
																immobilières et
																collaborer avec
																des agents
															</p>
														</div>
														{formData.userType ===
															'apporteur' && (
															<svg
																className="w-6 h-6 text-brand flex-shrink-0 ml-2"
																fill="currentColor"
																viewBox="0 0 20 20"
															>
																<path
																	fillRule="evenodd"
																	d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
																	clipRule="evenodd"
																/>
															</svg>
														)}
													</div>
												</label>

												<label
													className={`group block p-6 border-2 rounded-xl cursor-pointer transition-all duration-200 hover:shadow-md ${
														formData.userType ===
														'agent'
															? 'border-brand bg-gradient-to-br from-brand-50 to-cyan-50 shadow-lg'
															: 'border-gray-200 hover:border-brand-300 bg-white'
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
													<div className="flex items-start">
														<div
															className={`flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center mr-4 transition-colors ${
																formData.userType ===
																'agent'
																	? 'bg-brand text-white'
																	: 'bg-gray-100 text-gray-400 group-hover:bg-brand-100 group-hover:text-brand'
															}`}
														>
															<svg
																className="w-6 h-6"
																fill="none"
																stroke="currentColor"
																viewBox="0 0 24 24"
															>
																<path
																	strokeLinecap="round"
																	strokeLinejoin="round"
																	strokeWidth="2"
																	d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
																/>
															</svg>
														</div>
														<div className="flex-1">
															<p className="text-lg font-bold text-gray-900 mb-1">
																Agent immobilier
															</p>
															<p className="text-sm text-gray-600">
																Je suis un
																professionnel de
																l&apos;immobilier
																et je souhaite
																développer mon
																réseau
															</p>
														</div>
														{formData.userType ===
															'agent' && (
															<svg
																className="w-6 h-6 text-brand flex-shrink-0 ml-2"
																fill="currentColor"
																viewBox="0 0 20 20"
															>
																<path
																	fillRule="evenodd"
																	d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
																	clipRule="evenodd"
																/>
															</svg>
														)}
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
													Informations
													professionnelles
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
													Type d&apos;agent immobilier
													*
												</label>
												<select
													id="agentType"
													name="agentType"
													value={formData.agentType}
													onChange={handleChange}
													className={`block w-full px-4 py-3 text-base border-2 border-gray-200 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-brand focus:border-brand transition-all duration-200 ${
														formData.agentType ===
														''
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
														Agent immobilier
														indépendant
													</option>
													<option
														value="commercial"
														className="text-gray-900"
													>
														Agent commercial
														immobilier
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
														value={
															formData.sirenNumber
														}
														onChange={handleChange}
														error={
															errors.sirenNumber
														}
														placeholder="Numéro SIREN"
													/>
													<FileUpload
														label="Carte d'identité"
														onChange={
															setIdentityCardFile
														}
														value={identityCardFile}
														helperText="Photo ou PDF de votre carte d'identité (optionnel)"
													/>
													<p className="text-xs text-gray-600">
														* Au moins une carte T
														ou un numéro SIREN
														requis
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
														value={
															formData.sirenNumber
														}
														onChange={handleChange}
														error={
															errors.sirenNumber
														}
														placeholder="Numéro SIREN"
													/>
													<Input
														label={
															AUTH_TEXT.rsacNumber
														}
														type="text"
														name="rsacNumber"
														value={
															formData.rsacNumber
														}
														onChange={handleChange}
														error={
															errors.rsacNumber
														}
														placeholder="Numéro RSAC"
													/>
													<FileUpload
														label="Carte d'identité"
														onChange={
															setIdentityCardFile
														}
														value={identityCardFile}
														helperText="Photo ou PDF de votre carte d'identité (optionnel)"
													/>
													<p className="text-xs text-gray-600">
														* Au moins un numéro
														SIREN ou RSAC requis
													</p>
												</div>
											)}

											{formData.agentType ===
												'employee' && (
												<div className="space-y-4 p-4 bg-brand-50 rounded-lg border border-brand-200">
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
													<FileUpload
														label="Carte d'identité"
														onChange={
															setIdentityCardFile
														}
														value={identityCardFile}
														helperText="Photo ou PDF de votre carte d'identité (optionnel)"
													/>
													<p className="text-xs text-gray-600">
														* Certificat
														d&apos;autorisation de
														votre employeur requis
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
													Créez un mot de passe
													sécurisé
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
														majuscule, 1 minuscule,
														1 chiffre
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
													value={
														formData.confirmPassword
													}
													onChange={handleChange}
													error={
														errors.confirmPassword
													}
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
																Les mots de
																passe
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
																Les mots de
																passe ne
																correspondent
																pas
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
													Confirmez avant de créer
													votre compte
												</p>
											</div>

											<div className="space-y-4">
												<div className="bg-gray-50 rounded-lg p-4">
													<h3 className="text-sm font-semibold text-gray-700 mb-3">
														Informations
														personnelles
													</h3>
													<div className="space-y-2 text-sm">
														<p>
															<span className="text-gray-600">
																Nom:
															</span>{' '}
															<span className="font-medium">
																{
																	formData.firstName
																}{' '}
																{
																	formData.lastName
																}
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

												{formData.userType ===
													'agent' &&
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
												En créant un compte, vous
												acceptez nos conditions
												d&apos;utilisation
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

							{/* Mobile Login Link */}
							<div className="lg:hidden text-center mt-6">
								<p className="text-sm text-gray-600">
									Vous avez déjà un compte ?{' '}
									<a
										href="/auth/login"
										className="text-brand-600 hover:text-brand-700 font-semibold"
									>
										Se connecter
									</a>
								</p>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};
