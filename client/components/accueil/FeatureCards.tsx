import Image from 'next/image';
import { Components } from '@/lib/constants';

interface FeatureCardsProps {
	onBookingClick: () => void;
}

export const FeatureCards = ({ onBookingClick }: FeatureCardsProps) => {
	return (
		<div className="bg-gray-50 pt-0 pb-8 sm:pb-12 lg:pb-16">
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6 sm:-mt-10 relative ">
				<div className="bg-white/95 backdrop-blur-sm rounded-xl sm:rounded-2xl border border-gray-100 shadow-md p-4 sm:p-6 md:p-8">
					<div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
						{/* Estimer ma maison */}
						<div className="bg-white rounded-lg p-4 sm:p-6 lg:p-8 text-center shadow-sm hover:shadow-md transition-shadow">
							<div className="w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 mx-auto mb-4 sm:mb-6 relative">
								<Image
									src="/illustrations/house-property.png"
									alt={
										Components.UI.IMAGE_ALT_TEXT
											.estimateHouse
									}
									width={96}
									height={96}
									className="w-full h-full object-contain"
								/>
							</div>
							<h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2 sm:mb-3">
								Estimer ma maison
							</h3>
							<p className="text-gray-600 text-xs sm:text-sm mb-4 sm:mb-6">
								Prenez rendez-vous pour une estimation gratuite
								et rapide de votre bien immobilier.
							</p>
							<button
								onClick={onBookingClick}
								className="text-brand hover:text-brand-dark font-medium text-xs sm:text-sm border border-brand hover:border-brand-dark px-4 sm:px-6 py-1.5 sm:py-2 rounded-full transition-colors"
							>
								Demander
							</button>
						</div>

						{/* Mettre en vente */}
						<div className="bg-white rounded-lg p-4 sm:p-6 lg:p-8 text-center shadow-sm hover:shadow-md transition-shadow">
							<div className="w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 mx-auto mb-4 sm:mb-6 relative">
								<Image
									src="/illustrations/handshake-agreement.png"
									alt={
										Components.UI.IMAGE_ALT_TEXT
											.sellProperty
									}
									width={96}
									height={96}
									className="w-full h-full object-contain"
								/>
							</div>
							<h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2 sm:mb-3">
								Mettre en vente
							</h3>
							<p className="text-gray-600 text-xs sm:text-sm mb-4 sm:mb-6">
								Confiez votre projet à un agent de confiance
								pour la mise en vente rapide.
							</p>
							<button
								onClick={onBookingClick}
								className="text-brand hover:text-brand-dark font-medium text-xs sm:text-sm border border-brand hover:border-brand-dark px-4 sm:px-6 py-1.5 sm:py-2 rounded-full transition-colors"
							>
								Demander
							</button>
						</div>

						{/* Chercher un bien */}
						<div className="bg-white rounded-lg p-4 sm:p-6 lg:p-8 text-center shadow-sm hover:shadow-md transition-shadow sm:col-span-2 lg:col-span-1">
							<div className="w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 mx-auto mb-4 sm:mb-6 relative">
								<Image
									src="/illustrations/search-properties.png"
									alt={
										Components.UI.IMAGE_ALT_TEXT
											.searchProperty
									}
									width={96}
									height={96}
									className="w-full h-full object-contain"
								/>
							</div>
							<h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2 sm:mb-3">
								Chercher un bien
							</h3>
							<p className="text-gray-600 text-xs sm:text-sm mb-4 sm:mb-6">
								Visionnez un agent pour trouver le logement qui
								correspond à vos critères.
							</p>
							<button
								onClick={onBookingClick}
								className="text-brand hover:text-brand-dark font-medium text-xs sm:text-sm border border-brand hover:border-brand-dark px-4 sm:px-6 py-1.5 sm:py-2 rounded-full transition-colors"
							>
								Demander
							</button>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};
