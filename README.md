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

Chaque scénario a un test TypeScript qui porte le même numéro et le même titre, par exemple
`test('S1 — Ajouter un produit au panier', ...)`. Dans chaque test, les étapes `Given`,
`When` et `Then` sont des `test.step`, visibles dans le rapport de Playwright.

| Scénarios | Fichier de test |
|---|---|
| S4–S9 | [tests/connexion.spec.ts](tests/connexion.spec.ts) |
| S10–S12 | [tests/catalogue.spec.ts](tests/catalogue.spec.ts) |
| S1–S3, S13–S15, S23–S25 | [tests/panier.spec.ts](tests/panier.spec.ts) |
| S16–S21 | [tests/commande.spec.ts](tests/commande.spec.ts) |
| S22 | [tests/deconnexion.spec.ts](tests/deconnexion.spec.ts) |
| S26–S37 | [tests/cas-limites.spec.ts](tests/cas-limites.spec.ts) |
| S38–S43 | [tests/comptes-defectueux.spec.ts](tests/comptes-defectueux.spec.ts) |

Deux marquages de Playwright traduisent les cas particuliers :

- `test.fail` pour les scénarios avec une ligne **Observé** (S26, S35, S38 à S43) : le test
  vérifie le comportement correct, échoue à cause du défaut du site, et Playwright compte cet
  échec comme attendu. Si le défaut est un jour corrigé, Playwright le signale.
- `test.fixme` pour les scénarios « à décider » (S21, S37) : le test est écrit avec le
  comportement actuel du site, mais il n'est pas lancé tant que la décision n'est pas prise.

### Lancer les tests

```sh
npm install
npm test
npm run test:report
```

Pour voir le navigateur pendant les tests :

- `npm run test:headed` ouvre Chrome et lance les tests un par un à l'écran ;
- `npm run test:ui` ouvre l'interface de Playwright, où l'on choisit les tests à lancer et
  où l'on revoit chaque étape.

Les tests utilisent le navigateur Google Chrome installé sur le poste (`channel: 'chrome'`).

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

#### S23 — Retirer un produit depuis le catalogue quand le panier en contient trois

- **Given** : l'utilisateur s'est identifié avec `standard_user`, voit la page « Products » et
  son panier contient 3 produits (A, B, C) : « Sauce Labs Backpack » ($29.99),
  « Sauce Labs Fleece Jacket » ($49.99) et « Sauce Labs Onesie » ($7.99). La pastille indique 3.
- **When** : il clique sur « Remove » sous B, « Sauce Labs Fleece Jacket » ($49.99), puis ouvre
  le panier.
- **Then** : sur la page « Products », la pastille indique 2, le bouton sous B redevient
  « Add to cart » et les boutons sous A et C affichent toujours « Remove ». Le panier ne
  contient plus que A et C, « Sauce Labs Backpack » ($29.99) et « Sauce Labs Onesie » ($7.99).

#### S24 — Retirer un produit du panier puis revenir au catalogue

- **Given** : l'utilisateur s'est identifié avec `standard_user` et voit son panier avec
  3 produits (A, B, C) : « Sauce Labs Backpack » ($29.99), « Sauce Labs Fleece Jacket » ($49.99) et
  « Sauce Labs Onesie » ($7.99).
- **When** : il clique sur « Remove » pour B, « Sauce Labs Fleece Jacket » ($49.99), puis sur
  « Continue Shopping ».
- **Then** : il voit la page « Products », la pastille indique 2, le bouton sous B affiche
  « Add to cart » et les boutons sous A et C affichent « Remove ».

#### S25 — Retirer un produit depuis sa fiche

- **Given** : l'utilisateur s'est identifié avec `standard_user`, voit la fiche
  « Sauce Labs Bike Light » ($9.99) et son panier contient seulement ce produit. La pastille
  indique 1 et le bouton de la fiche affiche « Remove ».
- **When** : il clique sur « Remove ».
- **Then** : la pastille du panier disparaît, le bouton de la fiche redevient « Add to cart »
  et le panier est vide.

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

### Cas limites

Quand le site ne fait pas ce qui est attendu, la ligne **Observé** décrit son comportement
actuel : le test doit alors échouer, ce qui montre qu'il détecte le défaut.

#### Panier

