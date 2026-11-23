import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  reporter: [['list'], ['html', { open: 'never' }]],
  use: {
    baseURL: 'https://www.saucedemo.com',
    channel: 'chrome',
    testIdAttribute: 'data-test',
    actionTimeout: 10_000,
    trace: 'retain-on-failure',
  },
});
