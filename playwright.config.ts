import { defineConfig, devices } from "@playwright/test";

// Tests use their own port so they can run while the development server uses
// Astro's default port.
const testServerUrl = "http://127.0.0.1:4320";

export default defineConfig({
  testDir: "./tests/smoke",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: "line",
  outputDir: "test-results",
  preserveOutput: "failures-only",

  use: {
    baseURL: testServerUrl,
    screenshot: "only-on-failure",
    trace: "on-first-retry",
  },

  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
    {
      name: "firefox",
      use: { ...devices["Desktop Firefox"] },
    },
    {
      name: "webkit",
      use: { ...devices["Desktop Safari"] },
    },
  ],

  webServer: {
    // The test config builds the site's configuration from a fixture: a test
    // input the tests own, here tests/fixtures/website-facts.yaml, plus fixture
    // pages. Its production URL, example.com, is a reserved test domain
    // (RFC 2606) used as a test input.
    // `--ignore-lock` lets the test server run alongside this checkout's
    // development server.
    command:
      "npm run dev -- --config tests/fixtures/astro.config.mjs --host 127.0.0.1 --port 4320 --ignore-lock",
    // Astro 7 runs `astro dev` in the background when it detects an AI agent,
    // which ends this command early. Astro sets this variable for its own
    // background child; setting it keeps the test server in the foreground.
    env: { ASTRO_DEV_BACKGROUND: "1" },
    url: testServerUrl,
    // Always start a server with the test inputs above.
    reuseExistingServer: false,
  },
});
