"use client";

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ProfileAvatar } from '@/components/ui/ProfileAvatar';
 
interface UserProfile {
  _id: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string | null;
  userType?: string;
  profileImage?: string | null;
  isValidated?: boolean;
  isBlocked?: boolean;
  professionalInfo?: {
    network?: string;
    identityCard?: { url?: string; key?: string; uploadedAt?: string } | null;
  } | null;
  propertiesCount?: number;
  collaborationsActive?: number;
  collaborationsClosed?: number;
}

export default function AdminUserProfile() {
  const { id } = useParams();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    setError(null);
    fetch(`http://localhost:4000/api/admin/users/${id}`, { credentials: 'include' })
      .then(r => r.ok ? r.json() : r.text().then(txt => { throw new Error(txt); }))
      .then((data) => {
        if ('error' in data) setError(String(data.error));
        else setUser(data);
        setLoading(false);
      })
      .catch(() => {
        setError("Erreur lors du chargement du profil utilisateur.");
        setLoading(false);
      });
  }, [id]);

  if (loading) return <div>Chargement...</div>;
  if (error || !user) return <div>{error ?? "Utilisateur introuvable."}</div>;

  return (
    <div className="max-w-2xl mx-auto bg-white p-8 rounded-2xl shadow-xl mt-8">
      <div className="mb-4">
        <Link href="/admin/users" className="text-sm text-gray-600 hover:underline">← Retour à la gestion utilisateurs</Link>
      </div>
      <h1 className="text-2xl font-bold mb-6 text-[#009CD8]">Profil utilisateur</h1>
      <div className="space-y-4">
        <div><b>Nom :</b> {user.firstName} {user.lastName}</div>
        <div><b>Email :</b> {user.email}</div>
        <div><b>Téléphone :</b> {user.phone ?? "-"}</div>
        <div>
          <b>Bloqué :</b>{' '}
          {user.isBlocked
            ? <span className="text-red-600 font-bold">Oui</span>
            : <span className="text-green-600 font-bold">Non</span>}
          <div className="mt-2">
            {user.isBlocked ? (
              <button
                className="px-3 py-1 bg-green-50 text-green-700 rounded-md border border-green-100"
                onClick={async () => {
                  try {
                    await fetch(`http://localhost:4000/api/admin/users/${id}/unblock`, {
                      method: 'POST',
                      credentials: 'include',
                    });
                    // reload the profile
                    window.location.reload();
                  } catch (err) {
                    console.error(err);
                    alert('Erreur lors du déblocage');
                  }
                }}
              >
                Débloquer
              </button>
            ) : (
              <button
                className="px-3 py-1 bg-amber-50 text-amber-700 rounded-md border border-amber-100"
                onClick={async () => {
                  if (!confirm('Bloquer cet utilisateur ?')) return;
                  try {
                    await fetch(`http://localhost:4000/api/admin/users/${id}/block`, {
                      method: 'POST',
                      credentials: 'include',
                    });
                    window.location.reload();
                  } catch (err) {
                    console.error(err);
                    alert('Erreur lors du blocage');
                  }
                }}
              >
                Bloquer
              </button>
            )}
          </div>
        </div>
        <div><b>Rôle :</b> {user.userType}</div>
        <div><b>Réseau :</b> {user.professionalInfo?.network ?? '-'}</div>
        <div>
          <b>Validé :</b>{' '}
          {user.isValidated
            ? <span className="text-green-600 font-bold">✔</span>
            : <span className="text-red-600 font-bold">✖</span>}
          <div className="mt-2">
            {user.isValidated ? (
              <button
                className="px-3 py-1 bg-amber-50 text-amber-700 rounded-md border border-amber-100"
                onClick={async () => {
                  if (!confirm('Retirer la validation de ce compte ?')) return;
                  try {
                    await fetch(`http://localhost:4000/api/admin/users/${id}/validate`, {
                      method: 'PUT',
                      credentials: 'include',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ value: false }),
                    });
                    window.location.reload();
                  } catch (err) {
                    console.error(err);
                    alert('Erreur lors de la mise à jour');
                  }
                }}
              >
                Retirer validation
              </button>
            ) : (
              <button
                className="px-3 py-1 bg-green-50 text-green-700 rounded-md border border-green-100"
                onClick={async () => {
                  if (!confirm('Valider ce compte ?')) return;
                  try {
                    await fetch(`http://localhost:4000/api/admin/users/${id}/validate`, {
                      method: 'PUT',
                      credentials: 'include',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ value: true }),
                    });
                    window.location.reload();
                  } catch (err) {
                    console.error(err);
                    alert('Erreur lors de la mise à jour');
                  }
                }}
              >
                Valider
              </button>
            )}
          </div>
        </div>
        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-8">
          <StatCard label="Annonces" value={user.propertiesCount} color="blue" />
          <StatCard label="Collab. actives" value={user.collaborationsActive} color="green" />
          <StatCard label="Collab. clôturées" value={user.collaborationsClosed} color="purple" />
        </div>
        {/* Documents & attachments */}
        <div className="mt-8">
          <h2 className="text-lg font-semibold mb-3">Documents & pièces jointes</h2>

          {/* Profile image preview */}
          {user.profileImage ? (
            <div className="mb-4">
              <div className="text-sm text-gray-600 mb-2">Photo de profil</div>
              <img src={user.profileImage} alt="Profile" className="max-w-xs rounded-lg shadow" />
              <div className="mt-2">
                <a href={user.profileImage} target="_blank" rel="noreferrer" className="text-sm text-blue-600 underline">Ouvrir / Télécharger</a>
              </div>
            </div>
          ) : null}

          {/* Identity card */}
          {user.professionalInfo?.identityCard?.url ? (
            <div>
              <div className="text-sm text-gray-600 mb-2">Carte d&apos;identité</div>
              <AttachmentPreview url={user.professionalInfo.identityCard.url} />
            </div>
          ) : (
            <div className="text-sm text-gray-500">Aucune pièce d&apos;identité fournie</div>
          )}
        </div>
      </div>
    </div>
  );
}

// Card résumé stat
function StatCard({ label, value, color }: { label: string; value?: number; color: string }) {
  return (
    <div className={`rounded-xl p-5 shadow bg-${color}-50 text-${color}-700 flex flex-col`}>
      <span className="font-bold text-lg">{label}</span>
      <span className="text-2xl font-extrabold">{value ?? 0}</span>
    </div>
  );
}

// Small helper component to preview attachments (image or pdf/other)
function AttachmentPreview({ url }: { url: string }) {
  const isImage = (u: string) => /\.(jpg|jpeg|png|webp|gif|svg)(\?.*)?$/i.test(u);
  const isPdf = (u: string) => /\.(pdf)(\?.*)?$/i.test(u);

  if (isImage(url)) {
    return (
      <div>
        <img src={url} alt="attachment" className="max-w-xs rounded shadow" />
        <div className="mt-2">
          <a href={url} target="_blank" rel="noreferrer" className="text-sm text-blue-600 underline">Ouvrir / Télécharger</a>
        </div>
      </div>
    );
  }

  if (isPdf(url)) {
    return (
      <div>
        <iframe src={url} title="pdf" className="w-full h-64 border rounded" />
        <div className="mt-2">
          <a href={url} target="_blank" rel="noreferrer" className="text-sm text-blue-600 underline">Ouvrir / Télécharger</a>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="text-sm">Fichier: <a href={url} target="_blank" rel="noreferrer" className="text-blue-600 underline">Télécharger</a></div>
    </div>
  );
}
