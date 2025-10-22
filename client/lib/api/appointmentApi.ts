import { api } from '../api';
import { handleApiError } from '../utils/errorHandler';
import type {
	Appointment,
	CreateAppointmentData,
	AppointmentStats,
	AgentAvailability,
	AvailableSlots,
} from '@/types/appointment';

/**
 * Appointment API Service
 * Handles appointment creation, management, and availability
 */
export class AppointmentApi {
	/**
	 * Create a new appointment
	 */
	static async createAppointment(
		data: CreateAppointmentData,
	): Promise<Appointment> {
		try {
			const response = await api.post('/appointments', data);
			return response.data.data;
		} catch (error) {
			throw handleApiError(
				error,
				'AppointmentApi.createAppointment',
				'Erreur lors de la création du rendez-vous',
			);
		}
	}

	/**
	 * Get user's appointments with optional filters
	 */
	static async getMyAppointments(params?: {
		status?: string;
		startDate?: string;
		endDate?: string;
	}): Promise<Appointment[]> {
		try {
			const response = await api.get('/appointments/my', { params });
			return response.data.data;
		} catch (error) {
			throw handleApiError(
				error,
				'AppointmentApi.getMyAppointments',
				'Erreur lors de la récupération des rendez-vous',
			);
		}
	}

	/**
	 * Get single appointment by ID
	 */
	static async getAppointment(id: string): Promise<Appointment> {
		try {
			const response = await api.get(`/appointments/${id}`);
			return response.data.data;
		} catch (error) {
			throw handleApiError(
				error,
				'AppointmentApi.getAppointment',
				'Erreur lors de la récupération du rendez-vous',
			);
		}
	}

	/**
	 * Update appointment status
	 */
	static async updateAppointmentStatus(
		id: string,
		data: {
			status: 'confirmed' | 'completed' | 'cancelled' | 'rejected';
			agentNotes?: string;
			cancellationReason?: string;
		},
	): Promise<Appointment> {
		try {
			const response = await api.patch(
				`/appointments/${id}/status`,
				data,
			);
			return response.data.data;
		} catch (error) {
			throw handleApiError(
				error,
				'AppointmentApi.updateAppointmentStatus',
				'Erreur lors de la mise à jour du rendez-vous',
			);
		}
	}

	/**
	 * Reschedule appointment to new date/time
	 */
	static async rescheduleAppointment(
		id: string,
		data: {
			scheduledDate: string;
			scheduledTime: string;
		},
	): Promise<Appointment> {
		try {
			const response = await api.patch(
				`/appointments/${id}/reschedule`,
				data,
			);
			return response.data.data;
		} catch (error) {
			throw handleApiError(
				error,
				'AppointmentApi.rescheduleAppointment',
				'Erreur lors de la reprogrammation du rendez-vous',
			);
		}
	}

	/**
	 * Get appointment statistics for current user
	 */
	static async getAppointmentStats(): Promise<AppointmentStats> {
		try {
			const response = await api.get('/appointments/my/stats');
			return response.data.data;
		} catch (error) {
			throw handleApiError(
				error,
				'AppointmentApi.getAppointmentStats',
				'Erreur lors de la récupération des statistiques',
			);
		}
	}

	/**
	 * Get agent availability settings
	 */
	static async getAgentAvailability(
		agentId: string,
	): Promise<AgentAvailability> {
		try {
			const response = await api.get(
				`/appointments/availability/${agentId}`,
			);
			return response.data.data;
		} catch (error) {
			throw handleApiError(
				error,
				'AppointmentApi.getAgentAvailability',
				'Erreur lors de la récupération des disponibilités',
			);
		}
	}

	/**
	 * Update agent availability settings
	 */
	static async updateAgentAvailability(
		data: Partial<AgentAvailability>,
	): Promise<AgentAvailability> {
		try {
			const response = await api.patch(
				'/appointments/availability',
				data,
			);
			return response.data.data;
		} catch (error) {
			throw handleApiError(
				error,
				'AppointmentApi.updateAgentAvailability',
				'Erreur lors de la mise à jour des disponibilités',
			);
		}
	}

	/**
	 * Get available time slots for agent on specific date
	 */
	static async getAvailableSlots(
		agentId: string,
		date: string,
	): Promise<AvailableSlots> {
		try {
			const response = await api.get(
				`/appointments/availability/${agentId}/slots`,
				{
					params: { date },
				},
			);
			return response.data.data;
		} catch (error) {
			throw handleApiError(
				error,
				'AppointmentApi.getAvailableSlots',
				'Erreur lors de la récupération des créneaux disponibles',
			);
		}
	}
}

// Backward compatibility
export const appointmentApi = {
	createAppointment: AppointmentApi.createAppointment.bind(AppointmentApi),
	getMyAppointments: AppointmentApi.getMyAppointments.bind(AppointmentApi),
	getAppointment: AppointmentApi.getAppointment.bind(AppointmentApi),
	updateAppointmentStatus:
		AppointmentApi.updateAppointmentStatus.bind(AppointmentApi),
	rescheduleAppointment:
		AppointmentApi.rescheduleAppointment.bind(AppointmentApi),
	getAppointmentStats:
		AppointmentApi.getAppointmentStats.bind(AppointmentApi),
	getAgentAvailability:
		AppointmentApi.getAgentAvailability.bind(AppointmentApi),
	updateAgentAvailability:
		AppointmentApi.updateAgentAvailability.bind(AppointmentApi),
	getAvailableSlots: AppointmentApi.getAvailableSlots.bind(AppointmentApi),
};
