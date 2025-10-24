'use client';

import React, { useState } from 'react';
import { appointmentApi } from '@/lib/api/appointmentApi';
import { Appointment } from '@/types/appointment';
import { PageLoader } from '../ui/LoadingSpinner';
import { Button } from '../ui/Button';
import { AvailabilityManager } from './AvailabilityManager';
import { useAppointmentNotifications } from '@/hooks/useAppointmentNotifications';
import { useFetch } from '@/hooks';
import { logger } from '@/lib/utils/logger';
import { RescheduleAppointmentModal } from './RescheduleAppointmentModal';
import { ConfirmDialog } from '../ui/ConfirmDialog';
import { APPOINTMENT_STATUSES } from '@/lib/constants';
import Link from 'next/link';
import { AppointmentCard } from './AppointmentCard';
import { AppointmentFilters } from './AppointmentFilters';

type AppointmentStatus =
	| 'pending'
	| 'confirmed'
	| 'cancelled'
	| 'completed'
	| 'rejected';
type ViewMode = 'appointments' | 'availability';
type UserType = 'agent' | 'apporteur';

type ConfirmAction = {
	appointmentId: string;
	status:
		| typeof APPOINTMENT_STATUSES.CONFIRMED
		| typeof APPOINTMENT_STATUSES.CANCELLED;
	title: string;
	description: string;
	variant: 'danger' | 'primary' | 'warning';
} | null;

interface AppointmentsManagerProps {
	userType: UserType;
}

/**
 * Unified Appointments Manager
 * Replaces: AgentAppointments & ApporteurAppointments
 * Handles appointments for both agents and apporteurs with role-specific features
 */
