# Collaboration Workflow - Dual Validation System

## Overview

Implemented a new collaboration workflow system where both agents (owner and collaborator) must independently validate each step before it's considered complete. Each agent can add notes when validating, which are displayed with their avatar and name.

## Changes Made

### 1. Updated Progress Steps

**Old Steps:**

- proposal
- accepted
- visit_planned
- visit_completed
- negotiation
- offer_made
- compromise_signed
- final_act

**New Steps (From Screenshot):**

- `accord_collaboration` - Accord de collaboration
- `premier_contact` - Premier contact client
- `visite_programmee` - Visite programmée
- `visite_realisee` - Visite réalisée
- `retour_client` - Retour client

### 2. Database Schema Changes (`server/src/models/Collaboration.ts`)

#### progressSteps Schema

```typescript
progressSteps: [
  {
    id: ProgressStep,
    completed: boolean,
    validatedAt: Date, // Date when first agent validated
    ownerValidated: boolean, // Owner's validation status
    collaboratorValidated: boolean, // Collaborator's validation status
    notes: [
      {
        note: string,
        createdBy: ObjectId, // Agent who added the note
        createdAt: Date,
      },
    ],
  },
];
```

#### Key Changes:

- Removed `completedAt` and `completedBy` fields
- Added `validatedAt` (set when first agent validates)
- Added `ownerValidated` and `collaboratorValidated` booleans
- Changed `notes` from single string to array of note objects

#### updateProgressStatus Method

- Added `validatedBy: 'owner' | 'collaborator'` parameter
- Updates respective validation field (ownerValidated or collaboratorValidated)
- Sets `validatedAt` on first validation
- Marks step as `completed` only when BOTH agents have validated
- Supports multiple notes per step

### 3. Backend API Changes

#### Controller (`server/src/controllers/collaborationController.ts`)

- Updated `updateProgressStatus` endpoint to require `validatedBy` parameter
- Added validation for `validatedBy` field
- Updated valid steps list to new workflow steps
- Enhanced notification with step titles and validation info
- Allow updates on 'accepted' status (not just 'active')

#### Validation Middleware (`server/src/middleware/validation.ts`)

- Added validation for `validatedBy` field
- Updated `targetStep` enum to new workflow steps

### 4. Frontend Components

#### New Component: StepValidationModal

**Location:** `client/components/collaboration/progress-tracking/StepValidationModal.tsx`

Features:

- Confirmation modal when agent clicks checkbox
- Shows step icon and title
- Optional note input (500 char max)
- Displays agent role (Propriétaire/Collaborateur)
- Async submission handling

#### Updated Component: ProgressTracker

**Location:** `client/components/collaboration/progress-tracking/ProgressTracker.tsx`

Key Changes:

- **Two checkboxes per step:**
  - "J'ai validé l'accord" - For owner
  - "Autre agent validé" - For collaborator
- Checkboxes are:
  - Enabled only for the user's role
  - Disabled once validated
  - Show green checkmark when validated
- **Notes display:**
  - Shows all notes below each step
  - Each note includes:
    - Agent avatar (ProfileAvatar component)
    - Agent name
    - Timestamp
    - Note text
- **Date display:**
  - Shows `validatedAt` date when first agent validates
  - Format: DD/MM/YYYY

#### Props Added:

- `isOwner?: boolean` - Whether user is property owner
- `isCollaborator?: boolean` - Whether user is collaborator

### 5. Type Definitions

#### Client Types (`client/components/collaboration/progress-tracking/types.ts`)

```typescript
export interface StepNote {
  note: string;
  createdBy: {
    _id: string;
    firstName?: string;
    lastName?: string;
    profileImage?: string | null;
  };
  createdAt: string;
}

export interface ProgressStepData {
  id: ProgressStep;
  title: string;
  description: string;
  completed: boolean;
  current: boolean;
  validatedAt?: string;
  ownerValidated: boolean;
  collaboratorValidated: boolean;
  notes: StepNote[];
}

export interface ProgressStatusUpdate {
  targetStep: ProgressStep;
  notes?: string;
  validatedBy: "owner" | "collaborator";
}
```

#### Global Types (`client/types/collaboration.ts`)

- Updated `ProgressStepData` interface to match new structure
- Updated `Collaboration.currentProgressStep` to use new steps
- Updated `Collaboration.progressSteps` to use new structure

### 6. Constants

**File:** `client/lib/constants/stepOrder.ts`

```typescript
export const STEP_ORDER: ProgressStep[] = [
  "accord_collaboration",
  "premier_contact",
  "visite_programmee",
  "visite_realisee",
  "retour_client",
];
```

### 7. Page Updates

**File:** `client/app/collaboration/[id]/page.tsx`

- Updated data transformation to map new fields
- Pass `isOwner` and `isCollaborator` to ProgressTracker
- Updated default steps initialization

## User Flow

### Validation Process:

1. Agent navigates to collaboration detail page
2. Sees list of workflow steps with two checkboxes each
3. Clicks their checkbox (owner or collaborator)
4. Confirmation modal appears:
   - Shows step title and icon
   - Shows their role
   - Allows adding optional note
5. Agent confirms validation
6. Checkbox shows green checkmark
7. Date is recorded (first validation sets the date)
8. If agent added note, it appears below step with their avatar
9. When BOTH agents validate, step is marked complete
10. Progress bar updates accordingly

### Note Display:

- Notes appear in blue boxes below each step
- Each note shows:
  - Small avatar on left
  - Agent name and timestamp above
  - Note text below
- Multiple notes can exist per step

## Technical Details

### Validation Logic:

```typescript
// Step is completed only when BOTH validate
if (existingStep.ownerValidated && existingStep.collaboratorValidated) {
  existingStep.completed = true;
}
```

### Authorization:

- Checkboxes are disabled based on user role
- Backend validates `validatedBy` matches user's role
- Each user can only validate their own checkbox

### Database Initialization:

- New collaborations start with all steps having:
  - `completed: false`
  - `ownerValidated: false`
  - `collaboratorValidated: false`
  - `notes: []`

## Benefits

1. **Clear Accountability:** Each agent's validation is tracked separately
2. **Better Communication:** Multiple notes per step allow detailed tracking
3. **Visual Clarity:** Two checkboxes clearly show validation status
4. **Flexibility:** Agents can validate in any order
5. **Audit Trail:** All notes include timestamp and creator information
6. **User-Friendly:** Confirmation modal prevents accidental clicks

## Migration Notes

### Existing Collaborations:

- Old progress steps will need migration
- Old single note field → notes array
- Old `completedBy` → separate owner/collaborator validation fields
- Old `completedAt` → `validatedAt`

### Backward Compatibility:

- Code handles missing `notes` array gracefully
- Defaults validation fields to `false` if not present
