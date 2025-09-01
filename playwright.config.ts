import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: 'e2e',
  timeout: 30000,
  use: {
    baseURL: 'https://127.0.0.1:4200',
    trace: 'on-first-retry',
    ignoreHTTPSErrors: true
  },
  webServer: {
    command: 'npm run dev',
    url: 'https://127.0.0.1:4200',
    reuseExistingServer: true,
    ignoreHTTPSErrors: true
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] }
    }
  ]
});
