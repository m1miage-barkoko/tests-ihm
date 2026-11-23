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

### Données de test

Comptes utilisés (le mot de passe est affiché sur la page de connexion du site) :

| Nom d'utilisateur | Mot de passe | Comportement |
|---|---|---|
| `standard_user` | `secret_sauce` | compte normal, utilisé par défaut |
| `locked_out_user` | `secret_sauce` | compte bloqué |

Catalogue de `standard_user` :

| Produit | Prix |
|---|---|
| Sauce Labs Backpack | $29.99 |
| Sauce Labs Bike Light | $9.99 |
| Sauce Labs Bolt T-Shirt | $15.99 |
| Sauce Labs Fleece Jacket | $49.99 |
| Sauce Labs Onesie | $7.99 |
| Test.allTheThings() T-Shirt (Red) | $15.99 |

La page panier affiche chaque produit avec sa quantité et son prix, sans total. Les totaux
n'apparaissent qu'au récapitulatif « Checkout: Overview » : « Item total », « Tax » (8 % du
total des articles, arrondie au centime) et « Total ».

### Tâche : se connecter

#### S4 — Connexion réussie

- **Given** : l'utilisateur voit la page de connexion.
- **When** : il saisit `standard_user` et `secret_sauce`, puis clique sur « Login ».
- **Then** : il voit la page « Products » avec 6 produits, le premier est
  « Sauce Labs Backpack » ($29.99) et le panier n'a pas de pastille.

#### S5 — Connexion sans nom d'utilisateur (erreur)

- **Given** : l'utilisateur voit la page de connexion.
- **When** : il laisse le nom d'utilisateur vide, saisit `secret_sauce` et clique sur « Login ».
- **Then** : il reste sur la page de connexion avec le message
  « Epic sadface: Username is required ».

#### S6 — Connexion sans mot de passe (erreur)

- **Given** : l'utilisateur voit la page de connexion.
- **When** : il saisit `standard_user`, laisse le mot de passe vide et clique sur « Login ».
- **Then** : il reste sur la page de connexion avec le message
  « Epic sadface: Password is required ».

#### S7 — Connexion avec un mauvais mot de passe (erreur)

- **Given** : l'utilisateur voit la page de connexion.
- **When** : il saisit `standard_user` et `mauvais_mdp`, puis clique sur « Login ».
- **Then** : il reste sur la page de connexion avec le message
  « Epic sadface: Username and password do not match any user in this service ».

#### S8 — Connexion d'un utilisateur bloqué (erreur)

- **Given** : l'utilisateur voit la page de connexion.
- **When** : il saisit `locked_out_user` et `secret_sauce`, puis clique sur « Login ».
- **Then** : il reste sur la page de connexion avec le message
  « Epic sadface: Sorry, this user has been locked out. ».

#### S9 — Accès au catalogue sans être connecté (erreur)

- **Given** : l'utilisateur n'est pas connecté.
- **When** : il ouvre directement l'adresse `https://www.saucedemo.com/inventory.html`.
- **Then** : il est renvoyé sur la page de connexion avec le message
  « Epic sadface: You can only access '/inventory.html' when you are logged in. ».

### Tâche : consulter le catalogue

#### S10 — Trier les produits par prix croissant

- **Given** : l'utilisateur s'est identifié avec `standard_user` et voit la page « Products ».
- **When** : il choisit le tri « Price (low to high) ».
- **Then** : les prix s'affichent dans l'ordre $7.99, $9.99, $15.99, $15.99, $29.99, $49.99.
  Le premier produit est « Sauce Labs Onesie » ($7.99) et le dernier « Sauce Labs Fleece Jacket » ($49.99).

#### S11 — Trier les produits par nom de Z à A

- **Given** : l'utilisateur s'est identifié avec `standard_user` et voit la page « Products ».
- **When** : il choisit le tri « Name (Z to A) ».
- **Then** : les produits s'affichent dans l'ordre « Test.allTheThings() T-Shirt (Red) » ($15.99),
  « Sauce Labs Onesie » ($7.99), « Sauce Labs Fleece Jacket » ($49.99), « Sauce Labs Bolt T-Shirt » ($15.99),
  « Sauce Labs Bike Light » ($9.99), « Sauce Labs Backpack » ($29.99).

#### S12 — Consulter le détail d'un produit

- **Given** : l'utilisateur s'est identifié avec `standard_user` et voit la page « Products ».
- **When** : il clique sur le nom « Sauce Labs Backpack » ($29.99), puis sur « Back to products ».
- **Then** : il voit d'abord la fiche « Sauce Labs Backpack » ($29.99), avec une
  description qui commence par « carry.allTheThings() with the sleek, streamlined Sly Pack »,
  puis il revient sur la page « Products ».

### Tâche : gérer les articles du panier

#### S1 — Ajouter un produit au panier

- **Given** : l'utilisateur s'est identifié avec `standard_user`, voit la page « Products » et
  son panier est vide.
- **When** : il clique sur « Add to cart » sous « Sauce Labs Backpack » ($29.99).
- **Then** : la pastille du panier indique 1, le bouton sous « Sauce Labs Backpack » ($29.99) devient
  « Remove », et le panier contient « Sauce Labs Backpack » ($29.99) en quantité 1.

#### S2 — Ajouter trois produits au panier

- **Given** : l'utilisateur s'est identifié avec `standard_user`, voit la page « Products » et
  son panier est vide.
- **When** : il ajoute « Sauce Labs Backpack » ($29.99), « Sauce Labs Fleece Jacket » ($49.99) et
  « Sauce Labs Onesie » ($7.99).
