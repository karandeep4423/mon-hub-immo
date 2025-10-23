interface PlatformFeaturesSectionProps {
	onScrollToForm: () => void;
}

export const PlatformFeaturesSection = ({
	onScrollToForm,
}: PlatformFeaturesSectionProps) => {
	return (
		<section className="bg-white py-16 px-6 text-brand-deep">
			<div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-8 items-center">
				{/* Texte principal */}
				<div className="flex flex-col items-center text-center">
					<h2 className="text-3xl md:text-4xl font-bold mb-4">
						La plateforme qui connecte
						<br /> les professionnels de l&lsquo;immobilier
					</h2>
					<p className="mb-6">
						Centralisez vos annonces, collaborez entre agents,
						trouvez plus vite les bons biens pour vos clients.
					</p>
					<ul className="flex flex-col text-left">
						<li className="flex items-center gap-3">
							<svg
								className="w-5 h-5 text-brand flex-shrink-0"
								fill="none"
								stroke="currentColor"
								strokeWidth={2}
								viewBox="0 0 24 24"
							>
								<path d="M16 12a4 4 0 01-8 0V8a4 4 0 018 0v4z" />
								<path d="M12 16v2m0 0h-4m4 0h4" />
							</svg>
							<span>Réseau privé entre agents</span>
						</li>
						<li className="flex items-center gap-3">
							<svg
								className="w-5 h-5 text-brand flex-shrink-0"
								fill="none"
								stroke="currentColor"
								strokeWidth={2}
								viewBox="0 0 24 24"
							>
								<path d="M4 6h16M4 10h16M4 14h16M4 18h16" />
							</svg>
							<span>Annonces internes et exclusives</span>
						</li>
						<li className="flex items-center gap-3">
							<svg
								className="w-5 h-5 text-brand flex-shrink-0"
								fill="none"
								stroke="currentColor"
								strokeWidth={2}
								viewBox="0 0 24 24"
							>
								<path d="M12 8v8m0 0l-4-4m4 4l4-4" />
								<circle cx="12" cy="12" r="10" />
							</svg>
							<span>Apporteurs d&apos;affaires intégrés</span>
						</li>
					</ul>
					<button
						onClick={onScrollToForm}
						className="mt-6 bg-brand text-white px-6 py-2 rounded-full font-semibold hover:bg-brand-dark transition"
					>
						Je réserve ma place
					</button>
				</div>

				{/* video */}
				<div className="relative w-full h-72   max-w-md mx-auto">
					<video
						className="w-full h-full object-fill rounded-lg shadow-xl"
						controls
					>
						<source src="/partie.mp4" type="video/mp4" />
						Your browser does not support the video tag.
					</video>
					<button
						className="absolute inset-0 flex items-center justify-center"
						onClick={(e) => {
							const video = e.currentTarget
								.previousElementSibling as HTMLVideoElement;
							if (video.paused) {
								video.play();
								e.currentTarget.style.display = 'none';
							}
						}}
					>
						<div className="w-20 h-20 bg-white rounded-full flex items-center justify-center">
							<svg
								className="w-12 h-12 text-brand"
								fill="currentColor"
								viewBox="0 0 20 20"
							>
								<path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
							</svg>
						</div>
					</button>
				</div>
			</div>

			{/* Fonctionnalités clés */}
			<section className="bg-white py-16 px-6 text-brand-deep">
				<div className="max-w-6xl mx-auto">
					<h3 className="text-2xl font-bold text-center mb-12">
						Fonctionnalités clés
					</h3>

					<div className="grid md:grid-cols-2 gap-10">
						{/* Bloc 1 */}
						<div className="flex items-start gap-4">
							<div className="flex-shrink-0">
								<svg
									className="w-6 h-6 text-brand"
									fill="none"
									stroke="currentColor"
									strokeWidth={2}
									viewBox="0 0 24 24"
								>
									<path d="M12 2l7 4v6c0 5.25-3.5 9.74-7 10-3.5-.26-7-4.75-7-10V6l7-4z" />
								</svg>
							</div>
							<div>
								<h4 className="font-semibold text-lg mb-1">
									Partage d&apos;annonces privé
								</h4>
								<p className="text-sm text-gray-700">
									Déposez et consultez des biens, entre pros,
									en toute confidentialité.
								</p>
							</div>
						</div>

						{/* Bloc 2 */}
						<div className="flex items-start gap-4">
							<div className="flex-shrink-0">
								<svg
									className="w-6 h-6 text-brand"
									fill="none"
									stroke="currentColor"
									strokeWidth={2}
									viewBox="0 0 24 24"
								>
									<path d="M21 12.79A9 9 0 1111.21 3H12a9 9 0 019 9z" />
								</svg>
							</div>
							<div>
								<h4 className="font-semibold text-lg mb-1">
									Apporteurs d&apos;affaires intégrés
								</h4>
								<p className="text-sm text-gray-700">
									Offrez une interface simple à vos apporteurs
									pour qu&apos;ils vous transmettent des
									opportunités.
								</p>
							</div>
						</div>

						{/* Bloc 3 */}
						<div className="flex items-start gap-4">
							<div className="flex-shrink-0">
								<svg
									className="w-6 h-6 text-brand"
									fill="none"
									stroke="currentColor"
									strokeWidth={2}
									viewBox="0 0 24 24"
								>
									<path d="M8 17l4-4 4 4m0-5V3" />
								</svg>
							</div>
							<div>
								<h4 className="font-semibold text-lg mb-1">
									Collaboration simplifiée
								</h4>
								<p className="text-sm text-gray-700">
									Mettez en relation les bons biens avec les
									bons clients grâce à un système connecté.
								</p>
							</div>
						</div>

						{/* Bloc 4 */}
						<div className="flex items-start gap-4">
							<div className="flex-shrink-0">
								<svg
									className="w-6 h-6 text-brand"
									fill="none"
									stroke="currentColor"
									strokeWidth={2}
									viewBox="0 0 24 24"
								>
									<path d="M17 9V7a4 4 0 00-8 0v2M5 10h14l-1 10H6L5 10z" />
								</svg>
							</div>
							<div>
								<h4 className="font-semibold text-lg mb-1">
									Application mobile intuitive
								</h4>
								<p className="text-sm text-gray-700">
									Une interface claire, rapide, pensée pour le
									terrain.
								</p>
							</div>
						</div>
					</div>
				</div>
			</section>
			<div className="relative w-full h-full   max-w-md mx-auto">
				<video
					className="w-full h-full object-fill rounded-lg shadow-xl"
					controls
				>
					<source src="/second.mp4" type="video/mp4" />
					Your browser does not support the video tag.
				</video>
				<button
					className="absolute inset-0 flex items-center justify-center"
					onClick={(e) => {
						const video = e.currentTarget
							.previousElementSibling as HTMLVideoElement;
						if (video.paused) {
							video.play();
							e.currentTarget.style.display = 'none';
						}
					}}
				>
					<div className="w-20 h-20 bg-white rounded-full flex items-center justify-center">
						<svg
							className="w-12 h-12 text-brand"
							fill="currentColor"
							viewBox="0 0 20 20"
						>
							<path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
						</svg>
					</div>
				</button>
			</div>
		</section>
	);
};
