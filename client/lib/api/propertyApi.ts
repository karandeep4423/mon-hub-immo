// client/lib/propertyService.ts
import { api } from '../api';
import { handleApiError } from '../utils/errorHandler';

/**
 * Sanitize clientInfo to remove empty strings from enum fields
 * Backend validation requires valid enum values or undefined, not empty strings
 */
const sanitizeClientInfo = (
	clientInfo: Property['clientInfo'],
): Property['clientInfo'] => {
	if (!clientInfo) return clientInfo;

	const sanitized = { ...clientInfo };

	// Clean commercialDetails
	if (sanitized.commercialDetails) {
		const commercial = { ...sanitized.commercialDetails };
		if (
			!commercial.occupancyStatus ||
			commercial.occupancyStatus === ('' as unknown)
		) {
			delete commercial.occupancyStatus;
		}
		sanitized.commercialDetails = commercial;
	}

	// Clean ownerInfo
	if (sanitized.ownerInfo) {
		const owner = { ...sanitized.ownerInfo };
		if (!owner.mandateType || owner.mandateType === ('' as unknown)) {
			delete owner.mandateType;
		}
		sanitized.ownerInfo = owner;
	}

	return sanitized;
};

/**
 * Property interface representing a real estate listing
 *
 * @interface Property
 * @property {string} _id - Unique identifier for the property
 * @property {string} title - Property title/headline
 * @property {string} description - Detailed property description
 * @property {number} price - Property price (sale or rent)
 * @property {number} surface - Total surface area in m²
 * @property {string} propertyType - Type of property (Appartement, Maison, etc.)
 * @property {string} transactionType - Transaction type (Vente or Location)
 * @property {string} [address] - Street address
 * @property {string} city - City name
 * @property {string} [postalCode] - Postal/ZIP code
 * @property {string} sector - Property sector/neighborhood
 */
export interface Property {
	_id: string;
	title: string;
	description: string;
	price: number;
	surface: number;
	propertyType:
		| 'Appartement'
		| 'Maison'
		| 'Terrain'
		| 'Local commercial'
		| 'Bureaux';
	transactionType: 'Vente' | 'Location';
	address?: string;
	city: string;
	postalCode?: string;
	sector: string;
	rooms?: number;
	bedrooms?: number;
	bathrooms?: number;
	floor?: number;
	totalFloors?: number;
	hasParking?: boolean;
	hasGarden?: boolean;
	hasElevator?: boolean;
	hasBalcony?: boolean;
	hasTerrace?: boolean;
	hasGarage?: boolean;
	hasCellar?: boolean;
	hasSwimmingPool?: boolean;
	hasAirConditioning?: boolean;
	energyRating?:
		| 'A'
		| 'B'
		| 'C'
		| 'D'
		| 'E'
		| 'F'
		| 'G'
		| 'Non soumis au DPE';
	gasEmissionClass?:
		| 'A'
		| 'B'
		| 'C'
		| 'D'
		| 'E'
		| 'F'
		| 'G'
		| 'Non soumis au DPE';

	// Property condition and characteristics
	condition?: 'new' | 'good' | 'refresh' | 'renovate';
	propertyNature?: string;
	saleType?: string; // Dynamic based on property type

	// Financial info
	annualCondoFees?: number;
	tariffLink?: string;
	agencyFeesPercentage?: number; // % frais d'agence
	agencyFeesAmount?: number; // Montant des frais d'agence calculé
	priceIncludingFees?: number; // Prix FAI (Frais d'Acquéreur Inclus)

	// Additional property details
	landArea?: number; // Surface totale du terrain in m²
	levels?: number; // Nombre de niveaux
	parkingSpaces?: number; // Places de parking
	exterior?: ('garden' | 'balcony' | 'terrace' | 'courtyard' | 'none')[];
	availableFromDate?: string; // Date string MM/AAAA format

