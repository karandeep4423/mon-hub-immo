'use client';

import React, { useEffect, useState, useCallback, useRef } from 'react';
import Image from 'next/image';
import { api } from '@/lib/api';
import { AgentCard } from '@/components/appointments/AgentCard';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { BookAppointmentModal } from '@/components/appointments/BookAppointmentModal';
import { CityAutocomplete } from '@/components/ui/CityAutocomplete';

interface Agent {
	_id: string;
	firstName: string;
	lastName: string;
	email: string;
	phone?: string;
	profileImage?: string;
	professionalInfo?: {
		postalCode?: string;
		city?: string;
		interventionRadius?: number;
		network?: string;
		siretNumber?: string;
		yearsExperience?: number;
		personalPitch?: string;
	};
}

export default function MonAgentImmoPage() {
	const [agents, setAgents] = useState<Agent[]>([]);
	const [loading, setLoading] = useState(true);
	const [searchCity, setSearchCity] = useState('');
	const [searchPostalCode, setSearchPostalCode] = useState('');
	const [filteredAgents, setFilteredAgents] = useState<Agent[]>([]);
	const [searchPerformed, setSearchPerformed] = useState(false);
	const [searching, setSearching] = useState(false);
	const carouselRef = useRef<HTMLDivElement>(null);
	const searchSectionRef = useRef<HTMLDivElement>(null);
	const [showBooking, setShowBooking] = useState(false);
	const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);

	const fetchAgents = useCallback(async () => {
		try {
			setLoading(true);
			const response = await api.get('/auth/agents');
			setAgents(response.data.data || []);
			setFilteredAgents(response.data.data || []);
		} catch (error) {
			console.error('Error fetching agents:', error);
		} finally {
			setLoading(false);
		}
	}, []);

	useEffect(() => {
		fetchAgents();
	}, [fetchAgents]);

	const handleSearch = () => {
		if (!searchCity.trim() && !searchPostalCode.trim()) {
			setFilteredAgents(agents);
			setSearchPerformed(false);
			return;
		}

		setSearching(true);

		// Simulate a brief loading state for better UX
		setTimeout(() => {
			const cityQuery = searchCity.toLowerCase().trim();
			const postalQuery = searchPostalCode.trim();

			const filtered = agents.filter((agent) => {
				const agentCity =
					agent.professionalInfo?.city?.toLowerCase() || '';
				const agentPostalCode =
					agent.professionalInfo?.postalCode || '';

				const cityMatch = !cityQuery || agentCity.includes(cityQuery);
				const postalMatch =
					!postalQuery || agentPostalCode.includes(postalQuery);

				return cityMatch && postalMatch;
			});

			setFilteredAgents(filtered);
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

	if (loading) {
		return (
			<div className="min-h-screen bg-white flex items-center justify-center">
				<LoadingSpinner size="lg" />
			</div>
		);
	}

	return (
		<>
			<div className="min-h-screen bg-white">
				{/* Hero Section with Search */}
				<div className="bg-brand-gradient relative overflow-hidden">
					<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16 relative z-10">
						<div className="grid lg:grid-cols-2 gap-6 lg:gap-8 items-center">
							<div className="text-white">
								<p className="text-xs sm:text-sm mb-2 opacity-90">
									<span className="font-semibold">
										MonAgentImmo
									</span>
									, un service proposé par{' '}
									<span className="font-semibold">
										MonHubImmo
									</span>
								</p>
								<p className="text-xs mb-4 sm:mb-6 opacity-75">
									La 1ère plateforme qui met en relation vos
									particuliers et agents immobiliers.
								</p>
								<h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 sm:mb-4 leading-tight">
									Prenez rendez-vous en ligne avec un agent
									<br className="hidden sm:block" />
									immobilier de votre secteur en 1 clic
								</h1>
								<p className="text-sm sm:text-base mb-6 sm:mb-8 opacity-90">
									Estimation, mise en vente, recherche de
									biens, tout commence ici, simplement.
								</p>

								{/* Search Bar */}
								<div className="bg-white rounded-full shadow-lg p-2 flex items-center gap-2 max-w-2xl relative z-50">
									<div className="flex-1 flex items-center gap-2 pl-2 relative">
										<svg
											className="w-5 h-5 text-gray-400 flex-shrink-0 absolute left-4 top-1/2 -translate-y-1/2 z-10 pointer-events-none"
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
										<CityAutocomplete
											value={searchCity}
											onCitySelect={(
												city,
												postalCode,
											) => {
												setSearchCity(city);
												setSearchPostalCode(postalCode);
											}}
											placeholder="Entrez votre ville ou code postal"
											className="border-0 shadow-none focus:ring-0 pl-8 py-2.5 text-gray-900"
										/>
									</div>
									<button
										onClick={handleSearch}
										disabled={
											searching ||
											(!searchCity.trim() &&
												!searchPostalCode.trim())
										}
										className="bg-gradient-to-r from-pink-400 via-pink-500 to-pink-600 text-white px-6 sm:px-8 py-3 rounded-full font-semibold text-sm sm:text-base hover:from-pink-500 hover:via-pink-600 hover:to-pink-700 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed active:scale-95 flex items-center justify-center gap-2 whitespace-nowrap flex-shrink-0"
									>
										{searching ? (
											<>
												<svg
													className="animate-spin h-5 w-5"
													xmlns="http://www.w3.org/2000/svg"
													fill="none"
													viewBox="0 0 24 24"
												>
													<circle
														className="opacity-25"
														cx="12"
														cy="12"
														r="10"
														stroke="currentColor"
														strokeWidth="4"
													></circle>
													<path
														className="opacity-75"
														fill="currentColor"
														d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
													></path>
												</svg>
												<span className="hidden sm:inline">
													Recherche...
												</span>
											</>
										) : (
											<>
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
											</>
										)}
									</button>
								</div>
								<p className="text-xs mt-2 sm:mt-3 opacity-75">
									*Réservez vos rendez-vous en ligne, notre
									rendez-vous avec un agent immobilier
									n&apos;aura jamais été aussi simple.
								</p>
							</div>

							{/* Show illustration only when no search performed */}
							{!searchPerformed && (
								<div className="hidden lg:flex justify-center items-center mt-6 lg:mt-0">
									<div className="relative w-full max-w-md">
										<Image
											src="/illustrations/calendar-booking.png"
											alt="Appointment scheduling illustration"
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

				{/* Feature Cards - overlapping panel (only show when no search performed) */}
				{!searchPerformed && (
					<div className="bg-gray-50 pt-0 pb-8 sm:pb-12 lg:pb-16">
						<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6 sm:-mt-10 relative z-20">
							<div className="bg-white/95 backdrop-blur-sm rounded-xl sm:rounded-2xl border border-gray-100 shadow-md p-4 sm:p-6 md:p-8">
								<div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
									{/* Estimer ma maison */}
									<div className="bg-white rounded-lg p-4 sm:p-6 lg:p-8 text-center shadow-sm hover:shadow-md transition-shadow">
										<div className="w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 mx-auto mb-4 sm:mb-6 relative">
											<Image
												src="/illustrations/house-property.png"
												alt="Estimer ma maison"
												width={96}
												height={96}
												className="w-full h-full object-contain"
											/>
										</div>
										<h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2 sm:mb-3">
											Estimer ma maison
										</h3>
										<p className="text-gray-600 text-xs sm:text-sm mb-4 sm:mb-6">
											Prenez rendez-vous pour une
											estimation gratuite et rapide de
											votre bien immobilier.
										</p>
										<button
											onClick={openBookingForFirstAgent}
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
												alt="Mettre en vente"
												width={96}
												height={96}
												className="w-full h-full object-contain"
											/>
										</div>
										<h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2 sm:mb-3">
											Mettre en vente
										</h3>
										<p className="text-gray-600 text-xs sm:text-sm mb-4 sm:mb-6">
											Confiez votre projet à un agent de
											confiance pour la mise en vente
											rapide.
										</p>
										<button
											onClick={openBookingForFirstAgent}
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
												alt="Chercher un bien"
												width={96}
												height={96}
												className="w-full h-full object-contain"
											/>
										</div>
										<h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2 sm:mb-3">
											Chercher un bien
										</h3>
										<p className="text-gray-600 text-xs sm:text-sm mb-4 sm:mb-6">
											Visionnez un agent pour trouver le
											logement qui correspond à vos
											critères.
										</p>
										<button
											onClick={openBookingForFirstAgent}
											className="text-brand hover:text-brand-dark font-medium text-xs sm:text-sm border border-brand hover:border-brand-dark px-4 sm:px-6 py-1.5 sm:py-2 rounded-full transition-colors"
										>
											Demander
										</button>
									</div>
								</div>
							</div>
						</div>
					</div>
				)}

				{/* Agent Cards List */}
				<div
					ref={searchSectionRef}
					className="py-8 sm:py-12 lg:py-16 bg-white"
				>
					<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
						{searchPerformed && filteredAgents.length === 0 ? (
							<div className="text-center py-16 sm:py-20">
								<div className="bg-gray-50 rounded-2xl p-8 sm:p-12 max-w-2xl mx-auto">
									<svg
										className="w-20 h-20 sm:w-24 sm:h-24 text-gray-300 mx-auto mb-6"
										fill="none"
										stroke="currentColor"
										viewBox="0 0 24 24"
									>
										<path
											strokeLinecap="round"
											strokeLinejoin="round"
											strokeWidth={1.5}
											d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
										/>
									</svg>
									<h3 className="text-xl sm:text-2xl font-bold text-gray-800 mb-3">
										Aucun agent trouvé
									</h3>
									<p className="text-gray-600 mb-2">
										Nous n&apos;avons pas encore
										d&apos;agents immobiliers disponibles
										dans
									</p>
									<p className="text-lg font-semibold text-brand mb-8">
										{searchCity || searchPostalCode}
									</p>
									<button
										onClick={() => {
											setSearchCity('');
											setSearchPostalCode('');
											setFilteredAgents(agents);
											setSearchPerformed(false);
										}}
										className="bg-brand hover:bg-brand-dark text-white px-8 py-3 rounded-full font-medium transition-all shadow-md hover:shadow-lg active:scale-95 inline-flex items-center gap-2"
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
												d="M10 19l-7-7m0 0l7-7m-7 7h18"
											/>
										</svg>
										<span>Voir tous les agents</span>
									</button>
								</div>
							</div>
						) : searchPerformed ? (
							<>
								<div className="mb-8 pb-6 border-b border-gray-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
									<div>
										<h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
											Agents immobiliers à{' '}
											{searchCity || searchPostalCode}
										</h2>
										<p className="text-gray-600">
											<span className="font-semibold text-brand">
												{filteredAgents.length}
											</span>{' '}
											agent
											{filteredAgents.length > 1
												? 's'
												: ''}{' '}
											trouvé
											{filteredAgents.length > 1
												? 's'
												: ''}
										</p>
									</div>
									<button
										onClick={() => {
											setSearchCity('');
											setSearchPostalCode('');
											setFilteredAgents(agents);
											setSearchPerformed(false);
										}}
										className="text-brand hover:text-brand-dark font-medium border-2 border-brand hover:border-brand-dark px-6 py-2.5 rounded-full transition-all hover:bg-brand/5 active:scale-95 inline-flex items-center justify-center gap-2 whitespace-nowrap"
									>
										<svg
											className="w-4 h-4"
											fill="none"
											stroke="currentColor"
											viewBox="0 0 24 24"
										>
											<path
												strokeLinecap="round"
												strokeLinejoin="round"
												strokeWidth={2}
												d="M6 18L18 6M6 6l12 12"
											/>
										</svg>
										<span>Réinitialiser la recherche</span>
									</button>
								</div>
								{/* Grid List of Agents */}
								<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
									{filteredAgents.map((agent) => (
										<AgentCard
											key={agent._id}
											agent={agent}
										/>
									))}
								</div>
							</>
						) : (
							<div className="relative">
								{/* Navigation Buttons */}
								<button
									onClick={() => scrollCarousel('left')}
									className="absolute left-0 top-1/2 -translate-y-1/2 z-10 rounded-full p-3 border border-gray-300 bg-transparent hover:bg-white/60 backdrop-blur-sm transition-colors"
									aria-label="Previous"
								>
									<svg
										className="w-6 h-6 text-gray-600"
										fill="none"
										stroke="currentColor"
										viewBox="0 0 24 24"
									>
										<path
											strokeLinecap="round"
											strokeLinejoin="round"
											strokeWidth={2}
											d="M15 19l-7-7 7-7"
										/>
									</svg>
								</button>

								{/* Carousel */}
								<div
									ref={carouselRef}
									className="flex gap-6 overflow-x-auto scrollbar-hide snap-x snap-mandatory px-12"
									style={{
										scrollbarWidth: 'none',
										msOverflowStyle: 'none',
									}}
								>
									{filteredAgents.map((agent) => (
										<div
											key={agent._id}
											className="flex-shrink-0 w-72 snap-center"
										>
											<AgentCard agent={agent} />
										</div>
									))}
								</div>

								<button
									onClick={() => scrollCarousel('right')}
									className="absolute right-0 top-1/2 -translate-y-1/2 z-10 rounded-full p-3 border border-gray-300 bg-transparent hover:bg-white/60 backdrop-blur-sm transition-colors"
									aria-label="Next"
								>
									<svg
										className="w-6 h-6 text-gray-600"
										fill="none"
										stroke="currentColor"
										viewBox="0 0 24 24"
									>
										<path
											strokeLinecap="round"
											strokeLinejoin="round"
											strokeWidth={2}
											d="M9 5l7 7-7 7"
										/>
									</svg>
								</button>
							</div>
						)}
					</div>
				</div>

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
