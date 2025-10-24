import React, { useState, useMemo } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { CollaborationCard } from '@/components/collaboration/CollaborationCard';
import { Collaboration } from '@/types/collaboration';
import { collaborationApi } from '@/lib/api/collaborationApi';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { toast } from 'react-toastify';
import { useFetch } from '@/hooks/useFetch';
import { useMutation } from '@/hooks/useMutation';
import { TOAST_MESSAGES } from '@/lib/constants';

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
	const [confirmOpen, setConfirmOpen] = useState(false);
	const [confirmMode, setConfirmMode] = useState<'cancel' | 'terminate'>(
		'cancel',
	);
	const [targetCollab, setTargetCollab] = useState<Collaboration | null>(
		null,
	);

	// Fetch collaborations using useFetch hook
	const {
		data: collabData,
		loading: isLoading,
		error: fetchError,
		refetch: fetchCollaborations,
	} = useFetch(() => collaborationApi.getUserCollaborations(), {
		initialData: { collaborations: [] },
		showErrorToast: true,
		errorMessage: TOAST_MESSAGES.COLLABORATION.FETCH_ERROR,
	});

	// Mutation for cancel/terminate actions
	const { mutate: updateCollabStatus, loading: confirmLoading } = useMutation(
		async (data: { id: string; mode: 'cancel' | 'terminate' }) => {
			if (data.mode === 'cancel') {
				return await collaborationApi.cancel(data.id);
			} else {
				return await collaborationApi.complete(data.id);
			}
		},
		{
			onSuccess: async (_, variables) => {
				toast.success(
					variables.mode === 'cancel'
						? TOAST_MESSAGES.COLLABORATION.CANCEL_SUCCESS
						: TOAST_MESSAGES.COLLABORATION.COMPLETE_SUCCESS,
				);
				setConfirmOpen(false);
				setTargetCollab(null);
				await fetchCollaborations();
			},
			errorMessage: TOAST_MESSAGES.COLLABORATION.STATUS_UPDATE_ERROR,
		},
	);

	const collaborations = useMemo(
		() => collabData?.collaborations || [],
		[collabData],
	);
	const error = fetchError?.message || null;

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
		await updateCollabStatus({ id: targetCollab._id, mode: confirmMode });
	};

	// Filter and search collaborations
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

				return (
					partnerName.includes(searchLower) ||
					collaborationId.includes(searchLower)
				);
			}

			return true;
		});
	}, [collaborations, statusFilter, roleFilter, searchTerm, currentUserId]);

	// Statistics
	const stats = useMemo(() => {
		// Filter out collaborations with missing data
		const validCollaborations = collaborations.filter(
			(c) => c.postOwnerId && c.collaboratorId,
		);

		const total = validCollaborations.length;
		const pending = validCollaborations.filter(
			(c) => c.status === 'pending',
		).length;
		const accepted = validCollaborations.filter(
			(c) => c.status === 'accepted',
		).length;
		const active = validCollaborations.filter(
			(c) => c.status === 'active',
		).length;
		const completed = validCollaborations.filter(
			(c) => c.status === 'completed',
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
		<div className="space-y-6">
			<ConfirmDialog
				isOpen={confirmOpen}
				title={
					confirmMode === 'cancel'
						? 'Annuler la collaboration ?'
						: 'Terminer la collaboration ?'
				}
				description={
					confirmMode === 'cancel'
						? 'Cette action annulera la collaboration en attente. Voulez-vous continuer ?'
						: 'Cette action marquera la collaboration comme terminée. Voulez-vous continuer ?'
				}
				onCancel={() => setConfirmOpen(false)}
				onConfirm={handleConfirmAction}
				confirmText={
					confirmMode === 'cancel' ? 'Oui, annuler' : 'Oui, terminer'
				}
				cancelText="Non, revenir"
				variant={confirmMode === 'cancel' ? 'warning' : 'danger'}
				loading={confirmLoading}
			/>
			{/* Statistics Dashboard */}
			<div className="grid grid-cols-2 md:grid-cols-7 gap-4">
				<div className="bg-blue-50 p-4 rounded-lg text-center">
					<div className="flex items-center justify-center mb-1">
						<span className="text-blue-600" aria-hidden>
							📊
						</span>
					</div>
					<div className="text-2xl font-bold text-blue-600">
						{stats.total}
					</div>
					<div className="text-sm text-blue-600">Total</div>
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
					<div className="text-sm text-gray-600">Terminées</div>
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
							placeholder="Nom du partenaire ou ID..."
							value={searchTerm}
							onChange={(e) => setSearchTerm(e.target.value)}
						/>
					</div>
					<div>
						<label className="block text-sm font-medium text-gray-700 mb-2">
							Statut
						</label>
						<select
							value={statusFilter}
							onChange={(e) => setStatusFilter(e.target.value)}
							className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
						>
							<option value="all">Tous les statuts</option>
							<option value="pending">En attente</option>
							<option value="accepted">Acceptée</option>
							<option value="active">Active</option>
							<option value="completed">Terminée</option>
							<option value="rejected">Rejetée</option>
						</select>
					</div>
					<div>
						<label className="block text-sm font-medium text-gray-700 mb-2">
							Rôle
						</label>
						<select
							value={roleFilter}
							onChange={(e) => setRoleFilter(e.target.value)}
							className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
						>
							<option value="all">Tous les rôles</option>
							<option value="owner">Propriétaire</option>
							<option value="collaborator">Collaborateur</option>
						</select>
					</div>
					<div className="flex items-end">
						<Button
							variant="outline"
							onClick={() => {
								setSearchTerm('');
								setStatusFilter('all');
								setRoleFilter('all');
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
					filteredCollaborations.map((collaboration) => (
						<CollaborationCard
							key={collaboration._id}
							collaboration={collaboration}
							currentUserId={currentUserId}
							onClose={onClose}
							onCancel={() => {
								if (collaboration.status === 'pending') {
									openConfirm('cancel', collaboration);
								} else if (collaboration.status === 'active') {
									openConfirm('terminate', collaboration);
								}
							}}
						/>
					))
				)}
			</div>
		</div>
	);
};
