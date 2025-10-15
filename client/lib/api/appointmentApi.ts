import { api } from '../api';
import type {
	Appointment,
	CreateAppointmentData,
	AppointmentStats,
	AgentAvailability,
	AvailableSlots,
} from '@/types/appointment';

export const appointmentApi = {
	// Create a new appointment
	async createAppointment(data: CreateAppointmentData): Promise<Appointment> {
		const response = await api.post('/appointments', data);
		return response.data.data;
	},

	// Get user's appointments
	async getMyAppointments(params?: {
		status?: string;
		startDate?: string;
		endDate?: string;
	}): Promise<Appointment[]> {
		const response = await api.get('/appointments/my', { params });
		return response.data.data;
	},

	// Get single appointment
	async getAppointment(id: string): Promise<Appointment> {
		const response = await api.get(`/appointments/${id}`);
		return response.data.data;
	},

	// Update appointment status
	async updateAppointmentStatus(
		id: string,
		data: {
			status: 'confirmed' | 'completed' | 'cancelled' | 'rejected';
			agentNotes?: string;
			cancellationReason?: string;
		},
	): Promise<Appointment> {
		const response = await api.patch(`/appointments/${id}/status`, data);
		return response.data.data;
	},

	// Reschedule appointment
	async rescheduleAppointment(
		id: string,
		data: {
			scheduledDate: string;
			scheduledTime: string;
		},
	): Promise<Appointment> {
		const response = await api.patch(
			`/appointments/${id}/reschedule`,
			data,
		);
		return response.data.data;
	},

	// Get appointment statistics
	async getAppointmentStats(): Promise<AppointmentStats> {
		const response = await api.get('/appointments/my/stats');
		return response.data.data;
	},

	// Get agent availability
	async getAgentAvailability(agentId: string): Promise<AgentAvailability> {
		const response = await api.get(`/appointments/availability/${agentId}`);
		return response.data.data;
	},

	// Update agent availability
	async updateAgentAvailability(
		data: Partial<AgentAvailability>,
	): Promise<AgentAvailability> {
		const response = await api.patch('/appointments/availability', data);
		return response.data.data;
	},

	// Get available time slots for a specific date
	async getAvailableSlots(
		agentId: string,
		date: string,
	): Promise<AvailableSlots> {
		const response = await api.get(
			`/appointments/availability/${agentId}/slots`,
			{
				params: { date },
			},
		);
		return response.data.data;
	},
};
