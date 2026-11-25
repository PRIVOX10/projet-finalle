# Kandili

Boutique en ligne de bouquets de bougies en forme de fleurs : vitrine, commande avec
paiement à la livraison et espace de gestion pour la gérante.

Next.js 16 · Tailwind CSS 4 · MongoDB (Mongoose) · TypeScript

## Démarrer

Prérequis : Node.js 20 ou plus et un serveur MongoDB accessible.

```bash
npm install
cp .env.example .env
npm run db:seed
npm run dev
```

Renseignez `.env` avant le `db:seed` : il crée le compte gérante à partir de
`ADMIN_EMAIL` et `ADMIN_PASSWORD`.

- Site : http://localhost:3000
- Espace gérante : http://localhost:3000/admin

## Fonctionnalités

**Côté client** : accueil, catalogue filtrable (couleur, type de fleur, prix), fiche
produit avec tailles, senteurs et photos, panier, commande, page de suivi, contact avec
WhatsApp.

**Mode sombre** : le bouton bougie de l'en-tête éteint la lumière et allume les bougies.
Le choix est mémorisé ; sinon le site suit le réglage de l'appareil. Les modèles
d'exposition ont une flamme sur chaque mèche (positions relevées à la main dans
`src/lib/bouquet-flames.json`) ; une photo envoyée depuis le dashboard reçoit une lueur chaude.

**Côté gérante** : connexion sécurisée, tableau de bord des ventes, commandes avec
statuts, recherche et contact du client, ajout et modification des bouquets avec
photos, réglages de la boutique.

## Commandes utiles

| Commande | Effet |
| --- | --- |
| `npm run dev` | Lance le site en développement |
| `npm run build` | Compile pour la production |
| `npm test` | Lance les tests automatiques (prix, téléphone, validation des commandes) |
| `npm run db:seed` | Crée le compte gérante et, si la base est vide, les données de démonstration |
| `npm run db:clear-demo` | Supprime **tous** les bouquets et commandes (à faire avant le lancement) |

## Avant le lancement

1. Vérifier les modèles d'exposition : les photos viennent d'Instagram (`@kandili._`), en
   1440 px pour la plupart (Douceur Nude reste en basse résolution), et les noms, tailles et prix sont provisoires. Les commandes sont
   fictives. `npm run db:clear-demo` vide le catalogue et les commandes.
2. Dans **Réglages**, renseigner le numéro WhatsApp, les frais de livraison et les 5 senteurs
   proposées (Vanille, Rose, Jasmin, Fleur d'oranger et Musc blanc par défaut). Le bouton WhatsApp reste masqué tant que le numéro est vide.
3. Changer le mot de passe de la gérante.

## Mise en ligne

Un serveur MongoDB local n'est pas joignable depuis un hébergeur. Il faut une base en
ligne (MongoDB Atlas, par exemple) et définir chez l'hébergeur :

- `MONGODB_URI` : chaîne de connexion de la base
- `SESSION_SECRET` : 64 caractères aléatoires (`openssl rand -hex 32`)

Lancez ensuite `npm run db:seed` une fois avec cette `MONGODB_URI` pour créer le compte
gérante.

## Organisation

```
src/app/(shop)      pages publiques
src/app/admin       espace gérante (protégé par src/proxy.ts et requireAdmin)
src/app/actions     actions serveur (commande, administration)
src/lib             accès aux données, modèles Mongoose, sessions, règles métier
src/components      composants d'interface
scripts             données de démonstration
tests               tests automatiques (Vitest)
```

Les prix ne sont jamais repris du navigateur : chaque commande est recalculée sur le
serveur. Une commande garde une copie du nom et du prix, elle ne change donc pas si le
bouquet est modifié ou supprimé.
