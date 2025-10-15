'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { appointmentApi } from '@/lib/api/appointmentApi';
import { Appointment } from '@/types/appointment';
import { LoadingSpinner } from '../ui/LoadingSpinner';
import { Button } from '../ui/Button';
import { formatDate, formatTime } from '@/lib/utils/date';
import { AvailabilityManager } from './AvailabilityManager';
import { useAppointmentNotifications } from '@/hooks/useAppointmentNotifications';
import { UserAvatar } from '../chat/ui/UserAvatar';
import { RescheduleAppointmentModal } from './RescheduleAppointmentModal';

type AppointmentStatus = 'pending' | 'confirmed' | 'cancelled' | 'completed';
type ViewMode = 'appointments' | 'availability';

export const AgentAppointments: React.FC = () => {
	const [appointments, setAppointments] = useState<Appointment[]>([]);
	const [loading, setLoading] = useState(true);
	const [filter, setFilter] = useState<AppointmentStatus | 'all'>('all');
	const [actionLoading, setActionLoading] = useState<string | null>(null);
	const [viewMode, setViewMode] = useState<ViewMode>('appointments');
	const [rescheduleModalOpen, setRescheduleModalOpen] = useState(false);
	const [selectedAppointment, setSelectedAppointment] =
		useState<Appointment | null>(null);

	const fetchAppointments = useCallback(async () => {
		try {
			setLoading(true);
			const data = await appointmentApi.getMyAppointments();
			setAppointments(data);
		} catch (error) {
			console.error('Error fetching appointments:', error);
		} finally {
			setLoading(false);
		}
	}, []);

	// Enable real-time notifications with auto-refresh
	useAppointmentNotifications({ onUpdate: fetchAppointments });

	useEffect(() => {
		fetchAppointments();
	}, [fetchAppointments]);

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
			console.error('Error updating appointment:', error);
		} finally {
			setActionLoading(null);
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

	if (loading) {
		return (
			<div className="flex justify-center items-center py-12">
				<LoadingSpinner size="lg" />
			</div>
		);
	}

	if (viewMode === 'availability') {
		return (
			<AvailabilityManager onBack={() => setViewMode('appointments')} />
		);
	}

	return (
		<div className="space-y-6">
			{/* Header with View Toggle */}
			<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
				<div>
					<h2 className="text-2xl font-bold text-gray-900">
						Mes rendez-vous
					</h2>
					<p className="text-gray-600 mt-1">
						Gérez vos demandes de rendez-vous et vos disponibilités
					</p>
				</div>
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
									d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
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
					{['all', 'pending', 'confirmed', 'cancelled'].map(
						(status) => (
							<button
								key={status}
								onClick={() =>
									setFilter(
										status as AppointmentStatus | 'all',
									)
								}
								className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
									filter === status
										? 'bg-cyan-600 text-white'
										: 'bg-gray-100 text-gray-700 hover:bg-gray-200'
								}`}
							>
								{status === 'all'
									? 'Tous'
									: status === 'pending'
										? 'En attente'
										: status === 'confirmed'
											? 'Confirmés'
											: 'Annulés'}
							</button>
						),
					)}
				</div>
			</div>

			{/* Appointments List */}
			<div className="bg-white rounded-lg shadow">
				{filteredAppointments.length === 0 ? (
					<div className="p-12 text-center">
						<svg
							className="w-16 h-16 text-gray-300 mx-auto mb-4"
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
						<p className="text-gray-500">
							Aucun rendez-vous trouvé
						</p>
					</div>
				) : (
					<div className="divide-y">
						{filteredAppointments.map((appointment) => (
							<div
								key={appointment._id}
								className="p-6 hover:bg-gray-50 transition-colors"
							>
								<div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
									<div className="flex-1 space-y-3">
										<div className="flex items-center gap-3">
											<span
												className={`px-3 py-1 rounded-full text-xs font-medium ${
													appointment.status ===
													'pending'
														? 'bg-yellow-100 text-yellow-800'
														: appointment.status ===
															  'confirmed'
															? 'bg-green-100 text-green-800'
															: appointment.status ===
																  'cancelled'
																? 'bg-red-100 text-red-800'
																: 'bg-gray-100 text-gray-800'
												}`}
											>
												{appointment.status ===
												'pending'
													? 'En attente'
													: appointment.status ===
														  'confirmed'
														? 'Confirmé'
														: appointment.status ===
															  'cancelled'
															? 'Annulé'
															: 'Terminé'}
											</span>
											<span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
												{appointment.appointmentType ===
												'estimation'
													? 'Estimation'
													: appointment.appointmentType ===
														  'vente'
														? 'Mise en vente'
														: appointment.appointmentType ===
															  'achat'
															? 'Recherche bien'
															: 'Consultation'}
											</span>
										</div>

										<div className="grid md:grid-cols-2 gap-3">
											<div className="flex items-center gap-2 text-sm">
												<svg
													className="w-4 h-4 text-gray-400"
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
												<span className="font-medium text-gray-900">
													{formatDate(
														appointment.scheduledDate,
													)}
												</span>
												<span className="text-gray-600">
													à{' '}
													{formatTime(
														appointment.scheduledTime,
													)}
												</span>
											</div>

											<div className="flex items-center gap-2 text-sm">
												{typeof appointment.clientId ===
													'object' &&
												appointment.clientId ? (
													<>
														<UserAvatar
															user={
																appointment.clientId as any
															}
															size="sm"
														/>
														<span className="text-gray-900">
															{
																appointment
																	.clientId
																	.firstName
															}{' '}
															{
																appointment
																	.clientId
																	.lastName
															}
														</span>
													</>
												) : (
													<>
														<svg
															className="w-4 h-4 text-gray-400"
															fill="none"
															stroke="currentColor"
															viewBox="0 0 24 24"
														>
															<path
																strokeLinecap="round"
																strokeLinejoin="round"
																strokeWidth={2}
																d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
															/>
														</svg>
														<span className="text-gray-900">
															{
																appointment
																	.contactDetails
																	.name
															}
														</span>
													</>
												)}
											</div>

											{appointment.contactDetails
												.phone && (
												<div className="flex items-center gap-2 text-sm">
													<svg
														className="w-4 h-4 text-gray-400"
														fill="none"
														stroke="currentColor"
														viewBox="0 0 24 24"
													>
														<path
															strokeLinecap="round"
															strokeLinejoin="round"
															strokeWidth={2}
															d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
														/>
													</svg>
													<span className="text-gray-700">
														{
															appointment
																.contactDetails
																.phone
														}
													</span>
												</div>
											)}

											{appointment.contactDetails
												.email && (
												<div className="flex items-center gap-2 text-sm">
													<svg
														className="w-4 h-4 text-gray-400"
														fill="none"
														stroke="currentColor"
														viewBox="0 0 24 24"
													>
														<path
															strokeLinecap="round"
															strokeLinejoin="round"
															strokeWidth={2}
															d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
														/>
													</svg>
													<span className="text-gray-700">
														{
															appointment
																.contactDetails
																.email
														}
													</span>
												</div>
											)}
										</div>

										{appointment.notes && (
											<div className="text-sm text-gray-600 bg-gray-50 rounded p-3">
												<p className="font-medium text-gray-700 mb-1">
													Notes:
												</p>
												<p>{appointment.notes}</p>
											</div>
										)}
									</div>

									{/* Actions */}
									{appointment.status === 'pending' && (
										<div className="flex gap-2">
											<Button
												onClick={() =>
													handleStatusUpdate(
														appointment._id,
														'confirmed',
													)
												}
												disabled={
													actionLoading ===
													appointment._id
												}
												className="bg-green-600 hover:bg-green-700 text-white"
												size="sm"
											>
												{actionLoading ===
												appointment._id ? (
													<LoadingSpinner size="sm" />
												) : (
													<>
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
																d="M5 13l4 4L19 7"
															/>
														</svg>
														Accepter
													</>
												)}
											</Button>
											<Button
												onClick={() =>
													handleStatusUpdate(
														appointment._id,
														'cancelled',
													)
												}
												disabled={
													actionLoading ===
													appointment._id
												}
												variant="outline"
												className="border-red-300 text-red-600 hover:bg-red-50"
												size="sm"
											>
												Refuser
											</Button>
										</div>
									)}

									{appointment.status === 'confirmed' && (
										<div className="flex gap-2">
											<Button
												onClick={() => {
													setSelectedAppointment(
														appointment,
													);
													setRescheduleModalOpen(
														true,
													);
												}}
												variant="outline"
												className="border-blue-500 text-blue-600 hover:bg-blue-50"
												size="sm"
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
												Reprogrammer
											</Button>
											<Button
												onClick={() =>
													handleStatusUpdate(
														appointment._id,
														'cancelled',
													)
												}
												disabled={
													actionLoading ===
													appointment._id
												}
												variant="outline"
												className="border-red-300 text-red-600 hover:bg-red-50"
												size="sm"
											>
												Annuler
											</Button>
										</div>
									)}
								</div>
							</div>
						))}
					</div>
				)}
			</div>

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
		</div>
	);
};
