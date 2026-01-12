import { defineConfig } from "vitepress";

export default defineConfig({
  title: "System Design Frontend",
  description: "A comprehensive guide to frontend system design concepts.",
  themeConfig: {
    nav: [
      { text: "Home", link: "/" },
      { text: "Concepts", link: "/01-core-concepts" },
    ],

    sidebar: [
      {
        text: "Core Concepts",
        items: [{ text: "Core Overview", link: "/01-core-concepts" }],
      },
      {
        text: "Performance & Networking",
        items: [
          {
            text: "Performance & Optimization",
            link: "/02-performance-&-optimization",
          },
          { text: "Caching Strategies", link: "/03-caching-strategies" },
          { text: "Network Optimization", link: "/08-network-optimization" },
          {
            text: "Rendering & UI Performance",
            link: "/09-rendering-&-ui-performance",
          },
          {
            text: "Monitoring & Analytics",
            link: "/13-monitoring-&-analytics",
          },
          { text: "Advanced Patterns", link: "/16-advanced-patterns" },
        ],
      },
      {
        text: "Architecture & Scalability",
        items: [
          {
            text: "Data Loading Patterns",
            link: "/04-data-loading-patterns",
          },
          {
            text: "State Management",
            link: "/05-state-management-at-scale",
          },
          { text: "Real-Time Features", link: "/06-real-time-features" },
          {
            text: "Scalability & Architecture",
            link: "/07-scalability-&-architecture",
          },
          { text: "Build & Deployment", link: "/14-build-&-deployment" },
          {
            text: "Design System Architecture",
            link: "/18-design-system-architecture",
          },
        ],
      },
      {
        text: "Quality & Security",
        items: [
          {
            text: "Error Handling",
            link: "/10-error-handling-&-resilience",
          },
          {
            text: "Security Considerations",
            link: "/11-security-considerations",
          },
          {
            text: "Accessibility & i18n",
            link: "/12-accessibility-&-internationalization",
          },
          {
            text: "Mobile Considerations",
            link: "/15-mobile-specific-considerations",
          },
          { text: "Testing Strategies", link: "/17-testing-strategies" },
        ],
      },
      {
        text: "Practice",
        items: [{ text: "Interview Questions", link: "/practice-questions" }],
      },
    ],

    socialLinks: [
      {
        icon: "github",
        link: "https://github.com/gauravbhandari2503/system-design-frontend",
      },
    ],
    footer: {
      message: "Authored by Gaurav Bhandari | Contact: +91 7351088383",
      copyright: "Email: gaurav2503bhandari@gmail.com",
    },
  },
});