	yearBuilt?: number;
	heatingType?:
		| 'Gaz'
		| 'Électrique'
		| 'Fioul'
		| 'Pompe à chaleur'
		| 'Solaire'
		| 'Bois';
	orientation?:
		| 'Nord'
		| 'Sud'
		| 'Est'
		| 'Ouest'
		| 'Nord-Est'
		| 'Nord-Ouest'
		| 'Sud-Est'
		| 'Sud-Ouest';
	mainImage:
		| {
				url: string;
				key: string;
		  }
		| string; // Support legacy format
	galleryImages?: Array<{
		url: string;
		key: string;
	}>;
	images?: string[];
	badges?: string[];
	isFeatured?: boolean;
	status: 'draft' | 'active' | 'sold' | 'rented' | 'archived';
	viewCount?: number;
	publishedAt?: string;
	createdAt: string;
	updatedAt: string;
	owner: {
		_id: string;
		firstName: string;
		lastName: string;
		profileImage?: string;
		userType: 'agent' | 'apporteur';
	};
	// Client Information (visible only in collaboration)
	clientInfo?: {
		commercialDetails?: {
			strengths?: string;
			weaknesses?: string;
			occupancyStatus?: 'occupied' | 'vacant';
			openToLowerOffers?: boolean;
		};
		propertyHistory?: {
			listingDate?: string;
			lastVisitDate?: string;
			totalVisits?: number;
			visitorFeedback?: string;
			priceReductions?: string;
		};
		ownerInfo?: {
			urgentToSell?: boolean;
			openToNegotiation?: boolean;
			mandateType?: 'exclusive' | 'simple' | 'shared';
			saleReasons?: string;
			presentDuringVisits?: boolean;
			flexibleSchedule?: boolean;
			acceptConditionalOffers?: boolean;
		};
	};
	// Virtual properties
	isNewProperty?: boolean;
	isNew?: boolean; // Alias for isNewProperty for backward compatibility
	formattedPrice?: string;
	displaySurface?: string;
}

export interface PropertyFormData {
	title: string;
	description: string;
	price: number;
	surface: number;
	propertyType: Property['propertyType'];
	transactionType: Property['transactionType'];
	address?: string;
	city: string;
	postalCode?: string;
	sector: string;
	rooms?: number;
	bedrooms?: number;
	bathrooms?: number;
	floor?: number;
	totalFloors?: number;
	hasParking?: boolean;
	hasGarden?: boolean;
	hasElevator?: boolean;
	hasBalcony?: boolean;
	hasGarage?: boolean;
	hasCellar?: boolean;
	hasSwimmingPool?: boolean;
	hasAirConditioning?: boolean;
	energyRating?: Property['energyRating'];
	gasEmissionClass?: Property['gasEmissionClass'];
	condition?: Property['condition'];
	propertyNature?: Property['propertyNature'];
	saleType?: Property['saleType'];
	annualCondoFees?: Property['annualCondoFees'];
	tariffLink?: Property['tariffLink'];
	agencyFeesPercentage?: Property['agencyFeesPercentage'];
	agencyFeesAmount?: Property['agencyFeesAmount'];
	priceIncludingFees?: Property['priceIncludingFees'];
	landArea?: Property['landArea'];
	levels?: Property['levels'];
	parkingSpaces?: Property['parkingSpaces'];
	exterior?: Property['exterior'];
	availableFromDate?: string; // Date string MM/AAAA format
	yearBuilt?: number;
	heatingType?: Property['heatingType'];
	orientation?: Property['orientation'];
	mainImage:
		| {
				url: string;
				key: string;
		  }
		| string
		| null;
	galleryImages?: Array<{
		url: string;
		key: string;
	}>;
	images?: string[];
	badges?: string[];
	isFeatured?: boolean;
	status: Property['status'];
	// Client Information
	clientInfo?: Property['clientInfo'];
}

/**
 * Property filters for search and filtering operations
 *
 * @interface PropertyFilters
 * @property {string} [search] - Text search query
 * @property {string} [propertyType] - Filter by property type
 * @property {string} [sector] - Filter by sector/neighborhood
 * @property {string} [city] - Filter by city
 * @property {string} [postalCode] - Filter by postal code
 * @property {number} [minPrice] - Minimum price filter
 * @property {number} [maxPrice] - Maximum price filter
 * @property {number} [minSurface] - Minimum surface area in m²
 * @property {number} [maxSurface] - Maximum surface area in m²
 * @property {string} [transactionType] - Filter by transaction type
 * @property {number} [limit] - Number of results per page
 * @property {number} [page] - Page number for pagination
 */
export interface PropertyFilters {
	search?: string;
	propertyType?: string;
	sector?: string;
	city?: string;
	postalCode?: string;
	minPrice?: number;
	maxPrice?: number;
	minSurface?: number;
	maxSurface?: number;
	transactionType?: string;
	limit?: number;
	page?: number;
}

