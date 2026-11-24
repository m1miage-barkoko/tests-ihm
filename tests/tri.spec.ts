import { test, expect } from './support/fixtures';
import { forEachAccount } from './support/accounts';
import { catalogue, fleeceJacket, onesie } from './support/data';

test.describe('T : trier le catalogue', () => {
  forEachAccount(() => {
    test('T1 — Tri par défaut « Name (A to Z) »', async ({ app }) => {
      await test.step('Then', async () => {
        expect(await app.getPerceivedSortOption()).toBe('Name (A to Z)');
        expect(await app.getPerceivedProducts()).toEqual(catalogue);
      });
    });

    test('T2 — Ordre alphabétique inverse', async ({ app }) => {
      await test.step('When', async () => {
        await app.sortBy('Name (Z to A)');
      });
      await test.step('Then', async () => {
        await expect.poll(() => app.getPerceivedProducts()).toEqual([...catalogue].reverse());
      });
    });

    test('T3 — Prix croissants, avec deux produits au même prix', async ({ app }) => {
      await test.step('When', async () => {
        await app.sortBy('Price (low to high)');
      });
      await test.step('Then', async () => {
        await expect
          .poll(async () => (await app.getPerceivedProducts()).map((product) => product.price))
          .toEqual(['$7.99', '$9.99', '$15.99', '$15.99', '$29.99', '$49.99']);
        const products = await app.getPerceivedProducts();
        expect(products[0]).toEqual(onesie);
        expect(products[5]).toEqual(fleeceJacket);
      });
    });

    test('T4 — Prix décroissants', async ({ app }) => {
      await test.step('When', async () => {
        await app.sortBy('Price (high to low)');
      });
      await test.step('Then', async () => {
        await expect
          .poll(async () => (await app.getPerceivedProducts()).map((product) => product.price))
          .toEqual(['$49.99', '$29.99', '$15.99', '$15.99', '$9.99', '$7.99']);
      });
    });

    test('T5 — Le tri est conservé après une fiche', async ({ app }) => {
      await test.step('Given', async () => {
        await app.sortBy('Price (low to high)');
      });
      await test.step('When', async () => {
        await app.openProduct(onesie.label);
        await app.backToProducts();
      });
      await test.step('Then', async () => {
        await expect.poll(() => app.getPerceivedPage()).toBe('Products');
        expect(await app.getPerceivedSortOption()).toBe('Price (low to high)');
        expect((await app.getPerceivedProducts())[0]).toEqual(onesie);
      });
    });
  });
});
