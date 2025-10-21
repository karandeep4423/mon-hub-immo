# French Address API Autocomplete Integration

## Overview

Integrated French Address API autocomplete across all location input fields in the application, providing real-time city suggestions as users type. This ensures accurate geocoding data and improves user experience.

## Components Created

### 1. `CityAutocomplete.tsx`

**Purpose**: Single city selection with autocomplete  
**Used in**: Property creation/edit forms

**Features**:

- Real-time city suggestions as user types
- Auto-fills postal code when city is selected
- Shows city name, postal code, and context (department/region)
- Debounced API calls (300ms) to minimize requests
- Loading spinner during API calls
- Dropdown closes on outside click

**Props**:

```typescript
{
  value: string;              // Current city name
  onCitySelect: (city: string, postalCode: string) => void;
  placeholder?: string;       // Input placeholder
  className?: string;         // Additional CSS classes
  error?: string;             // Validation error message
  label?: string;             // Field label
  required?: boolean;         // Required field indicator
}
```

**Usage Example**:

```tsx
<CityAutocomplete
  value={formData.city}
  onCitySelect={(city, postalCode) => {
    setCity(city);
    setPostalCode(postalCode);
  }}
  label="Ville"
  placeholder="Ex: Paris, Lyon, Marseille..."
  required
/>
```

### 2. `MultiCityAutocomplete.tsx`

**Purpose**: Multiple city selection with autocomplete  
**Used in**: Search ad creation/edit forms

**Features**:

- Select multiple cities with autocomplete
- Shows selected cities as removable tags
- Prevents duplicate selections
- Returns comma-separated string of cities
- Visual tag display with "X" remove buttons
- Filters out already-selected cities from suggestions

**Props**:

```typescript
{
  value: string;              // Comma-separated city names
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  label?: string;
  required?: boolean;
}
```

**Usage Example**:

```tsx
<MultiCityAutocomplete
  value={formData.cities}
  onChange={(value) => setCities(value)}
  label="Ville(s), quartier(s) ciblé(s)"
  placeholder="Tapez pour rechercher des villes..."
  required
/>
```

## Integration Points

### Property Form (`PropertyForm.tsx`)

**Before**:

```tsx
<Input
  type="text"
  value={formData.city}
  onChange={(e) => handleInputChange('city', e.target.value)}
  placeholder="Paris"
/>
<Input
  type="text"
  value={formData.postalCode}
  onChange={(e) => handleInputChange('postalCode', e.target.value)}
  placeholder="75001"
/>
```

**After**:

```tsx
<CityAutocomplete
  value={formData.city}
  onCitySelect={(city, postalCode) => {
    handleInputChange('city', city);
    handleInputChange('postalCode', postalCode);
  }}
  label="Ville"
  required
/>
<Input
  type="text"
  value={formData.postalCode}
  placeholder="75001"
  disabled  // Auto-filled from city selection
/>
```

**Benefits**:

- ✅ Autocomplete city names with real data
- ✅ Auto-fills postal code (no manual entry needed)
- ✅ Ensures valid French cities
- ✅ Provides accurate geocoding data for map features

### Search Ad Form (`CreateSearchAdForm.tsx`)

**Before**:

```tsx
<input
  type="text"
  value={formData.cities}
  onChange={handleInputChange}
  placeholder="Paris 15e, Boulogne-Billancourt, Issy-les-Moulineaux"
/>
```

**After**:

```tsx
<MultiCityAutocomplete
  value={formData.cities}
  onChange={(value) => setFormData((prev) => ({ ...prev, cities: value }))}
  label="Ville(s), quartier(s) ciblé(s)"
  placeholder="Tapez pour rechercher des villes..."
  required
/>
```

**Benefits**:

- ✅ Select multiple cities with visual tags
- ✅ Autocomplete each city individually
- ✅ Remove cities easily with click
- ✅ Prevents typos and invalid city names

### Profile Completion Form (`ProfileCompletion.tsx`)

**Before**:

```tsx
<Input
  label="Code postal"
  name="postalCode"
  value={formData.postalCode}
  onChange={handleChange}
  placeholder="22100"
/>
<Input
  label="Ville principale"
  name="city"
  value={formData.city}
  onChange={handleChange}
  placeholder="Caen"
/>
```

**After**:

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
  name="postalCode"
  value={formData.postalCode}
  disabled
/>
```

**Benefits**:

- ✅ Sets agent's default city for "Mon secteur" feature
- ✅ Ensures accurate city data during signup
- ✅ Auto-fills postal code for professional profile

### Agent Filters (`AgentFilters.tsx`)

**Before**:

```tsx
<input
  type="text"
  value={filters.city}
  onChange={(e) => handleChange('city', e.target.value)}
  placeholder="Ex: Paris, Lyon..."
