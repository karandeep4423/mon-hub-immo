import { api } from '../api';

export interface ContractData {
	id: string;
	contractText?: string;
	additionalTerms?: string;
	contractModified: boolean;
	ownerSigned: boolean;
	ownerSignedAt?: Date;
	collaboratorSigned: boolean;
	collaboratorSignedAt?: Date;
	status: string;
	currentStep: string;
	propertyOwner: {
		id: string;
		name: string;
		email: string;
	};
	collaborator: {
		id: string;
		name: string;
		email: string;
	};
	canEdit: boolean;
	canSign: boolean;
	requiresBothSignatures: boolean;
}

export interface UpdateContractRequest {
	contractText: string;
	additionalTerms: string;
}

export const contractApi = {
	// Get contract details
	getContract: async (
		collaborationId: string,
	): Promise<{ contract: ContractData }> => {
		const response = await api.get(`/contract/${collaborationId}`);
		// Backend returns { success: true, contract: {...} }
		return { contract: response.data.contract };
	},

	// Update contract content
	updateContract: async (
		collaborationId: string,
		data: UpdateContractRequest,
	): Promise<{
		contract: ContractData;
		requiresResigning: boolean;
		message: string;
	}> => {
		const response = await api.put(`/contract/${collaborationId}`, data);
		// Backend returns { success: true, contract: {...}, requiresResigning: boolean, message: string }
		return {
			contract: response.data.contract,
			requiresResigning: response.data.requiresResigning,
			message: response.data.message,
		};
	},

	// Sign contract
	signContract: async (
		collaborationId: string,
	): Promise<{
		contract: ContractData;
		message: string;
	}> => {
		const response = await api.post(`/contract/${collaborationId}/sign`);
		// Backend returns { success: true, contract: {...}, message: string }
		return {
			contract: response.data.contract,
			message: response.data.message,
		};
	},
};
