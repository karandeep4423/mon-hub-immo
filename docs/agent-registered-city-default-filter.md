# Agent Registered City Default Filter Feature

## Overview

Automatically activates the "Mon secteur" filter for agents when they visit the home page, displaying listings from their registered city and nearby areas without pre-filling the search bar, maintaining a clean UI and intuitive user experience.

## Feature Details

### Auto-Activation Behavior

1. **Initial Page Load**

   - When an agent logs in and visits the home page
   - System automatically activates "Mon secteur" button
   - Displays listings from their registered city + nearby cities (50km radius)
   - **Location search bar remains empty** for manual searches

2. **User Types**

   - **Agents only**: Feature applies only to users with `userType === 'agent'`
   - **Apporteurs**: Not affected (no profile completion with city data)

3. **Content Filtered**
   - ✅ Properties (biens immobiliers)
   - ✅ Search Ads (demandes de recherche)
   - Both types filtered simultaneously

### Technical Implementation

#### Frontend Changes (`client/app/home/page.tsx`)

1. **New State**

```typescript
const [isInitialLoad, setIsInitialLoad] = useState(true);
```

2. **Auto-Activate Effect**

```typescript
useEffect(() => {
  if (!user || !isInitialLoad) return;
  if (user.userType !== "agent") return;

  const city = user.professionalInfo?.city;
  const postalCode = user.professionalInfo?.postalCode;

  if (!city || !postalCode) return;

  // Auto-select "Mon secteur" filter
  setContentFilter("myArea");
  setIsInitialLoad(false);
}, [user, isInitialLoad]);
```

3. **Data Flow**
   - Reads city from `user.professionalInfo.city` (set during profile completion)
   - Auto-selects `contentFilter = 'myArea'`
   - Uses **French Address API geocoding**:
     1. Searches for agent's city to get exact coordinates
     2. Uses `getMunicipalitiesNearby(lat, lon, 50)` to find all cities within 50km radius
     3. Filters properties/search ads by matching postal codes or city names
   - Location search bar remains **empty** for flexibility

### User Experience

#### Default View (Agent)

1. Agent logs in and visits home page
2. "Mon secteur" button is **auto-selected** (highlighted in cyan)
3. Location search bar is **empty** (not pre-filled)
4. Listings shown are from registered city + nearby areas (50km radius)
5. Agent can:
   - Click "Tout" to see all posts across France
   - Use location search to find specific cities
   - Click "Biens à vendre" or "Recherche de biens" for specific content
   - Click "Favoris" to see saved items

#### Example Flow

```
Agent Profile:
- City: "Caen"
- Postal Code: "14000"

Home Page Auto-Loads:
- "Mon secteur (1 villes)" button: ✅ ACTIVE (cyan highlight)
- Location Filter: [ empty ] (ready for manual search)
- Posts Shown: All properties & search ads from Caen + nearby cities
- Agent sees count: "Mon secteur (X villes)" based on postal prefix
```

### Integration with Existing Features

✅ **Compatible with:**

- Mon secteur button (auto-activated by default)
- Geolocation feature (if user allows, can override)
- Manual location search (search bar remains empty)
- Content filters (properties, search ads, favorites)
- "Tout" button to see all posts

✅ **Does NOT:**

- Pre-fill the location search bar ❌
- Lock the agent into their city ❌
- Prevent searching other cities ❌
- Conflict with other filters ❌

### Validation Rules

1. **City must exist**: Agent must have completed profile with city field
2. **Agent only**: Only applies to `userType === 'agent'`
3. **One-time activation**: Auto-activates only on initial page visit (controlled by `isInitialLoad` flag)
4. **Graceful fallback**: If city not found, shows "Tout" filter (all posts)

## User Stories

### Agent - First Login

> "As an agent registered in Caen, when I log in and visit the home page, I want to automatically see listings from Caen and nearby areas with 'Mon secteur' activated, while keeping the search bar empty so I can still search other cities easily."

### Agent - Manual Override

> "As an agent, after seeing my 'Mon secteur' listings, I want to click 'Tout' to see all posts across France, or use the location search to find specific cities."

### Agent - Geolocation Integration

> "As an agent who travels, I want to allow geolocation to see posts near my current location, which can work alongside my registered city's 'Mon secteur' filter."

## Benefits

1. **Clean UI**: Search bar remains empty, not cluttered with pre-filled city
2. **Personalized Experience**: Agents see relevant local listings immediately via "Mon secteur"
3. **Time Saving**: No need to manually click "Mon secteur" every visit
4. **Better Discovery**: Shows nearby opportunities based on postal code prefix
5. **Flexible**: Agent can easily click "Tout" or use location search
6. **Non-intrusive**: Doesn't prevent access to all posts if needed

## Future Enhancements

- [ ] Remember user's last selected filter preference (across sessions)
- [ ] Allow agents to set multiple "preferred cities" in profile
- [ ] Add notification when new posts appear in "Mon secteur" area
- [ ] Analytics: Track which filters agents use most frequently

## Related Features

- [Geolocation Feature](./enhanced-geolocation-feature.md)
- [Mon Secteur Feature](./geolocation-mon-secteur-feature.md)
- [Profile Completion](./dashboard-professional-info-and-stats.md)
- [Location Search](./location-search-postal-code-feature.md)

---

**Implementation Date**: October 19, 2025  
**Status**: ✅ Completed  
**User Types**: Agents only  
**Applies To**: Home page listings (properties + search ads)
