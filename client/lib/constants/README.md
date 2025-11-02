# Constants Organization Guide

## 🚀 Quick Start

**✅ Phase 5 Complete! All migrations finished.**

1. All toast messages migrated to Features.\* pattern
2. All UI components migrated to Components.UI.\* pattern
3. Deprecated `toastMessages.ts` removed
4. See usage examples below

---

## 📁 Structure Overview

```
lib/constants/
├── index.ts                    # Central export hub
├── features/                   # Feature domain constants
│   ├── index.ts               # Feature exports
│   ├── auth.ts                # ✅ COMPLETE - Auth routes, errors, messages
│   ├── properties.ts          # ✅ COMPLETE - Property management
│   ├── collaboration.ts       # ✅ COMPLETE - Collaboration & contracts
│   ├── chat.ts                # ✅ COMPLETE - Real-time messaging
│   ├── appointments.ts        # ✅ COMPLETE - Appointment system
│   ├── searchAds.ts           # ✅ COMPLETE - Search advertisements
│   ├── dashboard.ts           # ✅ COMPLETE - Dashboard views
│   ├── common.ts              # ✅ COMPLETE - Shared constants
│   └── landing.ts             # ✅ COMPLETE - Landing pages
├── pages/                      # Page-specific constants
│   └── index.ts               # ✅ COMPLETE
├── components/                 # Component-specific constants
│   ├── index.ts               # ✅ COMPLETE
│   ├── header.ts              # ✅ COMPLETE
│   ├── footer.ts              # ✅ COMPLETE
│   ├── appointments/          # ✅ COMPLETE - Appointment components
│   └── ui/                    # ✅ COMPLETE - UI component constants
│       ├── button.ts
│       ├── modal.ts
│       ├── card.ts
│       ├── loading.ts
│       ├── form.ts
│       ├── alert.ts
│       ├── dialog.ts
│       ├── icons.ts
│       ├── image.ts
│       └── pagination.ts
├── api.ts                      # ✅ COMPLETE - API constants
├── global.ts                   # ✅ COMPLETE - Global constants
└── timing.ts                   # ✅ COMPLETE - Timing constants
```

---

## 🎯 Import Patterns

### ✅ **All Phases Complete**

**Current Pattern (Use This):**

```typescript
import { Features } from '@/lib/constants';
const loginRoute = Features.Auth.AUTH_ROUTES.LOGIN;
const signupRoute = Features.Auth.AUTH_ROUTES.SIGNUP;
const loginError = Features.Auth.AUTH_ERRORS.LOGIN_FAILED;
```

**Alternative (Specific Imports):**

```typescript
import { Features } from '@/lib/constants';
const { AUTH_ROUTES, AUTH_ENDPOINTS, AUTH_ERRORS } = Features.Auth;

// Now use directly
router.push(AUTH_ROUTES.LOGIN);
```

### 📌 **Migration Status: Phase 1**

**Files Updated (9 files):**

- ✅ `lib/api.ts` - Auth redirect on 401
- ✅ `store/authStore.ts` - Logout redirect
- ✅ `lib/api/authApi.ts` - All auth endpoints & errors
- ✅ `components/auth/VerifyEmailForm.tsx` - Routes
- ✅ `components/auth/ProtectedRoute.tsx` - Default redirect
- ✅ `hooks/useRequireAuth.ts` - Default redirect

**Files Remaining (12 files):**

- 🔄 `components/auth/LoginForm.tsx` (2 usages)
- 🔄 `components/auth/ResetPasswordForm.tsx` (3 usages)
- 🔄 `components/auth/ForgotPasswordForm.tsx` (2 usages)
- 🔄 `components/auth/ProfileCompletion.tsx` (1 usage)
- 🔄 `components/dashboard-agent/AgentProfileCard.tsx` (1 usage)
- 🔄 `components/dashboard-agent/ProfileCompletionBanner.tsx` (1 usage)
- 🔄 `components/ui/FavoriteButton.tsx` (1 usage)
- 🔄 `components/appointments/BookAppointmentModal.tsx` (1 usage)
- 🔄 `components/search-ads/SearchAdDetails.tsx` (1 usage)
- 🔄 `app/property/[id]/page.tsx` (2 usages)
- 🔄 `hooks/useSignUpForm.ts` (1 usage)
- 🔄 `components/header/Header.tsx` (JSX hrefs)

---

## 📚 Available Constants

### **Features.Auth** ✅

