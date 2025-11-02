# Search Ads – Client Info: Icon-Card Inputs

Date: 2025-11-01

## Summary

Converted the plain inputs in the Search Ad Client Info form to the icon-card pattern with soft gradients and smooth transitions. This keeps the UI consistent with the rest of the search-ads sections and avoids layout shifts on selection.

## Changes

- File: `client/components/search-ads/SearchAdClientInfoForm.tsx`
  - `qualificationInfo.hasRealEstateAgent` → icon card (🧑‍💼)
  - `qualificationInfo.hasVisitedProperties` → icon card (🔎)
  - `qualificationInfo.projectType` (Couple/Seul) → icon-card radios (👫 / 👤)
  - Uses sr-only native inputs, gradient backgrounds, brand ring on selection, absolute ✓ indicator, and full-height cards.

## UX Notes

- No scaling on select; neighbors remain stable.
- Full-card background via `h-full` on label and inner container.
- Responsive grid (1 → 2 columns on `sm`).

## QA Checklist

- Keyboard toggling works (label wraps input).
- Focus ring visible on keyboard focus.
- Verified on mobile and desktop breakpoints.
