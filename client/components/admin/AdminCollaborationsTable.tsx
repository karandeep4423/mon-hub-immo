/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import React, { useEffect, useState, useMemo } from "react";
import Link from 'next/link';
import { collaborationApi } from '@/lib/api/collaborationApi';

// Adapte l'interface à ce que retourne l'API backend
export interface Collaboration {
  _id: string;
  postType: "Property" | "SearchAd";
  postId: { title?: string } | null; // avec populate: possède title/description
  postOwnerId?: { _id: string; firstName?: string; lastName?: string; profileImage?: string };
  collaboratorId?: { _id: string; firstName?: string; lastName?: string; profileImage?: string };
  status: "pending" | "accepted" | "active" | "completed" | "cancelled" | "rejected";
  proposedCommission?: number;
  compensationType?: string;
  compensationAmount?: number;
  currentProgressStep?: string;
  createdAt?: string;
  updatedAt?: string;
  activities?: Array<Record<string, unknown>>;
}

interface AdminCollaborationsTableProps {
  collaborations: Collaboration[];
  loading: boolean;
}

// Color selon le statut
function statusColor(status: string) {
  switch (status) {
    case "pending": return "bg-yellow-100 text-yellow-800";
    case "accepted": return "bg-blue-100 text-blue-800";
    case "active": return "bg-green-100 text-green-800";
    case "completed": return "bg-gray-100 text-gray-700";
    case "cancelled": return "bg-red-100 text-red-700";
    case "rejected": return "bg-gray-200 text-gray-500";
    default: return "bg-gray-50 text-gray-400";
  }
}

