# Collaboration Workflow - Sequential Validation Enhancement

**Date:** 2025-01-23  
**Status:** ✅ Completed

## Overview

Implemented comprehensive enhancements to the collaboration workflow to enforce sequential step validation, require "Affaire conclue" before completion, add completion reason tracking, and prevent jumping steps.

## Key Requirements Implemented

### 1. ✅ Sequential Step Validation

- **Requirement:** Users cannot jump steps; must validate each step sequentially
- **Implementation:**
  - Added `canValidateStep()` function in `ProgressTracker.tsx`
  - Checks if all previous steps are validated by BOTH users before allowing current step
  - Updates checkbox `disabled` attribute dynamically
  - Leverages existing `STEP_ORDER` constant for sequential checking

### 2. ✅ "Termine" → "Complété" Terminology Change

- **Files Updated:** 7 files across the codebase
  - `client/lib/constants/features/collaboration.ts` (3 locations)
  - `client/lib/constants/pages/collaboration-detail.ts`
  - `client/components/collaboration/overall-status/OverallStatusManager.tsx`
  - `client/components/collaboration/CollaborationCard.tsx`
  - Other component references

### 3. ✅ Completion Reason Selection

- **New Component:** `CompletionReasonModal.tsx`
  - 7 predefined completion reasons with icons and colors:
    - ✅ Vente conclue via collaboration (green)
    - ✅ Vente conclue par moi seul (green)
    - ❌ Bien retiré du marché (red)
    - ❌ Mandat expiré (red)
    - 🚫 Client désisté (orange)
    - 🏘️ Vendu par un tiers (orange)
    - 📋 Sans suite (gray)
  - Modal with styled radio buttons
  - Validation: requires selection before confirmation

### 4. ✅ "Affaire conclue" Validation Requirement

- **Backend Validation:** `server/src/controllers/collaborationController.ts`
  - `completeCollaboration()` checks if "Affaire conclue" validated by both parties
  - Returns 400 error if not validated
- **Frontend Logic:** `OverallStatusManager.tsx`
  - `isAffaireConclueValidated()` helper function
  - Only shows "Complété" button when "Affaire conclue" validated by both
  - Shows amber warning notice when requirement not met

### 5. ✅ Lock After Completion

- **Backend:** Collaboration status = "completed" is terminal state
- **Frontend:** `isReadOnly` check prevents edits when status is "completed", "cancelled", or "rejected"
- **UI:** Gray notice displayed for final states

## Database Schema Changes

### Collaboration Model (`server/src/models/Collaboration.ts`)

```typescript
completionReason: {
    type: String,
    enum: [
        'vente_conclue_collaboration',
        'vente_conclue_seul',
        'bien_retire',
        'mandat_expire',
        'client_desiste',
        'vendu_tiers',
        'sans_suite',
    ],
},
completedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
},
completedByRole: {
    type: String,
    enum: ['owner', 'collaborator'],
},
```

## API Changes

### Backend Endpoint

**Endpoint:** `POST /api/collaboration/:id/complete`

**Request Body:**

```json
{
  "completionReason": "vente_conclue_collaboration"
}
```

**Validation:**

- Requires "Affaire conclue" step validated by both owner and collaborator
- Returns 400 if validation requirement not met
- Returns 400 if completionReason is missing

### Frontend API Layer

**Updated Files:**

- `client/lib/api/collaborationApi.ts` - Added params for completionReason
- `client/lib/api/collaboration/overallStatusApi.ts` - Added params support
- `client/hooks/useCollaborations.ts` - Updated hook to accept completionReason

## Component Updates

### ProgressTracker (`client/components/collaboration/progress-tracking/ProgressTracker.tsx`)

**Changes:**

- Added `canValidateStep(stepId)` helper function
- Updated owner checkbox disabled logic: `!canValidateStep(stepId) || stepData?.ownerValidated || !canUpdate || !isOwner`
- Updated collaborator checkbox disabled logic: `!canValidateStep(stepId) || stepData?.collaboratorValidated || !canUpdate || !isCollaborator`

### OverallStatusManager (`client/components/collaboration/overall-status/OverallStatusManager.tsx`)

