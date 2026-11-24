# Tests IHM — tests end-to-end de SauceDemo avec Playwright

TP du cours d'IHM (M1 MIAGE) : vérification de la dynamique d'une interface par des tests
end-to-end en boîte noire, écrits avec un DSL de test et interprétés avec Playwright.

Système testé : <https://www.saucedemo.com>

## Auteurs (binôme)

- BARKOK Omar
- Mohamed-Amine JAANANE

## Stratégie

Les tests sont en boîte noire : on part de ce que le site affiche, pas de son code.

1. Tâches. L'activité est découpée en tâches : se connecter (C), ouvrir une page sans être
   connecté (A), trier (T), consulter une fiche (F), gérer le panier (P), commander (CMD).
   Chaque tâche a son tableau.
2. Variables. Pour chaque tâche, on liste ce qui fait varier le résultat : valeurs saisies,
   option de tri, id de la fiche, nombre de produits n dans le panier, page où l'action est
   faite.
3. Classes d'équivalence. Chaque variable est découpée en classes de valeurs qui doivent donner
   le même résultat, et on teste une valeur par classe. L'ordre des contrôles compte : le site
   vérifie le nom avant le mot de passe, donc un nom vide donne toujours « Username is
   required » (C2, C3). Même chose pour le prénom, le nom et le code postal (CMD1 à CMD5).
4. Valeurs limites. Chaque borne est testée, avec la valeur juste avant et juste après : panier
   à 0, 1, 5 et 6 produits, id de fiche −1, 0, 5 et 6 (plus `abc` et 99), champs à un
   caractère, en espaces ou en majuscules, deux produits au même prix, arrondi de la taxe
   ($3.9992 donne $4.00).
5. Combinaisons. Chaque classe apparaît au moins une fois. Quand une variable a peu de valeurs,
   on les teste toutes (4 tris, 6 pages protégées). Pour le panier, on couvre les paires
   action × lieu × taille du panier.
6. Oracle. On vérifie seulement ce que l'utilisateur voit : page, pastille, libellés des
   boutons, produits (label et prix), montants, messages. Les valeurs attendues sont des
   constantes tirées des données du site, jamais recalculées dans le test.
7. Comptes. Sauf pour C, chaque scénario est joué avec tous les comptes. Tout doit passer avec
   `standard_user` et `performance_glitch_user`, sauf les tests qui révèlent un défaut du site.
   Les tests doivent échouer avec les comptes défectueux.
8. Arrêt. On s'arrête quand chaque classe et chaque limite est couverte. Quand le résultat
   attendu n'est pas spécifié et que nous ne savons pas le trancher, le scénario est marqué
   « à confirmer » avec le comportement actuel (voir « Ambiguïtés de la spécification »).

## Scénarios et cas de test

Chaque scénario a un test TypeScript dont le titre commence par son numéro, par exemple
`test('P1 — Ajouter un produit depuis le catalogue, panier vide', ...)`. Dans chaque test, les
étapes `Given`, `When` et `Then` sont des `test.step`, visibles dans le rapport de Playwright.

| Tâche | Scénarios | Fichier de test |
|---|---|---|
| C : se connecter | C1–C14 | [tests/connexion.spec.ts](tests/connexion.spec.ts) |
| A : ouvrir une page sans être connecté | A1–A7 | [tests/acces.spec.ts](tests/acces.spec.ts) |
| T : trier le catalogue | T1–T5 | [tests/tri.spec.ts](tests/tri.spec.ts) |
| F : consulter une fiche produit | F1–F7 | [tests/fiche.spec.ts](tests/fiche.spec.ts) |
| P : gérer le panier | P1–P16 | [tests/panier.spec.ts](tests/panier.spec.ts) |
| CMD : passer une commande | CMD1–CMD12, CMD14–CMD16 | [tests/commande.spec.ts](tests/commande.spec.ts) |

Comme le prévoit la stratégie, A7 et les tâches T, F, P et CMD sont jouées avec les 5 comptes
(`standard_user`, `problem_user`, `error_user`, `visual_user`, `performance_glitch_user`), soit
240 tests en tout. Les tests qui échouent à cause d'un défaut du site ou d'un compte défectueux
sont listés dans [tests/support/accounts.ts](tests/support/accounts.ts) et marqués `test.fail` :
Playwright compte leur échec comme attendu, et signale le jour où l'un d'eux se met à passer.

