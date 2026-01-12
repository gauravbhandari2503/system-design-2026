# Security Considerations - Complete Guide

## Table of Contents

1. [Introduction](#introduction)
2. [XSS (Cross-Site Scripting) Prevention](#xss-cross-site-scripting-prevention)
3. [CSRF (Cross-Site Request Forgery) Protection](#csrf-cross-site-request-forgery-protection)
4. [Authentication & Authorization](#authentication--authorization)
5. [Secure Data Storage](#secure-data-storage)
6. [Content Security Policy (CSP)](#content-security-policy-csp)
7. [HTTPS & Secure Communication](#https--secure-communication)
8. [Input Validation & Sanitization](#input-validation--sanitization)
9. [Rate Limiting & DDoS Protection](#rate-limiting--ddos-protection)
10. [Dependency Security](#dependency-security)
11. [Security Headers](#security-headers)
12. [Real-World Examples](#real-world-examples)
13. [Best Practices](#best-practices)

---

## Introduction

Security is not a feature you add at the end; it's a fundamental architectural concern. In modern single-page applications (SPAs), the frontend is the first line of defense. While you can never trust the client, you must design it to resist attacks and protect user data.

### Core Security Principles

1.  **Never Trust User Input**: Treat all data from the outside world (forms, URL params, API responses) as potentially malicious.
2.  **Defense in Depth**: If one layer fails (e.g., frontend validation), another layer (e.g., API validation) should catch it.
3.  **Least Privilege**: A user should only have access to the exact resources they need, nothing more.

---

## XSS (Cross-Site Scripting) Prevention

XSS is the most common frontend vulnerability. It generally involves an attacker injecting malicious JavaScript into your webpage, which then executes in other users' browsers.

### 1. Understanding XSS Types

**Stored XSS**: The attacker saves a malicious script to your database (e.g., in a comment). When other users view that comment, the script executes.

```javascript
// Database content: <script>stealCookies()</script>
// Frontend renders: <div v-html="comment.content"></div> -> Script executes!
```

**Reflected XSS**: The malicious script is in the URL. The attacker tricks a user into clicking a link like `example.com?search=<script>...`.

```javascript
// Frontend: document.body.innerHTML = 'Search results for: ' + urlParams.get('search');
```

**DOM-based XSS**: The attack happens entirely in the browser by manipulating the DOM insecurely.

```javascript
// ❌ Dangerous
eval(userInput);
document.write(userInput);
```

### 2. Vue XSS Protection (Built-in)

Modern frameworks like Vue and React are secure by default. They automatically "escape" content, meaning `<script>` is rendered as plain text `&lt;script&gt;` instead of executable code.

**The Danger Zone: `v-html`**
The only time you are vulnerable is when you explicitly bypass this protection using `v-html` (Vue) or `dangerouslySetInnerHTML` (React).

```vue
<template>
  <!-- ✅ Safe: Vue automatically escapes by default -->
  <div>{{ userInput }}</div>

  <!-- ❌ Dangerous: v-html bypasses escaping -->
  <div v-html="userInput"></div>

  <!-- ✅ Safe: Sanitized HTML -->
  <div v-html="sanitizedHTML"></div>
</template>

<script setup>
import DOMPurify from 'dompurify';
import { computed } from 'vue';

const userInput = '<script>alert("XSS")</script>';

// Always sanitize if you MUST render raw HTML
const sanitizedHTML = computed(() => {
  return DOMPurify.sanitize(userInput);
});
</script>
```

### 3. HTML Sanitization

If you need a rich text editor or markdown rendering, you _must_ sanitize the output. **DOMPurify** is the industry standard library for this. It strips out dangerous tags (`<script>`, `<iframe>`, `object`) while keeping safe ones (`<b>`, `<p>`, `<img>`).

```javascript
// utils/sanitize.js
import DOMPurify from "dompurify";

export function sanitizeHTML(dirty, options = {}) {
  // Configure DOMPurify to be strict
  const config = {
    ALLOWED_TAGS: ["b", "i", "em", "strong", "a", "p", "br", "ul", "li"],
    ALLOWED_ATTR: ["href", "title", "target"],
    ...options,
  };

  // Extra layer: Force all links to open in new tab with noopener
  DOMPurify.addHook("afterSanitizeAttributes", (node) => {
    if ("target" in node) {
      node.setAttribute("target", "_blank");
      node.setAttribute("rel", "noopener noreferrer");
    }
  });

  return DOMPurify.sanitize(dirty, config);
}
```

### 4. Safe Component Patterns

Encapsulate dangerous logic. Instead of sprinkling `v-html` everywhere, create a `<SafeUserContent>` component that handles sanitization centrally.

```vue
<!-- components/SafeUserContent.vue -->
<template>
  <div class="user-content">
    <!-- Plain text is always safe -->
    <div v-if="contentType === 'text'">{{ content }}</div>

    <!-- Markdown must be compiled AND sanitized -->
    <div v-else-if="contentType === 'markdown'" v-html="renderedMarkdown" />

    <!-- Raw HTML must be sanitized -->
    <div v-else-if="contentType === 'html'" v-html="sanitizedHTML" />
  </div>
</template>

<script setup>
import { computed } from "vue";
import { marked } from "marked";
import DOMPurify from "dompurify";

const props = defineProps(["content", "contentType"]);

const renderedMarkdown = computed(() => {
  const html = marked.parse(props.content);
  return DOMPurify.sanitize(html);
});

const sanitizedHTML = computed(() => {
  return DOMPurify.sanitize(props.content);
});
</script>
```

---

## CSRF (Cross-Site Request Forgery) Protection

CSRF attacks trick a logged-in user into unwanted actions on your site. For example, a hidden form on `evil.com` might submit a POST request to `yourbank.com/transfer` while the user is logged in.

### 1. CSRF Token Implementation

The standard defense is a **CSRF Token**. The server generates a random token and sends it to the client (in a cookie or meta tag). The client must read this token and include it in a custom header (e.g., `X-CSRF-Token`) for every state-changing request (POST, PUT, DELETE).

**Why it works:** `evil.com` can send a request to your server, but it cannot read the response or read your cookies due to Same-Origin Policy. Therefore, it cannot find the CSRF token to include in the header.

```javascript
// utils/csrf.js
class CSRFProtection {
  constructor() {
    this.tokenHeader = "X-CSRF-Token";
  }

  getToken() {
    // 1. Try to read from <meta name="csrf-token">
    const meta = document.querySelector('meta[name="csrf-token"]');
    if (meta) return meta.getAttribute("content");

    // 2. Try to read from 'csrf-token' cookie
    const match = document.cookie.match(/csrf-token=([^;]+)/);
    return match ? decodeURIComponent(match[1]) : null;
  }

  addTokenToHeaders(headers = {}) {
    const token = this.getToken();
    if (token) {
      headers[this.tokenHeader] = token;
    }
    return headers;
  }
}

export const csrf = new CSRFProtection();
```

### 2. API Client with CSRF Protection

Integrate CSRF protection directly into your API client wrapper so developers don't forget it.

```javascript
// api/client.js
import { csrf } from "@/utils/csrf";

class APIClient {
  async request(endpoint, options = {}) {
    const headers = { ...options.headers };

    // Automatically add CSRF token for mutations
    if (["POST", "PUT", "PATCH", "DELETE"].includes(options.method)) {
      csrf.addTokenToHeaders(headers);
    }

    return fetch(endpoint, {
      ...options,
      headers,
      credentials: "same-origin", // Important: Include cookies!
    });
  }
}
```

### 3. SameSite Cookie Configuration

Modern browsers support the `SameSite` cookie attribute, which prevents CSRF at the browser level.

- `SameSite=Strict`: Cookie is never sent on cross-site requests. (Best security, but links to your site won't log the user in).
- `SameSite=Lax`: Cookie is sent on top-level navigations (clicking a link) but not on sub-requests (images, frames, XHR). **Recommended default.**
- `SameSite=None`: Cookie is sent everywhere (requires `Secure`).

```javascript
// Server-side (Express)
res.cookie("session_id", "123", {
  httpOnly: true, // Frontend JS cannot read the cookie (Prevents XSS stealing session)
  secure: true, // Only sent over HTTPS
  sameSite: "lax", // CSRF protection
});
```

---

## Authentication & Authorization

### 1. JWT Token Management

**Where to store JWTs?**

- **localStorage**: Easy to use, but vulnerable to XSS. If an attacker runs JS on your page, they steal the token.
- **httpOnly Cookie**: Secure against XSS (JS can't read it), but vulnerable to CSRF (needs CSRF tokens).

**Best Practice:** Store the long-lived **Refresh Token** in an `httpOnly` cookie. Store the short-lived **Access Token** in memory (JavaScript variable).

```javascript
// utils/auth.js
class AuthManager {
  constructor() {
    this.accessToken = null; // Stored in memory
  }

  setAccessToken(token) {
    this.accessToken = token;
  }

  getAccessToken() {
    return this.accessToken;
  }

  async refreshAccessToken() {
    // The browser automatically sends the httpOnly refresh cookie
    const res = await fetch("/api/auth/refresh", { method: "POST" });
    const data = await res.json();
    this.setAccessToken(data.accessToken);
    return data.accessToken;
  }
}
```

### 2. Protected API Requests (Axios Interceptors)

Handling token expiration automatically is tricky. You need to intercept 401 errors, pause the request, refresh the token, and retry the original request.

```javascript
// api/secureClient.js
class SecureAPIClient {
  async request(endpoint, options) {
    try {
      // Try request with current token
      return await this.executeRequest(endpoint, options);
    } catch (error) {
      if (error.status === 401) {
        // Token expired? Refresh and retry.
        const newToken = await authManager.refreshAccessToken();
        return await this.executeRequest(endpoint, options, newToken);
      }
      throw error;
    }
  }
}
```

### 3. Role-Based Access Control (RBAC)

Don't just hide buttons; enforce permissions in logic.

```javascript
// composables/usePermissions.js
export function usePermissions() {
  const user = useUserStore();

  function canAccess(resource, action) {
    // Check for explicit permission (e.g. "posts:edit")
    if (user.permissions.includes(`${resource}:${action}`)) return true;

    // Check for admin role
    if (user.roles.includes("admin")) return true;

    return false;
  }

  return { canAccess };
}
```

### 4. Route Guards

Prevent users from visiting `/admin` by just typing the URL.

```javascript
// router/guards.js
router.beforeEach((to, from, next) => {
  const auth = useAuthStore();

  // 1. Check Authentication
  if (to.meta.requiresAuth && !auth.isAuthenticated) {
    return next("/login");
  }

  // 2. Check Roles
  if (to.meta.roles && !to.meta.roles.includes(auth.user.role)) {
    return next("/unauthorized");
  }

  next();
});
```

---

## Secure Data Storage

Never store sensitive data (passwords, credit cards, PII) in `localStorage` or `sessionStorage`. They are plain text files on the user's computer.

**Sensitive Data**: Do not store on client.
**Non-Sensitive (UI State)**: `localStorage` is fine (e.g., "Dark Mode: On").
**Auth Tokens**: Memory or httpOnly Cookies.
