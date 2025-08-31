'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/hooks/useAuth';

interface Property {
	_id: string;
	title: string;
	description: string;
	price: number;
	surface: number;
	propertyType: string;
	transactionType: string;
	address: string;
	city: string;
	postalCode: string;
	sector: string;
	mainImage: string;
	images: string[];
	rooms?: number;
	bedrooms?: number;
	bathrooms?: number;
	floor?: number;
	totalFloors?: number;
	hasParking: boolean;
	hasGarden: boolean;
	hasElevator: boolean;
	hasBalcony: boolean;
	hasTerrace: boolean;
	hasGarage: boolean;
	energyRating?: string;
	yearBuilt?: number;
	heatingType?: string;
	orientation?: string;
	status: string;
	isNew?: boolean;
	isExclusive?: boolean;
	owner: {
		_id: string;
		firstName: string;
		lastName: string;
		email: string;
		phone?: string;
		profileImage?: string;
		userType: string;
	};
	viewCount: number;
	createdAt: string;
	publishedAt?: string;
}

export default function PropertyDetailsPage() {
	const params = useParams();
	const router = useRouter();
	const { user } = useAuth();
	const propertyId = params?.id as string;

	const [property, setProperty] = useState<Property | null>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [currentImageIndex, setCurrentImageIndex] = useState(0);

	useEffect(() => {
		if (propertyId) {
			fetchProperty();
		}
	}, [propertyId]);

	const fetchProperty = async () => {
		try {
			setLoading(true);
			const response = await fetch(
				`http://localhost:4000/api/property/${propertyId}`,
			);

			if (!response.ok) {
				throw new Error('Bien non trouvé');
			}

			const data = await response.json();
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
	};

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

		if (property) {
			// Navigate to chat with collaboration request
			router.push(
				`/chat?userId=${property.owner._id}&propertyId=${property._id}&type=collaboration`,
			);
		}
	};

	const allImages = property ? [property.mainImage, ...property.images] : [];

	if (loading) {
		return (
			<div className="min-h-screen flex items-center justify-center">
				<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
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
									src={allImages[currentImageIndex]}
									alt={property.title}
									className="w-full h-full object-cover"
									onError={(e) => {
										(e.target as HTMLImageElement).src =
											'/placeholder-property.jpg';
									}}
								/>

								{/* Badges */}
								<div className="absolute top-4 left-4 flex flex-col space-y-2">
									{property.isNew && (
										<span className="bg-green-500 text-white text-sm px-3 py-1 rounded-full">
											Nouveau
										</span>
									)}
									{property.isExclusive && (
										<span className="bg-yellow-500 text-white text-sm px-3 py-1 rounded-full">
											Exclusivité
										</span>
									)}
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
												onClick={() =>
													setCurrentImageIndex(index)
												}
												className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 ${
													currentImageIndex === index
														? 'border-blue-500'
														: 'border-gray-200'
												}`}
											>
												<img
													src={image}
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
							<h2 className="text-xl font-semibold text-gray-900 mb-4">
								Caractéristiques
							</h2>
							<div className="grid grid-cols-2 md:grid-cols-3 gap-4">
								{property.rooms && (
									<div className="flex items-center space-x-2">
										<svg
											className="w-5 h-5 text-gray-400"
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
										<span className="text-gray-700">
											{property.rooms} pièces
										</span>
									</div>
								)}
								{property.bedrooms && (
									<div className="flex items-center space-x-2">
										<svg
											className="w-5 h-5 text-gray-400"
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
										<span className="text-gray-700">
											{property.bedrooms} chambres
										</span>
									</div>
								)}
								{property.bathrooms && (
									<div className="flex items-center space-x-2">
										<svg
											className="w-5 h-5 text-gray-400"
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
										<span className="text-gray-700">
											{property.bathrooms} salle
											{property.bathrooms > 1
												? 's'
												: ''}{' '}
											de bain
										</span>
									</div>
								)}
								{property.hasParking && (
									<div className="flex items-center space-x-2">
										<svg
											className="w-5 h-5 text-green-500"
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
										<span className="text-gray-700">
											Parking
										</span>
									</div>
								)}
								{property.hasGarden && (
									<div className="flex items-center space-x-2">
										<svg
											className="w-5 h-5 text-green-500"
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
										<span className="text-gray-700">
											Jardin
										</span>
									</div>
								)}
								{property.hasElevator && (
									<div className="flex items-center space-x-2">
										<svg
											className="w-5 h-5 text-green-500"
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
										<span className="text-gray-700">
											Ascenseur
										</span>
									</div>
								)}
								{property.hasBalcony && (
									<div className="flex items-center space-x-2">
										<svg
											className="w-5 h-5 text-green-500"
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
										<span className="text-gray-700">
											Balcon
										</span>
									</div>
								)}
								{property.hasTerrace && (
									<div className="flex items-center space-x-2">
										<svg
											className="w-5 h-5 text-green-500"
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
										<span className="text-gray-700">
											Terrasse
										</span>
									</div>
								)}
								{property.hasGarage && (
									<div className="flex items-center space-x-2">
										<svg
											className="w-5 h-5 text-green-500"
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
										<span className="text-gray-700">
											Garage
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
									<span className="bg-blue-100 text-blue-800 text-sm px-3 py-1 rounded-full">
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
									{user &&
									(user._id === property.owner._id ||
										user.id === property.owner._id)
										? 'Votre annonce'
										: 'Contact'}
								</h3>
								<div className="flex items-center space-x-3 mb-3">
									<div className="w-12 h-12 bg-gray-300 rounded-full overflow-hidden">
										<img
											src={
												property.owner.profileImage ||
												`https://ui-avatars.com/api/?name=${encodeURIComponent(property.owner.firstName + ' ' + property.owner.lastName)}&background=3b82f6&color=ffffff`
											}
											alt={`${property.owner.firstName} ${property.owner.lastName}`}
											className="w-full h-full object-cover"
										/>
									</div>
									<div>
										<p className="font-medium text-gray-900">
											{property.owner.firstName}{' '}
											{property.owner.lastName}
											{user &&
												(user._id ===
													property.owner._id ||
													user.id ===
														property.owner._id) && (
													<span className="text-sm text-blue-600 ml-2">
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
								{user &&
								(user._id === property.owner._id ||
									user.id === property.owner._id) ? (
									<div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
										<div className="flex items-center space-x-2">
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
													d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
												/>
											</svg>
											<span className="text-sm font-medium text-blue-800">
												Votre propriété
											</span>
										</div>
										<p className="text-sm text-blue-700 mt-1">
											Vous êtes le propriétaire de cette
											annonce. Vous pouvez la modifier
											depuis votre tableau de bord.
										</p>
									</div>
								) : (
									<div className="space-y-2">
										<Button
											onClick={handleContactOwner}
											className="w-full bg-blue-600 hover:bg-blue-700"
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
										{user &&
											user.userType === 'agent' &&
											property.owner.userType ===
												'apporteur' && (
												<Button
													onClick={handleCollaborate}
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
												alert(
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
		</div>
	);
}
