import React, { useState } from 'react';
import Image from 'next/image';
import { SearchAd } from '@/types/searchAd';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { ConfirmDialog } from '../ui/ConfirmDialog';
import { ProfileAvatar, FavoriteButton } from '../ui';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { Features, Components } from '@/lib/constants';
import { useSearchAdMutations } from '@/hooks/useSearchAds';
import { formatDateShort } from '@/lib/utils/date';
import { truncateRichText } from '@/lib/utils/richTextUtils';

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
	const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
	const [isDeleting, setIsDeleting] = useState(false);
	const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

	// SWR mutations
	const { deleteSearchAd, updateSearchAdStatus } = useSearchAdMutations(
		user?._id,
	);

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
		const result = await deleteSearchAd(searchAd._id);
		setIsDeleting(false);

		if (result.success) {
			setShowDeleteConfirm(false);
			onUpdate?.();
		}
	};

	const handleStatusChange = async (newStatus: SearchAd['status']) => {
		if (newStatus === searchAd.status) return;

		setIsUpdatingStatus(true);
		const result = await updateSearchAdStatus(searchAd._id, newStatus);
		setIsUpdatingStatus(false);

		if (result.success) {
			onUpdate?.();
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
		<Card className="overflow-hidden hover:shadow-lg transition-shadow">
			{/* Image Section */}
			<div className="relative h-48 w-full">
				<Image
					src="/recherches-des-biens.png"
					alt={Components.UI.IMAGE_ALT_TEXT.searchAdImage}
					fill
					className="object-cover"
				/>
				{/* Badges overlay */}
				<div className="absolute top-2 left-2 flex flex-wrap gap-1 max-w-[70%]">
					{searchAd.badges &&
						searchAd.badges.length > 0 &&
						searchAd.badges.slice(0, 5).map((badgeValue) => {
							const config =
								Features.Properties.getSearchAdBadgeConfig(
									badgeValue,
								);
							if (!config) return null;

							return (
								<span
									key={badgeValue}
									className={`${config.bgColor} ${config.color} text-xs px-2 py-1 rounded-full font-semibold`}
								>
									{config.label}
								</span>
							);
						})}
				</div>
				{/* Favorite Button */}
				<div className="absolute top-2 right-2">
					<FavoriteButton
						itemId={searchAd._id}
						itemType="searchAd"
						size="md"
					/>
				</div>
			</div>

			{/* Content Section */}
			<div className="p-6 flex flex-col gap-4">
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
				</div>

				<div className="grid grid-cols-2 gap-4 text-sm">
					<div>
						<p className="font-semibold text-gray-700 flex items-center gap-1">
							📍 {Features.SearchAds.SEARCH_AD_UI_TEXT.location}
						</p>
						<p className="text-gray-600">
							{searchAd.location.cities.slice(0, 2).join(', ')}
							{searchAd.location.cities.length > 2 ? '...' : ''}
						</p>
					</div>
					<div>
						<p className="font-semibold text-gray-700 flex items-center gap-1">
							💰{' '}
							{Features.SearchAds.SEARCH_AD_UI_TEXT.budgetLabel}
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
								📐{' '}
								{
									Features.SearchAds.SEARCH_AD_UI_TEXT
										.surfaceLabel
								}
							</p>
							<p className="text-gray-600">
								{searchAd.minSurface} m²
							</p>
						</div>
					)}
				</div>

				{searchAd.description && (
					<p className="text-sm text-gray-600 italic bg-gray-50 p-3 rounded-lg">
						&quot;{truncateRichText(searchAd.description, 100)}
						&quot;
					</p>
				)}

				{/* Priority indicators */}
				{searchAd.priorities?.mustHaves &&
					searchAd.priorities.mustHaves.length > 0 && (
						<div>
							<p className="text-xs font-semibold text-gray-700 mb-1">
								{Features.SearchAds.SEARCH_AD_UI_TEXT.mustHaves}{' '}
								:
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
										<option value="fulfilled">
											Réalisé
										</option>
										<option value="sold">Vendu</option>
										<option value="rented">Loué</option>
										<option value="archived">
											Archivé
										</option>
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
									{Components.UI.BUTTON_TEXT.edit}
								</Button>
								<Button
									onClick={() => setShowDeleteConfirm(true)}
									variant="secondary"
									className="flex-1 bg-red-600 hover:bg-red-700"
									loading={isDeleting}
								>
									{Components.UI.BUTTON_TEXT.delete}
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
							<ProfileAvatar user={searchAd.authorId} size="xs" />
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
							{formatDateShort(searchAd.createdAt)}
						</p>
					</div>
				</div>
			</div>

			{/* Delete Confirmation Dialog */}
			<ConfirmDialog
				isOpen={showDeleteConfirm}
				title={
					Features.SearchAds.SEARCH_AD_CONFIRMATION_DIALOGS
						.DELETE_TITLE
				}
				description={
					Features.SearchAds.SEARCH_AD_CONFIRMATION_DIALOGS
						.DELETE_DESCRIPTION
				}
				onConfirm={handleDelete}
				onCancel={() => setShowDeleteConfirm(false)}
				confirmText={
					Features.SearchAds.SEARCH_AD_CONFIRMATION_DIALOGS
						.DELETE_CONFIRM
				}
				cancelText={
					Features.SearchAds.SEARCH_AD_CONFIRMATION_DIALOGS
						.DELETE_CANCEL
				}
				variant="danger"
				loading={isDeleting}
			/>
		</Card>
	);
};
