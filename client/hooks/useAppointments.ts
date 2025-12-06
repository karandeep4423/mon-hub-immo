/**
 * useAppointments - Complete SWR implementation for appointments
 *
 * Handles all appointment-related data fetching and mutations with automatic cache invalidation.
 * Ensures instant UI updates across all components after any CRUD operation.
 */

import useSWR from 'swr';
import { useSWRConfig } from 'swr';
import { appointmentApi } from '@/lib/api/appointmentApi';
import { swrKeys } from '@/lib/swrKeys';
import { toast } from 'react-toastify';
import { handleApiError } from '@/lib/utils/errorHandler';
import { logger } from '@/lib/utils/logger';
import { Features } from '@/lib/constants';
import { useAuthStore } from '@/store/authStore';
import { canAccessProtectedResources } from '@/lib/utils/authUtils';
import type {
	CreateAppointmentData,
	AgentAvailability,
} from '@/types/appointment';

// ============ QUERIES ============

/**
 * Fetch all appointments for current user
 * Used in: AppointmentsManager, Dashboard
 */
export function useAppointments(
	userId?: string,
	options: { enabled?: boolean } = { enabled: true },
) {
	// Check if user can access protected resources
	const user = useAuthStore((state) => state.user);
	const canAccess = canAccessProtectedResources(user);

	return useSWR(
		options.enabled && canAccess
			? swrKeys.appointments.myAppointments(userId)
			: null,
		() => appointmentApi.getMyAppointments(),
		{
			revalidateOnFocus: true, // Refetch on tab focus for appointments
			dedupingInterval: 2000,
		},
	);
}

/**
 * Fetch single appointment by ID
 * Used in: Appointment detail views, modals
 */
export function useAppointment(id: string, userId?: string) {
	return useSWR(
		id && userId ? swrKeys.appointments.detail(id) : null,
		() => appointmentApi.getAppointment(id),
		{
			revalidateOnFocus: false,
		},
	);
}

/**
 * Fetch appointment statistics
 * Used in: Dashboard stats
 */
export function useAppointmentStats(userId?: string) {
	return useSWR(
		userId ? swrKeys.appointments.myAppointments(userId) : null,
		async () => {
			const appointments = await appointmentApi.getMyAppointments();
			const stats = await appointmentApi.getAppointmentStats();
			return { appointments, stats };
		},
		{
			revalidateOnFocus: false,
			dedupingInterval: 5000,
		},
	);
}

/**
 * Fetch agent availability
 * Used in: Booking modal, availability manager
 */
export function useAgentAvailability(agentId: string) {
	return useSWR(
		agentId ? swrKeys.appointments.availability(agentId) : null,
		() => appointmentApi.getAgentAvailability(agentId),
		{
			revalidateOnFocus: false,
		},
	);
}

/**
 * Fetch available time slots for booking
 * Used in: Booking modal
 */
export function useAvailableSlots(agentId: string, date?: string) {
	return useSWR(
		agentId && date ? ['appointments', 'slots', agentId, date] : null,
		() => appointmentApi.getAvailableSlots(agentId, date!),
		{
			revalidateOnFocus: false,
			dedupingInterval: 1000,
		},
	);
}

// ============ MUTATIONS ============

/**
 * Hook for all appointment mutations
 * Provides functions for create, update, cancel, reschedule with auto cache invalidation
 */
