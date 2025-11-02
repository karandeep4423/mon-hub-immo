# Hardcoded Content Audit (Client) — 2025-10-27

Scope: Manual audit of client/app and client/components for hardcoded UI copy, labels, placeholders, brand text, and option lists that should use constants from `client/lib/constants`.

## Summary

- Findings density: 200+ hardcoded UI text occurrences in `components/*` and several in `app/*` (search capped at 200; real count higher).
- Top risk areas: branding, status/options lists, placeholders, footer contact/©, general messages.
- Constants available: Global (APP_NAME, GENERAL_MESSAGES), Components (Header, Footer, UI), Features (properties, searchAds, landing, auth, etc.), Pages (home, monagentimmo...). Many flagged strings already have constants defined.

## Prioritized fixes (high → medium)

1. Header branding and auth buttons

- File: `client/components/header/Header.tsx`
- Issues: Hardcoded brand split `mon` + `hubimmo`, button labels/styles, a11y label "Toggle menu".
- Use: `Components.HEADER_BRANDING`, `Components.HEADER_AUTH_BUTTONS`, `Components.HEADER_MOBILE_MENU`, `Components.HEADER_STYLES`.

2. Footer branding, contact, social and ©

- File: `client/components/landing/Footer.tsx`
- Issues: "mon/hubimmo" logo text, mailto/email, Instagram link, © string.
- Use: `Components.FOOTER_BRANDING`, `Components.FOOTER_CONTACT`, `Components.FOOTER_SOCIAL`, and `Features.Landing` or `Pages.Home` footer text if applicable.

3. Property status/type option lists

- Files: `components/property/PropertyFilters.tsx`, `components/property/PropertyListItem.tsx`, `components/property/PropertyFormStep4.tsx`
- Issues: Repeated option labels "Brouillon", "Actif", "Vendu", "Loué", "Archivé" and property types.
- Use: `Features.PROPERTIES.PROPERTY_STATUSES`, `Features.PROPERTIES.PROPERTY_STATUS_CONFIG`, `Features.PROPERTIES.PROPERTY_TYPES`.

4. Search-ad status/options and UI text

- Files: `components/search-ads/SearchAdCard.tsx`, `components/search-ads/EditSearchAdForm.tsx`, `components/search-ads/CreateSearchAdForm.tsx`, `components/search-ads/details/*`
- Issues: Option labels "Actif", "En pause", "Vendu", "Loué", "Archivé"; section titles like "Délai et disponibilité", card labels.
- Use: `Features.SEARCH_ADS.SEARCH_AD_STATUSES`, `Features.SEARCH_ADS.SEARCH_AD_STATUS_CONFIG`, `Features.SEARCH_ADS.SEARCH_AD_UI_TEXT`.

5. General UX messages (loading/error/empty)

- File: `components/ui/Loading.tsx`
- Issues: "Something went wrong", "No data available".
- Use: `GENERAL_MESSAGES.ERROR` and `GENERAL_MESSAGES.NO_DATA` (French), or add English variants if needed.

6. Placeholders and generic selects ("Sélectionner...")

- Files: `components/search-ads/*`, `components/property/*`, `components/ui/*`
- Issues: Multiple hardcoded "Sélectionner..." placeholders and inline select options.
- Use: `Features.PROPERTIES.PROPERTY_FORM_PLACEHOLDERS.SELECT_OPTION`, `Features.SEARCH_ADS.SEARCH_AD_PLACEHOLDERS`, or a shared `SELECT_PLACEHOLDER` constant if not covered.

7. Image Lightbox helper text

- File: `components/ui/ImageLightbox.tsx`
- Issues: "Cliquez pour zoomer • Échap pour fermer" and "Glissez pour déplacer • 0 pour réinitialiser" inline.
- Use: Add to `Components.UI.IMAGE_*` constants (e.g., extend `ui/image.ts` with LIGHTBOX_TEXT) and import.

8. Brand mentions in pages/sections

- Files: `components/monagentimmo/HeroSearchSection.tsx`, `app/monagentimmo/page.tsx`, `components/contract/ContractViewModal.tsx`
- Issues: Inline "MonAgentImmo" / "MonHubImmo" in prose.
- Use: `APP_NAME` and `Pages.MonAgentImmo`/`Features.Landing` text constants.

9. Collab lists and legends

- File: `components/collaboration/CollaborationList.tsx`
- Issues: Titles like "Total", "En attente", "Acceptées", etc.
- Use: Add section labels under `Features.COLLABORATION` (if not present) or reuse existing status config constants there.

10. Header logo colors and styles

- File: `components/header/Header.tsx`
- Issues: Hardcoded color codes `#6AD1E3` etc.
- Use: `Components.HEADER_STYLES.brandColor/brandColorHover` or `BRAND_COLORS.primary`.

## Detailed findings by file (samples)

- app/collaboration/[id]/page.tsx
  - L585: "Prix et frais" → move to `Features.COLLABORATION` text constants.
- app/property/[id]/page.tsx
  - L300: "Vues:" → `Features.PROPERTIES.PROPERTY_UI_TEXT` or add a `views` label.
- app/search-ads/[id]/page.tsx
  - L36: inline warning icon/label → consolidate into `SEARCH_AD_UI_TEXT` or a component.
