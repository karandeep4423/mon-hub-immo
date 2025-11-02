# Geolocation + "Mon secteur" Feature - Implementation Guide

## Overview

Implemented a dual-approach location-based filtering system combining GPS geolocation with a dedicated "Mon secteur" tab for registered city posts.

## Feature Components

### 1. **Geolocation Service** (`client/lib/services/geolocationService.ts`)

- `requestGeolocation()`: Requests user's GPS location via browser API
- `checkGeolocationPermission()`: Checks if permission already granted
- `setGeolocationPreference()` / `getGeolocationPreference()`: Stores user choice in localStorage

**Permissions:**

- "granted": Auto-request location
- "denied": Skip geolocation
- "prompt": Show custom permission modal

### 2. **Geolocation Prompt Component** (`client/components/ui/GeolocationPrompt.tsx`)

Beautiful modal asking for location permission with:

- Clear explanation of benefit
- "Autoriser" (Allow) button
- "Non merci" (Deny) button
- Error message display
- Privacy assurance text

### 3. **"Mon secteur" Tab**

New tab in home page showing posts from user's registered city + nearby cities (same postal code prefix).

**Tab Structure:**

- **Tout** - All posts (France-wide)
- **Mon secteur** - Posts from registered city area (only shown if user has `professionalInfo.city`)
- **Biens à vendre** - Properties for sale
- **Recherche de biens** - Search ads
- **Favoris** - Favorites

## User Flow

### First Visit (New User)

1. User logs in
2. System checks geolocation permission status
3. **If "prompt"**: Shows `GeolocationPrompt` modal
   - User clicks "Autoriser" → GPS location requested → Stored in state
   - User clicks "Non merci" → Preference saved, modal closes
4. **If "granted"**: Auto-requests location silently
5. **If "denied"**: Skips geolocation, uses fallback

### "Mon secteur" Tab Behavior

1. On page load, fetches all cities with same postal code prefix as user's registered city
2. Example: User registered in "Dinan (22100)" → Loads all 22XX cities
3. When user clicks "Mon secteur" tab:
   - Filters properties by postal codes matching those cities
   - Filters search ads by postal codes matching those cities
   - Shows count: "Mon secteur (X villes)"

### Search Override

- User can still use `LocationSearchWithRadius` to search any city
- When "Mon secteur" tab is active, manual search is disabled
- When "Tout" tab is active, manual search works normally

## Technical Implementation

### State Management (`client/app/home/page.tsx`)

```typescript
const [contentFilter, setContentFilter] = useState<ContentFilter>("all");
const [showGeolocationPrompt, setShowGeolocationPrompt] = useState(false);
const [geolocationError, setGeolocationError] = useState<string | null>(null);
const [userLocation, setUserLocation] = useState<{
  lat: number;
  lon: number;
} | null>(null);
const [myAreaLocations, setMyAreaLocations] = useState<LocationItem[]>([]);
```

### Effects

#### Load "Mon secteur" Locations

```typescript
useEffect(() => {
  const loadMyAreaLocations = async () => {
    if (!user) return;

    const city = user.professionalInfo?.city;
    const postalCode = user.professionalInfo?.postalCode;

    if (!city || !postalCode) return;

    // Fetch all cities with same postal prefix (4 digits)
    const nearbyCities = await getMunicipalitiesByPostalPrefix(postalCode, 50);

    setMyAreaLocations(locationItems);
  };

  loadMyAreaLocations();
}, [user]);
```

#### Check Geolocation Permission

```typescript
useEffect(() => {
  const checkAndPromptGeolocation = async () => {
    if (!user) return;

    const storedPref = getGeolocationPreference();
    if (storedPref) return; // User already decided

    const permission = await checkGeolocationPermission();

    if (permission === "prompt") {
      setShowGeolocationPrompt(true);
    } else if (permission === "granted") {
      handleRequestGeolocation();
    }
  };

  checkAndPromptGeolocation();
}, [user]);
```

### Filtering Logic

#### Properties Filter

```typescript
const filterProperties = (properties: Property[]): Property[] => {
  return properties.filter((property) => {
    // ... other filters ...

    // Filter by "Mon secteur" if active
    if (contentFilter === "myArea" && myAreaLocations.length > 0) {
      const myAreaPostalCodes = myAreaLocations.map((loc) => loc.postcode);
      if (
        !property.postalCode ||
        !myAreaPostalCodes.includes(property.postalCode)
      ) {
        return false;
      }
    }

    return true;
  });
};
```

#### Search Ads Filter

```typescript
const filterSearchAds = (searchAds: SearchAd[]): SearchAd[] => {
  return searchAds.filter((searchAd) => {
    // ... other filters ...

    // Filter by "Mon secteur" if active
    if (contentFilter === "myArea" && myAreaLocations.length > 0) {
      const myAreaPostalCodes = myAreaLocations.map((loc) => loc.postcode);
      const matchesMyArea =
        searchAd.location.postalCodes &&
        searchAd.location.postalCodes.some((pc) =>
          myAreaPostalCodes.includes(pc)
        );
      if (!matchesMyArea) return false;
    }

    // Don't apply manual location filters when "Mon secteur" is active
    if (selectedLocations.length > 0 && contentFilter !== "myArea") {
      // ... manual location filtering ...
    }

    return true;
  });
};
```

## Files Modified

### New Files

- ✅ `client/lib/services/geolocationService.ts` - Geolocation API wrapper
- ✅ `client/components/ui/GeolocationPrompt.tsx` - Permission modal
- ✅ `docs/geolocation-mon-secteur-feature.md` - This documentation

### Modified Files

- ✅ `client/app/home/page.tsx` - Added geolocation logic, "Mon secteur" tab, filters
- ✅ `client/components/ui/index.ts` - Exported `GeolocationPrompt`

## User Experience Benefits

### ✅ Clear Communication

- Permission modal explains why location is needed
- "Mon secteur" tab clearly labeled with city count
- No auto-filled search inputs (no confusion)

### ✅ Privacy Respecting

- User must explicitly allow location
- Choice is remembered in localStorage
- Can deny without losing functionality

### ✅ Flexible

- Works with or without geolocation
- "Mon secteur" always available (based on signup city)
- Can search any city manually

### ✅ Relevant Content

- "Mon secteur" shows local posts by default
- Based on postal code geography (nearby cities)
- 50km radius from registered city

## Testing Checklist

- [ ] First login → geolocation prompt appears
- [ ] Click "Autoriser" → GPS location requested
- [ ] Click "Non merci" → prompt closes, no error
- [ ] "Mon secteur" tab appears only if user has registered city
- [ ] "Mon secteur" filters show only matching postal codes
- [ ] Manual search still works on "Tout" tab
- [ ] Permission saved in localStorage (no repeat prompt)
- [ ] Works for both agents and apporteurs

## Console Logs for Debugging

```
[Geolocation] Requesting user location...
[Geolocation] Location granted: { lat: 48.xxx, lon: -2.xxx, accuracy: xxx }
[Geolocation] Permission status: granted | denied | prompt
[Home] Loading "Mon secteur" locations: Dinan 22100
[Home] "Mon secteur" locations loaded: 5
```

## Future Enhancements

1. **Use GPS location for proximity sorting** - Sort posts by distance from user's current location
2. **"Nearby Me" tab** - Show posts within X km of current GPS location (separate from "Mon secteur")
3. **Map view** - Display posts on interactive map with geolocation
4. **Travel mode** - Detect when user is far from registered city, suggest switching to GPS mode

---

**Status:** ✅ Fully Implemented
**Created:** October 19, 2025
**Version:** 1.0
