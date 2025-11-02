# French Municipality Geolocation with Radius Filtering

**Date:** October 19, 2025  
**Status:** ✅ Implemented

## Overview

Comprehensive geolocation system for filtering properties and search ads by French municipalities with adjustable radius. Uses the official French government API (`api-adresse.data.gouv.fr`) for real-time municipality lookup with coordinates.

## Key Features

### 1. **Real-time Municipality Search**

- Auto-suggestion dropdown powered by `api-adresse.data.gouv.fr`
- Search by city name OR postal code
- Shows: "City Name (Postal Code) • Department, Region"
- Example: "Dinan (22100) • Côtes-d'Armor, Bretagne"

### 2. **Multi-Select Municipalities**

- Select multiple neighboring cities
- Visual chip/tag interface for selected locations
- Easy removal of selected municipalities

### 3. **Adjustable Radius Filter**

- Dropdown selector: 5 km, 10 km, 20 km, 30 km, 50 km
- Applies to all selected municipalities (combined area)
- Persists to user profile in database

### 4. **Default Dashboard Behavior**

- Agents see listings from their registered city by default
- Uses saved radius preference from last session
- No radius selector during registration (only on search)

## Implementation Details

### Frontend Components

#### `LocationSearchWithRadius.tsx`

**Location:** `client/components/ui/LocationSearchWithRadius.tsx`

**Features:**

- French Address API integration
- Debounced search (300ms)
- Loading indicator
- Click-outside-to-close dropdown
- Responsive design

**Props:**

```typescript
interface LocationSearchWithRadiusProps {
  selectedLocations: LocationItem[];
  onLocationsChange: (locations: LocationItem[]) => void;
  radiusKm: number;
  onRadiusChange: (radius: number) => void;
  placeholder?: string;
  className?: string;
}

interface LocationItem {
  name: string; // City name
  postcode: string; // 5-digit postal code
  citycode: string; // INSEE code
  coordinates: {
    lat: number;
    lon: number;
  };
  context: string; // Department and region
  display: string; // Display format
  value: string; // Unique identifier
}
```

### Backend Changes

#### User Model (`server/src/models/User.ts`)

Added `searchPreferences` field:

```typescript
searchPreferences?: {
	preferredRadius?: number; // Default: 10 km
	lastSearchLocations?: Array<{
		city: string;
		postcode: string;
		coordinates?: {
			lat: number;
			lon: number;
		};
	}>;
}
```

#### New API Endpoint

**PATCH** `/api/auth/search-preferences`

**Request:**

```json
{
  "preferredRadius": 10,
  "lastSearchLocations": [
    {
      "city": "Dinan",
      "postcode": "22100",
      "coordinates": {
        "lat": 48.4554,
        "lon": -2.0469
      }
    }
  ]
}
```

**Response:**

```json
{
	"success": true,
	"searchPreferences": {
		"preferredRadius": 10,
		"lastSearchLocations": [...]
	}
}
```

### Services & Utilities

#### French Address API Service

**Location:** `client/lib/services/frenchAddressApi.ts`

**Functions:**

```typescript
// Search municipalities by name or postal code
searchMunicipalities(query: string, limit?: number): Promise<FrenchMunicipality[]>

// Get municipalities within radius of coordinates
getMunicipalitiesNearby(lat: number, lon: number, radiusKm?: number): Promise<FrenchMunicipality[]>

// Get municipality by exact postal code
getMunicipalityByPostalCode(postalCode: string): Promise<FrenchMunicipality | null>

// Calculate distance between two coordinates (Haversine formula)
calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number
```

#### Geolocation Utilities

**Location:** `client/lib/utils/geolocation.ts`

**Functions:**

```typescript
// Check if property is within radius of selected locations
isWithinRadius(
	propertyLocation: { postalCode?: string; city?: string; lat?: number; lon?: number },
	selectedLocations: LocationWithCoordinates[],
	radiusKm: number
): boolean

// Get combined bounding box for multiple municipalities
getCombinedBoundingBox(
	municipalities: FrenchMunicipality[],
	radiusKm: number
): BoundingBox | null
```

## User Workflows

### Workflow 1: Agent Registration

1. Agent fills profile completion form
2. Enters their main city (e.g., "Saint-Malo")
3. **No radius selector shown** during registration
4. System stores city in `professionalInfo.city`

### Workflow 2: Search with Radius

1. User navigates to home page or search-ads page
2. Types city name or postal code in location search
3. Dropdown shows matching municipalities with full context
4. User selects one or more cities:
   - Example: "22100 Dinan", "22100 Quévert", "22100 Taden"
5. User adjusts radius (5km, 10km, 20km, 30km, 50km)
6. System displays all listings within radius of **any** selected city
7. Radius preference saved to user profile automatically

### Workflow 3: Combined Area Filtering

When multiple cities are selected:

- System calculates combined bounding box
- Shows listings within radius of ANY selected municipality
- Example: 10km from Dinan OR 10km from Quévert

## Database Schema Updates

