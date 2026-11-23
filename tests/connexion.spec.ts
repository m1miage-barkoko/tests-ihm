import { test, expect } from './support/fixtures';
import { backpack, PASSWORD } from './support/data';

test.describe('Tâche : se connecter', () => {
  test('S4 — Connexion réussie', async ({ app }) => {
    await test.step('Given', async () => {
      await app.openLoginPage();
      await expect.poll(() => app.getPerceivedPage()).toBe('Login');
    });
    await test.step('When', async () => {
      await app.login('standard_user', PASSWORD);
    });
    await test.step('Then', async () => {
      await expect.poll(() => app.getPerceivedPage()).toBe('Products');
      const products = await app.getPerceivedProducts();
      expect(products).toHaveLength(6);
      expect(products[0]).toEqual(backpack);
      expect(await app.getPerceivedCartBadge()).toBeNull();
    });
  });

  const failedLogins = [
    { id: 'S5', title: 'Connexion sans nom d\'utilisateur (erreur)', username: '', password: PASSWORD, message: 'Epic sadface: Username is required' },
    { id: 'S6', title: 'Connexion sans mot de passe (erreur)', username: 'standard_user', password: '', message: 'Epic sadface: Password is required' },
    { id: 'S7', title: 'Connexion avec un mauvais mot de passe (erreur)', username: 'standard_user', password: 'mauvais_mdp', message: 'Epic sadface: Username and password do not match any user in this service' },
    { id: 'S8', title: 'Connexion d\'un utilisateur bloqué (erreur)', username: 'locked_out_user', password: PASSWORD, message: 'Epic sadface: Sorry, this user has been locked out.' },
  ];

  for (const { id, title, username, password, message } of failedLogins) {
    test(`${id} — ${title}`, async ({ app }) => {
      await test.step('Given', async () => {
        await app.openLoginPage();
      });
      await test.step('When', async () => {
        await app.login(username, password);
      });
      await test.step('Then', async () => {
        await expect.poll(() => app.getPerceivedErrorMessage()).toBe(message);
        expect(await app.getPerceivedPage()).toBe('Login');
      });
    });
  }

  test('S9 — Accès au catalogue sans être connecté (erreur)', async ({ app }) => {
    await test.step('When', async () => {
      await app.goTo('/inventory.html');
    });
    await test.step('Then', async () => {
      await expect.poll(() => app.getPerceivedPage()).toBe('Login');
      expect(await app.getPerceivedErrorMessage()).toBe(
        "Epic sadface: You can only access '/inventory.html' when you are logged in.",
      );
    });
  });
});
