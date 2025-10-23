'use client';

import React, { useState, useRef, useMemo } from 'react';
import Image from 'next/image';
import { AgentService, type Agent } from '@/lib/api/agentApi';
import { useFetch } from '@/hooks';
import { PageLoader } from '@/components/ui/LoadingSpinner';
import { BookAppointmentModal } from '@/components/appointments/BookAppointmentModal';
import {
	HeroSearchSection,
	FeatureCards,
	AgentsListSection,
} from '@/components/monagentimmo';

export default function MonAgentImmoPage() {
	// Fetch agents using useFetch hook (replaces manual state management)
	const { data: agents = [], loading } = useFetch<Agent[]>(
		() => AgentService.getAllAgents(),
		{
			showErrorToast: true,
			errorMessage: 'Impossible de charger les agents',
		},
	);

	// Search state
	const [searchCity, setSearchCity] = useState('');
	const [searchPostalCode, setSearchPostalCode] = useState('');
	const [searchPerformed, setSearchPerformed] = useState(false);
	const [searching, setSearching] = useState(false);

	// UI refs
	const carouselRef = useRef<HTMLDivElement>(null);
	const searchSectionRef = useRef<HTMLDivElement>(null);

	// Booking modal state
	const [showBooking, setShowBooking] = useState(false);
	const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);

	// Filtered agents based on search (using useMemo for performance)
	const filteredAgents = useMemo(() => {
		if (!searchPerformed || (!searchCity && !searchPostalCode)) {
			return agents;
		}

		const cityQuery = searchCity.toLowerCase().trim();
		const postalQuery = searchPostalCode.trim();

		return agents.filter((agent) => {
			const agentCity = agent.professionalInfo?.city?.toLowerCase() || '';
			const agentPostalCode = agent.professionalInfo?.postalCode || '';

			const cityMatch = !cityQuery || agentCity.includes(cityQuery);
			const postalMatch =
				!postalQuery || agentPostalCode.includes(postalQuery);

			return cityMatch && postalMatch;
		});
	}, [agents, searchCity, searchPostalCode, searchPerformed]);

	// Handle search button click
	const handleSearch = () => {
		if (!searchCity.trim() && !searchPostalCode.trim()) {
			setSearchPerformed(false);
			return;
		}

		setSearching(true);

		// Simulate a brief loading state for better UX
		setTimeout(() => {
			setSearchPerformed(true);
			setSearching(false);

			// Scroll to results
			setTimeout(() => {
				carouselRef.current?.scrollIntoView({
					behavior: 'smooth',
					block: 'start',
				});
			}, 100);
		}, 300);
	};

	const scrollCarousel = (direction: 'left' | 'right') => {
		if (carouselRef.current) {
			const scrollAmount = 320;
			carouselRef.current.scrollBy({
				left: direction === 'left' ? -scrollAmount : scrollAmount,
				behavior: 'smooth',
			});
		}
	};

	const openBookingForFirstAgent = () => {
		const availableAgents = searchPerformed ? filteredAgents : agents;
		if (availableAgents.length > 0) {
			setSelectedAgent(availableAgents[0]);
			setShowBooking(true);
			// Scroll to carousel region for context
			carouselRef.current?.scrollIntoView({
				behavior: 'smooth',
				block: 'center',
			});
		}
	};

	const scrollToSearch = () => {
		searchSectionRef.current?.scrollIntoView({
			behavior: 'smooth',
			block: 'center',
		});
	};

	// Show loading state
	if (loading) {
		return <PageLoader message="Chargement des agents..." />;
	}

	return (
		<>
			<div className="min-h-screen bg-white">
				{/* Hero Section with Search */}
				<HeroSearchSection
					searchCity={searchCity}
					searchPostalCode={searchPostalCode}
					searching={searching}
					searchPerformed={searchPerformed}
					onCitySelect={(location) => {
						setSearchCity(location.name);
						setSearchPostalCode(location.postcode);
					}}
					onSearch={handleSearch}
				/>

				{/* Feature Cards - overlapping panel (only show when no search performed) */}
				{!searchPerformed && (
					<FeatureCards onBookingClick={openBookingForFirstAgent} />
				)}

				{/* Agent Cards List */}
				<AgentsListSection
					ref={searchSectionRef}
					carouselRef={carouselRef}
					searchPerformed={searchPerformed}
					filteredAgents={filteredAgents}
					searchCity={searchCity}
					searchPostalCode={searchPostalCode}
					onScrollCarousel={scrollCarousel}
					onResetSearch={() => {
						setSearchCity('');
						setSearchPostalCode('');
						setSearchPerformed(false);
					}}
				/>

				{/* Info Section - Prenez rendez-vous (hide when search performed) */}
				{!searchPerformed && (
					<div className="bg-gray-50 py-8 sm:py-12 lg:py-16">
						<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
							<div className="grid lg:grid-cols-3 gap-6 sm:gap-8 lg:gap-12 items-center">
								<div className="order-2 lg:order-1">
									<div className="relative max-w-xs mx-auto lg:max-w-none">
										<Image
											src="/illustrations/search-properties.png"
											alt="Professional team"
											width={500}
											height={400}
											className="w-full h-auto"
										/>
									</div>
								</div>
								<div className="order-1 lg:order-2">
									<h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4 sm:mb-6">
										Prenez rendez-vous avec un professionnel
										de l&apos;immobilier.
									</h2>
									<p className="text-sm sm:text-base text-gray-700 mb-4 sm:mb-6 leading-relaxed">
										Besoin d&apos;estimer, vendre ou
										acquérir un bien. Prenez rendez-vous
										avec l&apos;agent immobilier de votre
										secteur.
									</p>
									<p className="text-sm sm:text-base text-gray-700 mb-3 sm:mb-4 leading-relaxed">
										Et très vite rendez-vous, votre
										bien-être partagé sur la plateforme
										entre vous:
									</p>
									<ul className="space-y-2 mb-6 sm:mb-8">
										<li className="flex items-start gap-2 sm:gap-3">
											<svg
												className="w-4 h-4 sm:w-5 sm:h-5 text-brand mt-0.5 flex-shrink-0"
												fill="none"
												stroke="currentColor"
												viewBox="0 0 24 24"
											>
												<path
													strokeLinecap="round"
													strokeLinejoin="round"
													strokeWidth={2}
													d="M5 13l4 4L19 7"
												/>
											</svg>
											<span className="text-sm sm:text-base text-gray-700">
												Une base de plus d&apos;agents
												inscrits
											</span>
										</li>
										<li className="flex items-start gap-2 sm:gap-3">
											<svg
												className="w-4 h-4 sm:w-5 sm:h-5 text-brand mt-0.5 flex-shrink-0"
												fill="none"
												stroke="currentColor"
												viewBox="0 0 24 24"
											>
												<path
													strokeLinecap="round"
													strokeLinejoin="round"
													strokeWidth={2}
													d="M5 13l4 4L19 7"
												/>
											</svg>
											<span className="text-sm sm:text-base text-gray-700">
												Une comparaison rapide et
												objective
											</span>
										</li>
										<li className="flex items-start gap-2 sm:gap-3">
											<svg
												className="w-4 h-4 sm:w-5 sm:h-5 text-brand mt-0.5 flex-shrink-0"
												fill="none"
												stroke="currentColor"
												viewBox="0 0 24 24"
											>
												<path
													strokeLinecap="round"
													strokeLinejoin="round"
													strokeWidth={2}
													d="M5 13l4 4L19 7"
												/>
											</svg>
											<span className="text-sm sm:text-base text-gray-700">
												Pas d&apos;engagement avant le
												contrat
											</span>
										</li>
									</ul>
									<p className="text-xs sm:text-sm text-gray-600 italic mb-4 sm:mb-6">
										Avancez avec un peu de confiance.
									</p>
									<button
										onClick={scrollToSearch}
										className="bg-brand hover:bg-brand-dark text-white px-6 sm:px-8 py-2.5 sm:py-3 rounded-full font-medium text-sm sm:text-base transition-colors shadow-md hover:shadow-lg active:scale-95 w-full sm:w-auto"
									>
										Prendre rendez-vous
									</button>
								</div>
								<div className="order-3 hidden lg:block">
									<div className="relative max-w-xs mx-auto lg:max-w-none">
										<Image
											src="/illustrations/team-group.png"
											alt="Professional team"
											width={500}
											height={400}
											className="w-full h-auto"
										/>
									</div>
								</div>
							</div>
						</div>
					</div>
				)}

				{/* Bottom CTA Section (hide when search performed) */}
				{!searchPerformed && (
					<div className="bg-brand py-8 sm:py-12 lg:py-16">
						<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
							<div className="grid lg:grid-cols-2 gap-6 sm:gap-8 lg:gap-12 items-center">
								<div className="text-white">
									<h2 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-6">
										Avec MonHubImmo, prendre rendez-vous
										avec un agent immobilier devient simple
										et rassurant.
									</h2>
									<ul className="space-y-2 sm:space-y-3">
										<li className="flex items-start gap-2 sm:gap-3">
											<svg
												className="w-4 h-4 sm:w-5 sm:h-5 mt-0.5 flex-shrink-0"
												fill="currentColor"
												viewBox="0 0 20 20"
											>
												<path
													fillRule="evenodd"
													d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
													clipRule="evenodd"
												/>
											</svg>
											<span className="text-sm sm:text-base">
												La sécurité de faire toujours
												avec des agents certifiés
											</span>
										</li>
										<li className="flex items-start gap-2 sm:gap-3">
											<svg
												className="w-4 h-4 sm:w-5 sm:h-5 mt-0.5 flex-shrink-0"
												fill="currentColor"
												viewBox="0 0 20 20"
											>
												<path
													fillRule="evenodd"
													d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
													clipRule="evenodd"
												/>
											</svg>
											<span className="text-sm sm:text-base">
												Tous les agents présents sont
												certifiés et vérifiés pour vous
												garantir un accompagnement de
												qualité
											</span>
										</li>
										<li className="flex items-start gap-2 sm:gap-3">
											<svg
												className="w-4 h-4 sm:w-5 sm:h-5 mt-0.5 flex-shrink-0"
												fill="currentColor"
												viewBox="0 0 20 20"
											>
												<path
													fillRule="evenodd"
													d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
													clipRule="evenodd"
												/>
											</svg>
											<span className="text-sm sm:text-base">
												Vous pouvez comparer les profils
												et choisir l&apos;agent qui
												correspond le mieux à votre
												projet sans prise de tête
											</span>
										</li>
										<li className="flex items-start gap-2 sm:gap-3">
											<svg
												className="w-4 h-4 sm:w-5 sm:h-5 mt-0.5 flex-shrink-0"
												fill="currentColor"
												viewBox="0 0 20 20"
											>
												<path
													fillRule="evenodd"
													d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
													clipRule="evenodd"
												/>
											</svg>
											<span className="text-sm sm:text-base">
												Gestion sécurisée
											</span>
										</li>
									</ul>
								</div>
								<div className="flex items-center justify-center">
									<Image
										src="/illustrations/secure-data.png"
										alt="Secure and trusted platform"
										width={400}
										height={400}
										className="w-full h-auto max-w-sm"
									/>
								</div>
							</div>
						</div>
					</div>
				)}

				{/* Final Info Section (hide when search performed) */}
				{!searchPerformed && (
					<div className="bg-gray-50 py-8 sm:py-12 lg:py-16">
						<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
							<div className="flex flex-col lg:flex-row justify-between items-center gap-6 sm:gap-8 lg:gap-12">
								<div className="text-center lg:text-left flex-1">
									<h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3 sm:mb-4">
										La nouvelle façon de rencontrer un agent
										immobilier :
									</h2>
									<p className="text-base sm:text-xl text-gray-700 mb-6 sm:mb-8">
										simple, rapide, et convenablement à
										toutes vos contraintes.
									</p>
									<div className="flex justify-center lg:justify-start">
										<button
											onClick={scrollToSearch}
											className="bg-brand hover:bg-brand-dark text-white px-6 sm:px-8 py-2.5 sm:py-3 rounded-full font-medium text-sm sm:text-base transition-colors shadow-md hover:shadow-lg active:scale-95"
										>
											Prendre rendez-vous
										</button>
									</div>
								</div>
								<div className="flex-shrink-0">
									<Image
										src="/illustrations/appointment-scheduling.png"
										alt="Real estate agent"
										width={300}
										height={300}
										className="w-48 sm:w-64 lg:w-80 h-auto"
									/>
								</div>
							</div>
						</div>
					</div>
				)}

				{/* Agent CTA Section (hide when search performed) */}
				{!searchPerformed && (
					<div className="bg-brand py-8 sm:py-12 lg:py-16">
						<div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
							<div className="bg-white/10 backdrop-blur-sm rounded-xl sm:rounded-2xl p-6 sm:p-8 lg:p-12">
								<div className="grid md:grid-cols-2 gap-6 sm:gap-8 items-center">
									<div className="flex items-center justify-center order-2 md:order-1">
										<Image
											src="/illustrations/puzzle-collaboration.png"
											alt="Agent collaboration"
											width={300}
											height={300}
											className="w-48 sm:w-64 lg:w-full h-auto max-w-sm"
										/>
									</div>
									<div className="text-white order-1 md:order-2">
										<h3 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6">
											Vous êtes agent immobilier ?
										</h3>
										<p className="mb-4 sm:mb-6 text-sm sm:text-base text-white/90 leading-relaxed">
											Rejoignez MonAgentImmo, la
											plateforme qui rapproche les
											professionnels et les particuliers.
										</p>
										<ul className="space-y-2 mb-6 sm:mb-8 text-xs sm:text-sm">
											<li className="flex items-start gap-1.5 sm:gap-2">
												<svg
													className="w-3 h-3 sm:w-4 sm:h-4 mt-0.5 flex-shrink-0"
													fill="currentColor"
													viewBox="0 0 20 20"
												>
													<path
														fillRule="evenodd"
														d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
														clipRule="evenodd"
													/>
												</svg>
												<span>
													Visibilité maximale avec
													d&apos;autres agents pour
													proposer plus de biens et
												</span>
											</li>
											<li className="flex items-start gap-1.5 sm:gap-2">
												<svg
													className="w-3 h-3 sm:w-4 sm:h-4 mt-0.5 flex-shrink-0"
													fill="currentColor"
													viewBox="0 0 20 20"
												>
													<path
														fillRule="evenodd"
														d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
														clipRule="evenodd"
													/>
												</svg>
												<span>
													générer des opportunités
												</span>
											</li>
											<li className="flex items-start gap-1.5 sm:gap-2">
												<svg
													className="w-3 h-3 sm:w-4 sm:h-4 mt-0.5 flex-shrink-0"
													fill="currentColor"
													viewBox="0 0 20 20"
												>
													<path
														fillRule="evenodd"
														d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
														clipRule="evenodd"
													/>
												</svg>
												<span>
													Gestion en ligne de vos
													rendez-vous
												</span>
											</li>
											<li className="flex items-start gap-1.5 sm:gap-2">
												<svg
													className="w-3 h-3 sm:w-4 sm:h-4 mt-0.5 flex-shrink-0"
													fill="currentColor"
													viewBox="0 0 20 20"
												>
													<path
														fillRule="evenodd"
														d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
														clipRule="evenodd"
													/>
												</svg>
												<span>
													Outils pros : Espace privé à
													gérer, votre visibilité,
													consulter les
												</span>
											</li>
											<li className="flex items-start gap-1.5 sm:gap-2 ml-4 sm:ml-6">
												<span className="text-white/90">
													projets immobiliers des
													particuliers
												</span>
											</li>
										</ul>
										<p className="mb-4 sm:mb-6 font-semibold text-xs sm:text-sm">
											Nous attendons, les agents
											immobiliers peuvent simplifier leur
											quotidien, les particuliers les
											trouvent en 1 clic !
										</p>
										<button className="bg-white text-brand hover:bg-gray-100 px-6 sm:px-8 py-2.5 sm:py-3 rounded-full font-medium text-sm sm:text-base transition-colors w-full sm:w-auto">
											EN SAVOIR PLUS
										</button>
									</div>
								</div>
							</div>
						</div>
					</div>
				)}

				{/* Close page wrapper */}
			</div>

			{/* Booking Modal */}
			{selectedAgent && (
				<BookAppointmentModal
					isOpen={showBooking}
					onClose={() => setShowBooking(false)}
					agent={selectedAgent!}
				/>
			)}
		</>
	);
}
