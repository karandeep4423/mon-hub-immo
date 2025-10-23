import React from 'react';
import type { Property } from '@/lib/api/propertyApi';
import { formatMonthYear } from '@/lib/utils/date';

interface PropertyFeaturesProps {
	property: Property;
}

export const PropertyFeatures = ({ property }: PropertyFeaturesProps) => {
	return (
		<div className="mt-6 bg-white rounded-lg shadow-lg p-6">
			<h2 className="text-xl font-semibold text-gray-900 mb-6">
				Caractéristiques
			</h2>
			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
				{/* Basic Property Info */}
				{property.rooms && (
					<FeatureItem
						icon="building"
						color="blue"
						label={`${property.rooms} pièces`}
					/>
				)}

				{property.bedrooms && (
					<FeatureItem
						icon="bed"
						color="purple"
						label={`${property.bedrooms} chambres`}
					/>
				)}

				{property.bathrooms && (
					<FeatureItem
						icon="bath"
						color="teal"
						label={`${property.bathrooms} salle${property.bathrooms > 1 ? 's' : ''} de bain`}
					/>
				)}

				{/* Surface Information */}
				{property.surface && (
					<FeatureItem
						icon="ruler"
						color="green"
						label={`${property.surface} m² habitable`}
					/>
				)}

				{property.landArea && (
					<FeatureItem
						icon="land"
						color="yellow"
						label={`${property.landArea} m² terrain`}
					/>
				)}

				{/* Building Information */}
				{property.floor !== undefined && (
					<FeatureItem
						icon="floor"
						color="indigo"
						label={`Étage ${property.floor}${property.totalFloors ? `/${property.totalFloors}` : ''}`}
					/>
				)}

				{property.levels && (
					<FeatureItem
						icon="levels"
						color="orange"
						label={`${property.levels} niveaux`}
					/>
				)}

				{property.parkingSpaces && (
					<FeatureItem
						icon="parking"
						color="blue"
						label={`${property.parkingSpaces} places parking`}
					/>
				)}

				{/* Property Condition & Type */}
				{property.condition && (
					<FeatureItem
						icon="check"
						color="pink"
						label={`État: ${getConditionLabel(property.condition)}`}
					/>
				)}

				{property.saleType && (
					<FeatureItem
						icon="money"
						color="red"
						label={getSaleTypeLabel(property.saleType)}
					/>
				)}

				{/* Energy Rating */}
				{property.energyRating && (
					<FeatureItem
						icon="energy"
						color="green"
						label={`DPE: ${property.energyRating}`}
					/>
				)}

				{property.gasEmissionClass && (
					<FeatureItem
						icon="gas"
						color="gray"
						label={`GES: ${property.gasEmissionClass}`}
					/>
				)}

				{/* Financial Info */}
				{property.annualCondoFees && (
					<FeatureItem
						icon="fees"
						color="yellow"
						label={`${property.annualCondoFees}€/an charges`}
					/>
				)}

				{/* Availability */}
				{property.availableFrom && (
					<FeatureItem
						icon="calendar"
						color="blue"
						label={`Disponible: ${formatMonthYear(property.availableFrom)}`}
					/>
				)}

				{/* Amenities */}
				{property.hasParking && (
					<FeatureItem
						icon="checkmark"
						color="green"
						label="Parking"
					/>
				)}

				{property.hasGarden && (
					<FeatureItem
						icon="checkmark"
						color="green"
						label="Jardin"
					/>
				)}

				{property.hasElevator && (
					<FeatureItem
						icon="checkmark"
						color="green"
						label="Ascenseur"
					/>
				)}

				{property.hasBalcony && (
					<FeatureItem
						icon="checkmark"
						color="green"
						label="Balcon"
					/>
				)}

				{property.hasTerrace && (
					<FeatureItem
						icon="checkmark"
						color="green"
						label="Terrasse"
					/>
				)}

				{property.hasAirConditioning && (
					<FeatureItem
						icon="checkmark"
						color="green"
						label="Climatisation"
					/>
				)}
			</div>
		</div>
	);
};

// Helper component for feature items
interface FeatureItemProps {
	icon: string;
	color: string;
	label: string;
}

