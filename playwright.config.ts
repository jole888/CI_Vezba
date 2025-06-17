import { defineConfig, devices } from '@playwright/test';
import dotenv from 'dotenv';

dotenv.config();

const targetEnv = process.env.TARGET_ENVIRONMENT;

switch (targetEnv) {
  case 'sandbox':
    dotenv.config({ path: '.env.sandy' });
    break;
  case 'staging':
    dotenv.config({ path: '.env.staging' });
    break;
  default:
    throw new Error(`Unsupported TARGET_ENVIRONMENT: ${targetEnv}`);
}

export default defineConfig({
  testDir: './src/e2e/tests',
  timeout: 30 * 1000, // 30 sekundi timeout po testu
  expect: {
    timeout: 30 * 1000,
  },
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: process.env.CI ? '100%' : '100%',
  reporter: [
    ['html', { outputFolder: 'playwright-report', open: 'never' }],
    ['json', { outputFile: 'playwright-report/report.json' }] // <-- Važno: JSON report u report.json
  ],
  use: {
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    // baseURL: process.env.BASE_URL || 'http://localhost:3000',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    // Firefox i WebKit možeš aktivirati po potrebi
  ],
});
