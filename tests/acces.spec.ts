import { test, expect } from './support/fixtures';
import { forEachAccount } from './support/accounts';

const accessDenied = (path: string): string =>
  `Epic sadface: You can only access '${path}' when you are logged in.`;

test.describe('A : ouvrir une page sans être connecté', () => {
  const protectedPages = [
    { id: 'A1', title: "Page d'arrivée après connexion", url: '/inventory.html', path: '/inventory.html' },
    { id: 'A2', title: 'Fiche produit', url: '/inventory-item.html?id=4', path: '/inventory-item.html' },
    { id: 'A3', title: 'Panier', url: '/cart.html', path: '/cart.html' },
    { id: 'A4', title: 'Formulaire de commande', url: '/checkout-step-one.html', path: '/checkout-step-one.html' },
    { id: 'A5', title: 'Récapitulatif', url: '/checkout-step-two.html', path: '/checkout-step-two.html' },
    { id: 'A6', title: 'Fin de commande', url: '/checkout-complete.html', path: '/checkout-complete.html' },
  ];

  for (const { id, title, url, path } of protectedPages) {
    test(`${id} — ${title}`, async ({ app }) => {
      await test.step('When', async () => {
        await app.goTo(url);
      });
      await test.step('Then', async () => {
        await expect.poll(() => app.getPerceivedPage()).toBe('Login');
        expect(await app.getPerceivedErrorMessage()).toBe(accessDenied(path));
      });
    });
  }

  forEachAccount(() => {
    test('A7 — La déconnexion ferme bien la session', async ({ app }) => {
      await test.step('When', async () => {
        await app.logout();
        await expect.poll(() => app.getPerceivedPage()).toBe('Login');
        await app.goTo('/inventory.html');
      });
      await test.step('Then', async () => {
        await expect.poll(() => app.getPerceivedErrorMessage()).toBe(accessDenied('/inventory.html'));
        expect(await app.getPerceivedPage()).toBe('Login');
      });
    });
  });
});
