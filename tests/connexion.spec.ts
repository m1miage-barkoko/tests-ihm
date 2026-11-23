import { test, expect } from './support/fixtures';
import { backpack, PASSWORD } from './support/data';

const MISMATCH = 'Epic sadface: Username and password do not match any user in this service';

test.describe('C : se connecter', () => {
  test.beforeEach(async ({ app }) => {
    await app.openLoginPage();
    await expect.poll(() => app.getPerceivedPage()).toBe('Login');
  });

  test('C1 — Connexion réussie', async ({ app }) => {
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
    { id: 'C2', title: "Nom d'utilisateur vide", username: '', password: PASSWORD, message: 'Epic sadface: Username is required' },
    { id: 'C3', title: 'Les deux champs vides', username: '', password: '', message: 'Epic sadface: Username is required' },
    { id: 'C4', title: 'Mot de passe vide', username: 'standard_user', password: '', message: 'Epic sadface: Password is required' },
    { id: 'C5', title: 'Mauvais mot de passe', username: 'standard_user', password: 'mauvais_mdp', message: MISMATCH },
    { id: 'C6', title: "Nom d'utilisateur inconnu", username: 'inconnu_user', password: PASSWORD, message: MISMATCH },
    { id: 'C7', title: 'Compte bloqué', username: 'locked_out_user', password: PASSWORD, message: 'Epic sadface: Sorry, this user has been locked out.' },
    { id: 'C8', title: 'Compte bloqué avec un mauvais mot de passe', username: 'locked_out_user', password: 'mauvais_mdp', message: MISMATCH },
    { id: 'C9', title: 'Une majuscule dans le nom', username: 'Standard_user', password: PASSWORD, message: MISMATCH },
    { id: 'C10', title: 'Nom tout en majuscules', username: 'STANDARD_USER', password: PASSWORD, message: MISMATCH },
    { id: 'C11', title: 'Espace au début du nom', username: ' standard_user', password: PASSWORD, message: MISMATCH },
    { id: 'C12', title: 'Espace à la fin du nom', username: 'standard_user ', password: PASSWORD, message: MISMATCH },
    { id: 'C13', title: 'Casse du mot de passe', username: 'standard_user', password: 'Secret_sauce', message: MISMATCH },
  ];

  for (const { id, title, username, password, message } of failedLogins) {
    test(`${id} — ${title}`, async ({ app }) => {
      await test.step('When', async () => {
        await app.login(username, password);
      });
      await test.step('Then', async () => {
        await expect.poll(() => app.getPerceivedErrorMessage()).toBe(message);
        expect(await app.getPerceivedPage()).toBe('Login');
      });
    });
  }

  test("C14 — Fermer un message d'erreur", async ({ app }) => {
    await test.step('Given', async () => {
      await app.login('', '');
      await expect.poll(() => app.getPerceivedErrorMessage()).toBe('Epic sadface: Username is required');
      expect(await app.getPerceivedFieldsInError()).toEqual(['Username', 'Password']);
    });
    await test.step('When', async () => {
      await app.closeErrorMessage();
    });
    await test.step('Then', async () => {
      await expect.poll(() => app.getPerceivedErrorMessage()).toBeNull();
      expect(await app.getPerceivedFieldsInError()).toEqual([]);
    });
  });
});