export default function AdminCollaborationsTable({ collaborations, loading }: AdminCollaborationsTableProps) {
  // Local copy so we can update a row after API actions without requiring parent refresh
  const [data, setData] = useState<Collaboration[]>(collaborations || []);
  useEffect(() => setData(collaborations || []), [collaborations]);

  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string | ''>('');
  const [pageSize, setPageSize] = useState<number>(10);

  // Filtrage
  const filtered = useMemo(() => {
    return data.filter((c) => {
      const matchesText =
        (c.postId?.title ?? '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (c.postOwnerId?.firstName ?? '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (c.collaboratorId?.firstName ?? '').toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter ? c.status === statusFilter : true;
      return matchesText && matchesStatus;
    });
  }, [data, searchTerm, statusFilter]);

  // Pagination
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const paged = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, currentPage, pageSize]);

  if (loading) return <div className="p-4 text-center">Chargement collaborations...</div>;

  return (
    <div className="p-6 bg-white rounded-xl shadow-xl max-w-full overflow-x-auto">
      <h2 className="text-2xl font-bold mb-6 text-[#009CD8]">Collaboration en cours / terminées</h2>
      {/* Filtres */}
      <div className="flex gap-4 mb-6">
        <input
          type="search"
          className="p-2 border rounded-md bg-[#F5F9FF]"
          placeholder="Recherche titre, propriétaire, agent, ..."
          value={searchTerm}
          onChange={e => { setSearchTerm(e.target.value); setCurrentPage(1); }}
        />
        <select className="p-2 border rounded-md bg-[#F5F9FF]" value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setCurrentPage(1); }}>
          <option value="">Statut</option>
          <option value="pending">Proposée</option>
          <option value="accepted">Acceptée</option>
          <option value="active">Active</option>
          <option value="completed">Terminée</option>
          <option value="cancelled">Annulée</option>
          <option value="rejected">Rejetée</option>
        </select>
      </div>
      <div className="flex items-center gap-3 mb-4">
        <label className="text-sm">Taille page:</label>
        <select value={pageSize} onChange={(e) => { setPageSize(Number(e.target.value)); setCurrentPage(1); }} className="p-2 border rounded-md bg-[#F5F9FF]">
          <option value={5}>5 / page</option>
          <option value={10}>10 / page</option>
          <option value={20}>20 / page</option>
          <option value={50}>50 / page</option>
        </select>
        <div className="ml-4">
          <label className="text-sm mr-2">Aller à la page:</label>
          <input type="number" min={1} max={totalPages} value={currentPage} onChange={(e) => setCurrentPage(Math.min(Math.max(1, Number(e.target.value || 1)), totalPages))} className="w-20 p-1 border rounded" />
        </div>
      </div>
      {/* Desktop / tablet table */}
      <div className="hidden md:block overflow-x-auto">
        <table className="min-w-full table-auto border-collapse text-left">
          <thead className="bg-[#F5F9FF]">
            <tr>
              <th className="p-2 font-semibold">Titre du bien</th>
              <th className="p-2 font-semibold">Type</th>
              <th className="p-2 font-semibold">Propriétaire</th>
              <th className="p-2 font-semibold">Collaborateur</th>
              <th className="p-2 font-semibold">Statut</th>
              <th className="p-2 font-semibold">Commission (%)</th>
              <th className="p-2 font-semibold">Étape en cours</th>
              <th className="p-2 font-semibold">Créée le</th>
              <th className="p-2 font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {paged.map(collab => (
              <tr key={collab._id} className="border-b hover:bg-[#E0F4FF]">
                <td className="p-2">
                  {collab.postType === 'Property' ? (
                    <Link href={`/property/${(collab.postId as any)?._id || ''}`} className="text-blue-600 hover:underline">{(collab.postId as any)?.address || (collab.postId as any)?.location || collab.postId?.title || '-'}</Link>
                  ) : (
                    collab.postId?.title ?? '-'
                  )}
                </td>
                <td className="p-2">{collab.postType ?? "-"}</td>
                <td className="p-2">{collab.postOwnerId ? (<Link href={`/admin/users/${collab.postOwnerId._id}`} className="text-blue-600 hover:underline">{`${collab.postOwnerId.firstName ?? ""} ${collab.postOwnerId.lastName ?? ""}`}</Link>) : "-"}</td>
                <td className="p-2">{collab.collaboratorId ? (<Link href={`/admin/users/${collab.collaboratorId._id}`} className="text-blue-600 hover:underline">{`${collab.collaboratorId.firstName ?? ""} ${collab.collaboratorId.lastName ?? ""}`}</Link>) : "-"}</td>
                <td className={`p-2 font-bold text-xs rounded-full ${statusColor(collab.status)} w-1 whitespace-nowrap text-center`}>
                  {collab.status.charAt(0).toUpperCase() + collab.status.slice(1)}
                </td>
                <td className="p-2">{collab.proposedCommission ?? "-"}</td>
                <td className="p-2">{collab.currentProgressStep ?? "-"}</td>
                <td className="p-2">{collab.createdAt ? (new Date(collab.createdAt)).toLocaleDateString() : "-"}</td>
                <td className="p-2 flex gap-2">
                  <Link href={`/admin/collaborations/${collab._id}`} className="inline-block">
                    <button className="bg-[#009CD8] text-white rounded px-3 py-1 text-xs hover:scale-105">Voir</button>
                  </Link>
                  <Link href={`/admin/collaborations/${collab._id}#history`} className="inline-block">
                    <button className="bg-gray-100 text-gray-700 rounded px-3 py-1 text-xs hover:scale-105">Historique</button>
                  </Link>
                  <button className="bg-green-100 text-green-800 rounded px-3 py-1 text-xs hover:scale-105" onClick={async () => {
                    if (!confirm('Marquer cette collaboration comme validée ?')) return;
                    try {
                      const res = await collaborationApi.updateProgressStatus(collab._id, { targetStep: 'validated', validatedBy: 'owner' as const });
                      // update local data
                      setData(prev => prev.map(d => d._id === res.collaboration._id ? (res.collaboration as unknown) as Collaboration : d));
                      alert('Collaboration validée');
                    } catch (err) {
                      console.error(err);
                      alert('Échec lors de la validation');
                    }
                  }}>Valider</button>
                  <button className="bg-red-100 text-red-700 rounded px-3 py-1 text-xs hover:scale-105" onClick={async () => {
                    if (!confirm('Clôturer définitivement cette collaboration ? Cette action est irréversible.')) return;
                    try {
                      const res = await collaborationApi.complete(collab._id);
                      setData(prev => prev.map(d => d._id === res.collaboration._id ? (res.collaboration as unknown) as Collaboration : d));
                      alert('Collaboration clôturée');
                    } catch (err) {
                      console.error(err);
                      alert('Échec lors de la clôture');
                    }
                  }}>Clôturer</button>
                  <button className="bg-gray-200 text-[#009CD8] rounded px-3 py-1 text-xs hover:scale-105" onClick={() => alert("Exporter à venir...")}>Exporter</button>
                </td>
              </tr>
            ))}
            {!paged.length && (
              <tr>
                <td colSpan={9} className="text-center p-4 text-gray-500">Aucune collaboration trouvée.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile list view */}
      <div className="md:hidden space-y-4">
        {paged.map(collab => (
          <div key={collab._id} className="p-4 bg-white border rounded-lg shadow-sm">
            <div className="flex justify-between items-start">
              <div>
                <div className="font-semibold">{collab.postId?.title ?? (collab.postType)}</div>
                <div className="text-sm text-gray-500">Propriétaire: {collab.postOwnerId ? `${collab.postOwnerId.firstName ?? ''} ${collab.postOwnerId.lastName ?? ''}` : '-'}</div>
                <div className="text-xs text-gray-400 mt-1">Statut: {collab.status}</div>
              </div>
              <div className="flex flex-col gap-2">
                <Link href={`/admin/collaborations/${collab._id}`} className="inline-block">
                  <button className="bg-[#009CD8] text-white rounded px-3 py-1 text-xs">Voir</button>
                </Link>
                <button className="bg-gray-100 text-gray-700 rounded px-3 py-1 text-xs">Historique</button>
              </div>
            </div>
          </div>
        ))}
      </div>
      {/* Pagination */}
      <div className="mt-6 flex justify-center gap-2">
        <button className="p-2 px-4 border rounded disabled:opacity-50" onClick={() => setCurrentPage(c => Math.max(c - 1, 1))} disabled={currentPage === 1}>Précédent</button>
        <span className="text-base pt-2">Page {currentPage} sur {totalPages}</span>
        <button className="p-2 px-4 border rounded disabled:opacity-50" onClick={() => setCurrentPage(c => Math.min(c + 1, totalPages))} disabled={currentPage === totalPages}>Suivant</button>
      </div>
    </div>
  );
}