- components/header/Header.tsx
  - Brand text split, hardcoded button labels/styles, a11y label → use `Components.HEADER_*`.
- components/landing/Footer.tsx
  - Email, Instagram URL, © text → `Components.FOOTER_*`.
- components/home/SearchFiltersPanel.tsx
  - Hardcoded property types and profile options → `Features.PROPERTIES.PROPERTY_TYPES`, `USER_TYPE_LABELS`.
- components/property/PropertyFilters.tsx
  - Status/type options → `Features.PROPERTIES.PROPERTY_STATUSES` + `PROPERTY_TYPES`.
- components/property/PropertyListItem.tsx
  - Status options → `PROPERTY_STATUS_CONFIG` labels.
- components/property/PropertyFormStep2.tsx
  - Section title "Localisation" → `PROPERTY_FORM_SECTIONS`/`SEARCH_AD_FORM_SECTIONS.LOCATION`.
- components/property/PropertyFormStep3.tsx
  - "Détails du bien" → `PROPERTY_FORM_SECTIONS`.
- components/property/PropertyFormStep4.tsx
  - Publish/status options → `PROPERTY_STATUSES` mappings; labels from `PROPERTY_STATUS_CONFIG`.
- components/property/PropertyFormStep5.tsx
  - "Informations client" → `PROPERTY_UI_TEXT` or new `CLIENT_INFO_SECTION` in properties constants.
- components/property/BadgeSelector.tsx
  - "Sélectionner des badges" → `PROPERTY_BADGES` meta; add a label constant if missing.
- components/ui/ImageLightbox.tsx
  - Two helper texts → add to `Components.UI.image.ts` constants.
- components/ui/ProfileImageUploader.tsx
  - English: "Supported formats..." → `IMAGE_UPLOADER_MESSAGES` (partially exists) and `FILE_UPLOAD` in `global.ts`.
- components/ui/Loading.tsx
  - English messages → `GENERAL_MESSAGES`.
- components/monagentimmo/HeroSearchSection.tsx
  - Inlined "MonAgentImmo"/"MonHubImmo", "Rechercher" → `APP_NAME`, `Pages.MonAgentImmo`, `HEADER_SEARCH.placeholder`.
- components/search-ads/\* (multiple)
  - Status options and section titles → `SEARCH_AD_STATUSES`, `SEARCH_AD_STATUS_CONFIG`, `SEARCH_AD_FORM_SECTIONS`, `SEARCH_AD_UI_TEXT`.
- components/collaboration/CollaborationList.tsx
  - Legends (Total/En attente/Acceptées/Actives/Terminées) → move to `Features.COLLABORATION`.
- components/appointments/\*
  - Day-of-week assumptions (Mon–Fri) in comments and inline labels → if surfaced in UI, add under `Features.Appointments`.

## Quick wins (batchable)

- Replace header branding and auth buttons in `Header.tsx` with `Components.HEADER_*` (single file, high visibility).
- Switch `Loading.tsx` messages to `GENERAL_MESSAGES`.
- Centralize footer branding/contact/© in `Components.FOOTER_*`.
- Convert all property/search-ad select options to use `Features.PROPERTIES` and `Features.SEARCH_ADS` enums + label maps.
- Replace repeated "Sélectionner..." with `PROPERTY_FORM_PLACEHOLDERS.SELECT_OPTION` or `SEARCH_AD_PLACEHOLDERS`.

## Proposed constants additions (minor, low-risk)

- Components UI: extend `lib/constants/components/ui/image.ts` with:
  - `IMAGE_LIGHTBOX_TEXT = { zoomHint: 'Cliquez pour zoomer • Échap pour fermer', panHint: 'Glissez pour déplacer • 0 pour réinitialiser' }`
- Properties: add `PROPERTY_UI_TEXT.views = 'Vues'` if not present.
- Collaboration: add label set for list legends and filters.

## Implementation guidelines

- Import from barrel: `import { Components, Features, APP_NAME, GENERAL_MESSAGES } from '@/lib/constants'`.
- For selects, prefer mapping constants to `{ value, label }` via central config objects to avoid duplicating labels.
- Keep emojis in constants alongside labels if they’re part of UX.
- Avoid touching copy unless replacing with an equivalent constant; don’t change wording.

## Acceptance criteria

- 0 hardcoded brand text left in header/footer/auth components.
- All property/search-ad status and type options sourced from constants.
- Loading/error empty states use `GENERAL_MESSAGES`.
- New constants added for any missing repeated UI text (lightbox, views, etc.).

## Appendix: Raw matches (subset)

- Collected via regex for JSX text nodes; representative examples:
  - `components/search-ads/SearchAdCard.tsx`: "Recherche par", option labels (Actif/En pause/Vendu/Loué)
  - `components/property/PropertyFilters.tsx`: status/type options
  - `components/landing/Footer.tsx`: brand, ©, links
  - `components/ui/ImageLightbox.tsx`: lightbox helper texts
  - `components/ui/Loading.tsx`: English messages
  - `components/monagentimmo/HeroSearchSection.tsx`: brand mentions, "Rechercher"
  - `app/collaboration/[id]/page.tsx`: "Prix et frais"
  - `app/property/[id]/page.tsx`: "Vues:"
