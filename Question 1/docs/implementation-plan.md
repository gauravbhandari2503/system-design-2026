# Question 1: News Feed - Master Implementation Plan

This document outlines the complete system design for the News Feed application. It distinguishes between features implemented in this frontend repository and architectural concepts that would require a backend or distributed system.

## 1. Features Implemented in Repository
These features are fully functional in this frontend demo.

### ✅ Infinite Scroll & Pagination
- **Implementation**: `useFeed.ts` manages a page-based offset. The `InfiniteScroll.vue` component uses `IntersectionObserver` to detect when the user reaches the bottom of the list and triggers a fetch for the next page.
- **Why**: Reduces initial payload size and improves load time.

### ✅ Optimistic UI Updates
- **Implementation**: When a user "Likes" a post, the UI updates immediately in `useFeed.ts` before the API call finishes. If the "API" fails (simulated), the change is rolled back.
- **Why**: Provides an instant, responsive feel to user interactions.

### ✅ Lazy Loading Media
- **Implementation**: Created a `LazyImage.vue` component using `IntersectionObserver`. Images only fetch their source URL when they are close to entering the viewport.
- **Why**: Saves bandwidth and speeds up initial page rendering by not loading off-screen assets.

### ✅ Client-Side Caching
- **Implementation**: Modified `useFeed.ts` to persist the `posts` array to `localStorage`. On page load, cached content is served immediately (Stale-While-Revalidate pattern) while fresh data is fetched in the background.
- **Why**: Allows offline viewing and instant "app start" performance.

### ✅ Skeleton Loading Screens
- **Implementation**: Created `FeedItemSkeleton.vue` that mimics the layout of a real post (gray blocks for title, image, avatar). This component is displayed while `loading` is true during the initial fetch.
- **Why**: Reduces perceived wait time compared to a generic spinning loader.

---

## 2. Conceptual / Backend-Dependent Features
These features are critical for a production Facebook/Instagram scale system but are **not** implemented here as they require backend infrastructure.

### 🔹 Virtual Scrolling (Recycling)
- **Concept**: Only rendering DOM nodes for items currently visible in the viewport. As the user scrolls, "off-screen" DOM nodes are destroyed/recycled.
- **Current State**: We use standard rendering (`v-for`).
- **Why Not Implemented**: Adds significant complexity for a demo. In production, libraries like `vue-virtual-scroller` would be used for lists with 1000+ items to keep memory usage constant.

### 🔹 Real-time Updates (WebSockets)
- **Concept**: Pushing new posts or like counts to the client instantly.
- **Current State**: We pull data via pagination.
- **Backend Requirement**: Redis Pub/Sub, WebSocket servers (Socket.io/Pusher).

### 🔹 Feed Generation Strategy (Fan-out)
- **Concept**:
    - **Fan-out-on-write**: When user posts, push ID to all followers' feed lists (fast read, slow write).
    - **Fan-out-on-read**: Query posts from all followees on demand (slow read, fast write).
- **Backend Requirement**: Distributed database (Cassandra/DynamoDB) and task queues (Kafka).

### 🔹 Content Delivery Network (CDN)
- **Concept**: Serving static media (images/videos) from edge servers close to the user.
- **Backend Requirement**: Cloud storage (S3) + CDN Provider (Cloudflare/CloudFront).

### 🔹 Database Normalization
- **Concept**: Storing Users, Posts, and Comments in separate normalized tables/collections.
- **Current State**: Our mock data returns nested objects for simplicity.
- **Backend Requirement**: SQL (Postgres) or NoSQL schema design.