export interface PropertyResponse {
	success: boolean;
	data: Property;
	message?: string;
}

export interface PropertiesResponse {
	success: boolean;
	data: {
		properties: Property[];
		total: number;
		page: number;
		limit: number;
	};
	message?: string;
}

export interface MyPropertiesResponse {
	success: boolean;
	data: {
		properties: Property[];
		pagination?: {
			currentPage: number;
			totalPages: number;
			totalItems: number;
			itemsPerPage: number;
		};
	};
	message?: string;
}

export interface MyPropertyStatsResponse {
	success: boolean;
	data: {
		totalProperties: number;
		totalViews: number;
		totalValue: number;
		byStatus: Array<{
			_id: Property['status'];
			count: number;
			totalViews: number;
			avgPrice: number;
		}>;
	};
}

/**
 * Property Service - Centralized API operations for properties
 *
 * @class PropertyService
 * @description Provides methods for managing real estate property listings
 * @example
 * ```typescript
 * // Get all properties
 * const properties = await PropertyService.getAllProperties();
 *
 * // Get properties with filters
 * const filtered = await PropertyService.getAllProperties({
 *   city: 'Paris',
 *   minPrice: 200000,
 *   transactionType: 'Vente'
 * });
 * ```
 */
export class PropertyService {
	/**
	 * Get all properties with optional filters
	 *
	 * @static
	 * @async
	 * @param {PropertyFilters} [filters] - Optional filters to apply
	 * @returns {Promise<Property[]>} Array of properties matching the filters
	 * @throws {Error} If the API request fails
	 *
	 * @example
	 * ```typescript
	 * const properties = await PropertyService.getAllProperties({
	 *   city: 'Lyon',
	 *   propertyType: 'Appartement',
	 *   minSurface: 50
	 * });
	 * ```
	 */
	static async getAllProperties(
		filters?: PropertyFilters,
	): Promise<Property[]> {
		try {
			const params = new URLSearchParams();

			if (filters) {
				Object.entries(filters).forEach(([key, value]) => {
					if (value !== undefined && value !== null && value !== '') {
						params.append(key, value.toString());
					}
				});
			}

			const response = await api.get<PropertiesResponse>(
				`/property?${params.toString()}`,
			);
			return response.data.data.properties;
		} catch (error) {
			throw handleApiError(
				error,
				'PropertyService.getAllProperties',
				'Erreur lors de la récupération des biens',
			);
		}
	}

	/**
	 * Get a single property by ID
	 *
	 * @static
	 * @async
	 * @param {string} id - The unique identifier of the property
	 * @returns {Promise<Property>} The property data
	 * @throws {Error} If the property is not found or the API request fails
	 *
	 * @example
	 * ```typescript
	 * const property = await PropertyService.getPropertyById('60f7b3b3e4b0e4a4f8c4b3a1');
	 * console.log(property.title, property.price);
	 * ```
	 */
	static async getPropertyById(id: string): Promise<Property> {
		try {
			const response = await api.get<PropertyResponse>(`/property/${id}`);
			return response.data.data;
		} catch (error) {
			throw handleApiError(
				error,
				'PropertyService.getPropertyById',
				'Erreur lors de la récupération du bien',
			);
		}
	}

	/**
	 * Get current user's properties with optional pagination
	 *
	 * @static
	 * @async
	 * @param {number} [page=1] - Page number for pagination
	 * @param {number} [limit=10] - Items per page
	 * @param {string} [status] - Filter by status (active, sold, rented, draft, archived)
	 * @returns {Promise<MyPropertiesResponse['data']>} User's properties data with pagination info
	 * @throws {Error} If the API request fails
	 *
	 * @example
	 * ```typescript
	 * const { properties, pagination } = await PropertyService.getMyProperties(2, 10);
	 * console.log(`Showing page ${pagination?.currentPage} of ${pagination?.totalPages}`);
	 * ```
	 */
	static async getMyProperties(
		page: number = 1,
		limit: number = 10,
		status?: string,
	): Promise<MyPropertiesResponse['data']> {
		try {
			const params = new URLSearchParams();
			params.append('page', String(page));
			params.append('limit', String(limit));
			if (status) params.append('status', status);

			const response = await api.get<MyPropertiesResponse>(
				`/property/my/properties?${params.toString()}`,
			);
			return response.data.data;
		} catch (error) {
			throw handleApiError(
				error,
				'PropertyService.getMyProperties',
				'Erreur lors de la récupération de vos biens',
			);
		}
	}

