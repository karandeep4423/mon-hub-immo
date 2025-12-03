# Notifications System

> In-app notifications, email alerts, and real-time notification delivery

---

## 📋 Overview

MonHubImmo has a multi-channel notification system:

- **In-App**: Real-time notifications via Socket.IO
- **Email**: Transactional emails via Brevo
- **Push** (planned): Browser push notifications

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                      NOTIFICATION FLOW                                      │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│   TRIGGER                          DELIVERY                                 │
│   ┌───────────────┐                                                        │
│   │ Event Occurs  │ ──► Create Notification in DB                          │
│   │ (new message, │     │                                                  │
│   │  collab, etc) │     ├──► Socket.IO (real-time)                         │
│   └───────────────┘     │                                                  │
│                         ├──► Email (async, via Brevo)                      │
│                         │                                                  │
│                         └──► Store for later retrieval                     │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 🗄️ Data Model

### Notification Schema

```typescript
// models/Notification.ts
interface INotification extends Document {
  // Recipient
  recipient: mongoose.Types.ObjectId;

  // Notification content
  type: NotificationType;
  title: string;
  message: string;

  // Related entities
  data?: {
    collaborationId?: string;
    propertyId?: string;
    searchAdId?: string;
    senderId?: string;
    appointmentId?: string;
  };

  // Action URL
  link?: string;

  // Status
  isRead: boolean;
  readAt?: Date;

  // Timestamps
  createdAt: Date;
}

type NotificationType =
  | "collaboration_request"
  | "collaboration_accepted"
  | "collaboration_rejected"
  | "collaboration_update"
  | "new_message"
  | "appointment_request"
  | "appointment_confirmed"
  | "appointment_cancelled"
  | "property_match"
  | "system";
```

---

## 🔔 Notification Types

### Collaboration Notifications

| Type                     | Trigger                    | Recipients   |
| ------------------------ | -------------------------- | ------------ |
| `collaboration_request`  | New collaboration proposal | Post owner   |
| `collaboration_accepted` | Proposal accepted          | Collaborator |
| `collaboration_rejected` | Proposal rejected          | Collaborator |
| `collaboration_update`   | Progress step updated      | Both parties |
| `contract_signed`        | Party signs contract       | Other party  |

### Message Notifications

| Type          | Trigger          | Recipients             |
| ------------- | ---------------- | ---------------------- |
| `new_message` | New chat message | Recipient (if offline) |

### Appointment Notifications

| Type                    | Trigger                 | Recipients   |
| ----------------------- | ----------------------- | ------------ |
| `appointment_request`   | New appointment request | Organizer    |
| `appointment_confirmed` | Appointment confirmed   | Requester    |
| `appointment_cancelled` | Appointment cancelled   | Other party  |
| `appointment_reminder`  | 24h/1h before           | Both parties |

### System Notifications

| Type                    | Trigger                  | Recipients |
| ----------------------- | ------------------------ | ---------- |
| `account_validated`     | Admin validates account  | User       |
| `subscription_expiring` | Subscription near end    | User       |
| `new_feature`           | New feature announcement | All users  |

---

## 🔌 API Endpoints

### Notification Routes

| Method   | Endpoint                          | Description              |
| -------- | --------------------------------- | ------------------------ |
| `GET`    | `/api/notifications`              | Get user's notifications |
| `GET`    | `/api/notifications/unread-count` | Get unread count         |
| `PUT`    | `/api/notifications/:id/read`     | Mark as read             |
| `PUT`    | `/api/notifications/read-all`     | Mark all as read         |
| `DELETE` | `/api/notifications/:id`          | Delete notification      |

### Get Notifications

```typescript
// GET /api/notifications?page=1&limit=20&unreadOnly=false
{
  "notifications": [
    {
      "_id": "notif_123",
      "type": "collaboration_request",
      "title": "Nouvelle demande de collaboration",
      "message": "Jean Dupont souhaite collaborer sur votre bien",
      "data": {
        "collaborationId": "collab_456",
        "propertyId": "prop_789",
        "senderId": "user_101"
      },
      "link": "/collaboration/collab_456",
      "isRead": false,
      "createdAt": "2025-12-03T10:30:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 45,
    "hasMore": true
  }
}
```

---

## 📡 Real-Time Delivery

### Socket.IO Events

```typescript
// Server - Emit notification
socketService.emitToUser(userId, "notification:new", {
  _id: notification._id,
  type: notification.type,
  title: notification.title,
  message: notification.message,
  link: notification.link,
  createdAt: notification.createdAt,
});

// Client - Listen for notifications
socket.on("notification:new", (notification) => {
  // Add to store
  addNotification(notification);

  // Show toast
  toast.info(notification.title, {
    onClick: () => router.push(notification.link),
  });

  // Play sound (optional)
  playNotificationSound();
});
```

### Client Hook

