'use client';

import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import searchAdApi from '@/lib/api/searchAdApi';
import { useAuth } from '@/hooks/useAuth';
import { SearchAd } from '@/types/searchAd';
import { SearchAdClientInfoForm } from './SearchAdClientInfoForm';
import { logger } from '@/lib/utils/logger';
import {
	BasicInfoSection,
	PropertyCriteriaSection,
	LocationSection,
	BudgetSection,
	PropertyDetailsSection,
	PrioritiesSection,
	BadgesSection,
} from './form-sections';

interface FormData {
	title: string;
	description: string;
	propertyTypes: string[];
	propertyState: string[];
	projectType: string;
	cities: string;
	maxDistance?: number;
	openToOtherAreas: boolean;
	budgetMax: number;
	budgetIdeal?: number;
	financingType: string;
	isSaleInProgress: boolean;
	hasBankApproval: boolean;
	minSurface?: number;
	minRooms?: number;
	minBedrooms?: number;
	hasExterior: boolean;
	hasParking: boolean;
	acceptedFloors?: string;
	desiredState: string[];
	mustHaves: string[];
	niceToHaves: string[];
	dealBreakers: string[];
	status: 'active' | 'paused' | 'fulfilled' | 'sold' | 'rented' | 'archived';
	badges: string[];
	clientInfo?: SearchAd['clientInfo'];
}

interface EditSearchAdFormProps {
	id: string;
}

