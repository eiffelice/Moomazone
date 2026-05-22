import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// https://astro.build/config
export default defineConfig({
  site: 'https://mooma.online',
  output: 'static',
  integrations: [sitemap()],
  build: {
    assets: 'assets'
  }
});
