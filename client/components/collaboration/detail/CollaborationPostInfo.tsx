'use client';

import React from 'react';
import Image from 'next/image';
import { Card } from '@/components/ui/Card';
import { Collaboration } from '@/types/collaboration';
import { Property } from '@/lib/api/propertyApi';
import type { SearchAd } from '@/types/searchAd';
import { Features } from '@/lib/constants';

type PropertyDetails = Partial<Property> & { id?: string };

interface CollaborationPostInfoProps {
	collaboration: Collaboration;
	property: Property | null;
	searchAd: SearchAd | null;
}

export const CollaborationPostInfo: React.FC<CollaborationPostInfoProps> = ({
	collaboration,
	property,
	searchAd,
}) => {
	const postLink = `/${collaboration.postType === 'Property' ? 'property' : 'search-ads'}/${
		typeof collaboration.postId === 'object'
			? (collaboration.postId as PropertyDetails)?._id ||
				(collaboration.postId as PropertyDetails)?.id
			: collaboration.postId
	}`;

	return (
		<Card className="p-6">
			<h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
				{collaboration.postType === 'Property'
					? '🏠 Bien immobilier'
					: '🔍 Recherche de bien'}
			</h3>

			{/* Property Main Image */}
			{collaboration.postType === 'Property' && property?.mainImage && (
				<div className="mb-4">
					<div className="w-full h-32 rounded-lg overflow-hidden bg-gray-100 relative">
						<Image
							src={
								typeof property.mainImage === 'object'
									? property.mainImage.url
									: property.mainImage
							}
							alt={property.title || 'Property image'}
							fill
							className="object-cover"
							onError={(e) => {
								const target = e.target as HTMLImageElement;
								target.style.display = 'none';
							}}
						/>
					</div>
				</div>
			)}

			<div className="space-y-3">
				<div>
					<span className="text-sm text-gray-600">
						{collaboration.postType === 'Property'
							? 'Détails du bien:'
							: 'Détails de la recherche:'}
					</span>
					<a
						href={postLink}
						target="_blank"
						rel="noopener noreferrer"
						className="font-medium text-blue-600 hover:text-blue-800 hover:underline block"
					>
						Voir l&apos;annonce
					</a>
				</div>

				{/* Property-specific fields */}
				{collaboration.postType === 'Property' && property && (
					<>
						{property.title && (
							<div>
								<span className="text-sm text-gray-600">
									Titre:
								</span>
								<p className="font-medium">{property.title}</p>
							</div>
						)}
						{property.formattedPrice && (
							<div>
								<span className="text-sm text-gray-600">
									Prix:
								</span>
								<p className="font-medium">
									{property.formattedPrice}
								</p>
							</div>
						)}
						<div>
							<span className="text-sm text-gray-600">
								Surface:
							</span>
							<p className="font-medium">
								{property.surface
									? `${property.surface} m²`
									: 'Non spécifié'}
							</p>
						</div>
						<div>
							<span className="text-sm text-gray-600">
								Localisation:
							</span>
							<p className="font-medium">
								{property.address || 'Ville'}
							</p>
						</div>
					</>
				)}

				{/* SearchAd-specific fields */}
				{collaboration.postType === 'SearchAd' && searchAd && (
					<>
						{searchAd.title && (
							<div>
								<span className="text-sm text-gray-600">
									Titre:
								</span>
								<p className="font-medium">{searchAd.title}</p>
							</div>
						)}
						{searchAd.budget && (
							<div>
								<span className="text-sm text-gray-600">
									Budget:
								</span>
								<p className="font-medium">
									{searchAd.budget.ideal
										? `Idéal: ${new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(searchAd.budget.ideal)}`
										: `Max: ${new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(searchAd.budget.max)}`}
								</p>
							</div>
						)}
						{searchAd.propertyTypes &&
							searchAd.propertyTypes.length > 0 && (
								<div>
									<span className="text-sm text-gray-600">
										Types de bien:
									</span>
									<p className="font-medium">
										{searchAd.propertyTypes.join(', ')}
									</p>
								</div>
							)}
						{searchAd.location && (
							<div>
								<span className="text-sm text-gray-600">
									Localisation:
								</span>
								<p className="font-medium">
									{Array.isArray(searchAd.location.cities)
										? searchAd.location.cities.join(', ')
										: 'Localisation'}
								</p>
							</div>
						)}
					</>
				)}

				<div>
					<span className="text-sm text-gray-600">Statut:</span>
					<span
						className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ml-2 ${
							collaboration.status ===
							Features.Collaboration.COLLABORATION_STATUS_VALUES
								.ACTIVE
								? 'bg-green-100 text-green-800'
								: collaboration.status ===
									  Features.Collaboration
											.COLLABORATION_STATUS_VALUES.PENDING
									? 'bg-yellow-100 text-yellow-800'
									: 'bg-gray-100 text-gray-800'
						}`}
					>
						{collaboration.status ===
						Features.Collaboration.COLLABORATION_STATUS_VALUES
							.ACTIVE
							? 'Active'
							: collaboration.status ===
								  Features.Collaboration
										.COLLABORATION_STATUS_VALUES.PENDING
								? 'En attente'
								: collaboration.status}
					</span>
				</div>
			</div>
		</Card>
	);
};
