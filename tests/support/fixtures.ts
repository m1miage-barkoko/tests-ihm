import { test as base } from '@playwright/test';
import { SauceDemo } from '../../src/dsl/SauceDemo';

export const test = base.extend<{ app: SauceDemo }>({
  app: async ({ page }, use) => {
    await use(new SauceDemo(page));
  },
});

export { expect } from '@playwright/test';
