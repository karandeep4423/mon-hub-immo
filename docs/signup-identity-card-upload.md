# Identity Card Upload Feature - Signup Flow

## Overview

Added optional identity card file upload functionality to the signup professional information step for all three agent types.

## Changes Made

### 1. New Component: `FileUpload.tsx`

- **Location**: `client/components/ui/FileUpload.tsx`
- **Features**:
  - Accepts both images (JPEG, PNG, WebP) and PDF files
  - Shows small preview thumbnail for images
  - Shows PDF icon for PDF files
  - Displays file name and size
  - One-click file removal
  - Optional field (no validation required)
  - Max file size: 5MB (enforced by browser)

### 2. Updated: `SignUpForm.tsx`

- **Added State**: `identityCardFile` to store the uploaded file
- **Added Import**: `FileUpload` component from UI library
- **Integration**: Added `FileUpload` component to all three agent type sections:
  - Agent immobilier indépendant (Independent Agent)
  - Agent commercial immobilier (Commercial Agent)
  - Négociateur VRP employé d'agence (Employee Agent)

### 3. Updated: `ui/index.ts`

- Exported `FileUpload` component for easy imports

## User Experience

### Visual Design

- File upload appears below existing text inputs in each agent type section
- Consistent with existing UI using brand colors (bg-brand-50, border-brand-200)
- Small preview (64x64px) for better space utilization
- Helper text indicates it's optional

### Behavior

1. User selects agent type from dropdown
2. Agent type section expands with relevant fields
3. Identity card upload field appears as the last input before helper text
4. User can click to upload or drag & drop
5. Preview appears immediately after selection
6. User can remove and re-upload anytime
7. File is cleared when changing agent type or user type

## Technical Details

### File State Management

- File stored in component state as `File | null`
- Cleared on agent type change to prevent mismatched uploads
- Cleared on user type change (agent → apporteur)

### File Validation

- Client-side validation via `accept` attribute
- Accepts: `image/*,application/pdf`
- Size limit: 5MB (browser enforced)
- Optional field - no backend validation required yet

## Next Steps (Backend Implementation)

1. Add file upload endpoint
2. Store files in cloud storage (AWS S3, Cloudinary, etc.)
3. Save file URL/reference in user profile
4. Add file size validation on server
5. Add virus scanning for uploaded files
6. Update user model to include identity card field

## Files Modified

- ✅ `client/components/ui/FileUpload.tsx` (NEW)
- ✅ `client/components/ui/index.ts`
- ✅ `client/components/auth/SignUpForm.tsx`

## Preview

- Images: Show thumbnail preview
- PDFs: Show PDF icon + filename + size
- Empty state: Upload icon with instructions
