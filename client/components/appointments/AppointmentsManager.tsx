'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { appointmentApi } from '@/lib/api/appointmentApi';
import { Appointment } from '@/types/appointment';
import { LoadingSpinner } from '../ui/LoadingSpinner';
import { Button } from '../ui/Button';
import { formatDate, formatTime } from '@/lib/utils/date';
import { AvailabilityManager } from './AvailabilityManager';
import { useAppointmentNotifications } from '@/hooks/useAppointmentNotifications';
import { useFetch } from '@/hooks';
import { logger } from '@/lib/utils/logger';
import { UserAvatar } from '../chat/ui/UserAvatar';
import { RescheduleAppointmentModal } from './RescheduleAppointmentModal';
import { ConfirmDialog } from '../ui/ConfirmDialog';
import Link from 'next/link';

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
	status: 'confirmed' | 'cancelled';
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
	const router = useRouter();
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
		status: 'confirmed' | 'cancelled',
		appointmentType: string,
		otherUserName: string,
	) => {
		if (status === 'confirmed') {
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
		pending: appointments.filter((apt) => apt.status === 'pending').length,
		confirmed: appointments.filter((apt) => apt.status === 'confirmed')
			.length,
		total: appointments.length,
	};

	const getStatusColor = (status: AppointmentStatus) => {
		switch (status) {
			case 'pending':
				return 'bg-yellow-100 text-yellow-800';
			case 'confirmed':
				return 'bg-green-100 text-green-800';
			case 'cancelled':
				return 'bg-red-100 text-red-800';
			case 'completed':
				return 'bg-blue-100 text-blue-800';
			default:
				return 'bg-gray-100 text-gray-800';
		}
	};

	const getStatusLabel = (status: AppointmentStatus) => {
		switch (status) {
			case 'pending':
				return 'En attente';
			case 'confirmed':
				return 'Confirmé';
			case 'cancelled':
				return 'Annulé';
			case 'completed':
				return 'Terminé';
			default:
				return status;
		}
	};

	if (loading) {
		return (
			<div className="flex justify-center items-center py-12">
				<LoadingSpinner size="lg" />
			</div>
		);
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
			<div className="bg-white rounded-lg shadow p-4">
				<div className="flex flex-wrap gap-2">
					<Button
						variant={filter === 'all' ? 'primary' : 'outline'}
						onClick={() => setFilter('all')}
						size="sm"
					>
						Tous ({appointments.length})
					</Button>
					<Button
						variant={filter === 'pending' ? 'primary' : 'outline'}
						onClick={() => setFilter('pending')}
						size="sm"
					>
						En attente ({stats.pending})
					</Button>
					<Button
						variant={filter === 'confirmed' ? 'primary' : 'outline'}
						onClick={() => setFilter('confirmed')}
						size="sm"
					>
						Confirmés ({stats.confirmed})
					</Button>
					<Button
						variant={filter === 'cancelled' ? 'primary' : 'outline'}
						onClick={() => setFilter('cancelled')}
						size="sm"
					>
						Annulés (
						{
							appointments.filter(
								(apt) => apt.status === 'cancelled',
							).length
						}
						)
					</Button>
					<Button
						variant={filter === 'completed' ? 'primary' : 'outline'}
						onClick={() => setFilter('completed')}
						size="sm"
					>
						Terminés (
						{
							appointments.filter(
								(apt) => apt.status === 'completed',
							).length
						}
						)
					</Button>
				</div>
			</div>

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
							: `Aucun rendez-vous ${getStatusLabel(filter as AppointmentStatus).toLowerCase()}.`}
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
					{filteredAppointments.map((appointment) => {
						const otherUser = isAgent
							? appointment.clientId
							: appointment.agentId;

						// Create a minimal user object for UserAvatar
						const userForAvatar = {
							...otherUser,
							id: otherUser._id,
							phone: otherUser.phone || '',
							userType: (isAgent ? 'apporteur' : 'agent') as
								| 'agent'
								| 'apporteur',
							isEmailVerified: true,
							profileCompleted: true,
						};

						return (
							<div
								key={appointment._id}
								className="bg-white rounded-lg shadow hover:shadow-md transition-shadow"
							>
								<div className="p-6">
									<div className="flex items-start justify-between">
										<div className="flex items-start space-x-4 flex-1">
											<UserAvatar
												user={userForAvatar}
												size="lg"
											/>
											<div className="flex-1 min-w-0">
												<div className="flex items-center gap-3 mb-2">
													<h3 className="text-lg font-semibold text-gray-900">
														{otherUser.firstName}{' '}
														{otherUser.lastName}
													</h3>
													<span
														className={`px-3 py-1 text-xs font-medium rounded-full ${getStatusColor(appointment.status)}`}
													>
														{getStatusLabel(
															appointment.status,
														)}
													</span>
												</div>

												<div className="space-y-2 text-sm text-gray-600">
													<div className="flex items-center">
														<svg
															className="w-4 h-4 mr-2 flex-shrink-0"
															fill="none"
															stroke="currentColor"
															viewBox="0 0 24 24"
														>
															<path
																strokeLinecap="round"
																strokeLinejoin="round"
																strokeWidth={2}
																d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
															/>
														</svg>
														<span className="font-medium">
															{
																appointment.appointmentType
															}
														</span>
													</div>

													<div className="flex items-center">
														<svg
															className="w-4 h-4 mr-2 flex-shrink-0"
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
														<span>
															{formatDate(
																appointment.scheduledDate,
															)}{' '}
															à{' '}
															{formatTime(
																appointment.scheduledTime,
															)}
														</span>
													</div>

													{appointment.notes && (
														<div className="flex items-start">
															<svg
																className="w-4 h-4 mr-2 flex-shrink-0 mt-0.5"
																fill="none"
																stroke="currentColor"
																viewBox="0 0 24 24"
															>
																<path
																	strokeLinecap="round"
																	strokeLinejoin="round"
																	strokeWidth={
																		2
																	}
																	d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z"
																/>
															</svg>
															<span className="break-words">
																{
																	appointment.notes
																}
															</span>
														</div>
													)}

													{otherUser.email && (
														<div className="flex items-center">
															<svg
																className="w-4 h-4 mr-2 flex-shrink-0"
																fill="none"
																stroke="currentColor"
																viewBox="0 0 24 24"
															>
																<path
																	strokeLinecap="round"
																	strokeLinejoin="round"
																	strokeWidth={
																		2
																	}
																	d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
																/>
															</svg>
															<span>
																{
																	otherUser.email
																}
															</span>
														</div>
													)}

													{otherUser.phone && (
														<div className="flex items-center">
															<svg
																className="w-4 h-4 mr-2 flex-shrink-0"
																fill="none"
																stroke="currentColor"
																viewBox="0 0 24 24"
															>
																<path
																	strokeLinecap="round"
																	strokeLinejoin="round"
																	strokeWidth={
																		2
																	}
																	d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
																/>
															</svg>
															<span>
																{
																	otherUser.phone
																}
															</span>
														</div>
													)}
												</div>
											</div>
										</div>
									</div>

									{/* Actions */}
									<div className="mt-4 pt-4 border-t border-gray-200">
										<div className="flex flex-wrap gap-2">
											{/* Agent-specific actions */}
											{isAgent &&
												appointment.status ===
													'pending' && (
													<>
														<Button
															variant="primary"
															size="sm"
															onClick={() =>
																openConfirmDialog(
																	appointment._id,
																	'confirmed',
																	appointment.appointmentType,
																	`${otherUser.firstName} ${otherUser.lastName}`,
																)
															}
															disabled={
																actionLoading ===
																appointment._id
															}
														>
															{actionLoading ===
															appointment._id ? (
																<LoadingSpinner size="sm" />
															) : (
																'Accepter'
															)}
														</Button>
														<Button
															variant="outline"
															size="sm"
															onClick={() =>
																openConfirmDialog(
																	appointment._id,
																	'cancelled',
																	appointment.appointmentType,
																	`${otherUser.firstName} ${otherUser.lastName}`,
																)
															}
															disabled={
																actionLoading ===
																appointment._id
															}
															className="border-red-300 text-red-600 hover:bg-red-50"
														>
															Refuser
														</Button>
													</>
												)}

											{/* Common actions */}
											{(appointment.status ===
												'confirmed' ||
												appointment.status ===
													'pending') && (
												<Button
													variant="outline"
													size="sm"
													onClick={() => {
														setSelectedAppointment(
															appointment,
														);
														setRescheduleModalOpen(
															true,
														);
													}}
													disabled={
														actionLoading ===
														appointment._id
													}
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
															strokeWidth={2}
															d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
														/>
													</svg>
													Replanifier
												</Button>
											)}

											<Button
												variant="outline"
												size="sm"
												onClick={() =>
													router.push(
														`/chat?userId=${otherUser._id}`,
													)
												}
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
														strokeWidth={2}
														d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
													/>
												</svg>
												Message
											</Button>
										</div>
									</div>
								</div>
							</div>
						);
					})}
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
					confirmAction?.status === 'confirmed'
						? 'Accepter'
						: 'Refuser'
				}
				cancelText="Annuler"
			/>
		</div>
	);
};
