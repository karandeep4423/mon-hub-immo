import React from 'react';

export const PricingBanner: React.FC = () => {
	return (
		<div className="w-full my-3 bg-gradient-to-r from-cyan-500 to-cyan-600 rounded-3xl p-5 text-white shadow-2xl overflow-hidden relative">
			<div className="grid grid-cols-2 gap-6">
				{/* Header */}
				<div>
					<h3 className="text-2xl font-bold mb-6">
						Offre de lancement
					</h3>

					{/* Price Section - Left aligned */}
					<div className="flex items-baseline gap-2 mb-3">
						<span className="text-4xl font-black tracking-tight">
							2€
						</span>
						<span className="text-3xl font-bold text-cyan-800">
							/mois
						</span>
					</div>

					<p className="text-base font-medium mb-6">Pendant 1 an</p>
				</div>
				{/* Features - Right aligned bold keywords */}
				<div className="grid grid-cols-1 gap-1 text-sm font-medium text-right">
					<div>
						<span className="font-bold">Partage</span>{' '}
						<span className="font-normal">de mandats</span>
					</div>
					<div>
						<span className="font-normal">Partage de</span>{' '}
						<span className="font-bold">recherches clients</span>
					</div>
					<div>
						<span className="font-bold">Off-market</span>
					</div>
					<div>
						<span className="font-normal">Collaboration</span>{' '}
						<span className="font-bold">inter-réseaux</span>
					</div>
					<div>
						<span className="font-bold">Messagerie</span>
					</div>
					<div>
						<span className="font-bold">Centralisation</span>{' '}
						<span className="font-normal">des échanges</span>
					</div>
					<div>
						<span className="font-bold">
							Apporteurs d&apos;affaires
						</span>
					</div>
					<div>
						<span className="font-bold">Prise de RDV</span>{' '}
						<span className="font-normal">en ligne</span>
					</div>
				</div>
			</div>

			{/* Footer */}
			<p className="text-xs text-center mt-6 italic opacity-90">
				Tarif fixe de 2€ HT /mois pendant 12 mois, non renouvelable
				automatiquement
			</p>
		</div>
	);
};
