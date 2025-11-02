# UI State Persistence (scroll, tabs, filters, pagination)

This feature adds session-scoped persistence so users return to the exact same view state when navigating back to a page.

## What persists

- Scroll position (window or a specific container)
- Active tab (e.g., Dashboard)
- Filters/search inputs
- Pagination (current page)

## How it works

- Session storage with a per-path key keeps a PageViewState snapshot.
- A small Zustand store mirrors the last saved state for quick access.
- URL params override saved state when present (e.g., `?tab=properties`, `?page=2`).
- State is saved on unmount and when specific values change (filters/page/tab).

## Hooks

- `usePageState(options)`
  - Input: `{ key?, getCurrentState? }` where `getCurrentState` returns a partial `{ activeTab?, filters?, currentPage?, scrollX?, scrollY? }`.
  - Output: `{ key, savedState, save(partial), clear(), urlOverrides }`.
- `useScrollRestoration({ key, ready, scrollTargetId? })`
  - Restores scroll once `ready` is true and saves on scroll.

## Integration examples

- Properties page manager (`PropertyManager`): saves filters + page; restores container scroll.
- Dashboard (`DashboardContent`): saves `activeTab`; restores page scroll after stats load.
- Collaborations (`CollaborationList`): saves search/filters/page; restores container scroll.
- Appointments (`AppointmentsManager`): saves status filter, view mode, page; restores container scroll.
- My Searches (`MySearches`): saves page; restores container scroll.

## Notes

- Logout clears all saved page states.
- Components should cast/validate restored filters to local types.
- Prefer placing hook calls before early returns to satisfy React rules.
