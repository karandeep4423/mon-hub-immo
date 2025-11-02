# Socket.IO Real-Time Messaging Fixes

**Date:** November 2, 2025
**Issue:** Users not seeing real-time updates for typing indicators, new messages, and read receipts

## Problems Identified

### 1. **Typing Indicators Not Working**

- **Root Cause:** No debugging logs to trace typing events through the system
- **Issue:** Events were being emitted but no visibility into whether they reached the receiver

### 2. **Messages Not Appearing in Real-Time**

- **Root Cause:** Socket emission and state update notification had no debugging
- **Issue:** Messages were emitted but no way to verify delivery or state listener triggering

### 3. **Read Receipts Not Working**

- **Root Cause:** Similar to messages - no debugging for read receipt emission
- **Issue:** Read receipts were sent but no visibility into successful delivery

## Solutions Implemented

### Server-Side Changes

#### 1. Enhanced Typing Event Handler (`server/src/chat/socketManager.ts`)

```typescript
// Added comprehensive logging for typing events
const handleTyping = (io, userSocketMap, userId, data) => {
  const { receiverId, isTyping } = data;
  const receiverSocketId = getReceiverSocketId(userSocketMap, receiverId);

  logger.debug(
    `[SocketManager] Typing event from ${userId} to ${receiverId}, isTyping: ${isTyping}`
  );
  logger.debug(
    `[SocketManager] Receiver socket ID: ${receiverSocketId || "NOT FOUND"}`
  );

  if (receiverSocketId) {
    io.to(receiverSocketId).emit(SOCKET_EVENTS.USER_TYPING, {
      senderId: userId,
      isTyping,
    });
    logger.debug(`[SocketManager] Emitted USER_TYPING to ${receiverSocketId}`);
  } else {
    logger.warn(
      `[SocketManager] Could not find socket for receiver: ${receiverId}`
    );
  }
};
```

#### 2. Enhanced Message Emission (`server/src/chat/messageHandler.ts`)

```typescript
// Added detailed logging for message emission
const emitNewMessage = (socketManager, message) => {
  const { receiverId, senderId } = message;

  logger.debug(
    `[MessageHandler] Emitting newMessage from ${senderId} to ${receiverId}`,
    { messageId: message._id }
  );

  // Check receiver connection before emitting
  const receiverSocketId = socketManager.getReceiverSocketId(receiverId);
  if (receiverSocketId) {
    socketManager.emitToUser(receiverId, SOCKET_EVENTS.NEW_MESSAGE, message);
    logger.debug(
      `[MessageHandler] ✅ Emitted to receiver ${receiverId} (socket: ${receiverSocketId})`
    );
  } else {
    logger.warn(`[MessageHandler] ⚠️ Receiver ${receiverId} not connected`);
  }

  // Check sender connection before emitting
  const senderSocketId = socketManager.getReceiverSocketId(senderId);
  if (senderSocketId) {
    socketManager.emitToUser(senderId, SOCKET_EVENTS.NEW_MESSAGE, message);
    logger.debug(
      `[MessageHandler] ✅ Emitted to sender ${senderId} (socket: ${senderSocketId})`
    );
  } else {
    logger.warn(`[MessageHandler] ⚠️ Sender ${senderId} not connected`);
  }
};
```

#### 3. Enhanced Read Receipt Emission (`server/src/chat/messageHandler.ts`)

```typescript
// Added detailed logging for read receipts
const emitReadReceipt = (socketManager, senderId, readBy) => {
  const readReceipt = { readBy, senderId };

  logger.debug(
    `[MessageHandler] Emitting read receipt to sender ${senderId} from reader ${readBy}`
  );

  const senderSocketId = socketManager.getReceiverSocketId(senderId);
  if (senderSocketId) {
    socketManager.emitToUser(
      senderId,
      SOCKET_EVENTS.MESSAGES_READ,
      readReceipt
    );
    logger.debug(
      `[MessageHandler] ✅ Emitted read receipt to ${senderId} (socket: ${senderSocketId})`
    );
  } else {
    logger.warn(
      `[MessageHandler] ⚠️ Sender ${senderId} not connected for read receipt`
    );
  }
};
```

### Client-Side Changes

#### 1. Enhanced Socket Event Handlers (`client/hooks/useChat.ts`)

**New Message Handler:**

```typescript
const handleNewMessage = useCallback(
  (msg) => {
    logger.debug("📨 Received newMessage in useChat", {
      messageId: msg._id,
      senderId: msg.senderId,
      receiverId: msg.receiverId,
      text: msg.text?.substring(0, 50),
    });
    // ... rest of handler
  },
  [state.selectedUser?._id, user, markMessagesAsRead]
);
```

**Typing Handler:**

```typescript
const handleUserTyping = useCallback(
  (data) => {
    logger.debug("⌨️ User typing event received", {
      senderId: data.senderId,
      isTyping: data.isTyping,
      selectedUserId: state.selectedUser?._id,
    });
    if (data.senderId === state.selectedUser?._id) {
      logger.debug(
        "⌨️ Setting typing indicator for selected user",
        data.senderId
      );
      chatStore.setUserTyping(data.senderId, data.isTyping);
    } else {
      logger.debug("⌨️ Ignoring typing from non-selected user", data.senderId);
    }
  },
  [state.selectedUser?._id]
);
```

**Read Receipt Handler:**

```typescript
const handleMessagesRead = useCallback(
  (data) => {
    logger.debug("✅ Messages read receipt received", {
      readBy: data.readBy,
      senderId: data.senderId,
      currentUser: user?._id || user?.id,
    });
    // ... rest of handler
  },
  [user]
);
```

#### 2. Enhanced Typing Emission (`client/hooks/useChat.ts`)

