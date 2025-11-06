// components/admin/AdminUsersTable.tsx
 
import React, { useState } from 'react';
export interface AdminUser {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  userType: string;
  professionalInfo?: { network?: string };
  propertiesCount?: number;
  collaborationsActive?: number;
  collaborationsClosed?: number;
  isValidated?: boolean;
}

interface AdminUsersTableProps {
  users: AdminUser[];
  loading: boolean;
}

export default function AdminUsersTable({ users, loading }: AdminUsersTableProps) {
  if (loading) return <div>Chargement...</div>;

  return (
    <table className="min-w-full bg-white shadow border rounded mt-4">
      <thead>
        <tr>
          <th>Nom</th>
          <th>Email</th>
          <th>Réseau</th>
          <th>Statut</th>
          <th>Annonces</th>
          <th>Collabor. actives</th>
          <th>Collabor. clôturées</th>
          <th>Validé</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        {users.map(user =>
          <tr key={user._id}>
            <td>{user.firstName} {user.lastName}</td>
            <td>{user.email}</td>
            <td>{user.professionalInfo?.network || '-'}</td>
            <td>{user.userType}</td>
            <td>{user.propertiesCount}</td>
            <td>{user.collaborationsActive}</td>
            <td>{user.collaborationsClosed}</td>
            <td>
              {user.isValidated
                ? <span className="text-green-600 font-bold">✔</span>
                : <span className="text-red-600 font-bold">✖</span>}
            </td>
            <td>
              <ValidateButton user={user} />
            </td>
          </tr>
        )}
      </tbody>
    </table>
  );
}

// Sous-composant d'action (validation)
function ValidateButton({ user }: { user: AdminUser }) {
  const updateValidation = async (value: boolean) => {
    await fetch(`/api/admin/users/${user._id}/validate`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ value }),
    });
    // Refresh page ou remonter state selon intégration
    window.location.reload();
  };

  return user.isValidated
    ? <button className="text-red-600" onClick={() => updateValidation(false)}>Dévalider</button>
    : <button className="text-green-600" onClick={() => updateValidation(true)}>Valider</button>;
}
