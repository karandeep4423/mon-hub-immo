# Apporteur Compensation Validation Fix

## Issue

When agent proposed collaboration on apporteur's post with "Fixed Amount (€)" or "Gift Vouchers" compensation type, the request failed with:

```json
{
  "success": false,
  "message": "Validation error",
  "errors": [
    {
      "path": "commissionPercentage",
      "message": "Expected number, received null"
    }
  ]
}
```

## Root Cause

1. **Validation Schema**: The `proposeCollaborationSchema` required `commissionPercentage` to be a number, but when selecting non-percentage compensation types, the field was not sent (null/undefined).

2. **Frontend Logic**: The modal tried to parse `formData.commissionPercentage` even when it was empty for non-percentage compensation types.

3. **Backend Model**: The `proposedCommission` field was marked as required with minimum value of 1.

## Solution

### 1. Updated Validation Schema (`server/src/validation/schemas.ts`)

```typescript
export const proposeCollaborationSchema = z
  .object({
    propertyId: mongoId.optional(),
    searchAdId: mongoId.optional(),
    collaboratorId: mongoId.optional(),
    commissionPercentage: z.number().min(0).max(100).optional(), // Made optional
    message: z.string().max(500).optional(),
    compensationType: z
      .enum(["percentage", "fixed_amount", "gift_vouchers"])
      .optional(),
    compensationAmount: z.number().min(0).optional(),
  })
  .refine((data) => data.propertyId || data.searchAdId, {
    message: "Either propertyId or searchAdId must be provided",
    path: ["propertyId"],
  })
  .refine(
    (data) => {
      // If compensationType is percentage or not specified, require commissionPercentage
      if (!data.compensationType || data.compensationType === "percentage") {
        return data.commissionPercentage !== undefined;
      }
      // If compensationType is fixed_amount or gift_vouchers, require compensationAmount
      return data.compensationAmount !== undefined;
    },
    {
      message:
        "commissionPercentage required for percentage type, compensationAmount required for other types",
      path: ["commissionPercentage"],
    }
  );
```

**Changes:**

- Made `commissionPercentage` optional
- Added `compensationType` and `compensationAmount` fields
- Added custom validation: require `commissionPercentage` for percentage type, require `compensationAmount` for other types

### 2. Updated Frontend Modal (`client/components/collaboration/ProposeCollaborationModal.tsx`)

```typescript
// Build request payload
const payload = {
  ...(post.type === "property"
    ? { propertyId: post.id }
    : { searchAdId: post.id }),
  message: formData.message,
};

// Add commission percentage for percentage type or non-apporteur posts
if (!isApporteurPost || formData.compensationType === "percentage") {
  payload.commissionPercentage = parseFloat(formData.commissionPercentage);
} else {
  // For non-percentage compensation on apporteur posts, set a nominal value
  payload.commissionPercentage = 0;
}

// Add compensation fields for apporteur posts
if (isApporteurPost) {
  payload.compensationType = formData.compensationType;
  if (formData.compensationType !== "percentage") {
    payload.compensationAmount = parseFloat(formData.compensationAmount);
  }
}
```

**Changes:**

- Only parse `commissionPercentage` when it's actually used (percentage type or non-apporteur posts)
- Set `commissionPercentage` to 0 for non-percentage compensation types
- Made `commissionPercentage` optional in payload type

### 3. Updated Frontend Types (`client/types/collaboration.ts`)

```typescript
export interface ProposeCollaborationRequest {
  propertyId?: string;
  searchAdId?: string;
  collaboratorId?: string;
  commissionPercentage?: number; // Made optional
  message?: string;
  compensationType?: "percentage" | "fixed_amount" | "gift_vouchers";
  compensationAmount?: number;
}
```

### 4. Updated Backend Model (`server/src/models/Collaboration.ts`)

```typescript
proposedCommission: {
    type: Number,
    required: false,  // Made optional
    default: 0,       // Default to 0
    min: [0, 'Commission cannot be negative'],  // Allow 0
    max: [50, 'Commission cannot exceed 50%'],
}
```

**Changes:**

- Made `proposedCommission` optional (not required)
- Set default value to 0
- Changed minimum from 1 to 0 (allow 0 for non-percentage compensation)

### 5. Updated Backend Controller (`server/src/controllers/collaborationController.ts`)

```typescript
// Determine activity message based on compensation type
let activityMessage = "";
if (isApporteurPost && compensationType !== "percentage") {
  if (compensationType === "fixed_amount") {
    activityMessage = `Collaboration proposée avec ${compensationAmount}€ de compensation`;
  } else if (compensationType === "gift_vouchers") {
    activityMessage = `Collaboration proposée avec ${compensationAmount} chèques cadeaux`;
  }
} else {
  activityMessage = `Collaboration proposée avec ${
    commissionPercentage || 0
  }% de commission`;
}

const collaboration = new Collaboration({
  // ...
  proposedCommission: commissionPercentage || 0, // Default to 0 if undefined
  // ...
  activities: [
    {
      type: "proposal",
      message: activityMessage, // Use dynamic message
      createdBy: new Types.ObjectId(userId),
      createdAt: new Date(),
    },
  ],
});
```

**Changes:**

- Create dynamic activity message based on compensation type
- Default `proposedCommission` to 0 if undefined
- Fixed duplicate `createdBy` property bug

## Testing Flow

### For Percentage Compensation (Apporteur Post)

1. Select "Pourcentage de commission (< 50%)"
2. Enter percentage (e.g., 30%)
3. Submit → Sends: `{ commissionPercentage: 30, compensationType: 'percentage' }`

### For Fixed Amount (Apporteur Post)

1. Select "Montant fixe en euros (€)"
2. Enter amount (e.g., 500)
3. Submit → Sends: `{ commissionPercentage: 0, compensationType: 'fixed_amount', compensationAmount: 500 }`

### For Gift Vouchers (Apporteur Post)

1. Select "Chèques cadeaux"
2. Enter quantity (e.g., 2)
3. Submit → Sends: `{ commissionPercentage: 0, compensationType: 'gift_vouchers', compensationAmount: 2 }`

## Database Impact

- Existing collaborations with `proposedCommission` values are unaffected
- New collaborations with non-percentage compensation will have `proposedCommission: 0`
- Activity messages will correctly reflect the compensation type

## Files Modified

1. `server/src/validation/schemas.ts` - Updated validation schema
2. `server/src/models/Collaboration.ts` - Made proposedCommission optional, min: 0
3. `server/src/controllers/collaborationController.ts` - Dynamic activity message, handle undefined commissionPercentage
4. `client/types/collaboration.ts` - Made commissionPercentage optional in request type
5. `client/components/collaboration/ProposeCollaborationModal.tsx` - Conditional commissionPercentage handling

## Status

✅ Server compiles successfully
✅ Validation schema updated with conditional logic
✅ Frontend properly handles optional commissionPercentage
✅ Backend accepts non-percentage compensation types
✅ Activity messages reflect correct compensation type

Ready to test! 🚀