##### S26 — Réinitialiser l'application depuis le menu

- **Given** : l'utilisateur s'est identifié avec `standard_user`, voit la page « Products » et
  son panier contient « Sauce Labs Backpack » ($29.99) et « Sauce Labs Onesie » ($7.99). La
  pastille indique 2.
- **When** : il ouvre le menu et clique sur « Reset App State ».
- **Then** : la pastille du panier disparaît, les boutons sous « Sauce Labs Backpack » et
  « Sauce Labs Onesie » redeviennent « Add to cart » et le panier est vide.
- **Observé** : la pastille disparaît et le panier est vide, mais les deux boutons affichent
  toujours « Remove ». Ils ne redeviennent « Add to cart » qu'après un rechargement de la page.

##### S27 — Le panier est conservé après une déconnexion

- **Given** : l'utilisateur s'est identifié avec `standard_user` et son panier contient
  seulement « Sauce Labs Backpack » ($29.99).
- **When** : il ouvre le menu, clique sur « Logout », puis se reconnecte avec `standard_user`
  et `secret_sauce`.
- **Then** : la pastille du panier indique 1, le bouton sous « Sauce Labs Backpack » affiche
  « Remove » et le panier contient toujours « Sauce Labs Backpack » ($29.99).

##### S28 — Le panier est conservé après un rechargement de la page

- **Given** : l'utilisateur s'est identifié avec `standard_user`, voit la page « Products » et
  son panier contient seulement « Sauce Labs Backpack » ($29.99).
- **When** : il recharge la page.
- **Then** : il reste sur la page « Products », la pastille indique 1 et le bouton sous
  « Sauce Labs Backpack » affiche « Remove ».

##### S29 — Double-cliquer sur « Add to cart »

- **Given** : l'utilisateur s'est identifié avec `standard_user`, voit la page « Products » et
  son panier est vide.
- **When** : il double-clique sur « Add to cart » sous « Sauce Labs Backpack » ($29.99).
- **Then** : le premier clic ajoute le produit et le second le retire : le bouton affiche
  « Add to cart » et le panier n'a pas de pastille.

#### Catalogue

##### S30 — Le tri n'est pas conservé après la consultation d'une fiche

- **Given** : l'utilisateur s'est identifié avec `standard_user`, voit la page « Products » et
  a choisi le tri « Price (low to high) ». Le premier produit est « Sauce Labs Onesie » ($7.99).
- **When** : il clique sur « Sauce Labs Onesie », puis sur « Back to products ».
- **Then** : le tri affiché est revenu à « Name (A to Z) » et le premier produit est
  « Sauce Labs Backpack » ($29.99).

##### S31 — Fiche d'un produit qui n'existe pas

- **Given** : l'utilisateur s'est identifié avec `standard_user`.
- **When** : il ouvre directement l'adresse `https://www.saucedemo.com/inventory-item.html?id=99`.
- **Then** : la fiche affiche le titre « ITEM NOT FOUND ».
- **Observé** : la fiche affiche aussi un prix « $√-1 » et un faux message de répondeur
  téléphonique comme description. Le même affichage apparaît avec `id=abc` et `id=-1`.

#### Connexion

##### S32 — Nom d'utilisateur avec une espace ou une majuscule (erreur)

- **Given** : l'utilisateur voit la page de connexion.
- **When** : il saisit ` standard_user` (avec une espace au début) et `secret_sauce`, puis
  clique sur « Login ». Même chose avec `standard_user ` (espace à la fin), `Standard_user` et
  `STANDARD_USER`.
- **Then** : à chaque fois, il reste sur la page de connexion avec le message
  « Epic sadface: Username and password do not match any user in this service ».

##### S33 — Fermer le message d'erreur de connexion

- **Given** : l'utilisateur a cliqué sur « Login » sans rien saisir et voit le message
  « Epic sadface: Username is required », avec une icône rouge dans chacun des deux champs.
- **When** : il clique sur la croix du message.
- **Then** : le message et les deux icônes rouges disparaissent.

##### S34 — Accès aux autres pages sans être connecté (erreur)

