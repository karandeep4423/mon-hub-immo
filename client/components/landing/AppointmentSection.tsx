import Image from 'next/image';

export const AppointmentSection = () => {
	return (
		<section className="bg-white pb-16 px-6">
			<div className="max-w-6xl mx-auto">
				<h2 className="text-xl md:text-xl font-bold text-center text-white mb-8 bg-[#00b4d8] p-6 rounded-lg">
					MonHubimmo, la passerelle digitale entre les besoins des
					particuliers et les solutions des pros.
				</h2>

				<div className="grid md:grid-cols-2 gap-8 items-start">
					<div className="rounded-lg p-8 text-[#034752]">
						<h3 className="text-xl md:text-2xl font-bold mb-4">
							La prise de rendez-vous immobilière, aussi simple
							que sur Doctolib.
						</h3>

						<p className="text-lg mb-4 text-[#5b7c8d]">
							En plus du partage de mandats et des affaires
							apportées, MonHubimmo va plus loin.
						</p>

						<p className="text-lg mb-6 text-[#5b7c8d]">
							Chaque agent inscrit bénéficie automatiquement
							d&apos;une fiche visible dans l&apos;annuaire des
							professionnels.
						</p>

						<div className="bg-gray-50 p-6 rounded-lg">
							<p className="text-md mb-4 text-[#5b7c8d]">
								Un peu comme Doctolib, cette option vous permet
								de :
							</p>

							<ul className="space-y-3">
								<li className="flex items-start gap-3">
									<span className="text-[#00b4d8] font-bold text-xl">
										-
									</span>
									<span className="text-[#5b7c8d]">
										Être visible dans votre secteur,
									</span>
								</li>
								<li className="flex items-start gap-3">
									<span className="text-[#00b4d8] font-bold text-xl">
										-
									</span>
									<span className="text-[#5b7c8d]">
										Recevoir directement des demandes de
										rendez-vous,
									</span>
								</li>
								<li className="flex items-start gap-3">
									<span className="text-[#00b4d8] font-bold text-xl">
										-
									</span>
									<span className="text-[#5b7c8d]">
										Attirer de nouveaux leads et
										opportunités locales.
									</span>
								</li>
							</ul>

							<p className="text-md mt-6 text-[#5b7c8d]">
								Une fonctionnalité en plus, gratuite, pour
								renforcer votre visibilité et générer encore
								plus de collaborations.
							</p>
						</div>
					</div>

					<div className="flex items-start justify-center">
						<Image
							src="/rendez-vous.png"
							alt="Prise de rendez-vous en ligne"
							width={600}
							height={400}
							className="w-full h-auto rounded-lg shadow-lg"
						/>
					</div>
				</div>
			</div>
		</section>
	);
};
