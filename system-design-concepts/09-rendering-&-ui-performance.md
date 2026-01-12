# Rendering & UI Performance - Complete Guide

## Table of Contents

1. [Introduction](#introduction)
2. [Virtual DOM Optimization](#virtual-dom-optimization)
3. [Virtual Scrolling](#virtual-scrolling)
4. [Progressive Rendering](#progressive-rendering)
5. [Layout Thrashing Prevention](#layout-thrashing-prevention)
6. [Paint & Composite Optimization](#paint--composite-optimization)
7. [Animation Performance](#animation-performance)
8. [Web Workers for UI](#web-workers-for-ui)
9. [Frame Budget & 60fps](#frame-budget--60fps)
10. [Long Tasks & Main Thread Optimization](#long-tasks--main-thread-optimization)
11. [Real-World Examples](#real-world-examples)
12. [Best Practices](#best-practices)

---

## Introduction

Rendering performance is key to perceived speed. A fast network request means nothing if the main thread locks up for 500ms while rendering the data.

### Critical Rendering Path

To optimize rendering, you must understand how a browser puts pixels on the screen:

1.  **DOM Construction**: Parsing HTML into the DOM tree.
2.  **CSSOM Construction**: Parsing CSS into the CSSOM tree.
3.  **Render Tree**: Combining DOM & CSSOM (excluding `display: none` elements).
4.  **Layout (Reflow)**: Calculating geometry (width, height, position) for every element.
5.  **Paint**: Filling in pixels (text color, background, borders, shadows).
6.  **Composite**: Stacking layers together (z-index, transforms, opacity).

**The Golden Rule**: Layout is expensive. Paint is cheaper. Composite is cheapest (GPU accelerated).

### Performance Metrics

- **FPS (Frames Per Second)**: consistently hitting 60fps (16.67ms per frame).
- **CLS (Cumulative Layout Shift)**: measures visual stability.
- **INP (Interaction to Next Paint)**: measures responsiveness to user input.

---

## Virtual DOM Optimization

Modern frameworks like Vue and React use a Virtual DOM to minimize actual DOM updates. However, they need your help to do it efficiently.

### 1. Key Prop Optimization

The `key` attribute tells the diffing algorithm which elements correspond to which data items.

**Why it matters:**
Without keys, if you reverse a list of 100 items, the framework patches 100 DOM nodes. With keys, it simply moves the DOM nodes around.

```vue
<template>
  <!-- ❌ Bad: No keys, Vue can't track items efficiently -->
  <div v-for="item in items">
    {{ item.name }}
  </div>

  <!-- ❌ Bad: Index as key (problematic with reordering) -->
  <div v-for="(item, index) in items" :key="index">
    {{ item.name }}
  </div>

  <!-- ✅ Good: Stable unique key -->
  <div v-for="item in items" :key="item.id">
    {{ item.name }}
  </div>
</template>
```

### 2. Component Memoization

Prevent huge subtrees from re-rendering when their data hasn't changed.

In React, this is `React.memo`. In Vue, components are automatically smart, but passing large new objects as props can still trigger updates.

```vue
<!-- ParentComponent.vue -->
<template>
  <div>
    <!-- ExpensiveChild only updates if staticData *reference* changes -->
    <ExpensiveChild :data="staticData" @update="handleUpdate" />
  </div>
</template>

<script setup>
import { ref, shallowRef } from "vue";
import ExpensiveChild from "./ExpensiveChild.vue";

// Use shallowRef for large data structures to avoid deep reactivity cost
const staticData = shallowRef({
  items: new Array(1000).fill(0),
});

// Defining functions outside template prevents new function creation on render
function handleUpdate(value) {
  console.log("Updated:", value);
}
</script>
```

### 3. v-memo Directive (Vue 3.2+)

A powerful tool to skip diffing entire subtrees. If the inputs `[item.id, item.name]` haven't changed, Vue skips diffing the `div` and all its children entirely.

```vue
<template>
  <div v-for="item in list" :key="item.id">
    <!-- Re-render ONLY when item.id or item.name changes -->
    <!-- Updates to 'item.count' will simply be IGNORED in the DOM -->
    <div v-memo="[item.id, item.name]">
      <span>{{ item.name }}</span>
      <span>{{ item.description }}</span>
      <!-- Complex chart or heavy list here -->
    </div>
  </div>
</template>
```

### 4. v-once for Static Content

Tell the compiler: "This part of the template is static. Render it once and hoist it out as a constant."

```vue
<template>
  <!-- Render once, never interact with Virtual DOM again -->
  <div v-once>
    <h1>{{ staticTitle }}</h1>
    <p>This huge block of text never changes...</p>
  </div>

  <!-- Dynamic content -->
  <div>
    <p>{{ dynamicContent }}</p>
  </div>
</template>
```

---

## Virtual Scrolling

Rendering 10,000 DOM nodes kills performance. Virtual scrolling (or "Windowing") renders only what is visible in the viewport.

### 1. Basic Virtual List

**Concept:**

1. Calculate total height (`items * itemHeight`) to enable the scrollbar.
2. Calculate which items are currently visible based on `scrollTop`.
3. Render only those items using `position: absolute` or transforms.

```vue
<!-- components/VirtualList.vue -->
<template>
  <div ref="containerRef" class="virtual-list" @scroll="handleScroll">
    <!-- Phantom container to force scrollbar height -->
    <div :style="{ height: `${totalHeight}px`, position: 'relative' }">
      <!-- Only render visible items -->
      <div
        v-for="item in visibleItems"
        :key="item.id"
        :style="{
          position: 'absolute',
          top: `${item.offsetTop}px`,
          left: 0,
          right: 0,
          height: `${itemHeight}px`,
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
  bufferSize: { type: Number, default: 5 }, // Render extra items to prevent white flashes
});

const containerRef = ref(null);
const scrollTop = ref(0);
const containerHeight = ref(0);

const totalHeight = computed(() => props.items.length * props.itemHeight);

const visibleRange = computed(() => {
  const start = Math.floor(scrollTop.value / props.itemHeight);
  const end = Math.ceil(
    (scrollTop.value + containerHeight.value) / props.itemHeight
  );

  return {
    start: Math.max(0, start - props.bufferSize),
    end: Math.min(props.items.length, end + props.bufferSize),
  };
});

const visibleItems = computed(() => {
  const { start, end } = visibleRange.value;
  return props.items.slice(start, end).map((item, index) => ({
    id: item.id || start + index,
    data: item,
    offsetTop: (start + index) * props.itemHeight,
  }));
});

function handleScroll(event) {
  scrollTop.value = event.target.scrollTop;
}

onMounted(() => {
  if (containerRef.value) {
    containerHeight.value = containerRef.value.clientHeight;
  }
});
</script>
```

### 2. Dynamic Height Virtual List

When items have different heights, you can't just multiply `index * height`. You must measure them as they render.

```javascript
// composables/useVirtualList.js
export function useVirtualList(items, options = {}) {
  // Logic to track variable heights involves:
  // 1. A map of index -> measuredHeight
  // 2. An array of accumulated offsets (prefix sums) for binary search
  // 3. ResizeObserver to detect content changes
  // (Simplified logic shown in previous code example)
  // ...
}
```

---

## Progressive Rendering

Don't block the main thread trying to render 5,000 items at once. Break it up.

### 1. Time Slicing

Process a small chunk, let the browser handle user input, then process the next chunk.

```javascript
// utils/timeSlicing.js
export async function renderInChunks(items, renderFn, chunkSize = 50) {
  const chunks = [];

  // Split data into chunks
  for (let i = 0; i < items.length; i += chunkSize) {
    chunks.push(items.slice(i, i + chunkSize));
  }

  for (const chunk of chunks) {
    renderFn(chunk);

    // Key Magic: Force a break in the JS execution loop.
    // SetTimeout(0) pushes the next iteration to the end of the event loop.
    await new Promise((resolve) => setTimeout(resolve, 0));
  }
}
```

### 2. requestIdleCallback

Run low-priority maintenance tasks (like analytics or preloading) only when the browser is idle.

```javascript
// composables/useIdleCallback.js
export function useIdleCallback(callback, options = {}) {
  onMounted(() => {
    if ("requestIdleCallback" in window) {
      // Browser calls this when it has free time
      requestIdleCallback(callback, { timeout: options.timeout });
    } else {
      setTimeout(callback, 0);
    }
  });
}
```

---

## Layout Thrashing Prevention

"Layout Thrashing" (or Forced Synchronous Layout) happens when you read a layout property (like `offsetHeight`) immediately after writing a style. The browser is forced to calculate the layout _right now_ to give you the answer, breaking its optimized batching.

### 1. Batch DOM Reads and Writes

**The Problem:**
Read -> Write -> Read -> Write (Thrashing!)

**The Fix:**
Read -> Read -> Write -> Write (Fast!)

```javascript
// ❌ Bad:
elements.forEach((el) => {
  const h = el.offsetHeight; // Read
  el.style.height = h * 2 + "px"; // Write (invalidates layout)
  // Next loop iteration forces a re-layout!
});

// ✅ Good:
// Phase 1: Read everything
const heights = elements.map((el) => el.offsetHeight);

// Phase 2: Write everything
elements.forEach((el, i) => {
  el.style.height = heights[i] * 2 + "px";
});
```

### 2. FastDOM

A library that enforces this batching automatically.

```javascript
// Schedules reads to run at start of next frame
fastdom.measure(() => {
  const height = element.offsetHeight;

  // Schedules writes to run after all reads
  fastdom.mutate(() => {
    element.style.height = `${height * 2}px`;
  });
});
```

---

## Paint & Composite Optimization

Move animations to the GPU.

### 1. Layer Promotion (`will-change`)

Tells the browser "This element is going to move." The browser promotes it to its own GPU layer. Moving a layer is cheap (Composite only).

```css
.animated-sidebar {
  /* Promote to layer */
  will-change: transform;

  /* Fallback hack for older browsers */
  transform: translateZ(0);
}
```

### 2. Use Transform and Opacity

These are the ONLY properties that can be animated cheaply (Composite only).

- **High Cost**: `width`, `height`, `top`, `left`, `margin` (Trigger Layout + Paint)
- **Medium Cost**: `background-color`, `shadow` (Trigger Paint)
- **Low Cost**: `transform`, `opacity` (Trigger Composite only)

```css
/* ❌ Bad: Animating 'left' forces layout calculations every frame */
.box {
  transition: left 0.3s;
}

/* ✅ Good: Animating 'transform' is handled by the GPU */
.box {
  transition: transform 0.3s;
}
```

### 3. Containment

The `contain` property tells the browser that an element is isolated. Changes inside it won't affect the outside layout.

```css
.widget {
  /*
  layout: Internal layout doesn't affect external layout
  paint: Children won't paint outside bounds
  */
  contain: layout paint;
}
```
