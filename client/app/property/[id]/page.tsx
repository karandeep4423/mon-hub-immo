'use client';
/* eslint-disable @next/next/no-img-element */

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { ImageLightbox } from '@/components/ui/ImageLightbox';
import { ProposeCollaborationModal } from '@/components/collaboration/ProposeCollaborationModal';
import { ProfileAvatar } from '@/components/ui';
import { useAuth } from '@/hooks/useAuth';
import { collaborationApi } from '@/lib/api/collaborationApi';
import { api } from '@/lib/api';
import type { Property } from '@/lib/api/propertyApi';
import { getImageUrl } from '@/lib/utils/imageUtils';
import { toast } from 'react-toastify';
import { getBadgeConfig } from '@/lib/constants/badges';

export default function PropertyDetailsPage() {
	const params = useParams();
	const router = useRouter();
	const { user } = useAuth();
	const propertyId = params?.id as string;

	const [property, setProperty] = useState<Property | null>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [currentImageIndex, setCurrentImageIndex] = useState(0);
	const [showCollaborationModal, setShowCollaborationModal] = useState(false);
	const [hasBlockingCollab, setHasBlockingCollab] = useState<boolean>(false);
	const [blockingStatus, setBlockingStatus] = useState<
		'pending' | 'accepted' | 'active' | null
	>(null);
	const [showLightbox, setShowLightbox] = useState(false);
	const [lightboxInitialIndex, setLightboxInitialIndex] = useState(0);

	const fetchProperty = useCallback(async () => {
		try {
			setLoading(true);
			const { data } = await api.get(`/property/${propertyId}`);
			setProperty(data.data);
		} catch (error) {
			console.error('Error fetching property:', error);
			setError(
				error instanceof Error
					? error.message
					: 'Erreur lors du chargement du bien',
			);
		} finally {
			setLoading(false);
		}
	}, [propertyId]);

	useEffect(() => {
		if (propertyId) {
			fetchProperty();
		}
	}, [propertyId, fetchProperty]);

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
			console.warn('Failed to load property collaborations', e);
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
		return (
			<div className="min-h-screen flex items-center justify-center">
				<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-600"></div>
			</div>
		);
	}

	if (error || !property) {
		return (
			<div className="min-h-screen flex items-center justify-center">
				<div className="text-center">
					<h1 className="text-2xl font-bold text-gray-900 mb-4">
						Bien non trouvé
					</h1>
					<p className="text-gray-600 mb-6">
						{error || "Ce bien n'existe pas ou a été supprimé."}
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
						<div className="bg-white rounded-lg shadow-lg overflow-hidden">
							{/* Main Image */}
							<div className="relative h-96 bg-gray-200">
								<img
									src={getImageSrc(
										allImages[currentImageIndex],
									)}
									alt={property.title}
									className="w-full h-full object-cover cursor-pointer"
									onClick={() =>
										openLightbox(currentImageIndex)
									}
									onError={(e) => {
										(e.target as HTMLImageElement).src =
											getImageUrl(undefined, 'medium');
									}}
								/>

								{/* Badges */}
								<div className="absolute top-4 left-4 flex flex-wrap gap-2 max-w-[70%]">
									{property.badges &&
										property.badges.length > 0 &&
										property.badges.map((badgeValue) => {
											const config =
												getBadgeConfig(badgeValue);
											if (!config) return null;

											return (
												<span
													key={badgeValue}
													className={`${config.bgColor} ${config.color} text-sm px-3 py-1 rounded-full`}
												>
													{config.label}
												</span>
											);
										})}
								</div>

								{/* Navigation arrows */}
								{allImages.length > 1 && (
									<>
										<button
											onClick={() =>
												setCurrentImageIndex((prev) =>
													prev === 0
														? allImages.length - 1
														: prev - 1,
												)
											}
											className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-75"
										>
											<svg
												className="w-6 h-6"
												fill="none"
												stroke="currentColor"
												viewBox="0 0 24 24"
											>
												<path
													strokeLinecap="round"
													strokeLinejoin="round"
													strokeWidth="2"
													d="M15 19l-7-7 7-7"
												/>
											</svg>
										</button>
										<button
											onClick={() =>
												setCurrentImageIndex((prev) =>
													prev ===
													allImages.length - 1
														? 0
														: prev + 1,
												)
											}
											className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-75"
										>
											<svg
												className="w-6 h-6"
												fill="none"
												stroke="currentColor"
												viewBox="0 0 24 24"
											>
												<path
													strokeLinecap="round"
													strokeLinejoin="round"
													strokeWidth="2"
													d="M9 5l7 7-7 7"
												/>
											</svg>
										</button>
									</>
								)}
							</div>

							{/* Thumbnail Images */}
							{allImages.length > 1 && (
								<div className="p-4">
									<div className="flex space-x-2 overflow-x-auto">
										{allImages.map((image, index) => (
											<button
												key={index}
												onClick={() => {
													setCurrentImageIndex(index);
													// Optional: uncomment to open lightbox on thumbnail click
													// openLightbox(index);
												}}
												onDoubleClick={() =>
													openLightbox(index)
												}
												className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 ${
													currentImageIndex === index
														? 'border-brand-600'
														: 'border-gray-200'
												} hover:border-brand-400 transition-colors`}
											>
												<img
													src={getImageSrc(image)}
													alt={`Image ${index + 1}`}
													className="w-full h-full object-cover"
												/>
											</button>
										))}
									</div>
								</div>
							)}
						</div>

						{/* Property Description */}
						<div className="mt-6 bg-white rounded-lg shadow-lg p-6">
							<h2 className="text-xl font-semibold text-gray-900 mb-4">
								Description
							</h2>
							<p className="text-gray-700 leading-relaxed whitespace-pre-line">
								{property.description}
							</p>
						</div>

						{/* Property Features */}
						<div className="mt-6 bg-white rounded-lg shadow-lg p-6">
							<h2 className="text-xl font-semibold text-gray-900 mb-6">
								Caractéristiques
							</h2>
							<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
								{/* Basic Property Info */}
								{property.rooms && (
									<div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
										<div className="bg-blue-100 p-2 rounded-full">
											<svg
												className="w-5 h-5 text-blue-600"
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
										<span className="text-gray-700 font-medium">
											{property.rooms} pièces
										</span>
									</div>
								)}

								{property.bedrooms && (
									<div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
										<div className="bg-purple-100 p-2 rounded-full">
											<svg
												className="w-5 h-5 text-purple-600"
												fill="none"
												stroke="currentColor"
												viewBox="0 0 24 24"
											>
												<path
													strokeLinecap="round"
													strokeLinejoin="round"
													strokeWidth="2"
													d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9"
												/>
											</svg>
										</div>
										<span className="text-gray-700 font-medium">
											{property.bedrooms} chambres
										</span>
									</div>
								)}

								{property.bathrooms && (
									<div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
										<div className="bg-teal-100 p-2 rounded-full">
											<svg
												className="w-5 h-5 text-teal-600"
												fill="none"
												stroke="currentColor"
												viewBox="0 0 24 24"
											>
												<path
													strokeLinecap="round"
													strokeLinejoin="round"
													strokeWidth="2"
													d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z"
												/>
											</svg>
										</div>
										<span className="text-gray-700 font-medium">
											{property.bathrooms} salle
											{property.bathrooms > 1
												? 's'
												: ''}{' '}
											de bain
										</span>
									</div>
								)}

								{/* Surface Information */}
								{property.surface && (
									<div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
										<div className="bg-green-100 p-2 rounded-full">
											<svg
												className="w-5 h-5 text-green-600"
												fill="none"
												stroke="currentColor"
												viewBox="0 0 24 24"
											>
												<path
													strokeLinecap="round"
													strokeLinejoin="round"
													strokeWidth="2"
													d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4"
												/>
											</svg>
										</div>
										<span className="text-gray-700 font-medium">
											{property.surface} m² habitable
										</span>
									</div>
								)}

								{property.landArea && (
									<div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
										<div className="bg-yellow-100 p-2 rounded-full">
											<svg
												className="w-5 h-5 text-yellow-600"
												fill="none"
												stroke="currentColor"
												viewBox="0 0 24 24"
											>
												<path
													strokeLinecap="round"
													strokeLinejoin="round"
													strokeWidth="2"
													d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
												/>
											</svg>
										</div>
										<span className="text-gray-700 font-medium">
											{property.landArea} m² terrain
										</span>
									</div>
								)}

								{/* Building Information */}
								{property.floor !== undefined && (
									<div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
										<div className="bg-indigo-100 p-2 rounded-full">
											<svg
												className="w-5 h-5 text-indigo-600"
												fill="none"
												stroke="currentColor"
												viewBox="0 0 24 24"
											>
												<path
													strokeLinecap="round"
													strokeLinejoin="round"
													strokeWidth="2"
													d="M19 14l-7 7m0 0l-7-7m7 7V3"
												/>
											</svg>
										</div>
										<span className="text-gray-700 font-medium">
											Étage {property.floor}
											{property.totalFloors
												? `/${property.totalFloors}`
												: ''}
										</span>
									</div>
								)}

								{property.levels && (
									<div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
										<div className="bg-orange-100 p-2 rounded-full">
											<svg
												className="w-5 h-5 text-orange-600"
												fill="none"
												stroke="currentColor"
												viewBox="0 0 24 24"
											>
												<path
													strokeLinecap="round"
													strokeLinejoin="round"
													strokeWidth="2"
													d="M8 7l4-4m0 0l4 4m-4-4v18"
												/>
											</svg>
										</div>
										<span className="text-gray-700 font-medium">
											{property.levels} niveaux
										</span>
									</div>
								)}

								{property.parkingSpaces && (
									<div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
										<div className="bg-blue-100 p-2 rounded-full">
											<svg
												className="w-5 h-5 text-blue-600"
												fill="none"
												stroke="currentColor"
												viewBox="0 0 24 24"
											>
												<path
													strokeLinecap="round"
													strokeLinejoin="round"
													strokeWidth="2"
													d="M8 7h12l-1 9H9l-1-9zM8 7L6 3H3m9 18v-6a2 2 0 012-2h2a2 2 0 012 2v6"
												/>
											</svg>
										</div>
										<span className="text-gray-700 font-medium">
											{property.parkingSpaces} places
											parking
										</span>
									</div>
								)}

								{/* Property Condition & Type */}
								{property.condition && (
									<div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
										<div className="bg-pink-100 p-2 rounded-full">
											<svg
												className="w-5 h-5 text-pink-600"
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
										</div>
										<span className="text-gray-700 font-medium">
											État:{' '}
											{property.condition === 'new'
												? 'Neuf'
												: property.condition === 'good'
													? 'Bon état'
													: property.condition ===
														  'refresh'
														? 'À rafraîchir'
														: property.condition ===
															  'renovate'
															? 'À rénover'
															: property.condition}
										</span>
									</div>
								)}

								{property.saleType && (
									<div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
										<div className="bg-red-100 p-2 rounded-full">
											<svg
												className="w-5 h-5 text-red-600"
												fill="none"
												stroke="currentColor"
												viewBox="0 0 24 24"
											>
												<path
													strokeLinecap="round"
													strokeLinejoin="round"
													strokeWidth="2"
													d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
												/>
											</svg>
										</div>
										<span className="text-gray-700 font-medium">
											{property.saleType ===
											'vente_classique'
												? 'Vente classique'
												: property.saleType ===
													  'vente_viager'
													? 'Vente en viager'
													: property.saleType ===
														  'vente_lot'
														? 'Vente en lot / Ensemble immobilier'
														: property.saleType ===
															  'vente_vefa'
															? 'Vente en VEFA'
															: property.saleType ===
																  'vente_location'
																? 'Vente en cours de location'
																: property.saleType ===
																	  'vente_usufruit'
																	? 'Vente en usufruit / Nu-propriété'
																	: property.saleType ===
																		  'vente_indivisions'
																		? 'Vente en indivisions'
																		: property.saleType ===
																			  'constructible'
																			? 'Constructible'
																			: property.saleType ===
																				  'terrain_loisirs'
																				? 'Terrain de loisirs'
																				: property.saleType ===
																					  'jardin'
																					? 'Jardin'
																					: property.saleType ===
																						  'champs_agricole'
																						? 'Champs agricole'
																						: property.saleType ===
																							  'ancien'
																							? 'Ancien'
																							: property.saleType ===
																								  'viager'
																								? 'Viager'
																								: property.saleType}
										</span>
									</div>
								)}

								{/* Energy Rating */}
								{property.energyRating && (
									<div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
										<div className="bg-green-100 p-2 rounded-full">
											<svg
												className="w-5 h-5 text-green-600"
												fill="none"
												stroke="currentColor"
												viewBox="0 0 24 24"
											>
												<path
													strokeLinecap="round"
													strokeLinejoin="round"
													strokeWidth="2"
													d="M13 10V3L4 14h7v7l9-11h-7z"
												/>
											</svg>
										</div>
										<span className="text-gray-700 font-medium">
											DPE: {property.energyRating}
										</span>
									</div>
								)}

								{property.gasEmissionClass && (
									<div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
										<div className="bg-gray-100 p-2 rounded-full">
											<svg
												className="w-5 h-5 text-gray-600"
												fill="none"
												stroke="currentColor"
												viewBox="0 0 24 24"
											>
												<path
													strokeLinecap="round"
													strokeLinejoin="round"
													strokeWidth="2"
													d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
												/>
											</svg>
										</div>
										<span className="text-gray-700 font-medium">
											GES: {property.gasEmissionClass}
										</span>
									</div>
								)}

								{/* Financial Info */}
								{property.annualCondoFees && (
									<div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
										<div className="bg-yellow-100 p-2 rounded-full">
											<svg
												className="w-5 h-5 text-yellow-600"
												fill="none"
												stroke="currentColor"
												viewBox="0 0 24 24"
											>
												<path
													strokeLinecap="round"
													strokeLinejoin="round"
													strokeWidth="2"
													d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"
												/>
											</svg>
										</div>
										<span className="text-gray-700 font-medium">
											{property.annualCondoFees}€/an
											charges
										</span>
									</div>
								)}

								{/* Availability */}
								{property.availableFrom && (
									<div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
										<div className="bg-blue-100 p-2 rounded-full">
											<svg
												className="w-5 h-5 text-blue-600"
												fill="none"
												stroke="currentColor"
												viewBox="0 0 24 24"
											>
												<path
													strokeLinecap="round"
													strokeLinejoin="round"
													strokeWidth="2"
													d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
												/>
											</svg>
										</div>
										<span className="text-gray-700 font-medium">
											Disponible:{' '}
											{(() => {
												// Handle different date formats
												const dateValue =
													property.availableFrom;

												// If it's already in MM/YYYY format, use it directly
												if (
													typeof dateValue ===
														'string' &&
													/^\d{2}\/\d{4}$/.test(
														dateValue,
													)
												) {
													return dateValue;
												}

												// If it's a date object or ISO string, format it
												try {
													const date = new Date(
														dateValue,
													);
													if (
														!isNaN(date.getTime())
													) {
														const month = (
															date.getMonth() + 1
														)
															.toString()
															.padStart(2, '0');
														const year =
															date.getFullYear();
														return `${month}/${year}`;
													}
												} catch {
													// If parsing fails, return the original value
													return dateValue;
												}

												return dateValue;
											})()}
										</span>
									</div>
								)}

								{/* Amenities */}
								{property.hasParking && (
									<div className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg">
										<div className="bg-green-100 p-2 rounded-full">
											<svg
												className="w-5 h-5 text-green-600"
												fill="none"
												stroke="currentColor"
												viewBox="0 0 24 24"
											>
												<path
													strokeLinecap="round"
													strokeLinejoin="round"
													strokeWidth="2"
													d="M5 13l4 4L19 7"
												/>
											</svg>
										</div>
										<span className="text-gray-700 font-medium">
											Parking
										</span>
									</div>
								)}

								{property.hasGarden && (
									<div className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg">
										<div className="bg-green-100 p-2 rounded-full">
											<svg
												className="w-5 h-5 text-green-600"
												fill="none"
												stroke="currentColor"
												viewBox="0 0 24 24"
											>
												<path
													strokeLinecap="round"
													strokeLinejoin="round"
													strokeWidth="2"
													d="M5 13l4 4L19 7"
												/>
											</svg>
										</div>
										<span className="text-gray-700 font-medium">
											Jardin
										</span>
									</div>
								)}

								{property.hasElevator && (
									<div className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg">
										<div className="bg-green-100 p-2 rounded-full">
											<svg
												className="w-5 h-5 text-green-600"
												fill="none"
												stroke="currentColor"
												viewBox="0 0 24 24"
											>
												<path
													strokeLinecap="round"
													strokeLinejoin="round"
													strokeWidth="2"
													d="M5 13l4 4L19 7"
												/>
											</svg>
										</div>
										<span className="text-gray-700 font-medium">
											Ascenseur
										</span>
									</div>
								)}

								{property.hasBalcony && (
									<div className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg">
										<div className="bg-green-100 p-2 rounded-full">
											<svg
												className="w-5 h-5 text-green-600"
												fill="none"
												stroke="currentColor"
												viewBox="0 0 24 24"
											>
												<path
													strokeLinecap="round"
													strokeLinejoin="round"
													strokeWidth="2"
													d="M5 13l4 4L19 7"
												/>
											</svg>
										</div>
										<span className="text-gray-700 font-medium">
											Balcon
										</span>
									</div>
								)}

								{property.hasTerrace && (
									<div className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg">
										<div className="bg-green-100 p-2 rounded-full">
											<svg
												className="w-5 h-5 text-green-600"
												fill="none"
												stroke="currentColor"
												viewBox="0 0 24 24"
											>
												<path
													strokeLinecap="round"
													strokeLinejoin="round"
													strokeWidth="2"
													d="M5 13l4 4L19 7"
												/>
											</svg>
										</div>
										<span className="text-gray-700 font-medium">
											Terrasse
										</span>
									</div>
								)}

								{property.hasGarage && (
									<div className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg">
										<div className="bg-green-100 p-2 rounded-full">
											<svg
												className="w-5 h-5 text-green-600"
												fill="none"
												stroke="currentColor"
												viewBox="0 0 24 24"
											>
												<path
													strokeLinecap="round"
													strokeLinejoin="round"
													strokeWidth="2"
													d="M5 13l4 4L19 7"
												/>
											</svg>
										</div>
										<span className="text-gray-700 font-medium">
											Garage
										</span>
									</div>
								)}

								{/* Exterior Features */}
								{property.exterior &&
									property.exterior.length > 0 && (
										<div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
											<div className="bg-teal-100 p-2 rounded-full">
												<svg
													className="w-5 h-5 text-teal-600"
													fill="none"
													stroke="currentColor"
													viewBox="0 0 24 24"
												>
													<path
														strokeLinecap="round"
														strokeLinejoin="round"
														strokeWidth="2"
														d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
													/>
												</svg>
											</div>
											<span className="text-gray-700 font-medium">
												Extérieur:{' '}
												{property.exterior
													.map((ext) => {
														const exteriorLabels = {
															garden: 'Jardin',
															balcony: 'Balcon',
															terrace: 'Terrasse',
															courtyard: 'Cour',
															none: 'Aucun',
														};
														return (
															exteriorLabels[
																ext as keyof typeof exteriorLabels
															] || ext
														);
													})
													.join(', ')}
											</span>
										</div>
									)}

								{/* Property Nature */}
								{property.propertyNature && (
									<div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
										<div className="bg-indigo-100 p-2 rounded-full">
											<svg
												className="w-5 h-5 text-indigo-600"
												fill="none"
												stroke="currentColor"
												viewBox="0 0 24 24"
											>
												<path
													strokeLinecap="round"
													strokeLinejoin="round"
													strokeWidth="2"
													d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5"
												/>
											</svg>
										</div>
										<span className="text-gray-700 font-medium">
											{property.propertyNature}
										</span>
									</div>
								)}
							</div>
						</div>
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
