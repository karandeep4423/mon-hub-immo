// client/lib/propertyService.ts
import { api } from '../api';

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
	characteristics?: string;
	saleType?: 'ancien' | 'viager';

	// Financial info
	feesResponsibility?: 'buyer' | 'seller';
	annualCondoFees?: number;
	tariffLink?: string;

	// Additional property details
	landArea?: number; // Surface totale du terrain in m²
	levels?: number; // Nombre de niveaux
	parkingSpaces?: number; // Places de parking
	exterior?: ('garden' | 'balcony' | 'terrace' | 'courtyard' | 'none')[];
	availableFrom?: string; // Date string MM/YYYY format

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
	isExclusive?: boolean;
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
	characteristics?: Property['characteristics'];
	saleType?: Property['saleType'];
	feesResponsibility?: Property['feesResponsibility'];
	annualCondoFees?: Property['annualCondoFees'];
	tariffLink?: Property['tariffLink'];
	landArea?: Property['landArea'];
	levels?: Property['levels'];
	parkingSpaces?: Property['parkingSpaces'];
	exterior?: Property['exterior'];
	availableFrom?: string; // Date string MM/YYYY format
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
	isExclusive?: boolean;
	isFeatured?: boolean;
	status: Property['status'];
}

export interface PropertyFilters {
	search?: string;
	propertyType?: string;
	sector?: string;
	minPrice?: number;
	maxPrice?: number;
	transactionType?: string;
	city?: string;
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
		stats: {
			total: number;
			active: number;
			draft: number;
			sold: number;
			rented: number;
		};
	};
	message?: string;
}

/**
 * Property Service - Centralized API operations for properties
 */
export class PropertyService {
	/**
	 * Get all properties with optional filters
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
			console.error('Error fetching properties:', error);
			throw new Error('Erreur lors de la récupération des biens');
		}
	}

	/**
	 * Get a single property by ID
	 */
	static async getPropertyById(id: string): Promise<Property> {
		try {
			const response = await api.get<PropertyResponse>(`/property/${id}`);
			return response.data.data;
		} catch (error) {
			console.error('Error fetching property:', error);
			throw new Error('Erreur lors de la récupération du bien');
		}
	}

	/**
	 * Get current user's properties
	 */
	static async getMyProperties(): Promise<MyPropertiesResponse['data']> {
		try {
			const response = await api.get<MyPropertiesResponse>(
				'/property/my/properties',
			);
			return response.data.data;
		} catch (error) {
			console.error('Error fetching my properties:', error);
			throw new Error('Erreur lors de la récupération de vos biens');
		}
	}

	/**
	 * Create a new property with images in single request
	 */
	static async createProperty(
		propertyData: Omit<PropertyFormData, 'mainImage' | 'galleryImages'>,
		mainImageFile?: File,
		galleryImageFiles: File[] = [],
	): Promise<Property> {
		try {
			const formData = new FormData();

			// Add property data
			Object.entries(propertyData).forEach(([key, value]) => {
				if (value !== undefined && value !== null) {
					if (Array.isArray(value)) {
						value.forEach((item, index) => {
							formData.append(`${key}[${index}]`, String(item));
						});
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
		} catch (error: unknown) {
			console.error('Error creating property:', error);
			const err = error as { response?: { data?: { message?: string } } };
			const errorMessage =
				err.response?.data?.message ||
				'Erreur lors de la création du bien';
			throw new Error(errorMessage);
		}
	}

	/**
	 * Update a property with images in single request
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

			// Add property data
			Object.entries(propertyData).forEach(([key, value]) => {
				if (value !== undefined && value !== null) {
					if (Array.isArray(value)) {
						value.forEach((item, index) => {
							formData.append(`${key}[${index}]`, String(item));
						});
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
		} catch (error: unknown) {
			console.error('Error updating property:', error);
			const err = error as { response?: { data?: { message?: string } } };
			const errorMessage =
				err.response?.data?.message ||
				'Erreur lors de la mise à jour du bien';
			throw new Error(errorMessage);
		}
	}

	/**
	 * Delete a property
	 */
	static async deleteProperty(id: string): Promise<void> {
		try {
			await api.delete(`/property/${id}`);
		} catch (error: unknown) {
			console.error('Error deleting property:', error);
			const err = error as { response?: { data?: { message?: string } } };
			const errorMessage =
				err.response?.data?.message ||
				'Erreur lors de la suppression du bien';
			throw new Error(errorMessage);
		}
	}

	/**
	 * Update property status
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
		} catch (error: unknown) {
			console.error('Error updating property status:', error);
			const err = error as { response?: { data?: { message?: string } } };
			const errorMessage =
				err.response?.data?.message ||
				'Erreur lors de la mise à jour du statut';
			throw new Error(errorMessage);
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
			console.error('Error searching properties:', error);
			throw new Error('Erreur lors de la recherche');
		}
	}
}

// Export default instance for convenience
export const propertyService = PropertyService;
