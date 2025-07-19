'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function PropertyCard({ id, image, price, agentName, type, sector }) {
  const [isFavorite, setIsFavorite] = useState(false);
  const squareMeters = 80 + id * 20; // Exemple de calcul de m²
  const date = new Date().toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' });

  const isSuperAgent = agentName === 'Marie Leclerc';
  const isNew = id === 2;
  const isExclusive = id === 3;

  return (
    <Link href={`/property/${id}`} className="block">
      <div className="bg-white shadow-md rounded-lg overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2">
        <img src={image} alt={`Bien ${id}`} className="w-full h-48 object-cover" />
        <div className="p-4">
          {(isNew || isExclusive) && (
            <div className="flex space-x-2 mb-2">
              {isNew && <span className="bg-green-100 text-green-800 text-xs font-semibold px-2 py-1 rounded">Nouveau</span>}
              {isExclusive && <span className="bg-yellow-100 text-yellow-800 text-xs font-semibold px-2 py-1 rounded">Exclusivité</span>}
            </div>
          )}
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-baseline space-x-2">
              <p className="text-2xl font-bold text-black">{price.toLocaleString()} €</p>
              <span className="text-gray-400 text-sm">→</span>
              <p className="text-gray-500 text-sm">{squareMeters} m²</p>
            </div>
          </div>
          <div className="flex space-x-4 mb-2">
            <span className="bg-gray-100 text-gray-800 text-xs font-semibold px-2 py-1 rounded">Type: {type}</span>
            <span className="bg-gray-100 text-gray-800 text-xs font-semibold px-2 py-1 rounded">Secteur: {sector}</span>
          </div>
          <p className="text-gray-600 text-sm mb-2">Date : {date}</p>
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gray-300 rounded-full overflow-hidden">
              <img src={`https://i.pravatar.cc/40?img=${id}`} alt={agentName} className="w-full h-full object-cover" />
            </div>
            <p className="text-gray-700 font-medium">{agentName}</p>
          </div>
          <div className="flex justify-end mt-2">
            <button
              onClick={(e) => { e.stopPropagation(); setIsFavorite(!isFavorite); }}
              className="text-gray-500 hover:text-red-500 focus:outline-none"
            >
              <svg
                className={`h-6 w-6 ${isFavorite ? 'fill-red-500' : ''}`}
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </Link>
  );
}