# Real-time Features

> Socket.IO integration for chat, notifications, and live updates

---

## 🔌 Overview

MonHubImmo uses **Socket.IO** for real-time features:

- **Chat Messaging**: Instant message delivery
- **Typing Indicators**: Real-time typing status
- **Online Status**: User presence tracking
- **Notifications**: Live notification delivery
- **Data Sync**: Real-time updates across tabs

---

## 🏗 Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         SOCKET.IO ARCHITECTURE                              │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│   CLIENT (Browser)                                                          │
│   ┌─────────────────────────────────────────────────────────────────┐       │
│   │  SocketProvider (Context)                                        │       │
│   │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐              │       │
│   │  │ useSocket() │  │  useChat()  │  │Notifications│              │       │
│   │  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘              │       │
│   │         │                │                │                      │       │
│   │         └────────────────┼────────────────┘                      │       │
│   │                          │                                       │       │
│   │                   ┌──────▼──────┐                                │       │
│   │                   │   Socket    │                                │       │
│   │                   │   Client    │                                │       │
│   │                   └──────┬──────┘                                │       │
│   └──────────────────────────│──────────────────────────────────────┘       │
│                              │                                              │
│                    WebSocket │ Connection                                   │
│                              │                                              │
│   SERVER                     │                                              │
│   ┌──────────────────────────▼──────────────────────────────────────┐       │
│   │                   Socket.IO Server                               │       │
│   │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐              │       │
│   │  │   Socket    │  │   Socket    │  │   Socket    │              │       │
│   │  │  Manager    │  │  Service    │  │  Handler    │              │       │
│   │  └─────────────┘  └─────────────┘  └─────────────┘              │       │
│   │                                                                  │       │
│   │  ┌─────────────────────────────────────────────────────────┐    │       │
│   │  │              User → Socket Mapping                       │    │       │
│   │  │  userId: "abc123" → sockets: ["socket1", "socket2"]      │    │       │
│   │  └─────────────────────────────────────────────────────────┘    │       │
│   └──────────────────────────────────────────────────────────────────┘       │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 📡 Socket Events

### Event Reference

| Event              | Direction       | Description                 |
| ------------------ | --------------- | --------------------------- |
| `user:connect`     | Client → Server | User connects with userId   |
| `users:online`     | Server → Client | Broadcast online users list |
| `message:send`     | Client → Server | Send a chat message         |
| `message:new`      | Server → Client | New message notification    |
| `message:read`     | Client ↔ Server | Mark messages as read       |
| `typing:start`     | Client → Server | User started typing         |
| `typing:stop`      | Client → Server | User stopped typing         |
| `typing:update`    | Server → Client | Typing status update        |
| `notification:new` | Server → Client | New notification            |

---

## 🖥 Server Implementation

### Socket Configuration

```typescript
// chat/socketConfig.ts
import { Server as HttpServer } from "http";
import { Server, ServerOptions } from "socket.io";

export const SOCKET_EVENTS = {
  // Connection
  USER_CONNECT: "user:connect",
  USER_DISCONNECT: "disconnect",
  USERS_ONLINE: "users:online",

  // Messages
  MESSAGE_SEND: "message:send",
  MESSAGE_NEW: "message:new",
  MESSAGE_READ: "message:read",

  // Typing
  TYPING_START: "typing:start",
  TYPING_STOP: "typing:stop",
  TYPING_UPDATE: "typing:update",

  // Notifications
  NOTIFICATION_NEW: "notification:new",
};

const ALLOWED_ORIGINS = [
  "http://localhost:3000",
  "https://monhubimmo.fr",
  "https://www.monhubimmo.fr",
];

export const createSocketServer = (httpServer: HttpServer): Server => {
  const io = new Server(httpServer, {
    cors: {
      origin: ALLOWED_ORIGINS,
      credentials: true,
      methods: ["GET", "POST"],
    },
    transports: ["websocket", "polling"],
    pingTimeout: 60000,
    pingInterval: 25000,
  });

  return io;
};
```

