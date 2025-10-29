# Scroll Restoration App-Wide Fix

## Problem

1. Scroll restoration was broken across the entire app because the hook was resetting `history.scrollRestoration` back to `auto` on unmount/key change, causing browser default behavior to override our saved positions.
2. Other pages were trying to restore container scroll (`scrollTargetId`) but the containers didn't have `overflow` styling, so window was actually scrolling instead, causing restoration to fail.

## Solution

- Removed cleanup that was reverting `history.scrollRestoration` back to previous value (now stays `manual` globally)
- Removed `scrollTargetId` props from all pages - they all use window scroll now since none have scrollable containers
- Only save scroll positions from actual scroll events during user interaction, not at unmount time (prevents navigation scroll contamination where detail page scroll overwrites home page scroll)
- Added verification retries that reapply saved offsets if Next.js or layout shifts snap the view back to the top
- Delayed Home scroll restore until we finish replaying filters/pagination and SWR data is ready

## Impact

- Scroll restoration now works consistently across all pages using window scroll
- Users return to exact scroll position when navigating back from detail pages
- Fixed for: Home, PropertyManager, Dashboard, Collaborations, Appointments, MySearches
