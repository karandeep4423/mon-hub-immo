'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { appointmentApi } from '@/lib/api/appointmentApi';
import { Appointment } from '@/types/appointment';
import { User } from '@/types/auth';
import { LoadingSpinner } from '../ui/LoadingSpinner';
import { Button } from '../ui/Button';
import { formatDate, formatTime } from '@/lib/utils/date';
import { AvailabilityManager } from './AvailabilityManager';
import { useAppointmentNotifications } from '@/hooks/useAppointmentNotifications';
import { UserAvatar } from '../chat/ui/UserAvatar';
import { RescheduleAppointmentModal } from './RescheduleAppointmentModal';
import { ConfirmDialog } from '../ui/ConfirmDialog';

type AppointmentStatus = 'pending' | 'confirmed' | 'cancelled' | 'completed';
type ViewMode = 'appointments' | 'availability';

type ConfirmAction = {
	appointmentId: string;
	status: 'confirmed' | 'cancelled';
	title: string;
	description: string;
	variant: 'danger' | 'primary' | 'warning';
} | null;

export const AgentAppointments: React.FC = () => {
	const router = useRouter();
	const [appointments, setAppointments] = useState<Appointment[]>([]);
	const [loading, setLoading] = useState(true);
	const [filter, setFilter] = useState<AppointmentStatus | 'all'>('all');
	const [actionLoading, setActionLoading] = useState<string | null>(null);
	const [viewMode, setViewMode] = useState<ViewMode>('appointments');
	const [rescheduleModalOpen, setRescheduleModalOpen] = useState(false);
	const [selectedAppointment, setSelectedAppointment] =
		useState<Appointment | null>(null);
	const [confirmAction, setConfirmAction] = useState<ConfirmAction>(null);

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
		clientName: string,
	) => {
		if (status === 'confirmed') {
			setConfirmAction({
				appointmentId,
				status,
				title: 'Accepter le rendez-vous',
				description: `Êtes-vous sûr de vouloir accepter ce rendez-vous de type "${appointmentType}" avec ${clientName} ?`,
				variant: 'primary',
			});
		} else {
			setConfirmAction({
				appointmentId,
				status,
				title: 'Refuser le rendez-vous',
				description: `Êtes-vous sûr de vouloir refuser ce rendez-vous avec ${clientName} ? Cette action est irréversible.`,
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
					<div className="grid grid-cols-1 gap-4">
						{filteredAppointments.map((appointment) => {
							// Define appointment type styling
							const appointmentTypeConfig = {
								estimation: {
									icon: '📊',
									label: 'Estimation',
									gradient: 'from-purple-500 to-pink-600',
									bgLight: 'bg-purple-50',
									borderColor: 'border-purple-200',
									textColor: 'text-purple-700',
									iconBg: 'bg-purple-100',
								},
								vente: {
									icon: '🏡',
									label: 'Mise en vente',
									gradient: 'from-green-500 to-emerald-600',
									bgLight: 'bg-green-50',
									borderColor: 'border-green-200',
									textColor: 'text-green-700',
									iconBg: 'bg-green-100',
								},
								achat: {
									icon: '🔍',
									label: 'Recherche bien',
									gradient: 'from-blue-500 to-cyan-600',
									bgLight: 'bg-blue-50',
									borderColor: 'border-blue-200',
									textColor: 'text-blue-700',
									iconBg: 'bg-blue-100',
								},
								conseil: {
									icon: '💼',
									label: 'Conseil',
									gradient: 'from-orange-500 to-amber-600',
									bgLight: 'bg-orange-50',
									borderColor: 'border-orange-200',
									textColor: 'text-orange-700',
									iconBg: 'bg-orange-100',
								},
							}[appointment.appointmentType];

							return (
								<div
									key={appointment._id}
									className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden border-2 border-gray-100"
								>
									{/* Card Header with Dynamic Gradient */}
									<div
										className={`bg-gradient-to-r ${appointmentTypeConfig.gradient} px-5 py-4`}
									>
										<div className="flex items-center justify-between flex-wrap gap-3">
											<div className="flex items-center gap-3">
												{/* Date/Time Badge */}
												<div className="bg-white/20 backdrop-blur-md rounded-lg px-3 py-2 border border-white/30">
													<p className="text-white/90 text-xs font-medium">
														{formatDate(
															appointment.scheduledDate,
														)}
													</p>
													<p className="text-white font-bold text-lg leading-tight">
														{formatTime(
															appointment.scheduledTime,
														)}
													</p>
												</div>

												{/* Appointment Type - HIGHLIGHTED */}
												<div className="bg-white/95 backdrop-blur-sm rounded-lg px-4 py-2 shadow-md">
													<div className="flex items-center gap-2">
														<span className="text-3xl">
															{
																appointmentTypeConfig.icon
															}
														</span>
														<div>
															<p className="text-[10px] text-gray-500 uppercase tracking-wide font-semibold">
																Type de RDV
															</p>
															<p
																className={`font-bold text-sm ${appointmentTypeConfig.textColor}`}
															>
																{
																	appointmentTypeConfig.label
																}
															</p>
														</div>
													</div>
												</div>
											</div>

											{/* Status Badge */}
											<span
												className={`px-4 py-2 rounded-full text-xs font-bold shadow-md ${
													appointment.status ===
													'pending'
														? 'bg-yellow-400 text-yellow-900'
														: appointment.status ===
															  'confirmed'
															? 'bg-green-400 text-green-900'
															: appointment.status ===
																  'cancelled'
																? 'bg-red-400 text-red-900'
																: 'bg-gray-400 text-gray-900'
												}`}
											>
												{appointment.status ===
												'pending'
													? '⏳ En attente'
													: appointment.status ===
														  'confirmed'
														? '✓ Confirmé'
														: appointment.status ===
															  'cancelled'
															? '✕ Annulé'
															: '✓ Terminé'}
											</span>
										</div>
									</div>

									{/* Card Body */}
									<div className="p-5 space-y-4">
										{/* Client Information */}
										<div className="bg-gradient-to-r from-gray-50 to-blue-50 rounded-xl p-4 border-2 border-blue-100 shadow-sm">
											<h4 className="text-sm font-bold text-gray-800 mb-3 flex items-center">
												<svg
													className="w-4 h-4 mr-2 text-cyan-600"
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
												Informations client
											</h4>
											<div className="grid md:grid-cols-2 gap-3">
												<div className="flex items-center gap-2.5 bg-white rounded-lg p-2">
													{typeof appointment.clientId ===
														'object' &&
													appointment.clientId ? (
														<>
															<UserAvatar
																user={
																	appointment.clientId as User
																}
																size="md"
															/>
															<div>
																<p className="text-sm font-bold text-gray-900">
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
																</p>
																<p className="text-xs text-gray-600">
																	Client
																</p>
															</div>
														</>
													) : (
														<>
															<div className="w-10 h-10 bg-gradient-to-br from-cyan-100 to-blue-100 rounded-full flex items-center justify-center shadow-sm">
																<svg
																	className="w-5 h-5 text-cyan-700"
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
																		d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
																	/>
																</svg>
															</div>
															<div>
																<p className="text-sm font-bold text-gray-900">
																	{
																		appointment
																			.contactDetails
																			.name
																	}
																</p>
																<p className="text-xs text-gray-600">
																	Client
																</p>
															</div>
														</>
													)}
												</div>

												{appointment.contactDetails
													.phone && (
													<div className="flex items-center gap-2 text-sm bg-white rounded-lg px-3 py-2.5 shadow-sm border border-gray-100">
														<svg
															className="w-4 h-4 text-cyan-600 flex-shrink-0"
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
														<span className="text-gray-800 font-semibold">
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
													<div className="flex items-center gap-2 text-sm bg-white rounded-lg px-3 py-2.5 md:col-span-2 shadow-sm border border-gray-100">
														<svg
															className="w-4 h-4 text-cyan-600 flex-shrink-0"
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
														<span className="text-gray-800 font-semibold">
															{
																appointment
																	.contactDetails
																	.email
															}
														</span>
													</div>
												)}
											</div>
										</div>

										{/* Notes Section */}
										{appointment.notes && (
											<div className="bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-amber-200 rounded-xl p-4 shadow-sm">
												<div className="flex items-start gap-2.5">
													<div className="bg-amber-100 p-2 rounded-lg">
														<svg
															className="w-5 h-5 text-amber-700"
															fill="none"
															stroke="currentColor"
															viewBox="0 0 24 24"
														>
															<path
																strokeLinecap="round"
																strokeLinejoin="round"
																strokeWidth={2}
																d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z"
															/>
														</svg>
													</div>
													<div className="flex-1">
														<p className="text-sm font-bold text-amber-900 mb-1.5">
															Notes du rendez-vous
														</p>
														<p className="text-sm text-amber-800 leading-relaxed">
															{appointment.notes}
														</p>
													</div>
												</div>
											</div>
										)}

										{/* Action Buttons */}
										<div className="flex items-center justify-between gap-3 pt-4 border-t-2 border-gray-200">
											{/* Message Button - Always visible for client */}
											{typeof appointment.clientId ===
												'object' &&
												appointment.clientId && (
													<Button
														onClick={() =>
															router.push(
																`/chat?userId=${appointment.clientId._id}`,
															)
														}
														variant="outline"
														className="border-2 border-cyan-500 text-cyan-600 hover:bg-cyan-50 shadow-md hover:shadow-lg transition-all"
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
																strokeWidth={2}
																d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
															/>
														</svg>
														Message
													</Button>
												)}

											<div className="flex items-center gap-3">
												{appointment.status ===
													'pending' && (
													<>
														<Button
															onClick={() => {
																const clientName =
																	typeof appointment.clientId ===
																	'object'
																		? `${appointment.clientId.firstName} ${appointment.clientId.lastName}`
																		: 'ce client';
																openConfirmDialog(
																	appointment._id,
																	'confirmed',
																	appointment.appointmentType,
																	clientName,
																);
															}}
															disabled={
																actionLoading ===
																appointment._id
															}
															className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white shadow-lg hover:shadow-xl transition-all"
															size="sm"
														>
															{actionLoading ===
															appointment._id ? (
																<LoadingSpinner size="sm" />
															) : (
																<>
																	<svg
																		className="w-4 h-4 mr-2"
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
																			d="M5 13l4 4L19 7"
																		/>
																	</svg>
																	Accepter
																</>
															)}
														</Button>
														<Button
															onClick={() => {
																const clientName =
																	typeof appointment.clientId ===
																	'object'
																		? `${appointment.clientId.firstName} ${appointment.clientId.lastName}`
																		: 'ce client';
																openConfirmDialog(
																	appointment._id,
																	'cancelled',
																	appointment.appointmentType,
																	clientName,
																);
															}}
															disabled={
																actionLoading ===
																appointment._id
															}
															variant="outline"
															className="border-2 border-red-400 text-red-600 hover:bg-red-50 hover:border-red-500 shadow-md hover:shadow-lg transition-all"
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
																	strokeWidth={
																		2
																	}
																	d="M6 18L18 6M6 6l12 12"
																/>
															</svg>
															Refuser
														</Button>
													</>
												)}

												{appointment.status ===
													'confirmed' && (
													<>
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
															className="border-2 border-blue-500 text-blue-600 hover:bg-blue-50 shadow-md hover:shadow-lg transition-all"
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
																	strokeWidth={
																		2
																	}
																	d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
																/>
															</svg>
															Reprogrammer
														</Button>
														<Button
															onClick={() => {
																const clientName =
																	typeof appointment.clientId ===
																	'object'
																		? `${appointment.clientId.firstName} ${appointment.clientId.lastName}`
																		: 'ce client';
																openConfirmDialog(
																	appointment._id,
																	'cancelled',
																	appointment.appointmentType,
																	clientName,
																);
															}}
															disabled={
																actionLoading ===
																appointment._id
															}
															variant="outline"
															className="border-2 border-red-400 text-red-600 hover:bg-red-50 hover:border-red-500 shadow-md hover:shadow-lg transition-all"
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
																	strokeWidth={
																		2
																	}
																	d="M6 18L18 6M6 6l12 12"
																/>
															</svg>
															Annuler
														</Button>
													</>
												)}
											</div>
										</div>
									</div>
								</div>
							);
						})}
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

			{/* Confirmation Dialog */}
			<ConfirmDialog
				isOpen={!!confirmAction}
				title={confirmAction?.title || ''}
				description={confirmAction?.description || ''}
				onConfirm={handleConfirmAction}
				onCancel={() => setConfirmAction(null)}
				variant={confirmAction?.variant || 'primary'}
			/>
		</div>
	);
};
