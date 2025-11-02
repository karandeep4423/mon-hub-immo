# Appointment Email Guest User Fix

## Issue

Email notifications for appointment actions (confirm, cancel, reschedule) showed "Bonjour undefined undefined" instead of the actual user name for guest/anonymous appointments.

## Root Cause

When agents take actions on appointments booked by anonymous users (guests), the system tried to construct the client name from `client.firstName` and `client.lastName`. However, for guest bookings:

- The `clientId` field may be null or not fully populated
- The actual user information is stored in `appointment.contactDetails.name`

The ternary check `client ? ... : ...` was insufficient because Mongoose's `.populate()` might return a partial/empty object for null references, causing the condition to evaluate to true even when `firstName` and `lastName` were undefined.

## Solution

Updated the client name determination logic in two locations in `appointmentController.ts`:

### 1. Update Appointment Status (Lines 408-413)

**Before:**

```typescript
const clientName = client
  ? `${client.firstName} ${client.lastName}`
  : populatedAppointment.contactDetails.name;
```

**After:**

```typescript
const clientName =
  client && client.firstName && client.lastName
    ? `${client.firstName} ${client.lastName}`
    : populatedAppointment.contactDetails.name;
```

### 2. Reschedule Appointment (Lines 554-559)

Applied the same fix to ensure reschedule emails also use the correct name.

## Email Templates Affected

- Appointment Confirmed (`getAppointmentConfirmedTemplate`)
- Appointment Rejected (`getAppointmentRejectedTemplate`)
- Appointment Cancelled (`getAppointmentCancelledTemplate`)
- Appointment Rescheduled (`getAppointmentRescheduledTemplate`)

## Testing

Test scenarios:

1. ✅ Guest user books appointment → Agent confirms → Email should show guest's name from contactDetails
2. ✅ Guest user books appointment → Agent rejects → Email should show guest's name
3. ✅ Guest user books appointment → Agent reschedules → Email should show guest's name
4. ✅ Guest user books appointment → Agent cancels → Email should show guest's name
5. ✅ Registered user books appointment → All actions → Email should show registered user's firstName + lastName

## Related Files

- `server/src/controllers/appointmentController.ts` - Main fix
- `server/src/services/appointmentEmailService.ts` - Email service
- `server/src/utils/appointmentEmailTemplates.ts` - Email templates
- `server/src/models/Appointment.ts` - Appointment model with contactDetails

## Date

October 31, 2025
