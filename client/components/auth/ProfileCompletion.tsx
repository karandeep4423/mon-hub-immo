'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { CityAutocomplete } from '../ui/CityAutocomplete';
import { ProfileImageUploader } from '../ui/ProfileImageUploader';
import { FileUpload } from '../ui/FileUpload';
import { RichTextEditor } from '../ui/RichTextEditor';
import { useAuth } from '@/hooks/useAuth';
import { useRequireAuth } from '@/hooks';
import { authService } from '@/lib/api/authApi';
import { useForm } from '@/hooks/useForm';
import { PageLoader } from '../ui/LoadingSpinner';
import { Features } from '@/lib/constants';
import { Select } from '@/components/ui/CustomSelect';
import {
	handleAuthError,
	showProfileCompletionSuccess,
	authToastError,
	authToastSuccess,
} from '@/lib/utils/authToast';

interface ProfileCompletionFormData extends Record<string, unknown> {
	firstName: string;
	lastName: string;
	email: string;
	phone: string;
	profileImage: string;
	postalCode: string;
	city: string;
	interventionRadius: number;
	coveredCities: string;
	network: string;
	siretNumber: string;
	mandateTypes: string[];
	yearsExperience: string;
	personalPitch: string;
	collaborateWithAgents: boolean;
	shareCommission: boolean;
	independentAgent: boolean;
	alertsEnabled: boolean;
	alertFrequency: 'quotidien' | 'hebdomadaire';
	acceptTerms: boolean;
}

interface ProfileCompletionProps {
	editMode?: boolean;
}

