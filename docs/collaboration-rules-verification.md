# Collaboration Rules Verification Report

## 📋 Expected Rules

According to your requirements:

1. **Agents CAN** propose collaboration ✅
2. **Apporteurs CANNOT** propose collaboration ❌ (should only accept)
3. **Apporteurs CAN** create search ads ✅
4. **Apporteurs CAN** create property posts ✅
5. **Apporteurs CAN** accept collaborations ✅

## 🔍 Current Implementation Status

### ❌ **CRITICAL ISSUE FOUND**

**Apporteurs CAN currently propose collaborations** - This violates your business rule!

### Detailed Findings

#### 1. Backend - No UserType Restriction ❌

**File:** `server/src/controllers/collaborationController.ts`

The `proposeCollaboration` function does **NOT** check if the user proposing is an agent or apporteur.

```typescript
export const proposeCollaboration = async (
	req: AuthenticatedRequest,
	res: Response,
): Promise<void> => {
	try {
		const userId = req.user?.id;
		// ... validation logic

		// ❌ NO CHECK FOR: if (req.user?.userType === 'apporteur') { reject }

		const collaboration = new Collaboration({
			postId,
			postType,
			postOwnerId,
			collaboratorId: userId, // Any authenticated user can propose
			// ...
		});
```

**Issue:** Both agents AND apporteurs can propose collaborations through the backend API.

#### 2. Frontend - Partial Restriction ⚠️

**File:** `client/app/property/[id]/page.tsx` (Line 397)

```tsx
{
  user && user.userType === "agent" && (
    <>
      {hasBlockingCollab ? (
        <div>Already in collaboration</div>
      ) : (
        <Button onClick={handleCollaborate}>Proposer de collaborer</Button>
      )}
    </>
  );
}
```

**Status:** ✅ Property pages only show "Propose Collaboration" button to agents.

**File:** `client/components/search-ads/details/ContactCard.tsx`

```tsx
<button onClick={onCollaborate}>
  <span>Proposer une collaboration</span>
</button>
```

**Issue:** ❌ Search ad pages show collaboration button to ALL authenticated users (no userType check).

#### 3. Permission Hook - Incorrect Logic ⚠️

**File:** `client/hooks/useAuth.ts` (Line 92)

```typescript
const getUserPermissions = () => {
  const userType = user?.userType;
  return {
    canAddProperties: ["agent", "apporteur"].includes(userType || ""),
    canViewListings: ["agent", "apporteur"].includes(userType || ""),
    canManageProfile: !!user,
    canCollaborate: userType === "agent" && user?.profileCompleted, // ⚠️ Not used everywhere
  };
};
```

**Issue:** The `canCollaborate` permission exists but is **not being used** in the UI components.

#### 4. Documentation States Rules ✅

**File:** `docs/apporteur-compensation-feature.md` (Line 216)

```markdown
- Apporteurs cannot propose collaborations (only receive them)
```

**Status:** Documentation is correct, but implementation doesn't enforce it.

## 🚨 Security Vulnerabilities

1. **Backend API Bypass:** Even though the UI restricts apporteurs on property pages, they can:

   - Use browser dev tools to call the API directly
   - Access search ad pages where there's no restriction
   - Propose collaborations via API calls

2. **Inconsistent Frontend:** Different pages have different rules (property vs search ads)

## ✅ What IS Working Correctly

1. ✅ **Apporteurs can create properties** - No restrictions in `propertyController.ts`
2. ✅ **Apporteurs can create search ads** - Confirmed in `searchAdController.ts`
3. ✅ **Agents can propose collaborations** - Working as expected
4. ✅ **Both can accept collaborations** - `respondToCollaboration` has no userType restrictions
5. ✅ **Compensation types** - Properly implemented for apporteur posts

## 🔧 Required Fixes

### Priority 1: Backend Validation (CRITICAL)

Add userType check in `server/src/controllers/collaborationController.ts`:

```typescript
export const proposeCollaboration = async (
	req: AuthenticatedRequest,
	res: Response,
): Promise<void> => {
	try {
		const userId = req.user?.id;
		const userType = req.user?.userType;

		// ✅ ADD THIS CHECK
		if (userType === 'apporteur') {
			res.status(403).json({
				success: false,
				message: 'Apporteurs cannot propose collaborations. Only agents can propose.',
			});
			return;
		}

		// ... rest of the code
	}
};
```

### Priority 2: Frontend Consistency

Update `client/components/search-ads/details/ContactCard.tsx`:

```tsx
import { useAuth } from '@/hooks/useAuth';

export const ContactCard: React.FC<ContactCardProps> = ({ ... }) => {
	const { user } = useAuth();
	const isAgent = user?.userType === 'agent';

	// ... existing code

	{!isOwner && isAgent && !hasBlockingCollab && (
		<button onClick={onCollaborate}>
			<span>Proposer une collaboration</span>
		</button>
	)}
```

### Priority 3: Use Permission Hook

Update components to use the existing `canCollaborate` permission:

```typescript
const { getUserPermissions } = useUserTypeHelpers();
const { canCollaborate } = getUserPermissions();

{
  canCollaborate && !hasBlockingCollab && (
    <Button>Proposer de collaborer</Button>
  );
}
```

## 📊 Summary

| Feature                        | Expected | Current Status | Fix Required |
| ------------------------------ | -------- | -------------- | ------------ |
| Agent can propose collab       | ✅ Yes   | ✅ Yes         | ❌ No        |
| Apporteur can propose collab   | ❌ No    | ⚠️ Yes (Bug!)  | ✅ **YES**   |
| Apporteur can accept collab    | ✅ Yes   | ✅ Yes         | ❌ No        |
| Apporteur can create property  | ✅ Yes   | ✅ Yes         | ❌ No        |
| Apporteur can create search ad | ✅ Yes   | ✅ Yes         | ❌ No        |
| Backend enforces rules         | ✅ Yes   | ❌ **No**      | ✅ **YES**   |
| Frontend consistent            | ✅ Yes   | ⚠️ Partial     | ✅ **YES**   |

## ⚡ Action Items

1. **URGENT:** Add backend validation to block apporteurs from proposing (Security issue)
2. **HIGH:** Update SearchAd contact card to hide collaboration button for apporteurs
3. **MEDIUM:** Refactor all components to use the `canCollaborate` permission hook
4. **LOW:** Add unit tests for userType restrictions

---

**Generated:** 2025-10-29
**Status:** ❌ **RULE VIOLATION DETECTED** - Immediate action required
