import { test, expect } from './support/fixtures';
import { A_CONFIRMER, forEachAccount } from './support/accounts';
import {
  addAllToCart,
  backpack,
  bikeLight,
  catalogue,
  fleeceJacket,
  inCart,
  onesie,
  PASSWORD,
} from './support/data';
import type { Product } from '../src/dsl/types';

const byLabel = (products: Product[]): Product[] =>
  [...products].sort((a, b) => a.label.localeCompare(b.label));

test.describe('P : gérer le panier', () => {
  forEachAccount((account) => {
    test('P1 — Ajouter un produit depuis le catalogue, panier vide', async ({ app }) => {
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

    test('P2 — Ajouter plusieurs produits', async ({ app }) => {
      await test.step('When', async () => {
        await addAllToCart(app, backpack, fleeceJacket, onesie);
      });
      await test.step('Then', async () => {
        await expect.poll(() => app.getPerceivedCartBadge()).toBe(3);
        await app.openCart();
        await expect.poll(() => app.getPerceivedProducts()).toEqual(inCart(backpack, fleeceJacket, onesie));
      });
    });

    test("P3 — Remplir le panier jusqu'à la limite", async ({ app }) => {
      await test.step('When', async () => {
        await addAllToCart(app, ...catalogue);
      });
      await test.step('Then', async () => {
        await expect.poll(() => app.getPerceivedCartBadge()).toBe(6);
        for (const product of catalogue) {
          expect(await app.getPerceivedButtonLabel(product.label)).toBe('Remove');
        }
      });
    });

    test('P4 — Limite : passer de 5 à 6 produits', async ({ app }) => {
      const others = catalogue.filter((product) => product !== onesie);
      await test.step('Given', async () => {
        await addAllToCart(app, ...others);
        await expect.poll(() => app.getPerceivedCartBadge()).toBe(5);
      });
      await test.step('When', async () => {
        await app.addToCart(onesie.label);
      });
      await test.step('Then', async () => {
        await expect.poll(() => app.getPerceivedCartBadge()).toBe(6);
        await app.openCart();
        await expect.poll(async () => byLabel(await app.getPerceivedProducts())).toEqual(byLabel(inCart(...catalogue)));
      });
    });

    test('P5 — Ajouter un produit depuis sa fiche', async ({ app }) => {
      await test.step('Given', async () => {
        await app.openProduct(bikeLight.label);
        await expect.poll(() => app.getPerceivedPage()).toBe('Product details');
      });
      await test.step('When', async () => {
        await app.addToCart(bikeLight.label);
      });
      await test.step('Then', async () => {
        await expect.poll(() => app.getPerceivedCartBadge()).toBe(1);
        expect(await app.getPerceivedButtonLabel(bikeLight.label)).toBe('Remove');
      });
    });

    test('P6 — Retirer depuis le catalogue, un produit dans le panier', async ({ app }) => {
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

    test('P7 — Retirer depuis le catalogue, trois produits dans le panier', async ({ app }) => {
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

    test('P8 — Retirer depuis la page panier, trois produits', async ({ app }) => {
      await test.step('Given', async () => {
        await addAllToCart(app, backpack, fleeceJacket, onesie);
        await app.openCart();
        await expect.poll(() => app.getPerceivedProducts()).toEqual(inCart(backpack, fleeceJacket, onesie));
      });
      await test.step('When', async () => {
        await app.removeFromCart(fleeceJacket.label);
      });
      await test.step('Then', async () => {
        await expect.poll(() => app.getPerceivedProducts()).toEqual(inCart(backpack, onesie));
        expect(await app.getPerceivedCartBadge()).toBe(2);
      });
    });

    test('P9 — Le catalogue reflète un retrait fait dans le panier', async ({ app }) => {
      await test.step('Given', async () => {
        await addAllToCart(app, backpack, fleeceJacket, onesie);
        await app.openCart();
        await expect.poll(() => app.getPerceivedProducts()).toEqual(inCart(backpack, fleeceJacket, onesie));
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

    test('P10 — Retirer depuis la page panier, un produit', async ({ app }) => {
      await test.step('Given', async () => {
        await app.addToCart(backpack.label);
        await app.openCart();
        await expect.poll(() => app.getPerceivedProducts()).toEqual(inCart(backpack));
      });
      await test.step('When', async () => {
        await app.removeFromCart(backpack.label);
      });
      await test.step('Then', async () => {
        await expect.poll(() => app.getPerceivedProducts()).toEqual([]);
        expect(await app.getPerceivedCartBadge()).toBeNull();
      });
    });

    test('P11 — Retirer depuis la fiche, un produit', async ({ app }) => {
      await test.step('Given', async () => {
        await app.addToCart(bikeLight.label);
        await app.openProduct(bikeLight.label);
        await expect.poll(() => app.getPerceivedButtonLabel(bikeLight.label)).toBe('Remove');
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

    test('P12 — Retirer depuis la fiche, panier plein', async ({ app }) => {
      await test.step('Given', async () => {
        await addAllToCart(app, ...catalogue);
        await expect.poll(() => app.getPerceivedCartBadge()).toBe(6);
        await app.openProduct(fleeceJacket.label);
      });
      await test.step('When', async () => {
        await app.removeFromCart(fleeceJacket.label);
      });
      await test.step('Then', async () => {
        await expect.poll(() => app.getPerceivedCartBadge()).toBe(5);
      });
    });

    test('P13 — Le panier est conservé en naviguant', async ({ app }) => {
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

    test('P14 — Le panier est conservé au rechargement', async ({ app }) => {
      await test.step('Given', async () => {
        await app.addToCart(backpack.label);
        await expect.poll(() => app.getPerceivedCartBadge()).toBe(1);
      });
      await test.step('When', async () => {
        await app.reload();
      });
      await test.step('Then', async () => {
        await expect.poll(() => app.getPerceivedPage(), { timeout: 15_000 }).toBe('Products');
        expect(await app.getPerceivedCartBadge()).toBe(1);
        expect(await app.getPerceivedButtonLabel(backpack.label)).toBe('Remove');
      });
    });

    test('P15 — Deux actions rapides : ajout puis retrait', async ({ app }) => {
      await test.step('When', async () => {
        await app.doubleClickAddToCart(backpack.label);
      });
      await test.step('Then', async () => {
        await expect.poll(() => app.getPerceivedButtonLabel(backpack.label)).toBe('Add to cart');
        expect(await app.getPerceivedCartBadge()).toBeNull();
      });
    });

    test('P16 — Réinitialisation', A_CONFIRMER, async ({ app }) => {
      await test.step('Given', async () => {
        await addAllToCart(app, backpack, onesie);
        await expect.poll(() => app.getPerceivedCartBadge()).toBe(2);
      });
      await test.step('When', async () => {
        await app.resetAppState();
      });
      await test.step('Then', async () => {
        await expect.poll(() => app.getPerceivedCartBadge()).toBeNull();
        await expect.poll(() => app.getPerceivedButtonLabel(backpack.label)).toBe('Add to cart');
        await expect.poll(() => app.getPerceivedButtonLabel(onesie.label)).toBe('Add to cart');
        await app.openCart();
        await expect.poll(() => app.getPerceivedPage()).toBe('Your Cart');
        expect(await app.getPerceivedProducts()).toEqual([]);
      });
    });

    test('P17 — Le panier survit à la déconnexion', A_CONFIRMER, async ({ app }) => {
      await test.step('Given', async () => {
        await app.addToCart(backpack.label);
        await expect.poll(() => app.getPerceivedCartBadge()).toBe(1);
      });
      await test.step('When', async () => {
        await app.logout();
        await app.login(account, PASSWORD);
      });
      await test.step('Then', async () => {
        await expect.poll(() => app.getPerceivedPage(), { timeout: 15_000 }).toBe('Products');
        expect(await app.getPerceivedCartBadge()).toBe(1);
        await app.openCart();
        await expect.poll(() => app.getPerceivedProducts()).toEqual(inCart(backpack));
      });
    });
  });
});
