import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
import path from 'node:path';

// Wellspring is an installable PWA. The service worker caches the app shell
// and static psychoeducation content, but NEVER caches special-category
// health data responses (those are network-only, see runtimeCaching below).
export default defineConfig({
  resolve: {
    alias: { '@': path.resolve(__dirname, 'src') },
  },
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'robots.txt'],
      manifest: {
        name: 'Wellspring',
        short_name: 'Wellspring',
        description:
          'Wellbeing and practice-administration support for therapy clinics. Not a medical device.',
        theme_color: '#2f6f6a',
        background_color: '#f7faf9',
        display: 'standalone',
        start_url: '/',
        icons: [
          { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' },
        ],
      },
      workbox: {
        navigateFallbackDenylist: [/^\/api/, /^\/auth/],
        runtimeCaching: [
          {
            // Supabase data and Edge Functions: never cache health data.
            urlPattern: ({ url }) =>
              url.pathname.startsWith('/rest/') ||
              url.pathname.startsWith('/functions/'),
            handler: 'NetworkOnly',
          },
        ],
      },
    }),
  ],
});
