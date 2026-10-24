import { defineConfig } from "@playwright/test";
export default defineConfig({
  testDir: "./e2e",
  fullyParallel: false,
  workers: 1,
  globalSetup: "./e2e/setup.ts",
  timeout: 30000,
  use: {
    baseURL: "http://127.0.0.1:5174",
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
    launchOptions: { channel: "chromium" },
  },
  webServer: [
    {
      command: "node apps/api/dist/server.js",
      url: "http://127.0.0.1:4001/api/health",
      reuseExistingServer: false,
      env: {
        PORT: "4001",
        DATABASE_URL:
          "postgresql://autovault:test_only_password@localhost:5433/autovault_test",
        JWT_SECRET: "e2e-only-secret-never-for-production-123456",
        FRONTEND_ORIGIN: "http://127.0.0.1:5174",
        NODE_ENV: "test",
      },
    },
    {
      command:
        "node node_modules/vite/bin/vite.js preview --host 127.0.0.1 --port 5174 --config apps/web/vite.config.ts --outDir apps/web/dist",
      url: "http://127.0.0.1:5174",
      reuseExistingServer: false,
      env: { API_TARGET: "http://127.0.0.1:4001" },
    },
  ],
});
