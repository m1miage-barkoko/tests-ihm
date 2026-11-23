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
   `standard_user`, et les tests doivent échouer avec les comptes défectueux.
8. Arrêt. On s'arrête quand chaque classe et chaque limite est couverte. Quand le résultat
   attendu n'est pas spécifié, on ne tranche pas : le scénario est marqué « à confirmer » avec
   le comportement actuel, et la question est listée dans « Ambiguïtés de la spécification ».

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
| P : gérer le panier | P1–P17 | [tests/panier.spec.ts](tests/panier.spec.ts) |
| CMD : passer une commande | CMD1–CMD17 | [tests/commande.spec.ts](tests/commande.spec.ts) |

Comme le prévoit la stratégie, A7 et les tâches T, F, P et CMD sont jouées avec les 5 comptes
(`standard_user`, `problem_user`, `error_user`, `visual_user`, `performance_glitch_user`), soit
255 tests en tout. Les échecs observés pour chaque compte sont listés dans
[tests/support/accounts.ts](tests/support/accounts.ts) et dans « Résultats attendus par
compte ». Ces tests sont marqués `test.fail` : Playwright compte leur échec comme attendu, et
signale le jour où l'un d'eux se met à passer.

Les scénarios « à confirmer » portent l'étiquette `@a-confirmer`. Ils vérifient le
comportement actuel du site, sauf P16 qui vérifie le comportement correct et échoue donc avec
tous les comptes.

### Lancer les tests

```sh
npm install
npm test
npm run test:report
```

- `npm run test:headed` ouvre Chrome et lance les tests un par un à l'écran. Pour une seule
  tâche : `npm run test:headed -- tests/panier.spec.ts`.
- `npm run test:ui` ouvre l'interface de Playwright, où l'on choisit les tests à lancer et où
  l'on revoit chaque étape.
- `npx playwright test --grep @a-confirmer` ne lance que les scénarios « à confirmer ».

Les tests utilisent le navigateur Google Chrome installé sur le poste (`channel: 'chrome'`).

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

Dans les tableaux, « connecté » veut dire connecté avec le compte testé. La colonne « Ancien »
donne le numéro du scénario dans les versions précédentes de ce README.

### C : se connecter

Variables : nom d'utilisateur U, mot de passe P. Ordre de contrôle du site : U vide, P vide,
couple (U, P) inconnu, compte bloqué. Given : l'utilisateur voit la page de connexion. When :
il saisit U et P, puis clique sur « Login ».

| n° | U | P | Then | Raison d'être | Ancien |
|---|---|---|---|---|---|
| C1 | `standard_user` | `secret_sauce` | page « Products » avec 6 produits, le premier est « Sauce Labs Backpack » ($29.99), pas de pastille sur le panier | nominal | S4 |
| C2 | vide | `secret_sauce` | « Epic sadface: Username is required » | U vide | S5 |
| C3 | vide | vide | « Epic sadface: Username is required » | U est contrôlé avant P | |
| C4 | `standard_user` | vide | « Epic sadface: Password is required » | P vide | S6 |
| C5 | `standard_user` | `mauvais_mdp` | « Epic sadface: Username and password do not match any user in this service » | P faux | S7 |
| C6 | `inconnu_user` | `secret_sauce` | même message que C5 | U inconnu | |
| C7 | `locked_out_user` | `secret_sauce` | « Epic sadface: Sorry, this user has been locked out. » | compte bloqué | S8 |
| C8 | `locked_out_user` | `mauvais_mdp` | même message que C5 | le blocage n'est signalé qu'avec le bon mot de passe | |
| C9 | `Standard_user` | `secret_sauce` | même message que C5 | limite : une majuscule | S32 |
| C10 | `STANDARD_USER` | `secret_sauce` | même message que C5 | limite : tout en majuscules | S32 |
| C11 | ` standard_user` (espace au début) | `secret_sauce` | même message que C5 | limite : espace au début | S32 |
| C12 | `standard_user ` (espace à la fin) | `secret_sauce` | même message que C5 | limite : espace à la fin | S32 |
| C13 | `standard_user` | `Secret_sauce` | même message que C5 | limite : casse du mot de passe | |
| C14 | vide | vide, puis clic sur la croix du message | le message et les icônes rouges des deux champs disparaissent | fermer un message d'erreur | S33 |

