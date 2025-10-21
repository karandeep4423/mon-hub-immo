# Apporteur d'Affaire Compensation Feature

## Overview

Implemented special compensation handling when agents propose collaboration on apporteur d'affaire posts (both properties and search ads).

## Key Requirements Met

### 1. Commission Percentage Restriction

- **Agent proposing on apporteur posts**: Commission percentage limited to **maximum 49%** (not 50%)
- **Regular agent-to-agent collaborations**: Still allow 50-50 split

### 2. New Compensation Options

Added three compensation types for apporteur posts:

1. **Percentage Commission** (< 50%)
2. **Fixed Amount in Euros (€)** - number input
3. **Gift Vouchers** - number input with label

### 3. Form Validation

- Agent must select ONE compensation type
- Must enter a value for the selected type
- Clear label: "Type de compensation pour l'apporteur d'affaire"

### 4. User Type Detection

- System checks `postOwnerId.userType` to determine if post belongs to apporteur
- Different validation rules applied based on owner type

## Implementation Details

### Backend Changes

#### 1. Collaboration Model (`server/src/models/Collaboration.ts`)

```typescript
// Added new fields to interface
compensationType?: 'percentage' | 'fixed_amount' | 'gift_vouchers';
compensationAmount?: number; // Amount in euros or number of gift vouchers

// Added to schema
compensationType: {
    type: String,
    enum: ['percentage', 'fixed_amount', 'gift_vouchers'],
    required: false,
},
compensationAmount: {
    type: Number,
    required: false,
    min: [0, 'Compensation amount must be positive'],
}
```

#### 2. Collaboration Controller (`server/src/controllers/collaborationController.ts`)

- Extract `compensationType` and `compensationAmount` from request body
- Fetch post owner's `userType` to check if they're an apporteur
- Apply validation for apporteur posts:
  - If `compensationType === 'percentage'`: Enforce `commissionPercentage < 50`
  - If `compensationType === 'fixed_amount' | 'gift_vouchers'`: Require `compensationAmount > 0`
- Save compensation fields only for apporteur posts

```typescript
// Validation example
if (isApporteurPost) {
  if (compensationType === "percentage" && commissionPercentage >= 50) {
    return res.status(400).json({
      message:
        "Commission percentage must be less than 50% for apporteur posts",
    });
  }
}
```

### Frontend Changes

#### 1. Collaboration Types (`client/types/collaboration.ts`)

```typescript
// Added to Collaboration interface
compensationType?: 'percentage' | 'fixed_amount' | 'gift_vouchers';
compensationAmount?: number;

// Added to ProposeCollaborationRequest interface
compensationType?: 'percentage' | 'fixed_amount' | 'gift_vouchers';
compensationAmount?: number;
```

#### 2. ProposeCollaborationModal Component

**Updated PostData type:**

```typescript
type PostData =
    | { type: 'property'; id: string; ownerUserType: 'agent' | 'apporteur'; ... }
    | { type: 'searchAd'; id: string; ownerUserType: 'agent' | 'apporteur'; ... }
```

**Added to form state:**

```typescript
const [formData, setFormData] = useState({
  commissionPercentage: "",
  compensationType: "percentage" as
    | "percentage"
    | "fixed_amount"
    | "gift_vouchers",
  compensationAmount: "",
  message: "",
  agreeToTerms: false,
});

const isApporteurPost = post.ownerUserType === "apporteur";
```

**UI Changes:**

- Radio buttons to select compensation type (only shown for apporteur posts)
- Conditional rendering of input fields based on `compensationType`
- Commission percentage max changed from 50 to 49 for apporteur posts
- Compensation amount field shows different labels:
  - Fixed amount: "Montant en euros (€)"
  - Gift vouchers: "Nombre de chèques cadeaux"

**Validation:**

- For apporteur posts with percentage: Check `< 50%` client-side
- For fixed amount/gift vouchers: Require `compensationAmount > 0`
- Submit button disabled unless all required fields filled

#### 3. Usage in Pages

**Property Details Page (`client/app/property/[id]/page.tsx`):**

```typescript
<ProposeCollaborationModal
    post={{
        type: 'property',
        id: property._id,
        ownerUserType: property.owner.userType, // ← Added
        data: { ... }
    }}
/>
```

**Search Ad Details (`client/components/search-ads/SearchAdDetails.tsx`):**

```typescript
<ProposeCollaborationModal
    post={{
        type: 'searchAd',
        id: searchAd._id,
        ownerUserType: searchAd.authorType, // ← Added
        data: { ... }
    }}
/>
```

## User Flow

### For Agent proposing on Apporteur's Post:

1. Agent clicks "Proposer une collaboration"
2. Modal shows compensation type selection with 3 radio options
3. Based on selection:
   - **Percentage**: Shows commission input with max 49%
   - **Fixed Amount**: Shows euro amount input
   - **Gift Vouchers**: Shows voucher quantity input
4. Agent fills required field and submits
5. Backend validates based on compensation type
6. Collaboration created with compensation details

### For Agent proposing on Another Agent's Post:

1. Modal shows standard commission percentage field (1-50%)
2. No compensation type selection
3. Standard collaboration flow

## Database Schema Impact

- Existing collaborations unaffected (compensation fields are optional)
- New collaborations on apporteur posts will have `compensationType` and `compensationAmount` populated
- No migration needed

## Testing Checklist

- [ ] Agent → Apporteur Property: Percentage < 50% works
- [ ] Agent → Apporteur Property: Percentage = 50% rejected
- [ ] Agent → Apporteur Property: Fixed amount saves correctly
- [ ] Agent → Apporteur Property: Gift vouchers saves correctly
- [ ] Agent → Apporteur Search Ad: Same validation as property
- [ ] Agent → Agent Property: 50-50 split still allowed
- [ ] Agent → Agent Search Ad: 50-50 split still allowed
- [ ] Form validation prevents submission with missing fields
- [ ] Backend rejects invalid compensation values

## Files Modified

### Backend

- `server/src/models/Collaboration.ts` - Added compensation fields
- `server/src/controllers/collaborationController.ts` - Added validation logic

### Frontend

- `client/types/collaboration.ts` - Added compensation types
- `client/components/collaboration/ProposeCollaborationModal.tsx` - Updated UI and logic
- `client/app/property/[id]/page.tsx` - Pass ownerUserType
- `client/components/search-ads/SearchAdDetails.tsx` - Pass ownerUserType

## Notes

- Apporteurs cannot propose collaborations (only receive them)
- Compensation type is optional in DB but required when proposing on apporteur posts
- The `proposedCommission` field is still required for all collaborations (backwards compatibility)
- For apporteur posts with non-percentage compensation, `proposedCommission` can be set to a nominal value
