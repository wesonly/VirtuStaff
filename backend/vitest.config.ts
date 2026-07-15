import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['tests/**/*.test.ts'],
    coverage: {
      provider: 'v8',
      include: ['src/**/*.ts'],
      exclude: ['src/db/migrations/**', 'src/**/index.ts'],
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
      '@config': path.resolve(__dirname, 'src/config'),
      '@db': path.resolve(__dirname, 'src/db'),
      '@modules': path.resolve(__dirname, 'src/modules'),
      '@ai': path.resolve(__dirname, 'src/ai'),
      '@integrations': path.resolve(__dirname, 'src/integrations'),
      '@middleware': path.resolve(__dirname, 'src/middleware'),
      '@shared': path.resolve(__dirname, 'src/shared'),
    },
  },
});