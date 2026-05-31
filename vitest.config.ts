import { defineConfig } from 'vitest/config';

export default defineConfig({
  resolve: {
    alias: {
      '@core': new URL('./src/core', import.meta.url).pathname,
      '@nodes': new URL('./src/nodes', import.meta.url).pathname,
      '@geometry': new URL('./src/geometry', import.meta.url).pathname,
    },
  },
});
