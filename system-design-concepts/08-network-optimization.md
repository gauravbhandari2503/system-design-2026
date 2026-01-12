# Network Optimization - Complete Guide

## Table of Contents

1. [Introduction](#introduction)
2. [Request Batching & Deduplication](#request-batching--deduplication)
3. [HTTP/2 & HTTP/3 Optimization](#http2--http3-optimization)
4. [Compression Strategies](#compression-strategies)
5. [Resource Prioritization](#resource-prioritization)
6. [API Gateway Patterns](#api-gateway-patterns)
7. [GraphQL Optimization](#graphql-optimization)
8. [CDN & Edge Networks](#cdn--edge-networks)
9. [Connection Pooling & Keep-Alive](#connection-pooling--keep-alive)
10. [Preconnect & DNS Optimization](#preconnect--dns-optimization)
11. [Real-World Examples](#real-world-examples)
12. [Best Practices](#best-practices)

---

## Introduction

Network optimization is crucial for performance. The network is often the slowest, most unreliable part of your application stack. Even with a blazing fast render engine, your app will feel sluggish if it waits 300ms for every API call.

### Key Metrics

- **Time to First Byte (TTFB)**: How long until the server sends the first piece of data. High TTFB usually means a slow database or server logic.
- **Request Count**: The total number of HTTP requests. Fewer is generally better, though HTTP/2 changes this math.
- **Payload Size**: The total bytes transferred. Smaller is always better.
- **Round Trip Time (RTT)**: The time it takes for a signal to go to the server and back. Physics limits this (speed of light), but CDN location matters.

---

## Request Batching & Deduplication

Making 50 separate requests for 50 users is inefficient. Batching combines them into one. Deduplication ensures you don't ask for the same data twice.

### 1. Request Batching

**Concept:**
Instead of firing an API call immediately, wait a few milliseconds (e.g., 10ms) to see if other components make similar requests. Then send them all in one array.

```javascript
// utils/batchRequest.js
class RequestBatcher {
  constructor(options = {}) {
    this.batchWindow = options.batchWindow || 10; // ms
    this.maxBatchSize = options.maxBatchSize || 50;
    this.endpoint = options.endpoint;
    this.queue = [];
    this.timer = null;
  }

  add(request) {
    return new Promise((resolve, reject) => {
      this.queue.push({ request, resolve, reject });

      if (this.queue.length >= this.maxBatchSize) {
        this.flush();
      } else if (!this.timer) {
        this.timer = setTimeout(() => this.flush(), this.batchWindow);
      }
    });
  }

  async flush() {
    if (this.queue.length === 0) return;

    clearTimeout(this.timer);
    this.timer = null;

    // Take a batch off the queue
    const batch = this.queue.splice(0, this.maxBatchSize);
    const requests = batch.map((item) => item.request);

    try {
      const response = await fetch(this.endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ requests }),
      });

      const results = await response.json();

      // Match results back to original promises
      batch.forEach((item, index) => {
        if (results[index].error) {
          item.reject(new Error(results[index].error));
        } else {
          item.resolve(results[index].data);
        }
      });
    } catch (error) {
      // If the batch fails, everyone in it fails
      batch.forEach((item) => item.reject(error));
    }

    // Continue flushing if queue has more items
    if (this.queue.length > 0) {
      this.flush();
    }
  }
}

// Usage
const userBatcher = new RequestBatcher({
  endpoint: "/api/batch/users",
  batchWindow: 10,
  maxBatchSize: 50,
});

// Multiple components request user data
async function fetchUser(userId) {
  return userBatcher.add({
    type: "GET_USER",
    userId,
  });
}

// These will be batched into a single request
const [user1, user2, user3] = await Promise.all([
  fetchUser(1),
  fetchUser(2),
  fetchUser(3),
]);
```

### 2. Request Deduplication

**Concept:**
If two components ask for "User 123" at the exact same time, you should only send one network request. The second component should piggyback on the first request's promise.

```javascript
// utils/dedupRequest.js
class RequestDeduplicator {
  constructor() {
    this.inFlight = new Map();
  }

  async fetch(key, fetcher) {
    // Check if request is already in flight
    if (this.inFlight.has(key)) {
      return this.inFlight.get(key);
    }

    // Start new request
    const promise = fetcher()
      .then((result) => {
        this.inFlight.delete(key);
        return result;
      })
      .catch((error) => {
        this.inFlight.delete(key);
        throw error;
      });

    this.inFlight.set(key, promise);
    return promise;
  }

  clear(key) {
    this.inFlight.delete(key);
  }

  clearAll() {
    this.inFlight.clear();
  }
}

export const requestDedup = new RequestDeduplicator();

// Usage
async function fetchUserProfile(userId) {
  const key = `user:${userId}`;

  return requestDedup.fetch(key, () =>
    fetch(`/api/users/${userId}`).then((r) => r.json())
  );
}

// Multiple components call this simultaneously
// Only one actual network request is made
const profile1 = await fetchUserProfile(123);
const profile2 = await fetchUserProfile(123); // Reuses same request
```

### 3. DataLoader Pattern

Combines Batching, Caching, and Deduplication into one utility. Popularized by GraphQL but useful everywhere.

```javascript
// utils/dataLoader.js
class DataLoader {
  constructor(batchLoadFn, options = {}) {
    this.batchLoadFn = batchLoadFn;
    this.maxBatchSize = options.maxBatchSize || 100;
    this.batchScheduleFn =
      options.batchScheduleFn || ((cb) => setTimeout(cb, 0));
    this.cache = options.cache !== false ? new Map() : null;

    this.queue = [];
    this.scheduled = false;
  }

  load(key) {
    // Check cache first
    if (this.cache && this.cache.has(key)) {
      return Promise.resolve(this.cache.get(key));
    }

    // Add to batch queue
    return new Promise((resolve, reject) => {
      this.queue.push({ key, resolve, reject });

      if (!this.scheduled) {
        this.scheduled = true;
        this.batchScheduleFn(() => this.dispatchBatch());
      }
    });
  }

  loadMany(keys) {
    return Promise.all(keys.map((key) => this.load(key)));
  }

  async dispatchBatch() {
    this.scheduled = false;

    const batch = this.queue.splice(0, this.maxBatchSize);
    if (batch.length === 0) return;

    const keys = batch.map((item) => item.key);

    try {
      const results = await this.batchLoadFn(keys);

      batch.forEach((item, index) => {
        const result = results[index];

        // Cache result
        if (this.cache) {
          this.cache.set(item.key, result);
        }

        item.resolve(result);
      });
    } catch (error) {
      batch.forEach((item) => item.reject(error));
    }

    // Process remaining queue
    if (this.queue.length > 0) {
      this.batchScheduleFn(() => this.dispatchBatch());
    }
  }

  clear(key) {
    if (this.cache) {
      this.cache.delete(key);
    }
  }

  clearAll() {
    if (this.cache) {
      this.cache.clear();
    }
  }
}
```

---

## HTTP/2 & HTTP/3 Optimization

The rules of optimization have changed with newer protocols.

### 1. HTTP/2 Benefits

HTTP/1.1 had a limit of ~6 parallel connections per domain. This led to "Domain Sharding" hackery. HTTP/2 solves this with **Multiplexing**—one connection, many streams.

**What Changed:**

- Don't bundle everything into one giant `app.js`. Smaller files are better now because they can be cached individually and downloaded in parallel without overhead.
- "Sprite sheets" for images are less critical (though still useful for limiting layout shifts).

```javascript
// Server-side (Node.js with http2)
const http2 = require("http2");
const fs = require("fs");

const server = http2.createSecureServer({
  key: fs.readFileSync("server-key.pem"),
  cert: fs.readFileSync("server-cert.pem"),
});

server.on("stream", (stream, headers) => {
  if (headers[":path"] === "/") {
    // Server Push: Send style.css BEFORE the client even asks for it
    stream.pushStream({ ":path": "/styles.css" }, (err, pushStream) => {
      if (err) return;
      pushStream.respond({ ":status": 200, "content-type": "text/css" });
      fs.createReadStream("styles.css").pipe(pushStream);
    });

    stream.respond({ ":status": 200, "content-type": "text/html" });
    fs.createReadStream("index.html").pipe(stream);
  }
});
```

### 2. HTTP/3 & QUIC

Built on UDP instead of TCP. It fixes the "Head-of-Line Blocking" problem where one lost packet delays _everything_.

```javascript
// Enable HTTP/3 in Nginx
// server {
//   listen 443 ssl http2;
//   listen 443 quic reuseport;
//
//   ssl_protocols TLSv1.3;
//
//   add_header Alt-Svc 'h3=":443"; ma=86400';
// }

// Client-side detection of connection quality
if ("connection" in navigator) {
  navigator.connection.addEventListener("change", () => {
    console.log("Network type:", navigator.connection.effectiveType); // '4g'
    console.log("Downlink:", navigator.connection.downlink, "Mbps");
    console.log("RTT:", navigator.connection.rtt, "ms");
  });
}
```

---

## Compression Strategies

Smaller payloads = faster websites.

### 1. Gzip & Brotli

Brotli (`br`) is superior to Gzip for text (HTML, CSS, JS).

```javascript
// Server-side (Express.js)
const compression = require("compression");
const express = require("express");
const app = express();

// Standard Gzip
app.use(
  compression({
    level: 6,
    threshold: 1024, // Don't compress tiny files (overhead > gain)
  })
);

// Better: Brotli (requires 'shrink-ray-current' package)
const shrinkRay = require("shrink-ray-current");
app.use(
  shrinkRay({
    brotli: { quality: 11 }, // Max compression
  })
);
```

### 2. Client-Side Compression

Sometimes you need to upload huge JSON blobs. Compress them _before_ sending to save bandwidth.

```javascript
import pako from "pako";

async function sendLargeData(data) {
  const jsonString = JSON.stringify(data);

  // Gzip compress the request body
  const compressed = pako.gzip(jsonString);

  await fetch("/api/data", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Content-Encoding": "gzip", // Tell server it's gzipped
    },
    body: compressed,
  });
}
```

### 3. Image Compression

Use modern formats. AVIF > WebP > JPG/PNG.

```vue
<template>
  <picture>
    <!-- Best compression -->
    <source :srcset="`${imagePath}.avif`" type="image/avif" />

    <!-- Good compression, broad support -->
    <source :srcset="`${imagePath}.webp`" type="image/webp" />

    <!-- Fallback -->
    <img :src="`${imagePath}.jpg`" :alt="altText" loading="lazy" />
  </picture>
</template>
```

---

## Resource Prioritization

You can tell the browser what is important.

### 1. Resource Hints

```html
<!-- Connect to the API server early, saving 100ms+ of handshake time -->
<link rel="preconnect" href="https://api.example.com" />

<!-- Download CSS for the NEXT page in the background -->
<link rel="prefetch" href="/next-page.css" />

<!-- High priority: "I need this RIGHT NOW" (e.g. Hero Image) -->
<link rel="preload" href="/hero.jpg" as="image" />
```

### 2. Priority Hints (`fetchpriority`)

New attribute to fine-tune loading order.

```vue
<template>
  <!-- Load this image BEFORE everything else -->
  <img src="/hero-image.jpg" fetchpriority="high" />

  <!-- Load this when you have time -->
  <img src="/footer-bg.jpg" fetchpriority="low" loading="lazy" />
</template>
```

### 3. Lazy Loading with IntersectionObserver

Don't load "HeavyChart.vue" until the user scrolls it into view.

```javascript
// composables/useLazyComponent.js
import { defineAsyncComponent, ref, onMounted } from "vue";

export function useLazyComponent(importFn) {
  const shouldLoad = ref(false);
  const componentRef = ref(null);

  onMounted(() => {
    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        shouldLoad.value = true;
        observer.disconnect();
      }
    });

    if (componentRef.value) observer.observe(componentRef.value);
  });

  const component = defineAsyncComponent({
    loader: importFn,
    loadingComponent: () => import("./Loading.vue"),
  });

  return { component, shouldLoad, componentRef };
}
```

---

## API Gateway Patterns

### 1. Backend for Frontend (BFF)

The generic API assumes one size fits all. A BFF creates a custom API specifically for your UI.

- **Without BFF**: Frontend makes 5 calls (User, Posts, Comments, Stats, Notifications).
- **With BFF**: Frontend makes 1 call (`/api/dashboard`), server aggregates connection efficiently.

```javascript
// bff/user-service.js
class UserBFFService {
  async getUserDashboard(userId) {
    // Parallelize backend calls
    const [user, posts, notifications] = await Promise.all([
      fetchUser(userId),
      fetchPosts(userId),
      fetchNotifications(userId),
    ]);

    // Transform for UI: Remove 90% of unused fields
    return {
      name: user.name,
      avatar: user.avatar_url,
      recentPosts: posts.map((p) => ({ title: p.title, id: p.id })),
      unreadCount: notifications.filter((n) => !n.read).length,
    };
  }
}
```

### 2. API Aggregation

If you can't build a full BFF, an Aggregator class in your frontend API layer can at least manage the complexity.

```javascript
// api/aggregator.js
class APIAggregator {
  async aggregate(requests) {
    // Execute multiple promises and settle them (don't fail all if one fails)
    const results = await Promise.allSettled(
      requests.map((req) => fetch(req.url))
    );

    return results.map((r) => (r.status === "fulfilled" ? r.value : null));
  }
}
```
