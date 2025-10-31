'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { SearchAd } from '@/types/searchAd';
import { ProfileAvatar, FavoriteButton, RichTextDisplay } from '../ui';
import { useAuth } from '@/hooks/useAuth';
import { useCollaborationsBySearchAd } from '@/hooks/useCollaborations';
import { Features, Components } from '@/lib/constants';
import { formatDateShort } from '@/lib/utils/date';

interface HomeSearchAdCardProps {
	searchAd: SearchAd;
}

export const HomeSearchAdCard: React.FC<HomeSearchAdCardProps> = ({
	searchAd,
}) => {
	const { user } = useAuth();

	// Use SWR to get collaboration status (optional)
	const { data: collaborationsData } = useCollaborationsBySearchAd(
		user ? searchAd._id : undefined,
		{ skip: !user },
	);

	// Find blocking collaboration status
	const collaborationStatus = collaborationsData.find((c) =>
		['pending', 'accepted', 'active'].includes(c.status as string),
	)?.status as 'pending' | 'accepted' | 'active' | undefined;

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
				{/* Header section with image and badges */}
				<div className="relative h-48 overflow-hidden">
					<Image
						src="/recherches-des-biens.png"
						alt={Components.UI.IMAGE_ALT_TEXT.searchAdImage}
						fill
						className="object-cover"
					/>
					{/* Badges overlay */}
					<div className="absolute top-2 left-2 flex flex-wrap gap-1 max-w-[70%]">
						{searchAd.badges &&
							searchAd.badges.length > 0 &&
							searchAd.badges.slice(0, 4).map((badgeValue) => {
								const config =
									Features.Properties.getSearchAdBadgeConfig(
										badgeValue,
									);
								if (!config) return null;

								return (
									<span
										key={badgeValue}
										className={`${config.bgColor} ${config.color} text-xs px-2 py-1 rounded-full font-semibold`}
									>
										{config.label}
									</span>
								);
							})}
					</div>
					{/* Favorite Button */}
					<div className="absolute top-2 right-2">
						<FavoriteButton
							itemId={searchAd._id}
							itemType="searchAd"
							size="md"
						/>
					</div>
				</div>

				{/* Content section */}
				<div className="p-4 flex-1 flex flex-col">
					<h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-1">
						{searchAd.title}
					</h3>

					{searchAd.description && (
						<div className="text-gray-600 text-sm mb-3 line-clamp-2">
							<RichTextDisplay content={searchAd.description} />
						</div>
					)}

					<div className="flex flex-wrap gap-2 mb-3">
						{collaborationStatus && (
							<span className="bg-blue-500 text-white text-xs font-semibold px-2 py-1 rounded">
								ℹ️ En collaboration (
								{Features.Collaboration
									.COLLABORATION_STATUS_CONFIG[
									collaborationStatus
								]?.label || collaborationStatus}
								)
							</span>
						)}
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
							<ProfileAvatar
								user={searchAd.authorId}
								size="sm"
								className="w-8 h-8"
							/>
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
								{formatDateShort(searchAd.createdAt)}
							</p>
						</div>
					</div>
				</div>
			</div>
		</Link>
	);
};
