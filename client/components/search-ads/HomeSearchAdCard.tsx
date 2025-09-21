'use client';

import React from 'react';
import Link from 'next/link';
import { SearchAd } from '@/types/searchAd';

interface HomeSearchAdCardProps {
	searchAd: SearchAd;
}

export const HomeSearchAdCard: React.FC<HomeSearchAdCardProps> = ({
	searchAd,
}) => {
	const formatPropertyTypes = (types: string[]) => {
		const typeMap: Record<string, string> = {
			house: 'Maison',
			apartment: 'Appartement',
			land: 'Terrain',
			building: 'Immeuble',
			commercial: 'Commercial',
		};
		return types
			.slice(0, 2)
			.map((type) => typeMap[type] || type)
			.join(', ');
	};

	return (
		<Link href={`/search-ads/${searchAd._id}`} className="block">
			<div className="bg-white shadow-md rounded-lg overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 h-full flex flex-col">
				{/* Header section - similar to property image */}
				<div className="relative h-48 bg-gradient-to-r from-cyan-300 to-cyan-100 flex flex-col justify-between p-4">
					{/* Status badges at top */}
					<div className="flex justify-between items-start">
						<div className="flex flex-col space-y-1">
							<span className="bg-white/20 text-white text-xs px-2 py-1 rounded-full">
								{searchAd.status === 'active'
									? 'Actif'
									: searchAd.status === 'paused'
										? 'En pause'
										: 'Réalisé'}
							</span>
							{searchAd.authorType && (
								<span className="bg-yellow-500 text-white text-xs px-2 py-1 rounded-full">
									{searchAd.authorType === 'agent'
										? 'Agent'
										: 'Apporteur'}
								</span>
							)}
						</div>
						<div className="text-right">
							<span className="bg-blue-600 text-white text-xs px-2 py-1 rounded-full">
								Recherche Client
							</span>
						</div>
					</div>

					{/* Middle section with search criteria */}
					<div className="flex-1 flex flex-col justify-center space-y-2">
						<div className="text-center">
							<p className="text-white text-lg font-semibold">
								Recherche{' '}
								{formatPropertyTypes(searchAd.propertyTypes)}
							</p>
							<p className="text-white/90 text-sm">
								📍{' '}
								{searchAd.location.cities
									.slice(0, 2)
									.join(', ')}
								{searchAd.location.cities.length > 2
									? '...'
									: ''}
							</p>
							{(searchAd.minRooms || searchAd.minSurface) && (
								<p className="text-white/80 text-sm mt-1">
									{searchAd.minRooms
										? `${searchAd.minRooms}+ pièces`
										: ''}
									{searchAd.minRooms && searchAd.minSurface
										? ' • '
										: ''}
									{searchAd.minSurface
										? `${searchAd.minSurface}+ m²`
										: ''}
								</p>
							)}
						</div>
					</div>

					{/* Budget info at bottom */}
					<div className="mt-auto">
						<div className="flex items-baseline space-x-2">
							<p className="text-2xl font-bold text-white">
								{searchAd.budget.max.toLocaleString()} €
							</p>
							<p className="text-sm text-white/80">Budget max</p>
						</div>
					</div>
				</div>

				{/* Content section */}
				<div className="p-4 flex-1 flex flex-col">
					<div className="flex items-center justify-between mb-2">
						<div className="flex items-baseline space-x-2">
							<p className="text-lg font-bold text-black">
								Recherche{' '}
								{searchAd.minRooms
									? `${searchAd.minRooms}+ pièces`
									: 'bien'}
							</p>
							{searchAd.minSurface && (
								<p className="text-sm text-gray-600">
									{searchAd.minSurface}+ m²
								</p>
							)}
						</div>
					</div>

					<h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-1">
						{searchAd.title}
					</h3>

					{searchAd.description && (
						<p className="text-gray-600 text-sm mb-3 line-clamp-2">
							{searchAd.description}
						</p>
					)}

					<div className="flex space-x-2 mb-3">
						<span className="bg-purple-100 text-purple-800 text-xs font-semibold px-2 py-1 rounded">
							{formatPropertyTypes(searchAd.propertyTypes)}
						</span>
						<span className="bg-gray-100 text-gray-800 text-xs font-semibold px-2 py-1 rounded">
							{searchAd.location.cities.slice(0, 1).join(', ')}
							{searchAd.location.cities.length > 1 ? '...' : ''}
						</span>
						{searchAd.minRooms && (
							<span className="bg-green-100 text-green-800 text-xs font-semibold px-2 py-1 rounded">
								{searchAd.minRooms}+ pièces
							</span>
						)}
					</div>

					<div className="flex items-center justify-between mt-auto">
						<div className="flex items-center space-x-2">
							<div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center">
								<span className="text-white font-semibold text-xs">
									{searchAd.authorId.firstName[0]}
									{searchAd.authorId.lastName[0]}
								</span>
							</div>
							<div>
								<p className="text-gray-700 font-medium text-sm">
									{searchAd.authorId.firstName}{' '}
									{searchAd.authorId.lastName}
								</p>
								<p className="text-xs text-gray-500">
									{searchAd.authorType === 'agent'
										? 'Agent'
										: 'Apporteur'}
								</p>
							</div>
						</div>

						<div className="text-right">
							<p className="text-xs text-gray-500">
								{new Date(
									searchAd.createdAt,
								).toLocaleDateString('fr-FR')}
							</p>
						</div>
					</div>
				</div>
			</div>
		</Link>
	);
};
