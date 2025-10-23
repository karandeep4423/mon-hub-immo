import { FaUserCog, FaUser } from 'react-icons/fa';

interface TargetAudienceSectionProps {
	onScrollToForm: () => void;
}

export const TargetAudienceSection = ({
	onScrollToForm,
}: TargetAudienceSectionProps) => {
	return (
		<section className="max-w-6xl mx-auto px-6 grid md:grid-cols-2 gap-10 text-brand-deep">
			{/* Colonne gauche */}
			<div>
				<h4 className="text-lg font-bold mb-6">Pour qui ?</h4>

				<div className="flex items-start gap-3 mb-6">
					<FaUser className="w-9 h-9 text-brand flex-shrink-0" />
					<div>
						<p className="font-semibold">Agents immobiliers</p>
						<p className="text-sm text-gray-700">
							Trouvez plus de mandats grâce à la puissance du
							réseau.
						</p>
					</div>
				</div>

				<div className="flex items-start gap-3">
					<FaUserCog className="w-10 h-10 text-brand flex-shrink-0" />
					<div>
						<p className="font-semibold">
							Apporteurs d&apos;affaires
						</p>
						<p className="text-sm text-gray-700">
							MonHubimmo vous ouvre aussi les portes du réseau
							caché des particuliers et prescripteurs locaux. Ils
							peuvent désormais publier leurs propres annonces,
							consultables par les mandataires sur la plateforme.
						</p>
						<p className="text-sm text-gray-700 mt-4">
							Des particuliers, amis, voisins ou commerçants qui
							connaissent un bien à vendre ou un acheteur
							potentiel ? C&apos;est un véritable levier de
							prospection et de mandats avant même leur diffusion
							sur les portails.
						</p>
					</div>
				</div>
			</div>

			{/* Colonne droite */}
			<div className="flex flex-col">
				<h4 className="text-lg font-bold mb-6">
					Testez dès maintenant
				</h4>
				<ul className="space-y-2 text-sm text-gray-700 mb-6">
					<li className="flex items-center gap-2">
						<span className="text-brand">✓</span> Créez un compte
						gratuit
					</li>
					<li className="flex items-center gap-2">
						<span className="text-brand">✓</span> Sans engagement
					</li>
					<li className="flex items-center gap-2">
						<span className="text-brand">✓</span> Version MVP +
						évolutive
					</li>
				</ul>
				<button
					onClick={onScrollToForm}
					className="bg-brand text-white px-6 py-2 rounded-full font-semibold hover:bg-brand-dark transition self-start"
				>
					M&apos;inscrire en avant première
				</button>
			</div>
		</section>
	);
};
