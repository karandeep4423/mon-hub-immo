"use client";

import React, { useState, useMemo } from "react";
import { useRouter } from "next/navigation";

export interface AdminUser {
  _id: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  userType?: string;
  professionalInfo?: { network?: string };
  propertiesCount?: number;
  collaborationsActive?: number;
  collaborationsClosed?: number;
  isValidated?: boolean;
}

interface AdminUsersTableProps {
  users: AdminUser[];
  loading: boolean;
  onEdit?: (user: AdminUser) => void;
  onDelete?: (user: AdminUser) => void;
}


const PAGE_SIZE = 10;
 

export default function AdminUsersTable({ users, loading, onEdit, onDelete }: AdminUsersTableProps) {
  const router = useRouter();
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  // set functions are intentionally unused for now (client-side simple table)
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [sortBy, _setSortBy] = useState<keyof AdminUser | ''>('');
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [sortDirection, _setSortDirection] = useState<'asc' | 'desc'>('asc');

  // Simple filtered list (client-side)
  const filtered = useMemo(() => {
    let list = users || [];
    if (searchTerm.trim()) {
      const s = searchTerm.toLowerCase();
      list = list.filter(u =>
        `${u.firstName ?? ''} ${u.lastName ?? ''} ${u.email ?? ''}`.toLowerCase().includes(s),
      );
    }
    if (sortBy) {
      list = [...list].sort((a, b) => {
        const va = (a as any)[sortBy] ?? '';
        const vb = (b as any)[sortBy] ?? '';
        if (va < vb) return sortDirection === 'asc' ? -1 : 1;
        if (va > vb) return sortDirection === 'asc' ? 1 : -1;
        return 0;
      });
    }
    return list;
  }, [users, searchTerm, sortBy, sortDirection]);

  const start = (currentPage - 1) * PAGE_SIZE;
  const pageItems = filtered.slice(start, start + PAGE_SIZE);
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));

  return (
    <div className="bg-white p-4 rounded shadow">
      <div className="flex justify-between items-center mb-4">
        <input placeholder="Recherche..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="p-2 border rounded w-1/3" />
        <div className="text-sm text-gray-500">{filtered.length} utilisateurs</div>
      </div>
      {/* Desktop / tablet table */}
      <div className="hidden md:block">
        <table className="w-full text-left">
          <thead>
            <tr className="text-sm text-gray-600">
              <th>Nom</th>
              <th>Email</th>
              <th>Type</th>
              <th>Réseau</th>
              <th>Validé</th>
              <th className="text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={6}>Chargement...</td></tr>
            ) : pageItems.length === 0 ? (
              <tr><td colSpan={6}>Aucun utilisateur</td></tr>
            ) : pageItems.map(u => (
              <tr key={u._id} className="border-t">
                <td>{u.firstName} {u.lastName}</td>
                <td>{u.email}</td>
                <td>{u.userType}</td>
                <td>{u.professionalInfo?.network ?? '-'}</td>
                <td>{u.isValidated ? 'Oui' : 'Non'}</td>
                <td className="text-right">
                  <button onClick={() => router.push(`/admin/users/${u._id}`)} className="mr-2 px-3 py-1 bg-gray-200 text-gray-800 rounded hover:bg-gray-300">Voir profil</button>
                  <button onClick={() => onEdit?.(u)} className="mr-2 px-3 py-1 bg-blue-500 text-white rounded">Éditer</button>
                  <button onClick={() => onDelete?.(u)} className="px-3 py-1 bg-red-500 text-white rounded">Supprimer</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile list */}
      <div className="md:hidden space-y-3">
        {loading ? (
          <div>Chargement...</div>
        ) : pageItems.length === 0 ? (
          <div>Aucun utilisateur</div>
        ) : pageItems.map(u => (
          <div key={u._id} className="p-3 bg-white border rounded-lg shadow-sm">
            <div className="flex justify-between items-start">
              <div>
                <div className="font-semibold">{u.firstName} {u.lastName}</div>
                <div className="text-sm text-gray-500">{u.email}</div>
                <div className="text-xs text-gray-400">{u.userType} • {u.professionalInfo?.network ?? '-'}</div>
              </div>
              <div className="text-right space-y-2">
                <button onClick={() => router.push(`/admin/users/${u._id}`)} className="block px-3 py-1 bg-gray-200 text-gray-800 rounded text-xs">Voir</button>
                <button onClick={() => onEdit?.(u)} className="block px-3 py-1 bg-blue-500 text-white rounded text-xs">Éditer</button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="flex justify-between items-center mt-4">
        <div>
          <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} className="px-3 py-1 mr-2 border rounded">Préc</button>
          <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} className="px-3 py-1 border rounded">Suiv</button>
        </div>
        <div className="text-sm text-gray-500">Page {currentPage} / {totalPages}</div>
      </div>
    </div>
  );
}
