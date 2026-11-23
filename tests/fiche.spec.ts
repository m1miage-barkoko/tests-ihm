import { test, expect } from './support/fixtures';
import { forEachAccount } from './support/accounts';
import { backpack, bikeLight, fleeceJacket } from './support/data';
import type { Product } from '../src/dsl/types';

test.describe('F : consulter une fiche produit', () => {
  forEachAccount(() => {
    test('F1 — Ouvrir une fiche depuis le catalogue', async ({ app }) => {
      await test.step('When', async () => {
        await app.openProduct(backpack.label);
      });
      await test.step('Then', async () => {
        await expect.poll(() => app.getPerceivedPage()).toBe('Product details');
        const details = await app.getPerceivedProductDetails();
        expect({ label: details.label, price: details.price }).toEqual(backpack);
        expect(details.description).toEqual(
          expect.stringMatching(/^carry\.allTheThings\(\) with the sleek, streamlined Sly Pack/),
        );
      });
      await test.step('When', async () => {
        await app.backToProducts();
      });
      await test.step('Then', async () => {
        await expect.poll(() => app.getPerceivedPage()).toBe('Products');
      });
    });

    const validIds: { id: string; title: string; productId: number; product: Product }[] = [
      { id: 'F2', title: 'Limite basse (id=0)', productId: 0, product: bikeLight },
      { id: 'F3', title: 'Limite haute (id=5)', productId: 5, product: fleeceJacket },
    ];

    for (const { id, title, productId, product } of validIds) {
      test(`${id} — ${title}`, async ({ app }) => {
        await test.step('When', async () => {
          await app.goTo(`/inventory-item.html?id=${productId}`);
        });
        await test.step('Then', async () => {
          await expect.poll(() => app.getPerceivedPage()).toBe('Product details');
          const details = await app.getPerceivedProductDetails();
          expect({ label: details.label, price: details.price }).toEqual(product);
        });
      });
    }

    const invalidIds = [
      { id: 'F4', title: 'Juste après la limite haute (id=6)', productId: '6' },
      { id: 'F5', title: 'Juste avant la limite basse (id=-1)', productId: '-1' },
      { id: 'F6', title: 'Valeur non numérique (id=abc)', productId: 'abc' },
      { id: 'F7', title: 'Valeur franchement hors limite (id=99)', productId: '99' },
    ];

    for (const { id, title, productId } of invalidIds) {
      test(`${id} — ${title}`, async ({ app }) => {
        await test.step('When', async () => {
          await app.goTo(`/inventory-item.html?id=${productId}`);
        });
        await test.step('Then', async () => {
          await expect.poll(() => app.getPerceivedPage()).toBe('Product details');
          expect((await app.getPerceivedProductDetails()).label).toBe('ITEM NOT FOUND');
        });
      });
    }
  });
});
