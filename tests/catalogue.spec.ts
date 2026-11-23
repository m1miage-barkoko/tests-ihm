import { test, expect } from './support/fixtures';
import {
  backpack,
  bikeLight,
  boltTShirt,
  fleeceJacket,
  loggedInAs,
  onesie,
  redTShirt,
} from './support/data';

test.describe('Tâche : consulter le catalogue', () => {
  test.beforeEach(async ({ app }) => {
    await loggedInAs(app);
    await expect.poll(() => app.getPerceivedPage()).toBe('Products');
  });

  test('S10 — Trier les produits par prix croissant', async ({ app }) => {
    await test.step('When', async () => {
      await app.sortBy('Price (low to high)');
    });
    await test.step('Then', async () => {
      const products = await app.getPerceivedProducts();
      expect(products.map((product) => product.price)).toEqual([
        '$7.99', '$9.99', '$15.99', '$15.99', '$29.99', '$49.99',
      ]);
      expect(products[0]).toEqual(onesie);
      expect(products[5]).toEqual(fleeceJacket);
    });
  });

  test('S11 — Trier les produits par nom de Z à A', async ({ app }) => {
    await test.step('When', async () => {
      await app.sortBy('Name (Z to A)');
    });
    await test.step('Then', async () => {
      expect(await app.getPerceivedProducts()).toEqual([
        redTShirt, onesie, fleeceJacket, boltTShirt, bikeLight, backpack,
      ]);
    });
  });

  test("S12 — Consulter le détail d'un produit", async ({ app }) => {
    await test.step('When', async () => {
      await app.openProduct(backpack.label);
    });
    await test.step('Then', async () => {
      await expect.poll(() => app.getPerceivedPage()).toBe('Product details');
      const details = await app.getPerceivedProductDetails();
      expect(details.label).toBe(backpack.label);
      expect(details.price).toBe(backpack.price);
      expect(details.description).toMatch(
        /^carry\.allTheThings\(\) with the sleek, streamlined Sly Pack/,
      );
    });
    await test.step('When', async () => {
      await app.backToProducts();
    });
    await test.step('Then', async () => {
      await expect.poll(() => app.getPerceivedPage()).toBe('Products');
    });
  });
});
