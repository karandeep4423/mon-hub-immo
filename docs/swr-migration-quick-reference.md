# SWR Migration Quick Reference

## 🔄 Migration Patterns

### Pattern 1: Simple Data Fetching

**Before (useFetch):**

```typescript
const { data, loading, error, refetch } = useFetch(() => api.getData(), {
  deps: [userId],
});
```

**After (SWR):**

```typescript
const { data, isLoading, error, mutate } = useSWR(
  swrKeys.resource.list(userId),
  () => api.getData()
);
```

---

### Pattern 2: With Initial Data

**Before:**

```typescript
const { data, loading } = useFetch(() => api.getData(), { initialData: [] });
```

**After:**

```typescript
const { data, isLoading } = useSWR(key, fetcher, { fallbackData: [] });
```

---

### Pattern 3: Conditional Fetching

**Before:**

```typescript
const { data, loading } = useFetch(() => api.getData(), {
  skip: !userId,
  deps: [userId],
});
```

**After:**

```typescript
const { data, isLoading } = useSWR(
  userId ? swrKeys.resource.list(userId) : null,
  () => api.getData()
);
```

---

### Pattern 4: Error Handling

**Before:**

```typescript
const { data, loading, error } = useFetch(() => api.getData(), {
  showErrorToast: true,
  errorMessage: "Failed to load",
});
```

**After:**

```typescript
const { data, isLoading, error } = useSWR(key, fetcher, {
  onError: (err) => {
    toast.error("Failed to load");
  },
});
```

---

### Pattern 5: Mutation with Refetch

**Before:**

```typescript
const { refetch } = useFetch(() => api.getData());

const { mutate: updateItem } = useMutation(
  async (data) => await api.update(data),
  {
    onSuccess: () => {
      refetch(); // Manual refetch
    },
  }
);
```

**After:**

```typescript
const { mutate } = useSWR(key, fetcher);

const handleUpdate = async (data) => {
  await api.update(data);
  mutate(); // Revalidate
  // Or invalidate globally:
  // mutate((k) => Array.isArray(k) && k[0] === 'resource');
};
```

---

## 🔑 SWR Key Migration

### Create Keys from Dependencies

**Before:**

```typescript
const { data } = useFetch(() => api.getData(), { deps: [userId, filter] });
```

**After:**

```typescript
// Add to swrKeys.ts
resource: {
  list: (userId?: string, filter?: string) =>
    userId ? ["resource", "list", userId, filter] : null;
}

// Use in component
const { data } = useSWR(swrKeys.resource.list(userId, filter), () =>
  api.getData()
);
```

---

## 🎯 Common Component Patterns

### Dashboard Component

```typescript
export const Dashboard = () => {
  const { user } = useAuth();

  const { data: stats, isLoading: loadingStats } = useSWR(
    swrKeys.properties.stats(user?._id),
    () => PropertyService.getMyPropertyStats()
  );

  const { data: collaborations, isLoading: loadingCollabs } = useSWR(
    swrKeys.collaborations.list(user?._id),
    () => collaborationApi.getUserCollaborations()
  );

  const loading = loadingStats || loadingCollabs;

  if (loading) return <Loading />;

  return <div>{/* Use stats and collaborations */}</div>;
};
```

### List Component with Mutations

```typescript
export const ItemList = () => {
  const { user } = useAuth();
  const { mutate: globalMutate } = useSWRConfig();

  const { data: items, isLoading } = useSWR(swrKeys.items.list(user?._id), () =>
    api.getItems()
  );

  const handleDelete = async (id: string) => {
    await api.deleteItem(id);
    toast.success("Item deleted");

    // Invalidate all item caches
    globalMutate((key) => Array.isArray(key) && key[0] === "items");
  };

  return (
    <div>
      {items?.map((item) => (
        <ItemCard
          key={item.id}
          item={item}
          onDelete={() => handleDelete(item.id)}
        />
      ))}
    </div>
  );
};
```

---

## 🚨 Common Issues & Solutions

### Issue: "data is possibly undefined"

**Solution:** Use optional chaining or fallbackData

```typescript
const { data } = useSWR(key, fetcher, { fallbackData: [] });
// Now data is never undefined
```

### Issue: Multiple components not syncing

**Solution:** Ensure keys are identical

```typescript
// BAD - different keys
useSWR(["items", userId], fetcher);
useSWR(["items", "list", userId], fetcher);

// GOOD - centralized keys
useSWR(swrKeys.items.list(userId), fetcher);
```

### Issue: Data not updating after mutation

**Solution:** Use global mutate with filter

```typescript
import { useSWRConfig } from "swr";

const { mutate } = useSWRConfig();

mutate((key) => Array.isArray(key) && key[0] === "items", undefined, {
  revalidate: true,
});
```

---

## 📝 Checklist for Migrating a Component

- [ ] Replace `import { useFetch } from '@/hooks/useFetch'`
- [ ] Add `import useSWR from 'swr'`
- [ ] Add `import { swrKeys } from '@/lib/swrKeys'`
- [ ] Change `loading` to `isLoading`
- [ ] Change `refetch` to `mutate`
- [ ] Replace `deps` with proper SWR key
- [ ] Replace `initialData` with `fallbackData`
- [ ] Replace `skip` with conditional key (null)
- [ ] Update error handling if needed
- [ ] Test component works
- [ ] Remove old import if no longer used

---

## 🎨 Creating New SWR Keys

When adding a new resource type:

1. **Add to `swrKeys.ts`:**

```typescript
export const swrKeys = {
  // ... existing keys

  newResource: {
    all: ["newResource"] as const,
    list: (userId?: string) =>
      userId ? ["newResource", "list", userId] : null,
    detail: (id: string) => ["newResource", "detail", id] as const,
  },
};
```

2. **Use in components:**

```typescript
const { data } = useSWR(swrKeys.newResource.list(user?._id), () =>
  api.getNewResources()
);
```

3. **Invalidate on mutation:**

```typescript
mutate((key) => Array.isArray(key) && key[0] === "newResource");
```

---

## ⚡ Performance Tips

### Disable Refetch on Focus for Static Data

```typescript
useSWR(key, fetcher, {
  revalidateOnFocus: false,
});
```

### Increase Deduplication Interval for Expensive Calls

```typescript
useSWR(key, fetcher, {
  dedupingInterval: 10000, // 10 seconds
});
```

### Prefetch Data on Hover

```typescript
const { mutate } = useSWRConfig();

<Card
  onMouseEnter={() => {
    mutate(swrKeys.items.detail(item.id));
  }}
/>;
```

---

**For more patterns, see:** `docs/swr-implementation.md`
