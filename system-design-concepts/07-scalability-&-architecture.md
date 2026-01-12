# Scalability & Architecture - Complete Guide

## Table of Contents

1. [Introduction](#introduction)
2. [Micro-Frontends](#micro-frontends)
3. [Component Architecture](#component-architecture)
4. [Monorepo vs Polyrepo](#monorepo-vs-polyrepo)
5. [API Layer Design](#api-layer-design)
6. [BFF Pattern (Backend for Frontend)](#bff-pattern-backend-for-frontend)
7. [Module Federation](#module-federation)
8. [Design Systems](#design-systems)
9. [Real-World Examples](#real-world-examples)
10. [Best Practices](#best-practices)

---

## Introduction

Scalability isn't just about handling more users—it's about building systems that can grow in features, team size, and complexity without collapsing under their own weight. A scalable architecture allows 50 engineers to work on the same product as effectively as 5.

### Key Architectural Concerns

- **Team Scalability**: Can multiple teams work independently without stepping on each other's toes?
- **Code Scalability**: Can the codebase grow to millions of lines without becoming unmaintainable?
- **Deployment Scalability**: Can we deploy parts of the application independently?
- **Performance Scalability**: Can we optimize specific areas (like the checkout flow) without affecting others?
- **Feature Scalability**: Can we add features without increasing complexity exponentially?

---

## Micro-Frontends

Micro-frontends apply the concept of **microservices** to the frontend. Instead of a single monolithic application, you break the UI into smaller, feature-focused applications that are composed together.

### 1. What Are Micro-Frontends?

Think of an e-commerce site. Instead of one giant React app, you might have:

- **Search Team**: Owns the search bar and results page.
- **Checkout Team**: Owns the cart and payment flow.
- **Product Team**: Owns the product details page.

Each team builds, tests, and deploys their own "mini-app" (Micro-Frontend). A "Shell" application then stitches them together.

```
Traditional Monolith:
┌─────────────────────────────────┐
│     Single Frontend App         │
│  (Home, Products, Cart, etc.)   │
└─────────────────────────────────┘

Micro-Frontends:
┌──────────┐  ┌──────────┐  ┌──────────┐
│  Home    │  │ Products │  │  Cart    │
│   MFE    │  │   MFE    │  │   MFE    │
└──────────┘  └──────────┘  └──────────┘
     ↓              ↓              ↓
┌─────────────────────────────────┐
│      Shell/Container App        │
└─────────────────────────────────┘
```

**Benefits:**

- **Independent Deployments**: The Checkout team can push a fix without waiting for the Search team.
- **Team Autonomy**: Teams can choose their own tech stack (though mixing frameworks is risky).
- **Fault Isolation**: If the "Recommended Products" widget crashes, it doesn't take down the entire page.

**Challenges:**

- **Complexity**: Setting up the build pipeline and orchestration is hard.
- **Performance**: Loading multiple JS bundles can be slower.
- **State Sharing**: Sharing data between isolated apps requires careful design.

### 2. Implementation Approaches

There are several ways to implement this, ranging from simple to complex.

#### A. Build-Time Integration (Simple)

The simplest approach. Micro-frontends are just npm packages. The Shell imports them and builds a single bundle.

**Pros**: Type-safe, simple to set up, shared dependencies are automatic.
**Cons**: You lose independent deployment. If the Header changes, you must rebuild and redeploy the entire Shell.

```javascript
// shell-app/package.json
{
  "dependencies": {
    "@company/header-mfe": "^1.0.0",
    "@company/products-mfe": "^2.0.0",
    "@company/footer-mfe": "^1.0.0"
  }
}

// shell-app/App.vue
<template>
  <div id="app">
    <HeaderMFE />
    <router-view />
    <FooterMFE />
  </div>
</template>

<script setup>
import HeaderMFE from '@company/header-mfe';
import FooterMFE from '@company/footer-mfe';
</script>
```

#### B. Runtime Integration with iframes

The "old school" way. Each micro-frontend is a fully isolated page running in an iframe.

**Pros**: perfect isolation (CSS/JS never leaks).
**Cons**: Terrible UX (scroll bars, resizing issues), hard to share state, SEO problems.

```html
<!-- shell-app/index.html -->
<div id="app">
  <iframe src="https://header.example.com" id="header"></iframe>
  <iframe src="https://products.example.com" id="products"></iframe>
  <iframe src="https://footer.example.com" id="footer"></iframe>
</div>

<script>
  // Communication between iframes
  window.addEventListener("message", (event) => {
    if (event.data.type === "cart-update") {
      // Update header cart count
      document
        .getElementById("header")
        .contentWindow.postMessage({
          type: "update-cart",
          count: event.data.count,
        });
    }
  });
</script>
```

#### C. Runtime Integration with Web Components

Wrap your framework (Vue/React) components inside standard **Custom Elements**. The Shell puts `<my-product-widget>` in the DOM, and the browser handles the rest.

**Pros**: Framework-agnostic. The Shell doesn't care if the widget is React or Vue.
**Cons**: Passing complex data (objects/arrays) to attributes is clunky.

```javascript
// products-mfe/src/ProductsElement.js
class ProductsElement extends HTMLElement {
  connectedCallback() {
    const root = this.attachShadow({ mode: 'open' });

    // Mount Vue app
    const app = createApp(ProductsApp);
    const container = document.createElement('div');
    root.appendChild(container);
    app.mount(container);
  }

  disconnectedCallback() {
    // Cleanup
  }
}

customElements.define('products-mfe', ProductsElement);

// shell-app/App.vue
<template>
  <div id="app">
    <header-mfe></header-mfe>
    <products-mfe></products-mfe>
    <footer-mfe></footer-mfe>
  </div>
</template>

<script setup>
import 'https://cdn.example.com/header-mfe.js';
import 'https://cdn.example.com/products-mfe.js';
import 'https://cdn.example.com/footer-mfe.js';
</script>
```

#### D. Module Federation (Webpack 5+)

The modern standard. Allows an application to dynamicallly load code from another application at **runtime**. It handles dependency sharing automatically (e.g., both apps use React 18, so it only loads React once).

```javascript
// products-mfe/webpack.config.js
module.exports = {
  plugins: [
    new ModuleFederationPlugin({
      name: "products",
      filename: "remoteEntry.js",
      exposes: {
        "./ProductsApp": "./src/ProductsApp.vue",
        "./ProductList": "./src/components/ProductList.vue",
      },
      shared: {
        vue: { singleton: true, requiredVersion: "^3.0.0" },
        "vue-router": { singleton: true },
      },
    }),
  ],
};

// shell-app/webpack.config.js
module.exports = {
  plugins: [
    new ModuleFederationPlugin({
      name: "shell",
      remotes: {
        products: "products@http://localhost:3001/remoteEntry.js",
        cart: "cart@http://localhost:3002/remoteEntry.js",
      },
      shared: {
        vue: { singleton: true },
        "vue-router": { singleton: true },
      },
    }),
  ],
};

// shell-app/router.js
const routes = [
  {
    path: "/products",
    // Dynamically imports the component from the remote server
    component: () => import("products/ProductsApp"),
  },
  {
    path: "/cart",
    component: () => import("cart/CartApp"),
  },
];
```

### 3. Shared State in Micro-Frontends

Since MFEs are isolated, they can't simply import a shared store file. We need an **Event Bus** or a shared reactive object.

```javascript
// shared-state/src/eventBus.js
class MicroFrontendEventBus {
  constructor() {
    this.listeners = new Map();
  }

  subscribe(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event).push(callback);

    return () => {
      const callbacks = this.listeners.get(event);
      const index = callbacks.indexOf(callback);
      if (index > -1) {
        callbacks.splice(index, 1);
      }
    };
  }

  publish(event, data) {
    const callbacks = this.listeners.get(event);
    if (callbacks) {
      callbacks.forEach((callback) => callback(data));
    }
  }
}

export const eventBus = new MicroFrontendEventBus();

// products-mfe: Publish event
import { eventBus } from "@company/shared-state";

function addToCart(product) {
  eventBus.publish("cart:item-added", { product, quantity: 1 });
}

// header-mfe: Subscribe to event
import { eventBus } from "@company/shared-state";

onMounted(() => {
  const unsubscribe = eventBus.subscribe("cart:item-added", (data) => {
    cartCount.value += data.quantity;
  });

  onUnmounted(unsubscribe);
});
```

### 4. Routing in Micro-Frontends

Unified routing is tricky. The Shell usually owns the top-level URL, and delegates sub-paths to MFEs.

```javascript
// shell-app/router.js
import { createRouter, createWebHistory } from "vue-router";

// Shell owns the router
const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: "/",
      component: () => import("./Home.vue"),
    },
    {
      path: "/products/:pathMatch(.*)*",
      component: () => import("products/ProductsApp"),
      // Pass route params to MFE
      props: (route) => ({ initialPath: route.path }),
    },
    {
      path: "/cart/:pathMatch(.*)*",
      component: () => import("cart/CartApp"),
      props: (route) => ({ initialPath: route.path }),
    },
  ],
});

// products-mfe: Handle internal routing
export default {
  props: ["initialPath"],
  setup(props) {
    const internalRouter = createRouter({
      history: createMemoryHistory(props.initialPath),
      routes: [
        { path: "/products", component: ProductList },
        { path: "/products/:id", component: ProductDetail },
      ],
    });

    // Sync with shell router
    watch(
      () => internalRouter.currentRoute.value.path,
      (newPath) => {
        window.dispatchEvent(
          new CustomEvent("mfe-route-change", {
            detail: { path: newPath },
          })
        );
      }
    );

    return { internalRouter };
  },
};
```

---

## Component Architecture

Building scalable UI requires strict component hierarchies.

### 1. Atomic Design Pattern

Organize components by complexity, not just by feature.

- **Atoms**: Basic, indivisible UI elements (Buttons, Inputs, Icons).
- **Molecules**: Groups of atoms working together (SearchBar = Input + Button).
- **Organisms**: Complex sections of UI (Header = Logo + SearchBar + Nav).
- **Templates**: Page skeletons without data.
- **Pages**: Templates with real data.

```vue
<!-- atoms/Button.vue -->
<template>
  <button
    :class="['btn', `btn-${variant}`, `btn-${size}`]"
    :disabled="disabled || loading"
    @click="$emit('click', $event)"
  >
    <span v-if="loading" class="spinner"></span>
    <slot v-else />
  </button>
</template>

<script setup>
defineProps({
  variant: {
    type: String,
    default: "primary",
    validator: (value) => ["primary", "secondary", "danger"].includes(value),
  },
  size: {
    type: String,
    default: "medium",
    validator: (value) => ["small", "medium", "large"].includes(value),
  },
  loading: Boolean,
  disabled: Boolean,
});

defineEmits(["click"]);
</script>

<!-- molecules/SearchBar.vue -->
<template>
  <div class="search-bar">
    <Input
      v-model="localValue"
      placeholder="Search..."
      @keyup.enter="handleSearch"
    />
    <Button @click="handleSearch">
      <Icon name="search" />
    </Button>
  </div>
</template>

<script setup>
import { ref, watch } from "vue";
import Input from "@/atoms/Input.vue";
import Button from "@/atoms/Button.vue";
import Icon from "@/atoms/Icon.vue";

const props = defineProps(["modelValue"]);
const emit = defineEmits(["update:modelValue", "search"]);

const localValue = ref(props.modelValue);

watch(localValue, (newValue) => {
  emit("update:modelValue", newValue);
});

function handleSearch() {
  emit("search", localValue.value);
}
</script>

<!-- organisms/Header.vue -->
<template>
  <header class="site-header">
    <Logo />
    <SearchBar v-model="searchQuery" @search="handleSearch" />
    <UserMenu :user="user" />
  </header>
</template>

<script setup>
import { ref } from "vue";
import Logo from "@/atoms/Logo.vue";
import SearchBar from "@/molecules/SearchBar.vue";
import UserMenu from "@/molecules/UserMenu.vue";

const searchQuery = ref("");
const user = ref({ name: "John Doe" });

function handleSearch(query) {
  // Navigate to search results
}
</script>
```

### 2. Composition Pattern (Slots & Provide/Inject)

Instead of passing props down 10 levels ("Prop Drilling"), use slots to let the parent inject content directly.

```vue
<!-- organisms/DataTable.vue -->
<template>
  <div class="data-table">
    <table>
      <thead>
        <tr>
          <th v-for="column in columns" :key="column.key">
            {{ column.label }}
          </th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(item, index) in data" :key="item.id || index">
          <td v-for="column in columns" :key="column.key">
            <slot
              :name="`cell-${column.key}`"
              :item="item"
              :value="item[column.key]"
            >
              {{ item[column.key] }}
            </slot>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup>
defineProps({
  data: Array,
  columns: Array,
});
</script>

<!-- Usage with custom cells -->
<template>
  <DataTable :data="users" :columns="columns">
    <template #cell-avatar="{ item }">
      <img :src="item.avatar" :alt="item.name" class="avatar" />
    </template>

    <template #cell-actions="{ item }">
      <Button @click="editUser(item)">Edit</Button>
      <Button variant="danger" @click="deleteUser(item)">Delete</Button>
    </template>
  </DataTable>
</template>
```

### 3. Render Props Pattern

A powerful pattern for separating logic (fetching data) from the UI (displaying data). The component handles the hard work and exposes the data via a scoped slot.

```vue
<!-- components/FetchData.vue -->
<template>
  <slot :data="data" :loading="loading" :error="error" :refetch="refetch" />
</template>

<script setup>
import { ref, onMounted } from "vue";

const props = defineProps({
  url: String,
  immediate: { type: Boolean, default: true },
});

const data = ref(null);
const loading = ref(false);
const error = ref(null);

async function refetch() {
  loading.value = true;
  error.value = null;

  try {
    const response = await fetch(props.url);
    data.value = await response.json();
  } catch (err) {
    error.value = err;
  } finally {
    loading.value = false;
  }
}

onMounted(() => {
  if (props.immediate) {
    refetch();
  }
});

defineExpose({ refetch });
</script>

<!-- Usage -->
<template>
  <FetchData url="/api/users">
    <template #default="{ data, loading, error, refetch }">
      <div v-if="loading">Loading...</div>
      <div v-else-if="error">Error: {{ error.message }}</div>
      <div v-else>
        <UserList :users="data" />
        <Button @click="refetch">Refresh</Button>
      </div>
    </template>
  </FetchData>
</template>
```

### 4. Higher-Order Components (HOC)

A function that takes a component and returns a new component directly wrapping it with extra functionality (like logging, authentication, or loading states).

```javascript
// hoc/withLoading.js
import { h, ref, onMounted } from "vue";
import LoadingSpinner from "@/components/LoadingSpinner.vue";

export function withLoading(Component, fetchDataFn) {
  return {
    setup(props, { attrs, slots }) {
      const data = ref(null);
      const loading = ref(true);
      const error = ref(null);

      onMounted(async () => {
        try {
          data.value = await fetchDataFn(props);
        } catch (err) {
          error.value = err;
        } finally {
          loading.value = false;
        }
      });

      return () => {
        if (loading.value) {
          return h(LoadingSpinner);
        }

        if (error.value) {
          return h("div", { class: "error" }, error.value.message);
        }

        return h(
          Component,
          {
            ...props,
            ...attrs,
            data: data.value,
          },
          slots
        );
      };
    },
  };
}

// Usage
import UserProfile from "./UserProfile.vue";
import { withLoading } from "@/hoc/withLoading";

const UserProfileWithLoading = withLoading(UserProfile, (props) =>
  fetch(`/api/users/${props.userId}`).then((r) => r.json())
);
```

---

## Monorepo vs Polyrepo

How you organize your code repositories is a major architectural decision.

### 1. Monorepo Structure

**Concept:** All projects (Web, Mobile, Admin, UI Lib) live in a **single Git repository**.

**Tools:** Nx, Turborepo, Lerna, pnpm workspaces.

```
monorepo/
├── package.json                # Root package
├── pnpm-workspace.yaml        # Workspace config
├── turbo.json                 # Build pipeline
├── packages/
│   ├── ui-components/         # Shared UI library
│   │   ├── package.json
│   │   └── src/
│   ├── utils/                 # Shared utilities
│   │   ├── package.json
│   │   └── src/
│   └── api-client/           # API client library
│       ├── package.json
│       └── src/
└── apps/
    ├── web/                   # Main web app
    │   ├── package.json
    │   └── src/
    ├── admin/                 # Admin dashboard
    │   ├── package.json
    │   └── src/
    └── mobile/                # Mobile app (React Native)
        ├── package.json
        └── src/
```

**Monorepo Benefits:**

- **Atomic Commits**: You can change an API method in `api-client` and update `web` and `mobile` to use it in a single PR.
- **Code Sharing**: Sharing a `Header` component is trivial. Just import it.
- **Consistency**: One lint config, one test setup, one CI pipeline.

**Monorepo Challenges:**

- **CI Times**: If you touch a core file, you might trigger tests for _everything_. (Turborepo solves this with caching).
- **Complexity**: Setting up the tooling is harder than a standard `create-react-app`.

### 2. Polyrepo Structure

**Concept:** Each project has its **own Git repository**.

**Benefits**:

- **Permissions**: You can restrict access to specific repos.
- **Simplicity**: Each repo is small and easy to understand.
- **CI Speed**: Pushing to the `admin` repo only runs `admin` tests.

**Challenges**:

- **Dependency Hell**: If you update `ui-components`, you have to publish a new version to npm, then go to `web`, `admin`, and `mobile` and upgrade the dependency. It's slow and painful.

---

## API Layer Design

A clean data access layer separates your UI from the backend. Your components should never call `fetch` directly.

### 1. REST API Client

Centralize your API logic to handle authentication, error handling, and types in one place.

```javascript
// api/client.js
class APIClient {
  constructor(baseURL, options = {}) {
    this.baseURL = baseURL;
    this.options = options;
    this.interceptors = {
      request: [],
```
