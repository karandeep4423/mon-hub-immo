# Location Search with Postal Code Feature

## Overview

Added comprehensive location search functionality to the home page, allowing users to search properties and search ads by city name OR postal code, with an elegant autocomplete UI matching the provided screenshot design.

## Changes Made

### 1. Backend Updates

#### SearchAd Model (`server/src/models/SearchAd.ts`)

- Added `postalCodes?: string[]` field to `location` object
- Now supports both cities and postal codes for search ads

#### Property Controller (`server/src/controllers/propertyController.ts`)

- Updated to support comma-separated postal codes in filters
- Single postal code: `filter.postalCode = '75001'`
- Multiple postal codes: `filter.postalCode = { $in: ['75001', '75002'] }`

#### SearchAd Controller (`server/src/controllers/searchAdController.ts`)

- Added location filtering support in `getAllSearchAds` endpoint
- Supports filtering by cities (with regex for partial matches)
- Supports filtering by postal codes (exact matches)
- Both accept comma-separated values

### 2. Frontend Updates

#### New Component: LocationSearchInput (`client/components/ui/LocationSearchInput.tsx`)

**Features:**

- **Autocomplete search** - Type city name OR postal code
- **Display format** - Shows as "City (PostalCode)" e.g., "Dinan (22100)"
- **Chip/Tag UI** - Selected locations display as removable chips
- **Suggestions dropdown:**
  - "Autour de moi" (Around me) - for geolocation-based search
  - "Toute la France" (All of France) - to remove location filter
  - Previously selected locations (stored in localStorage)
- **Smart search:**
  - Numeric input → searches postal codes
  - Text input → searches city names
- **Click outside to close** dropdown
- **Persisted history** - Last 5 searches saved

#### New Utility: cityPostalCodeData (`client/lib/utils/cityPostalCodeData.ts`)

- Centralized database of 100+ French cities with postal codes
- Utility functions:
  - `searchCities(query, limit)` - Search by city or postal code
  - `getCityFromPostalCode(postalCode)` - Lookup city by postal code
  - `getPostalCodesForCity(city)` - Get all postal codes for a city
- Covers major cities: Paris, Lyon, Marseille, Toulouse, Nantes, etc.
- Includes Île-de-France suburbs and Brittany region
- Easy to extend with more cities

#### Updated Home Page (`client/app/home/page.tsx`)

**Changes:**

- Replaced old "Secteur" text input with new `LocationSearchInput` component
- Added `selectedLocations` state to track selected cities/postal codes
- Updated filter logic:
  - Properties: Filtered by postal codes via API
  - Search Ads: Filtered client-side by cities and postal codes
- Updated dependencies in useEffect hooks
- Added special filter handling:
  - "Toute la France" → no location filtering
  - "Autour de moi" → placeholder for geolocation (to implement)

#### Type Updates

- `client/types/searchAd.ts` - Added `postalCodes?: string[]` to location
- `client/lib/api/propertyApi.ts` - Added `postalCode?: string` to PropertyFilters

## How It Works

### User Flow

1. User clicks on location search input
2. Dropdown shows suggestions (previous searches + special options)
3. User types city name (e.g., "Paris") OR postal code (e.g., "75001")
4. Matching results appear as "City (PostalCode)"
5. User clicks a result → it appears as a chip above the input
6. User can select multiple locations
7. User can remove locations by clicking the X button
8. Filtering happens automatically via API calls

### Backend Filtering

```typescript
// Properties - via query params
GET /api/properties?postalCode=75001,75002,75015

// Search Ads - via query params (future enhancement)
GET /api/search-ads?city=Paris,Lyon&postalCode=75001,69001
```

### Frontend Filtering

- **Properties:** Filtered server-side via API with postal codes
- **Search Ads:** Filtered client-side (checks both `location.cities` and `location.postalCodes`)

## UI/UX Features Matching Screenshot

✅ Single unified search area with main search bar
✅ Location icon with separate location input field
✅ Selected locations as chips with X button (displayed between inputs)
✅ Dropdown with suggestions on location input
✅ "Autour de moi" option
✅ "Toute la France" option
✅ Shows city with postal code in brackets
✅ Search by either city OR postal code
✅ Clean, modern design matching brand colors
✅ Integrated experience - both searches in same component

## Next Steps (Optional Enhancements)

1. **Geolocation for "Autour de moi"**

   - Implement browser geolocation API
   - Calculate distance from user location
   - Filter properties/ads within radius

2. **External API Integration**

   - Use `api-adresse.data.gouv.fr` for complete French address database
   - Real-time city/postal code lookup
   - More accurate and comprehensive data

3. **Backend Search Ads API Enhancement**

   - Move search ad filtering to backend
   - Add pagination and sorting
   - Improve performance for large datasets

4. **Advanced Features**
   - Map view showing locations
   - Distance calculation between properties and user
   - Radius-based search
   - Department-level filtering (e.g., all of "75" for Paris)

## Testing Checklist

- [x] Type city name → see matching cities with postal codes
- [x] Type postal code → see matching cities with that code
- [x] Select location → appears as chip
- [x] Remove location → chip disappears
- [x] Select "Toute la France" → shows all results
- [x] Multiple locations → filters correctly
- [x] Close dropdown on click outside
- [x] Previous searches persist across sessions
- [x] No TypeScript errors
- [x] No console errors

## Files Modified

**Backend:**

- `server/src/models/SearchAd.ts`
- `server/src/controllers/propertyController.ts`
- `server/src/controllers/searchAdController.ts`

**Frontend:**

- `client/app/home/page.tsx`
- `client/types/searchAd.ts`
- `client/lib/api/propertyApi.ts`

**New Files:**

- `client/components/ui/LocationSearchInput.tsx`
- `client/lib/utils/cityPostalCodeData.ts`

## Notes

- Component is fully reusable - can be used on other pages (search ads page, property search, etc.)
- Data structure supports both single and multiple locations
- Graceful handling of special filters ("Toute la France", "Autour de moi")
- LocalStorage used for user convenience (previous searches)
- Clean separation of concerns (data, UI, logic)
