# S3 Image Upload Feature

## Overview

This feature enables secure, optimized image uploads to AWS S3 for MonHubImmo property listings. Users can now drag & drop images directly in the property form instead of entering URLs manually.

## Architecture

### Backend Components

#### S3 Service (`server/src/services/s3Service.ts`)

- Handles upload to AWS S3 with automatic image optimization
- Creates multiple image variants (original, large, medium, thumbnail)
- Supports organized folder structure (`properties/{propertyId}/{main|gallery}/`)
- Automatic cleanup functionality

#### Upload Middleware (`server/src/middleware/uploadMiddleware.ts`)

- Multer configuration for file validation
- Supports single and multiple file uploads
- File size limit: 5MB per image
- Supported formats: JPG, PNG, WebP

#### Upload Routes (`server/src/routes/uploadRoutes.ts`)

- `POST /api/upload/property` - Upload property images (main + gallery)
- `POST /api/upload/single` - Upload single image (profiles, etc.)
- `DELETE /api/upload/delete` - Delete images by S3 keys

### Frontend Components

#### ImageUploader (`client/components/ui/ImageUploader.tsx`)

- Reusable drag & drop component
- Real-time preview with removal functionality
- File validation and error handling
- Configurable limits and accepted file types

#### PropertyImageManager (`client/components/property/PropertyImageManager.tsx`)

- Specialized component for property image uploads
- Handles main image + gallery images separately
- Integrates with property creation workflow
- Upload progress and status feedback

#### Image Utils (`client/lib/utils/imageUtils.ts`)

- `getImageUrl()` - Safely extract URLs from new/legacy image formats
- `getGalleryImages()` - Convert gallery arrays to URL arrays
- Backward compatibility with existing string URLs

## Data Structure

### New Image Format

```typescript
{
  original?: string;    // Full size S3 URL
  large?: string;       // 1200px wide
  medium?: string;      // 800px wide
  thumbnail?: string;   // 300px wide
  keys?: string[];      // S3 keys for deletion
}
```

### Property Schema Updates

```typescript
// New structure
mainImage: ImageData | string;  // Supports both formats
galleryImages?: ImageData[];    // New gallery structure
images?: string[];              // Legacy support
```

## Usage

### Property Creation

1. User drags images into PropertyImageManager
2. Images are validated client-side
3. FormData is sent to `/api/upload/property`
4. S3Service processes and optimizes images
5. Multiple variants are stored in organized folders
6. URLs are returned to update property data

### Image Display

```typescript
// Use utility function for safe URL extraction
const imageUrl = getImageUrl(property.mainImage, "medium");
```

## Environment Variables Required

```env
AWS_REGION=us-east-1
AWS_S3_BUCKET=mon-hub-immo-images
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key
S3_CLOUDFRONT_URL=https://your-cdn.cloudfront.net
```

## Benefits

- **Performance**: Automatic image optimization and multiple sizes
- **Security**: Signed uploads, server-side validation
- **UX**: Drag & drop interface with real-time previews
- **Scalability**: CDN-ready with CloudFront integration
- **Maintenance**: Automatic cleanup and organized storage
- **Compatibility**: Backward compatible with existing URL-based images

## Files Created/Modified

### New Files

- `server/src/services/s3Service.ts`
- `server/src/middleware/uploadMiddleware.ts`
- `server/src/routes/uploadRoutes.ts`
- `client/components/ui/ImageUploader.tsx`
- `client/components/property/PropertyImageManager.tsx`
- `client/lib/utils/imageUtils.ts`

### Modified Files

- `server/src/server.ts` - Added upload routes
- `server/src/models/Property.ts` - Updated schema for new image structure
- `client/components/property/PropertyForm.tsx` - Integrated image upload
- `client/components/property/PropertyCard.tsx` - Updated to use image utils
- `client/lib/propertyService.ts` - Updated Property interfaces

## Next Steps

To complete the implementation:

1. Install dependencies: `npm install @aws-sdk/client-s3 @aws-sdk/s3-request-presigner multer multer-s3 sharp react-dropzone`
2. Configure AWS S3 bucket and CloudFront distribution
3. Set environment variables
4. Test upload functionality
5. Update remaining property display components to use image utils
