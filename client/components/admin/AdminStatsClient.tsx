'use client';

import React from 'react';
import { useAdminStats } from '@/hooks/useAdminStats';
import DashboardAdminModern from './DashboardAdmin';

export default function AdminStatsClient() {
	const { stats, loading, error } = useAdminStats();

	if (loading) {
		return (
			<div className="space-y-6">
				<div className="h-16 bg-gradient-to-r from-gray-200 to-gray-300 rounded-lg animate-pulse" />
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
					{[...Array(4)].map((_, i) => (
						<div
							key={i}
							className="h-32 bg-gray-200 rounded-lg animate-pulse"
						/>
					))}
				</div>
			</div>
		);
	}

	if (error) {
		return (
			<div className="bg-red-50 border border-red-200 rounded-lg p-6 text-red-700">
				<p className="font-semibold mb-2">Erreur de chargement</p>
				<p className="text-sm">{error}</p>
			</div>
		);
	}

	if (!stats) {
		return (
			<div className="bg-gray-50 border border-gray-200 rounded-lg p-6 text-gray-700">
				<p>Aucune donnée disponible</p>
			</div>
		);
	}

	return <DashboardAdminModern stats={stats} />;
}
