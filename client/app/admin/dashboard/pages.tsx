/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import React from "react";
import { useRouter } from 'next/navigation';
import { Users, Home, Handshake, DollarSign } from 'lucide-react';

// Types des props à adapter selon ton backend :
interface DashboardStats {
  agentsTotal: number;
  agentsActive: number;
  agentsPending: number;
  agentsUnsubscribed: number;
  propertiesActive: number;
  propertiesArchived: number;
  propertiesInCollab: number;
  collabOpen: number;
  collabClosed: number;
  feesTotal: number; // Frais d'agence cumulés
  topNetworks: Array<{ name: string, count: number }>;
  topRegions: Array<{ name: string, count: number }>;
}

interface DashboardAdminProps {
  stats?: DashboardStats;
}

export function DashboardAdmin({ stats: initialStats }: DashboardAdminProps) {
  const [stats, setStats] = React.useState<DashboardStats | null>(initialStats || null);
  const [loading, setLoading] = React.useState<boolean>(!initialStats);
  const [rawData, setRawData] = React.useState<any>(null);

  React.useEffect(() => {
    if (initialStats) return;
    let mounted = true;
    setLoading(true);
    // Fetch directly from backend server
    const API_ROOT = (() => {
      const raw = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
      return raw.replace(/\/+$/, '').replace(/\/api$/i, '');
    })();
    fetch(`${API_ROOT}/api/admin/stats`, { credentials: 'include' })
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((data) => {
        if (!mounted) return;
        // Keep raw response for debugging
        setRawData(data);
        // Map backend shape to DashboardStats expected shape
        // Some deployments return a minimal payload like:
        // { usersCount: 50, propertiesCount: 42, collaborationsCount: 69 }
        const mapped: DashboardStats = {
          agentsTotal: (data.usersCount ?? data.agentsTotal) ?? 0,
          agentsActive: data.agentsActive ?? 0,
          agentsPending: data.agentsPending ?? 0,
          agentsUnsubscribed: data.agentsUnsubscribed ?? 0,
          propertiesActive: (data.propertiesCount ?? data.propertiesActive) ?? 0,
          propertiesArchived: data.propertiesArchived ?? 0,
          propertiesInCollab: data.propertiesInCollab ?? 0,
          collabOpen: (data.collaborationsCount ?? data.collabOpen) ?? 0,
          collabClosed: data.collabClosed ?? 0,
          feesTotal: data.feesTotal ?? 0,
          topNetworks: data.topNetworks ?? [],
          topRegions: data.topRegions ?? [],
        };

        setStats(mapped);
      })
      .catch((err) => {
        console.error('Failed to load admin stats', err);
      })
      .finally(() => mounted && setLoading(false));

    return () => {
      mounted = false;
    };
  }, [initialStats]);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-2xl font-bold mb-6">Tableau de bord plateforme</h1>
        <p>Chargement des statistiques…</p>
        {rawData && (
          <div className="mt-4 p-4 bg-gray-100 rounded text-sm">
            <strong>DEBUG - raw response:</strong>
            <pre className="whitespace-pre-wrap break-words mt-2">{JSON.stringify(rawData, null, 2)}</pre>
          </div>
        )}
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-2xl font-bold mb-6">Tableau de bord plateforme</h1>
        <p>Aucune statistique disponible.</p>
        {rawData && (
          <div className="mt-4 p-4 bg-gray-100 rounded text-sm">
            <strong>DEBUG - raw response:</strong>
            <pre className="whitespace-pre-wrap break-words mt-2">{JSON.stringify(rawData, null, 2)}</pre>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4">
      <h1 className="text-2xl font-bold mb-6">
        Tableau de bord plateforme
      </h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
        {/* AGENTS */}
        <div className="bg-white rounded-xl shadow-md flex flex-col justify-between p-6 border-l-4 border-blue-500">
          <div className="flex items-center gap-2 text-blue-700 font-bold text-lg mb-1">
            <Users className="w-6 h-6 opacity-70 mr-1 text-blue-600" />
            Agents inscrits
          </div>
          <div className="text-4xl font-extrabold mb-2">
            {stats.agentsTotal}
          </div>
          <div className="text-xs flex flex-wrap gap-3">
            <Badge text="Actifs" value={stats.agentsActive} color="green" />
            <Badge text="En attente" value={stats.agentsPending} color="yellow" />
            <Badge text="Désabonnés" value={stats.agentsUnsubscribed} color="red" />
          </div>
        </div>
        {/* PROPRIÉTÉS */}
        <div className="bg-white rounded-xl shadow-md flex flex-col justify-between p-6 border-l-4 border-indigo-500">
          <div className="flex items-center gap-2 text-indigo-700 font-bold text-lg mb-1">
            <Home className="w-6 h-6 opacity-80 mr-1 text-indigo-600" />
            Annonces
          </div>
          <div className="text-4xl font-extrabold mb-2">
            {stats.propertiesActive}
          </div>
          <div className="text-xs flex flex-wrap gap-3">
            <Badge text="Archivées" value={stats.propertiesArchived} color="gray" />
            <Badge text="En collaboration" value={stats.propertiesInCollab} color="blue" />
          </div>
        </div>
        {/* COLLABORATIONS */}
        <div className="bg-white rounded-xl shadow-md flex flex-col justify-between p-6 border-l-4 border-purple-500">
          <div className="flex items-center gap-2 text-purple-800 font-bold text-lg mb-1">
            <Handshake className="w-6 h-6 opacity-80 mr-1 text-purple-600" />
            Collaborations
          </div>
          <div className="text-4xl font-extrabold mb-2">{stats.collabOpen}</div>
          <div className="text-xs flex flex-wrap gap-3">
            <Badge text="Clôturées" value={stats.collabClosed} color="purple"/>
          </div>
        </div>
        {/* FRAIS D'AGENCE */}
        <div className="bg-white rounded-xl shadow-md flex flex-col justify-between p-6 border-l-4 border-pink-500">
          <div className="flex items-center gap-2 text-pink-700 font-bold text-lg mb-1">
            <DollarSign className="w-6 h-6 opacity-80 mr-1 text-pink-600" />
            Volume total des frais (€)
          </div>
          <div className="text-3xl font-extrabold mb-2">
            {stats.feesTotal.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
          </div>
        </div>
      </div>
      {/* STATS PAR RÉSEAU / REGION */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <StatList title="Top réseaux" items={stats.topNetworks} color="blue" />
        <StatList title="Top régions/villes" items={stats.topRegions} color="indigo" />
      </div>
      {/* ACTIONS / NAVIGATION */}
      <div className="flex flex-wrap gap-4 justify-center">
        <NavButton href="/admin/users" icon={<Users className="w-6 h-6" />} label="Gestion utilisateurs" />
        <NavButton href="/admin/properties" icon={<Home className="w-6 h-6" />} label="Gestion annonces" />
        <NavButton href="/admin/collaborations" icon={<Handshake className="w-6 h-6" />} label="Collaborations" />
      </div>
    </div>
  );
}

// Badge composant
function Badge({ text, value, color }: { text: string, value: number, color?: string }) {
  const colorMap: Record<string, string> = {
    green: "bg-green-100 text-green-800",
    yellow: "bg-yellow-100 text-yellow-700",
    red: "bg-red-100 text-red-700",
    blue: "bg-blue-100 text-blue-800",
    gray: "bg-gray-100 text-gray-700",
    purple: "bg-purple-200 text-purple-800",
    indigo: "bg-indigo-100 text-indigo-700",
    pink: "bg-pink-100 text-pink-700"
  };
  return (
    <span className={`inline-block px-2 py-1 rounded-full font-semibold mr-2 ${colorMap[color ?? 'gray']}`}>
      {text} : {value}
    </span>
  );
}

// Liste stat réseau/région
function StatList({ title, items, color } : { title: string, items: Array<{ name: string, count: number }>, color: string }) {
  return (
    <div className="bg-white p-4 rounded-xl shadow-md border-l-4" style={{ borderColor: color }}>
      <h3 className={`text-lg font-semibold mb-2 text-${color}-700`}>{title}</h3>
      <ul className="space-y-1">
        {items.map(item => (
          <li key={item.name} className="flex justify-between">
            <span>{item.name}</span>
            <span className={`font-bold`}>{item.count}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

// Bouton navigation stylé
function NavButton({ href, label, icon }: { href: string, label: string, icon?: React.ReactNode }) {
  const router = useRouter();
  return (
    <button
      onClick={() => router.push(href)}
      className="bg-gradient-to-r from-gray-100 via-blue-50 to-white border border-blue-200 px-5 py-3 rounded-xl shadow-md flex items-center gap-2 text-blue-900 font-semibold hover:from-blue-200 transition hover:scale-105 active:scale-100 focus:outline-none"
    >
      <span className="text-2xl">{icon}</span>
      {label}
    </button>
  );
}
