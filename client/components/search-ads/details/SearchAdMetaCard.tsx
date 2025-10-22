import React from 'react';
import { SearchAd } from '@/types/searchAd';

interface SearchAdMetaCardProps {
	searchAd: SearchAd;
}

export const SearchAdMetaCard: React.FC<SearchAdMetaCardProps> = ({
	searchAd,
}) => {
	return (
		<div className="bg-white p-6 rounded-xl shadow-md border border-gray-200/50 hover:shadow-xl hover:border-cyan-200 transition-all duration-300">
			<div className="flex items-center gap-3 mb-4">
				<div className="w-10 h-10 bg-gradient-to-br from-gray-500 to-slate-500 rounded-lg flex items-center justify-center shadow-md">
					<span className="text-xl">ℹ️</span>
				</div>
				<h3 className="text-lg font-bold text-gray-900">
					Informations
				</h3>
			</div>
			<div className="space-y-3">
				<div className="flex items-center justify-between p-2.5 bg-gray-50 rounded-lg">
					<span className="text-xs font-medium text-gray-700">
						📌 Créée le
					</span>
					<p className="text-gray-900 font-semibold text-base">
						{new Date(searchAd.createdAt).toLocaleDateString(
							'fr-FR',
							{
								year: 'numeric',
								month: 'long',
								day: 'numeric',
							},
						)}
					</p>
				</div>

				<div className="flex items-center justify-between p-2.5 bg-gray-50 rounded-lg">
					<span className="text-xs font-medium text-gray-700">
						🔄 Mise à jour
					</span>
					<p className="text-gray-900 font-semibold text-base">
						{new Date(searchAd.updatedAt).toLocaleDateString(
							'fr-FR',
							{
								year: 'numeric',
								month: 'long',
								day: 'numeric',
							},
						)}
					</p>
				</div>
			</div>
		</div>
	);
};
