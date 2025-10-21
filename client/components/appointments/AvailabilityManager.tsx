'use client';

import React, { useEffect, useState } from 'react';
import { appointmentApi } from '@/lib/api/appointmentApi';
import { AgentAvailability } from '@/types/appointment';
import { LoadingSpinner } from '../ui/LoadingSpinner';
import { Button } from '../ui/Button';
import { useNotification } from '@/hooks/useNotification';
import { useAuth } from '@/hooks/useAuth';
import { ConfirmDialog } from '../ui/ConfirmDialog';

const DAYS_OF_WEEK = [
	{ value: 1, label: 'Lundi' },
	{ value: 2, label: 'Mardi' },
	{ value: 3, label: 'Mercredi' },
	{ value: 4, label: 'Jeudi' },
	{ value: 5, label: 'Vendredi' },
	{ value: 6, label: 'Samedi' },
	{ value: 0, label: 'Dimanche' },
];

// Helper function to check if time slots overlap
const hasOverlappingSlots = (
	slots: { startTime: string; endTime: string }[],
): boolean => {
	if (slots.length <= 1) return false;

	// Convert time to minutes for easier comparison
	const toMinutes = (time: string): number => {
		const [hours, mins] = time.split(':').map(Number);
		return hours * 60 + mins;
	};

	// Sort slots by start time
	const sortedSlots = [...slots].sort(
		(a, b) => toMinutes(a.startTime) - toMinutes(b.startTime),
	);

	// Check for overlaps
	for (let i = 0; i < sortedSlots.length - 1; i++) {
		const currentEnd = toMinutes(sortedSlots[i].endTime);
		const nextStart = toMinutes(sortedSlots[i + 1].startTime);

		// If current slot ends after or at the same time as next slot starts, they overlap
		if (currentEnd > nextStart) {
			return true;
		}
	}

	return false;
};

interface AvailabilityManagerProps {
	onBack?: () => void;
}

