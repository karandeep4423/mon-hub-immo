# Collaboration Status Check Fix

## Issue

Property and search ad detail pages were showing "Proposer de collaborer" button even when:

1. The post was already in collaboration (pending, accepted, or active status)
2. The user was the owner of the property/search ad

## Root Cause

1. **Property Page**: Collaboration check was running for ALL users including property owners and unauthenticated users
2. **Search Ad Page**: Collaboration check was running even for unauthenticated users
3. **Backend Query**: Used lowercase `'property'` and `'searchAd'` instead of PascalCase `'Property'` and `'SearchAd'` which could cause query mismatch

## Changes Made

### Frontend - Property Page (`client/app/property/[id]/page.tsx`)

1. Added `isPropertyOwner` computed variable to check if current user owns the property
2. Updated collaboration check to only run when:
   - User is authenticated (`user` exists)
   - User is NOT the property owner (`!isPropertyOwner`)
3. Simplified UI logic to use `isPropertyOwner` variable consistently

**Before:**

```typescript
useEffect(() => {
  loadPropertyCollaborations();
}, [loadPropertyCollaborations]);
```

**After:**

```typescript
const isPropertyOwner =
  user &&
  property &&
  (user._id === property.owner._id || user.id === property.owner._id);

useEffect(() => {
  // Only check collaborations if user is NOT the property owner
  if (!isPropertyOwner && user) {
    loadPropertyCollaborations();
  }
}, [loadPropertyCollaborations, isPropertyOwner, user]);
```

### Frontend - Search Ad Details (`client/components/search-ads/SearchAdDetails.tsx`)

1. Added `currentUser` check before loading collaborations

**Before:**

```typescript
useEffect(() => {
  if (!isOwner) {
    loadSearchAdCollaborations();
  }
}, [loadSearchAdCollaborations, isOwner]);
```

**After:**

```typescript
useEffect(() => {
  // Only check collaborations if user is authenticated and NOT the owner
  if (!isOwner && currentUser) {
    loadSearchAdCollaborations();
  }
}, [loadSearchAdCollaborations, isOwner, currentUser]);
```

### Backend - Collaboration Controller (`server/src/controllers/collaborationController.ts`)

1. Fixed `postType` case from lowercase to PascalCase to match schema enum

**Before:**

```typescript
postType: "property"; // Property endpoint
postType: "searchAd"; // Search ad endpoint
```

**After:**

```typescript
postType: "Property"; // Property endpoint
postType: "SearchAd"; // Search ad endpoint
```

## Expected Behavior

### Property Detail Page

- **Owner viewing own property**: Shows "Votre propriété" message, NO collaboration button
- **Non-owner, no collaboration**: Shows "Proposer de collaborer" button
- **Non-owner, existing collaboration**: Shows message "Propriété déjà en collaboration (en attente/acceptée/active)"
- **Unauthenticated user**: Only shows "Contacter l'agent" button, no collaboration check runs

### Search Ad Detail Page

- **Owner viewing own search ad**: Shows "Vous êtes le propriétaire de cette page" message, NO collaboration button
- **Non-owner, no collaboration**: Shows "Proposer une collaboration" button
- **Non-owner, existing collaboration**: Shows message "Annonce déjà en collaboration (en attente/acceptée/active)"
- **Unauthenticated user**: Only shows "Contacter l'auteur" button, no collaboration check runs

## Collaboration States Blocking New Proposals

- `pending`: Waiting for owner to respond
- `accepted`: Owner accepted, waiting for contract signing
- `active`: Both parties signed contract, collaboration is active

## Collaboration States Allowing New Proposals

- `completed`: Collaboration finished successfully
- `cancelled`: Collaboration was cancelled by either party
- `rejected`: Owner rejected the proposal

## Testing Checklist

- [x] Property owner cannot see collaboration button on their own property
- [x] Search ad owner cannot see collaboration button on their own search ad
- [x] Unauthenticated users don't trigger collaboration checks
- [x] Non-owners with no active collaboration see "Propose" button
- [x] Non-owners with pending/accepted/active collaboration see status message
- [x] Backend queries use correct PascalCase for postType
- [x] No TypeScript errors

## Files Modified

1. `client/app/property/[id]/page.tsx`
2. `client/components/search-ads/SearchAdDetails.tsx`
3. `server/src/controllers/collaborationController.ts`

## Related Features

- Collaboration proposal workflow
- Property/Search ad detail pages
- Owner authentication checks
- Collaboration status filtering