### Socket Manager

Handles connection management and user tracking:

```typescript
// chat/socketManager.ts
import { Server, Socket } from "socket.io";
import { logger } from "../utils/logger";

export interface UserSocketMap {
  userId: string;
  socketIds: Set<string>;
}

export interface SocketManagerAPI {
  addUser: (userId: string, socketId: string) => void;
  removeSocket: (socketId: string) => string | null;
  getSocketIds: (userId: string) => string[];
  getOnlineUsers: () => string[];
  isUserOnline: (userId: string) => boolean;
}

export const createSocketManager = (): SocketManagerAPI => {
  const userSockets = new Map<string, Set<string>>();
  const socketToUser = new Map<string, string>();

  return {
    addUser: (userId: string, socketId: string) => {
      // Add socket to user's set
      if (!userSockets.has(userId)) {
        userSockets.set(userId, new Set());
      }
      userSockets.get(userId)!.add(socketId);

      // Map socket to user
      socketToUser.set(socketId, userId);

      logger.debug(`[Socket] User ${userId} connected with socket ${socketId}`);
    },

    removeSocket: (socketId: string) => {
      const userId = socketToUser.get(socketId);
      if (!userId) return null;

      // Remove socket from user's set
      const sockets = userSockets.get(userId);
      if (sockets) {
        sockets.delete(socketId);
        if (sockets.size === 0) {
          userSockets.delete(userId);
        }
      }

      // Remove socket mapping
      socketToUser.delete(socketId);

      logger.debug(
        `[Socket] Socket ${socketId} disconnected (user: ${userId})`
      );
      return userId;
    },

    getSocketIds: (userId: string) => {
      const sockets = userSockets.get(userId);
      return sockets ? Array.from(sockets) : [];
    },

    getOnlineUsers: () => Array.from(userSockets.keys()),

    isUserOnline: (userId: string) => userSockets.has(userId),
  };
};
```

### Socket Service

Service layer for emitting events:

```typescript
// chat/socketService.ts
import { Server } from "socket.io";
import { createSocketManager, SocketManagerAPI } from "./socketManager";
import { createMessageHandler } from "./messageHandler";
import { SOCKET_EVENTS } from "./socketConfig";
import { logger } from "../utils/logger";

export interface SocketServiceAPI {
  emitToUser: (userId: string, event: string, data: any) => void;
  emitToUsers: (userIds: string[], event: string, data: any) => void;
  emitToAll: (event: string, data: any) => void;
  getOnlineUsers: () => string[];
  isUserOnline: (userId: string) => boolean;
}

export const createSocketService = (io: Server): SocketServiceAPI => {
  const manager = createSocketManager();
  const messageHandler = createMessageHandler(io, manager);

  // Connection handling
  io.on("connection", (socket) => {
    logger.debug(`[Socket] New connection: ${socket.id}`);

    // User authentication/registration
    socket.on(SOCKET_EVENTS.USER_CONNECT, (userId: string) => {
      manager.addUser(userId, socket.id);

      // Broadcast updated online users
      io.emit(SOCKET_EVENTS.USERS_ONLINE, manager.getOnlineUsers());

      logger.info(
        `[Socket] User ${userId} online. Total: ${
          manager.getOnlineUsers().length
        }`
      );
    });

    // Disconnect handling
    socket.on(SOCKET_EVENTS.USER_DISCONNECT, () => {
      const userId = manager.removeSocket(socket.id);

      if (userId) {
        io.emit(SOCKET_EVENTS.USERS_ONLINE, manager.getOnlineUsers());
        logger.info(
          `[Socket] User ${userId} offline. Total: ${
            manager.getOnlineUsers().length
          }`
        );
      }
    });

    // Register message handlers
    messageHandler.registerHandlers(socket);
  });

  return {
    emitToUser: (userId: string, event: string, data: any) => {
      const socketIds = manager.getSocketIds(userId);
      socketIds.forEach((socketId) => {
        io.to(socketId).emit(event, data);
      });
    },

    emitToUsers: (userIds: string[], event: string, data: any) => {
      userIds.forEach((userId) => {
        const socketIds = manager.getSocketIds(userId);
        socketIds.forEach((socketId) => {
          io.to(socketId).emit(event, data);
        });
      });
    },

    emitToAll: (event: string, data: any) => {
      io.emit(event, data);
    },

    getOnlineUsers: () => manager.getOnlineUsers(),

    isUserOnline: (userId: string) => manager.isUserOnline(userId),
  };
};
```

