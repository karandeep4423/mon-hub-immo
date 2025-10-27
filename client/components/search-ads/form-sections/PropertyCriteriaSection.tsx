import { FormSection } from './FormSection';
import { Features } from '@/lib/constants';

interface PropertyCriteriaSectionProps {
	propertyTypes: string[];
	propertyState: string[];
	projectType: string;
	onPropertyTypesChange: (type: string, checked: boolean) => void;
	onPropertyStateChange: (state: string, checked: boolean) => void;
	onProjectTypeChange: (value: string) => void;
}

const PROPERTY_TYPE_LABELS: Record<string, string> = {
	house: 'Maison',
	apartment: 'Appartement',
	land: 'Terrain',
	building: 'Immeuble',
	commercial: 'Local commercial',
};

const PROPERTY_STATE_LABELS: Record<string, string> = {
	new: 'Neuf',
	old: 'Ancien',
};

const PROJECT_TYPE_LABELS: Record<string, string> = {
	primary: 'Résidence principale',
	secondary: 'Résidence secondaire',
	investment: 'Investissement locatif',
};

export const PropertyCriteriaSection: React.FC<
	PropertyCriteriaSectionProps
> = ({
	propertyTypes,
	propertyState,
	projectType,
	onPropertyTypesChange,
	onPropertyStateChange,
	onProjectTypeChange,
}) => {
	const propertyTypesList = [
		'house',
		'apartment',
		'land',
		'building',
		'commercial',
	];
	const propertyStatesList = ['new', 'old'];
	const projectTypesList = ['primary', 'secondary', 'investment'];

	return (
		<FormSection
			title={Features.SearchAds.SEARCH_AD_FORM_SECTIONS.SEARCH_CRITERIA}
			emoji="🏠"
		>
			<div className="space-y-6">
				{/* Property Types */}
				<div>
					<label className="block text-sm font-medium text-gray-700 mb-2">
						Type de bien recherché *
					</label>
					<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
						{propertyTypesList.map((type) => (
							<label
								key={type}
								className="flex items-start space-x-2 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer min-h-[3rem]"
							>
								<input
									type="checkbox"
									value={type}
									checked={propertyTypes.includes(type)}
									onChange={(e) =>
										onPropertyTypesChange(
											type,
											e.target.checked,
										)
									}
									className="rounded border-gray-300 text-blue-600 mt-1 flex-shrink-0"
								/>
								<span className="text-sm capitalize leading-tight break-words">
									{PROPERTY_TYPE_LABELS[type] || type}
								</span>
							</label>
						))}
					</div>
				</div>

				{/* Property State */}
				<div>
					<label className="block text-sm font-medium text-gray-700 mb-2">
						Neuf ou ancien ?
					</label>
					<div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
						{propertyStatesList.map((state) => (
							<label
								key={state}
								className="flex items-start space-x-2 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer min-h-[3rem]"
							>
								<input
									type="checkbox"
									value={state}
									checked={propertyState.includes(state)}
									onChange={(e) =>
										onPropertyStateChange(
											state,
											e.target.checked,
										)
									}
									className="rounded border-gray-300 text-blue-600 mt-1 flex-shrink-0"
								/>
								<span className="text-sm leading-tight break-words">
									{PROPERTY_STATE_LABELS[state] || state}
								</span>
							</label>
						))}
					</div>
				</div>

				{/* Project Type */}
				<div>
					<label
						htmlFor="projectType"
						className="block text-sm font-medium text-gray-700"
					>
						Type de projet
					</label>
					<select
						id="projectType"
						name="projectType"
						value={projectType}
						onChange={(e) => onProjectTypeChange(e.target.value)}
						className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
					>
						<option value="">Sélectionner...</option>
						{projectTypesList.map((type) => (
							<option key={type} value={type}>
								{PROJECT_TYPE_LABELS[type] || type}
							</option>
						))}
					</select>
				</div>
			</div>
		</FormSection>
	);
};
