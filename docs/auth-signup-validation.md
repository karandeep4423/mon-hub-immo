# Auth Signup Validation – Production fix

Problem observed in production: User creation failed with Mongoose required field errors for `firstName`, `lastName`, and `userType` even though the client sent them. This typically happens when:

- The server receives an empty/undefined body (mis-parsed JSON or wrong `Content-Type`), or
- Server-side validation allows missing fields to pass through to Mongoose, which then throws.

What changed

- Strengthened server-side signup validation rules (`server/src/middleware/validation.ts`) to explicitly require `firstName`, `lastName`, `email`, `password`, and `userType` using `.exists({ checkFalsy: true })` with clear messages.
- This ensures malformed or empty payloads are rejected early with 400 Validation errors instead of surfacing Mongoose validation messages.

Why this helps

- In production, proxies or clients can occasionally send bodies that parse to empty values or miss fields. With explicit existence checks, the route responds with consistent validation errors and doesn’t attempt to persist invalid data.

Notes

- JSON parsing is enabled globally via `express.json()` in `server/src/server.ts`.
- CORS is configured to allow the production frontend origin (`process.env.FRONTEND_URL` or `https://mon-hub-immo.com`).
- Client `SignUpForm` posts: `firstName`, `lastName`, `email`, `phone`, `password`, `confirmPassword`, `userType`. These map 1:1 with the server controller.

## Root Cause Found

The debugging logs revealed that the request body was being parsed correctly, but the values were becoming `undefined` after express-validator processing. The issue was with the sanitizers `.trim()` and `.escape()` in the validation rules, which were somehow clearing the field values in production.

## Fix Applied

Temporarily removed `.trim()` and `.escape()` sanitizers from:

- `firstName` field validation
- `lastName` field validation
- `email` field validation (kept `normalizeEmail()`)
- `password` field validation
- `phone` field validation (kept custom sanitizer)

The core validation logic remains:

- `.exists({ checkFalsy: true })` to require fields
- Length and pattern validation
- Custom validation rules

## Debugging in Production

If Mongoose validation errors persist despite the express-validator checks, the following debugging logs have been added:

1. **Request logging in auth routes**: Logs content-type, body presence, and field types
2. **Detailed controller logging**: Shows exactly what values are received for each field
3. **Body validation**: Explicit check for missing request body before validation

Check your production logs for:

- `Auth route POST /signup:` - Shows if body parsing is working
- `Signup request received:` - Shows field values and types
- `Validation errors:` - Shows any express-validator failures
- `Request body is missing or not an object` - Indicates body parsing failure

Acceptance

- Submitting without required fields returns 400 with validation errors from express-validator (not Mongoose).
- Submitting valid payload creates a user and sends a verification code.

## Manual Admin Validation Flow (New)

To improve network quality and prevent spam / automated accounts, we implemented a manual admin validation step:

- After verifying the email, the user account is created with `isValidated: false`.
- These users can verify their email but cannot access the platform until an admin approves their registration.
- Admins can validate, unvalidate, block, or unblock users from the Admin interface (`app/admin/users/:id`).
- System sends a confirmation email when the admin validates the account.

Developers: See `server/src/controllers/authController.ts` and `server/src/controllers/adminController.ts` for the controller changes, and `client/components/admin/AdminUsersTableModern.tsx` for the admin UI changes.

