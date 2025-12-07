'use client';

import { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Select } from '@/components/ui/CustomSelect';
import { Alert } from '@/components/ui/Alert';
import { authToastSuccess, authToastError } from '@/lib/utils/authToast';
import { adminService } from '@/lib/api/adminApi';

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
	const [defaultUserType, setDefaultUserType] = useState<
		'agent' | 'apporteur'
	>('apporteur');
	const [updateIfExists, setUpdateIfExists] = useState(false);
	const [isDragging, setIsDragging] = useState(false);

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

	const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
		e.preventDefault();
		e.stopPropagation();
		setIsDragging(true);
	};

	const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
		e.preventDefault();
		e.stopPropagation();
		setIsDragging(false);
	};

	const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
		e.preventDefault();
		e.stopPropagation();
	};

	const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
		e.preventDefault();
		e.stopPropagation();
		setIsDragging(false);

		const files = e.dataTransfer.files;
		if (files && files.length > 0) {
			const f = files[0];
			if (f.type === 'text/csv' || f.name.endsWith('.csv')) {
				setFile(f);
				setResult(null);
			} else {
				authToastError('Veuillez sélectionner un fichier CSV');
			}
		}
	};

	const handleRemoveFile = () => {
		setFile(null);
		setResult(null);
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
			const res = await adminService.importUsers(formData);
			const data = res.data as ImportResultServer;

			setResult({
				createdCount: data.createdCount,
				updatedCount: data.updatedCount,
				errors: data.errors,
				created: data.created,
			});
			authToastSuccess(
				`Import réussi: ${data.createdCount || 0} utilisateur(s) créé(s)${data.errors && data.errors.length > 0 ? `, ${data.errors.length} erreur(s)` : ''}`,
			);

			if ((data.createdCount || 0) > 0) {
				setTimeout(() => {
					onSuccess();
					onClose();
					setFile(null);
					setResult(null);
				}, 1500);
			}
		} catch (err: unknown) {
			const errData = (
				err as {
					response?: {
						data?: {
							error?: string;
							createdCount?: number;
							updatedCount?: number;
							errors?: string[];
						};
					};
				}
			)?.response?.data;
			authToastError(errData?.error || "Erreur lors de l'import");
			if (errData) {
				setResult({
					createdCount: errData.createdCount,
					updatedCount: errData.updatedCount,
					errors: errData.errors,
				});
			}
			console.error(err);
		} finally {
			setUploading(false);
		}
	};

	const handleClose = () => {
		onClose();
		setFile(null);
		setResult(null);
	};

	return (
		<Modal
			isOpen={open}
			onClose={handleClose}
			title="Importer des utilisateurs"
			size="lg"
		>
			{!result ? (
				<form onSubmit={handleSubmit} className="space-y-5">
					{/* File Upload Zone */}
					<div>
						<label className="block text-sm font-medium text-gray-700 mb-2">
							Fichier CSV
						</label>
						<div
							className={`relative border-2 border-dashed rounded-lg p-6 transition-colors ${
								isDragging
									? 'border-blue-500 bg-blue-50'
									: file
										? 'border-green-400 bg-green-50'
										: 'border-gray-300 hover:border-gray-400'
							}`}
							onDragEnter={handleDragEnter}
							onDragLeave={handleDragLeave}
							onDragOver={handleDragOver}
							onDrop={handleDrop}
						>
							{file ? (
								<div className="flex items-center justify-between">
									<div className="flex items-center gap-3">
										<div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
											<svg
												className="w-5 h-5 text-green-600"
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
										</div>
										<div>
											<p className="text-sm font-medium text-gray-900">
												{file.name}
											</p>
											<p className="text-xs text-gray-500">
												{(file.size / 1024).toFixed(2)}{' '}
												KB
											</p>
										</div>
									</div>
									<button
										type="button"
										onClick={handleRemoveFile}
										className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
									>
										<svg
											className="w-5 h-5"
											fill="none"
											stroke="currentColor"
											viewBox="0 0 24 24"
										>
											<path
												strokeLinecap="round"
												strokeLinejoin="round"
												strokeWidth={2}
												d="M6 18L18 6M6 6l12 12"
											/>
										</svg>
									</button>
								</div>
							) : (
								<div className="text-center">
									<svg
										className="mx-auto h-12 w-12 text-gray-400"
										fill="none"
										stroke="currentColor"
										viewBox="0 0 24 24"
									>
										<path
											strokeLinecap="round"
											strokeLinejoin="round"
											strokeWidth={1.5}
											d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
										/>
									</svg>
									<div className="mt-3">
										<label className="cursor-pointer">
											<span className="text-sm font-medium text-blue-600 hover:text-blue-500">
												Choisir un fichier
											</span>
											<input
												type="file"
												accept=".csv"
												onChange={handleFileChange}
												className="sr-only"
											/>
										</label>
										<span className="text-sm text-gray-500">
											{' '}
											ou glisser-déposer
										</span>
									</div>
									<p className="mt-1 text-xs text-gray-500">
										CSV uniquement
									</p>
								</div>
							)}
						</div>
						<p className="mt-2 text-xs text-gray-500">
							Colonnes obligatoires: email, firstName, lastName •
							Optionnelles: userType, phone, network
						</p>
					</div>

					{/* Options */}
					<div className="space-y-4">
						<div className="grid grid-cols-2 gap-4">
							<label className="flex items-start gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
								<input
									type="checkbox"
									checked={sendInviteDefault}
									onChange={(e) =>
										setSendInviteDefault(e.target.checked)
									}
									className="mt-0.5 h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
								/>
								<div>
									<span className="text-sm font-medium text-gray-700">
										Envoyer une invitation
									</span>
									<p className="text-xs text-gray-500 mt-0.5">
										Email avec lien de définition du mot de
										passe
									</p>
								</div>
							</label>

							<label className="flex items-start gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
								<input
									type="checkbox"
									checked={validateDefault}
									onChange={(e) =>
										setValidateDefault(e.target.checked)
									}
									className="mt-0.5 h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
								/>
								<div>
									<span className="text-sm font-medium text-gray-700">
										Valider automatiquement
									</span>
									<p className="text-xs text-gray-500 mt-0.5">
										Activer les comptes sans validation
										manuelle
									</p>
								</div>
							</label>
						</div>

						<div className="grid grid-cols-2 gap-4">
							<Select
								label="Type d'utilisateur par défaut"
								name="defaultUserType"
								value={defaultUserType}
								onChange={(v: string) =>
									setDefaultUserType(
										v as 'agent' | 'apporteur',
									)
								}
								options={[
									{
										value: 'apporteur',
										label: 'Apporteur',
									},
									{ value: 'agent', label: 'Agent' },
								]}
							/>

							<label className="flex items-start gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors self-end">
								<input
									type="checkbox"
									checked={updateIfExists}
									onChange={(e) =>
										setUpdateIfExists(e.target.checked)
									}
									className="mt-0.5 h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
								/>
								<div>
									<span className="text-sm font-medium text-gray-700">
										Mettre à jour si existe
									</span>
									<p className="text-xs text-gray-500 mt-0.5">
										Modifier les utilisateurs existants
									</p>
								</div>
							</label>
						</div>
					</div>

					{/* Actions */}
					<div className="flex justify-end gap-3 pt-2">
						<Button
							variant="outline"
							type="button"
							onClick={handleClose}
							disabled={uploading}
						>
							Annuler
						</Button>
						<Button
							type="submit"
							variant="primary"
							loading={uploading}
							disabled={!file}
						>
							Importer
						</Button>
					</div>
				</form>
			) : (
				<div className="space-y-5">
					<Alert type="success" title="Import terminé">
						<p>
							{result.createdCount || 0} utilisateur(s) créé(s)
							{result.updatedCount
								? ` • ${result.updatedCount} mis à jour`
								: ''}
							{result.errors && result.errors.length > 0
								? ` • ${result.errors.length} erreur(s)`
								: ''}
						</p>
					</Alert>

					{result.created && result.created.length > 0 && (
						<div>
							<h4 className="text-sm font-medium text-gray-700 mb-2">
								Utilisateurs créés
							</h4>
							<div className="bg-gray-50 rounded-lg p-3 max-h-40 overflow-y-auto space-y-1">
								{result.created.map((u) => (
									<div
										key={u.id}
										className="flex items-center gap-2 text-sm text-gray-700"
									>
										<svg
											className="w-4 h-4 text-green-500"
											fill="currentColor"
											viewBox="0 0 20 20"
										>
											<path
												fillRule="evenodd"
												d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
												clipRule="evenodd"
											/>
										</svg>
										{u.email}
									</div>
								))}
							</div>
						</div>
					)}

					{result.errors && result.errors.length > 0 && (
						<div>
							<h4 className="text-sm font-medium text-red-700 mb-2">
								Erreurs
							</h4>
							<div className="bg-red-50 rounded-lg p-3 max-h-40 overflow-y-auto space-y-1">
								{result.errors.map((err, idx) => (
									<div
										key={idx}
										className="flex items-center gap-2 text-sm text-red-600"
									>
										<svg
											className="w-4 h-4 text-red-500 flex-shrink-0"
											fill="currentColor"
											viewBox="0 0 20 20"
										>
											<path
												fillRule="evenodd"
												d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
												clipRule="evenodd"
											/>
										</svg>
										{err}
									</div>
								))}
							</div>
						</div>
					)}

					<div className="flex justify-end gap-3 pt-2">
						<Button
							variant="primary"
							type="button"
							onClick={handleClose}
						>
							Fermer
						</Button>
					</div>
				</div>
			)}
		</Modal>
	);
}

export default ImportUsersModal;
