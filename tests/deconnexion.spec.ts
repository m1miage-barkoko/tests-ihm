import { test, expect } from './support/fixtures';
import { loggedInAs } from './support/data';

test.describe('Tâche : se déconnecter', () => {
  test('S22 — Déconnexion', async ({ app }) => {
    await test.step('Given', async () => {
      await loggedInAs(app);
      await expect.poll(() => app.getPerceivedPage()).toBe('Products');
    });
    await test.step('When', async () => {
      await app.logout();
    });
    await test.step('Then', async () => {
      await expect.poll(() => app.getPerceivedPage()).toBe('Login');
    });
    await test.step('When', async () => {
      await app.goTo('/inventory.html');
    });
    await test.step('Then', async () => {
      await expect.poll(() => app.getPerceivedErrorMessage()).toBe(
        "Epic sadface: You can only access '/inventory.html' when you are logged in.",
      );
    });
  });
});
