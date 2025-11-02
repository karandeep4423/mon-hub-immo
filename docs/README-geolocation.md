# 🗺️ Municipality Geolocation & Radius Filter

## Quick Start

### For Users

1. **Search Page:**

   - Type a city name (e.g., "Dinan") or postal code (e.g., "22100")
   - Select one or more municipalities from dropdown
   - Adjust radius using dropdown (5km, 10km, 20km, 30km, 50km)
   - Results automatically filter

2. **Registration:**
   - Enter your main city during profile completion
   - No radius selection during signup
   - Radius can be adjusted later on search pages

### For Developers

#### Using the Component

```tsx
import { LocationSearchWithRadius } from "@/components/ui";
import type { LocationItem } from "@/components/ui/LocationSearchWithRadius";

function MyComponent() {
  const [locations, setLocations] = useState<LocationItem[]>([]);
  const [radius, setRadius] = useState(10);

  const handleRadiusChange = async (newRadius: number) => {
    setRadius(newRadius);
    // Save to backend if needed
    await authService.updateSearchPreferences({
      preferredRadius: newRadius,
    });
  };

  return (
    <LocationSearchWithRadius
      selectedLocations={locations}
      onLocationsChange={setLocations}
      radiusKm={radius}
      onRadiusChange={handleRadiusChange}
      placeholder="Ville ou code postal"
    />
  );
}
```

#### Using the API Service

```typescript
import {
  searchMunicipalities,
  calculateDistance,
} from "@/lib/services/frenchAddressApi";

// Search municipalities
const results = await searchMunicipalities("Dinan", 10);
// Returns: [{ name: 'Dinan', postcode: '22100', ... }]

// Calculate distance
const distance = calculateDistance(48.4554, -2.0469, 48.5, -2.1);
// Returns: distance in kilometers
```

## Architecture

```
┌─────────────────────────────────────────────────┐
│  UI: LocationSearchWithRadius Component         │
├─────────────────────────────────────────────────┤
│  Service: frenchAddressApi                      │
│  - searchMunicipalities()                       │
│  - getMunicipalityByPostalCode()                │
│  - calculateDistance()                          │
├─────────────────────────────────────────────────┤
│  External API: api-adresse.data.gouv.fr         │
│  - Real-time municipality data                  │
│  - GPS coordinates                              │
│  - Full context (department, region)            │
├─────────────────────────────────────────────────┤
│  Backend: User.searchPreferences                │
│  - preferredRadius (MongoDB)                    │
│  - lastSearchLocations (MongoDB)                │
└─────────────────────────────────────────────────┘
```

## Data Flow

1. **User types:** "Dinan"
2. **Component:** Debounces 300ms
3. **API call:** `searchMunicipalities('Dinan', 10)`
4. **French API:** Returns municipalities with coordinates
5. **Dropdown:** Shows "Dinan (22100) • Côtes-d'Armor, Bretagne"
6. **User selects:** Location added as chip
7. **Radius change:** Saves to backend via `updateSearchPreferences`
8. **Filtering:** Home page filters properties/ads by selected locations

## Features

✅ Real-time municipality search  
✅ Multi-select locations  
✅ Adjustable radius (5-50 km)  
✅ Persistent preferences  
✅ Combined area filtering  
✅ Mobile responsive  
✅ Accessibility support  
✅ TypeScript strict mode

## Configuration

### Radius Options

Edit `RADIUS_OPTIONS` in `LocationSearchWithRadius.tsx`:

```typescript
const RADIUS_OPTIONS = [5, 10, 20, 30, 50]; // km
```

### Default Radius

Set in user registration or modify:

```typescript
const [radiusKm, setRadiusKm] = useState(
  user?.searchPreferences?.preferredRadius || 10
);
```

## API Endpoints

### Frontend

```typescript
// French Address API (external)
GET https://api-adresse.data.gouv.fr/search/?q=Dinan&type=municipality
```

### Backend

```typescript
// Update search preferences
PATCH /api/auth/search-preferences
Body: {
	preferredRadius: 10,
	lastSearchLocations: [...]
}
```

## Examples

### Example 1: Search by City Name

```
Input: "Dinan"
Results:
- Dinan (22100) • Côtes-d'Armor, Bretagne
- Dinan-sur-Meuse (08600) • Ardennes, Grand Est
```

### Example 2: Search by Postal Code

```
Input: "22100"
Results:
- Dinan (22100) • Côtes-d'Armor, Bretagne
- Quévert (22100) • Côtes-d'Armor, Bretagne
- Taden (22100) • Côtes-d'Armor, Bretagne
```

### Example 3: Multi-Select with Radius

```
Selected:
- Dinan (22100)
- Quévert (22100)
Radius: 10 km

Shows: All properties within 10km of Dinan OR 10km of Quévert
```

## Troubleshooting

### API Not Returning Results

- Check network connection
- Verify API endpoint is accessible
- Ensure query is at least 2 characters
- Check browser console for errors

### Radius Not Saving

- Verify user is authenticated
- Check backend logs for errors
- Ensure MongoDB connection is active
- Verify `/auth/search-preferences` route exists

### Filtering Not Working

- Check that `selectedLocations` state is updating
- Verify postal codes match in database
- Ensure filtering logic handles empty arrays
- Check console for filtering errors

## Performance Tips

1. **Debouncing:** Already implemented (300ms)
2. **Limit Results:** Default limit is 10 results
3. **Cache:** Browser automatically caches API responses
4. **Pagination:** Consider for large result sets

## Testing

```bash
# Run tests
npm test

# Manual testing checklist
- [ ] Type city name → see results
- [ ] Type postal code → see results
- [ ] Select location → appears as chip
- [ ] Remove chip → location removed
- [ ] Change radius → updates state
- [ ] Radius persists → check after page reload
- [ ] Filter works → properties/ads filtered correctly
```

## Related Files

- `client/lib/services/frenchAddressApi.ts` - API integration
- `client/lib/utils/geolocation.ts` - Distance utilities
- `client/components/ui/LocationSearchWithRadius.tsx` - Main component
- `server/src/models/User.ts` - Database schema
- `docs/municipality-geolocation-radius-feature.md` - Full documentation

## License

This feature integrates with `api-adresse.data.gouv.fr`, which is provided by the French government under open license.

## Support

For questions or issues:

1. Check `docs/municipality-geolocation-radius-feature.md`
2. Review implementation in `client/app/home/page.tsx`
3. Check browser console for errors
4. Verify backend is running and accessible
