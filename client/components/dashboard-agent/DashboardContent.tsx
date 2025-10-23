// components/dashboard/DashboardContent.tsx
'use client';

import React, { useEffect, useState, useRef, useMemo } from 'react';
import { useRequireAuth } from '@/hooks/useRequireAuth';
import { AgentProfileCard } from './AgentProfileCard';
import { PropertyManager } from '../property/PropertyManager';
import { CollaborationList } from '../collaboration/CollaborationList';
import { DASHBOARD_TEXT, APPOINTMENT_STATUSES } from '@/lib/constants';
import { MySearches } from '../search-ads/MySearches';
import { useDashboardStats } from '@/hooks/useDashboardStats';
import { AppointmentsManager } from '../appointments/AppointmentsManager';
import { appointmentApi } from '@/lib/api/appointmentApi';
import { PageLoader } from '../ui/LoadingSpinner';
import { useFetch } from '@/hooks/useFetch';
import {
	ProfileCompletionBanner,
	DashboardStats,
	DashboardQuickActions,
	DashboardTabs,
	type DashboardTab,
} from './index';

export const DashboardContent: React.FC = () => {
	const { user, loading, refreshUser } = useRequireAuth();
	const [activeTab, setActiveTab] = useState<DashboardTab>('overview');
	const hasRefreshed = useRef(false);
	const { kpis, loading: statsLoading } = useDashboardStats(user?._id);

	// Use useFetch for appointment stats
	const { data: appointments } = useFetch(
		() => appointmentApi.getMyAppointments(),
		{
			deps: [user?._id],
			skip: !user,
			showErrorToast: false,
		},
	);

	const appointmentStats = useMemo(() => {
		if (!appointments) {
			return { pending: 0, confirmed: 0, total: 0 };
		}
		return {
			pending: appointments.filter(
				(apt) => apt.status === APPOINTMENT_STATUSES.PENDING,
			).length,
			confirmed: appointments.filter(
				(apt) => apt.status === APPOINTMENT_STATUSES.CONFIRMED,
			).length,
			total: appointments.length,
		};
	}, [appointments]);

	// Refresh user data once when component mounts to get latest profile status
	useEffect(() => {
		if (user && !loading && !hasRefreshed.current) {
			hasRefreshed.current = true;
			refreshUser();
		}
	}, [user, loading, refreshUser]);

	if (loading) {
		return <PageLoader message="Chargement..." />;
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
			{showProfilePrompt && <ProfileCompletionBanner />}

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
				<DashboardTabs
					activeTab={activeTab}
					onTabChange={setActiveTab}
				/>

				{/* Tab Content */}
				{activeTab === 'overview' && (
					<>
						{/* Stats Cards */}
						<DashboardStats
							kpis={kpis}
							appointmentStats={appointmentStats}
							loading={statsLoading}
						/>

						{/* Agent Profile Card */}
						{user.userType === 'agent' && (
							<AgentProfileCard user={user} />
						)}

						{/* Quick Actions */}
						<DashboardQuickActions
							onCreateProperty={() => setActiveTab('properties')}
							onViewProperties={() => setActiveTab('properties')}
						/>
					</>
				)}

				{/* Property Management Tab */}
				{activeTab === 'properties' && <PropertyManager />}
				{activeTab === 'collaborations' && user && (
					<CollaborationList
						currentUserId={user._id}
						onClose={() => {}}
					/>
				)}
				{activeTab === 'searches' && <MySearches />}
				{activeTab === 'appointments' && (
					<AppointmentsManager userType="agent" />
				)}
			</main>
		</div>
	);
};