### A : ouvrir une page sans être connecté

Given : l'utilisateur n'est pas connecté. When : il ouvre directement l'adresse. Then : il voit
la page de connexion avec le message « Epic sadface: You can only access '<chemin>' when you are
logged in. ». Les 6 pages protégées sont toutes testées (domaine petit).

| n° | Adresse ouverte | Chemin dans le message | Raison d'être | Ancien |
|---|---|---|---|---|
| A1 | `/inventory.html` | `/inventory.html` | page d'arrivée après connexion | S9 |
| A2 | `/inventory-item.html?id=4` | `/inventory-item.html` | fiche produit | S34 |
| A3 | `/cart.html` | `/cart.html` | panier | S34 |
| A4 | `/checkout-step-one.html` | `/checkout-step-one.html` | formulaire de commande | S34 |
| A5 | `/checkout-step-two.html` | `/checkout-step-two.html` | récapitulatif | S34 |
| A6 | `/checkout-complete.html` | `/checkout-complete.html` | fin de commande | S34 |
| A7 | connecté, menu « Logout », puis `/inventory.html` | `/inventory.html` | la déconnexion ferme bien la session | S22 |

### T : trier le catalogue

Given : connecté, page « Products ». When : il choisit l'option de tri. Les 4 options sont
testées.

| n° | Option | Then | Raison d'être | Ancien |
|---|---|---|---|---|
| T1 | aucune (tri par défaut) | « Sauce Labs Backpack » ($29.99), « Sauce Labs Bike Light » ($9.99), « Sauce Labs Bolt T-Shirt » ($15.99), « Sauce Labs Fleece Jacket » ($49.99), « Sauce Labs Onesie » ($7.99), « Test.allTheThings() T-Shirt (Red) » ($15.99) | tri par défaut « Name (A to Z) » | |
| T2 | « Name (Z to A) » | l'ordre inverse de T1 | ordre alphabétique inverse | S11 |
| T3 | « Price (low to high) » | prix dans l'ordre $7.99, $9.99, $15.99, $15.99, $29.99, $49.99 ; premier « Sauce Labs Onesie » ($7.99), dernier « Sauce Labs Fleece Jacket » ($49.99) | limite : deux produits au même prix, leur ordre entre eux n'est pas vérifié | S10 |
| T4 | « Price (high to low) » | prix dans l'ordre $49.99, $29.99, $15.99, $15.99, $9.99, $7.99 | ordre décroissant | |
| T5 (à confirmer) | « Price (low to high) », puis clic sur « Sauce Labs Onesie » ($7.99) et « Back to products » | le tri affiché est revenu à « Name (A to Z) » et le premier produit est « Sauce Labs Backpack » ($29.99) | le tri n'est pas conservé après une fiche | S30 |

### F : consulter une fiche produit

Les identifiants valides vont de 0 à 5. Given : connecté.

| n° | When | Then | Raison d'être | Ancien |
|---|---|---|---|---|
| F1 | clic sur « Sauce Labs Backpack » ($29.99) dans le catalogue, puis sur « Back to products » | fiche « Sauce Labs Backpack » ($29.99) avec une description qui commence par « carry.allTheThings() with the sleek, streamlined Sly Pack », puis retour sur « Products » | nominal | S12 |
| F2 | ouvrir `/inventory-item.html?id=0` | fiche « Sauce Labs Bike Light » ($9.99) | limite basse | |
| F3 | ouvrir `/inventory-item.html?id=5` | fiche « Sauce Labs Fleece Jacket » ($49.99) | limite haute | |
| F4 | ouvrir `/inventory-item.html?id=6` | titre « ITEM NOT FOUND » | juste après la limite haute | S31 |
| F5 | ouvrir `/inventory-item.html?id=-1` | titre « ITEM NOT FOUND » | juste avant la limite basse | S31 |
| F6 | ouvrir `/inventory-item.html?id=abc` | titre « ITEM NOT FOUND » | valeur non numérique | S31 |
| F7 | ouvrir `/inventory-item.html?id=99` | titre « ITEM NOT FOUND » | valeur franchement hors limite | S31 |

