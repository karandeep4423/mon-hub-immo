'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { ImageLightbox } from '@/components/ui/ImageLightbox';
import { ProposeCollaborationModal } from '@/components/collaboration/ProposeCollaborationModal';
import { ProfileAvatar } from '@/components/ui';
import { useAuth } from '@/hooks/useAuth';
import { collaborationApi } from '@/lib/api/collaborationApi';
import { PropertyService, type Property } from '@/lib/api/propertyApi';
import { toast } from 'react-toastify';
import { logger } from '@/lib/utils/logger';
import { useFetch } from '@/hooks';
import { PageLoader } from '@/components/ui/LoadingSpinner';

// Import new detail components
import {
	PropertyHero,
	PropertyDescription,
	PropertyFeatures,
} from '@/components/property/detail';

export default function PropertyDetailsPage() {
	const params = useParams();
	const router = useRouter();
	const { user } = useAuth();
	const propertyId = params?.id as string;

	// Fetch property using useFetch hook
	const {
		data: property,
		loading,
		error,
	} = useFetch<Property>(() => PropertyService.getPropertyById(propertyId), {
		skip: !propertyId,
		showErrorToast: true,
		errorMessage: 'Erreur lors du chargement du bien',
	});

	const [showCollaborationModal, setShowCollaborationModal] = useState(false);
	const [hasBlockingCollab, setHasBlockingCollab] = useState<boolean>(false);
	const [blockingStatus, setBlockingStatus] = useState<
		'pending' | 'accepted' | 'active' | null
	>(null);
	const [showLightbox, setShowLightbox] = useState(false);
	const [lightboxInitialIndex, setLightboxInitialIndex] = useState(0);

	// Check if current user is the property owner
	const isPropertyOwner =
		user &&
		property &&
		(user._id === property.owner._id || user.id === property.owner._id);

	// Fetch collaborations for this property to determine if proposal should be disabled
	const loadPropertyCollaborations = useCallback(async () => {
		try {
			if (!propertyId) return;
			const { collaborations } =
				await collaborationApi.getPropertyCollaborations(propertyId);
			const blocking = collaborations.find((c) =>
				['pending', 'accepted', 'active'].includes(c.status as string),
			);
			if (blocking) {
				setHasBlockingCollab(true);
				setBlockingStatus(
					blocking.status as 'pending' | 'accepted' | 'active',
				);
			} else {
				setHasBlockingCollab(false);
				setBlockingStatus(null);
			}
		} catch (e) {
			logger.warn('Failed to load property collaborations', e);
		}
	}, [propertyId]);

	useEffect(() => {
		// Only check collaborations if user is NOT the property owner
		if (!isPropertyOwner && user) {
			loadPropertyCollaborations();
		}
	}, [loadPropertyCollaborations, isPropertyOwner, user]);

	const handleContactOwner = () => {
		if (!user) {
			router.push('/auth/login');
			return;
		}

		if (property) {
			// Navigate to chat with the property owner
			router.push(
				`/chat?userId=${property.owner._id}&propertyId=${property._id}`,
			);
		}
	};

	const handleCollaborate = () => {
		if (!user) {
			router.push('/auth/login');
			return;
		}

		setShowCollaborationModal(true);
	};

	const allImages = property
		? [property.mainImage, ...(property.galleryImages ?? [])]
		: [];

	// Helper function to get image URL
	const getImageSrc = (image: string | { url: string; key: string }) => {
		return typeof image === 'string' ? image : image.url;
	};

	// Convert images for lightbox
	const lightboxImages = allImages.map((image, index) => ({
		url: getImageSrc(image),
		alt: `Image ${index + 1}`,
	}));

	// Handle opening lightbox
	const openLightbox = (index: number) => {
		setLightboxInitialIndex(index);
		setShowLightbox(true);
	};

	if (loading) {
		return <PageLoader message="Chargement du bien..." />;
	}

	if (error || !property) {
		return (
			<div className="min-h-screen flex items-center justify-center">
				<div className="text-center">
					<h1 className="text-2xl font-bold text-gray-900 mb-4">
						Bien non trouvé
					</h1>
					<p className="text-gray-600 mb-6">
						{error
							? error.message
							: "Ce bien n'existe pas ou a été supprimé."}
					</p>
					<Button onClick={() => router.push('/home')}>
						← Retour aux annonces
					</Button>
				</div>
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-gray-50">
			{/* Header */}
			<div className="bg-white shadow-sm border-b">
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
					<Button
						variant="outline"
						onClick={() => router.push('/home')}
						className="mb-4"
					>
						← Retour aux ventes
					</Button>
				</div>
			</div>

			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
				<div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
					{/* Images Section */}
					<div className="lg:col-span-2">
						<PropertyHero
							allImages={allImages}
							title={property.title}
							badges={property.badges}
							onImageClick={openLightbox}
						/>
						<PropertyDescription
							description={property.description}
						/>
						<PropertyFeatures property={property} />
					</div>

					{/* Property Info Sidebar */}
					<div className="lg:col-span-1">
						<div className="bg-white rounded-lg shadow-lg p-6 sticky top-6">
							{/* Price and Basic Info */}
							<div className="mb-6">
								<div className="flex items-baseline space-x-2 mb-2">
									<h1 className="text-3xl font-bold text-gray-900">
										{property.price.toLocaleString()} €
									</h1>
									<span className="text-gray-600">
										- {property.surface} m²
									</span>
								</div>
								<p className="text-lg text-gray-700">
									{property.title}
								</p>
								<p className="text-gray-600">
									{property.address}, {property.city}{' '}
									{property.postalCode}
								</p>
							</div>

							{/* Property Type and Transaction */}
							<div className="mb-6">
								<div className="flex space-x-2 mb-3">
									<span className="bg-brand-100 text-brand-800 text-sm px-3 py-1 rounded-full">
										{property.propertyType}
									</span>
									<span className="bg-green-100 text-green-800 text-sm px-3 py-1 rounded-full">
										{property.transactionType}
									</span>
								</div>
							</div>

							{/* Additional Details */}
							<div className="mb-6 space-y-3">
								{property.energyRating && (
									<div className="flex justify-between">
										<span className="text-gray-600">
											Classe énergétique:
										</span>
										<span className="font-medium">
											{property.energyRating}
										</span>
									</div>
								)}
								{property.yearBuilt && (
									<div className="flex justify-between">
										<span className="text-gray-600">
											Année de construction:
										</span>
										<span className="font-medium">
											{property.yearBuilt}
										</span>
									</div>
								)}
								{property.floor !== undefined && (
									<div className="flex justify-between">
										<span className="text-gray-600">
											Étage:
										</span>
										<span className="font-medium">
											{property.floor}
										</span>
									</div>
								)}
								{property.heatingType && (
									<div className="flex justify-between">
										<span className="text-gray-600">
											Chauffage:
										</span>
										<span className="font-medium">
											{property.heatingType}
										</span>
									</div>
								)}
								{property.orientation && (
									<div className="flex justify-between">
										<span className="text-gray-600">
											Orientation:
										</span>
										<span className="font-medium">
											{property.orientation}
										</span>
									</div>
								)}
								<div className="flex justify-between">
									<span className="text-gray-600">Vues:</span>
									<span className="font-medium">
										{property.viewCount}
									</span>
								</div>
								<div className="flex justify-between">
									<span className="text-gray-600">
										Publié le:
									</span>
									<span className="font-medium">
										{new Date(
											property.publishedAt ||
												property.createdAt,
										).toLocaleDateString('fr-FR')}
									</span>
								</div>
							</div>

							{/* Owner Information */}
							<div className="mb-6 p-4 bg-gray-50 rounded-lg">
								<h3 className="font-semibold text-gray-900 mb-3">
									{isPropertyOwner
										? 'Votre annonce'
										: 'Contact'}
								</h3>
								<div className="flex items-center space-x-3 mb-3">
									<ProfileAvatar
										user={property.owner}
										size="lg"
									/>
									<div>
										<p className="font-medium text-gray-900">
											{property.owner.firstName}{' '}
											{property.owner.lastName}
											{isPropertyOwner && (
												<span className="text-sm text-brand-600 ml-2">
													(Vous)
												</span>
											)}
										</p>
										<p className="text-sm text-gray-600">
											{property.owner.userType ===
											'apporteur'
												? "Apporteur d'affaires"
												: 'Agent immobilier'}
										</p>
									</div>
								</div>

								{/* Contact Buttons - Only show if not the property owner */}
								{isPropertyOwner ? (
									<div className="bg-brand-50 border border-brand-200 rounded-lg p-3">
										<div className="flex items-center space-x-2">
											<svg
												className="w-5 h-5 text-brand-600"
												fill="none"
												stroke="currentColor"
												viewBox="0 0 24 24"
											>
												<path
													strokeLinecap="round"
													strokeLinejoin="round"
													strokeWidth="2"
													d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
												/>
											</svg>
											<span className="text-sm font-medium text-brand-800">
												Votre propriété
											</span>
										</div>
										<p className="text-sm text-brand-700 mt-1">
											Vous êtes le propriétaire de cette
											annonce. Vous pouvez la modifier
											depuis votre tableau de bord.
										</p>
									</div>
								) : (
									<div className="space-y-2">
										<Button
											onClick={handleContactOwner}
											className="w-full bg-brand-600 hover:bg-brand-700"
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
													d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
												/>
											</svg>
											Contacter l&lsquo;agent
										</Button>
										{user && user.userType === 'agent' && (
											<>
												{hasBlockingCollab ? (
													<div className="w-full p-3 rounded-md border bg-blue-50 text-blue-800 text-sm flex items-center justify-center">
														<span className="mr-2">
															ℹ️
														</span>
														{`Propriété déjà en collaboration (${
															blockingStatus ===
															'pending'
																? 'en attente'
																: blockingStatus ===
																	  'accepted'
																	? 'acceptée'
																	: 'active'
														})`}
													</div>
												) : (
													<Button
														onClick={
															handleCollaborate
														}
														variant="outline"
														className="w-full"
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
																d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
															/>
														</svg>
														Proposer de collaborer
													</Button>
												)}
											</>
										)}
									</div>
								)}
							</div>

							{/* Share */}
							<div className="pt-4 border-t">
								<p className="text-sm text-gray-600 mb-2">
									Partager la fiche
								</p>
								<div className="flex space-x-2">
									<Button
										variant="outline"
										size="sm"
										onClick={() => {
											if (navigator.share) {
												navigator.share({
													title: property.title,
													text: `${property.title} - ${property.price.toLocaleString()}€`,
													url: window.location.href,
												});
											} else {
												navigator.clipboard.writeText(
													window.location.href,
												);
												toast.success(
													'Lien copié dans le presse-papiers',
												);
											}
										}}
									>
										<svg
											className="w-4 h-4 mr-1"
											fill="none"
											stroke="currentColor"
											viewBox="0 0 24 24"
										>
											<path
												strokeLinecap="round"
												strokeLinejoin="round"
												strokeWidth="2"
												d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z"
											/>
										</svg>
										Partager
									</Button>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>

			{/* Collaboration Modal */}
			{property && (
				<ProposeCollaborationModal
					isOpen={showCollaborationModal}
					onClose={() => setShowCollaborationModal(false)}
					post={{
						type: 'property',
						id: property._id,
						ownerUserType: property.owner.userType,
						data: {
							_id: property._id,
							title: property.title,
							price: property.price,
							city: property.city,
							postalCode: property.postalCode || '',
							propertyType: property.propertyType,
							surface: property.surface,
							rooms: property.rooms || 0,
							mainImage: property.mainImage,
						},
					}}
					onSuccess={() => {
						// Close modal and refresh collaboration info to reflect new blocking state
						setShowCollaborationModal(false);
						loadPropertyCollaborations();
					}}
				/>
			)}

			{/* Image Lightbox */}
			<ImageLightbox
				isOpen={showLightbox}
				images={lightboxImages}
				initialIndex={lightboxInitialIndex}
				onClose={() => setShowLightbox(false)}
			/>
		</div>
	);
}
