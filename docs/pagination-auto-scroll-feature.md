# Pagination Auto-Scroll Feature

## Overview

Implemented smooth auto-scroll functionality for pagination controls. When users click pagination buttons (Next, Previous, or page numbers), the page automatically scrolls to the top of the content section for better UX.

## Changes Made

### 1. Updated `Pagination.tsx` Component

**Location**: `client/components/ui/Pagination.tsx`

**New Features**:

- Added optional `scrollTargetId` prop to specify which element to scroll to
- Implemented `scrollToTarget()` function using native `scrollIntoView` API
- Smooth scroll behavior with `behavior: 'smooth'` and `block: 'start'`
- Scroll triggers automatically when page changes via any button

**Props Added**:

```typescript
scrollTargetId?: string; // Optional ID of element to scroll to
```

**Implementation**:

```typescript
const scrollToTarget = () => {
  if (scrollTargetId) {
    const element = document.getElementById(scrollTargetId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }
};

const goTo = (p: number) => {
  const page = Math.min(totalPages, Math.max(1, p));
  onPageChange(page);
  scrollToTarget(); // Scroll after page change
};
```

### 2. Updated Home Page (`app/home/page.tsx`)

**Changes**:

1. Added `id="properties-section"` to properties container
2. Added `id="search-ads-section"` to search ads container
3. Passed `scrollTargetId="properties-section"` to properties pagination
4. Passed `scrollTargetId="search-ads-section"` to search ads pagination

**Example**:

```tsx
<div id="properties-section">
  <h2>Les biens à vendre</h2>
  {/* Property cards */}
  <Pagination
    currentPage={propPage}
    totalItems={propertiesToShow.length}
    pageSize={PAGE_SIZE}
    onPageChange={setPropPage}
    scrollTargetId="properties-section"
    className="mt-4"
  />
</div>
```

## User Experience

### Before

- Users clicked pagination buttons
- Page content changed but viewport stayed at bottom
- Users had to manually scroll up to see new content

### After

- Users click any pagination button (Précédent, Suivant, or page number)
- Content changes AND page smoothly scrolls to section top
- Users immediately see the new content without manual scrolling

## Scroll Behavior

- **Type**: Smooth animated scroll
- **Target**: Top of content section (just above first card)
- **Timing**: Triggers immediately after page state update
- **Browser Support**: Uses native `scrollIntoView` API (supported in all modern browsers)

## Backward Compatibility

- `scrollTargetId` is optional
- Pagination works without it (no auto-scroll)
- Existing pagination implementations remain unchanged unless updated

## Usage in Other Pages

To add auto-scroll to other pages with pagination:

```tsx
// 1. Add ID to your content container
<div id="my-content-section">
  <h2>My Content</h2>
  {/* Your content */}

  {/* 2. Add scrollTargetId to Pagination */}
  <Pagination
    currentPage={page}
    totalItems={items.length}
    onPageChange={setPage}
    scrollTargetId="my-content-section"
  />
</div>
```

## Technical Details

### scrollIntoView Options

- `behavior: 'smooth'` - Animated scrolling
- `block: 'start'` - Align element to top of viewport

### Performance

- No external dependencies
- Uses native browser API
- No performance impact
- Works on all viewport sizes

## Pages Updated

- ✅ Home page (`/home`)
  - Properties section pagination
  - Search ads section pagination

## Future Enhancements

- Add scroll offset option (scroll to position slightly above target)
- Add configurable scroll behavior (smooth vs instant)
- Add scroll delay option for slower animations
- Add scroll-to-top button for long pages

## Testing Checklist

- ✅ Click "Suivant" button - scrolls to top
- ✅ Click "Précédent" button - scrolls to top
- ✅ Click page number button - scrolls to top
- ✅ Works on mobile devices
- ✅ Works on desktop
- ✅ Smooth animation visible
- ✅ No scroll when pagination not present
- ✅ Works for both properties and search ads sections
