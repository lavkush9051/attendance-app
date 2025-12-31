// /** @type {import('next').NextConfig} */
// const nextConfig = {
//   eslint: {
//     ignoreDuringBuilds: true,
//   },
//   typescript: {
//     ignoreBuildErrors: true,
//   },
//   images: {
//     unoptimized: true,
//   },
// }

// export default nextConfig

// next.config.mjs
import withPWA from '@ducanh2912/next-pwa';

/** @type {import('next').NextConfig} */
const baseConfig = {
  // keep your existing settings:
  output: 'standalone',
  eslint: { ignoreDuringBuilds: true },
  typescript: { ignoreBuildErrors: true },
  images: { unoptimized: true },
};

export default withPWA({
  dest: 'public',                 // service worker & files output
  register: true,                 // auto-register SW
  skipWaiting: true,              // activate new SW immediately
  disable: process.env.NODE_ENV === 'development', // only enable in prod
  workboxOptions: {
    cleanupOutdatedCaches: true,
    clientsClaim: true,
    runtimeCaching: [
      // HTML/documents
      {
        urlPattern: ({ request }) => request.destination === 'document',
        handler: 'NetworkFirst',
        options: {
          cacheName: 'html-cache',
          expiration: { maxEntries: 50, maxAgeSeconds: 24 * 60 * 60 },
        },
      },
      // JS/CSS/Fonts
      {
        urlPattern: ({ request }) =>
          ['script', 'style', 'font'].includes(request.destination),
        handler: 'StaleWhileRevalidate',
        options: {
          cacheName: 'asset-cache',
          expiration: { maxEntries: 100, maxAgeSeconds: 7 * 24 * 60 * 60 },
        },
      },
      // Images
      {
        urlPattern: ({ request }) => request.destination === 'image',
        handler: 'CacheFirst',
        options: {
          cacheName: 'image-cache',
          expiration: { maxEntries: 200, maxAgeSeconds: 30 * 24 * 60 * 60 },
        },
      },
      // API calls (adjust regex if your API is external)
      {
        urlPattern: /^https?:\/\/.*\/api\/.*$/i,
        handler: 'NetworkFirst',
        options: {
          cacheName: 'api-cache',
          networkTimeoutSeconds: 10,
          expiration: { maxEntries: 100, maxAgeSeconds: 60 * 60 },
        },
      },
    ],
  },
})(baseConfig);


