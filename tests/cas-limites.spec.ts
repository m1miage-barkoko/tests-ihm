import { test, expect } from './support/fixtures';
import {
  addAllToCart,
  backpack,
  inCart,
  jeanDupont,
  loggedInAs,
  onesie,
  PASSWORD,
} from './support/data';

test.describe('Cas limites — panier', () => {
  test.beforeEach(async ({ app }) => {
    await loggedInAs(app);
    await expect.poll(() => app.getPerceivedPage()).toBe('Products');
  });

  test.fail("S26 — Réinitialiser l'application depuis le menu", async ({ app }) => {
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

  test('S27 — Le panier est conservé après une déconnexion', async ({ app }) => {
    await test.step('Given', async () => {
      await app.addToCart(backpack.label);
      await expect.poll(() => app.getPerceivedCartBadge()).toBe(1);
    });
    await test.step('When', async () => {
      await app.logout();
      await app.login('standard_user', PASSWORD);
    });
    await test.step('Then', async () => {
      await expect.poll(() => app.getPerceivedPage()).toBe('Products');
      expect(await app.getPerceivedCartBadge()).toBe(1);
      expect(await app.getPerceivedButtonLabel(backpack.label)).toBe('Remove');
      await app.openCart();
      await expect.poll(() => app.getPerceivedProducts()).toEqual(inCart(backpack));
    });
  });

  test('S28 — Le panier est conservé après un rechargement de la page', async ({ app }) => {
    await test.step('Given', async () => {
      await app.addToCart(backpack.label);
      await expect.poll(() => app.getPerceivedCartBadge()).toBe(1);
    });
    await test.step('When', async () => {
      await app.reload();
    });
    await test.step('Then', async () => {
      await expect.poll(() => app.getPerceivedPage()).toBe('Products');
      expect(await app.getPerceivedCartBadge()).toBe(1);
      expect(await app.getPerceivedButtonLabel(backpack.label)).toBe('Remove');
    });
  });

  test('S29 — Double-cliquer sur « Add to cart »', async ({ app }) => {
    await test.step('When', async () => {
      await app.doubleClickAddToCart(backpack.label);
    });
    await test.step('Then', async () => {
      await expect.poll(() => app.getPerceivedButtonLabel(backpack.label)).toBe('Add to cart');
      expect(await app.getPerceivedCartBadge()).toBeNull();
    });
  });
});

test.describe('Cas limites — catalogue', () => {
  test.beforeEach(async ({ app }) => {
    await loggedInAs(app);
    await expect.poll(() => app.getPerceivedPage()).toBe('Products');
  });

  test("S30 — Le tri n'est pas conservé après la consultation d'une fiche", async ({ app }) => {
    await test.step('Given', async () => {
      await app.sortBy('Price (low to high)');
      expect((await app.getPerceivedProducts())[0]).toEqual(onesie);
    });
    await test.step('When', async () => {
      await app.openProduct(onesie.label);
      await app.backToProducts();
    });
    await test.step('Then', async () => {
      await expect.poll(() => app.getPerceivedPage()).toBe('Products');
      expect(await app.getPerceivedSortOption()).toBe('Name (A to Z)');
      expect((await app.getPerceivedProducts())[0]).toEqual(backpack);
    });
  });

  test("S31 — Fiche d'un produit qui n'existe pas", async ({ app }) => {
    await test.step('When', async () => {
      await app.goTo('/inventory-item.html?id=99');
    });
    await test.step('Then', async () => {
      await expect.poll(async () => (await app.getPerceivedProductDetails()).label).toBe(
        'ITEM NOT FOUND',
      );
    });
  });
});

test.describe('Cas limites — connexion', () => {
  test("S32 — Nom d'utilisateur avec une espace ou une majuscule (erreur)", async ({ app }) => {
    for (const username of [' standard_user', 'standard_user ', 'Standard_user', 'STANDARD_USER']) {
      await test.step(`Given / When : « ${username} »`, async () => {
        await app.openLoginPage();
        await app.login(username, PASSWORD);
      });
      await test.step(`Then : « ${username} »`, async () => {
        await expect.poll(() => app.getPerceivedErrorMessage()).toBe(
          'Epic sadface: Username and password do not match any user in this service',
        );
        expect(await app.getPerceivedPage()).toBe('Login');
      });
    }
  });

  test("S33 — Fermer le message d'erreur de connexion", async ({ app }) => {
    await test.step('Given', async () => {
      await app.openLoginPage();
      await app.login('', '');
      await expect.poll(() => app.getPerceivedErrorMessage()).toBe(
        'Epic sadface: Username is required',
      );
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

  test('S34 — Accès aux autres pages sans être connecté (erreur)', async ({ app }) => {
    const pages = [
      { path: '/cart.html', protectedPage: '/cart.html' },
      { path: '/checkout-step-one.html', protectedPage: '/checkout-step-one.html' },
      { path: '/checkout-step-two.html', protectedPage: '/checkout-step-two.html' },
      { path: '/checkout-complete.html', protectedPage: '/checkout-complete.html' },
      { path: '/inventory-item.html?id=4', protectedPage: '/inventory-item.html' },
    ];
    for (const { path, protectedPage } of pages) {
      await test.step(`When : ${path}`, async () => {
        await app.goTo(path);
      });
      await test.step(`Then : ${path}`, async () => {
        await expect.poll(() => app.getPerceivedErrorMessage()).toBe(
          `Epic sadface: You can only access '${protectedPage}' when you are logged in.`,
        );
        expect(await app.getPerceivedPage()).toBe('Login');
      });
    }
  });
});

test.describe('Cas limites — commande', () => {
  test.beforeEach(async ({ app }) => {
    await loggedInAs(app);
    await app.addToCart(backpack.label);
    await app.openCart();
    await app.checkout();
    await expect.poll(() => app.getPerceivedPage()).toBe('Checkout: Your Information');
  });

  test.fail('S35 — Formulaire rempli seulement avec des espaces (erreur)', async ({ app }) => {
    await test.step('When', async () => {
      await app.fillCustomerInfo({ ...jeanDupont, firstName: '   ' });
      await app.continueCheckout();
    });
    await test.step('Then', async () => {
      await expect.poll(() => app.getPerceivedErrorMessage()).toBe(
        'Error: First Name is required',
      );
      expect(await app.getPerceivedPage()).toBe('Checkout: Your Information');
    });
  });

  test('S36 — Code postal avec des lettres', async ({ app }) => {
    await test.step('When', async () => {
      await app.fillCustomerInfo({ ...jeanDupont, postalCode: 'abc' });
      await app.continueCheckout();
    });
    await test.step('Then', async () => {
      await expect.poll(() => app.getPerceivedPage()).toBe('Checkout: Overview');
    });
  });

  test.fixme('S37 — Revenir en arrière après avoir validé une commande (cas limite)', async ({ app }) => {
    await test.step('Given', async () => {
      await app.fillCustomerInfo(jeanDupont);
      await app.continueCheckout();
      await app.finishCheckout();
      await expect.poll(() => app.getPerceivedOrderConfirmation()).toBe('Thank you for your order!');
    });
    await test.step('When', async () => {
      await app.goBack();
    });
    await test.step('Then', async () => {
      await expect.poll(() => app.getPerceivedPage()).toBe('Checkout: Overview');
      expect(await app.getPerceivedProducts()).toEqual([]);
      expect((await app.getPerceivedTotals()).total).toBe('$0.00');
    });
  });
});
