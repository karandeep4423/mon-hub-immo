import { FormSection } from './FormSection';
import { BaseLocationAutocomplete, type LocationItem } from '../../ui';
import { Features } from '@/lib/constants';

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
		<FormSection
			title={Features.SearchAds.SEARCH_AD_FORM_SECTIONS.LOCATION}
			emoji="📍"
		>
			<div className="space-y-4">
				<BaseLocationAutocomplete
					mode="multi"
					label="Ville(s), quartier(s) ciblé(s) *"
					value={
						cities
							? cities.split(',').map((c) => {
									// Clean up city string - remove empty brackets like () ()
									return c
										.trim()
										.replace(/\(\s*\)/g, '')
										.trim();
								})
							: []
					}
					onMultiSelect={(locations: LocationItem[]) =>
						onCitiesChange(
							locations
								.map((loc) => `${loc.name} (${loc.postcode})`)
								.join(', '),
						)
					}
					placeholder={
						Features.SearchAds.SEARCH_AD_PLACEHOLDERS
							.LOCATION_SEARCH
					}
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
							className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-brand/20 focus:border-brand"
						/>
					</div>

					<div className="pt-6">
						<label
							className={`
								relative overflow-hidden rounded-xl cursor-pointer
								transition-all duration-300 ease-in-out block
								${
									openToOtherAreas
										? 'ring-2 ring-cyan-500 shadow-lg shadow-cyan-200'
										: 'ring-1 ring-gray-200 hover:ring-cyan-300 hover:shadow-md'
								}
							`}
						>
							<input
								type="checkbox"
								checked={openToOtherAreas}
								onChange={(e) =>
									onOpenToOtherAreasChange(e.target.checked)
								}
								className="sr-only"
							/>
							<div
								className={`
								bg-gradient-to-br ${openToOtherAreas ? 'from-indigo-50 to-blue-50' : 'from-gray-50 to-slate-50'}
								p-3 sm:p-4 transition-all duration-300
								${openToOtherAreas ? 'bg-opacity-100' : 'bg-opacity-60 hover:bg-opacity-80'}
							`}
							>
								<div className="flex items-center gap-2">
									<div className="text-xl sm:text-2xl">
										🗺️
									</div>
									<span
										className={`text-sm font-medium transition-colors duration-300 ${openToOtherAreas ? 'text-brand' : 'text-gray-700'}`}
									>
										Êtes-vous ouvert à d&apos;autres zones ?
									</span>
									{openToOtherAreas && (
										<div className="text-brand text-sm sm:text-base absolute top-1 right-3">
											✓
										</div>
									)}
								</div>
							</div>
						</label>
					</div>
				</div>
			</div>
		</FormSection>
	);
};
