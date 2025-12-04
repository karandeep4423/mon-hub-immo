'use client';

import React from 'react';
import Link from 'next/link';
import {
	Eye,
	Pencil,
	MessageSquare,
	CheckSquare,
	XCircle,
	Trash2,
} from 'lucide-react';
import type { AdminCollaboration } from '@/types/admin';

interface CollaborationActionsProps {
	collaboration: AdminCollaboration;
	onEdit: () => void;
	onComplete: () => void;
	onCancel: () => void;
	onDelete: () => void;
	disabled?: boolean;
}

export const CollaborationActions: React.FC<CollaborationActionsProps> = ({
	collaboration,
	onEdit,
	onComplete,
	onCancel,
	onDelete,
	disabled = false,
}) => {
	const { _id, status } = collaboration;
	const canModify = status !== 'completed' && status !== 'cancelled';

	return (
		<div className="flex items-center justify-end gap-1">
			{/* View Details */}
			<Link
				href={`/collaboration/${_id}`}
				className="p-1.5 hover:bg-blue-50 rounded-lg transition-all border border-transparent hover:border-blue-200 group"
				title="Détails"
			>
				<Eye className="w-4 h-4 text-gray-600 group-hover:text-blue-600 transition-colors" />
			</Link>

			{/* Edit */}
			<button
				onClick={onEdit}
				className="p-1.5 hover:bg-amber-50 rounded-lg transition-all border border-transparent hover:border-amber-200 group"
				title="Modifier"
				disabled={disabled}
			>
				<Pencil className="w-4 h-4 text-gray-600 group-hover:text-amber-600 transition-colors" />
			</button>

			{/* Chat History */}
			<Link
				href={`/admin/chat?collaborationId=${_id}`}
				className="p-1.5 hover:bg-purple-50 rounded-lg transition-all border border-transparent hover:border-purple-200 group"
				title="Historique"
			>
				<MessageSquare className="w-4 h-4 text-gray-600 group-hover:text-purple-600 transition-colors" />
			</Link>

			{/* Actions for active collaborations */}
			{canModify && (
				<>
					{/* Force Complete */}
					<button
						onClick={onComplete}
						className="p-1.5 hover:bg-green-50 rounded-lg transition-all border border-transparent hover:border-green-200 group"
						title="Forcer complétion"
						disabled={disabled}
					>
						<CheckSquare className="w-4 h-4 text-gray-600 group-hover:text-green-600 transition-colors" />
					</button>

					{/* Cancel */}
					<button
						onClick={onCancel}
						className="p-1.5 hover:bg-orange-50 rounded-lg transition-all border border-transparent hover:border-orange-200 group"
						title="Annuler"
						disabled={disabled}
					>
						<XCircle className="w-4 h-4 text-gray-600 group-hover:text-orange-600 transition-colors" />
					</button>
				</>
			)}

			{/* Delete */}
			<button
				onClick={onDelete}
				className="p-1.5 hover:bg-red-50 rounded-lg transition-all border border-transparent hover:border-red-200 group"
				title="Supprimer"
				disabled={disabled}
			>
				<Trash2 className="w-4 h-4 text-gray-600 group-hover:text-red-600 transition-colors" />
			</button>
		</div>
	);
};
