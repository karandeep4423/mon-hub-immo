'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import searchAdApi from '@/lib/api/searchAdApi';
import { useAuth } from '@/hooks/useAuth';

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
}

export const CreateSearchAdForm = () => {
	const router = useRouter();
	const { user } = useAuth();
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
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
	});

	const propertyTypes = [
		'house',
		'apartment',
		'land',
		'building',
		'commercial',
	];
	const propertyStates = ['new', 'old'];
	const projectTypes = ['primary', 'secondary', 'investment'];
	const financingTypes = ['loan', 'cash', 'pending'];
	const floorOptions = ['any', 'not_ground_floor', 'ground_floor_only'];
	const stateOptions = ['new', 'good', 'refresh', 'renovate'];
	const priorityOptions = [
		'Jardin/Extérieur',
		'Garage/Parking',
		'Proche des transports',
		'Proche des écoles',
		'Quartier calme',
		'Lumineux',
		'Sans travaux',
		'Piscine',
		'Balcon/Terrasse',
		'Ascenseur',
		'Vue dégagée',
		'Calme',
	];

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
			setError('Vous devez être connecté pour créer une annonce.');
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
			};

			await searchAdApi.createSearchAd(
				adData as Parameters<typeof searchAdApi.createSearchAd>[0],
			);
			router.push('/dashboard');
		} catch (err) {
			setError(
				"Une erreur est survenue lors de la création de l'annonce.",
			);
			console.error(err);
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<div className="w-full">
			<div className="mb-8 text-center">
				<h1 className="text-3xl font-bold text-gray-900 mb-2">
					Créer une annonce de recherche
				</h1>
				<p className="text-gray-600">
					Décrivez les critères de recherche de votre client pour
					trouver le bien idéal
				</p>
			</div>

			<form onSubmit={handleSubmit} className="w-full space-y-6">
				<div className="grid grid-cols-1 lg:grid-cols-2  gap-6">
					{/* Basic Information */}
					<div className="bg-white p-6 rounded-lg shadow-sm border">
						<h3 className="text-lg font-semibold text-gray-900 mb-4">
							📋 Informations générales
						</h3>

						<div className="space-y-4">
							<div>
								<label
									htmlFor="title"
									className="block text-sm font-medium text-gray-700"
								>
									Titre de l&apos;annonce *
								</label>
								<input
									id="title"
									name="title"
									type="text"
									value={formData.title}
									onChange={handleInputChange}
									className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-brand-600 focus:border-brand-600"
									placeholder="Recherche appartement familial à Paris"
								/>
							</div>

							<div>
								<label
									htmlFor="description"
									className="block text-sm font-medium text-gray-700"
								>
									Description de la recherche *
								</label>
								<textarea
									id="description"
									name="description"
									rows={4}
									value={formData.description}
									onChange={handleInputChange}
									className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-brand-600 focus:border-brand-600"
									placeholder="Décrivez les besoins spécifiques de votre client..."
								/>
							</div>
						</div>
					</div>

					{/* Property Search Criteria */}
					<div className="bg-white p-6 rounded-lg shadow-sm border">
						<h3 className="text-lg font-semibold text-gray-900 mb-4">
							🏠 Critères de recherche du bien
						</h3>

						<div className="space-y-6">
							{/* Property Types */}
							<div>
								<label className="block text-sm font-medium text-gray-700 mb-2">
									Type de bien recherché *
								</label>
								<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
									{propertyTypes.map((type) => (
										<label
											key={type}
											className="flex items-start space-x-2 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer min-h-[3rem]"
										>
											<input
												type="checkbox"
												value={type}
												checked={formData.propertyTypes.includes(
													type,
												)}
												onChange={(e) =>
													handleArrayChange(
														type,
														e.target.checked,
														'propertyTypes',
													)
												}
												className="rounded border-gray-300 text-blue-600 mt-1 flex-shrink-0"
											/>
											<span className="text-sm capitalize leading-tight break-words">
												{type === 'house'
													? 'Maison'
													: type === 'apartment'
														? 'Appartement'
														: type === 'land'
															? 'Terrain'
															: type ===
																  'building'
																? 'Immeuble'
																: 'Local commercial'}
											</span>
										</label>
									))}
								</div>
							</div>

							{/* Property State */}
							<div>
								<label className="block text-sm font-medium text-gray-700 mb-2">
									Neuf ou ancien ?
								</label>
								<div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
									{propertyStates.map((state) => (
										<label
											key={state}
											className="flex items-start space-x-2 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer min-h-[3rem]"
										>
											<input
												type="checkbox"
												value={state}
												checked={formData.propertyState.includes(
													state,
												)}
												onChange={(e) =>
													handleArrayChange(
														state,
														e.target.checked,
														'propertyState',
													)
												}
												className="rounded border-gray-300 text-blue-600 mt-1 flex-shrink-0"
											/>
											<span className="text-sm leading-tight break-words">
												{state === 'new'
													? 'Neuf'
													: 'Ancien'}
											</span>
										</label>
									))}
								</div>
							</div>

							{/* Project Type */}
							<div>
								<label
									htmlFor="projectType"
									className="block text-sm font-medium text-gray-700"
								>
									Type de projet
								</label>
								<select
									id="projectType"
									name="projectType"
									value={formData.projectType}
									onChange={handleInputChange}
									className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
								>
									<option value="">Sélectionner...</option>
									{projectTypes.map((type) => (
										<option key={type} value={type}>
											{type === 'primary'
												? 'Résidence principale'
												: type === 'secondary'
													? 'Résidence secondaire'
													: 'Investissement locatif'}
										</option>
									))}
								</select>
							</div>
						</div>
					</div>

					{/* Location */}
					<div className="bg-white p-6 rounded-lg shadow-sm border">
						<h3 className="text-lg font-semibold text-gray-900 mb-4">
							📍 Localisation
						</h3>

						<div className="space-y-4">
							<div>
								<label
									htmlFor="cities"
									className="block text-sm font-medium text-gray-700"
								>
									Ville(s), quartier(s) ciblé(s) *
								</label>
								<input
									id="cities"
									name="cities"
									type="text"
									value={formData.cities}
									onChange={handleInputChange}
									className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
									placeholder="Paris 15e, Boulogne-Billancourt, Issy-les-Moulineaux"
								/>
							</div>

							<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
								<div>
									<label
										htmlFor="maxDistance"
										className="block text-sm font-medium text-gray-700"
									>
										Distance max avec le travail / écoles
										(km)
									</label>
									<input
										id="maxDistance"
										name="maxDistance"
										type="number"
										value={formData.maxDistance || ''}
										onChange={handleInputChange}
										className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
									/>
								</div>

								<div className="flex items-center pt-6">
									<label className="flex items-center space-x-2">
										<input
											type="checkbox"
											name="openToOtherAreas"
											checked={formData.openToOtherAreas}
											onChange={handleInputChange}
											className="rounded border-gray-300 text-blue-600"
										/>
										<span className="text-sm text-gray-700">
											Êtes-vous ouvert à d&apos;autres
											zones ?
										</span>
									</label>
								</div>
							</div>
						</div>
					</div>

					{/* Budget & Financing */}
					<div className="bg-white p-6 rounded-lg shadow-sm border">
						<h3 className="text-lg font-semibold text-gray-900 mb-4">
							💰 Budget & financement
						</h3>

						<div className="space-y-4">
							<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
								<div>
									<label
										htmlFor="budgetMax"
										className="block text-sm font-medium text-gray-700"
									>
										Budget total maximum ? *
									</label>
									<input
										id="budgetMax"
										name="budgetMax"
										type="number"
										value={formData.budgetMax || ''}
										onChange={handleInputChange}
										className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
									/>
								</div>

								<div>
									<label
										htmlFor="budgetIdeal"
										className="block text-sm font-medium text-gray-700"
									>
										Budget idéal ?
									</label>
									<input
										id="budgetIdeal"
										name="budgetIdeal"
										type="number"
										value={formData.budgetIdeal || ''}
										onChange={handleInputChange}
										className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
									/>
								</div>
							</div>

							<div>
								<label
									htmlFor="financingType"
									className="block text-sm font-medium text-gray-700"
								>
									Financement : prêt bancaire / cash / en
									attente d&apos;accord ?
								</label>
								<select
									id="financingType"
									name="financingType"
									value={formData.financingType}
									onChange={handleInputChange}
									className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
								>
									<option value="">Sélectionner...</option>
									{financingTypes.map((type) => (
										<option key={type} value={type}>
											{type === 'loan'
												? 'Prêt bancaire'
												: type === 'cash'
													? 'Cash'
													: "En attente d'accord"}
										</option>
									))}
								</select>
							</div>

							<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
								<label className="flex items-center space-x-2">
									<input
										type="checkbox"
										name="isSaleInProgress"
										checked={formData.isSaleInProgress}
										onChange={handleInputChange}
										className="rounded border-gray-300 text-blue-600"
									/>
									<span className="text-sm text-gray-700">
										Vente d&apos;un autre bien en cours ?
										(vente en cascade)
									</span>
								</label>

								<label className="flex items-center space-x-2">
									<input
										type="checkbox"
										name="hasBankApproval"
										checked={formData.hasBankApproval}
										onChange={handleInputChange}
										className="rounded border-gray-300 text-blue-600"
									/>
									<span className="text-sm text-gray-700">
										Avez-vous un accord de principe ou une
										simulation bancaire ?
									</span>
								</label>
							</div>
						</div>
					</div>

					{/* Property Characteristics */}
					<div className="bg-white p-6 rounded-lg shadow-sm border">
						<h3 className="text-lg font-semibold text-gray-900 mb-4">
							🏠 Caractéristiques
						</h3>

						<div className="space-y-4">
							<div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
								<div>
									<label
										htmlFor="minRooms"
										className="block text-sm font-medium text-gray-700"
									>
										Nombre de pièces / chambres minimum
									</label>
									<input
										id="minRooms"
										name="minRooms"
										type="number"
										value={formData.minRooms || ''}
										onChange={handleInputChange}
										className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
									/>
								</div>

								<div>
									<label
										htmlFor="minBedrooms"
										className="block text-sm font-medium text-gray-700"
									>
										Nombre de chambres minimum
									</label>
									<input
										id="minBedrooms"
										name="minBedrooms"
										type="number"
										value={formData.minBedrooms || ''}
										onChange={handleInputChange}
										className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
									/>
								</div>

								<div>
									<label
										htmlFor="minSurface"
										className="block text-sm font-medium text-gray-700"
									>
										Surface habitable minimum (m²)
									</label>
									<input
										id="minSurface"
										name="minSurface"
										type="number"
										value={formData.minSurface || ''}
										onChange={handleInputChange}
										className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
									/>
								</div>
							</div>

							<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
								<label className="flex items-center space-x-2">
									<input
										type="checkbox"
										name="hasExterior"
										checked={formData.hasExterior}
										onChange={handleInputChange}
										className="rounded border-gray-300 text-blue-600"
									/>
									<span className="text-sm text-gray-700">
										Extérieur nécessaire ? (jardin,
										terrasse, balcon)
									</span>
								</label>

								<label className="flex items-center space-x-2">
									<input
										type="checkbox"
										name="hasParking"
										checked={formData.hasParking}
										onChange={handleInputChange}
										className="rounded border-gray-300 text-blue-600"
									/>
									<span className="text-sm text-gray-700">
										Parking / garage obligatoire ?
									</span>
								</label>
							</div>

							<div>
								<label
									htmlFor="acceptedFloors"
									className="block text-sm font-medium text-gray-700"
								>
									Étages acceptés (si appartement) ?
								</label>
								<select
									id="acceptedFloors"
									name="acceptedFloors"
									value={formData.acceptedFloors || ''}
									onChange={handleInputChange}
									className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
								>
									<option value="">Sélectionner...</option>
									{floorOptions.map((option) => (
										<option key={option} value={option}>
											{option === 'any'
												? 'Tous étages'
												: option === 'not_ground_floor'
													? 'Pas de rez-de-chaussée'
													: 'Rez-de-chaussée uniquement'}
										</option>
									))}
								</select>
							</div>

							{/* Property State */}
							<div>
								<label className="block text-sm font-medium text-gray-700 mb-2">
									État général souhaité : neuf / à rafraîchir
									/ à rénover ?
								</label>
								<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
									{stateOptions.map((state) => (
										<label
											key={state}
											className="flex items-start space-x-2 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer min-h-[3rem]"
										>
											<input
												type="checkbox"
												value={state}
												checked={formData.desiredState.includes(
													state,
												)}
												onChange={(e) =>
													handleArrayChange(
														state,
														e.target.checked,
														'desiredState',
													)
												}
												className="rounded border-gray-300 text-blue-600 mt-1 flex-shrink-0"
											/>
											<span className="text-sm leading-tight break-words">
												{state === 'new'
													? 'Neuf'
													: state === 'good'
														? 'Bon état'
														: state === 'refresh'
															? 'À rafraîchir'
															: 'À rénover'}
											</span>
										</label>
									))}
								</div>
							</div>
						</div>
					</div>

					{/* Personal Priorities */}
					<div className="bg-white p-6 rounded-lg shadow-sm border">
						<h3 className="text-lg font-semibold text-gray-900 mb-4">
							❤️ Priorités personnelles
						</h3>

						<div className="space-y-6">
							{/* Must Haves */}
							<div>
								<label className="block text-sm font-medium text-gray-700 mb-2">
									3 critères indispensables :
								</label>
								<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
									{priorityOptions.map((priority) => (
										<label
											key={priority}
											className="flex items-start space-x-2 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer min-h-[3rem]"
										>
											<input
												type="checkbox"
												value={priority}
												checked={formData.mustHaves.includes(
													priority,
												)}
												onChange={(e) =>
													handleArrayChange(
														priority,
														e.target.checked,
														'mustHaves',
													)
												}
												className="rounded border-gray-300 text-red-600 mt-1 flex-shrink-0"
												disabled={
													!formData.mustHaves.includes(
														priority,
													) &&
													formData.mustHaves.length >=
														3
												}
											/>
											<span className="text-sm leading-tight break-words">
												{priority}
											</span>
										</label>
									))}
								</div>
								<p className="text-xs text-gray-500 mt-1">
									Maximum 3 critères
								</p>
							</div>

							{/* Nice to Haves */}
							<div>
								<label className="block text-sm font-medium text-gray-700 mb-2">
									3 critères secondaires :
								</label>
								<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
									{priorityOptions.map((priority) => (
										<label
											key={priority}
											className="flex items-start space-x-2 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer min-h-[3rem]"
										>
											<input
												type="checkbox"
												value={priority}
												checked={formData.niceToHaves.includes(
													priority,
												)}
												onChange={(e) =>
													handleArrayChange(
														priority,
														e.target.checked,
														'niceToHaves',
													)
												}
												className="rounded border-gray-300 text-yellow-600 mt-1 flex-shrink-0"
												disabled={
													!formData.niceToHaves.includes(
														priority,
													) &&
													formData.niceToHaves
														.length >= 3
												}
											/>
											<span className="text-sm leading-tight break-words">
												{priority}
											</span>
										</label>
									))}
								</div>
								<p className="text-xs text-gray-500 mt-1">
									Maximum 3 critères
								</p>
							</div>

							{/* Deal Breakers */}
							<div>
								<label className="block text-sm font-medium text-gray-700 mb-2">
									Points de blocage absolus :
								</label>
								<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
									{priorityOptions.map((priority) => (
										<label
											key={priority}
											className="flex items-start space-x-2 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer min-h-[3rem]"
										>
											<input
												type="checkbox"
												value={priority}
												checked={formData.dealBreakers.includes(
													priority,
												)}
												onChange={(e) =>
													handleArrayChange(
														priority,
														e.target.checked,
														'dealBreakers',
													)
												}
												className="rounded border-gray-300 text-red-600 mt-1 flex-shrink-0"
											/>
											<span className="text-sm leading-tight break-words">
												{priority}
											</span>
										</label>
									))}
								</div>
							</div>
						</div>
					</div>
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
								{isLoading ? 'Création...' : "Créer l'annonce"}
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