- **Given** : l'utilisateur n'est pas connecté.
- **When** : il ouvre directement l'adresse `https://www.saucedemo.com/cart.html`.
- **Then** : il voit la page de connexion avec le message
  « Epic sadface: You can only access '/cart.html' when you are logged in. ». Le même message,
  avec le nom de la page, apparaît pour `checkout-step-one.html`, `checkout-step-two.html`,
  `checkout-complete.html` et `inventory-item.html?id=4` (message « '/inventory-item.html' »).

#### Commande

##### S35 — Formulaire rempli seulement avec des espaces (erreur)

- **Given** : l'utilisateur s'est identifié avec `standard_user`, son panier contient
  « Sauce Labs Backpack » ($29.99) et il voit le formulaire « Checkout: Your Information ».
- **When** : il saisit trois espaces dans First Name, `Dupont` et `38000`, puis clique sur
  « Continue ».
- **Then** : il reste sur le formulaire avec le message « Error: First Name is required ».
- **Observé** : le site accepte et affiche « Checkout: Overview ». Il accepte même trois espaces
  dans les trois champs.

##### S36 — Code postal avec des lettres

- **Given** : comme S35.
- **When** : il saisit `Jean`, `Dupont` et `abc`, puis clique sur « Continue ».
- **Then** : il voit « Checkout: Overview ». Le site ne vérifie pas le format du code postal,
  ce qui est normal puisque certains pays utilisent des lettres.

##### S37 — Revenir en arrière après avoir validé une commande (cas limite)

- **Given** : l'utilisateur s'est identifié avec `standard_user`, a commandé
  « Sauce Labs Backpack » ($29.99) et voit « Checkout: Complete! » avec
  « Thank you for your order! ».
- **When** : il clique sur le bouton « Retour » du navigateur.
- **Then** : à décider. Le site affiche aujourd'hui « Checkout: Overview » sans aucun produit,
  avec « Total: $0.00 ». Un nouveau clic sur « Finish » affiche de nouveau
  « Thank you for your order! », ce qui valide une deuxième commande vide. Comme pour S21, il
  faut choisir si le test attend ce comportement ou un refus.

#### Comptes défectueux

La page de connexion propose aussi des comptes faits exprès pour avoir des défauts. On relance
des scénarios déjà écrits avec ces comptes : chaque test doit échouer.

##### S38 — `problem_user` ajoute les six produits

- **Given** : l'utilisateur s'est identifié avec `problem_user`, voit la page « Products » et
  son panier est vide.
- **When** : il clique sur « Add to cart » sous chacun des six produits, dans l'ordre du
  catalogue.
- **Then** : la pastille indique 6 et les six boutons affichent « Remove ».
- **Observé** : seuls « Sauce Labs Backpack », « Sauce Labs Bike Light » et
  « Sauce Labs Onesie » sont ajoutés, et la pastille indique 3. Les boutons sous
  « Sauce Labs Bolt T-Shirt », « Sauce Labs Fleece Jacket » et
  « Test.allTheThings() T-Shirt (Red) » restent sur « Add to cart ». Les six produits ont aussi
  la même image.

##### S39 — `problem_user` trie par prix croissant

- **Given** : l'utilisateur s'est identifié avec `problem_user` et voit la page « Products ».
- **When** : il choisit le tri « Price (low to high) ».
- **Then** : comme S10, les prix s'affichent dans l'ordre $7.99, $9.99, $15.99, $15.99,
  $29.99, $49.99.
- **Observé** : l'ordre ne change pas : $29.99, $9.99, $15.99, $49.99, $7.99, $15.99.

##### S40 — `problem_user` ouvre la fiche d'un produit

- **Given** : l'utilisateur s'est identifié avec `problem_user` et voit la page « Products ».
- **When** : il clique sur le nom « Sauce Labs Backpack ».
- **Then** : comme S12, il voit la fiche « Sauce Labs Backpack » ($29.99).
- **Observé** : il voit la fiche « Sauce Labs Fleece Jacket ».

##### S41 — `problem_user` remplit le formulaire de commande

- **Given** : l'utilisateur s'est identifié avec `problem_user`, son panier contient
  « Sauce Labs Backpack » ($29.99) et il voit le formulaire « Checkout: Your Information ».
- **When** : il saisit `Jean` dans First Name, `Dupont` dans Last Name et `38000`, puis clique
  sur « Continue ».
