# Rich Text Length Normalization

Scope: Align character counting across client and server for all rich-text fields (Profile bio 1000, Search Ad description 2000, Property description 2000) so only visible text is counted and HTML/entities don’t inflate length.

What changed

- Client: Added `client/lib/utils/html.ts` providing `htmlTextLength` and `htmlToPlainText` (DOM-based decoding + whitespace normalization + zero-width removal).
- Client: Updated `usePropertyForm` description validator to use `htmlTextLength` for the 2000-char limit.
- Client: Updated `lib/validation/searchAd.ts` description rule to use `htmlTextLength` (≤2000 chars).
- Server: Added `htmlToPlainText` and `htmlTextLength` in `server/src/utils/sanitize.ts` (entity decoding, zero-width removal, whitespace collapse).
- Server: Zod schemas now use `htmlTextLength` for min/max across bio, property, and search-ad descriptions.
- Server: Mongoose model validators for `User`, `Property`, `SearchAd` now use `htmlTextLength`.
- Server: `propertyController` uses `htmlTextLength` for description min/max before persisting.

Why

- Users saw errors when under the limit because HTML tags/entities were counted. This normalizes counting to visible text, matching the editor counter and backend rules.

Files touched

- `client/lib/utils/html.ts`
- `client/hooks/usePropertyForm.ts`
- `client/lib/validation/searchAd.ts`
- `server/src/utils/sanitize.ts`
- `server/src/validation/schemas.ts`
- `server/src/models/{User,Property,SearchAd}.ts`
- `server/src/controllers/propertyController.ts`

Notes

- RichTextEditor already guards input via `maxLength` and preserves formatting on overflow.
- Both frontend and backend now decode entities and drop zero-width characters before counting, ensuring the same number as the editor counter.
