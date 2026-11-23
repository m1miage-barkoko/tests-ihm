import { test, expect } from './support/fixtures';
import {
  addAllToCart,
  backpack,
  fleeceJacket,
  inCart,
  jeanDupont,
  loggedInAs,
  onesie,
} from './support/data';

test.describe('Tâche : passer une commande', () => {
  test.beforeEach(async ({ app }) => {
    await loggedInAs(app);
    await expect.poll(() => app.getPerceivedPage()).toBe('Products');
  });

  test('S16 — Commande complète de trois produits', async ({ app }) => {
    await test.step('Given', async () => {
      await addAllToCart(app, backpack, fleeceJacket, onesie);
      await expect.poll(() => app.getPerceivedCartBadge()).toBe(3);
    });
    await test.step('When', async () => {
      await app.openCart();
      await app.checkout();
      await app.fillCustomerInfo(jeanDupont);
      await app.continueCheckout();
    });
    await test.step('Then', async () => {
      await expect.poll(() => app.getPerceivedPage()).toBe('Checkout: Overview');
      expect(await app.getPerceivedTotals()).toEqual({
        itemTotal: '$87.97',
        tax: '$7.04',
        total: '$95.01',
      });
    });
    await test.step('When', async () => {
      await app.finishCheckout();
    });
    await test.step('Then', async () => {
      await expect.poll(() => app.getPerceivedPage()).toBe('Checkout: Complete!');
      expect(await app.getPerceivedOrderConfirmation()).toBe('Thank you for your order!');
      expect(await app.getPerceivedCartBadge()).toBeNull();
    });
  });

  const missingFields = [
    { id: 'S17', title: 'Commande sans prénom (erreur)', info: { ...jeanDupont, firstName: '' }, message: 'Error: First Name is required' },
    { id: 'S18', title: 'Commande sans nom (erreur)', info: { ...jeanDupont, lastName: '' }, message: 'Error: Last Name is required' },
    { id: 'S19', title: 'Commande sans code postal (erreur)', info: { ...jeanDupont, postalCode: '' }, message: 'Error: Postal Code is required' },
  ];

  for (const { id, title, info, message } of missingFields) {
    test(`${id} — ${title}`, async ({ app }) => {
      await test.step('Given', async () => {
        await app.addToCart(backpack.label);
        await app.openCart();
        await app.checkout();
        await expect.poll(() => app.getPerceivedPage()).toBe('Checkout: Your Information');
      });
      await test.step('When', async () => {
        await app.fillCustomerInfo(info);
        await app.continueCheckout();
      });
      await test.step('Then', async () => {
        await expect.poll(() => app.getPerceivedErrorMessage()).toBe(message);
        expect(await app.getPerceivedPage()).toBe('Checkout: Your Information');
      });
    });
  }

  test('S20 — Annuler la commande au récapitulatif', async ({ app }) => {
    await test.step('Given', async () => {
      await addAllToCart(app, backpack, onesie);
      await app.openCart();
      await app.checkout();
      await app.fillCustomerInfo(jeanDupont);
      await app.continueCheckout();
      await expect.poll(() => app.getPerceivedPage()).toBe('Checkout: Overview');
      expect(await app.getPerceivedTotals()).toEqual({
        itemTotal: '$37.98',
        tax: '$3.04',
        total: '$41.02',
      });
    });
    await test.step('When', async () => {
      await app.cancelCheckout();
    });
    await test.step('Then', async () => {
      await expect.poll(() => app.getPerceivedPage()).toBe('Products');
      expect(await app.getPerceivedCartBadge()).toBe(2);
      await app.openCart();
      await expect.poll(() => app.getPerceivedProducts()).toEqual(inCart(backpack, onesie));
    });
  });

  test.fixme('S21 — Commande avec un panier vide (cas limite)', async ({ app }) => {
    await test.step('Given', async () => {
      expect(await app.getPerceivedCartBadge()).toBeNull();
    });
    await test.step('When', async () => {
      await app.openCart();
      await app.checkout();
      await app.fillCustomerInfo(jeanDupont);
      await app.continueCheckout();
    });
    await test.step('Then', async () => {
      await expect.poll(() => app.getPerceivedPage()).toBe('Checkout: Overview');
      expect(await app.getPerceivedTotals()).toEqual({
        itemTotal: '$0',
        tax: '$0.00',
        total: '$0.00',
      });
    });
  });
});
