# Pagination Restoration Fix - Race Condition

## Problem (Oct 29, 2025)

Filters were restoring correctly but pagination was always reset to 1, and scroll position was lost.

## Root Cause

**Race condition between restoration and filter-change reset effect:**

1. Restoration effect runs and starts setting state values
2. Sets `contentFilter` from saved state → triggers filter-change effect
3. Sets `restorationCompleteRef.current = true`
4. Sets `propPage` to 3 (from saved state)
5. **Filter-change effect fires** (because contentFilter changed and restorationCompleteRef is now true)
6. Filter-change effect resets pagination to 1 → **overwrites the just-restored pagination!**

## The Fix

Split restoration into two phases using two refs:

1. **`restorationInProgressRef`**: Blocks reset effects while restoration is ongoing
2. **`restorationCompleteRef`**: Enables reset effects only after ALL state is restored

### Implementation

```typescript
// Phase 1: Set restorationInProgressRef = true BEFORE any state updates
restorationInProgressRef.current = true;
// ... set all state values ...
// DON'T set restorationCompleteRef yet!

// Phase 2: Separate effect that runs AFTER state updates propagate
useEffect(() => {
  if (restorationInProgressRef.current) {
    restorationInProgressRef.current = false;
    restorationCompleteRef.current = true; // NOW it's safe
  }
}, [propPage, adPage, contentFilter]); // Depends on restored values
```

## Files Changed

**client/app/home/page.tsx**

- Added `restorationInProgressRef` to track restoration in progress
- Moved `restorationCompleteRef.current = true` to separate effect
- Separate effect depends on `[propPage, adPage, contentFilter]` to ensure it runs after restoration
- Added debug logging to trace execution order

## Debug Logs Added

When navigating back to Home, you'll now see:

```
[Home] Restoration attempt: { hasSavedState: true, filters: {...}, scrollY: 500 }
[Home] Restoring propPage: 3
[Home] Restoring adPage: 1
[Home] Skipping pagination reset - restoration not complete  (from filter-change effect)
[Home] Restoration complete - enabling normal operations
[Home] Saving pagination: { propPage: 3, adPage: 1 }
```

## Testing

1. On Home, scroll down and go to page 3
2. Navigate to a property detail
3. Press back
4. **Expected**:
   - Filters restored ✓
   - propPage = 3 ✓
   - adPage = 1 ✓
   - Scroll position = saved value ✓

## Why This Works

React batches state updates, but effects run in order. By using two separate effects:

- First effect: Sets all state synchronously, marks "in progress"
- Second effect: Runs **after** React has processed all state updates and re-rendered with new values
- Only then do we enable the reset effect

This ensures pagination values have fully settled before we allow them to be reset by filter changes.
