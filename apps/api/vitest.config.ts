import { defineConfig } from 'vitest/config';
export default defineConfig({test:{fileParallelism:false,setupFiles:['./tests/setup.ts'],coverage:{provider:'v8',include:['src/**/*.ts'],exclude:['src/server.ts'],thresholds:{statements:85,branches:85}}}});
