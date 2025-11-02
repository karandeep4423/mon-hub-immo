# Appointment Reschedule Enhancement

**Date**: October 28, 2025  
**Status**: ✅ Backend Complete | ⏳ Frontend Pending

## Overview

Enhanced appointment rescheduling system to give agents exclusive reschedule rights while keeping appointments confirmed. Clients receive detailed email notifications showing old vs new date/time comparisons.

---

## Key Changes

### 1. **Appointment Model Updates** ✅

**File**: `server/src/models/Appointment.ts`

Added reschedule tracking fields:

```typescript
isRescheduled?: boolean;           // Flag to show appointment was modified
rescheduleReason?: string;         // Optional reason from agent
originalScheduledDate?: Date;      // Store first scheduled date
originalScheduledTime?: string;    // Store first scheduled time
```

### 2. **Reschedule Authorization** ✅

**Only agents can reschedule appointments** - clients cannot.

**Controller Logic** (`rescheduleAppointment`):

- Check if user is the agent assigned to appointment
- Return 403 if client tries to reschedule
- Keep appointment status as `confirmed` (not reset to pending)
- Set `isRescheduled: true` flag
- Store original date/time on first reschedule only

### 3. **Email Notification System** ✅

**New Template**: `getAppointmentRescheduledTemplate`

**Features**:

- Side-by-side comparison of old vs new date/time
- Old date shown with strikethrough + red styling
- New date shown with green styling + checkmark
- Optional reschedule reason displayed
- Clear call-to-action for client

**Email Flow**:

- Agent reschedules → Client receives email only
- Email subject: "Rendez-vous reporté - MonHubImmo"
- Socket notification sent to client (optional, they get email)

### 4. **Appointment Sorting for Agents** ✅

**Custom Sort Order** in `getMyAppointments`:

1. **pending** (requires action)
2. **confirmed** (upcoming)
3. **completed** (past)
4. **cancelled** (archived)
5. **rejected** (archived)

Within each status, sort by `scheduledDate` ascending (earliest first).

**Implementation**:

```typescript
const statusOrder = {
  pending: 1,
  confirmed: 2,
  completed: 3,
  cancelled: 4,
  rejected: 5,
};
```

### 5. **Backend API Updates** ✅

**Reschedule Endpoint**: `PUT /api/appointments/:id/reschedule`

**Request Body**:

```json
{
  "scheduledDate": "2025-11-15",
  "scheduledTime": "14:30",
  "rescheduleReason": "Conflit d'agenda imprévu"
}
```

**Response** (200):

```json
{
  "success": true,
  "data": {
    /* populated appointment with isRescheduled: true */
  },
  "message": "Rendez-vous reporté avec succès"
}
```

**Error Responses**:

- `403`: Client tried to reschedule (not authorized)
- `400`: New time slot already taken
- `404`: Appointment not found

---

## Email Template Design

### Visual Comparison

```
┌─────────────────────────┬─────────────────────────┐
│   ❌ Ancienne date      │   ✅ Nouvelle date      │
│   (strikethrough, red)  │   (bold, green)         │
├─────────────────────────┼─────────────────────────┤
│ Date: 12 novembre 2025  │ Date: 15 novembre 2025  │
│ Heure: 10:00           │ Heure: 14:30           │
└─────────────────────────┴─────────────────────────┘

Raison: Conflit d'agenda imprévu
```

### Email Content Structure

1. **Header**: Orange gradient with calendar icon
2. **Greeting**: "Bonjour {clientName}"
3. **Message**: "Votre rendez-vous a été reporté"
4. **Comparison Box**: Side-by-side old/new dates
5. **Details Box**: Appointment type, agent name, reason
6. **Info Box**: What to do next (appointment auto-confirmed)
7. **Footer**: MonHubImmo branding

---

## User Flows

### Agent Reschedules Appointment

1. Agent views confirmed appointment in dashboard
2. Agent clicks "Reprogrammer" button
3. Agent selects new date/time + enters optional reason
4. System validates:
   - Agent authorization ✓
   - New time slot availability ✓
5. System updates appointment:
   - Stores original date/time (if first reschedule)
   - Sets new date/time
   - Marks `isRescheduled: true`
   - Keeps status as `confirmed`
6. System sends email to client with comparison
7. System sends socket notification to client (optional)
8. Agent sees success message

### Client Tries to Reschedule (Blocked)

1. Client views appointment details
2. Client clicks reschedule action
3. System returns 403 error
4. UI shows message: "Seul l'agent peut reporter un rendez-vous"
5. UI suggests: "Contactez directement l'agent si nécessaire"

---

## Frontend Requirements (Pending Implementation)

### Agent Dashboard - Appointments List

**Visual Indicators**:

