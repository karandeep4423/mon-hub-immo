"use client";

import React from "react";

export interface UserProfile {
  _id: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  rsac?: string;
  siren?: string;
  professionalInfo?: {
    network?: string;
    // autres champs réseau...
  };
  inscriptionDate?: string;
  totalAnnouncements?: number;
  totalCollaborations?: number;
  lastConnections?: string[]; // dates ou timestamps au format ISO/string
}

interface AdminUserProfileModalProps {
  user: UserProfile | null;
  open: boolean;
  onClose: () => void;
}

export default function AdminUserProfileModal({
  user,
  open,
  onClose,
}: AdminUserProfileModalProps) {
  if (!open || !user) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-lg max-w-xl w-full max-h-[90vh] overflow-y-auto p-6 relative">
        {/* Close Button */}
        <button
          onClick={onClose}
          aria-label="Fermer la modale"
          className="absolute top-4 right-4 text-gray-600 hover:text-gray-900"
        >
          ×
        </button>

        <h2 className="text-xl font-bold mb-4">Détails utilisateur</h2>

        <section className="mb-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <h3 className="font-semibold">Nom complet</h3>
            <p>{`${user.firstName ?? ''} ${user.lastName ?? ''}`.trim() || "-"}</p>
          </div>
          <div>
            <h3 className="font-semibold">Email</h3>
            <p>{user.email || "-"}</p>
          </div>
          <div>
            <h3 className="font-semibold">Téléphone</h3>
            <p>{user.phone || "-"}</p>
          </div>
          <div>
            <h3 className="font-semibold">Réseau</h3>
            <p>{user.professionalInfo?.network || "-"}</p>
          </div>
          <div>
            <h3 className="font-semibold">RSAC</h3>
            <p>{user.rsac || "-"}</p>
          </div>
          <div>
            <h3 className="font-semibold">SIREN</h3>
            <p>{user.siren || "-"}</p>
          </div>
          <div>
            <h3 className="font-semibold">Date d&apos;inscription</h3>
            <p>{user.inscriptionDate ? new Date(user.inscriptionDate).toLocaleDateString() : "-"}</p>
          </div>
        </section>

        <section className="mb-6">
          <h3 className="font-semibold mb-2">Historique d&apos;activité</h3>
          <ul className="list-disc list-inside">
            <li>Annonces postées : {user.totalAnnouncements ?? 0}</li>
            <li>Collaborations : {user.totalCollaborations ?? 0}</li>
            <li>Dernières connexions :</li>
            {user.lastConnections && user.lastConnections.length > 0 ? (
              <ul className="list-disc list-inside ml-4">
                {user.lastConnections.map((dateStr, idx) => (
                  <li key={idx}>{new Date(dateStr).toLocaleString()}</li>
                ))}
              </ul>
            ) : (
              <li>Aucune donnée</li>
            )}
          </ul>
        </section>

        <div className="flex justify-end space-x-4">
          {/* Ajoute ici des boutons d'action supplémentaires si besoin */}
          <button
            onClick={onClose}
            className="px-4 py-2 rounded bg-gray-300 hover:bg-gray-400"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
}
