'use client';

import React, { useState } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';

export type CompletionReason =
	| 'vente_conclue_collaboration'
	| 'vente_conclue_seul'
	| 'bien_retire'
	| 'mandat_expire'
	| 'client_desiste'
	| 'vendu_tiers'
	| 'sans_suite';

interface CompletionReasonModalProps {
	isOpen: boolean;
	onClose: () => void;
	onConfirm: (reason: CompletionReason) => void;
	isLoading?: boolean;
}

export const COMPLETION_REASONS = [
	{
		value: 'vente_conclue_collaboration' as CompletionReason,
		label: 'Vente conclue via collaboration',
		icon: '✅',
		color: 'text-green-700 bg-green-50 border-green-200',
		hoverColor: 'hover:bg-green-100',
	},
	{
		value: 'vente_conclue_seul' as CompletionReason,
		label: 'Vente conclue par moi seul',
		icon: '✅',
		color: 'text-green-700 bg-green-50 border-green-200',
		hoverColor: 'hover:bg-green-100',
	},
	{
		value: 'bien_retire' as CompletionReason,
		label: 'Bien retiré du marché',
		icon: '❌',
		color: 'text-red-700 bg-red-50 border-red-200',
		hoverColor: 'hover:bg-red-100',
	},
	{
		value: 'mandat_expire' as CompletionReason,
		label: 'Mandat expiré',
		icon: '❌',
		color: 'text-red-700 bg-red-50 border-red-200',
		hoverColor: 'hover:bg-red-100',
	},
	{
		value: 'client_desiste' as CompletionReason,
		label: 'Client désisté',
		icon: '❌',
		color: 'text-red-700 bg-red-50 border-red-200',
		hoverColor: 'hover:bg-red-100',
	},
	{
		value: 'vendu_tiers' as CompletionReason,
		label: 'Vendu par un tiers',
		icon: '📊',
		color: 'text-info bg-info-light border-info',
		hoverColor: 'hover:bg-blue-100',
	},
	{
		value: 'sans_suite' as CompletionReason,
		label: 'Sans suite',
		icon: '⏸️',
		color: 'text-gray-700 bg-gray-50 border-gray-200',
		hoverColor: 'hover:bg-gray-100',
	},
];

// Helper function to get completion reason details
export const getCompletionReasonDetails = (
	reason?: CompletionReason | string,
) => {
	if (!reason) return null;
	return COMPLETION_REASONS.find((r) => r.value === reason) || null;
};

export const CompletionReasonModal: React.FC<CompletionReasonModalProps> = ({
	isOpen,
	onClose,
	onConfirm,
	isLoading = false,
}) => {
	const [selectedReason, setSelectedReason] =
		useState<CompletionReason | null>(null);

	const handleConfirm = () => {
		if (selectedReason) {
			onConfirm(selectedReason);
		}
	};

	const handleClose = () => {
		if (!isLoading) {
			setSelectedReason(null);
			onClose();
		}
	};

	return (
		<Modal
			isOpen={isOpen}
			onClose={handleClose}
			title="Marquer comme complétée"
			size="lg"
		>
			<div className="space-y-4">
				<p className="text-sm text-gray-600">
					Veuillez sélectionner la raison de la complétion de cette
					collaboration. Cette action ne peut pas être annulée.
				</p>

				<div className="space-y-2">
					{COMPLETION_REASONS.map((reason) => (
						<button
							key={reason.value}
							type="button"
							onClick={() => setSelectedReason(reason.value)}
							disabled={isLoading}
							className={`w-full flex items-center gap-3 p-4 rounded-lg border-2 transition-all ${
								reason.color
							} ${reason.hoverColor} ${
								selectedReason === reason.value
									? 'ring-2 ring-offset-2 ring-brand border-brand'
									: ''
							} ${isLoading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
						>
							<span className="text-2xl">{reason.icon}</span>
							<span className="font-medium text-left flex-1">
								{reason.label}
							</span>
							{selectedReason === reason.value && (
								<svg
									className="w-6 h-6 text-brand"
									fill="currentColor"
									viewBox="0 0 20 20"
								>
									<path
										fillRule="evenodd"
										d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
										clipRule="evenodd"
									/>
								</svg>
							)}
						</button>
					))}
				</div>

				<div className="flex justify-end space-x-3 pt-4 border-t">
					<Button
						type="button"
						variant="secondary"
						onClick={handleClose}
						disabled={isLoading}
					>
						Annuler
					</Button>
					<Button
						type="button"
						onClick={handleConfirm}
						disabled={!selectedReason || isLoading}
					>
						{isLoading ? 'En cours...' : 'Complété'}
					</Button>
				</div>
			</div>
		</Modal>
	);
};
