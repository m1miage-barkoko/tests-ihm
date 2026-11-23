import { test, expect } from './support/fixtures';
import {
  addAllToCart,
  backpack,
  bikeLight,
  fleeceJacket,
  inCart,
  loggedInAs,
  onesie,
} from './support/data';

test.describe('Tâche : gérer les articles du panier', () => {
  test.beforeEach(async ({ app }) => {
    await loggedInAs(app);
    await expect.poll(() => app.getPerceivedPage()).toBe('Products');
  });

  test('S1 — Ajouter un produit au panier', async ({ app }) => {
    await test.step('Given', async () => {
      expect(await app.getPerceivedCartBadge()).toBeNull();
    });
    await test.step('When', async () => {
      await app.addToCart(backpack.label);
    });
    await test.step('Then', async () => {
      await expect.poll(() => app.getPerceivedCartBadge()).toBe(1);
      expect(await app.getPerceivedButtonLabel(backpack.label)).toBe('Remove');
      await app.openCart();
      await expect.poll(() => app.getPerceivedProducts()).toEqual(inCart(backpack));
    });
  });

  test('S2 — Ajouter trois produits au panier', async ({ app }) => {
    await test.step('Given', async () => {
      expect(await app.getPerceivedCartBadge()).toBeNull();
    });
    await test.step('When', async () => {
      await addAllToCart(app, backpack, fleeceJacket, onesie);
    });
    await test.step('Then', async () => {
      await expect.poll(() => app.getPerceivedCartBadge()).toBe(3);
      await app.openCart();
      await expect.poll(() => app.getPerceivedProducts()).toEqual(
        inCart(backpack, fleeceJacket, onesie),
      );
    });
  });

  test('S3 — Retirer un produit du panier', async ({ app }) => {
    await test.step('Given', async () => {
      await addAllToCart(app, backpack, fleeceJacket, onesie);
      await app.openCart();
      await expect.poll(() => app.getPerceivedProducts()).toEqual(
        inCart(backpack, fleeceJacket, onesie),
      );
    });
    await test.step('When', async () => {
      await app.removeFromCart(fleeceJacket.label);
    });
    await test.step('Then', async () => {
      await expect.poll(() => app.getPerceivedProducts()).toEqual(inCart(backpack, onesie));
      expect(await app.getPerceivedCartBadge()).toBe(2);
    });
  });

  test('S13 — Ajouter un produit depuis sa fiche', async ({ app }) => {
    await test.step('Given', async () => {
      await app.openProduct(bikeLight.label);
      await expect.poll(() => app.getPerceivedPage()).toBe('Product details');
      expect(await app.getPerceivedCartBadge()).toBeNull();
    });
    await test.step('When', async () => {
      await app.addToCart(bikeLight.label);
    });
    await test.step('Then', async () => {
      await expect.poll(() => app.getPerceivedCartBadge()).toBe(1);
      expect(await app.getPerceivedButtonLabel(bikeLight.label)).toBe('Remove');
    });
  });

  test('S14 — Retirer un produit depuis le catalogue', async ({ app }) => {
    await test.step('Given', async () => {
      await app.addToCart(backpack.label);
      await expect.poll(() => app.getPerceivedCartBadge()).toBe(1);
    });
    await test.step('When', async () => {
      await app.removeFromCart(backpack.label);
    });
    await test.step('Then', async () => {
      await expect.poll(() => app.getPerceivedCartBadge()).toBeNull();
      expect(await app.getPerceivedButtonLabel(backpack.label)).toBe('Add to cart');
    });
  });

  test('S15 — Revenir au catalogue depuis le panier', async ({ app }) => {
    await test.step('Given', async () => {
      await app.addToCart(backpack.label);
      await app.openCart();
      await expect.poll(() => app.getPerceivedProducts()).toEqual(inCart(backpack));
    });
    await test.step('When', async () => {
      await app.continueShopping();
    });
    await test.step('Then', async () => {
      await expect.poll(() => app.getPerceivedPage()).toBe('Products');
      expect(await app.getPerceivedCartBadge()).toBe(1);
      expect(await app.getPerceivedButtonLabel(backpack.label)).toBe('Remove');
    });
  });

  test('S23 — Retirer un produit depuis le catalogue quand le panier en contient trois', async ({ app }) => {
    await test.step('Given', async () => {
      await addAllToCart(app, backpack, fleeceJacket, onesie);
      await expect.poll(() => app.getPerceivedCartBadge()).toBe(3);
    });
    await test.step('When', async () => {
      await app.removeFromCart(fleeceJacket.label);
    });
    await test.step('Then', async () => {
      await expect.poll(() => app.getPerceivedCartBadge()).toBe(2);
      expect(await app.getPerceivedButtonLabel(fleeceJacket.label)).toBe('Add to cart');
      expect(await app.getPerceivedButtonLabel(backpack.label)).toBe('Remove');
      expect(await app.getPerceivedButtonLabel(onesie.label)).toBe('Remove');
    });
    await test.step('When', async () => {
      await app.openCart();
    });
    await test.step('Then', async () => {
      await expect.poll(() => app.getPerceivedProducts()).toEqual(inCart(backpack, onesie));
    });
  });

  test('S24 — Retirer un produit du panier puis revenir au catalogue', async ({ app }) => {
    await test.step('Given', async () => {
      await addAllToCart(app, backpack, fleeceJacket, onesie);
      await app.openCart();
      await expect.poll(() => app.getPerceivedProducts()).toEqual(
        inCart(backpack, fleeceJacket, onesie),
      );
    });
    await test.step('When', async () => {
      await app.removeFromCart(fleeceJacket.label);
      await app.continueShopping();
    });
    await test.step('Then', async () => {
      await expect.poll(() => app.getPerceivedPage()).toBe('Products');
      expect(await app.getPerceivedCartBadge()).toBe(2);
      expect(await app.getPerceivedButtonLabel(fleeceJacket.label)).toBe('Add to cart');
      expect(await app.getPerceivedButtonLabel(backpack.label)).toBe('Remove');
      expect(await app.getPerceivedButtonLabel(onesie.label)).toBe('Remove');
    });
  });

  test('S25 — Retirer un produit depuis sa fiche', async ({ app }) => {
    await test.step('Given', async () => {
      await app.openProduct(bikeLight.label);
      await app.addToCart(bikeLight.label);
      await expect.poll(() => app.getPerceivedCartBadge()).toBe(1);
      expect(await app.getPerceivedButtonLabel(bikeLight.label)).toBe('Remove');
    });
    await test.step('When', async () => {
      await app.removeFromCart(bikeLight.label);
    });
    await test.step('Then', async () => {
      await expect.poll(() => app.getPerceivedCartBadge()).toBeNull();
      expect(await app.getPerceivedButtonLabel(bikeLight.label)).toBe('Add to cart');
      await app.openCart();
      await expect.poll(() => app.getPerceivedPage()).toBe('Your Cart');
      expect(await app.getPerceivedProducts()).toEqual([]);
    });
  });
});
