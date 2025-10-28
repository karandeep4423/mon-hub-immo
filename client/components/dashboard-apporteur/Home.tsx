'use client';

import React, { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '../ui/Button';
import { PropertyManager } from '../property/PropertyManager';
import { CollaborationList } from '../collaboration/CollaborationList';
import { Features } from '@/lib/constants';
// Migrated: Features.Dashboard.DASHBOARD_UI_TEXT;
import { MySearches } from '../search-ads/MySearches';
import { ProfileUpdateModal } from '../dashboard-agent/ProfileUpdateModal';
import { User } from '@/types/auth';
import { useDashboardStats } from '@/hooks/useDashboardStats';
import { formatNumber } from '@/lib/utils/format';

const Home = () => {
	const { user } = useAuth();
	const [activeTab, setActiveTab] = useState<
		'overview' | 'properties' | 'collaborations' | 'searches'
	>('overview');
	const [showUpdateModal, setShowUpdateModal] = useState(false);

	const { kpis, loading: statsLoading } = useDashboardStats(user?._id);

	const renderOverview = () => (
		<div className="space-y-6">
			<div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg p-6 text-white">
				<h2 className="text-2xl font-bold mb-2">
					Bienvenue, {user?.firstName} !
				</h2>
				<p className="text-blue-100">
					Gérez vos annonces immobilières et développez votre activité
					d&apos;apporteur d&apos;affaires.
				</p>
				{user && (
					<div className="mt-4 flex items-center gap-3">
						<Button
							variant="outline"
							size="sm"
							onClick={() => setShowUpdateModal(true)}
							className="bg-white/10 hover:bg-white/20 border-white text-white"
						>
							Modifier mon profil
						</Button>
					</div>
				)}
			</div>

			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
				{/* Mes biens */}
				<div className="bg-white rounded-lg shadow p-6">
					<div className="flex items-center">
						<div className="p-3 rounded-full bg-blue-100 text-blue-600">
							<svg
								className="w-6 h-6"
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
							<h3 className="text-sm font-medium text-gray-600">
								Mes biens
							</h3>
							<p className="text-2xl font-bold text-gray-900">
								{statsLoading
									? '—'
									: formatNumber(kpis.propertiesTotal)}
							</p>
						</div>
					</div>
				</div>

				{/* Collaborations totales */}
				<div className="bg-white rounded-lg shadow p-6">
					<div className="flex items-center">
						<div className="p-3 rounded-full bg-green-100 text-green-600">
							<svg
								className="w-6 h-6"
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24"
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth="2"
									d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0"
								/>
							</svg>
						</div>
						<div className="ml-4">
							<h3 className="text-sm font-medium text-gray-600">
								Collaborations totales
							</h3>
							<p className="text-2xl font-bold text-gray-900">
								{statsLoading
									? '—'
									: formatNumber(kpis.collaborationsTotal)}
							</p>
						</div>
					</div>
				</div>

				{/* Collaborations actives */}
				<div className="bg-white rounded-lg shadow p-6">
					<div className="flex items-center">
						<div className="p-3 rounded-full bg-yellow-100 text-yellow-600">
							<svg
								className="w-6 h-6"
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24"
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth="2"
									d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857"
								/>
							</svg>
						</div>
						<div className="ml-4">
							<h3 className="text-sm font-medium text-gray-600">
								Collaborations actives
							</h3>
							<p className="text-2xl font-bold text-gray-900">
								{statsLoading
									? '—'
									: formatNumber(kpis.collaborationsActive)}
							</p>
						</div>
					</div>
				</div>

				{/* Mes recherches */}
				<div className="bg-white rounded-lg shadow p-6">
					<div className="flex items-center">
						<div className="p-3 rounded-full bg-purple-100 text-purple-600">
							<svg
								className="w-6 h-6"
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24"
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth="2"
									d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
								/>
							</svg>
						</div>
						<div className="ml-4">
							<h3 className="text-sm font-medium text-gray-600">
								Mes recherches
							</h3>
							<p className="text-2xl font-bold text-gray-900">
								{statsLoading
									? '—'
									: formatNumber(kpis.mySearches)}
							</p>
						</div>
					</div>
				</div>
			</div>

			<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
				<div className="bg-white rounded-lg shadow p-6">
					<h3 className="text-lg font-semibold text-gray-900 mb-4">
						Actions rapides
					</h3>
					<div className="space-y-3">
						<Button
							onClick={() => setActiveTab('properties')}
							className="w-full justify-start bg-blue-600 hover:bg-blue-700"
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
									d="M12 4v16m8-8H4"
								/>
							</svg>
							Créer une nouvelle annonce
						</Button>
						<Button
							variant="outline"
							onClick={() => setActiveTab('properties')}
							className="w-full justify-start"
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
									d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
								/>
							</svg>
							Gérer mes annonces
						</Button>
					</div>
				</div>

				<div className="bg-white rounded-lg shadow p-6">
					<h3 className="text-lg font-semibold text-gray-900 mb-4">
						Conseils pour réussir
					</h3>
					<div className="space-y-3 text-sm text-gray-600">
						<div className="flex items-start space-x-2">
							<div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
							<p>
								Ajoutez des photos de qualité pour attirer plus
								de clients
							</p>
						</div>
						<div className="flex items-start space-x-2">
							<div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
							<p>
								Rédigez des descriptions détaillées et
								attractives
							</p>
						</div>
						<div className="flex items-start space-x-2">
							<div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
							<p>
								Répondez rapidement aux messages des clients
								intéressés
							</p>
						</div>
						<div className="flex items-start space-x-2">
							<div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
							<p>Mettez à jour vos annonces régulièrement</p>
						</div>
					</div>
				</div>
			</div>
		</div>
	);

	return (
		<>
			<div className="min-h-screen bg-gray-50">
				<div className="bg-white shadow-sm border-b">
					<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
						<div className="flex items-center justify-between h-16">
							<div className="flex items-center space-x-8">
								<h1 className="text-xl font-semibold text-gray-900">
									{
										Features.Dashboard.DASHBOARD_UI_TEXT
											.apporteurDashboard
									}
								</h1>
								<nav className="flex space-x-6">
									<button
										onClick={() => setActiveTab('overview')}
										className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
											activeTab === 'overview'
												? 'bg-blue-100 text-blue-700'
												: 'text-gray-600 hover:text-gray-900'
										}`}
									>
										{
											Features.Dashboard.DASHBOARD_UI_TEXT
												.overview
										}
									</button>
									<button
										onClick={() =>
											setActiveTab('properties')
										}
										className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
											activeTab === 'properties'
												? 'bg-blue-100 text-blue-700'
												: 'text-gray-600 hover:text-gray-900'
										}`}
									>
										{
											Features.Dashboard.DASHBOARD_UI_TEXT
												.myProperties
										}
									</button>
									<button
										onClick={() =>
											setActiveTab('collaborations')
										}
										className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
											activeTab === 'collaborations'
												? 'bg-blue-100 text-blue-700'
												: 'text-gray-600 hover:text-gray-900'
										}`}
									>
										{
											Features.Dashboard.DASHBOARD_UI_TEXT
												.myCollaborations
										}
									</button>
									<button
										onClick={() => setActiveTab('searches')}
										className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
											activeTab === 'searches'
												? 'bg-blue-100 text-blue-700'
												: 'text-gray-600 hover:text-gray-900'
										}`}
									>
										Mes Recherches
									</button>
								</nav>
							</div>
						</div>
					</div>
				</div>

				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
					{activeTab === 'overview' && renderOverview()}
					{activeTab === 'properties' && <PropertyManager />}
					{activeTab === 'collaborations' && user && (
						<div className="space-y-6">
							<div className="flex items-center justify-between">
								<h2 className="text-2xl font-bold text-gray-900">
									Mes Collaborations
								</h2>
							</div>
							<CollaborationList
								currentUserId={user._id}
								onClose={() => {}}
							/>
						</div>
					)}
					{activeTab === 'searches' && <MySearches />}
				</div>
			</div>
			{user && (
				<ProfileUpdateModal
					isOpen={showUpdateModal}
					onClose={() => setShowUpdateModal(false)}
					user={user as User}
				/>
			)}
		</>
	);
};

export default Home;
