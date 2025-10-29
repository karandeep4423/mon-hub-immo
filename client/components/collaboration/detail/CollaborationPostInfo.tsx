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

	// Get image source from property or collaboration.postId
	const getPropertyImage = () => {
		// Debug logging
		console.log('🔍 Debug Image Data:', {
			hasProperty: !!property,
			propertyMainImage: property?.mainImage,
			collaborationPostId: collaboration.postId,
			postType: collaboration.postType,
		});

		// First try from property prop
		if (property?.mainImage) {
			const image =
				typeof property.mainImage === 'object'
					? property.mainImage.url
					: property.mainImage;
			console.log('✅ Using property image:', image);
			return image;
		}

		// Fallback to collaboration.postId if it's populated
		if (typeof collaboration.postId === 'object') {
			const postData = collaboration.postId as PropertyDetails;
			if (postData.mainImage) {
				const image =
					typeof postData.mainImage === 'object'
						? postData.mainImage.url
						: postData.mainImage;
				console.log('✅ Using collaboration.postId image:', image);
				return image;
			}
		}

		console.log('❌ No image found');
		return null;
	};

	const propertyImageSrc = getPropertyImage();

	return (
		<Card className="p-6">
			<h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
				{collaboration.postType === 'Property'
					? '🏠 Bien immobilier'
					: '🔍 Recherche de bien'}
			</h3>

			{/* Property or SearchAd Image */}
			{collaboration.postType === 'Property' && propertyImageSrc && (
				<div className="mb-4 w-full">
					<div className="relative w-full h-48 sm:h-56 md:h-64 rounded-lg overflow-hidden bg-gray-100 shadow-md">
						<Image
							src={propertyImageSrc}
							alt={property?.title || 'Property image'}
							fill
							className="object-cover hover:scale-105 transition-transform duration-300"
							sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
							priority
						/>
					</div>
				</div>
			)}

			{collaboration.postType === 'SearchAd' && (
				<div className="mb-4 w-full">
					<div className="relative w-full h-48 sm:h-56 md:h-64 rounded-lg overflow-hidden bg-gradient-to-br from-cyan-50 to-blue-50 shadow-md flex items-center justify-center">
						<Image
							src="/recherches-des-biens.png"
							alt="Recherche de bien"
							width={200}
							height={200}
							className="opacity-80"
							priority
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
