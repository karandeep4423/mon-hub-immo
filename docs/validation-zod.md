# Server Validation with Zod

This server uses Zod for input validation alongside existing express-validator during migration.

- Schemas: `server/src/validation/schemas.ts`
- Middleware: `server/src/validation/middleware.ts`
- Example usage: `server/src/routes/collaboration.ts` (Zod validates params/body)

Notes

- Keep responses consistent: 400 with `{ success: false, message, errors }`.
- Prefer using shared helpers like `mongoId` and `frenchPostalCode` in schemas.
- Migrate route-by-route; once complete, remove express-validator rules and dependency.
