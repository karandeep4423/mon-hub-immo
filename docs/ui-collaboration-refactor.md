# Collaboration UI Refactor (Duplication Cleanup)

## Summary

We centralized repeated UI patterns used by collaboration features (overall-status and progress-tracking) into shared components and constants. This eliminates duplication while preserving behavior and styling.

## What changed

- Added shared components in `client/components/ui/`:
  - `CheckmarkIcon.tsx`: reusable SVG icon
  - `StepIndicator.tsx`: step circle for completed/current/upcoming
  - `StatusBadge.tsx`: unified status badge
- Added constants in `client/lib/constants/`:
  - `statusColors.ts`: single source for status colors
  - `stepOrder.ts`: single source for progress step order
- Refactored components to use shared parts:
  - `ProgressTracker.tsx`
  - `ProgressTrackingDisplay.tsx`
  - `ProgressStatusModal.tsx`
  - `CollaborationStatusBadge.tsx`
  - `overall-status/OverallStatusBadge.tsx`
  - `overall-status/types.ts` (types simplified, config removed)
  - `CollaborationProgress.tsx` (uses StepIndicator)

## Why

- Deduplicates color mappings, arrays, and SVGs
- Keeps UI consistent and easier to maintain
- Avoids divergence across similar components

## Notes

- Property domain still has local badge color mappings. We intentionally did not change cross-domain logic. If desired, we can migrate those to `StatusBadge` with a small adapter.

## Acceptance

- No TypeScript errors in refactored files
- Components render identical UI as before
- Colors and labels unchanged
