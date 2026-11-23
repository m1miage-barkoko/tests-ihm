import { test, expect } from './support/fixtures';
import {
  backpack,
  catalogue,
  jeanDupont,
  loggedInAs,
  PASSWORD,
  redTShirt,
} from './support/data';

test.describe('Comptes défectueux', () => {
  test.fail('S38 — problem_user ajoute les six produits', async ({ app }) => {
    await test.step('Given', async () => {
      await loggedInAs(app, 'problem_user');
      await expect.poll(() => app.getPerceivedPage()).toBe('Products');
    });
    await test.step('When', async () => {
      for (const product of catalogue) await app.addToCart(product.label);
    });
    await test.step('Then', async () => {
      await expect.poll(() => app.getPerceivedCartBadge()).toBe(6);
      for (const product of catalogue) {
        expect(await app.getPerceivedButtonLabel(product.label)).toBe('Remove');
      }
    });
  });

  test.fail('S39 — problem_user trie par prix croissant', async ({ app }) => {
    await test.step('Given', async () => {
      await loggedInAs(app, 'problem_user');
      await expect.poll(() => app.getPerceivedPage()).toBe('Products');
    });
    await test.step('When', async () => {
      await app.sortBy('Price (low to high)');
    });
    await test.step('Then', async () => {
      await expect
        .poll(async () => (await app.getPerceivedProducts()).map((product) => product.price))
        .toEqual(['$7.99', '$9.99', '$15.99', '$15.99', '$29.99', '$49.99']);
    });
  });

  test.fail("S40 — problem_user ouvre la fiche d'un produit", async ({ app }) => {
    await test.step('Given', async () => {
      await loggedInAs(app, 'problem_user');
      await expect.poll(() => app.getPerceivedPage()).toBe('Products');
    });
    await test.step('When', async () => {
      await app.openProduct(backpack.label);
    });
    await test.step('Then', async () => {
      await expect.poll(() => app.getPerceivedPage()).toBe('Product details');
      const details = await app.getPerceivedProductDetails();
      expect({ label: details.label, price: details.price }).toEqual(backpack);
    });
  });

  test.fail('S41 — problem_user remplit le formulaire de commande', async ({ app }) => {
    await test.step('Given', async () => {
      await loggedInAs(app, 'problem_user');
      await app.addToCart(backpack.label);
      await app.openCart();
      await app.checkout();
      await expect.poll(() => app.getPerceivedPage()).toBe('Checkout: Your Information');
    });
    await test.step('When', async () => {
      await app.fillCustomerInfo(jeanDupont);
      await app.continueCheckout();
    });
    await test.step('Then', async () => {
      await expect.poll(() => app.getPerceivedPage()).toBe('Checkout: Overview');
    });
  });

  test.fail('S42 — error_user trie par nom de Z à A', async ({ app }) => {
    await test.step('Given', async () => {
      await loggedInAs(app, 'error_user');
      await expect.poll(() => app.getPerceivedPage()).toBe('Products');
    });
    await test.step('When', async () => {
      await app.sortBy('Name (Z to A)');
    });
    await test.step('Then', async () => {
      await expect.poll(async () => (await app.getPerceivedProducts())[0]).toEqual(redTShirt);
      expect(await app.getPerceivedAlerts()).toEqual([]);
    });
  });

  test.fail('S43 — performance_glitch_user se connecte', async ({ app }) => {
    let start = 0;
    await test.step('Given', async () => {
      await app.openLoginPage();
    });
    await test.step('When', async () => {
      start = Date.now();
      await app.login('performance_glitch_user', PASSWORD);
    });
    await test.step('Then', async () => {
      await expect.poll(() => app.getPerceivedPage()).toBe('Products');
      expect(await app.getPerceivedProducts()).toHaveLength(6);
      expect(Date.now() - start).toBeLessThan(5_000);
    });
  });
});
