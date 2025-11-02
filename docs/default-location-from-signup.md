# Default Location from Signup - Feature Documentation

## Overview

Automatically filters posts on the home page based on the user's registered city during signup, showing relevant local content by default.

## Feature Implementation

### 1. **User Registration City**

- Uses existing fields: `user.professionalInfo.city` and `user.professionalInfo.postalCode`
- No new fields added - uses existing signup data
- Applies to both **agents** and **apporteurs**

### 2. **Default Location Loading**

When user lands on home page:

- Automatically fetches all cities with same postal code prefix (first 4 digits)
- Example: If user registered in "Dinan (22100)", it loads all 22XX cities
- Sets these as `selectedLocations` automatically
- Default radius: **50km**

### 3. **User Experience**

**On First Load:**

- ✅ Shows posts from registered city + nearby cities (same postal prefix)
- ✅ Default radius: 50km
- ✅ No manual selection needed

**User Can Override:**

- ✅ Use LocationSearchWithRadius to search other cities
- ✅ Can add cities from different areas (e.g., add Paris cities too)
- ✅ Adjust radius as needed (5km, 10km, 20km, 30km, 50km)

### 4. **Registration Flow**

- ❌ **NO radius selector during signup** (as requested)
- ✅ Only city selection during signup (existing field)
- ✅ Radius only appears on search/filter pages

## Technical Implementation

### Files Modified

#### `client/app/home/page.tsx`

- Added import: `getMunicipalitiesByPostalPrefix`
- Changed default radius: `useState(50)` instead of 10km
- Added state: `defaultLocationsLoaded` to prevent re-loading
- New effect: Loads default locations from `user.professionalInfo.city/postalCode`
- Logic: Fetches all cities with matching postal code prefix (4 digits)

### Key Logic

```typescript
// On component mount, check user's registered city
const city = user.professionalInfo?.city;
const postalCode = user.professionalInfo?.postalCode;

// Get all cities with same postal prefix (e.g., 2210* → all 2210X cities)
const nearbyCities = await getMunicipalitiesByPostalPrefix(postalCode, 50);

// Convert to LocationItem format and set as selected
setSelectedLocations(locationItems);
```

### API Calls

- Uses existing `getMunicipalitiesByPostalPrefix()` from `frenchAddressApi.ts`
- Fetches up to 50 cities with matching postal code prefix
- Client-side filtering by postal code

## User Flow Examples

### Example 1: Agent in Saint-Malo

1. Agent signs up with city: "Saint-Malo (35400)"
2. Lands on home page
3. Automatically sees posts from:
   - Saint-Malo (35400)
   - Cancale (35400)
   - All other 354XX cities
4. Within 50km radius
5. Can search "Paris" to add Paris cities if needed

### Example 2: Apporteur in Dinan

1. Apporteur signs up with city: "Dinan (22100)"
2. Lands on home page
3. Automatically sees posts from:
   - Dinan (22100)
   - Lanvallay (22100)
   - All other 221XX cities
4. Within 50km radius
5. Can adjust radius or search other cities

## Benefits

✅ Relevant local content by default
✅ No manual filtering needed on first visit
✅ Users see posts from their area immediately
✅ Still flexible - can search anywhere in France
✅ Respects postal code geography (nearby cities)

## Console Logging

Added debug logs to track:

- `[Home] Loading default location from user registration`
- `[Home] Found nearby cities: X`
- `[Home] Default locations loaded: X`

Check browser console (F12) to see the automatic loading process.

---

**Created:** October 19, 2025
**Status:** ✅ Implemented
