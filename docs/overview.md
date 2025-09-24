# Docs Overview

- collaboration-actions.md — Describes the collaboration details page actions, role permissions, and API wiring.
- chat-attachments.md — Chat file attachments (images, PDF, Word) flow and API.

## Server

- Express.js + MongoDB + Socket.IO
- Health endpoint `/api/health`
- Middleware: auth, error handling, rate limit
- Validation: Zod schemas + middleware (see `docs/validation-zod.md`)

## Collaboration UI guards

- Activities and progress changes are disabled until a collaboration is `active`.
- The ProgressTracker's "Modifier le statut" and ActivityManager's "Ajouter une activité" controls are hidden/disabled when status is not `active`.

## Collaboration UI shared components

- Shared primitives are used across overall-status and progress-tracking to avoid duplication:
  - `StatusBadge` for status chips
  - `StepIndicator` for step circle rendering
  - `CheckmarkIcon` for checkmark visuals
  - `statusColors.ts` for centralized color mappings
  - `stepOrder.ts` for unified progress step order

See `docs/ui-collaboration-refactor.md` for details.
