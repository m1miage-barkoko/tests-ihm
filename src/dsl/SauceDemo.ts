import type { Locator, Page } from '@playwright/test';
import type {
  ButtonLabel,
  CustomerInfo,
  PageName,
  Product,
  ProductDetails,
  SortOption,
  Totals,
} from './types';

const TITLED_PAGES: PageName[] = [
  'Products',
  'Your Cart',
  'Checkout: Your Information',
  'Checkout: Overview',
  'Checkout: Complete!',
];

const exactly = (text: string): RegExp =>
  new RegExp(`^${text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`);

export class SauceDemo {
  private readonly alerts: string[] = [];

  constructor(private readonly page: Page) {
    page.on('dialog', async (dialog) => {
      this.alerts.push(dialog.message());
      await dialog.dismiss();
    });
  }

  async goTo(path: string): Promise<void> {
    await this.page.goto(path);
  }

  async reload(): Promise<void> {
    await this.page.reload();
  }

  async getPerceivedPage(): Promise<PageName | null> {
    if (await this.page.getByRole('button', { name: 'Login' }).isVisible()) return 'Login';
    if (await this.page.getByRole('button', { name: 'Back to products' }).isVisible()) {
      return 'Product details';
    }
    // allInnerTexts n'attend pas l'élément : si la page change pendant la lecture, on obtient
    // une liste vide au lieu de bloquer expect.poll jusqu'à son délai.
    const [text] = await this.page.getByTestId('title').allInnerTexts();
    return TITLED_PAGES.find((name) => name === text?.trim()) ?? null;
  }

  async getPerceivedErrorMessage(): Promise<string | null> {
    const [text] = await this.page.getByTestId('error').allInnerTexts();
    return text === undefined ? null : text.trim();
  }

  async getPerceivedAlerts(): Promise<string[]> {
    return [...this.alerts];
  }

  async openLoginPage(): Promise<void> {
    await this.page.goto('/');
  }

  async login(username: string, password: string): Promise<void> {
    await this.page.getByPlaceholder('Username').fill(username);
    await this.page.getByPlaceholder('Password').fill(password);
    await this.page.getByRole('button', { name: 'Login' }).click();
  }

  async closeErrorMessage(): Promise<void> {
    await this.page.getByTestId('error-button').click();
  }

  async getPerceivedFieldsInError(): Promise<string[]> {
    return this.page
      .locator('input.error')
      .evaluateAll((inputs) => inputs.map((input) => (input as HTMLInputElement).placeholder));
  }

  async sortBy(option: SortOption): Promise<void> {
    await this.page.getByTestId('product-sort-container').selectOption({ label: option });
  }

  async openProduct(productLabel: string): Promise<void> {
    await this.page.getByTestId('inventory-item-name').filter({ hasText: exactly(productLabel) }).click();
  }

  async backToProducts(): Promise<void> {
    await this.page.getByRole('button', { name: 'Back to products' }).click();
  }

  async getPerceivedProducts(): Promise<Product[]> {
    // Lecture en une seule fois : lue produit par produit, la liste peut changer de page en
    // cours de lecture et bloquer expect.poll au-delà de son délai.
    return this.page.getByTestId('inventory-item').evaluateAll((items) =>
      items.map((item) => {
        const text = (testId: string): string =>
          item.querySelector(`[data-test="${testId}"]`)?.textContent?.trim() ?? '';
        const product: Product = { label: text('inventory-item-name'), price: text('inventory-item-price') };
        const quantity = item.querySelector('[data-test="item-quantity"]');
        if (quantity) product.quantity = Number(quantity.textContent);
        return product;
      }),
    );
  }

  async getPerceivedSortOption(): Promise<SortOption> {
    return (await this.page.getByTestId('active-option').innerText()).trim() as SortOption;
  }

  async getPerceivedProductDetails(): Promise<ProductDetails> {
    const item = this.page.getByTestId('inventory-item');
    const description = item.getByTestId('inventory-item-desc');
    return {
      label: (await item.getByTestId('inventory-item-name').innerText()).trim(),
      price: (await item.getByTestId('inventory-item-price').innerText()).trim(),
      description: (await description.count()) > 0 ? (await description.innerText()).trim() : null,
    };
  }

  async addToCart(productLabel: string): Promise<void> {
    await this.productButton(productLabel, 'Add to cart').click();
  }

  async removeFromCart(productLabel: string): Promise<void> {
    await this.productButton(productLabel, 'Remove').click();
  }

  async doubleClickAddToCart(productLabel: string): Promise<void> {
    await this.productButton(productLabel, 'Add to cart').dblclick();
  }

  async openCart(): Promise<void> {
    await this.page.getByTestId('shopping-cart-link').click();
  }

  async continueShopping(): Promise<void> {
    await this.page.getByRole('button', { name: 'Continue Shopping' }).click();
  }

  async resetAppState(): Promise<void> {
    await this.openMenu();
    await this.page.getByText('Reset App State', { exact: true }).click();
    await this.page.getByRole('button', { name: 'Close Menu' }).click();
  }

  async getPerceivedCartBadge(): Promise<number | null> {
    const [text] = await this.page.getByTestId('shopping-cart-badge').allInnerTexts();
    return text === undefined ? null : Number(text);
  }

  async getPerceivedButtonLabel(productLabel: string): Promise<ButtonLabel> {
    const button = this.product(productLabel).getByRole('button', { name: /^(Add to cart|Remove)$/ });
    return (await button.innerText()).trim() as ButtonLabel;
  }

  async checkout(): Promise<void> {
    await this.page.getByRole('button', { name: 'Checkout' }).click();
  }

  async fillCustomerInfo(info: CustomerInfo): Promise<void> {
    await this.page.getByPlaceholder('First Name').fill(info.firstName);
    await this.page.getByPlaceholder('Last Name').fill(info.lastName);
    await this.page.getByPlaceholder('Zip/Postal Code').fill(info.postalCode);
  }

  async continueCheckout(): Promise<void> {
    await this.page.getByRole('button', { name: 'Continue', exact: true }).click();
  }

  async cancelCheckout(): Promise<void> {
    await this.page.getByRole('button', { name: 'Cancel' }).click();
  }

  async finishCheckout(): Promise<void> {
    await this.page.getByRole('button', { name: 'Finish' }).click();
  }

  async backHome(): Promise<void> {
    await this.page.getByRole('button', { name: 'Back Home' }).click();
  }

  async getPerceivedTotals(): Promise<Totals> {
    return {
      itemTotal: await this.amount('subtotal-label'),
      tax: await this.amount('tax-label'),
      total: await this.amount('total-label'),
    };
  }

  async getPerceivedOrderConfirmation(): Promise<string> {
    return (await this.page.getByTestId('complete-header').innerText()).trim();
  }

  async logout(): Promise<void> {
    await this.openMenu();
    await this.page.getByText('Logout', { exact: true }).click();
  }

  private async openMenu(): Promise<void> {
    await this.page.getByRole('button', { name: 'Open Menu' }).click();
  }

  private product(productLabel: string): Locator {
    return this.page.getByTestId('inventory-item').filter({
      has: this.page.getByTestId('inventory-item-name').filter({ hasText: exactly(productLabel) }),
    });
  }

  private productButton(productLabel: string, label: ButtonLabel): Locator {
    return this.product(productLabel).getByRole('button', { name: label, exact: true });
  }

  private async amount(testId: string): Promise<string> {
    const text = await this.page.getByTestId(testId).innerText();
    return text.replace(/^[^:]*:\s*/, '').trim();
  }
}
