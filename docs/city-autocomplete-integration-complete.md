# City Autocomplete Integration - Complete Implementation

## Overview

Complete integration of French Address API autocomplete components across all forms requiring city/address inputs in the MonHubImmo platform.

## Components Created

### 1. `AddressAutocomplete` (`client/components/ui/AddressAutocomplete.tsx`)

**Purpose**: Full street address autocomplete for property forms

**Features**:

- Real-time autocomplete for complete addresses (street + number)
- Auto-fills address, city, and postal code simultaneously
- Shows full address with context (department/region)
- 300ms debounce for API calls
- Minimum 3 characters before search
- Keyboard navigation support
- Loading states
- Returns geocoding coordinates

**Props**:

```typescript
{
  label?: string;
  value: string;
  onAddressSelect: (
    address: string,
    city: string,
    postalCode: string,
    coordinates?: { lat: number; lon: number }
  ) => void;
  placeholder?: string;
  error?: string;
  required?: boolean;
}
```

### 2. `CityAutocomplete` (`client/components/ui/CityAutocomplete.tsx`)

**Purpose**: Single city selection with autocomplete for forms requiring one city

**Features**:

- Real-time autocomplete using French Address API
- Auto-fills postal code when city selected
- Shows city name, postal code, and context (department/region)
- 300ms debounce for API calls
- Minimum 2 characters before search
- Keyboard navigation support
- Loading states

**Props**:

```typescript
{
  label: string;
  value: string;
  onCitySelect: (cityName: string, postalCode: string) => void;
  placeholder?: string;
  error?: string;
}
```

### 3. `MultiCityAutocomplete` (`client/components/ui/MultiCityAutocomplete.tsx`)

**Purpose**: Multiple city selection with visual tags for search ads

**Features**:

- Add multiple cities one by one
- Visual tags showing selected cities with remove buttons
- Prevents duplicate city selections
- Returns comma-separated string of cities
- All features from CityAutocomplete

**Props**:

```typescript
{
  label: string;
  value: string; // Comma-separated cities
  onChange: (value: string) => void;
  placeholder?: string;
}
```

## Integration Points

### ✅ 1. Property Form (`client/components/property/PropertyForm.tsx`)

**Use Case**: Property creation and editing

**Implementation**:

```tsx
{
  /* Full address autocomplete */
}
<AddressAutocomplete
  label="Adresse"
  value={formData.address || ""}
  onAddressSelect={(address, city, postalCode, coordinates) => {
    handleInputChange("address", address);
    handleInputChange("city", city);
    handleInputChange("postalCode", postalCode);
    // coordinates available for map features
  }}
  placeholder="Rechercher une adresse..."
  required
/>;

{
  /* City autocomplete (fallback/override) */
}
<CityAutocomplete
  label="Ville"
  value={formData.city}
  onCitySelect={(cityName, postalCode) => {
    handleInputChange("city", cityName);
    handleInputChange("postalCode", postalCode);
  }}
  placeholder="Ex: Paris, Lyon, Marseille..."
  required
/>;

{
  /* Postal code (auto-filled and disabled) */
}
<Input label="Code postal" value={formData.postalCode} disabled />;
```

**Impact**:

- Complete street addresses with autocomplete (e.g., "8 Boulevard du Port")
- Auto-fills address, city, and postal code simultaneously
- Provides geocoding coordinates for map features
- User can still override city if needed

---

### ✅ 2. Search Ad Create Form (`client/components/search-ads/CreateSearchAdForm.tsx`)

**Use Case**: Creating new search ads with multiple target cities

**Implementation**:

```tsx
<MultiCityAutocomplete
  label="Ville(s), quartier(s) ciblé(s) *"
  value={formData.cities}
  onChange={(value) => setFormData((prev) => ({ ...prev, cities: value }))}
  placeholder="Rechercher et ajouter des villes..."
/>
```

**Impact**: Better search ad targeting, visual feedback for selected cities

---

### ✅ 3. Search Ad Edit Form (`client/components/search-ads/EditSearchAdForm.tsx`)

**Use Case**: Editing existing search ads

**Implementation**:

```tsx
<MultiCityAutocomplete
  label="Ville(s), quartier(s) ciblé(s) *"
  value={formData.cities}
  onChange={(value) => setFormData((prev) => ({ ...prev, cities: value }))}
  placeholder="Rechercher et ajouter des villes..."
/>
```

**Impact**: Consistent UX between create and edit flows

---

### ✅ 4. Profile Completion Form (`client/components/auth/ProfileCompletion.tsx`)

**Use Case**: Agent signup - setting default city for "Mon secteur" feature

**Implementation**:

