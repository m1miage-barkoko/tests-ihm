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

// Défauts du site, quel que soit le compte : ces tests vérifient le comportement attendu.
export const SITE_DEFECTS = ['T5', 'P16', 'CMD7'];

export const KNOWN_FAILURES: Record<Account, string[]> = {
  standard_user: [],
  problem_user: [
    'T2', 'T3', 'T4',
    'F1',
    'P2', 'P3', 'P4', 'P5', 'P6', 'P7', 'P8', 'P9', 'P11', 'P12', 'P15',
    'CMD1', 'CMD5', 'CMD6', 'CMD8', 'CMD9', 'CMD10', 'CMD11', 'CMD12', 'CMD14', 'CMD16',
  ],
  error_user: [
    'T2', 'T3', 'T4',
    'F1',
    'P2', 'P3', 'P4', 'P6', 'P7', 'P8', 'P9', 'P11', 'P12', 'P15',
    'CMD3', 'CMD4', 'CMD10', 'CMD11', 'CMD12', 'CMD14',
  ],
  visual_user: ['T1', 'T2', 'T3', 'T4'],
  performance_glitch_user: [],
};

export const A_CONFIRMER = { tag: '@a-confirmer' };

export function forEachAccount(define: (account: Account) => void): void {
  for (const account of ACCOUNTS) {
    test.describe(account, () => {
      test.beforeEach(async ({ app }, testInfo) => {
        const id = testInfo.title.split(' ')[0];
        test.fail(SITE_DEFECTS.includes(id), 'défaut du site');
        test.fail(KNOWN_FAILURES[account].includes(id), `défaut observé avec ${account}`);
        // Ce compte est seulement lent : chaque affichage du catalogue prend environ 5 s.
        test.slow(account === 'performance_glitch_user');
        await loggedInAs(app, account);
        await expect.poll(() => app.getPerceivedPage(), { timeout: 15_000 }).toBe('Products');
      });
      define(account);
    });
  }
}
