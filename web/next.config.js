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
};

module.exports = withPWA(nextConfig);
