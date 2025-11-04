'use client';

import { useState } from 'react';
import useSWR from 'swr';
import { ColumnDef, useReactTable, getCoreRowModel, flexRender } from '@tanstack/react-table';
import { fetcher } from '../../../lib/api/fetcher';

import { Button, Input, Select, Modal } from '@/components/ui'; // Assume tes UI components

export default function AdminUsersPage() {
  const [filters, setFilters] = useState({ name: '', network: '', status: '' });
  const [sortBy, setSortBy] = useState('annoncesAsc');
  const [selectedUser, setSelectedUser] = useState(null); // Pour modals
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showActivityModal, setShowActivityModal] = useState(false);

  const { data: users, mutate } = useSWR(`/api/admin/users?name=${filters.name}&network=${filters.network}&status=${filters.status}&sortBy=${sortBy}`, fetcher);

  const columns: ColumnDef<any>[] = [
    { accessorKey: 'firstName', header: 'Prénom' },
    { accessorKey: 'lastName', header: 'Nom' },
    { accessorKey: 'email', header: 'Email' },
    { accessorKey: 'userType', header: 'Statut' },
    { accessorKey: 'professionalInfo.network', header: 'Réseau' },
    { accessorKey: 'annoncesCount', header: 'Annonces' },
    { accessorKey: 'collabInProgress', header: 'Collabs en cours' },
    { accessorKey: 'collabClosed', header: 'Collabs clôturées' },
    {
      id: 'actions',
      cell: ({ row }) => (
        <div className="flex gap-2">
          <Button onClick={() => handleViewProfile(row.original._id)}>Profil</Button>
          <Button onClick={() => handleViewActivity(row.original._id)}>Activité</Button>
          <Button onClick={() => handleValidate(row.original._id)}>Valider</Button>
          <Button variant="destructive" onClick={() => handleSuspend(row.original._id)}>Suspendre</Button>
          <Button onClick={() => handleResetPw(row.original._id)}>Réinit MDP</Button>
          <Button variant="destructive" onClick={() => handleDelete(row.original._id)}>Supprimer</Button>
        </div>
      ),
    },
  ];

  const table = useReactTable({
    data: users || [],
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  // Handlers pour actions (fetch/post)
  const handleViewProfile = async (id: string) => {
    const profile = await fetcher(`/api/admin/users/${id}/profile`);
    setSelectedUser(profile.user);
    setShowProfileModal(true);
  };

  const handleViewActivity = async (id: string) => {
    const activity = await fetcher(`/api/admin/users/${id}/activity`);
    setSelectedUser(activity.activity);
    setShowActivityModal(true);
  };

  const handleValidate = async (id: string) => {
    await fetcher(`/api/admin/users/validate/${id}`, { method: 'POST' });
    mutate();
  };

  const handleSuspend = async (id: string) => {
    await fetcher(`/api/admin/users/suspend/${id}`, { method: 'POST', body: JSON.stringify({ reason: 'Admin suspend' }) });
    mutate();
  };

  const handleResetPw = async (id: string) => {
    await fetcher(`/api/admin/users/reset-password/${id}`, { method: 'POST' });
    // Alert success
  };

  const handleDelete = async (id: string) => {
    if (confirm('Confirmer suppression ?')) {
      await fetcher(`/api/admin/users/${id}`, { method: 'DELETE' });
      mutate();
    }
  };

  const handleExport = () => {
    window.location.href = '/api/admin/users/export';
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const formData = new FormData();
    formData.append('file', e.target.files[0]);
    await fetcher('/api/admin/users/import', { method: 'POST', body: formData });
    mutate();
  };

  // Filtres UI
  return (
    <div>
      <h2>Gestion Utilisateurs</h2>
      <div className="flex gap-4 mb-4">
        <Input placeholder="Nom" value={filters.name} onChange={e => setFilters({ ...filters, name: e.target.value })} />
        <Select value={filters.network} onChange={e => setFilters({ ...filters, network: e.target.value })}>
          {/* Options réseaux from enum */}
        </Select>
        <Select value={filters.status} onChange={e => setFilters({ ...filters, status: e.target.value })}>
          <option value="agent">Agent</option>
          <option value="apporteur">Apporteur</option>
        </Select>
        <Select value={sortBy} onChange={e => setSortBy(e.target.value)}>
          <option value="annoncesAsc">Annonces croissant</option>
          <option value="annoncesDesc">Annonces décroissant</option>
          {/* Ajoute pour collabs */}
        </Select>
        <Button onClick={handleExport}>Export CSV</Button>
        <Input type="file" onChange={handleImport} />
      </div>

      <table>
        <thead>{table.getHeaderGroups().map(headerGroup => (
          <tr key={headerGroup.id}>{headerGroup.headers.map(header => (
            <th key={header.id}>{flexRender(header.column.columnDef.header, header.getContext())}</th>
          ))}</tr>
        ))}</thead>
        <tbody>{table.getRowModel().rows.map(row => (
          <tr key={row.id}>{row.getVisibleCells().map(cell => (
            <td key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</td>
          ))}</tr>
        ))}</tbody>
      </table>

      {/* Modal Profile */}
      <Modal open={showProfileModal} onClose={() => setShowProfileModal(false)}>
        {selectedUser && (
          <div>
            <p>Contact: {selectedUser.email} / {selectedUser.phone}</p>
            <p>RSAC/SIREN: {selectedUser.professionalInfo?.siretNumber}</p>
            <p>Réseau: {selectedUser.professionalInfo?.network}</p>
            <p>Date inscription: {selectedUser.createdAt}</p>
          </div>
        )}
      </Modal>

      {/* Modal Activité */}
      <Modal open={showActivityModal} onClose={() => setShowActivityModal(false)}>
        {selectedUser && (
          <div>
            <p>Annonces postées: {selectedUser.annoncesCount}</p>
            <p>Collaborations en cours: {selectedUser.collabInProgress}</p>
            <p>Collaborations clôturées: {selectedUser.collabClosed}</p>
            <p>Connexions: {selectedUser.connexionsCount}</p>
          </div>
        )}
      </Modal>
    </div>
  );
}