'use client';

import React, { useEffect, useState, useCallback, useRef } from 'react';
import { api } from '@/lib/api';
import { AgentCard } from '@/components/appointments/AgentCard';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { BookAppointmentModal } from '@/components/appointments/BookAppointmentModal';

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
	const [searchQuery, setSearchQuery] = useState('');
	const [filteredAgents, setFilteredAgents] = useState<Agent[]>([]);
	const [searchPerformed, setSearchPerformed] = useState(false);
	const carouselRef = useRef<HTMLDivElement>(null);
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
		if (!searchQuery.trim()) {
			setFilteredAgents(agents);
			setSearchPerformed(false);
			return;
		}

		const query = searchQuery.toLowerCase().trim();
		const filtered = agents.filter((agent) => {
			const city = agent.professionalInfo?.city?.toLowerCase() || '';
			const postalCode = agent.professionalInfo?.postalCode || '';
			return city.includes(query) || postalCode.includes(query);
		});

		setFilteredAgents(filtered);
		setSearchPerformed(true);

		// Scroll to carousel to show results
		setTimeout(() => {
			carouselRef.current?.scrollIntoView({
				behavior: 'smooth',
				block: 'start',
			});
		}, 100);
	};

	const handleSearchKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
		if (e.key === 'Enter') {
			handleSearch();
		}
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
					<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 relative z-10">
						<div className="grid lg:grid-cols-2 gap-8 items-center">
							<div className="text-white">
								<p className="text-sm mb-2 opacity-90">
									<span className="font-semibold">
										MonAgentImmo
									</span>
									, un service proposé par{' '}
									<span className="font-semibold">
										MonHubImmo
									</span>
								</p>
								<p className="text-xs mb-6 opacity-75">
									La 1ère plateforme qui met en relation vos
									particuliers et agents immobiliers.
								</p>
								<h1 className="text-3xl md:text-4xl font-bold mb-4 leading-tight">
									Prenez rendez-vous en ligne avec un agent
									<br />
									immobilier de votre secteur en 1 clic
								</h1>
								<p className="text-base mb-8 opacity-90">
									Estimation, mise en vente, recherche de
									biens, tout commence ici, simplement.
								</p>

								{/* Search Bar */}
								<div className="bg-white rounded-full shadow-lg p-2 flex items-center gap-2 max-w-2xl">
									<div className="flex items-center gap-2 flex-1 px-4">
										<svg
											className="w-5 h-5 text-gray-400"
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
										<input
											type="text"
											placeholder="Ville"
											value={searchQuery}
											onChange={(e) =>
												setSearchQuery(e.target.value)
											}
											onKeyPress={handleSearchKeyPress}
											className="flex-1 outline-none text-gray-700 placeholder-gray-400"
										/>
									</div>
									<button
										onClick={handleSearch}
										className="bg-gradient-to-r from-pink-500 to-pink-600 text-white px-8 py-3 rounded-full font-medium hover:from-pink-600 hover:to-pink-700 transition-all"
									>
										Rechercher
									</button>
								</div>
								<p className="text-xs mt-3 opacity-75">
									*Réservez vos rendez-vous en ligne, notre
									rendez-vous avec un agent immobilier
									n&apos;aura jamais été aussi simple.
								</p>
							</div>

							{/* Illustration */}
							<div className="hidden lg:flex justify-center items-center">
								<div className="relative">
									<div className="w-80 h-80 bg-white/10 rounded-full flex items-center justify-center backdrop-blur-sm">
										{/* Dashboard + character placeholder */}
										<svg
											className="w-64 h-64"
											viewBox="0 0 256 256"
											fill="none"
											xmlns="http://www.w3.org/2000/svg"
										>
											<rect
												x="36"
												y="48"
												width="184"
												height="120"
												rx="12"
												fill="currentColor"
												className="text-white/15"
											/>
											<rect
												x="48"
												y="60"
												width="80"
												height="12"
												rx="6"
												className="text-white/50"
												fill="currentColor"
											/>
											<rect
												x="48"
												y="84"
												width="160"
												height="10"
												rx="5"
												className="text-white/30"
												fill="currentColor"
											/>
											<rect
												x="48"
												y="102"
												width="140"
												height="10"
												rx="5"
												className="text-white/30"
												fill="currentColor"
											/>
											<circle
												cx="180"
												cy="156"
												r="26"
												className="text-white/30"
												fill="currentColor"
											/>
											<circle
												cx="180"
												cy="150"
												r="8"
												className="text-white/60"
												fill="currentColor"
											/>
											<rect
												x="168"
												y="166"
												width="24"
												height="8"
												rx="4"
												className="text-white/60"
												fill="currentColor"
											/>
											{/* Floating elements */}
											<rect
												x="140"
												y="60"
												width="36"
												height="12"
												rx="6"
												className="text-white/40"
												fill="currentColor"
											/>
											<rect
												x="140"
												y="78"
												width="48"
												height="10"
												rx="5"
												className="text-white/25"
												fill="currentColor"
											/>
										</svg>
									</div>
								</div>
							</div>
						</div>
					</div>
					{/* Decorative wave at bottom */}
					<div className="wave-separator" aria-hidden>
						<svg
							viewBox="0 0 1440 120"
							preserveAspectRatio="none"
							className="w-full h-[80px] text-gray-50"
						>
							<path
								d="M0,64L48,58.7C96,53,192,43,288,53.3C384,64,480,96,576,112C672,128,768,128,864,117.3C960,107,1056,85,1152,69.3C1248,53,1344,43,1392,37.3L1440,32L1440,0L1392,0C1344,0,1248,0,1152,0C1056,0,960,0,864,0C768,0,672,0,576,0C480,0,384,0,288,0C192,0,96,0,48,0L0,0Z"
								fill="currentColor"
							/>
						</svg>
					</div>
				</div>

				{/* Feature Cards - overlapping panel */}
				<div className="bg-gray-50 pt-0 pb-16">
					<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-10 relative z-20">
						<div className="bg-white/95 backdrop-blur-sm rounded-2xl border border-gray-100 shadow-md p-6 md:p-8">
							<div className="grid md:grid-cols-3 gap-6 md:gap-8">
								{/* Estimer ma maison */}
								<div className="bg-white rounded-lg p-8 text-center shadow-sm hover:shadow-md transition-shadow">
									<div className="w-24 h-24 mx-auto mb-6 bg-brand/10 rounded-full flex items-center justify-center">
										<svg
											className="w-12 h-12 text-brand"
											fill="none"
											stroke="currentColor"
											viewBox="0 0 24 24"
										>
											<path
												strokeLinecap="round"
												strokeLinejoin="round"
												strokeWidth={2}
												d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
											/>
										</svg>
									</div>
									<h3 className="text-xl font-bold text-gray-900 mb-3">
										Estimer ma maison
									</h3>
									<p className="text-gray-600 text-sm mb-6">
										Prenez rendez-vous pour une
										<br />
										estimation gratuite et rapide de votre
										<br />
										bien immobilier.
									</p>
									<button
										onClick={openBookingForFirstAgent}
										className="text-brand hover:text-brand-dark font-medium text-sm border border-brand hover:border-brand-dark px-6 py-2 rounded-full transition-colors"
									>
										Demander
									</button>
								</div>

								{/* Mettre en vente */}
								<div className="bg-white rounded-lg p-8 text-center shadow-sm hover:shadow-md transition-shadow">
									<div className="w-24 h-24 mx-auto mb-6 bg-brand/10 rounded-full flex items-center justify-center">
										<svg
											className="w-12 h-12 text-brand"
											fill="none"
											stroke="currentColor"
											viewBox="0 0 24 24"
										>
											<path
												strokeLinecap="round"
												strokeLinejoin="round"
												strokeWidth={2}
												d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
											/>
										</svg>
									</div>
									<h3 className="text-xl font-bold text-gray-900 mb-3">
										Mettre en vente
									</h3>
									<p className="text-gray-600 text-sm mb-6">
										Confiez votre projet à un agent de
										<br />
										confiance pour la mise en vente
										<br />
										rapide.
									</p>
									<button
										onClick={openBookingForFirstAgent}
										className="text-brand hover:text-brand-dark font-medium text-sm border border-brand hover:border-brand-dark px-6 py-2 rounded-full transition-colors"
									>
										Demander
									</button>
								</div>

								{/* Chercher un bien */}
								<div className="bg-white rounded-lg p-8 text-center shadow-sm hover:shadow-md transition-shadow">
									<div className="w-24 h-24 mx-auto mb-6 bg-brand/10 rounded-full flex items-center justify-center">
										<svg
											className="w-12 h-12 text-brand"
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
									</div>
									<h3 className="text-xl font-bold text-gray-900 mb-3">
										Chercher un bien
									</h3>
									<p className="text-gray-600 text-sm mb-6">
										Visionnez un agent pour trouver le
										<br />
										logement qui correspond à vos
										<br />
										critères.
									</p>
									<button
										onClick={openBookingForFirstAgent}
										className="text-brand hover:text-brand-dark font-medium text-sm border border-brand hover:border-brand-dark px-6 py-2 rounded-full transition-colors"
									>
										Demander
									</button>
								</div>
							</div>
						</div>
					</div>
				</div>

				{/* Agent Carousel */}
				<div className="py-16 bg-white">
					<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
						{searchPerformed && filteredAgents.length === 0 ? (
							<div className="text-center py-12">
								<svg
									className="w-20 h-20 text-gray-300 mx-auto mb-4"
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
								<h3 className="text-xl font-semibold text-gray-700 mb-2">
									Aucun agent trouvé dans votre ville
								</h3>
								<p className="text-gray-500 mb-6">
									Nous n&apos;avons pas encore d&apos;agents
									immobiliers disponibles dans{' '}
									<span className="font-semibold">
										{searchQuery}
									</span>
									.
								</p>
								<button
									onClick={() => {
										setSearchQuery('');
										setFilteredAgents(agents);
										setSearchPerformed(false);
									}}
									className="bg-brand hover:bg-brand-dark text-white px-6 py-2 rounded-full font-medium transition-colors"
								>
									Voir tous les agents
								</button>
							</div>
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

				{/* Info Section - Prenez rendez-vous */}
				<div className="bg-gray-50 py-16">
					<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
						<div className="grid lg:grid-cols-2 gap-12 items-center">
							<div className="order-2 lg:order-1">
								<div className="relative">
									<div className="bg-brand/10 rounded-lg p-12 flex items-center justify-center">
										<svg
											className="w-48 h-48 text-brand/20"
											fill="currentColor"
											viewBox="0 0 24 24"
										>
											<path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
										</svg>
									</div>
								</div>
							</div>
							<div className="order-1 lg:order-2">
								<h2 className="text-3xl font-bold text-gray-900 mb-6">
									Prenez rendez-vous avec un
									<br />
									professionnel de l&apos;immobilier.
								</h2>
								<p className="text-gray-700 mb-6 leading-relaxed">
									Besoin d&apos;estimer, vendre ou acquérir un
									bien. Prenez rendez-vous avec l&apos;agent
									immobilier de votre secteur.
								</p>
								<p className="text-gray-700 mb-4 leading-relaxed">
									Et très vite rendez-vous, votre bien-être
									partagé sur la plateforme entre vous:
								</p>
								<ul className="space-y-2 mb-8">
									<li className="flex items-start gap-3">
										<svg
											className="w-5 h-5 text-brand mt-0.5 flex-shrink-0"
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
										<span className="text-gray-700">
											Une base de plus d&apos;agents
											inscrits
										</span>
									</li>
									<li className="flex items-start gap-3">
										<svg
											className="w-5 h-5 text-brand mt-0.5 flex-shrink-0"
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
										<span className="text-gray-700">
											Une comparaison rapide et objective
										</span>
									</li>
									<li className="flex items-start gap-3">
										<svg
											className="w-5 h-5 text-brand mt-0.5 flex-shrink-0"
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
										<span className="text-gray-700">
											Pas d&apos;engagement avant le
											contrat
										</span>
									</li>
								</ul>
								<p className="text-sm text-gray-600 italic mb-6">
									Avancez avec un peu de confiance.
								</p>
								<button className="bg-brand hover:bg-brand-dark text-white px-8 py-3 rounded-full font-medium transition-colors">
									Prendre rendez-vous
								</button>
							</div>
						</div>
					</div>
				</div>

				{/* Bottom CTA Section */}
				<div className="bg-brand py-16">
					<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
						<div className="grid lg:grid-cols-2 gap-12 items-center">
							<div className="text-white">
								<h2 className="text-3xl font-bold mb-6">
									Avec MonHubImmo, prendre rendez-vous avec un
									agent immobilier
									<br />
									devient simple et rassurant.
								</h2>
								<ul className="space-y-3">
									<li className="flex items-start gap-3">
										<svg
											className="w-5 h-5 mt-0.5 flex-shrink-0"
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
											La sécurité de faire toujours avec
											des agents certifiés
										</span>
									</li>
									<li className="flex items-start gap-3">
										<svg
											className="w-5 h-5 mt-0.5 flex-shrink-0"
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
											Tous les agents présents sont
											certifiés et vérifiés pour vous
											garantir un accompagnement de
											qualité
										</span>
									</li>
									<li className="flex items-start gap-3">
										<svg
											className="w-5 h-5 mt-0.5 flex-shrink-0"
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
											Vous pouvez comparer les profils et
											choisir l&apos;agent qui correspond
											le mieux à votre projet sans prise
											de tête
										</span>
									</li>
									<li className="flex items-start gap-3">
										<svg
											className="w-5 h-5 mt-0.5 flex-shrink-0"
											fill="currentColor"
											viewBox="0 0 20 20"
										>
											<path
												fillRule="evenodd"
												d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
												clipRule="evenodd"
											/>
										</svg>
										<span>Gestion sécurisée</span>
									</li>
								</ul>
							</div>
							<div className="bg-white/10 backdrop-blur-sm rounded-lg p-12 flex items-center justify-center">
								<svg
									className="w-64 h-64 text-white/20"
									fill="currentColor"
									viewBox="0 0 24 24"
								>
									<path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 3c1.93 0 3.5 1.57 3.5 3.5S13.93 13 12 13s-3.5-1.57-3.5-3.5S10.07 6 12 6zm7 13H5v-.23c0-.62.28-1.2.76-1.58C7.47 15.82 9.64 15 12 15s4.53.82 6.24 2.19c.48.38.76.97.76 1.58V19z" />
								</svg>
							</div>
						</div>
					</div>
				</div>

				{/* Final Info Section */}
				<div className="bg-gray-50 py-16">
					<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
						<div className="text-center mb-12">
							<h2 className="text-3xl font-bold text-gray-900 mb-4">
								La nouvelle façon de rencontrer un agent
								immobilier :
							</h2>
							<p className="text-xl text-gray-700">
								simple, rapide, et convenablement à toutes vos
								contraintes.
							</p>
						</div>
						<div className="flex justify-center">
							<button className="bg-brand hover:bg-brand-dark text-white px-8 py-3 rounded-full font-medium transition-colors">
								Prendre rendez-vous
							</button>
						</div>
					</div>
				</div>

				{/* Agent CTA Section */}
				<div className="bg-brand py-16">
					<div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
						<div className="bg-white/10 backdrop-blur-sm rounded-2xl p-12">
							<div className="grid md:grid-cols-2 gap-8 items-center">
								<div className="bg-white/20 rounded-lg p-8 flex items-center justify-center">
									<svg
										className="w-48 h-48 text-white/30"
										fill="currentColor"
										viewBox="0 0 24 24"
									>
										<path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
									</svg>
								</div>
								<div className="text-white">
									<h3 className="text-2xl font-bold mb-6">
										Vous êtes agent immobilier ?
									</h3>
									<p className="mb-6 text-white/90 leading-relaxed">
										Rejoignez MonAgentImmo, la plateforme
										qui rapproche les professionnels et les
										particuliers.
									</p>
									<ul className="space-y-2 mb-8 text-sm">
										<li className="flex items-start gap-2">
											<svg
												className="w-4 h-4 mt-0.5 flex-shrink-0"
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
										<li className="flex items-start gap-2">
											<svg
												className="w-4 h-4 mt-0.5 flex-shrink-0"
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
										<li className="flex items-start gap-2">
											<svg
												className="w-4 h-4 mt-0.5 flex-shrink-0"
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
										<li className="flex items-start gap-2">
											<svg
												className="w-4 h-4 mt-0.5 flex-shrink-0"
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
										<li className="flex items-start gap-2 ml-6">
											<span className="text-white/90">
												projets immobiliers des
												particuliers
											</span>
										</li>
									</ul>
									<p className="mb-6 font-semibold">
										Nous attendons, les agents immobiliers
										peuvent simplifier leur quotidien, les
										particuliers les trouvent en 1 clic !
									</p>
									<button className="bg-white text-brand hover:bg-gray-100 px-8 py-3 rounded-full font-medium transition-colors">
										EN SAVOIR PLUS
									</button>
								</div>
							</div>
						</div>
					</div>
				</div>

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
