'use client';
import { Features } from '@/lib/constants';
import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { useAuth } from '@/hooks/useAuth';
import { authService } from '@/lib/api/authApi';
import { loginSchema } from '@/lib/validation';
import { LoginData } from '@/types/auth';
// Migrated: Features.Auth.AUTH_UI_TEXT;
import Link from 'next/link';
import { useForm } from '@/hooks/useForm';
import {
	handleAuthError,
	showLoginSuccess,
	authToastWarning,
} from '@/lib/utils/authToast';

interface LoginFormData extends LoginData, Record<string, unknown> {}

export const LoginWithUserType: React.FC = () => {
	const router = useRouter();
	const searchParams = useSearchParams();
	const { login } = useAuth();

	const [selectedUserType, setSelectedUserType] = useState('agent');

	const { values, errors, isSubmitting, handleInputChange, handleSubmit } =
		useForm<LoginFormData>({
			initialValues: {
				email: '',
				password: '',
			},
			onSubmit: async (data) => {
				try {
					loginSchema.parse(data);

					const response = await authService.login(data);

					if (response.success && response.user) {
						// Tokens are in httpOnly cookies, just update user state
						login(response.user);
						showLoginSuccess(response.requiresProfileCompletion);

						if (response.requiresProfileCompletion) {
							router.push(
								Features.Auth.AUTH_ROUTES.COMPLETE_PROFILE,
							);
						} else {
							router.push(
								Features.Dashboard.DASHBOARD_ROUTES.BASE,
							);
						}
					} else if (response.requiresVerification) {
						authToastWarning(
							response.message ||
								Features.Auth.AUTH_TOAST_MESSAGES
									.EMAIL_NOT_VERIFIED,
						);
						router.push(
							`${Features.Auth.AUTH_ROUTES.VERIFY_EMAIL}?email=${encodeURIComponent(data.email)}`,
						);
					} else {
						handleAuthError(new Error(response.message));
					}
				} catch (error) {
					handleAuthError(error);
				}
			},
		});

	useEffect(() => {
		const typeFromUrl = searchParams.get('type');
		if (typeFromUrl) {
			setSelectedUserType(typeFromUrl);
		}
	}, [searchParams]);

	const userTypes = [
		{
			id: 'agent',
			icon: '👤',
			title: Features.Auth.AUTH_UI_TEXT.agentTitle,
		},
		{
			id: 'apporteur',
			icon: '🤝',
			title: Features.Auth.AUTH_UI_TEXT.providerTitle,
		},
		{ id: 'partenaire', icon: '📋', title: 'Accès Partenaire' },
	];

	const selectedType = userTypes.find((type) => type.id === selectedUserType);

	// Inline icons to match the screenshot style (outline, brand-colored via currentColor)
	const RoleIcon = ({
		typeId,
		className,
	}: {
		typeId: 'agent' | 'apporteur' | 'partenaire';
		className?: string;
	}) => {
		switch (typeId) {
			case 'agent':
				return (
					<svg
						className={className}
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						strokeWidth="2"
						strokeLinecap="round"
						strokeLinejoin="round"
						aria-hidden="true"
					>
						<path d="M16 7a4 4 0 11-8 0 4 4 0 018 0z" />
						<path d="M12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
					</svg>
				);
			case 'apporteur':
				return (
					<svg
						className={className}
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						strokeWidth="2"
						strokeLinecap="round"
						strokeLinejoin="round"
						aria-hidden="true"
					>
						<path d="M16 7a4 4 0 11-8 0 4 4 0 018 0z" />
						<path d="M12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
					</svg>
				);
			case 'partenaire':
				return (
					<svg
						className={className}
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						strokeWidth="2"
						strokeLinecap="round"
						strokeLinejoin="round"
						aria-hidden="true"
					>
						{/* Briefcase */}
						<path d="M8 7V6a2 2 0 012-2h4a2 2 0 012 2v1" />
						<path d="M4 7h16a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V9a2 2 0 012-2z" />
						<path d="M12 12v2" />
					</svg>
				);
			default:
				return null;
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
							Bienvenue !<br />
							Connectez-vous à<br />
							votre espace pro
						</h2>
						<p className="text-lg text-blue-100 mb-12">
							Accédez à votre tableau de bord et gérez vos
							collaborations en toute simplicité
						</p>

						{/* Benefits List */}
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
										Gestion centralisée
									</p>
									<p className="text-sm text-blue-100">
										Tous vos biens et collaborations en un
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
										Communication instantanée
									</p>
									<p className="text-sm text-blue-100">
										Chat en temps réel avec vos partenaires
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
										Sécurité garantie
									</p>
									<p className="text-sm text-blue-100">
										Vos données sont protégées et cryptées
									</p>
								</div>
							</div>
						</div>
					</div>

					{/* Quote/Testimonial */}
					<div className="pt-8 border-t border-white/20">
						<p className="text-lg italic mb-3">
							&quot;La plateforme la plus efficace pour développer
							mon réseau professionnel&quot;
						</p>
						<div className="flex items-center space-x-3">
							<div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
								<span className="text-sm font-bold">MC</span>
							</div>
							<div>
								<p className="font-semibold text-sm">
									Marie Curie
								</p>
								<p className="text-xs text-blue-100">
									Agent immobilier, Paris
								</p>
							</div>
						</div>
					</div>
				</div>
			</div>

			{/* Right Side - Form Section */}
			<div className="flex-1 flex flex-col lg:w-1/2">
				{/* Mobile Header */}
				<div className="lg:hidden bg-gradient-to-r from-cyan-600 to-blue-600 text-white p-6">
					<div className="flex items-center space-x-3">
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
				</div>

				{/* Form Container */}
				<div className="flex-1 flex items-center justify-center px-6 py-8 lg:py-12">
					<div className="w-full max-w-md">
						{/* Desktop Header */}
						<div className="hidden lg:block mb-8">
							<h2 className="text-3xl font-bold text-gray-900 mb-2">
								Content de vous revoir !
							</h2>
							<p className="text-gray-600">
								Connectez-vous pour accéder à votre espace
								professionnel
							</p>
						</div>

						{/* User Type Selector + Login Form */}
						<div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
							{/* Mobile Title */}
							<div className="lg:hidden text-center mb-6">
								<h2 className="text-2xl font-bold text-gray-900 mb-2">
									Connexion
								</h2>
								<p className="text-sm text-gray-600">
									Choisissez votre type de compte
								</p>
							</div>

							{/* Account Type Selector */}
							<div className="mb-6">
								<label className="block text-sm font-medium text-gray-700 mb-3">
									Type de compte
								</label>
								<div className="grid grid-cols-3 gap-3">
									{userTypes.map((type) => {
										const selected =
											selectedUserType === type.id;
										return (
											<button
												key={type.id}
												type="button"
												onClick={() =>
													setSelectedUserType(type.id)
												}
												className={`group flex flex-col items-center justify-center rounded-xl border-2 p-4 text-center transition-all duration-200 hover:shadow-md ${
													selected
														? 'border-brand bg-gradient-to-br from-brand-50 to-cyan-50 shadow-lg'
														: 'border-gray-200 hover:border-brand-300 bg-white'
												}`}
											>
												<div
													className={`w-10 h-10 rounded-xl flex items-center justify-center mb-2 transition-colors ${
														selected
															? 'bg-brand text-white'
															: 'bg-gray-100 text-gray-400 group-hover:bg-brand-100 group-hover:text-brand'
													}`}
												>
													<RoleIcon
														typeId={
															type.id as
																| 'agent'
																| 'apporteur'
																| 'partenaire'
														}
														className="w-5 h-5"
													/>
												</div>
												<span className="text-xs font-semibold leading-snug text-gray-900">
													{type.id === 'agent'
														? 'Agent Immobilier'
														: type.id ===
															  'apporteur'
															? "Apporteur d'affaires"
															: 'Accès Partenaire'}
												</span>
											</button>
										);
									})}
								</div>
							</div>

							{/* Login Form */}
							<form onSubmit={handleSubmit} className="space-y-5">
								<div>
									<Input
										label=""
										type="email"
										name="email"
										value={values.email}
										onChange={handleInputChange}
										error={errors.email}
										placeholder={
											Features.Auth.AUTH_UI_TEXT
												.emailPlaceholder
										}
										required
									/>
								</div>

								<div>
									<Input
										label=""
										type="password"
										name="password"
										value={values.password}
										onChange={handleInputChange}
										error={errors.password}
										placeholder={
											Features.Auth.AUTH_UI_TEXT
												.passwordPlaceholder
										}
										required
									/>
								</div>

								<div className="flex items-center justify-end">
									<Link
										className="text-sm text-brand-600 hover:text-brand-700 font-medium transition-colors"
										href={
											Features.Auth.AUTH_ROUTES
												.FORGOT_PASSWORD
										}
									>
										{
											Features.Auth.AUTH_UI_TEXT
												.forgotPassword
										}
									</Link>
								</div>

								<Button
									type="submit"
									loading={isSubmitting}
									className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white shadow-lg"
									size="lg"
								>
									{selectedUserType === 'partenaire'
										? 'Accès Partenaire'
										: `${Features.Auth.AUTH_UI_TEXT.loginButton} ${selectedType?.title.split(' ')[0]}`}
								</Button>
							</form>

							{/* Divider */}
							<div className="relative my-6">
								<div className="absolute inset-0 flex items-center">
									<div className="w-full border-t border-gray-200"></div>
								</div>
								<div className="relative flex justify-center text-sm">
									<span className="px-4 bg-white text-gray-500">
										ou
									</span>
								</div>
							</div>

							{/* Sign Up Link */}
							<div className="text-center">
								<p className="text-sm text-gray-600">
									{Features.Auth.AUTH_UI_TEXT.noAccount}{' '}
									<button
										type="button"
										onClick={() =>
											router.push(
												Features.Auth.AUTH_ROUTES
													.SIGNUP,
											)
										}
										className="text-brand-600 hover:text-brand-700 font-semibold transition-colors"
									>
										{Features.Auth.AUTH_UI_TEXT.signUpHere}
									</button>
								</p>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};
