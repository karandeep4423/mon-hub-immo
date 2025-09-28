'use client';

import React, { useState, useEffect } from 'react';
import { Button, ConfirmDialog } from '@/components/ui';
import PropertyForm from './PropertyForm';
import { useAuth } from '@/hooks/useAuth';
import { PROPERTY_TEXT, getPropertyCountText } from '@/lib/constants/text';
import {
	PropertyService,
	Property,
	PropertyFormData,
} from '@/lib/api/propertyApi';
import { getImageUrl } from '@/lib/utils/imageUtils';
import { toast } from 'react-toastify';

const PropertyManager: React.FC = () => {
	const { user } = useAuth();
	const [properties, setProperties] = useState<Property[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [showForm, setShowForm] = useState(false);
	const [editingProperty, setEditingProperty] = useState<Property | null>(
		null,
	);
	const [formLoading, setFormLoading] = useState(false);

	// Confirm dialog state
	const [showConfirmDialog, setShowConfirmDialog] = useState(false);
	const [propertyToDelete, setPropertyToDelete] = useState<string | null>(
		null,
	);
	const [deleteLoading, setDeleteLoading] = useState(false);

	useEffect(() => {
		fetchMyProperties();
	}, []);

	const fetchMyProperties = async () => {
		try {
			setLoading(true);
			const data = await PropertyService.getMyProperties();
			setProperties(data.properties);
		} catch (error: unknown) {
			console.error('Error fetching properties:', error);
			const errorMessage =
				error instanceof Error
					? error.message
					: 'Erreur lors de la récupération de vos biens';
			setError(errorMessage);
		} finally {
			setLoading(false);
		}
	};

	const handleCreateProperty = async (formData: PropertyFormData) => {
		try {
			setFormLoading(true);
			setError(null);

			console.log('Property created in form:', formData);

			// Property is already created by PropertyForm using createPropertyWithImages
			// Just update the local state and close form
			if ('_id' in formData && formData._id) {
				setProperties((prev) => [formData as Property, ...prev]);
			}

			setShowForm(false);
			setError(null);

			// Show success message with toast
			toast.success('Annonce créée avec succès !');
		} catch (error: unknown) {
			console.error('Error in property creation callback:', error);
			const errorMessage =
				error instanceof Error
					? error.message
					: 'Erreur lors de la création du bien';
			setError(errorMessage);

			// Scroll to top to show error
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
			setError(null);

			console.log('Property updated in form:', formData);

			// Property is already updated by PropertyForm using updatePropertyWithImages
			// Just update the local state and close form
			const updatedProperty = formData as Property;
			setProperties((prev) =>
				prev.map((p) =>
					p._id === editingProperty._id ? updatedProperty : p,
				),
			);

			setEditingProperty(null);
			setShowForm(false);
			setError(null);

			// Show success message with toast
			toast.success('Annonce mise à jour avec succès !');
		} catch (error: unknown) {
			console.error('Error in property update callback:', error);
			const errorMessage =
				error instanceof Error
					? error.message
					: 'Erreur lors de la mise à jour du bien';
			setError(errorMessage);

			// Scroll to top to show error
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
			setProperties((prev) =>
				prev.filter((p) => p._id !== propertyToDelete),
			);
			toast.success('Bien supprimé avec succès !');
			setShowConfirmDialog(false);
			setPropertyToDelete(null);
		} catch (error: unknown) {
			console.error('Error deleting property:', error);
			const errorMessage =
				error instanceof Error
					? error.message
					: 'Erreur lors de la suppression du bien';
			setError(errorMessage);
			toast.error(errorMessage);
		} finally {
			setDeleteLoading(false);
		}
	};

	const cancelDeleteProperty = () => {
		setShowConfirmDialog(false);
		setPropertyToDelete(null);
	};

	const handleStatusChange = async (
		propertyId: string,
		newStatus: Property['status'],
	) => {
		try {
			const updatedProperty = await PropertyService.updatePropertyStatus(
				propertyId,
				newStatus,
			);
			setProperties((prev) =>
				prev.map((p) => (p._id === propertyId ? updatedProperty : p)),
			);
		} catch (error: unknown) {
			console.error('Error updating status:', error);
			const errorMessage =
				error instanceof Error
					? error.message
					: 'Erreur lors de la mise à jour du statut';
			setError(errorMessage);
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
			) : (
				<div className="space-y-4">
					{properties.map((property) => (
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
											<div className="flex items-center space-x-2 mb-2">
												<h3 className="text-lg font-semibold text-gray-900 truncate">
													{property.title}
												</h3>
												{property.isNewProperty && (
													<span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
														Nouveau
													</span>
												)}
												{property.isExclusive && (
													<span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full">
														Exclusivité
													</span>
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