export const ProfileCompletion: React.FC<ProfileCompletionProps> = ({
	editMode = false,
}) => {
	const router = useRouter();
	const { user, updateUser } = useAuth();
	const [identityCardFile, setIdentityCardFile] = useState<File | null>(null);
	const [isUploadingFile, setIsUploadingFile] = useState(false);
	// Ensure authenticated users only; redirects to login if not
	useRequireAuth();

	const { values, errors, isSubmitting, setFieldValue, handleSubmit } =
		useForm<ProfileCompletionFormData>({
			initialValues: {
				firstName: user?.firstName || '',
				lastName: user?.lastName || '',
				email: user?.email || '',
				phone: user?.phone || '',
				profileImage: user?.profileImage || '',
				postalCode: user?.professionalInfo?.postalCode || '',
				city: user?.professionalInfo?.city || '',
				interventionRadius:
					user?.professionalInfo?.interventionRadius || 20,
				coveredCities:
					user?.professionalInfo?.coveredCities?.join(', ') || '',
				network: user?.professionalInfo?.network || 'IAD',
				siretNumber: user?.professionalInfo?.siretNumber || '',
				mandateTypes: user?.professionalInfo?.mandateTypes || [],
				yearsExperience:
					user?.professionalInfo?.yearsExperience?.toString() || '',
				personalPitch: user?.professionalInfo?.personalPitch || '',
				collaborateWithAgents:
					user?.professionalInfo?.collaborateWithAgents ?? true,
				shareCommission:
					user?.professionalInfo?.shareCommission ?? false,
				independentAgent:
					user?.professionalInfo?.independentAgent ?? false,
				alertsEnabled: user?.professionalInfo?.alertsEnabled ?? false,
				alertFrequency:
					user?.professionalInfo?.alertFrequency || 'quotidien',
				acceptTerms: editMode ? true : false,
			},
			onSubmit: async (data) => {
				try {
					let identityCardData;

					// Upload identity card file if provided (only in initial setup, not edit mode)
					if (identityCardFile && !editMode) {
						setIsUploadingFile(true);
						const uploadResponse =
							await authService.uploadIdentityCard(
								identityCardFile,
							);
						if (uploadResponse.success) {
							identityCardData = {
								url: uploadResponse.data.url,
								key: uploadResponse.data.key,
							};
						} else {
							authToastError(
								Features.Auth.AUTH_TOAST_MESSAGES
									.IDENTITY_CARD_UPLOAD_ERROR,
							);
						}
						setIsUploadingFile(false);
					}

					// Use updateProfile in edit mode, completeProfile in initial setup
					const response = editMode
						? await authService.updateProfile({
								firstName: data.firstName,
								lastName: data.lastName,
								phone: data.phone,
								profileImage: data.profileImage,
								professionalInfo: {
									postalCode: data.postalCode,
									city: data.city,
									interventionRadius:
										typeof data.interventionRadius ===
										'string'
											? parseInt(
													data.interventionRadius,
													10,
												)
											: data.interventionRadius,
									coveredCities: data.coveredCities
										? data.coveredCities
												.split(',')
												.map((c: string) => c.trim())
												.filter(Boolean)
										: [],
									network: data.network,
									siretNumber: data.siretNumber,
									mandateTypes: data.mandateTypes,
									yearsExperience:
										typeof data.yearsExperience === 'string'
											? parseInt(data.yearsExperience, 10)
											: data.yearsExperience,
									personalPitch: data.personalPitch,
									collaborateWithAgents:
										data.collaborateWithAgents,
									shareCommission: data.shareCommission,
									independentAgent: data.independentAgent,
									alertsEnabled: data.alertsEnabled,
									alertFrequency: data.alertFrequency,
								},
							})
						: await authService.completeProfile({
								...data,
								identityCard: identityCardData,
							});

					if (response.success && response.user) {
						updateUser(response.user);
						if (editMode) {
							authToastSuccess(
								'✅ Profil mis à jour avec succès',
							);
							router.push(
								Features.Dashboard.DASHBOARD_ROUTES.BASE,
							);
						} else {
							showProfileCompletionSuccess();
							router.push(Features.Auth.AUTH_ROUTES.WELCOME);
						}
					} else {
						handleAuthError(new Error(response.message));
					}
				} catch (error) {
					setIsUploadingFile(false);
					handleAuthError(error);
				}
			},
		});

	useEffect(() => {
		// Only proceed with role/completion checks when we have a user
		if (!user || isSubmitting) return;

		// Allow access if user is logged in and is an agent (regardless of profile completion status)
		if (user.userType !== 'agent') {
			authToastError(Features.Auth.AUTH_TOAST_MESSAGES.AGENT_ONLY_ACCESS);
			router.push(Features.Dashboard.DASHBOARD_ROUTES.BASE);
			return;
		}

		// In edit mode, allow editing even if profile is completed
		if (!editMode && user.profileCompleted) {
			router.push(Features.Dashboard.DASHBOARD_ROUTES.BASE);
			return;
		}
	}, [user, isSubmitting, router, editMode]);

	// Update the isSubmitting condition
	if (isSubmitting) {
		return <PageLoader message="isSubmitting..." />;
	}

	if (!user) {
		return null;
	}

	const handleChange = (
		e: React.ChangeEvent<
			HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
		>,
	) => {
		const { name, value, type } = e.target;

		if (type === 'checkbox') {
			const checked = (e.target as HTMLInputElement).checked;
			if (name === 'mandateTypes') {
				const currentMandates = values.mandateTypes || [];
				setFieldValue(
					'mandateTypes',
					checked
						? [...currentMandates, value]
						: currentMandates.filter((t) => t !== value),
				);
			} else {
				setFieldValue(name, checked);
			}
		} else {
			setFieldValue(name, value);
		}
	};

	const handleImageUploaded = (imageUrl: string) => {
		setFieldValue('profileImage', imageUrl);
	};

	const handleImageRemove = () => {
		setFieldValue('profileImage', '');
	};

	return (
		<div className="min-h-screen bg-gray-50">
			<div className="max-w-2xl mx-auto px-4 py-8">
				{/* Header */}
				<div className="text-center mb-8">
					<div className="inline-flex items-center justify-center w-16 h-16 bg-brand rounded-2xl mb-6 shadow-brand transition-all duration-200 hover:scale-105">
						<svg
							className="w-8 h-8 text-white"
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

					<h1 className="text-2xl font-bold text-gray-900 mb-2">
						{editMode
							? 'Modifier le profil Agent'
							: 'Création du profil Agent'}
					</h1>
					<p className="text-sm text-gray-600">
						{editMode
							? 'Mettez à jour vos informations professionnelles'
							: 'Complétez votre profil pour commencer'}
					</p>
				</div>

				<form
					onSubmit={handleSubmit}
					className="bg-white rounded-2xl shadow-card border border-gray-200 p-8 space-y-8"
				>
					{/* Personal Information */}
					<div>
						<h3 className="text-lg font-semibold text-gray-900 mb-4">
							Informations personnelles
						</h3>

						<div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
							<Input
								label="Prénom"
								name="firstName"
								value={values.firstName}
								onChange={handleChange}
								error={errors.firstName}
								disabled={!editMode}
							/>

							<div className="md:col-start-2 flex items-center justify-center">
								<ProfileImageUploader
									currentImageUrl={values.profileImage}
									onImageUploaded={handleImageUploaded}
									onRemove={handleImageRemove}
									disabled={isSubmitting}
									size="medium"
									uploadingText="Uploading profile image..."
								/>
							</div>

							<Input
								label="Nom"
								name="lastName"
								value={values.lastName}
								onChange={handleChange}
								error={errors.lastName}
								disabled={!editMode}
							/>
						</div>

						<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
							<Input
								label="Email"
								name="email"
								value={values.email}
								onChange={handleChange}
								error={errors.email}
								disabled
							/>

							<Input
								label="Téléphone pro"
								name="phone"
								value={values.phone}
								onChange={handleChange}
								error={errors.phone}
								placeholder={
									Features.Auth.AUTH_PLACEHOLDERS.PHONE
								}
							/>
						</div>
					</div>

					{/* Geographic Activity Area */}
					<div>
						<h3 className="text-lg font-semibold text-gray-900 mb-4">
							Secteur géographique d&apos;activité
						</h3>

						<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
							<CityAutocomplete
								label="Ville principale"
								value={values.city}
								onCitySelect={(cityName, postalCode) => {
									handleChange({
										target: {
											name: 'city',
											value: cityName,
										},
									} as React.ChangeEvent<HTMLInputElement>);
									handleChange({
										target: {
											name: 'postalCode',
											value: postalCode,
										},
									} as React.ChangeEvent<HTMLInputElement>);
								}}
								placeholder={
									Features.Auth.AUTH_PLACEHOLDERS.SEARCH_CITY
								}
								error={errors.city}
							/>

							<Input
								label="Code postal"
								name="postalCode"
								value={values.postalCode}
								onChange={handleChange}
								error={errors.postalCode}
								placeholder={
									Features.Auth.AUTH_PLACEHOLDERS.POSTAL_CODE
								}
								disabled
							/>

							<div>
								<label className="block text-sm font-medium text-gray-700 mb-1">
									Rayon d&apos;intervention
								</label>
								<Select
									label=""
									value={
										values.interventionRadius?.toString() ||
										''
									}
									onChange={(value) => {
										const event = {
											target: {
												name: 'interventionRadius',
												value,
											},
										} as React.ChangeEvent<HTMLSelectElement>;
										handleChange(event);
									}}
									name="interventionRadius"
									options={[
										{ value: '10', label: '10 km' },
										{ value: '20', label: '20 km' },
										{ value: '30', label: '30 km' },
										{ value: '50', label: '50 km' },
										{ value: '100', label: '100 km' },
									]}
								/>
							</div>
						</div>

						<div className="mt-4">
							<label className="block text-sm font-medium text-gray-700 mb-1">
								Communes couvertes
							</label>
							<textarea
								name="coveredCities"
								value={values.coveredCities}
								onChange={handleChange}
								rows={3}
								className="block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand"
								placeholder={
									Features.Auth.AUTH_PLACEHOLDERS.CITIES
								}
							/>
						</div>
					</div>

					{/* Professional Information */}
					<div>
						<h3 className="text-lg font-semibold text-gray-900 mb-4">
							Informations professionnelles
						</h3>

						<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
							<div>
								<label className="block text-sm font-medium text-gray-700 mb-1">
									Réseau ou statut
								</label>
								<Select
									label=""
									value={values.network}
									onChange={(value) => {
										const event = {
											target: {
												name: 'network',
												value,
											},
										} as React.ChangeEvent<HTMLSelectElement>;
										handleChange(event);
									}}
									name="network"
									options={[
										{ value: 'IAD', label: 'IAD' },
										{
											value: 'Century21',
											label: 'Century 21',
										},
										{ value: 'Orpi', label: 'Orpi' },
										{
											value: 'Independant',
											label: 'Indépendant',
										},
									]}
								/>
							</div>

							<Input
								label="Numéro SIRET"
								name="siretNumber"
								value={values.siretNumber}
								onChange={handleChange}
								error={errors.siretNumber}
								placeholder={
									Features.Auth.AUTH_PLACEHOLDERS.SIRET
								}
							/>
						</div>

						<div className="mt-4">
							<FileUpload
								label="Carte d'identité (optionnel)"
								onChange={(file) => setIdentityCardFile(file)}
								value={identityCardFile}
								helperText="Photo ou PDF de votre carte d'identité pour vérification"
							/>
						</div>

						<div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
							<div>
								<label className="block text-sm font-medium text-gray-700 mb-2">
									Type de mandats travaillés
								</label>
								<div className="space-y-2">
									{[
										{ id: 'simple', label: 'Simple' },
										{ id: 'exclusif', label: 'Exclusif' },
										{ id: 'co-mandat', label: 'Co-mandat' },
									].map((mandate) => (
										<label
											key={mandate.id}
											className="flex items-center"
										>
											<input
												type="checkbox"
												name="mandateTypes"
												value={mandate.id}
												checked={values.mandateTypes.includes(
													mandate.id,
												)}
												onChange={handleChange}
												className="rounded border-gray-300 text-brand shadow-sm focus:border-brand focus:ring focus:ring-offset-0 focus:ring-brand/20 focus:ring-opacity-50"
											/>
											<span className="ml-2 text-sm text-gray-700">
												{mandate.label}
											</span>
										</label>
									))}
								</div>
							</div>

							<Input
								label="Années d'expérience"
								name="yearsExperience"
								type="number"
								value={values.yearsExperience}
								onChange={handleChange}
								error={errors.yearsExperience}
								placeholder={
									Features.Auth.AUTH_PLACEHOLDERS
										.YEARS_EXPERIENCE
								}
							/>
						</div>
					</div>

					{/* Personal Pitch */}
					<RichTextEditor
						label="Petite bio (pitch personnel)"
						value={values.personalPitch}
						onChange={(value) =>
							handleChange({
								target: { name: 'personalPitch', value },
							} as React.ChangeEvent<HTMLInputElement>)
						}
						placeholder={Features.Auth.AUTH_PLACEHOLDERS.BIO}
						minHeight="120px"
						showCharCount
					/>

					<div className="mt-4 space-y-3">
						<label className="flex items-center">
							<input
								type="checkbox"
								name="collaborateWithAgents"
								checked={values.collaborateWithAgents}
								onChange={handleChange}
								className="rounded border-gray-300 text-brand shadow-sm focus:border-brand focus:ring focus:ring-offset-0 focus:ring-brand/20 focus:ring-opacity-50"
							/>
							<span className="ml-2 text-sm text-gray-700">
								Je souhaite collaborer avec d&apos;autres agents
							</span>
						</label>

						<label className="flex items-center">
							<input
								type="checkbox"
								name="shareCommission"
								checked={values.shareCommission}
								onChange={handleChange}
								className="rounded border-gray-300 text-brand shadow-sm focus:border-brand focus:ring focus:ring-offset-0 focus:ring-brand/20 focus:ring-opacity-50"
							/>
							<span className="ml-2 text-gray-700">
								Je suis ouvert à partager ma commission
							</span>
						</label>
					</div>

					{/* Alerts */}
					<div>
						<div className="flex items-center justify-between">
							<h3 className="text-lg font-semibold text-gray-900">
								Alertes : nouveaux biens, clients apports
							</h3>
							<span className="text-sm text-gray-500">
								quotidien
							</span>
						</div>

						<div className="mt-4 space-y-3">
							<label className="flex items-center">
								<input
									type="checkbox"
									name="independentAgent"
									checked={values.independentAgent}
									onChange={handleChange}
									className="rounded border-gray-300 text-brand shadow-sm focus:border-brand focus:ring focus:ring-offset-0 focus:ring-brand/20 focus:ring-opacity-50"
								/>
								<span className="ml-2 text-sm text-gray-700">
									Je certifie être un agent immobilier
									indépendant ou mandataire non sédentaire
								</span>
							</label>

							<label className="flex items-center">
								<input
									type="checkbox"
									name="acceptTerms"
									checked={values.acceptTerms}
									onChange={handleChange}
									className="rounded border-gray-300 text-brand shadow-sm focus:border-brand focus:ring focus:ring-offset-0 focus:ring-brand/20 focus:ring-opacity-50"
								/>
								<span className="ml-2 text-sm text-brand">
									J&apos;accepte les conditions
									d&apos;utilisation
								</span>
							</label>
							{errors.acceptTerms && (
								<p className="text-sm text-red-600">
									{errors.acceptTerms}
								</p>
							)}
						</div>
					</div>

					{/* Submit Button */}
					<div className="pt-6">
						<Button
							type="submit"
							loading={isSubmitting || isUploadingFile}
							className="w-full bg-brand hover:bg-brand-600 text-white"
							size="lg"
						>
							{isUploadingFile
								? "Upload de la carte d'identité..."
								: editMode
									? 'Enregistrer les modifications'
									: 'Valider mon profil et accéder à Hubimmo'}
						</Button>
					</div>
				</form>
			</div>
		</div>
	);
};
