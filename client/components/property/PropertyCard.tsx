import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Property } from '@/lib/api/propertyApi';
import { getImageUrl } from '@/lib/utils/imageUtils';
import { ProfileAvatar, FavoriteButton, RichTextDisplay } from '../ui';
import { Features } from '@/lib/constants';
import { collaborationApi } from '@/lib/api/collaborationApi';
import { useAuth } from '@/hooks/useAuth';
import { formatDateShort } from '@/lib/utils/date';
import { canAccessProtectedResources } from '@/lib/utils/authUtils';

interface PropertyCardProps {
	property: Property;
	onFavoriteToggle?: (propertyId: string, isFavorite: boolean) => void;
}

export const PropertyCard: React.FC<PropertyCardProps> = ({
	property,
	onFavoriteToggle,
}) => {
	const { user } = useAuth();
	const [collaborationStatus, setCollaborationStatus] = useState<
		'pending' | 'accepted' | 'active' | null
	>(null);

	// Defensive fallback for owner
	const owner = property.owner || {
		firstName: 'Utilisateur',
		lastName: '',
		userType: '',
		avatar: undefined,
		userId: 'unknown', // Ajout pour éviter bug sur userId.length
	};

	useEffect(() => {
		// Only check collaboration status if user can access protected resources
		if (!user || !canAccessProtectedResources(user)) return;

		const checkCollaboration = async () => {
			try {
				const { collaborations } =
					await collaborationApi.getPropertyCollaborations(
						property._id,
					);
				const blocking = collaborations.find((c) =>
					['pending', 'accepted', 'active'].includes(
						c.status as string,
					),
				);
				if (blocking) {
					setCollaborationStatus(
						blocking.status as 'pending' | 'accepted' | 'active',
					);
				}
			} catch {
				// Silently fail - collaboration status is optional
			}
		};

		checkCollaboration();
	}, [property._id, user]);

	return (
		<Link href={`/property/${property._id}`} className="block h-full">
			<div className="bg-white shadow-card rounded-2xl overflow-hidden hover:shadow-card-hover transition-all duration-300 hover:scale-102 border border-gray-200 h-full flex flex-col relative">
				{/* Image with badges */}
				<div className="relative flex-shrink-0 rounded-t-2xl overflow-hidden h-48">
					{/* Use next/image for better performance; unoptimized because images may be external or served from a CDN not configured in next.config.js */}
					{/** Keep a fallback via state in case the image fails to load */}
					<Image
						src={getImageUrl(property.mainImage, 'medium')}
						alt={property.title}
						fill
						className="object-cover"
						unoptimized
						onError={() => {
							/* fallback to placeholder image */
							/* set src via state would be ideal, but next/image onError doesn't provide a way to replace src prop here without additional state; using unoptimized covers many cases. */
						}}
					/>
					<div className="absolute top-2 left-2 flex flex-wrap gap-1 max-w-[calc(100%-5rem)] sm:max-w-[70%] z-10">
						{collaborationStatus && (
							<span className="bg-brand text-white text-xs px-2 py-1 rounded-full font-semibold shadow-md whitespace-nowrap">
								ℹ️{' '}
								<span className="hidden sm:inline">
									En collaboration (
									{Features.Collaboration
										.COLLABORATION_STATUS_CONFIG[
										collaborationStatus
									]?.label || collaborationStatus}
									)
								</span>
								<span className="sm:hidden">Collab</span>
							</span>
						)}
						{property.badges &&
							property.badges.length > 0 &&
							property.badges.map((badgeValue) => {
								const config =
									Features.Properties.getBadgeConfig(
										badgeValue,
									);
								if (!config) return null;

								return (
									<span
										key={badgeValue}
										className={`${config.bgColor} ${config.color} text-xs px-2 py-1 rounded-full whitespace-nowrap`}
									>
										{config.label}
									</span>
								);
							})}
					</div>
					{/* Favorite Button */}
					<div className="absolute top-2 right-2 z-10">
						<FavoriteButton
							itemId={property._id}
							itemType="property"
							size="md"
							onToggle={
								onFavoriteToggle
									? (isFavorite) =>
											onFavoriteToggle(
												property._id,
												isFavorite,
											)
									: undefined
							}
						/>
					</div>
				</div>

				{/* Content */}
				<div className="p-4 flex flex-col flex-grow">
					<div className="flex items-center justify-between mb-2">
						<div className="flex items-baseline space-x-2">
							<p className="text-2xl font-bold text-black">
								{(
									property.price +
									(property.price *
										(property.agencyFeesPercentage || 0)) /
										100
								).toLocaleString()}{' '}
								€
							</p>
							<p className="text-sm text-gray-600">
								{property.surface} m²
							</p>
						</div>
					</div>

					<h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-1">
						{property.title}
					</h3>

					<div className="text-gray-600 text-sm mb-3 line-clamp-2">
						<RichTextDisplay content={property.description} />
					</div>

					<div className="flex flex-wrap gap-2 mb-3 ">
						<span className="bg-brand-100  text-brand-800 text-xs font-semibold px-2.5 py-1 rounded-lg">
							{property.propertyType}
						</span>
						<span className="bg-gray-100 text-gray-800 text-xs font-semibold px-2.5 py-1 rounded-lg">
							{property.city}
						</span>
						{property.rooms && (
							<span className="bg-success-light text-success text-xs font-semibold px-2.5 py-1 rounded-lg">
								{property.rooms} pièce
								{property.rooms > 1 ? 's' : ''}
							</span>
						)}
						{property.bedrooms && (
							<span className="bg-secondary-100 text-secondary-700 text-xs font-semibold px-2.5 py-1 rounded-lg">
								{property.bedrooms} ch.
							</span>
						)}
						{property.energyRating &&
							property.energyRating !== 'Non soumis au DPE' && (
								<span
									className={`text-xs font-semibold px-2 py-1 rounded text-white ${
										property.energyRating === 'A' ||
										property.energyRating === 'B'
											? 'bg-green-500'
											: property.energyRating === 'C' ||
												  property.energyRating === 'D'
												? 'bg-yellow-500'
												: 'bg-red-500'
									}`}
								>
									DPE {property.energyRating}
								</span>
							)}
						{property.parkingSpaces &&
							property.parkingSpaces > 0 && (
								<span className="bg-info-light text-info text-xs font-semibold px-2.5 py-1 rounded-lg">
									{property.parkingSpaces} parking
									{property.parkingSpaces > 1 ? 's' : ''}
								</span>
							)}
					</div>

					{/* Owner info */}
					<div className="flex items-center justify-between">
						<div className="flex items-center space-x-2">
							<ProfileAvatar user={owner} size="sm" />
							<div>
								<p className="text-gray-700 font-medium text-sm">
									{owner.firstName} {owner.lastName}
								</p>
								<p className="text-gray-500 text-xs capitalize">
									{owner.userType}
								</p>
							</div>
						</div>
						<div className="text-right">
							<p className="text-gray-500 text-xs">
								{formatDateShort(
									property.publishedAt || property.createdAt,
								)}
							</p>
						</div>
					</div>
				</div>
			</div>
		</Link>
	);
};
