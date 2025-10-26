'use client';

import React, { useState, useMemo } from 'react';
import { Button, ConfirmDialog, Pagination } from '@/components/ui';
import { PropertyForm } from './PropertyForm';
import {
	PropertyFilters,
	PropertyListItem,
	PropertyEmptyState,
	NoResultsState,
	PropertyHeader,
} from './index';
import { useAuth } from '@/hooks/useAuth';
import { useMyProperties, usePropertyMutations } from '@/hooks/useProperties';
import { usePropertyFilters } from '@/hooks/usePropertyFilters';
import { usePropertyActions } from '@/hooks/usePropertyActions';
import { PageLoader } from '@/components/ui/LoadingSpinner';
import { Property } from '@/lib/api/propertyApi';

export const PropertyManager: React.FC = () => {
	const { user } = useAuth();
	const [showForm, setShowForm] = useState(false);
	const [editingProperty, setEditingProperty] = useState<Property | null>(
		null,
	);
	const [currentPage, setCurrentPage] = useState(1);
	const itemsPerPage = 6;

	// Use SWR to fetch properties
	const {
		data: propertiesData,
		isLoading: loading,
		error: fetchError,
	} = useMyProperties(user?._id);

	// Get mutation functions
	const { invalidatePropertyCaches } = usePropertyMutations(user?._id);

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

	// Paginated properties
	const paginatedProperties = useMemo(() => {
		const startIndex = (currentPage - 1) * itemsPerPage;
		return filteredProperties.slice(startIndex, startIndex + itemsPerPage);
	}, [filteredProperties, currentPage, itemsPerPage]);

	// Reset to page 1 when filters change
	const handleFiltersChange = (newFilters: typeof filters) => {
		setFilters(newFilters);
		setCurrentPage(1);
	};

	const handleResetFilters = () => {
		resetFilters();
		setCurrentPage(1);
	};

	// Property actions hook
	const {
		updateStatus,
		deleteLoading,
		showConfirmDialog,
		openDeleteDialog,
		closeDeleteDialog,
		confirmDelete,
	} = usePropertyActions({ onSuccess: invalidatePropertyCaches });

	const handleFormSuccess = () => {
		setShowForm(false);
		setEditingProperty(null);
		invalidatePropertyCaches();
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
		<div className="space-y-6" id="properties-section">
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
					onFiltersChange={handleFiltersChange}
					onReset={handleResetFilters}
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
				<NoResultsState onResetFilters={handleResetFilters} />
			) : (
				<>
					<div className="space-y-4">
						{paginatedProperties.map((property) => (
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
					<Pagination
						currentPage={currentPage}
						totalItems={filteredProperties.length}
						pageSize={itemsPerPage}
						onPageChange={setCurrentPage}
						scrollTargetId="properties-section"
					/>
				</>
			)}
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
