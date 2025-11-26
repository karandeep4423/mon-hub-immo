 'use client';

import { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { authToastSuccess, authToastError } from '@/lib/utils/authToast';

interface ImportResult {
	created?: Array<{ id: string; email: string }>;
	createdCount?: number;
	updatedCount?: number;
	failed?: number;
	errors?: string[];
}
interface ImportResultServer {
	success: boolean;
	createdCount?: number;
	updatedCount?: number;
	skipped?: Array<{ line: number; reason: string }>;
	errors?: string[];
	created?: Array<{ id: string; email: string }>;
}

function ImportUsersModal({
	open,
	onClose,
	onSuccess,
}: {
	open: boolean;
	onClose: () => void;
	onSuccess: () => void;
}) {
	const [file, setFile] = useState<File | null>(null);
	const [uploading, setUploading] = useState(false);
	const [result, setResult] = useState<ImportResult | null>(null);
	const [sendInviteDefault, setSendInviteDefault] = useState(true);
	const [validateDefault, setValidateDefault] = useState(false);
	const [defaultUserType, setDefaultUserType] = useState<'agent' | 'apporteur'>('apporteur');
	const [updateIfExists, setUpdateIfExists] = useState(false);

	if (!open) return null;

	const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const f = e.target.files?.[0];
		if (f && (f.type === 'text/csv' || f.name.endsWith('.csv'))) {
			setFile(f);
			setResult(null);
		} else {
			authToastError('Veuillez sélectionner un fichier CSV');
		}
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!file) {
			authToastError('Aucun fichier sélectionné');
			return;
		}

		setUploading(true);
		const formData = new FormData();
			formData.append('file', file);
			formData.append('sendInviteDefault', String(sendInviteDefault));
			formData.append('validateDefault', String(validateDefault));
			formData.append('defaultUserType', defaultUserType);
			formData.append('updateIfExists', String(updateIfExists));

		try {
						const API_ROOT = (() => {
							const raw = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
							return raw.replace(/\/+$/, '').replace(/\/api$/i, '');
						})();
						const res = await fetch(`${API_ROOT}/api/admin/users/import`, {
				method: 'POST',
				credentials: 'include',
				body: formData,
			});

				const data = (await res.json()) as ImportResultServer;
			if (!res.ok) {
				// Try to read a typed error from API
				const errBody = data as unknown as { error?: string };
				authToastError(errBody.error || "Erreur lors de l'import");
				setResult({ createdCount: data.createdCount, updatedCount: data.updatedCount, errors: data.errors });
				setUploading(false);
				return;
			}

			setResult({ createdCount: data.createdCount, updatedCount: data.updatedCount, errors: data.errors, created: data.created });
			authToastSuccess(`Import réussi: ${data.createdCount || 0} utilisateur(s) créé(s)${data.errors && data.errors.length > 0 ? `, ${data.errors.length} erreur(s)` : ''}`);

			if ((data.createdCount || 0) > 0) {
				setTimeout(() => {
					onSuccess();
					onClose();
					setFile(null);
					setResult(null);
				}, 1500);
			}
		} catch (err: unknown) {
			authToastError('Erreur réseau');
			console.error(err);
		} finally {
			setUploading(false);
		}
	};

	return (
		<Modal isOpen={open} onClose={onClose} title="Importer des utilisateurs" size="md" zIndex={99999}>
			{!result ? (
				<form onSubmit={handleSubmit} className="space-y-4">
						<div>
							<label className="block text-sm font-medium mb-2">
								Fichier CSV (colonnes: email, firstName, lastName, userType, phone, network)
							</label>
							<input
								type="file"
								accept=".csv"
								onChange={handleFileChange}
								className="w-full p-2 border rounded"
								required
							/>
							<p className="text-xs text-gray-500 mt-1">
								Format CSV requis. Colonnes obligatoires: email, firstName, lastName
							</p>
						</div>

						{/* Options for the import */}
						<div className="flex items-center gap-4">
							<label className="inline-flex items-center gap-2">
								<input
									type="checkbox"
									checked={sendInviteDefault}
									onChange={(e) => setSendInviteDefault(e.target.checked)}
								/>
								<span className="text-sm">Envoyer une invitation (lien de définition du mot de passe)</span>
							</label>

							<label className="inline-flex items-center gap-2">
								<input
									type="checkbox"
									checked={validateDefault}
									onChange={(e) => setValidateDefault(e.target.checked)}
								/>
								<span className="text-sm">Valider automatiquement les comptes</span>
							</label>
						</div>

						<div className="flex items-center gap-2">
							<label className="text-sm">Type d&apos;utilisateur par défaut:</label>
							<select value={defaultUserType} onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setDefaultUserType(e.target.value as 'agent' | 'apporteur')} className="border rounded px-2 py-1">
								<option value="apporteur">Apporteur</option>
								<option value="agent">Agent</option>
							</select>
						</div>

						<div className="text-sm mt-2">
							<label className="inline-flex items-center gap-2">
								<input
									type="checkbox"
									checked={updateIfExists}
									onChange={(e) => setUpdateIfExists(e.target.checked)}
								/>
								<span className="ml-1">Mettre à jour les utilisateurs existants si l&apos;email existe (updateIfExists)</span>
							</label>
						</div>

						{file && (
							<div className="p-3 bg-blue-50 rounded text-sm">
								Fichier sélectionné: <strong>{file.name}</strong> ({(file.size / 1024).toFixed(2)} KB)
							</div>
						)}

						<div className="flex justify-end gap-2">
							<button
								type="button"
								onClick={onClose}
								className="px-4 py-2 border rounded hover:bg-gray-50"
								disabled={uploading}
							>
								Annuler
							</button>
							<button
								type="submit"
								disabled={!file || uploading}
								className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
							>
								{uploading ? 'Import en cours...' : 'Importer'}
							</button>
						</div>
					</form>
			) : (
				<div className="space-y-4">
					<div className="p-4 bg-green-50 border border-green-200 rounded">
						<p className="font-bold text-green-700">✓ Import terminé</p>
						<p className="text-sm">
							{result.createdCount || 0} utilisateur(s) créé(s) • {result.errors ? result.errors.length : 0} erreur(s)
							{result.updatedCount ? ` • ${result.updatedCount} mis à jour` : ''}
						</p>
					</div>

					{result.created && result.created.length > 0 && (
						<div>
							<h4 className="font-medium mb-2">Utilisateurs créés:</h4>
							<div className="space-y-1 text-sm max-h-40 overflow-y-auto">
								{result.created.map(u => (
									<p key={u.id} className="text-gray-700">✓ {u.email}</p>
								))}
							</div>
						</div>
					)}

					{result.errors && result.errors.length > 0 && (
						<div>
							<h4 className="font-medium text-red-700 mb-2">Erreurs:</h4>
							<div className="space-y-1 text-sm max-h-40 overflow-y-auto">
								{result.errors.map((err, idx) => (
									<p key={idx} className="text-red-600">✗ {err}</p>
								))}
							</div>
						</div>
					)}

					<div className="flex justify-end gap-2">
						<button
							type="button"
							onClick={() => {
								onClose();
								setFile(null);
								setResult(null);
							}}
							className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
						>
							Fermer
						</button>
					</div>
				</div>
			)}
		</Modal>
	);
}

export default ImportUsersModal;
