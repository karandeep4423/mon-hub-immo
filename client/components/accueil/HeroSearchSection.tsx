import Image from 'next/image';
import { BaseLocationAutocomplete, Button } from '@/components/ui';
import { Components } from '@/lib/constants';

interface HeroSearchSectionProps {
	searchCity: string;
	searchPostalCode: string;
	searching: boolean;
	searchPerformed: boolean;
	onCitySelect: (location: {
		name: string;
		postcode: string;
		coordinates?: { lat: number; lon: number };
	}) => void;
	onSearch: () => void;
}

export const HeroSearchSection = ({
	searchCity,
	searchPostalCode,
	searching,
	searchPerformed,
	onCitySelect,
	onSearch,
}: HeroSearchSectionProps) => {
	return (
		<div className="bg-brand-gradient relative">
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16 pb-32 sm:pb-16 relative z-10">
				<div className="grid lg:grid-cols-2 gap-6 lg:gap-8 items-center">
					<div className="text-white">
						<p className="text-xs sm:text-sm mb-2 opacity-90">
							<span className="font-semibold">MonAgentImmo</span>,
							un service proposé par{' '}
							<span className="font-semibold">MonHubImmo</span>
						</p>
						<p className="text-xs mb-4 sm:mb-6 opacity-75">
							La 1ère plateforme qui met en relation particulier
							et agents immobiliers.
						</p>
						<h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 sm:mb-4 leading-tight">
							Prenez rendez-vous en ligne avec un agent immobilier
							de votre secteur en 1 clic
						</h1>
						<p className="text-sm sm:text-base mb-6 sm:mb-8 opacity-90">
							Estimation, mise en vente, recherche de biens, tout
							commence ici, simplement.
						</p>

						{/* Search Bar */}
						<div className="bg-white rounded-2xl sm:rounded-full mb-4 sm:mb-16 shadow-lg p-3 sm:p-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-2 relative z-[100]">
							<div className="flex justify-between items-center gap-2  relative flex-1 min-w-0">
								<svg
									className="w-5 h-5 text-gray-400 flex-shrink-0 left-2  absolute  top-1/2 -translate-y-1/2 z-10 pointer-events-none"
									fill="none"
									stroke="currentColor"
									viewBox="0 0 24 24"
								>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth={2}
										d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
									/>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth={2}
										d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
									/>
								</svg>
								<BaseLocationAutocomplete
									mode="single"
									value={searchCity}
									onSelect={(location) => {
										onCitySelect({
											name: location.name,
											postcode: location.postcode,
											coordinates: location.coordinates,
										});
									}}
									placeholder={
										Components.UI.FORM_PLACEHOLDERS
											.CITY_SEARCH
									}
									className="border-0 shadow-none focus:ring-0 pl-8 py-2.5 text-gray-900 w-full"
									showPostalCode={false}
								/>
							</div>
							<Button
								onClick={onSearch}
								loading={searching}
								disabled={
									!searchCity.trim() &&
									!searchPostalCode.trim()
								}
								className="bg-gradient-to-r from-pink-400 via-pink-500 to-pink-600 text-white px-6 sm:px-8 py-3 rounded-full font-semibold text-sm sm:text-base hover:from-pink-500 hover:via-pink-600 hover:to-pink-700 transition-all shadow-lg hover:shadow-xl active:scale-95 flex items-center justify-center gap-2 whitespace-nowrap flex-shrink-0 w-full sm:w-auto"
							>
								<svg
									className="w-5 h-5"
									fill="none"
									stroke="currentColor"
									viewBox="0 0 24 24"
								>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth={2}
										d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
									/>
								</svg>
								<span>Rechercher</span>
							</Button>
						</div>
					</div>

					{/* Show illustration only when no search performed */}
					{!searchPerformed && (
						<div className="hidden lg:flex justify-center items-center mt-6 lg:mt-0">
							<div className="relative w-full max-w-md">
								<Image
									src="/illustrations/calendar-booking.png"
									alt={
										Components.UI.IMAGE_ALT_TEXT
											.appointmentIllustration
									}
									width={400}
									height={400}
									className="w-full h-auto"
								/>
							</div>
						</div>
					)}
				</div>
			</div>
			{/* Decorative wave at bottom */}
			<div className="wave-separator" aria-hidden="true">
				<svg
					viewBox="0 0 1440 120"
					preserveAspectRatio="none"
					className="w-full h-[60px] sm:h-[80px] text-gray-50"
				>
					<path
						d="M0,64L48,58.7C96,53,192,43,288,53.3C384,64,480,96,576,112C672,128,768,128,864,117.3C960,107,1056,85,1152,69.3C1248,53,1344,43,1392,37.3L1440,32L1440,0L1392,0C1344,0,1248,0,1152,0C1056,0,960,0,864,0C768,0,672,0,576,0C480,0,384,0,288,0C192,0,96,0,48,0L0,0Z"
						fill="currentColor"
					/>
				</svg>
			</div>
		</div>
	);
};
