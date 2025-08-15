'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';

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

	{
		id: 4,
		image: '/maison5.jpg',
		price: 150000,
		additionalImages: ['/maison5.jpg', '/maison5.jpg'],
		agentName: 'Pierre Martin',
		type: 'Terrain',
		sector: 'Marseille',
	},

	{
		id: 5,
		image: '/maison5.jpg',
		price: 150000,
		additionalImages: ['/maison5.jpg', '/maison5.jpg'],
		agentName: 'Pierre Martin',
		type: 'Terrain',
		sector: 'Marseille',
	},

	{
		id: 6,
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
		const matchesSearch = property.agentName
			.toLowerCase()
			.includes(searchTerm.toLowerCase());
		const matchesType = !typeFilter || property.type === typeFilter;
		const matchesSector = !sectorFilter || property.sector === sectorFilter;
		const matchesPrice =
			property.price >= priceFilter.min &&
			property.price <= priceFilter.max;
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
								<svg
									className="h-5 w-5"
									fill="none"
									stroke="currentColor"
									viewBox="0 0 24 24"
								>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth="2"
										d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
									/>
								</svg>
							</button>
						</div>
					</div>
				</div>
				<div className="mb-4 grid sm:grid-cols-3 grid-cols-1 gap-4">
					{filteredProperties.map((property) => (
						<Link
							key={property.id}
							href={`/property/${property.id}`}
							className="block"
						>
							<div className="bg-white shadow-md rounded-lg overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2">
								<img
									src={property.image}
									alt={`Bien ${property.id}`}
									width={400}
									height={192}
									className="w-full h-48 object-cover"
								/>
								<div className="p-4">
									<div className="flex items-center justify-between mb-2">
										<div className="flex items-baseline space-x-2">
											<p className="text-2xl font-bold text-black">
												{property.price.toLocaleString()}{' '}
												€
											</p>
										</div>
									</div>
									<div className="flex space-x-4 mb-2">
										<span className="bg-gray-100 text-gray-800 text-xs font-semibold px-2 py-1 rounded">
											Type: {property.type}
										</span>
										<span className="bg-gray-100 text-gray-800 text-xs font-semibold px-2 py-1 rounded">
											Secteur: {property.sector}
										</span>
									</div>
									<div className="flex items-center space-x-2">
										<div className="w-8 h-8 bg-gray-300 rounded-full overflow-hidden">
											<img
												src={`https://i.pravatar.cc/40?img=${property.id}`}
												alt={property.agentName}
												width={32}
												height={32}
												className="w-full h-full object-cover"
											/>
										</div>
										<p className="text-gray-700 font-medium">
											{property.agentName}
										</p>
									</div>
								</div>
							</div>
						</Link>
					))}
				</div>
			</section>
		</div>
	);
}
