'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { ConfirmDialog, Pagination } from '@/components/ui';
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
import { Features } from '@/lib/constants';
import { usePropertyActions } from '@/hooks/usePropertyActions';
import { PageLoader } from '@/components/ui/LoadingSpinner';
import { Property } from '@/lib/api/propertyApi';
import { usePageState } from '@/hooks/usePageState';
import { useScrollRestoration } from '@/hooks/useScrollRestoration';

export const PropertyManager: React.FC = () => {
	const { user } = useAuth();
	const [showForm, setShowForm] = useState(false);
	const [editingProperty, setEditingProperty] = useState<Property | null>(null);
	const [currentPage, setCurrentPage] = useState(1);
	const itemsPerPage = 6;

	// Use SWR to fetch properties with pagination
	const {
		data: propertiesData,
		isLoading: loading,
		error: fetchError,
	} = useMyProperties(user?._id, currentPage);

	// Get mutation functions
	const { invalidatePropertyCaches } = usePropertyMutations(user?._id);

	const properties = useMemo(() => propertiesData?.properties || [], [propertiesData]);
	const pagination = useMemo(() => propertiesData?.pagination, [propertiesData]);
	const error = fetchError?.message || null;

	// Property filters hook
	const { filteredProperties, filters, setFilters, resetFilters, hasActiveFilters } =
		usePropertyFilters({ properties });

	// Page state (restore tabs/filters/pagination + scroll)
	const { key: pageKey, savedState, save, urlOverrides } = usePageState({
		hasFilters: true,
		hasPagination: true,
		getCurrentState: () => ({
			filters: filters as unknown as Record<string, unknown>,
			currentPage,
		}),
	});

	// Apply restored state (URL params take priority over saved state)
	useEffect(() => {
		if (savedState?.filters) {
			setFilters(savedState.filters as unknown as typeof filters);
		}
		if (typeof urlOverrides.currentPage === 'number') {
			setCurrentPage(urlOverrides.currentPage);
		} else if (typeof savedState?.currentPage === 'number') {
			setCurrentPage(savedState.currentPage);
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	// Use paginated properties from backend or filtered client-side if filters exist
	const displayProperties = hasActiveFilters ? filteredProperties : properties;
	const totalItems = hasActiveFilters ? filteredProperties.length : pagination?.totalItems || properties.length;

	// Reset to page 1 when filters change
	const handleFiltersChange = (newFilters: typeof filters) => {
		setFilters(newFilters);
		setCurrentPage(1);
		save({ filters: newFilters as unknown as Record<string, unknown>, currentPage: 1 });
	};

	const handleResetFilters = () => {
		resetFilters();
		setCurrentPage(1);
		save({ filters: {}, currentPage: 1 });
	};

	// Property actions hook
	const { updateStatus, deleteLoading, showConfirmDialog, openDeleteDialog, closeDeleteDialog, confirmDelete } =
		usePropertyActions({ onSuccess: invalidatePropertyCaches });

	const handleFormSuccess = () => {
		setShowForm(false);
		setEditingProperty(null);
		invalidatePropertyCaches();
	};

	const handleFormSubmit = async () => {
		// PropertyForm handles actual API call, just handle post-submit
		handleFormSuccess();
	};

	// Persist pagination changes
	useEffect(() => {
		save({ currentPage });
	}, [currentPage, save]);

	// Scroll restoration (window scroll)
	useScrollRestoration({ key: pageKey, ready: !loading });

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
				<PropertyForm
					onSubmit={handleFormSubmit}
					initialData={editingProperty || undefined}
					isEditing={!!editingProperty}
					onCancel={() => {
						setShowForm(false);
						setEditingProperty(null);
					}}
				/>
			</div>
		);
	}

	return (
		<div className="space-y-6" id="properties-section">
			<PropertyHeader propertiesCount={properties.length} onCreateClick={() => setShowForm(true)} />
			{error && (
				<div className="bg-red-50 border border}-red-200 rounded-lg p-4">
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
				<PageLoader message={Features.Properties.PROPERTY_LOADING.PAGE} />
			) : properties.length === 0 ? (
				<PropertyEmptyState onCreateClick={() => setShowForm(true)} />
			) : filteredProperties.length === 0 && hasActiveFilters ? (
				<NoResultsState onResetFilters={handleResetFilters} />
			) : (
				<>
					<div className="space-y-4">
						{displayProperties.map((property) => (
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
						totalItems={totalItems}
						pageSize={itemsPerPage}
						onPageChange={setCurrentPage}
						scrollTargetId="properties-section"
					/>
				</>
			)}
			{/* Confirm Delete Dialog */}
			<ConfirmDialog
				isOpen={showConfirmDialog}
				title={Features.Properties.PROPERTY_CONFIRMATION_DIALOGS.DELETE_TITLE}
				description={Features.Properties.PROPERTY_CONFIRMATION_DIALOGS.DELETE_DESCRIPTION}
				onConfirm={confirmDelete}
				onCancel={closeDeleteDialog}
				confirmText={Features.Properties.PROPERTY_CONFIRMATION_DIALOGS.DELETE_CONFIRM}
				cancelText={Features.Properties.PROPERTY_CONFIRMATION_DIALOGS.DELETE_CANCEL}
				variant="danger"
				loading={deleteLoading}
			/>
		</div>
	);
};
