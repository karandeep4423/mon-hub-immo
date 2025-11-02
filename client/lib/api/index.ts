/**
 * API Services Barrel Export
 * Centralized exports for all API service classes
 */

export { AuthApi, authService } from './authApi';
export { AgentService, agentService, type Agent } from './agentApi';
export { SearchAdApi } from './searchAdApi';
export {
	PropertyService,
	type Property,
	type PropertyFormData,
} from './propertyApi';
export { AppointmentApi, appointmentApi } from './appointmentApi';
export { CollaborationApi, collaborationApi } from './collaborationApi';
export { ContractApi, contractApi } from './contractApi';
export { ChatApi } from './chatApi';
export { ContactApi } from './contactApi';
export { FavoritesService } from './favoritesApi';
export type {
	Appointment,
	CreateAppointmentData,
	AppointmentStats,
} from '@/types/appointment';
export type { Collaboration } from '@/types/collaboration';
export type { ContractData, UpdateContractRequest } from './contractApi';
