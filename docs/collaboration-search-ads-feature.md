# Collaboration System Extended to Search Ads

## Overview

Extended the existing property collaboration system to support search ads, allowing users to propose, accept, sign contracts, and activate collaborations on search ad posts. The system now uses a generic post-type architecture that works for both properties and search ads.

## Implementation Date

[Current Date]

## Changes Summary

### Backend Refactoring

#### 1. Database Model (`server/src/models/Collaboration.ts`)

- **Renamed fields** for post-type agnosticism:
  - `propertyId` → `postId` (reference to either Property or SearchAd)
  - `propertyOwnerId` → `postOwnerId`
- **Added discriminator field**: `postType: 'property' | 'searchAd'`
- **Updated schema** with `refPath` for dynamic population based on postType
- **Updated indexes** for queries on `postId` + `postType` combination

#### 2. Database Migration (`server/src/migrations/migrateCollaborations.ts`)

- Created migration script to update existing collaboration records
- Bulk operations rename fields and add `postType: 'property'` default
- Includes verification and rollback safety mechanisms
- Run with: `npm run migrate:collaborations` (needs to be added to package.json)

#### 3. Controller Updates (`server/src/controllers/collaborationController.ts`)

- **Updated `proposeCollaboration`**:
  - Accepts either `propertyId` OR `searchAdId`
  - Determines `postType` and fetches appropriate model
  - Creates collaboration with generic `postId` reference
- **Added `getCollaborationsBySearchAd`**: New function to fetch collaborations for search ads
- **Updated all 9 controller functions** to use `postOwnerId` instead of `propertyOwnerId`

#### 4. Routes & Validation (`server/src/routes/collaboration.ts`, `server/src/validation/schemas.ts`)

- **Added route**: `GET /collaboration/search-ad/:searchAdId`
- **Updated `proposeCollaborationSchema`**:
  - Made `propertyId` and `searchAdId` both optional
  - Added Zod refine validation: `refine((data) => data.propertyId || data.searchAdId)`
- **Added `searchAdIdParam`** validation schema

### Frontend Updates

#### 1. Type Definitions (`client/types/collaboration.ts`)

- **Updated `Collaboration` interface**:
  - Changed `propertyId` to `postId` with union type: `Partial<Property> | Partial<SearchAd>`
  - Changed `propertyOwnerId` to `postOwnerId`
  - Added `postType: 'property' | 'searchAd'` field
- **Updated `ProposeCollaborationRequest`**:
  - Made both `propertyId` and `searchAdId` optional

#### 2. API Client (`client/lib/api/collaborationApi.ts`)

- **Added method**: `getSearchAdCollaborations(searchAdId: string)`
  - Calls `GET /collaboration/search-ad/${searchAdId}`
  - Returns collaborations for a specific search ad

#### 3. ProposeCollaborationModal Component (`client/components/collaboration/ProposeCollaborationModal.tsx`)

- **Complete refactoring** to support both post types
- **New props structure**:
  ```typescript
  type PostData =
    | { type: "property"; id: string; data: PropertyData }
    | { type: "searchAd"; id: string; data: SearchAdData };
  ```
- **Conditional rendering**:
  - Properties: Display image, title, price, city, propertyType, surface, rooms
  - Search Ads: Display title, description, location cities, budget, propertyTypes badges
- **Updated API call**: Passes correct ID field (`propertyId` or `searchAdId`) based on `type`

#### 4. SearchAdDetails Component (`client/components/search-ads/SearchAdDetails.tsx`)

- **Added collaboration features**:
  - "Propose Collaboration" button next to "Contact Author" button
  - Blocking collaboration check (disables button if pending/accepted/active collab exists)
  - State management for modal visibility
  - `loadSearchAdCollaborations` function to check existing collaborations
  - Integration with `ProposeCollaborationModal` passing search ad data
- **UI consistency**: Button styling matches property details page

#### 5. Collaboration Detail Page (`client/app/collaboration/[id]/page.tsx`)

- **Updated all references**:
  - `collaboration.propertyOwnerId` → `collaboration.postOwnerId`
  - `collaboration.propertyId` → `collaboration.postId`
- **Permission checks** now use `postOwnerId`
- **Chat peer resolution** updated to use `postOwnerId`

#### 6. ContractViewModal Component (`client/components/contract/ContractViewModal.tsx`)

- **Updated interface**: Changed `propertyOwnerId` to `postOwnerId` in collaboration prop type
- **Updated all template references**: Contract template now uses `postOwnerId`

## User Flow

### For Search Ads (New)