```typescript
const sendTypingStatus = useCallback(
  (isTyping) => {
    if (!socket || !selectedUser) {
      logger.debug(
        "⌨️ Cannot send typing status - socket or selectedUser missing",
        { hasSocket: !!socket, hasSelectedUser: !!selectedUser }
      );
      return;
    }

    logger.debug(
      `⌨️ Sending typing status to ${selectedUser._id}: ${isTyping}`
    );
    socket.emit(Features.Chat.SOCKET_EVENTS.TYPING, {
      receiverId: selectedUser._id,
      isTyping,
    });
  },
  [socket, selectedUser]
);
```

#### 3. Enhanced Socket Event Listener Registration

```typescript
const useSocketEventListeners = (socket, isConnected, handlers) => {
  useEffect(() => {
    if (!socket || !isConnected) {
      logger.debug("Socket not connected yet", { isConnected });
      return;
    }

    logger.debug("🔌 Subscribing to socket events in useChat");

    const chatListeners = {
      [Features.Chat.SOCKET_EVENTS.NEW_MESSAGE]: handlers.handleNewMessage,
      [Features.Chat.SOCKET_EVENTS.USER_TYPING]: handlers.handleUserTyping,
      [Features.Chat.SOCKET_EVENTS.USER_STATUS_UPDATE]:
        handlers.handleUserStatusUpdate,
      [Features.Chat.SOCKET_EVENTS.MESSAGES_READ]: handlers.handleMessagesRead,
      [Features.Chat.SOCKET_EVENTS.MESSAGE_DELETED]:
        handlers.handleMessageDeleted,
    };

    // Log all registered events
    logger.debug(
      "🔌 Registering socket event listeners:",
      Object.keys(chatListeners)
    );

    Object.entries(chatListeners).forEach(([event, handler]) => {
      socket.on(event, handler);
      logger.debug(`✅ Registered listener for: ${event}`);
    });

    return () => {
      logger.debug("🔌 Cleaning up socket event listeners");
      Object.entries(chatListeners).forEach(([event, handler]) => {
        socket.off(event, handler);
      });
    };
  }, [socket, isConnected, handlers]);
};
```

#### 4. Enhanced Chat Store State Updates (`client/store/chatStore.ts`)

```typescript
const setState = (newState: Partial<ChatState>): void => {
  const prevState = { ...state };
  state = { ...state, ...newState };

  // Debug log state changes
  if (newState.messages) {
    logger.debug("[ChatStore] Messages state updated", {
      previousCount: prevState.messages.length,
      newCount: state.messages.length,
      listenerCount: listeners.size,
    });
  }

  notify();
};

const notify = (): void => {
  logger.debug(`[ChatStore] Notifying ${listeners.size} listeners`);
  listeners.forEach((listener) => listener());
};
```

## How to Debug

### Check Browser Console

Look for these log patterns:

**Typing Events:**

- `⌨️ Sending typing status to [userId]: true/false` - Client sending typing
- `⌨️ User typing event received` - Client receiving typing
- `[SocketManager] Typing event from [userId] to [userId]` - Server handling typing

**New Messages:**

- `📨 Received newMessage in useChat` - Client receiving message
- `[MessageHandler] Emitting newMessage from [senderId] to [receiverId]` - Server emitting
- `[ChatStore] Messages state updated` - Store updating with message

**Read Receipts:**

- `✅ Messages read receipt received` - Client receiving read receipt
- `[MessageHandler] Emitting read receipt to sender` - Server emitting receipt

**Socket Connection:**

- `🔌 Registering socket event listeners: [events]` - Client registering listeners
- `✅ Registered listener for: [eventName]` - Each listener registered successfully

### Check Server Logs

Look for:

- `[SocketManager] User connected: [socketId]`
- `[SocketManager] User mapped: [userId] -> [socketId]`
- `[MessageHandler] ✅ Emitted to receiver [userId]`
- `[SocketManager] ⚠️ Could not find socket for receiver` - User not connected

## Testing Checklist

### Typing Indicators

- [ ] User A types, User B sees "is typing..."
- [ ] Indicator disappears 2 seconds after User A stops typing
- [ ] Indicator only shows when chatting with that specific user

### Real-Time Messages

- [ ] User A sends message, User B sees it immediately without refresh
- [ ] User B sends reply, User A sees it immediately
- [ ] Messages appear in correct order for both users

### Read Receipts

- [ ] User A sends message (single checkmark)
- [ ] User B opens chat, message marked as read
- [ ] User A sees double checkmark immediately without refresh

### Socket Connection

- [ ] Both users show as "online" when connected
- [ ] Status updates when user disconnects
- [ ] Reconnection works after network interruption

## Key Improvements

1. **Full Visibility:** Comprehensive logging at every step of socket communication
2. **Connection Verification:** Checks if recipient is connected before emitting
3. **State Update Tracking:** Logs when store notifies listeners
4. **Event Registration Logging:** Confirms all event handlers are properly registered
5. **Error Cases:** Warnings when users are offline or socket IDs not found

## Expected Behavior After Fixes

- **Typing:** See typing indicator within 50-200ms of other user typing
- **Messages:** See new messages instantly (within 100-300ms)
- **Read Receipts:** See double checkmark within 100-200ms of other user opening message
- **No Refresh Needed:** All updates happen in real-time

## Notes

- All console logs use consistent emoji prefixes for easy filtering:

  - 📨 = Message events
  - ⌨️ = Typing events
  - ✅ = Success/Read receipts
  - 🔌 = Socket connection events
  - ⚠️ = Warnings
  - ❌ = Errors

- Logs can be filtered in browser console using these prefixes
- Server logs include module name tags like `[SocketManager]`, `[MessageHandler]`
