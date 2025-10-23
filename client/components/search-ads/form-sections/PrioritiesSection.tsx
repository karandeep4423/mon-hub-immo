import { FormSection } from './FormSection';

interface PrioritiesSectionProps {
	mustHaves: string[];
	niceToHaves: string[];
	dealBreakers: string[];
	onMustHavesChange: (priority: string, checked: boolean) => void;
	onNiceToHavesChange: (priority: string, checked: boolean) => void;
	onDealBreakersChange: (priority: string, checked: boolean) => void;
}

const PRIORITY_OPTIONS = [
	'Jardin/Extérieur',
	'Garage/Parking',
	'Proche des transports',
	'Proche des écoles',
	'Quartier calme',
	'Lumineux',
	'Sans travaux',
	'Piscine',
	'Balcon/Terrasse',
	'Ascenseur',
	'Vue dégagée',
	'Calme',
];

export const PrioritiesSection: React.FC<PrioritiesSectionProps> = ({
	mustHaves,
	niceToHaves,
	dealBreakers,
	onMustHavesChange,
	onNiceToHavesChange,
	onDealBreakersChange,
}) => {
	return (
		<FormSection title="Priorités personnelles" emoji="❤️">
			<div className="space-y-6">
				{/* Must Haves */}
				<div>
					<label className="block text-sm font-medium text-gray-700 mb-2">
						3 critères indispensables :
					</label>
					<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
						{PRIORITY_OPTIONS.map((priority) => (
							<label
								key={priority}
								className="flex items-start space-x-2 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer min-h-[3rem]"
							>
								<input
									type="checkbox"
									value={priority}
									checked={mustHaves.includes(priority)}
									onChange={(e) =>
										onMustHavesChange(
											priority,
											e.target.checked,
										)
									}
									className="rounded border-gray-300 text-red-600 mt-1 flex-shrink-0"
									disabled={
										!mustHaves.includes(priority) &&
										mustHaves.length >= 3
									}
								/>
								<span className="text-sm leading-tight break-words">
									{priority}
								</span>
							</label>
						))}
					</div>
					<p className="text-xs text-gray-500 mt-1">
						Maximum 3 critères
					</p>
				</div>

				{/* Nice to Haves */}
				<div>
					<label className="block text-sm font-medium text-gray-700 mb-2">
						3 critères secondaires :
					</label>
					<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
						{PRIORITY_OPTIONS.map((priority) => (
							<label
								key={priority}
								className="flex items-start space-x-2 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer min-h-[3rem]"
							>
								<input
									type="checkbox"
									value={priority}
									checked={niceToHaves.includes(priority)}
									onChange={(e) =>
										onNiceToHavesChange(
											priority,
											e.target.checked,
										)
									}
									className="rounded border-gray-300 text-yellow-600 mt-1 flex-shrink-0"
									disabled={
										!niceToHaves.includes(priority) &&
										niceToHaves.length >= 3
									}
								/>
								<span className="text-sm leading-tight break-words">
									{priority}
								</span>
							</label>
						))}
					</div>
					<p className="text-xs text-gray-500 mt-1">
						Maximum 3 critères
					</p>
				</div>

				{/* Deal Breakers */}
				<div>
					<label className="block text-sm font-medium text-gray-700 mb-2">
						Points de blocage absolus :
					</label>
					<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
						{PRIORITY_OPTIONS.map((priority) => (
							<label
								key={priority}
								className="flex items-start space-x-2 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer min-h-[3rem]"
							>
								<input
									type="checkbox"
									value={priority}
									checked={dealBreakers.includes(priority)}
									onChange={(e) =>
										onDealBreakersChange(
											priority,
											e.target.checked,
										)
									}
									className="rounded border-gray-300 text-red-600 mt-1 flex-shrink-0"
								/>
								<span className="text-sm leading-tight break-words">
									{priority}
								</span>
							</label>
						))}
					</div>
				</div>
			</div>
		</FormSection>
	);
};