1. **Browse**: User finds a search ad on `/search-ads` or `/monagentimmo`
2. **View Details**: Clicks on search ad to see full details
3. **Propose**: Clicks "Propose Collaboration" button (if no blocking collaboration exists)
4. **Fill Modal**: Enters commission percentage and optional message
5. **Submit**: Collaboration proposal sent to search ad author
6. **Author Response**: Author accepts/rejects via collaboration detail page
7. **Contract Signing**: If accepted, both parties sign generic contract template
8. **Activation**: Once both signed, collaboration becomes active

### For Properties (Existing)

- Workflow unchanged, continues to work as before
- Same collaboration detail page, contract system, and progress tracking

## API Endpoints

### New Endpoints

- `GET /api/collaboration/search-ad/:searchAdId` - Get collaborations for a search ad

### Updated Endpoints

- `POST /api/collaboration` - Now accepts either:
  ```json
  { "propertyId": "...", "commissionPercentage": 25, "message": "..." }
  // OR
  { "searchAdId": "...", "commissionPercentage": 25, "message": "..." }
  ```

## Database Changes

### Collaboration Collection

**Before:**

```javascript
{
  propertyId: ObjectId,
  propertyOwnerId: ObjectId,
  collaboratorId: ObjectId,
  // ... other fields
}
```

**After:**

```javascript
{
  postId: ObjectId,  // Can reference Property or SearchAd
  postType: 'property' | 'searchAd',
  postOwnerId: ObjectId,
  collaboratorId: ObjectId,
  // ... other fields
}
```

### Migration Required

Run migration script to update existing records:

```bash
npm run migrate:collaborations
```

## Testing Checklist

### Backend

- [ ] Propose collaboration on property (existing functionality)
- [ ] Propose collaboration on search ad (new functionality)
- [ ] Accept/reject collaboration for both post types
- [ ] Sign contract for both post types
- [ ] Activate collaboration for both post types
- [ ] Fetch collaborations by property ID
- [ ] Fetch collaborations by search ad ID

### Frontend

- [ ] Property details page - propose collaboration button works
- [ ] Search ad details page - propose collaboration button works
- [ ] Collaboration modal renders property details correctly
- [ ] Collaboration modal renders search ad details correctly
- [ ] Collaboration detail page displays correct post owner
- [ ] Contract view modal shows correct owner information
- [ ] Blocking collaboration check works for properties
- [ ] Blocking collaboration check works for search ads

### Edge Cases

- [ ] User cannot propose multiple active collaborations on same post
- [ ] Validation fails if neither propertyId nor searchAdId provided
- [ ] Validation fails if both propertyId and searchAdId provided
- [ ] Post owner cannot propose collaboration on their own post
- [ ] Collaboration persists correct postType for filtering

## Commission Structure

- **Same for both**: Commission percentage split applies equally to properties and search ads
- **Configurable**: 1-50% range enforced in modal validation

## Contract Template

- **Generic**: Single contract template used for both property and search ad collaborations
- **Fields**: Owner name, collaborator name, commission percentage, signatures, dates
- **No post-specific content**: Contract doesn't reference property/search ad details

## Files Modified

### Backend (7 files)

1. `server/src/models/Collaboration.ts` - Model refactoring
2. `server/src/migrations/migrateCollaborations.ts` - Migration script (new)
3. `server/src/controllers/collaborationController.ts` - Controller updates
4. `server/src/controllers/contractController.ts` - Updated to use postOwnerId
5. `server/src/routes/collaboration.ts` - New route
6. `server/src/validation/schemas.ts` - Validation updates
7. `server/src/models/SearchAd.ts` - Reference (no changes needed)

### Frontend (6 files)

1. `client/types/collaboration.ts` - Type definitions
2. `client/lib/api/collaborationApi.ts` - API client
3. `client/components/collaboration/ProposeCollaborationModal.tsx` - Modal refactoring
4. `client/components/search-ads/SearchAdDetails.tsx` - Button integration
5. `client/app/collaboration/[id]/page.tsx` - Field name updates
6. `client/components/contract/ContractViewModal.tsx` - Field name updates

## Related Features

- Collaboration notifications (should work automatically for search ads)
- Collaboration list/dashboard (will show both types with postType indicator)
- Activity timeline (works for both types)
- Progress tracking (identical workflow for both)

## Future Enhancements

- [ ] Add post-type indicator badges in collaboration list
- [ ] Filter collaborations by post type in dashboard
- [ ] Post-specific details in collaboration detail page
- [ ] Analytics: Track collaboration success rate by post type

## Notes

- Migration is backward compatible (existing property collaborations work unchanged)
- No breaking changes to existing API contracts
- Frontend auto-reload will pick up changes; no manual restart needed
- Database migration should be run before deploying frontend changes
