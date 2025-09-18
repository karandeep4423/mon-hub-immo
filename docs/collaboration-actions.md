# Collaboration Actions Wiring

This document summarizes the role-based actions and API wiring for the collaboration details page (`app/collaboration/[id]/page.tsx`).

## Permissions

- Property owner (isOwner=true):
  - When pending: Accept or Reject the collaboration.
- Request initiator / collaborator (isCollaborator=true):
  - When pending: Cancel the request.
- Both parties:
  - When accepted: Sign contract to activate (opens contract modal).
  - When active: Terminate (sets status to completed) and Cancel.

## UI Components

- `OverallStatusManager` (client/components/collaboration/overall-status/OverallStatusManager.tsx)
  - Now takes `isOwner` and `isCollaborator` props to filter available actions by role.
  - Emits `onStatusUpdate(newStatus)` where newStatus is one of: pending | accepted | active | completed | cancelled | rejected.

## API Mapping

- Accept/Reject (owner only): POST `/collaboration/:id/respond` via `collaborationApi.respond(id, { response: 'accepted'|'rejected' })`.
- Cancel (either party, server enforces rules): DELETE `/collaboration/:id/cancel` via `collaborationApi.cancel(id)`.
- Sign (either party after accepted):
  - Opens `ContractModal` which handles the signing via POST `/contract/:id/sign` through `contractApi.signContract(id)`.
- Terminate (when active): POST `/collaboration/:id/complete` via `collaborationApi.complete(id)` - properly sets status to 'completed'.

## Contract Template Auto-Generation

- When fetching a contract via GET `/contract/:id`, if the collaboration has no contract text, the server automatically generates a default template including:
  - Party names and roles
  - Commission split percentages
  - Standard collaboration terms
  - Current date
- Users can then edit this template if needed before signing.

## Notes

- The contract modal opens when clicking "Signer le contrat" on accepted collaborations.
- Both parties can edit the contract content, which resets signatures when modified.
- Terminate now properly sets the collaboration status to 'completed' instead of just updating progress steps.
- Default contract templates are auto-generated to provide a starting point for users.
