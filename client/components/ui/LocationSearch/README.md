# LocationSearch Component

**Consolidated location search component** that replaces three duplicate components:

- ~~LocationSearchInput.tsx~~ (313 lines) → **DEPRECATED**
- ~~UnifiedSearchBar.tsx~~ (346 lines) → **DEPRECATED**
- ~~SingleUnifiedSearch.tsx~~ (370 lines) → **DEPRECATED**

## Features

✅ **Single source of truth** - All location search logic in one place  
✅ **Shared localStorage hook** - `useLocationHistory` centralizes history management  
✅ **Three display variants** - Separate, unified, or inline modes  
✅ **Type-safe** - Shared types from `@/types/location`  
✅ **Consistent behavior** - No more duplicate logic

## Usage

### Variant 1: Separate Location Input (default)

```tsx
import { LocationSearch } from '@/components/ui';

<LocationSearch
	selectedLocations={locations}
	onLocationsChange={setLocations}
	placeholder="Enter a location"
/>;
```

### Variant 2: Unified Search Bar (separate inputs)

```tsx
import { UnifiedSearchBar } from '@/components/ui';

<UnifiedSearchBar
	searchTerm={search}
	onSearchChange={setSearch}
	selectedLocations={locations}
	onLocationsChange={setLocations}
/>;
```

### Variant 3: Single Inline Search (chips inside)

```tsx
import { SingleUnifiedSearch } from '@/components/ui';

<SingleUnifiedSearch
	searchTerm={search}
	onSearchChange={setSearch}
	selectedLocations={locations}
	onLocationsChange={setLocations}
/>;
```

## Migration Guide

### Old Code (LocationSearchInput)

```tsx
import { LocationSearchInput } from '@/components/ui/LocationSearchInput';
import type { LocationItem } from '@/components/ui/LocationSearchInput';

<LocationSearchInput ... />
```

### New Code

```tsx
import { LocationSearch } from '@/components/ui';
import type { LocationItem } from '@/types/location';

<LocationSearch ... />
```

### Old Code (UnifiedSearchBar)

```tsx
import { UnifiedSearchBar } from '@/components/ui/UnifiedSearchBar';
```

### New Code

```tsx
import { UnifiedSearchBar } from '@/components/ui';
// Same API, consolidated implementation
```

## Architecture

```
LocationSearch/
├── index.tsx              # Consolidated component with 3 variants
├── README.md              # This file

Supporting files:
├── hooks/useLocationHistory.ts    # Shared localStorage logic
└── types/location.ts              # Shared TypeScript types
```

## Benefits

| Metric                 | Before        | After       | Saved             |
| ---------------------- | ------------- | ----------- | ----------------- |
| **Lines of code**      | 1,029         | ~400        | **629 lines**     |
| **Components**         | 3             | 1           | **66% reduction** |
| **localStorage logic** | Duplicated 3x | Shared hook | **DRY compliant** |
| **Type definitions**   | Duplicated 3x | Centralized | **Type-safe**     |

## Next Steps

1. ✅ Component created and exported
2. ⏳ Migrate existing usages (search for old imports)
3. ⏳ Delete old component files once migration complete
