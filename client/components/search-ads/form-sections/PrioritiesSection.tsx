import { Features } from '@/lib/constants';
import { FormSection } from './FormSection';

interface PrioritiesSectionProps {
	mustHaves: string[];
	niceToHaves: string[];
	dealBreakers: string[];
	onMustHavesChange: (priority: string, checked: boolean) => void;
	onNiceToHavesChange: (priority: string, checked: boolean) => void;
	onDealBreakersChange: (priority: string, checked: boolean) => void;
}

const PRIORITY_ICONS: Record<string, string> = {
	'Jardin/Extérieur': '🌳',
	'Garage/Parking': '🚗',
	'Proche des transports': '🚇',
	'Proche des écoles': '🏫',
	'Quartier calme': '🤫',
	Lumineux: '☀️',
	'Sans travaux': '✨',
	Piscine: '🏊',
	'Balcon/Terrasse': '🪴',
	Ascenseur: '🛗',
	'Vue dégagée': '🏔️',
	Calme: '😌',
};

export const PrioritiesSection: React.FC<PrioritiesSectionProps> = ({
	mustHaves,
	niceToHaves,
	dealBreakers,
	onMustHavesChange,
	onNiceToHavesChange,
	onDealBreakersChange,
}) => {
	return (
		<FormSection
			title={Features.SearchAds.SEARCH_AD_FORM_SECTIONS.PRIORITIES}
			emoji="❤️"
		>
			<div className="space-y-6">
				{/* Must Haves */}
				<div className="bg-gradient-to-br from-red-50 to-pink-50 p-4 sm:p-5 rounded-2xl shadow-sm">
					<label className="text-sm font-semibold text-gray-800 mb-3 flex items-center gap-2">
						<span className="text-lg">❤️</span>3 critères
						indispensables :
					</label>
					<div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-2 xl:grid-cols-3 gap-2 sm:gap-3">
						{Features.Properties.PRIORITIES.map((priority) => {
							const isSelected = mustHaves.includes(priority);
							const isDisabled =
								!isSelected && mustHaves.length >= 3;
							return (
								<label
									key={priority}
									className={`
										relative overflow-hidden rounded-xl cursor-pointer
										transition-all duration-300 ease-in-out
										${
											isSelected
												? 'ring-2 ring-red-500 shadow-md shadow-red-200 bg-white'
												: isDisabled
													? 'ring-1 ring-gray-200 opacity-50 cursor-not-allowed bg-white/60'
													: 'ring-1 ring-gray-200 hover:ring-red-300 hover:shadow-md bg-white/80'
										}
									`}
								>
									<input
										type="checkbox"
										value={priority}
										checked={isSelected}
										onChange={(e) =>
											onMustHavesChange(
												priority,
												e.target.checked,
											)
										}
										className="sr-only"
										disabled={isDisabled}
									/>
									<div className="p-2 sm:p-3 transition-all duration-300">
										<div className="flex flex-col items-center space-y-1 sm:space-y-2">
											<div className="text-xl sm:text-2xl">
												{PRIORITY_ICONS[priority] ||
													'📌'}
											</div>
											<div className="flex-1 text-center">
												<span
													className={`
													text-xs sm:text-sm font-medium transition-colors duration-300 leading-tight
													${isSelected ? 'text-red-600' : 'text-gray-700'}
												`}
												>
													{priority}
												</span>
											</div>
											{isSelected && (
												<div className="text-red-500 text-sm sm:text-base absolute top-1 right-3">
													✓
												</div>
											)}
										</div>
									</div>
								</label>
							);
						})}
					</div>
					<p className="text-xs text-red-700 mt-3 flex items-center gap-1">
						<span>ℹ️</span>
						Maximum 3 critères
					</p>
				</div>

				{/* Nice to Haves */}
				<div className="bg-gradient-to-br from-yellow-50 to-amber-50 p-4 sm:p-5 rounded-2xl shadow-sm">
					<label className="block text-sm font-semibold text-gray-800 mb-3  items-center gap-2">
						<span className="text-lg">⭐</span>3 critères
						secondaires :
					</label>
					<div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-2 xl:grid-cols-3 gap-2 sm:gap-3">
						{Features.Properties.PRIORITIES.map((priority) => {
							const isSelected = niceToHaves.includes(priority);
							const isDisabled =
								!isSelected && niceToHaves.length >= 3;
							return (
								<label
									key={priority}
									className={`
										relative overflow-hidden rounded-xl cursor-pointer
										transition-all duration-300 ease-in-out
										${
											isSelected
												? 'ring-2 ring-amber-500 shadow-md shadow-amber-200 bg-white'
												: isDisabled
													? 'ring-1 ring-gray-200 opacity-50 cursor-not-allowed bg-white/60'
													: 'ring-1 ring-gray-200 hover:ring-amber-300 hover:shadow-md bg-white/80'
										}
									`}
								>
									<input
										type="checkbox"
										value={priority}
										checked={isSelected}
										onChange={(e) =>
											onNiceToHavesChange(
												priority,
												e.target.checked,
											)
										}
										className="sr-only"
										disabled={isDisabled}
									/>
									<div className="p-2 sm:p-3 transition-all duration-300">
										<div className="flex flex-col items-center space-y-1 sm:space-y-2">
											<div className="text-xl sm:text-2xl">
												{PRIORITY_ICONS[priority] ||
													'📌'}
											</div>
											<span
												className={`
												text-xs sm:text-sm font-medium transition-colors duration-300 leading-tight text-center
												${isSelected ? 'text-amber-600' : 'text-gray-700'}
											`}
											>
												{priority}
											</span>
											{isSelected && (
												<div className="text-amber-500 text-sm sm:text-base absolute top-1 right-3">
													✓
												</div>
											)}
										</div>
									</div>
								</label>
							);
						})}
					</div>
					<p className="text-xs text-amber-700 mt-3 flex items-center gap-1">
						<span>ℹ️</span>
						Maximum 3 critères
					</p>
				</div>

				{/* Deal Breakers */}
				<div className="bg-gradient-to-br from-slate-50 to-gray-100 p-4 sm:p-5 rounded-2xl shadow-sm">
					<label className="flex text-sm font-semibold text-gray-800 mb-3 items-center gap-2">
						<span className="text-lg">🚫</span>
						Points de blocage absolus :
					</label>
					<div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-2 xl:grid-cols-3 gap-2 sm:gap-3">
						{Features.Properties.PRIORITIES.map((priority) => {
							const isSelected = dealBreakers.includes(priority);
							return (
								<label
									key={priority}
									className={`
										relative overflow-hidden rounded-xl cursor-pointer
										transition-all duration-300 ease-in-out
										${
											isSelected
												? 'ring-2 ring-gray-700 shadow-md shadow-gray-300 bg-white'
												: 'ring-1 ring-gray-200 hover:ring-gray-400 hover:shadow-md bg-white/80'
										}
									`}
								>
									<input
										type="checkbox"
										value={priority}
										checked={isSelected}
										onChange={(e) =>
											onDealBreakersChange(
												priority,
												e.target.checked,
											)
										}
										className="sr-only"
									/>
									<div className="p-2 sm:p-3 transition-all duration-300">
										<div className="flex flex-col items-center space-y-1 sm:space-y-2">
											<div className="text-xl sm:text-2xl">
												{PRIORITY_ICONS[priority] ||
													'📌'}
											</div>
											<span
												className={`
												text-xs sm:text-sm font-medium transition-colors duration-300 leading-tight text-center
												${isSelected ? 'text-gray-800' : 'text-gray-700'}
											`}
											>
												{priority}
											</span>
											{isSelected && (
												<div className="text-gray-700 text-sm sm:text-base absolute top-1 right-3">
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
