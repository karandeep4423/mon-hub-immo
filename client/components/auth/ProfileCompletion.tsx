'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { CityAutocomplete } from '../ui/CityAutocomplete';
import { ProfileImageUploader } from '../ui/ProfileImageUploader';
import { useAuth } from '@/hooks/useAuth';
import { authService } from '@/lib/api/authApi';
import { useForm } from '@/hooks/useForm';
import { PageLoader } from '../ui/LoadingSpinner';

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

export const ProfileCompletion: React.FC = () => {
	const router = useRouter();
	const { user, updateUser } = useAuth();
	const [loading, setLoading] = useState(false);

	const { values, errors, isSubmitting, setFieldValue, handleSubmit } =
		useForm<ProfileCompletionFormData>({
			initialValues: {
				firstName: user?.firstName || '',
				lastName: user?.lastName || '',
				email: user?.email || '',
				phone: user?.phone || '',
				profileImage: user?.profileImage || '',
				postalCode: '',
				city: '',
				interventionRadius: 20,
				coveredCities: '',
				network: 'IAD',
				siretNumber: '',
				mandateTypes: [],
				yearsExperience: '',
				personalPitch: '',
				collaborateWithAgents: true,
				shareCommission: false,
				independentAgent: false,
				alertsEnabled: false,
				alertFrequency: 'quotidien',
				acceptTerms: false,
			},
			onSubmit: async (data) => {
				const response = await authService.completeProfile(data);
				if (response.success && response.user) {
					updateUser(response.user);
					toast.success('Profil complété avec succès !');
					router.push('/auth/welcome');
				}
			},
		});

	useEffect(() => {
		if (!user && !loading) {
			router.push('/auth/login');
			return;
		}

		// Allow access if user is logged in and is an agent (regardless of profile completion status)
		if (user && user.userType !== 'agent') {
			toast.error('Cette page est réservée aux agents');
			router.push('/dashboard');
			return;
		}

		// If profile is already completed, redirect to dashboard
		if (user && user.profileCompleted) {
			router.push('/dashboard');
			return;
		}
	}, [user, loading, router]);

	// Update the loading condition
	if (loading) {
		return <PageLoader message="Loading..." />;
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
				setFormData((prev) => ({
					...prev,
					mandateTypes: checked
						? [...prev.mandateTypes, value]
						: prev.mandateTypes.filter((t) => t !== value),
				}));
			} else {
				setFormData((prev) => ({ ...prev, [name]: checked }));
			}
		} else {
			setFormData((prev) => ({ ...prev, [name]: value }));
		}

		if (errors[name]) {
			setErrors((prev) => ({ ...prev, [name]: '' }));
		}
	};

	const handleImageUploaded = (imageUrl: string) => {
		setFormData((prev) => ({
			...prev,
			profileImage: imageUrl,
		}));
		// Clear error when image is uploaded
		if (errors.profileImage) {
			setErrors((prev) => ({
				...prev,
				profileImage: '',
			}));
		}
	};

	const handleImageRemove = () => {
		setFormData((prev) => ({
			...prev,
			profileImage: '',
		}));
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setErrors({});

		if (!formData.acceptTerms) {
			setErrors({ acceptTerms: 'Vous devez accepter les conditions' });
			return;
		}

		try {
			setLoading(true);

			const response = await authService.completeProfile({
				professionalInfo: {
					postalCode: formData.postalCode,
					city: formData.city,
					interventionRadius: Number(formData.interventionRadius),
					coveredCities: formData.coveredCities
						.split(',')
						.map((c) => c.trim()),
					network: formData.network,
					siretNumber: formData.siretNumber,
					// eslint-disable-next-line @typescript-eslint/no-explicit-any
					mandateTypes: formData.mandateTypes as any,
					yearsExperience: Number(formData.yearsExperience),
					personalPitch: formData.personalPitch,
					collaborateWithAgents: formData.collaborateWithAgents,
					shareCommission: formData.shareCommission,
					independentAgent: formData.independentAgent,
					alertsEnabled: formData.alertsEnabled,
					alertFrequency: formData.alertFrequency,
				},
				profileImage: formData.profileImage,
			});

			if (response.success && response.user) {
				// CRITICAL: Update the auth context with the complete user data
				updateUser(response.user);
				toast.success('Profil complété avec succès !');
				router.push('/dashboard');
			} else {
				toast.error(response.message);
			}
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
		} catch (error: any) {
			toast.error(
				error.response?.data?.message ||
					'Erreur lors de la création du profil',
			);
		} finally {
			setLoading(false);
		}
	};

	if (!user) {
		return <div>Loading...</div>;
	}

	return (
		<div className="min-h-screen bg-gray-50">
			<div className="max-w-2xl mx-auto px-4 py-8">
				{/* Header */}
				<div className="text-center mb-8">
					<h1 className="text-2xl font-bold text-gray-900 mb-2">
						hub<span className="text-cyan-500">immo</span>
					</h1>
					<h2 className="text-xl font-semibold text-gray-800 mb-4">
						Création du profil Agent
					</h2>
				</div>

				<form
					onSubmit={handleSubmit}
					className="bg-white rounded-xl shadow-sm p-6 space-y-8"
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
								value={formData.firstName}
								onChange={handleChange}
								error={errors.firstName}
								disabled
							/>

							<div className="md:col-start-2 flex items-center justify-center">
								<ProfileImageUploader
									currentImageUrl={formData.profileImage}
									onImageUploaded={handleImageUploaded}
									onRemove={handleImageRemove}
									disabled={loading}
									size="medium"
									uploadingText="Uploading profile image..."
								/>
							</div>

							<Input
								label="Nom"
								name="lastName"
								value={formData.lastName}
								onChange={handleChange}
								error={errors.lastName}
								disabled
							/>
						</div>

						<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
							<Input
								label="Email"
								name="email"
								value={formData.email}
								onChange={handleChange}
								error={errors.email}
								disabled
							/>

							<Input
								label="Téléphone pro"
								name="phone"
								value={formData.phone}
								onChange={handleChange}
								error={errors.phone}
								placeholder="0123456789"
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
								value={formData.city}
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
								placeholder="Rechercher une ville..."
								error={errors.city}
							/>

							<Input
								label="Code postal"
								name="postalCode"
								value={formData.postalCode}
								onChange={handleChange}
								error={errors.postalCode}
								placeholder="22100"
								disabled
							/>

							<div>
								<label className="block text-sm font-medium text-gray-700 mb-1">
									Rayon d&apos;intervention
								</label>
								<select
									name="interventionRadius"
									value={formData.interventionRadius}
									onChange={handleChange}
									className="block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
								>
									<option value={10}>10 km</option>
									<option value={20}>20 km</option>
									<option value={30}>30 km</option>
									<option value={50}>50 km</option>
									<option value={100}>100 km</option>
								</select>
							</div>
						</div>

						<div className="mt-4">
							<label className="block text-sm font-medium text-gray-700 mb-1">
								Communes couvertes
							</label>
							<textarea
								name="coveredCities"
								value={formData.coveredCities}
								onChange={handleChange}
								rows={3}
								className="block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
								placeholder="Dinan, Saint-Malo, Dinard..."
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
								<select
									name="network"
									value={formData.network}
									onChange={handleChange}
									className="block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
								>
									<option value="IAD">IAD</option>
									<option value="Century21">
										Century 21
									</option>
									<option value="Orpi">Orpi</option>
									<option value="Independant">
										Indépendant
									</option>
								</select>
							</div>

							<Input
								label="Numéro SIRET"
								name="siretNumber"
								value={formData.siretNumber}
								onChange={handleChange}
								error={errors.siretNumber}
								placeholder="12345678901234"
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
												checked={formData.mandateTypes.includes(
													mandate.id,
												)}
												onChange={handleChange}
												className="rounded border-gray-300 text-cyan-600 shadow-sm focus:border-cyan-300 focus:ring focus:ring-offset-0 focus:ring-cyan-200 focus:ring-opacity-50"
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
								value={formData.yearsExperience}
								onChange={handleChange}
								error={errors.yearsExperience}
								placeholder="5"
							/>
						</div>
					</div>

					{/* Personal Pitch */}
					<div>
						<h3 className="text-lg font-semibold text-gray-900 mb-4">
							Petite bio (pitch personnel)
						</h3>

						<textarea
							name="personalPitch"
							value={formData.personalPitch}
							onChange={handleChange}
							rows={4}
							className="block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
							placeholder="Présentez-vous en quelques mots..."
						/>

						<div className="mt-4 space-y-3">
							<label className="flex items-center">
								<input
									type="checkbox"
									name="collaborateWithAgents"
									checked={formData.collaborateWithAgents}
									onChange={handleChange}
									className="rounded border-gray-300 text-cyan-600 shadow-sm focus:border-cyan-300 focus:ring focus:ring-offset-0 focus:ring-cyan-200 focus:ring-opacity-50"
								/>
								<span className="ml-2 text-sm text-gray-700">
									Je souhaite collaborer avec d&apos;autres
									agents
								</span>
							</label>

							<label className="flex items-center">
								<input
									type="checkbox"
									name="shareCommission"
									checked={formData.shareCommission}
									onChange={handleChange}
									className="rounded border-gray-300 text-cyan-600 shadow-sm focus:border-cyan-300 focus:ring focus:ring-offset-0 focus:ring-cyan-200 focus:ring-opacity-50"
								/>
								<span className="ml-2 text-sm text-gray-700">
									Je suis ouvert à partager ma commission
								</span>
							</label>
						</div>
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
									checked={formData.independentAgent}
									onChange={handleChange}
									className="rounded border-gray-300 text-cyan-600 shadow-sm focus:border-cyan-300 focus:ring focus:ring-offset-0 focus:ring-cyan-200 focus:ring-opacity-50"
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
									checked={formData.acceptTerms}
									onChange={handleChange}
									className="rounded border-gray-300 text-cyan-600 shadow-sm focus:border-cyan-300 focus:ring focus:ring-offset-0 focus:ring-cyan-200 focus:ring-opacity-50"
								/>
								<span className="ml-2 text-sm text-cyan-600">
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
							loading={loading}
							className="w-full bg-cyan-500 hover:bg-cyan-600 text-white"
							size="lg"
						>
							Valider mon profil et accéder à Hubimmo
						</Button>
					</div>
				</form>
			</div>
		</div>
	);
};
