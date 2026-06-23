import { defineConfig } from 'vitest/config';

export default defineConfig({
  publicDir: false,
  test: {
    environment: 'jsdom',
    exclude: [
      'node_modules',
      'dist',
      'docs/**',
      'docs/.next/**',
      'docs/out/**',
      'playground/**',
      'playground/.next/**',
      'public/**',
      'test-results/**',
      'tests/**',
    ],
    globals: true,
    setupFiles: './vitest.setup.ts',
  },
});