Observé pour F4 à F7 : la fiche affiche aussi le prix « $√-1 » et un faux message de répondeur
téléphonique comme description.

### P : gérer le panier

Variables : action (ajouter ou retirer), lieu (catalogue, fiche ou page panier), nombre de
produits n avant l'action (classes 0, 1, 2 à 5, 6). Un produit ne peut être dans le panier
qu'une fois. Given : connecté, avec le panier indiqué.

| n° | Panier avant | When | Then | Raison d'être | Ancien |
|---|---|---|---|---|---|
| P1 | vide | dans le catalogue, « Add to cart » sous « Sauce Labs Backpack » ($29.99) | pastille 1, bouton « Remove » sous ce produit, le panier contient « Sauce Labs Backpack » ($29.99) en quantité 1 | ajouter, catalogue, n = 0 | S1 |
| P2 | vide | dans le catalogue, ajouter « Sauce Labs Backpack » ($29.99), « Sauce Labs Fleece Jacket » ($49.99) et « Sauce Labs Onesie » ($7.99) | pastille 3, le panier contient ces 3 produits avec leur prix | ajouter plusieurs produits | S2 |
| P3 | vide | dans le catalogue, « Add to cart » sous les 6 produits, dans l'ordre affiché | pastille 6 et les 6 boutons affichent « Remove » | remplir le panier jusqu'à la limite | S38 |
| P4 | les 5 produits sauf « Sauce Labs Onesie » ($7.99) | dans le catalogue, ajouter « Sauce Labs Onesie » ($7.99) | pastille 6, le panier contient les 6 produits | limite : n = 5 vers 6 | |
| P5 | vide | sur la fiche « Sauce Labs Bike Light » ($9.99), « Add to cart » | pastille 1, le bouton de la fiche devient « Remove » | ajouter, fiche, n = 0 | S13 |
| P6 | « Sauce Labs Backpack » ($29.99) | dans le catalogue, « Remove » sous ce produit | plus de pastille, le bouton redevient « Add to cart » | retirer, catalogue, n = 1 | S14 |
| P7 | « Sauce Labs Backpack » ($29.99), « Sauce Labs Fleece Jacket » ($49.99), « Sauce Labs Onesie » ($7.99) | dans le catalogue, « Remove » sous « Sauce Labs Fleece Jacket » ($49.99), puis ouvrir le panier | pastille 2, « Add to cart » sous la veste, « Remove » sous les deux autres ; le panier contient « Sauce Labs Backpack » ($29.99) et « Sauce Labs Onesie » ($7.99) | retirer, catalogue, n = 3 | S23 |
| P8 | les mêmes 3 produits | sur la page panier, « Remove » pour « Sauce Labs Fleece Jacket » ($49.99) | pastille 2, le panier contient « Sauce Labs Backpack » ($29.99) et « Sauce Labs Onesie » ($7.99) | retirer, panier, n = 3 | S3 |
| P9 | les mêmes 3 produits | sur la page panier, « Remove » pour « Sauce Labs Fleece Jacket » ($49.99), puis « Continue Shopping » | page « Products », pastille 2, « Add to cart » sous la veste, « Remove » sous les deux autres | le catalogue reflète un retrait fait dans le panier | S24 |
| P10 | « Sauce Labs Backpack » ($29.99) | sur la page panier, « Remove » | le panier est vide et il n'y a plus de pastille | retirer, panier, n = 1 | |
| P11 | « Sauce Labs Bike Light » ($9.99) | sur sa fiche, « Remove » | plus de pastille, le bouton de la fiche redevient « Add to cart », le panier est vide | retirer, fiche, n = 1 | S25 |
| P12 | les 6 produits | sur la fiche « Sauce Labs Fleece Jacket » ($49.99), « Remove » | pastille 5 | retirer, fiche, limite n = 6 | |
| P13 | « Sauce Labs Backpack » ($29.99) | sur la page panier, « Continue Shopping » | page « Products », pastille 1, bouton « Remove » sous « Sauce Labs Backpack » ($29.99) | le panier est conservé en naviguant | S15 |
| P14 | « Sauce Labs Backpack » ($29.99) | recharger la page « Products » | pastille 1, bouton « Remove » sous « Sauce Labs Backpack » ($29.99) | le panier est conservé au rechargement | S28 |
| P15 | vide | double-clic sur « Add to cart » sous « Sauce Labs Backpack » ($29.99) | le bouton affiche « Add to cart » et il n'y a pas de pastille | deux actions rapides : ajout puis retrait | S29 |
| P16 (à confirmer) | « Sauce Labs Backpack » ($29.99) et « Sauce Labs Onesie » ($7.99) | menu, « Reset App State » | plus de pastille, panier vide, les deux boutons redeviennent « Add to cart » | réinitialisation | S26 |
| P17 (à confirmer) | « Sauce Labs Backpack » ($29.99) | menu, « Logout », puis reconnexion avec le même compte | pastille 1 et le panier contient toujours « Sauce Labs Backpack » ($29.99) | le panier survit à la déconnexion | S27 |

