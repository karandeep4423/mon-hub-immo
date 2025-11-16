'use client';
import React from 'react';
import Link from 'next/link';
import { StatCard } from './ui/StatCard';
import { designTokens } from '@/lib/constants/designTokens';
import { AdminStats } from '@/hooks/useAdminStats';

interface DashboardAdminModernProps {
	stats: AdminStats;
}

export const DashboardAdminModern: React.FC<DashboardAdminModernProps> = ({ stats }) => {
	const statCards = [
		{
			icon: '👥',
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
			icon: '🧾',
			title: 'Apporteurs',
			value: stats.apporteursTotal,
			gradient: 'green' as const,
			details: [
				{ label: 'Actifs', value: stats.apporteursActive, color: '#10B981' },
				{ label: 'En attente', value: stats.apporteursPending, color: '#F59E0B' },
			],
		},
		{
			icon: '🏠',
			title: 'Annonces Actives',
			value: stats.propertiesActive,
			gradient: 'purple' as const,
			details: [
				{ label: 'Archivées', value: stats.propertiesArchived, color: '#9CA3AF' },
				{ label: 'Collaboration', value: stats.propertiesInCollab, color: '#3B82F6' },
			],
		},
		{
			icon: '🤝',
			title: 'Collaborations',
			value: stats.collabOpen,
			gradient: 'emerald' as const,
			details: [
				{ label: 'Clôturées', value: stats.collabClosed, color: '#8B5CF6' },
			],
		},
		{
			icon: '💰',
			title: 'Frais d\'Agence',
			value: typeof stats.feesTotal === 'number'
				? `€${stats.feesTotal.toLocaleString('fr-FR')}`
				: stats.feesTotal,
			gradient: 'rose' as const,
		},
	];

	return (
		<div className="space-y-8">
			{/* Header */}
			<div className="flex justify-between items-center">
				<div>
					<h1 className="text-4xl font-bold text-gray-900 mb-2">Tableau de Bord</h1>
 				</div>
				<div className="text-right">
					<p className="text-sm text-gray-500">Dernière mise à jour</p>
					<p className="text-lg font-semibold text-gray-900">{new Date().toLocaleString('fr-FR')}</p>
				</div>
			</div>

			{/* Main Stats Grid */}
			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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
			<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
				{/* Top Networks */}
				<div className="bg-white rounded-xl shadow-md border border-gray-100 p-6">
					<h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
						<span className="text-2xl">🌐</span> Top Réseaux
					</h2>
					<div className="space-y-3">
						{(stats.topNetworks || []).map((network, idx) => (
							<div key={idx} className="flex items-center justify-between p-3 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg border border-blue-100">
								<div className="flex items-center gap-3">
									<div className="w-8 h-8 rounded-full bg-gradient-to-r from-cyan-400 to-blue-500 flex items-center justify-center text-white font-bold text-xs">
										{idx + 1}
									</div>
									<span className="font-medium text-gray-700">{network.name}</span>
								</div>
								<span className="font-bold text-blue-600 bg-blue-100 px-3 py-1 rounded-full">
									{network.count}
								</span>
							</div>
						))}
					</div>
				</div>

				{/* Top Regions */}
				<div className="bg-white rounded-xl shadow-md border border-gray-100 p-6">
					<h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
						<span className="text-2xl">📍</span> Top Régions
					</h2>
					<div className="space-y-3">
						{(stats.topRegions || []).map((region, idx) => (
							<div key={idx} className="flex items-center justify-between p-3 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-lg border border-purple-100">
								<div className="flex items-center gap-3">
									<div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-400 to-indigo-500 flex items-center justify-center text-white font-bold text-xs">
										{idx + 1}
									</div>
									<span className="font-medium text-gray-700">{region.name}</span>
								</div>
								<span className="font-bold text-purple-600 bg-purple-100 px-3 py-1 rounded-full">
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
