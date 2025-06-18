import { defineConfig, devices } from '@playwright/test';
import dotenv from 'dotenv';

dotenv.config();

const targetEnv = process.env.TARGET_ENVIRONMENT || 'sandbox';

switch (targetEnv) {
  case 'sandbox':
    dotenv.config({ path: '.env.sandy' });
    break;
  case 'staging':
    dotenv.config({ path: '.env.staging' });
    break;
  default:
    dotenv.config({ path: '.env' });
    console.warn(`Unsupported TARGET_ENVIRONMENT: ${targetEnv}, using default .env file.`);
}

export default defineConfig({
  testDir: './src/e2e/tests',
  timeout: 45 * 1000, // Povećan timeout po testu
  expect: {
    timeout: 45 * 1000,
  },
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? '100%' : '100%',
  reporter: [
    ['html', { outputFolder: 'playwright-report', open: 'never' }],
    ['json', { outputFile: 'playwright-report/report.json' }]
  ],
  use: {
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    baseURL: process.env.BASE_URL || (targetEnv === 'sandbox' ? 'https://sandbox.example.com' : 'https://staging.example.com'),
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    // {
    //   name: 'firefox',
    //   use: { ...devices['Desktop Firefox'] },
    // },
    // {
    //   name: 'webkit',
    //   use: { ...devices['Desktop Safari'] },
    // },
  ],
});
