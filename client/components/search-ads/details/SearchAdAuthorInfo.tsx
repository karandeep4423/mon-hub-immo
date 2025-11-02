import React from 'react';
import { SearchAd } from '@/types/searchAd';
import { ProfileAvatar } from '@/components/ui/ProfileAvatar';

interface SearchAdAuthorInfoProps {
	searchAd: SearchAd;
}

export const SearchAdAuthorInfo: React.FC<SearchAdAuthorInfoProps> = ({
	searchAd,
}) => {
	return (
		<div className="bg-gradient-to-r from-white to-gray-50 p-5 rounded-xl shadow-md border border-gray-200/50 hover:shadow-lg transition-shadow duration-300">
			<div className="flex items-center gap-4">
				<ProfileAvatar
					user={searchAd.authorId}
					size="lg"
					className="w-14 h-14 ring-4 ring-white shadow-md"
				/>
				<div className="flex-1">
					<h3 className="text-lg font-bold text-gray-900 mb-1">
						{searchAd.authorId.firstName}{' '}
						{searchAd.authorId.lastName}
					</h3>
					<p className="text-sm text-gray-600 font-medium">
						{searchAd.authorType === 'agent'
							? '🏢 Agent immobilier professionnel'
							: "🤝 Apporteur d'affaires"}
					</p>
				</div>
			</div>
		</div>
	);
};