Le seul scénario « à confirmer » (CMD8) porte l'étiquette `@a-confirmer`.

### Lancer les tests

```sh
npm install
npm test
npm run test:report
```

- `npm run test:firefox` lance les mêmes tests dans Firefox. La première fois, installer le
  Firefox de Playwright avec `npx playwright install firefox` (le Firefox déjà installé sur le
  poste n'est pas utilisé).
- `npm run test:headed` ouvre Chrome et lance les tests un par un à l'écran. Pour une seule
  tâche : `npm run test:headed -- tests/panier.spec.ts`.
- `npm run test:ui` ouvre l'interface de Playwright, où l'on choisit les tests à lancer et où
  l'on revoit chaque étape.
- `npx playwright test --grep @a-confirmer` ne lance que les scénarios « à confirmer ».

`npm test` utilise le navigateur Google Chrome installé sur le poste (`channel: 'chrome'`).

### Données de test

Comptes de la page de connexion, tous avec le mot de passe `secret_sauce` (affiché sur la page
de connexion du site) :

| Compte | Rôle dans les tests |
|---|---|
| `standard_user` | compte de référence : tous les scénarios doivent passer |
| `locked_out_user` | compte bloqué (tâche C) |
| `problem_user` | compte défectueux : des échecs sont attendus |
| `error_user` | compte défectueux : des échecs sont attendus |
| `visual_user` | compte défectueux : des échecs sont attendus |
| `performance_glitch_user` | compte lent : voir « Ambiguïtés » |

Catalogue (6 produits, identifiés par leur label et leur prix) :

| id | Produit | Prix |
|---|---|---|
| 4 | Sauce Labs Backpack | $29.99 |
| 0 | Sauce Labs Bike Light | $9.99 |
| 1 | Sauce Labs Bolt T-Shirt | $15.99 |
| 5 | Sauce Labs Fleece Jacket | $49.99 |
| 2 | Sauce Labs Onesie | $7.99 |
| 3 | Test.allTheThings() T-Shirt (Red) | $15.99 |

L'id est celui de l'adresse de la fiche (`/inventory-item.html?id=4`). La page panier affiche
chaque produit avec sa quantité et son prix, sans total. Les totaux n'apparaissent qu'au
récapitulatif « Checkout: Overview » : « Item total », « Tax » (8 % du total des articles,
arrondie au centime) et « Total ». Le formulaire de commande est rempli avec `Jean`, `Dupont`
et `38000`, sauf quand le scénario dit le contraire.

Dans les tableaux, « connecté » veut dire connecté avec le compte testé.

### C : se connecter

Variables : nom d'utilisateur U, mot de passe P. Ordre de contrôle du site : U vide, P vide,
couple (U, P) inconnu, compte bloqué. Given : l'utilisateur voit la page de connexion. When :
il saisit U et P, puis clique sur « Login ».

| n° | U | P | Then | Cas testé |
|---|---|---|---|---|
| C1 | `standard_user` | `secret_sauce` | page « Products » avec 6 produits, le premier est « Sauce Labs Backpack » ($29.99), pas de pastille sur le panier | nominal |
| C2 | vide | `secret_sauce` | « Epic sadface: Username is required » | U vide |
| C3 | vide | vide | « Epic sadface: Username is required » | U est contrôlé avant P |
| C4 | `standard_user` | vide | « Epic sadface: Password is required » | P vide |
| C5 | `standard_user` | `mauvais_mdp` | « Epic sadface: Username and password do not match any user in this service » | P faux |
| C6 | `inconnu_user` | `secret_sauce` | même message que C5 | U inconnu |
| C7 | `locked_out_user` | `secret_sauce` | « Epic sadface: Sorry, this user has been locked out. » | compte bloqué |
| C8 | `locked_out_user` | `mauvais_mdp` | même message que C5 | le blocage n'est signalé qu'avec le bon mot de passe |
| C9 | `Standard_user` | `secret_sauce` | même message que C5 | limite : une majuscule |
| C10 | `STANDARD_USER` | `secret_sauce` | même message que C5 | limite : tout en majuscules |
| C11 | ` standard_user` (espace au début) | `secret_sauce` | même message que C5 | limite : espace au début |
| C12 | `standard_user ` (espace à la fin) | `secret_sauce` | même message que C5 | limite : espace à la fin |
| C13 | `standard_user` | `Secret_sauce` | même message que C5 | limite : casse du mot de passe |
| C14 | vide | vide, puis clic sur la croix du message | le message et les icônes rouges des deux champs disparaissent | fermer un message d'erreur |

### A : ouvrir une page sans être connecté

Given : l'utilisateur n'est pas connecté. When : il ouvre directement l'adresse. Then : il voit
la page de connexion avec le message « Epic sadface: You can only access '<chemin>' when you are
logged in. ». Les 6 pages protégées sont toutes testées (domaine petit).

| n° | Adresse ouverte | Chemin dans le message | Cas testé |
|---|---|---|---|
| A1 | `/inventory.html` | `/inventory.html` | page d'arrivée après connexion |
| A2 | `/inventory-item.html?id=4` | `/inventory-item.html` | fiche produit |
| A3 | `/cart.html` | `/cart.html` | panier |
| A4 | `/checkout-step-one.html` | `/checkout-step-one.html` | formulaire de commande |
| A5 | `/checkout-step-two.html` | `/checkout-step-two.html` | récapitulatif |
| A6 | `/checkout-complete.html` | `/checkout-complete.html` | fin de commande |
| A7 | connecté, menu « Logout », puis `/inventory.html` | `/inventory.html` | la déconnexion ferme bien la session |

### T : trier le catalogue

Given : connecté, page « Products ». When : il choisit l'option de tri. Les 4 options sont
testées.

| n° | Option | Then | Cas testé |
|---|---|---|---|
| T1 | aucune (tri par défaut) | « Sauce Labs Backpack » ($29.99), « Sauce Labs Bike Light » ($9.99), « Sauce Labs Bolt T-Shirt » ($15.99), « Sauce Labs Fleece Jacket » ($49.99), « Sauce Labs Onesie » ($7.99), « Test.allTheThings() T-Shirt (Red) » ($15.99) | tri par défaut « Name (A to Z) » |
| T2 | « Name (Z to A) » | l'ordre inverse de T1 | ordre alphabétique inverse |
| T3 | « Price (low to high) » | prix dans l'ordre $7.99, $9.99, $15.99, $15.99, $29.99, $49.99 ; premier « Sauce Labs Onesie » ($7.99), dernier « Sauce Labs Fleece Jacket » ($49.99) | limite : deux produits au même prix, leur ordre entre eux n'est pas vérifié |
| T4 | « Price (high to low) » | prix dans l'ordre $49.99, $29.99, $15.99, $15.99, $9.99, $7.99 | ordre décroissant |
| T5 | « Price (low to high) », puis clic sur « Sauce Labs Onesie » ($7.99) et « Back to products » | le tri affiché est toujours « Price (low to high) » et le premier produit est « Sauce Labs Onesie » ($7.99) | le tri est conservé après une fiche |

### F : consulter une fiche produit

Les identifiants valides vont de 0 à 5. Given : connecté.

| n° | When | Then | Cas testé |
|---|---|---|---|
| F1 | clic sur « Sauce Labs Backpack » ($29.99) dans le catalogue, puis sur « Back to products » | fiche « Sauce Labs Backpack » ($29.99) avec une description qui commence par « carry.allTheThings() with the sleek, streamlined Sly Pack », puis retour sur « Products » | nominal |
| F2 | ouvrir `/inventory-item.html?id=0` | fiche « Sauce Labs Bike Light » ($9.99) | limite basse |
| F3 | ouvrir `/inventory-item.html?id=5` | fiche « Sauce Labs Fleece Jacket » ($49.99) | limite haute |
| F4 | ouvrir `/inventory-item.html?id=6` | titre « ITEM NOT FOUND » | juste après la limite haute |
| F5 | ouvrir `/inventory-item.html?id=-1` | titre « ITEM NOT FOUND » | juste avant la limite basse |
| F6 | ouvrir `/inventory-item.html?id=abc` | titre « ITEM NOT FOUND » | valeur non numérique |
| F7 | ouvrir `/inventory-item.html?id=99` | titre « ITEM NOT FOUND » | valeur franchement hors limite |

Pour F4 à F7, le site affiche aussi le prix « $√-1 » et un faux message de répondeur
téléphonique comme description.

### P : gérer le panier

Variables : action (ajouter ou retirer), lieu (catalogue, fiche ou page panier), nombre de
produits n avant l'action (classes 0, 1, 2 à 5, 6). Un produit ne peut être dans le panier
qu'une fois. Given : connecté, avec le panier indiqué.

| n° | Panier avant | When | Then | Cas testé |
|---|---|---|---|---|
| P1 | vide | dans le catalogue, « Add to cart » sous « Sauce Labs Backpack » ($29.99) | pastille 1, bouton « Remove » sous ce produit, le panier contient « Sauce Labs Backpack » ($29.99) en quantité 1 | ajouter, catalogue, n = 0 |
| P2 | vide | dans le catalogue, ajouter « Sauce Labs Backpack » ($29.99), « Sauce Labs Fleece Jacket » ($49.99) et « Sauce Labs Onesie » ($7.99) | pastille 3, le panier contient ces 3 produits avec leur prix | ajouter plusieurs produits |
| P3 | vide | dans le catalogue, « Add to cart » sous les 6 produits, dans l'ordre affiché | pastille 6 et les 6 boutons affichent « Remove » | remplir le panier jusqu'à la limite |
| P4 | les 5 produits sauf « Sauce Labs Onesie » ($7.99) | dans le catalogue, ajouter « Sauce Labs Onesie » ($7.99) | pastille 6, le panier contient les 6 produits | limite : n = 5 vers 6 |
| P5 | vide | sur la fiche « Sauce Labs Bike Light » ($9.99), « Add to cart » | pastille 1, le bouton de la fiche devient « Remove » | ajouter, fiche, n = 0 |
| P6 | « Sauce Labs Backpack » ($29.99) | dans le catalogue, « Remove » sous ce produit | plus de pastille, le bouton redevient « Add to cart » | retirer, catalogue, n = 1 |
| P7 | « Sauce Labs Backpack » ($29.99), « Sauce Labs Fleece Jacket » ($49.99), « Sauce Labs Onesie » ($7.99) | dans le catalogue, « Remove » sous « Sauce Labs Fleece Jacket » ($49.99), puis ouvrir le panier | pastille 2, « Add to cart » sous la veste, « Remove » sous les deux autres ; le panier contient « Sauce Labs Backpack » ($29.99) et « Sauce Labs Onesie » ($7.99) | retirer, catalogue, n = 3 |
| P8 | les mêmes 3 produits | sur la page panier, « Remove » pour « Sauce Labs Fleece Jacket » ($49.99) | pastille 2, le panier contient « Sauce Labs Backpack » ($29.99) et « Sauce Labs Onesie » ($7.99) | retirer, panier, n = 3 |
| P9 | les mêmes 3 produits | sur la page panier, « Remove » pour « Sauce Labs Fleece Jacket » ($49.99), puis « Continue Shopping » | page « Products », pastille 2, « Add to cart » sous la veste, « Remove » sous les deux autres | le catalogue reflète un retrait fait dans le panier |
| P10 | « Sauce Labs Backpack » ($29.99) | sur la page panier, « Remove » | le panier est vide et il n'y a plus de pastille | retirer, panier, n = 1 |
| P11 | « Sauce Labs Bike Light » ($9.99) | sur sa fiche, « Remove » | plus de pastille, le bouton de la fiche redevient « Add to cart », le panier est vide | retirer, fiche, n = 1 |
| P12 | les 6 produits | sur la fiche « Sauce Labs Fleece Jacket » ($49.99), « Remove » | pastille 5 | retirer, fiche, limite n = 6 |
| P13 | « Sauce Labs Backpack » ($29.99) | sur la page panier, « Continue Shopping » | page « Products », pastille 1, bouton « Remove » sous « Sauce Labs Backpack » ($29.99) | le panier est conservé en naviguant |
| P14 | « Sauce Labs Backpack » ($29.99) | recharger la page « Products » | pastille 1, bouton « Remove » sous « Sauce Labs Backpack » ($29.99) | le panier est conservé au rechargement |
| P15 | vide | double-clic sur « Add to cart » sous « Sauce Labs Backpack » ($29.99) | le bouton affiche « Add to cart » et il n'y a pas de pastille | deux actions rapides : ajout puis retrait |
| P16 | « Sauce Labs Backpack » ($29.99) et « Sauce Labs Onesie » ($7.99) | menu, « Reset App State » | plus de pastille, panier vide, les deux boutons redeviennent « Add to cart » | réinitialisation |

### CMD : passer une commande

Given : connecté, le panier contient « Sauce Labs Backpack » ($29.99) sauf mention contraire.

Formulaire « Checkout: Your Information ». Variables : prénom, nom, code postal. Ordre de
contrôle du site : prénom, nom, code postal. When : il remplit les champs et clique sur
« Continue ».

| n° | Prénom | Nom | Code postal | Then | Cas testé |
|---|---|---|---|---|---|
| CMD1 | vide | `Dupont` | `38000` | « Error: First Name is required » | prénom vide |
| CMD2 | vide | vide | vide | « Error: First Name is required » | le prénom est contrôlé en premier |
| CMD3 | `Jean` | vide | `38000` | « Error: Last Name is required » | nom vide |
| CMD4 | `Jean` | vide | vide | « Error: Last Name is required » | le nom est contrôlé avant le code postal |
| CMD5 | `Jean` | `Dupont` | vide | « Error: Postal Code is required » | code postal vide |
| CMD6 | `J` | `D` | `3` | « Checkout: Overview » | limite : un seul caractère |
| CMD7 | trois espaces | `Dupont` | `38000` | « Error: First Name is required » | espaces seuls |
| CMD8 (à confirmer) | `Jean` | `Dupont` | `abc` | « Checkout: Overview » (comportement actuel) | code postal non numérique |

Montants du récapitulatif « Checkout: Overview ». Variable : contenu du panier. When : il clique
sur « Checkout », remplit le formulaire et clique sur « Continue ».

| n° | Panier | Then | Cas testé |
|---|---|---|---|
| CMD9 | « Sauce Labs Onesie » ($7.99) | « Item total: $7.99 », « Tax: $0.64 », « Total: $8.63 » | limite : un produit, le moins cher |
| CMD10 | « Sauce Labs Backpack » ($29.99), « Sauce Labs Fleece Jacket » ($49.99), « Sauce Labs Onesie » ($7.99) | les 3 produits listés avec leur prix, « Item total: $87.97 », « Tax: $7.04 », « Total: $95.01 » | nominal |
| CMD11 | les 6 produits | « Item total: $129.94 », « Tax: $10.40 », « Total: $140.34 » | limite : panier plein |
| CMD12 | « Sauce Labs Fleece Jacket » ($49.99) | « Item total: $49.99 », « Tax: $4.00 », « Total: $53.99 » | arrondi de la taxe ($3.9992 donne $4.00) |

Navigation dans la commande :

| n° | Given | When | Then | Cas testé |
|---|---|---|---|---|
| CMD14 | récapitulatif de CMD10 | « Finish », puis « Back Home » | « Checkout: Complete! » avec « Thank you for your order! », puis page « Products » sans pastille | fin de commande, le panier est vidé |
| CMD15 | formulaire « Checkout: Your Information » | « Cancel » | page « Your Cart » qui contient toujours « Sauce Labs Backpack » ($29.99) | annuler à l'étape 1 |
| CMD16 | récapitulatif avec « Sauce Labs Backpack » ($29.99) et « Sauce Labs Onesie » ($7.99) : « Item total: $37.98 », « Tax: $3.04 », « Total: $41.02 » | « Cancel » | page « Products », pastille 2, le panier contient toujours les deux produits | annuler à l'étape 2 |

### Défauts du site

Ces tests vérifient le comportement attendu et échouent avec tous les comptes :

| n° | Attendu | Comportement actuel du site |
|---|---|---|
| T5 | le tri choisi est conservé au retour d'une fiche | le tri revient à « Name (A to Z) » |
| P16 | après « Reset App State », les boutons redeviennent « Add to cart » | les boutons restent sur « Remove » jusqu'au rechargement de la page |
| CMD7 | un prénom fait seulement d'espaces est refusé | le récapitulatif s'affiche |

### Résultats par compte

Résultats d'une exécution complète de la suite (240 tests, 24/11/2026), dans Chromium et dans
Firefox : tous les tests ont eu le résultat attendu, avec les mêmes échecs dans les deux.

| Compte | Tests en échec |
|---|---|
| `standard_user` | les 3 défauts du site |
| `performance_glitch_user` | les 3 défauts du site. Le compte est lent (environ 5,5 s par affichage du catalogue, contre 0,6 s avec `standard_user`) mais passe tous les autres tests. |
| `visual_user` | les 3 défauts du site, plus T1 à T4 : les prix du catalogue sont tirés au hasard à chaque affichage. |
| `problem_user` | les 3 défauts du site, plus T2 à T4, F1, P2 à P9, P11, P12, P15, CMD1, CMD5, CMD6, CMD8 à CMD12, CMD14, CMD16. Le tri ne change pas l'ordre ; cliquer sur un nom ouvre une autre fiche ; seuls « Sauce Labs Backpack » ($29.99), « Sauce Labs Bike Light » ($9.99) et « Sauce Labs Onesie » ($7.99) peuvent être ajoutés, et « Remove » ne retire pas toujours le produit ; dans le formulaire, le texte tapé dans le nom s'écrit dans le prénom, ce qui bloque les commandes. |
| `error_user` | les 3 défauts du site, plus T2 à T4, F1, P2 à P4, P6 à P9, P11, P12, P15, CMD3, CMD4, CMD10 à CMD12, CMD14. Le tri affiche l'alerte « Sorting is broken! This error has been reported to Backtrace. » ; « Sauce Labs Bolt T-Shirt » ($15.99) et « Sauce Labs Fleece Jacket » ($49.99) ne peuvent pas être ajoutés ; les fiches n'ont pas de description ; le nom vide n'est pas signalé ; « Finish » ne termine pas la commande. |

### Ambiguïtés de la spécification

CMD8 : le code postal doit-il avoir un format (chiffres seulement, longueur) ? En attendant la
réponse, le test vérifie le comportement actuel : `abc` est accepté.

## DSL de test

Le DSL décrit ce que l'utilisateur **fait** (actions) et ce qu'il **voit** (perceptions), avec
le vocabulaire de l'interface. Les tests n'utilisent que le DSL et ne parlent jamais de
sélecteurs ni de code HTML.

### Concepts

Les données échangées avec le DSL reprennent les concepts que l'utilisateur voit à l'écran.
Les prix restent des chaînes telles qu'affichées (`"$29.99"`), ce qui permet de les comparer
directement au texte des scénarios, y compris un prix anormal comme `"$√-1"` (F4 à F7). La
quantité d'un produit n'est renseignée que dans le panier et le récapitulatif. La
description d'une fiche vaut `null` quand le site n'en affiche pas (cas de `error_user`).

```ts
type Product = { label: string; price: string; quantity?: number };

type ProductDetails = { label: string; price: string; description: string | null };

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
  l'utilisateur la tapait (A1 à A7, F2 à F7).
- `reload(): Promise<void>` : recharge la page (P14).

Perceptions :

- `getPerceivedPage(): Promise<PageName | null>` : la page affichée, ou `null` pendant un
  chargement.
- `getPerceivedErrorMessage(): Promise<string | null>` : le message d'erreur affiché, ou
  `null` s'il n'y en a pas (connexion, pages protégées et formulaire de commande).
- `getPerceivedAlerts(): Promise<string[]>` : les messages des alertes du navigateur apparues
  depuis le début du test, comme « Sorting is broken! » avec `error_user`.

### Tâche C : se connecter

Actions :

- `openLoginPage(): Promise<void>`
- `login(username: string, password: string): Promise<void>` : saisit les deux champs (une
  chaîne vide laisse le champ vide) et clique sur « Login ».
- `closeErrorMessage(): Promise<void>` : clique sur la croix du message d'erreur (C14).

Perceptions :

- `getPerceivedFieldsInError(): Promise<string[]>` : les champs marqués en rouge, par exemple
  `['Username', 'Password']` (C14).

### Tâches T et F : trier le catalogue, consulter une fiche

Actions :

- `sortBy(option: SortOption): Promise<void>`
- `openProduct(productLabel: string): Promise<void>` : clique sur le nom du produit.
- `backToProducts(): Promise<void>` : clique sur « Back to products ».

Perceptions :

- `getPerceivedProducts(): Promise<Product[]>` : les produits de la liste affichée, dans
  l'ordre de l'écran. Sert pour le catalogue, le panier et le récapitulatif de commande.
- `getPerceivedSortOption(): Promise<SortOption>` : le tri affiché (T1, T5).
- `getPerceivedProductDetails(): Promise<ProductDetails>` : la fiche ouverte (F1 à F7).

### Tâche P : gérer le panier

Actions :

- `addToCart(productLabel: string): Promise<void>` : clique sur « Add to cart » pour ce
  produit, dans le catalogue ou sur sa fiche.
- `removeFromCart(productLabel: string): Promise<void>` : clique sur « Remove » pour ce
  produit, dans le catalogue, sur sa fiche ou dans le panier.
- `doubleClickAddToCart(productLabel: string): Promise<void>` : double-clique sur « Add to
  cart » (P15).
- `openCart(): Promise<void>` : clique sur l'icône du panier.
- `continueShopping(): Promise<void>` : clique sur « Continue Shopping ».
- `resetAppState(): Promise<void>` : ouvre le menu et clique sur « Reset App State » (P16).
- `logout(): Promise<void>` : ouvre le menu et clique sur « Logout » (A7).

Perceptions :

- `getPerceivedProducts(): Promise<Product[]>` : dans le panier, les produits avec leur
  quantité.
- `getPerceivedCartBadge(): Promise<number | null>` : le nombre sur la pastille du panier, ou
  `null` s'il n'y a pas de pastille.
- `getPerceivedButtonLabel(productLabel: string): Promise<ButtonLabel>` : le texte du bouton
  sous ce produit dans le catalogue, ou sur sa fiche.

### Tâche CMD : passer une commande

Actions :

- `checkout(): Promise<void>` : clique sur « Checkout » depuis le panier.
- `fillCustomerInfo(info: CustomerInfo): Promise<void>` : remplit les trois champs (une chaîne
  vide laisse le champ vide).
- `continueCheckout(): Promise<void>` : clique sur « Continue ».
- `cancelCheckout(): Promise<void>` : clique sur « Cancel » (CMD15, CMD16).
- `finishCheckout(): Promise<void>` : clique sur « Finish ».
- `backHome(): Promise<void>` : clique sur « Back Home » (CMD14).

Perceptions :

- `getPerceivedProducts(): Promise<Product[]>` : les produits du récapitulatif (CMD10).
- `getPerceivedTotals(): Promise<Totals>` : « Item total », « Tax » et « Total » du
  récapitulatif.
- `getPerceivedOrderConfirmation(): Promise<string>` : le message de fin de commande, par
  exemple « Thank you for your order! ».

### Correspondance avec les scénarios

| Tâche | Actions principales | Perceptions principales |
|---|---|---|
| C : se connecter | `openLoginPage`, `login`, `closeErrorMessage` | `getPerceivedPage`, `getPerceivedErrorMessage`, `getPerceivedFieldsInError`, `getPerceivedProducts`, `getPerceivedCartBadge` |
| A : ouvrir une page sans être connecté | `goTo`, `logout` | `getPerceivedPage`, `getPerceivedErrorMessage` |
| T : trier le catalogue | `sortBy`, `openProduct`, `backToProducts` | `getPerceivedProducts`, `getPerceivedSortOption` |
| F : consulter une fiche produit | `openProduct`, `goTo`, `backToProducts` | `getPerceivedPage`, `getPerceivedProductDetails` |
| P : gérer le panier | `addToCart`, `removeFromCart`, `doubleClickAddToCart`, `openCart`, `continueShopping`, `reload`, `resetAppState` | `getPerceivedCartBadge`, `getPerceivedButtonLabel`, `getPerceivedProducts` |
| CMD : passer une commande | `checkout`, `fillCustomerInfo`, `continueCheckout`, `cancelCheckout`, `finishCheckout`, `backHome` | `getPerceivedPage`, `getPerceivedErrorMessage`, `getPerceivedProducts`, `getPerceivedTotals`, `getPerceivedOrderConfirmation`, `getPerceivedCartBadge` |

Le **Given** d'un scénario est construit avec les mêmes actions. Par exemple, « connecté, le
panier contient A, B et C » s'écrit `openLoginPage()`, `login(...)`, puis `addToCart` trois
fois.

### Stratégie d'implémentation avec Playwright

- **Une classe `SauceDemo`** ([src/dsl/SauceDemo.ts](src/dsl/SauceDemo.ts)) reçoit la `Page`
  de Playwright et implémente toutes les actions et perceptions. Les tests la reçoivent sous
  le nom `app` et n'utilisent jamais `page` directement.
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
  vérifications sont dans les tests, avec `expect.poll(() => app.getPerceivedCartBadge())`,
  qui relit l'écran jusqu'à obtenir la valeur attendue ou jusqu'au délai maximal.
- **Les comptes** : `forEachAccount` ([tests/support/accounts.ts](tests/support/accounts.ts))
  rejoue un groupe de scénarios avec chaque compte, après une connexion avec ce compte. La
  liste `SITE_DEFECTS` donne les défauts du site, communs à tous les comptes, et
  `KNOWN_FAILURES` les échecs propres à chaque compte ; ces tests sont marqués `test.fail`.
- **Les listes sont lues en une seule fois** (`getPerceivedProducts`) : lue produit par
  produit, une liste peut changer de page en cours de lecture et bloquer `expect.poll`.
- **Les alertes du navigateur** sont enregistrées dès la création de la classe, puis fermées,
  pour que le test continue et que `getPerceivedAlerts()` puisse les lire.
- **Configuration** ([playwright.config.ts](playwright.config.ts)) : `baseURL` vaut
  `https://www.saucedemo.com`. Deux projets : `chrome` (Google Chrome installé sur le poste,
  car le Chromium fourni par Playwright est bloqué sur un de nos postes) et `firefox` (le
  Firefox fourni par Playwright). Les vérifications attendent
  jusqu'à 10 s, à cause de la lenteur de `performance_glitch_user`.

