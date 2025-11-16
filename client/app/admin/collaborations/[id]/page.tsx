"use client";
import { useParams, useRouter } from 'next/navigation';
import { useCollaboration, ProgressStep, ProgressNote } from '@/hooks/useCollaboration';
import { useState } from 'react';

export default function AdminCollaborationDetail() {
  const { id } = useParams() as { id?: string };
  const router = useRouter();
  const { collaboration, loading, error, adminClose, adminForceComplete } = useCollaboration(id);
  const [actionLoading, setActionLoading] = useState(false);

  if (loading) return <div className="p-6">Chargement de la collaboration...</div>;
  if (error) return <div className="p-6 text-red-600">Erreur: {error}</div>;
  if (!collaboration) return <div className="p-6">Collaboration introuvable.</div>;

  const onClose = async (action: 'cancel' | 'complete') => {
    if (!confirm(`Êtes-vous sûr·e de vouloir ${action === 'cancel' ? 'annuler' : 'clôturer'} cette collaboration ?`)) return;
    setActionLoading(true);
    const res = await adminClose(action);
    setActionLoading(false);
    if (res?.error) alert('Erreur: ' + res.error);
    else {
      alert('Action effectuée');
      router.back();
    }
  };

  const onForceComplete = async () => {
    if (!confirm("Valider l'affaire conclue et clôturer la collaboration ?")) return;
    setActionLoading(true);
    const res = await adminForceComplete();
    setActionLoading(false);
    if (res?.error) alert('Erreur: ' + res.error);
    else {
      alert('Collaboration validée et clôturée');
      router.back();
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-xl shadow my-8">
      <h1 className="text-2xl font-bold text-[#009CD8] mb-4">Détail collaboration</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div>
          <h3 className="font-semibold">Bien / Objet</h3>
          <div>{collaboration.postId?.title ?? collaboration.postType ?? '-'}</div>
        </div>
        <div>
          <h3 className="font-semibold">Statut</h3>
          <div>{collaboration.status ?? '-'}</div>
        </div>
        <div>
          <h3 className="font-semibold">Propriétaire</h3>
          <div>{collaboration.postOwnerId ? `${collaboration.postOwnerId.firstName ?? ''} ${collaboration.postOwnerId.lastName ?? ''}` : '-'}</div>
        </div>
        <div>
          <h3 className="font-semibold">Collaborateur</h3>
          <div>{collaboration.collaboratorId ? `${collaboration.collaboratorId.firstName ?? ''} ${collaboration.collaboratorId.lastName ?? ''}` : '-'}</div>
        </div>
      </div>

      <div className="mb-6">
        <h2 className="text-lg font-semibold mb-3">Historique des échanges</h2>
        <div className="space-y-3">
          {(collaboration.activities ?? []).map(a => (
            <div key={a._id} className="p-3 border rounded">
              <div className="text-sm text-gray-600">{a.createdBy && typeof a.createdBy !== 'string' ? `${a.createdBy.firstName ?? ''} ${a.createdBy.lastName ?? ''}` : a.createdBy}</div>
              <div className="text-sm text-gray-500">{a.createdAt ? new Date(a.createdAt).toLocaleString() : ''}</div>
              <div className="mt-2">{a.message}</div>
            </div>
          ))}
          {!((collaboration.activities ?? []).length) && <div className="text-gray-500">Aucun échange enregistré.</div>}
        </div>
      </div>

      <div className="mb-6">
        <h2 className="text-lg font-semibold mb-3">Progression & notes</h2>
        <div className="space-y-3">
          {(collaboration.progressSteps ?? []).map((s: ProgressStep, idx: number) => (
            <div key={idx} className="p-3 border rounded">
              <div className="font-semibold">{s.stepName ?? s.name ?? `Étape ${idx + 1}`}</div>
              <div className="text-sm text-gray-600">Statut: {s.status ?? '-'}</div>
              {(s.notes ?? []).map((n: ProgressNote) => (
                <div key={n._id} className="mt-2 text-sm border-l pl-3">{n.message} <div className="text-xs text-gray-500">— {typeof n.createdBy !== 'string' && n.createdBy ? `${(n.createdBy as { firstName?: string }).firstName ?? ''} ${(n.createdBy as { lastName?: string }).lastName ?? ''}` : n.createdBy} at {n.createdAt ? new Date(n.createdAt).toLocaleString() : ''}</div></div>
              ))}
            </div>
          ))}
          {!((collaboration.progressSteps ?? []).length) && <div className="text-gray-500">Aucune étape renseignée.</div>}
        </div>
      </div>

      <div className="flex gap-3">
        <button className="bg-red-600 text-white px-4 py-2 rounded" onClick={() => onClose('cancel')} disabled={actionLoading}>Annuler</button>
        <button className="bg-green-600 text-white px-4 py-2 rounded" onClick={() => onClose('complete')} disabled={actionLoading}>Clôturer</button>
        <button className="bg-purple-600 text-white px-4 py-2 rounded" onClick={onForceComplete} disabled={actionLoading}>Valider affaire conclue</button>
        <button className="ml-auto border px-3 py-2 rounded" onClick={() => router.back()}>Retour</button>
      </div>
    </div>
  );
}
