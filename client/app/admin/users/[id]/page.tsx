"use client";

import React, { useEffect, useState, useCallback } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { UserProfileModern } from '@/components/admin/UserProfileModern';
import { ArrowLeft } from 'lucide-react';

interface UserProfile {
  _id: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string | null;
  userType?: string;
  profileImage?: string | null;
  isValidated?: boolean;
  isBlocked?: boolean;
  professionalInfo?: {
    network?: string;
    identityCard?: { url?: string; key?: string; uploadedAt?: string } | null;
  } | null;
  propertiesCount?: number;
  collaborationsActive?: number;
  collaborationsClosed?: number;
}

export default function AdminUserProfile() {
  const API_ROOT = (() => {
    const raw = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
    return raw.replace(/\/+$/, '').replace(/\/api$/i, '');
  })();
  const { id } = useParams();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingStats, setLoadingStats] = useState(false);

  const fetchUser = useCallback(() => {
    setLoading(true);
    setError(null);
    fetch(`${API_ROOT}/api/admin/users/${id}`, { credentials: 'include' })
      .then(res => {
        if (!res.ok) {
          throw new Error('Failed to fetch');
        }
        return res.json();
      })
      .then(data => {
        if (data.error) {
          setError(String(data.error));
        } else {
          setUser(data);
          // try to fetch stats if not present
          if (
            (data.propertiesCount == null || data.collaborationsActive == null || data.collaborationsClosed == null)
          ) {
            setLoadingStats(true);
            fetch(`${API_ROOT}/api/admin/users/${id}/stats`, { credentials: 'include' })
              .then(r => (r.ok ? r.json() : null))
              .then(stats => {
                if (stats) {
                  setUser(prev => prev ? { ...prev, ...stats } : prev);
                }
              })
              .catch(() => void 0)
              .finally(() => setLoadingStats(false));
          }
        }
      })
      .catch(() => {
        setError("Erreur lors du chargement du profil utilisateur.");
      })
      .finally(() => {
        setLoading(false);
      });
  }, [id]);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  const handleValidate = async (userId: string, shouldValidate: boolean) => {
    try {
      const response = await fetch(`${API_ROOT}/api/admin/users/${userId}/validate`, {
        method: 'PUT',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ value: shouldValidate }),
      });
      if (!response.ok) throw new Error('Action failed');
      setUser(prevUser => prevUser ? { ...prevUser, isValidated: shouldValidate } : null);
    } catch (err) {
      console.error(err);
      alert('Erreur lors de la mise à jour');
    }
  };

  const handleBlock = async (userId: string, shouldBlock: boolean) => {
    const endpoint = shouldBlock ? 'block' : 'unblock';
    try {
      const response = await fetch(`${API_ROOT}/api/admin/users/${userId}/${endpoint}`, {
        method: 'POST',
        credentials: 'include',
      });
      if (!response.ok) throw new Error('Action failed');
      setUser(prevUser => prevUser ? { ...prevUser, isBlocked: shouldBlock } : null);
    } catch (err) {
      console.error(err);
      alert('Erreur lors de la mise à jour');
    }
  };

  if (loading) return <div className="flex justify-center items-center h-64">Chargement du profil...</div>;
  if (error) return <div className="text-red-500 text-center mt-10">{error}</div>;
  if (!user) return <div className="text-center mt-10">Utilisateur introuvable.</div>;

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="container mx-auto p-4 sm:p-6 lg:p-8">
        <div className="mb-6">
          <Link href="/admin/users" className="flex items-center text-sm text-gray-600 hover:text-gray-900 transition-colors">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Retour à la liste des utilisateurs
          </Link>
        </div>
        <UserProfileModern user={user} onValidate={handleValidate} onBlock={handleBlock} />
      </div>
    </div>
  );
}
