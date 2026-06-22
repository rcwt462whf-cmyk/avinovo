import { defineConfig } from 'astro/config';
import vercel from '@astrojs/vercel/serverless';

export default defineConfig({
  // Hybrid: pages stay static (fast/cheap); only routes that opt out with
  // `export const prerender = false` (the /api/* endpoints) run as functions.
  output: 'hybrid',
  adapter: vercel(),
  site: 'https://avinovo.com',
  trailingSlash: 'never',
});
