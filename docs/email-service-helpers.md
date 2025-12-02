# Email Service Helpers

This document summarizes the centralized, typed email helpers added to `server/src/utils/emailService.ts` and how to use them inside controllers/services.

## Helpers

- sendSignupAcknowledgement({ to, name })
- sendAccountValidated({ to, name, email })
- sendInviteToSetPassword({ to, name, inviteUrl })
- sendTemporaryPassword({ to, name, tempPassword })
- sendVerificationCodeEmail({ to, name, code? })
- sendPasswordResetCodeEmail({ to, name, code, inviteUrl? })
- sendPasswordResetConfirmationEmail({ to, name })
- sendAccountLockedEmail({ to, name, lockDurationMinutes, unlockTime })
- sendPaymentReminderEmail({ to, name, billingUrl })

Each helper logs intent via the shared `logger` and delegates to `sendEmail()` which routes to Mailtrap in development and Brevo in production.

## Usage Example

```ts
import { sendInviteToSetPassword } from '@/utils/emailService';

await sendInviteToSetPassword({
  to: user.email,
  name: user.profile.fullName,
  inviteUrl: `${BASE_URL}/invite/${token}`,
});
```

## Environment Variables

Ensure the following variables are set:

- NODE_ENV
- EMAIL_HOST, EMAIL_PORT, EMAIL_USER, EMAIL_PASS, EMAIL_FROM
- BREVO_API_KEY (production only)

## Notes

- HTML templates are responsive and localized (FR).
- Prefer these helpers in controllers over custom HTML/subjects to keep consistency and auditability.