- **Then** : il voit « Checkout: Overview ».
- **Observé** : le texte tapé dans Last Name s'écrit dans First Name, qui contient alors
  `Dupont`, et Last Name reste vide. Le site affiche « Error: Last Name is required ».

##### S42 — `error_user` trie par nom de Z à A

- **Given** : l'utilisateur s'est identifié avec `error_user` et voit la page « Products ».
- **When** : il choisit le tri « Name (Z to A) ».
- **Then** : comme S11, le premier produit est « Test.allTheThings() T-Shirt (Red) » ($15.99).
- **Observé** : une alerte du navigateur affiche « Sorting is broken! This error has been
  reported to Backtrace. » et le premier produit reste « Sauce Labs Backpack ». Avec ce compte,
  « Sauce Labs Bolt T-Shirt » et « Sauce Labs Fleece Jacket » ne peuvent pas non plus être
  ajoutés au panier.

##### S43 — `performance_glitch_user` se connecte

- **Given** : l'utilisateur voit la page de connexion.
- **When** : il saisit `performance_glitch_user` et `secret_sauce`, puis clique sur « Login ».
- **Then** : comme S4, il voit la page « Products » avec 6 produits.
- **Observé** : la page met environ 5,5 secondes à s'afficher, contre environ 0,6 seconde avec
  `standard_user`. Playwright attend que la page se charge, donc ce retard seul ne fait pas
  échouer le test : il vérifie aussi que la connexion prend moins de 5 secondes.

## DSL de test

Le DSL décrit ce que l'utilisateur **fait** (actions) et ce qu'il **voit** (perceptions), avec
le vocabulaire de l'interface. Les tests n'utilisent que le DSL et ne parlent jamais de
sélecteurs, d'URL internes ou de code HTML.

### Concepts

Les données échangées avec le DSL reprennent les concepts que l'utilisateur voit à l'écran.
Les prix restent des chaînes telles qu'affichées (`"$29.99"`), ce qui permet de les comparer
directement au texte des scénarios, y compris un prix anormal comme `"$√-1"` (S31). La
quantité d'un produit n'est renseignée que dans le panier et le récapitulatif.

```ts
type Product = { label: string; price: string; quantity?: number };

type ProductDetails = { label: string; price: string; description: string };

type CustomerInfo = { firstName: string; lastName: string; postalCode: string };

type Totals = { itemTotal: string; tax: string; total: string };

type SortOption =
  | 'Name (A to Z)' | 'Name (Z to A)'
  | 'Price (low to high)' | 'Price (high to low)';

type ButtonLabel = 'Add to cart' | 'Remove';

type PageName =
  | 'Login' | 'Products' | 'Product details' | 'Your Cart'
  | 'Checkout: Your Information' | 'Checkout: Overview' | 'Checkout: Complete!';
```

### Navigation commune

Actions :

- `goTo(path: string): Promise<void>` : ouvre directement une adresse du site, comme si
  l'utilisateur la tapait (S9, S22, S31, S34).
- `reload(): Promise<void>` : recharge la page (S26, S28).
- `goBack(): Promise<void>` : clique sur le bouton « Retour » du navigateur (S37).

Perceptions :

- `getPerceivedPage(): Promise<PageName | null>` : la page affichée, ou `null` pendant un
  chargement.
- `getPerceivedErrorMessage(): Promise<string | null>` : le message d'erreur affiché, ou
  `null` s'il n'y en a pas (connexion et formulaire de commande).
- `getPerceivedAlerts(): Promise<string[]>` : les messages des alertes du navigateur apparues
  depuis le début du test (S42).

### Tâche : se connecter

Actions :

- `openLoginPage(): Promise<void>`
- `login(username: string, password: string): Promise<void>` : saisit les deux champs (une
  chaîne vide laisse le champ vide) et clique sur « Login ».
- `closeErrorMessage(): Promise<void>` : clique sur la croix du message d'erreur (S33).

Perceptions :

- `getPerceivedFieldsInError(): Promise<string[]>` : les champs marqués d'une icône rouge, par
  exemple `['Username', 'Password']` (S33).

### Tâche : consulter le catalogue

Actions :

- `sortBy(option: SortOption): Promise<void>`
- `openProduct(productLabel: string): Promise<void>` : clique sur le nom du produit.
- `backToProducts(): Promise<void>` : clique sur « Back to products ».