## Outillage et usage de l'IA

### Outils

- [Playwright](https://playwright.dev) et TypeScript pour écrire et lancer les tests.
- Visual Studio Code comme éditeur.
- Claude Code (modèle Claude Opus 5.5, d'Anthropic), un assistant d'IA qui lit et modifie
  les fichiers du projet et lance des commandes dans le terminal.

### Ce qui a été fait par nous et ce qui a été fait par l'IA

| Partie | Auteur |
|---|---|
| Premiers scénarios Given / When / Then des tâches C, A, T, F, P et CMD | nous |
| Stratégie, réorganisation en tâches C, A, T, F, P, CMD, classes d'équivalence et valeurs limites | nous |
| Retrait depuis le catalogue et la fiche (P7, P9, P11) | idée de notre part, rédaction par l'IA |
| Cas limites (C9 à C12, C14, A2 à A6, T5, F4 à F7, P14 à P16, CMD7, CMD8) et défauts des comptes | proposés par l'IA, puis vérifiés par l'IA sur le site avec un script Playwright |
| Premières fonctions du DSL (`addToCart`, `removeFromCart`, `getPerceivedProducts`) | nous |
| Reste du DSL (types, actions, perceptions, stratégie d'implémentation) | l'IA |
| Code : configuration, classe `SauceDemo`, tests, liste des échecs observés par compte | l'IA |

Pour les cas limites et pour les échecs par compte, l'IA a ouvert le site avec Playwright
pour observer son comportement réel. La liste des échecs par compte vient de ces observations ;
elle a ensuite été confirmée en lançant les tests.

### Prompts donnés à l'IA

En substance, dans l'ordre :

1. « Fais-moi juste les cas de test Given / When / Then du site avant de faire autre chose. »
2. « On peut retirer du panier les produits achetés, mais on peut aussi les supprimer depuis la
   page des produits avec le bouton Remove, et les boutons changent après l'ajout d'un produit
   au panier. Je pense que ces cas sont intéressants. »
3. « Est-ce qu'il reste des cas limites à ajouter qui ne sont pas courants ? », puis le choix
   de les vérifier d'abord sur le site avant de les écrire.
4. « Complète le DSL. »
5. « Écris les tests Playwright à partir de nos scénarios et du DSL, et indique dans le README
   ce qui est fait par l'IA et ce qui est fait par nous. »
6. « Teste avec le navigateur : lance le projet au lieu de tout faire dans le terminal. »
7. Après la nouvelle version des scénarios par classes d'équivalence : fusionner les deux
   versions du README et adapter les tests aux nouveaux scénarios et à tous les comptes.

### Utilisation d'agents

Claude Code a travaillé comme un agent : il a lancé lui-même des commandes (installation de
Playwright, scripts d'observation du site, lancement des tests) et corrigé le
code d'après les résultats. Aucun autre agent n'a été utilisé.
