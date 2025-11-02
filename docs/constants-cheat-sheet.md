# Constants Quick Reference Cheat Sheet

## 🚀 Most Common Patterns

### Toast Messages

```typescript
import { Features } from "@/lib/constants";

// Success
toast.success(Features.Auth.AUTH_TOAST_MESSAGES.LOGIN_SUCCESS);
toast.success(Features.Properties.PROPERTY_TOAST_MESSAGES.CREATE_SUCCESS);

// Error
toast.error(Features.Chat.CHAT_TOAST_MESSAGES.SEND_ERROR);
toast.error(Features.Collaboration.COLLABORATION_TOAST_MESSAGES.PROPOSE_ERROR);
```

### Button Styling

```typescript
import { UI } from "@/lib/constants/components";

<button
  className={`
    ${UI.BUTTON_BASE_CLASSES} 
    ${UI.BUTTON_VARIANT_CLASSES.primary} 
    ${UI.BUTTON_SIZE_CLASSES.md}
  `}
/>;
```

### Modal

```typescript
import { UI } from "@/lib/constants/components";

<div className={UI.MODAL_CONTAINER.className}>
  <div className={UI.MODAL_BACKDROP.className} />
  <div
    className={`
    ${UI.MODAL_CONTENT.baseClassName} 
    ${UI.MODAL_SIZE_CLASSES.lg}
  `}
  >
    {children}
  </div>
</div>;
```

### Card

```typescript
import { UI } from "@/lib/constants/components";

<div
  className={`
  ${UI.CARD_BASE_CLASSES} 
  ${UI.CARD_PADDING_CLASSES.md} 
  ${UI.CARD_SHADOW_CLASSES.sm}
`}
>
  {children}
</div>;
```

### Alert

```typescript
import { UI } from "@/lib/constants/components";

<div
  className={`
  ${UI.ALERT_BASE_CLASSES} 
  ${UI.ALERT_TYPE_CLASSES.success}
`}
>
  <span className={UI.ALERT_ICON_COLORS.success}>✓</span>
  {message}
</div>;
```

### Loading Spinner

```typescript
import { UI } from '@/lib/constants/components';

<svg className={`
  animate-spin
  ${UI.LOADING_SPINNER_SIZE_CLASSES.md}
  ${UI.LOADING_SPINNER_COLORS.brand}
`} />

<p>{UI.LOADING_MESSAGES.default}</p>
```

### Form Input

```typescript
import { UI } from '@/lib/constants/components';

<input
  className={`
    ${UI.FORM_INPUT_BASE_CLASSES}
    ${UI.FORM_INPUT_SIZE_CLASSES.md}
    ${hasError ? UI.FORM_INPUT_STATE_CLASSES.error : ''}
  `}
/>
<label className={UI.FORM_LABEL_CLASSES.base}>Name</label>
```

### Navigation

```typescript
import { Features } from "@/lib/constants";

router.push(Features.Auth.AUTH_ROUTES.LOGIN);
router.push(Features.Dashboard.DASHBOARD_ROUTES.AGENT);
```

### Status Badge

```typescript
import { Features } from "@/lib/constants";

const config = Features.Collaboration.COLLABORATION_STATUS_CONFIG[status];
<span className={config.className}>{config.label}</span>;
```

## 📋 All Available Domains

### Features.\*

- `Features.Auth` - Authentication
- `Features.Properties` - Property management
- `Features.Collaboration` - Collaboration & contracts
- `Features.Appointments` - Appointments
- `Features.SearchAds` - Search ads
- `Features.Chat` - Chat/messaging
- `Features.Dashboard` - Dashboard
- `Features.Common` - Shared constants
- `Features.Landing` - Landing pages

### UI.\*

- `UI.BUTTON_*` - Button styles
- `UI.MODAL_*` - Modal/dialog
- `UI.CARD_*` - Card container
- `UI.ALERT_*` - Alert/notification
- `UI.LOADING_*` - Loading states
- `UI.FORM_*` - Form inputs
- `UI.DIALOG_*` - Confirmation dialogs
- `UI.ICON_*` - Icons
- `UI.IMAGE_UPLOADER_*` - Image upload

## 🎯 Finding What You Need

| I need...     | Use this...                                 |
| ------------- | ------------------------------------------- |
| Toast message | `Features.{Domain}.{DOMAIN}_TOAST_MESSAGES` |
| Route/URL     | `Features.{Domain}.{DOMAIN}_ROUTES`         |
| API endpoint  | `Features.{Domain}.{DOMAIN}_ENDPOINTS`      |
| Status config | `Features.{Domain}.{DOMAIN}_STATUS_CONFIG`  |
| Button style  | `UI.BUTTON_*`                               |
| Modal style   | `UI.MODAL_*`                                |
| Form style    | `UI.FORM_*`                                 |
| Loading style | `UI.LOADING_*`                              |

## ❌ Don't Do This

```typescript
// ❌ Old pattern (deprecated)
import { TOAST_MESSAGES } from '@/lib/constants';
toast.success(TOAST_MESSAGES.AUTH.LOGIN_SUCCESS);

// ❌ Direct import
import { AUTH_TOAST_MESSAGES } from '@/lib/constants/features/auth';

// ❌ Hardcoded classes
<button className="bg-blue-600 hover:bg-blue-700 px-6 py-3">
```

## ✅ Do This Instead

```typescript
// ✅ Use namespace
import { Features } from '@/lib/constants';
toast.success(Features.Auth.AUTH_TOAST_MESSAGES.LOGIN_SUCCESS);

// ✅ Use UI constants
import { UI } from '@/lib/constants/components';
<button className={`${UI.BUTTON_BASE_CLASSES} ${UI.BUTTON_VARIANT_CLASSES.primary}`}>
```

---

**Pro Tip:** Use your IDE's autocomplete! Type `Features.` or `UI.` and let IntelliSense show you all available options.