Perceptions :

- `getPerceivedProducts(): Promise<Product[]>` : les produits de la liste affichée, dans
  l'ordre de l'écran. Sert pour le catalogue, le panier et le récapitulatif de commande.
- `getPerceivedSortOption(): Promise<SortOption>` : le tri affiché (S30).
- `getPerceivedProductDetails(): Promise<ProductDetails>` : la fiche ouverte (S12, S31, S40).

### Tâche : gérer les articles du panier

Actions :

- `addToCart(productLabel: string): Promise<void>` : clique sur « Add to cart » pour ce
  produit, dans le catalogue ou sur sa fiche.
- `removeFromCart(productLabel: string): Promise<void>` : clique sur « Remove » pour ce
  produit, dans le catalogue, sur sa fiche ou dans le panier.
- `doubleClickAddToCart(productLabel: string): Promise<void>` : double-clique sur « Add to
  cart » (S29).
- `openCart(): Promise<void>` : clique sur l'icône du panier.
- `continueShopping(): Promise<void>` : clique sur « Continue Shopping ».
- `resetAppState(): Promise<void>` : ouvre le menu et clique sur « Reset App State » (S26).

Perceptions :

- `getPerceivedProducts(): Promise<Product[]>` : dans le panier, les produits avec leur
  quantité.
- `getPerceivedCartBadge(): Promise<number | null>` : le nombre sur la pastille du panier, ou
  `null` s'il n'y a pas de pastille.
- `getPerceivedButtonLabel(productLabel: string): Promise<ButtonLabel>` : le texte du bouton
  sous ce produit dans le catalogue, ou sur sa fiche.

### Tâche : passer une commande

Actions :

- `checkout(): Promise<void>` : clique sur « Checkout » depuis le panier.
- `fillCustomerInfo(info: CustomerInfo): Promise<void>` : remplit les trois champs (une chaîne
  vide laisse le champ vide).
- `continueCheckout(): Promise<void>` : clique sur « Continue ».
- `cancelCheckout(): Promise<void>` : clique sur « Cancel ».
- `finishCheckout(): Promise<void>` : clique sur « Finish ».

Perceptions :

- `getPerceivedCustomerInfo(): Promise<CustomerInfo>` : le contenu des trois champs (S41).
- `getPerceivedTotals(): Promise<Totals>` : « Item total », « Tax » et « Total » du
  récapitulatif.
- `getPerceivedOrderConfirmation(): Promise<string>` : le message de fin de commande, par
  exemple « Thank you for your order! ».

### Tâche : se déconnecter

Actions :

- `logout(): Promise<void>` : ouvre le menu et clique sur « Logout ».

### Correspondance avec les scénarios

| Tâche | Scénarios | Actions principales | Perceptions principales |
|---|---|---|---|
| Se connecter | S4–S9, S32–S34, S43 | `openLoginPage`, `login`, `closeErrorMessage`, `goTo` | `getPerceivedPage`, `getPerceivedErrorMessage`, `getPerceivedFieldsInError` |
| Consulter le catalogue | S10–S12, S30, S31, S39, S40, S42 | `sortBy`, `openProduct`, `backToProducts`, `goTo` | `getPerceivedProducts`, `getPerceivedSortOption`, `getPerceivedProductDetails`, `getPerceivedAlerts` |
| Gérer les articles du panier | S1–S3, S13–S15, S23–S29, S38 | `addToCart`, `removeFromCart`, `doubleClickAddToCart`, `openCart`, `continueShopping`, `resetAppState`, `reload` | `getPerceivedProducts`, `getPerceivedCartBadge`, `getPerceivedButtonLabel` |
| Passer une commande | S16–S21, S35–S37, S41 | `checkout`, `fillCustomerInfo`, `continueCheckout`, `cancelCheckout`, `finishCheckout`, `goBack` | `getPerceivedTotals`, `getPerceivedOrderConfirmation`, `getPerceivedCustomerInfo`, `getPerceivedErrorMessage` |
| Se déconnecter | S22, S27 | `logout`, `login`, `goTo` | `getPerceivedPage`, `getPerceivedErrorMessage`, `getPerceivedCartBadge` |

