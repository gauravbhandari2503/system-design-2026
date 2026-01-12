# Build & Deployment - Complete Guide

## Table of Contents

1. [Introduction](#introduction)
2. [Build Optimization](#build-optimization)
3. [CI/CD Pipelines](#cicd-pipelines)
4. [Deployment Strategies](#deployment-strategies)
5. [Versioning & Cache Busting](#versioning--cache-busting)
6. [Environment Management](#environment-management)
7. [Feature Flags](#feature-flags)
8. [Rollback Mechanisms](#rollback-mechanisms)
9. [Security in Build & Deployment](#security-in-build--deployment)
10. [Performance Monitoring in Production](#performance-monitoring-in-production)
11. [Infrastructure as Code](#infrastructure-as-code)
12. [Real-World Examples](#real-world-examples)
13. [Key Takeaways](#key-takeaways)
14. [Further Reading](#further-reading)

---

## Introduction

Modern frontend development isn't just about writing code; it's about delivering it. A robust build and deployment strategy ensures that your application is Performant, Reliable, and Secure.

### Key Concepts

- **Build Optimization**: Making your bundle as small and fast as possible (Tree Shaking, Code Splitting, Compression).
- **CI/CD**: Automating the path from `git push` to production url (Tests, Linting, Building, Deploying).
- **Deployment Strategy**: How you release changes to users (Blue-Green, Canary, Rolling).

---

## Build Optimization

The goal of build optimization is to reduce the Time To First Byte (TTFB) and Time To Interactive (TTI) for your users.

### 1. Vite Configuration for Production

Vite is the modern standard for frontend tooling. It uses Rollup under the hood for production builds, providing excellent tree-shaking and code-splitting capabilities.

**Key Optimizations in this Config:**

- **Manual Chunks**: Don't let the browser download one massive 5MB file. Split vendors (React/Vue/Lodash) into separate cacheable chunks.
- **Compression**: Generate `.gz` and `.br` (Brotli) files at build time so the server doesn't have to compress them on the fly.
- **Tree Shaking**: `pure_funcs: ['console.log']` removes logging from production, saving bytes.

```typescript
// ============================================
// vite.config.ts - Optimized Production Build
// ============================================

import { defineConfig, splitVendorChunkPlugin } from "vite";
import vue from "@vitejs/plugin-vue";
import { visualizer } from "rollup-plugin-visualizer";
import { compression } from "vite-plugin-compression2";

export default defineConfig(({ mode }) => ({
  plugins: [
    vue(),
    splitVendorChunkPlugin(),
    // Brotli compression (better than gzip)
    compression({
      algorithm: "brotliCompress",
    }),
    // Bundle analyzer to visualize where your bytes are going
    mode === "analyze" &&
      visualizer({
        open: true,
        filename: "dist/stats.html",
      }),
  ],

  build: {
    outDir: "dist",
    sourcemap: mode !== "production", // Hidden in prod for security
    minify: "terser",
    terserOptions: {
      compress: {
        drop_console: true, // Remove console.logs
      },
    },
    rollupOptions: {
      output: {
        // Smart Chunking Strategy
        manualChunks: {
          "core-vendor": ["vue", "vue-router", "pinia"],
          "ui-vendor": ["element-plus"],
          utils: ["lodash-es", "date-fns"],
        },
      },
    },
  },
}));
```

### 2. Build Scripts in package.json

Standardize your commands. Developers shouldn't memorize flags.

- `npm run build`: Standard production build.
- `npm run build:analyze`: runs the `visualizer` plugin to help you debug bundle size.

```json
{
  "scripts": {
    "dev": "vite",
    "build": "vue-tsc && vite build",
    "build:staging": "vue-tsc && vite build --mode staging",
    "build:analyze": "vue-tsc && vite build --mode analyze",
    "preview": "vite preview",
    "lint": "eslint . --ext .vue,.ts",
    "test:unit": "vitest",
    "test:e2e": "playwright test",
    "prebuild": "npm run lint && npm run type-check"
  }
}
```

### 3. Build Info Generation

It's impossible to debug user reports like "The site is broken" without knowing _which version_ they are on. Embedding Git metadata into the build solves this.

```typescript
// scripts/generate-build-info.js
import fs from "fs";
import { execSync } from "child_process";

function generateBuildInfo() {
  const buildInfo = {
    version: process.env.npm_package_version,
    buildTime: new Date().toISOString(),
    // Essential for tracking specific commits in Sentry/Bugsnag
    gitCommit: execSync("git rev-parse HEAD").toString().trim(),
  };

  fs.writeFileSync("dist/build-info.json", JSON.stringify(buildInfo));
}

generateBuildInfo();
```

---

## CI/CD Pipelines

Automate everything. If a human has to SSH into a server, the process is broken.

### 1. GitHub Actions Workflow

A typical pipeline has three stages:

1.  **Verification**: Lint, Typecheck, Unit Test (Fast).
2.  **Validation**: E2E Tests, Build Check (Slow).
3.  **Deployment**: Release to Vercel/AWS/Netlify.

```yaml
name: CI/CD Pipeline

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  # Fast feedback loop
  lint-and-test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
      - run: npm ci
      - run: npm run lint
      - run: npm run type-check
      - run: npm run test:coverage

  # Slower but critical verification
  e2e-test:
    needs: lint-and-test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
      - run: npm ci
      - run: npx playwright install --with-deps
      - run: npm run test:e2e

  # Deployment (Only on main branch)
  deploy-production:
    needs: e2e-test
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    environment: production
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
      - run: npm ci
      - run: npm run build
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-args: "--prod"
```

---

## Deployment Strategies

How do you update the app without breaking it for users currently using it?

### 1. Blue-Green Deployment

**Concept**:

- **Blue**: Current Live Version (v1.0)
- **Green**: New Version (v1.1)

You deploy v1.1 to the Green environment. You run smoke tests. If they pass, you flip the switch (Load Balancer) to point all traffic to Green. Blue becomes the idle backup.

**Pros**: Instant rollback (just flip the switch back).
**Cons**: Requires double the infrastructure.

```typescript
class BlueGreenDeployment {
  async deploy() {
    // 1. Deploy to inactive environment (Green)
    await this.deployToInactive();

    // 2. Run critical health checks
    try {
      await this.runSmokeTests();
    } catch (e) {
      console.log("Smoke tests failed. Aborting.");
      return;
    }

    // 3. Flip the switch
    await this.switchTraffic();

    // 4. Monitor for 10 mins. If error rate spikes, revert.
    await this.monitorAndRollbackIfNeeded();
  }
}
```

### 2. Versioning & Cache Busting

Browsers love caching `app.js`. If you release a new version but the user's browser loads the old cached JS, the app crashes.

**Solution: Content Hashing**
Vite/Webpack handles this by renaming files based on their content: `app.js` -> `assets/index.28a9f0.js`.

- If contents change -> Hash changes -> Filename changes -> Browser downloads new file.
- If contents don't change -> Filename stays same -> Browser uses cache.

```typescript
// vite.config.ts
build: {
  rollupOptions: {
    output: {
      entryFileNames: 'assets/[name].[hash].js',
      chunkFileNames: 'assets/[name].[hash].js',
      assetFileNames: 'assets/[name].[hash][extname]',
    }
  }
}
```

---

## Environment Management

Never hardcode API URLs. Use `.env` files.

- `.env.development`: `VITE_API_URL=http://localhost:3000`
- `.env.production`: `VITE_API_URL=https://api.myapp.com`

**Security Note**: Variables starting with `VITE_` are exposed to the browser. Never put secrets (database passwords, private keys) here.

```typescript
// Accessing env variables in code
const apiUrl = import.meta.env.VITE_API_URL;

if (import.meta.env.DEV) {
  console.log("Running in development mode");
}
```

---

## Rollback Mechanisms

Deployment failed? Users seeing White Screen of Death? You need a plan.

1.  **Automated Rollback**: If error rate > 1% in first 5 mins, revert automatically.
2.  **Manual Rollback**: A "Revert" button in your CI/CD dashboard (Vercel/Netlify makes this easy).
3.  **Feature Flags**: If a specific feature is causing the crash, just turn it off via a flag instead of rolling back the whole deploy.

```typescript
if (featureFlags.isEnabled("new-checkout-flow")) {
  // New buggy code
} else {
  // Old stable code
}
```
