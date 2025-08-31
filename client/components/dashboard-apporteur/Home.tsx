import React, { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '../ui/Button';
import PropertyManager from '../property/PropertyManager';

const Home = () => {
	const { logout, user } = useAuth();
	const [activeTab, setActiveTab] = useState<'overview' | 'properties'>(
		'overview',
	);

	const handleLogout = () => {
		logout();
	};

	const renderOverview = () => (
		<div className="space-y-6">
			<div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg p-6 text-white">
				<h2 className="text-2xl font-bold mb-2">
					Bienvenue, {user?.firstName} !
				</h2>
				<p className="text-blue-100">
					Gérez vos annonces immobilières et développez votre activité
					d'apporteur d'affaires.
				</p>
			</div>

			<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
									d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
								/>
							</svg>
						</div>
						<div className="ml-4">
							<h3 className="text-lg font-semibold text-gray-900">
								Annonces actives
							</h3>
							<p className="text-2xl font-bold text-green-600">
								0
							</p>
						</div>
					</div>
				</div>

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
									d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
								/>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth="2"
									d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
								/>
							</svg>
						</div>
						<div className="ml-4">
							<h3 className="text-lg font-semibold text-gray-900">
								Vues totales
							</h3>
							<p className="text-2xl font-bold text-blue-600">
								0
							</p>
						</div>
					</div>
				</div>

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
									d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
								/>
							</svg>
						</div>
						<div className="ml-4">
							<h3 className="text-lg font-semibold text-gray-900">
								Messages
							</h3>
							<p className="text-2xl font-bold text-purple-600">
								0
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
		<div className="min-h-screen bg-gray-50">
			<div className="bg-white shadow-sm border-b">
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
					<div className="flex items-center justify-between h-16">
						<div className="flex items-center space-x-8">
							<h1 className="text-xl font-semibold text-gray-900">
								Dashboard Apporteur
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
									Vue d'ensemble
								</button>
								<button
									onClick={() => setActiveTab('properties')}
									className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
										activeTab === 'properties'
											? 'bg-blue-100 text-blue-700'
											: 'text-gray-600 hover:text-gray-900'
									}`}
								>
									Mes annonces
								</button>
							</nav>
						</div>
						<Button
							variant="outline"
							size="sm"
							onClick={handleLogout}
							className="text-gray-700 border-gray-300 hover:bg-gray-50"
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
									d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
								/>
							</svg>
							Déconnexion
						</Button>
					</div>
				</div>
			</div>

			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
				{activeTab === 'overview' && renderOverview()}
				{activeTab === 'properties' && <PropertyManager />}
			</div>
		</div>
	);
};

export default Home;
