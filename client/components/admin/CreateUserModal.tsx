"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
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
      alert('Erreur lors de la création de l\'utilisateur');
    }
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !firstName || !lastName) {
      alert('Prénom / Nom / Email requis');
      return;
    }
    if (!password && !sendInvite) {
      alert('Fournissez un mot de passe ou cochez Envoyer invitation');
      return;
    }

    const payload = {
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: email.trim(),
      phone: phone.trim() || undefined,
      userType,
      profileImage: profileImage.trim() || undefined,
      isValidated,
      password: password || undefined,
      sendInvite: sendInvite,
    };

    await mutate(payload);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-6">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Nouveau utilisateur</h3>
          <button onClick={onClose} className="text-gray-500">✕</button>
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

          <div className="grid grid-cols-2 gap-3">
            <Input label="Mot de passe (optionnel)" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
            <label className="flex items-center gap-2">
              <input type="checkbox" checked={sendInvite} onChange={(e) => setSendInvite(e.target.checked)} />
              <span className="text-sm text-gray-600">Envoyer un lien d'invitation pour définir le mot de passe</span>
            </label>
          </div>

          <div className="flex items-center gap-3">
            <input id="validated" type="checkbox" checked={isValidated} onChange={(e) => setIsValidated(e.target.checked)} />
            <label htmlFor="validated" className="text-sm text-gray-600">Valider ce compte (son email sera envoyé si validé)</label>
          </div>

          <div className="flex gap-3 justify-end pt-2">
            <Button variant="ghost" type="button" onClick={onClose}>Annuler</Button>
            <Button type="submit" variant="primary" disabled={loading}>Créer</Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateUserModal;
