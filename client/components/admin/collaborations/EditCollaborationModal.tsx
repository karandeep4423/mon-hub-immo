'use client';

import React, { useState } from 'react';
import { toast } from 'react-toastify';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/CustomSelect';
import { adminService } from '@/lib/api/adminApi';
import { COLLABORATION_STATUS_OPTIONS } from '@/lib/constants/admin';
import type { AdminCollaboration } from '@/types/admin';

interface EditCollaborationModalProps {
	collaboration: AdminCollaboration;
	onClose: () => void;
	onSave: () => void;
}

export const EditCollaborationModal: React.FC<EditCollaborationModalProps> = ({
	collaboration,
	onClose,
	onSave,
}) => {
	const [form, setForm] = useState({
		commission:
			collaboration.commission || collaboration.proposedCommission || 0,
		status: collaboration.status,
		adminNote: '',
	});
	const [busy, setBusy] = useState(false);

	const statusOptions = COLLABORATION_STATUS_OPTIONS.filter(
		(o) => o.value !== '',
	);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setBusy(true);
		try {
			await adminService.updateCollaboration(collaboration._id, {
				commission: form.commission,
				status: form.status,
				...(form.adminNote ? { adminNote: form.adminNote } : {}),
			});
			toast.success('Collaboration mise à jour');
			onSave();
		} catch (err) {
			console.error(err);
			toast.error('Erreur lors de la mise à jour');
		} finally {
			setBusy(false);
		}
	};

	return (
		<div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
			<div className="bg-white rounded-xl shadow-xl w-full max-w-lg mx-4">
				<div className="p-6 border-b">
					<h2 className="text-xl font-bold text-gray-900">
						Modifier la collaboration
					</h2>
				</div>
				<form onSubmit={handleSubmit} className="p-6 space-y-4">
					<div>
						<label className="block text-sm font-medium text-gray-700 mb-1">
							Commission (%)
						</label>
						<Input
							type="number"
							min={0}
							max={100}
							step={0.5}
							value={form.commission}
							onChange={(e) =>
								setForm({
									...form,
									commission: parseFloat(e.target.value) || 0,
								})
							}
						/>
					</div>
					<div>
						<label className="block text-sm font-medium text-gray-700 mb-1">
							Statut
						</label>
						<Select
							options={statusOptions}
							value={form.status}
							onChange={(value) =>
								setForm({
									...form,
									status: value as AdminCollaboration['status'],
								})
							}
						/>
					</div>
					<div>
						<label className="block text-sm font-medium text-gray-700 mb-1">
							Note admin (optionnel)
						</label>
						<textarea
							className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
							rows={3}
							placeholder="Ajouter une note visible dans l'historique..."
							value={form.adminNote}
							onChange={(e) =>
								setForm({ ...form, adminNote: e.target.value })
							}
						/>
					</div>
					<div className="flex justify-end gap-3 pt-4">
						<button
							type="button"
							onClick={onClose}
							className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
							disabled={busy}
						>
							Annuler
						</button>
						<button
							type="submit"
							className="px-4 py-2 text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors disabled:opacity-50"
							disabled={busy}
						>
							{busy ? 'Enregistrement...' : 'Enregistrer'}
						</button>
					</div>
				</form>
			</div>
		</div>
	);
};
