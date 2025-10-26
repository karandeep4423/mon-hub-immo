import React from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '../ui/Button';

export type DashboardTab =
	| 'overview'
	| 'properties'
	| 'collaborations'
	| 'searches'
	| 'appointments';

interface DashboardTabsProps {
	activeTab: DashboardTab;
	onTabChange: (tab: DashboardTab) => void;
}

export const DashboardTabs: React.FC<DashboardTabsProps> = ({
	activeTab,
	onTabChange,
}) => {
	const router = useRouter();

	const getTabClass = (tab: DashboardTab) => {
		return `py-2 px-1 border-b-2 font-medium text-sm flex items-center ${
			activeTab === tab
				? 'border-cyan-500 text-cyan-600'
				: 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
		}`;
	};

	return (
		<div className="border-b border-gray-200 mb-8">
			<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
				<nav className="-mb-px flex flex-wrap items-center gap-x-4 gap-y-2 sm:gap-x-8">
					<button
						onClick={() => onTabChange('overview')}
						className={getTabClass('overview')}
					>
						Tableau de bord
					</button>
					<button
						onClick={() => onTabChange('properties')}
						className={getTabClass('properties')}
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
						onClick={() => onTabChange('collaborations')}
						className={getTabClass('collaborations')}
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
						onClick={() => onTabChange('searches')}
						className={getTabClass('searches')}
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
					<button
						onClick={() => onTabChange('appointments')}
						className={getTabClass('appointments')}
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
								d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
							/>
						</svg>
						Rendez-vous
					</button>
				</nav>
				{/* Quick Action Buttons */}
				<div className="w-full sm:w-auto sm:shrink-0 flex gap-3">
					<Button
						onClick={() => router.push('/search-ads/create')}
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
								d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
							/>
						</svg>
						Créer une recherche
					</Button>
					<Button
						onClick={() => onTabChange('properties')}
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
	);
};
