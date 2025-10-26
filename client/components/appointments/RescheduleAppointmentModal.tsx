'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import type { Appointment } from '@/types/appointment';
import { toast } from 'react-toastify';
import { TOAST_MESSAGES } from '@/lib/constants';
import { formatDateShort } from '@/lib/utils/date';
import {
	useAvailableSlots,
	useAppointmentMutations,
} from '@/hooks/useAppointments';
import { useAuth } from '@/hooks/useAuth';

interface RescheduleAppointmentModalProps {
	isOpen: boolean;
	onClose: () => void;
	appointment: Appointment;
	onSuccess: () => void;
}

export const RescheduleAppointmentModal: React.FC<
	RescheduleAppointmentModalProps
> = ({ isOpen, onClose, appointment, onSuccess }) => {
	const [newDate, setNewDate] = useState('');
	const [newTime, setNewTime] = useState('');
	const [loading, setLoading] = useState(false);

	const agentId =
		typeof appointment.agentId === 'object'
			? appointment.agentId._id
			: appointment.agentId;

	const agentName =
		typeof appointment.agentId === 'object'
			? `${appointment.agentId.firstName} ${appointment.agentId.lastName}`
			: 'Agent';

	const { user } = useAuth();

	// Use SWR to fetch available slots
	const { data: slotsData, isLoading: loadingSlots } = useAvailableSlots(
		agentId,
		newDate || undefined,
	);

	// Extract slots array from API response - slotsData is already { slots, isAvailable, duration }
	const availableSlots = slotsData?.slots || [];

	// Get mutation function
	const { rescheduleAppointment } = useAppointmentMutations(user?._id);

	const resetForm = useCallback(() => {
		setNewDate('');
		setNewTime('');
	}, []);

	useEffect(() => {
		if (!isOpen) {
			resetForm();
		}
	}, [isOpen, resetForm]);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		if (!newDate || !newTime) {
			toast.error(TOAST_MESSAGES.APPOINTMENTS.SELECT_DATE_TIME);
			return;
		}

		setLoading(true);
		const result = await rescheduleAppointment(appointment._id, {
			scheduledDate: newDate,
			scheduledTime: newTime,
		});
		setLoading(false);

		if (result.success) {
			onSuccess();
			onClose();
		}
	};

	const getMinDate = () => {
		const tomorrow = new Date();
		tomorrow.setDate(tomorrow.getDate() + 1);
		return tomorrow.toISOString().split('T')[0];
	};

	const getMaxDate = () => {
		const maxDate = new Date();
		maxDate.setDate(maxDate.getDate() + 60);
		return maxDate.toISOString().split('T')[0];
	};

	if (!isOpen) return null;

	return (
		<Modal
			isOpen={isOpen}
			onClose={onClose}
			size="xl"
			className="max-w-2xl"
		>
			<div className="flex flex-col max-h-[90vh]">
				{/* Header */}
				<div className="px-4 md:px-6 py-4 md:py-5 flex-shrink-0 border-b-2 border-gray-100">
					<div className="flex justify-between items-center">
						<div className="flex-1 min-w-0">
							<h2 className="text-lg md:text-xl font-bold text-gray-900 truncate">
								Reprogrammer le rendez-vous
							</h2>
							<p className="text-gray-600 text-xs md:text-sm truncate">
								avec {agentName}
							</p>
						</div>
					</div>

					{/* Current Appointment Info */}
					<div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
						<p className="text-xs text-blue-800 font-medium mb-1">
							Rendez-vous actuel:
						</p>
						<div className="flex items-center gap-2 text-sm text-blue-900">
							<svg
								className="w-4 h-4"
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
							<span className="font-semibold">
								{new Date(
									appointment.scheduledDate,
								).toLocaleDateString('fr-FR', {
									weekday: 'long',
									year: 'numeric',
									month: 'long',
									day: 'numeric',
								})}
							</span>
							<span>à {appointment.scheduledTime}</span>
						</div>
					</div>
				</div>

				{/* Form Content */}
				<form
					onSubmit={handleSubmit}
					className="flex-1 overflow-y-auto px-4 md:px-6 py-4 md:py-5 space-y-5"
				>
					{/* New Date Selection */}
					<div>
						<label className="block text-sm font-semibold text-gray-800 mb-2.5">
							<div className="flex items-center">
								<svg
									className="w-4 h-4 mr-1.5 text-brand"
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
								Nouvelle date *
							</div>
						</label>
						<input
							type="date"
							required
							min={getMinDate()}
							max={getMaxDate()}
							value={newDate}
							onChange={(e) => {
								setNewDate(e.target.value);
								setNewTime('');
							}}
							className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand focus:border-brand transition-all text-sm md:text-base"
						/>
						<p className="text-xs text-gray-500 mt-1.5">
							Disponible de demain à{' '}
							{formatDateShort(getMaxDate())}
						</p>
					</div>

					{/* New Time Selection */}
					{newDate && (
						<div>
							<label className="block text-sm font-semibold text-gray-800 mb-3">
								<div className="flex items-center">
									<svg
										className="w-4 h-4 mr-1.5 text-brand"
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
									Choisir un nouveau créneau *
								</div>
							</label>
							{loadingSlots ? (
								<div className="text-center py-12">
									<LoadingSpinner
										size="lg"
										message="Chargement des créneaux..."
									/>
								</div>
							) : availableSlots.length === 0 ? (
								<div className="text-center py-8 bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl border-2 border-dashed border-gray-300">
									<div className="text-5xl md:text-6xl mb-4">
										📅
									</div>
									<p className="text-base md:text-lg text-gray-800 font-semibold mb-2">
										Aucun créneau disponible
									</p>
									<p className="text-xs md:text-sm text-gray-600 px-4 max-w-md mx-auto">
										Veuillez choisir une autre date
									</p>
								</div>
							) : (
								<div>
									<div className="grid grid-cols-3 gap-2 md:gap-2.5 max-h-56 overflow-y-auto p-1 bg-gray-50 rounded-xl">
										{availableSlots.map((slot) => (
											<button
												key={slot}
												type="button"
												onClick={() => setNewTime(slot)}
												className={`relative p-3 md:p-3.5 rounded-lg border-2 transition-all duration-200 text-center font-semibold ${
													newTime === slot
														? 'border-brand bg-brand text-white shadow-lg scale-105'
														: 'border-gray-200 bg-white hover:border-brand/50 hover:bg-brand-50 text-gray-700'
												}`}
											>
												<div className="text-sm md:text-base">
													{slot}
												</div>
												{newTime === slot && (
													<div className="absolute -top-1 -right-1 bg-white text-brand rounded-full p-0.5 shadow">
														<svg
															className="w-3 h-3"
															fill="currentColor"
															viewBox="0 0 20 20"
														>
															<path
																fillRule="evenodd"
																d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
																clipRule="evenodd"
															/>
														</svg>
													</div>
												)}
											</button>
										))}
									</div>
									<p className="text-xs text-gray-500 mt-2.5 flex items-center">
										<svg
											className="w-3.5 h-3.5 mr-1"
											fill="currentColor"
											viewBox="0 0 20 20"
										>
											<path
												fillRule="evenodd"
												d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
												clipRule="evenodd"
											/>
										</svg>
										{availableSlots.length} créneau
										{availableSlots.length > 1
											? 'x'
											: ''}{' '}
										disponible
										{availableSlots.length > 1 ? 's' : ''}
									</p>
								</div>
							)}
						</div>
					)}
				</form>

				{/* Footer Actions */}
				<div className="px-4 md:px-6 py-4 bg-gray-50 rounded-b-2xl border-t flex-shrink-0">
					<div className="flex space-x-3">
						<Button
							type="button"
							onClick={onClose}
							variant="outline"
							className="flex-1"
							disabled={loading}
						>
							Annuler
						</Button>
						<Button
							type="submit"
							onClick={handleSubmit}
							loading={loading}
							disabled={!newDate || !newTime}
							className="flex-1 bg-brand hover:bg-brand-dark text-white font-semibold"
						>
							✓ Confirmer la reprogrammation
						</Button>
					</div>
				</div>
			</div>
		</Modal>
	);
};