const FeatureItem = ({ icon, color, label }: FeatureItemProps) => {
	const bgColorClass = `bg-${color}-100`;
	const textColorClass = `text-${color}-600`;

	return (
		<div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
			<div className={`${bgColorClass} p-2 rounded-full`}>
				<svg
					className={`w-5 h-5 ${textColorClass}`}
					fill="none"
					stroke="currentColor"
					viewBox="0 0 24 24"
				>
					{getIconPath(icon)}
				</svg>
			</div>
			<span className="text-gray-700 font-medium">{label}</span>
		</div>
	);
};

// Icon path helper
const getIconPath = (icon: string) => {
	const paths: Record<string, React.ReactElement> = {
		building: (
			<path
				strokeLinecap="round"
				strokeLinejoin="round"
				strokeWidth="2"
				d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
			/>
		),
		bed: (
			<path
				strokeLinecap="round"
				strokeLinejoin="round"
				strokeWidth="2"
				d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9"
			/>
		),
		bath: (
			<path
				strokeLinecap="round"
				strokeLinejoin="round"
				strokeWidth="2"
				d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z"
			/>
		),
		ruler: (
			<path
				strokeLinecap="round"
				strokeLinejoin="round"
				strokeWidth="2"
				d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4"
			/>
		),
		land: (
			<path
				strokeLinecap="round"
				strokeLinejoin="round"
				strokeWidth="2"
				d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
			/>
		),
		floor: (
			<path
				strokeLinecap="round"
				strokeLinejoin="round"
				strokeWidth="2"
				d="M19 14l-7 7m0 0l-7-7m7 7V3"
			/>
		),
		levels: (
			<path
				strokeLinecap="round"
				strokeLinejoin="round"
				strokeWidth="2"
				d="M8 7l4-4m0 0l4 4m-4-4v18"
			/>
		),
		parking: (
			<path
				strokeLinecap="round"
				strokeLinejoin="round"
				strokeWidth="2"
				d="M8 7h12l-1 9H9l-1-9zM8 7L6 3H3m9 18v-6a2 2 0 012-2h2a2 2 0 012 2v6"
			/>
		),
		check: (
			<path
				strokeLinecap="round"
				strokeLinejoin="round"
				strokeWidth="2"
				d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
			/>
		),
		money: (
			<path
				strokeLinecap="round"
				strokeLinejoin="round"
				strokeWidth="2"
				d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
			/>
		),
		energy: (
			<path
				strokeLinecap="round"
				strokeLinejoin="round"
				strokeWidth="2"
				d="M13 10V3L4 14h7v7l9-11h-7z"
			/>
		),
		gas: (
			<path
				strokeLinecap="round"
				strokeLinejoin="round"
				strokeWidth="2"
				d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
			/>
		),
		fees: (
			<path
				strokeLinecap="round"
				strokeLinejoin="round"
				strokeWidth="2"
				d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"
			/>
		),
		calendar: (
			<path
				strokeLinecap="round"
				strokeLinejoin="round"
				strokeWidth="2"
				d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
			/>
		),
		checkmark: (
			<path
				strokeLinecap="round"
				strokeLinejoin="round"
				strokeWidth="2"
				d="M5 13l4 4L19 7"
			/>
		),
	};

	return paths[icon] || paths.checkmark;
};

// Helper functions
const getConditionLabel = (condition: string): string => {
	const labels: Record<string, string> = {
		new: 'Neuf',
		good: 'Bon état',
		refresh: 'À rafraîchir',
		renovate: 'À rénover',
	};
	return labels[condition] || condition;
};

const getSaleTypeLabel = (saleType: string): string => {
	const labels: Record<string, string> = {
		vente_classique: 'Vente classique',
		vente_viager: 'Vente en viager',
		vente_lot: 'Vente en lot / Ensemble immobilier',
		vente_vefa: 'Vente en VEFA',
		vente_location: 'Vente en cours de location',
		vente_usufruit: 'Vente en usufruit / Nu-propriété',
		vente_indivisions: 'Vente en indivisions',
		constructible: 'Constructible',
		terrain_loisirs: 'Terrain de loisirs',
		jardin: 'Jardin',
		champs_agricole: 'Champs agricole',
		ancien: 'Ancien',
		viager: 'Viager',
	};
	return labels[saleType] || saleType;
};