**Changes:**

- Added `progressSteps` prop to receive step validation data
- Added `isAffaireConclueValidated()` helper function
- Conditional rendering of "Complété" button based on "Affaire conclue" validation
- Added amber warning notice when requirement not met

### Collaboration Detail Page (`client/app/collaboration/[id]/page.tsx`)

**Changes:**

- Added `showCompletionReasonModal` state
- Added `handleCompletionReasonSubmit()` callback
- Updated `handleOverallStatusUpdate()` to open completion modal instead of confirm dialog for "completed" status
- Pass `progressSteps` to `OverallStatusManager`
- Render `CompletionReasonModal` component

## Type Updates

### Frontend Types (`client/types/collaboration.ts`)

```typescript
completionReason?: 'vente_conclue_collaboration' | 'vente_conclue_seul' | 'bien_retire' | 'mandat_expire' | 'client_desiste' | 'vendu_tiers' | 'sans_suite';
completedBy?: string;
completedByRole?: 'owner' | 'collaborator';
```

## User Flow

### Happy Path: Complete Collaboration

1. Users progress through steps sequentially (both validating each step)
2. Users reach and validate "Affaire conclue" step (both parties)
3. "Complété" button becomes enabled
4. User clicks "Complété"
5. `CompletionReasonModal` opens
6. User selects one of 7 completion reasons
7. User clicks "Confirmer"
8. Backend validates "Affaire conclue" requirement
9. Backend saves completionReason, completedBy, completedByRole
10. Collaboration status set to "completed"
11. UI locked (read-only mode)

### Error Cases

- **Jump Steps:** Checkboxes disabled, cannot validate out of order
- **Missing "Affaire conclue":** "Complété" button hidden, amber warning shown
- **No Reason Selected:** Modal confirmation button disabled
- **Backend Validation Failure:** Toast error message displayed

## Testing Checklist

- [ ] Test sequential validation: try to validate step 3 before step 2 is complete
- [ ] Test "Affaire conclue" requirement: click "Complété" without validating "Affaire conclue"
- [ ] Test completion reason modal: ensure all 7 options work
- [ ] Test UI lock: verify no edits allowed after completion
- [ ] Test dual validation: ensure both owner and collaborator must validate each step
- [ ] Test terminology: verify "Complété" appears everywhere (not "Termine")
- [ ] Test collaboration detail page: ensure modal opens on "Complété" click
- [ ] Test backend validation: attempt completion without "Affaire conclue" (should fail)

## Files Changed

### Backend

- `server/src/models/Collaboration.ts` - Schema updates
- `server/src/controllers/collaborationController.ts` - Completion validation logic

### Frontend

**New Files:**

- `client/components/collaboration/CompletionReasonModal.tsx` - 167 lines

**Modified Files:**

- `client/components/collaboration/progress-tracking/ProgressTracker.tsx` - Sequential validation
- `client/components/collaboration/overall-status/OverallStatusManager.tsx` - "Affaire conclue" check
- `client/components/collaboration/overall-status/types.ts` - Added progressSteps prop
- `client/app/collaboration/[id]/page.tsx` - Modal integration
- `client/hooks/useCollaborations.ts` - API param updates
- `client/lib/api/collaborationApi.ts` - Signature updates
- `client/lib/api/collaboration/overallStatusApi.ts` - Param support
- `client/types/collaboration.ts` - Type definitions
- `client/lib/constants/features/collaboration.ts` - Terminology changes
- `client/lib/constants/pages/collaboration-detail.ts` - Terminology changes
- `client/components/collaboration/CollaborationCard.tsx` - Button text

**Total:** 13 files modified, 1 file created

## Next Steps

1. **Manual Testing:** Test entire flow with two users
2. **Display Completion Reason:** Add UI to show completion reason after completion (next task)
3. **Analytics:** Track completion reasons for business insights
4. **Documentation:** Update user documentation with new workflow

## Notes

- Backend build successful ✅
- No TypeScript compilation errors ✅
- All constants centralized in constants files ✅
- Sequential validation uses existing STEP_ORDER constant ✅
- Completion reason stored with user reference for audit trail ✅
