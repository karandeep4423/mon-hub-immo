'use client';
import Head from 'next/head';

const ConditionsGenerales = () => {
	return (
		<>
			<Head>
				<title>Conditions Générales - MonHubimmo</title>
				<meta
					name="description"
					content="Conditions Générales de Vente et d'Utilisation de MonHubimmo"
				/>
			</Head>

			<div className="min-h-screen bg-gray-50">
				{/* Main Content */}
				<main className="max-w-4xl mx-auto px-4 py-8 md:py-12">
					{/* Title Section */}
					<div className="bg-white rounded-lg shadow-sm p-6 md:p-8 mb-8">
						<h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
							Conditions Générales de Vente et d&apos;Utilisation
						</h1>
						<div className="flex items-center space-x-2 text-sm text-gray-600">
							<span className="bg-[#00b4d8] text-white px-3 py-1 rounded-full font-medium">
								MonHubimmo
							</span>
							<span>•</span>
							<span>Dernière mise à jour : 10 août 2025</span>
						</div>
					</div>

					{/* Content Sections */}
					<div className="space-y-8">
						{/* Section 1 */}
						<section className="bg-white rounded-lg shadow-sm p-6 md:p-8">
							<h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-4 flex items-center">
								<span className="bg-[#00b4d8] text-white w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold mr-3">
									1
								</span>
								Présentation de MonHubimmo
							</h2>
							<div className="ml-11 space-y-4 text-gray-700 text-sm md:text-base leading-relaxed">
								<p>
									MonHubimmo est une plateforme collaborative
									en ligne dédiée à la mise en relation des
									professionnels de l&apos;immobilier (agents
									immobiliers, mandataires, apporteurs
									d&apos;affaires, partenaires).
								</p>
								<p>
									L&apos;accès à la plateforme est strictement
									réservé aux professionnels disposant
									d&apos;une preuve de leur statut (numéro
									SIREN/SIRET, carte T, attestation employeur,
									etc.).
								</p>
								<p>
									MonHubimmo n&apos;est ni une agence
									immobilière, ni un intermédiaire agréé, ni
									un garant des transactions.
								</p>
								<p className="font-medium">
									Son rôle est uniquement de faciliter les
									échanges et la circulation
									d&apos;informations entre ses utilisateurs.
								</p>
							</div>
						</section>

						{/* Section 2 */}
						<section className="bg-white rounded-lg shadow-sm p-6 md:p-8">
							<h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-4 flex items-center">
								<span className="bg-[#00b4d8] text-white w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold mr-3">
									2
								</span>
								Objet des CGV / CGU
							</h2>
							<div className="ml-11 text-gray-700 text-sm md:text-base leading-relaxed">
								<p>
									Ces conditions définissent les modalités
									d&apos;utilisation de la plateforme
									MonHubimmo ainsi que les droits et
									obligations des utilisateurs et de
									l&apos;éditeur.
								</p>
							</div>
						</section>

						{/* Section 3 */}
						<section className="bg-white rounded-lg shadow-sm p-6 md:p-8">
							<h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-4 flex items-center">
								<span className="bg-[#00b4d8] text-white w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold mr-3">
									3
								</span>
								Accès à la plateforme
							</h2>
							<div className="ml-11 space-y-4 text-gray-700 text-sm md:text-base leading-relaxed">
								<p>
									L&apos;inscription est réservée aux
									professionnels de l&apos;immobilier
									justifiant de leur statut.
								</p>
								<p>
									L&apos;accès requiert la création d&apos;un
									compte et l&apos;acceptation des présentes
									CGV/CGU.
								</p>
								<p>
									MonHubimmo se réserve le droit de refuser ou
									de suspendre l&apos;accès à tout utilisateur
									ne respectant pas ces conditions.
								</p>
							</div>
						</section>

						{/* Section 4 */}
						<section className="bg-white rounded-lg shadow-sm p-6 md:p-8">
							<h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-4 flex items-center">
								<span className="bg-[#00b4d8] text-white w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold mr-3">
									4
								</span>
								Fonctionnalités proposées
							</h2>
							<div className="ml-11 space-y-4 text-gray-700 text-sm md:text-base leading-relaxed">
								<p>MonHubimmo met à disposition :</p>
								<ul className="list-disc list-inside space-y-2 ml-4">
									<li>
										Un espace pour publier et consulter des
										biens immobiliers
									</li>
									<li>
										Un système de recherche et de mise en
										relation entre professionnels
									</li>
									<li>Une messagerie interne intégrée</li>
									<li>
										Un espace dédié aux apporteurs
										d&apos;affaires
									</li>
								</ul>
								<div className="bg-amber-50 border-l-4 border-amber-400 p-4 rounded">
									<p className="font-semibold text-amber-800 mb-2">
										Important :
									</p>
									<p className="text-amber-700">
										MonHubimmo ne s&apos;implique pas dans
										les transactions, ne prend aucune
										commission et ne vérifie pas
										l&apos;exactitude des informations
										publiées par les membres.
									</p>
								</div>
							</div>
						</section>

						{/* Section 5 */}
						<section className="bg-white rounded-lg shadow-sm p-6 md:p-8">
							<h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-4 flex items-center">
								<span className="bg-[#00b4d8] text-white w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold mr-3">
									5
								</span>
								Responsabilités
							</h2>
							<div className="ml-11 space-y-6 text-gray-700 text-sm md:text-base leading-relaxed">
								<div>
									<h3 className="font-semibold text-gray-900 mb-2">
										Responsabilité de MonHubimmo
									</h3>
									<p>
										Nous nous efforçons d&apos;assurer un
										service fiable, mais nous ne
										garantissons pas l&apos;absence
										d&apos;interruptions ou d&apos;erreurs
										techniques.
									</p>
								</div>
								<div>
									<h3 className="font-semibold text-gray-900 mb-2">
										Responsabilité des utilisateurs
									</h3>
									<p>
										Chaque membre est seul responsable des
										informations qu&apos;il publie et des
										engagements pris via la plateforme.
									</p>
								</div>
							</div>
						</section>

						{/* Section 6 */}
						<section className="bg-white rounded-lg shadow-sm p-6 md:p-8">
							<h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-4 flex items-center">
								<span className="bg-[#00b4d8] text-white w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold mr-3">
									6
								</span>
								Tarifs et conditions de paiement
							</h2>
							<div className="ml-11 space-y-4 text-gray-700 text-sm md:text-base leading-relaxed">
								<p>
									Certaines fonctionnalités peuvent être
									gratuites ou soumises à abonnement.
								</p>
								<p>
									Les tarifs en vigueur sont visibles sur le
									site.
								</p>
								<p>
									Tout abonnement payé est dû pour la période
									engagée et n&apos;est pas remboursable, sauf
									exceptions prévues par la loi.
								</p>
							</div>
						</section>

						{/* Section 7 */}
						<section className="bg-white rounded-lg shadow-sm p-6 md:p-8">
							<h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-4 flex items-center">
								<span className="bg-[#00b4d8] text-white w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold mr-3">
									7
								</span>
								Propriété intellectuelle
							</h2>
							<div className="ml-11 text-gray-700 text-sm md:text-base leading-relaxed">
								<p>
									Tous les contenus présents sur MonHubimmo
									(textes, logos, éléments graphiques) sont
									protégés par droits d&apos;auteur. Toute
									reproduction ou utilisation sans
									autorisation est interdite.
								</p>
							</div>
						</section>

						{/* Section 8 */}
						<section className="bg-white rounded-lg shadow-sm p-6 md:p-8">
							<h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-4 flex items-center">
								<span className="bg-[#00b4d8] text-white w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold mr-3">
									8
								</span>
								Données personnelles
							</h2>
							<div className="ml-11 text-gray-700 text-sm md:text-base leading-relaxed">
								<p>
									MonHubimmo collecte et traite vos données
									conformément à notre politique de
									confidentialité, en accord avec le RGPD.
								</p>
							</div>
						</section>

						{/* Section 9 */}
						<section className="bg-white rounded-lg shadow-sm p-6 md:p-8">
							<h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-4 flex items-center">
								<span className="bg-[#00b4d8] text-white w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold mr-3">
									9
								</span>
								Résiliation
							</h2>
							<div className="ml-11 text-gray-700 text-sm md:text-base leading-relaxed">
								<p>
									MonHubimmo se réserve le droit de suspendre
									ou supprimer un compte en cas de non-respect
									des présentes conditions ou de comportement
									inapproprié.
								</p>
							</div>
						</section>

						{/* Section 10 */}
						<section className="bg-white rounded-lg shadow-sm p-6 md:p-8">
							<h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-4 flex items-center">
								<span className="bg-[#00b4d8] text-white w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold mr-3">
									10
								</span>
								Loi applicable
							</h2>
							<div className="ml-11 text-gray-700 text-sm md:text-base leading-relaxed">
								<p>
									Ces conditions sont soumises au droit
									français. Tout litige sera soumis à la
									compétence exclusive des tribunaux français.
								</p>
							</div>
						</section>

						{/* Final Notice */}
						<section className="bg-[#00b4d8] text-white rounded-lg p-6 md:p-8">
							<p className="text-center text-sm md:text-base font-medium">
								En utilisant MonHubimmo, vous reconnaissez avoir
								lu et accepté ces CGV/CGU.
							</p>
						</section>
					</div>

					{/* Back to Top Button */}
					<div className="text-center mt-12">
						<button
							onClick={() =>
								window.scrollTo({ top: 0, behavior: 'smooth' })
							}
							className="bg-white text-[#00b4d8] border border-[#00b4d8] px-6 py-3 rounded-full font-medium hover:bg-[#00b4d8] hover:text-white transition-colors duration-200"
						>
							↑ Retour en haut
						</button>
					</div>
				</main>
			</div>
		</>
	);
};

export default ConditionsGenerales;
