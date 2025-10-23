import { FormSection } from './FormSection';
import { BaseLocationAutocomplete, type LocationItem } from '../../ui';

interface LocationSectionProps {
	cities: string;
	maxDistance?: number;
	openToOtherAreas: boolean;
	onCitiesChange: (cities: string) => void;
	onMaxDistanceChange: (value: number | undefined) => void;
	onOpenToOtherAreasChange: (value: boolean) => void;
}

export const LocationSection: React.FC<LocationSectionProps> = ({
	cities,
	maxDistance,
	openToOtherAreas,
	onCitiesChange,
	onMaxDistanceChange,
	onOpenToOtherAreasChange,
}) => {
	return (
		<FormSection title="Localisation" emoji="📍">
			<div className="space-y-4">
				<BaseLocationAutocomplete
					mode="multi"
					label="Ville(s), quartier(s) ciblé(s) *"
					value={cities ? cities.split(',').map((c) => c.trim()) : []}
					onMultiSelect={(locations: LocationItem[]) =>
						onCitiesChange(
							locations.map((loc) => loc.name).join(', '),
						)
					}
					placeholder="Rechercher et ajouter des villes..."
				/>

				<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
					<div>
						<label
							htmlFor="maxDistance"
							className="block text-sm font-medium text-gray-700"
						>
							Distance max avec le travail / écoles (km)
						</label>
						<input
							id="maxDistance"
							name="maxDistance"
							type="number"
							value={maxDistance || ''}
							onChange={(e) =>
								onMaxDistanceChange(
									e.target.value
										? Number(e.target.value)
										: undefined,
								)
							}
							className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
						/>
					</div>

					<div className="flex items-center pt-6">
						<label className="flex items-center space-x-2">
							<input
								type="checkbox"
								checked={openToOtherAreas}
								onChange={(e) =>
									onOpenToOtherAreasChange(e.target.checked)
								}
								className="rounded border-gray-300 text-blue-600"
							/>
							<span className="text-sm text-gray-700">
								Êtes-vous ouvert à d&apos;autres zones ?
							</span>
						</label>
					</div>
				</div>
			</div>
		</FormSection>
	);
};