	/**
	 * Get aggregated stats for current user's properties
	 *
	 * @static
	 * @async
	 * @returns {Promise<MyPropertyStatsResponse['data']>} Aggregated statistics including total properties, views, value, and breakdown by status
	 * @throws {Error} If the API request fails
	 *
	 * @example
	 * ```typescript
	 * const stats = await PropertyService.getMyPropertyStats();
	 * console.log(`Total properties: ${stats.totalProperties}`);
	 * console.log(`Total views: ${stats.totalViews}`);
	 * ```
	 */
	static async getMyPropertyStats(): Promise<
		MyPropertyStatsResponse['data']
	> {
		try {
			const response =
				await api.get<MyPropertyStatsResponse>('/property/my/stats');
			return response.data.data;
		} catch (error) {
			throw handleApiError(
				error,
				'PropertyService.getMyPropertyStats',
				'Erreur lors de la récupération des statistiques de vos biens',
			);
		}
	}

	/**
	 * Create a new property with images in single request
	 *
	 * @static
	 * @async
	 * @param {Omit<PropertyFormData, 'mainImage' | 'galleryImages'>} propertyData - Property data excluding image fields
	 * @param {File} [mainImageFile] - Main property image file
	 * @param {File[]} [galleryImageFiles=[]] - Additional gallery image files
	 * @returns {Promise<Property>} The created property
	 * @throws {Error} If the API request fails
	 *
	 * @example
	 * ```typescript
	 * const property = await PropertyService.createProperty(
	 *   { title: 'Appartement Paris', price: 300000, ... },
	 *   mainImageFile,
	 *   [gallery1, gallery2]
	 * );
	 * ```
	 */
	static async createProperty(
		propertyData: Omit<PropertyFormData, 'mainImage' | 'galleryImages'>,
		mainImageFile?: File,
		galleryImageFiles: File[] = [],
	): Promise<Property> {
		try {
			const formData = new FormData();

			// Sanitize clientInfo before sending
			const sanitizedData = {
				...propertyData,
				clientInfo: sanitizeClientInfo(propertyData.clientInfo),
			};

			// Add property data
			Object.entries(sanitizedData).forEach(([key, value]) => {
				if (value !== undefined && value !== null) {
					if (Array.isArray(value)) {
						value.forEach((item, index) => {
							formData.append(`${key}[${index}]`, String(item));
						});
					} else if (
						typeof value === 'object' &&
						key === 'clientInfo'
					) {
						// Stringify nested objects like clientInfo
						formData.append(key, JSON.stringify(value));
					} else {
						formData.append(key, String(value));
					}
				}
			});

			// Add main image
			if (mainImageFile) {
				formData.append('mainImage', mainImageFile);
			}

			// Add gallery images
			galleryImageFiles.forEach((file) => {
				formData.append('galleryImages', file);
			});

			const response = await api.post<PropertyResponse>(
				'property/create-property',
				formData,
				{
					headers: {
						'Content-Type': 'multipart/form-data',
					},
					timeout: 120000, // 2 minutes timeout for image uploads
				},
			);
			return response.data.data;
		} catch (error) {
			throw handleApiError(
				error,
				'PropertyService.createProperty',
				'Erreur lors de la création du bien',
			);
		}
	}