```tsx
<CityAutocomplete
  label="Ville principale"
  value={formData.city}
  onCitySelect={(cityName, postalCode) => {
    handleChange({ target: { name: 'city', value: cityName } });
    handleChange({ target: { name: 'postalCode', value: postalCode } });
  }}
  placeholder="Rechercher une ville..."
/>

<Input
  label="Code postal"
  value={formData.postalCode}
  disabled
/>
```

**Impact**:

- **Critical**: This sets the agent's default city used for "Mon secteur" auto-activation
- Ensures accurate city data from the start
- Better coordinate-based radius search

---

### ✅ 5. Agent Filters (`client/components/appointments/AgentFilters.tsx`)

**Use Case**: Filtering agents by city when booking appointments

**Implementation**:

```tsx
<CityAutocomplete
  label="Ville"
  value={filters.city}
  onCitySelect={(cityName, postalCode) => {
    handleChange('city', cityName);
    handleChange('postalCode', postalCode);
  }}
  placeholder="Ex: Paris, Lyon..."
/>

<input
  type="text"
  value={filters.postalCode}
  disabled
/>
```

**Impact**: Accurate agent filtering, better appointment booking experience

---

## Technical Architecture

### API Service Layer

**File**: `client/lib/services/frenchAddressApi.ts`

**Key Function**:

```typescript
export async function searchMunicipalities(
  query: string,
  limit: number = 8
): Promise<LocationItem[]>;
```

**API Endpoint**: `https://api-adresse.data.gouv.fr/search/`

**Response Format**:

```typescript
{
  name: "Paris",
  postcode: "75001",
  citycode: "75101",
  coordinates: { lat: 48.8566, lon: 2.3522 },
  context: "75, Paris, Île-de-France"
}
```

### State Management Pattern

**Single City**:

```typescript
const [formData, setFormData] = useState({
  city: '',
  postalCode: ''
});

// On city select, update both fields
onCitySelect={(cityName, postalCode) => {
  setFormData(prev => ({
    ...prev,
    city: cityName,
    postalCode: postalCode
  }));
}}
```

**Multiple Cities**:

```typescript
const [formData, setFormData] = useState({
  cities: '' // Comma-separated string
});

// On change, update cities string
onChange={(value) => {
  setFormData(prev => ({ ...prev, cities: value }));
}}
```

## User Experience

### Single City Flow (Property/Profile/Filters)

1. User clicks city input field
2. User types "Par..." (2+ characters)
3. API fetches matching cities (debounced 300ms)
4. Dropdown shows: "Paris (75001)", "Paray-le-Monial (71600)", etc.
5. User clicks "Paris (75001)"
6. City field updates to "Paris"
7. Postal code field auto-fills to "75001" and becomes disabled
8. Geocoding coordinates stored for backend

### Multiple City Flow (Search Ads)

1. User types "Par..." in search input
2. Dropdown shows Paris options
3. User clicks "Paris (75015)"
4. Visual tag appears: `[Paris (75015) ✕]`
5. Input clears, ready for next city
6. User types "Lyo..."
7. User clicks "Lyon (69001)"
8. Tags show: `[Paris (75015) ✕] [Lyon (69001) ✕]`
9. Form stores: "Paris (75015), Lyon (69001)"
10. User can remove tags by clicking ✕

## Benefits

### For Users

- ✅ **Faster**: No manual postal code entry
- ✅ **Accurate**: Only valid French cities
- ✅ **Visual**: See selected cities as tags (search ads)
- ✅ **Easy correction**: Remove wrong selections easily
- ✅ **Context**: See department/region info

### For Developers

- ✅ **Consistent**: Same data source across all forms
- ✅ **Reusable**: Two components cover all use cases
- ✅ **Type-safe**: Full TypeScript support
- ✅ **Maintained**: Uses government API

### For Application

- ✅ **Better "Mon secteur"**: Accurate coordinate-based filtering
- ✅ **Improved search**: Consistent city names
- ✅ **Better geocoding**: Reliable coordinates for maps
- ✅ **Data quality**: Validated French cities only

## Connection to "Mon Secteur" Feature

The ProfileCompletion integration is **critical** for the "Mon secteur" feature:

1. **During Signup**: Agent selects their main city using CityAutocomplete
2. **Data Stored**: City name, postal code, and coordinates saved to `user.professionalInfo`
3. **On Dashboard Load**: Agent's city coordinates used to fetch nearby cities (50km radius)
4. **Auto-Activation**: "Mon secteur" button automatically activated showing properties/search ads from agent's area

**Before**: Postal code prefix matching → inaccurate results
**After**: Coordinate-based radius search → accurate 50km radius filtering

## Performance Optimizations

