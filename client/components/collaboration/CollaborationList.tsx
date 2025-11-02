import React, { useState, useMemo, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { LoadingSpinner, Pagination } from '@/components/ui';
import { CollaborationCard } from '@/components/collaboration/CollaborationCard';
import { Collaboration } from '@/types/collaboration';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { toast } from 'react-toastify';
import {
	useMyCollaborations,
	useCollaborationMutations,
} from '@/hooks/useCollaborations';
import { Features } from '@/lib/constants';
import { usePageState } from '@/hooks/usePageState';
import { useScrollRestoration } from '@/hooks/useScrollRestoration';
import { Select } from '@/components/ui/CustomSelect';
import type { Property } from '@/lib/api/propertyApi';
import type { SearchAd } from '@/types/searchAd';

interface CollaborationListProps {
	currentUserId: string;
	onClose: () => void;
}

export const CollaborationList: React.FC<CollaborationListProps> = ({
	currentUserId,
	onClose,
}) => {
	const [searchTerm, setSearchTerm] = useState('');
	const [statusFilter, setStatusFilter] = useState<string>('all');
	const [roleFilter, setRoleFilter] = useState<string>('all');
	const [currentPage, setCurrentPage] = useState(1);
	const itemsPerPage = 6;
	const [confirmOpen, setConfirmOpen] = useState(false);
	const [confirmMode, setConfirmMode] = useState<'cancel' | 'terminate'>(
		'cancel',
	);
	const [targetCollab, setTargetCollab] = useState<Collaboration | null>(
		null,
	);

	// Fetch collaborations using SWR
	const {
		data: collabData,
		isLoading,
		error: fetchError,
		refetch: fetchCollaborations,
	} = useMyCollaborations(currentUserId);

	// Mutations via SWR
	const { cancelCollaboration, completeCollaboration } =
		useCollaborationMutations(currentUserId);
	const [confirmLoading, setConfirmLoading] = useState(false);

	const error = fetchError?.message || null;

	const collaborations = useMemo(
		() => collabData?.collaborations || [],
		[collabData],
	);

	// Persist filters/search/pagination and scroll
	const {
		key: pageKey,
		savedState,
		save,
		urlOverrides,
	} = usePageState({
		key: 'collaboration-list',
		getCurrentState: () => ({
			filters: {
				searchTerm,
				statusFilter,
				roleFilter,
			} as unknown as Record<string, unknown>,
			currentPage,
		}),
	});

	useEffect(() => {
		const savedFilters =
			(savedState?.filters as Record<string, unknown>) || undefined;
		if (savedFilters) {
			if (typeof savedFilters.searchTerm === 'string')
				setSearchTerm(savedFilters.searchTerm);
			if (typeof savedFilters.statusFilter === 'string')
				setStatusFilter(savedFilters.statusFilter);
			if (typeof savedFilters.roleFilter === 'string')
				setRoleFilter(savedFilters.roleFilter);
		}
		if (typeof urlOverrides.currentPage === 'number') {
			setCurrentPage(urlOverrides.currentPage);
		} else if (typeof savedState?.currentPage === 'number') {
			setCurrentPage(savedState.currentPage);
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	useEffect(() => {
		save({
			filters: {
				searchTerm,
				statusFilter,
				roleFilter,
			} as unknown as Record<string, unknown>,
		});
	}, [searchTerm, statusFilter, roleFilter, save]);

	useEffect(() => {
		save({ currentPage });
	}, [currentPage, save]);

	// Scroll restoration (window scroll)
	useScrollRestoration({
		key: pageKey,
		ready: !isLoading,
	});

	const openConfirm = (
		mode: 'cancel' | 'terminate',
		collab: Collaboration,
	) => {
		setConfirmMode(mode);
		setTargetCollab(collab);
		setConfirmOpen(true);
	};

	const handleConfirmAction = async () => {
		if (!targetCollab) return;
		setConfirmLoading(true);
		const id = targetCollab._id;
		const res =
			confirmMode === 'cancel'
				? await cancelCollaboration(id)
				: await completeCollaboration(id);
		setConfirmLoading(false);
		if (res.success) {
			// Toast already shown by mutation hook for cancel
			if (confirmMode === 'terminate') {
				toast.success(
					Features.Collaboration.COLLABORATION_TOAST_MESSAGES
						.COMPLETE_SUCCESS,
				);
			}
			setConfirmOpen(false);
			setTargetCollab(null);
			await fetchCollaborations();
		} else {
			toast.error(
				Features.Collaboration.COLLABORATION_TOAST_MESSAGES
					.STATUS_UPDATE_ERROR,
			);
		}
	}; // Filter and search collaborations
	const filteredCollaborations = useMemo(() => {
		return collaborations.filter((collaboration) => {
			// Skip collaborations with missing participant data
			if (!collaboration.postOwnerId || !collaboration.collaboratorId) {
				return false;
			}

			// Status filter
			if (
				statusFilter !== 'all' &&
				collaboration.status !== statusFilter
			) {
				return false;
			}

			// Role filter
			if (roleFilter !== 'all') {
				const isOwner = collaboration.postOwnerId._id === currentUserId;
				if (roleFilter === 'owner' && !isOwner) return false;
				if (roleFilter === 'collaborator' && isOwner) return false;
			}

			// Search filter
			if (searchTerm) {
				const partner =
					collaboration.postOwnerId._id === currentUserId
						? collaboration.collaboratorId
						: collaboration.postOwnerId;
				const partnerName =
					`${partner.firstName} ${partner.lastName}`.toLowerCase();
				const collaborationId = collaboration._id.toLowerCase();
				const searchLower = searchTerm.toLowerCase();

				let matchesSearch =
					partnerName.includes(searchLower) ||
					collaborationId.includes(searchLower);

				// Also search in property/search ad data if populated
				if (
					!matchesSearch &&
					typeof collaboration.postId === 'object' &&
					collaboration.postId !== null
				) {
					const post = collaboration.postId as Partial<
						Property & SearchAd
					>;

					// Search in Property fields
					if (collaboration.postType === 'Property') {
						const propertyTitle = post.title?.toLowerCase() || '';
						const propertyCity = post.city?.toLowerCase() || '';
						const propertyType =
							post.propertyType?.toLowerCase() || '';
						const propertyDescription =
							post.description?.toLowerCase() || '';

						matchesSearch =
							propertyTitle.includes(searchLower) ||
							propertyCity.includes(searchLower) ||
							propertyType.includes(searchLower) ||
							propertyDescription.includes(searchLower);
					}
					// Search in SearchAd fields
					else if (collaboration.postType === 'SearchAd') {
						const description =
							post.description?.toLowerCase() || '';
						const cities = post.location?.cities || [];
						const citiesMatch = cities.some((city: string) =>
							city.toLowerCase().includes(searchLower),
						);

						matchesSearch =
							description.includes(searchLower) || citiesMatch;
					}
				}

				if (!matchesSearch) {
					return false;
				}
			}

			return true;
		});
	}, [collaborations, statusFilter, roleFilter, searchTerm, currentUserId]);

	// Paginated collaborations
	const paginatedCollaborations = useMemo(() => {
		const startIndex = (currentPage - 1) * itemsPerPage;
		return filteredCollaborations.slice(
			startIndex,
			startIndex + itemsPerPage,
		);
	}, [filteredCollaborations, currentPage, itemsPerPage]);

	// Reset to page 1 when filters change
	const handleFilterChange = (
		filterType: 'status' | 'role' | 'search',
		value: string,
	) => {
		setCurrentPage(1);
		if (filterType === 'status') setStatusFilter(value);
		else if (filterType === 'role') setRoleFilter(value);
		else if (filterType === 'search') setSearchTerm(value);
	};

	// Statistics
	const stats = useMemo(() => {
		// Filter out collaborations with missing data
		const validCollaborations = collaborations.filter(
			(c) => c.postOwnerId && c.collaboratorId,
		);

		const total = validCollaborations.length;
		const pending = validCollaborations.filter(
			(c) =>
				c.status ===
				Features.Collaboration.COLLABORATION_STATUS_VALUES.PENDING,
		).length;
		const accepted = validCollaborations.filter(
			(c) =>
				c.status ===
				Features.Collaboration.COLLABORATION_STATUS_VALUES.ACCEPTED,
		).length;
		const active = validCollaborations.filter(
			(c) =>
				c.status ===
				Features.Collaboration.COLLABORATION_STATUS_VALUES.ACTIVE,
		).length;
		const completed = validCollaborations.filter(
			(c) =>
				c.status ===
				Features.Collaboration.COLLABORATION_STATUS_VALUES.COMPLETED,
		).length;
		const asOwner = validCollaborations.filter(
			(c) => c.postOwnerId?._id === currentUserId,
		).length;
		const asCollaborator = total - asOwner;

		return {
			total,
			pending,
			accepted,
			active,
			completed,
			asOwner,
			asCollaborator,
		};
	}, [collaborations, currentUserId]);

	if (isLoading) {
		return (
			<div className="flex items-center justify-center py-8">
				<LoadingSpinner size="lg" />
			</div>
		);
	}

	if (error) {
		return (
			<div className="text-center py-8">
				<p className="text-red-600">{error}</p>
				<Button onClick={fetchCollaborations} className="mt-4">
					Réessayer
				</Button>
			</div>
		);
	}

	if (collaborations.length === 0) {
		return (
			<div className="text-center py-8">
				<div className="text-gray-500">
					<svg
						className="mx-auto h-12 w-12 text-gray-400"
						fill="none"
						viewBox="0 0 24 24"
						stroke="currentColor"
					>
						<path
							strokeLinecap="round"
							strokeLinejoin="round"
							strokeWidth={2}
							d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
						/>
					</svg>
					<h3 className="mt-4 text-lg font-medium text-gray-900">
						Aucune collaboration
					</h3>
					<p className="mt-2 text-sm text-gray-600">
						Vous n&apos;avez pas encore de collaborations en cours.
					</p>
				</div>
			</div>
		);
	}

	return (
		<div className="space-y-6" id="collaborations-section">
			<ConfirmDialog
				isOpen={confirmOpen}
				title={
					confirmMode === 'cancel'
						? Features.Collaboration
								.COLLABORATION_CONFIRMATION_DIALOGS.CANCEL_TITLE
						: Features.Collaboration
								.COLLABORATION_CONFIRMATION_DIALOGS
								.COMPLETE_TITLE
				}
				description={
					confirmMode === 'cancel'
						? Features.Collaboration
								.COLLABORATION_CONFIRMATION_DIALOGS
								.CANCEL_PENDING_DESCRIPTION
						: Features.Collaboration
								.COLLABORATION_CONFIRMATION_DIALOGS
								.COMPLETE_DESCRIPTION
				}
				onCancel={() => setConfirmOpen(false)}
				onConfirm={handleConfirmAction}
				confirmText={
					confirmMode === 'cancel'
						? Features.Collaboration
								.COLLABORATION_CONFIRMATION_DIALOGS
								.CANCEL_CONFIRM
						: Features.Collaboration
								.COLLABORATION_CONFIRMATION_DIALOGS
								.COMPLETE_CONFIRM
				}
				cancelText={
					Features.Collaboration.COLLABORATION_CONFIRMATION_DIALOGS
						.CANCEL_CANCEL
				}
				variant={confirmMode === 'cancel' ? 'warning' : 'danger'}
				loading={confirmLoading}
			/>
			{/* Statistics Dashboard */}
			<div className="grid grid-cols-2 md:grid-cols-7 gap-4">
				<div className="bg-brand-50 p-4 rounded-lg text-center">
					<div className="flex items-center justify-center mb-1">
						<span className="text-brand" aria-hidden>
							📊
						</span>
					</div>
					<div className="text-2xl font-bold text-brand">
						{stats.total}
					</div>
					<div className="text-sm text-brand">Total</div>
				</div>
				<div className="bg-yellow-50 p-4 rounded-lg text-center">
					<div className="flex items-center justify-center mb-1">
						<span className="text-yellow-600" aria-hidden>
							⏳
						</span>
					</div>
					<div className="text-2xl font-bold text-yellow-600">
						{stats.pending}
					</div>
					<div className="text-sm text-yellow-600">En attente</div>
				</div>
				<div className="bg-sky-50 p-4 rounded-lg text-center">
					<div className="flex items-center justify-center mb-1">
						<span className="text-sky-600" aria-hidden>
							🖊️
						</span>
					</div>
					<div className="text-2xl font-bold text-sky-600">
						{stats.accepted}
					</div>
					<div className="text-sm text-sky-600">Acceptées</div>
				</div>
				<div className="bg-green-50 p-4 rounded-lg text-center">
					<div className="flex items-center justify-center mb-1">
						<span className="text-green-600" aria-hidden>
							✅
						</span>
					</div>
					<div className="text-2xl font-bold text-green-600">
						{stats.active}
					</div>
					<div className="text-sm text-green-600">Actives</div>
				</div>
				<div className="bg-gray-50 p-4 rounded-lg text-center">
					<div className="flex items-center justify-center mb-1">
						<span className="text-gray-600" aria-hidden>
							🏁
						</span>
					</div>
					<div className="text-2xl font-bold text-gray-600">
						{stats.completed}
					</div>
					<div className="text-sm text-gray-600">Complétées</div>
				</div>
				<div className="bg-purple-50 p-4 rounded-lg text-center">
					<div className="flex items-center justify-center mb-1">
						<span className="text-purple-600" aria-hidden>
							👤
						</span>
					</div>
					<div className="text-2xl font-bold text-purple-600">
						{stats.asOwner}
					</div>
					<div className="text-sm text-purple-600">Propriétaire</div>
				</div>
				<div className="bg-indigo-50 p-4 rounded-lg text-center">
					<div className="flex items-center justify-center mb-1">
						<span className="text-indigo-600" aria-hidden>
							🤝
						</span>
					</div>
					<div className="text-2xl font-bold text-indigo-600">
						{stats.asCollaborator}
					</div>
					<div className="text-sm text-indigo-600">Collaborateur</div>
				</div>
			</div>

			{/* Filters and Search */}
			<Card className="p-4">
				<div className="grid grid-cols-1 md:grid-cols-4 gap-4">
					<div>
						<label className="block text-sm font-medium text-gray-700 mb-2">
							Rechercher
						</label>
						<Input
							type="text"
							placeholder="Nom, ville, type de bien..."
							value={searchTerm}
							onChange={(e) =>
								handleFilterChange('search', e.target.value)
							}
						/>
					</div>
					<div>
						<label className="block text-sm font-medium text-gray-700 mb-2">
							Statut
						</label>
						<Select
							label=""
							value={statusFilter}
							onChange={(value) =>
								handleFilterChange('status', value)
							}
							name="statusFilter"
							options={[
								{ value: 'all', label: 'Tous les statuts' },
								{ value: 'pending', label: 'En attente' },
								{ value: 'accepted', label: 'Acceptée' },
								{ value: 'active', label: 'Active' },
								{ value: 'completed', label: 'Complétée' },
								{ value: 'cancelled', label: 'Annulée' },
								{ value: 'rejected', label: 'Rejetée' },
							]}
						/>
					</div>
					<div>
						<label className="block text-sm font-medium text-gray-700 mb-2">
							Rôle
						</label>
						<Select
							label=""
							value={roleFilter}
							onChange={(value) =>
								handleFilterChange('role', value)
							}
							name="roleFilter"
							options={[
								{ value: 'all', label: 'Tous les rôles' },
								{ value: 'owner', label: 'Propriétaire' },
								{
									value: 'collaborator',
									label: 'Collaborateur',
								},
							]}
						/>
					</div>
					<div className="flex items-end">
						<Button
							variant="outline"
							onClick={() => {
								setSearchTerm('');
								setStatusFilter('all');
								setRoleFilter('all');
								setCurrentPage(1);
							}}
							className="w-full"
						>
							Réinitialiser
						</Button>
					</div>
				</div>
			</Card>

			{/* Results Summary */}
			{(searchTerm || statusFilter !== 'all' || roleFilter !== 'all') && (
				<div className="text-sm text-gray-600">
					{filteredCollaborations.length} collaboration(s) trouvée(s)
					{collaborations.length !== filteredCollaborations.length &&
						` sur ${collaborations.length} au total`}
				</div>
			)}

			{/* Collaborations List */}
			<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
				{filteredCollaborations.length === 0 ? (
					<div className="col-span-full text-center py-8">
						<p className="text-gray-500">
							Aucune collaboration ne correspond aux critères de
							filtrage.
						</p>
					</div>
				) : (
					paginatedCollaborations.map((collaboration) => (
						<CollaborationCard
							key={collaboration._id}
							collaboration={collaboration}
							currentUserId={currentUserId}
							onClose={onClose}
							onCancel={() => {
								if (
									collaboration.status ===
									Features.Collaboration
										.COLLABORATION_STATUS_VALUES.PENDING
								) {
									openConfirm('cancel', collaboration);
								} else if (
									collaboration.status ===
									Features.Collaboration
										.COLLABORATION_STATUS_VALUES.ACTIVE
								) {
									openConfirm('terminate', collaboration);
								}
							}}
						/>
					))
				)}
			</div>

			{/* Pagination */}
			{filteredCollaborations.length > 0 && (
				<Pagination
					currentPage={currentPage}
					totalItems={filteredCollaborations.length}
					pageSize={itemsPerPage}
					onPageChange={setCurrentPage}
					scrollTargetId="collaborations-section"
				/>
			)}
		</div>
	);
};
