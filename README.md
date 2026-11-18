# Tests IHM — tests end-to-end de SauceDemo avec Playwright

TP du cours d'IHM (M1 MIAGE) : vérification de la dynamique d'une interface par des tests
end-to-end en boîte noire, écrits avec un DSL de test et interprétés avec Playwright.

Système testé : <https://www.saucedemo.com>

## Auteurs (binôme)

- BARKOK Omar
- Mohamed-Amine JAANANE

## Stratégie

_À compléter : stratégie de production des cas de test._

Titre: Ajout d'articles dans le panier 

	Given: L'utilisateur percoit le contenu de panier. Il y a 3 articles dans le panier(A,B,C). Prix 37 euro
	When: il retire B du panier 
	Then: le panier contient deux produit A et C seulement. Prix vaut 23 euro

Titre: 

    Given:
    When: 
    Then: 


## Scénarios et cas de test

_À compléter : liste des scénarios et correspondance avec chaque test TypeScript._

## DSL de test

_À compléter : actions, perceptions, correspondance avec les tâches et concepts, stratégie
d'implémentation avec Playwright._

Titre: Ajout d'articles dans le panier 
Action 
		
	- addToCart(string productLabel)
	- removeFromCart(string productLabel)

Perception

	- getPerceivedProducts(): Promise<Product[]>  

## Outillage et usage de l'IA

_À compléter : outils utilisés, prompts donnés aux LLM, utilisation d'agents._
