"use client";

import React from 'react';
import Link from 'next/link';
import { Users, Home, Handshake, ArrowLeft, DollarSign } from 'lucide-react';

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
	feesTotal: number;
	topNetworks: Array<{ name: string; count: number }>;
	topRegions: Array<{ name: string; count: number }>;
}

export default function DashboardAdmin({ stats }: { stats: DashboardStats }) {
  return (
    <div className="max-w-6xl mx-auto px-4">
      <h1 className="text-3xl font-black mb-10 text-[#009CD8]">Tableau de bord général</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-14">
        <StatCard
          title="Agents inscrits"
          value={stats.agentsTotal}
          details={[
            { label: 'Actifs', value: stats.agentsActive, color: 'bg-green-100 text-green-700' },
            { label: 'En attente', value: stats.agentsPending, color: 'bg-yellow-100 text-yellow-700' },
            { label: 'Désabonnés', value: stats.agentsUnsubscribed, color: 'bg-red-100 text-red-700' },
          ]}
          icon={<Users className="w-10 h-10 text-[#00BCE4]" />}
        />

        <StatCard
          title="Annonces"
          value={stats.propertiesActive}
          details={[
            { label: 'Archivées', value: stats.propertiesArchived, color: 'bg-gray-100 text-gray-700' },
            { label: 'En collaboration', value: stats.propertiesInCollab, color: 'bg-blue-50 text-blue-700' },
          ]}
          icon={<Home className="w-10 h-10 text-[#00BCE4]" />}
        />

        <StatCard
          title="Collaborations"
          value={stats.collabOpen}
          details={[{ label: 'Clôturées', value: stats.collabClosed, color: 'bg-purple-100 text-purple-800' }]}
          icon={<Handshake className="w-10 h-10 text-[#00BCE4]" />}
        />

        <StatCard
          title="Frais d'agence (€)"
          value={typeof stats.feesTotal === 'number' ? `€${stats.feesTotal.toLocaleString('fr-FR')}` : stats.feesTotal}
          icon={<DollarSign className="w-10 h-10 text-[#00BCE4]" />}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-14">
        <div className="bg-white rounded-xl shadow-md border border-gray-100 p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <span className="text-2xl"><Users className="w-6 h-6" /></span> Top Réseaux
          </h2>
          <div className="space-y-3">
            {(stats.topNetworks || []).map((network, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg border border-blue-100">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-r from-cyan-400 to-blue-500 flex items-center justify-center text-white font-bold text-xs">{idx + 1}</div>
                  <span className="font-medium text-gray-700">{network.name}</span>
                </div>
                <span className="font-bold text-blue-600 bg-blue-100 px-3 py-1 rounded-full">{network.count}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md border border-gray-100 p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <span className="text-2xl"><Home className="w-6 h-6" /></span> Top Régions
          </h2>
          <div className="space-y-3">
            {(stats.topRegions || []).map((region, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-lg border border-purple-100">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-400 to-indigo-500 flex items-center justify-center text-white font-bold text-xs">{idx + 1}</div>
                  <span className="font-medium text-gray-700">{region.name}</span>
                </div>
                <span className="font-bold text-purple-600 bg-purple-100 px-3 py-1 rounded-full">{region.count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-6 justify-center">
        <NavButton href="/" icon={<ArrowLeft className="w-5 h-5" />} label="Retour à la plateforme" />
        <NavButton href="/admin/users" icon={<Users className="w-5 h-5" />} label="Gestion des utilisateurs" />
        <NavButton href="/admin/properties" icon={<Home className="w-5 h-5" />} label="Gestion des annonces" />
        <NavButton href="/admin/collaborations" icon={<Handshake className="w-5 h-5" />} label="Gestion des collaborations" />
      </div>
    </div>
  );
}

interface StatDetail {
	label: string;
	value: number;
	color: string;
}

interface StatCardProps {
	title: string;
	value: number | string;
	details?: StatDetail[];
	icon: React.ReactNode;
}

function StatCard({ title, value, details, icon }: StatCardProps) {
  return (
    <div className="bg-white p-8 rounded-2xl shadow-xl transition-transform hover:scale-105 hover:shadow-2xl flex flex-col gap-2 border-b-4 border-[#00BCE4]">
      <div className="text-3xl mb-0">{icon}</div>
      <div className="text-2xl font-extrabold text-[#00BCE4]">{value}</div>
      <div className="uppercase font-semibold text-gray-400 tracking-widest text-sm mb-2">{title}</div>
      {details && (
        <div className="flex flex-wrap gap-2">
          {details.map((d) => (
            <span key={d.label} className={`px-3 py-1 rounded-full font-medium text-xs ${d.color}`}>{d.label} : {d.value}</span>
          ))}
        </div>
      )}
    </div>
  );
}

interface NavButtonProps {
	href: string;
	label: string;
	icon?: React.ReactNode;
}

function NavButton({ href, label, icon }: NavButtonProps) {
  return (
    <Link
      href={href}
      className="flex items-center gap-3 bg-[#E0F4FF] text-[#009CD8] font-semibold rounded-lg px-6 py-3 hover:bg-[#00BCE4] hover:text-white text-lg shadow transition-all"
    >
      <span className="text-2xl">{icon}</span>
      {label}
    </Link>
  );
}
