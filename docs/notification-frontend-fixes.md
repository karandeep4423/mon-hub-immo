# Notification Frontend Fixes

## Critical Issues Fixed

### 1. **Multiple API Calls Due to Dependency Array Issues** 🔴

**Problem**: The `markAllRead` function was being recreated on every render, causing the `useEffect` in `NotificationBell` to run repeatedly, making multiple API calls.

**Impact**:

- Excessive API calls
- Race conditions causing inconsistent state
- Notifications appearing and disappearing randomly

**Root Cause**:

```typescript
// Before: Functions recreated on every render
const markAllRead = async () => { ... };

// useEffect depends on markAllRead, runs on every render
useEffect(() => {
  if (open && state.unreadCount > 0) {
    markAllRead();
  }
}, [open, state.unreadCount, markAllRead]); // markAllRead changes every render!
```

**Solution**:

1. Wrapped all notification functions with `useCallback` to stabilize their references
2. Added ref-based flag to prevent duplicate `markAllRead` calls

**Files Modified**:

- `client/store/notifications/index.ts` - Added `useCallback` to all functions
- `client/components/notifications/NotificationBell.tsx` - Added ref flag

```typescript
// After: Stable function references
const markAllRead = useCallback(async () => {
  await api.patch("/notifications/read-all");
  setState((s) => ({
    ...s,
    items: s.items.map((n) => ({ ...n, read: true })),
    unreadCount: 0,
  }));
}, []);

// Prevent duplicate calls with ref
const markAllAsReadRef = useRef(false);
useEffect(() => {
  if (open && state.unreadCount > 0 && !markAllAsReadRef.current) {
    markAllAsReadRef.current = true;
    markAllRead().catch(() => {
      markAllAsReadRef.current = false;
    });
  }
  if (!open) {
    markAllAsReadRef.current = false;
  }
}, [open, state.unreadCount, markAllRead]);
```

### 2. **Double Fetching on Initial Connection** 🔴

**Problem**: The `connect` event fired BOTH on initial connection and reconnection, causing notifications to be fetched twice on page load.

**Impact**:

- Duplicate API calls on every page load
- Wasted bandwidth and server resources
- Potential for stale data overwriting fresh data

**Solution**: Track first connection and only refetch on actual reconnections

```typescript
// Before: Always refetched on connect event
socket.on("connect", onReconnect);

// After: Skip first connection, only refetch on reconnections
let hasConnectedOnce = false;

const onReconnect = async () => {
  if (!hasConnectedOnce) {
    hasConnectedOnce = true;
    console.log("🔌 Initial socket connection established");
    return; // Skip initial connection
  }

  console.log("🔄 Socket reconnected, refetching notifications...");
  // Refetch logic...
};
```

### 3. **Dedupe Set Not Cleared on Reconnect** 🟡

**Problem**: When refetching on reconnect, new notification IDs were added to the dedupe set but old IDs weren't cleared, causing the set to grow indefinitely.

**Impact**:

- Memory leak from growing Set
- Potential for missing notifications if IDs are reused

**Solution**: Clear dedupe set before repopulating with fresh data

```typescript
// Clear and repopulate dedupe set
seenIdsRef.current.clear();
for (const it of items) seenIdsRef.current.add(it.id);
```

## How Notifications Work Now

### 1. Initial Load Flow

```
User logs in
  ↓
useNotifications hook initializes
  ↓
Fetch notifications from API
  ↓
Socket connects (first time - no refetch)
  ↓
Listen for real-time updates
```

### 2. Real-Time Update Flow

```
Action occurs on server
  ↓
Server emits 'notification:new' via Socket.IO
  ↓
Client receives event
  ↓
Check dedupe set (prevent duplicates)
  ↓
Add to state and show notification
```

### 3. Reconnection Flow

```
Socket disconnects (network issue)
  ↓
User might miss notifications
  ↓
Socket reconnects
  ↓
onReconnect handler fires
  ↓
Refetch all notifications (clear & refresh)
  ↓
User sees any missed notifications
```

### 4. User Opens Dropdown Flow

```
User clicks bell icon
  ↓
Dropdown opens (open = true)
  ↓
useEffect checks: open && unreadCount > 0 && !markAllAsReadRef
  ↓
Call markAllRead() ONCE
  ↓
Set ref flag to prevent duplicate calls
  ↓
API marks all as read
  ↓
State updates (unreadCount = 0, all items read = true)
  ↓
Badge disappears
```

## Performance Improvements

### Before

- ❌ Functions recreated on every render (~60 times/second)
- ❌ useEffect triggered repeatedly due to unstable dependencies
- ❌ markAllRead called multiple times when dropdown opened
- ❌ Notifications fetched twice on initial load
- ❌ Dedupe set never cleared (memory leak)

### After

- ✅ Functions memoized with useCallback (stable references)
- ✅ useEffect runs only when dependencies actually change
- ✅ markAllRead called exactly once per dropdown open
- ✅ Notifications fetched once on initial load
- ✅ Dedupe set cleared and refreshed on reconnect

## Testing Checklist

- [x] Notifications appear immediately when received
- [x] Dropdown opens smoothly without multiple API calls
- [x] Badge count updates correctly
- [x] Only one API call to mark all as read
- [x] Reconnection refetches missed notifications
- [x] Initial connection doesn't double-fetch
- [x] No memory leaks from growing dedupe set
- [x] Console logs show correct flow

## Developer Notes

### useCallback Usage

All functions returned from `useNotifications` are now wrapped with `useCallback`:

- `loadMore` - depends on `state.nextCursor`
- `markRead` - no dependencies
- `markAllRead` - no dependencies
- `remove` - no dependencies

This ensures stable function references across renders, preventing unnecessary re-renders and effect triggers in consuming components.

### Ref-Based Flags

Using refs instead of state for flags that shouldn't trigger re-renders:

- `loadingRef` - tracks loading state without re-render
- `seenIdsRef` - dedupe set for notification IDs
- `lastOsNotifyAtRef` - cooldown timer for OS notifications
- `bootstrappedRef` - tracks initial load completion
- `lastUserIdRef` - tracks user changes
- `markAllAsReadRef` - prevents duplicate markAllRead calls

## Related Files

### Modified

- `client/store/notifications/index.ts` - Core notification logic with useCallback
- `client/components/notifications/NotificationBell.tsx` - UI with ref-based flag

### Related (Not Modified)

- `client/context/SocketContext.tsx` - Socket connection management
- `client/hooks/useNotification.ts` - Browser notification permission
- `client/components/ui/ProfileAvatar.tsx` - Avatar display

## Future Improvements

1. **Optimistic Updates**: Update UI before API confirms to feel more responsive
2. **Notification Queue**: Queue notifications to avoid overwhelming the user
3. **Smart Refetch**: Only refetch notifications newer than last received
4. **Virtual Scrolling**: For users with many notifications
5. **Notification Settings**: Allow users to configure what they see
