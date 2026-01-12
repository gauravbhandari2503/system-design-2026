# Frontend Caching Strategies - Complete Guide

## Table of Contents

1. [Introduction](#introduction)
2. [Browser Caching Layers (L1, L2, L3)](#browser-caching-layers)
3. [HTTP Caching](#http-caching)
4. [Application-Level Caching](#application-level-caching)
5. [CDN Caching](#cdn-caching)
6. [Cache Invalidation Strategies](#cache-invalidation-strategies)
7. [Real-World Examples with Vue 3](#real-world-examples)

---

## Introduction

Caching is the practice of storing copies of data in temporary storage locations to reduce latency, minimize server load, and improve user experience. In frontend development, we deal with multiple caching layers, each serving different purposes.

### Why Caching Matters

- **Performance**: Reduce load times from seconds to milliseconds
- **Bandwidth**: Reduce network requests by 60-80%
- **Cost**: Lower server costs and CDN egress fees
- **UX**: Instant interactions, offline capabilities
- **Scalability**: Handle 10x more users with same infrastructure

---

## Browser Caching Layers

### L1 Cache: Memory Cache (RAM)

**Fastest** - Stored in browser's RAM, cleared when tab closes

```javascript
// Browser automatically uses memory cache for:
// - Same page resources during session
// - Recently accessed items
// - Small assets (typically < 100KB)

// Example: Image loaded twice on same page
<img src="/logo.png" alt="Logo in header">
<img src="/logo.png" alt="Logo in footer">
// Second image loads from memory cache (0ms)
```

**Characteristics**:

- Speed: ~0-5ms access time
- Size: Limited by available RAM (typically 50-100MB)
- Lifetime: Until tab/browser closes
- Control: Automatic, no developer control

### L2 Cache: Disk Cache (Hard Drive/SSD)

**Fast** - Persists across browser sessions

```javascript
// Browser stores based on Cache-Control headers
// Example: index.html with caching headers

// Server response headers:
Cache-Control: public, max-age=31536000
ETag: "33a64df551425fcc55e4d42a148795d9f25f89d4"

// On subsequent visits:
// - Browser checks disk cache first
// - Loads instantly if valid
// - Access time: ~10-50ms (SSD) or ~50-200ms (HDD)
```

**Characteristics**:

- Speed: 10-200ms access time
- Size: Typically 50MB - 1GB
- Lifetime: Days to months (based on headers)
- Control: Via HTTP headers

### L3 Cache: Service Worker Cache (Programmable Cache)

**Flexible** - Full developer control, offline-first capability

```javascript
// service-worker.js
const CACHE_NAME = "v1.0.0";
const URLS_TO_CACHE = [
  "/",
  "/styles/main.css",
  "/scripts/app.js",
  "/api/user/profile",
];

// Install event - cache critical resources
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(URLS_TO_CACHE))
  );
});

// Fetch event - serve from cache, fallback to network
self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      // Cache hit - return cached response
      if (response) {
        return response;
      }

      // Clone request for both cache and user
      const fetchRequest = event.request.clone();

      return fetch(fetchRequest).then((response) => {
        // Check if valid response
        if (!response || response.status !== 200) {
          return response;
        }

        // Clone response for both cache and user
        const responseToCache = response.clone();

        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, responseToCache);
        });

        return response;
      });
    })
  );
});
```

**Characteristics**:

- Speed: 10-100ms access time
- Size: Unlimited (quota-based, typically GBs)
- Lifetime: Persistent until manually cleared
- Control: Full programmatic control

---

## HTTP Caching

### Cache-Control Headers

```javascript
// ============================================
// 1. IMMUTABLE ASSETS (with hash in filename)
// ============================================
// app.a3f2b9c.js, logo.8d7f2a1.png
Cache-Control: public, max-age=31536000, immutable

// Why: File content never changes (hash changes if content changes)
// Duration: 1 year
// Use for: JS bundles, CSS, images with content hashes


// ============================================
// 2. HTML FILES (Entry Points)
// ============================================
Cache-Control: no-cache

// Why: Always revalidate, but can use cached version if unchanged
// Works with: ETag validation
// Use for: index.html, app entry points


// ============================================
// 3. API RESPONSES (Dynamic Data)
// ============================================
Cache-Control: private, max-age=300, must-revalidate

// Why: Cache for 5 minutes, then revalidate
// private: Not cached by CDN, only browser
// Use for: User-specific API data


// ============================================
// 4. PUBLIC API (Shared Data)
// ============================================
Cache-Control: public, max-age=3600, s-maxage=86400

// max-age: Browser cache for 1 hour
// s-maxage: CDN/proxy cache for 24 hours
// Use for: Public data, product listings


// ============================================
// 5. NO CACHING (Sensitive Data)
// ============================================
Cache-Control: no-store, no-cache, must-revalidate, private
Pragma: no-cache
Expires: 0

// Why: Never cache anywhere
// Use for: Banking, sensitive user data
```

### ETag Validation

```javascript
// First Request
// Client → Server
GET /api/products

// Server → Client (200 OK)
ETag: "686897696a7c876b7e"
Cache-Control: max-age=0, must-revalidate
{
  "products": [...]
}

// Subsequent Request (cache expired)
// Client → Server
GET /api/products
If-None-Match: "686897696a7c876b7e"

// Server → Client (304 Not Modified - if unchanged)
// No body sent, saves bandwidth!

// OR Server → Client (200 OK - if changed)
ETag: "abc123def456"
{
  "products": [...] // New data
}
```

---

## Application-Level Caching

### Vue 3 Composable for API Caching

```javascript
// composables/useApiCache.js
import { ref, computed } from "vue";

const cache = new Map();
const cacheTimestamps = new Map();

export function useApiCache(cacheTime = 5 * 60 * 1000) {
  // 5 minutes default

  const isCacheValid = (key) => {
    const timestamp = cacheTimestamps.get(key);
    if (!timestamp) return false;
    return Date.now() - timestamp < cacheTime;
  };

  const getCached = (key) => {
    if (isCacheValid(key)) {
      return cache.get(key);
    }
    return null;
  };

  const setCache = (key, data) => {
    cache.set(key, data);
    cacheTimestamps.set(key, Date.now());
  };

  const invalidate = (key) => {
    cache.delete(key);
    cacheTimestamps.delete(key);
  };

  const invalidatePattern = (pattern) => {
    const regex = new RegExp(pattern);
    for (const key of cache.keys()) {
      if (regex.test(key)) {
        invalidate(key);
      }
    }
  };

  const clear = () => {
    cache.clear();
    cacheTimestamps.clear();
  };

  return {
    getCached,
    setCache,
    invalidate,
    invalidatePattern,
    clear,
    cacheSize: computed(() => cache.size),
  };
}
```

### Using the Cache Composable

```javascript
// composables/useProducts.js
import { ref } from "vue";
import { useApiCache } from "./useApiCache";

export function useProducts() {
  const products = ref([]);
  const loading = ref(false);
  const error = ref(null);

  const { getCached, setCache, invalidate } = useApiCache(5 * 60 * 1000);

  const fetchProducts = async (force = false) => {
    const cacheKey = "products:all";

    // Check cache first
    if (!force) {
      const cached = getCached(cacheKey);
      if (cached) {
        products.value = cached;
        return cached;
      }
    }

    loading.value = true;
    error.value = null;

    try {
      const response = await fetch("/api/products");
      const data = await response.json();

      products.value = data;
      setCache(cacheKey, data);

      return data;
    } catch (err) {
      error.value = err.message;
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const refreshProducts = () => {
    invalidate("products:all");
    return fetchProducts(true);
  };

  return {
    products,
    loading,
    error,
    fetchProducts,
    refreshProducts,
  };
}
```

### Vue Component Usage

```vue
<template>
  <div class="products-page">
    <button @click="refreshProducts" :disabled="loading">
      Refresh Products
    </button>

    <div v-if="loading" class="loading">Loading...</div>

    <div v-else-if="error" class="error">Error: {{ error }}</div>

    <div v-else class="products-grid">
      <ProductCard
        v-for="product in products"
        :key="product.id"
        :product="product"
      />
    </div>
  </div>
</template>

<script setup>
import { onMounted } from "vue";
import { useProducts } from "@/composables/useProducts";

const { products, loading, error, fetchProducts, refreshProducts } =
  useProducts();

onMounted(() => {
  fetchProducts(); // Uses cache if available
});
</script>
```

---

## CDN Caching

### CDN Cache Strategy

```javascript
// vite.config.js - Build configuration for CDN
export default {
  build: {
    rollupOptions: {
      output: {
        // Add content hash to filenames
        entryFileNames: "assets/[name].[hash].js",
        chunkFileNames: "assets/[name].[hash].js",
        assetFileNames: "assets/[name].[hash].[ext]",
      },
    },
  },
};

// Result:
// assets/app.a3f2b9c8.js
// assets/vendor.d7e4f1a2.js
// assets/logo.8d7f2a13.png

// CDN Configuration (Cloudflare Workers example)
addEventListener("fetch", (event) => {
  event.respondWith(handleRequest(event.request));
});

async function handleRequest(request) {
  const url = new URL(request.url);

  // Cache strategy based on file type
  let cacheTime;

  if (url.pathname.match(/\.[a-f0-9]{8}\.(js|css|png|jpg|woff2)$/)) {
    // Hashed assets - cache for 1 year
    cacheTime = 31536000;
  } else if (url.pathname.endsWith(".html")) {
    // HTML - always revalidate
    cacheTime = 0;
  } else {
    // Other assets - cache for 1 hour
    cacheTime = 3600;
  }

  const cache = caches.default;
  const cacheKey = new Request(url.toString(), request);

  let response = await cache.match(cacheKey);

  if (!response) {
    response = await fetch(request);
    response = new Response(response.body, response);
    response.headers.set("Cache-Control", `public, max-age=${cacheTime}`);
    event.waitUntil(cache.put(cacheKey, response.clone()));
  }

  return response;
}
```

---

## Cache Invalidation Strategies

### 1. Time-Based Invalidation

```javascript
// composables/useTimedCache.js
import { ref, onUnmounted } from "vue";

export function useTimedCache(fetchFn, intervalMs = 60000) {
  const data = ref(null);
  const loading = ref(false);

  const fetch = async () => {
    loading.value = true;
    try {
      data.value = await fetchFn();
    } finally {
      loading.value = false;
    }
  };

  // Initial fetch
  fetch();

  // Auto-refresh interval
  const timer = setInterval(fetch, intervalMs);

  onUnmounted(() => {
    clearInterval(timer);
  });

  return { data, loading, refresh: fetch };
}

// Usage
const { data: stats } = useTimedCache(
  () => fetch("/api/stats").then((r) => r.json()),
  30000 // Refresh every 30 seconds
);
```

### 2. Event-Based Invalidation

```javascript
// stores/cacheStore.js
import { reactive } from "vue";
import mitt from "mitt";

const emitter = mitt();
const cacheStore = reactive({
  data: new Map(),
});

export function useCacheInvalidation() {
  const invalidateOn = (event, cacheKey) => {
    emitter.on(event, () => {
      cacheStore.data.delete(cacheKey);
      console.log(`Cache invalidated: ${cacheKey}`);
    });
  };

  const trigger = (event) => {
    emitter.emit(event);
  };

  return { invalidateOn, trigger };
}

// Usage Example
// Component A - Setup invalidation
const { invalidateOn } = useCacheInvalidation();
invalidateOn("product:updated", "products:all");
invalidateOn("product:deleted", "products:all");

// Component B - Trigger invalidation after action
const { trigger } = useCacheInvalidation();

const updateProduct = async (id, data) => {
  await api.updateProduct(id, data);
  trigger("product:updated"); // Invalidates cache
};
```

### 3. Version-Based Invalidation

```javascript
// Version-based cache keys
const CACHE_VERSION = "v2.1.0";

function getCacheKey(key) {
  return `${CACHE_VERSION}:${key}`;
}

// When version changes, all old cache becomes invalid
const products = getCached(getCacheKey("products")); // v2.1.0:products

// On deployment with new version, old caches are ignored
```

### 4. Dependency-Based Invalidation

```javascript
// composables/useDependentCache.js
export function useDependentCache() {
  const dependencies = new Map(); // key -> Set of dependent keys

  const setCache = (key, data, dependsOn = []) => {
    cache.set(key, data);

    // Register dependencies
    dependsOn.forEach((depKey) => {
      if (!dependencies.has(depKey)) {
        dependencies.set(depKey, new Set());
      }
      dependencies.get(depKey).add(key);
    });
  };

  const invalidate = (key) => {
    cache.delete(key);

    // Invalidate all dependent caches
    const dependents = dependencies.get(key);
    if (dependents) {
      dependents.forEach((depKey) => {
        cache.delete(depKey);
      });
      dependencies.delete(key);
    }
  };

  return { setCache, invalidate };
}

// Usage
const { setCache, invalidate } = useDependentCache();

// Product details depends on product list
setCache("product:123", productData, ["products:all"]);

// When products list is invalidated, product:123 is also invalidated
invalidate("products:all");
```

---

## Real-World Examples

### Complete Example: E-commerce Product Catalog

```vue
<!-- ProductCatalog.vue -->
<template>
  <div class="catalog">
    <header>
      <SearchBar v-model="searchQuery" />
      <button @click="refreshCatalog">🔄 Refresh</button>
      <span v-if="cacheInfo"> Cached {{ cacheInfo }} ago </span>
    </header>

    <FilterSidebar v-model:filters="filters" @change="onFiltersChange" />

    <div v-if="loading" class="skeleton-grid">
      <ProductSkeleton v-for="i in 12" :key="i" />
    </div>

    <ProductGrid
      v-else
      :products="filteredProducts"
      @product-click="viewProduct"
    />
  </div>
</template>

<script setup>
import { ref, computed, watch } from "vue";
import { useProductCache } from "@/composables/useProductCache";
import { useRouter } from "vue-router";

const router = useRouter();
const searchQuery = ref("");
const filters = ref({ category: "all", priceRange: [0, 1000] });

const {
  products,
  loading,
  cacheAge,
  fetchProducts,
  refreshProducts,
  prefetchProduct,
} = useProductCache();

const filteredProducts = computed(() => {
  let result = products.value;

  // Search filter
  if (searchQuery.value) {
    result = result.filter((p) =>
      p.name.toLowerCase().includes(searchQuery.value.toLowerCase())
    );
  }

  // Category filter
  if (filters.value.category !== "all") {
    result = result.filter((p) => p.category === filters.value.category);
  }

  // Price filter
  result = result.filter(
    (p) =>
      p.price >= filters.value.priceRange[0] &&
      p.price <= filters.value.priceRange[1]
  );

  return result;
});

const cacheInfo = computed(() => {
  if (!cacheAge.value) return null;
  const seconds = Math.floor(cacheAge.value / 1000);
  if (seconds < 60) return `${seconds}s`;
  return `${Math.floor(seconds / 60)}m`;
});

const onFiltersChange = () => {
  // Filters are applied client-side from cached data
  // No need to refetch
};

const viewProduct = (product) => {
  // Prefetch product details before navigation
  prefetchProduct(product.id);
  router.push(`/products/${product.id}`);
};

const refreshCatalog = () => {
  refreshProducts();
};

// Initial load
fetchProducts();
</script>
```

```javascript
// composables/useProductCache.js
import { ref, computed } from "vue";
import { useApiCache } from "./useApiCache";

export function useProductCache() {
  const products = ref([]);
  const loading = ref(false);
  const lastFetchTime = ref(null);

  const { getCached, setCache, invalidate } = useApiCache(5 * 60 * 1000);

  const cacheAge = computed(() => {
    if (!lastFetchTime.value) return null;
    return Date.now() - lastFetchTime.value;
  });

  const fetchProducts = async () => {
    const cacheKey = "products:catalog";

    // Try cache first
    const cached = getCached(cacheKey);
    if (cached) {
      products.value = cached.products;
      lastFetchTime.value = cached.timestamp;
      return;
    }

    // Fetch from API
    loading.value = true;
    try {
      const response = await fetch("/api/products");
      const data = await response.json();

      const cacheData = {
        products: data,
        timestamp: Date.now(),
      };

      products.value = data;
      lastFetchTime.value = Date.now();
      setCache(cacheKey, cacheData);
    } finally {
      loading.value = false;
    }
  };

  const refreshProducts = async () => {
    invalidate("products:catalog");
    await fetchProducts();
  };

  const prefetchProduct = async (productId) => {
    const cacheKey = `product:${productId}`;

    if (getCached(cacheKey)) return;

    try {
      const response = await fetch(`/api/products/${productId}`);
      const data = await response.json();
      setCache(cacheKey, data);
    } catch (err) {
      console.error("Prefetch failed:", err);
    }
  };

  return {
    products,
    loading,
    cacheAge,
    fetchProducts,
    refreshProducts,
    prefetchProduct,
  };
}
```

---

## Best Practices

### 1. Cache Appropriately

- **Immutable content**: Cache aggressively (1 year)
- **Dynamic content**: Short cache times (minutes)
- **User-specific data**: Use `private` cache control
- **Public data**: Use `public` for CDN caching

### 2. Use Content Hashing

```javascript
// Always use content hashes for assets
// app.a3f2b9c.js instead of app.js
// Allows aggressive caching without invalidation issues
```

### 3. Implement Cache Hierarchies

```
1. Check memory (instant)
2. Check disk/service worker (fast)
3. Check API cache (medium)
4. Fetch from network (slow)
```

### 4. Monitor Cache Performance

```javascript
// Track cache hit/miss rates
const cacheMetrics = {
  hits: 0,
  misses: 0,
  get hitRate() {
    return this.hits / (this.hits + this.misses);
  },
};
```

### 5. Handle Cache Errors Gracefully

```javascript
try {
  const cached = getCached(key);
  if (cached) return cached;
} catch (err) {
  console.error("Cache error:", err);
  // Fallback to network fetch
}
```

---

## Performance Impact

### Before Caching

- First load: 3.2s
- Subsequent loads: 2.8s
- API calls: 15 requests/page
- Bandwidth: 2.5MB/page load

### After Caching

- First load: 3.2s (unchanged)
- Subsequent loads: 0.4s (85% improvement)
- API calls: 2 requests/page (87% reduction)
- Bandwidth: 150KB/page load (94% reduction)

---

## Summary

Effective caching requires understanding and leveraging multiple layers:

- **L1 (Memory)**: Automatic, fastest, session-only
- **L2 (Disk)**: HTTP headers, persistent, browser-controlled
- **L3 (Service Worker)**: Programmable, offline-capable, full control

Combined with proper invalidation strategies and application-level caching, you can achieve dramatic performance improvements while maintaining data freshness.

**Next Steps**: Implement these patterns progressively, starting with HTTP caching headers, then adding application-level cache, and finally Service Workers for offline support.
