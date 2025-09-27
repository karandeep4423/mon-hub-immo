// components/dashboard/DashboardContent.tsx
'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '../ui/Button';
import { AgentProfileCard } from './AgentProfileCard';
import PropertyManager from '../property/PropertyManager';
import { CollaborationList } from '../collaboration/CollaborationList';
import { DASHBOARD_TEXT } from '@/lib/constants/text';
import Link from 'next/link';
import { MySearches } from '../search-ads/MySearches';

export const DashboardContent: React.FC = () => {
	const router = useRouter();
	const { user, loading, refreshUser } = useAuth();
	const [activeTab, setActiveTab] = useState<
		'overview' | 'properties' | 'collaborations' | 'searches'
	>('overview');
	const hasRefreshed = useRef(false);

	useEffect(() => {
		if (!loading && !user) {
			router.push('/auth/login');
		}
	}, [user, loading, router]);

	// Refresh user data once when component mounts to get latest profile status
	useEffect(() => {
		if (user && !loading && !hasRefreshed.current) {
			hasRefreshed.current = true;
			refreshUser();
		}
	}, [user, loading, refreshUser]);

	if (loading) {
		return (
			<div className="min-h-screen bg-gray-50 flex items-center justify-center">
				<div className="text-center">
					<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-600 mx-auto mb-4"></div>
					<p className="text-gray-600">Chargement...</p>
				</div>
			</div>
		);
	}

	if (!user) {
		return null;
	}


	// Check if user needs to complete profile
	const showProfilePrompt =
		user?.userType === 'agent' && !user?.profileCompleted;

	return (
		<div className="min-h-screen bg-gray-50">
			{/* Profile Completion Alert for Agents */}
			{showProfilePrompt && (
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
					<div className="bg-gradient-to-r from-cyan-50 to-blue-50 border border-cyan-200 rounded-xl p-6 mb-6">
						<div className="flex items-start space-x-4">
							<div className="flex-shrink-0">
								<div className="w-12 h-12 bg-cyan-100 rounded-full flex items-center justify-center">
									<svg
										className="w-6 h-6 text-cyan-600"
										fill="none"
										stroke="currentColor"
										viewBox="0 0 24 24"
									>
										<path
											strokeLinecap="round"
											strokeLinejoin="round"
											strokeWidth="2"
											d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
										/>
									</svg>
								</div>
							</div>
							<div className="flex-1">
								<h3 className="text-lg font-semibold text-gray-900 mb-2">
									Complétez votre profil d&apos;agent
								</h3>
								<p className="text-gray-600 mb-4">
									Pour profiter pleinement de HubImmo et
									collaborer avec d&apos;autres
									professionnels, veuillez compléter les
									informations de votre profil d&apos;agent
									immobilier.
								</p>
								<div className="flex flex-col sm:flex-row gap-3">
									<Button
										onClick={() =>
											router.push(
												'/auth/complete-profile',
											)
										}
										className="bg-cyan-600 hover:bg-cyan-700 text-white"
										size="md"
									>
										<svg
											className="w-4 h-4 mr-2"
											fill="none"
											stroke="currentColor"
											viewBox="0 0 24 24"
										>
											<path
												strokeLinecap="round"
												strokeLinejoin="round"
												strokeWidth="2"
												d="M12 6v6m0 0v6m0-6h6m-6 0H6"
											/>
										</svg>
										Compléter mon profil
									</Button>
								</div>
							</div>
						</div>
					</div>
				</div>
			)}

			{/* Main Content */}
			<main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 overflow-x-hidden">
				<div className="mb-8">
					<h2 className="text-2xl font-bold text-gray-900 mb-2">
						Bienvenue, {user.firstName} !
					</h2>
					<p className="text-gray-600">
						{DASHBOARD_TEXT.welcomeAgent}
					</p>
				</div>

				{/* Tab Navigation */}
				<div className="border-b border-gray-200 mb-8">
					<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
						<nav className="-mb-px flex flex-wrap items-center gap-x-4 gap-y-2 sm:gap-x-8">
							<button
								onClick={() => setActiveTab('overview')}
								className={`py-2 px-1 border-b-2 font-medium text-sm ${
									activeTab === 'overview'
										? 'border-cyan-500 text-cyan-600'
										: 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
								}`}
							>
								Tableau de bord
							</button>
							<button
								onClick={() => setActiveTab('properties')}
								className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center ${
									activeTab === 'properties'
										? 'border-cyan-500 text-cyan-600'
										: 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
								}`}
							>
								<svg
									className="w-4 h-4 mr-1"
									fill="none"
									stroke="currentColor"
									viewBox="0 0 24 24"
								>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth="2"
										d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
									/>
								</svg>
								Mes biens
							</button>
							<button
								onClick={() => setActiveTab('collaborations')}
								className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center ${
									activeTab === 'collaborations'
										? 'border-cyan-500 text-cyan-600'
										: 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
								}`}
							>
								<svg
									className="w-4 h-4 mr-1"
									fill="none"
									stroke="currentColor"
									viewBox="0 0 24 24"
								>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth="2"
										d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
									/>
								</svg>
								Collaborations
							</button>
							<button
								onClick={() => setActiveTab('searches')}
								className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center ${
									activeTab === 'searches'
										? 'border-cyan-500 text-cyan-600'
										: 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
								}`}
							>
								<svg
									className="w-4 h-4 mr-1"
									fill="none"
									stroke="currentColor"
									viewBox="0 0 24 24"
									xmlns="http://www.w3.org/2000/svg"
								>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth="2"
										d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
									></path>
								</svg>
								Mes Recherches
							</button>
						</nav>
						{/* Quick Create Property Button */}
						<div className="w-full sm:w-auto sm:shrink-0">
							<Button
								onClick={() => setActiveTab('properties')}
								className="w-full sm:w-auto bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white shadow-lg"
								size="sm"
							>
								<svg
									className="w-4 h-4 mr-2"
									fill="none"
									stroke="currentColor"
									viewBox="0 0 24 24"
								>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth="2"
										d="M12 6v6m0 0v6m0-6h6m-6 0H6"
									/>
								</svg>
								Créer une annonce
							</Button>
						</div>
					</div>
				</div>

				{/* Tab Content */}
				{activeTab === 'overview' && (
					<>
						{/* Stats Cards - Same as before */}
						<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
							<div className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow">
								<div className="flex items-center">
									<div className="p-3 bg-blue-100 rounded-lg">
										<svg
											className="w-6 h-6 text-blue-600"
											fill="none"
											stroke="currentColor"
											viewBox="0 0 24 24"
										>
											<path
												strokeLinecap="round"
												strokeLinejoin="round"
												strokeWidth="2"
												d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z"
											/>
										</svg>
									</div>
									<div className="ml-4">
										<p className="text-sm font-medium text-gray-600">
											Propriétés
										</p>
										<p className="text-2xl font-bold text-gray-900">
											12
										</p>
									</div>
								</div>
							</div>

							<div className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow">
								<div className="flex items-center">
									<div className="p-3 bg-green-100 rounded-lg">
										<svg
											className="w-6 h-6 text-green-600"
											fill="none"
											stroke="currentColor"
											viewBox="0 0 24 24"
										>
											<path
												strokeLinecap="round"
												strokeLinejoin="round"
												strokeWidth="2"
												d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
											/>
										</svg>
									</div>
									<div className="ml-4">
										<p className="text-sm font-medium text-gray-600">
											Annonces actives
										</p>
										<p className="text-2xl font-bold text-gray-900">
											8
										</p>
									</div>
								</div>
							</div>

							<div className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow">
								<div className="flex items-center">
									<div className="p-3 bg-yellow-100 rounded-lg">
										<svg
											className="w-6 h-6 text-yellow-600"
											fill="none"
											stroke="currentColor"
											viewBox="0 0 24 24"
										>
											<path
												strokeLinecap="round"
												strokeLinejoin="round"
												strokeWidth="2"
												d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
											/>
										</svg>
									</div>
									<div className="ml-4">
										<p className="text-sm font-medium text-gray-600">
											Valeur totale
										</p>
										<p className="text-2xl font-bold text-gray-900">
											€2.4M
										</p>
									</div>
								</div>
							</div>

							<div className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow">
								<div className="flex items-center">
									<div className="p-3 bg-purple-100 rounded-lg">
										<svg
											className="w-6 h-6 text-purple-600"
											fill="none"
											stroke="currentColor"
											viewBox="0 0 24 24"
										>
											<path
												strokeLinecap="round"
												strokeLinejoin="round"
												strokeWidth="2"
												d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
											/>
										</svg>
									</div>
									<div className="ml-4">
										<p className="text-sm font-medium text-gray-600">
											Demandes
										</p>
										<p className="text-2xl font-bold text-gray-900">
											24
										</p>
									</div>
								</div>
							</div>
						</div>

						{/* Agent Profile Card - Show for all agents */}
						{user.userType === 'agent' && (
							<AgentProfileCard user={user} />
						)}

						{/* Quick Actions - Same as before */}
						<div className="bg-white rounded-xl shadow-sm p-6 mb-8">
							<h3 className="text-lg font-semibold text-gray-900 mb-6">
								Actions rapides
							</h3>
							<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
								{/* Primary CTA - Create Property */}
								<div className="sm:col-span-2 lg:col-span-1">
									<Button
										onClick={() =>
											setActiveTab('properties')
										}
										className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white shadow-lg transform hover:scale-105 transition-all duration-200"
										size="md"
									>
										<svg
											className="w-5 h-5 mr-2"
											fill="none"
											stroke="currentColor"
											viewBox="0 0 24 24"
										>
											<path
												strokeLinecap="round"
												strokeLinejoin="round"
												strokeWidth="2"
												d="M12 6v6m0 0v6m0-6h6m-6 0H6"
											/>
										</svg>
										<span className="font-semibold">
											Créer une annonce
										</span>
									</Button>
								</div>
								<Button
									onClick={() => setActiveTab('properties')}
									variant="outline"
									className="w-full border-gray-300 text-gray-700 hover:bg-gray-50"
									size="md"
								>
									<svg
										className="w-4 h-4 mr-2"
										fill="none"
										stroke="currentColor"
										viewBox="0 0 24 24"
									>
										<path
											strokeLinecap="round"
											strokeLinejoin="round"
											strokeWidth="2"
											d="M4 6h16M4 10h16M4 14h16M4 18h16"
										/>
									</svg>
									Mes annonces
								</Button>
								<Link href="/chat">
									<Button
										variant="outline"
										className="w-full border-gray-300 text-gray-700 hover:bg-gray-50"
										size="md"
									>
										<svg
											className="w-4 h-4 mr-2"
											fill="none"
											stroke="currentColor"
											viewBox="0 0 24 24"
										>
											<path
												strokeLinecap="round"
												strokeLinejoin="round"
												strokeWidth="2"
												d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
											/>
										</svg>
										Messages
									</Button>
								</Link>

								<Button
									variant="outline"
									className="w-full border-gray-300 text-gray-700 hover:bg-gray-50"
									size="md"
								>
									<svg
										className="w-4 h-4 mr-2"
										fill="none"
										stroke="currentColor"
										viewBox="0 0 24 24"
									>
										<path
											strokeLinecap="round"
											strokeLinejoin="round"
											strokeWidth="2"
											d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
										/>
										<path
											strokeLinecap="round"
											strokeLinejoin="round"
											strokeWidth="2"
											d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
										/>
									</svg>
									Paramètres
								</Button>
							</div>
						</div>
					</>
				)}

				{/* Property Management Tab */}
				{activeTab === 'properties' && <PropertyManager />}
				{activeTab === 'collaborations' && user && (
					<CollaborationList
						currentUserId={user.id}
						onClose={() => {}}
					/>
				)}
				{activeTab === 'searches' && <MySearches />}
			</main>
		</div>
	);
};
