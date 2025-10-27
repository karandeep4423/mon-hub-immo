import { FormSection } from './FormSection';
import { Features } from '@/lib/constants';

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

const STATE_LABELS: Record<string, string> = {
	new: 'Neuf',
	good: 'Bon état',
	refresh: 'À rafraîchir',
	renovate: 'À rénover',
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
							className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
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
							className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
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
							className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
						/>
					</div>
				</div>

				<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
					<label className="flex items-center space-x-2">
						<input
							type="checkbox"
							checked={hasExterior}
							onChange={(e) =>
								onHasExteriorChange(e.target.checked)
							}
							className="rounded border-gray-300 text-blue-600"
						/>
						<span className="text-sm text-gray-700">
							Extérieur nécessaire ? (jardin, terrasse, balcon)
						</span>
					</label>

					<label className="flex items-center space-x-2">
						<input
							type="checkbox"
							checked={hasParking}
							onChange={(e) =>
								onHasParkingChange(e.target.checked)
							}
							className="rounded border-gray-300 text-blue-600"
						/>
						<span className="text-sm text-gray-700">
							Parking / garage obligatoire ?
						</span>
					</label>
				</div>

				<div>
					<label
						htmlFor="acceptedFloors"
						className="block text-sm font-medium text-gray-700"
					>
						Étages acceptés (si appartement) ?
					</label>
					<select
						id="acceptedFloors"
						name="acceptedFloors"
						value={acceptedFloors || ''}
						onChange={(e) => onAcceptedFloorsChange(e.target.value)}
						className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
					>
						<option value="">Sélectionner...</option>
						{floorOptions.map((option) => (
							<option key={option} value={option}>
								{FLOOR_LABELS[option] || option}
							</option>
						))}
					</select>
				</div>

				<div>
					<label className="block text-sm font-medium text-gray-700 mb-2">
						État général souhaité : neuf / à rafraîchir / à rénover
						?
					</label>
					<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
						{stateOptions.map((state) => (
							<label
								key={state}
								className="flex items-start space-x-2 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer min-h-[3rem]"
							>
								<input
									type="checkbox"
									value={state}
									checked={desiredState.includes(state)}
									onChange={(e) =>
										onDesiredStateChange(
											state,
											e.target.checked,
										)
									}
									className="rounded border-gray-300 text-blue-600 mt-1 flex-shrink-0"
								/>
								<span className="text-sm leading-tight break-words">
									{STATE_LABELS[state] || state}
								</span>
							</label>
						))}
					</div>
				</div>
			</div>
		</FormSection>
	);
};