Observé pour P16 : la pastille disparaît et le panier est vide, mais les deux boutons affichent
toujours « Remove » jusqu'au rechargement de la page.

### CMD : passer une commande

Given : connecté, le panier contient « Sauce Labs Backpack » ($29.99) sauf mention contraire.

Formulaire « Checkout: Your Information ». Variables : prénom, nom, code postal. Ordre de
contrôle du site : prénom, nom, code postal. When : il remplit les champs et clique sur
« Continue ».

| n° | Prénom | Nom | Code postal | Then | Raison d'être | Ancien |
|---|---|---|---|---|---|---|
| CMD1 | vide | `Dupont` | `38000` | « Error: First Name is required » | prénom vide | S17 |
| CMD2 | vide | vide | vide | « Error: First Name is required » | le prénom est contrôlé en premier | |
| CMD3 | `Jean` | vide | `38000` | « Error: Last Name is required » | nom vide | S18 |
| CMD4 | `Jean` | vide | vide | « Error: Last Name is required » | le nom est contrôlé avant le code postal | |
| CMD5 | `Jean` | `Dupont` | vide | « Error: Postal Code is required » | code postal vide | S19 |
| CMD6 | `J` | `D` | `3` | « Checkout: Overview » | limite : un seul caractère | |
| CMD7 (à confirmer) | trois espaces | `Dupont` | `38000` | « Checkout: Overview » (comportement actuel) | espaces seuls | S35 |
| CMD8 (à confirmer) | `Jean` | `Dupont` | `abc` | « Checkout: Overview » (comportement actuel) | code postal non numérique | S36 |

Montants du récapitulatif « Checkout: Overview ». Variable : contenu du panier. When : il clique
sur « Checkout », remplit le formulaire et clique sur « Continue ».

| n° | Panier | Then | Raison d'être | Ancien |
|---|---|---|---|---|
| CMD9 | « Sauce Labs Onesie » ($7.99) | « Item total: $7.99 », « Tax: $0.64 », « Total: $8.63 » | limite : un produit, le moins cher | |
| CMD10 | « Sauce Labs Backpack » ($29.99), « Sauce Labs Fleece Jacket » ($49.99), « Sauce Labs Onesie » ($7.99) | les 3 produits listés avec leur prix, « Item total: $87.97 », « Tax: $7.04 », « Total: $95.01 » | nominal | S16 |
| CMD11 | les 6 produits | « Item total: $129.94 », « Tax: $10.40 », « Total: $140.34 » | limite : panier plein | |
| CMD12 | « Sauce Labs Fleece Jacket » ($49.99) | « Item total: $49.99 », « Tax: $4.00 », « Total: $53.99 » | arrondi de la taxe ($3.9992 donne $4.00) | |
| CMD13 (à confirmer) | vide | « Item total: $0 », « Tax: $0.00 », « Total: $0.00 » et « Finish » reste cliquable (comportement actuel) | limite : panier vide | S21 |

Navigation dans la commande :