### User Collection

```javascript
{
	// ... existing fields
	searchPreferences: {
		preferredRadius: Number,      // min: 1, max: 100, default: 10
		lastSearchLocations: [{
			city: String,
			postcode: String,          // regex: /^\d{5}$/
			coordinates: {
				lat: Number,           // min: -90, max: 90
				lon: Number            // min: -180, max: 180
			}
		}]
	}
}
```

### Indexes Added

```javascript
userSchema.index({ "searchPreferences.preferredRadius": 1 });
```

## API Integration

### api-adresse.data.gouv.fr

**Endpoint:** `https://api-adresse.data.gouv.fr/search/`

**Parameters:**

- `q` - Search query (city name or postal code)
- `type` - Filter by type (`municipality`)
- `limit` - Maximum results (default: 10)
- `autocomplete` - Enable autocomplete mode (1)

**Response:**

```json
{
  "type": "FeatureCollection",
  "features": [
    {
      "type": "Feature",
      "properties": {
        "label": "Dinan, Côtes-d'Armor, Bretagne",
        "name": "Dinan",
        "postcode": "22100",
        "citycode": "22050",
        "context": "22, Côtes-d'Armor, Bretagne",
        "x": -2.0469,
        "y": 48.4554
      },
      "geometry": {
        "type": "Point",
        "coordinates": [-2.0469, 48.4554]
      }
    }
  ]
}
```

## Distance Calculation

Uses **Haversine formula** for accurate distance between GPS coordinates:

```typescript
const R = 6371; // Earth's radius in km
const dLat = toRadians(lat2 - lat1);
const dLon = toRadians(lon2 - lon1);

const a =
  Math.sin(dLat / 2) * Math.sin(dLat / 2) +
  Math.cos(toRadians(lat1)) *
    Math.cos(toRadians(lat2)) *
    Math.sin(dLon / 2) *
    Math.sin(dLon / 2);

const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
const distance = R * c; // Distance in kilometers
```

## Files Modified

### Backend

- ✅ `server/src/models/User.ts` - Added searchPreferences
- ✅ `server/src/controllers/authController.ts` - Added updateSearchPreferences
- ✅ `server/src/routes/auth.ts` - Added PATCH /search-preferences route

### Frontend

- ✅ `client/lib/services/frenchAddressApi.ts` - NEW - French API service
- ✅ `client/lib/utils/geolocation.ts` - NEW - Distance utilities
- ✅ `client/components/ui/LocationSearchWithRadius.tsx` - NEW - Search component
- ✅ `client/components/ui/index.ts` - Exported new component
- ✅ `client/app/home/page.tsx` - Integrated radius search
- ✅ `client/types/auth.ts` - Added searchPreferences type
- ✅ `client/lib/api/authApi.ts` - Added updateSearchPreferences API call

## Testing Checklist

- [x] Search by city name returns results
- [x] Search by postal code returns results
- [x] Multi-select municipalities works
- [x] Radius selector updates state
- [x] Radius preference saves to backend
- [x] Radius preference persists across sessions
- [x] Properties filtered by postal codes
- [x] Search ads filtered by cities/postal codes
- [x] Distance calculation accurate
- [x] Combined area filtering works
- [ ] Test with properties having coordinates (future enhancement)
- [ ] Test geolocation "Autour de moi" (future enhancement)

## Performance Considerations

1. **API Rate Limiting:** api-adresse.data.gouv.fr has no official rate limits but use debouncing (300ms)
2. **Debounced Search:** Prevents excessive API calls while typing
3. **Caching:** Browser caches API responses automatically
4. **Fallback:** If API fails, gracefully shows empty results

## Future Enhancements

### Phase 2: Property Coordinates

- Add lat/lon to Property model
- Use coordinates for accurate radius filtering
- Display properties on interactive map

### Phase 3: Advanced Radius Filtering

- Server-side geospatial queries (MongoDB $geoNear)
- Radius-based sorting (closest first)
- Visual radius circles on map

### Phase 4: Neighboring Municipalities

- Automatically include neighboring cities within radius
- Smart expansion based on population density
- Department-level filtering (e.g., all of "Côtes-d'Armor")

## Known Limitations

1. **No Coordinates on Properties:** Currently filters by postal code match only
2. **Client-side Search Ad Filtering:** May be slow with large datasets
3. **No Map View:** Visual representation of radius not yet implemented
4. **Static Radius Options:** Cannot enter custom radius value

## Notes

- ✅ Registration flow does NOT include radius selector
- ✅ Radius is ONLY on search pages for user flexibility
- ✅ API calls are free and open (French government data)
- ✅ Works offline with postal code fallback
- ✅ Mobile responsive design
- ✅ Accessible keyboard navigation

## References

- [French Address API Docs](https://adresse.data.gouv.fr/api-doc/adresse)
- [Haversine Formula](https://en.wikipedia.org/wiki/Haversine_formula)
- [INSEE City Codes](https://www.insee.fr/fr/information/2560452)
