import React, { useState } from 'react';

interface Filters {
  name: string;
  userType: string;
  network: string;
  isValidated: string;
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
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const v = { ...local, [e.target.name]: e.target.value };
    setLocal(v);
    onChange(v);
  };

  return (
    <div className="flex gap-4 mb-4">
      <input name="name" placeholder="Recherche nom..." value={local.name} onChange={handleChange} className="p-2 border rounded" />
      <select name="userType" value={local.userType} onChange={handleChange} className="p-2 border rounded">
        <option value="">Tous statuts</option>
        <option value="agent">Agent</option>
        <option value="apporteur">Apporteur</option>
        <option value="admin">Admin</option>
      </select>
      <input name="network" placeholder="Réseau..." value={local.network} onChange={handleChange} className="p-2 border rounded" />
      <select name="isValidated" value={local.isValidated} onChange={handleChange} className="p-2 border rounded">
        <option value="">Tous</option>
        <option value="true">Validé</option>
        <option value="false">Non validé</option>
      </select>
    </div>
  );
}
