# Favorites Feature Documentation

## Overview

The favorites feature allows authenticated users to save properties to their personal favorites list. Users can toggle favorite status directly from property cards and view all their favorite properties on a dedicated page.

## Architecture

### Server-Side Components

#### Models

- **UserFavorite** (`server/src/models/UserFavorite.ts`)
  - Manages user-property favorite relationships
  - Uses compound indexes for performance and uniqueness
  - Includes automatic cleanup for orphaned favorites

#### Controllers

- **favoritesController** (`server/src/controllers/favoritesController.ts`)
  - `toggleFavorite` - Add/remove property from favorites
  - `getUserFavorites` - Get paginated list of user's favorites
  - `checkFavoriteStatus` - Check if property is favorited
  - `getUserFavoriteIds` - Get all favorite IDs for bulk operations

#### Routes

- `POST /api/favorites/properties/:propertyId/toggle` - Toggle favorite status
- `GET /api/favorites` - Get user's favorites (paginated)
- `GET /api/favorites/status/:propertyId` - Check favorite status
- `GET /api/favorites/ids` - Get favorite property IDs

### Client-Side Components

#### API Service

- **FavoritesService** (`client/lib/api/favoritesApi.ts`)
  - Handles all favorites-related API calls
  - Provides TypeScript interfaces for responses

#### State Management

- **useFavoritesStore** (`client/store/favoritesStore.ts`)
  - Zustand store for managing favorites state
  - Bulk favorite ID loading for performance
  - Automatic initialization on authentication

#### UI Components

- **FavoriteButton** (`client/components/ui/FavoriteButton.tsx`)
  - Reusable heart button component
  - Multiple sizes and styling options
  - Integrated with favorites store
  - Only shows for authenticated users

#### Pages

- **FavoritesPage** (`client/app/favorites/page.tsx`)
  - Dedicated page for viewing all favorites
  - Pagination support
  - Empty state with call-to-action
  - Real-time removal when unfavorited

## Integration Points

### Property Cards

- PropertyCard component enhanced with FavoriteButton
- Callback support for real-time favorite removal
- Positioning in top-right corner of property images

### Authentication

- AuthProvider automatically initializes favorites store on login
- Store resets on logout for security
- FavoriteButton only renders for authenticated users

### Navigation

- Existing "Favoris" link in header navigates to favorites page
- Text constants already defined in constants file

## Database Schema

### UserFavorite Collection

```typescript
{
  userId: ObjectId,        // Reference to User
  propertyId: ObjectId,    // Reference to Property
  createdAt: Date,         // When favorite was added
}
```

### Indexes

- `{ userId: 1, propertyId: 1 }` - Unique compound index
- `{ userId: 1, createdAt: -1 }` - User favorites with date sorting
- `{ propertyId: 1 }` - Property favorite lookups

### Property Updates

- `favoriteCount` field automatically maintained
- Incremented/decremented on favorite toggle
- Used for displaying popularity metrics

## Performance Considerations

### Client-Side Optimizations

- Bulk favorite ID loading on authentication
- Store-based state prevents redundant API calls
- Optimistic UI updates with error handling

### Server-Side Optimizations

- Compound indexes for fast lookups
- Populate queries with select for minimal data transfer
- Automatic orphaned favorite cleanup

### Caching Strategy

- Favorite IDs cached in Zustand store
- Store persists across page navigation
- Automatic refresh on authentication changes

## Error Handling

### Client-Side

- Graceful degradation for unauthenticated users
- Loading states during API operations
- Error boundaries for component isolation

### Server-Side

- Validation for invalid property/user IDs
- Automatic orphaned favorite detection
- Transaction-like updates for data consistency

## Future Enhancements

### Potential Features

- Favorite lists/collections organization
- Sharing favorite lists with other users
- Email notifications for favorited property updates
- Favorite property recommendations based on user patterns

### Performance Improvements

- WebSocket real-time updates for favorite counts
- Redis caching for frequently accessed favorites
- Elasticsearch integration for advanced favorite search

## Testing Considerations

### Unit Tests

- FavoriteButton component interactions
- FavoritesService API calls
- Store state management logic

### Integration Tests

- Favorite toggle API endpoints
- Authentication integration
- Database consistency checks

### End-to-End Tests

- Complete user favorite workflow
- Cross-page state persistence
- Error scenario handling
