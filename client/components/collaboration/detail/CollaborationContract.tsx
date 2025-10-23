'use client';

import React from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Collaboration } from '@/types/collaboration';

interface CollaborationContractProps {
	collaboration: Collaboration;
	onViewContract: () => void;
}

export const CollaborationContract: React.FC<CollaborationContractProps> = ({
	collaboration,
	onViewContract,
}) => {
	const bothSigned =
		collaboration.ownerSigned && collaboration.collaboratorSigned;

	return (
		<Card className="p-6">
			<h3 className="text-lg font-medium text-gray-900 mb-4">
				📄 Contrat de collaboration
			</h3>
			<div className="mb-4">
				<Button
					onClick={onViewContract}
					variant="outline"
					className="text-sm"
				>
					<svg
						className="w-4 h-4 mr-2"
						fill="none"
						stroke="currentColor"
						viewBox="0 0 24 24"
					>
						<path
							strokeLinecap="round"
							strokeLinejoin="round"
							strokeWidth={2}
							d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
						/>
					</svg>
					Voir le contrat
				</Button>
			</div>
			<div className="space-y-3">
				<div className="flex items-center justify-between">
					<span className="text-gray-600">Propriétaire:</span>
					<span
						className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
							collaboration.ownerSigned
								? 'bg-green-100 text-green-800'
								: 'bg-yellow-100 text-yellow-800'
						}`}
					>
						{collaboration.ownerSigned
							? '✓ Signé'
							: '⏳ En attente'}
					</span>
				</div>
				<div className="flex items-center justify-between">
					<span className="text-gray-600">Collaborateur:</span>
					<span
						className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
							collaboration.collaboratorSigned
								? 'bg-green-100 text-green-800'
								: 'bg-yellow-100 text-yellow-800'
						}`}
					>
						{collaboration.collaboratorSigned
							? '✓ Signé'
							: '⏳ En attente'}
					</span>
				</div>
				{bothSigned && collaboration.ownerSignedAt && (
					<div className="text-xs text-gray-500 pt-2 border-t">
						Contrat signé le:{' '}
						{new Date(
							collaboration.ownerSignedAt,
						).toLocaleDateString('fr-FR')}
					</div>
				)}
			</div>
		</Card>
	);
};
