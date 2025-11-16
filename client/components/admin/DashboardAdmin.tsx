"use client";
import React from "react";

// Passe "stats" depuis tes props/page loader comme avant !
export default function DashboardAdmin({ stats }) {
  return (
    <div className="max-w-6xl mx-auto px-4">
      <h1 className="text-3xl font-black mb-10 text-[#009CD8]">Tableau de bord général</h1>
      {/* Cards principales */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-14">
        <StatCard
          title="Agents inscrits"
          value={stats.agentsTotal}
          details={[
            { label: "Actifs", value: stats.agentsActive, color: "bg-green-100 text-green-700" },
            { label: "En attente", value: stats.agentsPending, color: "bg-yellow-100 text-yellow-700" },
            { label: "Désabonnés", value: stats.agentsUnsubscribed, color: "bg-red-100 text-red-700" }
          ]}
          icon="👥"
        />
        <StatCard
          title="Annonces"
          value={stats.propertiesActive}
          details={[
            { label: "Archivées", value: stats.propertiesArchived, color: "bg-gray-100 text-gray-700" },
            { label: "En collaboration", value: stats.propertiesInCollab, color: "bg-blue-50 text-blue-700" }
          ]}
          icon="🏠"
        />
        <StatCard
          title="Collaborations"
          value={stats.collabOpen}
          details={[
            { label: "Clôturées", value: stats.collabClosed, color: "bg-purple-100 text-purple-800" }
          ]}
          icon="🤝"
        />
        <StatCard
          title="Frais d’agence (€)"
          value={stats.feesTotal?.toLocaleString("fr-FR", { style: "currency", currency: "EUR" }) || 0}
          icon="💰"
        />
      </div>
      {/* Top stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-14">
        <StatList title="Top réseaux" items={stats.topNetworks} color="blue" />
        <StatList title="Top régions/villes" items={stats.topRegions} color="indigo" />
      </div>
      {/* Quick nav */}
      <div className="flex flex-wrap gap-6 justify-center">
        <NavButton href="/admin/users" icon="👥" label="Gestion des utilisateurs" />
        <NavButton href="/admin/properties" icon="🏠" label="Gestion des annonces" />
        <NavButton href="/admin/collaborations" icon="🤝" label="Gestion des collaborations" />
      </div>
    </div>
  );
}

function StatCard({ title, value, details, icon }) {
  return (
    <div className="bg-white p-8 rounded-2xl shadow-xl transition-transform hover:scale-105 hover:shadow-2xl flex flex-col gap-2 border-b-4 border-[#00BCE4]">
      <div className="text-5xl mb-0">{icon}</div>
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

function StatList({ title, items, color }) {
  return (
    <div className={`bg-white rounded-2xl shadow-md border-l-4 border-${color}-300 p-6`}>
      <h3 className={`mb-4 font-extrabold text-lg text-${color}-700`}>{title}</h3>
      <ul className="list-disc list-inside space-y-2">
        {items.map(item => (
          <li key={item.name} className="flex justify-between pr-4">
            <span>{item.name}</span>
            <span className="font-bold">{item.count}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

import Link from "next/link";
function NavButton({ href, label, icon }) {
  return (
    <Link
      href={href}
      className="flex items-center gap-3 bg-[#E0F4FF] text-[#009CD8] font-semibold rounded-lg px-6 py-3 hover:bg-[#00BCE4] hover:text-white text-lg shadow transition-all"
    >
      <span className="text-2xl">{icon}</span> {label}
    </Link>
  );
}
