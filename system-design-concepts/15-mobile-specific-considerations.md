# Mobile Specific Considerations - Complete Guide

## Table of Contents

1. [Introduction](#introduction)
2. [Touch Interactions & Gestures](#touch-interactions--gestures)
3. [Viewport & Layout quirks](#viewport--layout-quirks)
4. [Offline & Network Constraints](#offline--network-constraints)
5. [PWA & Service Workers](#pwa--service-workers)
6. [Device Hardware Access](#device-hardware-access)
7. [Soft Keyboard Management](#soft-keyboard-management)
8. [Performance & Battery Life](#performance--battery-life)
9. [Safe Area & Notches](#safe-area--notches)
10. [Real-World Examples](#real-world-examples)

---

## Introduction

Mobile web development is not just about making things smaller. It's about designing for a fundamentally different interaction model (touch), unreliable networks, variable hardware capabilities, and limited battery life.

### Key differences from Desktop

- **Interaction**: Finger (imprecise) vs Mouse (precise). No "hover" state.
- **Network**: High latency, fluctuating bandwidth, frequent disconnections.
- **Screen**: Small, portrait orientation, notches, dynamic toolbars.
- **Context**: Usage on the go, often with one hand.

---

## Touch Interactions & Gestures

### 1. Touch Events vs Click

Mobile browsers emulate `click` events, but often with a delay (historically 300ms) to check for a double-tap-to-zoom gesture. Modern sites need instant feedback.

```typescript
// ============================================
// Gesture Handler (Swipe Detection)
// ============================================

interface TouchPosition {
  x: number;
  y: number;
  time: number;
}

export function useSwipe(
  element: HTMLElement,
  onSwipe: (direction: string) => void
) {
  let start: TouchPosition | null = null;
  const threshold = 50; // Minimum distance for swipe
  const limit = 300; // Maximum time for swipe

  element.addEventListener(
    "touchstart",
    (e) => {
      const touch = e.changedTouches[0];
      start = {
        x: touch.clientX,
        y: touch.clientY,
        time: Date.now(),
      };
    },
    { passive: true }
  ); // Improves scroll performance

  element.addEventListener("touchend", (e) => {
    if (!start) return;

    const touch = e.changedTouches[0];
    const dist = {
      x: touch.clientX - start.x,
      y: touch.clientY - start.y,
    };
    const duration = Date.now() - start.time;

    if (duration > limit) return; // Too slow for a swipe

    if (Math.abs(dist.x) > Math.abs(dist.y)) {
      // Horizontal
      if (Math.abs(dist.x) > threshold) {
        onSwipe(dist.x > 0 ? "right" : "left");
      }
    } else {
      // Vertical
      if (Math.abs(dist.y) > threshold) {
        onSwipe(dist.y > 0 ? "down" : "up");
      }
    }
  });
}
```

### 2. Eliminating Touch Delay

Ensure `touch-action` is configured in CSS to tell the browser "I'm handling gestures, don't wait."

```css
/* Disable double-tap zoom on buttons to remove click delay */
button,
a {
  touch-action: manipulation;
}

/* Disable scrolling on elements that have custom swipe logic (e.g. carousels) */
.carousel {
  touch-action: pan-y; /* Allow vertical scroll, but capture horizontal */
}
```

---

## Viewport & Layout Quirks

### 1. The Dynamic Viewport Problem

On mobile, `100vh` is tricky because browser address bars expand/collapse. This causes content to jump. Use `dvh` (Dynamic Viewport Height).

```css
/* ❌ Bad: Content jumps when address bar retracts */
.hero {
  height: 100vh;
}

/* ✅ Good: Adapts to UI changes */
.hero {
  height: 100dvh;
}
```

### 2. Handling Safe Areas (Notches)

Phones have notches and rounded corners. Using `env(safe-area-inset-*)` ensures content isn't hidden behind the camera.

```css
header {
  /* Add padding so the logo isn't under the notch */
  padding-top: env(safe-area-inset-top);
  padding-left: env(safe-area-inset-left);
  padding-right: env(safe-area-inset-right);
}

footer {
  /* Add padding so the home bar doesn't overlay buttons */
  padding-bottom: env(safe-area-inset-bottom);
}
```

---

## Offline & Network Constraints

### 1. Network Status Detection

Detect when a user goes offline to show a friendly UI (skeleton screens or "You are offline" banner) instead of a broken request.

```typescript
import { ref, onMounted, onUnmounted } from "vue";

export function useNetworkStatus() {
  const isOnline = ref(navigator.onLine);

  // Checking Effective Connection Type (ECT)
  // '4g', '3g', '2g', 'slow-2g'
  const connectionType = ref(
    (navigator as any).connection?.effectiveType || "4g"
  );

  function updateStatus() {
    isOnline.value = navigator.onLine;
    connectionType.value = (navigator as any).connection?.effectiveType;
  }

  onMounted(() => {
    window.addEventListener("online", updateStatus);
    window.addEventListener("offline", updateStatus);
    (navigator as any).connection?.addEventListener("change", updateStatus);
  });

  onUnmounted(() => {
    window.removeEventListener("online", updateStatus);
    window.removeEventListener("offline", updateStatus);
  });

  return { isOnline, connectionType };
}
```

---

## PWA & Service Workers

Progressive Web Apps (PWA) allow web apps to be installed and run offline.

### 1. Service Worker for Caching (Workbox)

A basic service worker that caches the App Shell (HTML/CSS/JS) so it loads instantly even offline.

```javascript
// service-worker.js
import { registerRoute } from "workbox-routing";
import { StaleWhileRevalidate, CacheFirst } from "workbox-strategies";
import { ExpirationPlugin } from "workbox-expiration";

// Cache Google Fonts (Cache First - they rarely change)
registerRoute(
  ({ url }) =>
    url.origin === "https://fonts.googleapis.com" ||
    url.origin === "https://fonts.gstatic.com",
  new CacheFirst({
    cacheName: "google-fonts",
    plugins: [
      new ExpirationPlugin({
        maxEntries: 20,
        maxAgeSeconds: 60 * 60 * 24 * 365, // 1 year
      }),
    ],
  })
);

// Cache API Requests (Stale While Revalidate)
// Show cached data instantly, then update from network
registerRoute(
  ({ url }) => url.pathname.startsWith("/api/feed"),
  new StaleWhileRevalidate({
    cacheName: "api-feed",
    plugins: [
      new ExpirationPlugin({
        maxEntries: 50,
        maxAgeSeconds: 60 * 60 * 24, // 1 day
      }),
    ],
  })
);
```

### 2. Install Prompt (Add to Home Screen)

You can't force an install, but you can capture the event and show your own custom "Install App" button.

```vue
<script setup>
import { ref, onMounted } from "vue";

const deferredPrompt = ref(null);
const showInstallButton = ref(false);

onMounted(() => {
  window.addEventListener("beforeinstallprompt", (e) => {
    // Prevent Chrome 67+ from automatically showing the prompt
    e.preventDefault();
    // Stash the event so it can be triggered later.
    deferredPrompt.value = e;
    // Show your custom UI
    showInstallButton.value = true;
  });
});

async function installApp() {
  if (!deferredPrompt.value) return;

  // Show the install prompt
  deferredPrompt.value.prompt();

  // Wait for the user to respond to the prompt
  const { outcome } = await deferredPrompt.value.userChoice;

  deferredPrompt.value = null;
  showInstallButton.value = false;
}
</script>
```

---

## Device Hardware Access

Web APIs now give access to device features previously limited to native apps.

### 1. Haptic Feedback

Use `navigator.vibrate` to give tactile feedback for success/error actions.

```typescript
export const haptics = {
  success: () => {
    if (navigator.vibrate) navigator.vibrate(50);
  },
  error: () => {
    if (navigator.vibrate) navigator.vibrate([50, 100, 50, 100]); // Pattern
  },
  light: () => {
    if (navigator.vibrate) navigator.vibrate(10);
  },
};
```

### 2. Camera Access (MediaStream)

```typescript
async function openCamera(videoElement: HTMLVideoElement) {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: {
        facingMode: "environment", // Use back camera
      },
    });
    videoElement.srcObject = stream;
  } catch (err) {
    console.error("Camera access denied", err);
  }
}
```

---

## Soft Keyboard Management

When the virtual keyboard opens, it resizes the viewport. This can break fixed layouts.

### 1. Visual Viewport API

Listen to viewport changes to adjust UI (e.g., hiding a floating button when the keyboard is open).

```typescript
export function useVisualViewport() {
  const height = ref(window.visualViewport?.height || window.innerHeight);
  const isKeyboardOpen = ref(false);
  const originalHeight = window.innerHeight;

  function handleResize() {
    if (!window.visualViewport) return;

    height.value = window.visualViewport.height;

    // Heuristic: If height shrinks significantly, keyboard is likely open
    isKeyboardOpen.value = height.value < originalHeight * 0.75;
  }

  onMounted(() => {
    window.visualViewport?.addEventListener("resize", handleResize);
  });

  return { height, isKeyboardOpen };
}
```

### 2. Input Modes

Help the user by showing the right keyboard.

```html
<!-- Numeric keyboard -->
<input type="text" inputmode="numeric" pattern="[0-9]*" />

<!-- Email inputs -->
<input type="email" autocomplete="email" />

<!-- Search (shows 'Go' instead of 'Enter') -->
<input type="search" enterkeyhint="search" />
```

---

## Performance & Battery Life

Mobile devices throttle CPUs to save battery.

### 1. Page Visibility API

Stop expensive tasks (animations, polling) when the user switches tabs or turns off the screen.

```typescript
document.addEventListener("visibilitychange", () => {
  if (document.hidden) {
    // Pause video, stop polling, pause canvas loop
    stopExpensiveTasks();
  } else {
    // Resume
    resumeTasks();
  }
});
```

### 2. Wake Lock API

Prevent the screen from dimming (useful for recipe apps or navigation).

```typescript
let wakeLock = null;

async function requestWakeLock() {
  try {
    if ("wakeLock" in navigator) {
      wakeLock = await (navigator as any).wakeLock.request("screen");
      console.log("Wake Lock active");
    }
  } catch (err) {
    console.error(err);
  }
}
```
