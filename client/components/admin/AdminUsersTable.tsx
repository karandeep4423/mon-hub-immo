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
  const [sortBy, setSortBy] = useState<keyof AdminUser | ''>('');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

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

function Th({ label, col, sortBy, sortDirection, handleSort }: {
  label: string;
  col: keyof AdminUser | 'network';
  sortBy?: string;
  sortDirection?: string;
  handleSort?: (col: keyof AdminUser) => void;
}) {
  if (handleSort && col !== 'network') {
    return (
      <th
        onClick={() => handleSort(col as keyof AdminUser)}
        className="cursor-pointer select-none p-2 font-semibold whitespace-nowrap hover:underline"
      >
        {label}
        {sortBy === col && (sortDirection === 'asc' ? ' ↑' : ' ↓')}
      </th>
    );
  }
  return <th className="p-2 font-semibold whitespace-nowrap">{label}</th>;
}

// Boutons stylisés type Tailwind/Bootstrap
function ButtonAction({ children, onClick, type }: { children: React.ReactNode, onClick?: () => void, type?: 'primary' | 'danger' | 'warning' | 'secondary' }) {
  let cls = 'px-3 py-1 text-xs font-bold rounded shadow focus:outline-none focus:ring transition active:scale-95';
  switch (type) {
    case 'danger':
      cls += ' bg-red-100 text-red-700 hover:bg-red-600 hover:text-white';
      break;
    case 'primary':
      cls += ' bg-blue-100 text-blue-700 hover:bg-blue-600 hover:text-white';
      break;
    case 'warning':
      cls += ' bg-yellow-100 text-yellow-700 hover:bg-yellow-500 hover:text-white';
      break;
    case 'secondary':
      cls += ' bg-gray-200 text-gray-700 hover:bg-gray-400 hover:text-white';
      break;
    default:
      cls += ' bg-white text-blue-700';
      break;
  }
  return (
    <button onClick={onClick} className={cls}>
      {children}
    </button>
  );
}

// Bouton validation
function ValidateButton({ user }: { user: AdminUser }) {
  const updateValidation = async (value: boolean) => {
    try {
      await fetch(`/api/admin/users/${user._id}/validate`, {
        method: 'PUT',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ value }),
      });
      window.location.reload();
    } catch (err) {
      alert('Erreur de validation');
    }
  };
  return user.isValidated
    ? (
      <ButtonAction type="danger" onClick={() => updateValidation(false)}>Dévalider</ButtonAction>
    ) : (
      <ButtonAction type="primary" onClick={() => updateValidation(true)}>Valider</ButtonAction>
    );
}
