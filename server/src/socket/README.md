# Socket Architecture

This folder contains all Socket.IO related functionality, organized in a clean, maintainable structure.

## 📁 File Structure

```
socket/
├── index.ts              # Main exports and types
├── socketConfig.ts       # Socket.IO server configuration
├── socketManager.ts      # Core socket connection management
├── messageHandler.ts     # Message-specific socket events
├── socketService.ts      # Main service coordinating all socket functionality
└── README.md            # This documentation
```

## 🏗️ Architecture Overview

### 1. **SocketService** (`socketService.ts`)

-   **Main entry point** for all socket functionality
-   Coordinates between different socket handlers
-   Provides clean interface for the server to interact with sockets

### 2. **SocketManager** (`socketManager.ts`)

-   Manages **user connections** and **socket mappings**
-   Handles **connection/disconnection** events
-   Manages **user status updates** (online/offline)
-   Handles **typing indicators**

### 3. **MessageHandler** (`messageHandler.ts`)

-   Handles **message-related socket events**
-   Emits **new message notifications**
-   Manages **read receipts**

### 4. **SocketConfig** (`socketConfig.ts`)

-   **Socket.IO server configuration**
-   **CORS settings** and **performance options**
-   **Event name constants** for consistency
-   **Room naming conventions**

## 🚀 Usage

### Server Setup

```typescript
import { createSocketServer, SocketService } from './socket';

// Create HTTP server
const server = createServer(app);

// Create Socket.IO server
const io = createSocketServer(server);

// Initialize socket service
const socketService = new SocketService(io);
```

### Emitting Events

```typescript
// Emit new message
socketService.emitNewMessage(messageData);

// Emit read receipt
socketService.emitReadReceipt(senderId, readBy);

// Emit to specific user
socketService.emitToUser(userId, 'eventName', data);

// Broadcast to all except sender
socketService.broadcastToOthers(senderId, 'eventName', data);
```

### Getting Socket Information

```typescript
// Get user's socket ID
const socketId = socketService.getReceiverSocketId(userId);

// Get online users count
const onlineCount = socketService.getOnlineUsers().length;
```

## 🔌 Socket Events

### Client → Server

-   `typing` - User typing indicator
-   `updateStatus` - User status update

### Server → Client

-   `userStatusUpdate` - User online/offline status
-   `userTyping` - Typing indicator from other user
-   `newMessage` - New message notification
-   `messagesRead` - Read receipt notification
-   `getOnlineUsers` - List of online users

## 🏠 Socket Rooms

-   `user:{userId}` - User-specific room
-   `chat:{chatId}` - Chat-specific room
-   `online_users` - General online users room

## 📝 Best Practices

1. **Always use the SocketService** instead of accessing Socket.IO directly
2. **Use event constants** from `SOCKET_EVENTS` for consistency
3. **Handle errors gracefully** in socket event handlers
4. **Clean up event listeners** when sockets disconnect
5. **Use TypeScript interfaces** for socket data structures

## 🔧 Configuration

Socket.IO is configured with:

-   **CORS enabled** for development origins
-   **WebSocket + polling** transport fallback
-   **60s ping timeout** and **25s ping interval**
-   **EIO3 compatibility** for older clients

## 🚨 Error Handling

All socket operations include proper error handling:

-   **Connection failures** are logged
-   **Database operations** are wrapped in try-catch
-   **Graceful degradation** when services are unavailable

## 📊 Monitoring

The socket service provides:

-   **Connection count** tracking
-   **User mapping** status
-   **Event emission** logging
-   **Health check** integration

## 🔄 Migration from Old Code

The old socket logic in `server.ts` has been:

1. ✅ **Extracted** into dedicated modules
2. ✅ **Organized** by functionality
3. ✅ **Documented** with clear interfaces
4. ✅ **Tested** for compatibility
5. ✅ **Optimized** for performance

## 🎯 Future Enhancements

-   [ ] **Rate limiting** for socket events
-   [ ] **Authentication middleware** for socket connections
-   [ ] **Event queuing** for offline users
-   [ ] **Metrics collection** and analytics
-   [ ] **Load balancing** support for multiple instances
