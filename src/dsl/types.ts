export type Product = { label: string; price: string; quantity?: number };

export type ProductDetails = { label: string; price: string; description: string };

export type CustomerInfo = { firstName: string; lastName: string; postalCode: string };

export type Totals = { itemTotal: string; tax: string; total: string };

export type SortOption =
  | 'Name (A to Z)'
  | 'Name (Z to A)'
  | 'Price (low to high)'
  | 'Price (high to low)';

export type ButtonLabel = 'Add to cart' | 'Remove';

export type PageName =
  | 'Login'
  | 'Products'
  | 'Product details'
  | 'Your Cart'
  | 'Checkout: Your Information'
  | 'Checkout: Overview'
  | 'Checkout: Complete!';