### Message Handler

Handles message-specific events:

```typescript
// chat/messageHandler.ts
import { Server, Socket } from "socket.io";
import { SocketManagerAPI } from "./socketManager";
import { SOCKET_EVENTS } from "./socketConfig";
import Message from "../models/Chat";
import { logger } from "../utils/logger";

export interface MessageHandlerAPI {
  registerHandlers: (socket: Socket) => void;
}

export const createMessageHandler = (
  io: Server,
  manager: SocketManagerAPI
): MessageHandlerAPI => {
  return {
    registerHandlers: (socket: Socket) => {
      // Handle typing start
      socket.on(
        SOCKET_EVENTS.TYPING_START,
        (data: { senderId: string; receiverId: string }) => {
          const receiverSockets = manager.getSocketIds(data.receiverId);
          receiverSockets.forEach((socketId) => {
            io.to(socketId).emit(SOCKET_EVENTS.TYPING_UPDATE, {
              userId: data.senderId,
              isTyping: true,
            });
          });
        }
      );

      // Handle typing stop
      socket.on(
        SOCKET_EVENTS.TYPING_STOP,
        (data: { senderId: string; receiverId: string }) => {
          const receiverSockets = manager.getSocketIds(data.receiverId);
          receiverSockets.forEach((socketId) => {
            io.to(socketId).emit(SOCKET_EVENTS.TYPING_UPDATE, {
              userId: data.senderId,
              isTyping: false,
            });
          });
        }
      );

      // Handle message read
      socket.on(
        SOCKET_EVENTS.MESSAGE_READ,
        async (data: {
          messageIds: string[];
          senderId: string;
          readBy: string;
        }) => {
          try {
            // Update messages in database
            await Message.updateMany(
              { _id: { $in: data.messageIds } },
              { isRead: true, readAt: new Date() }
            );

            // Notify sender
            const senderSockets = manager.getSocketIds(data.senderId);
            senderSockets.forEach((socketId) => {
              io.to(socketId).emit(SOCKET_EVENTS.MESSAGE_READ, {
                messageIds: data.messageIds,
                readBy: data.readBy,
                readAt: new Date(),
              });
            });
          } catch (error) {
            logger.error("[Socket] Error marking messages as read:", error);
          }
        }
      );
    },
  };
};
```

### Emitting from Controllers

Controllers can emit events after database operations:

```typescript
// controllers/chatController.ts
import { getSocketService } from "../server";

export const sendMessage = async (req: AuthRequest, res: Response) => {
  // ... save message to database

  const savedMessage = await message.save();

  // Emit real-time event
  const socketService = getSocketService();
  socketService.emitToUser(receiverId, "message:new", {
    message: savedMessage,
    sender: { _id: senderId, firstName, lastName, profileImage },
  });

  res.json({ success: true, message: savedMessage });
};
```

---

## 📱 Client Implementation

### Socket Context

