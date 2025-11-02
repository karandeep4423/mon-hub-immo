# Appointment Notifications Implementation

## Problem

When anonymous users book appointments, agents were **not receiving persistent notifications** in their notification bell. They only received:

- ✅ Email notifications
- ✅ Socket.IO real-time events (`appointment:new`) - but these are not persisted

The notification bell system only supported chat and collaboration notifications, but **appointments were missing**.

## Solution

Integrated appointments into the unified notification system to provide agents and clients with:

1. **Persistent in-app notifications** (notification bell)
2. **Real-time delivery** via Socket.IO
3. **Email notifications** (already working)
4. **OS notifications** when app is in background

## Changes Made

### 1. Backend: Notification Model (`server/src/models/Notification.ts`)

**Added 5 new notification types:**

- `appointment:new` - Client books appointment
- `appointment:confirmed` - Agent confirms appointment
- `appointment:rejected` - Agent rejects appointment
- `appointment:cancelled` - Appointment cancelled
- `appointment:rescheduled` - Agent reschedules appointment

**Added `appointment` entity type:**

```typescript
entity: {
  type: "chat" | "collaboration" | "appointment";
  id: Types.ObjectId;
}
```

### 2. Backend: Notification Service (`server/src/services/notificationService.ts`)

Updated `EntityType` to include `'appointment'`:

```typescript
type EntityType = "chat" | "collaboration" | "appointment";
```

### 3. Backend: Notification Text Templates (`server/src/utils/notificationTexts.ts`)

Added French notification text generators:

```typescript
export const appointmentTexts = {
  newTitle: "Nouvelle demande de rendez-vous",
  newBody: (params) =>
    `${clientName} souhaite un rendez-vous "${appointmentType}" le ${scheduledDate} à ${scheduledTime}`,
  confirmedTitle: "Rendez-vous confirmé",
  confirmedBody: (params) => `${agentName} a confirmé votre rendez-vous`,
  rejectedTitle: "Rendez-vous refusé",
  rejectedBody: (params) =>
    `${agentName} a refusé votre demande de rendez-vous`,
  cancelledTitle: "Rendez-vous annulé",
  cancelledBody: (params) => `${agentName} a annulé votre rendez-vous`,
  rescheduledTitle: "Rendez-vous reporté",
  rescheduledBody: (params) =>
    `${agentName} a reporté votre rendez-vous au ${scheduledDate} à ${scheduledTime}`,
};
```

### 4. Backend: Appointment Controller (`server/src/controllers/appointmentController.ts`)

**A. `createAppointment` - Notify agent when appointment is booked:**

```typescript
// Create persistent notification for agent in notification bell
if (process.env.NODE_ENV !== "test") {
  try {
    await notificationService.create({
      recipientId: agentId,
      actorId: clientId || agentId,
      type: "appointment:new",
      entity: { type: "appointment", id: appointment._id.toString() },
      title: appointmentTexts.newTitle,
      message: appointmentTexts.newBody({
        clientName: contactDetails.name,
        appointmentType,
        scheduledDate: formattedDate,
        scheduledTime,
      }),
      data: {
        clientName: contactDetails.name,
        clientEmail: contactDetails.email,
        clientPhone: contactDetails.phone,
        appointmentType,
        scheduledDate: formattedDate,
        scheduledTime,
        isGuestBooking,
      },
    });
  } catch (notifError) {
    logger.error(
      "[AppointmentController] Error creating notification",
      notifError
    );
  }
}
```

**B. `updateAppointmentStatus` - Notify client when status changes:**

```typescript
// Create persistent in-app notifications for client (confirmed/rejected/cancelled)
if (process.env.NODE_ENV !== "test" && populatedAppointment.clientId) {
  try {
    await notificationService.create({
      recipientId: populatedAppointment.clientId,
      actorId: agent._id.toString(),
      type: notifType, // 'appointment:confirmed' | 'appointment:rejected' | 'appointment:cancelled'
      entity: {
        type: "appointment",
        id: populatedAppointment._id.toString(),
      },
      title: notifTitle,
      message: notifMessage,
      data: {
        agentName,
        agentAvatar: agent.profileImage,
        appointmentType: populatedAppointment.appointmentType,
        status,
      },
    });
  } catch (notifError) {
    logger.error(
      "[AppointmentController] Error creating status update notification",
      notifError
    );
  }
}
```

**C. `rescheduleAppointment` - Notify client when rescheduled:**

```typescript
// Create persistent in-app notification for client
if (process.env.NODE_ENV !== "test" && populatedAppointment.clientId) {
  try {
    await notificationService.create({
      recipientId: populatedAppointment.clientId,
      actorId: agent._id.toString(),
      type: "appointment:rescheduled",
      entity: {
        type: "appointment",
        id: populatedAppointment._id.toString(),
      },
      title: appointmentTexts.rescheduledTitle,
      message: appointmentTexts.rescheduledBody({
        agentName,
        scheduledDate: formattedDate,
        scheduledTime,
      }),
      data: {
        agentName,
        agentAvatar: agent.profileImage,
        appointmentType: populatedAppointment.appointmentType,
        scheduledDate: formattedDate,
        scheduledTime,
        rescheduleReason,
      },
    });
  } catch (notifError) {
    logger.error(
      "[AppointmentController] Error creating reschedule notification",
      notifError
    );
  }
}
```