```typescript
// Routes
AUTH_ROUTES = {
	LOGIN: '/auth/login',
	SIGNUP: '/auth/signup',
	WELCOME: '/auth/welcome',
	COMPLETE_PROFILE: '/auth/complete-profile',
	VERIFY_EMAIL: '/auth/verify-email',
	FORGOT_PASSWORD: '/auth/forgot-password',
	RESET_PASSWORD: '/auth/reset-password',
};

// API Endpoints
AUTH_ENDPOINTS = {
	SIGNUP: '/auth/signup',
	LOGIN: '/auth/login',
	VERIFY_EMAIL: '/auth/verify-email',
	RESEND_VERIFICATION: '/auth/resend-verification',
	FORGOT_PASSWORD: '/auth/forgot-password',
	RESET_PASSWORD: '/auth/reset-password',
	GET_PROFILE: '/auth/profile',
	UPDATE_PROFILE: '/auth/profile',
	COMPLETE_PROFILE: '/auth/complete-profile',
	UPDATE_PREFERENCES: '/auth/search-preferences',
};

// Error Messages
AUTH_ERRORS = {
	SIGNUP_FAILED: "Erreur lors de l'inscription",
	LOGIN_FAILED: 'Erreur lors de la connexion',
	VERIFY_EMAIL_FAILED: "Erreur lors de la vérification de l'email",
	// ... 7 more
};

// Toast Messages
AUTH_TOAST_MESSAGES = {
	LOGIN_SUCCESS: 'Connexion réussie',
	SIGNUP_SUCCESS: 'Inscription réussie ! Vérifiez votre email.',
	// ... 12 more
};

// UI Text
AUTH_UI_TEXT = {
	LOGIN: 'Se connecter',
	SIGNUP: "S'inscrire",
	LOGOUT: 'Déconnexion',
	// ... 15 more
};

// Validation Rules
AUTH_VALIDATION = {
	PASSWORD_MIN_LENGTH: 8,
	PASSWORD_MAX_LENGTH: 128,
	NAME_MIN_LENGTH: 2,
	// ... 5 more
};

// User Types
USER_TYPES = {
	AGENT: 'agent',
	APPORTEUR: 'apporteur',
};
```

---

## 🚀 Next Phases

### **Phase 2: Properties Feature** (Next)

Consolidate:

- `badges.ts` → `features/properties.ts`
- `searchAd.ts` → Split between `properties.ts` and `search-ads.ts`
- `statusConfigs.ts` → Property status section
- Property-related errors from `apiErrors.ts`
- Property text from `text.ts`

### **Phase 3: Collaboration Feature**

Consolidate:

- `stepOrder.ts` → `features/collaboration.ts`
- `statusColors.ts` → `features/collaboration.ts`
- Collaboration status from `statusConfigs.ts`
- Collaboration errors from `apiErrors.ts`

### **Phase 4: Remaining Features**

- Chat constants
- Appointment constants
- Search ads constants

### **Phase 5: Global & Cleanup**

- Create `global.ts` for app-wide constants
- Socket events from `socket.ts`
- Timing values from `timing.ts`
- Delete old constant files

---

## 📝 Adding New Constants

1. **Identify the domain**: Is it feature-specific, page-specific, or component-specific?
2. **Find or create the appropriate file**:
    - Features → `/features/{featureName}.ts`
    - Pages → `/pages/{pageName}.ts`
    - Components → `/components/{componentName}.ts`
3. **Use consistent naming**:
    - Routes: `{FEATURE}_ROUTES`
    - Endpoints: `{FEATURE}_ENDPOINTS`
    - Errors: `{FEATURE}_ERRORS`
    - Messages: `{FEATURE}_TOAST_MESSAGES`
    - Text: `{FEATURE}_UI_TEXT`
4. **Export from feature index.ts**:
    ```typescript
    export * as FeatureName from './featureName';
    ```
5. **Use `as const` for type safety**:
    ```typescript
    export const MY_CONSTANT = {
    	KEY: 'value',
    } as const;
    ```

---

## ✅ Benefits

### **For Developers**

- **Discoverability**: Namespaced imports make it obvious where constants come from
- **Type Safety**: All constants are typed with `as const`
- **Consistency**: Same pattern everywhere
- **No Conflicts**: Feature-based organization prevents naming collisions

### **For Teams**

- **Scalable**: Easy to add new features without refactoring
- **Clear Ownership**: Know exactly which file to update
- **Reduced Merge Conflicts**: Constants separated by feature
- **Easy Code Reviews**: Related changes grouped together

### **For Maintenance**

- **Single Source of Truth**: No duplicate constants
- **Easy Refactoring**: Change in one place affects everywhere
- **Searchable**: `grep` for filename to find all usages
- **Documentation**: Self-documenting structure

---

## 🔄 Migration Progress

**Phase 1: Auth** - ✅ 40% Complete (9/21 files)
**Phase 2: Properties** - 🔄 Planned
**Phase 3: Collaboration** - 🔄 Planned
**Phase 4: Chat/Appointments** - 🔄 Planned
**Phase 5: Global** - 🔄 Planned

Last Updated: 2025-10-26
