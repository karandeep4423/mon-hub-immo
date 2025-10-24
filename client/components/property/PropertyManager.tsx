'use client';

import React, { useState, useMemo } from 'react';
import { Button, ConfirmDialog } from '@/components/ui';
import { PropertyForm } from './PropertyForm';
import {
	PropertyFilters,
	PropertyListItem,
	PropertyEmptyState,
	NoResultsState,
	PropertyHeader,
} from './index';
import { useAuth } from '@/hooks/useAuth';
import { useFetch } from '@/hooks/useFetch';
import { usePropertyFilters } from '@/hooks/usePropertyFilters';
import { usePropertyActions } from '@/hooks/usePropertyActions';
import { PageLoader } from '@/components/ui/LoadingSpinner';
import { PropertyService, Property } from '@/lib/api/propertyApi';

export const PropertyManager: React.FC = () => {
	const { user } = useAuth();
	const [showForm, setShowForm] = useState(false);
	const [editingProperty, setEditingProperty] = useState<Property | null>(
		null,
	);

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

	// Property filters hook
	const {
		filteredProperties,
		filters,
		setFilters,
		resetFilters,
		hasActiveFilters,
	} = usePropertyFilters({ properties });

	// Property actions hook
	const {
		updateStatus,
		deleteLoading,
		showConfirmDialog,
		openDeleteDialog,
		closeDeleteDialog,
		confirmDelete,
	} = usePropertyActions({ onSuccess: refetchProperties });

	const handleFormSuccess = () => {
		setShowForm(false);
		setEditingProperty(null);
		refetchProperties();
	};

	const handleFormSubmit = async () => {
		// PropertyForm handles actual API call, just handle post-submit
		handleFormSuccess();
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
					onSubmit={handleFormSubmit}
					initialData={editingProperty || undefined}
					isEditing={!!editingProperty}
				/>
			</div>
		);
	}

	return (
		<div className="space-y-6">
			<PropertyHeader
				propertiesCount={properties.length}
				onCreateClick={() => setShowForm(true)}
			/>
			{error && (
				<div className="bg-red-50 border border-red-200 rounded-lg p-4">
					<p className="text-red-800">{error}</p>
				</div>
			)}
			{/* Filter Section */}
			{!loading && properties.length > 0 && (
				<PropertyFilters
					filters={filters}
					onFiltersChange={setFilters}
					onReset={resetFilters}
					hasActiveFilters={hasActiveFilters}
					resultsCount={filteredProperties.length}
					totalCount={properties.length}
				/>
			)}
			{loading ? (
				<PageLoader message="Chargement de vos biens..." />
			) : properties.length === 0 ? (
				<PropertyEmptyState onCreateClick={() => setShowForm(true)} />
			) : filteredProperties.length === 0 && hasActiveFilters ? (
				<NoResultsState onResetFilters={resetFilters} />
			) : (
				<div className="space-y-4">
					{filteredProperties.map((property) => (
						<PropertyListItem
							key={property._id}
							property={property}
							onEdit={(property) => {
								setEditingProperty(property);
								setShowForm(true);
							}}
							onDelete={openDeleteDialog}
							onStatusChange={updateStatus}
						/>
					))}
				</div>
			)}{' '}
			{/* Confirm Delete Dialog */}
			<ConfirmDialog
				isOpen={showConfirmDialog}
				title="Supprimer le bien"
				description="Êtes-vous sûr de vouloir supprimer ce bien ? Cette action est irréversible."
				onConfirm={confirmDelete}
				onCancel={closeDeleteDialog}
				confirmText="Supprimer"
				cancelText="Annuler"
				variant="danger"
				loading={deleteLoading}
			/>
		</div>
	);
};
