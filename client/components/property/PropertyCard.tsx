import React from 'react';
import Link from 'next/link';
import { Property } from '@/lib/api/propertyApi';
import { getImageUrl } from '@/lib/utils/imageUtils';
import { ProfileAvatar, FavoriteButton } from '../ui';
import { getBadgeConfig } from '@/lib/constants/badges';

interface PropertyCardProps {
	property: Property;
	onFavoriteToggle?: (propertyId: string, isFavorite: boolean) => void;
}

export const PropertyCard: React.FC<PropertyCardProps> = ({
	property,
	onFavoriteToggle,
}) => {
	return (
		<Link href={`/property/${property._id}`} className="block">
			<div className="bg-white shadow-md rounded-lg overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2">
				{/* Image with badges */}
				<div className="relative">
					<img
						src={getImageUrl(property.mainImage, 'medium')}
						alt={property.title}
						className="w-full h-48 object-cover"
						onError={(e) => {
							(e.target as HTMLImageElement).src = getImageUrl(
								undefined,
								'medium',
							);
						}}
					/>
					<div className="absolute top-2 left-2 flex flex-wrap gap-1 max-w-[70%]">
						{property.badges &&
							property.badges.length > 0 &&
							property.badges.map((badgeValue) => {
								const config = getBadgeConfig(badgeValue);
								if (!config) return null;

								return (
									<span
										key={badgeValue}
										className={`${config.bgColor} ${config.color} text-xs px-2 py-1 rounded-full`}
									>
										{config.label}
									</span>
								);
							})}
					</div>
					{/* Favorite Button */}
					<div className="absolute top-2 right-2">
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
				<div className="p-4">
					<div className="flex items-center justify-between mb-2">
						<div className="flex items-baseline space-x-2">
							<p className="text-2xl font-bold text-black">
								{property.price.toLocaleString()} €
							</p>
							<p className="text-sm text-gray-600">
								{property.surface} m²
							</p>
						</div>
					</div>

					<h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-1">
						{property.title}
					</h3>

					<p className="text-gray-600 text-sm mb-3 line-clamp-2">
						{property.description}
					</p>

					<div className="flex flex-wrap gap-2 mb-3">
						<span className="bg-blue-100 text-blue-800 text-xs font-semibold px-2 py-1 rounded">
							{property.propertyType}
						</span>
						<span className="bg-gray-100 text-gray-800 text-xs font-semibold px-2 py-1 rounded">
							{property.city}
						</span>
						{property.rooms && (
							<span className="bg-green-100 text-green-800 text-xs font-semibold px-2 py-1 rounded">
								{property.rooms} pièce
								{property.rooms > 1 ? 's' : ''}
							</span>
						)}
						{property.bedrooms && (
							<span className="bg-purple-100 text-purple-800 text-xs font-semibold px-2 py-1 rounded">
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
								<span className="bg-indigo-100 text-indigo-800 text-xs font-semibold px-2 py-1 rounded">
									{property.parkingSpaces} parking
									{property.parkingSpaces > 1 ? 's' : ''}
								</span>
							)}
					</div>

					{/* Owner info */}
					<div className="flex items-center justify-between">
						<div className="flex items-center space-x-2">
							<ProfileAvatar user={property.owner} size="sm" />
							<div>
								<p className="text-gray-700 font-medium text-sm">
									{property.owner.firstName}{' '}
									{property.owner.lastName}
								</p>
								<p className="text-gray-500 text-xs capitalize">
									{property.owner.userType}
								</p>
							</div>
						</div>
						<div className="text-right">
							<p className="text-gray-500 text-xs">
								{new Date(
									property.publishedAt || property.createdAt,
								).toLocaleDateString('fr-FR')}
							</p>
						</div>
					</div>
				</div>
			</div>
		</Link>
	);
};