```typescript
// context/SocketContext.tsx
"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useRef,
} from "react";
import { io, Socket } from "socket.io-client";
import { useAuth } from "../hooks/useAuth";
import { logger } from "@/lib/utils/logger";

interface SocketContextType {
  socket: Socket | null;
  onlineUsers: string[];
  isConnected: boolean;
}

const SocketContext = createContext<SocketContextType | undefined>(undefined);

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error("useSocket must be used within SocketProvider");
  }
  return context;
};

const SOCKET_URL =
  process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:4000";

export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { user, loading } = useAuth();
  const [onlineUsers, setOnlineUsers] = useState<string[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    // Don't connect if loading or no user
    if (loading || !user) {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
        setIsConnected(false);
        setOnlineUsers([]);
      }
      return;
    }

    // Create socket connection
    if (!socketRef.current) {
      const socket = io(SOCKET_URL, {
        withCredentials: true,
        transports: ["websocket", "polling"],
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
      });

      // Connection events
      socket.on("connect", () => {
        logger.info("[Socket] Connected");
        setIsConnected(true);
        socket.emit("user:connect", user._id);
      });

      socket.on("disconnect", () => {
        logger.info("[Socket] Disconnected");
        setIsConnected(false);
      });

      socket.on("connect_error", (error) => {
        logger.error("[Socket] Connection error:", error);
        setIsConnected(false);
      });

      // Online users updates
      socket.on("users:online", (users: string[]) => {
        setOnlineUsers(users);
      });

      socketRef.current = socket;
    }

    // Cleanup on unmount
    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, [user, loading]);

  return (
    <SocketContext.Provider
      value={{
        socket: socketRef.current,
        onlineUsers,
        isConnected,
      }}
    >
      {children}
    </SocketContext.Provider>
  );
};
```

### Socket Wrapper Component

```typescript
// components/chat/SocketWrapper.tsx
"use client";

import { SocketProvider } from "@/context/SocketContext";

export const SocketWrapper: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  return <SocketProvider>{children}</SocketProvider>;
};
```

### Using Socket in Components

```typescript
// components/chat/ChatMessages.tsx
import { useSocket } from "@/context/SocketContext";
import { useEffect, useState } from "react";

const ChatMessages = ({ selectedUserId }: { selectedUserId: string }) => {
  const { socket, onlineUsers, isConnected } = useSocket();
  const [messages, setMessages] = useState<Message[]>([]);
  const [typingUsers, setTypingUsers] = useState<string[]>([]);

  // Listen for new messages
  useEffect(() => {
    if (!socket) return;

    const handleNewMessage = (data: { message: Message; sender: User }) => {
      if (data.sender._id === selectedUserId) {
        setMessages((prev) => [...prev, data.message]);
      }
    };

    socket.on("message:new", handleNewMessage);

    return () => {
      socket.off("message:new", handleNewMessage);
    };
  }, [socket, selectedUserId]);

  // Listen for typing updates
  useEffect(() => {
    if (!socket) return;

    const handleTypingUpdate = (data: {
      userId: string;
      isTyping: boolean;
    }) => {
      if (data.isTyping) {
        setTypingUsers((prev) => [...prev, data.userId]);
      } else {
        setTypingUsers((prev) => prev.filter((id) => id !== data.userId));
      }
    };

    socket.on("typing:update", handleTypingUpdate);

    return () => {
      socket.off("typing:update", handleTypingUpdate);
    };
  }, [socket]);

  // Send typing indicator
  const handleTyping = (isTyping: boolean) => {
    socket?.emit(isTyping ? "typing:start" : "typing:stop", {
      senderId: currentUserId,
      receiverId: selectedUserId,
    });
  };

  // Check if user is online
  const isOnline = onlineUsers.includes(selectedUserId);

  return (
    <div>
      <UserStatus isOnline={isOnline} />
      <MessageList messages={messages} />
      {typingUsers.includes(selectedUserId) && <TypingIndicator />}
      <MessageInput onTyping={handleTyping} />
    </div>
  );
};
```

### Custom Hook for Socket Events

```typescript
// hooks/useSocketListener.ts
import { useEffect } from "react";
import { useSocket } from "@/context/SocketContext";

export const useSocketListener = <T>(
  event: string,
  callback: (data: T) => void,
  deps: any[] = []
) => {
  const { socket } = useSocket();

  useEffect(() => {
    if (!socket) return;

    socket.on(event, callback);

    return () => {
      socket.off(event, callback);
    };
  }, [socket, event, ...deps]);
};

// Usage
useSocketListener<Message>("message:new", (message) => {
  setMessages((prev) => [...prev, message]);
});
```

