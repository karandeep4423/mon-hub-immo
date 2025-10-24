import React, { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { ProfileAvatar } from '@/components/ui/ProfileAvatar';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { contractApi, ContractData } from '@/lib/api/contractApi';
import { useAuth } from '@/hooks/useAuth';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { toast } from 'react-toastify';
import { useFetch, useMutation } from '@/hooks';
import { TOAST_MESSAGES } from '@/lib/constants';

interface ContractManagementProps {
	collaborationId: string;
	onContractUpdate?: (contract: ContractData) => void;
	onClose?: () => void;
}

export const ContractManagement: React.FC<ContractManagementProps> = ({
	collaborationId,
	onContractUpdate,
	onClose,
}) => {
	const { user } = useAuth();
	const [isEditing, setIsEditing] = useState(false);
	const [formData, setFormData] = useState({
		contractText: '',
		additionalTerms: '',
	});
	const [confirmOpen, setConfirmOpen] = useState(false);

	// Fetch contract using useFetch hook
	const {
		data: contractResponse,
		loading: isLoading,
		error,
		refetch: reloadContract,
	} = useFetch(() => contractApi.getContract(collaborationId), {
		skip: !collaborationId,
		showErrorToast: false,
		onSuccess: (response) => {
			if (response && response.contract) {
				setFormData({
					contractText: response.contract.contractText || '',
					additionalTerms: response.contract.additionalTerms || '',
				});
			}
		},
	});

	const contract = contractResponse?.contract || null;

	const handleEdit = () => {
		setIsEditing(true);
		setFormData({
			contractText: contract?.contractText || '',
			additionalTerms: contract?.additionalTerms || '',
		});
	};

	const handleCancelEdit = () => {
		setIsEditing(false);
		setFormData({
			contractText: contract?.contractText || '',
			additionalTerms: contract?.additionalTerms || '',
		});
	};

	// Use useMutation for update contract
	const { mutate: updateContract, loading: isUpdating } = useMutation(
		() => contractApi.updateContract(collaborationId, formData),
		{
			onSuccess: (response) => {
				setIsEditing(false);
				if (response.requiresResigning) {
					toast.info(TOAST_MESSAGES.CONTRACTS.UPDATE_REQUIRES_RESIGN);
				}
				onContractUpdate?.(response.contract);
				reloadContract();
			},
			showErrorToast: true,
			errorMessage: TOAST_MESSAGES.CONTRACTS.UPDATE_ERROR,
		},
	);

	// Use useMutation for sign contract
	const { mutate: signContract, loading: isSigning } = useMutation(
		() => contractApi.signContract(collaborationId),
		{
			onSuccess: (response) => {
				onContractUpdate?.(response.contract);
				if (
					response.contract.ownerSigned &&
					response.contract.collaboratorSigned
				) {
					toast.success(TOAST_MESSAGES.CONTRACTS.SIGN_SUCCESS_BOTH);
				} else {
					toast.success(
						TOAST_MESSAGES.CONTRACTS.SIGN_SUCCESS_WAITING,
					);
				}
				setConfirmOpen(false);
				reloadContract();
			},
			showErrorToast: true,
			errorMessage: TOAST_MESSAGES.CONTRACTS.SIGN_ERROR,
		},
	);

	const isSubmitting = isUpdating || isSigning;

	const handleUpdateContract = () => {
		if (!contract) return;
		updateContract({});
	};

	const doSignContract = () => {
		if (!contract) return;
		signContract({});
	};

	const handleSignContract = () => {
		setConfirmOpen(true);
	};

	if (isLoading) {
		return (
			<div className="flex items-center justify-center p-8">
				<LoadingSpinner size="lg" />
			</div>
		);
	}

	if (!contract || !contract.propertyOwner || !contract.collaborator) {
		return (
			<div className="text-center p-8">
				<p className="text-red-600">
					{error ? String(error) : TOAST_MESSAGES.CONTRACTS.NOT_FOUND}
				</p>
				{onClose && (
					<Button onClick={onClose} className="mt-4">
						Fermer
					</Button>
				)}
			</div>
		);
	}

	const isOwner =
		contract.propertyOwner.id === user?._id ||
		contract.propertyOwner.id === user?.id;
	const currentUserSigned = isOwner
		? contract.ownerSigned
		: contract.collaboratorSigned;
	const otherPartySigned = isOwner
		? contract.collaboratorSigned
		: contract.ownerSigned;

	return (
		<div className="space-y-6">
			<ConfirmDialog
				isOpen={confirmOpen}
				title="Signer le contrat ?"
				description="Êtes-vous sûr de vouloir signer ce contrat ? Cette action sera enregistrée."
				onCancel={() => setConfirmOpen(false)}
				onConfirm={doSignContract}
				confirmText="Oui, signer"
				cancelText="Non, revenir"
				variant="primary"
				loading={isSubmitting}
			/>
			{error && (
				<div className="bg-red-50 border border-red-200 rounded-lg p-4">
					<p className="text-red-600">
						{error.message || 'Une erreur est survenue'}
					</p>
				</div>
			)}

			{/* Contract Status */}
			<Card className="p-6">
				<div className="flex items-center justify-between mb-4">
					<h2 className="text-2xl font-bold text-gray-900">
						Contrat de Collaboration
					</h2>
					<div className="flex items-center space-x-2">
						{currentUserSigned && (
							<span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
								✓ Vous avez signé
							</span>
						)}
						{otherPartySigned && (
							<span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
								✓ Partenaire a signé
							</span>
						)}
					</div>
				</div>

				{/* Warning if contract was modified */}
				{contract.contractModified &&
					(!contract.ownerSigned || !contract.collaboratorSigned) && (
						<div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-4">
							<div className="flex items-start">
								<div className="flex-shrink-0">
									<svg
										className="w-5 h-5 text-orange-500 mt-0.5"
										fill="currentColor"
										viewBox="0 0 20 20"
									>
										<path
											fillRule="evenodd"
											d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
											clipRule="evenodd"
										/>
									</svg>
								</div>
								<div className="ml-3">
									<h3 className="text-sm font-medium text-orange-800">
										Le contrat a été modifié
									</h3>
									<p className="text-sm text-orange-700 mt-1">
										Les deux parties doivent signer à
										nouveau.
									</p>
								</div>
							</div>
						</div>
					)}

				{/* Parties Information */}
				<div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
					<div>
						<h3 className="font-semibold text-gray-900 mb-3">
							Propriétaire
						</h3>
						<div className="flex items-center space-x-3 mb-2">
							<ProfileAvatar
								user={{
									_id: contract.propertyOwner.id,
									firstName:
										contract.propertyOwner.name.split(
											' ',
										)[0] || '',
									lastName:
										contract.propertyOwner.name
											.split(' ')
											.slice(1)
											.join(' ') || '',
									profileImage:
										contract.propertyOwner.profileImage ||
										undefined,
								}}
								size="sm"
								className="w-10 h-10"
							/>
							<div>
								<p className="text-gray-900 font-medium">
									{contract.propertyOwner.name}
								</p>
								<p className="text-sm text-gray-500">
									{contract.propertyOwner.email}
								</p>
							</div>
						</div>
						<div className="mt-2">
							{contract.ownerSigned ? (
								<span className="text-green-600 text-sm">
									✓ Signé
								</span>
							) : (
								<span className="text-orange-600 text-sm">
									⏳ En attente
								</span>
							)}
						</div>
					</div>
					<div>
						<h3 className="font-semibold text-gray-900 mb-3">
							Collaborateur
						</h3>
						<div className="flex items-center space-x-3 mb-2">
							<ProfileAvatar
								user={{
									_id: contract.collaborator.id,
									firstName:
										contract.collaborator.name.split(
											' ',
										)[0] || '',
									lastName:
										contract.collaborator.name
											.split(' ')
											.slice(1)
											.join(' ') || '',
									profileImage:
										contract.collaborator.profileImage ||
										undefined,
								}}
								size="sm"
								className="w-10 h-10"
							/>
							<div>
								<p className="text-gray-900 font-medium">
									{contract.collaborator.name}
								</p>
								<p className="text-sm text-gray-500">
									{contract.collaborator.email}
								</p>
							</div>
						</div>
						<div className="mt-2">
							{contract.collaboratorSigned ? (
								<span className="text-green-600 text-sm">
									✓ Signé
								</span>
							) : (
								<span className="text-orange-600 text-sm">
									⏳ En attente
								</span>
							)}
						</div>
					</div>
				</div>
			</Card>

			{/* Contract Content */}
			<Card className="p-6">
				<div className="flex items-center justify-between mb-4">
					<h3 className="text-lg font-semibold text-gray-900">
						Termes du contrat
					</h3>
					{!isEditing && contract.canEdit && (
						<Button
							onClick={handleEdit}
							variant="outline"
							loading={isSubmitting}
						>
							Modifier le contrat
						</Button>
					)}
				</div>

				{isEditing ? (
					<div className="space-y-4">
						<div>
							<label className="block text-sm font-medium text-gray-700 mb-2">
								Contenu du contrat
							</label>
							<textarea
								value={formData.contractText}
								onChange={(e) =>
									setFormData({
										...formData,
										contractText: e.target.value,
									})
								}
								rows={12}
								className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
								placeholder="Saisissez le contenu du contrat..."
							/>
						</div>
						<div>
							<label className="block text-sm font-medium text-gray-700 mb-2">
								Conditions supplémentaires
							</label>
							<textarea
								value={formData.additionalTerms}
								onChange={(e) =>
									setFormData({
										...formData,
										additionalTerms: e.target.value,
									})
								}
								rows={4}
								className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
								placeholder="Conditions supplémentaires..."
							/>
						</div>
						<div className="flex space-x-3">
							<Button
								onClick={handleUpdateContract}
								loading={isSubmitting}
								className="bg-blue-600 hover:bg-blue-700"
							>
								Sauvegarder
							</Button>
							<Button
								onClick={handleCancelEdit}
								variant="outline"
								disabled={isSubmitting}
							>
								Annuler
							</Button>
						</div>
					</div>
				) : (
					<div className="space-y-4">
						<div>
							<h4 className="font-medium text-gray-900 mb-2">
								Contenu du contrat
							</h4>
							<div className="bg-gray-50 rounded-lg p-4 whitespace-pre-wrap">
								{contract.contractText ||
									'Aucun contenu défini'}
							</div>
						</div>
						{contract.additionalTerms && (
							<div>
								<h4 className="font-medium text-gray-900 mb-2">
									Conditions supplémentaires
								</h4>
								<div className="bg-gray-50 rounded-lg p-4 whitespace-pre-wrap">
									{contract.additionalTerms}
								</div>
							</div>
						)}
					</div>
				)}
			</Card>

			{/* Signature Section */}
			{!isEditing && contract.canSign && (
				<Card className="p-6">
					<h3 className="text-lg font-semibold text-gray-900 mb-4">
						Signature
					</h3>
					<div className="space-y-4">
						<div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
							<h4 className="font-medium text-blue-900 mb-2">
								Conditions d&apos;acceptation
							</h4>
							<div className="space-y-2 text-sm text-blue-800">
								<label className="flex items-center">
									<input
										type="checkbox"
										required
										className="mr-2"
									/>
									Je confirme avoir lu et compris
									l&apos;intégralité du contrat de
									collaboration
								</label>
								<label className="flex items-center">
									<input
										type="checkbox"
										required
										className="mr-2"
									/>
									J&apos;accepte les termes et conditions
									énoncés dans ce contrat
								</label>
								<label className="flex items-center">
									<input
										type="checkbox"
										required
										className="mr-2"
									/>
									Je m&apos;engage à respecter mes obligations
									telles que définies dans le contrat
								</label>
								<label className="flex items-center">
									<input
										type="checkbox"
										required
										className="mr-2"
									/>
									Je comprends que ce contrat est
									juridiquement contraignant
								</label>
							</div>
						</div>
						<Button
							onClick={handleSignContract}
							loading={isSubmitting}
							className="bg-green-600 hover:bg-green-700 w-full"
						>
							✍️ Signer le contrat
						</Button>
					</div>
				</Card>
			)}

			{/* Close Button */}
			{onClose && (
				<div className="flex justify-end">
					<Button onClick={onClose} variant="outline">
						Fermer
					</Button>
				</div>
			)}
		</div>
	);
};
