import { defineConfig, devices } from '@playwright/test';
import dotenv from 'dotenv';
import path from 'path';

import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load variables from main Backend and frontend envs to match ports and credentials
dotenv.config({ path: path.resolve(__dirname, '../Backend/.env') });

export default defineConfig({
  testDir: './tests',
  fullyParallel: false, // Run E2E tests sequentially to prevent state collisions in shared DB
  forbidOnly: !!process.env.CI,
  retries: 0,
  workers: 1, // Single worker avoids database write conflicts during stateful E2E checks
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:8082',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
});
