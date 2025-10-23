import { FormSection } from './FormSection';

interface BadgesSectionProps {
	badges: string[];
	onBadgesChange: (badge: string, checked: boolean) => void;
}

const BADGE_OPTIONS = [
	'Vente urgente',
	'Bien rare',
	'Secteur recherché',
	'Bonne affaire',
	'Fort potentiel',
	'Mandat possible rapidement',
	'Signature imminente',
	'Contact direct propriétaire',
	'Contact ami / famille',
	'Contact pro (collègue, artisan, notaire…)',
];

export const BadgesSection: React.FC<BadgesSectionProps> = ({
	badges,
	onBadgesChange,
}) => {
	return (
		<FormSection title="Badges pour l'annonce" emoji="🏷️">
			<p className="text-sm text-gray-600 mb-4">
				Ajoutez des badges pour mettre en avant les caractéristiques
				importantes de cette recherche (optionnel)
			</p>
			<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
				{BADGE_OPTIONS.map((badge) => (
					<label
						key={badge}
						className="flex items-start space-x-2 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer min-h-[3rem]"
					>
						<input
							type="checkbox"
							value={badge}
							checked={badges.includes(badge)}
							onChange={(e) =>
								onBadgesChange(badge, e.target.checked)
							}
							className="rounded border-gray-300 text-brand-600 mt-1 flex-shrink-0"
						/>
						<span className="text-sm leading-tight break-words">
							{badge}
						</span>
					</label>
				))}
			</div>
		</FormSection>
	);
};
