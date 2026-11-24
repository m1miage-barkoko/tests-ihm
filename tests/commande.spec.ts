import { test, expect } from './support/fixtures';
import { A_CONFIRMER, forEachAccount } from './support/accounts';
import {
  addAllToCart,
  backpack,
  catalogue,
  fleeceJacket,
  inCart,
  jeanDupont,
  onesie,
} from './support/data';
import type { SauceDemo } from '../src/dsl/SauceDemo';
import type { CustomerInfo, Product, Totals } from '../src/dsl/types';

async function openCheckoutForm(app: SauceDemo, ...products: Product[]): Promise<void> {
  await addAllToCart(app, ...products);
  await app.openCart();
  await app.checkout();
  await expect.poll(() => app.getPerceivedPage()).toBe('Checkout: Your Information');
}

async function reachOverview(app: SauceDemo, ...products: Product[]): Promise<void> {
  await openCheckoutForm(app, ...products);
  await app.fillCustomerInfo(jeanDupont);
  await app.continueCheckout();
  await expect.poll(() => app.getPerceivedPage()).toBe('Checkout: Overview');
}

test.describe('CMD : passer une commande', () => {
  forEachAccount(() => {
    const missingFields: { id: string; title: string; info: CustomerInfo; message: string }[] = [
      { id: 'CMD1', title: 'Prénom vide', info: { ...jeanDupont, firstName: '' }, message: 'Error: First Name is required' },
      { id: 'CMD2', title: 'Le prénom est contrôlé en premier', info: { firstName: '', lastName: '', postalCode: '' }, message: 'Error: First Name is required' },
      { id: 'CMD3', title: 'Nom vide', info: { ...jeanDupont, lastName: '' }, message: 'Error: Last Name is required' },
      { id: 'CMD4', title: 'Le nom est contrôlé avant le code postal', info: { ...jeanDupont, lastName: '', postalCode: '' }, message: 'Error: Last Name is required' },
      { id: 'CMD5', title: 'Code postal vide', info: { ...jeanDupont, postalCode: '' }, message: 'Error: Postal Code is required' },
      { id: 'CMD7', title: 'Espaces seuls dans le prénom', info: { ...jeanDupont, firstName: '   ' }, message: 'Error: First Name is required' },
    ];

    for (const { id, title, info, message } of missingFields) {
      test(`${id} — ${title}`, async ({ app }) => {
        await test.step('Given', async () => {
          await openCheckoutForm(app, backpack);
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

    const acceptedForms: { id: string; title: string; info: CustomerInfo; aConfirmer: boolean }[] = [
      { id: 'CMD6', title: 'Limite : un seul caractère', info: { firstName: 'J', lastName: 'D', postalCode: '3' }, aConfirmer: false },
      { id: 'CMD8', title: 'Code postal non numérique', info: { ...jeanDupont, postalCode: 'abc' }, aConfirmer: true },
    ];

    for (const { id, title, info, aConfirmer } of acceptedForms) {
      test(`${id} — ${title}`, aConfirmer ? A_CONFIRMER : {}, async ({ app }) => {
        await test.step('Given', async () => {
          await openCheckoutForm(app, backpack);
        });
        await test.step('When', async () => {
          await app.fillCustomerInfo(info);
          await app.continueCheckout();
        });
        await test.step('Then', async () => {
          await expect.poll(() => app.getPerceivedPage()).toBe('Checkout: Overview');
        });
      });
    }

    const totals: { id: string; title: string; cart: Product[]; expected: Totals; listed: boolean }[] = [
      { id: 'CMD9', title: 'Limite : un produit, le moins cher', cart: [onesie], expected: { itemTotal: '$7.99', tax: '$0.64', total: '$8.63' }, listed: false },
      { id: 'CMD10', title: 'Trois produits', cart: [backpack, fleeceJacket, onesie], expected: { itemTotal: '$87.97', tax: '$7.04', total: '$95.01' }, listed: true },
      { id: 'CMD11', title: 'Limite : panier plein', cart: catalogue, expected: { itemTotal: '$129.94', tax: '$10.40', total: '$140.34' }, listed: false },
      { id: 'CMD12', title: 'Arrondi de la taxe', cart: [fleeceJacket], expected: { itemTotal: '$49.99', tax: '$4.00', total: '$53.99' }, listed: false },
    ];

    for (const { id, title, cart, expected, listed } of totals) {
      test(`${id} — ${title}`, async ({ app }) => {
        await test.step('Given', async () => {
          await addAllToCart(app, ...cart);
        });
        await test.step('When', async () => {
          await app.openCart();
          await app.checkout();
          await app.fillCustomerInfo(jeanDupont);
          await app.continueCheckout();
        });
        await test.step('Then', async () => {
          await expect.poll(() => app.getPerceivedPage()).toBe('Checkout: Overview');
          if (listed) expect(await app.getPerceivedProducts()).toEqual(inCart(...cart));
          expect(await app.getPerceivedTotals()).toEqual(expected);
        });
      });
    }


    test('CMD14 — Fin de commande, le panier est vidé', async ({ app }) => {
      await test.step('Given', async () => {
        await reachOverview(app, backpack, fleeceJacket, onesie);
      });
      await test.step('When', async () => {
        await app.finishCheckout();
      });
      await test.step('Then', async () => {
        await expect.poll(() => app.getPerceivedPage()).toBe('Checkout: Complete!');
        expect(await app.getPerceivedOrderConfirmation()).toBe('Thank you for your order!');
      });
      await test.step('When', async () => {
        await app.backHome();
      });
      await test.step('Then', async () => {
        await expect.poll(() => app.getPerceivedPage()).toBe('Products');
        expect(await app.getPerceivedCartBadge()).toBeNull();
      });
    });

    test("CMD15 — Annuler à l'étape 1", async ({ app }) => {
      await test.step('Given', async () => {
        await openCheckoutForm(app, backpack);
      });
      await test.step('When', async () => {
        await app.cancelCheckout();
      });
      await test.step('Then', async () => {
        await expect.poll(() => app.getPerceivedPage()).toBe('Your Cart');
        expect(await app.getPerceivedProducts()).toEqual(inCart(backpack));
      });
    });

    test("CMD16 — Annuler à l'étape 2", async ({ app }) => {
      await test.step('Given', async () => {
        await reachOverview(app, backpack, onesie);
        expect(await app.getPerceivedTotals()).toEqual({ itemTotal: '$37.98', tax: '$3.04', total: '$41.02' });
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
  });
});
