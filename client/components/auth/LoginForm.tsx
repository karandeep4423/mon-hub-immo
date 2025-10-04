'use client';
import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { toast } from 'react-toastify';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { useAuth } from '@/hooks/useAuth';
import { authService } from '@/lib/api/authApi';
import { loginSchema } from '@/lib/validation';
import { LoginData } from '@/types/auth';
import { AUTH_TEXT } from '@/lib/constants/text';
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
		{ id: 'agent', icon: '👤', title: AUTH_TEXT.agentTitle },
		{ id: 'apporteur', icon: '�', title: AUTH_TEXT.providerTitle },
		{ id: 'partenaire', icon: '📋', title: 'Accès Partenaire' },
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
					error.response?.data?.message ||
						AUTH_TEXT.somethingWentWrong,
				);
			}
		} finally {
			setLoading(false);
		}
	};

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
		<div className="min-h-screen bg-white flex flex-col">
			{/* Header */}
			<div className="text-center pt-8 sm:pt-12 pb-6 sm:pb-8 px-4 sm:px-6">
				<h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-4 sm:mb-6">
					{AUTH_TEXT.brandName.split('hub')[0]}
					<span className="text-cyan-500">
						hub{AUTH_TEXT.brandName.split('hub')[1]}
					</span>
				</h1>
				<p className="text-sm sm:text-base text-gray-600 mb-6 sm:mb-8 max-w-md mx-auto">
					{AUTH_TEXT.collaborativeNetwork}
				</p>
				<h2 className="text-base sm:text-lg font-medium text-gray-800 mb-4 sm:mb-6">
					{AUTH_TEXT.chooseAccess}
				</h2>
			</div>

			{/* Content Container */}
			<div className="flex-1 px-4 sm:px-6 lg:px-8">
				<div className="max-w-sm sm:max-w-md mx-auto">
					{/* User Type segmented selector + Login Form */}
					<div className="mb-6 sm:mb-8">
						<div className="grid grid-cols-3 gap-2 sm:gap-3 mb-6">
							{userTypes.map((type) => {
								const selected = selectedUserType === type.id;
								return (
									<button
										key={type.id}
										type="button"
										onClick={() =>
											setSelectedUserType(type.id)
										}
										className={`flex flex-col items-center justify-center rounded-xl border p-3 sm:p-4 text-center transition-all duration-200 focus:outline-none focus:ring-2 ${
											selected
												? 'border-cyan-500 bg-cyan-50 text-cyan-700 ring-cyan-200'
												: 'border-gray-200 hover:border-gray-300 bg-white text-gray-700'
										}`}
									>
										<span className="mb-1">
											<RoleIcon
												typeId={
													type.id as
														| 'agent'
														| 'apporteur'
														| 'partenaire'
												}
												className="w-6 h-6 sm:w-7 sm:h-7"
											/>
										</span>
										<span className="text-[11px] sm:text-sm font-semibold leading-snug">
											{type.id === 'agent'
												? 'Agent\u00A0Immobilier'
												: type.id === 'apporteur'
													? 'Apporteur\u00A0d’affaires'
													: 'Accès\u00A0Partenaire'}
										</span>
									</button>
								);
							})}
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
								placeholder={AUTH_TEXT.emailPlaceholder}
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
								placeholder={AUTH_TEXT.passwordPlaceholder}
								required
								className="text-base sm:text-sm"
							/>
							<Link
								className="text-sm left hover:text-blue-600 hover:font-semibold"
								href="/auth/forgot-password"
							>
								{AUTH_TEXT.forgotPassword}
							</Link>
							<div className="pt-2">
								{/** Primary action label follows screenshot: Connexion Agent / Connexion Apporteur / Accès Partenaire **/}
								{(() => {
									// eslint-disable-next-line @typescript-eslint/no-unused-vars
									const btnLabel =
										selectedUserType === 'partenaire'
											? 'Accès Partenaire'
											: `${AUTH_TEXT.loginButton} ${selectedType?.title.split(' ')[0]}`;
									return null;
								})()}
								<Button
									type="submit"
									loading={loading}
									className="w-full bg-cyan-500 hover:bg-cyan-600 text-white transition-colors duration-200"
									size="lg"
								>
									<span className="text-sm sm:text-base">
										{selectedUserType === 'partenaire'
											? 'Accès Partenaire'
											: `${AUTH_TEXT.loginButton} ${selectedType?.title.split(' ')[0]}`}
									</span>
								</Button>
							</div>
						</form>

						{/* Sign Up Link */}
						<div className="text-center mt-8 sm:mt-10 pb-6">
							<button
								type="button"
								onClick={() => router.push('/auth/signup')}
								className="text-cyan-600 hover:text-cyan-500 font-medium text-sm sm:text-base transition-colors duration-200 underline-offset-4 hover:underline"
							>
								{AUTH_TEXT.noAccount} {AUTH_TEXT.signUpHere}
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
