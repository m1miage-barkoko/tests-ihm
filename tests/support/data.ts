import type { SauceDemo } from '../../src/dsl/SauceDemo';
import type { CustomerInfo, Product } from '../../src/dsl/types';

export const PASSWORD = 'secret_sauce';

export const backpack: Product = { label: 'Sauce Labs Backpack', price: '$29.99' };
export const bikeLight: Product = { label: 'Sauce Labs Bike Light', price: '$9.99' };
export const boltTShirt: Product = { label: 'Sauce Labs Bolt T-Shirt', price: '$15.99' };
export const fleeceJacket: Product = { label: 'Sauce Labs Fleece Jacket', price: '$49.99' };
export const onesie: Product = { label: 'Sauce Labs Onesie', price: '$7.99' };
export const redTShirt: Product = { label: 'Test.allTheThings() T-Shirt (Red)', price: '$15.99' };

export const catalogue: Product[] = [backpack, bikeLight, boltTShirt, fleeceJacket, onesie, redTShirt];

export const jeanDupont: CustomerInfo = { firstName: 'Jean', lastName: 'Dupont', postalCode: '38000' };

export const inCart = (...products: Product[]): Product[] =>
  products.map((product) => ({ ...product, quantity: 1 }));

export async function loggedInAs(app: SauceDemo, username = 'standard_user'): Promise<void> {
  await app.openLoginPage();
  await app.login(username, PASSWORD);
}

export async function addAllToCart(app: SauceDemo, ...products: Product[]): Promise<void> {
  for (const product of products) await app.addToCart(product.label);
}
