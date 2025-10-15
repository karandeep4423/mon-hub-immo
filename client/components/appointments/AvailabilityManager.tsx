'use client';

import React, { useEffect, useState } from 'react';
import { appointmentApi } from '@/lib/api/appointmentApi';
import { AgentAvailability } from '@/types/appointment';
import { LoadingSpinner } from '../ui/LoadingSpinner';
import { Button } from '../ui/Button';
import { useNotification } from '@/hooks/useNotification';
import { useAuth } from '@/hooks/useAuth';

const DAYS_OF_WEEK = [
	{ value: 1, label: 'Lundi' },
	{ value: 2, label: 'Mardi' },
	{ value: 3, label: 'Mercredi' },
	{ value: 4, label: 'Jeudi' },
	{ value: 5, label: 'Vendredi' },
	{ value: 6, label: 'Samedi' },
	{ value: 0, label: 'Dimanche' },
];

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
	const { showNotification } = useNotification();
	const { user } = useAuth();

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

	const handleSave = async () => {
		if (!availability) return;

		try {
			setSaving(true);
			await appointmentApi.updateAgentAvailability(availability);
			showNotification(
				'Disponibilités mises à jour avec succès',
				'success',
			);
		} catch (error) {
			console.error('Error saving availability:', error);
			showNotification('Erreur lors de la sauvegarde', 'error');
		} finally {
			setSaving(false);
		}
	};

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
	};

	const updateDaySlot = (
		dayOfWeek: number,
		slotIndex: number,
		field: 'startTime' | 'endTime',
		value: string,
	) => {
		if (!availability) return;

		setAvailability({
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
		});
	};

	const addSlotToDay = (dayOfWeek: number) => {
		if (!availability) return;

		setAvailability({
			...availability,
			weeklySchedule: availability.weeklySchedule.map((day) =>
				day.dayOfWeek === dayOfWeek
					? {
							...day,
							slots: [
								...day.slots,
								{ startTime: '09:00', endTime: '12:00' },
							],
						}
					: day,
			),
		});
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
	};

	const addBlockedDate = () => {
		if (!availability || !newBlockedDate) return;

		// Check if date already exists
		const exists = availability.dateOverrides.some(
			(override) => override.date === newBlockedDate,
		);

		if (exists) {
			showNotification('Cette date est déjà bloquée', 'error');
			return;
		}

		setAvailability({
			...availability,
			dateOverrides: [
				...availability.dateOverrides,
				{
					date: newBlockedDate,
					isAvailable: false,
					slots: [],
				},
			].sort((a, b) => a.date.localeCompare(b.date)),
		});

		setNewBlockedDate('');
	};

	const removeBlockedDate = (date: string) => {
		if (!availability) return;

		setAvailability({
			...availability,
			dateOverrides: availability.dateOverrides.filter(
				(override) => override.date !== date,
			),
		});
	};

	const updateSettings = (field: keyof AgentAvailability, value: number) => {
		if (!availability) return;

		setAvailability({
			...availability,
			[field]: value,
		});
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
				<Button
					onClick={handleSave}
					disabled={saving}
					className="bg-cyan-600 hover:bg-cyan-700 text-white"
				>
					{saving ? (
						<>
							<LoadingSpinner size="sm" />
							<span className="ml-2">Enregistrement...</span>
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
									d="M5 13l4 4L19 7"
								/>
							</svg>
							Enregistrer
						</>
					)}
				</Button>
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
											<div className="space-y-2 ml-14">
												{daySchedule.slots.map(
													(slot, slotIndex) => (
														<div
															key={slotIndex}
															className="flex items-center gap-3"
														>
															<input
																type="time"
																value={
																	slot.startTime
																}
																onChange={(e) =>
																	updateDaySlot(
																		day.value,
																		slotIndex,
																		'startTime',
																		e.target
																			.value,
																	)
																}
																className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
															/>
															<span className="text-gray-500">
																à
															</span>
															<input
																type="time"
																value={
																	slot.endTime
																}
																onChange={(e) =>
																	updateDaySlot(
																		day.value,
																		slotIndex,
																		'endTime',
																		e.target
																			.value,
																	)
																}
																className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
															/>

															{daySchedule.slots
																.length > 1 && (
																<button
																	onClick={() =>
																		removeSlotFromDay(
																			day.value,
																			slotIndex,
																		)
																	}
																	className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
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
							{/* Add blocked date */}
							<div className="flex gap-3">
								<input
									type="date"
									value={newBlockedDate}
									onChange={(e) =>
										setNewBlockedDate(e.target.value)
									}
									min={new Date().toISOString().split('T')[0]}
									className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
								/>
								<Button
									onClick={addBlockedDate}
									disabled={!newBlockedDate}
									className="bg-cyan-600 hover:bg-cyan-700 text-white"
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
											d="M12 6v6m0 0v6m0-6h6m-6 0H6"
										/>
									</svg>
									Bloquer cette date
								</Button>
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
														removeBlockedDate(
															override.date,
														)
													}
													className="text-red-600 hover:bg-red-100 px-3 py-1 rounded-lg transition-colors text-sm font-medium"
												>
													Débloquer
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
						<p className="font-medium mb-1">Comment ça marche ?</p>
						<ul className="space-y-1 list-disc list-inside">
							<li>
								Configurez vos horaires hebdomadaires pour
								chaque jour
							</li>
							<li>
								Ajoutez plusieurs créneaux par jour si besoin
								(matin/après-midi)
							</li>
							<li>
								Bloquez des dates spécifiques pour vos congés
							</li>
							<li>
								Les créneaux disponibles seront calculés
								automatiquement en fonction de la durée et du
								temps de pause
							</li>
						</ul>
					</div>
				</div>
			</div>
		</div>
	);
};
