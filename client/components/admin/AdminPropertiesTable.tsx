"use client";
import React, { useState, useMemo, useEffect } from "react";

export interface Property {
  _id: string;
  title: string;
  price: number;
  surface: number;
  propertyType: string;
  transactionType: string;
  status: "active" | "draft" | "sold" | "rented" | "archived";
  city: string;
  owner?: { _id: string; firstName?: string; lastName?: string; network?: string };
  publishedAt?: string;
  createdAt?: string;
}

interface Agent {
  _id: string;
  fullName: string;
  network?: string;
}

interface AdminPropertiesTableProps {
  properties: Property[];
  agents?: Agent[];
  networks?: string[];
  loading: boolean;
}

const PAGE_SIZE = 10;

export default function AdminPropertiesTable({ properties, agents = [], networks = [], loading }: AdminPropertiesTableProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string | "">('');
  const [agentFilter, setAgentFilter] = useState<string | "">('');
  const [networkFilter, setNetworkFilter] = useState<string | "">('');

  // Filtrage
  const filtered = useMemo(() => {
    return properties.filter((prop) => {
      const matchesText =
        prop.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        prop.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
        prop.propertyType.toLowerCase().includes(searchTerm.toLowerCase()) ||
        prop.transactionType?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter ? prop.status === statusFilter : true;
      const matchesAgent = agentFilter ? prop.owner?._id === agentFilter : true;
      const matchesNetwork = networkFilter ? prop.owner?.network === networkFilter : true;
      return matchesText && matchesStatus && matchesAgent && matchesNetwork;
    });
  }, [searchTerm, statusFilter, agentFilter, networkFilter, properties]);

  // Pagination
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paged = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return filtered.slice(start, start + PAGE_SIZE);
  }, [filtered, currentPage]);

  useEffect(() => {
    setCurrentPage(1); // reset pagination si filtres changent
  }, [searchTerm, statusFilter, agentFilter, networkFilter]);

  function statusColor(status: string) {
    switch (status) {
      case "active": return "bg-[#00BCE4] text-white";
      case "draft": return "bg-gray-300 text-gray-600";
      case "sold": return "bg-green-200 text-green-700";
      case "rented": return "bg-yellow-100 text-yellow-700";
      case "archived": return "bg-gray-100 text-gray-700";
      default: return "bg-gray-100 text-gray-600";
    }
  }

  if (loading) return <div className="p-4 text-center">Chargement des annonces...</div>;

  return (
    <div className="p-6 bg-white rounded-xl shadow max-w-full overflow-x-auto">
      <h2 className="text-2xl font-bold mb-6 text-[#009CD8]">Gestion des annonces</h2>

      {/* Filtres */}
      <div className="flex flex-wrap gap-4 mb-6">
        <input
          type="search"
          className="p-2 border rounded-md bg-[#F5F9FF]"
          placeholder="Recherche titre, ville, type, transaction..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
        />
        <select className="p-2 border rounded-md bg-[#F5F9FF]" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
          <option value="">Statut</option>
          <option value="active">Actif</option>
          <option value="draft">Brouillon</option>
          <option value="sold">Vendu</option>
          <option value="rented">Loué</option>
          <option value="archived">Archivé</option>
        </select>
        <select className="p-2 border rounded-md bg-[#F5F9FF]" value={agentFilter} onChange={e => setAgentFilter(e.target.value)}>
          <option value="">Agent</option>
          {(agents || []).map(agent =>
            <option key={agent._id} value={agent._id}>{agent.fullName}</option>
          )}
        </select>
        <select className="p-2 border rounded-md bg-[#F5F9FF]" value={networkFilter} onChange={e => setNetworkFilter(e.target.value)}>
          <option value="">Réseau</option>
          {(networks || []).map(n => <option key={n} value={n}>{n}</option>)}
        </select>
      </div>

      {/* Stats par réseau / agent */}
      <div className="mb-6 flex gap-8">
        <StatCard label="Total publiées" value={properties.length} color="#00BCE4" />
        <StatCard label="Actives" value={properties.filter(p => p.status === "active").length} color="#00BCE4" />
        <StatCard label="Brouillon" value={properties.filter(p => p.status === "draft").length} color="gray" />
        <StatCard label="Vendues" value={properties.filter(p => p.status === "sold").length} color="green" />
        <StatCard label="Louées" value={properties.filter(p => p.status === "rented").length} color="gold" />
        <StatCard label="Archivées" value={properties.filter(p => p.status === "archived").length} color="darkgray" />
      </div>

      {/* Tableau annonces */}
      <table className="min-w-full table-auto border-collapse text-left">
        <thead className="bg-[#F5F9FF]">
          <tr>
            <th className="p-2 font-semibold">Titre</th>
            <th className="p-2 font-semibold">Prix (€)</th>
            <th className="p-2 font-semibold">Surface (m²)</th>
            <th className="p-2 font-semibold">Type</th>
            <th className="p-2 font-semibold">Transaction</th>
            <th className="p-2 font-semibold">Ville</th>
            <th className="p-2 font-semibold">Propriétaire</th>
            <th className="p-2 font-semibold">Statut</th>
            <th className="p-2 font-semibold">Créée le</th>
            <th className="p-2 font-semibold">Actions</th>
          </tr>
        </thead>
        <tbody>
          {paged.map(prop => (
            <tr key={prop._id} className="border-b hover:bg-[#E0F4FF] transition">
              <td className="p-2 font-medium">{prop.title}</td>
              <td className="p-2">{prop.price.toLocaleString()} €</td>
              <td className="p-2">{prop.surface} m²</td>
              <td className="p-2">{prop.propertyType}</td>
              <td className="p-2">{prop.transactionType ?? '-'}</td>
              <td className="p-2">{prop.city}</td>
              <td className="p-2">{prop.owner ? `${prop.owner.firstName ?? ''} ${prop.owner.lastName ?? ''}` : '-'}</td>
              <td className={`p-2 text-xs font-bold rounded-full ${statusColor(prop.status)} w-1 whitespace-nowrap text-center`}>
                {prop.status.charAt(0).toUpperCase() + prop.status.slice(1)}
              </td>
              <td className="p-2">{prop.createdAt ? (new Date(prop.createdAt)).toLocaleDateString() : '-'}</td>
              {/* Actions rapides */}
              <td className="p-2 flex gap-2">
                <button className="bg-[#00BCE4] text-white rounded px-3 py-1 text-xs hover:scale-105" onClick={() => alert("Voir/éditer non implémenté")}>Voir</button>
                <button className="bg-gray-200 text-[#009CD8] rounded px-3 py-1 text-xs hover:scale-105" onClick={() => alert("Changer statut")}>Statut</button>
                <button className="bg-red-100 text-red-700 rounded px-3 py-1 text-xs hover:scale-105" onClick={() => alert("Supprimer")}>Supprimer</button>
              </td>
            </tr>
          ))}
          {!paged.length && (
            <tr>
              <td colSpan={10} className="text-center p-4 text-gray-500">Aucune annonce trouvée.</td>
            </tr>
          )}
        </tbody>
      </table>
      {/* Pagination */}
      <div className="mt-6 flex justify-center gap-2">
        <button className="p-2 px-4 border rounded disabled:opacity-50" onClick={() => setCurrentPage(c => Math.max(c - 1, 1))} disabled={currentPage === 1}>Précédent</button>
        <span className="text-base pt-2">Page {currentPage} sur {totalPages}</span>
        <button className="p-2 px-4 border rounded disabled:opacity-50" onClick={() => setCurrentPage(c => Math.min(c + 1, totalPages))} disabled={currentPage === totalPages}>Suivant</button>
      </div>
    </div>
  );
}

// Carte de statistiques simples
function StatCard({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="flex flex-col items-center justify-center bg-white p-4 rounded-xl shadow min-w-[90px] border border-gray-100">
      <span className="font-medium text-sm text-gray-500">{label}</span>
      <span className="text-xl font-bold" style={{ color }}>{value}</span>
    </div>
  );
}
