import { FeatureCard } from './FeatureCard';

export const BenefitsSection = () => {
	return (
		<section className="bg-white pb-16 px-6">
			<h2 className="text-3xl font-bold text-center text-[#034752] mb-10">
				Pourquoi rejoindre MonHubimmo ?
			</h2>

			<div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto text-[#034752]">
				<FeatureCard
					icon={
						<svg
							className="w-6 h-6 text-white"
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24"
						>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth={2}
								d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2 2z"
							/>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth={2}
								d="M8 5a2 2 0 012-2h4a2 2 0 012 2v2H8V5z"
							/>
						</svg>
					}
					title="Partage de biens"
					description="Partagez votre stock (mandats simples, exclusifs ou off market) avec d'autres mandataires."
				/>

				<FeatureCard
					icon={
						<svg
							className="w-6 h-6 text-white"
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24"
						>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth={2}
								d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
							/>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth={2}
								d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
							/>
						</svg>
					}
					title="Visibilité en temps réel"
					description="Visualisez les biens disponibles sur votre secteur et ceux de vos confrères en un coup d'œil."
				/>

				<FeatureCard
					icon={
						<svg
							className="w-6 h-6 text-white"
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24"
						>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth={2}
								d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
							/>
						</svg>
					}
					title="Trouvez pour vos clients"
					description="Accédez aux biens des autres agents immobiliers pour satisfaire les besoins de vos clients."
				/>

				<FeatureCard
					icon={
						<svg
							className="w-6 h-6 text-white"
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24"
						>
							<circle cx="12" cy="12" r="10" />
							<circle cx="12" cy="12" r="6" />
							<circle cx="12" cy="12" r="2" />
						</svg>
					}
					title="Recherches clients ciblées"
					description="Déposez des recherches et recevez des propositions adaptées automatiquement."
				/>

				<FeatureCard
					icon={
						<svg
							className="w-6 h-6 text-white"
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24"
						>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth={2}
								d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
							/>
						</svg>
					}
					title="Collaboration multi-réseaux"
					description="Collaborez facilement avec tous les professionnels de l'immobilier, indépendamment de leur réseau qu'ils soient indépendants, en réseau, mandataires, VRP ou en agence."
				/>

				<FeatureCard
					icon={
						<svg
							className="w-6 h-6 text-white"
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24"
						>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth={2}
								d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
							/>
						</svg>
					}
					title="Messagerie privée"
					description="Consultez l'historique de vos échanges et discutez en toute confidentialité."
				/>

				<FeatureCard
					icon={
						<svg
							className="w-6 h-6 text-white"
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24"
						>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth={2}
								d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
							/>
						</svg>
					}
					title="Tableau de bord intuitif"
					description="Gérez vos fiches clients, mandats et recherches simplement depuis un espace unique."
					className="md:col-span-2 lg:col-span-3"
				/>
			</div>
		</section>
	);
};