```typescript
// hooks/useNotifications.ts
export const useNotifications = () => {
  const { socket } = useSocket();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  // Fetch initial notifications
  const { data, refetch } = useFetch(() => api.get("/notifications"));

  // Listen for new notifications
  useEffect(() => {
    if (!socket) return;

    socket.on("notification:new", (notification) => {
      setNotifications((prev) => [notification, ...prev]);
      setUnreadCount((prev) => prev + 1);
    });

    return () => {
      socket.off("notification:new");
    };
  }, [socket]);

  const markAsRead = async (id: string) => {
    await api.put(`/notifications/${id}/read`);
    setNotifications((prev) =>
      prev.map((n) => (n._id === id ? { ...n, isRead: true } : n))
    );
    setUnreadCount((prev) => Math.max(0, prev - 1));
  };

  const markAllAsRead = async () => {
    await api.put("/notifications/read-all");
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    setUnreadCount(0);
  };

  return {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    refetch,
  };
};
```

---

## 📧 Email Notifications

### Notification Service

```typescript
// services/notificationService.ts
import { Notification } from "../models/Notification";
import { sendEmail } from "../utils/emailService";
import { getSocketService } from "../chat";

interface CreateNotificationOptions {
  recipient: string;
  type: NotificationType;
  title: string;
  message: string;
  data?: Record<string, string>;
  link?: string;
  sendEmail?: boolean;
}

export const createNotification = async (
  options: CreateNotificationOptions
) => {
  const {
    recipient,
    type,
    title,
    message,
    data,
    link,
    sendEmail: shouldSendEmail = true,
  } = options;

  // 1. Create notification in database
  const notification = await Notification.create({
    recipient,
    type,
    title,
    message,
    data,
    link,
    isRead: false,
  });

  // 2. Send via Socket.IO (real-time)
  const socketService = getSocketService();
  socketService.emitToUser(recipient, "notification:new", notification);

  // 3. Send email (async)
  if (shouldSendEmail) {
    const user = await User.findById(recipient);
    if (user?.email) {
      sendNotificationEmail(user.email, notification).catch((err) => {
        logger.error("Failed to send notification email:", err);
      });
    }
  }

  return notification;
};
```

### Email Templates

```typescript
// services/emailTemplates.ts
export const getNotificationEmailTemplate = (notification: INotification) => {
  const templates: Record<NotificationType, EmailTemplate> = {
    collaboration_request: {
      subject: "Nouvelle demande de collaboration",
      template: "collaboration-request",
    },
    collaboration_accepted: {
      subject: "Votre demande de collaboration a été acceptée",
      template: "collaboration-accepted",
    },
    new_message: {
      subject: "Vous avez un nouveau message",
      template: "new-message",
    },
    appointment_confirmed: {
      subject: "Votre rendez-vous est confirmé",
      template: "appointment-confirmed",
    },
    // ...
  };

  return templates[notification.type];
};
```

---

## 🎨 Frontend Components

### NotificationBell

```typescript
// components/notifications/NotificationBell.tsx
const NotificationBell = () => {
  const { unreadCount } = useNotifications();
  const [showDropdown, setShowDropdown] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className="relative p-2"
      >
        <BellIcon className="w-6 h-6" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {showDropdown && (
        <NotificationDropdown onClose={() => setShowDropdown(false)} />
      )}
    </div>
  );
};
```

### NotificationList

```typescript
// components/notifications/NotificationList.tsx
const NotificationList = () => {
  const { notifications, markAsRead, markAllAsRead } = useNotifications();

  return (
    <div className="max-h-96 overflow-y-auto">
      <div className="flex justify-between p-4 border-b">
        <h3 className="font-semibold">Notifications</h3>
        <button onClick={markAllAsRead} className="text-sm text-blue-600">
          Tout marquer comme lu
        </button>
      </div>

      {notifications.length === 0 ? (
        <p className="p-4 text-gray-500 text-center">Aucune notification</p>
      ) : (
        notifications.map((notification) => (
          <NotificationItem
            key={notification._id}
            notification={notification}
            onRead={markAsRead}
          />
        ))
      )}
    </div>
  );
};
```

---

## ⚙️ Configuration

### Notification Preferences

```typescript
// User notification preferences (stored in user model)
interface NotificationPreferences {
  email: {
    collaborations: boolean;
    messages: boolean;
    appointments: boolean;
    marketing: boolean;
  };
  inApp: {
    collaborations: boolean;
    messages: boolean;
    appointments: boolean;
  };
}
```

### Respect User Preferences

```typescript
// services/notificationService.ts
const shouldSendEmail = (user: IUser, type: NotificationType): boolean => {
  const prefs = user.notificationPreferences?.email;

  if (type.startsWith("collaboration")) return prefs?.collaborations ?? true;
  if (type === "new_message") return prefs?.messages ?? true;
  if (type.startsWith("appointment")) return prefs?.appointments ?? true;

  return true;
};
```

---

## 📚 Related Documentation

- [Real-time Features](./realtime.md) - Socket.IO integration
- [Email System](./emails.md) - Email sending
- [API Overview](../api/overview.md) - API documentation
