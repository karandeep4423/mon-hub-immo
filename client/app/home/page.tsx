'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
	PropertyService,
	Property,
	PropertyFilters,
} from '@/lib/propertyService';

export default function Home() {
	const [properties, setProperties] = useState<Property[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [searchTerm, setSearchTerm] = useState('');
	const [typeFilter, setTypeFilter] = useState('');
	const [sectorFilter, setSectorFilter] = useState('');
	const [priceFilter, setPriceFilter] = useState({ min: 0, max: 10000000 });

	// Debounce effect for search term
	useEffect(() => {
		const debounceTimer = setTimeout(
			() => {
				fetchProperties();
			},
			searchTerm ? 500 : 0,
		); // 500ms delay for search, immediate for others

		return () => clearTimeout(debounceTimer);
	}, [searchTerm, typeFilter, sectorFilter, priceFilter]);

	const fetchProperties = async () => {
		try {
			setLoading(true);
			setError(null);

			const filters: PropertyFilters = {};
			if (searchTerm) filters.search = searchTerm;
			if (typeFilter) filters.propertyType = typeFilter;
			if (sectorFilter) filters.sector = sectorFilter;
			if (priceFilter.min > 0) filters.minPrice = priceFilter.min;
			if (priceFilter.max < 10000000) filters.maxPrice = priceFilter.max;

			const propertiesData =
				await PropertyService.getAllProperties(filters);
			setProperties(propertiesData || []);
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		} catch (error: any) {
			console.error('Error fetching properties:', error);
			setError(error.message || 'Erreur lors du chargement des biens');
		} finally {
			setLoading(false);
		}
	};

	// Since filtering is now done server-side, we use properties directly
	const filteredProperties = properties;

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
				{/* Filters */}
				<div className="mb-6 flex flex-wrap gap-4">
					<select
						value={typeFilter}
						onChange={(e) => setTypeFilter(e.target.value)}
						className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
					>
						<option value="">Tous les types</option>
						<option value="Appartement">Appartement</option>
						<option value="Maison">Maison</option>
						<option value="Terrain">Terrain</option>
						<option value="Local commercial">
							Local commercial
						</option>
						<option value="Bureaux">Bureaux</option>
					</select>

					<input
						type="text"
						placeholder="Secteur..."
						value={sectorFilter}
						onChange={(e) => setSectorFilter(e.target.value)}
						className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
					/>

					<div className="flex items-center space-x-2">
						<input
							type="number"
							placeholder="Prix min"
							value={priceFilter.min || ''}
							onChange={(e) =>
								setPriceFilter((prev) => ({
									...prev,
									min: parseInt(e.target.value) || 0,
								}))
							}
							className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-32"
						/>
						<span className="text-gray-500">-</span>
						<input
							type="number"
							placeholder="Prix max"
							value={
								priceFilter.max === 10000000
									? ''
									: priceFilter.max
							}
							onChange={(e) =>
								setPriceFilter((prev) => ({
									...prev,
									max: parseInt(e.target.value) || 10000000,
								}))
							}
							className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-32"
						/>
					</div>
				</div>

				{loading ? (
					<div className="text-center py-12">
						<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
						<p className="text-gray-600">Chargement des biens...</p>
					</div>
				) : error ? (
					<div className="text-center py-12 bg-red-50 rounded-lg">
						<p className="text-red-600">{error}</p>
						<button
							onClick={fetchProperties}
							className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
						>
							Réessayer
						</button>
					</div>
				) : filteredProperties.length === 0 ? (
					<div className="text-center py-12 bg-gray-50 rounded-lg">
						<div className="mx-auto w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mb-4">
							<svg
								className="w-8 h-8 text-gray-400"
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24"
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth="2"
									d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
								/>
							</svg>
						</div>
						<h3 className="text-lg font-semibold text-gray-900 mb-2">
							{properties.length === 0
								? 'Aucun bien disponible'
								: 'Aucun résultat trouvé'}
						</h3>
						<p className="text-gray-600">
							{properties.length === 0
								? "Aucune annonce n'a encore été publiée."
								: "Essayez d'ajuster vos critères de recherche."}
						</p>
					</div>
				) : (
					<div className="mb-4 grid sm:grid-cols-3 grid-cols-1 gap-4">
						{filteredProperties.map((property) => (
							<Link
								key={property._id}
								href={`/property/${property._id}`}
								className="block"
							>
								<div className="bg-white shadow-md rounded-lg overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2">
									{/* Badges */}
									<div className="relative">
										<img
											src={property.mainImage}
											alt={property.title}
											className="w-full h-48 object-cover"
											onError={(e) => {
												(
													e.target as HTMLImageElement
												).src =
													'/placeholder-property.jpg';
											}}
										/>
										<div className="absolute top-2 left-2 flex flex-col space-y-1">
											{property.isNewProperty && (
												<span className="bg-green-500 text-white text-xs px-2 py-1 rounded-full">
													Nouveau
												</span>
											)}
											{property.isExclusive && (
												<span className="bg-yellow-500 text-white text-xs px-2 py-1 rounded-full">
													Exclusivité
												</span>
											)}
										</div>
									</div>

									<div className="p-4">
										<div className="flex items-center justify-between mb-2">
											<div className="flex items-baseline space-x-2">
												<p className="text-2xl font-bold text-black">
													{property.price.toLocaleString()}{' '}
													€
												</p>
												<p className="text-sm text-gray-600">
													{property.surface} m²
												</p>
											</div>
										</div>

										<h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-1">
											{property.title}
										</h3>

										<p className="text-gray-600 text-sm mb-3 line-clamp-2">
											{property.description}
										</p>

										<div className="flex space-x-2 mb-3">
											<span className="bg-blue-100 text-blue-800 text-xs font-semibold px-2 py-1 rounded">
												{property.propertyType}
											</span>
											<span className="bg-gray-100 text-gray-800 text-xs font-semibold px-2 py-1 rounded">
												{property.city}
											</span>
											{property.rooms && (
												<span className="bg-green-100 text-green-800 text-xs font-semibold px-2 py-1 rounded">
													{property.rooms} pièces
												</span>
											)}
										</div>

										<div className="flex items-center justify-between">
											<div className="flex items-center space-x-2">
												<div className="w-8 h-8 bg-gray-300 rounded-full overflow-hidden">
													<img
														src={
															property.owner
																.profileImage ||
															`https://ui-avatars.com/api/?name=${encodeURIComponent(property.owner.firstName + ' ' + property.owner.lastName)}&background=3b82f6&color=ffffff`
														}
														alt={`${property.owner.firstName} ${property.owner.lastName}`}
														className="w-full h-full object-cover"
													/>
												</div>
												<div>
													<p className="text-gray-700 font-medium text-sm">
														{
															property.owner
																.firstName
														}{' '}
														{
															property.owner
																.lastName
														}
													</p>
													<p className="text-xs text-gray-500">
														{property.owner
															.userType ===
														'apporteur'
															? 'Apporteur'
															: 'Agent'}
													</p>
												</div>
											</div>

											<div className="text-right">
												<p className="text-xs text-gray-500">
													{new Date(
														property.publishedAt ||
															property.createdAt,
													).toLocaleDateString(
														'fr-FR',
													)}
												</p>
											</div>
										</div>
									</div>
								</div>
							</Link>
						))}
					</div>
				)}
			</section>
		</div>
	);
}
