'use client';
import React from 'react';
import { StatCard } from '@/components/ui/StatCard';
import { AdminStats } from '@/hooks/useAdminStats';
import { Users, FileText, Home, Handshake, DollarSign, Globe, MapPin } from 'lucide-react';

interface DashboardAdminModernProps {
	stats: AdminStats;
}

export const DashboardAdminModern: React.FC<DashboardAdminModernProps> = ({ stats }) => {
	const statCards = [
		{
			icon: <Users className="w-7 h-7 text-[#00BCE4]" />,
			title: 'Agents Inscrits',
			value: stats.agentsTotal,
			gradient: 'blue' as const,
			details: [
				{ label: 'Actifs', value: stats.agentsActive, color: '#10B981' },
				{ label: 'En attente', value: stats.agentsPending, color: '#F59E0B' },
				{ label: 'Désabonnés', value: stats.agentsUnsubscribed, color: '#EF4444' },
			],
		},
		{
			icon: <FileText className="w-7 h-7 text-[#10B981]" />,
			title: 'Apporteurs',
			value: stats.apporteursTotal,
			gradient: 'emerald' as const,
			details: [
				{ label: 'Actifs', value: stats.apporteursActive, color: '#10B981' },
				{ label: 'En attente', value: stats.apporteursPending, color: '#F59E0B' },
			],
		},
		{
			icon: <Home className="w-7 h-7 text-[#7C3AED]" />,
			title: 'Annonces Actives',
			value: stats.propertiesActive,
			gradient: 'purple' as const,
			details: [
				{ label: 'Archivées', value: stats.propertiesArchived, color: '#9CA3AF' },
				{ label: 'Collaboration', value: stats.propertiesInCollab, color: '#3B82F6' },
			],
		},
		{
			icon: <Handshake className="w-7 h-7 text-[#10B981]" />,
			title: 'Collaborations',
			value: stats.collabOpen,
			gradient: 'emerald' as const,
			details: [
				{ label: 'Clôturées', value: stats.collabClosed, color: '#8B5CF6' },
			],
		},
		{
			icon: <DollarSign className="w-7 h-7 text-[#E11D48]" />,
			title: 'Frais d&apos;Agence',
			value: typeof stats.feesTotal === 'number'
				? `€${stats.feesTotal.toLocaleString('fr-FR')}`
				: stats.feesTotal,
			gradient: 'rose' as const,
		},
	];

	return (
		<div className="space-y-5 sm:space-y-6 animate-in fade-in duration-500">
			{/* Header - Optimized for all screen sizes */}
			<div className="flex flex-col gap-3 sm:flex-row sm:justify-between sm:items-center">
				<div>
				<h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 bg-clip-text text-transparent">
					Tableau de Bord
				</h1>
				<p className="text-sm text-gray-500 mt-1">Vue d&apos;ensemble de votre plateforme</p>
 				</div>
				<div className="flex items-center gap-2 px-3 py-2 bg-white rounded-lg shadow-sm border border-gray-200">
					<div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
					<div className="text-xs sm:text-sm">
						<p className="text-gray-500">Mis à jour</p>
						<p className="font-semibold text-gray-900">{new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</p>
					</div>
				</div>
			</div>

			{/* Main Stats Grid - Fully responsive with improved mobile layout */}
			<div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-4">
				{statCards.map((card, idx) => (
					<StatCard
						key={idx}
						icon={card.icon}
						title={card.title}
						value={card.value}
						gradient={card.gradient}
						details={card.details}
					/>
				))}
			</div>

			{/* Secondary section: Top performers - Enhanced responsive design */}
			<div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-5">
				{/* Top Networks */}
				<div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 sm:p-6 hover:shadow-md transition-shadow">
					<div className="flex items-center justify-between mb-5">
						<h2 className="text-lg sm:text-xl font-bold text-gray-900 flex items-center gap-2">
							<div className="p-2 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-lg">
								<Globe className="w-5 h-5 text-blue-600" />
							</div>
							<span>Top Réseaux</span>
						</h2>
						<span className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
							Top {(stats.topNetworks || []).length}
						</span>
					</div>
					<div className="space-y-2.5">
						{(stats.topNetworks || []).length > 0 ? (
							(stats.topNetworks || []).map((network, idx) => (
								<div key={idx} className="group flex items-center justify-between p-3 bg-gradient-to-r from-blue-50/50 to-cyan-50/50 hover:from-blue-50 hover:to-cyan-50 rounded-xl border border-blue-100/50 hover:border-blue-200 transition-all cursor-pointer">
									<div className="flex items-center gap-3 min-w-0 flex-1">
										<div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex-shrink-0 flex items-center justify-center text-white font-bold text-sm shadow-md">
											{idx + 1}
										</div>
										<span className="font-semibold text-gray-800 text-sm truncate group-hover:text-blue-700 transition-colors">{network.name}</span>
									</div>
									<span className="font-bold text-blue-700 bg-blue-100 px-3 py-1.5 rounded-full text-sm flex-shrink-0 ml-2 shadow-sm">
										{network.count}
									</span>
								</div>
							))
						) : (
							<div className="text-center py-8 text-gray-400">
								<Globe className="w-12 h-12 mx-auto mb-2 opacity-50" />
								<p className="text-sm">Aucun réseau pour le moment</p>
							</div>
						)}
					</div>
				</div>

				{/* Top Regions */}
				<div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 sm:p-6 hover:shadow-md transition-shadow">
					<div className="flex items-center justify-between mb-5">
						<h2 className="text-lg sm:text-xl font-bold text-gray-900 flex items-center gap-2">
							<div className="p-2 bg-gradient-to-br from-purple-50 to-indigo-50 rounded-lg">
								<MapPin className="w-5 h-5 text-purple-600" />
							</div>
							<span>Top Régions</span>
						</h2>
						<span className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
							Top {(stats.topRegions || []).length}
						</span>
					</div>
					<div className="space-y-2.5">
						{(stats.topRegions || []).length > 0 ? (
							(stats.topRegions || []).map((region, idx) => (
								<div key={idx} className="group flex items-center justify-between p-3 bg-gradient-to-r from-purple-50/50 to-indigo-50/50 hover:from-purple-50 hover:to-indigo-50 rounded-xl border border-purple-100/50 hover:border-purple-200 transition-all cursor-pointer">
									<div className="flex items-center gap-3 min-w-0 flex-1">
										<div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 flex-shrink-0 flex items-center justify-center text-white font-bold text-sm shadow-md">
											{idx + 1}
										</div>
										<span className="font-semibold text-gray-800 text-sm truncate group-hover:text-purple-700 transition-colors">{region.name}</span>
									</div>
									<span className="font-bold text-purple-700 bg-purple-100 px-3 py-1.5 rounded-full text-sm flex-shrink-0 ml-2 shadow-sm">
										{region.count}
									</span>
								</div>
							))
						) : (
							<div className="text-center py-8 text-gray-400">
								<MapPin className="w-12 h-12 mx-auto mb-2 opacity-50" />
								<p className="text-sm">Aucune région pour le moment</p>
							</div>
						)}
					</div>
				</div>
			</div>

			{/* Quick Actions - Mobile optimized */}
			 
		</div>
	);
};

export default DashboardAdminModern;
