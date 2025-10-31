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
import { Features } from '@/lib/constants';

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
					toast.info(
						Features.Collaboration.CONTRACT_TOAST_MESSAGES
							.UPDATE_REQUIRES_RESIGN,
					);
				}
				onContractUpdate?.(response.contract);
				reloadContract();
			},
			showErrorToast: true,
			errorMessage:
				Features.Collaboration.CONTRACT_TOAST_MESSAGES.UPDATE_ERROR,
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
					toast.success(
						Features.Collaboration.CONTRACT_TOAST_MESSAGES
							.SIGN_SUCCESS_BOTH,
					);
				} else {
					toast.success(
						Features.Collaboration.CONTRACT_TOAST_MESSAGES
							.SIGN_SUCCESS_WAITING,
					);
				}
				setConfirmOpen(false);
				reloadContract();
			},
			showErrorToast: true,
			errorMessage:
				Features.Collaboration.CONTRACT_TOAST_MESSAGES.SIGN_ERROR,
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
					{error
						? String(error)
						: Features.Collaboration.CONTRACT_TOAST_MESSAGES
								.NOT_FOUND}
				</p>
				{onClose && (
					<Button onClick={onClose} className="mt-4">
						{Features.Collaboration.CONTRACT_UI_TEXT.CLOSE_BUTTON}
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
				title={
					Features.Collaboration.CONTRACT_UI_TEXT.SIGN_DIALOG_TITLE
				}
				description={
					Features.Collaboration.CONTRACT_UI_TEXT
						.SIGN_DIALOG_DESCRIPTION
				}
				onCancel={() => setConfirmOpen(false)}
				onConfirm={doSignContract}
				confirmText={
					Features.Collaboration.CONTRACT_UI_TEXT.SIGN_CONFIRM_TEXT
				}
				cancelText={
					Features.Collaboration.CONTRACT_UI_TEXT.SIGN_CANCEL_TEXT
				}
				variant="primary"
				loading={isSubmitting}
			/>
			{error && (
				<div className="bg-red-50 border border-red-200 rounded-lg p-4">
					<p className="text-red-600">
						{error.message ||
							Features.Collaboration.CONTRACT_UI_TEXT
								.DEFAULT_ERROR}
					</p>
				</div>
			)}

			{/* Contract Status */}
			<Card className="p-6">
				<div className="flex items-center justify-between mb-4">
					<h2 className="text-2xl font-bold text-gray-900">
						{Features.Collaboration.CONTRACT_UI_TEXT.TITLE}
					</h2>
					<div className="flex items-center space-x-2">
						{currentUserSigned && (
							<span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
								{
									Features.Collaboration.CONTRACT_UI_TEXT
										.YOU_SIGNED
								}
							</span>
						)}
						{otherPartySigned && (
							<span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
								{
									Features.Collaboration.CONTRACT_UI_TEXT
										.PARTNER_SIGNED
								}
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
										{
											Features.Collaboration
												.CONTRACT_UI_TEXT.MODIFIED_TITLE
										}
									</h3>
									<p className="text-sm text-orange-700 mt-1">
										{
											Features.Collaboration
												.CONTRACT_UI_TEXT
												.MODIFIED_DESCRIPTION
										}
									</p>
								</div>
							</div>
						</div>
					)}

				{/* Parties Information */}
				<div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
					<div>
						<h3 className="font-semibold text-gray-900 mb-3">
							{
								Features.Collaboration.CONTRACT_UI_TEXT
									.OWNER_SECTION
							}
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
							{
								Features.Collaboration.CONTRACT_UI_TEXT
									.COLLABORATOR_SECTION
							}
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
				<div className="flex justify-between items-center mb-4">
					<h3 className="text-xl font-semibold text-gray-900">
						{
							Features.Collaboration.CONTRACT_UI_TEXT
								.CONTRACT_CONTENT_SECTION
						}
					</h3>
					{!isEditing && contract.canEdit && (
						<Button
							onClick={handleEdit}
							variant="outline"
							loading={isSubmitting}
						>
							{
								Features.Collaboration.CONTRACT_UI_TEXT
									.EDIT_BUTTON
							}
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
								className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand/20"
								placeholder={
									Features.Collaboration
										.COLLABORATION_FORM_PLACEHOLDERS
										.CONTRACT_CONTENT
								}
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
								className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand/20"
								placeholder={
									Features.Collaboration
										.COLLABORATION_FORM_PLACEHOLDERS
										.CONTRACT_TERMS
								}
							/>
						</div>
						<div className="flex space-x-3">
							<Button
								onClick={handleUpdateContract}
								loading={isSubmitting}
								className="bg-brand hover:bg-brand-600"
							>
								{
									Features.Collaboration.CONTRACT_UI_TEXT
										.SAVE_BUTTON
								}
							</Button>
							<Button
								onClick={handleCancelEdit}
								variant="outline"
								disabled={isSubmitting}
							>
								{
									Features.Collaboration.CONTRACT_UI_TEXT
										.CANCEL_EDIT_BUTTON
								}
							</Button>
						</div>
					</div>
				) : (
					<div className="space-y-4">
						<div>
							<h4 className="font-medium text-gray-900 mb-2">
								{
									Features.Collaboration.CONTRACT_UI_TEXT
										.CONTRACT_CONTENT_SECTION
								}
							</h4>
							<div className="bg-gray-50 rounded-lg p-4 whitespace-pre-wrap">
								{contract.contractText ||
									'Aucun contenu défini'}
							</div>
						</div>
						{contract.additionalTerms && (
							<div>
								<h4 className="font-medium text-gray-900 mb-2">
									{
										Features.Collaboration.CONTRACT_UI_TEXT
											.TERMS_SECTION
									}
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
						<div className="bg-info-light border border-info rounded-lg p-4">
							<h4 className="font-medium text-gray-900 mb-2">
								Conditions d&apos;acceptation
							</h4>
							<div className="space-y-2 text-sm text-gray-800">
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
							{
								Features.Collaboration.CONTRACT_UI_TEXT
									.SIGN_BUTTON
							}
						</Button>
					</div>
				</Card>
			)}

			{/* Close Button */}
			{onClose && (
				<div className="flex justify-end">
					<Button onClick={onClose} variant="outline">
						{Features.Collaboration.CONTRACT_UI_TEXT.CLOSE_BUTTON}
					</Button>
				</div>
			)}
		</div>
	);
};
