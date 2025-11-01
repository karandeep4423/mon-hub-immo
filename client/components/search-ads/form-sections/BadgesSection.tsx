import { Features } from '@/lib/constants';
import { FormSection } from './FormSection';

interface BadgesSectionProps {
	badges: string[];
	onBadgesChange: (badge: string, checked: boolean) => void;
}

const BADGE_CONFIG: Record<
	string,
	{ icon: string; gradient: string; color: string }
> = {
	Urgent: {
		icon: '⚡',
		gradient: 'from-red-50 to-orange-50',
		color: 'text-red-600',
	},
	'Premier achat': {
		icon: '🏠',
		gradient: 'from-blue-50 to-cyan-50',
		color: 'text-blue-600',
	},
	Investissement: {
		icon: '�',
		gradient: 'from-green-50 to-emerald-50',
		color: 'text-green-600',
	},
	'Famille nombreuse': {
		icon: '👨‍👩‍👧‍👦',
		gradient: 'from-pink-50 to-rose-50',
		color: 'text-pink-600',
	},
	'Proche des écoles': {
		icon: '�',
		gradient: 'from-yellow-50 to-amber-50',
		color: 'text-amber-600',
	},
	'Proche des transports': {
		icon: '🚇',
		gradient: 'from-purple-50 to-violet-50',
		color: 'text-purple-600',
	},
	'Calme et verdure': {
		icon: '🌳',
		gradient: 'from-green-50 to-teal-50',
		color: 'text-green-600',
	},
	'Centre-ville': {
		icon: '🏙️',
		gradient: 'from-slate-50 to-gray-50',
		color: 'text-slate-600',
	},
	'Vue dégagée': {
		icon: '🌄',
		gradient: 'from-sky-50 to-blue-50',
		color: 'text-sky-600',
	},
	Lumineux: {
		icon: '☀️',
		gradient: 'from-yellow-50 to-orange-50',
		color: 'text-yellow-600',
	},
	'Travaux acceptés': {
		icon: '🔨',
		gradient: 'from-orange-50 to-amber-50',
		color: 'text-orange-600',
	},
	'Prêt à emménager': {
		icon: '✨',
		gradient: 'from-cyan-50 to-teal-50',
		color: 'text-cyan-600',
	},
	'Avec jardin': {
		icon: '🌻',
		gradient: 'from-lime-50 to-green-50',
		color: 'text-lime-600',
	},
	'Avec terrasse': {
		icon: '🪴',
		gradient: 'from-emerald-50 to-teal-50',
		color: 'text-emerald-600',
	},
	'Avec balcon': {
		icon: '🏡',
		gradient: 'from-indigo-50 to-purple-50',
		color: 'text-indigo-600',
	},
	'Avec parking': {
		icon: '🚗',
		gradient: 'from-blue-50 to-indigo-50',
		color: 'text-blue-600',
	},
	'Avec cave': {
		icon: '🍷',
		gradient: 'from-rose-50 to-pink-50',
		color: 'text-rose-600',
	},
	'Animaux acceptés': {
		icon: '�',
		gradient: 'from-amber-50 to-yellow-50',
		color: 'text-amber-600',
	},
	'Accessible PMR': {
		icon: '♿',
		gradient: 'from-teal-50 to-cyan-50',
		color: 'text-teal-600',
	},
	'Coup de cœur': {
		icon: '❤️',
		gradient: 'from-red-50 to-pink-50',
		color: 'text-red-600',
	},
};

export const BadgesSection: React.FC<BadgesSectionProps> = ({
	badges,
	onBadgesChange,
}) => {
	return (
		<FormSection
			title={Features.SearchAds.SEARCH_AD_FORM_SECTIONS.BADGES}
			emoji="🏷️"
		>
			<p className="text-sm text-gray-600 mb-4">
				Ajoutez des badges pour mettre en avant les caractéristiques
				importantes de cette recherche (optionnel)
			</p>
			<div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-5 gap-2 sm:gap-3">
				{Features.SearchAds.SEARCH_AD_BADGE_OPTIONS.map((badge) => {
					const config = BADGE_CONFIG[badge] || {
						icon: '🏷️',
						gradient: 'from-gray-50 to-slate-50',
						color: 'text-gray-600',
					};
					const isSelected = badges.includes(badge);
					return (
						<label
							key={badge}
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
								value={badge}
								checked={isSelected}
								onChange={(e) =>
									onBadgesChange(badge, e.target.checked)
								}
								className="sr-only"
							/>
							<div
								className={`
								bg-gradient-to-br ${config.gradient} h-full
								p-2 sm:p-4 transition-all duration-300
								${isSelected ? 'bg-opacity-100' : 'bg-opacity-60 hover:bg-opacity-80'}
							`}
							>
								<div className="flex flex-col items-center justify-center space-y-1 sm:space-y-2 h-full">
									<div className="text-xl sm:text-2xl">
										{config.icon}
									</div>
									<span
										className={`
										text-xs sm:text-sm font-medium transition-colors duration-300 leading-tight text-center
										${isSelected ? config.color : 'text-gray-700'}
									`}
									>
										{badge}
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
		</FormSection>
	);
};
