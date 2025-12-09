// components/dashboard/DashboardContent.tsx
'use client';

import React, { useEffect, useState, useRef, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useRequireAuth } from '@/hooks/useRequireAuth';
import { AgentProfileCard } from './AgentProfileCard';
import { PropertyManager } from '../property/PropertyManager';
import { CollaborationList } from '../collaboration/CollaborationList';
import { DASHBOARD_UI_TEXT } from '@/lib/constants/features/dashboard';
import { APPOINTMENT_STATUS_VALUES } from '@/lib/constants/features/appointments';
import { MySearches } from '../search-ads/MySearches';
import { useDashboardStats } from '@/hooks/useDashboardStats';
import { AppointmentsManager } from '../appointments/AppointmentsManager';
import { PageLoader } from '../ui/LoadingSpinner';
import { useAppointments } from '@/hooks/useAppointments';
import {
	ProfileCompletionBanner,
	DashboardStats,
	DashboardQuickActions,
	DashboardTabs,
	type DashboardTab,
} from './index';
import { usePageState } from '@/hooks/usePageState';
import { useScrollRestoration } from '@/hooks/useScrollRestoration';

export const DashboardContent: React.FC = () => {
	const router = useRouter();
	const { user, loading, refreshUser } = useRequireAuth();
	const [activeTab, setActiveTab] = useState<DashboardTab>('overview');
	const hasRefreshed = useRef(false);
	const { kpis, loading: statsLoading } = useDashboardStats(user?._id);

	// Use SWR for appointment stats with automatic cache management
	const { data: appointments } = useAppointments(user?._id, {
		enabled: activeTab === 'overview' || activeTab === 'appointments',
	});

	const appointmentStats = useMemo(() => {
		if (!appointments) {
			return { pending: 0, confirmed: 0, total: 0 };
		}
		return {
			pending: appointments.filter(
				(apt) => apt.status === APPOINTMENT_STATUS_VALUES.PENDING,
			).length,
			confirmed: appointments.filter(
				(apt) => apt.status === APPOINTMENT_STATUS_VALUES.CONFIRMED,
			).length,
			total: appointments.length,
		};
	}, [appointments]);

	// Page state: persist activeTab and scroll restoration for dashboard
	const {
		key: pageKey,
		savedState,
		save,
		urlOverrides,
	} = usePageState({
		hasTabs: true,
		getCurrentState: () => ({ activeTab }),
	});

	useEffect(() => {
		const validTabs: DashboardTab[] = [
			'overview',
			'properties',
			'collaborations',
			'searches',
			'appointments',
		];
		const fromUrl = urlOverrides.activeTab as string | undefined;
		const fromSaved =
			(savedState?.activeTab as string | undefined) || undefined;
		const candidate = fromUrl ?? fromSaved;
		if (candidate && validTabs.includes(candidate as DashboardTab)) {
			setActiveTab(candidate as DashboardTab);
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	useEffect(() => {
		save({ activeTab });
	}, [activeTab, save]);

	// Scroll restoration (window scroll)
	useScrollRestoration({
		key: pageKey,
		ready: !loading && !statsLoading,
	});

	// Refresh user data once when component mounts to get latest profile status
	useEffect(() => {
		if (user && !loading && !hasRefreshed.current) {
			hasRefreshed.current = true;
			refreshUser();
		}
	}, [user, loading, refreshUser]);

	// Check if user needs to complete profile
	const showProfilePrompt =
		user?.userType === 'agent' && !user?.profileCompleted;

	// Check if agent needs to pay (only for agents, not admins)
	const needsSubscription =
		user?.userType === 'agent' &&
		user?.profileCompleted &&
		!user?.isPaid &&
		!user?.accessGrantedByAdmin;

	// Redirect unpaid agents to payment page when trying to access features
	useEffect(() => {
		if (
			needsSubscription &&
			activeTab !== 'overview' &&
			activeTab !== 'appointments'
		) {
			router.push('/payment');
		}
	}, [needsSubscription, activeTab, router]);

	if (loading) {
		return <PageLoader message="Chargement..." />;
	}

	if (!user) {
		return null;
	}

	return (
		<div className="min-h-screen bg-gray-50">
			{/* Profile Completion Alert for Agents */}
			{showProfilePrompt && <ProfileCompletionBanner />}

			{/* Main Content */}
			<main
				id="dashboard-main"
				className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 overflow-x-hidden"
			>
				<div className="mb-8">
					<h2 className="text-2xl font-bold text-gray-900 mb-2">
						Bienvenue, {user.firstName} !
					</h2>
					<p className="text-gray-600">
						{DASHBOARD_UI_TEXT.welcomeAgent}
					</p>
				</div>

				{/* Tab Navigation */}
				<DashboardTabs
					activeTab={activeTab}
					onTabChange={setActiveTab}
				/>

				{/* Tab Content */}
				<div className="animate-fade-in">
					{activeTab === 'overview' && (
						<>
							{/* Payment Required Banner for Agents */}
							{needsSubscription && (
								<div className="mb-6 bg-yellow-50 border border-yellow-200 rounded-xl p-6">
									<h3 className="text-lg font-semibold text-yellow-800 mb-2">
										Abonnement requis
									</h3>
									<p className="text-yellow-700 mb-4">
										Pour accéder à toutes les
										fonctionnalités (biens, collaborations,
										recherches), veuillez activer votre
										abonnement.
									</p>
									<a
										href="/payment"
										className="inline-flex items-center gap-2 bg-yellow-600 text-white px-4 py-2 rounded-lg hover:bg-yellow-700 transition-colors"
									>
										Activer mon abonnement -{' '}
										{process.env.NEXT_PUBLIC_STRIPE_PRICE}
										€/mois
									</a>
								</div>
							)}

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

							{/* Quick Actions (only show if paid) */}
							{!needsSubscription && (
								<DashboardQuickActions
									onCreateProperty={() =>
										setActiveTab('properties')
									}
									onViewProperties={() =>
										setActiveTab('properties')
									}
								/>
							)}
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
				</div>
			</main>
		</div>
	);
};
