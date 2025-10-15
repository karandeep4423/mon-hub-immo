'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { appointmentApi } from '@/lib/api/appointmentApi';
import { Appointment } from '@/types/appointment';
import { LoadingSpinner } from '../ui/LoadingSpinner';
import { Button } from '../ui/Button';
import { formatDate, formatTime } from '@/lib/utils/date';
import Link from 'next/link';
import { useAppointmentNotifications } from '@/hooks/useAppointmentNotifications';
import { UserAvatar } from '../chat/ui/UserAvatar';
import { RescheduleAppointmentModal } from './RescheduleAppointmentModal';

type AppointmentStatus = 'pending' | 'confirmed' | 'cancelled' | 'completed';

export const ApporteurAppointments: React.FC = () => {
	const [appointments, setAppointments] = useState<Appointment[]>([]);
	const [loading, setLoading] = useState(true);
	const [filter, setFilter] = useState<AppointmentStatus | 'all'>('all');
	const [actionLoading, setActionLoading] = useState<string | null>(null);
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

	const handleCancel = async (appointmentId: string) => {
		try {
			setActionLoading(appointmentId);
			await appointmentApi.updateAppointmentStatus(appointmentId, {
				status: 'cancelled',
			});
			await fetchAppointments();
		} catch (error) {
			console.error('Error cancelling appointment:', error);
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

	return (
		<div className="space-y-6">
			{/* Header */}
			<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
				<div>
					<h2 className="text-2xl font-bold text-gray-900">
						Mes Rendez-vous
					</h2>
					<p className="text-gray-600 mt-1">
						Gérez vos rendez-vous avec les agents immobiliers
					</p>
				</div>
				<Link href="/monagentimmo">
					<Button className="bg-blue-600 hover:bg-blue-700 text-white">
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
								d="M12 6v6m0 0v6m0-6h6m-6 0H6"
							/>
						</svg>
						Prendre rendez-vous
					</Button>
				</Link>
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
										? 'bg-blue-600 text-white'
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
						<p className="text-gray-500 mb-4">
							Aucun rendez-vous trouvé
						</p>
						<Link href="/monagentimmo">
							<Button className="bg-blue-600 hover:bg-blue-700 text-white">
								Prendre mon premier rendez-vous
							</Button>
						</Link>
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
													? 'En attente de confirmation'
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
												{typeof appointment.agentId ===
													'object' &&
												appointment.agentId ? (
													<>
														<UserAvatar
															user={
																appointment.agentId as any
															}
															size="sm"
														/>
														<span className="text-gray-900 font-medium">
															Agent:{' '}
															{
																appointment
																	.agentId
																	.firstName
															}{' '}
															{
																appointment
																	.agentId
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
														<span className="text-gray-900 font-medium">
															Agent
														</span>
													</>
												)}
											</div>

											{appointment.propertyDetails && (
												<div className="flex items-center gap-2 text-sm md:col-span-2">
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
															d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
														/>
														<path
															strokeLinecap="round"
															strokeLinejoin="round"
															strokeWidth={2}
															d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
														/>
													</svg>
													<span className="text-gray-700">
														{
															appointment
																.propertyDetails
																.address
														}
														{appointment
															.propertyDetails
															.city &&
															`, ${appointment.propertyDetails.city}`}
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

										{appointment.status === 'pending' && (
											<div className="text-sm text-blue-600 bg-blue-50 rounded p-3">
												<p className="flex items-center">
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
															d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
														/>
													</svg>
													En attente de confirmation
													par l&apos;agent
												</p>
											</div>
										)}
									</div>

									{/* Actions */}
									{(appointment.status === 'pending' ||
										appointment.status === 'confirmed') && (
										<div className="flex gap-2">
											{appointment.status ===
												'confirmed' && (
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
											)}
											<Button
												onClick={() =>
													handleCancel(
														appointment._id,
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
												{actionLoading ===
												appointment._id ? (
													<LoadingSpinner size="sm" />
												) : (
													'Annuler'
												)}
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
