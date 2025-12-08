'use client';
import Head from 'next/head';

const PolitiqueConfidentialite = () => {
	return (
		<>
			<Head>
				<title>Politique de confidentialité - MonHubimmo</title>
				<meta
					name="description"
					content="Politique de confidentialité de MonHubimmo"
				/>
			</Head>

			<div className="min-h-screen bg-gray-50">
				{/* Main Content */}
				<main className="max-w-4xl mx-auto px-4 py-8 md:py-12">
					{/* Title Section */}
					<div className="bg-white rounded-lg shadow-sm p-6 md:p-8 mb-8">
						<h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
							Politique de confidentialité
						</h1>
						<div className="flex items-center space-x-2 text-sm text-gray-600">
							<span className="bg-[#00b4d8] text-white px-3 py-1 rounded-full font-medium">
								MonHubimmo
							</span>
							<span>•</span>
							<span>Dernière mise à jour : 14 août 2025</span>
						</div>
					</div>

					{/* Content Sections */}
					<div className="space-y-8">
						{/* Introduction */}
						<section className="bg-white rounded-lg shadow-sm p-6 md:p-8">
							<div className="text-gray-700 text-sm md:text-base leading-relaxed">
								<p>
									Chez MonHubimmo, la protection de vos
									données personnelles est une priorité. Nous
									nous engageons à assurer la transparence et
									la sécurité dans le traitement des
									informations que vous nous confiez.
								</p>
							</div>
						</section>

						{/* Section 1 */}
						<section className="bg-white rounded-lg shadow-sm p-6 md:p-8">
							<h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-4 flex items-center">
								<span className="bg-[#00b4d8] text-white w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold mr-3">
									1
								</span>
								Données collectées
							</h2>
							<div className="ml-11 space-y-4 text-gray-700 text-sm md:text-base leading-relaxed">
								<p>
									Lors de votre inscription, nous pouvons être
									amenés à collecter :
								</p>
								<ul className="list-disc list-inside space-y-2 ml-4">
									<li>Votre nom, prénom</li>
									<li>Votre adresse e-mail</li>
									<li>Votre numéro de téléphone</li>
									<li>
										Vos informations professionnelles
										(réseau, agence, carte T, SIREN/RSAC…)
									</li>
								</ul>
								<p>
									Ces informations sont nécessaires pour
									vérifier votre statut de professionnel et
									vous donner accès à la plateforme.
								</p>
							</div>
						</section>

						{/* Section 2 */}
						<section className="bg-white rounded-lg shadow-sm p-6 md:p-8">
							<h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-4 flex items-center">
								<span className="bg-[#00b4d8] text-white w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold mr-3">
									2
								</span>
								Utilisation des données
							</h2>
							<div className="ml-11 space-y-4 text-gray-700 text-sm md:text-base leading-relaxed">
								<p>
									Vos données sont utilisées uniquement pour :
								</p>
								<ul className="list-disc list-inside space-y-2 ml-4">
									<li>
										Créer et gérer votre compte MonHubimmo
									</li>
									<li>
										Vous informer sur le lancement et
										l&apos;évolution de la plateforme
									</li>
									<li>
										Assurer la sécurité des échanges et des
										publications
									</li>
									<li>
										Vous adresser, si vous l&apos;acceptez,
										des communications liées à nos services
									</li>
								</ul>
								<p className="font-medium">
									Nous ne vendons ni ne partageons vos données
									personnelles à des tiers non autorisés.
								</p>
							</div>
						</section>

						{/* Section 3 */}
						<section className="bg-white rounded-lg shadow-sm p-6 md:p-8">
							<h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-4 flex items-center">
								<span className="bg-[#00b4d8] text-white w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold mr-3">
									3
								</span>
								Hébergement et sécurité
							</h2>
							<div className="ml-11 space-y-4 text-gray-700 text-sm md:text-base leading-relaxed">
								<p>
									Vos données sont stockées sur des serveurs
									sécurisés situés en Europe.
								</p>
								<p>
									Des mesures techniques et organisationnelles
									sont mises en place pour prévenir toute
									perte, utilisation abusive, accès non
									autorisé ou divulgation.
								</p>
							</div>
						</section>

						{/* Section 4 */}
						<section className="bg-white rounded-lg shadow-sm p-6 md:p-8">
							<h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-4 flex items-center">
								<span className="bg-[#00b4d8] text-white w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold mr-3">
									4
								</span>
								Droits des utilisateurs
							</h2>
							<div className="ml-11 space-y-4 text-gray-700 text-sm md:text-base leading-relaxed">
								<p>
									Conformément au Règlement Général sur la
									Protection des Données (RGPD), vous disposez
									de droits :
								</p>
								<ul className="list-disc list-inside space-y-2 ml-4">
									<li>Accéder à vos données personnelles</li>
									<li>
										Demander leur rectification ou
										suppression
									</li>
									<li>
										Limiter ou vous opposer à leur
										traitement
									</li>
									<li>
										Retirer votre consentement à tout moment
									</li>
								</ul>
								<div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded mt-4">
									<p className="font-semibold text-blue-800 mb-2">
										Pour exercer vos droits :
									</p>
									<p className="text-blue-700">
										Contactez-nous à :{' '}
										<a
											href="mailto:contact@monhubimmo.fr"
											className="underline font-medium"
										>
											contact@monhubimmo.fr
										</a>
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
								Conservation des données
							</h2>
							<div className="ml-11 text-gray-700 text-sm md:text-base leading-relaxed">
								<p>
									Vos données sont conservées uniquement
									pendant la durée nécessaire à la gestion de
									votre compte et conformément aux obligations
									légales.
								</p>
							</div>
						</section>

						{/* Section 6 */}
						<section className="bg-white rounded-lg shadow-sm p-6 md:p-8">
							<h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-4 flex items-center">
								<span className="bg-[#00b4d8] text-white w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold mr-3">
									6
								</span>
								Contact
							</h2>
							<div className="ml-11 space-y-4 text-gray-700 text-sm md:text-base leading-relaxed">
								<p>
									Pour toute question relative à la protection
									de vos données personnelles, vous pouvez
									nous écrire à :
								</p>
								<div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded mt-4">
									<p className="text-blue-700">
										📧{' '}
										<a
											href="mailto:contact@monhubimmo.fr"
											className="underline font-medium"
										>
											contact@monhubimmo.fr
										</a>
									</p>
								</div>
							</div>
						</section>

						{/* Final Notice */}
						<section className="bg-[#00b4d8] text-white rounded-lg p-6 md:p-8">
							<p className="text-center text-sm md:text-base font-medium">
								En utilisant MonHubimmo, vous acceptez notre
								politique de confidentialité et le traitement de
								vos données personnelles dans les conditions
								décrites ci-dessus.
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

export default PolitiqueConfidentialite;
