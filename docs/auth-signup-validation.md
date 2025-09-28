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

Acceptance

- Submitting without required fields returns 400 with validation errors from express-validator (not Mongoose).
- Submitting valid payload creates a user and sends a verification code.
