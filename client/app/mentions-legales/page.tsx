'use client';
import Head from 'next/head';

const MentionsLegales = () => {
	return (
		<>
			<Head>
				<title>Mentions légales - MonHubimmo</title>
				<meta
					name="description"
					content="Mentions légales de MonHubimmo"
				/>
			</Head>

			<div className="min-h-screen bg-gray-50">
				{/* Main Content */}
				<main className="max-w-4xl mx-auto px-4 py-8 md:py-12">
					{/* Title Section */}
					<div className="bg-white rounded-lg shadow-sm p-6 md:p-8 mb-8">
						<h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
							Mentions légales
						</h1>
						<div className="flex items-center space-x-2 text-sm text-gray-600">
							<span className="bg-[#00b4d8] text-white px-3 py-1 rounded-full font-medium">
								MonHubimmo
							</span>
							<span>•</span>
							<span>Dernière mise à jour : 29 août 2025</span>
						</div>
					</div>

					{/* Content Sections */}
					<div className="space-y-8">
						{/* Section 1 - Site Editor */}
						<section className="bg-white rounded-lg shadow-sm p-6 md:p-8">
							<h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-4 flex items-center">
								<span className="bg-[#00b4d8] text-white w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold mr-3">
									1
								</span>
								Éditeur du site
							</h2>
							<div className="ml-11 space-y-4 text-gray-700 text-sm md:text-base leading-relaxed">
								<p>Le site MonHubimmo est édité par :</p>
								<ul className="list-disc list-inside space-y-2 ml-4">
									<li>
										<span className="font-medium">
											Nom de l&apos;entreprise :
										</span>{' '}
										MonHubimmo
									</li>
									<li>
										<span className="font-medium">
											Forme juridique :
										</span>{' '}
										SAS
									</li>
									<li>
										<span className="font-medium">
											Siège social :
										</span>{' '}
										[Adresse complète]
									</li>
									<li>
										<span className="font-medium">
											SIRET :
										</span>{' '}
										[Numéro SIRET – En cours de création]
									</li>
									<li>
										<span className="font-medium">
											Responsable de la publication :
										</span>{' '}
										[Nom, prénom]
									</li>
								</ul>
							</div>
						</section>

						{/* Section 2 - Hosting */}
						<section className="bg-white rounded-lg shadow-sm p-6 md:p-8">
							<h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-4 flex items-center">
								<span className="bg-[#00b4d8] text-white w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold mr-3">
									2
								</span>
								Hébergement
							</h2>
							<div className="ml-11 text-gray-700 text-sm md:text-base leading-relaxed">
								<p>Le site est hébergé par Vercel</p>
							</div>
						</section>

						{/* Section 3 - Intellectual Property */}
						<section className="bg-white rounded-lg shadow-sm p-6 md:p-8">
							<h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-4 flex items-center">
								<span className="bg-[#00b4d8] text-white w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold mr-3">
									3
								</span>
								Propriété intellectuelle
							</h2>
							<div className="ml-11 text-gray-700 text-sm md:text-base leading-relaxed">
								<p>
									L&apos;ensemble des contenus du site
									(textes, images, logo, charte graphique) est
									protégé par le droit de la propriété
									intellectuelle.
								</p>
								<p className="mt-4 font-medium">
									Toute reproduction, diffusion ou utilisation
									sans autorisation est interdite.
								</p>
							</div>
						</section>

						{/* Section 4 - Data Protection */}
						<section className="bg-white rounded-lg shadow-sm p-6 md:p-8">
							<h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-4 flex items-center">
								<span className="bg-[#00b4d8] text-white w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold mr-3">
									4
								</span>
								Protection des données
							</h2>
							<div className="ml-11 text-gray-700 text-sm md:text-base leading-relaxed">
								<p>
									Pour plus d&apos;informations sur la
									collecte et le traitement de vos données
									personnelles, consultez notre{' '}
									<a
										href="/politique-confidentialite"
										className="text-[#00b4d8] underline hover:text-blue-600 font-medium"
									>
										Politique de confidentialité
									</a>
									.
								</p>
							</div>
						</section>

						{/* Final Notice */}
						<section className="bg-[#00b4d8] text-white rounded-lg p-6 md:p-8">
							<p className="text-center text-sm md:text-base font-medium">
								Ces mentions légales peuvent être modifiées à
								tout moment. Il appartient à l&apos;utilisateur
								de s&apos;y référer régulièrement.
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

export default MentionsLegales;