| n° | Given | When | Then | Raison d'être | Ancien |
|---|---|---|---|---|---|
| CMD14 | récapitulatif de CMD10 | « Finish », puis « Back Home » | « Checkout: Complete! » avec « Thank you for your order! », puis page « Products » sans pastille | fin de commande, le panier est vidé | S16 |
| CMD15 | formulaire « Checkout: Your Information » | « Cancel » | page « Your Cart » qui contient toujours « Sauce Labs Backpack » ($29.99) | annuler à l'étape 1 | |
| CMD16 | récapitulatif avec « Sauce Labs Backpack » ($29.99) et « Sauce Labs Onesie » ($7.99) : « Item total: $37.98 », « Tax: $3.04 », « Total: $41.02 » | « Cancel » | page « Products », pastille 2, le panier contient toujours les deux produits | annuler à l'étape 2 | S20 |
| CMD17 (à confirmer) | « Checkout: Complete! » après la commande de « Sauce Labs Backpack » ($29.99) | bouton « Retour » du navigateur, puis « Finish » | « Checkout: Overview » sans produit avec « Total: $0.00 », puis de nouveau « Thank you for your order! » (comportement actuel) | revenir en arrière après une commande | S37 |

### Résultats attendus par compte

Les scénarios T, F, P et CMD sont joués avec chaque compte. Les échecs ci-dessous ont été
observés sur le site.

| Compte | Attendu | Échecs observés |
|---|---|---|
| `standard_user` | tous les scénarios passent | aucun, sauf P16 (voir « Observé pour P16 ») |
| `problem_user` | des échecs | T2, T3, T4, F1, P2 à P9, P11, P12, P15, P16, CMD1, CMD5 à CMD14, CMD16, CMD17. P3 : seuls « Sauce Labs Backpack » ($29.99), « Sauce Labs Bike Light » ($9.99) et « Sauce Labs Onesie » ($7.99) sont ajoutés, pastille 3 (S38). T3 : l'ordre ne change pas (S39). F1 : la fiche affichée est « Sauce Labs Fleece Jacket » ($49.99) (S40), et cliquer sur un nom ouvre une autre fiche (P5, P11). « Remove » sous « Sauce Labs Backpack » dans le catalogue ne retire pas le produit (P6), et un double-clic laisse « Remove » (P15). Formulaire : le texte tapé dans le nom s'écrit dans le prénom, d'où « Error: Last Name is required » (S41) ; ce défaut bloque toutes les commandes (CMD1, CMD5 à CMD14, CMD16, CMD17). Tous les produits ont la même image. |
| `error_user` | des échecs | T2, T3, T4, F1, P2 à P4, P6 à P9, P11, P12, P15, P16, CMD3, CMD4, CMD10 à CMD14, CMD17. T2 : alerte « Sorting is broken! This error has been reported to Backtrace. » et l'ordre ne change pas (S42), de même pour T3 et T4. « Sauce Labs Bolt T-Shirt » ($15.99) et « Sauce Labs Fleece Jacket » ($49.99) ne peuvent pas être ajoutés au panier. Les fiches n'ont pas de description (F1). « Remove » ne retire pas certains produits, dans le catalogue (P6) comme sur la fiche (P11), et un double-clic laisse « Remove » (P15). Le nom vide n'est pas signalé (CMD3 ; CMD4 affiche l'erreur du code postal). « Finish » ne termine pas la commande (CMD13, CMD14, CMD17). |
| `visual_user` | des échecs | T1 à T5, P16. Les prix du catalogue sont tirés au hasard à chaque affichage, donc les scénarios qui vérifient les prix du catalogue échouent. |
| `performance_glitch_user` | à confirmer | tous les scénarios passent, sauf P16 comme pour les autres comptes : Playwright attend la fin du chargement, et la durée n'est pas vérifiée tant que la question 9 n'est pas tranchée. La page « Products » met environ 5,5 s à s'afficher, contre 0,6 s avec `standard_user` (S43). |

### Ambiguïtés de la spécification

Le résultat attendu n'est pas spécifié dans ces cas. Les scénarios concernés sont marqués
« à confirmer ». Questions à poser :

1. CMD13 : une commande avec un panier vide doit-elle être possible ?
2. CMD17 : après une commande, revenir en arrière et cliquer sur « Finish » valide une deuxième
   commande vide. Est-ce voulu ?
3. CMD7 : un prénom composé seulement d'espaces doit-il être accepté ?
4. CMD8 : le code postal doit-il avoir un format (chiffres seulement, longueur) ?
5. P16 : après « Reset App State », les boutons doivent-ils redevenir « Add to cart » sans
   recharger la page ?
