import React from 'react';
import { SearchAd } from '@/types/searchAd';

interface LocationCardProps {
	searchAd: SearchAd;
}

export const LocationCard: React.FC<LocationCardProps> = ({ searchAd }) => {
	return (
		<div className="group bg-white p-6 rounded-xl shadow-md border border-gray-200/50 hover:shadow-xl hover:border-cyan-200 transition-all duration-300">
			<div className="flex items-center gap-3 mb-4">
				<div className="w-10 h-10 bg-gradient-to-br from-red-500 to-pink-500 rounded-lg flex items-center justify-center shadow-md">
					<span className="text-xl">📍</span>
				</div>
				<h3 className="text-lg font-bold text-gray-900">
					Localisation
				</h3>
			</div>
			<div className="space-y-3">
				<div>
					<span className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-1.5">
						Zones ciblées
					</span>
					<p className="text-gray-900 font-medium text-base">
						{searchAd.location.cities.join(', ')}
					</p>
				</div>

				{searchAd.location.maxDistance && (
					<div>
						<span className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-1.5">
							Distance maximale
						</span>
						<p className="text-gray-900 font-medium text-base">
							🚗 {searchAd.location.maxDistance} km
						</p>
					</div>
				)}

				{searchAd.location.openToOtherAreas && (
					<div className="flex items-center gap-2 bg-green-50 px-3 py-2 rounded-lg border border-green-200">
						<div className="w-2 h-2 bg-green-500 rounded-full animate-pulse shadow-sm"></div>
						<span className="text-xs font-medium text-green-800">
							Ouvert à d&apos;autres zones
						</span>
					</div>
				)}
			</div>
		</div>
	);
};
