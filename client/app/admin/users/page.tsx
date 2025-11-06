// app/admin/users/page.tsx
'use client';

import { useState } from 'react';
import { useAdminUsers } from '@/hooks/useAdminUsers';
import AdminUsersTable from '@/components/admin/AdminUsersTable';
import AdminUserFilters from '@/components/admin/AdminUserFilters';

export default function AdminUsersPage() {
  const [filters, setFilters] = useState({});
  const { users, loading } = useAdminUsers(filters);

  return (
    <div className="container mx-auto my-10">
      <h1 className="text-2xl font-bold mb-6">Gestion des utilisateurs</h1>
      <AdminUserFilters onChange={setFilters} />
      <AdminUsersTable users={users} loading={loading} />
    </div>
  );
}
