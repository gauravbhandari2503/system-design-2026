# Advanced Patterns - Complete Guide

## Table of Contents

1. [Introduction](#introduction)
2. [Islands Architecture](#islands-architecture)
3. [Resumability (instant loading)](#resumability)
4. [Edge Rendering](#edge-rendering)
5. [Streaming SSR](#streaming-ssr)
6. [Module Preloading & Speculation](#module-preloading--speculation)
7. [Server Components](#server-components)
8. [Real-World Implementation](#real-world-implementation)
9. [Trade-offs & Considerations](#trade-offs--considerations)
10. [Future Trends](#future-trends)

---

## Introduction

As frontend applications grow in complexity, traditional SPA (Single Page App) and SSR (Server Side Rendering) patterns often hit performance ceilings. Advanced patterns aim to reduce the "JavaScript Tax"—the cost of downloading, parsing, and executing large JS bundles—by shifting work to the server, edge, or browser background threads.

### The Problem with Status Quo

- **Hydration Mismatch**: Re-executing server logic on the client just to attach event listeners.
- **Main Thread Blocking**: Long tasks freezing the UI during initialization.
- **Latency**: Round trips to distant servers.

---

## Islands Architecture

**Concept**: Instead of "hydrating" the entire page (like a typical Next.js/Nuxt.js app), you treat the page as static HTML (the ocean) with pockets of interactivity (the islands).

**Benefit**: Massive reduction in JavaScript. A blog post with a "Like" button only needs the JS for the "Like" button, not the Header, Footer, and Grid Layout.

### Implementation Pattern (Conceptual)

```javascript
// ============================================
// Islands Architecture Logic
// ============================================

// 1. Server renders static HTML
// 2. Client script searches for markers
// 3. Only hydrates matching roots

function hydrateIslands() {
  const islands = document.querySelectorAll("[data-island]");

  islands.forEach(async (island) => {
    const componentName = island.dataset.component;
    const props = JSON.parse(island.dataset.props);
    const strategy = island.dataset.strategy; // 'load', 'visible', 'idle'

    // Lazy load the component code
    const componentModule = await import(`/components/${componentName}.js`);
    const Component = componentModule.default;

    // Strategies:
    if (strategy === "visible") {
      const observer = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting) {
          hydrate(Component, island, props);
          observer.disconnect();
        }
      });
      observer.observe(island);
    } else if (strategy === "idle") {
      requestIdleCallback(() => {
        hydrate(Component, island, props);
      });
    } else {
      // 'load' or default
      hydrate(Component, island, props);
    }
  });
}
```

**Frameworks**: Astro, Fresh.

---

## Resumability

**Concept**: Hydration is O(n) where n is the complexity of the app. Resumability is O(1).
Instead of re-running the component framework initialization on the client, the framework serializes the _execution state_ into the HTML. The client "resumes" where the server left off.

**Key Difference**: Event listeners are global delegates. JS is only downloaded when you click.

### Qwik-style Event Delegation (Conceptual)

```html
<!-- HTML sent from server -->
<!-- No large JS bundle attached to <head> -->

<div q:id="123" q:state="...serialized_state...">
  <button on:click="./chunk-a.js#handleBuy" data-product-id="55">
    Buy Now
  </button>
</div>

<script>
  // Global Event Listener (Tiny ~1kb script)
  document.addEventListener("click", async (event) => {
    const target = event.target;
    const handler = target.getAttribute("on:click");

    if (handler) {
      const [file, funcName] = handler.split("#");

      // 1. Download the specific chunk for this interaction
      const module = await import(file);

      // 2. Execute the function
      module[funcName](event);
    }
  });
</script>
```

**Benefit**: Possible to have 0kb initial JS on a large ecommerce site until the user actually interacts.

---

## Edge Rendering

**Concept**: Move SSR (Server Side Rendering) from a central region (e.g., `us-east-1`) to the Edge (hundreds of locations close to the user).

**Middleware Pattern**: Intercept requests at the Edge to personalize content before it hits the browser or origin server.

```typescript
// ============================================
// Edge Middleware (e.g., Cloudflare Workers / Vercel Edge)
// ============================================

export default async function middleware(request: Request) {
  const url = new URL(request.url);
  const country = request.headers.get("cf-ipcountry") || "US";

  // 1. A/B Testing at the Edge
  // Assign experiment group directly in headers/cookies without client-side flicker
  const bucket = Math.random() < 0.5 ? "a" : "b";

  // 2. Localization Rewrite
  // Rewrite /about -> /fr/about based on location
  if (country === "FR" && !url.pathname.startsWith("/fr")) {
    url.pathname = `/fr${url.pathname}`;
    return Response.redirect(url.toString(), 307);
  }

  // 3. Security Headers
  const response = await fetch(request);
  const newResponse = new Response(response.body, response);
  newResponse.headers.set("X-Frame-Options", "DENY");

  return newResponse;
}
```

---

## Streaming SSR

**Concept**: Break the HTML into chunks. Send the critical structure (`<head>`, layout) component immediately. Send the slow data-heavy components as they finish fetching.

**Mechanism**: Uses HTTP Chunked Transfer Encoding.

### Recursive Suspense Pattern (Vue/React)

```vue
<template>
  <Layout>
    <Header />
    <!-- Sent immediately -->

    <Suspense>
      <!-- Main Content -->
      <template #default>
        <ProductDetails />
        <!-- Sent when DB query finishes (e.g. 100ms) -->
      </template>
      <template #fallback>
        <SkeletonLoader />
      </template>
    </Suspense>

    <Suspense>
      <!-- Reviews (Slow) -->
      <template #default>
        <ReviewsSection />
        <!-- Sent later (e.g. 500ms) -->
      </template>
      <template #fallback>
        <div>Loading reviews...</div>
      </template>
    </Suspense>
  </Layout>
</template>
```

**How it looks on the wire:**

```html
<!-- Chunk 1 -->
<html>
  <head>
    ...
  </head>
  <body>
    <header>...</header>
    <div id="suspense-1">Loading...</div>

    <!-- Chunk 2 (100ms later) -->
    <script>
      // Swap content
      document.getElementById("suspense-1").innerHTML =
        "<h1>Product Name</h1>...";
    </script>
  </body>
</html>
```

---

## Module Preloading & Speculation

**Concept**: Predict where the user goes next and preload the code/data.

### Speculation Rules API

The modern way to tell the browser "The user will likely click this link, prepare it."

```html
<script type="speculationrules">
  {
    "prerender": [
      {
        "source": "list",
        "urls": ["/next-page", "/popular-product"],
        "score": 0.8
      },
      {
        "source": "document",
        "where": {
          "selector_matches": ".nav-link"
        },
        "eagerness": "moderate"
      }
    ],
    "prefetch": [
      {
        "source": "list",
        "urls": ["/heavy-script.js"]
      }
    ]
  }
</script>
```

- **Prefetch**: Downloads the resource to cache.
- **Prerender**: Downloads AND renders the page in a hidden background tab. Clicking is instant (0ms).

---

## Server Components (RSC)

**Concept**: React Server Components allow specific components to run _only_ on the server. They have direct access to DB, file system, etc., and they send zero bundle size to the client.

```tsx
// ProductPage.server.tsx (Runs mainly on server)

import { db } from "./db";
import AddToCart from "./AddToCart.client.tsx"; // Interactive Island

export default async function ProductPage({ id }) {
  // Direct DB access! No API call needed.
  const product = await db.query("SELECT * FROM products WHERE id = ?", id);

  return (
    <div>
      <h1>{product.name}</h1>
      <p>{product.description}</p>

      {/* 
        Only the props and the interactive component are sent to client.
        The heavy Markdown parser for description stays on server.
      */}
      <AddToCart id={product.id} />
    </div>
  );
}
```

---

## Real-World Recommendation

| Pattern            | Best For                                                | Trade-offs                                     |
| :----------------- | :------------------------------------------------------ | :--------------------------------------------- |
| **Islands**        | Content-heavy sites (Blogs, News, E-commerce LPs)       | Complexity orchestrating state between islands |
| **Resumability**   | Huge E-com sites where TTI is critical                  | Newer ecosystem (Qwik), learning curve         |
| **Edge Rendering** | Personalization, A/B testing, Global audience           | Database latency if DB is not also at edge     |
| **Streaming**      | Dashboards, Social Feeds (Slow APIs mixed with fast UI) | Requires SSR server (Node/Deno/Bun)            |
| **Prerendering**   | Static sites + Speculation API for perceived speed      | Wasted bandwidth if user doesn't click         |
