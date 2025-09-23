interface ImageData {
	url?: string;
	key?: string;
	// Legacy support
	original?: string;
	large?: string;
	medium?: string;
	thumbnail?: string;
}

// Simple gray placeholder as data URL
const PLACEHOLDER_IMAGE =
	'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjNmNGY2Ii8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxOCIgZmlsbD0iIzk5YTNhZiIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkltYWdlIG5vbiBkaXNwb25pYmxlPC90ZXh0Pjwvc3ZnPg==';

export const getImageUrl = (
	imageData: ImageData | string | undefined,
	size: 'original' | 'large' | 'medium' | 'thumbnail' = 'large',
	fallback = PLACEHOLDER_IMAGE,
): string => {
	// Handle legacy string URLs
	if (typeof imageData === 'string') {
		return imageData || fallback;
	}

	// Handle new S3 image structure
	if (imageData && typeof imageData === 'object') {
		// New format: single optimized image
		if (imageData.url) {
			return imageData.url;
		}
		// Legacy format: multiple sizes
		return (
			imageData[size] || imageData.large || imageData.original || fallback
		);
	}

	return fallback;
};

export const getGalleryImages = (
	galleryImages: (ImageData | string)[] = [],
	size: 'original' | 'large' | 'medium' | 'thumbnail' = 'large',
): string[] => {
	return galleryImages.map((img) => getImageUrl(img, size));
};
