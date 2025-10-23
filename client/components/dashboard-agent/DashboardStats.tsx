import React from 'react';
import { formatNumber } from '@/lib/utils/format';

interface DashboardStatsProps {
	kpis: {
		propertiesTotal: number;
		collaborationsTotal: number;
		collaborationsActive: number;
		mySearches: number;
	};
	appointmentStats: {
		pending: number;
		confirmed: number;
		total: number;
	};
	loading?: boolean;
}

export const DashboardStats: React.FC<DashboardStatsProps> = ({
	kpis,
	appointmentStats,
	loading = false,
}) => {
	return (
		<>
			{/* Main Stats Cards */}
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
								Mes biens
							</p>
							<p className="text-2xl font-bold text-gray-900">
								{loading
									? '—'
									: formatNumber(kpis.propertiesTotal)}
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
									d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0"
								/>
							</svg>
						</div>
						<div className="ml-4">
							<p className="text-sm font-medium text-gray-600">
								Collaborations totales
							</p>
							<p className="text-2xl font-bold text-gray-900">
								{loading
									? '—'
									: formatNumber(kpis.collaborationsTotal)}
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
									d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857"
								/>
							</svg>
						</div>
						<div className="ml-4">
							<p className="text-sm font-medium text-gray-600">
								Collaborations actives
							</p>
							<p className="text-2xl font-bold text-gray-900">
								{loading
									? '—'
									: formatNumber(kpis.collaborationsActive)}
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
									d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
								/>
							</svg>
						</div>
						<div className="ml-4">
							<p className="text-sm font-medium text-gray-600">
								Mes recherches
							</p>
							<p className="text-2xl font-bold text-gray-900">
								{loading ? '—' : formatNumber(kpis.mySearches)}
							</p>
						</div>
					</div>
				</div>
			</div>

			{/* Appointment Stats Row */}
			<div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
				<div className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow">
					<div className="flex items-center">
						<div className="p-3 bg-cyan-100 rounded-lg">
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
									d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
								/>
							</svg>
						</div>
						<div className="ml-4">
							<p className="text-sm font-medium text-gray-600">
								Rendez-vous en attente
							</p>
							<p className="text-2xl font-bold text-gray-900">
								{appointmentStats.pending}
							</p>
						</div>
					</div>
				</div>

				<div className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow">
					<div className="flex items-center">
						<div className="p-3 bg-emerald-100 rounded-lg">
							<svg
								className="w-6 h-6 text-emerald-600"
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
								Rendez-vous confirmés
							</p>
							<p className="text-2xl font-bold text-gray-900">
								{appointmentStats.confirmed}
							</p>
						</div>
					</div>
				</div>

				<div className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow">
					<div className="flex items-center">
						<div className="p-3 bg-indigo-100 rounded-lg">
							<svg
								className="w-6 h-6 text-indigo-600"
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24"
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth="2"
									d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
								/>
							</svg>
						</div>
						<div className="ml-4">
							<p className="text-sm font-medium text-gray-600">
								Total des rendez-vous
							</p>
							<p className="text-2xl font-bold text-gray-900">
								{appointmentStats.total}
							</p>
						</div>
					</div>
				</div>
			</div>
		</>
	);
};
