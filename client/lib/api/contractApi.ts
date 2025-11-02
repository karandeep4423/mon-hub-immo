import { api } from '../api';
import { handleApiError } from '../utils/errorHandler';

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
		profileImage?: string | null;
	};
	collaborator: {
		id: string;
		name: string;
		email: string;
		profileImage?: string | null;
	};
	canEdit: boolean;
	canSign: boolean;
	requiresBothSignatures: boolean;
}

export interface UpdateContractRequest {
	contractText: string;
	additionalTerms: string;
}

/**
 * Contract API Service
 * Manages collaboration contract operations
 */
export class ContractApi {
	/**
	 * Get contract details for collaboration
	 */
	static async getContract(
		collaborationId: string,
	): Promise<{ contract: ContractData }> {
		try {
			const response = await api.get(`/contract/${collaborationId}`);
			return { contract: response.data.contract };
		} catch (error) {
			throw handleApiError(
				error,
				'ContractApi.getContract',
				'Erreur lors de la récupération du contrat',
			);
		}
	}

	/**
	 * Update contract content
	 */
	static async updateContract(
		collaborationId: string,
		data: UpdateContractRequest,
	): Promise<{
		contract: ContractData;
		requiresResigning: boolean;
		message: string;
	}> {
		try {
			const response = await api.put(
				`/contract/${collaborationId}`,
				data,
			);
			return {
				contract: response.data.contract,
				requiresResigning: response.data.requiresResigning,
				message: response.data.message,
			};
		} catch (error) {
			throw handleApiError(
				error,
				'ContractApi.updateContract',
				'Erreur lors de la mise à jour du contrat',
			);
		}
	}

	/**
	 * Sign contract for collaboration
	 */
	static async signContract(collaborationId: string): Promise<{
		contract: ContractData;
		message: string;
	}> {
		try {
			const response = await api.post(
				`/contract/${collaborationId}/sign`,
			);
			return {
				contract: response.data.contract,
				message: response.data.message,
			};
		} catch (error) {
			throw handleApiError(
				error,
				'ContractApi.signContract',
				'Erreur lors de la signature du contrat',
			);
		}
	}
}

// Backward compatibility
export const contractApi = {
	getContract: ContractApi.getContract.bind(ContractApi),
	updateContract: ContractApi.updateContract.bind(ContractApi),
	signContract: ContractApi.signContract.bind(ContractApi),
};