---

## 💬 Chat Implementation

### Message Flow

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         MESSAGE SEND FLOW                                   │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│   User A types message                                                      │
│        │                                                                   │
│        ▼                                                                   │
│   ┌─────────┐    POST /api/message/send/:userId    ┌─────────┐             │
│   │ Client  │ ─────────────────────────────────────►│ Server  │             │
│   │    A    │      { text: "Hello!" }              └────┬────┘             │
│   └─────────┘                                            │                 │
│                                         1. Validate & sanitize message     │
│                                         2. Save to MongoDB                 │
│                                         3. Get socket service              │
│                                         4. Emit to receiver                │
│                                                          │                 │
│   ┌─────────┐     socket.emit('message:new')            │                 │
│   │ Client  │ ◄─────────────────────────────────────────┘                 │
│   │    B    │                                                             │
│   └─────────┘                                                              │
│                                                                            │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Read Receipts

```typescript
// Mark messages as read when viewing conversation
const markAsRead = useCallback(
  async (messageIds: string[]) => {
    if (!socket || !messageIds.length) return;

    // Emit to server
    socket.emit("message:read", {
      messageIds,
      senderId: selectedUserId,
      readBy: currentUserId,
    });

    // Optimistic update
    setMessages((prev) =>
      prev.map((msg) =>
        messageIds.includes(msg._id)
          ? { ...msg, isRead: true, readAt: new Date() }
          : msg
      )
    );
  },
  [socket, selectedUserId, currentUserId]
);
```

---

## 🔔 Real-time Notifications

### Server-Side

```typescript
// services/notificationService.ts
import { getSocketService } from "../server";
import { Notification } from "../models/Notification";

export const sendNotification = async (params: {
  userId: string;
  type: string;
  title: string;
  message: string;
  data?: Record<string, string>;
}) => {
  // Save to database
  const notification = await Notification.create(params);

  // Send real-time
  const socketService = getSocketService();
  socketService.emitToUser(params.userId, "notification:new", notification);

  return notification;
};

// Usage in controller
await sendNotification({
  userId: postOwnerId,
  type: "collaboration_proposal",
  title: "Nouvelle proposition de collaboration",
  message: `${collaboratorName} souhaite collaborer sur votre annonce`,
  data: { collaborationId: collaboration._id },
});
```

### Client-Side

```typescript
// components/notifications/NotificationListener.tsx
const NotificationListener = () => {
  const { socket } = useSocket();

  useEffect(() => {
    if (!socket) return;

    socket.on("notification:new", (notification) => {
      // Show toast
      toast.info(notification.message);

      // Update notification count
      refetchNotifications();
    });

    return () => {
      socket.off("notification:new");
    };
  }, [socket]);

  return null;
};
```

---

## 🔄 Real-time Sync

### Cross-Tab Synchronization

```typescript
// providers/RealtimeSyncProvider.tsx
export const RealtimeSyncProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { socket } = useSocket();

  useEffect(() => {
    if (!socket) return;

    // Listen for data updates
    socket.on("data:update", (data: { type: string; payload: any }) => {
      switch (data.type) {
        case "collaboration":
          // Invalidate SWR cache
          mutate("/api/collaboration");
          break;
        case "property":
          mutate("/api/property");
          break;
        // ... other types
      }
    });

    return () => {
      socket.off("data:update");
    };
  }, [socket]);

  return <>{children}</>;
};
```

---

## 🔧 Debugging

### Enable Socket Debug Logs

```typescript
// Client
localStorage.setItem('DEBUG', 'socket.io-client:*');

// Server (.env)
DEBUG=socket.io:*
```

### Health Check

```bash
# Check socket connections
curl http://localhost:4000/api/health

# Response
{
  "status": "OK",
  "socketIO": "Connected",
  "onlineUsers": 5
}
```

---

_Next: [Collaboration System →](./collaboration.md)_