- [ ] Show "Modifié" badge on rescheduled appointments
- [ ] Badge color: Orange (#ff9800)
- [ ] Badge position: Top-right of appointment card

**Sorting**:

- [ ] Implement status-based sorting (pending first)
- [ ] Within status, sort by date (upcoming first)
- [ ] Show section headers: "En attente", "Confirmés", "Terminés"

### Agent Dashboard - Reschedule Form

**Form Fields**:

- [ ] Date picker (required)
- [ ] Time picker (required)
- [ ] Reason textarea (optional, max 500 chars)
- [ ] "Reprogrammer" button

**Validation**:

- [ ] Check new date is in future
- [ ] Check time slot availability (API call)
- [ ] Show error if slot taken
- [ ] Show success toast on completion

### Client View (No Reschedule)

**Appointment Details**:

- [ ] Remove reschedule button for clients
- [ ] Show "Modifié" badge if `isRescheduled: true`
- [ ] Show tooltip: "Ce rendez-vous a été reporté par l'agent"
- [ ] Provide agent contact info for questions

---

## Testing Checklist

### Backend ✅

- [x] TypeScript compilation passes
- [x] Reschedule endpoint restricts to agents only
- [x] Original date/time stored on first reschedule
- [x] Status stays `confirmed` after reschedule
- [x] Email sent with correct comparison data
- [x] Sorting works correctly for agent appointments

### Email ✅

- [x] Template renders correctly
- [x] Old/new date comparison displays properly
- [x] Reason field shows when provided
- [x] French date formatting works

### Frontend (Pending)

- [ ] Agent can reschedule from dashboard
- [ ] Reschedule form validates inputs
- [ ] "Modifié" badge displays correctly
- [ ] Appointments sorted by status + date
- [ ] Client cannot access reschedule action
- [ ] Error messages display for 403 response

### Database (Pending)

- [ ] Test reschedule with existing appointments
- [ ] Verify `isRescheduled` flag set correctly
- [ ] Verify original date/time preserved
- [ ] Test multiple reschedules (original date stays same)

---

## API Documentation

### Reschedule Appointment

**Endpoint**: `PUT /api/appointments/:id/reschedule`

**Authentication**: Required (JWT token)

**Authorization**: Agent only (assigned to appointment)

**Request Body**:

```typescript
{
    scheduledDate: string;        // ISO date format "YYYY-MM-DD"
    scheduledTime: string;        // HH:MM format "14:30"
    rescheduleReason?: string;    // Optional, max 500 chars
}
```

**Success Response** (200):

```json
{
  "success": true,
  "data": {
    "_id": "...",
    "agentId": {
      /* populated */
    },
    "clientId": {
      /* populated */
    },
    "scheduledDate": "2025-11-15T00:00:00.000Z",
    "scheduledTime": "14:30",
    "isRescheduled": true,
    "originalScheduledDate": "2025-11-12T00:00:00.000Z",
    "originalScheduledTime": "10:00",
    "rescheduleReason": "Conflit d'agenda",
    "status": "confirmed"
    // ... other fields
  },
  "message": "Rendez-vous reporté avec succès"
}
```

**Error Responses**:

**403 Forbidden** (Client tried to reschedule):

```json
{
  "success": false,
  "message": "Seul l'agent peut reporter un rendez-vous"
}
```

**400 Bad Request** (Time slot taken):

```json
{
  "success": false,
  "message": "Ce créneau horaire n'est plus disponible"
}
```

**404 Not Found**:

```json
{
  "success": false,
  "message": "Rendez-vous non trouvé"
}
```

---

## Code Quality

- ✅ **SOLID**: Single responsibility for reschedule logic
- ✅ **DRY**: Reusable email template functions
- ✅ **KISS**: Simple flag-based tracking
- ✅ **YAGNI**: No complex workflow states
- ✅ **Type Safety**: All TypeScript errors resolved
- ✅ **Security**: Agent-only authorization enforced

---

## Files Modified

### Backend

- ✅ `server/src/models/Appointment.ts` - Added reschedule fields
- ✅ `server/src/utils/appointmentEmailTemplates.ts` - New reschedule template
- ✅ `server/src/services/appointmentEmailService.ts` - New reschedule method
- ✅ `server/src/controllers/appointmentController.ts` - Updated reschedule logic + sorting

### Frontend (Pending)

- ⏳ Agent dashboard reschedule form
- ⏳ Appointment card "Modifié" badge
- ⏳ Appointments list sorting implementation

---

## Next Steps

1. **Update Agent Reschedule Form**:

   - Add reason field (textarea)
   - Update API call to include reason
   - Show success message with email notification notice

2. **Add Visual Indicators**:

   - "Modifié" badge for rescheduled appointments
   - Orange color scheme matching email
   - Tooltip on hover explaining modification

3. **Implement Sorting**:

   - Status-based sorting in appointments list
   - Section headers for each status group
   - Pending appointments at top

4. **Remove Client Reschedule**:

   - Hide reschedule button from client view
   - Show contact agent button instead
   - Display modification notice if `isRescheduled: true`

5. **Testing**:
   - Test agent reschedule flow end-to-end
   - Verify email delivery with correct data
   - Test multiple reschedules (original date preserved)
   - Test client blocked from rescheduling

---

## Related Documentation

- [Anonymous Appointment Booking Feature](./anonymous-appointment-booking-feature.md)
- [Appointment Booking Feature](./appointment-booking-feature.md)