export function useAppointmentMutations(userId?: string) {
	const { mutate } = useSWRConfig();

	/**
	 * Invalidate all appointment-related caches
	 * Call this after any appointment CRUD operation
	 */
	const invalidateAppointmentCaches = () => {
		// Invalidate appointment lists
		mutate((key) => Array.isArray(key) && key[0] === 'appointments');

		// Invalidate dashboard stats (appointments affect stats)
		mutate((key) => Array.isArray(key) && key[0] === 'dashboard');

		logger.debug('[useAppointments] Caches invalidated');
	};

	/**
	 * Create new appointment
	 */
	const createAppointment = async (data: CreateAppointmentData) => {
		try {
			const result = await appointmentApi.createAppointment(data);

			toast.success(
				Features.Appointments.APPOINTMENT_TOAST_MESSAGES.CREATE_SUCCESS,
			);

			// Invalidate all appointment caches
			invalidateAppointmentCaches();

			// Invalidate agent availability
			mutate(swrKeys.appointments.availability(data.agentId));

			return { success: true, data: result };
		} catch (error) {
			const apiError = handleApiError(
				error,
				'createAppointment',
				'Erreur lors de la création du rendez-vous',
			);
			logger.error('[useAppointments] Create failed:', apiError);
			toast.error(apiError.message);
			return { success: false, error: apiError };
		}
	};

	/**
	 * Update appointment status (confirm, cancel, complete)
	 */
	const updateAppointmentStatus = async (
		id: string,
		status: 'confirmed' | 'cancelled' | 'completed' | 'rejected',
		options?: {
			agentNotes?: string;
			cancellationReason?: string;
		},
	) => {
		try {
			const result = await appointmentApi.updateAppointmentStatus(id, {
				status,
				...options,
			});

			const statusMessages = {
				confirmed: 'Rendez-vous confirmé',
				cancelled: 'Rendez-vous annulé',
				completed: 'Rendez-vous terminé',
				rejected: 'Rendez-vous refusé',
			};

			toast.success(statusMessages[status]);

			// Invalidate all appointment caches
			invalidateAppointmentCaches();

			// Invalidate specific appointment
			mutate(swrKeys.appointments.detail(id));

			return { success: true, data: result };
		} catch (error) {
			const apiError = handleApiError(
				error,
				'updateAppointmentStatus',
				'Erreur lors de la mise à jour du rendez-vous',
			);
			logger.error('[useAppointments] Status update failed:', apiError);
			toast.error(apiError.message);
			return { success: false, error: apiError };
		}
	};

	/**
	 * Reschedule appointment to new date/time
	 */
	const rescheduleAppointment = async (
		id: string,
		data: {
			scheduledDate: string;
			scheduledTime: string;
			rescheduleReason?: string;
		},
	) => {
		try {
			const result = await appointmentApi.rescheduleAppointment(id, data);

			toast.success(
				Features.Appointments.APPOINTMENT_TOAST_MESSAGES
					.RESCHEDULE_SUCCESS,
			);

			// Invalidate all appointment caches
			invalidateAppointmentCaches();

			// Invalidate specific appointment
			mutate(swrKeys.appointments.detail(id));

			return { success: true, data: result };
		} catch (error) {
			const apiError = handleApiError(
				error,
				'rescheduleAppointment',
				'Erreur lors de la reprogrammation',
			);
			logger.error('[useAppointments] Reschedule failed:', apiError);
			toast.error(apiError.message);
			return { success: false, error: apiError };
		}
	};

	/**
	 * Update agent availability settings
	 */
	const updateAgentAvailability = async (
		data: Partial<AgentAvailability>,
	) => {
		try {
			const result = await appointmentApi.updateAgentAvailability(data);

			toast.success(
				Features.Appointments.AVAILABILITY_TOAST_MESSAGES
					.UPDATE_SUCCESS,
			);

			// Invalidate availability cache
			if (userId) {
				mutate(swrKeys.appointments.availability(userId));
			}

			// Invalidate all slots caches (availability affects slots)
			mutate(
				(key) =>
					Array.isArray(key) &&
					key[0] === 'appointments' &&
					key[1] === 'slots',
			);

			return { success: true, data: result };
		} catch (error) {
			const apiError = handleApiError(
				error,
				'updateAgentAvailability',
				'Erreur lors de la mise à jour des disponibilités',
			);
			logger.error(
				'[useAppointments] Availability update failed:',
				apiError,
			);
			toast.error(apiError.message);
			return { success: false, error: apiError };
		}
	};

	return {
		createAppointment,
		updateAppointmentStatus,
		rescheduleAppointment,
		updateAgentAvailability,
		invalidateAppointmentCaches,
	};
}

// ============ UTILITY HOOKS ============

/**
 * Filter appointments by status
 * Client-side filtering for better performance
 */
export function useFilteredAppointments(
	userId?: string,
	filters?: {
		status?: 'pending' | 'confirmed' | 'cancelled' | 'completed';
		dateRange?: { start: Date; end: Date };
	},
) {
	const { data: appointments, isLoading, error } = useAppointments(userId);

	const filtered = appointments?.filter((apt) => {
		// Status filter
		if (filters?.status && apt.status !== filters.status) {
			return false;
		}

		// Date range filter
		if (filters?.dateRange) {
			const aptDate = new Date(apt.scheduledDate);
			if (
				aptDate < filters.dateRange.start ||
				aptDate > filters.dateRange.end
			) {
				return false;
			}
		}

		return true;
	});

	return {
		appointments: filtered,
		isLoading,
		error,
	};
}

/**
 * Get appointment counts by status
 * Used for dashboard KPIs
 */
export function useAppointmentCounts(userId?: string) {
	const { data: appointments, isLoading } = useAppointments(userId);

	const counts = {
		total: appointments?.length || 0,
		pending:
			appointments?.filter((a) => a.status === 'pending').length || 0,
		confirmed:
			appointments?.filter((a) => a.status === 'confirmed').length || 0,
		cancelled:
			appointments?.filter((a) => a.status === 'cancelled').length || 0,
		completed:
			appointments?.filter((a) => a.status === 'completed').length || 0,
	};

	return {
		counts,
		isLoading,
	};
}
