import React from 'react';
import { SearchAd } from '@/types/searchAd';

interface PropertyCharacteristicsCardProps {
	searchAd: SearchAd;
}

const formatFloors = (floors: string) => {
	const floorRanges = floors.split(',').map((f) => f.trim());
	return floorRanges.join(', ');
};

const formatState = (states: string[]) => {
	const stateMap: Record<string, string> = {
		new: 'Neuf',
		good: 'Bon état',
		refresh: 'À rafraîchir',
		renovate: 'À rénover',
	};
	return states.map((state) => stateMap[state] || state).join(', ');
};

export const PropertyCharacteristicsCard: React.FC<
	PropertyCharacteristicsCardProps
> = ({ searchAd }) => {
	return (
		<div className="group bg-white p-5 rounded-xl shadow-md border border-gray-200/50 hover:shadow-xl hover:border-brand-200 transition-all duration-300">
			<div className="flex items-center gap-3 mb-4">
				<div className="w-10 h-10 bg-gradient-to-br from-violet-500 to-purple-500 rounded-lg flex items-center justify-center shadow-md">
					<span className="text-xl">📐</span>
				</div>
				<h3 className="text-lg font-bold text-gray-900">
					Caractéristiques
				</h3>
			</div>
			<div className="space-y-3">
				{searchAd.minRooms && (
					<div className="flex items-center justify-between p-2.5 bg-gray-50 rounded-lg">
						<span className="text-xs font-medium text-gray-700">
							🚪 Pièces minimum
						</span>
						<span className="text-base font-bold text-gray-900">
							{searchAd.minRooms}
						</span>
					</div>
				)}

				{searchAd.minBedrooms && (
					<div className="flex items-center justify-between p-2.5 bg-gray-50 rounded-lg">
						<span className="text-xs font-medium text-gray-700">
							🛏️ Chambres minimum
						</span>
						<span className="text-base font-bold text-gray-900">
							{searchAd.minBedrooms}
						</span>
					</div>
				)}

				{searchAd.minSurface && (
					<div className="flex items-center justify-between p-2.5 bg-gray-50 rounded-lg">
						<span className="text-xs font-medium text-gray-700">
							📏 Surface minimum
						</span>
						<span className="text-base font-bold text-gray-900">
							{searchAd.minSurface} m²
						</span>
					</div>
				)}

				{searchAd.acceptedFloors && (
					<div>
						<span className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-1.5">
							Étages acceptés
						</span>
						<p className="text-gray-900 font-medium text-sm">
							{formatFloors(searchAd.acceptedFloors)}
						</p>
					</div>
				)}

				<div className="space-y-2 pt-1">
					{searchAd.hasExterior && (
						<div className="flex items-center gap-2 bg-green-50 px-3 py-1.5 rounded-lg">
							<div className="w-1.5 h-1.5 bg-green-500 rounded-full shadow-sm"></div>
							<span className="text-xs font-medium text-green-800">
								🌳 Extérieur requis
							</span>
						</div>
					)}
					{searchAd.hasParking && (
						<div className="flex items-center gap-2 bg-green-50 px-3 py-1.5 rounded-lg">
							<div className="w-1.5 h-1.5 bg-green-500 rounded-full shadow-sm"></div>
							<span className="text-xs font-medium text-green-800">
								🅿️ Parking requis
							</span>
						</div>
					)}
				</div>

				{searchAd.desiredState && searchAd.desiredState.length > 0 && (
					<div>
						<span className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-1.5">
							État souhaité
						</span>
						<p className="text-gray-900 font-medium text-sm">
							{formatState(searchAd.desiredState)}
						</p>
					</div>
				)}
			</div>
		</div>
	);
};
