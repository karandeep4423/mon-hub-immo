"use client";

import React, { useState } from 'react';

interface Filters {
  name: string;
  userType: string;
  network: string;
  isValidated: string;
  email?: string;
}

interface AdminUserFiltersProps {
  onChange: (filters: Filters) => void;
}

export default function AdminUserFilters({ onChange }: AdminUserFiltersProps) {
  const [local, setLocal] = useState<Filters>({
    name: '',
    userType: '',
    network: '',
    isValidated: ''
    ,email: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const v = { ...local, [e.target.name]: e.target.value };
    setLocal(v);
    onChange(v);
  };

  return (
    <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 mb-4 flex-wrap">
      <input name="name" placeholder="Nom..." value={local.name} onChange={handleChange} className="w-full sm:flex-1 sm:min-w-32 p-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-cyan-500" />
      <input name="email" placeholder="Email..." value={local.email} onChange={handleChange} className="w-full sm:flex-1 sm:min-w-32 p-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-cyan-500" />
      <select name="userType" value={local.userType} onChange={handleChange} className="w-full sm:w-auto p-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-cyan-500">
        <option value="">Tous statuts</option>
        <option value="agent">Agent</option>
        <option value="apporteur">Apporteur</option>
        <option value="admin">Admin</option>
      </select>
      <input name="network" placeholder="Réseau..." value={local.network} onChange={handleChange} className="w-full sm:flex-1 sm:min-w-32 p-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-cyan-500" />
      <select name="isValidated" value={local.isValidated} onChange={handleChange} className="w-full sm:w-auto p-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-cyan-500">
        <option value="">Tous</option>
        <option value="true">Validé</option>
        <option value="false">Non validé</option>
      </select>
    </div>
  );
}
