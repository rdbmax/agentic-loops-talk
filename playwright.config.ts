import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./tests/browser",
  fullyParallel: true,
  workers: 2,
  reporter: "list",
  use: {
    baseURL: "http://127.0.0.1:3218",
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"], viewport: { width: 1440, height: 1000 } } }],
  webServer: {
    command: "npm run dev -- --port 3218",
    url: "http://127.0.0.1:3218",
    reuseExistingServer: false,
    timeout: 120_000,
    env: {
      NEXT_DIST_DIR: ".next-e2e",
      DEMO_MODEL_ID: "gpt-4.1-mini",
      OPENAI_API_KEY: "test-only-key-never-sent",
    },
  },
});
