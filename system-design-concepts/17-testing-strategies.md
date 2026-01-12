# Testing Strategies - Complete Guide

## Table of Contents

1. [Introduction](#introduction)
2. [The Testing Pyramid vs. Trophy](#the-testing-pyramid-vs-trophy)
3. [Unit Testing (Logic)](#unit-testing-logic)
4. [Component Testing (Integration)](#component-testing-integration)
5. [End-to-End (E2E) Testing](#end-to-end-e2e-testing)
6. [Visual Regression Testing](#visual-regression-testing)
7. [Network Mocking Strategies](#network-mocking-strategies)
8. [Performance Testing](#performance-testing)
9. [Accessibility Testing](#accessibility-testing)
10. [Test Driven Development (TDD)](#test-driven-development-tdd)
11. [Real-World Examples](#real-world-examples)

---

## Introduction

A robust testing strategy is the safety net that allows teams to ship fast without breaking things. In frontend system design, the challenge isn't just "writing tests"—it's writing the _right_ tests that provide high confidence with low maintenance cost.

### Key Goals

- **Confidence**: Does the app work for the user?
- **Velocity**: Can we refactor without fear?
- **Documentation**: Tests serve as living documentation of how the system works.

---

## The Testing Pyramid vs. Trophy

### The Pyramid (Traditional)

1.  **Unit Tests (70%)**: Fast, cheap, isolated.
2.  **Integration (20%)**: Wiring components together.
3.  **E2E (10%)**: Slow, expensive, fragile.

### The Trophy (Modern Frontend)

Advocated by Kent C. Dodds.

1.  **Static Analysis**: TypeScript, ESLint (Catch typos/syntax).
2.  **Unit Tests**: For pure utilities/algorithms.
3.  **Integration/Component Tests (The Bulk)**: Testing components interacting with each other. This gives the best ROI.
4.  **E2E**: Critical user flows.

---

## Unit Testing (Logic)

**Tooling**: Vitest / Jest

Best for: Shared utility functions, complex data transformations, hooks.

```typescript
// ============================================
// utils/formatting.spec.ts
// ============================================

import { describe, it, expect } from "vitest";
import { formatCurrency } from "./formatting";

describe("formatCurrency", () => {
  it("formats USD correctly", () => {
    expect(formatCurrency(1000, "USD")).toBe("$1,000.00");
  });

  it("handles zero values", () => {
    expect(formatCurrency(0, "USD")).toBe("$0.00");
  });

  it("handles negative values", () => {
    expect(formatCurrency(-500, "EUR", "de-DE")).toBe("-500,00 €");
  });
});
```

---

## Component Testing (Integration)

**Tooling**: Vue Test Utils / React Testing Library

Best for: UI Components. Focus on **User Behavior**, not implementation details.

- ❌ Bad: `expect(wrapper.vm.count).toBe(1)` (Implementation detail)
- ✅ Good: `await fireEvent.click(button); expect(screen.getByText('Count is 1'))` (User behavior)

```typescript
// ============================================
// components/LoginForm.spec.ts
// ============================================

import { mount } from "@vue/test-utils";
import { describe, it, expect, vi } from "vitest";
import LoginForm from "./LoginForm.vue";

describe("LoginForm", () => {
  it("submits the form with user credentials", async () => {
    const onSubmit = vi.fn();

    // 1. Render
    const wrapper = mount(LoginForm, {
      props: { onSubmit },
    });

    // 2. Interact (Simulate User)
    await wrapper.find('input[type="email"]').setValue("user@example.com");
    await wrapper.find('input[type="password"]').setValue("password123");
    await wrapper.find('button[type="submit"]').trigger("click");

    // 3. Assert (Output)
    expect(onSubmit).toHaveBeenCalledTimes(1);
    expect(onSubmit).toHaveBeenCalledWith({
      email: "user@example.com",
      password: "password123",
    });
  });

  it("shows error message when fields are empty", async () => {
    const wrapper = mount(LoginForm);

    await wrapper.find('button[type="submit"]').trigger("click");

    expect(wrapper.text()).toContain("Email is required");
  });
});
```

---

## End-to-End (E2E) Testing

**Tooling**: Playwright / Cypress

Best for: Critical User Journeys (Login -> Checkout -> Payment). Tests the app in a real browser against a (mostly) real backend.

```typescript
// ============================================
// e2e/checkout.spec.ts (Playwright)
// ============================================

import { test, expect } from "@playwright/test";

test("user can add item to cart and checkout", async ({ page }) => {
  // 1. Go to product page
  await page.goto("/product/123");

  // 2. Add to cart
  await page.getByRole("button", { name: "Add to Cart" }).click();
  await expect(page.getByTestId("cart-count")).toHaveText("1");

  // 3. Go to checkout
  await page.getByRole("link", { name: "Checkout" }).click();

  // 4. Fill details
  await page.getByLabel("Full Name").fill("John Doe");
  await page.getByLabel("Credit Card").fill("4242 4242 4242 4242");

  // 5. Submit
  await page.getByRole("button", { name: "Pay Now" }).click();

  // 6. Verify Success Page
  await expect(page).toHaveURL(/success/);
  await expect(page.getByRole("heading")).toHaveText("Order Confirmed");
});
```

---

## Visual Regression Testing

**Tooling**: Playwright / Chromatic / Percy

Best for: Catching accidental CSS breakages (e.g., a button moving 2px to the right).

```typescript
// ============================================
// Playwright Visual Test
// ============================================

test("homepage visual regression", async ({ page }) => {
  await page.goto("/");

  // Compare screenshot with "golden" baseline
  await expect(page).toHaveScreenshot("homepage-desktop.png", {
    maxDiffPixels: 100, // Allow minor rendering noise
  });
});
```

---

## Network Mocking Strategies

Ideally, tests should not hit real external APIs (flaky, slow, rate-limited).

### MSW (Mock Service Worker)

Intercepts requests at the network layer. Works in both Browser (dev) and Node (tests).

```typescript
// ============================================
// mocks/handlers.ts
// ============================================
import { http, HttpResponse } from "msw";

export const handlers = [
  // Intercept GET /user
  http.get("https://api.example.com/user", () => {
    return HttpResponse.json({
      id: "123",
      name: "John Doe",
      role: "admin",
    });
  }),

  // Intercept POST /login
  http.post("https://api.example.com/login", async ({ request }) => {
    const info = await request.json();

    if (info.username === "admin") {
      return HttpResponse.json({ token: "abc-123" });
    }

    return new HttpResponse(null, { status: 403 });
  }),
];
```

**Usage in Tests:**

```typescript
// setupTests.ts
import { setupServer } from "msw/node";
import { handlers } from "./mocks/handlers";

const server = setupServer(...handlers);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());
```

---

## Accessibility Testing

**Tooling**: axe-core / playwright-axe

Automate checking for common a11y violations (contrast, missing labels).

```typescript
import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

test("page should not have any accessibility issues", async ({ page }) => {
  await page.goto("/");

  const accessibilityScanResults = await new AxeBuilder({ page })
    .exclude("#legacy-sidebar") // Exclude known legacy issues
    .analyze();

  expect(accessibilityScanResults.violations).toEqual([]);
});
```

---

## Real-World Recommendation

| Test Type     | Scope                    | Cost   | ROI           | Frequency           |
| :------------ | :----------------------- | :----- | :------------ | :------------------ |
| **Unit**      | Utils, Hooks, Algorithms | Low    | Medium        | Every Commit        |
| **Component** | Buttons, Forms, Widgets  | Medium | Very High     | Every Commit        |
| **E2E**       | Critical User Flows      | High   | High (Safety) | Before Merge/Deploy |
| **Visual**    | Design Systems, CSS      | Medium | High          | Before Merge        |
