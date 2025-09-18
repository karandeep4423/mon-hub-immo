'use client';

import React from 'react';
import { Modal } from '../ui/Modal';
import { ContractManagement } from '../contract/ContractManagement';
import { Collaboration } from '../../types/collaboration';

interface ContractModalProps {
	isOpen: boolean;
	onClose: () => void;
	collaboration: Collaboration;
	onUpdate?: () => void;
}

export const ContractModal: React.FC<ContractModalProps> = ({
	isOpen,
	onClose,
	collaboration,
	onUpdate,
}) => {
	const handleContractUpdate = () => {
		onUpdate?.();
	};

	return (
		<Modal isOpen={isOpen} onClose={onClose} size="lg">
			<ContractManagement
				collaborationId={collaboration._id}
				onContractUpdate={handleContractUpdate}
				onClose={onClose}
			/>
		</Modal>
	);
};
