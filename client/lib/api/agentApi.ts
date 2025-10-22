import { api } from '../api';
import { handleApiError } from '../utils/errorHandler';

/**
 * Agent interface matching backend User model for agent type
 * Represents a real estate agent in the system
 *
 * @interface Agent
 * @property {string} _id - Unique identifier
 * @property {string} firstName - Agent's first name
 * @property {string} lastName - Agent's last name
 * @property {string} email - Agent's email address
 * @property {string} [phone] - Agent's phone number
 * @property {string} [profileImage] - URL to agent's profile image
 * @property {'agent'} userType - User type identifier
 * @property {object} [professionalInfo] - Professional details
 */
export interface Agent {
	_id: string;
	firstName: string;
	lastName: string;
	email: string;
	phone?: string;
	profileImage?: string;
	userType: 'agent';
	professionalInfo?: {
		postalCode?: string;
		city?: string;
		interventionRadius?: number;
		network?: string;
		siretNumber?: string;
		yearsExperience?: number;
		personalPitch?: string;
		certifications?: string[];
		languages?: string[];
		specialties?: string[];
	};
	profileCompleted?: boolean;
	isVerified?: boolean;
	createdAt?: string;
	updatedAt?: string;
}

/**
 * Filters for searching agents
 *
 * @interface AgentFilters
 * @property {string} [city] - Filter by city name
 * @property {string} [postalCode] - Filter by postal code
 * @property {number} [radius] - Search radius in kilometers
 * @property {string[]} [specialties] - Filter by agent specialties
 * @property {number} [minExperience] - Minimum years of experience
 */
export interface AgentFilters {
	city?: string;
	postalCode?: string;
	radius?: number;
	specialties?: string[];
	minExperience?: number;
}

/**
 * API response structure for agent queries
 *
 * @interface AgentsResponse
 * @property {boolean} success - Indicates if the request was successful
 * @property {Agent[]} data - Array of agent objects
 * @property {number} [total] - Total count of agents matching the query
 * @property {string} [message] - Optional response message
 */
export interface AgentsResponse {
	success: boolean;
	data: Agent[];
	total?: number;
	message?: string;
}

/**
 * Agent API Service
 * Centralized API operations for agent-related endpoints
 *
 * @class AgentService
 * @description Provides methods for fetching and managing real estate agent data
 * @example
 * ```typescript
 * // Get all agents
 * const agents = await AgentService.getAllAgents();
 *
 * // Get agents with filters
 * const filteredAgents = await AgentService.getAllAgents({
 *   city: 'Paris',
 *   minExperience: 5
 * });
 *
 * // Get specific agent
 * const agent = await AgentService.getAgentById('agent-id-123');
 * ```
 */
export class AgentService {
	/**
	 * Get all agents with optional filters
	 *
	 * @static
	 * @async
	 * @param {AgentFilters} [filters] - Optional filters to apply
	 * @returns {Promise<Agent[]>} Array of agents matching the filters
	 * @throws {Error} If the API request fails
	 *
	 * @example
	 * ```typescript
	 * const agents = await AgentService.getAllAgents({
	 *   city: 'Lyon',
	 *   minExperience: 3
	 * });
	 * ```
	 */
	static async getAllAgents(filters?: AgentFilters): Promise<Agent[]> {
		try {
			const params = new URLSearchParams();

			if (filters) {
				Object.entries(filters).forEach(([key, value]) => {
					if (value !== undefined && value !== null && value !== '') {
						if (Array.isArray(value)) {
							params.append(key, value.join(','));
						} else {
							params.append(key, value.toString());
						}
					}
				});
			}

			const queryString = params.toString();
			const url = queryString
				? `/auth/agents?${queryString}`
				: '/auth/agents';

			const response = await api.get<AgentsResponse>(url);
			return response.data.data || [];
		} catch (error) {
			throw handleApiError(
				error,
				'AgentService.getAllAgents',
				'Erreur lors de la récupération des agents',
			);
		}
	}

	/**
	 * Get a single agent by ID
	 *
	 * @static
	 * @async
	 * @param {string} id - The unique identifier of the agent
	 * @returns {Promise<Agent>} The agent data
	 * @throws {Error} If the agent is not found or the API request fails
	 *
	 * @example
	 * ```typescript
	 * const agent = await AgentService.getAgentById('60f7b3b3e4b0e4a4f8c4b3a1');
	 * console.log(agent.firstName, agent.lastName);
	 * ```
	 */
	static async getAgentById(id: string): Promise<Agent> {
		try {
			const response = await api.get<{ success: boolean; data: Agent }>(
				`/auth/agent/${id}`,
			);
			return response.data.data;
		} catch (error) {
			throw handleApiError(
				error,
				'AgentService.getAgentById',
				"Erreur lors de la récupération de l'agent",
			);
		}
	}

	/**
	 * Search agents by location (city or postal code)
	 *
	 * @static
	 * @async
	 * @param {string} query - The search query (city name or postal code)
	 * @param {'city' | 'postal'} [type='city'] - The type of search to perform
	 * @returns {Promise<Agent[]>} Array of agents matching the location criteria
	 * @throws {Error} If the API request fails
	 *
	 * @example
	 * ```typescript
	 * // Search by city
	 * const agents = await AgentService.searchAgents('Paris', 'city');
	 *
	 * // Search by postal code
	 * const agents = await AgentService.searchAgents('75001', 'postal');
	 * ```
	 */
	static async searchAgents(
		query: string,
		type: 'city' | 'postal' = 'city',
	): Promise<Agent[]> {
		try {
			const filters: AgentFilters =
				type === 'city' ? { city: query } : { postalCode: query };
			return await this.getAllAgents(filters);
		} catch (error) {
			throw handleApiError(
				error,
				'AgentService.searchAgents',
				"Erreur lors de la recherche d'agents",
			);
		}
	}
}

// Backward compatibility: export object-style API
export const agentService = {
	getAllAgents: AgentService.getAllAgents.bind(AgentService),
	getAgentById: AgentService.getAgentById.bind(AgentService),
	searchAgents: AgentService.searchAgents.bind(AgentService),
};