6. P17 : le panier doit-il être conservé après une déconnexion ?
7. T5 : le tri choisi doit-il être conservé quand on revient d'une fiche ?
8. T3, T4 : dans quel ordre afficher deux produits de même prix ?
9. `performance_glitch_user` : un délai d'environ 5 s est-il un défaut ? Quel délai maximum
   faut-il vérifier ?

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
- `goBack(): Promise<void>` : clique sur le bouton « Retour » du navigateur (CMD17).

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
- `logout(): Promise<void>` : ouvre le menu et clique sur « Logout » (A7, P17).

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

- `getPerceivedProducts(): Promise<Product[]>` : les produits du récapitulatif (CMD10, CMD17).
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
| P : gérer le panier | `addToCart`, `removeFromCart`, `doubleClickAddToCart`, `openCart`, `continueShopping`, `reload`, `resetAppState`, `logout`, `login` | `getPerceivedCartBadge`, `getPerceivedButtonLabel`, `getPerceivedProducts` |
| CMD : passer une commande | `checkout`, `fillCustomerInfo`, `continueCheckout`, `cancelCheckout`, `finishCheckout`, `backHome`, `goBack` | `getPerceivedPage`, `getPerceivedErrorMessage`, `getPerceivedProducts`, `getPerceivedTotals`, `getPerceivedOrderConfirmation`, `getPerceivedCartBadge` |

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
  liste `KNOWN_FAILURES` donne, pour chaque compte, les scénarios dont l'échec a été observé ;
  ils sont marqués `test.fail`.
- **Les alertes du navigateur** sont enregistrées dès la création de la classe, puis fermées,
  pour que le test continue et que `getPerceivedAlerts()` puisse les lire.
- **Configuration** ([playwright.config.ts](playwright.config.ts)) : `baseURL` vaut
  `https://www.saucedemo.com`, et `channel: 'chrome'` fait utiliser Google Chrome, car le
  Chromium fourni par Playwright est bloqué sur un de nos postes.

## Outillage et usage de l'IA

### Outils

- [Playwright](https://playwright.dev) et TypeScript pour écrire et lancer les tests.
- Visual Studio Code comme éditeur.
- Claude Code (modèle Claude Opus 5.5, d'Anthropic), un assistant d'IA qui lit et modifie
  les fichiers du projet et lance des commandes dans le terminal.

### Ce qui a été fait par nous et ce qui a été fait par l'IA

| Partie | Auteur |
|---|---|
| Premiers scénarios Given / When / Then (anciens S1 à S22) | nous |
| Stratégie, réorganisation en tâches C, A, T, F, P, CMD, classes d'équivalence et valeurs limites | nous |
| Retrait depuis le catalogue et la fiche (anciens S23 à S25, aujourd'hui P7, P9, P11) | idée de notre part, rédaction par l'IA |
| Cas limites (anciens S26 à S43, repris dans les tableaux, colonne « Ancien ») | proposés par l'IA, puis vérifiés par l'IA sur le site avec un script Playwright |
| Premières fonctions du DSL (`addToCart`, `removeFromCart`, `getPerceivedProducts`) | nous |
| Reste du DSL (types, actions, perceptions, stratégie d'implémentation) | l'IA |
| Code : configuration, classe `SauceDemo`, tests, liste des échecs observés par compte | l'IA |

Pour les cas limites et pour les échecs par compte, l'IA a ouvert le site avec Playwright
pour observer son comportement réel. Les lignes « Observé » et la liste des échecs par compte
viennent de ces observations.

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
6. « Teste avec le navigateur : lance le projet au lieu de tout faire dans le terminal. »
7. Après la nouvelle version des scénarios par classes d'équivalence : fusionner les deux
   versions du README et adapter les tests aux nouveaux scénarios et à tous les comptes.

### Utilisation d'agents

Claude Code a travaillé comme un agent : il a lancé lui-même des commandes (installation de
Playwright, scripts d'observation du site, lancement des tests, fusion git) et corrigé le
code d'après les résultats. Aucun autre agent n'a été utilisé.
