# Collaboration Rules - Testing Checklist

## 🧪 Manual Testing Guide

### Test 1: Backend API Protection ✅

**As Apporteur:**

1. Login as apporteur user
2. Get the auth token from localStorage or network tab
3. Try to call the collaboration API directly:
   ```bash
   POST /api/collaboration
   Headers: { Authorization: "Bearer <apporteur-token>" }
   Body: {
     "propertyId": "<some-property-id>",
     "commissionPercentage": 40,
     "message": "Test"
   }
   ```

**Expected Result:**

- ❌ Status: 403 Forbidden
- ❌ Message: "Apporteurs cannot propose collaborations. Only agents can propose collaborations."

### Test 2: Property Detail Page ✅

**As Apporteur:**

1. Login as apporteur user
2. Navigate to any property detail page
3. Scroll to contact section

**Expected Result:**

- ❌ No "Proposer de collaborer" button visible
- ✅ See message: "🚫 Seuls les agents peuvent proposer des collaborations"
- ✅ "Contacter l'agent" button still visible

**As Agent:**

1. Login as agent user
2. Navigate to any property detail page (not owned by you)
3. Scroll to contact section

**Expected Result:**

- ✅ "Proposer de collaborer" button visible
- ✅ Can click and see ProposeCollaborationModal

### Test 3: Search Ad Detail Page ✅

**As Apporteur:**

1. Login as apporteur user
2. Navigate to any search ad detail page
3. Scroll to contact card section

**Expected Result:**

- ❌ No "Proposer une collaboration" button visible
- ✅ See message: "🚫 Seuls les agents peuvent proposer des collaborations"
- ✅ "Contacter l'auteur" button still visible

**As Agent:**

1. Login as agent user
2. Navigate to any search ad detail page (not owned by you)
3. Scroll to contact card section

**Expected Result:**

- ✅ "Proposer une collaboration" button visible
- ✅ Can click and see ProposeCollaborationModal

### Test 4: Modal Submission ✅

**As Agent:**

1. Open ProposeCollaborationModal
2. Fill in all required fields
3. Submit the form

**Expected Result:**

- ✅ Success: Collaboration created
- ✅ Notification sent to post owner
- ✅ Modal closes

**As Apporteur (if they somehow open the modal):**

1. Even if they open the modal via dev tools
2. Submit the form

**Expected Result:**

- ❌ Backend returns 403 error
- ❌ Toast error message shown
- ❌ No collaboration created

### Test 5: Existing Collaborations ✅

**Both User Types:**

1. Navigate to collaborations page
2. View existing collaborations where you're the receiver

**Expected Result:**

- ✅ Agents can see collaborations they proposed
- ✅ Apporteurs can see collaborations proposed to them
- ✅ Both can accept/reject collaborations
- ✅ Both can sign contracts
- ✅ Both can update progress

### Test 6: Property & Search Ad Creation ✅

**As Apporteur:**

1. Navigate to "Créer une annonce" or "Créer un bien"
2. Fill in the form
3. Submit

**Expected Result:**

- ✅ Property created successfully
- ✅ Search ad created successfully
- ✅ Can receive collaboration proposals from agents

**As Agent:**

1. Same process

**Expected Result:**

- ✅ Property created successfully
- ✅ Search ad created successfully
- ✅ Can propose collaborations on other users' posts

## 🔒 Security Edge Cases

### Edge Case 1: Token Manipulation

- Try modifying `userType` in JWT token → Backend validates from database
- Expected: 403 if actual userType is apporteur

### Edge Case 2: Direct API Call with Modified Request

- Apporteur tries calling API with agent-like payload
- Expected: Backend checks `req.user.userType` not request body

### Edge Case 3: Browser Console Hack

- Apporteur opens console and tries to trigger modal/API
- Expected: Backend blocks at API level

### Edge Case 4: Already Existing Collaboration

- Agent tries to propose on property that already has pending/active collab
- Expected: 409 Conflict (already exists)

## ✅ Success Criteria

All tests should pass with these results:

- ✅ Backend blocks apporteurs from proposing (403)
- ✅ Frontend shows appropriate messages
- ✅ Agents can still propose normally
- ✅ Both can accept/respond to collaborations
- ✅ Both can create properties and search ads
- ✅ No breaking changes to existing features

## 🐛 Known Limitations

None - all required rules are enforced.

## 📝 Test Results Template

```
Date: ___________
Tester: ___________

[ ] Test 1: Backend API Protection - PASS/FAIL
[ ] Test 2: Property Detail Page - PASS/FAIL
[ ] Test 3: Search Ad Detail Page - PASS/FAIL
[ ] Test 4: Modal Submission - PASS/FAIL
[ ] Test 5: Existing Collaborations - PASS/FAIL
[ ] Test 6: Property & Search Ad Creation - PASS/FAIL

Edge Cases:
[ ] Token Manipulation - PASS/FAIL
[ ] Direct API Call - PASS/FAIL
[ ] Browser Console Hack - PASS/FAIL
[ ] Already Existing Collaboration - PASS/FAIL

Overall Status: PASS/FAIL
Notes: ___________
```

---

**Created:** 2025-10-29  
**Version:** 1.0
