'use client';

import React from 'react';
import { Card } from '@/components/ui/Card';
import { Collaboration } from '@/types/collaboration';
import { Property } from '@/lib/api/propertyApi';

type PropertyDetails = Partial<Property> & { id?: string };

interface CollaborationClientInfoProps {
	collaboration: Collaboration;
	property: Property | null;
}

export const CollaborationClientInfo: React.FC<
	CollaborationClientInfoProps
> = ({ collaboration, property }) => {
	const isActive = [' accepted', 'active', 'completed'].includes(
		collaboration.status,
	);

	if (
		collaboration.postType !== 'Property' ||
		!property?.clientInfo ||
		!isActive
	) {
		return null;
	}

	const clientInfo = (collaboration.postId as PropertyDetails)?.clientInfo;

	return (
		<Card className="p-6 bg-blue-50 border-blue-200">
			<h3 className="text-lg font-medium text-gray-900 mb-4">
				🔒 Informations client confidentielles
			</h3>
			<p className="text-sm text-blue-600 mb-4">
				Ces informations sont confidentielles et uniquement visibles
				dans le cadre de cette collaboration.
			</p>

			{/* Commercial Details */}
			{clientInfo?.commercialDetails && (
				<div className="mb-6 p-4 bg-white rounded-lg">
					<h4 className="font-medium text-gray-900 mb-3 flex items-center">
						<span className="mr-2">💡</span>
						Détails commerciaux
					</h4>
					<div className="space-y-3 text-sm">
						{clientInfo.commercialDetails.strengths && (
							<div>
								<span className="font-medium text-gray-700">
									Points forts:
								</span>
								<p className="text-gray-600 mt-1">
									{clientInfo.commercialDetails.strengths}
								</p>
							</div>
						)}
						{clientInfo.commercialDetails.weaknesses && (
							<div>
								<span className="font-medium text-gray-700">
									Points faibles:
								</span>
								<p className="text-gray-600 mt-1">
									{clientInfo.commercialDetails.weaknesses}
								</p>
							</div>
						)}
						{clientInfo.commercialDetails.occupancyStatus && (
							<div>
								<span className="font-medium text-gray-700">
									Occupation:
								</span>
								<span className="ml-2 text-gray-600">
									{clientInfo.commercialDetails
										.occupancyStatus === 'occupied'
										? 'Occupé'
										: 'Vide'}
								</span>
							</div>
						)}
					</div>
				</div>
			)}

			{/* Property History */}
			{clientInfo?.propertyHistory && (
				<div className="mb-6 p-4 bg-white rounded-lg">
					<h4 className="font-medium text-gray-900 mb-3 flex items-center">
						<span className="mr-2">📅</span>
						Historique du bien
					</h4>
					<div className="space-y-3 text-sm">
						{clientInfo.propertyHistory.listingDate && (
							<div>
								<span className="font-medium text-gray-700">
									Mise en vente:
								</span>
								<span className="ml-2 text-gray-600">
									{clientInfo.propertyHistory.listingDate}
								</span>
							</div>
						)}
						{typeof clientInfo.propertyHistory.totalVisits ===
							'number' && (
							<div>
								<span className="font-medium text-gray-700">
									Nombre de visites:
								</span>
								<span className="ml-2 text-gray-600">
									{clientInfo.propertyHistory.totalVisits}
								</span>
							</div>
						)}
					</div>
				</div>
			)}

			{/* Owner Information */}
			{clientInfo?.ownerInfo && (
				<div className="p-4 bg-white rounded-lg">
					<h4 className="font-medium text-gray-900 mb-3 flex items-center">
						<span className="mr-2">🤝</span>
						Informations propriétaire
					</h4>
					<div className="space-y-3 text-sm">
						{clientInfo.ownerInfo.urgentToSell && (
							<div className="text-orange-600">
								⚡ Pressés de vendre
							</div>
						)}
						{clientInfo.ownerInfo.openToNegotiation && (
							<div className="text-green-600">
								💬 Ouverts à la négociation
							</div>
						)}
						{clientInfo.ownerInfo.mandateType && (
							<div>
								<span className="font-medium text-gray-700">
									Mandat:
								</span>
								<span className="ml-2 text-gray-600 capitalize">
									{clientInfo.ownerInfo.mandateType}
								</span>
							</div>
						)}
					</div>
				</div>
			)}
		</Card>
	);
};
