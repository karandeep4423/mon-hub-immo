# Address Privacy Feature

## Overview

Implemented address privacy controls for property and search ad listings. Full addresses are only visible to:

1. Property/search ad owners
2. Users with **accepted**, **active**, or **completed** collaborations

## Implementation Date

October 26, 2025

## Business Logic

### Privacy Rules

**Property Ads:**

- **Cards (Home page)**: Always show only city name
- **Detail page**:
  - Owner: Full address visible
  - Non-owner with accepted/active/completed collab: Full address visible
  - Others: Only city visible (no street address or postal code)

**Search Ads:**

- **Cards (Home page)**: Show only first city with "..." if multiple cities
- **Detail page (LocationCard)**:
  - Owner: All cities, max distance, and other area preferences visible
  - Non-owner with accepted/active collab: All location details visible
  - Others: Only first 2 cities visible (with "..." if more exist)

### Collaboration Status Hierarchy

**Full address shown for:**

- `accepted` - Collaboration proposal accepted by owner
- `active` - Contract signed, collaboration is ongoing
- `completed` - Collaboration finished successfully (address remains visible)

**Address hidden for:**

- `pending` - Waiting for owner response
- `rejected` - Owner rejected the proposal
- `cancelled` - Collaboration was cancelled
- No collaboration exists

## Files Created

### 1. `client/lib/utils/addressPrivacy.ts`

Utility functions for address privacy logic:

```typescript
// Check if user can view full address
canViewFullAddress(
  isOwner: boolean,
  collaborations: Collaboration[],
  userId?: string
): boolean

// Get masked address (city + postal only)
getMaskedAddress(
  address?: string,
  city?: string,
  postalCode?: string
): string

// Get display address based on permissions
getDisplayAddress(
  canView: boolean,
  address?: string,
  city?: string,
  postalCode?: string
): string

// Get info message for search ads
getSearchAdLocationMessage(canView: boolean): string | null
```

## Files Modified

### Frontend Components

#### 1. `client/app/property/[id]/page.tsx`

**Changes:**

- Import `canViewFullAddress` and `getDisplayAddress` utilities
- Calculate `canViewFullAddress` based on owner status and collaborations
- Use `getDisplayAddress` to show masked or full address
- Add privacy notice when address is masked

**Before:**

```tsx
<p className="text-gray-600">
  {property.address}, {property.city} {property.postalCode}
</p>
```

**After:**

```tsx
<p className="text-gray-600">
  {getDisplayAddress(
    canViewFullAddress(
      isPropertyOwner || false,
      propertyCollaborations,
      user?._id || user?.id,
    ),
    property.address,
    property.city,
    property.postalCode,
  )}
</p>
{!canViewFullAddress(...) && (
  <p className="text-xs text-amber-600 mt-1">
    🔒 Adresse complète visible après collaboration acceptée
  </p>
)}
```

#### 2. `client/components/property/PropertyCard.tsx`

**Changes:**

- Store collaborations array from API
- Calculate if user can view address (not used in cards but stored)
- Cards continue showing only city (no change in display)

**Implementation Note:**
Property cards already show only the city, which provides appropriate privacy for list views.

#### 3. `client/components/search-ads/details/LocationCard.tsx`

**Changes:**

- Add `canViewFullLocation` prop
- Show limited cities (first 2) when location is masked
- Hide max distance and other area preferences when masked
- Add privacy notice

**Before:**

```tsx
<p className="text-gray-900 font-medium text-base">
  {searchAd.location.cities.join(", ")}
</p>
```

**After:**

```tsx
const displayCities = canViewFullLocation
  ? searchAd.location.cities
  : searchAd.location.cities.slice(0, 2);

<p className="text-gray-900 font-medium text-base">
  {displayCities.join(", ")}
  {!canViewFullLocation && searchAd.location.cities.length > 2 && "..."}
</p>;
{
  !canViewFullLocation && (
    <p className="text-xs text-amber-600 mt-1.5">
      🔒 Localisation complète visible après collaboration acceptée
    </p>
  );
}
```

#### 4. `client/components/search-ads/SearchAdDetails.tsx`

**Changes:**

- Import `canViewFullAddress` utility
- Calculate `canViewFullLocation` based on ownership and collaborations
- Pass `canViewFullLocation` prop to `LocationCard`

**Implementation:**

```tsx
const canViewFullLocation = canViewFullAddress(
  isOwner,
  collaborations,
  currentUser?._id
);

<LocationCard searchAd={searchAd} canViewFullLocation={canViewFullLocation} />;
```

#### 5. `client/components/search-ads/HomeSearchAdCard.tsx`

**No changes needed** - Already shows only first city with "..." indicator, which is perfect for privacy.

## User Experience

### Property Owners

✅ See full address on their own properties at all times

### Search Ad Authors

✅ See full location details on their own search ads at all times

### Collaborators (Accepted/Active/Completed)

✅ See full address after collaboration is accepted, active, or completed
✅ See all location details for search ads
✅ Privacy message disappears once collaboration is accepted

### Other Users

⚠️ See only city name for properties (no street address or postal code)
⚠️ See only first 2 cities for search ads
⚠️ See privacy notice: "🔒 Adresse complète visible après collaboration acceptée"

## Security Considerations

1. **Server-side validation**: Address privacy is a frontend UX feature. Backend still returns full data to authenticated users.
2. **Future enhancement**: Consider server-side filtering of sensitive data based on collaboration status for enhanced security.
3. **Collaboration status**: `accepted`, `active`, and `completed` statuses grant full address access.

## Testing Checklist

- [x] Property owner sees full address
- [x] Property collaborator with accepted status sees full address
- [x] Property collaborator with active status sees full address
- [x] Property collaborator with completed status sees full address
- [x] Non-collaborator sees masked address (city only, no postal code or street)
- [x] Search ad owner sees all location details
- [x] Search ad collaborator with accepted/active/completed status sees all locations
- [x] Non-collaborator sees limited cities (first 2)
- [x] Privacy notices appear when address is masked
- [x] Property cards show only city
- [x] Search ad cards show only first city with "..."

## Benefits

1. **Privacy Protection**: Prevents address scraping and unauthorized visits
2. **Business Value**: Encourages users to establish collaborations
3. **Trust Building**: Shows respect for property owner/client privacy
4. **Professional Workflow**: Aligns with real estate industry best practices
5. **Gradual Disclosure**: Information revealed as relationship progresses

## Future Enhancements

1. **Backend filtering**: Add server-side address filtering based on collaboration status
2. **Geocoding privacy**: Show approximate location on map instead of exact marker
3. **Time-based reveal**: Auto-hide address after collaboration ends
4. **Audit logging**: Track who viewed full addresses and when
5. **Custom privacy settings**: Let owners choose their privacy level
