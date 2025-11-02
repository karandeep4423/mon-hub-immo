# Notifications

This system delivers real-time and persisted notifications for cross-user activities (agents, apporteurs, and clients).

## Model

- Collection: `notifications`
- Fields: recipientId, actorId, type, entity { type: 'chat'|'collaboration'|'appointment', id }, title, message, data, read, readAt, createdAt
- Indexes: (recipientId, createdAt desc), (recipientId, read, createdAt desc)

Types:

- chat:new_message
- collab:proposal_received|accepted|rejected|progress_updated|cancelled|completed|note_added|activated
- contract:updated|signed
- appointment:new|confirmed|rejected|cancelled|rescheduled

## REST API

- GET /api/notifications?cursor&limit – cursor pagination (by createdAt)
- GET /api/notifications/count – unread count
- PATCH /api/notifications/:id/read – mark read
- PATCH /api/notifications/read-all – mark all read
- DELETE /api/notifications/:id – remove

Auth: All endpoints require JWT (authenticateToken).

## Socket events

- notification:new { notification }
- notifications:count { unreadCount }
- notification:read { id }
- notifications:readAll

Server emits after DB changes. Emissions are skipped during unit tests.

## Client store usage

- Hook: `useNotifications`
  - Loads list + count; subscribes to socket events
  - Actions: loadMore, markRead, markAllRead, remove
  - OS notifications: shown when tab is hidden; throttled; de-duplicated in-memory

Deep links:

- entity.type === 'chat' -> /chat?userId={actorId}
- entity.type === 'collaboration' -> /collaboration/{entity.id}
- entity.type === 'appointment' -> /agent/appointments?id={entity.id}

## Notes

- Cursor: ISO timestamp of the last item
- Limit: 1..50 (default 20)

# Notifications

This feature adds persisted + real-time notifications across chat, collaboration, contract, and appointment flows.

## Server

- Model: `Notification` with typed `NotificationType`.
- Service: `notificationService` (create/list/count/markRead/markAllRead/delete) emits socket events except in tests.
- Routes: `/api/notifications` (list, count, mark read, mark all, delete) with auth + zod validation.
- Socket events:
  - `notification:new` — single notification payload
  - `notifications:count` — unread counter updates
  - `notification:read`, `notifications:readAll`

## Triggers

- Chat
  - On message sent: `chat:new_message` to receiver (skip self; skip if receiver is viewing that chat)
- Collaboration
  - proposeCollaboration: `collab:proposal_received` → property owner
  - respondToCollaboration: `collab:proposal_accepted|rejected` → collaborator
  - updateProgressStatus: `collab:progress_updated` → opposite party
  - cancelCollaboration: `collab:cancelled` → opposite party
  - addCollaborationNote: `collab:note_added` → opposite party
  - signCollaboration: `contract:signed` → opposite party; when both signed also `collab:activated`
- Contract
  - updateContract: `contract:updated` → opposite party (and signatures reset)
  - signContract: `contract:signed` → opposite party; when both signed also `collab:activated`
- Appointments
  - createAppointment: `appointment:new` → agent (when client/guest books appointment)
  - updateAppointmentStatus (confirmed): `appointment:confirmed` → client
  - updateAppointmentStatus (rejected): `appointment:rejected` → client
  - updateAppointmentStatus (cancelled): `appointment:cancelled` → client
  - rescheduleAppointment: `appointment:rescheduled` → client (with new date/time)

## API

- GET `/api/notifications?cursor=ISO&limit=20`
- GET `/api/notifications/count`
- PATCH `/api/notifications/:id/read`
- PATCH `/api/notifications/read-all`
- DELETE `/api/notifications/:id`

## Notes

- Cursor pagination by createdAt.
- Unread counts broadcast after changes.
- Socket side-effects are disabled in `NODE_ENV=test` to keep unit tests fast.
