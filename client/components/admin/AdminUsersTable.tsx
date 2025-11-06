import React, { useState, useMemo } from "react";

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
  // Ajoute d'autres champs selon besoin
}

interface AdminUsersTableProps {
  users: AdminUser[];
  loading: boolean;
}

const PAGE_SIZE = 10;

export default function AdminUsersTable({ users, loading }: AdminUsersTableProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<keyof AdminUser | ''>('');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  // Filtres
  const filteredUsers = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    return users.filter(
      (user) =>
        (user.firstName?.toLowerCase() ?? '').includes(term) ||
        (user.lastName?.toLowerCase() ?? '').includes(term) ||
        (user.email?.toLowerCase() ?? '').includes(term)
    );
  }, [users, searchTerm]);

  // Tri
  const sortedUsers = useMemo(() => {
    if (!sortBy) return filteredUsers;
    const sorted = [...filteredUsers].sort((a, b) => {
      const aValue = a[sortBy];
      const bValue = b[sortBy];
      if (typeof aValue === 'string' && typeof bValue === 'string')
        return sortDirection === 'asc'
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      if (typeof aValue === 'number' && typeof bValue === 'number')
        return sortDirection === 'asc' ? aValue - bValue : bValue - aValue;
      return 0;
    });
    return sorted;
  }, [filteredUsers, sortBy, sortDirection]);

  // Pagination
  const totalPages = Math.max(1, Math.ceil(sortedUsers.length / PAGE_SIZE));
  const pagedUsers = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return sortedUsers.slice(start, start + PAGE_SIZE);
  }, [sortedUsers, currentPage]);

  function handleSort(col: keyof AdminUser) {
    if (sortBy === col) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(col);
      setSortDirection('asc');
    }
  }

  if (loading) return <div>Chargement...</div>;

  return (
    <div className="p-6 bg-white rounded-xl shadow-xl max-w-full overflow-x-auto">
      <h2 className="text-xl font-semibold mb-4">Gestion des utilisateurs</h2>
      <input
        type="search"
        placeholder="Recherche par nom ou email..."
        className="mb-4 p-2 border border-gray-300 rounded-md w-full max-w-md focus:ring-2 focus:ring-blue-400"
        value={searchTerm}
        onChange={e => {
          setSearchTerm(e.target.value);
          setCurrentPage(1);
        }}
      />
      <table className="min-w-full table-auto border-collapse text-left rounded overflow-hidden shadow transition-all">
        <thead className="bg-gradient-to-r from-blue-100 via-blue-50 to-white">
          <tr>
            <Th label="Nom" col="firstName" sortBy={sortBy} sortDirection={sortDirection} handleSort={handleSort} />
            <Th label="Email" col="email" sortBy={sortBy} sortDirection={sortDirection} handleSort={handleSort} />
            <Th label="Réseau" col="network" />
            <Th label="Statut" col="userType" sortBy={sortBy} sortDirection={sortDirection} handleSort={handleSort} />
            <Th label="Annonces" col="propertiesCount" sortBy={sortBy} sortDirection={sortDirection} handleSort={handleSort} />
            <Th label="Collabor. actives" col="collaborationsActive" sortBy={sortBy} sortDirection={sortDirection} handleSort={handleSort} />
            <Th label="Collabor. clôturées" col="collaborationsClosed" sortBy={sortBy} sortDirection={sortDirection} handleSort={handleSort} />
            <Th label="Validé" col="isValidated" sortBy={sortBy} sortDirection={sortDirection} handleSort={handleSort} />
            <th className="p-2 font-semibold">Actions</th>
          </tr>
        </thead>
        <tbody>
          {pagedUsers.map(user => (
            <tr key={user._id} className="hover:bg-blue-50 group border-b border-gray-200">
              <td className="p-2">{`${user.firstName ?? ''} ${user.lastName ?? ''}`.trim() || '-'}</td>
              <td className="p-2">{user.email ?? '-'}</td>
              <td className="p-2">{user.professionalInfo?.network ?? '-'}</td>
              <td className="p-2">
                <span className={`px-2 py-1 rounded text-xs font-semibold ${user.userType === "admin" ? "bg-yellow-200 text-yellow-700" : user.userType === "apporteur" ? "bg-purple-100 text-purple-800" : "bg-blue-100 text-blue-800"}`}>
                  {user.userType ?? '-'}
                </span>
              </td>
              <td className="p-2">{user.propertiesCount ?? 0}</td>
              <td className="p-2">{user.collaborationsActive ?? 0}</td>
              <td className="p-2">{user.collaborationsClosed ?? 0}</td>
              <td className="p-2 text-center">
                {user.isValidated
                  ? <span className="text-green-600 font-bold">✔</span>
                  : <span className="text-red-600 font-bold">✖</span>}
              </td>
              <td className="p-2 whitespace-nowrap flex flex-wrap gap-2">
                <ButtonAction type="primary" onClick={() => alert('Voir Profil non implémenté')}>Voir</ButtonAction>
                <ValidateButton user={user} />
                <ButtonAction type="warning" onClick={() => alert('Suspendre non implémenté')}>Suspendre</ButtonAction>
                <ButtonAction type="danger" onClick={() => alert('Supprimer non implémenté')}>Supprimer</ButtonAction>
                <ButtonAction type="secondary" onClick={() => alert('Reset non implémenté')}>Reset MDP</ButtonAction>
              </td>
            </tr>
          ))}
          {!pagedUsers.length && (
            <tr>
              <td colSpan={9} className="text-center p-4 text-gray-500">
                Aucun utilisateur trouvé.
              </td>
            </tr>
          )}
        </tbody>
      </table>
      {/* Pagination */}
      <div className="mt-6 flex justify-center gap-2">
        <button
          className="p-2 px-4 border rounded disabled:opacity-50"
          onClick={() => setCurrentPage(page => Math.max(page - 1, 1))}
          disabled={currentPage === 1}
        >
          Précédent
        </button>
        <span className="text-base pt-2">
          Page {currentPage} sur {totalPages}
        </span>
        <button
          className="p-2 px-4 border rounded disabled:opacity-50"
          onClick={() => setCurrentPage(page => Math.min(page + 1, totalPages))}
          disabled={currentPage === totalPages}
        >
          Suivant
        </button>
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
