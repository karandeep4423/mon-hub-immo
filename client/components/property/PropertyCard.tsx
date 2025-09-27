import React from 'react';
import Link from 'next/link';
import { Property } from '@/lib/propertyService';

interface PropertyCardProps {
	property: Property;
}

export const PropertyCard: React.FC<PropertyCardProps> = ({ property }) => {
	return (
		<Link href={`/property/${property._id}`} className="block">
			<div className="bg-white shadow-md rounded-lg overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2">
				{/* Image with badges */}
				<div className="relative">
					<img
						src={property.mainImage}
						alt={property.title}
						className="w-full h-48 object-cover"
						onError={(e) => {
							(e.target as HTMLImageElement).src =
								'/placeholder-property.jpg';
						}}
					/>
					<div className="absolute top-2 left-2 flex flex-col space-y-1">
						{property.isNewProperty && (
							<span className="bg-green-500 text-white text-xs px-2 py-1 rounded-full">
								Nouveau
							</span>
						)}
						{property.isExclusive && (
							<span className="bg-yellow-500 text-white text-xs px-2 py-1 rounded-full">
								Exclusivité
							</span>
						)}
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
								{property.rooms} pièces
							</span>
						)}
					</div>

					{/* Owner info */}
					<div className="flex items-center space-x-2">
						<div className="w-8 h-8 bg-gray-300 rounded-full overflow-hidden">
							<img
								src={
									property.owner.profileImage ||
									`https://ui-avatars.com/api/?name=${encodeURIComponent(
										property.owner.firstName +
											' ' +
											property.owner.lastName,
									)}&background=3b82f6&color=ffffff`
								}
								alt={`${property.owner.firstName} ${property.owner.lastName}`}
								className="w-full h-full object-cover"
							/>
						</div>
						<div>
							<p className="text-gray-700 font-medium text-sm">
								{property.owner.firstName}{' '}
								{property.owner.lastName}
							</p>
						</div>
					</div>
				</div>
			</div>
		</Link>
	);
};
