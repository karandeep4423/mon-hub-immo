'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { FileUpload } from '@/components/ui/FileUpload';
import { Select } from '@/components/ui/CustomSelect';
import { Modal } from '@/components/ui/Modal';
import { useMutation } from '@/hooks/useMutation';
import { authToastSuccess } from '@/lib/utils/authToast';
import { logger } from '@/lib/utils/logger';
import { adminService } from '@/lib/api/adminApi';

interface Props {
	onClose: () => void;
	onCreated: () => void;
}

const CreateUserModal: React.FC<Props> = ({ onClose, onCreated }) => {
	const [firstName, setFirstName] = useState('');
	const [lastName, setLastName] = useState('');
	const [email, setEmail] = useState('');
	const [phone, setPhone] = useState('');
	const [userType, setUserType] = useState('apporteur');
	const [networkName, setNetworkName] = useState('');
	const [isValidated, setIsValidated] = useState(false);
	const [sendInvite, setSendInvite] = useState(true);
	const [sendRandomPassword, setSendRandomPassword] = useState(false);
	// Agent professional fields
	const [agentType, setAgentType] = useState('independent');
	const [tCard, setTCard] = useState('');
	const [sirenNumber, setSirenNumber] = useState('');
	const [rsacNumber, setRsacNumber] = useState('');
	const [collaboratorCertificate, setCollaboratorCertificate] = useState('');
	// identity file left out of payload (requires multipart/upload flow)
	const [identityCardFile, setIdentityCardFile] = useState<File | null>(null);

	const [errors, setErrors] = useState<Record<string, string>>({});

	// Phone validation regex (French format)
	const PHONE_REGEX = /^(?:(?:\+33|0)[1-9])(?:[0-9]{8})$/;

	const validateForm = (): boolean => {
		const newErrors: Record<string, string> = {};

		if (!firstName.trim()) newErrors.firstName = 'Prénom requis';
		if (!lastName.trim()) newErrors.lastName = 'Nom requis';
		if (!email.trim()) newErrors.email = 'Email requis';

		// Phone validation (optional but must be valid if provided)
		if (phone.trim() && !PHONE_REGEX.test(phone.replace(/\s/g, ''))) {
			newErrors.phone = 'Téléphone invalide (format français)';
		}

		// Agent-specific validation
		if (userType === 'agent') {
			if (agentType === 'independent' && !tCard.trim()) {
				newErrors.tCard = 'Carte professionnelle (T card) requise';
			}
			if (agentType === 'commercial' && !sirenNumber.trim()) {
				newErrors.sirenNumber = 'Numéro SIREN requis';
			}
			if (agentType === 'employee' && !collaboratorCertificate.trim()) {
				newErrors.collaboratorCertificate =
					"Certificat d'autorisation requis";
			}
		}

		setErrors(newErrors);
		return Object.keys(newErrors).length === 0;
	};

	const { mutate, loading } = useMutation(
		async (payload: Record<string, unknown>) => {
			return adminService.createUser(payload);
		},
		{
			onSuccess: (response) => {
				// Build feedback message about sent emails
				const emailsSent =
					(response as { data?: { emailsSent?: string[] } })?.data
						?.emailsSent || [];
				const emailMessages: string[] = [];
				if (emailsSent.includes('invite')) {
					emailMessages.push("lien d'invitation");
				}
				if (emailsSent.includes('tempPassword')) {
					emailMessages.push('mot de passe temporaire');
				}
				if (emailsSent.includes('validation')) {
					emailMessages.push('confirmation de validation');
				}

				let successMsg = 'Utilisateur créé avec succès';
				if (emailMessages.length > 0) {
					successMsg += `. Email(s) envoyé(s): ${emailMessages.join(', ')}`;
				}
				authToastSuccess(successMsg);
				onCreated();
				onClose();
			},
			onError: (err: unknown) => {
				logger.error('[CreateUserModal] Error creating user', err);
				// Prefer API-specific message when available — safely traverse unknown shape
				const getNestedString = (obj: unknown, path: string[]) => {
					let cur: unknown = obj;
					for (const k of path) {
						if (
							cur &&
							typeof cur === 'object' &&
							k in (cur as Record<string, unknown>)
						) {
							cur = (cur as Record<string, unknown>)[k];
						} else {
							return undefined;
						}
					}
					return typeof cur === 'string' ? cur : undefined;
				};

				const msg =
					(typeof err === 'string' && err) ||
					(err instanceof Error && err.message) ||
					getNestedString(err, ['message']) ||
					getNestedString(err, [
						'originalError',
						'response',
						'data',
						'message',
					]) ||
					getNestedString(err, [
						'originalError',
						'response',
						'data',
						'error',
					]) ||
					"Erreur lors de la création de l'utilisateur";

				alert(msg);
			},
		},
	);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!validateForm()) {
			return;
		}

		const payload: Record<string, unknown> = {
			firstName: firstName.trim(),
			lastName: lastName.trim(),
			email: email.trim(),
			phone: phone.trim().replace(/\s/g, '') || undefined,
			userType,
			isValidated,
			networkName: networkName.trim() || undefined,
			sendInvite: sendInvite,
			sendRandomPassword: sendRandomPassword,
		};

		// If creating an agent, attach professionalInfo
		if (userType === 'agent') {
			payload.professionalInfo = {
				agentType,
				tCard: tCard || undefined,
				sirenNumber: sirenNumber || undefined,
				rsacNumber: rsacNumber || undefined,
				collaboratorCertificate: collaboratorCertificate || undefined,
				// identityCard: file upload requires separate flow (not handled here)
			};
		}

		await mutate(payload);
	};

	return (
		<Modal
			isOpen={true}
			onClose={onClose}
			title="Nouveau utilisateur"
			size="xl"
		>
			<form onSubmit={handleSubmit} className="space-y-4">
				<div className="grid grid-cols-2 gap-3">
					<Input
						label="Prénom"
						value={firstName}
						onChange={(e) => setFirstName(e.target.value)}
						error={errors.firstName}
					/>
					<Input
						label="Nom"
						value={lastName}
						onChange={(e) => setLastName(e.target.value)}
						error={errors.lastName}
					/>
				</div>
				<div className="grid grid-cols-2 gap-3">
					<Input
						label="Email"
						type="email"
						value={email}
						onChange={(e) => setEmail(e.target.value)}
						error={errors.email}
					/>
					<Input
						label="Téléphone"
						value={phone}
						onChange={(e) => setPhone(e.target.value)}
						error={errors.phone}
					/>
				</div>
				<div className="grid grid-cols-2 gap-3">
					<div>
						<Select
							label="Rôle"
							name="userType"
							value={userType}
							onChange={(v: string) => setUserType(v)}
							options={[
								{ value: 'agent', label: 'Agent' },
								{ value: 'apporteur', label: 'Apporteur' },
								{ value: 'admin', label: 'Admin' },
							]}
						/>
					</div>
					<Input
						label="Nom du réseau (optionnel)"
						value={networkName}
						onChange={(e) => setNetworkName(e.target.value)}
					/>
				</div>{' '}
				{userType === 'agent' && (
					<div className="p-4 bg-gray-50 rounded border">
						<div className="mb-3">
							<div className="text-sm font-medium text-gray-700 mb-1">
								Type d&apos;agent immobilier *
							</div>
							<Select
								label=""
								name="agentType"
								value={agentType}
								onChange={(v: string) => setAgentType(v)}
								options={[
									{
										value: 'independent',
										label: 'Agent immobilier indépendant',
									},
									{
										value: 'commercial',
										label: 'Agent commercial immobilier',
									},
									{
										value: 'employee',
										label: 'Négociateur VRP employé d&apos;agence',
									},
								]}
							/>
						</div>

						{agentType === 'independent' && (
							<div className="space-y-3">
								<Input
									label="Carte professionnelle (T card) *"
									value={tCard}
									onChange={(e) => setTCard(e.target.value)}
									error={errors.tCard}
								/>
								<FileUpload
									label="Carte d'identité"
									onChange={(f) => setIdentityCardFile(f)}
									value={identityCardFile || undefined}
								/>
							</div>
						)}

						{agentType === 'commercial' && (
							<div className="space-y-3">
								<Input
									label="Numéro SIREN *"
									value={sirenNumber}
									onChange={(e) =>
										setSirenNumber(e.target.value)
									}
									error={errors.sirenNumber}
								/>
								<Input
									label="Numéro RSAC"
									value={rsacNumber}
									onChange={(e) =>
										setRsacNumber(e.target.value)
									}
								/>
								<FileUpload
									label="Carte d'identité"
									onChange={(f) => setIdentityCardFile(f)}
									value={identityCardFile || undefined}
								/>
							</div>
						)}

						{agentType === 'employee' && (
							<div className="space-y-3">
								<Input
									label="Certificat d'autorisation *"
									value={collaboratorCertificate}
									onChange={(e) =>
										setCollaboratorCertificate(
											e.target.value,
										)
									}
									error={errors.collaboratorCertificate}
								/>
								<FileUpload
									label="Carte d'identité"
									onChange={(f) => setIdentityCardFile(f)}
									value={identityCardFile || undefined}
								/>
							</div>
						)}
					</div>
				)}
				<div className="grid grid-cols-2 gap-3">
					<div className="space-y-2">
						<label className="flex items-center gap-2">
							<input
								type="checkbox"
								checked={sendInvite}
								onChange={(e) => {
									setSendInvite(e.target.checked);
									if (e.target.checked)
										setSendRandomPassword(false);
								}}
							/>
							<span className="text-sm text-gray-600">
								Envoyer un lien d&apos;invitation pour définir
								le mot de passe
							</span>
						</label>
						<label className="flex items-center gap-2">
							<input
								type="checkbox"
								checked={sendRandomPassword}
								onChange={(e) => {
									setSendRandomPassword(e.target.checked);
									if (e.target.checked) setSendInvite(false);
								}}
							/>
							<span className="text-sm text-gray-600">
								Générer un mot de passe temporaire et
								l&apos;envoyer par email
							</span>
						</label>
					</div>
				</div>
				<div className="flex items-center gap-3">
					<input
						id="validated"
						type="checkbox"
						checked={isValidated}
						onChange={(e) => setIsValidated(e.target.checked)}
					/>
					<label
						htmlFor="validated"
						className="text-sm text-gray-600"
					>
						Valider ce compte (son e-mail sera envoyé si validé)
					</label>
				</div>
				<div className="flex gap-3 justify-end pt-2">
					<Button variant="secondary" type="button" onClick={onClose}>
						Annuler
					</Button>
					<Button type="submit" variant="primary" disabled={loading}>
						Créer
					</Button>
				</div>
			</form>
		</Modal>
	);
};

export default CreateUserModal;
