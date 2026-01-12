# Data Loading Patterns - Complete Guide

## Table of Contents

1. [Introduction](#introduction)
2. [Pagination Strategies](#pagination-strategies)
3. [Infinite Scroll](#infinite-scroll)
4. [Optimistic Updates](#optimistic-updates)
5. [Prefetching & Preloading](#prefetching--preloading)
6. [Real-Time Data Strategies](#real-time-data-strategies)
7. [Data Fetching Libraries](#data-fetching-libraries)
8. [Advanced Patterns](#advanced-patterns)
9. [Real-World Examples](#real-world-examples)
10. [Best Practices](#best-practices)

---

## Introduction

Data loading is one of the most critical aspects of frontend architecture. The strategy you choose affects performance, user experience, scalability, and server load.

### Key Considerations

- **User Experience**: Perceived performance vs actual performance
- **Network Efficiency**: Minimize requests, reduce payload size
- **Scalability**: Handle millions of records efficiently
- **State Management**: Keep UI in sync with server
- **Error Handling**: Graceful degradation and retries

---

## Pagination Strategies

Pagination is essential when dealing with large datasets. It breaks down data into manageable chunks, improving load times and reducing browser memory usage.

### 1. Offset-Based Pagination

**Concept:**
This is the most common and "traditional" form of pagination. It works by telling the database to skip a certain number of records (`OFFSET`) and then return a set number of records (`LIMIT`). It often relies on page numbers (Page 1, Page 2, etc.).

**How it works:**

- The client requests `Page 2` with a size of `20`.
- The server translates this to "Skip the first 20 records, take the next 20".
- The UI typically displays "Previous", "Next", and numbered page links.

One challenge is that as the offset gets larger (e.g., Page 10,000), the database still has to traverse all preceding records before returning the requested ones, which can be slow.

```javascript
// API Request
GET /api/products?page=2&limit=20
// Translates to: OFFSET 20 LIMIT 20

// Implementation
<script setup>
import { ref, computed } from 'vue';

const currentPage = ref(1);
const pageSize = ref(20);
const products = ref([]);
const totalCount = ref(0);

const totalPages = computed(() =>
  Math.ceil(totalCount.value / pageSize.value)
);

async function fetchPage(page) {
  const response = await fetch(
    `/api/products?page=${page}&limit=${pageSize.value}`
  );
  const data = await response.json();

  products.value = data.items;
  totalCount.value = data.total;
  currentPage.value = page;
}

function nextPage() {
  if (currentPage.value < totalPages.value) {
    fetchPage(currentPage.value + 1);
  }
}

function prevPage() {
  if (currentPage.value > 1) {
    fetchPage(currentPage.value - 1);
  }
}
</script>

<template>
  <div class="pagination">
    <button @click="prevPage" :disabled="currentPage === 1">
      Previous
    </button>
    <span>Page {{ currentPage }} of {{ totalPages }}</span>
    <button @click="nextPage" :disabled="currentPage >= totalPages">
      Next
    </button>
  </div>
</template>
```

**Pros:**

- Simple to implement
- Easy to understand (page numbers)
- Can jump to any page directly

**Cons:**

- Performance degrades with large offsets
- Inconsistent results if data changes between requests
- Database query cost increases with offset

**Use Cases:** Admin panels, search results, product catalogs

---

### 2. Cursor-Based Pagination

**Concept:**
Instead of skipping records, cursor-based pagination uses a pointer (the "cursor") to mark a specific record in the dataset. To get the next page, the client asks for records _after_ that cursor. This is the preferred method for infinite feeds or real-time data.

**How it works:**

- The client requests the first page.
- The server returns the items plus a `nextCursor` (usually an encoded ID or timestamp of the last item).
- To get the next page, the client sends `?cursor=XYZ`.
- The database queries for items `WHERE id > cursor_value` limit 20. This is extremely fast because it uses indexes efficiently.

It solves the "content drift" problem: if a new item is added to the top of the list while the user is viewing Page 1, Offset pagination would show a duplicate item on Page 2 (as everything shifts down). Cursor pagination continues strictly from the last item seen, so no duplicates occur.

```javascript
// API Request
GET /api/posts?cursor=eyJpZCI6MTIzfQ==&limit=20

// Server Implementation (Node.js + Prisma)
app.get('/api/posts', async (req, res) => {
  const { cursor, limit = 20 } = req.query;

  const posts = await prisma.post.findMany({
    take: limit + 1, // Fetch one extra to check if there's more
    ...(cursor && {
      cursor: { id: decodeCursor(cursor) },
      skip: 1, // Skip the cursor itself
    }),
    orderBy: { createdAt: 'desc' },
  });

  const hasMore = posts.length > limit;
  const items = hasMore ? posts.slice(0, -1) : posts;
  const nextCursor = hasMore
    ? encodeCursor(items[items.length - 1].id)
    : null;

  res.json({ items, nextCursor, hasMore });
});

// Frontend Implementation
<script setup>
import { ref } from 'vue';

const posts = ref([]);
const cursor = ref(null);
const hasMore = ref(true);
const loading = ref(false);

async function loadMore() {
  if (loading.value || !hasMore.value) return;

  loading.value = true;
  try {
    const url = cursor.value
      ? `/api/posts?cursor=${cursor.value}&limit=20`
      : '/api/posts?limit=20';

    const response = await fetch(url);
    const data = await response.json();

    posts.value.push(...data.items);
    cursor.value = data.nextCursor;
    hasMore.value = data.hasMore;
  } finally {
    loading.value = false;
  }
}
</script>
```

**Pros:**

- Consistent performance regardless of position
- Handles real-time data changes gracefully
- No duplicate or missing items
- Scalable to millions of records

**Cons:**

- Can't jump to arbitrary page
- Requires indexed column for cursor
- More complex to implement

**Use Cases:** Social media feeds, activity logs, message threads

---

### 3. Keyset Pagination

**Concept:**
Keyset pagination is a variation of cursor pagination that uses the actual values of the sort columns (like `created_at` and `id`) as the "key" to fetch the next set of results.

**How it works:**

- Instead of an opaque token, the client sends the actual data values of the last item: `?after_created=2024-01-01&after_id=55`.
- The database runs a query like `WHERE (created_at, id) < ('2024-01-01', 55)`.
- This is the most performant method for databases like PostgreSQL as it fully utilizes composite indexes.

```javascript
// API Request
GET /api/users?after_id=1000&after_created=2024-01-15&limit=20

// SQL Query
SELECT * FROM users
WHERE (created_at, id) > ('2024-01-15', 1000)
ORDER BY created_at, id
LIMIT 20;

// Frontend Implementation
<script setup>
import { ref } from 'vue';

const users = ref([]);
const loading = ref(false);

async function loadNextPage() {
  const lastUser = users.value[users.value.length - 1];

  const params = new URLSearchParams({
    after_id: lastUser.id,
    after_created: lastUser.createdAt,
    limit: 20,
  });

  const response = await fetch(`/api/users?${params}`);
  const data = await response.json();

  users.value.push(...data.items);
}
</script>
```

**Pros:**

- Fastest pagination method
- Consistent results even with concurrent writes
- Works with compound sorting

**Cons:**

- Can only move forward (no backward pagination)
- Complex implementation
- Requires composite index

**Use Cases:** Analytics dashboards, time-series data, leaderboards

---

## Infinite Scroll

Infinite scroll automatically loads the next page of content as the user scrolls down, creating a seamless browsing experience. It relies heavily on Cursor or Keyset pagination on the backend.

### 1. Intersection Observer Implementation

**Concept:**
Instead of listening to the noisy `scroll` event (which fires dozens of times per second), we use the browser's `IntersectionObserver` API. We place a "sentinel" element (an invisible div or loading spinner) at the bottom of the list. When this element enters the viewport, we trigger the load function.

**Why use this:**

- **Performance:** It's much lighter on the main thread than scroll event listeners.
- **Accuracy:** It precisely tells you when an element is visible.

```vue
<template>
  <div class="feed">
    <PostCard v-for="post in posts" :key="post.id" :post="post" />

    <!-- Sentinel element to trigger loading -->
    <div ref="sentinel" class="sentinel">
      <LoadingSpinner v-if="loading" />
      <p v-else-if="!hasMore">No more posts</p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from "vue";

const posts = ref([]);
const sentinel = ref(null);
const loading = ref(false);
const hasMore = ref(true);
const cursor = ref(null);

let observer = null;

async function loadMore() {
  if (loading.value || !hasMore.value) return;

  loading.value = true;
  try {
    const response = await fetch(
      `/api/posts?cursor=${cursor.value || ""}&limit=20`
    );
    const data = await response.json();

    posts.value.push(...data.items);
    cursor.value = data.nextCursor;
    hasMore.value = data.hasMore;
  } catch (error) {
    console.error("Failed to load posts:", error);
  } finally {
    loading.value = false;
  }
}

onMounted(() => {
  observer = new IntersectionObserver(
    (entries) => {
      if (entries[0].isIntersecting) {
        loadMore();
      }
    },
    { rootMargin: "200px" } // Trigger 200px before visible
  );

  if (sentinel.value) {
    observer.observe(sentinel.value);
  }

  // Initial load
  loadMore();
});

onUnmounted(() => {
  if (observer) {
    observer.disconnect();
  }
});
</script>

<style scoped>
.sentinel {
  height: 100px;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
```

### 2. Virtual Scrolling for Large Lists

**Concept:**
Pagination loads data in chunks, but the DOM eventually gets huge. If a user scrolls through 100 pages, the browser has to manage thousands of DOM nodes, causing memory leaks and slow rendering.

**Virtual Scrolling** (or "Windowing") solves this by only rendering the items currently visible in the viewport. As the user scrolls, items leaving the view are unmounted and recycled.

**Key Benefits:**

- Constant DOM size regardless of list length.
- Smooth scrolling even with 100,000 items.

```vue
<template>
  <div
    ref="container"
    class="virtual-list"
    @scroll="handleScroll"
    :style="{ height: `${containerHeight}px` }"
  >
    <div :style="{ height: `${totalHeight}px`, position: 'relative' }">
      <div
        v-for="item in visibleItems"
        :key="item.id"
        :style="{
          position: 'absolute',
          top: `${item.offsetTop}px`,
          height: `${itemHeight}px`,
          width: '100%',
        }"
      >
        <slot :item="item.data" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";

const props = defineProps({
  items: Array,
  itemHeight: { type: Number, default: 50 },
  containerHeight: { type: Number, default: 600 },
  buffer: { type: Number, default: 5 },
});

const container = ref(null);
const scrollTop = ref(0);

const totalHeight = computed(() => props.items.length * props.itemHeight);

const visibleCount = computed(() =>
  Math.ceil(props.containerHeight / props.itemHeight)
);

const startIndex = computed(() =>
  Math.max(0, Math.floor(scrollTop.value / props.itemHeight) - props.buffer)
);

const endIndex = computed(() =>
  Math.min(
    props.items.length,
    startIndex.value + visibleCount.value + props.buffer * 2
  )
);

const visibleItems = computed(() => {
  const items = [];
  for (let i = startIndex.value; i < endIndex.value; i++) {
    items.push({
      id: props.items[i].id,
      data: props.items[i],
      offsetTop: i * props.itemHeight,
    });
  }
  return items;
});

function handleScroll(event) {
  scrollTop.value = event.target.scrollTop;
}
</script>
```

---

## Optimistic Updates

Optimistic UI makes applications feel instant. Instead of waiting for the server to confirm an action, we assume it will succeed and update the UI immediately.

### 1. Basic Optimistic Update Pattern

**Concept:**
When a user perfoms an action (like "Like" or "Delete"):

1. **Snapshot**: Save the current UI state.
2. **Mutate**: Immediately update the UI to show the desired state.
3. **Request**: Send the API request in the background.
4. **Confirm/Rollback**: If successful, sync with server response (if needed). If failed, revert to the snapshot and show an error.

```javascript
// composables/useOptimisticUpdate.js
import { ref } from "vue";

export function useOptimisticUpdate() {
  const items = ref([]);
  const pendingUpdates = new Map();

  async function updateItem(id, updates) {
    // 1. Store original value
    const originalItem = items.value.find((item) => item.id === id);
    const originalValue = { ...originalItem };

    // 2. Immediately update UI (optimistic)
    const index = items.value.findIndex((item) => item.id === id);
    items.value[index] = { ...originalItem, ...updates };

    // 3. Track pending update
    pendingUpdates.set(id, originalValue);

    try {
      // 4. Send to server
      const response = await fetch(`/api/items/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      });

      if (!response.ok) throw new Error("Update failed");

      const serverData = await response.json();

      // 5. Update with server response
      items.value[index] = serverData;
      pendingUpdates.delete(id);
    } catch (error) {
      // 6. Rollback on error
      items.value[index] = originalValue;
      pendingUpdates.delete(id);
      throw error;
    }
  }

  async function deleteItem(id) {
    // Store original
    const originalItem = items.value.find((item) => item.id === id);
    const originalIndex = items.value.findIndex((item) => item.id === id);

    // Optimistically remove
    items.value.splice(originalIndex, 1);

    try {
      await fetch(`/api/items/${id}`, { method: "DELETE" });
    } catch (error) {
      // Rollback - restore at original position
      items.value.splice(originalIndex, 0, originalItem);
      throw error;
    }
  }

  return {
    items,
    updateItem,
    deleteItem,
    hasPendingUpdates: () => pendingUpdates.size > 0,
  };
}
```

### 2. Optimistic Updates with React Query Style

**Concept:**
Modern data fetching libraries like TanStack Query (Vue Query) have built-in support for this pattern. They handle the cache management, snapshots, and rollbacks automatically, making the code much cleaner.

```javascript
// composables/useTodoMutation.js
import { useMutation, useQueryClient } from "@tanstack/vue-query";

export function useTodoMutation() {
  const queryClient = useQueryClient();

  const updateTodo = useMutation({
    mutationFn: (todo) =>
      fetch(`/api/todos/${todo.id}`, {
        method: "PATCH",
        body: JSON.stringify(todo),
      }),

    // Optimistic update
    onMutate: async (updatedTodo) => {
      // Cancel outgoing queries
      await queryClient.cancelQueries(["todos"]);

      // Snapshot current value
      const previousTodos = queryClient.getQueryData(["todos"]);

      // Optimistically update
      queryClient.setQueryData(["todos"], (old) =>
        old.map((todo) => (todo.id === updatedTodo.id ? updatedTodo : todo))
      );

      // Return context with snapshot
      return { previousTodos };
    },

    // Rollback on error
    onError: (err, updatedTodo, context) => {
      queryClient.setQueryData(["todos"], context.previousTodos);
    },

    // Always refetch after error or success
    onSettled: () => {
      queryClient.invalidateQueries(["todos"]);
    },
  });

  return { updateTodo };
}
```

---

## Prefetching & Preloading

Anticipating user actions allows us to load data _before_ it is needed, eliminating waiting times.

### 1. Route-Based Prefetching

**Concept:**
When the router starts navigating to a new page (e.g., User clicks "Product Detail"), we can start fetching the data needed for that page _immediately_. By the time the JavaScript bundle for the new page downloads and mounts, the data might already be ready.

```javascript
// router/index.js
import { createRouter, createWebHistory } from "vue-router";

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: "/products/:id",
      component: () => import("@/views/ProductDetail.vue"),
      // Prefetch product data before navigation
      beforeEnter: async (to, from, next) => {
        const productId = to.params.id;

        // Start fetching in parallel with route loading
        const productPromise = fetch(`/api/products/${productId}`).then((r) =>
          r.json()
        );

        // Store promise for component to use
        to.meta.productData = await productPromise;
        next();
      },
    },
  ],
});

export default router;
```

### 2. Link Hover Prefetching

**Concept:**
When a user hovers over a link, it's a strong signal they might click it. We can triggers a fetch on `mouseenter`. Even if the user clicks 200ms later, that's 200ms of "head start" for the network request.

```vue
<template>
  <a
    :href="`/products/${product.id}`"
    @mouseenter="prefetchProduct"
    @touchstart="prefetchProduct"
  >
    {{ product.name }}
  </a>
</template>

<script setup>
import { useRouter } from "vue-router";
import { usePrefetch } from "@/composables/usePrefetch";

const props = defineProps(["product"]);
const { prefetch } = usePrefetch();

function prefetchProduct() {
  // Only prefetch once
  prefetch(`product:${props.product.id}`, () =>
    fetch(`/api/products/${props.product.id}`).then((r) => r.json())
  );
}
</script>
```

### 3. Predictive Prefetching

**Concept:**
Using analytics to predict likely next steps. If 80% of users go from "Cart" to "Checkout", we should prefill the Checkout data as soon as they land on the Cart page.

```javascript
// composables/usePredictivePrefetch.js
import { ref, watch } from "vue";

export function usePredictivePrefetch() {
  const userBehavior = ref([]);

  function trackNavigation(route) {
    userBehavior.value.push({
      route,
      timestamp: Date.now(),
    });

    // Analyze patterns
    analyzePrefetchOpportunities();
  }

  function analyzePrefetchOpportunities() {
    // Example: If user visited /products/:id 3 times after /products
    // then prefetch product details when on /products

    const patterns = detectPatterns(userBehavior.value);

    patterns.forEach((pattern) => {
      if (pattern.confidence > 0.7) {
        prefetchRoute(pattern.nextRoute);
      }
    });
  }

  return { trackNavigation };
}
```

---

## Real-Time Data Strategies

Keeping the UI perfectly in sync with the server requires moving beyond simple "request/response" patterns.

### 1. Polling

**Concept:**
The simplest real-time strategy. The client asks the server "Do you have new data?" at a fixed interval (e.g., every 5 seconds).

**Pros:** Easy to implement, robust, works everywhere.
**Cons:** Wasted resources if no updates, delayed updates.

```javascript
// composables/usePolling.js
import { ref, onMounted, onUnmounted } from "vue";

export function usePolling(fetchFn, interval = 5000) {
  const data = ref(null);
  const error = ref(null);
  const loading = ref(false);
  let timerId = null;

  async function poll() {
    loading.value = true;
    try {
      data.value = await fetchFn();
      error.value = null;
    } catch (err) {
      error.value = err;
    } finally {
      loading.value = false;
    }
  }

  function start() {
    poll(); // Initial fetch
    timerId = setInterval(poll, interval);
  }

  function stop() {
    if (timerId) {
      clearInterval(timerId);
      timerId = null;
    }
  }

  onMounted(start);
  onUnmounted(stop);

  return { data, error, loading, start, stop };
}

// Usage
const { data: notifications } = usePolling(
  () => fetch("/api/notifications").then((r) => r.json()),
  30000 // Poll every 30 seconds
);
```

### 2. WebSocket Connection

**Concept:**
A persistent, two-way communication channel between client and server. Both parties can send data at any time.

**Use Cases:** Chat apps, multiplayer games, collaborative documents.
**Pros:** Instant updates, low overhead for frequent messages.
**Cons:** Complex to manage (reconnection, heartbeats, firewall issues).

```javascript
// composables/useWebSocket.js
import { ref, onMounted, onUnmounted } from "vue";

export function useWebSocket(url) {
  const data = ref(null);
  const status = ref("connecting"); // connecting, open, closed
  let ws = null;
  let reconnectTimer = null;

  function connect() {
    ws = new WebSocket(url);

    ws.onopen = () => {
      status.value = "open";
      console.log("WebSocket connected");
    };

    ws.onmessage = (event) => {
      data.value = JSON.parse(event.data);
    };

    ws.onerror = (error) => {
      console.error("WebSocket error:", error);
    };

    ws.onclose = () => {
      status.value = "closed";
      // Reconnect after 3 seconds
      reconnectTimer = setTimeout(connect, 3000);
    };
  }

  function send(message) {
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(message));
    }
  }

  function disconnect() {
    if (reconnectTimer) {
      clearTimeout(reconnectTimer);
    }
    if (ws) {
      ws.close();
    }
  }

  onMounted(connect);
  onUnmounted(disconnect);

  return { data, status, send, disconnect };
}
```

### 3. Server-Sent Events (SSE)

**Concept:**
A one-way channel where the server pushes updates to the client. It uses standard HTTP but keeps the connection open.

**Use Cases:** Stock tickers, news feeds, progress bars.
**Pros:** Simpler than WebSockets (automatic reconnection), uses HTTP.
**Cons:** One-way only (client can't send data back over same connection), connection limits in older browsers.

```javascript
// composables/useSSE.js
import { ref, onMounted, onUnmounted } from "vue";

export function useSSE(url) {
  const data = ref(null);
  const error = ref(null);
  const status = ref("connecting");
  let eventSource = null;

  function connect() {
    eventSource = new EventSource(url);

    eventSource.onopen = () => {
      status.value = "connected";
    };

    eventSource.onmessage = (event) => {
      data.value = JSON.parse(event.data);
    };

    eventSource.onerror = (err) => {
      error.value = err;
      status.value = "error";
      // EventSource automatically reconnects
    };
  }

  function disconnect() {
    if (eventSource) {
      eventSource.close();
      status.value = "disconnected";
    }
  }

  onMounted(connect);
  onUnmounted(disconnect);

  return { data, error, status, disconnect };
}

// Server implementation (Node.js)
app.get("/api/events", (req, res) => {
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");

  const sendEvent = (data) => {
    res.write(`data: ${JSON.stringify(data)}\n\n`);
  };

  // Send updates
  const interval = setInterval(() => {
    sendEvent({ timestamp: Date.now(), message: "Update" });
  }, 1000);

  req.on("close", () => {
    clearInterval(interval);
  });
});
```
