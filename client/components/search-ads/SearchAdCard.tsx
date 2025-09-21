import React, { useState } from 'react';
import { SearchAd } from '@/types/searchAd';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { ConfirmDialog } from '../ui/ConfirmDialog';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import searchAdApi from '@/lib/api/searchAdApi';

interface SearchAdCardProps {
	searchAd: SearchAd;
	isOwner?: boolean;
	showActions?: boolean;
	onUpdate?: () => void;
}

export const SearchAdCard: React.FC<SearchAdCardProps> = ({
	searchAd,
	isOwner = false,
	showActions = true,
	onUpdate,
}) => {
	const router = useRouter();
	const { user } = useAuth();
	const [isDeleting, setIsDeleting] = useState(false);
	const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
	const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

	const handleContact = () => {
		router.push(
			`/chat?userId=${searchAd.authorId._id}&searchAdId=${searchAd._id}&type=search-ad-contact`,
		);
	};

	const handleViewDetails = () => {
		router.push(`/search-ads/${searchAd._id}`);
	};

	const handleEdit = () => {
		router.push(`/search-ads/edit/${searchAd._id}`);
	};

	const handleDelete = async () => {
		setIsDeleting(true);
		try {
			await searchAdApi.deleteSearchAd(searchAd._id);
			setShowDeleteConfirm(false);
			if (onUpdate) {
				onUpdate();
			}
		} catch (error) {
			console.error('Erreur lors de la suppression:', error);
			// Could add toast notification here instead of alert
		} finally {
			setIsDeleting(false);
		}
	};

	const handleStatusChange = async (newStatus: SearchAd['status']) => {
		if (newStatus === searchAd.status) return;

		setIsUpdatingStatus(true);
		try {
			await searchAdApi.updateSearchAdStatus(searchAd._id, newStatus);
			if (onUpdate) {
				onUpdate();
			}
		} catch (error) {
			console.error('Erreur lors de la mise à jour du statut:', error);
		} finally {
			setIsUpdatingStatus(false);
		}
	};

	// Check if current user is the owner
	const isCurrentUserOwner = user?._id === searchAd.authorId._id;

	const getStatusBadge = (status: SearchAd['status']) => {
		const statusConfig = {
			active: {
				label: 'Actif',
				className: 'bg-green-100 text-green-800',
			},
			paused: {
				label: 'En pause',
				className: 'bg-yellow-100 text-yellow-800',
			},
			fulfilled: {
				label: 'Réalisé',
				className: 'bg-blue-100 text-blue-800',
			},
			sold: {
				label: 'Vendu',
				className: 'bg-red-100 text-red-800',
			},
			rented: {
				label: 'Loué',
				className: 'bg-blue-100 text-blue-800',
			},
			archived: {
				label: 'Archivé',
				className: 'bg-gray-100 text-gray-800',
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

	return (
		<Card className="p-6 flex flex-col gap-4 hover:shadow-lg transition-shadow">
			<div className="flex justify-between items-start">
				<div className="flex-1">
					<h3 className="font-bold text-lg text-gray-900 mb-1">
						{searchAd.title}
					</h3>
					<div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
						<div className="flex items-center gap-1">
							<span className="w-2 h-2 bg-green-500 rounded-full"></span>
							<span>Recherche par</span>
						</div>
						<span className="font-medium text-gray-900">
							{searchAd.authorId.firstName}{' '}
							{searchAd.authorId.lastName}
						</span>
						<span className="text-xs bg-brand-200 text-brand-800 px-2 py-1 rounded-full">
							{searchAd.authorType === 'agent'
								? 'Agent'
								: 'Apporteur'}
						</span>
					</div>
				</div>
				<span className="text-xs bg-brand-100 text-brand-800 px-3 py-1 rounded-full whitespace-nowrap">
					Recherche Client
				</span>
			</div>

			<div className="grid grid-cols-2 gap-4 text-sm">
				<div>
					<p className="font-semibold text-gray-700 flex items-center gap-1">
						📍 Localisation
					</p>
					<p className="text-gray-600">
						{searchAd.location.cities.slice(0, 2).join(', ')}
						{searchAd.location.cities.length > 2 ? '...' : ''}
					</p>
				</div>
				<div>
					<p className="font-semibold text-gray-700 flex items-center gap-1">
						💰 Budget Max
					</p>
					<p className="text-gray-600">
						{searchAd.budget.max.toLocaleString('fr-FR')} €
					</p>
				</div>
				<div>
					<p className="font-semibold text-gray-700 flex items-center gap-1">
						🏡 Type de bien
					</p>
					<p className="text-gray-600 capitalize">
						{searchAd.propertyTypes
							.map((type) =>
								type === 'house'
									? 'Maison'
									: type === 'apartment'
										? 'Appartement'
										: type === 'land'
											? 'Terrain'
											: type === 'building'
												? 'Immeuble'
												: 'Commercial',
							)
							.join(', ')}
					</p>
				</div>
				{searchAd.minSurface && (
					<div>
						<p className="font-semibold text-gray-700 flex items-center gap-1">
							📐 Surface min.
						</p>
						<p className="text-gray-600">
							{searchAd.minSurface} m²
						</p>
					</div>
				)}
			</div>

			{searchAd.description && (
				<p className="text-sm text-gray-600 italic bg-gray-50 p-3 rounded-lg">
					&quot;
					{searchAd.description.length > 100
						? searchAd.description.substring(0, 100) + '...'
						: searchAd.description}
					&quot;
				</p>
			)}

			{/* Priority indicators */}
			{searchAd.priorities?.mustHaves &&
				searchAd.priorities.mustHaves.length > 0 && (
					<div>
						<p className="text-xs font-semibold text-gray-700 mb-1">
							Critères prioritaires :
						</p>
						<div className="flex flex-wrap gap-1">
							{searchAd.priorities.mustHaves
								.slice(0, 3)
								.map((priority, index) => (
									<span
										key={index}
										className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded"
									>
										{priority}
									</span>
								))}
						</div>
					</div>
				)}

			<div className="mt-auto pt-2 space-y-2">
				{showActions && (isOwner || isCurrentUserOwner) ? (
					<>
						<Button
							onClick={handleViewDetails}
							variant="outline"
							className="w-full"
						>
							Voir les détails
						</Button>

						{/* Status Management Section */}
						<div className="flex items-center justify-between pt-2 border-t border-gray-100">
							<div className="flex items-center space-x-2">
								<select
									value={searchAd.status}
									onChange={(e) =>
										handleStatusChange(
											e.target
												.value as SearchAd['status'],
										)
									}
									disabled={isUpdatingStatus}
									className="text-sm border border-gray-300 rounded px-2 py-1 bg-white"
								>
									<option value="active">Actif</option>
									<option value="paused">En pause</option>
									<option value="fulfilled">Réalisé</option>
									<option value="sold">Vendu</option>
									<option value="rented">Loué</option>
									<option value="archived">Archivé</option>
								</select>
								{getStatusBadge(searchAd.status)}
							</div>
						</div>

						<div className="flex gap-2">
							<Button
								onClick={handleEdit}
								variant="outline"
								className="flex-1"
							>
								Modifier
							</Button>
							<Button
								onClick={() => setShowDeleteConfirm(true)}
								variant="secondary"
								className="flex-1 bg-red-600 hover:bg-red-700"
								disabled={isDeleting}
							>
								{isDeleting ? 'Suppression...' : 'Supprimer'}
							</Button>
						</div>
					</>
				) : !showActions ? (
					<>
						<Button
							onClick={handleViewDetails}
							variant="outline"
							className="w-full"
						>
							Voir les détails
						</Button>
						<Button onClick={handleContact} className="w-full">
							Contacter {searchAd.authorId.firstName}
						</Button>
					</>
				) : (
					<>
						<Button
							onClick={handleViewDetails}
							variant="outline"
							className="w-full"
						>
							Voir les détails
						</Button>
						<Button onClick={handleContact} className="w-full">
							Contacter {searchAd.authorId.firstName}
						</Button>
					</>
				)}

				{/* Footer with date and author info - similar to PropertyCard */}
				<div className="flex items-center justify-between pt-2 border-t border-gray-100">
					<div className="flex items-center space-x-2">
						<div className="w-6 h-6 bg-gray-300 rounded-full overflow-hidden">
							<img
								src={
									searchAd.authorId.avatar ||
									`https://ui-avatars.com/api/?name=${encodeURIComponent(
										searchAd.authorId.firstName +
											' ' +
											searchAd.authorId.lastName,
									)}&background=3b82f6&color=ffffff`
								}
								alt={`${searchAd.authorId.firstName} ${searchAd.authorId.lastName}`}
								className="w-full h-full object-cover"
							/>
						</div>
						<div>
							<p className="text-gray-700 font-medium text-xs">
								{searchAd.authorId.firstName}{' '}
								{searchAd.authorId.lastName}
							</p>
							<p className="text-gray-500 text-xs">
								{searchAd.authorType === 'agent'
									? 'Agent'
									: 'Apporteur'}
							</p>
						</div>
					</div>
					<p className="text-xs text-gray-500">
						{new Date(searchAd.createdAt).toLocaleDateString(
							'fr-FR',
						)}
					</p>
				</div>
			</div>

			{/* Delete Confirmation Dialog */}
			<ConfirmDialog
				isOpen={showDeleteConfirm}
				title="Êtes-vous sûr de vouloir supprimer cette recherche ?"
				description="Cette action est irréversible et supprimera définitivement cette recherche."
				onConfirm={handleDelete}
				onCancel={() => setShowDeleteConfirm(false)}
				confirmText="Supprimer"
				cancelText="Annuler"
				variant="danger"
				loading={isDeleting}
			/>
		</Card>
	);
};
