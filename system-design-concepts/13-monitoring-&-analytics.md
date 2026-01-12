# Monitoring & Analytics - Complete Guide

## Table of Contents

1. [Introduction](#introduction)
2. [Performance Monitoring (RUM & Synthetic)](#performance-monitoring)
3. [User Analytics & Behavior Tracking](#user-analytics--behavior-tracking)
4. [A/B Testing Infrastructure](#ab-testing-infrastructure)
5. [Error Tracking & Debugging](#error-tracking--debugging)
6. [Custom Metrics & Business KPIs](#custom-metrics--business-kpis)
7. [Session Recording & Replay](#session-recording--replay)
8. [Real User Monitoring (RUM)](#real-user-monitoring-rum)
9. [Logging Best Practices](#logging-best-practices)
10. [Alerting & Incident Response](#alerting--incident-response)
11. [Privacy & Compliance](#privacy--compliance)
12. [Real-World Implementation](#real-world-implementation)
13. [Key Takeaways](#key-takeaways)
14. [Further Reading](#further-reading)

---

## Introduction

In a production environment, you cannot improve what you do not measure. A robust monitoring and analytics strategy provides the visibility needed to understand system health, performance bottlenecks, and user behavior.

### Why Monitoring Matters

- **Proactive Issue Detection**: Identify slow API endpoints or JavaScript errors before users complain.
- **Data-Driven Decisions**: Use A/B testing and funnel analysis to validate product features.
- **Performance Optimization**: Focus engineering efforts on the actual bottlenecks slowing down real users (RUM).

### The Three Pillars of Observability

1.  **Metrics**: Aggregatable numbers (e.g., "Page Load Time: 2.5s", "Error Rate: 0.1%").
2.  **Logs**: Discrete events (e.g., "User X clicked Button Y at 10:00 AM").
3.  **Traces**: The journey of a request through the entire system (Frontend -> API -> DB).

---

## Performance Monitoring

There are two main ways to measure performance: **Real User Monitoring (RUM)** and **Synthetic Monitoring**.

### 1. Real User Monitoring (RUM)

**Concept**: Collect data from actual users navigating your site. This reflects the real-world experience, including variable network conditions and device speeds.

**Core Web Vitals**:

- **LCP (Largest Contentful Paint)**: Loading performance. Target < 2.5s.
- **FID (First Input Delay)**: Interactivity. Target < 100ms.
- **CLS (Cumulative Layout Shift)**: Visual stability. Target < 0.1.

```typescript
// ============================================
// Performance Observer API - Native RUM
// ============================================

interface PerformanceMetrics {
  fcp: number; // First Contentful Paint
  lcp: number; // Largest Contentful Paint
  fid: number; // First Input Delay
  cls: number; // Cumulative Layout Shift
  ttfb: number; // Time to First Byte
}

class PerformanceMonitor {
  private metrics: Partial<PerformanceMetrics> = {};
  private endpoint = "/api/metrics";

  constructor() {
    this.observePaint();
    this.observeLCP();
    this.observeFID();
    this.observeCLS();
    this.observeNavigation();
  }

  // Track Paint Timings
  private observePaint(): void {
    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.name === "first-contentful-paint") {
          this.metrics.fcp = entry.startTime;
        }
      }
    });
    observer.observe({ type: "paint", buffered: true });
  }

  // Track Largest Contentful Paint
  private observeLCP(): void {
    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      const lastEntry = entries[entries.length - 1]; // LCP can update multiple times
      this.metrics.lcp = lastEntry.startTime;
    });
    observer.observe({ type: "largest-contentful-paint", buffered: true });
  }

  // Track First Input Delay
  private observeFID(): void {
    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        const fidEntry = entry as PerformanceEventTiming;
        // FID is time between interaction and processing start
        this.metrics.fid = fidEntry.processingStart - fidEntry.startTime;
      }
    });
    observer.observe({ type: "first-input", buffered: true });
  }

  // Track Cumulative Layout Shift
  private observeCLS(): void {
    let clsValue = 0;
    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        const layoutShift = entry as any;
        // Ignore shifts caused by user interaction (0.5s grace period)
        if (!layoutShift.hadRecentInput) {
          clsValue += layoutShift.value;
          this.metrics.cls = clsValue;
        }
      }
    });
    observer.observe({ type: "layout-shift", buffered: true });
  }

  // Send metrics using sendBeacon for reliability on unload
  private sendMetrics(): void {
    const data = {
      ...this.metrics,
      userAgent: navigator.userAgent,
      url: window.location.href,
      connection: (navigator as any).connection?.effectiveType,
    };

    if (navigator.sendBeacon) {
      navigator.sendBeacon(this.endpoint, JSON.stringify(data));
    } else {
      fetch(this.endpoint, {
        method: "POST",
        body: JSON.stringify(data),
        keepalive: true, // Important replacement for sendBeacon
      });
    }
  }
}
```

### 2. Synthetic Monitoring

**Concept**: Simulate user visits in a controlled environment (e.g., a bot visiting your site every hour) to establish baselines and catch regressions before deployment.

```javascript
// lighthouserc.js - Run as part of CI/CD pipeline
export default {
  ci: {
    collect: {
      url: ["https://staging.myapp.com/"],
      numberOfRuns: 3, // Average out noise
    },
    assert: {
      assertions: {
        "categories:performance": ["error", { minScore: 0.9 }],
        "first-contentful-paint": ["error", { maxNumericValue: 2000 }],
        interactive: ["error", { maxNumericValue: 3500 }],
      },
    },
  },
};
```

---

## User Analytics & Behavior Tracking

Understanding _what_ users do is as important as how fast the site is.

### 1. Event Tracking System

A centralized queueing system to batch and send analytics events avoids spamming the network with thousands of small requests.

```typescript
interface AnalyticsEvent {
  name: string;
  category: string;
  properties?: Record<string, any>;
  timestamp: number;
}

class Analytics {
  private queue: AnalyticsEvent[] = [];
  private flushInterval = 5000;

  constructor() {
    this.startAutoFlush();
    this.setupAutoTracking();
  }

  track(
    name: string,
    category: string,
    properties?: Record<string, any>
  ): void {
    this.queue.push({
      name,
      category,
      properties,
      timestamp: Date.now(),
    });
  }

  // "Rage Click" Detection
  private setupRageClickDetection(): void {
    let clickCount = 0;
    let lastTarget: HTMLElement | null = null;

    document.addEventListener("click", (e) => {
      const target = e.target as HTMLElement;

      if (target === lastTarget) {
        clickCount++;
        if (clickCount >= 3) {
          this.track("rage_click", "frustration", {
            element: target.tagName,
            id: target.id,
          });
          clickCount = 0; // Reset
        }
      } else {
        clickCount = 1;
        lastTarget = target;
      }
    });
  }

  private flush(): void {
    if (this.queue.length === 0) return;
    navigator.sendBeacon("/api/analytics", JSON.stringify(this.queue));
    this.queue = [];
  }
}
```

### 2. Funnel Analysis

Track user drop-off at each step of a critical flow (e.g., Checkout).

```typescript
class FunnelTracker {
  private steps: { name: string; timestamp: number }[] = [];

  constructor(private funnelName: string) {}

  step(stepName: string) {
    this.steps.push({ name: stepName, timestamp: Date.now() });
  }

  complete() {
    analytics.track("funnel_complete", "conversion", {
      funnel: this.funnelName,
      steps: this.steps,
      timeWait: Date.now() - this.steps[0].timestamp,
    });
  }

  abandon(reason: string) {
    analytics.track("funnel_abandon", "conversion", {
      funnel: this.funnelName,
      dropoffStep: this.steps[this.steps.length - 1].name,
      reason,
    });
  }
}

// Usage
const checkout = new FunnelTracker("checkout_flow");
checkout.step("view_cart");
checkout.step("enter_shipping");
// User leaves...
checkout.abandon("shipping_too_expensive");
```

---

## A/B Testing Infrastructure

A/B testing allows you to scientifically validate changes.

**Key Requirements**:

1.  **Sticky Assignment**: A user assigned to Variant A must stay in Variant A.
2.  **Targeting**: Only run experiments on specific user segments (e.g., "Mobile users in US").

```typescript
class ABTestingService {
  private experiments: Map<string, Experiment> = new Map();

  // Consistent Hashing for Sticky Assignment
  // Ensures User 123 always gets the same variant without storing state in DB
  getVariant(experimentId: string, userId: string): string {
    const experiment = this.experiments.get(experimentId);
    if (!experiment) return "control";

    // Simple hash: Sum of char codes modulo 100
    const hash = (experimentId + userId)
      .split("")
      .reduce((a, b) => a + b.charCodeAt(0), 0);
    const bucket = hash % 100;

    // e.g., Variant A (0-50), Variant B (51-100)
    let cumulative = 0;
    for (const variant of experiment.variants) {
      cumulative += variant.weight;
      if (bucket < cumulative) return variant.id;
    }

    return "control";
  }
}
```
