"use client";

import React, { useState } from 'react';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/CustomSelect';

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
  <div className="flex flex-col sm:flex-row gap-3 mb-4 flex-wrap">
    <div className="w-full sm:flex-1 min-w-40">
    <Input name="name" placeholder="Nom" value={local.name} onChange={handleChange} />
    </div>
    <div className="w-full sm:flex-1 min-w-40">
    <Input name="email" placeholder="Email" value={local.email} onChange={handleChange} type="email" />
    </div>
    <div className="w-full sm:flex-1 min-w-40">
    <Select
      name="userType"
      value={local.userType}
      onChange={(val) => { const v = { ...local, userType: val }; setLocal(v); onChange(v); }}
      options={[
      { value: '', label: 'Tous' },
      { value: 'agent', label: 'Agent' },
      { value: 'apporteur', label: 'Apporteur' },
      { value: 'admin', label: 'Admin' }
      ]}
    />
    </div>
    <div className="w-full sm:flex-1 min-w-40">
    <Input name="network" placeholder="Réseau" value={local.network} onChange={handleChange} />
    </div>
    <div className="w-full sm:flex-1 min-w-40">
    <Select
      name="isValidated"
      value={local.isValidated}
      onChange={(val) => { const v = { ...local, isValidated: val }; setLocal(v); onChange(v); }}
      options={[
      { value: '', label: 'Tous' },
      { value: 'true', label: 'Validé' },
      { value: 'false', label: 'Non validé' }
      ]}
    />
    </div>
  </div>
  );
}
