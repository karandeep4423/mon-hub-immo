'use client';

import React, { useState, useMemo } from 'react';
import { Button, ConfirmDialog } from '@/components/ui';
import PropertyForm from './PropertyForm';
import { useAuth } from '@/hooks/useAuth';
import { useFetch } from '@/hooks/useFetch';
import { PROPERTY_TEXT, getPropertyCountText } from '@/lib/constants/text';
import {
	PropertyService,
	Property,
	PropertyFormData,
} from '@/lib/api/propertyApi';
import { getImageUrl } from '@/lib/utils/imageUtils';
import { toast } from 'react-toastify';
import { getBadgeConfig } from '@/lib/constants/badges';
import { logger } from '@/lib/utils/logger';

const PropertyManager: React.FC = () => {
	const { user } = useAuth();
	const [showForm, setShowForm] = useState(false);
	const [editingProperty, setEditingProperty] = useState<Property | null>(
		null,
	);
	const [formLoading, setFormLoading] = useState(false);

	// Fetch properties using useFetch hook
	const {
		data: propertiesData,
		loading,
		error: fetchError,
		refetch: refetchProperties,
	} = useFetch(() => PropertyService.getMyProperties(), {
		initialData: { properties: [] },
		showErrorToast: true,
		errorMessage: 'Erreur lors de la récupération de vos biens',
	});

	const properties = useMemo(
		() => propertiesData?.properties || [],
		[propertiesData],
	);
	const error = fetchError?.message || null;

	// Filter states
	const [searchTerm, setSearchTerm] = useState('');
	const [statusFilter, setStatusFilter] = useState<string>('all');
	const [propertyTypeFilter, setPropertyTypeFilter] = useState<string>('all');
	const [transactionTypeFilter, setTransactionTypeFilter] =
		useState<string>('all');

	// Confirm dialog state
	const [showConfirmDialog, setShowConfirmDialog] = useState(false);
	const [propertyToDelete, setPropertyToDelete] = useState<string | null>(
		null,
	);
	const [deleteLoading, setDeleteLoading] = useState(false);

	const handleCreateProperty = async (formData: PropertyFormData) => {
		try {
			setFormLoading(true);

			logger.debug('Property created in form:', formData);

			// Property is already created by PropertyForm using createPropertyWithImages
			// Refetch to get updated list
			await refetchProperties();

			setShowForm(false);

			toast.success('Annonce créée avec succès !');
		} catch (error: unknown) {
			logger.error('Error in property creation callback:', error);
			const errorMessage =
				error instanceof Error
					? error.message
					: 'Erreur lors de la création du bien';
			toast.error(errorMessage);
			window.scrollTo({ top: 0, behavior: 'smooth' });
		} finally {
			setFormLoading(false);
		}
	};

	const handleUpdateProperty = async (
		formData: Partial<PropertyFormData>,
	) => {
		if (!editingProperty) return;

		try {
			setFormLoading(true);

			logger.debug('Property updated in form:', formData);

			// Property is already updated by PropertyForm using updatePropertyWithImages
			// Refetch to get updated list
			await refetchProperties();

			setEditingProperty(null);
			setShowForm(false);

			toast.success('Annonce mise à jour avec succès !');
		} catch (error: unknown) {
			logger.error('Error in property update callback:', error);
			const errorMessage =
				error instanceof Error
					? error.message
					: 'Erreur lors de la mise à jour du bien';
			toast.error(errorMessage);
			window.scrollTo({ top: 0, behavior: 'smooth' });
		} finally {
			setFormLoading(false);
		}
	};

	const handleDeleteProperty = (propertyId: string) => {
		setPropertyToDelete(propertyId);
		setShowConfirmDialog(true);
	};

	const confirmDeleteProperty = async () => {
		if (!propertyToDelete) return;

		try {
			setDeleteLoading(true);
			await PropertyService.deleteProperty(propertyToDelete);
			await refetchProperties();
			toast.success('Bien supprimé avec succès !');
			setShowConfirmDialog(false);
			setPropertyToDelete(null);
		} catch (error: unknown) {
			logger.error('Error deleting property:', error);
			const errorMessage =
				error instanceof Error
					? error.message
					: 'Erreur lors de la suppression du bien';
			toast.error(errorMessage);
		} finally {
			setDeleteLoading(false);
		}
	};

	const cancelDeleteProperty = () => {
		setShowConfirmDialog(false);
		setPropertyToDelete(null);
	};

	// Filter and search properties
	const filteredProperties = useMemo(() => {
		return properties.filter((property) => {
			// Status filter
			if (statusFilter !== 'all' && property.status !== statusFilter) {
				return false;
			}

			// Property type filter
			if (
				propertyTypeFilter !== 'all' &&
				property.propertyType !== propertyTypeFilter
			) {
				return false;
			}

			// Transaction type filter
			if (
				transactionTypeFilter !== 'all' &&
				property.transactionType !== transactionTypeFilter
			) {
				return false;
			}

			// Search filter (title, city, or description)
			if (searchTerm) {
				const searchLower = searchTerm.toLowerCase();
				return (
					property.title.toLowerCase().includes(searchLower) ||
					property.city.toLowerCase().includes(searchLower) ||
					property.description.toLowerCase().includes(searchLower)
				);
			}

			return true;
		});
	}, [
		properties,
		statusFilter,
		propertyTypeFilter,
		transactionTypeFilter,
		searchTerm,
	]);

	// Reset all filters
	const resetFilters = () => {
		setSearchTerm('');
		setStatusFilter('all');
		setPropertyTypeFilter('all');
		setTransactionTypeFilter('all');
	};

	// Check if any filters are active
	const hasActiveFilters =
		searchTerm !== '' ||
		statusFilter !== 'all' ||
		propertyTypeFilter !== 'all' ||
		transactionTypeFilter !== 'all';

	const handleStatusChange = async (
		propertyId: string,
		newStatus: Property['status'],
	) => {
		try {
			await PropertyService.updatePropertyStatus(propertyId, newStatus);
			await refetchProperties();
			toast.success('Statut mis à jour avec succès !');
		} catch (error: unknown) {
			logger.error('Error updating status:', error);
			const errorMessage =
				error instanceof Error
					? error.message
					: 'Erreur lors de la mise à jour du statut';
			toast.error(errorMessage);
		}
	};

	const getStatusBadge = (status: Property['status']) => {
		const statusConfig = {
			active: {
				label: 'Actif',
				className: 'bg-green-100 text-green-800',
			},
			draft: {
				label: 'Brouillon',
				className: 'bg-gray-100 text-gray-800',
			},
			sold: { label: 'Vendu', className: 'bg-red-100 text-red-800' },
			rented: { label: 'Loué', className: 'bg-blue-100 text-blue-800' },
			archived: {
				label: 'Archivé',
				className: 'bg-yellow-100 text-yellow-800',
			},
		};

		const config = statusConfig[status];
		return (
			<span
				className={`px-2 py-1 text-xs font-medium rounded-full ${config.className}`}
			>
				{config.label}
			</span>
		);
	};

	// Check if user has permission to manage properties (both agents and apporteurs)
	if (!user || !['agent', 'apporteur'].includes(user.userType)) {
		return (
			<div className="text-center py-12">
				<p className="text-gray-600">
					Vous devez être connecté en tant&apos;agent ou apporteur
					pour gérer des annonces.
				</p>
			</div>
		);
	}

	if (showForm) {
		return (
			<div>
				<div className="flex items-center justify-between mb-6">
					<Button
						variant="outline"
						onClick={() => {
							setShowForm(false);
							setEditingProperty(null);
						}}
					>
						← Retour à la liste
					</Button>
				</div>
				<PropertyForm
					onSubmit={
						editingProperty
							? handleUpdateProperty
							: handleCreateProperty
					}
					initialData={editingProperty || undefined}
					isEditing={!!editingProperty}
					isLoading={formLoading}
				/>
			</div>
		);
	}

	return (
		<div className="space-y-6">
			<div className="bg-white rounded-xl shadow-sm border p-6">
				<div className="flex items-center justify-between">
					<div className="flex items-center space-x-4">
						<div className="w-12 h-12 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-lg flex items-center justify-center">
							<svg
								className="w-6 h-6 text-white"
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
						<div>
							<h1 className="text-2xl font-bold text-gray-900">
								{PROPERTY_TEXT.title}
							</h1>
							<p className="text-gray-600">
								{PROPERTY_TEXT.subtitle} •{' '}
								{getPropertyCountText(properties.length)}
							</p>
						</div>
					</div>
					<div className="flex items-center space-x-3">
						<Button
							onClick={() => setShowForm(true)}
							className="bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white shadow-lg"
						>
							<svg
								className="w-4 h-4 mr-2"
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24"
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth="2"
									d="M12 6v6m0 0v6m0-6h6m-6 0H6"
								/>
							</svg>
							{PROPERTY_TEXT.newProperty}
						</Button>
					</div>
				</div>
			</div>

			{error && (
				<div className="bg-red-50 border border-red-200 rounded-lg p-4">
					<p className="text-red-800">{error}</p>
				</div>
			)}

			{/* Filter Section */}
			{!loading && properties.length > 0 && (
				<div className="bg-white rounded-xl shadow-sm border p-6">
					<div className="flex flex-col lg:flex-row lg:items-center gap-4">
						{/* Search Input */}
						<div className="flex-1">
							<div className="relative">
								<input
									type="text"
									placeholder="Rechercher par titre, ville ou description..."
									value={searchTerm}
									onChange={(e) =>
										setSearchTerm(e.target.value)
									}
									className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
								/>
								<svg
									className="absolute left-3 top-2.5 h-5 w-5 text-gray-400"
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
							</div>
						</div>

						{/* Status Filter */}
						<div className="w-full lg:w-48">
							<select
								value={statusFilter}
								onChange={(e) =>
									setStatusFilter(e.target.value)
								}
								className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
							>
								<option value="all">Tous les statuts</option>
								<option value="draft">Brouillon</option>
								<option value="active">Actif</option>
								<option value="sold">Vendu</option>
								<option value="rented">Loué</option>
								<option value="archived">Archivé</option>
							</select>
						</div>

						{/* Property Type Filter */}
						<div className="w-full lg:w-48">
							<select
								value={propertyTypeFilter}
								onChange={(e) =>
									setPropertyTypeFilter(e.target.value)
								}
								className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
							>
								<option value="all">Tous les types</option>
								<option value="Appartement">Appartement</option>
								<option value="Maison">Maison</option>
								<option value="Terrain">Terrain</option>
								<option value="Local commercial">
									Local commercial
								</option>
								<option value="Bureaux">Bureaux</option>
							</select>
						</div>

						{/* Transaction Type Filter */}
						<div className="w-full lg:w-40">
							<select
								value={transactionTypeFilter}
								onChange={(e) =>
									setTransactionTypeFilter(e.target.value)
								}
								className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
							>
								<option value="all">Tous</option>
								<option value="Vente">Vente</option>
								<option value="Location">Location</option>
							</select>
						</div>

						{/* Reset Filters Button */}
						{hasActiveFilters && (
							<Button
								variant="outline"
								onClick={resetFilters}
								className="lg:w-auto w-full"
							>
								<svg
									className="w-4 h-4 mr-2"
									fill="none"
									stroke="currentColor"
									viewBox="0 0 24 24"
								>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth="2"
										d="M6 18L18 6M6 6l12 12"
									/>
								</svg>
								Réinitialiser
							</Button>
						)}
					</div>

					{/* Filter Results Count */}
					{hasActiveFilters && (
						<div className="mt-4 pt-4 border-t">
							<p className="text-sm text-gray-600">
								<span className="font-semibold text-gray-900">
									{filteredProperties.length}
								</span>{' '}
								résultat
								{filteredProperties.length !== 1
									? 's'
									: ''} sur{' '}
								<span className="font-semibold text-gray-900">
									{properties.length}
								</span>{' '}
								bien{properties.length !== 1 ? 's' : ''}
							</p>
						</div>
					)}
				</div>
			)}

			{loading ? (
				<div className="text-center py-12">
					<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
					<p className="text-gray-600">Chargement de vos biens...</p>
				</div>
			) : properties.length === 0 ? (
				<div className="text-center py-16 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl border border-blue-100">
					<div className="mx-auto w-20 h-20 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-full flex items-center justify-center mb-6 shadow-lg">
						<svg
							className="w-10 h-10 text-white"
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
					<h3 className="text-2xl font-bold text-gray-900 mb-3">
						Commencez à publier vos biens
					</h3>
					<p className="text-gray-600 mb-2 max-w-md mx-auto">
						Créez votre première annonce immobilière et atteignez
						des milliers de clients potentiels.
					</p>
					<p className="text-sm text-gray-500 mb-8">
						✨ Processus simple en 4 étapes • 📸 Ajoutez vos photos
						• 🚀 Publication instantanée
					</p>
					<div className="space-y-3">
						<Button
							onClick={() => setShowForm(true)}
							className="bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white px-8 py-3 text-lg font-semibold shadow-lg"
							size="lg"
						>
							<svg
								className="w-5 h-5 mr-2"
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24"
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth="2"
									d="M12 6v6m0 0v6m0-6h6m-6 0H6"
								/>
							</svg>
							Créer ma première annonce
						</Button>
						<div className="text-xs text-gray-400">
							Gratuit et sans engagement
						</div>
					</div>
				</div>
			) : filteredProperties.length === 0 && hasActiveFilters ? (
				<div className="text-center py-12 bg-white rounded-xl border border-gray-200">
					<div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
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
								d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
							/>
						</svg>
					</div>
					<h3 className="text-lg font-semibold text-gray-900 mb-2">
						Aucun bien trouvé
					</h3>
					<p className="text-gray-600 mb-4">
						Aucun bien ne correspond à vos critères de recherche.
					</p>
					<Button variant="outline" onClick={resetFilters}>
						Réinitialiser les filtres
					</Button>
				</div>
			) : (
				<div className="space-y-4">
					{filteredProperties.map((property) => (
						<div
							key={property._id}
							className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow"
						>
							<div className="flex">
								<div className="w-48 h-32 bg-gray-200 flex-shrink-0 relative">
									<img
										src={getImageUrl(
											property.mainImage,
											'medium',
										)}
										alt={property.title}
										className="object-cover w-full h-full"
									/>
								</div>
								<div className="flex-1 p-4">
									<div className="flex items-start justify-between">
										<div className="flex-1">
											<div className="flex items-center flex-wrap gap-2 mb-2">
												<h3 className="text-lg font-semibold text-gray-900 truncate">
													{property.title}
												</h3>
												{property.badges &&
													property.badges.length >
														0 &&
													property.badges.map(
														(badgeValue) => {
															const config =
																getBadgeConfig(
																	badgeValue,
																);
															if (!config)
																return null;

															return (
																<span
																	key={
																		badgeValue
																	}
																	className={`${config.bgColor.replace('bg-', 'bg-opacity-20 bg-')} ${config.color.replace('text-white', `text-${config.bgColor.split('-')[1]}-800`)} text-xs px-2 py-1 rounded-full`}
																>
																	{
																		config.label
																	}
																</span>
															);
														},
													)}
											</div>
											<p className="text-gray-600 text-sm mb-2 line-clamp-2">
												{property.description}
											</p>
											<div className="flex items-center space-x-4 text-sm text-gray-500">
												<span>
													{property.propertyType}
												</span>
												<span>•</span>
												<span>
													{property.surface} m²
												</span>
												<span>•</span>
												<span>{property.city}</span>
												<span>•</span>
												<span>
													{property.viewCount} vues
												</span>
											</div>
										</div>
										<div className="text-right">
											<div className="text-xl font-bold text-gray-900 mb-2">
												{property.price.toLocaleString()}{' '}
												€
											</div>
											{getStatusBadge(property.status)}
										</div>
									</div>
									<div className="flex items-center justify-between mt-4 pt-4 border-t">
										<div className="flex items-center space-x-2">
											<select
												value={property.status}
												onChange={(e) =>
													handleStatusChange(
														property._id,
														e.target
															.value as Property['status'],
													)
												}
												className="text-sm border border-gray-300 rounded px-2 py-1"
											>
												<option value="draft">
													Brouillon
												</option>
												<option value="active">
													Actif
												</option>
												<option value="sold">
													Vendu
												</option>
												<option value="rented">
													Loué
												</option>
												<option value="archived">
													Archivé
												</option>
											</select>
										</div>
										<div className="flex items-center space-x-2">
											<Button
												variant="outline"
												size="sm"
												onClick={() => {
													setEditingProperty(
														property,
													);
													setShowForm(true);
												}}
											>
												Modifier
											</Button>
											<Button
												variant="outline"
												size="sm"
												onClick={() =>
													handleDeleteProperty(
														property._id,
													)
												}
												className="text-red-600 border-red-300 hover:bg-red-50"
											>
												Supprimer
											</Button>
										</div>
									</div>
								</div>
							</div>
						</div>
					))}
				</div>
			)}

			{/* Confirm Delete Dialog */}
			<ConfirmDialog
				isOpen={showConfirmDialog}
				title="Supprimer le bien"
				description="Êtes-vous sûr de vouloir supprimer ce bien ? Cette action est irréversible."
				onConfirm={confirmDeleteProperty}
				onCancel={cancelDeleteProperty}
				confirmText="Supprimer"
				cancelText="Annuler"
				variant="danger"
				loading={deleteLoading}
			/>
		</div>
	);
};

export default PropertyManager;