/>
<input
  type="text"
  value={filters.postalCode}
  onChange={(e) => handleChange('postalCode', e.target.value)}
  placeholder="Ex: 75001"
  maxLength={5}
/>
```

**After**:

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

**Benefits**:

- ✅ Accurate agent filtering by city
- ✅ Better appointment booking experience
- ✅ Prevents search errors from typos

## Technical Details

### API Integration

Both components use the existing `searchMunicipalities` function from `frenchAddressApi.ts`:

```typescript
import { searchMunicipalities } from "@/lib/services/frenchAddressApi";

// Fetches city suggestions
const municipalities = await searchMunicipalities(inputValue, 8);
```

**API Response**:

```typescript
{
  name: "Paris",
  postcode: "75001",
  citycode: "75101",
  coordinates: { lat: 48.8566, lon: 2.3522 },
  context: "75, Paris, Île-de-France"
}
```

### Performance Optimizations

1. **Debouncing**: 300ms delay before API calls

   ```typescript
   const debounceTimer = setTimeout(fetchSuggestions, 300);
   ```

2. **Minimum Length**: City names require 2+ characters

   ```typescript
   if (!trimmedInput || trimmedInput.length < 2) {
     setSuggestions([]);
     return;
   }
   ```

3. **Limit Results**: Maximum 8 suggestions shown

   ```typescript
   const municipalities = await searchMunicipalities(inputValue, 8);
   ```

4. **Outside Click Detection**: Dropdown closes automatically
   ```typescript
   useEffect(() => {
     const handleClickOutside = (event: MouseEvent) => {
       if (!dropdownRef.current?.contains(event.target)) {
         setShowDropdown(false);
       }
     };
     document.addEventListener("mousedown", handleClickOutside);
     return () => document.removeEventListener("mousedown", handleClickOutside);
   }, []);
   ```

## User Experience Flow

### Single City Selection (Property Form)

1. User clicks "Ville" input
2. Types "Par..." → API fetches cities matching "Par"
3. Dropdown shows: Paris (75001), Paray-le-Monial (71600), etc.
4. User clicks "Paris (75001)"
5. City field = "Paris"
6. Postal code field auto-fills = "75001"
7. Geocoding data stored for map features

### Multiple City Selection (Search Ad Form)

1. User types "Par..." in city search
2. Dropdown shows Paris options
3. User clicks "Paris (75015)"
4. Tag appears: [Paris (75015) ✕]
5. User continues typing "Lyo..."
6. Dropdown shows Lyon options
7. User clicks "Lyon (69001)"
8. Tags show: [Paris (75015) ✕] [Lyon (69001) ✕]
9. Form value = "Paris (75015), Lyon (69001)"

## Benefits

### For Users

- ✅ **Faster input**: No need to manually type postal codes
- ✅ **Fewer errors**: Only valid French cities selectable
- ✅ **Visual feedback**: See selected cities as tags
- ✅ **Easy correction**: Remove wrong cities with one click
- ✅ **Context info**: See department/region for each city

### For Developers

- ✅ **Consistent data**: All cities from official French API
- ✅ **Better geocoding**: Accurate coordinates for map features
- ✅ **Reusable components**: Can be used in any form
- ✅ **Type-safe**: Full TypeScript support
- ✅ **Maintained API**: Uses government-maintained data source

### For the Application

- ✅ **Improved "Mon secteur" feature**: Better city matching
- ✅ **Accurate radius search**: Reliable coordinates
- ✅ **Better search results**: Consistent city names
- ✅ **Map integration**: Ready for future map features

## Future Enhancements

- [ ] Add neighborhood/district autocomplete (use `type: 'locality'`)
- [ ] Add address autocomplete for property forms
- [ ] Cache frequent searches to reduce API calls
- [ ] Add "recent searches" feature
- [ ] Support international addresses (expand beyond France)

## Related Features

- [Agent Registered City Default Filter](./agent-registered-city-default-filter.md)
- [Mon Secteur Feature](./geolocation-mon-secteur-feature.md)
- [Location Search with Radius](./location-search-postal-code-feature.md)
- [Enhanced Geolocation](./enhanced-geolocation-feature.md)

---

**Implementation Date**: October 19, 2025  
**Status**: ✅ Completed  
**Components**: `CityAutocomplete`, `MultiCityAutocomplete`  
**Forms Updated**:

- Property Form (property creation/editing)
- Search Ad Create Form (search ad creation)
- Search Ad Edit Form (search ad editing)
- Profile Completion Form (agent signup)
- Agent Filters (appointment booking)

**API**: French Address API (api-adresse.data.gouv.fr)