- **Then** : la pastille du panier indique 3 et le panier contient « Sauce Labs Backpack »
  ($29.99), « Sauce Labs Fleece Jacket » ($49.99) et « Sauce Labs Onesie » ($7.99).

#### S3 — Retirer un produit du panier

- **Given** : l'utilisateur s'est identifié avec `standard_user` et voit son panier avec
  3 produits (A, B, C) : « Sauce Labs Backpack » ($29.99), « Sauce Labs Fleece Jacket » ($49.99) et
  « Sauce Labs Onesie » ($7.99).
- **When** : il clique sur « Remove » pour B, « Sauce Labs Fleece Jacket » ($49.99).
- **Then** : le panier ne contient plus que A et C, « Sauce Labs Backpack » ($29.99) et
  « Sauce Labs Onesie » ($7.99), et la pastille indique 2.

#### S13 — Ajouter un produit depuis sa fiche

- **Given** : l'utilisateur s'est identifié avec `standard_user`, voit la fiche
  « Sauce Labs Bike Light » ($9.99) et son panier est vide.
- **When** : il clique sur « Add to cart ».
- **Then** : la pastille du panier indique 1 et le bouton de la fiche devient « Remove ».

#### S14 — Retirer un produit depuis le catalogue

- **Given** : l'utilisateur s'est identifié avec `standard_user`, voit la page « Products » et
  son panier contient seulement « Sauce Labs Backpack » ($29.99). La pastille indique 1.
- **When** : il clique sur « Remove » sous « Sauce Labs Backpack » ($29.99).
- **Then** : la pastille du panier disparaît et le bouton redevient « Add to cart ».

#### S15 — Revenir au catalogue depuis le panier

- **Given** : l'utilisateur s'est identifié avec `standard_user` et voit son panier qui
  contient seulement « Sauce Labs Backpack » ($29.99).
- **When** : il clique sur « Continue Shopping ».
- **Then** : il voit la page « Products », la pastille du panier indique 1 et le bouton sous
  « Sauce Labs Backpack » ($29.99) affiche « Remove ».

### Tâche : passer une commande

Le formulaire « Checkout: Your Information » est rempli avec First Name `Jean`, Last Name
`Dupont` et Zip/Postal Code `38000`, sauf quand un scénario dit le contraire.

#### S16 — Commande complète de trois produits

- **Given** : l'utilisateur s'est identifié avec `standard_user` et son panier contient
  « Sauce Labs Backpack » ($29.99), « Sauce Labs Fleece Jacket » ($49.99) et « Sauce Labs Onesie » ($7.99).
- **When** : il clique sur « Checkout », remplit le formulaire, clique sur « Continue », puis
  sur « Finish ».
- **Then** : le récapitulatif « Checkout: Overview » affiche « Item total: $87.97 »,
  « Tax: $7.04 » et « Total: $95.01 ». Après « Finish », il voit « Checkout: Complete! » avec
  « Thank you for your order! » et le panier n'a plus de pastille.

#### S17 — Commande sans prénom (erreur)

- **Given** : l'utilisateur s'est identifié avec `standard_user`, son panier contient
  « Sauce Labs Backpack » ($29.99) et il voit le formulaire « Checkout: Your Information ».
- **When** : il laisse First Name vide, saisit `Dupont` et `38000`, puis clique sur
  « Continue ».
- **Then** : il reste sur le formulaire avec le message « Error: First Name is required ».

#### S18 — Commande sans nom (erreur)

- **Given** : comme S17.
- **When** : il saisit `Jean`, laisse Last Name vide, saisit `38000`, puis clique sur
  « Continue ».
- **Then** : il reste sur le formulaire avec le message « Error: Last Name is required ».

#### S19 — Commande sans code postal (erreur)

- **Given** : comme S17.
- **When** : il saisit `Jean` et `Dupont`, laisse Zip/Postal Code vide, puis clique sur
  « Continue ».
- **Then** : il reste sur le formulaire avec le message « Error: Postal Code is required ».

#### S20 — Annuler la commande au récapitulatif

- **Given** : l'utilisateur s'est identifié avec `standard_user`, son panier contient
  « Sauce Labs Backpack » ($29.99) et « Sauce Labs Onesie » ($7.99), il a rempli le formulaire et voit
  « Checkout: Overview » avec « Item total: $37.98 », « Tax: $3.04 » et « Total: $41.02 ».
- **When** : il clique sur « Cancel ».
- **Then** : il revient sur la page « Products », la pastille du panier indique 2 et le panier
  contient toujours « Sauce Labs Backpack » ($29.99) et « Sauce Labs Onesie » ($7.99).

#### S21 — Commande avec un panier vide (cas limite)

- **Given** : l'utilisateur s'est identifié avec `standard_user` et son panier est vide.
- **When** : il ouvre le panier, clique sur « Checkout », remplit le formulaire et clique sur
  « Continue ».
- **Then** : à décider. Le site affiche aujourd'hui « Item total: $0 », « Tax: $0.00 » et
  « Total: $0.00 » et laisse cliquer sur « Finish ». Il faut choisir si le test attend ce
  comportement ou un refus.

### Tâche : se déconnecter

#### S22 — Déconnexion

- **Given** : l'utilisateur s'est identifié avec `standard_user` et voit la page « Products ».
- **When** : il ouvre le menu, clique sur « Logout », puis ouvre l'adresse
  `https://www.saucedemo.com/inventory.html`.
- **Then** : il voit la page de connexion, puis le message
  « Epic sadface: You can only access '/inventory.html' when you are logged in. ».

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
