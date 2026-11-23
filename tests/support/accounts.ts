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

export const KNOWN_FAILURES: Record<Account, string[]> = {
  standard_user: ['P16'],
  problem_user: [
    'T2', 'T3', 'T4',
    'F1',
    'P2', 'P3', 'P4', 'P5', 'P6', 'P7', 'P8', 'P9', 'P11', 'P12', 'P15', 'P16',
    'CMD1', 'CMD5', 'CMD6', 'CMD7', 'CMD8', 'CMD9', 'CMD10', 'CMD11', 'CMD12', 'CMD13',
    'CMD14', 'CMD16', 'CMD17',
  ],
  error_user: [
    'T2', 'T3', 'T4',
    'F1',
    'P2', 'P3', 'P4', 'P6', 'P7', 'P8', 'P9', 'P11', 'P12', 'P15', 'P16',
    'CMD3', 'CMD4', 'CMD10', 'CMD11', 'CMD12', 'CMD13', 'CMD14', 'CMD17',
  ],
  visual_user: ['T1', 'T2', 'T3', 'T4', 'T5', 'P16'],
  performance_glitch_user: ['P16'],
};

export const A_CONFIRMER = { tag: '@a-confirmer' };

export function forEachAccount(define: (account: Account) => void): void {
  for (const account of ACCOUNTS) {
    test.describe(account, () => {
      test.beforeEach(async ({ app }, testInfo) => {
        const id = testInfo.title.split(' ')[0];
        test.fail(KNOWN_FAILURES[account].includes(id), `défaut observé avec ${account}`);
        await loggedInAs(app, account);
        await expect.poll(() => app.getPerceivedPage(), { timeout: 15_000 }).toBe('Products');
      });
      define(account);
    });
  }
}
