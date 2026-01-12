# Performance & Optimization - Complete Guide

## Table of Contents

1. [Introduction](#introduction)
2. [Rendering Strategies](#rendering-strategies)
3. [Code Splitting & Lazy Loading](#code-splitting--lazy-loading)
4. [Bundle Optimization](#bundle-optimization)
5. [Critical Rendering Path](#critical-rendering-path)
6. [Web Vitals](#web-vitals)
7. [Asset Optimization](#asset-optimization)
8. [Performance Measurement](#performance-measurement)
9. [Web Workers & Multi-Threading](#web-workers--multi-threading)
10. [Memory Management](#memory-management)
11. [Network Performance](#network-performance)
12. [Progressive Enhancement](#progressive-enhancement)
13. [Performance Budgets](#performance-budgets)
14. [Advanced Optimization Techniques](#advanced-optimization-techniques)
15. [Real-World Examples](#real-world-examples)
16. [Performance Checklist](#performance-checklist)
17. [Key Takeaways](#key-takeaways)
18. [Further Reading](#further-reading)

---

## Introduction

Performance optimization is not just about writing efficient code; it's a holistic approach involving network, browser internals, and user perception.

**Why it matters:**

- **User Retention:** 53% of mobile users leave sites taking >3 seconds to load.
- **Conversion:** Every 100ms delay reduces conversions by ~7%.
- **SEO:** Google uses Core Web Vitals as a ranking factor.

### Key Metrics to Target

- **First Contentful Paint (FCP)**: < 1.8s (When the first pixel is painted)
- **Largest Contentful Paint (LCP)**: < 2.5s (When the main content is visible)
- **Time to Interactive (TTI)**: < 3.8s (When the app is usable)
- **Cumulative Layout Shift (CLS)**: < 0.1 (Visual stability)
- **First Input Delay (FID)**: < 100ms (Responsiveness)
- **Total Blocking Time (TBT)**: < 200ms (Main thread blockage)

---

## Rendering Strategies

Choosing the right rendering strategy is the most fundamental performance decision. It dictates how and where your application code is executed.

### 1. Client-Side Rendering (CSR)

**Default Vue 3 SPA behavior**

**Concept:**
The server sends a blank HTML shell and a JavaScript bundle. The browser downloads, parses, and executes the JS, which then fetches data and renders the DOM.

**Good For:** Rich applications, dashboards, private apps where SEO isn't primary.
**Trade-off:** Slow initial load (FCP/LCP) vs. Fast subsequent navigation.

```javascript
// main.js - Pure CSR
import { createApp } from "vue";
import App from "./App.vue";
import router from "./router";

createApp(App).use(router).mount("#app");

// The browser receives this initially:
// <body>
//   <div id="app"></div>
//   <script src="/src/main.js"></script>
// </body>
```

**Optimization Strategy for CSR:**
Since the initial bundle size is the bottleneck, we must aggressively split code to minimalize what's downloaded upfront.

```javascript
// vite.config.js
export default {
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // Separate vendor code from application logic
          vendor: ["vue", "vue-router", "pinia"],
          // Isolate heavy libraries to prevent blocking main thread
          charts: ["chart.js", "vue-chartjs"],
        },
      },
    },
    // Minify code to reduce transfer size
    minify: "terser",
  },
};
```

### 2. Server-Side Rendering (SSR)

**Full HTML generated on server**

**Concept:**
The server executes the Vue app, generates the full HTML string, and sends it to the client. The client displays the HTML immediately (fast FCP) but the page isn't interactive until the JS loads and "hydrates" the DOM.

**Good For:** Content-heavy sites, public facing apps, SEO-critical pages.
**Trade-off:** Fast FCP/LCP vs. potentially slow TTI (Time to Interactive) and higher server costs.

```javascript
// server.js - Express + Vue SSR
import { renderToString } from "vue/server-renderer";
import { createSSRApp } from "vue";

app.get("*", async (req, res) => {
  const app = createSSRApp({
    template: `<div>User: {{ user.name }}</div>`,
  });

  // The server does the heavy lifting
  const html = await renderToString(app);

  // Client sees content immediately
  res.send(`
    <div id="app">${html}</div>
    <script src="/client.js"></script>
  `);
});
```

**Hydration & Data Fetching:**
One challenge with SSR is data synchronization. The server fetches data to render HTML, and cached state must be sent to the client so it doesn't re-fetch immediately.

```javascript
// composables/useAsyncData.js
// This helper ensures data fetched on server is re-used on client
export function useAsyncData(key, fetcher) {
  // ... implementation handles server-prefetch and client-hydration
  // prevents "double fetching" of data
}
```

### 3. Static Site Generation (SSG)

**Pre-render pages at build time**

**Concept:**
Pages are rendered into static HTML files during the build process (e.g., in CI/CD). These files are deployed to a CDN.

**Good For:** Blogs, documentation (like this one), marketing sites.
**Trade-off:** Fastest possible delivery (CDN) vs. long build times for large sites.

```javascript
// vite.config.js with vite-ssg
// The build tool crawls your routes and generates index.html for each path
export default defineConfig({
  ssgOptions: {
    includedRoutes: ["/", "/about", "/products"],
    // Dynamic routes must be known at build time
    onRoutesGenerated: async () => {
      const ids = await fetchAllProductIds();
      return ids.map((id) => `/products/${id}`);
    },
  },
});
```

### 4. Incremental Static Regeneration (ISR)

**SSG + on-demand regeneration**

**Concept:**
Combines SSG and SSR. Pages are static initially, but after a specified timeout (`isr: 60`), the next user request triggers a background regeneration of the page on the server. The user sees the stale (cached) page while the new one is built.

**Good For:** E-commerce product pages, news sites where content changes but not instant real-time.

```javascript
// Nuxt 3 example
export default defineNuxtConfig({
  routeRules: {
    // Generated once, then re-built in background every 60s if visited
    "/products/**": { isr: 60 },
    // Never cached, always dynamic
    "/api/**": { cache: false },
  },
});
```

### 5. Streaming SSR

**Progressive HTML streaming**

**Concept:**
Instead of waiting for the _entire_ page to be rendered on the server before sending anything, chunks of HTML are sent as they are ready.

**Good For:** Pages with slow database queries or external API calls in one section.

```javascript
// The response is a stream, not a single string
const stream = pipeToNodeWritable(app);
stream.pipe(res);
// User sees Header -> Sidebar -> Content (as it loads)
```

---

## Code Splitting & Lazy Loading

JavaScript is the most expensive resource. It blocks the main thread during parsing and execution. Code splitting ensures we only load what is strictly necessary for the current view.

### 1. Route-Based Code Splitting

**Concept:**
Each page (route) gets its own JavaScript bundle. When a user visits `/home`, they don't download the code for `/settings`.

```javascript
const router = createRouter({
  routes: [
    {
      path: "/dashboard",
      // The `import()` syntax tells Vite/Webpack to create a separate chunk
      component: () => import("@/views/Dashboard.vue"),
    },
  ],
});
```

### 2. Component-Based Code Splitting

**Concept:**
Split internal parts of a page. If a page has a heavy "Export to PDF" modal that is rarely used, it shouldn't be loaded until the user clicks "Export".

```vue
<script setup>
import { defineAsyncComponent } from "vue";

// The browser won't download 'HeavyChart.js' until `showChart` is true
const AnalyticsChart = defineAsyncComponent({
  loader: () => import("@/components/AnalyticsChart.vue"),
  // Show a skeleton while the code downloads
  loadingComponent: ChartSkeleton,
});
</script>
```

### 3. Dynamic Imports

**Concept:**
Programmatic loading of modules. Useful for feature flagging or device-specific logic.

```javascript
// Load the markdown editor only if the user switches to markdown mode
if (editorMode === "markdown") {
  const module = await import("@/components/editors/MarkdownEditor.vue");
}
```

### 4. Prefetching & Preloading

**Concept:**
Use idle time to prepare for the _next_ action.

- **Preload:** High priority. "I need this for the current page immediately."
- **Prefetch:** Low priority. "I might need this for the next page."

```javascript
// In Router:
// When on Homepage, download Dashboard code in background
// so the click to "Dashboard" feels instant.
import(
  /* webpackPrefetch: true */
  "@/views/Dashboard.vue"
);
```

---

## Bundle Optimization

Making the files smaller and more efficient to process.

### 1. Tree Shaking

**Concept:**
Dead code elimination. The build tool analyzes your imports and excludes code that is never used.

**Implementation:**
Use ES Modules (`import/export`) instead of CommonJS (`require`).

```javascript
// ❌ Bad: Imports the entire lodash library (500 functions)
import _ from 'lodash';
_.debounce(...)

// ✅ Good: Imports ONLY the debounce function
import { debounce } from 'lodash-es';
```

### 2. Dependency Analysis

**Concept:**
Visualizing your bundle helps spot "bloat" — accidental inclusion of large libraries.

```bash
# Visualization tool shows a map of what's inside your bundle
npm run build:analyze
```

**Common Offenders:**

- `moment.js` (Use `date-fns` or `dayjs`)
- `lodash` (Use `lodash-es` or native methods)
- Large icon packs (Import specific icons, not the whole set)

### 3. Compression

**Concept:**
Compress text assets (JS, CSS, HTML) before sending them over the network.

- **Gzip:** Standard, good compression.
- **Brotli:** Modern, better compression (20-30% smaller than gzip).

```javascript
// vite.config.js
import viteCompression from "vite-plugin-compression";

export default {
  plugins: [
    // Generates .br files
    viteCompression({ algorithm: "brotliCompress" }),
  ],
};
```

---

## Critical Rendering Path

The sequence of steps the browser takes to convert HTML, CSS, and JS into pixels on the screen. Optimizing this path makes the page "feel" fast.

### 1. Optimize Critical CSS

**Concept:**
The browser cannot render content until it knows the style. If `style.css` is large, the screen stays white.
**Solution:** Extract the CSS for "above the fold" content and put it strictly in `<style>` tags in the HTML head. Defer the rest.

```html
<head>
  <!-- Rendered immediately -->
  <style>
    .header {
      height: 60px;
      background: #fff;
    }
    .hero {
      min-height: 400px;
    }
  </style>

  <!-- Loaded async, applied when ready -->
  <link
    rel="preload"
    href="/app.css"
    as="style"
    onload="this.rel='stylesheet'"
  />
</head>
```

### 2. Resource Hints

**Concept:**
Helping the browser prioritize network requests.

- **DNS Prefetch:** "Look up the IP for this domain now, we'll need it soon."
- **Preconnect:** "Open the TCP connection now."
- **Preload:** "Download this file explicitly."

```html
<!-- Connect to API domain while parsing HTML -->
<link rel="preconnect" href="https://api.myapp.com" />

<!-- High priority font loading -->
<link rel="preload" href="/fonts/main.woff2" as="font" crossorigin />
```

### 3. Script Loading Attributes

**Concept:**
Controlling when scripts execute relative to HTML parsing.

```html
<!-- Blocks parsing. Standard for critical libraries. -->
<script src="lib.js"></script>

<!-- Downloads in parallel, executes when downloaded.
     Order not guaranteed. Good for Analytics. -->
<script async src="analytics.js"></script>

<!-- Downloads in parallel, executes after HTML parse is done. 
     Order guaranteed. Best for application code. -->
<script defer src="app.js"></script>
```

---

## Web Vitals

Core Web Vitals are Google's metrics for User Experience.

### 1. LCP (Largest Contentful Paint)

**Target:** < 2.5s
**What:** How fast the "main thing" (hero image, heading) loads.
**Fixes:**

- Preload the LCP image.
- Don't lazy-load the LCP image.
- Optimize server response time (TTFB).

```html
<!-- explicit priority hint tells browser this is important -->
<img src="hero.webp" fetchpriority="high" />
```

### 2. CLS (Cumulative Layout Shift)

**Target:** < 0.1
**What:** Does the layout jump around? (e.g., ads popping in).
**Fixes:**

- Always define `width` and `height` on images.
- Reserve space for dynamic content (ads, embeds).

```css
/* Reserve space ratio for checking container */
.image-container {
  aspect-ratio: 16 / 9;
  background: #eee; /* Placeholder */
}
```

### 3. FID (First Input Delay) / INP (Interaction to Next Paint)

**Target:** < 200ms
**What:** Responsiveness. When I click, does it freeze?
**Fixes:**

- Break up long JavaScript tasks.
- Move heavy logic to Web Workers.

```javascript
// ❌ Blocks main thread for 500ms
items.forEach(heavyProcess);

// ✅ Yields to main thread options
async function process() {
  for (let item of items) {
    heavyProcess(item);
    // Let browser render frame
    await new Promise((r) => setTimeout(r, 0));
  }
}
```

---

## Asset Optimization

Media files are often 80% of page weight.

### 1. Image Optimization

**Concept:** Serve the smallest file possible that looks good.

- **Next-Gen Formats:** Use WebP or AVIF (smaller than PNG/JPEG).
- **Responsive Images:** Don't serve a 4k image to a mobile phone.

```html
<picture>
  <!-- Browser picks the best format it supports -->
  <source srcset="image.avif" type="image/avif" />
  <img src="image.jpg" alt="fallback" />
</picture>
```

### 2. Font Optimization

**Concept:** Text should be visible immediately (FOUT) rather than invisible (FOIT) while the font loads.

```css
/* Shows system font until custom font loads */
font-display: swap;

/* Support only specific characters (e.g. latin) to reduce file size */
unicode-range: U+0000-00FF;
```

---

## Performance Measurement

You cannot improve what you cannot measure.

### 1. Tools

- **Lighthouse:** Synthetic lab data. Good for best practices score.
- **Chrome DevTools Performance Tab:** Deep dive into execution flame charts.
- **RUM (Real User Monitoring):** Analytics from actual users in the wild.

### 2. Continuous Monitoring

Automate checks in your CI/CD pipeline to prevent regression.

```yaml
# GitHub Action: Fails build if performance score drops below 90
- name: Lighthouse Check
  uses: treosh/lighthouse-ci-action@v9
  with:
    budgetPath: "./budget.json"
```

---

## Web Workers & Multi-Threading

JavaScript is single-threaded, but we can offload heavy computation to Web Workers to keep the UI responsive.

### 1. When to Use Web Workers

**Good Use Cases:**
- Data processing (sorting, filtering large datasets)
- Image manipulation
- Encryption/decryption
- Complex calculations

**Not Suitable For:**
- DOM manipulation (workers don't have access to DOM)
- Quick operations (worker overhead might be more expensive)

### 2. Implementation Example

```javascript
// main.js
const worker = new Worker('/worker.js');

// Send data to worker
worker.postMessage({ action: 'sort', data: largeArray });

// Receive result
worker.onmessage = (e) => {
  const sortedData = e.data;
  updateUI(sortedData);
};

// worker.js
self.onmessage = (e) => {
  const { action, data } = e.data;
  
  if (action === 'sort') {
    const sorted = data.sort((a, b) => a - b);
    self.postMessage(sorted);
  }
};
```

### 3. Shared Workers

For multiple tabs to share the same worker instance, useful for shared state or WebSocket connections.

```javascript
const sharedWorker = new SharedWorker('/shared-worker.js');
sharedWorker.port.start();
sharedWorker.port.postMessage('hello');
```

---

## Memory Management

Poor memory management leads to leaks, causing the app to slow down over time.

### 1. Common Memory Leaks

**Event Listeners:**
```javascript
// ❌ Memory leak - listener never removed
mounted() {
  window.addEventListener('resize', this.handleResize);
}

// ✅ Proper cleanup
mounted() {
  window.addEventListener('resize', this.handleResize);
},
unmounted() {
  window.removeEventListener('resize', this.handleResize);
}
```

**Timers:**
```javascript
// ❌ Timer continues after component unmount
mounted() {
  this.timer = setInterval(() => this.fetchData(), 5000);
}

// ✅ Clear timer on unmount
unmounted() {
  clearInterval(this.timer);
}
```

**Global State:**
```javascript
// ❌ References prevent garbage collection
const cache = new Map();
function addToCache(id, data) {
  cache.set(id, data); // Never cleaned up
}

// ✅ Use WeakMap for automatic cleanup
const cache = new WeakMap();
```

### 2. Memory Profiling

```javascript
// Chrome DevTools Memory tab
// 1. Take heap snapshot
// 2. Interact with app
// 3. Take another snapshot
// 4. Compare snapshots to find leaks
```

---

## Network Performance

### 1. HTTP/2 & HTTP/3

**HTTP/2 Features:**
- Multiplexing: Multiple requests over single connection
- Server Push: Proactively send resources
- Header compression

**HTTP/3 Features:**
- Built on QUIC (UDP-based)
- Faster connection establishment
- Better performance on poor networks

```javascript
// Server configuration (Express + spdy)
import spdy from 'spdy';

spdy.createServer({
  key: fs.readFileSync('./key.pem'),
  cert: fs.readFileSync('./cert.pem')
}, app).listen(443);
```

### 2. Service Workers

**Concept:** Background scripts that intercept network requests, enabling offline functionality and sophisticated caching.

```javascript
// service-worker.js
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open('v1').then((cache) => {
      return cache.addAll([
        '/',
        '/app.js',
        '/styles.css',
        '/offline.html'
      ]);
    })
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      // Return cached version or fetch from network
      return response || fetch(event.request);
    })
  );
});
```

### 3. Resource Prioritization

**Concept:** Tell the browser which resources are most important.

```html
<!-- High priority - needed for initial render -->
<link rel="preload" href="critical.css" as="style" />
<link rel="preload" href="logo.svg" as="image" />

<!-- Low priority - needed for later interaction -->
<link rel="prefetch" href="dashboard.js" />

<!-- Module preload - for ES modules -->
<link rel="modulepreload" href="app.js" />
```

### 4. Connection Optimization

```html
<!-- DNS resolution ahead of time -->
<link rel="dns-prefetch" href="https://api.example.com" />

<!-- TCP + TLS handshake -->
<link rel="preconnect" href="https://cdn.example.com" crossorigin />

<!-- Fetch and cache resource -->
<link rel="prefetch" href="/next-page.js" />
```

---

## Progressive Enhancement

Build the app in layers, ensuring basic functionality works for everyone.

### 1. Core Functionality First

```javascript
// Base functionality without JS
<form action="/search" method="GET">
  <input name="q" type="search" />
  <button type="submit">Search</button>
</form>

// Enhanced with JS
<script>
  document.querySelector('form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const results = await fetchSearchResults();
    updateUIWithResults(results);
  });
</script>
```

### 2. Feature Detection

```javascript
// Check before using advanced features
if ('IntersectionObserver' in window) {
  // Use modern lazy loading
  const observer = new IntersectionObserver(callback);
} else {
  // Fallback: load all images immediately
  loadAllImages();
}
```

---

## Performance Budgets

Set limits to prevent performance regression.

### 1. Define Budgets

```json
// budget.json
{
  "bundles": [
    {
      "resourceSizes": [
        {
          "resourceType": "script",
          "budget": 300
        },
        {
          "resourceType": "total",
          "budget": 500
        }
      ]
    }
  ],
  "timings": [
    {
      "metric": "interactive",
      "budget": 3000
    },
    {
      "metric": "first-contentful-paint",
      "budget": 1500
    }
  ]
}
```

### 2. Automated Enforcement

```yaml
# .github/workflows/performance.yml
name: Performance Budget
on: [pull_request]
jobs:
  lighthouse:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Run Lighthouse
        uses: treosh/lighthouse-ci-action@v9
        with:
          configPath: './lighthouserc.json'
          uploadArtifacts: true
```

---

## Advanced Optimization Techniques

### 1. Virtual Scrolling / Windowing

Only render visible items in large lists.

```vue
<script setup>
import { useVirtualList } from '@vueuse/core';

const { list, containerProps, wrapperProps } = useVirtualList(
  items, // 10,000 items
  { itemHeight: 50 }
);
</script>

<template>
  <div v-bind="containerProps" style="height: 400px; overflow: auto">
    <div v-bind="wrapperProps">
      <!-- Only ~20 DOM nodes rendered at a time -->
      <div v-for="{ data, index } in list" :key="index">
        {{ data }}
      </div>
    </div>
  </div>
</template>
```

### 2. Memoization & Computed Caching

```javascript
// Expensive computation
const expensiveComputation = computed(() => {
  return items.value
    .filter(item => item.active)
    .map(item => transform(item))
    .reduce((acc, val) => acc + val, 0);
});

// With custom memoization
import { memoize } from 'lodash-es';
const processData = memoize((data) => {
  // Heavy computation
  return result;
});
```

### 3. Debounce & Throttle

**Debounce:** Execute after user stops action (search input)
**Throttle:** Execute at most once per interval (scroll handler)

```javascript
import { debounce, throttle } from 'lodash-es';

// Debounce: Wait 300ms after user stops typing
const search = debounce((query) => {
  fetchResults(query);
}, 300);

// Throttle: Execute at most once per 100ms
const handleScroll = throttle(() => {
  updateScrollPosition();
}, 100);
```

### 4. Request Deduplication

Prevent multiple identical API calls.

```javascript
const pendingRequests = new Map();

async function fetchUser(id) {
  // Check if request is already in progress
  if (pendingRequests.has(id)) {
    return pendingRequests.get(id);
  }
  
  // Store promise to prevent duplicates
  const promise = fetch(`/api/users/${id}`).then(r => r.json());
  pendingRequests.set(id, promise);
  
  try {
    const result = await promise;
    return result;
  } finally {
    pendingRequests.delete(id);
  }
}
```

### 5. Intersection Observer for Lazy Loading

```javascript
// Lazy load images when they enter viewport
const images = document.querySelectorAll('img[data-src]');

const imageObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const img = entry.target;
      img.src = img.dataset.src;
      imageObserver.unobserve(img);
    }
  });
});

images.forEach(img => imageObserver.observe(img));
```

---

## Real-World Examples

### Case Study: E-commerce Site

**Problem:** High bounce rate, LCP 4.2s.
**Analysis:** Hero carousel was JavaScript-driven and loaded last.
**Solution:**

1. Replaced JS carousel with CSS Scroll Snap.
2. Preloaded the first image.
3. Implemented SSR for initial HTML.
   **Result:** LCP -> 1.5s, Bounce rate reduced by 15%.

### Case Study: Data Dashboard

**Problem:** UI froze when filtering 10,000+ rows.
**Analysis:** Filtering logic blocked the main thread (High TBT).
**Solution:**

1. Moved filtering logic to a **Web Worker**.
2. Implemented **Virtual Scrolling** to render only visible rows.
   **Result:** Smooth 60FPS scrolling and instant responsiveness.

### Case Study: News Website

**Problem:** Slow page transitions, high CLS scores.
**Analysis:** Ads and embeds loading caused layout shifts.
**Solution:**

1. Reserved space for ad slots with fixed dimensions.
2. Implemented skeleton screens during content load.
3. Used `content-visibility: auto` for below-fold content.
   **Result:** CLS from 0.4 to 0.05, perceived performance improved.

---

## Performance Checklist

### Initial Load
- [ ] HTML size < 14KB (first TCP packet)
- [ ] Critical CSS inlined
- [ ] JavaScript deferred or async
- [ ] Above-the-fold images preloaded
- [ ] Non-critical resources lazy loaded
- [ ] Fonts optimized with font-display: swap
- [ ] Images in modern formats (WebP/AVIF)

### Runtime
- [ ] Virtual scrolling for long lists
- [ ] Debounced/throttled event handlers
- [ ] Computed properties for expensive operations
- [ ] Event listeners properly cleaned up
- [ ] No memory leaks (profiled)
- [ ] Smooth animations (60 FPS)
- [ ] Heavy computations in Web Workers

### Network
- [ ] HTTP/2 or HTTP/3 enabled
- [ ] Compression enabled (Brotli/Gzip)
- [ ] CDN for static assets
- [ ] Resource hints (preconnect, dns-prefetch)
- [ ] Service Worker for offline support
- [ ] API responses cached appropriately

### Monitoring
- [ ] Performance budgets defined
- [ ] Lighthouse CI in pipeline
- [ ] RUM (Real User Monitoring) setup
- [ ] Core Web Vitals tracked
- [ ] Error tracking configured
- [ ] Performance alerts configured

---

## Key Takeaways

1. **Measure First:** Use Lighthouse, Chrome DevTools, and RUM to identify actual bottlenecks.
2. **Optimize Critical Path:** Focus on what users see first (LCP, FCP).
3. **Split Code Aggressively:** Load only what's needed for the current view.
4. **Leverage Browser Features:** Service Workers, HTTP/2, resource hints.
5. **Keep Main Thread Free:** Offload heavy work to Web Workers.
6. **Progressive Enhancement:** Ensure basic functionality works without JavaScript.
7. **Set Budgets:** Prevent regression with automated performance checks.
8. **Think Long-term:** Memory leaks and technical debt accumulate over time.

---

## Further Reading

- [Web.dev - Performance](https://web.dev/performance/)
- [MDN - Performance](https://developer.mozilla.org/en-US/docs/Web/Performance)
- [Core Web Vitals](https://web.dev/vitals/)
- [Lighthouse Documentation](https://developer.chrome.com/docs/lighthouse/)
- [HTTP Archive Reports](https://httparchive.org/)
- [Performance Patterns](https://www.patterns.dev/posts/performance-patterns/)
- [Vue.js Performance Guide](https://vuejs.org/guide/best-practices/performance.html)
