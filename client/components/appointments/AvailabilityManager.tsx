'use client';

import React, { useEffect, useState } from 'react';
import { AgentAvailability } from '@/types/appointment';
import { PageLoader } from '../ui/LoadingSpinner';
import { useAuth } from '@/hooks/useAuth';
import { ConfirmDialog } from '../ui/ConfirmDialog';
import { logger } from '@/lib/utils/logger';
import { DAYS_OF_WEEK } from '@/lib/constants';
import {
	AutoSaveIndicator,
	GeneralSettings,
	WeeklyScheduleTab,
	BlockedDatesTab,
	InfoBox,
} from './availability-manager';
import {
	useAgentAvailability,
	useAppointmentMutations,
} from '@/hooks/useAppointments';

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
	const [saving, setSaving] = useState(false);
	const [activeTab, setActiveTab] = useState<'weekly' | 'blocked'>('weekly');
	const [newBlockedDate, setNewBlockedDate] = useState('');
	const [newBlockedDateEnd, setNewBlockedDateEnd] = useState('');
	const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
	const [autoSaveTimer, setAutoSaveTimer] = useState<NodeJS.Timeout | null>(
		null,
	);
	const [dateToUnblock, setDateToUnblock] = useState<string | null>(null);
	const { user } = useAuth();

	// Use SWR to fetch availability
	const {
		data: fetchedAvailability,
		isLoading: loading,
		error,
	} = useAgentAvailability(user?._id || '');

	// Get mutation function
	const { updateAgentAvailability } = useAppointmentMutations(user?._id);

	// Initialize default availability if 404 error
	useEffect(() => {
		if (
			error &&
			(error as { status?: number })?.status === 404 &&
			!availability
		) {
			setAvailability({
				agentId: user!._id,
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
		} else if (error) {
			logger.error('Error fetching availability:', error);
		}
	}, [error, availability, user]);

	// Update local state when data is fetched
	useEffect(() => {
		if (fetchedAvailability && !availability) {
			setAvailability(fetchedAvailability);
		}
	}, [fetchedAvailability, availability]);

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
				await updateAgentAvailability(availability);
				setHasUnsavedChanges(false);
			} catch (error) {
				logger.error('Error auto-saving availability:', error);
			} finally {
				setSaving(false);
			}
		}, 2000); // 2 seconds delay

		setAutoSaveTimer(timer);
	}, [availability, autoSaveTimer, updateAgentAvailability]);

	// Cleanup timer on unmount
	useEffect(() => {
		return () => {
			if (autoSaveTimer) {
				clearTimeout(autoSaveTimer);
			}
		};
	}, [autoSaveTimer]);

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
				return;
			}

			// Validate for overlaps
			if (hasOverlappingSlots(targetDay.slots)) {
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
				setSaving(false);
				return;
			} // Add all dates to overrides
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
			await updateAgentAvailability(updatedAvailability);

			setAvailability(updatedAvailability);
			setNewBlockedDate('');
			setNewBlockedDateEnd('');
		} catch (error) {
			logger.error('Error blocking date:', error);
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
			await updateAgentAvailability(updatedAvailability);

			setAvailability(updatedAvailability);
		} catch (error) {
			logger.error('Error removing blocked date:', error);
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
		return <PageLoader message="Chargement des disponibilités..." />;
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
				<AutoSaveIndicator
					saving={saving}
					hasUnsavedChanges={hasUnsavedChanges}
				/>
			</div>

			<GeneralSettings
				defaultDuration={availability.defaultDuration}
				bufferTime={availability.bufferTime}
				maxAppointmentsPerDay={availability.maxAppointmentsPerDay || 8}
				advanceBookingDays={availability.advanceBookingDays || 30}
				onSettingChange={updateSettings}
			/>

			{/* Tabs */}
			<div className="bg-white rounded-lg shadow">
				<div className="border-b border-gray-200">
					<div className="flex">
						<button
							onClick={() => setActiveTab('weekly')}
							className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
								activeTab === 'weekly'
									? 'border-brand text-brand'
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
									? 'border-brand text-brand'
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
						<WeeklyScheduleTab
							weeklySchedule={availability.weeklySchedule}
							onToggleDayAvailability={toggleDayAvailability}
							onAddSlotToDay={addSlotToDay}
							onUpdateDaySlot={updateDaySlot}
							onRemoveSlotFromDay={removeSlotFromDay}
						/>
					) : (
						<BlockedDatesTab
							dateOverrides={availability.dateOverrides}
							newBlockedDate={newBlockedDate}
							newBlockedDateEnd={newBlockedDateEnd}
							saving={saving}
							onNewBlockedDateChange={setNewBlockedDate}
							onNewBlockedDateEndChange={setNewBlockedDateEnd}
							onAddBlockedDate={addBlockedDate}
							onRequestUnblock={setDateToUnblock}
						/>
					)}
				</div>
			</div>

			<InfoBox />

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