1. **Debouncing**: 300ms delay prevents excessive API calls
2. **Minimum Length**: 2+ characters required before search
3. **Result Limiting**: Maximum 8 suggestions shown
4. **Outside Click**: Dropdown auto-closes on click outside
5. **Loading States**: Visual feedback during API calls

## Export Pattern

Both components exported from `client/components/ui/index.ts`:

```typescript
export { CityAutocomplete } from "./CityAutocomplete";
export { MultiCityAutocomplete } from "./MultiCityAutocomplete";
```

**Usage**:

```typescript
import { CityAutocomplete, MultiCityAutocomplete } from "@/components/ui";
```

## Testing Checklist

### AddressAutocomplete

- [ ] Search for full address (e.g., "8 Boulevard du Port Amiens")
- [ ] Search for partial address (e.g., "8 Boul")
- [ ] Select address from dropdown
- [ ] Verify address, city, and postal code all auto-fill
- [ ] Verify postal code field becomes disabled
- [ ] Try keyboard navigation (arrow keys, enter)
- [ ] Click outside to close dropdown
- [ ] Test with special characters (e.g., "Rue de l'Église")
- [ ] Verify coordinates are logged (for future map features)

### CityAutocomplete

- [ ] Search for city name (e.g., "Paris")
- [ ] Search for partial name (e.g., "Par")
- [ ] Select city from dropdown
- [ ] Verify postal code auto-fills
- [ ] Verify postal code field becomes disabled
- [ ] Try keyboard navigation (arrow keys, enter)
- [ ] Click outside to close dropdown
- [ ] Test with special characters (e.g., "Saint-Denis")

### MultiCityAutocomplete

- [ ] Add first city
- [ ] Verify tag appears
- [ ] Add second city
- [ ] Verify both tags visible
- [ ] Remove city by clicking ✕
- [ ] Try adding duplicate city (should prevent)
- [ ] Verify comma-separated string format
- [ ] Test with many cities (5+)

### Forms Integration

- [ ] PropertyForm: Create property with city autocomplete
- [ ] CreateSearchAdForm: Create search ad with multiple cities
- [ ] EditSearchAdForm: Edit search ad cities
- [ ] ProfileCompletion: Complete agent profile with main city
- [ ] AgentFilters: Filter agents by city
- [ ] Verify all forms save data correctly
- [ ] Test form validation with autocomplete fields

### "Mon Secteur" Connection

- [ ] Complete agent signup with ProfileCompletion
- [ ] Verify city/postal code/coordinates saved
- [ ] Login and check dashboard
- [ ] Verify "Mon secteur" auto-activates
- [ ] Verify listings shown are within 50km radius
- [ ] Test with different cities (Paris, Lyon, Marseille)

## Future Enhancements

- [x] **Address Autocomplete**: ✅ Implemented with `AddressAutocomplete` component
- [ ] **Neighborhood Search**: Add `type: 'locality'` for districts
- [ ] **Caching**: Cache frequent searches locally
- [ ] **Recent Searches**: Show user's recent city/address searches
- [ ] **International Support**: Expand beyond France if needed
- [ ] **Map Preview**: Show selected addresses/cities on map
- [ ] **Bulk Import**: Import cities from CSV/list

## Related Documentation

- [French Address API Autocomplete](./french-address-api-autocomplete.md) - Component documentation
- [Agent Registered City Default Filter](./agent-registered-city-default-filter.md) - Mon secteur feature
- [Mon Secteur Feature](./geolocation-mon-secteur-feature.md) - Geolocation filtering
- [Location Search with Radius](./location-search-postal-code-feature.md) - Radius search
- [Enhanced Geolocation](./enhanced-geolocation-feature.md) - Coordinate-based features

## Migration Notes

### Breaking Changes

None - all changes are additive. Old input fields replaced with autocomplete components.

### Data Format

**Before**: City names entered manually (e.g., "paris", "PARIS", "Paris 15")
**After**: Standardized format from API (e.g., "Paris")

This improves data consistency but existing records remain unchanged.

### Backward Compatibility

- Existing city/postal code data works with new components
- Components accept any string value (not just API results)
- Autocomplete is enhancement, not requirement

---

**Implementation Date**: January 2025  
**Status**: ✅ **Complete** - All forms integrated including full address autocomplete  
**API**: French Address API (`api-adresse.data.gouv.fr`)  
**Components**: 3 (AddressAutocomplete, CityAutocomplete, MultiCityAutocomplete)  
**Forms Updated**: 5 (PropertyForm, CreateSearchAdForm, EditSearchAdForm, ProfileCompletion, AgentFilters)  
**Impact**: Improved data quality, better UX, accurate geolocation features, complete street address autocomplete
