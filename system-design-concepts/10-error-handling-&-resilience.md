# Error Handling & Resilience - Complete Guide

## Table of Contents

1. [Introduction](#introduction)
2. [Error Boundaries](#error-boundaries)
3. [Retry Strategies](#retry-strategies)
4. [Fallback Mechanisms](#fallback-mechanisms)
5. [Circuit Breakers](#circuit-breakers)
6. [Network Resilience](#network-resilience)
7. [Graceful Degradation](#graceful-degradation)
8. [Error Monitoring & Logging](#error-monitoring--logging)
9. [User-Facing Error Messages](#user-facing-error-messages)
10. [Real-World Examples](#real-world-examples)
11. [Best Practices](#best-practices)

---

## Introduction

Resilient applications don't just handle errors—they anticipate failures, recover gracefully, and maintain user trust even when things go wrong. A user should never see a white screen of death or a raw JSON error dump.

### Types of Errors

Errors in a frontend application generally fall into three categories:

**Client-Side Errors:**
These happen in the browser. A variable is undefined, a property is accessed on null, or a component fails to render.

- JavaScript runtime errors
- Uncaught promise rejections
- Component rendering errors

**Network Errors:**
These happen when communicating with the outside world. The server is down, the user is offline, or the request timed out.

- API failures (4xx, 5xx)
- Timeout errors
- Connection issues / CORS errors

**User Errors:**
The system is working, but the user did something invalid.

- Invalid form input
- Unauthorized access
- Business logic violations

---

## Error Boundaries

An error boundary is a component that catches JavaScript errors regardless of where they occur in the child component tree, logs those errors, and displays a fallback UI instead of the component tree that crashed.

### 1. Vue Error Handler (Global)

In Vue 3, `app.config.errorHandler` catches errors from all components.

```javascript
// main.js
import { createApp } from "vue";
import App from "./App.vue";
import * as Sentry from "@sentry/vue";

const app = createApp(App);

// Global error handler
app.config.errorHandler = (err, instance, info) => {
  console.error("Global error:", err);
  console.error("Component:", instance);
  console.error("Error info:", info);

  // Send to error tracking service
  Sentry.captureException(err, {
    contexts: {
      vue: {
        componentName: instance?.$options.name,
        propsData: instance?.$props,
        errorInfo: info,
      },
    },
  });

  // Show user-friendly error message
  showErrorNotification("Something went wrong. Please try again.");
};

// Handle unhandled promise rejections (e.g. failed fetches)
window.addEventListener("unhandledrejection", (event) => {
  console.error("Unhandled promise rejection:", event.reason);
  Sentry.captureException(event.reason);
  event.preventDefault();
});

app.mount("#app");
```

### 2. Component-Level Error Boundary

Vue doesn't have a direct equivalent to React's class-based implementation, but we can implement one using the `onErrorCaptured` hook. This allows us to sandbox crashes to specific parts of the app (e.g., if the Sidebar crashes, the Header and Main Content stay alive).

```vue
<!-- components/ErrorBoundary.vue -->
<template>
  <div v-if="error" class="error-boundary">
    <div class="error-content">
      <h2>{{ title }}</h2>
      <p>{{ message }}</p>

      <div class="error-actions">
        <button @click="retry">Try Again</button>
        <button @click="reset">Go Back</button>
      </div>

      <details v-if="showDetails">
        <summary>Technical Details</summary>
        <pre>{{ error.stack }}</pre>
      </details>
    </div>
  </div>

  <slot v-else />
</template>

<script setup>
import { ref, onErrorCaptured } from "vue";
import { useRouter } from "vue-router";

const props = defineProps({
  title: {
    type: String,
    default: "Something went wrong",
  },
  message: {
    type: String,
    default: "We encountered an unexpected error. Please try again.",
  },
  showDetails: {
    type: Boolean,
    default: process.env.NODE_ENV === "development",
  },
  onRetry: Function,
});

const router = useRouter();
const error = ref(null);

// Captures errors from descendant components
onErrorCaptured((err, instance, info) => {
  error.value = err;

  console.error("Error captured:", err);

  // Return false to prevent the error from propagating further up
  return false;
});

function retry() {
  error.value = null;
  if (props.onRetry) {
    props.onRetry();
  }
}

function reset() {
  error.value = null;
  router.back();
}
</script>

<style scoped>
.error-boundary {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 2rem;
  background: #fff0f0;
  border: 1px solid #ffcccc;
  border-radius: 8px;
}
</style>

<!-- Usage -->
<template>
  <ErrorBoundary
    title="Failed to load user data"
    message="We couldn't fetch your profile. Please check your connection."
    :on-retry="loadUserData"
  >
    <UserProfile :user="user" />
  </ErrorBoundary>
</template>
```

### 3. React Error Boundary

In React, error boundaries _must_ be class components.

```jsx
// components/ErrorBoundary.jsx
import React from "react";

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  // Update state so the next render will show the fallback UI
  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Error caught by boundary:", error, errorInfo);

    this.setState({
      error,
      errorInfo,
    });

    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  reset = () => {
    this.setState({ hasError: false, error: null });
    if (this.props.onReset) this.props.onReset();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-boundary">
          <h2>{this.props.title || "Something went wrong"}</h2>
          <button onClick={this.reset}>Try Again</button>
        </div>
      );
    }

    return this.props.children;
  }
}
```

---

## Retry Strategies

Network requests fail. A simple retry is often enough to fix a transient issue. However, retrying immediately in a loop can worsen the problem (the "Thundering Herd" problem).

### 1. Exponential Backoff

The standard algorithm for retries. If the first request fails, wait 1s. If that fails, wait 2s, then 4s, then 8s. This gives the server breathing room to recover.

```javascript
// utils/retry.js
export async function retryWithBackoff(fn, options = {}) {
  const {
    maxAttempts = 3,
    initialDelay = 1000,
    maxDelay = 10000,
    backoffFactor = 2,
    shouldRetry = (error) => true,
    onRetry = () => {},
  } = options;

  let lastError;

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;

      // Check if we should retry this error
      if (!shouldRetry(error)) {
        throw error;
      }

      // Don't retry on last attempt
      if (attempt === maxAttempts - 1) {
        break;
      }

      // Calculate delay with exponential backoff
      const delay = Math.min(
        initialDelay * Math.pow(backoffFactor, attempt),
        maxDelay
      );

      // Add jitter to prevent thundering herd
      // (Randomness prevents all clients hitting server at exact same millisecond)
      const jitter = Math.random() * 0.3 * delay;
      const totalDelay = delay + jitter;

      console.log(
        `Retry attempt ${attempt + 1}/${maxAttempts} after ${totalDelay}ms`
      );

      onRetry(attempt + 1, totalDelay, error);

      await new Promise((resolve) => setTimeout(resolve, totalDelay));
    }
  }

  throw lastError;
}

// Usage
async function fetchUserData(userId) {
  return retryWithBackoff(
    () => fetch(`/api/users/${userId}`).then((r) => r.json()),
    {
      maxAttempts: 3,
      shouldRetry: (error) => {
        // Only retry on network errors or 5xx server errors
        // Never retry 404 (Not Found) or 401 (Unauthorized)
        return error.status >= 500 || error.name === "NetworkError";
      },
    }
  );
}
```

### 2. Retry with Composable

Encapsulating retry logic in a composable makes it reusable across components.

```javascript
// composables/useRetry.js
import { ref } from "vue";

export function useRetry(fn, options = {}) {
  const { maxAttempts = 3, initialDelay = 1000 } = options;

  const isRetrying = ref(false);
  const attemptCount = ref(0);
  const error = ref(null);

  async function execute(...args) {
    isRetrying.value = false;
    attemptCount.value = 0;
    error.value = null;

    let lastError;

    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      attemptCount.value = attempt + 1;

      try {
        const result = await fn(...args);
        return result;
      } catch (err) {
        lastError = err;

        if (attempt < maxAttempts - 1) {
          isRetrying.value = true;
          // Simple delay
          await new Promise((resolve) => setTimeout(resolve, initialDelay));
        }
      }
    }

    error.value = lastError;
    isRetrying.value = false;
    throw lastError;
  }

  return { execute, isRetrying, attemptCount, error };
}
```

---

## Fallback Mechanisms

When data fails to load, don't show an empty box. Show _something_ useful.

### 1. Stale-While-Revalidate Pattern

Commonly seen in libraries like SWR and TanStack Query. If a request fails, show the _old_ data (if available) instead of an error, while trying to fetch new data in the background.

```javascript
// composables/useSWR.js
import { ref } from "vue";

export function useSWR(key, fetcher, options = {}) {
  const { fallbackData = null } = options;

  const data = ref(fallbackData);
  const error = ref(null);

  const cache = new Map();

  async function revalidate() {
    // Show cached data immediately (stale)
    const cached = cache.get(key);
    if (cached) {
      data.value = cached;
    }

    try {
      const freshData = await fetcher();
      data.value = freshData;
      cache.set(key, freshData);
    } catch (err) {
      error.value = err;
      // Note: We deliberately leave the stale 'data' value alone if possible
    }
  }

  revalidate();

  return { data, error, revalidate };
}
```

### 2. Fallback UI Components

A "Fallback Chain" tries multiple things. If the primary image fails, try a backup URL. If that fails, show a placeholder.

```vue
<!-- components/FallbackImage.vue -->
<template>
  <img v-if="!failed" :src="src" @error="handleError" />
  <div v-else class="fallback-image">
    <slot name="fallback">
      <!-- Default SVG Placeholder -->
      <div class="placeholder">Image unavailable</div>
    </slot>
  </div>
</template>

<script setup>
import { ref } from "vue";

defineProps({ src: String });
const failed = ref(false);

function handleError() {
  failed.value = true;
}
</script>
```

### 3. Data Fallback Chain

Attempt multiple data sources in order.

```javascript
// composables/useFallbackData.js
export function useFallbackData(sources) {
  const data = ref(null);
  const error = ref(null);

  async function loadData() {
    for (const source of sources) {
      try {
        const result = await source.fetch();
        data.value = result;
        return; // Success, exit loop
      } catch (err) {
        console.warn(`Source ${source.name} failed, trying next...`);
      }
    }
    error.value = new Error("All data sources failed");
  }

  return { data, error, loadData };
}

// Usage
useFallbackData([
  { name: "Primary API", fetch: fetchPrimary },
  { name: "Backup API", fetch: fetchBackup },
  { name: "Local Cache", fetch: fetchLocal },
]);
```

---

## Circuit Breakers

A pattern from backend engineering that is useful in frontend too. If a service is failing repeatedly (e.g., your analytics endpoint returns 500s 10 times in a row), stop hammering it. "Open the circuit" and fail fast for a while to let the service recover.

### 1. Circuit Breaker Pattern

```javascript
// utils/circuitBreaker.js
class CircuitBreaker {
  constructor(fn, options = {}) {
    this.fn = fn;
    this.failureThreshold = 5;
    this.resetTimeout = 60000; // 1 minute

    this.state = "CLOSED"; // CLOSED (normal), OPEN (failing), HALF_OPEN (testing)
    this.failureCount = 0;
    this.nextAttempt = Date.now();
  }

  async execute(...args) {
    if (this.state === "OPEN") {
      if (Date.now() < this.nextAttempt) {
        throw new Error(
          "Circuit breaker is OPEN. Service temporarily unavailable."
        );
      }
      this.state = "HALF_OPEN";
    }

    try {
      const result = await this.fn(...args);
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      throw error;
    }
  }

  onSuccess() {
    this.failureCount = 0;
    this.state = "CLOSED";
  }

  onFailure() {
    this.failureCount++;
    if (this.failureCount >= this.failureThreshold) {
      this.state = "OPEN";
      this.nextAttempt = Date.now() + this.resetTimeout; // Block for 1 min
    }
  }
}
```

---

## Best Practices

1. **Fail Gracefully**: The rest of the app should work even if one widget crashes (Error Boundaries).
2. **Retry Smartly**: Always use exponential backoff and jitter. Never retry blindly in a tight loop.
3. **Be Transparent**: Tell the user what happened. "We couldn't load your tasks" is better than "Unknown Error".
4. **Preserve User Input**: If a form submission fails, DO NOT clear the form. Let the user retry without re-typing.
5. **Monitor Everything**: Use Sentry/LogRocket. You can't fix errors you don't know about.
