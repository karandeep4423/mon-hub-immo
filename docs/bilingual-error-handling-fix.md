# Bilingual Error Handling Fix

**Date:** November 5, 2025  
**Issue:** Frontend error handlers only checked for English error messages while backend returned French messages, causing generic fallback errors to show instead of specific user-friendly messages.

## Problem

The frontend's `authToast.ts` error handler was checking for English phrases like:

- "invalid credentials"
- "account locked"
- "verify your email"
- "invalid code"
- "user not found"

But the backend (`authController.ts`) was returning French messages like:

- "Identifiants invalides"
- "Compte verrouillé"
- "Code de vérification invalide"
- "User not found" (mixed)

This mismatch caused the error handler to fall through to generic messages like "Veuillez corriger les erreurs" instead of showing specific, user-friendly error messages.

## Solution

Updated `client/lib/utils/authToast.ts` to check for **both English and French** error messages in all error conditions.

## Changes Made

### 1. **Invalid Credentials**

```typescript
// Before
if (message.includes('invalid credentials'))

// After
if (
  message.includes('invalid credentials') ||
  message.includes('identifiants invalides')
)
```

### 2. **Account Locked**

```typescript
// Before
if (
  message.includes('account locked') ||
  message.includes('locked for')
)

// After
if (
  message.includes('account locked') ||
  message.includes('locked for') ||
  message.includes('account temporarily locked') ||
  message.includes('compte verrouillé') ||
  message.includes('verrouillé pour')
)
```

### 3. **Email Verification**

```typescript
// Before
if (
  message.includes('verify your email') ||
  message.includes('email address before logging')
)

// After
if (
  message.includes('verify your email') ||
  message.includes('email address before logging') ||
  message.includes('please verify your email') ||
  message.includes('veuillez vérifier') ||
  message.includes('vérifier votre email')
)
```

### 4. **Invalid Verification Code**

```typescript
// Before
if (
  message.includes('invalid code') ||
  message.includes('code invalide') ||
  message.includes('expired')
)

// After
if (
  message.includes('invalid code') ||
  message.includes('code invalide') ||
  message.includes('code de vérification invalide') ||
  message.includes('expiré') ||
  message.includes('expired')
)
```

### 5. **Invalid Reset Code**

```typescript
// Before
if (message.includes('reset code') && message.includes('invalid'))

// After
if (
  (message.includes('reset code') && message.includes('invalid')) ||
  message.includes('invalid or expired reset code') ||
  message.includes('code de réinitialisation invalide')
)
```

### 6. **Validation Errors**

```typescript
// Before
if (
  message.includes('validation') &&
  error.errors && ...
)

// After
if (
  (message.includes('validation') ||
   message.includes('validation failed') ||
   message.includes('validation échouée') ||
   message.includes('échec de validation')) &&
  error.errors && ...
)
```

### 7. **User Not Found (404)**

```typescript
// Before
case 404:
  authToastError(Features.Auth.AUTH_TOAST_MESSAGES.ACCOUNT_NOT_FOUND);

// After
case 404:
  if (
    message.includes('user not found') ||
    message.includes('utilisateur introuvable') ||
    message.includes('compte introuvable')
  ) {
    authToastError(Features.Auth.AUTH_TOAST_MESSAGES.ACCOUNT_NOT_FOUND);
  } else {
    authToastError(error.message || 'Ressource introuvable');
  }
```

### 8. **Server Errors (500/502/503)**

```typescript
// Before
case 500:
case 502:
case 503:
  authToastError(Features.Auth.AUTH_TOAST_MESSAGES.SERVER_ERROR);

// After
case 500:
case 502:
case 503:
  if (
    message.includes('internal server error') ||
    message.includes('erreur serveur') ||
    message.includes('erreur serveur interne')
  ) {
    authToastError(Features.Auth.AUTH_TOAST_MESSAGES.SERVER_ERROR);
  } else {
    authToastError(error.message || Features.Auth.AUTH_TOAST_MESSAGES.SERVER_ERROR);
  }
```

### 9. **Network Errors**

```typescript
// Before
if (message.includes('network') || message.includes('fetch'))

// After
if (
  message.includes('network') ||
  message.includes('fetch') ||
  message.includes('réseau')
)
```

### 10. **General Validation Errors**

```typescript
// Before
if (message.includes('validation'))

// After
if (
  message.includes('validation') ||
  message.includes('validation failed') ||
  message.includes('validation échouée')
)
```

## Impact

✅ **Now shows proper user-friendly messages:**

- ❌ Email ou mot de passe incorrect (instead of "Veuillez corriger les erreurs")
- 🔐 Compte verrouillé temporairement
- 📧 Veuillez vérifier votre email avant de vous connecter
- ❌ Code de vérification invalide ou expiré
- ❌ Code de réinitialisation invalide ou expiré
- ❌ Aucun compte trouvé avec cet email

## Testing

Test the following scenarios:

1. ✅ Login with incorrect password
2. ✅ Login with locked account
3. ✅ Login with unverified email
4. ✅ Submit invalid verification code
5. ✅ Submit invalid reset code
6. ✅ Login with non-existent email
7. ✅ Server error scenarios
8. ✅ Network error scenarios

## Files Modified

- `client/lib/utils/authToast.ts`

## Related Backend Messages

The backend returns a mix of English and French messages:

- **French:** "Identifiants invalides", "Compte verrouillé", "Code de vérification invalide"
- **English:** "User not found", "Validation failed", "Internal server error"
- **Mixed:** Some endpoints use French, some use English

The fix ensures the frontend handles both languages gracefully.

## Recommendations

Consider standardizing backend error messages to either:

1. All French (preferred for French app)
2. All English with i18n on frontend
3. Return error codes instead of messages for frontend translation

For now, the bilingual approach ensures backward compatibility while providing proper UX.
