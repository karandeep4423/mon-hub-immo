# Anonymous Appointment Booking Feature

**Date**: January 2025  
**Status**: ✅ Backend Complete | ⏳ Frontend Pending

## Overview

Refactored appointment system to support **anonymous booking via /monagentimmo** without authentication. Removed appointment management from apporteur dashboard and replaced in-app notifications with email notifications for clients.

---

## Key Changes

### 1. Removed Apporteur Dashboard Features ✅

**File**: `client/components/dashboard-apporteur/Home.tsx`

- Removed appointments tab from dashboard
- Removed `appointmentStats` state and API calls
- Removed `AppointmentsManager` component import and usage
- Apporteurs no longer manage appointments

### 2. Database Schema Updates ✅

**Appointment Model** (`server/src/models/Appointment.ts`):

```typescript
clientId?: Types.ObjectId;  // Optional for guest bookings
isGuestBooking: boolean;     // Track anonymous bookings
```

**User Model** (`server/src/models/User.ts`):

```typescript
userType: "agent" | "apporteur" | "guest"; // Added guest type
isGuest: boolean; // Flag for guest accounts
```

### 3. Email Notification System ✅

**New Files**:

- `server/src/utils/appointmentEmailTemplates.ts` - 5 French email templates:

  - `getNewAppointmentClientTemplate` - Client confirmation on booking
  - `getNewAppointmentAgentTemplate` - Agent notification (only on new booking)
  - `getAppointmentConfirmedTemplate` - Client notification on confirmation
  - `getAppointmentRejectedTemplate` - Client notification on rejection
  - `getAppointmentCancelledTemplate` - Client notification on cancellation

- `server/src/services/appointmentEmailService.ts` - Email service methods:
  - `sendNewAppointmentEmails(appointment, agent, clientEmail, clientName)`
  - `sendAppointmentConfirmedEmail(appointment, agent, clientEmail, clientName)`
  - `sendAppointmentRejectedEmail(appointment, agent, clientEmail, clientName)`
  - `sendAppointmentCancelledEmail(appointment, agent, clientEmail, clientName)`

**Email Flow**:

- **New Booking**: Email to both client (confirmation) and agent (notification)
- **Status Changes**: Email to client only
- **Socket Notifications**: Agent only (clients get emails)

### 4. Authentication Updates ✅

**File**: `server/src/middleware/auth.ts`

Added `optionalAuth` middleware:

```typescript
export const optionalAuth = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (token) {
    // Attach user if token present
    // Continue without error if no token
  }
  next();
};
```

**File**: `server/src/routes/appointments.ts`

```typescript
router.post("/", optionalAuth, createAppointment); // Was authenticateToken
```

### 5. Controller Updates ✅

**File**: `server/src/controllers/appointmentController.ts`

**createAppointment**:

- Accepts optional `req.user.id` (undefined for guests)
- Creates guest User records for anonymous bookings:
  ```typescript
  const guestUser = new User({
    firstName,
    lastName,
    email,
    phone,
    userType: "guest",
    isGuest: true,
    // ... minimal fields
  });
  ```
- Sends email notifications via `appointmentEmailService.sendNewAppointmentEmails()`
- Sends socket notification only to agent

**updateAppointmentStatus**:

- Handles optional `clientId` with type guards
- Sends appropriate email based on status:
  - `confirmed` → `sendAppointmentConfirmedEmail()`
  - `rejected` → `sendAppointmentRejectedEmail()`
  - `cancelled` → `sendAppointmentCancelledEmail()`
- Sends socket notification only to agent (clients get emails)

**getAppointment** & **rescheduleAppointment**:

- Updated authorization checks to handle optional `clientId`:
  ```typescript
  const isClient = appointment.clientId
    ? appointment.clientId.toString() === userId
    : false;
  ```

### 6. Migration Script ✅

**File**: `server/src/scripts/clearAppointments.ts`

Deletes all existing appointments and agent availabilities:

```bash
npm run migrate:clear-appointments
```

**Added to** `server/package.json`:

```json
"scripts": {
    "migrate:clear-appointments": "ts-node src/scripts/clearAppointments.ts"
}
```

---

## Architecture Decisions

### Guest User Pattern

- Create full User records for anonymous bookings (not just storing email)
- Enables future features (booking history, account upgrade)
- Maintains data integrity with foreign keys

### Email-First Communication

- Clients receive emails for all appointment updates
- Agents receive ONE email on new booking only
- Agents still get real-time socket notifications in dashboard
- Reduces cognitive load (clients check email, agents check dashboard)

### Optional Authentication

- `optionalAuth` middleware allows public booking endpoint
- Pre-fills form if user logged in (better UX)
- Maintains security for other operations

---

## Testing Checklist

### Backend ✅

- [x] TypeScript compilation passes
- [x] Optional `clientId` handled in all functions
- [x] Email service integrated in controllers
- [x] Migration script ready

### Frontend (Pending)

- [ ] `/monagentimmo` booking form works without login
- [ ] Form pre-fills user data if logged in
- [ ] Success message shows email confirmation notice
- [ ] No console errors on anonymous booking

### Database (Pending)

- [ ] Run migration script: `npm run migrate:clear-appointments`
- [ ] Verify appointments collection empty
- [ ] Test guest user creation
- [ ] Verify emails sent on booking

---

## Next Steps

1. **Update Frontend Booking Form** (`/monagentimmo`):

   - Remove authentication requirement
   - Add email/phone fields for guests
   - Pre-fill if user logged in
   - Show success message with email confirmation notice

2. **Run Migration**:

   ```bash
   cd server
   npm run migrate:clear-appointments
   ```

3. **Test Email Delivery**:

   - Create anonymous booking
   - Verify both client and agent receive emails
   - Confirm/reject appointment
   - Verify client receives status email

4. **Update Documentation**:
   - Add API docs for public booking endpoint
   - Document guest user lifecycle

---

## Files Modified

### Backend

- ✅ `server/src/models/Appointment.ts`
- ✅ `server/src/models/User.ts`
- ✅ `server/src/middleware/auth.ts`
- ✅ `server/src/routes/appointments.ts`
- ✅ `server/src/controllers/appointmentController.ts`
- ✅ `server/src/utils/appointmentEmailTemplates.ts` (new)
- ✅ `server/src/services/appointmentEmailService.ts` (new)
- ✅ `server/src/scripts/clearAppointments.ts` (new)
- ✅ `server/package.json`

### Frontend

- ✅ `client/components/dashboard-apporteur/Home.tsx`
- ⏳ `client/app/monagentimmo/page.tsx` (pending)

---

## Code Quality

- ✅ **SOLID**: Single responsibility for email service
- ✅ **DRY**: Reusable email templates and service methods
- ✅ **KISS**: Simple guest user pattern
- ✅ **YAGNI**: No unused features added
- ✅ **Type Safety**: All TypeScript errors resolved