export const AvailabilityManager: React.FC<AvailabilityManagerProps> = ({
	onBack,
}) => {
	const [availability, setAvailability] = useState<AgentAvailability | null>(
		null,
	);
	const [loading, setLoading] = useState(true);
	const [saving, setSaving] = useState(false);
	const [activeTab, setActiveTab] = useState<'weekly' | 'blocked'>('weekly');
	const [newBlockedDate, setNewBlockedDate] = useState('');
	const [newBlockedDateEnd, setNewBlockedDateEnd] = useState('');
	const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
	const [autoSaveTimer, setAutoSaveTimer] = useState<NodeJS.Timeout | null>(
		null,
	);
	const [dateToUnblock, setDateToUnblock] = useState<string | null>(null);
	const { showNotification } = useNotification();
	const { user } = useAuth();

	// Auto-save with debouncing (2 seconds after last change)
	const scheduleAutoSave = React.useCallback(() => {
		setHasUnsavedChanges(true);

		// Clear existing timer
		if (autoSaveTimer) {
			clearTimeout(autoSaveTimer);
		}

		// Schedule new save
		const timer = setTimeout(async () => {
			if (!availability) return;

			try {
				setSaving(true);
				await appointmentApi.updateAgentAvailability(availability);
				setHasUnsavedChanges(false);
				showNotification(
					'Modifications enregistrées automatiquement',
					'success',
				);
			} catch (error) {
				console.error('Error auto-saving availability:', error);
				showNotification('Erreur lors de la sauvegarde', 'error');
			} finally {
				setSaving(false);
			}
		}, 2000); // 2 seconds delay

		setAutoSaveTimer(timer);
	}, [availability, autoSaveTimer, showNotification]);

	// Cleanup timer on unmount
	useEffect(() => {
		return () => {
			if (autoSaveTimer) {
				clearTimeout(autoSaveTimer);
			}
		};
	}, [autoSaveTimer]);

	const fetchAvailability = React.useCallback(async () => {
		if (!user?._id) return;

		try {
			setLoading(true);
			const data = await appointmentApi.getAgentAvailability(user._id);
			setAvailability(data);
		} catch (error) {
			const responseStatus = (error as { response?: { status?: number } })
				.response?.status;
			if (responseStatus === 404) {
				// Initialize default availability (business hours)
				setAvailability({
					agentId: user._id,
					weeklySchedule: DAYS_OF_WEEK.map((day) => ({
						dayOfWeek: day.value as 0 | 1 | 2 | 3 | 4 | 5 | 6,
						isAvailable: day.value >= 1 && day.value <= 5, // Mon-Fri
						slots:
							day.value >= 1 && day.value <= 5
								? [{ startTime: '09:00', endTime: '18:00' }]
								: [],
					})),
					dateOverrides: [],
					defaultDuration: 60,
					bufferTime: 15,
					maxAppointmentsPerDay: 8,
					advanceBookingDays: 30,
				});
			} else {
				console.error('Error fetching availability:', error);
			}
		} finally {
			setLoading(false);
		}
	}, [user?._id]);

	useEffect(() => {
		fetchAvailability();
	}, [fetchAvailability]);

	// Auto-save when availability changes (triggered by user actions)
	const [shouldAutoSave, setShouldAutoSave] = React.useState(false);

	useEffect(() => {
		if (shouldAutoSave && availability) {
			scheduleAutoSave();
			setShouldAutoSave(false);
		}
	}, [availability, shouldAutoSave, scheduleAutoSave]);

	const toggleDayAvailability = (dayOfWeek: number) => {
		if (!availability) return;

		setAvailability({
			...availability,
			weeklySchedule: availability.weeklySchedule.map((day) =>
				day.dayOfWeek === dayOfWeek
					? {
							...day,
							isAvailable: !day.isAvailable,
							slots: !day.isAvailable
								? [{ startTime: '09:00', endTime: '18:00' }]
								: [],
						}
					: day,
			),
		});
		setShouldAutoSave(true);
	};

	const updateDaySlot = (
		dayOfWeek: number,
		slotIndex: number,
		field: 'startTime' | 'endTime',
		value: string,
	) => {
		if (!availability) return;

		const updatedAvailability = {
			...availability,
			weeklySchedule: availability.weeklySchedule.map((day) =>
				day.dayOfWeek === dayOfWeek
					? {
							...day,
							slots: day.slots.map((slot, idx) =>
								idx === slotIndex
									? { ...slot, [field]: value }
									: slot,
							),
						}
					: day,
			),
		};

		// Validate that start time is before end time
		const targetDay = updatedAvailability.weeklySchedule.find(
			(d) => d.dayOfWeek === dayOfWeek,
		);
		if (targetDay) {
			const updatedSlot = targetDay.slots[slotIndex];
			const toMinutes = (time: string): number => {
				const [hours, mins] = time.split(':').map(Number);
				return hours * 60 + mins;
			};

			if (
				toMinutes(updatedSlot.startTime) >=
				toMinutes(updatedSlot.endTime)
			) {
				showNotification(
					"L'heure de début doit être avant l'heure de fin",
					'error',
				);
				return;
			}

			// Validate for overlaps
			if (hasOverlappingSlots(targetDay.slots)) {
				showNotification(
					'Les créneaux horaires ne peuvent pas se chevaucher',
					'error',
				);
				return;
			}
		}

		setAvailability(updatedAvailability);
		scheduleAutoSave();
	};

	const addSlotToDay = (dayOfWeek: number) => {
		if (!availability) return;

		const updatedAvailability = {
			...availability,
			weeklySchedule: availability.weeklySchedule.map((day) =>
				day.dayOfWeek === dayOfWeek
					? {
							...day,
							slots: [
								...day.slots,
								{ startTime: '14:00', endTime: '17:00' },
							],
						}
					: day,
			),
		};

		// Validate for overlaps
		const targetDay = updatedAvailability.weeklySchedule.find(
			(d) => d.dayOfWeek === dayOfWeek,
		);
		if (targetDay && hasOverlappingSlots(targetDay.slots)) {
			showNotification(
				'Ce créneau chevauche un créneau existant. Veuillez ajuster les horaires.',
				'error',
			);
			return;
		}

		setAvailability(updatedAvailability);
		scheduleAutoSave();
	};

	const removeSlotFromDay = (dayOfWeek: number, slotIndex: number) => {
		if (!availability) return;

		setAvailability({
			...availability,
			weeklySchedule: availability.weeklySchedule.map((day) =>
				day.dayOfWeek === dayOfWeek
					? {
							...day,
							slots: day.slots.filter(
								(_, idx) => idx !== slotIndex,
							),
						}
					: day,
			),
		});
		scheduleAutoSave();
	};

	const addBlockedDate = async () => {
		if (!availability || !newBlockedDate) return;

		try {
			setSaving(true);

			// Generate date range if end date is provided
			const dates: string[] = [];
			const startDate = new Date(newBlockedDate);
			const endDate = newBlockedDateEnd
				? new Date(newBlockedDateEnd)
				: startDate;

			// Validate date range
			if (endDate < startDate) {
				showNotification(
					'La date de fin doit être après la date de début',
					'error',
				);
				setSaving(false);
				return;
			}

			// Generate all dates in range
			const currentDate = new Date(startDate);
			while (currentDate <= endDate) {
				dates.push(currentDate.toISOString().split('T')[0]);
				currentDate.setDate(currentDate.getDate() + 1);
			}

			// Check for existing dates
			const existingDates = dates.filter((date) =>
				availability.dateOverrides.some(
					(override) => override.date === date,
				),
			);

			if (existingDates.length > 0) {
				showNotification(
					`${existingDates.length} date(s) déjà bloquée(s)`,
					'error',
				);
				setSaving(false);
				return;
			}

			// Add all dates to overrides
			const newOverrides = dates.map((date) => ({
				date,
				isAvailable: false,
				slots: [],
			}));

			const updatedAvailability = {
				...availability,
				dateOverrides: [
					...availability.dateOverrides,
					...newOverrides,
				].sort((a, b) => a.date.localeCompare(b.date)),
			};

			// Save to backend immediately
			await appointmentApi.updateAgentAvailability(updatedAvailability);

			setAvailability(updatedAvailability);
			setNewBlockedDate('');
			setNewBlockedDateEnd('');

			showNotification(
				`${dates.length} date(s) bloquée(s) avec succès`,
				'success',
			);
		} catch (error) {
			console.error('Error blocking date:', error);
			showNotification('Erreur lors du blocage de la date', 'error');
		} finally {
			setSaving(false);
		}
	};

	const removeBlockedDate = async (date: string) => {
		if (!availability) return;

		try {
			setSaving(true);

			const updatedAvailability = {
				...availability,
				dateOverrides: availability.dateOverrides.filter(
					(override) => override.date !== date,
				),
			};

			// Save to backend immediately
			await appointmentApi.updateAgentAvailability(updatedAvailability);

			setAvailability(updatedAvailability);
			showNotification('Date débloquée avec succès', 'success');
		} catch (error) {
			console.error('Error removing blocked date:', error);
			showNotification('Erreur lors du déblocage de la date', 'error');
		} finally {
			setSaving(false);
			setDateToUnblock(null);
		}
	};

	const handleConfirmUnblock = async () => {
		if (!dateToUnblock) return;
		await removeBlockedDate(dateToUnblock);
	};

	const updateSettings = (field: keyof AgentAvailability, value: number) => {
		if (!availability) return;

		setAvailability({
			...availability,
			[field]: value,
		});
		scheduleAutoSave();
	};

	if (loading) {
		return (
			<div className="flex justify-center items-center py-12">
				<LoadingSpinner size="lg" />
			</div>
		);
	}

	if (!availability) {
		return (
			<div className="text-center py-12">
				<p className="text-gray-500">
					Erreur lors du chargement des disponibilités
				</p>
			</div>
		);
	}

	return (
		<div className="space-y-6">
			{/* Header */}
			<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
				<div className="flex items-center gap-4">
					{onBack && (
						<button
							onClick={onBack}
							className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
							title="Retour aux rendez-vous"
						>
							<svg
								className="w-5 h-5 text-gray-600"
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24"
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth={2}
									d="M15 19l-7-7 7-7"
								/>
							</svg>
						</button>
					)}
					<div>
						<h2 className="text-2xl font-bold text-gray-900">
							Gérer mes disponibilités
						</h2>
						<p className="text-gray-600 mt-1">
							Configurez vos horaires et dates de disponibilité
							pour les rendez-vous
						</p>
					</div>
				</div>
				{/* Auto-save indicator */}
				<div className="flex items-center gap-2">
					{saving ? (
						<div className="flex items-center gap-2 text-cyan-600 text-sm">
							<LoadingSpinner size="sm" />
							<span>Enregistrement...</span>
						</div>
					) : hasUnsavedChanges ? (
						<div className="flex items-center gap-2 text-amber-600 text-sm">
							<svg
								className="w-4 h-4 animate-pulse"
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
							<span>Modification en attente...</span>
						</div>
					) : (
						<div className="flex items-center gap-2 text-green-600 text-sm">
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
									d="M5 13l4 4L19 7"
								/>
							</svg>
							<span>Tout est enregistré</span>
						</div>
					)}
				</div>
			</div>

			{/* General Settings */}
			<div className="bg-white rounded-lg shadow p-6">
				<h3 className="text-lg font-semibold text-gray-900 mb-4">
					Paramètres généraux
				</h3>
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
					<div>
						<label className="block text-sm font-medium text-gray-700 mb-2">
							Durée par défaut (min)
						</label>
						<input
							type="number"
							min="15"
							max="180"
							step="15"
							value={availability.defaultDuration}
							onChange={(e) =>
								updateSettings(
									'defaultDuration',
									parseInt(e.target.value),
								)
							}
							className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
						/>
					</div>

					<div>
						<label className="block text-sm font-medium text-gray-700 mb-2">
							Temps de pause (min)
						</label>
						<input
							type="number"
							min="0"
							max="60"
							step="5"
							value={availability.bufferTime}
							onChange={(e) =>
								updateSettings(
									'bufferTime',
									parseInt(e.target.value),
								)
							}
							className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
						/>
					</div>

					<div>
						<label className="block text-sm font-medium text-gray-700 mb-2">
							Max RDV par jour
						</label>
						<input
							type="number"
							min="1"
							max="20"
							value={availability.maxAppointmentsPerDay || 8}
							onChange={(e) =>
								updateSettings(
									'maxAppointmentsPerDay',
									parseInt(e.target.value),
								)
							}
							className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
						/>
					</div>

					<div>
						<label className="block text-sm font-medium text-gray-700 mb-2">
							Réservation à l&apos;avance (jours)
						</label>
						<input
							type="number"
							min="1"
							max="90"
							value={availability.advanceBookingDays || 30}
							onChange={(e) =>
								updateSettings(
									'advanceBookingDays',
									parseInt(e.target.value),
								)
							}
							className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
						/>
					</div>
				</div>
			</div>

			{/* Tabs */}
			<div className="bg-white rounded-lg shadow">
				<div className="border-b border-gray-200">
					<div className="flex">
						<button
							onClick={() => setActiveTab('weekly')}
							className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
								activeTab === 'weekly'
									? 'border-cyan-500 text-cyan-600'
									: 'border-transparent text-gray-500 hover:text-gray-700'
							}`}
						>
							<svg
								className="w-4 h-4 inline mr-2"
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
							Horaires hebdomadaires
						</button>
						<button
							onClick={() => setActiveTab('blocked')}
							className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
								activeTab === 'blocked'
									? 'border-cyan-500 text-cyan-600'
									: 'border-transparent text-gray-500 hover:text-gray-700'
							}`}
						>
							<svg
								className="w-4 h-4 inline mr-2"
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24"
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth={2}
									d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"
								/>
							</svg>
							Dates bloquées
						</button>
					</div>
				</div>

				<div className="p-6">
					{activeTab === 'weekly' ? (
						<div className="space-y-4">
							{DAYS_OF_WEEK.map((day) => {
								const daySchedule =
									availability.weeklySchedule.find(
										(d) => d.dayOfWeek === day.value,
									);

								return (
									<div
										key={day.value}
										className={`border rounded-lg p-4 ${
											daySchedule?.isAvailable
												? 'border-cyan-200 bg-cyan-50/30'
												: 'border-gray-200 bg-gray-50'
										}`}
									>
										<div className="flex items-center justify-between mb-3">
											<div className="flex items-center gap-3">
												<label className="relative inline-flex items-center cursor-pointer">
													<input
														type="checkbox"
														checked={
															daySchedule?.isAvailable ||
															false
														}
														onChange={() =>
															toggleDayAvailability(
																day.value,
															)
														}
														className="sr-only peer"
													/>
													<div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-cyan-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-cyan-600"></div>
												</label>
												<span className="text-lg font-medium text-gray-900">
													{day.label}
												</span>
											</div>

											{daySchedule?.isAvailable && (
												<Button
													onClick={() =>
														addSlotToDay(day.value)
													}
													variant="outline"
													size="sm"
													className="text-cyan-600 border-cyan-300 hover:bg-cyan-50"
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
															d="M12 6v6m0 0v6m0-6h6m-6 0H6"
														/>
													</svg>
													Ajouter un créneau
												</Button>
											)}
										</div>

										{daySchedule?.isAvailable && (
											<div className="space-y-3 ml-14">
												{daySchedule.slots.map(
													(slot, slotIndex) => (
														<div
															key={slotIndex}
															className="flex items-center gap-3 bg-gradient-to-r from-cyan-50/50 to-blue-50/50 p-3 rounded-lg border border-cyan-100"
														>
															<div className="flex items-center gap-2 flex-1">
																<div className="flex-1">
																	<label className="block text-xs font-medium text-gray-600 mb-1">
																		Début
																	</label>
																	<input
																		type="time"
																		value={
																			slot.startTime
																		}
																		onChange={(
																			e,
																		) =>
																			updateDaySlot(
																				day.value,
																				slotIndex,
																				'startTime',
																				e
																					.target
																					.value,
																			)
																		}
																		className="w-full px-3 py-2.5 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all text-base font-medium text-gray-700"
																		style={{
																			colorScheme:
																				'light',
																		}}
																	/>
																</div>
																<div className="flex items-center justify-center pt-6">
																	<svg
																		className="w-5 h-5 text-cyan-600"
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
																			d="M14 5l7 7m0 0l-7 7m7-7H3"
																		/>
																	</svg>
																</div>
																<div className="flex-1">
																	<label className="block text-xs font-medium text-gray-600 mb-1">
																		Fin
																	</label>
																	<input
																		type="time"
																		value={
																			slot.endTime
																		}
																		onChange={(
																			e,
																		) =>
																			updateDaySlot(
																				day.value,
																				slotIndex,
																				'endTime',
																				e
																					.target
																					.value,
																			)
																		}
																		className="w-full px-3 py-2.5 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all text-base font-medium text-gray-700"
																		style={{
																			colorScheme:
																				'light',
																		}}
																	/>
																</div>
															</div>

															{daySchedule.slots
																.length > 1 && (
																<button
																	onClick={() =>
																		removeSlotFromDay(
																			day.value,
																			slotIndex,
																		)
																	}
																	className="p-2.5 text-red-600 hover:bg-red-100 rounded-lg transition-colors flex-shrink-0"
																	title="Supprimer ce créneau"
																>
																	<svg
																		className="w-5 h-5"
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
																			d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
																		/>
																	</svg>
																</button>
															)}
														</div>
													),
												)}
											</div>
										)}
									</div>
								);
							})}
						</div>
					) : (
						<div className="space-y-6">
							{/* Add blocked date or date range */}
							<div className="bg-gradient-to-r from-cyan-50 to-blue-50 border border-cyan-200 rounded-lg p-4">
								<h4 className="font-semibold text-gray-900 mb-3 flex items-center">
									<svg
										className="w-5 h-5 mr-2 text-cyan-600"
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
									Bloquer une date ou une période
								</h4>
								<div className="space-y-3">
									<div className="grid grid-cols-1 md:grid-cols-2 gap-3">
										<div>
											<label className="block text-xs font-medium text-gray-700 mb-1">
												Date de début *
											</label>
											<input
												type="date"
												value={newBlockedDate}
												onChange={(e) => {
													setNewBlockedDate(
														e.target.value,
													);
													// Reset end date if it's before start date
													if (
														newBlockedDateEnd &&
														e.target.value >
															newBlockedDateEnd
													) {
														setNewBlockedDateEnd(
															'',
														);
													}
												}}
												min={
													new Date()
														.toISOString()
														.split('T')[0]
												}
												className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
											/>
										</div>
										<div>
											<label className="block text-xs font-medium text-gray-700 mb-1">
												Date de fin (optionnel)
											</label>
											<input
												type="date"
												value={newBlockedDateEnd}
												onChange={(e) =>
													setNewBlockedDateEnd(
														e.target.value,
													)
												}
												min={
													newBlockedDate ||
													new Date()
														.toISOString()
														.split('T')[0]
												}
												disabled={!newBlockedDate}
												className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
											/>
										</div>
									</div>
									<p className="text-xs text-gray-600">
										💡 Laissez la date de fin vide pour
										bloquer une seule journée, ou
										remplissez-la pour bloquer une période
										complète.
									</p>
									<Button
										onClick={addBlockedDate}
										disabled={!newBlockedDate || saving}
										className="w-full bg-cyan-600 hover:bg-cyan-700 text-white"
									>
										{saving ? (
											<>
												<LoadingSpinner size="sm" />
												<span className="ml-2">
													Enregistrement...
												</span>
											</>
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
														strokeWidth={2}
														d="M12 6v6m0 0v6m0-6h6m-6 0H6"
													/>
												</svg>
												Bloquer{' '}
												{newBlockedDateEnd
													? 'cette période'
													: 'cette date'}
											</>
										)}
									</Button>
								</div>
							</div>

							{/* List of blocked dates */}
							{availability.dateOverrides.length === 0 ? (
								<div className="text-center py-8 text-gray-500">
									<svg
										className="w-12 h-12 mx-auto mb-3 text-gray-300"
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
									<p>Aucune date bloquée</p>
									<p className="text-sm mt-1">
										Ajoutez des dates pour bloquer les
										réservations (vacances, jours fériés,
										etc.)
									</p>
								</div>
							) : (
								<div className="space-y-2">
									{availability.dateOverrides.map(
										(override) => (
											<div
												key={override.date}
												className="flex items-center justify-between p-4 bg-red-50 border border-red-200 rounded-lg"
											>
												<div className="flex items-center gap-3">
													<svg
														className="w-5 h-5 text-red-600"
														fill="none"
														stroke="currentColor"
														viewBox="0 0 24 24"
													>
														<path
															strokeLinecap="round"
															strokeLinejoin="round"
															strokeWidth={2}
															d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"
														/>
													</svg>
													<span className="font-medium text-gray-900">
														{new Date(
															override.date,
														).toLocaleDateString(
															'fr-FR',
															{
																weekday: 'long',
																day: 'numeric',
																month: 'long',
																year: 'numeric',
															},
														)}
													</span>
												</div>
												<button
													onClick={() =>
														setDateToUnblock(
															override.date,
														)
													}
													disabled={saving}
													className="text-red-600 hover:bg-red-100 px-3 py-1 rounded-lg transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
												>
													{saving
														? '...'
														: 'Débloquer'}
												</button>
											</div>
										),
									)}
								</div>
							)}
						</div>
					)}
				</div>
			</div>

			{/* Info Box */}
			<div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
				<div className="flex items-start gap-3">
					<svg
						className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0"
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
					<div className="text-sm text-blue-800">
						<p className="font-medium mb-1">
							💡 Enregistrement automatique activé
						</p>
						<ul className="space-y-1 list-disc list-inside">
							<li>
								Toutes vos modifications sont sauvegardées
								automatiquement après 2 secondes
							</li>
							<li>
								Ajoutez plusieurs créneaux par jour si besoin
								(matin/après-midi)
							</li>
							<li>
								Bloquez des dates spécifiques - une seule date
								ou une période complète
							</li>
							<li>
								Les créneaux disponibles sont calculés selon la
								durée et le temps de pause
							</li>
						</ul>
					</div>
				</div>
			</div>

			{/* Confirmation Dialog for Unblocking */}
			<ConfirmDialog
				isOpen={!!dateToUnblock}
				title="Débloquer cette date"
				description={
					dateToUnblock
						? `Êtes-vous sûr de vouloir débloquer la date du ${new Date(
								dateToUnblock,
							).toLocaleDateString('fr-FR', {
								weekday: 'long',
								day: 'numeric',
								month: 'long',
								year: 'numeric',
							})} ? Cette date redeviendra disponible pour les rendez-vous.`
						: ''
				}
				onConfirm={handleConfirmUnblock}
				onCancel={() => setDateToUnblock(null)}
				variant="warning"
			/>
		</div>
	);
};