	/**
	 * Update a property with images in single request
	 *
	 * @static
	 * @async
	 * @param {string} propertyId - The ID of the property to update
	 * @param {Omit<PropertyFormData, 'mainImage' | 'galleryImages'>} propertyData - Updated property data
	 * @param {File} [newMainImageFile] - New main image file (optional)
	 * @param {File[]} [newGalleryImageFiles=[]] - New gallery image files
	 * @param {{ url: string; key: string } | null} [existingMainImage] - Existing main image to keep
	 * @param {Array<{ url: string; key: string }>} [existingGalleryImages=[]] - Existing gallery images to keep
	 * @returns {Promise<Property>} The updated property
	 * @throws {Error} If the API request fails
	 *
	 * @example
	 * ```typescript
	 * const updated = await PropertyService.updateProperty(
	 *   'property-id',
	 *   { price: 350000, ... },
	 *   newMainImage,
	 *   [],
	 *   existingMainImage,
	 *   existingGallery
	 * );
	 * ```
	 */
	static async updateProperty(
		propertyId: string,
		propertyData: Omit<PropertyFormData, 'mainImage' | 'galleryImages'>,
		newMainImageFile?: File,
		newGalleryImageFiles: File[] = [],
		existingMainImage?: { url: string; key: string } | null,
		existingGalleryImages: Array<{ url: string; key: string }> = [],
	): Promise<Property> {
		try {
			const formData = new FormData();

			// Sanitize clientInfo before sending
			const sanitizedData = {
				...propertyData,
				clientInfo: sanitizeClientInfo(propertyData.clientInfo),
			};

			// Add property data
			Object.entries(sanitizedData).forEach(([key, value]) => {
				if (value !== undefined && value !== null) {
					if (Array.isArray(value)) {
						value.forEach((item, index) => {
							formData.append(`${key}[${index}]`, String(item));
						});
					} else if (
						typeof value === 'object' &&
						key === 'clientInfo'
					) {
						// Stringify nested objects like clientInfo
						formData.append(key, JSON.stringify(value));
					} else {
						formData.append(key, String(value));
					}
				}
			});

			// Add new main image if provided
			if (newMainImageFile) {
				formData.append('mainImage', newMainImageFile);
			}

			// Add new gallery images
			newGalleryImageFiles.forEach((file) => {
				formData.append('galleryImages', file);
			});

			// Add existing images to keep
			if (existingMainImage) {
				formData.append(
					'existingMainImage',
					JSON.stringify(existingMainImage),
				);
			}

			if (existingGalleryImages.length > 0) {
				formData.append(
					'existingGalleryImages',
					JSON.stringify(existingGalleryImages),
				);
			}

			const response = await api.put<PropertyResponse>(
				`/property/${propertyId}/update`,
				formData,
				{
					headers: {
						'Content-Type': 'multipart/form-data',
					},
					timeout: 120000, // 2 minutes timeout for image uploads
				},
			);
			return response.data.data;
		} catch (error) {
			throw handleApiError(
				error,
				'PropertyService.updateProperty',
				'Erreur lors de la mise à jour du bien',
			);
		}
	}

	/**
	 * Delete a property
	 *
	 * @static
	 * @async
	 * @param {string} id - The ID of the property to delete
	 * @returns {Promise<void>}
	 * @throws {Error} If the API request fails
	 *
	 * @example
	 * ```typescript
	 * await PropertyService.deleteProperty('property-id');
	 * ```
	 */
	static async deleteProperty(id: string): Promise<void> {
		try {
			await api.delete(`/property/${id}`);
		} catch (error) {
			throw handleApiError(
				error,
				'PropertyService.deleteProperty',
				'Erreur lors de la suppression du bien',
			);
		}
	}

	/**
	 * Update property status
	 *
	 * @static
	 * @async
	 * @param {string} id - The ID of the property
	 * @param {Property['status']} status - New status (draft, active, sold, rented, archived)
	 * @returns {Promise<Property>} The updated property
	 * @throws {Error} If the API request fails
	 *
	 * @example
	 * ```typescript
	 * const property = await PropertyService.updatePropertyStatus('property-id', 'sold');
	 * ```
	 */
	static async updatePropertyStatus(
		id: string,
		status: Property['status'],
	): Promise<Property> {
		try {
			const response = await api.patch<PropertyResponse>(
				`/property/${id}/status`,
				{ status },
			);
			return response.data.data;
		} catch (error) {
			throw handleApiError(
				error,
				'PropertyService.updatePropertyStatus',
				'Erreur lors de la mise à jour du statut',
			);
		}
	}

	/**
	 * Search properties
	 */
	static async searchProperties(query: string): Promise<Property[]> {
		try {
			const response = await api.get<PropertiesResponse>(
				`/property/search?q=${encodeURIComponent(query)}`,
			);
			return response.data.data.properties;
		} catch (error) {
			throw handleApiError(
				error,
				'PropertyService.searchProperties',
				'Erreur lors de la recherche',
			);
		}
	}
}

// Export default instance for convenience
export const propertyService = PropertyService;
