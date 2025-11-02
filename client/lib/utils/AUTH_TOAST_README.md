# 🎉 Authentication Toast Notifications - Quick Reference

## ✨ What's New

Your authentication feature now has **user-friendly, French toast notifications** for all user actions!

## 🚀 Quick Start

### Import

```typescript
import {
	handleAuthError,
	authToastSuccess,
	authToastError,
	showLoginSuccess,
} from '@/lib/utils/authToast';
```

### Basic Usage

```typescript
// Success
authToastSuccess('✅ Opération réussie');

// Error
authToastError('❌ Une erreur est survenue');

// Smart error handling (auto-detects error type)
try {
	await apiCall();
} catch (error) {
	handleAuthError(error);
}
```

## 📋 Available Functions

| Function                         | Use Case             | Example                            |
| -------------------------------- | -------------------- | ---------------------------------- |
| `authToastSuccess()`             | Success messages     | Login success, profile updated     |
| `authToastError()`               | Error messages       | Invalid input, API errors          |
| `authToastInfo()`                | Info messages        | Redirecting, processing            |
| `authToastWarning()`             | Warnings             | Email not verified, account issues |
| `handleAuthError()`              | Smart error handling | Automatically detects error type   |
| `showLoginSuccess()`             | Login complete       | Success + redirect notification    |
| `showSignupSuccess()`            | Signup complete      | Success + redirect notification    |
| `showVerificationSuccess()`      | Email verified       | Success + redirect notification    |
| `showPasswordResetSuccess()`     | Password reset       | Success + redirect notification    |
| `showProfileCompletionSuccess()` | Profile complete     | Success + redirect notification    |

## 🎯 Common Scenarios

### Login

```typescript
try {
	const response = await authService.login(credentials);
	showLoginSuccess(response.requiresProfileCompletion);
} catch (error) {
	handleAuthError(error);
	// Auto-shows: Invalid credentials, Account locked, etc.
}
```

### Signup

```typescript
try {
	await authService.signup(data);
	showSignupSuccess();
} catch (error) {
	handleAuthError(error);
	// Auto-shows: Email exists, Validation errors, etc.
}
```

### Email Verification

```typescript
try {
	await authService.verifyEmail(code);
	showVerificationSuccess();
} catch (error) {
	handleAuthError(error);
	// Auto-shows: Invalid code, Expired code, etc.
}
```

### Password Reset

```typescript
try {
	await authService.resetPassword(data);
	showPasswordResetSuccess();
} catch (error) {
	handleAuthError(error);
	// Auto-shows: Invalid code, Password mismatch, etc.
}
```

## 💡 Smart Error Detection

`handleAuthError()` automatically detects and shows appropriate messages for:

- ❌ Invalid credentials
- 🔐 Account locked (with time remaining)
- 📧 Email not verified
- ⏱️ Expired codes
- 📡 Network errors
- ⚠️ Server errors
- ✉️ Email already exists
- 🔒 Validation errors

## 📚 All Available Messages

See `client/lib/constants/features/auth.ts` for the complete list of 40+ messages:

```typescript
Features.Auth.AUTH_TOAST_MESSAGES.LOGIN_SUCCESS;
Features.Auth.AUTH_TOAST_MESSAGES.INVALID_CREDENTIALS;
Features.Auth.AUTH_TOAST_MESSAGES.ACCOUNT_LOCKED;
Features.Auth.AUTH_TOAST_MESSAGES.EMAIL_NOT_VERIFIED;
// ... and many more
```

## 🎨 Customization

```typescript
// Custom duration
authToastSuccess('Message', { autoClose: 3000 });

// Custom position
authToastInfo('Message', { position: 'top-center' });

// Loading toast
const toastId = authToastLoading('Chargement...');
// Later: update or dismiss
authToastUpdate(toastId, 'Terminé!', 'success');
```

## 📖 Documentation

- **Full Guide**: `docs/auth-toast-notifications-enhancement.md`
- **Examples**: `client/lib/utils/authToast.examples.ts`
- **Constants**: `client/lib/constants/features/auth.ts`
- **Utility**: `client/lib/utils/authToast.ts`

## ✅ Testing

All auth components have been updated:

- ✅ LoginForm
- ✅ SignupForm
- ✅ VerifyEmailForm
- ✅ ForgotPasswordForm
- ✅ ResetPasswordForm
- ✅ ProfileCompletion

## 🔧 Configuration

Toast settings in `client/app/layout.tsx`:

```typescript
<ToastContainer
	position="top-right"
	autoClose={5000}
	hideProgressBar={false}
	closeOnClick
	pauseOnHover
	draggable
	theme="light"
/>
```

## 🎯 Best Practices

1. **Use `handleAuthError`** for all API errors - it's smart!
2. **Use helper functions** (`showLoginSuccess`, etc.) for common flows
3. **Keep messages in French** - all constants are pre-translated
4. **Use emojis** - they're already included in constants
5. **Log errors** - `handleAuthError` does this automatically

## 🤝 Contributing

When adding new auth features:

1. Add new messages to `auth.ts` constants
2. Use `handleAuthError` for error handling
3. Create helper functions if needed in `authToast.ts`
4. Update examples in `authToast.examples.ts`

---

**Happy coding! 🚀**
