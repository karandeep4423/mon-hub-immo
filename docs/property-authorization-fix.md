# Property Authorization Fix

**Date:** November 3, 2025

## Issue

Users were encountering 403 Forbidden errors when trying to create or modify their own properties. The error occurred on endpoints like:

- `PATCH /api/property/:id/status`
- `PUT /api/property/:id/update`
- `DELETE /api/property/:id`

Error message: "Accès refusé - vous ne pouvez modifier que vos propres ressources"

## Root Cause

The `requireOwnership` middleware was checking for an `authorId` field, but the `Property` model uses `owner` as the ownership field. This field name mismatch caused the authorization check to fail even for legitimate owners.

Different models in the codebase use different field names:

- **Property model**: Uses `owner` field
- **SearchAd model**: Uses `authorId` field

## Solution

### 1. Updated `requireOwnership` Middleware

Modified `server/src/middleware/authorize.ts` to handle both `authorId` and `owner` fields:

```typescript
// Check ownership - handle both 'authorId' (SearchAd) and 'owner' (Property) fields
const ownerField = resource.authorId || resource.owner;
if (!isOwner(req.userId, ownerField)) {
  // ... authorization failed
}
```

### 2. Removed Duplicate Authorization Checks

Since the middleware already verifies ownership, removed redundant checks from the property controller:

**Updated functions in `server/src/controllers/propertyController.ts`:**

- `updateProperty` - Removed duplicate ownership check
- `deleteProperty` - Removed duplicate ownership check
- `updatePropertyStatus` - Removed duplicate ownership check

Now these functions use `req.resource` (set by the middleware) or fetch the property directly.

### 3. Added `resource` Property to Type Definition

Updated the `AuthenticatedRequest` interface in `propertyController.ts` to include the `resource` property set by the middleware:

```typescript
interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    userType: "agent" | "apporteur";
  };
  resource?: any; // Attached by authorization middleware
}
```

## Testing

After these changes, property owners can now:

- ✅ Update property status
- ✅ Edit property details
- ✅ Delete their own properties

The middleware correctly prevents unauthorized users from modifying properties they don't own.

## Files Modified

1. `server/src/middleware/authorize.ts` - Updated `requireOwnership` to handle both field names
2. `server/src/controllers/propertyController.ts` - Removed duplicate checks, added type definition
