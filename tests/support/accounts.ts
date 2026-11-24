import { test, expect } from './fixtures';
import { loggedInAs } from './data';

export const ACCOUNTS = [
  'standard_user',
  'problem_user',
  'error_user',
  'visual_user',
  'performance_glitch_user',
] as const;

export type Account = (typeof ACCOUNTS)[number];

export function forEachAccount(define: (account: Account) => void): void {
  for (const account of ACCOUNTS) {
    test.describe(account, () => {
      test.beforeEach(async ({ app }) => {
        // Ce compte est seulement lent : chaque affichage du catalogue prend environ 5 s.
        test.slow(account === 'performance_glitch_user');
        await loggedInAs(app, account);
        await expect.poll(() => app.getPerceivedPage(), { timeout: 15_000 }).toBe('Products');
      });
      define(account);
    });
  }
}
