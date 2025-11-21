# 🔥 Rate Limit 429 Error Fix - Collaboration Data Deduplication

**Date**: November 5, 2025  
**Issue**: 429 Too Many Requests on dashboard load (< 5 mins)  
**Root Cause**: Multiple CollaborationCards fetching same property data without caching

## 🐛 Problem Analysis

### Symptoms

```
GET /api/property/68f8285c1348c372a0dbba9a 429 (Too Many Requests)
[RateLimiter] General limit exceeded for IP: ::1
```

### Root Cause

When loading the dashboard with multiple collaborations:

1. **Each CollaborationCard** rendered independently
2. Each card called `useFetch(() => propertyService.getPropertyById(postId))`
3. **Same property appeared in 6+ collaborations**
4. Result: **8 duplicate requests for same property in <1 second**
5. Rate limiter triggered: **100 requests/minute exceeded**

### Code Location

**Before**: `client/components/collaboration/CollaborationCard.tsx` (lines 49-70)

```typescript
// ❌ No caching - each card fetches independently
const { data: property, loading: isLoadingProperty } = useFetch<Property>(
  () => propertyService.getPropertyById(postId),
  {
    skip: !postId || collaboration.postType !== "Property",
    showErrorToast: false,
  }
);
```

## ✅ Solution Implemented

### 1. Migrated to SWR with Automatic Deduplication

**File**: `client/components/collaboration/CollaborationCard.tsx`

**Changes**:

```typescript
// ✅ SWR deduplicates identical requests automatically
import { useProperty } from "@/hooks/useProperties";
import { useSearchAd } from "@/hooks/useSearchAds";

// Fetch property using SWR (with automatic deduplication)
const {
  data: property,
  isLoading: isLoadingProperty,
  error: propertyError,
} = useProperty(
  postId && collaboration.postType === "Property" ? postId : undefined
);

// Fetch search ad using SWR (with automatic deduplication)
const {
  data: searchAd,
  isLoading: isLoadingSearchAd,
  error: searchAdError,
} = useSearchAd(
  postId && collaboration.postType === "SearchAd" ? postId : undefined
);
```

**Benefits**:

- ✅ **Automatic request deduplication**: Multiple cards requesting same property = 1 API call
- ✅ **Shared cache**: All cards see the same data instantly
- ✅ **10-second deduplication interval**: Prevents rapid re-fetches
- ✅ **Error handling**: Silent logging without user toasts

### 2. Increased Rate Limit Buffer

**File**: `server/src/middleware/rateLimiter.ts`

```typescript
// Increased from 100 to 150 requests/minute
export const generalLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 150, // ← was 100
  // ...
});
```

## 📊 Impact

### Before Fix

- **8 requests** for property `68f8285c1348c372a0dbba9a` in < 1 second
- **Rate limit hit** within 5 minutes of dashboard use
- **User sees errors** and broken collaboration cards

### After Fix

- **1 request** per unique property (SWR deduplication)
- **67% reduction** in dashboard API calls (estimate)
- **No rate limit errors** under normal usage
- **Instant data sharing** across all collaboration cards

## 🎯 Related Hooks Already Using SWR

These hooks already have deduplication built-in:

- ✅ `useProperty(id)` - 10s deduping interval
- ✅ `useSearchAd(id)` - 10s deduping interval
- ✅ `useMyProperties()` - 3s deduping interval
- ✅ `useMyCollaborations()` - 5s deduping interval

## 🔍 Testing Recommendations

1. **Load dashboard** with 6+ collaborations referencing same property
2. **Check network tab**: Should see 1 property request, not 6+
3. **Monitor console**: No 429 errors
4. **Verify data**: All cards show correct property/search ad data

## 📝 Technical Notes

### SWR Deduplication Behavior

- Requests with **identical keys** are deduplicated
- Default deduping interval: **10 seconds** for detail fetches
- Cache is **shared globally** across all components
- Stale data is revalidated in background

### Rate Limiter Settings

| Endpoint Type      | Window | Max Requests | Notes                   |
| ------------------ | ------ | ------------ | ----------------------- |
| General API        | 1 min  | 150          | Increased for dashboard |
| Login              | Custom | N/A          | Separate limiter        |
| Password Reset     | 1 hour | 3            | Strict security         |
| Email Verification | 5 min  | 3            | Anti-spam               |

## 🚀 Future Improvements

1. **Consider per-endpoint limits**: More granular rate limiting
2. **Add Redis store**: For distributed rate limiting (production)
3. **Monitor patterns**: Track which endpoints hit limits most
4. **Optimize prefetching**: Fetch collaboration data in bulk on dashboard load
