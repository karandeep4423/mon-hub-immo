'use client';
import React from 'react';
import Link from 'next/link';
import { StatCard } from './ui/StatCard';
import { designTokens } from '@/lib/constants/designTokens';
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
			title: 'Frais d\'Agence',
			value: typeof stats.feesTotal === 'number'
				? `€${stats.feesTotal.toLocaleString('fr-FR')}`
				: stats.feesTotal,
			gradient: 'rose' as const,
		},
	];

	return (
		<div className="space-y-4 sm:space-y-6 md:space-y-8">
			{/* Header */}
			<div className="flex flex-col sm:flex-row sm:justify-between sm:items-start md:items-center gap-4">
				<div>
					<h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-1 sm:mb-2">Tableau de Bord</h1>
 				</div>
				<div className="text-left sm:text-right text-sm">
					<p className="text-xs sm:text-sm text-gray-500">Dernière mise à jour</p>
					<p className="text-sm sm:text-lg font-semibold text-gray-900">{new Date().toLocaleString('fr-FR')}</p>
				</div>
			</div>

			{/* Main Stats Grid */}
			<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
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

			{/* Secondary section: Top performers */}
			<div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4 md:gap-6">
				{/* Top Networks */}
				<div className="bg-white rounded-xl shadow-md border border-gray-100 p-4 sm:p-6">
					<h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-4 sm:mb-6 flex items-center gap-2">
						<span className="text-xl sm:text-2xl"><Globe className="w-5 h-5 sm:w-6 sm:h-6" /></span> Top Réseaux
					</h2>
					<div className="space-y-2 sm:space-y-3">
						{(stats.topNetworks || []).map((network, idx) => (
							<div key={idx} className="flex items-center justify-between p-2 sm:p-3 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg border border-blue-100">
								<div className="flex items-center gap-2 sm:gap-3 min-w-0">
									<div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gradient-to-r from-cyan-400 to-blue-500 flex-shrink-0 flex items-center justify-center text-white font-bold text-xs">
										{idx + 1}
									</div>
									<span className="font-medium text-gray-700 text-sm truncate">{network.name}</span>
								</div>
								<span className="font-bold text-blue-600 bg-blue-100 px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm flex-shrink-0 ml-2">
									{network.count}
								</span>
							</div>
						))}
					</div>
				</div>

				{/* Top Regions */}
				<div className="bg-white rounded-xl shadow-md border border-gray-100 p-4 sm:p-6">
					<h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-4 sm:mb-6 flex items-center gap-2">
						<span className="text-xl sm:text-2xl"><MapPin className="w-5 h-5 sm:w-6 sm:h-6" /></span> Top Régions
					</h2>
					<div className="space-y-2 sm:space-y-3">
						{(stats.topRegions || []).map((region, idx) => (
							<div key={idx} className="flex items-center justify-between p-2 sm:p-3 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-lg border border-purple-100">
								<div className="flex items-center gap-2 sm:gap-3 min-w-0">
									<div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gradient-to-r from-purple-400 to-indigo-500 flex-shrink-0 flex items-center justify-center text-white font-bold text-xs">
										{idx + 1}
									</div>
									<span className="font-medium text-gray-700 text-sm truncate">{region.name}</span>
								</div>
								<span className="font-bold text-purple-600 bg-purple-100 px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm flex-shrink-0 ml-2">
									{region.count}
								</span>
							</div>
						))}
					</div>
				</div>
			</div>

			{/* Quick Actions */}
			 
		</div>
	);
};

interface QuickActionButtonProps {
	label: string;
	icon: string;
	href: string;
	description: string;
}

const QuickActionButton: React.FC<QuickActionButtonProps> = ({ label, icon, href, description }) => {
	return (
		<Link
			href={href}
			className="group p-4 bg-white/10 hover:bg-white/20 rounded-lg border border-white/20 transition-all duration-300 hover:scale-105"
		>
			<div className="flex items-center gap-3 mb-2">
				<span className="text-3xl">{icon}</span>
				<span className="font-semibold">{label}</span>
			</div>
			<p className="text-sm text-gray-300">{description}</p>
		</Link>
	);
};

export default DashboardAdminModern;
