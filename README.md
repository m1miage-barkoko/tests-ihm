# Tests IHM — tests end-to-end de SauceDemo avec Playwright

TP du cours d'IHM (M1 MIAGE) : vérification de la dynamique d'une interface par des tests
end-to-end en boîte noire, écrits avec un DSL de test et interprétés avec Playwright.

Système testé : <https://www.saucedemo.com>

## Auteurs (binôme)

- BARKOK Omar
- Mohamed-Amine JAANANE

## Stratégie

_À compléter : stratégie de production des cas de test._

## Scénarios et cas de test

Chaque scénario est écrit au format Given / When / Then (état initial / action de
l'utilisateur / résultat attendu).

_À compléter : correspondance de chaque scénario avec son test TypeScript._

### Tâche : gérer les articles du panier

#### S1 — Ajouter un produit au panier

- **Given** : l'utilisateur s'est identifié et voit la page du catalogue des produits.
- **When** : il ajoute un produit au panier.
- **Then** : le produit est ajouté au panier.

#### S2 — Ajouter trois produits au panier

- **Given** : l'utilisateur s'est identifié et voit la page du catalogue des produits.
- **When** : il ajoute les produits « Sauce Labs Backpack », « Sauce Labs Fleece Jacket » et
  « Sauce Labs Onesie ».
- **Then** : les produits « Sauce Labs Backpack », « Sauce Labs Fleece Jacket » et
  « Sauce Labs Onesie » sont dans le panier et le prix est de $95.01.

#### S3 — Retirer un produit du panier

- **Given** : l'utilisateur s'est identifié et voit le contenu du panier avec 3 produits
  (A, B, C) : « Sauce Labs Backpack », « Sauce Labs Fleece Jacket » et « Sauce Labs Onesie ».
  Le prix est de $95.01.
- **When** : il retire B, « Sauce Labs Fleece Jacket », du panier.
- **Then** : le panier ne contient plus que A et C, « Sauce Labs Backpack » et
  « Sauce Labs Onesie ». Le prix est de $41.02.

## DSL de test

_À compléter : correspondance avec les tâches et concepts, stratégie d'implémentation avec
Playwright._

### Tâche : gérer les articles du panier

Actions :

- `addToCart(productLabel: string): Promise<void>`
- `removeFromCart(productLabel: string): Promise<void>`

Perceptions :

- `getPerceivedProducts(): Promise<Product[]>`

## Outillage et usage de l'IA

_À compléter : outils utilisés, prompts donnés aux LLM, utilisation d'agents._
