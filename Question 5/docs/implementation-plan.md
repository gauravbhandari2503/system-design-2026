# Photo Sharing Application (Question 5) Implementation Plan

## Goal
Implement a performant, Instagram-style photo feed with infinite scroll and optimistic interactions.

## Architecture

### Components
- **PhotoFeed.vue**: Container utilizing `InfiniteScroll` to manage pagination.
- **PhotoCard.vue**: Renders post via "Card" pattern. Handles double-tap to like.

### Logic (`usePhotos.ts`)
- **Feed**: Cursor-based pagination logic.
- **Optimistic UI**: `toggleLike()` updates local state immediately, allowing instantaneous feedback before network request completes.

### Data Model
```typescript
interface Photo {
  id: string;
  url: string;
  username: string;
  likes: number;
  likedByMe: boolean;
  caption: string;
}
```