Le **Given** d'un scénario est construit avec les mêmes actions. Par exemple, « son panier
contient A, B et C » s'écrit `login(...)` puis `addToCart` trois fois, et « voit son panier »
ajoute `openCart()`.

### Stratégie d'implémentation avec Playwright

- **Une classe `SauceDemo`** reçoit la `Page` de Playwright et implémente toutes les actions
  et perceptions. Les tests créent une instance de cette classe et n'utilisent jamais `page`
  directement.
- **Repérer les éléments comme l'utilisateur les voit** : les boutons par leur texte
  (`getByRole('button', { name: 'Add to cart' })`), les champs par leur texte d'aide
  (`getByPlaceholder('Username')`), les entrées du menu par leur texte
  (`getByText('Logout')`). Quand un élément n'a pas de texte stable (pastille du panier,
  titre de la page, totaux), on utilise l'attribut `data-test` du site, déclaré dans la
  configuration avec `testIdAttribute: 'data-test'`. Les champs en erreur sont ceux que le
  site marque en rouge (classe `error`).
- **Un produit est identifié par son nom** : on cherche le bloc qui contient exactement ce
  nom, puis le bouton à l'intérieur de ce bloc. La même action marche donc dans le catalogue,
  sur la fiche et dans le panier.
- **Les perceptions ne vérifient rien** : elles lisent l'écran et renvoient des données. Les
  vérifications sont dans les tests, avec `expect.poll(() => dsl.getPerceivedCartBadge())`,
  qui relit l'écran jusqu'à obtenir la valeur attendue ou jusqu'au délai maximal. C'est ce qui
  gère les pages lentes comme celle de `performance_glitch_user` (S43).
- **Les alertes du navigateur** sont enregistrées dès la création de la classe, puis fermées,
  pour que le test continue et que `getPerceivedAlerts()` puisse les lire (S42).
- **Configuration** (`playwright.config.ts`) : `baseURL` vaut `https://www.saucedemo.com`, et
  `channel: 'chrome'` fait utiliser Google Chrome, car le Chromium fourni par Playwright est
  bloqué sur un de nos postes.

## Outillage et usage de l'IA

### Outils

- [Playwright](https://playwright.dev) et TypeScript pour écrire et lancer les tests.
- Visual Studio Code comme éditeur.
- Claude Code (modèle Claude Opus 5.5, d'Anthropic), un assistant d'IA qui lit et modifie
  les fichiers du projet et lance des commandes dans le terminal.

### Ce qui a été fait par nous et ce qui a été fait par l'IA

| Partie | Auteur |
|---|---|
| Scénarios S1 à S22 (Given / When / Then) | nous |
| Scénarios S23 à S25 (retrait depuis le catalogue et la fiche) | idée de notre part, rédaction par l'IA |
| Cas limites S26 à S43 | proposés par l'IA, puis vérifiés par l'IA sur le site avec un script Playwright |
| Premières fonctions du DSL (`addToCart`, `removeFromCart`, `getPerceivedProducts`) | nous |
| Reste du DSL (types, actions, perceptions, stratégie d'implémentation) | l'IA |
| Code : configuration, classe `SauceDemo`, tests | l'IA |

Pour les cas limites, l'IA a d'abord ouvert le site avec Playwright pour observer son
comportement réel. Les lignes **Observé** des scénarios viennent de ces observations.

### Prompts donnés à l'IA

En substance, dans l'ordre :

1. « Fais-moi juste les cas de test Given / When / Then du site avant de faire autre chose. »
2. « On peut retirer du panier les produits achetés, mais on peut aussi les supprimer depuis la
   page des produits avec le bouton Remove, et les boutons changent après l'ajout d'un produit
   au panier. Je pense que ces cas sont intéressants. »
3. « Est-ce qu'il reste des cas limites à ajouter qui ne sont pas courants ? », puis le choix
   de les vérifier d'abord sur le site avant de les écrire.
4. « Complète le DSL. »
5. « Fais le code, en mentionnant que c'est fait par une IA, mais que les tests Given / When /
   Then d'avant sont faits par nous, sauf quelques cas limites. »

### Utilisation d'agents

Claude Code a travaillé comme un agent : il a lancé lui-même des commandes (installation de
Playwright, scripts d'observation du site, lancement des tests) et corrigé le code d'après
les résultats. Aucun autre agent n'a été utilisé.
