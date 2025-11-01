import { FormSection } from './FormSection';
import { Features } from '@/lib/constants';
import { Select } from '@/components/ui/CustomSelect';

interface PropertyDetailsSectionProps {
	minRooms?: number;
	minBedrooms?: number;
	minSurface?: number;
	hasExterior: boolean;
	hasParking: boolean;
	acceptedFloors?: string;
	desiredState: string[];
	onMinRoomsChange: (value: number | undefined) => void;
	onMinBedroomsChange: (value: number | undefined) => void;
	onMinSurfaceChange: (value: number | undefined) => void;
	onHasExteriorChange: (value: boolean) => void;
	onHasParkingChange: (value: boolean) => void;
	onAcceptedFloorsChange: (value: string) => void;
	onDesiredStateChange: (state: string, checked: boolean) => void;
}

const FLOOR_LABELS: Record<string, string> = {
	any: 'Tous étages',
	not_ground_floor: 'Pas de rez-de-chaussée',
	ground_floor_only: 'Rez-de-chaussée uniquement',
};

const STATE_CONFIG: Record<
	string,
	{ label: string; icon: string; gradient: string }
> = {
	new: {
		label: 'Neuf',
		icon: '✨',
		gradient: 'from-blue-50 to-cyan-50',
	},
	good: {
		label: 'Bon état',
		icon: '👍',
		gradient: 'from-green-50 to-emerald-50',
	},
	refresh: {
		label: 'À rafraîchir',
		icon: '🎨',
		gradient: 'from-yellow-50 to-amber-50',
	},
	renovate: {
		label: 'À rénover',
		icon: '🔨',
		gradient: 'from-orange-50 to-red-50',
	},
};

