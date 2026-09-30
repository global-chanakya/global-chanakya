import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    environment: 'node',
    globals: true,
    // Load staging env for USE_LOCAL_QUOTA flag; does NOT affect production .env.local
    env: {
      USE_LOCAL_QUOTA: 'true',
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
