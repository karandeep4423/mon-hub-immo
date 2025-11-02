# Appointment Cards - Message Button Feature

**Date**: October 16, 2025  
**Status**: ✅ Completed

## Overview

Added "Message" button to appointment cards in both Agent and Apporteur "Mes RDV" sections, enabling direct chat communication between agents and clients from appointment cards.

## Problem

Previously, users viewing appointments had to:

- Navigate separately to the chat page
- Search for the person they wanted to message
- No direct connection between appointments and messaging

This created friction in communication around appointments.

## Solution

### Added Message Button to Appointment Cards

Both agent and apporteur appointment cards now feature a **Message** button that:

- Is always visible (regardless of appointment status)
- Opens chat with the other party involved in the appointment
- Uses consistent cyan/blue branding
- Positioned on the left side of action buttons row

### Button Placement

The action buttons section now uses `justify-between` layout:

- **Left side**: Message button
- **Right side**: Status-specific action buttons (Accept/Refuse, Reschedule/Cancel)

## Implementation Details

### Files Modified

**Client:**

1. **`client/components/appointments/AgentAppointments.tsx`**

   - Added `useRouter` import from Next.js
   - Added router instance
   - Modified action buttons container to use `justify-between`
   - Added Message button for client communication
   - Wrapped status-specific buttons in nested div

2. **`client/components/appointments/ApporteurAppointments.tsx`**
   - Added `useRouter` import from Next.js
   - Added router instance
   - Modified action buttons container to use `justify-between`
   - Added Message button for agent communication
   - Wrapped status-specific buttons in nested div

### Key Code Patterns

#### Agent View (Messages Client)

```tsx
{
  /* Message Button - Always visible for client */
}
{
  typeof appointment.clientId === "object" && appointment.clientId && (
    <Button
      onClick={() => router.push(`/chat?userId=${appointment.clientId._id}`)}
      variant="outline"
      className="border-2 border-cyan-500 text-cyan-600 hover:bg-cyan-50 shadow-md hover:shadow-lg transition-all"
      size="sm"
    >
      <svg className="w-4 h-4 mr-2">{/* Chat icon */}</svg>
      Message
    </Button>
  );
}
```

#### Apporteur View (Messages Agent)

```tsx
{
  /* Message Button - Always visible for agent */
}
{
  typeof appointment.agentId === "object" && appointment.agentId && (
    <Button
      onClick={() => router.push(`/chat?userId=${appointment.agentId._id}`)}
      variant="outline"
      className="border-2 border-cyan-500 text-cyan-600 hover:bg-cyan-50 shadow-md hover:shadow-lg transition-all"
      size="sm"
    >
      <svg className="w-4 h-4 mr-2">{/* Chat icon */}</svg>
      Message
    </Button>
  );
}
```

#### Action Buttons Layout

```tsx
<div className="flex items-center justify-between gap-3 pt-4 border-t-2 border-gray-200">
  {/* Message Button - Left side */}
  <Button>Message</Button>

  {/* Status-specific buttons - Right side */}
  <div className="flex items-center gap-3">
    <Button>Reprogrammer</Button>
    <Button>Annuler</Button>
  </div>
</div>
```

### Design Consistency

**Message Button Styling:**

- Border: `border-2 border-cyan-500`
- Text: `text-cyan-600`
- Hover: `hover:bg-cyan-50`
- Shadow: `shadow-md hover:shadow-lg`
- Icon: Chat bubble with dots
- Size: `sm` (consistent with other buttons)

## User Flow

### Agent Messaging Client

1. Agent views appointment card in "Mes RDV"
2. Sees client information with avatar
3. Clicks "Message" button on left side
4. Redirects to `/chat?userId={clientId}`
5. Chat opens with selected client

### Apporteur Messaging Agent

1. Apporteur views appointment card in "Mes RDV"
2. Sees agent information with avatar
3. Clicks "Message" button on left side
4. Redirects to `/chat?userId={agentId}`
5. Chat opens with selected agent

## Benefits

### User Experience

- ✅ Direct communication from appointment context
- ✅ No need to navigate to chat separately
- ✅ One-click access to relevant conversation
- ✅ Always available regardless of appointment status

### Business Logic

- ✅ Encourages communication around appointments
- ✅ Reduces friction in appointment coordination
- ✅ Keeps appointment context when messaging
- ✅ Seamless integration with existing chat

### Technical Benefits

- ✅ Uses existing chat infrastructure
- ✅ Simple query parameter navigation
- ✅ Type-safe checks for populated user objects
- ✅ Consistent button styling and behavior

## Button States & Conditions

### When Message Button Appears

**Agent Cards:**

- Always visible if `appointment.clientId` is populated as object
- Hidden if client data not populated (string ID only)

**Apporteur Cards:**

- Always visible if `appointment.agentId` is populated as object
- Hidden if agent data not populated (string ID only)

### Action Buttons by Status

**Pending Appointments:**

- Message button (left)
- Accept + Refuse buttons (right) - Agent only

**Confirmed Appointments:**

- Message button (left)
- Reschedule + Cancel buttons (right)

**Cancelled/Completed Appointments:**

- Message button (left)
- No action buttons (right)

## Navigation Pattern

All message buttons use the same URL pattern:

```
/chat?userId={targetUserId}
```

The chat page should handle the `userId` query parameter to:

1. Open conversation with that user
2. Initialize chat if no previous conversation
3. Focus the message input

## Testing Checklist

- [ ] Agent can message client from pending appointment
- [ ] Agent can message client from confirmed appointment
- [ ] Agent can message client from cancelled appointment
- [ ] Apporteur can message agent from pending appointment
- [ ] Apporteur can message agent from confirmed appointment
- [ ] Apporteur can message agent from cancelled appointment
- [ ] Button has correct hover states
- [ ] Chat opens with correct user when clicked
- [ ] Button only appears when user data is populated
- [ ] Layout works on mobile (responsive)

## Responsive Behavior

The button layout adapts to screen sizes:

- **Desktop**: Message button left, action buttons right with space between
- **Tablet**: Same layout with slightly reduced spacing
- **Mobile**: Buttons may wrap to multiple rows if needed (flex-wrap behavior)

## Future Enhancements

Potential improvements:

1. Show unread message count badge on button
2. Quick message preview on hover
3. "Send quick message" dropdown without leaving page
4. Typing indicator if other party is currently typing
5. Last message timestamp below button
