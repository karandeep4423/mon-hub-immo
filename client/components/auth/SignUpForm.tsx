// client/components/auth/SignUpForm.tsx
'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import { Button } from '@/components/ui/Button';
import { authService } from '@/lib/api/authApi';
import { signUpSchema, type SignUpFormData } from '@/lib/validation';
import { AUTH_TEXT } from '@/lib/constants/text';
import { ZodError } from 'zod';
import { StepIndicator } from '@/components/auth/StepIndicator';
import { useMutation } from '@/hooks/useMutation';
import {
	BasicInfoStep,
	UserTypeStep,
	AgentProfessionalInfoStep,
	PasswordStep,
	ReviewStep,
} from '@/components/auth/signup-steps';

export const SignUpForm: React.FC = () => {
	const router = useRouter();
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

	const { mutate: signUpMutation, loading } = useMutation(
		async (data: SignUpFormData) => {
			const validatedData = signUpSchema.parse(data);
			return await authService.signUp({
				firstName: validatedData.firstName,
				lastName: validatedData.lastName,
				email: validatedData.email,
				phone: validatedData.phone,
				password: validatedData.password,
				confirmPassword: validatedData.confirmPassword,
				userType: validatedData.userType as '' | 'agent' | 'apporteur',
			});
		},
		{
			onSuccess: (response, variables) => {
				if (response.success) {
					toast.success(AUTH_TEXT.signupSuccess);
					router.push(
						`/auth/verify-email?email=${encodeURIComponent(variables.email)}&redirect=profile`,
					);
				} else {
					toast.error(response.message);
				}
			},
			onError: (error) => {
				if (error.errors) {
					const backendErrors: Record<string, string> = {};
					error.errors.forEach((err) => {
						backendErrors[err.field] = err.message;
					});
					setErrors(backendErrors);
				} else {
					toast.error(error.message || AUTH_TEXT.somethingWentWrong);
				}
			},
			errorMessage: AUTH_TEXT.somethingWentWrong,
		},
	);

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
			await signUpMutation(formData);
		} catch (error) {
			if (error instanceof ZodError) {
				const newErrors: Record<string, string> = {};
				error.issues.forEach((err) => {
					if (err.path.length > 0) {
						newErrors[err.path[0] as string] = err.message;
					}
				});
				setErrors(newErrors);
			}
		}
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
										<BasicInfoStep
											firstName={formData.firstName}
											lastName={formData.lastName}
											email={formData.email}
											phone={formData.phone}
											errors={errors}
											onChange={handleChange}
										/>
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
										<UserTypeStep
											userType={formData.userType}
											error={errors.userType}
											onChange={handleChange}
										/>
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
										<AgentProfessionalInfoStep
											agentType={formData.agentType || ''}
											tCard={formData.tCard || ''}
											sirenNumber={
												formData.sirenNumber || ''
											}
											rsacNumber={
												formData.rsacNumber || ''
											}
											collaboratorCertificate={
												formData.collaboratorCertificate ||
												''
											}
											identityCardFile={identityCardFile}
											errors={errors}
											onChange={handleChange}
											onFileChange={setIdentityCardFile}
										/>
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
										<PasswordStep
											password={formData.password}
											confirmPassword={
												formData.confirmPassword
											}
											showPassword={showPassword}
											showConfirmPassword={
												showConfirmPassword
											}
											errors={errors}
											onChange={handleChange}
											onTogglePassword={() =>
												setShowPassword(!showPassword)
											}
											onToggleConfirmPassword={() =>
												setShowConfirmPassword(
													!showConfirmPassword,
												)
											}
										/>
									</div>

									{/* Step 5: Review & Confirm */}
									<div
										className={`transition-all duration-500 ease-in-out ${
											currentStep === 5
												? 'opacity-100 translate-x-0'
												: 'opacity-0 translate-x-full absolute inset-0'
										}`}
									>
										<ReviewStep formData={formData} />
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
