'use client';

import { useState } from 'react';
import PropertyCard from './components/PropertyCard';

const properties = [
  {
    id: 1,
    image: '/maison1.jpg',
    additionalImages: ['/maison1.jpg', '/maison2.jpg'], 
    price: 250000,
    agentName: 'Jean Dupont',
    type: 'Appartement',
    sector: 'Paris',
  },
  {
    id: 2,
    image: '/maison2.jpg',
    additionalImages: ['/maison2.jpg', '/maison6.jpg'], 
    price: 380000,
    agentName: 'Marie Leclerc',
    type: 'Maison',
    sector: 'Lyon',
  },
  {
    id: 3,
    image: '/maison5.jpg',
    price: 150000,
    additionalImages: ['/maison5.jpg', '/maison5.jpg'],
    agentName: 'Pierre Martin',
    type: 'Terrain',
    sector: 'Marseille',
  },


];

export default function Home() {
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [sectorFilter, setSectorFilter] = useState('');
  const [priceFilter, setPriceFilter] = useState({ min: 0, max: 500000 });

  const filteredProperties = properties.filter((property) => {
    const matchesSearch = property.agentName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = !typeFilter || property.type === typeFilter;
    const matchesSector = !sectorFilter || property.sector === sectorFilter;
    const matchesPrice = property.price >= priceFilter.min && property.price <= priceFilter.max;
    return matchesSearch && matchesType && matchesSector && matchesPrice;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <section>
        <div className="flex flex-col sm:flex-row justify-between items-center mb-4 gap-4">
          <h2 className="text-2xl font-semibold">Biens à vendre</h2>
          <div className="flex items-center space-x-2">
            <div className="relative">
              <input
                type="text"
                placeholder="Rechercher un bien..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="border rounded-lg p-2 pr-10 w-64 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button className="absolute right-2 top-2 text-gray-500 hover:text-blue-600">
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </button>
            </div>
          </div>
        </div>
        <div className="mb-4 flex flex-col sm:flex-row gap-4">
          {/* <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="border rounded-lg p-2 w-full sm:w-40"
          >
            <option value="">Tous les types</option>
            <option value="Appartement">Appartement</option>
            <option value="Maison">Maison</option>
            <option value="Terrain">Terrain</option>
          </select>
          <select
            value={sectorFilter}
            onChange={(e) => setSectorFilter(e.target.value)}
            className="border rounded-lg p-2 w-full sm:w-40"
          >
            <option value="">Tous les secteurs</option>
            <option value="Paris">Paris</option>
            <option value="Lyon">Lyon</option>
            <option value="Marseille">Marseille</option>
          </select>
          <div className="flex space-x-2">
            <input
              type="number"
              placeholder="Min"
              value={priceFilter.min}
              onChange={(e) => setPriceFilter({ ...priceFilter, min: parseInt(e.target.value) || 0 })}
              className="border rounded-lg p-2 w-20"
            />
            <input
              type="number"
              placeholder="Max"
              value={priceFilter.max}
              onChange={(e) => setPriceFilter({ ...priceFilter, max: parseInt(e.target.value) || 500000 })}
              className="border rounded-lg p-2 w-20"
            />
          </div> */}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProperties.map((property) => (
            <PropertyCard key={property.id} {...property} />
          ))}
        </div>
      </section>
    </div>
  );
}