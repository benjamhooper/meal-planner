// @ts-check
const withPWA = require("next-pwa")({
  dest: "public",
  disable: process.env.NODE_ENV === "development",
  register: true,
  skipWaiting: true,
  runtimeCaching: [
    {
      urlPattern: /\/api\/v1\/(grocery|mealplan)/,
      handler: "NetworkFirst",
      options: { cacheName: "dynamic-cache", expiration: { maxEntries: 50 } },
    },
    {
      urlPattern: /\/api\/v1\/recipes/,
      handler: "StaleWhileRevalidate",
      options: { cacheName: "recipes-cache", expiration: { maxEntries: 100 } },
    },
  ],
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Produces a self-contained build for Docker (node server.js)
  output: "standalone",
  // Proxy /api/* to the .NET API container server-side.
  // The browser calls /api/v1/* on the same origin; Next.js forwards it
  // internally to api:8080. Cookies and headers (including X-Forwarded-For
  // set by Cloudflare) are transparently passed through.
  async rewrites() {
    // API_INTERNAL_URL is injected at build time via Docker ARG.
    // Local/Docker Compose default: http://api:8080 (docker-compose service name + port)
    // Azure Container Apps: http://mealplanner-api (same-environment internal DNS, port 80)
    const apiBase = process.env.API_INTERNAL_URL || "http://api:8080";
    return [
      {
        source: "/api/:path*",
        destination: `${apiBase}/api/:path*`,
      },
    ];
  },
};

module.exports = withPWA(nextConfig);
