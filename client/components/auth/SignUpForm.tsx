// client/components/auth/SignUpForm.tsx
'use client';

import React from 'react';
import { Button } from '@/components/ui/Button';
import { MultiStepProgress } from '@/components/auth/MultiStepProgress';
import { useSignUpForm } from '@/hooks/useSignUpForm';
import { Features } from '@/lib/constants';
import {
	BasicInfoStep,
	UserTypeStep,
	AgentProfessionalInfoStep,
	PasswordStep,
	ReviewStep,
} from '@/components/auth/signup-steps';

export const SignUpForm: React.FC = () => {
	const {
		currentStep,
		formData,
		showPassword,
		showConfirmPassword,
		identityCardFile,
		loading,
		errors,
		setShowPassword,
		setShowConfirmPassword,
		setIdentityCardFile,
		handleChange,
		handleNext,
		handlePrevious,
		handleSubmit,
	} = useSignUpForm();

	// Dynamic steps based on user type
	const getSteps = () => {
		if (formData.userType === 'apporteur') {
			return [
				{ id: 1, label: 'Informations de base' },
				{ id: 2, label: 'Rôle' },
				{ id: 4, label: 'Mot de passe' },
				{ id: 5, label: 'Révision' },
			];
		}
		return [
			{ id: 1, label: 'Informations de base' },
			{ id: 2, label: 'Rôle' },
			{ id: 3, label: 'Informations professionnelles' },
			{ id: 4, label: 'Mot de passe' },
			{ id: 5, label: 'Révision' },
		];
	};

	const steps = getSteps();

	return (
		<div className="min-h-screen bg-gray-50 flex">
			{/* Left Side - Branding Section (Hidden on Mobile) */}
			<div className="hidden lg:flex lg:w-2/5 bg-brand-gradient relative overflow-hidden">
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
							<div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center transition-all duration-200 hover:bg-white/30">
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
								<span className="text-brand-200">hubimmo</span>
							</h1>
						</div>

						<h2 className="text-4xl font-bold mb-4 leading-tight">
							Rejoignez la plateforme
							<br />
							qui connecte les
							<br />
							professionnels
						</h2>
						<p className="text-lg text-brand-100 mb-12">
							La solution collaborative pour agents immobiliers et
							apporteurs d&apos;affaires
						</p>

						{/* Features List */}
						<div className="space-y-4">
							<div className="flex items-start space-x-3">
								<div className="w-6 h-6 bg-brand-400/30 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
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
									<p className="font-semibold text-white">
										Réseau professionnel qualifié
									</p>
									<p className="text-sm text-brand-100">
										Connectez-vous avec des agents et
										apporteurs vérifiés
									</p>
								</div>
							</div>
							<div className="flex items-start space-x-3">
								<div className="w-6 h-6 bg-brand-400/30 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
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
									<p className="font-semibold text-white">
										Gestion simplifiée
									</p>
									<p className="text-sm text-brand-100">
										Gérez vos biens et collaborations en un
										seul endroit
									</p>
								</div>
							</div>
							<div className="flex items-start space-x-3">
								<div className="w-6 h-6 bg-brand-400/30 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
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
									<p className="font-semibold text-white">
										Transactions sécurisées
									</p>
									<p className="text-sm text-brand-100">
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
							<p className="text-sm text-brand-100">
								Professionnels
							</p>
						</div>
						<div>
							<p className="text-3xl font-bold">1000+</p>
							<p className="text-sm text-brand-100">
								Biens actifs
							</p>
						</div>
						<div>
							<p className="text-3xl font-bold">98%</p>
							<p className="text-sm text-brand-100">
								Satisfaction
							</p>
						</div>
					</div>
				</div>
			</div>

			{/* Right Side - Form Section */}
			<div className="flex-1 flex flex-col lg:w-3/5">
				{/* Mobile Header */}
				<div className="lg:hidden bg-brand-gradient text-white p-6">
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
							mon<span className="text-brand-200">hubimmo</span>
						</h1>
					</div>
					<p className="text-sm text-brand-100">
						Créez votre compte professionnel
					</p>
				</div>

				{/* Step Indicator */}
				<div className="bg-white border-b border-gray-200 px-6 py-4">
					<MultiStepProgress
						steps={steps}
						currentStep={currentStep}
					/>
				</div>

				{/* Form Container */}
				<div className="flex-1 px-6 py-8">
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
									href={Features.Auth.AUTH_ROUTES.LOGIN}
									className="text-brand hover:text-brand-600 font-semibold transition-colors duration-200"
								>
									Se connecter
								</a>
							</p>
						</div>

						<div className="bg-white rounded-2xl shadow-card border border-gray-200 p-8 transition-all duration-300">
							<form onSubmit={handleSubmit} noValidate>
								{/* Step Content with Slide Animation (hide horizontal overflow, allow dropdowns vertically) */}
								<div className="relative overflow-x-hidden">
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
									{/* Step 3: Agent Professional Info (Only for agents) */}
									{formData.userType === 'agent' && (
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
												agentType={
													formData.agentType || ''
												}
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
												identityCardFile={
													identityCardFile
												}
												errors={errors}
												onChange={handleChange}
												onFileChange={
													setIdentityCardFile
												}
											/>
										</div>
									)}{' '}
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
											className={`${
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
											className="flex-1"
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
										href={Features.Auth.AUTH_ROUTES.LOGIN}
										className="text-brand hover:text-brand-600 font-semibold transition-colors duration-200"
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
