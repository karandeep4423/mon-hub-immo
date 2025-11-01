import { FormSection } from './FormSection';
import { Features } from '@/lib/constants';
import React from 'react';
import { Select } from '@/components/ui/CustomSelect';

interface PropertyCriteriaSectionProps {
	propertyTypes: string[];
	propertyState: string[];
	projectType: string;
	onPropertyTypesChange: (type: string, checked: boolean) => void;
	onPropertyStateChange: (state: string, checked: boolean) => void;
	onProjectTypeChange: (value: string) => void;
	errors?: Record<string, string>;
}

const PROPERTY_TYPE_CONFIG: Record<
	string,
	{ label: string; icon: string; gradient: string }
> = {
	house: {
		label: 'Maison',
		icon: '🏡',
		gradient: 'from-blue-50 to-indigo-50',
	},
	apartment: {
		label: 'Appartement',
		icon: '🏢',
		gradient: 'from-purple-50 to-pink-50',
	},
	land: {
		label: 'Terrain',
		icon: '🌳',
		gradient: 'from-green-50 to-emerald-50',
	},
	building: {
		label: 'Immeuble',
		icon: '🏛️',
		gradient: 'from-gray-50 to-slate-50',
	},
	commercial: {
		label: 'Local commercial',
		icon: '🏪',
		gradient: 'from-orange-50 to-amber-50',
	},
};

const PROPERTY_STATE_CONFIG: Record<
	string,
	{ label: string; icon: string; gradient: string }
> = {
	new: {
		label: 'Neuf',
		icon: '✨',
		gradient: 'from-cyan-50 to-blue-50',
	},
	old: {
		label: 'Ancien',
		icon: '🏛️',
		gradient: 'from-amber-50 to-yellow-50',
	},
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
	errors = {},
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
					<label className="block text-sm font-semibold text-gray-800 mb-3">
						Type de bien recherché *
					</label>
					<div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-2 xl:grid-cols-3 gap-2 sm:gap-3">
						{propertyTypesList.map((type) => {
							const config = PROPERTY_TYPE_CONFIG[type];
							const isSelected = propertyTypes.includes(type);
							return (
								<label
									key={type}
									className={`
										relative overflow-hidden rounded-xl cursor-pointer
										transition-all duration-300 ease-in-out
										${
											isSelected
												? 'ring-2 ring-cyan-500 shadow-lg shadow-cyan-200'
												: 'ring-1 ring-gray-200 hover:ring-cyan-300 hover:shadow-md'
										}
										${errors.propertyTypes ? 'ring-red-500 ring-2' : ''}
									`}
								>
									<input
										type="checkbox"
										value={type}
										checked={isSelected}
										onChange={(e) =>
											onPropertyTypesChange(
												type,
												e.target.checked,
											)
										}
										className="sr-only"
									/>
									<div
										className={`
										bg-gradient-to-br ${config.gradient}
										p-3 sm:p-4 transition-all duration-300
										${isSelected ? 'bg-opacity-100' : 'bg-opacity-60 hover:bg-opacity-80'}
									`}
									>
										<div className="flex flex-col sm:flex-row items-center sm:space-x-2 space-y-1 sm:space-y-0">
											<div className="text-2xl sm:text-3xl">
												{config.icon}
											</div>
											<div className="flex-1 text-center sm:text-left">
												<span
													className={`
													text-xs sm:text-sm font-medium transition-colors duration-300
													${isSelected ? 'text-brand' : 'text-gray-700'}
												`}
												>
													{config.label}
												</span>
											</div>
											{isSelected && (
												<div className="text-brand text-sm sm:text-base absolute top-1 right-3">
													✓
												</div>
											)}
										</div>
									</div>
								</label>
							);
						})}
					</div>
					{errors.propertyTypes && (
						<p className="mt-2 text-sm text-red-600 flex items-center gap-1">
							<span>⚠️</span>
							{errors.propertyTypes}
						</p>
					)}
				</div>

				{/* Property State */}
				<div>
					<label className="block text-sm font-semibold text-gray-800 mb-3">
						Neuf ou ancien ?
					</label>
					<div className="grid grid-cols-2 sm:grid-cols-2 gap-2 sm:gap-3">
						{propertyStatesList.map((state) => {
							const config = PROPERTY_STATE_CONFIG[state];
							const isSelected = propertyState.includes(state);
							return (
								<label
									key={state}
									className={`
										relative overflow-hidden rounded-xl cursor-pointer
										transition-all duration-300 ease-in-out
										${
											isSelected
												? 'ring-2 ring-cyan-500 shadow-lg shadow-cyan-200'
												: 'ring-1 ring-gray-200 hover:ring-cyan-300 hover:shadow-md'
										}
									`}
								>
									<input
										type="checkbox"
										value={state}
										checked={isSelected}
										onChange={(e) =>
											onPropertyStateChange(
												state,
												e.target.checked,
											)
										}
										className="sr-only"
									/>
									<div
										className={`
										bg-gradient-to-br ${config.gradient}
										p-3 sm:p-4 transition-all duration-300
										${isSelected ? 'bg-opacity-100' : 'bg-opacity-60 hover:bg-opacity-80'}
									`}
									>
										<div className="flex flex-col sm:flex-row items-center sm:space-x-2 space-y-1 sm:space-y-0">
											<div className="text-2xl sm:text-3xl">
												{config.icon}
											</div>
											<div className="flex-1 text-center sm:text-left">
												<span
													className={`
													text-xs sm:text-sm font-medium transition-colors duration-300
													${isSelected ? 'text-brand' : 'text-gray-700'}
												`}
												>
													{config.label}
												</span>
											</div>
											{isSelected && (
												<div className="text-brand text-sm sm:text-base absolute top-1 right-3">
													✓
												</div>
											)}
										</div>
									</div>
								</label>
							);
						})}
					</div>
				</div>

				{/* Type de projet */}
				<div>
					<label
						htmlFor="projectType"
						className="text-sm font-medium text-gray-700"
					>
						Type de projet
					</label>
					<Select
						value={projectType}
						onChange={(value) => onProjectTypeChange(value)}
						name="projectType"
						options={[
							{ value: '', label: 'Sélectionner...' },
							{
								value: 'type',
								label: projectTypesList
									.map(
										(type) =>
											PROJECT_TYPE_LABELS[type] || type,
									)
									.join(','),
							},
						]}
					/>
				</div>
			</div>
		</FormSection>
	);
};
