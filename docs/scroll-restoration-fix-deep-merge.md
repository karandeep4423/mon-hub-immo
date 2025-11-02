# Scroll Restoration Fix: Deep Merge for Nested State

## Problem Identified (Oct 29, 2025)

Home page scroll restoration wasn't working because pagination changes were **overwriting** the entire `filters` object, which caused the loss of other filter values when merging at the store level.

### Root Cause

The `pageStateStore.savePageState` function was doing **shallow merge** only:

```typescript
const merged = {
  ...current, // { scrollY: 500, filters: { searchTerm: 'test', propPage: 1 } }
  ...state, // { filters: { propPage: 2 } }
  timestamp: Date.now(),
};
// Result: { scrollY: 500, filters: { propPage: 2 }, timestamp: ... }
//         ❌ searchTerm was lost!
```

When Home's pagination effect called `save({ filters: { propPage: 2 } })`, it replaced the entire `filters` object, losing `searchTerm`, `typeFilter`, etc.

### The Fix

Updated `pageStateStore.ts` to **deep merge** the `filters` object:

```typescript
const merged: PageViewState = {
  ...current,
  ...state,
  // Special handling for filters: merge instead of replace
  ...(state.filters && current.filters
    ? {
        filters: {
          ...(current.filters as Record<string, unknown>),
          ...(state.filters as Record<string, unknown>),
        },
      }
    : {}),
  timestamp: Date.now(),
};
```

Now:

- `scrollX` and `scrollY` are preserved ✓
- Individual `filters` properties are merged, not replaced ✓
- Other root-level properties are preserved ✓

## Files Changed

1. **client/store/pageStateStore.ts**

   - Modified `savePageState` to deep merge the `filters` property
   - Maintains backward compatibility for other properties

2. **client/**tests**/store/pageStateStore.test.ts**
   - Added test case: "savePageState deep merges nested filters object"
   - Verifies that updating pagination preserves scroll position and other filters

## Testing

All tests pass (4/4):

```bash
npm test -- pageStateStore
```

Key test validates:

- Save state with `scrollY: 500, filters: { searchTerm: 'test', propPage: 1, adPage: 1 }`
- Update with `filters: { propPage: 2 }`
- Assert: `scrollY` still 500, `searchTerm` still 'test', `propPage` updated to 2

## Manual Verification Steps

1. Navigate to `/home`
2. Scroll down the page (e.g., to `scrollY: 500`)
3. Change pagination (click page 2)
4. Navigate to a property detail page
5. Press browser back button
6. **Expected**: Page restores to `scrollY: 500` with page 2 active
7. **Before fix**: Page would jump to top because `scrollY` was lost

## Related Context

- Part of the larger UI state persistence feature (see `docs/ui-state-persistence.md`)
- Works in conjunction with `useScrollRestoration` hook
- Critical for maintaining user context during navigation
- Particularly important for Home page which has multiple state dimensions (filters, dual pagination, scroll)
