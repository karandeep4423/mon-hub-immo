# Notification System Fixes

## Issues Fixed

### 1. Missing Profile Avatars in Notifications

**Problem**: Some notifications showed user avatars while others didn't.

**Root Cause**: Not all notification creation points were fetching the actor's `profileImage` and including it in the notification data.

**Solution**: Updated all notification creation points to:

- Fetch `profileImage` from the User model when retrieving actor information
- Include `actorAvatar` in the notification `data` field consistently

**Files Modified**:

- `server/src/controllers/collaborationController.ts` - Added `profileImage` to actor fetch and `actorAvatar` to data in:
  - `proposeCollaboration` (proposal_received)
  - `respondToCollaboration` (proposal_accepted/rejected)
  - `cancelCollaboration` (cancelled)
  - `updateProgressStatus` (progress_updated)
  - `signCollaboration` (contract_signed, collab_activated)
  - `completeCollaboration` (completed)
- `server/src/controllers/contractController.ts` - Added `profileImage` to signer fetch and `actorAvatar` to data in:
  - `signContract` (contract_signed, collab_activated)
  - `updateContract` (contract_updated)

**Before**:

```typescript
const actor = await User.findById(userId).select("firstName lastName email");
await notificationService.create({
  // ...
  data: { actorName },
});
```

**After**:

```typescript
const actor = await User.findById(userId).select(
  "firstName lastName email profileImage"
);
await notificationService.create({
  // ...
  data: {
    actorName,
    actorAvatar: actor?.profileImage || undefined,
  },
});
```

### 2. Notifications Not Appearing Consistently

**Problem**: Notifications sometimes appeared and sometimes didn't, especially after reconnection or when users were offline.

**Root Cause**:

1. When users were offline, Socket.IO couldn't deliver real-time notifications
2. No mechanism to refetch missed notifications when users reconnected
3. Limited visibility into socket connection status and notification delivery

**Solution**:

#### A. Added Reconnection Handler

- Added `connect` event listener in notification store to refetch notifications on reconnection
- Prevents users from missing notifications during disconnect periods

**File Modified**: `client/store/notifications/index.ts`

```typescript
const onReconnect = async () => {
  console.log("🔄 Socket reconnected, refetching notifications...");
  try {
    const [listRes, countRes] = await Promise.all([
      api.get("/notifications", { params: { limit: 20, _ts: Date.now() } }),
      api.get("/notifications/count", { params: { _ts: Date.now() } }),
    ]);
    // Update state with fresh data
  } catch (err) {
    console.error("Failed to refetch notifications on reconnect:", err);
  }
};

socket.on("connect", onReconnect);
```

#### B. Enhanced Server-Side Logging

- Added detailed logging to track notification creation and socket delivery
- Logs show when notifications are created, whether recipient is online, and socket emission status

**File Modified**: `server/src/services/notificationService.ts`

```typescript
console.log("✅ Notification created:", { id, type, recipientId });

const socketId = socketService.getReceiverSocketId(recipientId);
if (socketId) {
  console.log("📤 Emitting notification via socket:", {
    recipientId,
    socketId,
    type,
  });
} else {
  console.log("⚠️ Recipient not connected via socket:", { recipientId, type });
}
```

## How the Notification System Works

### Real-Time Flow (User Online)

1. Action occurs (e.g., collaboration proposal)
2. Server creates notification in database
3. Server emits via Socket.IO to recipient's socket
4. Client receives and displays notification immediately
5. Client shows badge count update

### Offline/Reconnection Flow (User Offline)

1. Action occurs
2. Server creates notification in database
3. Socket emission fails silently (user not connected)
4. When user reconnects:
   - Socket emits `connect` event
   - Client refetches all notifications from server
   - Missed notifications appear

### Data Structure

```typescript
{
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  entity: { type: 'chat' | 'collaboration'; id: string };
  data: {
    actorName?: string;
    actorAvatar?: string;  // Now consistently included
    // ... other type-specific data
  };
  actorId: string;
  read: boolean;
  createdAt: string;
}
```

## Testing Checklist

- [x] All notification types include actorAvatar in data
- [x] ProfileAvatar component displays avatars correctly
- [x] Notifications appear immediately when user is online
- [x] Missed notifications load on reconnection
- [x] Server logs show notification delivery status
- [x] Client console shows reconnection refetch

## Related Files

### Server

- `server/src/services/notificationService.ts` - Core notification logic
- `server/src/controllers/collaborationController.ts` - Collaboration notifications
- `server/src/controllers/contractController.ts` - Contract notifications
- `server/src/controllers/chatController.ts` - Chat notifications
- `server/src/models/Notification.ts` - Notification schema

### Client

- `client/store/notifications/index.ts` - Notification state management
- `client/components/notifications/NotificationBell.tsx` - Notification UI
- `client/components/ui/ProfileAvatar.tsx` - Avatar display component
- `client/context/SocketContext.tsx` - Socket connection management

## Future Improvements

1. **Push Notifications**: Implement browser push notifications for offline users
2. **Notification Preferences**: Allow users to configure which notifications they receive
3. **Notification Groups**: Group related notifications (e.g., multiple messages from same user)
4. **Real-time Sync**: Use service workers for better offline support
5. **Retry Logic**: Add exponential backoff for failed socket emissions
