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
		<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
			{/* Header */}
			<div className="mb-8">
				<div className="flex items-center justify-between mb-4">
					<button
						onClick={() => router.back()}
						className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
					>
						<span className="mr-2">←</span>
						Retour
					</button>

					<div className="flex items-center space-x-2">
						<span
							className={`px-3 py-1 rounded-full text-sm font-medium ${
								searchAd.status === 'active'
									? 'bg-green-100 text-green-800'
									: searchAd.status === 'paused'
										? 'bg-yellow-100 text-yellow-800'
										: 'bg-gray-100 text-gray-800'
							}`}
						>
							{searchAd.status === 'active'
								? 'Actif'
								: searchAd.status === 'paused'
									? 'En pause'
									: 'Réalisé'}
						</span>
						<span
							className={`px-3 py-1 rounded-full text-sm font-medium ${
								searchAd.authorType === 'agent'
									? 'bg-blue-100 text-blue-800'
									: 'bg-purple-100 text-purple-800'
							}`}
						>
							{searchAd.authorType === 'agent'
								? 'Agent'
								: 'Apporteur'}
						</span>
					</div>
				</div>

				<h1 className="text-3xl font-bold text-gray-900 mb-4">
					{searchAd.title}
				</h1>

				{searchAd.description && (
					<p className="text-lg text-gray-600 mb-6">
						{searchAd.description}
					</p>
				)}

				{/* Author Info */}
				<div className="flex items-center justify-between bg-white p-6 rounded-lg shadow-sm border">
					<div className="flex items-center space-x-4">
						<ProfileAvatar
							user={searchAd.authorId}
							size="lg"
							className="w-12 h-12"
						/>
						<div>
							<h3 className="font-semibold text-gray-900">
								{searchAd.authorId.firstName}{' '}
								{searchAd.authorId.lastName}
							</h3>
							<p className="text-gray-600 text-sm">
								{searchAd.authorType === 'agent'
									? 'Agent immobilier'
									: "Apporteur d'affaires"}
							</p>
						</div>
					</div>
				</div>
			</div>

			{/* Details Grid */}
			<div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
				{/* Property Criteria */}
				<div className="bg-white p-6 rounded-lg shadow-sm border">
					<h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
						🏠 Type de bien recherché
					</h3>
					<div className="space-y-3">
						<div>
							<span className="text-sm font-medium text-gray-700">
								Types :
							</span>
							<p className="text-gray-900">
								{formatPropertyTypes(searchAd.propertyTypes)}
							</p>
						</div>

						{searchAd.propertyState &&
							searchAd.propertyState.length > 0 && (
								<div>
									<span className="text-sm font-medium text-gray-700">
										État :
									</span>
									<p className="text-gray-900">
										{searchAd.propertyState.includes('new')
											? 'Neuf'
											: 'Ancien'}
									</p>
								</div>
							)}

						{searchAd.projectType && (
							<div>
								<span className="text-sm font-medium text-gray-700">
									Type de projet :
								</span>
								<p className="text-gray-900">
									{formatProjectType(searchAd.projectType)}
								</p>
							</div>
						)}
					</div>
				</div>

				{/* Location */}
				<div className="bg-white p-6 rounded-lg shadow-sm border">
					<h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
						📍 Localisation
					</h3>
					<div className="space-y-3">
						<div>
							<span className="text-sm font-medium text-gray-700">
								Zones ciblées :
							</span>
							<p className="text-gray-900">
								{searchAd.location.cities.join(', ')}
							</p>
						</div>

						{searchAd.location.maxDistance && (
							<div>
								<span className="text-sm font-medium text-gray-700">
									Distance max :
								</span>
								<p className="text-gray-900">
									{searchAd.location.maxDistance} km
								</p>
							</div>
						)}

						{searchAd.location.openToOtherAreas && (
							<div className="flex items-center space-x-2">
								<span className="w-2 h-2 bg-green-500 rounded-full"></span>
								<span className="text-sm text-gray-700">
									Ouvert à d&apos;autres zones
								</span>
							</div>
						)}
					</div>
				</div>

				{/* Budget */}
				<div className="bg-white p-6 rounded-lg shadow-sm border">
					<h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
						💰 Budget
					</h3>
					<div className="space-y-3">
						<div>
							<span className="text-sm font-medium text-gray-700">
								Budget maximum :
							</span>
							<p className="text-gray-900 text-lg font-semibold">
								{searchAd.budget.max.toLocaleString()} €
							</p>
						</div>

						{searchAd.budget.ideal && (
							<div>
								<span className="text-sm font-medium text-gray-700">
									Budget idéal :
								</span>
								<p className="text-gray-900">
									{searchAd.budget.ideal.toLocaleString()} €
								</p>
							</div>
						)}

						{searchAd.budget.financingType && (
							<div>
								<span className="text-sm font-medium text-gray-700">
									Financement :
								</span>
								<p className="text-gray-900">
									{formatFinancingType(
										searchAd.budget.financingType,
									)}
								</p>
							</div>
						)}

						<div className="space-y-2">
							{searchAd.budget.isSaleInProgress && (
								<div className="flex items-center space-x-2">
									<span className="w-2 h-2 bg-blue-500 rounded-full"></span>
									<span className="text-sm text-gray-700">
										Vente en cours
									</span>
								</div>
							)}
							{searchAd.budget.hasBankApproval && (
								<div className="flex items-center space-x-2">
									<span className="w-2 h-2 bg-green-500 rounded-full"></span>
									<span className="text-sm text-gray-700">
										Accord bancaire
									</span>
								</div>
							)}
						</div>
					</div>
				</div>

				{/* Property Characteristics */}
				<div className="bg-white p-6 rounded-lg shadow-sm border">
					<h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
						📐 Caractéristiques
					</h3>
					<div className="space-y-3">
						{searchAd.minRooms && (
							<div>
								<span className="text-sm font-medium text-gray-700">
									Pièces minimum :
								</span>
								<p className="text-gray-900">
									{searchAd.minRooms}
								</p>
							</div>
						)}

						{searchAd.minBedrooms && (
							<div>
								<span className="text-sm font-medium text-gray-700">
									Chambres minimum :
								</span>
								<p className="text-gray-900">
									{searchAd.minBedrooms}
								</p>
							</div>
						)}

						{searchAd.minSurface && (
							<div>
								<span className="text-sm font-medium text-gray-700">
									Surface minimum :
								</span>
								<p className="text-gray-900">
									{searchAd.minSurface} m²
								</p>
							</div>
						)}

						{searchAd.acceptedFloors && (
							<div>
								<span className="text-sm font-medium text-gray-700">
									Étages acceptés :
								</span>
								<p className="text-gray-900">
									{formatFloors(searchAd.acceptedFloors)}
								</p>
							</div>
						)}

						<div className="space-y-2">
							{searchAd.hasExterior && (
								<div className="flex items-center space-x-2">
									<span className="w-2 h-2 bg-green-500 rounded-full"></span>
									<span className="text-sm text-gray-700">
										Extérieur requis
									</span>
								</div>
							)}
							{searchAd.hasParking && (
								<div className="flex items-center space-x-2">
									<span className="w-2 h-2 bg-green-500 rounded-full"></span>
									<span className="text-sm text-gray-700">
										Parking requis
									</span>
								</div>
							)}
						</div>

						{searchAd.desiredState &&
							searchAd.desiredState.length > 0 && (
								<div>
									<span className="text-sm font-medium text-gray-700">
										État souhaité :
									</span>
									<p className="text-gray-900">
										{formatState(searchAd.desiredState)}
									</p>
								</div>
							)}
					</div>
				</div>

				{/* Priorities */}
				{searchAd.priorities && (
					<div className="bg-white p-6 rounded-lg shadow-sm border lg:col-span-2">
						<h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
							❤️ Priorités personnelles
						</h3>
						<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
							{searchAd.priorities.mustHaves &&
								searchAd.priorities.mustHaves.length > 0 && (
									<div>
										<h4 className="font-medium text-gray-900 mb-2">
											Indispensables
										</h4>
										<div className="space-y-1">
											{searchAd.priorities.mustHaves.map(
												(item, index) => (
													<div
														key={index}
														className="flex items-center space-x-2"
													>
														<span className="w-2 h-2 bg-red-500 rounded-full"></span>
														<span className="text-sm text-gray-700">
															{item}
														</span>
													</div>
												),
											)}
										</div>
									</div>
								)}

							{searchAd.priorities.niceToHaves &&
								searchAd.priorities.niceToHaves.length > 0 && (
									<div>
										<h4 className="font-medium text-gray-900 mb-2">
											Souhaitables
										</h4>
										<div className="space-y-1">
											{searchAd.priorities.niceToHaves.map(
												(item, index) => (
													<div
														key={index}
														className="flex items-center space-x-2"
													>
														<span className="w-2 h-2 bg-yellow-500 rounded-full"></span>
														<span className="text-sm text-gray-700">
															{item}
														</span>
													</div>
												),
											)}
										</div>
									</div>
								)}

							{searchAd.priorities.dealBreakers &&
								searchAd.priorities.dealBreakers.length > 0 && (
									<div>
										<h4 className="font-medium text-gray-900 mb-2">
											Points de blocage
										</h4>
										<div className="space-y-1">
											{searchAd.priorities.dealBreakers.map(
												(item, index) => (
													<div
														key={index}
														className="flex items-center space-x-2"
													>
														<span className="w-2 h-2 bg-gray-500 rounded-full"></span>
														<span className="text-sm text-gray-700">
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

				{/* Metadata */}
				<div className="bg-white p-6 rounded-lg shadow-sm border">
					<h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
						📅 Informations
					</h3>
					<div className="space-y-3">
						<div>
							<span className="text-sm font-medium text-gray-700">
								Créée le :
							</span>
							<p className="text-gray-900">
								{new Date(
									searchAd.createdAt,
								).toLocaleDateString('fr-FR', {
									year: 'numeric',
									month: 'long',
									day: 'numeric',
								})}
							</p>
						</div>

						<div>
							<span className="text-sm font-medium text-gray-700">
								Mise à jour :
							</span>
							<p className="text-gray-900">
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

				{/* Contact Section - Compact size matching screenshot */}
				<div className="bg-white p-6 rounded-lg shadow-sm border">
					<h3 className="text-lg font-semibold text-gray-900 mb-4">
						Contact
					</h3>

					<div className="flex items-center space-x-3 mb-4">
						<div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center">
							<span className="text-white font-medium">
								{searchAd.authorId.firstName[0]}
								{searchAd.authorId.lastName[0]}
							</span>
						</div>
						<div>
							<h4 className="font-semibold text-gray-900">
								{searchAd.authorId.firstName}{' '}
								{searchAd.authorId.lastName}
							</h4>
							<p className="text-sm text-gray-600">
								{searchAd.authorType === 'agent'
									? 'Agent immobilier'
									: "Apporteur d'affaires"}
							</p>
						</div>
					</div>

					{!isOwner && (
						<button
							onClick={handleContact}
							className="w-full px-4 py-3 bg-cyan-500 hover:bg-cyan-600 text-white rounded-lg transition-colors font-medium flex items-center justify-center space-x-2 mb-4"
						>
							<span>💬</span>
							<span>Contacter l&apos;agent</span>
						</button>
					)}

					<div>
						<h4 className="font-medium text-gray-900 mb-3">
							Partager la fiche
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
									alert('Lien copié dans le presse-papiers!');
								}
							}}
							className="w-full px-4 py-2 bg-white border border-gray-300 hover:border-gray-400 text-gray-700 rounded-lg transition-colors font-medium flex items-center justify-center space-x-2"
						>
							<span>🔗</span>
							<span>Partager</span>
						</button>
					</div>
				</div>
			</div>
		</div>
	);
};
