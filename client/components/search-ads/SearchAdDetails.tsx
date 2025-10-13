'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { SearchAd } from '@/types/searchAd';
import { User } from '@/types/auth';
import { ProfileAvatar } from '../ui/ProfileAvatar';

interface SearchAdDetailsProps {
	searchAd: SearchAd;
	currentUser: User | null;
}

export const SearchAdDetails: React.FC<SearchAdDetailsProps> = ({
	searchAd,
	currentUser,
}) => {
	const router = useRouter();

	const handleContact = () => {
		router.push(
			`/chat?userId=${searchAd.authorId._id}&searchAdId=${searchAd._id}&type=search-ad-contact`,
		);
	};

	const formatPropertyTypes = (types: string[]) => {
		const typeMap: Record<string, string> = {
			house: 'Maison',
			apartment: 'Appartement',
			land: 'Terrain',
			building: 'Immeuble',
			commercial: 'Commercial',
		};
		return types.map((type) => typeMap[type] || type).join(', ');
	};

	const formatProjectType = (type: string) => {
		const typeMap: Record<string, string> = {
			primary: 'Résidence principale',
			secondary: 'Résidence secondaire',
			investment: 'Investissement',
		};
		return typeMap[type] || type;
	};

	const formatFinancingType = (type: string) => {
		const typeMap: Record<string, string> = {
			loan: 'Prêt bancaire',
			cash: 'Cash',
			pending: "En attente d'accord",
		};
		return typeMap[type] || type;
	};

	const formatFloors = (floors: string) => {
		const floorMap: Record<string, string> = {
			any: 'Tous étages',
			not_ground_floor: 'Pas de rez-de-chaussée',
			ground_floor_only: 'Rez-de-chaussée uniquement',
		};
		return floorMap[floors] || floors;
	};

	const formatState = (states: string[]) => {
		const stateMap: Record<string, string> = {
			new: 'Neuf',
			good: 'Bon état',
			refresh: 'À rafraîchir',
			renovate: 'À rénover',
		};
		return states.map((state) => stateMap[state] || state).join(', ');
	};

	const isOwner = currentUser?._id === searchAd.authorId._id;

	return (
		<div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
				{/* Header */}
				<div className="mb-10">
					<div className="flex items-center justify-between mb-6">
						<button
							onClick={() => router.back()}
							className="group flex items-center gap-2 text-gray-600 hover:text-cyan-600 transition-all duration-200 font-medium"
						>
							<svg
								className="w-5 h-5 transform group-hover:-translate-x-1 transition-transform duration-200"
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24"
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth={2}
									d="M15 19l-7-7 7-7"
								/>
							</svg>
							<span>Retour</span>
						</button>

						<div className="flex items-center gap-3">
							<span
								className={`px-4 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wide shadow-sm ${
									searchAd.status === 'active'
										? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white'
										: searchAd.status === 'paused'
											? 'bg-gradient-to-r from-yellow-400 to-orange-400 text-white'
											: 'bg-gradient-to-r from-gray-400 to-gray-500 text-white'
								}`}
							>
								{searchAd.status === 'active'
									? '✓ Actif'
									: searchAd.status === 'paused'
										? '⏸ En pause'
										: '✓ Réalisé'}
							</span>
							<span
								className={`px-4 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wide shadow-sm ${
									searchAd.authorType === 'agent'
										? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white'
										: 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
								}`}
							>
								{searchAd.authorType === 'agent'
									? '👨‍💼 Agent'
									: '🤝 Apporteur'}
							</span>
						</div>
					</div>

					<div className="space-y-3 mb-6">
						<h1 className="text-2xl lg:text-3xl font-bold text-gray-900 leading-tight">
							{searchAd.title}
						</h1>

						{searchAd.description && (
							<p className="text-base text-gray-600 leading-relaxed max-w-4xl">
								{searchAd.description}
							</p>
						)}
					</div>

					{/* Author Info */}
					<div className="bg-gradient-to-r from-white to-gray-50 p-5 rounded-xl shadow-md border border-gray-200/50 hover:shadow-lg transition-shadow duration-300">
						<div className="flex items-center gap-4">
							<ProfileAvatar
								user={searchAd.authorId}
								size="lg"
								className="w-14 h-14 ring-4 ring-white shadow-md"
							/>
							<div className="flex-1">
								<h3 className="text-lg font-bold text-gray-900 mb-0.5">
									{searchAd.authorId.firstName}{' '}
									{searchAd.authorId.lastName}
								</h3>
								<p className="text-sm text-gray-600 font-medium">
									{searchAd.authorType === 'agent'
										? '🏢 Agent immobilier professionnel'
										: "🤝 Apporteur d'affaires certifié"}
								</p>
							</div>
						</div>
					</div>
				</div>

				{/* Details Grid */}
				<div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-5">
					{/* Property Criteria */}
					<div className="group bg-white p-6 rounded-xl shadow-md border border-gray-200/50 hover:shadow-xl hover:border-cyan-200 transition-all duration-300">
						<div className="flex items-center gap-3 mb-4">
							<div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-lg flex items-center justify-center shadow-md">
								<span className="text-xl">🏠</span>
							</div>
							<h3 className="text-lg font-bold text-gray-900">
								Type de bien recherché
							</h3>
						</div>
						<div className="space-y-3">
							<div>
								<span className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-1.5">
									Types de propriété
								</span>
								<p className="text-gray-900 font-medium text-base">
									{formatPropertyTypes(
										searchAd.propertyTypes,
									)}
								</p>
							</div>

							{searchAd.propertyState &&
								searchAd.propertyState.length > 0 && (
									<div>
										<span className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-1.5">
											État du bien
										</span>
										<p className="text-gray-900 font-medium text-base">
											{searchAd.propertyState.includes(
												'new',
											)
												? '✨ Neuf'
												: '🏘️ Ancien'}
										</p>
									</div>
								)}

							{searchAd.projectType && (
								<div>
									<span className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-1.5">
										Type de projet
									</span>
									<p className="text-gray-900 font-medium text-base">
										{formatProjectType(
											searchAd.projectType,
										)}
									</p>
								</div>
							)}
						</div>
					</div>

					{/* Location */}
					<div className="group bg-white p-6 rounded-xl shadow-md border border-gray-200/50 hover:shadow-xl hover:border-cyan-200 transition-all duration-300">
						<div className="flex items-center gap-3 mb-4">
							<div className="w-10 h-10 bg-gradient-to-br from-red-500 to-pink-500 rounded-lg flex items-center justify-center shadow-md">
								<span className="text-xl">📍</span>
							</div>
							<h3 className="text-lg font-bold text-gray-900">
								Localisation
							</h3>
						</div>
						<div className="space-y-3">
							<div>
								<span className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-1.5">
									Zones ciblées
								</span>
								<p className="text-gray-900 font-medium text-base">
									{searchAd.location.cities.join(', ')}
								</p>
							</div>

							{searchAd.location.maxDistance && (
								<div>
									<span className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-1.5">
										Distance maximale
									</span>
									<p className="text-gray-900 font-medium text-base">
										🚗 {searchAd.location.maxDistance} km
									</p>
								</div>
							)}

							{searchAd.location.openToOtherAreas && (
								<div className="flex items-center gap-2 bg-green-50 px-3 py-2 rounded-lg border border-green-200">
									<div className="w-2 h-2 bg-green-500 rounded-full animate-pulse shadow-sm"></div>
									<span className="text-xs font-medium text-green-800">
										Ouvert à d&apos;autres zones
									</span>
								</div>
							)}
						</div>
					</div>

					{/* Budget */}
					<div className="group bg-white p-6 rounded-xl shadow-md border border-gray-200/50 hover:shadow-xl hover:border-cyan-200 transition-all duration-300">
						<div className="flex items-center gap-3 mb-4">
							<div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-lg flex items-center justify-center shadow-md">
								<span className="text-xl">💰</span>
							</div>
							<h3 className="text-lg font-bold text-gray-900">
								Budget
							</h3>
						</div>
						<div className="space-y-3">
							<div className="bg-gradient-to-br from-emerald-50 to-teal-50 p-3 rounded-lg border border-emerald-200">
								<span className="text-xs font-semibold text-emerald-700 uppercase tracking-wider block mb-1.5">
									Budget maximum
								</span>
								<p className="text-emerald-900 text-xl font-bold">
									{searchAd.budget.max.toLocaleString()} €
								</p>
							</div>

							{searchAd.budget.ideal && (
								<div>
									<span className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-1.5">
										Budget idéal
									</span>
									<p className="text-gray-900 font-medium text-base">
										{searchAd.budget.ideal.toLocaleString()}{' '}
										€
									</p>
								</div>
							)}

							{searchAd.budget.financingType && (
								<div>
									<span className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-1.5">
										Type de financement
									</span>
									<p className="text-gray-900 font-medium text-base">
										{formatFinancingType(
											searchAd.budget.financingType,
										)}
									</p>
								</div>
							)}

							<div className="space-y-2 pt-1">
								{searchAd.budget.isSaleInProgress && (
									<div className="flex items-center gap-2 bg-blue-50 px-3 py-1.5 rounded-lg">
										<div className="w-1.5 h-1.5 bg-blue-500 rounded-full shadow-sm"></div>
										<span className="text-xs font-medium text-blue-800">
											Vente en cours
										</span>
									</div>
								)}
								{searchAd.budget.hasBankApproval && (
									<div className="flex items-center gap-2 bg-green-50 px-3 py-1.5 rounded-lg">
										<div className="w-1.5 h-1.5 bg-green-500 rounded-full shadow-sm"></div>
										<span className="text-xs font-medium text-green-800">
											Accord bancaire obtenu
										</span>
									</div>
								)}
							</div>
						</div>
					</div>

					{/* Property Characteristics */}
					<div className="group bg-white p-6 rounded-xl shadow-md border border-gray-200/50 hover:shadow-xl hover:border-cyan-200 transition-all duration-300">
						<div className="flex items-center gap-3 mb-4">
							<div className="w-10 h-10 bg-gradient-to-br from-violet-500 to-purple-500 rounded-lg flex items-center justify-center shadow-md">
								<span className="text-xl">📐</span>
							</div>
							<h3 className="text-lg font-bold text-gray-900">
								Caractéristiques
							</h3>
						</div>
						<div className="space-y-3">
							{searchAd.minRooms && (
								<div className="flex items-center justify-between p-2.5 bg-gray-50 rounded-lg">
									<span className="text-xs font-medium text-gray-700">
										🚪 Pièces minimum
									</span>
									<span className="text-base font-bold text-gray-900">
										{searchAd.minRooms}
									</span>
								</div>
							)}

							{searchAd.minBedrooms && (
								<div className="flex items-center justify-between p-2.5 bg-gray-50 rounded-lg">
									<span className="text-xs font-medium text-gray-700">
										🛏️ Chambres minimum
									</span>
									<span className="text-base font-bold text-gray-900">
										{searchAd.minBedrooms}
									</span>
								</div>
							)}

							{searchAd.minSurface && (
								<div className="flex items-center justify-between p-2.5 bg-gray-50 rounded-lg">
									<span className="text-xs font-medium text-gray-700">
										📏 Surface minimum
									</span>
									<span className="text-base font-bold text-gray-900">
										{searchAd.minSurface} m²
									</span>
								</div>
							)}

							{searchAd.acceptedFloors && (
								<div>
									<span className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-1.5">
										Étages acceptés
									</span>
									<p className="text-gray-900 font-medium text-sm">
										{formatFloors(searchAd.acceptedFloors)}
									</p>
								</div>
							)}

							<div className="space-y-2 pt-1">
								{searchAd.hasExterior && (
									<div className="flex items-center gap-2 bg-green-50 px-3 py-1.5 rounded-lg">
										<div className="w-1.5 h-1.5 bg-green-500 rounded-full shadow-sm"></div>
										<span className="text-xs font-medium text-green-800">
											🌳 Extérieur requis
										</span>
									</div>
								)}
								{searchAd.hasParking && (
									<div className="flex items-center gap-2 bg-green-50 px-3 py-1.5 rounded-lg">
										<div className="w-1.5 h-1.5 bg-green-500 rounded-full shadow-sm"></div>
										<span className="text-xs font-medium text-green-800">
											🅿️ Parking requis
										</span>
									</div>
								)}
							</div>

							{searchAd.desiredState &&
								searchAd.desiredState.length > 0 && (
									<div>
										<span className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-1.5">
											État souhaité
										</span>
										<p className="text-gray-900 font-medium text-sm">
											{formatState(searchAd.desiredState)}
										</p>
									</div>
								)}
						</div>
					</div>

					{/* Priorities */}
					{searchAd.priorities && (
						<div className="bg-white p-6 rounded-xl shadow-md border border-gray-200/50 hover:shadow-xl hover:border-cyan-200 transition-all duration-300 lg:col-span-2">
							<div className="flex items-center gap-3 mb-5">
								<div className="w-10 h-10 bg-gradient-to-br from-rose-500 to-red-500 rounded-lg flex items-center justify-center shadow-md">
									<span className="text-xl">❤️</span>
								</div>
								<h3 className="text-lg font-bold text-gray-900">
									Priorités personnelles
								</h3>
							</div>
							<div className="grid grid-cols-1 md:grid-cols-3 gap-5">
								{searchAd.priorities.mustHaves &&
									searchAd.priorities.mustHaves.length >
										0 && (
										<div className="bg-gradient-to-br from-red-50 to-rose-50 p-4 rounded-xl border-2 border-red-200">
											<h4 className="font-bold text-red-900 mb-2.5 flex items-center gap-2 text-sm">
												<span className="text-base">
													🔴
												</span>
												<span>Indispensables</span>
											</h4>
											<div className="space-y-2">
												{searchAd.priorities.mustHaves.map(
													(item, index) => (
														<div
															key={index}
															className="flex items-start gap-2 text-sm"
														>
															<div className="w-1 h-1 bg-red-600 rounded-full mt-1.5 flex-shrink-0"></div>
															<span className="text-red-900 font-medium">
																{item}
															</span>
														</div>
													),
												)}
											</div>
										</div>
									)}

								{searchAd.priorities.niceToHaves &&
									searchAd.priorities.niceToHaves.length >
										0 && (
										<div className="bg-gradient-to-br from-yellow-50 to-amber-50 p-4 rounded-xl border-2 border-yellow-200">
											<h4 className="font-bold text-yellow-900 mb-2.5 flex items-center gap-2 text-sm">
												<span className="text-base">
													🟡
												</span>
												<span>Souhaitables</span>
											</h4>
											<div className="space-y-2">
												{searchAd.priorities.niceToHaves.map(
													(item, index) => (
														<div
															key={index}
															className="flex items-start gap-2 text-sm"
														>
															<div className="w-1 h-1 bg-yellow-600 rounded-full mt-1.5 flex-shrink-0"></div>
															<span className="text-yellow-900 font-medium">
																{item}
															</span>
														</div>
													),
												)}
											</div>
										</div>
									)}

								{searchAd.priorities.dealBreakers &&
									searchAd.priorities.dealBreakers.length >
										0 && (
										<div className="bg-gradient-to-br from-gray-100 to-gray-50 p-4 rounded-xl border-2 border-gray-300">
											<h4 className="font-bold text-gray-900 mb-2.5 flex items-center gap-2 text-sm">
												<span className="text-base">
													⚫
												</span>
												<span>Points de blocage</span>
											</h4>
											<div className="space-y-2">
												{searchAd.priorities.dealBreakers.map(
													(item, index) => (
														<div
															key={index}
															className="flex items-start gap-2 text-sm"
														>
															<div className="w-1 h-1 bg-gray-600 rounded-full mt-1.5 flex-shrink-0"></div>
															<span className="text-gray-900 font-medium">
																{item}
															</span>
														</div>
													),
												)}
											</div>
										</div>
									)}
							</div>
						</div>
					)}

					{/* Client Information */}
					{searchAd.clientInfo && (
						<div className="lg:col-span-2 xl:col-span-3 bg-gradient-to-br from-blue-50 via-cyan-50 to-blue-50 border-blue-200 p-6 rounded-xl shadow-md border-2">
							<div className="flex items-center gap-3 mb-2.5">
								<div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center shadow-md">
									<span className="text-xl">ℹ️</span>
								</div>
								<h3 className="text-xl font-bold text-gray-900">
									Informations sur le client
								</h3>
							</div>
							<p className="text-xs text-blue-700 mb-5 font-medium">
								💡 Ces informations vous aident à mieux
								comprendre les besoins et la situation du
								client.
							</p>

							<div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
								{/* Qualification Info */}
								{searchAd.clientInfo?.qualificationInfo && (
									<div className="bg-white p-5 rounded-xl shadow-sm border border-blue-100">
										<h4 className="font-bold text-gray-900 mb-3.5 flex items-center gap-2 text-base">
											<span>👤</span>
											<span>
												Informations de qualification
											</span>
										</h4>
										<div className="space-y-3.5">
											{searchAd.clientInfo
												.qualificationInfo
												.clientName && (
												<div className="pb-2.5 border-b border-gray-100">
													<span className="font-semibold text-gray-600 block mb-1 text-xs uppercase tracking-wide">
														Nom du client
													</span>
													<p className="text-gray-900 font-medium text-base">
														{
															searchAd.clientInfo
																.qualificationInfo
																.clientName
														}
													</p>
												</div>
											)}
											{searchAd.clientInfo
												.qualificationInfo
												.clientStatus && (
												<div className="pb-2.5 border-b border-gray-100">
													<span className="font-semibold text-gray-600 block mb-1 text-xs uppercase tracking-wide">
														Statut
													</span>
													<p className="text-gray-900 font-medium text-base">
														{searchAd.clientInfo
															.qualificationInfo
															.clientStatus ===
														'particulier'
															? '👨‍👩‍👧 Particulier'
															: searchAd
																		.clientInfo
																		.qualificationInfo
																		.clientStatus ===
																  'investisseur'
																? '💼 Investisseur'
																: '🏢 Entreprise'}
													</p>
												</div>
											)}
											{searchAd.clientInfo
												.qualificationInfo
												.profession && (
												<div className="pb-2.5 border-b border-gray-100">
													<span className="font-semibold text-gray-600 block mb-1 text-xs uppercase tracking-wide">
														Profession
													</span>
													<p className="text-gray-900 font-medium text-base">
														💼{' '}
														{
															searchAd.clientInfo
																.qualificationInfo
																.profession
														}
													</p>
												</div>
											)}
											{searchAd.clientInfo
												.qualificationInfo
												.projectType && (
												<div className="pb-2.5 border-b border-gray-100">
													<span className="font-semibold text-gray-600 block mb-1 text-xs uppercase tracking-wide">
														Type de projet
													</span>
													<p className="text-gray-900 font-medium text-base">
														{searchAd.clientInfo
															.qualificationInfo
															.projectType ===
														'couple'
															? '👫 En couple'
															: '👤 Seul'}
													</p>
												</div>
											)}
											{searchAd.clientInfo
												.qualificationInfo
												.hasRealEstateAgent !==
												undefined && (
												<div className="pb-2.5 border-b border-gray-100">
													<span className="font-semibold text-gray-600 block mb-1 text-xs uppercase tracking-wide">
														Agent immobilier
													</span>
													<p
														className={`font-medium text-base ${searchAd.clientInfo.qualificationInfo.hasRealEstateAgent ? 'text-green-700' : 'text-red-700'}`}
													>
														{searchAd.clientInfo
															.qualificationInfo
															.hasRealEstateAgent
															? '✅ Oui'
															: '❌ Non'}
													</p>
												</div>
											)}
											{searchAd.clientInfo
												.qualificationInfo
												.hasVisitedProperties !==
												undefined && (
												<div>
													<span className="font-semibold text-gray-600 block mb-1 text-xs uppercase tracking-wide">
														A déjà visité des biens
													</span>
													<p
														className={`font-medium text-base ${searchAd.clientInfo.qualificationInfo.hasVisitedProperties ? 'text-green-700' : 'text-gray-700'}`}
													>
														{searchAd.clientInfo
															.qualificationInfo
															.hasVisitedProperties
															? '✅ Oui'
															: '➖ Non'}
													</p>
												</div>
											)}
										</div>
									</div>
								)}

								{/* Timeline Info */}
								{searchAd.clientInfo?.timelineInfo && (
									<div className="bg-white p-5 rounded-xl shadow-sm border border-blue-100">
										<h4 className="font-bold text-gray-900 mb-3.5 flex items-center gap-2 text-base">
											<span>⏰</span>
											<span>Délai et disponibilité</span>
										</h4>
										<div className="space-y-3.5">
											{searchAd.clientInfo.timelineInfo
												.urgency && (
												<div className="pb-2.5 border-b border-gray-100">
													<span className="font-semibold text-gray-600 block mb-1 text-xs uppercase tracking-wide">
														Niveau d&apos;urgence
													</span>
													<p
														className={`font-bold text-base ${
															searchAd.clientInfo
																.timelineInfo
																.urgency ===
															'immediat'
																? 'text-red-700'
																: searchAd
																			.clientInfo
																			.timelineInfo
																			.urgency ===
																	  '3_mois'
																	? 'text-orange-700'
																	: 'text-green-700'
														}`}
													>
														{searchAd.clientInfo
															.timelineInfo
															.urgency ===
														'immediat'
															? '🔴 Immédiat'
															: searchAd
																		.clientInfo
																		.timelineInfo
																		.urgency ===
																  '3_mois'
																? '🟠 Dans les 3 mois'
																: searchAd
																			.clientInfo
																			.timelineInfo
																			.urgency ===
																	  '6_mois'
																	? '🟡 Dans les 6 mois'
																	: '🟢 Pas pressé'}
													</p>
												</div>
											)}
											{searchAd.clientInfo.timelineInfo
												.visitAvailability && (
												<div className="pb-2.5 border-b border-gray-100">
													<span className="font-semibold text-gray-600 block mb-1 text-xs uppercase tracking-wide">
														Disponibilité pour
														visite
													</span>
													<p className="text-gray-900 font-medium text-base">
														📅{' '}
														{
															searchAd.clientInfo
																.timelineInfo
																.visitAvailability
														}
													</p>
												</div>
											)}
											{searchAd.clientInfo.timelineInfo
												.idealMoveInDate && (
												<div>
													<span className="font-semibold text-gray-600 block mb-1 text-xs uppercase tracking-wide">
														Date idéale
														d&apos;emménagement
													</span>
													<p className="text-gray-900 font-medium text-base">
														🏠{' '}
														{new Date(
															searchAd.clientInfo.timelineInfo.idealMoveInDate,
														).toLocaleDateString(
															'fr-FR',
															{
																day: 'numeric',
																month: 'long',
																year: 'numeric',
															},
														)}
													</p>
												</div>
											)}
										</div>
									</div>
								)}
							</div>
						</div>
					)}

					{/* Metadata */}
					<div className="group bg-white p-6 rounded-xl shadow-md border border-gray-200/50 hover:shadow-xl hover:border-cyan-200 transition-all duration-300">
						<div className="flex items-center gap-3 mb-4">
							<div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-blue-500 rounded-xl flex items-center justify-center shadow-md">
								<span className="text-xl">📅</span>
							</div>
							<h3 className="text-lg font-bold text-gray-900">
								Informations
							</h3>
						</div>
						<div className="space-y-3">
							<div className="flex items-center justify-between p-2.5 bg-gray-50 rounded-lg">
								<span className="text-xs font-medium text-gray-700">
									📌 Créée le
								</span>
								<p className="text-gray-900 font-semibold text-base">
									{new Date(
										searchAd.createdAt,
									).toLocaleDateString('fr-FR', {
										year: 'numeric',
										month: 'long',
										day: 'numeric',
									})}
								</p>
							</div>

							<div className="flex items-center justify-between p-2.5 bg-gray-50 rounded-lg">
								<span className="text-xs font-medium text-gray-700">
									🔄 Mise à jour
								</span>
								<p className="text-gray-900 font-semibold text-base">
									{new Date(
										searchAd.updatedAt,
									).toLocaleDateString('fr-FR', {
										year: 'numeric',
										month: 'long',
										day: 'numeric',
									})}
								</p>
							</div>
						</div>
					</div>

					{/* Contact Section */}
					<div className="bg-gradient-to-br from-cyan-50 to-blue-50 p-6 rounded-xl shadow-md border-2 border-cyan-200">
						<div className="flex items-center gap-3 mb-5">
							<div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl flex items-center justify-center shadow-md">
								<span className="text-xl">💬</span>
							</div>
							<h3 className="text-lg font-bold text-gray-900">
								Contact
							</h3>
						</div>

						<div className="flex items-center gap-3.5 mb-5 bg-white p-3.5 rounded-xl shadow-sm">
							<ProfileAvatar
								user={searchAd.authorId}
								size="lg"
								className="w-12 h-12 ring-2 ring-cyan-200"
							/>
							<div>
								<h4 className="font-bold text-gray-900 text-base">
									{searchAd.authorId.firstName}{' '}
									{searchAd.authorId.lastName}
								</h4>
								<p className="text-xs text-gray-600 font-medium">
									{searchAd.authorType === 'agent'
										? '🏢 Agent immobilier'
										: "🤝 Apporteur d'affaires"}
								</p>
							</div>
						</div>

						{!isOwner && (
							<button
								onClick={handleContact}
								className="w-full px-4 py-3.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white rounded-xl transition-all duration-200 font-semibold flex items-center justify-center gap-2.5 mb-4 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 text-sm"
							>
								<svg
									className="w-4 h-4"
									fill="none"
									stroke="currentColor"
									viewBox="0 0 24 24"
								>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth={2}
										d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
									/>
								</svg>
								<span>Contacter l&apos;auteur</span>
							</button>
						)}

						<div className="bg-white p-3.5 rounded-xl">
							<h4 className="font-bold text-gray-900 mb-2.5 flex items-center gap-2 text-sm">
								<span>📤</span>
								<span>Partager cette annonce</span>
							</h4>
							<button
								onClick={() => {
									if (navigator.share) {
										navigator.share({
											title: searchAd.title,
											text: `Découvrez cette recherche immobilière: ${searchAd.title}`,
											url: window.location.href,
										});
									} else {
										navigator.clipboard.writeText(
											window.location.href,
										);
										alert(
											'Lien copié dans le presse-papiers!',
										);
									}
								}}
								className="w-full px-3.5 py-2.5 bg-white border-2 border-gray-300 hover:border-cyan-500 hover:bg-cyan-50 text-gray-700 hover:text-cyan-700 rounded-lg transition-all duration-200 font-semibold flex items-center justify-center gap-2 group text-xs"
							>
								<svg
									className="w-4 h-4 group-hover:rotate-12 transition-transform duration-200"
									fill="none"
									stroke="currentColor"
									viewBox="0 0 24 24"
								>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth={2}
										d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
									/>
								</svg>
								<span>Partager le lien</span>
							</button>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};
