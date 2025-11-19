"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { FileUpload } from '@/components/ui/FileUpload';
import { Select } from '@/components/ui/CustomSelect';
import { useMutation } from "@/hooks/useMutation";
import { authToastSuccess } from "@/lib/utils/authToast";
import { logger } from "@/lib/utils/logger";

interface Props {
  onClose: () => void;
  onCreated: () => void;
}

const CreateUserModal: React.FC<Props> = ({ onClose, onCreated }) => {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [userType, setUserType] = useState("apporteur");
  const [profileImage, setProfileImage] = useState("");
  const [isValidated, setIsValidated] = useState(false);
  const [password, setPassword] = useState("");
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

  const { mutate, loading } = useMutation(async (payload: any) => {
    // Use generic POST to admin create user
    const res = await fetch("http://localhost:4000/api/admin/users/create", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
  }, { 
    onSuccess: () => {
      authToastSuccess('Utilisateur créé avec succès');
      onCreated();
      onClose();
    },
    onError: (err) => {
      logger.error('[CreateUserModal] Error creating user', err);
      // Prefer API-specific message when available
      try {
        // err is ApiError
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const apiErr: any = err;
        const msg = apiErr?.message || apiErr?.originalError?.response?.data?.message || apiErr?.originalError?.response?.data?.error || 'Erreur lors de la création de l\'utilisateur';
        alert(msg);
      } catch (e) {
        alert('Erreur lors de la création de l\'utilisateur');
      }
    }
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !firstName || !lastName) {
      alert('Prénom / Nom / Email requis');
      return;
    }
    if (!password && !sendInvite && !sendRandomPassword) {
      alert('Fournissez un mot de passe, ou cochez Envoyer invitation, ou cochez Générer mot de passe temporaire');
      return;
    }

    const payload: any = {
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: email.trim(),
      phone: phone.trim() || undefined,
      userType,
      profileImage: profileImage.trim() || undefined,
      isValidated,
      password: password || undefined,
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto p-6">
        <div className="flex items-center justify-between mb-4 sticky top-0 bg-white">
          <h3 className="text-lg font-semibold">Nouveau utilisateur</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">✕</button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <Input label="Prénom" value={firstName} onChange={(e) => setFirstName(e.target.value)} />
            <Input label="Nom" value={lastName} onChange={(e) => setLastName(e.target.value)} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Input label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
            <Input label="Téléphone" value={phone} onChange={(e) => setPhone(e.target.value)} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <label className="block">
              <div className="text-sm font-medium text-gray-700 mb-1">Rôle</div>
              <select value={userType} onChange={(e) => setUserType(e.target.value)} className="w-full px-3 py-2 border rounded">
                <option value="agent">Agent</option>
                <option value="apporteur">Apporteur</option>
                <option value="admin">Admin</option>
              </select>
            </label>
            <Input label="Image de profil (URL)" value={profileImage} onChange={(e) => setProfileImage(e.target.value)} />
          </div>

          {userType === 'agent' && (
            <div className="p-4 bg-gray-50 rounded border">
              <div className="mb-3">
                <div className="text-sm font-medium text-gray-700 mb-1">Type d'agent immobilier *</div>
                <Select
                  label=""
                  name="agentType"
                  value={agentType}
                  onChange={(v: string) => setAgentType(v)}
                  options={[
                    { value: 'independent', label: 'Agent immobilier indépendant' },
                    { value: 'commercial', label: 'Agent commercial immobilier' },
                    { value: 'employee', label: "Négociateur VRP employé d'agence" },
                  ]}
                />
              </div>

              {agentType === 'independent' && (
                <div className="space-y-3">
                  <Input label="Carte professionnelle (T card) *" value={tCard} onChange={(e) => setTCard(e.target.value)} />
                  <FileUpload label="Carte d'identité" onChange={(f) => setIdentityCardFile(f)} value={identityCardFile || undefined} />
                </div>
              )}

              {agentType === 'commercial' && (
                <div className="space-y-3">
                  <Input label="Numéro SIREN *" value={sirenNumber} onChange={(e) => setSirenNumber(e.target.value)} />
                  <Input label="Numéro RSAC" value={rsacNumber} onChange={(e) => setRsacNumber(e.target.value)} />
                  <FileUpload label="Carte d'identité" onChange={(f) => setIdentityCardFile(f)} value={identityCardFile || undefined} />
                </div>
              )}

              {agentType === 'employee' && (
                <div className="space-y-3">
                  <Input label="Certificat d'autorisation *" value={collaboratorCertificate} onChange={(e) => setCollaboratorCertificate(e.target.value)} />
                  <FileUpload label="Carte d'identité" onChange={(f) => setIdentityCardFile(f)} value={identityCardFile || undefined} />
                </div>
              )}
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <Input label="Mot de passe (optionnel)" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
            <div className="space-y-2">
              <label className="flex items-center gap-2">
                <input type="checkbox" checked={sendInvite} onChange={(e) => { setSendInvite(e.target.checked); if (e.target.checked) setSendRandomPassword(false); }} />
                <span className="text-sm text-gray-600">Envoyer un lien d'invitation pour définir le mot de passe</span>
              </label>
              <label className="flex items-center gap-2">
                <input type="checkbox" checked={sendRandomPassword} onChange={(e) => { setSendRandomPassword(e.target.checked); if (e.target.checked) setSendInvite(false); }} />
                <span className="text-sm text-gray-600">Générer un mot de passe temporaire et l'envoyer par email</span>
              </label>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <input id="validated" type="checkbox" checked={isValidated} onChange={(e) => setIsValidated(e.target.checked)} />
            <label htmlFor="validated" className="text-sm text-gray-600">Valider ce compte (son email sera envoyé si validé)</label>
          </div>

          <div className="flex gap-3 justify-end pt-2">
            <Button variant="secondary" type="button" onClick={onClose}>Annuler</Button>
            <Button type="submit" variant="primary" disabled={loading}>Créer</Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateUserModal;