### 5. Frontend: Notification Store (`client/store/notifications/index.ts`)

**Updated types to include appointment notifications:**

```typescript
export interface NotificationEntity {
  type: "chat" | "collaboration" | "appointment";
  id: string;
}

export interface NotificationItem {
  type:
    | "chat:new_message"
    | "collab:proposal_received"
    // ... other types ...
    | "appointment:new"
    | "appointment:confirmed"
    | "appointment:rejected"
    | "appointment:cancelled"
    | "appointment:rescheduled";
  // ... rest of fields
}
```

### 6. Frontend: Notification Bell Component (`client/components/notifications/NotificationBell.tsx`)

**Added navigation for appointment notifications:**

```typescript
const handleItemClick = async (
  id: string,
  entity: { type: "chat" | "collaboration" | "appointment"; id: string },
  actorId: string
) => {
  try {
    await markRead(id);
    setOpen(false);
    if (entity.type === "chat") {
      router.push(`/chat?userId=${encodeURIComponent(actorId)}`);
    } else if (entity.type === "collaboration") {
      router.push(`/collaboration/${encodeURIComponent(entity.id)}`);
    } else if (entity.type === "appointment") {
      router.push(`/agent/appointments?id=${encodeURIComponent(entity.id)}`);
    }
  } catch {
    // ignore navigation errors
  }
};
```

### 7. Documentation (`docs/notifications.md`)

Updated to include appointment notification types and triggers.

## Notification Flow

### When Client Books Appointment:

```
Client submits booking form
    ↓
Server creates appointment in DB
    ↓
Server calls notificationService.create()
    ↓
    ├─→ Saves to MongoDB (notifications collection)
    ├─→ Emits Socket.IO event: 'notification:new'
    └─→ Emits Socket.IO event: 'notifications:count'
    ↓
Agent's browser receives socket event
    ↓
    ├─→ Updates notification store (Zustand)
    ├─→ Shows red badge on bell icon
    ├─→ Shows OS notification (if tab hidden)
    └─→ Agent clicks notification → navigates to appointment page
```

### When Agent Responds to Appointment:

```
Agent confirms/rejects/cancels/reschedules
    ↓
Server updates appointment in DB
    ↓
Server calls notificationService.create()
    ↓
    ├─→ Saves to MongoDB
    ├─→ Emits Socket.IO events
    └─→ Sends email to client
    ↓
Client's browser receives notification
    ↓
Client sees notification in bell (if they have account)
```

## Benefits

1. **Unified Notification System**: Appointments now use the same infrastructure as chat and collaboration
2. **Persistent Storage**: Notifications survive page refreshes and reconnections
3. **Real-time Delivery**: Agents see notifications immediately via Socket.IO
4. **Deep Linking**: Click notification → navigate directly to appointment
5. **Unread Counts**: Bell badge shows total unread count including appointments
6. **OS Notifications**: Agents notified even when app is in background
7. **Consistent UX**: All notifications have same look, feel, and behavior

## User Experience

### For Agents:

- **When appointment booked**: Bell icon shows red badge with count
- **Click bell**: See "Nouvelle demande de rendez-vous" with client details
- **Click notification**: Navigate to appointments page with that appointment highlighted
- **Auto mark-as-read**: Opening bell marks all notifications as read

### For Clients (if they have accounts):

- **When agent responds**: Receive notification of confirmation/rejection/cancellation/reschedule
- **Click notification**: Navigate to appointment details
- **Always receive email**: Email sent regardless of account status

### For Anonymous Clients:

- **No in-app notifications** (they don't have accounts)
- **Always receive email**: All appointment updates via email

## Testing Checklist

- [x] Anonymous user books appointment → Agent receives notification
- [x] Agent confirms appointment → Client receives notification (if has account)
- [x] Agent rejects appointment → Client receives notification (if has account)
- [x] Agent cancels appointment → Client receives notification (if has account)
- [x] Agent reschedules appointment → Client receives notification (if has account)
- [x] Notification click navigates to appointment page
- [x] Red badge shows on bell icon
- [x] Opening bell marks all as read
- [x] Notifications persist across page refreshes
- [x] Email notifications still work
- [x] TypeScript compilation succeeds
- [x] No runtime errors

## Files Modified

### Backend:

- `server/src/models/Notification.ts`
- `server/src/services/notificationService.ts`
- `server/src/utils/notificationTexts.ts`
- `server/src/controllers/appointmentController.ts`

### Frontend:

- `client/store/notifications/index.ts`
- `client/components/notifications/NotificationBell.tsx`

### Documentation:

- `docs/notifications.md`
- `docs/appointment-notifications-implementation.md` (new)

## Technical Notes

- Notifications are only created in non-test environments (`process.env.NODE_ENV !== 'test'`)
- Socket.IO emissions are automatically handled by `notificationService.create()`
- Email notifications continue to work independently
- Client notifications only created if `clientId` exists (anonymous bookings may not have clientId initially)
- Date formatting uses French locale: `toLocaleDateString('fr-FR')`
- All error handling is defensive (failures don't break the request)

## Future Enhancements

1. **Notification Preferences**: Allow users to configure which notifications they receive
2. **Push Notifications**: Implement browser push for offline users
3. **Email Digest**: Summarize notifications in daily/weekly emails
4. **Notification Grouping**: Group multiple similar notifications
5. **Appointment Reminders**: Send reminder notifications before appointment time
