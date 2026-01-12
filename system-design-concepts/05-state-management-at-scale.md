# State Management at Scale - Complete Guide

## Table of Contents

1. [Introduction](#introduction)
2. [State Architecture](#state-architecture)
3. [State Synchronization](#state-synchronization)
4. [Offline-First Architecture](#offline-first-architecture)
5. [Data Normalization](#data-normalization)
6. [Cache Management](#cache-management)
7. [State Libraries & Patterns](#state-libraries--patterns)
8. [Real-World Examples](#real-world-examples)
9. [Best Practices](#best-practices)

---

## Introduction

State management is the backbone of any modern web application. At scale, poor state management leads to bugs, performance issues, and maintainability nightmares. It's not just about "storing data"—it's about ensuring consistency, handling synchronization, and managing the lifecycle of information.

### The State Management Challenge

As applications grow, we face several Critical problems:

- **Where** to store data (local component, global store, server, URL)
- **When** to update (immediate, debounced, batched)
- **How** to sync (optimistic updates, conflict resolution)
- **Who** owns the truth (client vs server)

---

## State Architecture

A robust architecture defines clear boundaries for different types of state. Mixing these types is the most common cause of bugs.

### 1. State Classification

**Local State**: Data that belongs to a single component (e.g., input values, toggle status).
**Shared State**: Data accessible by multiple components (e.g., current theme, user session).
**Server State**: Data fetched from an API. It is technically a _cache_ of the remote source of truth.
**URL State**: Data stored in the URL (query params, route params). Crucial for shareability.

```javascript
/**
 * LOCAL STATE
 * - Component-specific
 * - Not shared
 * - Ephemeral (form inputs, UI toggles)
 */
const localState = ref("");

/**
 * SHARED STATE
 * - Multiple components need access
 * - Persistent during session
 * - Examples: user settings, app theme
 */
const sharedState = reactive({
  theme: "dark",
  language: "en",
  sidebarOpen: true,
});

/**
 * SERVER STATE
 * - Source of truth on backend
 * - Cached locally
 * - Needs synchronization
 */
const serverState = ref({
  users: [],
  posts: [],
  comments: [],
});

/**
 * URL STATE
 * - Shareable, bookmarkable
 * - Controls view/filters
 * - Synced with router
 */
const urlState = {
  search: route.query.q,
  page: route.query.page,
  filters: route.query.filters,
};
```

### 2. State Layers Architecture

The flow of data should be unidirectional and layered.

```
┌─────────────────────────────────────┐
│         Component State             │  ← Local UI state
│    (forms, toggles, modals)         │
├─────────────────────────────────────┤
│         Application State           │  ← Shared app state
│   (user, theme, global settings)    │
├─────────────────────────────────────┤
│         Server State Cache          │  ← Cached API responses
│    (React Query, SWR, Pinia)        │
├─────────────────────────────────────┤
│              Backend                │  ← Source of truth
│           (Database)                │
└─────────────────────────────────────┘
```

### 3. Pinia Store Architecture (Vue 3)

Pinia is the standard for Vue 3. It allows for modular, type-safe stores.

```javascript
// stores/auth.js
import { defineStore } from "pinia";
import { computed, ref } from "vue";

export const useAuthStore = defineStore("auth", () => {
  // State
  const user = ref(null);
  const token = ref(localStorage.getItem("token"));
  const loading = ref(false);

  // Getters work like computed properties
  const isAuthenticated = computed(() => !!user.value);
  const userName = computed(() => user.value?.name || "Guest");

  // Actions handle business logic
  async function login(credentials) {
    loading.value = true;
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        body: JSON.stringify(credentials),
      });

      const data = await response.json();

      user.value = data.user;
      token.value = data.token;
      localStorage.setItem("token", data.token);

      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    } finally {
      loading.value = false;
    }
  }

  function logout() {
    user.value = null;
    token.value = null;
    localStorage.removeItem("token");
  }

  async function fetchUser() {
    if (!token.value) return;

    try {
      const response = await fetch("/api/auth/me", {
        headers: { Authorization: `Bearer ${token.value}` },
      });

      user.value = await response.json();
    } catch (error) {
      // Token invalid, logout
      logout();
    }
  }

  return {
    user,
    token,
    loading,
    isAuthenticated,
    userName,
    login,
    logout,
    fetchUser,
  };
});
```

---

## State Synchronization

Keeping the client in sync with the server is difficult because of network latency. We use techniques like optimistic updates to pretend latency doesn't exist.

### 1. Optimistic Updates

**Concept:**
Update the UI immediately as if the request succeeded. If it fails later, roll back the change and show an error. This creates a "snappy" experience.

```javascript
// composables/useOptimisticTodo.js
import { ref } from "vue";

export function useOptimisticTodo() {
  const todos = ref([]);

  async function addTodo(text) {
    // 1. Generate temporary ID
    const tempId = `temp-${Date.now()}`;
    const optimisticTodo = {
      id: tempId,
      text,
      completed: false,
      pending: true,
    };

    // 2. Add to UI immediately (Optimistic Update)
    todos.value.push(optimisticTodo);

    try {
      // 3. Send to server
      const response = await fetch("/api/todos", {
        method: "POST",
        body: JSON.stringify({ text }),
      });

      const serverTodo = await response.json();

      // 4. Replace temp with real data
      const index = todos.value.findIndex((t) => t.id === tempId);
      todos.value[index] = { ...serverTodo, pending: false };
    } catch (error) {
      // 5. Rollback on failure
      todos.value = todos.value.filter((t) => t.id !== tempId);
      throw error;
    }
  }

  return { todos, addTodo };
}
```

### 2. Real-Time Sync with WebSocket

For apps where multiple users edit data (like Google Docs), we need real-time syncing.

```javascript
// composables/useRealtimeSync.js
import { ref, watch, onMounted, onUnmounted } from "vue";

export function useRealtimeSync(resource) {
  const data = ref([]);
  const ws = ref(null);

  function connect() {
    ws.value = new WebSocket("wss://api.example.com");

    ws.value.onopen = () => {
      // Subscribe to resource updates
      ws.value.send(
        JSON.stringify({
          type: "subscribe",
          resource,
        })
      );
    };

    ws.value.onmessage = (event) => {
      const message = JSON.parse(event.data);
      if (message.type === "update") {
        // Merge server update into local state
        const updateIndex = data.value.findIndex(
          (item) => item.id === message.data.id
        );
        if (updateIndex !== -1) {
          data.value[updateIndex] = message.data;
        }
      }
    };
  }

  onMounted(connect);

  return { data };
}
```

---

## Offline-First Architecture

Offline-first means the app works primarily from a local database, and syncs to the server when possible.

### 1. Local-First with IndexedDB

We write changes to IndexedDB first, then try to push to the server. If offline, the request stays in a queue.

```javascript
// composables/useOfflineFirst.js
export function useOfflineFirst() {
  const isOnline = ref(navigator.onLine);

  async function addTodo(todo) {
    const db = await initDB();

    // Always save locally first
    const localId = await db.add("todos", {
      ...todo,
      syncStatus: "pending", // Mark as needing sync
      localCreatedAt: Date.now(),
    });

    if (isOnline.value) {
      // Try to sync immediately
      syncToServer(todo, localId);
    } else {
      // Add to background sync queue
      await db.add("syncQueue", {
        action: "create",
        resource: "todos",
        localId,
        data: todo,
      });
    }

    return localId;
  }

  return { addTodo };
}
```

---

## Data Normalization

In complex apps, deeply nested data (e.g., Posts -> Comments -> Authors) becomes a nightmare to manage. If an author changes their avatar, you have to update it in every comment of every post. **Normalization** solves this by storing data flat, like a database.

### 1. Normalized State Structure

```javascript
// ❌ Nested/Denormalized (causes update consistency issues)
const state = {
  posts: [
    {
      id: 1,
      title: "Post 1",
      author: { id: 101, name: "John" }, // Duplicate data
      comments: [
        { id: 201, author: { id: 101, name: "John" } }, // Duplicate data again
      ],
    },
  ],
};

// ✅ Normalized (Single source of truth)
const state = {
  posts: {
    byId: {
      1: { id: 1, title: "Post 1", authorId: 101, commentIds: [201] },
    },
    allIds: [1],
  },
  users: {
    byId: {
      101: { id: 101, name: "John" }, // Stored once
    },
    allIds: [101],
  },
  comments: {
    byId: {
      201: { id: 201, authorId: 101 },
    },
    allIds: [201],
  },
};
```

---

## Cache Management

Caching server state improves performance drastically but introduces the problem of "staleness".

### 1. Simple Cache Strategy

```javascript
const cache = new Map();

export function useCachedFetch(key, fetcher, ttl = 60000) {
  const now = Date.now();

  if (cache.has(key)) {
    const { data, expiry } = cache.get(key);
    if (now < expiry) {
      return Promise.resolve(data); // Return cached
    }
  }

  return fetcher().then((data) => {
    cache.set(key, {
      data,
      expiry: now + ttl,
    });
    return data;
  });
}
```

---

## Best Practices

1. **Lift State Up sparingly**: Don't make everything global. Keep state as close to where it's used as possible.
2. **Use Computed Props**: Derive state whenever possible instead of manually updating sync variables.
3. **Immutable Updates**: Treat state as immutable (even in Vue/Pinia) to make tracking changes easier.
4. **Separation of Concerns**: Actions should handle logic (API calls), components should handle rendering.
5. **Normalize early**: If you have relational data, normalize it in the store to prevent sync bugs.