export const AppointmentsManager: React.FC<AppointmentsManagerProps> = ({
	userType,
}) => {
	const [filter, setFilter] = useState<AppointmentStatus | 'all'>('all');
	const [actionLoading, setActionLoading] = useState<string | null>(null);
	const [viewMode, setViewMode] = useState<ViewMode>('appointments');
	const [rescheduleModalOpen, setRescheduleModalOpen] = useState(false);
	const [selectedAppointment, setSelectedAppointment] =
		useState<Appointment | null>(null);
	const [confirmAction, setConfirmAction] = useState<ConfirmAction>(null);

	const isAgent = userType === 'agent';

	// Use useFetch hook for consistent data fetching
	const {
		data: appointments = [],
		loading,
		refetch: fetchAppointments,
	} = useFetch<Appointment[]>(() => appointmentApi.getMyAppointments(), {
		showErrorToast: true,
		errorMessage: 'Échec du chargement des rendez-vous',
	});

	// Enable real-time notifications with auto-refresh
	useAppointmentNotifications({ onUpdate: fetchAppointments });

	const handleStatusUpdate = async (
		appointmentId: string,
		status: 'confirmed' | 'cancelled',
	) => {
		try {
			setActionLoading(appointmentId);
			await appointmentApi.updateAppointmentStatus(appointmentId, {
				status,
			});
			await fetchAppointments();
		} catch (error) {
			logger.error('Error updating appointment:', error);
		} finally {
			setActionLoading(null);
		}
	};

	const handleConfirmAction = async () => {
		if (!confirmAction) return;

		await handleStatusUpdate(
			confirmAction.appointmentId,
			confirmAction.status,
		);
		setConfirmAction(null);
	};

	const openConfirmDialog = (
		appointmentId: string,
		status:
			| typeof APPOINTMENT_STATUSES.CONFIRMED
			| typeof APPOINTMENT_STATUSES.CANCELLED,
		appointmentType: string,
		otherUserName: string,
	) => {
		if (status === APPOINTMENT_STATUSES.CONFIRMED) {
			setConfirmAction({
				appointmentId,
				status,
				title: 'Accepter le rendez-vous',
				description: `Êtes-vous sûr de vouloir accepter ce rendez-vous de type "${appointmentType}" avec ${otherUserName} ?`,
				variant: 'primary',
			});
		} else {
			setConfirmAction({
				appointmentId,
				status,
				title: 'Refuser le rendez-vous',
				description: `Êtes-vous sûr de vouloir refuser ce rendez-vous avec ${otherUserName} ? Cette action est irréversible.`,
				variant: 'danger',
			});
		}
	};

	const filteredAppointments =
		filter === 'all'
			? appointments
			: appointments.filter((apt) => apt.status === filter);

	const stats = {
		all: appointments.length,
		pending: appointments.filter(
			(apt) => apt.status === APPOINTMENT_STATUSES.PENDING,
		).length,
		confirmed: appointments.filter(
			(apt) => apt.status === APPOINTMENT_STATUSES.CONFIRMED,
		).length,
		cancelled: appointments.filter(
			(apt) => apt.status === APPOINTMENT_STATUSES.CANCELLED,
		).length,
		completed: appointments.filter(
			(apt) => apt.status === APPOINTMENT_STATUSES.COMPLETED,
		).length,
		total: appointments.length,
	};

	if (loading) {
		return <PageLoader message="Chargement des rendez-vous..." />;
	}

	// Agent-specific: Show availability manager
	if (isAgent && viewMode === 'availability') {
		return (
			<AvailabilityManager onBack={() => setViewMode('appointments')} />
		);
	}

	return (
		<div className="space-y-6">
			{/* Header */}
			<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
				<div>
					<h2 className="text-2xl font-bold text-gray-900">
						Mes rendez-vous
					</h2>
					<p className="text-gray-600 mt-1">
						{isAgent
							? 'Gérez vos demandes de rendez-vous et vos disponibilités'
							: 'Suivez vos rendez-vous avec les agents immobiliers'}
					</p>
				</div>
				{isAgent && (
					<Button
						onClick={() => setViewMode('availability')}
						variant="outline"
						className="border-cyan-600 text-cyan-600 hover:bg-cyan-50"
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
								strokeWidth={2}
								d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
							/>
						</svg>
						Gérer mes disponibilités
					</Button>
				)}
			</div>

			{/* Stats Cards */}
			<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
				<div className="bg-white rounded-lg shadow p-6">
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
									strokeWidth={2}
									d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
								/>
							</svg>
						</div>
						<div className="ml-4">
							<p className="text-sm font-medium text-gray-600">
								En attente
							</p>
							<p className="text-2xl font-bold text-gray-900">
								{stats.pending}
							</p>
						</div>
					</div>
				</div>

				<div className="bg-white rounded-lg shadow p-6">
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
									strokeWidth={2}
									d="M5 13l4 4L19 7"
								/>
							</svg>
						</div>
						<div className="ml-4">
							<p className="text-sm font-medium text-gray-600">
								Confirmés
							</p>
							<p className="text-2xl font-bold text-gray-900">
								{stats.confirmed}
							</p>
						</div>
					</div>
				</div>

				<div className="bg-white rounded-lg shadow p-6">
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
									strokeWidth={2}
									d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
								/>
							</svg>
						</div>
						<div className="ml-4">
							<p className="text-sm font-medium text-gray-600">
								Total
							</p>
							<p className="text-2xl font-bold text-gray-900">
								{stats.total}
							</p>
						</div>
					</div>
				</div>
			</div>

			{/* Filters */}
			<AppointmentFilters
				filter={filter}
				onFilterChange={setFilter}
				counts={stats}
				userType={isAgent ? 'agent' : 'apporteur'}
			/>

			{/* Appointments List */}
			{filteredAppointments.length === 0 ? (
				<div className="bg-white rounded-lg shadow p-12 text-center">
					<svg
						className="mx-auto h-12 w-12 text-gray-400"
						fill="none"
						stroke="currentColor"
						viewBox="0 0 24 24"
					>
						<path
							strokeLinecap="round"
							strokeLinejoin="round"
							strokeWidth={2}
							d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
						/>
					</svg>
					<h3 className="mt-2 text-sm font-medium text-gray-900">
						Aucun rendez-vous
					</h3>
					<p className="mt-1 text-sm text-gray-500">
						{filter === 'all'
							? "Vous n'avez aucun rendez-vous pour le moment."
							: `Aucun rendez-vous ${filter === 'pending' ? 'en attente' : filter === 'confirmed' ? 'confirmé' : filter === 'cancelled' ? 'annulé' : 'terminé'}.`}
					</p>
					{!isAgent && (
						<div className="mt-6">
							<Link href="/monagentimmo">
								<Button>Trouver un agent</Button>
							</Link>
						</div>
					)}
				</div>
			) : (
				<div className="space-y-4">
					{filteredAppointments.map((appointment) => (
						<AppointmentCard
							key={appointment._id}
							appointment={appointment}
							isAgent={isAgent}
							actionLoading={actionLoading}
							onConfirm={(id) =>
								openConfirmDialog(
									id,
									'confirmed',
									appointment.appointmentType,
									`${(isAgent ? appointment.clientId : appointment.agentId).firstName} ${(isAgent ? appointment.clientId : appointment.agentId).lastName}`,
								)
							}
							onReject={(id) =>
								openConfirmDialog(
									id,
									'cancelled',
									appointment.appointmentType,
									`${(isAgent ? appointment.clientId : appointment.agentId).firstName} ${(isAgent ? appointment.clientId : appointment.agentId).lastName}`,
								)
							}
							onCancel={(id) =>
								openConfirmDialog(
									id,
									'cancelled',
									appointment.appointmentType,
									`${(isAgent ? appointment.clientId : appointment.agentId).firstName} ${(isAgent ? appointment.clientId : appointment.agentId).lastName}`,
								)
							}
							onReschedule={(apt) => {
								setSelectedAppointment(apt);
								setRescheduleModalOpen(true);
							}}
						/>
					))}
				</div>
			)}

			{/* Reschedule Modal */}
			{selectedAppointment && (
				<RescheduleAppointmentModal
					isOpen={rescheduleModalOpen}
					onClose={() => {
						setRescheduleModalOpen(false);
						setSelectedAppointment(null);
					}}
					appointment={selectedAppointment}
					onSuccess={fetchAppointments}
				/>
			)}

			{/* Confirm Dialog */}
			<ConfirmDialog
				isOpen={!!confirmAction}
				title={confirmAction?.title || ''}
				description={confirmAction?.description || ''}
				onConfirm={handleConfirmAction}
				onCancel={() => setConfirmAction(null)}
				variant={confirmAction?.variant || 'primary'}
				confirmText={
					confirmAction?.status === APPOINTMENT_STATUSES.CONFIRMED
						? 'Accepter'
						: 'Refuser'
				}
				cancelText="Annuler"
			/>
		</div>
	);
};