export const PropertyDetailsSection: React.FC<PropertyDetailsSectionProps> = ({
	minRooms,
	minBedrooms,
	minSurface,
	hasExterior,
	hasParking,
	acceptedFloors,
	desiredState,
	onMinRoomsChange,
	onMinBedroomsChange,
	onMinSurfaceChange,
	onHasExteriorChange,
	onHasParkingChange,
	onAcceptedFloorsChange,
	onDesiredStateChange,
}) => {
	const floorOptions = ['any', 'not_ground_floor', 'ground_floor_only'];
	const stateOptions = ['new', 'good', 'refresh', 'renovate'];

	return (
		<FormSection
			title={Features.SearchAds.SEARCH_AD_FORM_SECTIONS.CHARACTERISTICS}
			emoji="🏠"
		>
			<div className="space-y-4">
				<div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
					<div>
						<label
							htmlFor="minRooms"
							className="block text-sm font-medium text-gray-700"
						>
							Nombre de pièces / chambres minimum
						</label>
						<input
							id="minRooms"
							name="minRooms"
							type="number"
							value={minRooms || ''}
							onChange={(e) =>
								onMinRoomsChange(
									e.target.value
										? Number(e.target.value)
										: undefined,
								)
							}
							className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-brand/20 focus:border-brand"
						/>
					</div>

					<div>
						<label
							htmlFor="minBedrooms"
							className="block text-sm font-medium text-gray-700"
						>
							Nombre de chambres minimum
						</label>
						<input
							id="minBedrooms"
							name="minBedrooms"
							type="number"
							value={minBedrooms || ''}
							onChange={(e) =>
								onMinBedroomsChange(
									e.target.value
										? Number(e.target.value)
										: undefined,
								)
							}
							className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-brand/20 focus:border-brand"
						/>
					</div>

					<div>
						<label
							htmlFor="minSurface"
							className="block text-sm font-medium text-gray-700"
						>
							Surface habitable minimum (m²)
						</label>
						<input
							id="minSurface"
							name="minSurface"
							type="number"
							value={minSurface || ''}
							onChange={(e) =>
								onMinSurfaceChange(
									e.target.value
										? Number(e.target.value)
										: undefined,
								)
							}
							className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-brand/20 focus:border-brand"
						/>
					</div>
				</div>

				<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
					{/* Extérieur nécessaire ? */}
					<label
						className={`
							relative overflow-hidden rounded-xl cursor-pointer
							transition-all duration-300 ease-in-out
							${
								hasExterior
									? 'ring-2 ring-cyan-500 shadow-lg shadow-cyan-200'
									: 'ring-1 ring-gray-200 hover:ring-cyan-300 hover:shadow-md'
							}
						`}
					>
						<input
							type="checkbox"
							checked={hasExterior}
							onChange={(e) =>
								onHasExteriorChange(e.target.checked)
							}
							className="sr-only"
						/>
						<div
							className={`
								bg-gradient-to-br ${hasExterior ? 'from-green-50 to-emerald-50' : 'from-gray-50 to-slate-50'}
								p-3 sm:p-4 transition-all duration-300
								${hasExterior ? 'bg-opacity-100' : 'bg-opacity-60 hover:bg-opacity-80'}
							`}
						>
							<div className="flex items-center gap-2">
								<div className="text-xl sm:text-2xl">🌿</div>
								<span
									className={`text-sm font-medium transition-colors duration-300 ${hasExterior ? 'text-brand' : 'text-gray-700'}`}
								>
									Extérieur nécessaire ? (jardin, terrasse,
									balcon)
								</span>
								{hasExterior && (
									<div className="text-brand text-sm sm:text-base absolute top-1 right-3">
										✓
									</div>
								)}
							</div>
						</div>
					</label>

					{/* Parking / garage obligatoire ? */}
					<label
						className={`
							relative overflow-hidden rounded-xl cursor-pointer
							transition-all duration-300 ease-in-out
							${
								hasParking
									? 'ring-2 ring-cyan-500 shadow-lg shadow-cyan-200'
									: 'ring-1 ring-gray-200 hover:ring-cyan-300 hover:shadow-md'
							}
						`}
					>
						<input
							type="checkbox"
							checked={hasParking}
							onChange={(e) =>
								onHasParkingChange(e.target.checked)
							}
							className="sr-only"
						/>
						<div
							className={`
								bg-gradient-to-br ${hasParking ? 'from-blue-50 to-indigo-50' : 'from-gray-50 to-slate-50'}
								p-3 sm:p-4 transition-all duration-300
								${hasParking ? 'bg-opacity-100' : 'bg-opacity-60 hover:bg-opacity-80'}
							`}
						>
							<div className="flex items-center gap-2">
								<div className="text-xl sm:text-2xl">🚗</div>
								<span
									className={`text-sm font-medium transition-colors duration-300 ${hasParking ? 'text-brand' : 'text-gray-700'}`}
								>
									Parking / garage obligatoire ?
								</span>
								{hasParking && (
									<div className="text-brand text-sm sm:text-base absolute top-1 right-3">
										✓
									</div>
								)}
							</div>
						</div>
					</label>
				</div>

				<div>
					<label
						htmlFor="acceptedFloors"
						className="block text-sm font-medium text-gray-700"
					>
						Étages acceptés (si appartement) ?
					</label>
					<Select
						value={acceptedFloors || ''}
						onChange={(value) => onAcceptedFloorsChange(value)}
						name="acceptedFloors"
						options={[
							{ value: '', label: 'Sélectionner...' },
							...floorOptions.map((option) => ({
								value: option,
								label: FLOOR_LABELS[option] || option,
							})),
						]}
					/>
				</div>
				<div>
					<label className="block text-sm font-semibold text-gray-800 mb-3">
						État général souhaité : neuf / à rafraîchir / à rénover
						?
					</label>
					<div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 gap-2 sm:gap-3">
						{stateOptions.map((state) => {
							const config = STATE_CONFIG[state];
							const isSelected = desiredState.includes(state);
							return (
								<label
									key={state}
									className={`
										relative overflow-hidden rounded-xl cursor-pointer h-full
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
											onDesiredStateChange(
												state,
												e.target.checked,
											)
										}
										className="sr-only"
									/>
									<div
										className={`
										bg-gradient-to-br ${config.gradient} h-full
										p-3 sm:p-4 transition-all duration-300
										${isSelected ? 'bg-opacity-100' : 'bg-opacity-60 hover:bg-opacity-80'}
									`}
									>
										<div className="flex flex-col items-center justify-center text-center space-y-1 sm:space-y-2 h-full">
											<div className="text-2xl sm:text-3xl">
												{config.icon}
											</div>
											<span
												className={`
												text-xs sm:text-sm font-medium transition-colors duration-300
												${isSelected ? 'text-brand' : 'text-gray-700'}
											`}
											>
												{config.label}
											</span>
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
			</div>
		</FormSection>
	);
};