export const EditSearchAdForm: React.FC<EditSearchAdFormProps> = ({ id }) => {
	const router = useRouter();
	const { user } = useAuth();
	const [isLoading, setIsLoading] = useState(false);
	const [isLoadingAd, setIsLoadingAd] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [searchAd, setSearchAd] = useState<SearchAd | null>(null);
	const [formData, setFormData] = useState<FormData>({
		title: '',
		description: '',
		propertyTypes: [],
		propertyState: [],
		projectType: '',
		cities: '',
		maxDistance: undefined,
		openToOtherAreas: false,
		budgetMax: 0,
		budgetIdeal: undefined,
		financingType: '',
		isSaleInProgress: false,
		hasBankApproval: false,
		minSurface: undefined,
		minRooms: undefined,
		minBedrooms: undefined,
		hasExterior: false,
		hasParking: false,
		acceptedFloors: undefined,
		desiredState: [],
		mustHaves: [],
		niceToHaves: [],
		dealBreakers: [],
		status: 'active',
		badges: [],
		clientInfo: {},
	});

	useEffect(() => {
		const fetchSearchAd = async () => {
			try {
				setIsLoadingAd(true);
				const ad = await searchAdApi.getSearchAdById(id);
				setSearchAd(ad);

				// Populate form with existing data
				setFormData({
					title: ad.title,
					description: ad.description || '',
					propertyTypes: ad.propertyTypes,
					propertyState: ad.propertyState || [],
					projectType: ad.projectType || '',
					cities: ad.location.cities.join(', '),
					maxDistance: ad.location.maxDistance,
					openToOtherAreas: ad.location.openToOtherAreas || false,
					budgetMax: ad.budget?.max || 0,
					budgetIdeal: ad.budget?.ideal,
					financingType: ad.budget?.financingType || '',
					isSaleInProgress: ad.budget?.isSaleInProgress || false,
					hasBankApproval: ad.budget?.hasBankApproval || false,
					minSurface: ad.minSurface,
					minRooms: ad.minRooms,
					minBedrooms: ad.minBedrooms,
					hasExterior: ad.hasExterior || false,
					hasParking: ad.hasParking || false,
					acceptedFloors: ad.acceptedFloors,
					desiredState: ad.desiredState || [],
					mustHaves: ad.priorities?.mustHaves || [],
					niceToHaves: ad.priorities?.niceToHaves || [],
					dealBreakers: ad.priorities?.dealBreakers || [],
					status: ad.status,
					badges: ad.badges || [],
					clientInfo: ad.clientInfo || {},
				});
			} catch (err) {
				setError("Impossible de charger l'annonce.");
				logger.error(err);
			} finally {
				setIsLoadingAd(false);
			}
		};

		fetchSearchAd();
	}, [id]);

	const handleInputChange = (
		e: React.ChangeEvent<
			HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
		>,
	) => {
		const { name, value, type } = e.target;
		if (type === 'checkbox') {
			const checked = (e.target as HTMLInputElement).checked;
			setFormData((prev) => ({ ...prev, [name]: checked }));
		} else if (type === 'number') {
			setFormData((prev) => ({
				...prev,
				[name]: value ? parseInt(value) : undefined,
			}));
		} else {
			setFormData((prev) => ({ ...prev, [name]: value }));
		}
	};

	const handleArrayChange = (
		value: string,
		checked: boolean,
		field: keyof Pick<
			FormData,
			| 'propertyTypes'
			| 'propertyState'
			| 'desiredState'
			| 'mustHaves'
			| 'niceToHaves'
			| 'dealBreakers'
			| 'badges'
		>,
	) => {
		setFormData((prev) => ({
			...prev,
			[field]: checked
				? [...prev[field], value]
				: prev[field].filter((item) => item !== value),
		}));
	};

	const validateForm = (): string | null => {
		if (!formData.title || formData.title.length < 5) {
			return 'Le titre doit contenir au moins 5 caractères.';
		}
		if (!formData.description || formData.description.length < 10) {
			return 'La description doit contenir au moins 10 caractères.';
		}
		if (formData.propertyTypes.length === 0) {
			return 'Veuillez sélectionner au moins un type de bien.';
		}
		if (!formData.cities || formData.cities.length < 2) {
			return 'La localisation est requise.';
		}
		if (formData.budgetMax <= 0) {
			return 'Le budget maximum doit être positif.';
		}
		return null;
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		if (!user) {
			setError('Vous devez être connecté pour modifier une annonce.');
			return;
		}

		if (!searchAd) {
			setError('Annonce non trouvée.');
			return;
		}

		const validationError = validateForm();
		if (validationError) {
			setError(validationError);
			return;
		}

		setIsLoading(true);
		setError(null);

		try {
			const adData = {
				...formData,
				authorId: user._id,
				status: formData.status,
				authorType: user.userType as 'agent' | 'apporteur',
				// Transform to expected API format
				location: {
					cities: formData.cities
						.split(',')
						.map((city) => city.trim()),
					maxDistance: formData.maxDistance,
					openToOtherAreas: formData.openToOtherAreas,
				},
				propertyTypes: formData.propertyTypes as (
					| 'house'
					| 'apartment'
					| 'land'
					| 'building'
					| 'commercial'
				)[],
				budget: {
					max: formData.budgetMax,
					ideal: formData.budgetIdeal,
					financingType: formData.financingType,
					isSaleInProgress: formData.isSaleInProgress,
					hasBankApproval: formData.hasBankApproval,
				},
				priorities: {
					mustHaves: formData.mustHaves,
					niceToHaves: formData.niceToHaves,
					dealBreakers: formData.dealBreakers,
				},
				badges: formData.badges,
				clientInfo: formData.clientInfo,
			};

			await searchAdApi.updateSearchAd(
				id,
				adData as Parameters<typeof searchAdApi.updateSearchAd>[1],
			);
			router.push('/dashboard');
		} catch (err) {
			setError(
				"Une erreur est survenue lors de la modification de l'annonce.",
			);
			logger.error(err);
		} finally {
			setIsLoading(false);
		}
	};

	if (isLoadingAd) {
		return <div>Chargement de l&apos;annonce...</div>;
	}

	if (error && !searchAd) {
		return <div className="text-red-500">{error}</div>;
	}

	return (
		<div className="w-full">
			<div className="mb-8 text-center">
				<h1 className="text-3xl font-bold text-gray-900 mb-2">
					Modifier votre annonce de recherche
				</h1>
				<p className="text-gray-600">
					Mettez à jour les critères de recherche pour votre client
				</p>
			</div>

			<form onSubmit={handleSubmit} className="w-full space-y-6">
				<div className="grid grid-cols-1 lg:grid-cols-2  gap-6">
					{/* Basic Information */}
					<BasicInfoSection
						title={formData.title}
						description={formData.description}
						onTitleChange={(value) =>
							setFormData((prev) => ({ ...prev, title: value }))
						}
						onDescriptionChange={(value) =>
							setFormData((prev) => ({
								...prev,
								description: value,
							}))
						}
					/>

					{/* Property Search Criteria */}
					<PropertyCriteriaSection
						propertyTypes={formData.propertyTypes}
						propertyState={formData.propertyState}
						projectType={formData.projectType}
						onPropertyTypesChange={(type, checked) =>
							handleArrayChange(type, checked, 'propertyTypes')
						}
						onPropertyStateChange={(state, checked) =>
							handleArrayChange(state, checked, 'propertyState')
						}
						onProjectTypeChange={(value) =>
							setFormData((prev) => ({
								...prev,
								projectType: value,
							}))
						}
					/>

					{/* Location */}
					<LocationSection
						cities={formData.cities}
						maxDistance={formData.maxDistance}
						openToOtherAreas={formData.openToOtherAreas}
						onCitiesChange={(value) =>
							setFormData((prev) => ({ ...prev, cities: value }))
						}
						onMaxDistanceChange={(value) =>
							setFormData((prev) => ({
								...prev,
								maxDistance: value,
							}))
						}
						onOpenToOtherAreasChange={(value) =>
							setFormData((prev) => ({
								...prev,
								openToOtherAreas: value,
							}))
						}
					/>

					{/* Budget & Financing */}
					<BudgetSection
						budgetMax={formData.budgetMax}
						budgetIdeal={formData.budgetIdeal}
						financingType={formData.financingType}
						isSaleInProgress={formData.isSaleInProgress}
						hasBankApproval={formData.hasBankApproval}
						onBudgetMaxChange={(value) =>
							setFormData((prev) => ({
								...prev,
								budgetMax: value,
							}))
						}
						onBudgetIdealChange={(value) =>
							setFormData((prev) => ({
								...prev,
								budgetIdeal: value,
							}))
						}
						onFinancingTypeChange={(value) =>
							setFormData((prev) => ({
								...prev,
								financingType: value,
							}))
						}
						onSaleInProgressChange={(value) =>
							setFormData((prev) => ({
								...prev,
								isSaleInProgress: value,
							}))
						}
						onBankApprovalChange={(value) =>
							setFormData((prev) => ({
								...prev,
								hasBankApproval: value,
							}))
						}
					/>

					{/* Property Characteristics */}
					<PropertyDetailsSection
						minRooms={formData.minRooms}
						minBedrooms={formData.minBedrooms}
						minSurface={formData.minSurface}
						hasExterior={formData.hasExterior}
						hasParking={formData.hasParking}
						acceptedFloors={formData.acceptedFloors}
						desiredState={formData.desiredState}
						onMinRoomsChange={(value) =>
							setFormData((prev) => ({
								...prev,
								minRooms: value,
							}))
						}
						onMinBedroomsChange={(value) =>
							setFormData((prev) => ({
								...prev,
								minBedrooms: value,
							}))
						}
						onMinSurfaceChange={(value) =>
							setFormData((prev) => ({
								...prev,
								minSurface: value,
							}))
						}
						onHasExteriorChange={(value) =>
							setFormData((prev) => ({
								...prev,
								hasExterior: value,
							}))
						}
						onHasParkingChange={(value) =>
							setFormData((prev) => ({
								...prev,
								hasParking: value,
							}))
						}
						onAcceptedFloorsChange={(value) =>
							setFormData((prev) => ({
								...prev,
								acceptedFloors: value,
							}))
						}
						onDesiredStateChange={(state, checked) =>
							handleArrayChange(state, checked, 'desiredState')
						}
					/>

					{/* Personal Priorities */}
					<PrioritiesSection
						mustHaves={formData.mustHaves}
						niceToHaves={formData.niceToHaves}
						dealBreakers={formData.dealBreakers}
						onMustHavesChange={(priority, checked) =>
							handleArrayChange(priority, checked, 'mustHaves')
						}
						onNiceToHavesChange={(priority, checked) =>
							handleArrayChange(priority, checked, 'niceToHaves')
						}
						onDealBreakersChange={(priority, checked) =>
							handleArrayChange(priority, checked, 'dealBreakers')
						}
					/>
				</div>

				{/* Badges Section - Full width */}
				<BadgesSection
					badges={formData.badges}
					onBadgesChange={(badge, checked) =>
						handleArrayChange(badge, checked, 'badges')
					}
				/>

				{/* Client Information - Full width */}
				<div className="bg-white p-6 rounded-lg shadow-sm border">
					<div className="mb-4">
						<h3 className="text-xl font-semibold text-gray-900 mb-2 flex items-center">
							🔒 Informations sur le client
						</h3>
						<p className="text-sm text-gray-600">
							Ces informations sont confidentielles et ne seront
							visibles que par vous lors de la gestion de cette
							recherche.
						</p>
					</div>
					<SearchAdClientInfoForm
						clientInfo={formData.clientInfo || {}}
						onChange={(clientInfo) =>
							setFormData((prev) => ({ ...prev, clientInfo }))
						}
					/>
				</div>

				{/* Status Field and Actions */}
				<div className="bg-white p-6 rounded-lg shadow-sm border">
					<div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-end">
						{/* Status Section */}
						<div>
							<h3 className="text-lg font-semibold text-gray-900 mb-4">
								Statut de publication
							</h3>
							<div>
								<label className="block text-sm font-medium text-gray-700 mb-2">
									Statut de la recherche
								</label>
								<select
									value={formData.status}
									onChange={(e) =>
										setFormData((prev) => ({
											...prev,
											status: e.target
												.value as FormData['status'],
										}))
									}
									className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
								>
									<option value="active">Actif</option>
									<option value="paused">En pause</option>
									<option value="fulfilled">Réalisé</option>
									<option value="sold">Vendu</option>
									<option value="rented">Loué</option>
									<option value="archived">Archivé</option>
								</select>
								<p className="text-xs text-gray-500 mt-1">
									Changez le statut pour mettre à jour la
									visibilité de votre recherche.
								</p>
							</div>
						</div>

						{/* Action Buttons */}
						<div className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-end">
							<button
								type="button"
								onClick={() => router.push('/dashboard')}
								className="px-6 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition-colors text-sm font-medium order-2 sm:order-1"
							>
								Annuler
							</button>
							<button
								type="submit"
								disabled={isLoading}
								className="px-8 py-2 bg-brand-600 text-white rounded-md hover:bg-brand-700 disabled:opacity-50 transition-colors text-sm font-medium order-1 sm:order-2"
							>
								{isLoading
									? 'Modification...'
									: 'Modifier la recherche'}
							</button>
						</div>
					</div>
				</div>

				{error && (
					<div className="rounded-md bg-red-50 p-4">
						<div className="text-sm text-red-800">{error}</div>
					</div>
				)}
			</form>
		</div>
	);
};
