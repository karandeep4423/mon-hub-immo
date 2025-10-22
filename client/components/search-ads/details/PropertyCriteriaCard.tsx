import React from 'react';
import { SearchAd } from '@/types/searchAd';

interface PropertyCriteriaCardProps {
	searchAd: SearchAd;
}

const formatPropertyTypes = (types: string[]) => {
	const typeMap: Record<string, string> = {
		house: 'Maison',
		apartment: 'Appartement',
		land: 'Terrain',
		building: 'Immeuble',
		commercial: 'Commercial',
	};
	return types.map((type) => typeMap[type] || type).join(', ');
};

const formatProjectType = (type: string) => {
	const typeMap: Record<string, string> = {
		primary: 'Résidence principale',
		secondary: 'Résidence secondaire',
		investment: 'Investissement',
	};
	return typeMap[type] || type;
};

export const PropertyCriteriaCard: React.FC<PropertyCriteriaCardProps> = ({
	searchAd,
}) => {
	return (
		<div className="group bg-white p-6 rounded-xl shadow-md border border-gray-200/50 hover:shadow-xl hover:border-cyan-200 transition-all duration-300">
			<div className="flex items-center gap-3 mb-4">
				<div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-lg flex items-center justify-center shadow-md">
					<span className="text-xl">🏠</span>
				</div>
				<h3 className="text-lg font-bold text-gray-900">
					Type de bien recherché
				</h3>
			</div>
			<div className="space-y-3">
				<div>
					<span className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-1.5">
						Types de propriété
					</span>
					<p className="text-gray-900 font-medium text-base">
						{formatPropertyTypes(searchAd.propertyTypes)}
					</p>
				</div>

				{searchAd.propertyState &&
					searchAd.propertyState.length > 0 && (
						<div>
							<span className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-1.5">
								État du bien
							</span>
							<p className="text-gray-900 font-medium text-base">
								{searchAd.propertyState.includes('new')
									? '✨ Neuf'
									: '🏘️ Ancien'}
							</p>
						</div>
					)}

				{searchAd.projectType && (
					<div>
						<span className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-1.5">
							Type de projet
						</span>
						<p className="text-gray-900 font-medium text-base">
							{formatProjectType(searchAd.projectType)}
						</p>
					</div>
				)}
			</div>
		</div>
	);
};
