# Dashboard updates – Professional Info + Live stats

## What changed

- Professional Info card on agent dashboard is now collapsible with persisted state.
- KPI cards on the dashboard now use live data from authenticated APIs.

## Implementation notes

- Collapsible card: `AgentProfileCard` with localStorage key `dashboard.profInfo.open`.
- KPIs source: `useDashboardStats` hook fetching in parallel:
  - GET /property/my/stats → totalProperties, byStatus, totalValue
  - GET /collaboration → collaborations (pending/active counts)
  - GET /search-ads/my-ads → saved searches count
- Formatting: `formatNumber`, `formatEuro` in `client/lib/utils/format`.

## Edge cases handled

- Stats hook no longer early-returns if `currentUserId` is missing, so network requests still fire when auth state arrives slightly later.
- Collaboration pending requests computed only when `currentUserId` is available; otherwise 0.

## Files

- client/components/dashboard-agent/DashboardContent.tsx – wires `useDashboardStats` and passes `_id` to CollaborationList.
- client/hooks/useDashboardStats.ts – fetches and derives KPIs.
- client/lib/api/propertyApi.ts – exposes `getMyPropertyStats`.
- server/src/controllers/propertyController.ts – includes `totalValue` in stats response.
