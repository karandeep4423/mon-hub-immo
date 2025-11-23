'use client';

import React, { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { SearchAd } from '@/types/searchAd';
import { User } from '@/types/auth';
import { ProposeCollaborationModal } from '../collaboration/ProposeCollaborationModal';
import { useCollaborationsBySearchAd } from '@/hooks/useCollaborations';
import { canViewFullAddress } from '@/lib/utils/addressPrivacy';
import { Features } from '@/lib/constants';
import {
	SearchAdHeader,
	SearchAdAuthorInfo,
	PropertyCriteriaCard,
	LocationCard,
	BudgetCard,
	PropertyCharacteristicsCard,
	PrioritiesCard,
	SearchAdMetaCard,
	ContactCard,
} from './details';

interface SearchAdDetailsProps {
	searchAd: SearchAd;
	currentUser: User | null;
}

export const SearchAdDetails: React.FC<SearchAdDetailsProps> = ({
	searchAd,
	currentUser,
}) => {
	const router = useRouter();
	// Defensive author fallback
	const author = searchAd.authorId ?? {
		_id: '',
		firstName: 'Anonyme',
		lastName: '',
		userType: 'utilisateur',
	};
	const isOwner = currentUser?._id === author._id;
	const [showCollaborationModal, setShowCollaborationModal] = useState(false);

	// Fetch collaborations using SWR - skip if user is owner or not authenticated
	const shouldFetchCollabs = !isOwner && !!currentUser;
	const { data: collaborations, refetch: refetchCollaborations } =
		useCollaborationsBySearchAd(
			shouldFetchCollabs ? searchAd._id : undefined,
			{
				skip: !shouldFetchCollabs,
			},
		);

	// Check for blocking collaboration
	const { hasBlockingCollab, blockingStatus } = useMemo(() => {
		const blocking = collaborations.find((c) =>
			['pending', 'accepted', 'active'].includes(c.status as string),
		);
		return {
			hasBlockingCollab: !!blocking,
			blockingStatus: blocking
				? (blocking.status as 'pending' | 'accepted' | 'active')
				: null,
		};
	}, [collaborations]);

	// Determine if user can view full location details
	const canViewFullLocation = canViewFullAddress(
		isOwner,
		collaborations,
		currentUser?._id,
	);

	const handleContact = () => {
		if (!currentUser) {
			router.push(Features.Auth.AUTH_ROUTES.LOGIN);
			return;
		}
		if (!author._id) return;
		router.push(
			`/chat?userId=${author._id}&searchAdId=${searchAd._id}&type=search-ad-contact`,
		);
	};

	const handleCollaborate = () => {
		if (!currentUser) {
			router.push(Features.Auth.AUTH_ROUTES.LOGIN);
			return;
		}
		setShowCollaborationModal(true);
	};

	return (
		<div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
				<SearchAdHeader searchAd={searchAd} />

				<div className="mb-6">
					<SearchAdAuthorInfo searchAd={searchAd} />
				</div>

				{/* Details Grid */}
				<div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-5">
					<PropertyCriteriaCard searchAd={searchAd} />
					<LocationCard
						searchAd={searchAd}
						canViewFullLocation={canViewFullLocation}
					/>
					<BudgetCard searchAd={searchAd} />

					<PropertyCharacteristicsCard searchAd={searchAd} />

					<PrioritiesCard searchAd={searchAd} />

					{/* Client Information */}
					{searchAd.clientInfo && (
						<div className="lg:col-span-2 xl:col-span-3 bg-gradient-to-br from-brand-50 to-brand-100 border-brand-200 p-5 rounded-xl shadow-md border-2">
							<div className="flex items-center gap-3 mb-3">
								<div className="w-10 h-10 bg-gradient-to-br from-brand to-brand-600 rounded-xl flex items-center justify-center shadow-md">
									<span className="text-xl">ℹ️</span>
								</div>
								<h3 className="text-lg font-bold text-gray-900">
									Informations sur le client
								</h3>
							</div>
							<p className="text-xs text-brand-700 mb-4 font-medium">
								💡 Ces informations vous aident à mieux
								comprendre les besoins et la situation du
								client.
							</p>

							<div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
								{/* Qualification Info */}
								{searchAd.clientInfo?.qualificationInfo && (
									<div className="bg-white p-4 rounded-xl shadow-sm border border-brand-100">
										<h4 className="font-bold text-gray-900 mb-3 flex items-center gap-2 text-base">
											<span>👤</span>
											<span>
												Informations de qualification
											</span>
										</h4>
										<div className="space-y-3">
											{searchAd.clientInfo
												.qualificationInfo
												.clientName && (
												<div className="pb-2.5 border-b border-gray-100">
													<span className="font-semibold text-gray-600 block mb-1 text-xs uppercase tracking-wide">
														Nom du client
													</span>
													<p className="text-gray-900 font-medium text-sm">
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
													<p className="text-gray-900 font-medium text-sm">
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
													<p className="text-gray-900 font-medium text-sm">
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
													<p className="text-gray-900 font-medium text-sm">
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
														className={`font-medium text-sm ${searchAd.clientInfo.qualificationInfo.hasRealEstateAgent ? 'text-green-700' : 'text-red-700'}`}
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
														className={`font-medium text-sm ${searchAd.clientInfo.qualificationInfo.hasVisitedProperties ? 'text-green-700' : 'text-gray-700'}`}
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
									<div className="bg-white p-4 rounded-xl shadow-sm border border-brand-100">
										<h4 className="font-bold text-gray-900 mb-3 flex items-center gap-2 text-base">
											<span>⏰</span>
											<span>Délai et disponibilité</span>
										</h4>
										<div className="space-y-3">
											{searchAd.clientInfo.timelineInfo
												.urgency && (
												<div className="pb-2.5 border-b border-gray-100">
													<span className="font-semibold text-gray-600 block mb-1 text-xs uppercase tracking-wide">
														Niveau d&apos;urgence
													</span>
													<p
														className={`font-bold text-sm ${
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
													<p className="text-gray-900 font-medium text-sm">
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
													<p className="text-gray-900 font-medium text-sm">
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

					<SearchAdMetaCard searchAd={searchAd} />

					<ContactCard
						searchAd={searchAd}
						isOwner={isOwner}
						hasBlockingCollab={hasBlockingCollab}
						blockingStatus={blockingStatus}
						onContact={handleContact}
						onCollaborate={handleCollaborate}
					/>
				</div>
			</div>

			{/* Collaboration Modal */}
			<ProposeCollaborationModal
				isOpen={showCollaborationModal}
				onClose={() => setShowCollaborationModal(false)}
				post={{
					type: 'searchAd',
					id: searchAd._id,
					ownerUserType: searchAd.authorType,
					data: {
						_id: searchAd._id,
						title: searchAd.title,
						description: searchAd.description,
						location: searchAd.location,
						budget: searchAd.budget,
						propertyTypes: searchAd.propertyTypes,
						authorType: searchAd.authorType,
					},
				}}
				onSuccess={() => {
					setShowCollaborationModal(false);
					refetchCollaborations();
				}}
			/>
		</div>
	);
};
