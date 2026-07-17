# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Projet

Site vitrine multi-pages de **2B Business Booster** (cabinet de conseil / agence de communication, Dakar). HTML/CSS/JS vanilla, **sans framework ni build tool** — les fichiers sont servis tels quels. Tout le contenu est en français. Le client valide chaque page avant de passer à la suivante.

État : `index.html` livré et validé ; `2b-en-bref.html` construite (en attente de validation client). **14 pages restantes** (3 pages piliers + 9 sous-pages, blog, contacts) — URLs, title/meta, H1/H2, mots-clés et maillage interne de chaque page sont définis dans le cahier des charges SEO fourni par le client (PDF, hors repo), **amendé par les décisions du CR du 10/07/2026 ci-dessous**. Ordre de construction : pilier puis ses 3 sous-pages, en commençant par Conseils et Consultance.

## Décisions stratégie digitale (CR réunion DG du 10/07/2026)

Amendements au cahier des charges SEO, validés par la Direction Générale — à appliquer sur toute page, existante ou nouvelle :

- **Cibles élargies** : dirigeants de PME, porteurs de projet et organisations — explicitement associations, ONG et État/institutions publiques (agréments, présidence). Ne plus écrire seulement « entrepreneurs et PME ». Formulation retenue pour le copy visible : « associations, ONG et institutions ».
- **Ligne éditoriale orientée résultats** : mettre en avant les résultats commerciaux (clients obtenus, ventes, chiffre d'affaires), pas seulement la visibilité/notoriété.
- **Blog** (future `blog.html`) : cadence 2 articles + 1 étude de cas par mois → prévoir une rubrique/un filtre « Études de cas » dans le gabarit.
- **Mots-clés SEO confirmés comme axe stratégique** : « agence de communication à Dakar », « business plan Sénégal / Dakar » (en complément du cahier des charges SEO).
- **Team building / marketing événementiel** : nouveau volet à part entière → à développer dans la future page `evenementiel.html` ; déjà mentionné dans les descriptions du pôle Communication 360° sur les pages existantes.
- **Baseline de marque** : non tranchée (la DG cherche un adjectif alliant présence et qualité). Ne rien inventer ; conserver « 2B, une expertise pour votre succès ! » en attendant.
- **Google Analytics** : pas encore en place. Ajouter le tag GA4 sur toutes les pages quand le client fournira l'ID de mesure — ne rien ajouter avant.

## Commandes

- **Prévisualisation locale** : serveur PowerShell HttpListener sur **http://localhost:8080** (script `C:\Users\awagu\2b-preview-server.ps1`, lancé automatiquement à l'ouverture de session via `shell:startup\2b-preview-server.vbs`). Python/Node ne sont **pas installés** sur cette machine. S'il ne répond pas : `Start-Process powershell -ArgumentList "-NoProfile","-ExecutionPolicy","Bypass","-File","$env:USERPROFILE\2b-preview-server.ps1" -WindowStyle Hidden`
- **Publication** : `git push` → GitHub Pages (repo `hawwa708/2b-website`, branche `main`, racine) → https://hawwa708.github.io/2b-website/ (1-2 min de délai). **Ne jamais pousser sans demande explicite du client** ("publie" / "mets en ligne").

## Architecture

Pas de templating : le header (barre flottante), le footer (NAP + JSON-LD Organization/LocalBusiness) et les balises script sont **dupliqués tels quels dans chaque page** depuis `index.html` — reprendre le markup exact (mêmes classes) pour toute nouvelle page, en ajoutant `class="active"` sur le `<li>` de la page courante dans `.main-nav`.

- `assets/css/style.css` — feuille unique partagée : variables de marque et de fonds en `:root`, composants, responsive mobile-first
- `assets/js/main.js` — script unique partagé : init Lenis + GSAP/ScrollTrigger (CDN), header, nav mobile, reveals, animations du hero, carrousels, effet curseur. Chaque init vérifie la présence de ses éléments : les pages sans hero/carrousel fonctionnent sans modification du JS.
- `assets/js/vendor/webgl-fluid-enhanced.umd.js` — seule lib auto-hébergée (effet curseur)
- `assets/img/` — `logo-2b.png` (logo officiel) et `favicon.png` (symbole recadré du logo)

Gabarits pages intérieures déjà dans `style.css` (voir `2b-en-bref.html` comme référence) : `.page-hero` (hero réduit avec dégradé), `.about-split` (texte + image), `.values-grid`/`.value-card`, `.team-card`, `.mini-grid`/`.mini-card` (maillage interne vers d'autres pages).

**Empilement (z-index)** : l'effet curseur vit à `z:1`, SOUS le contenu — `.container` est à `position:relative; z-index:2` et `.curve-top` à `z:0`. Tout contenu d'une nouvelle section doit être dans un `.container` (sinon l'eau du curseur passera devant).

## Charte — contraintes non négociables (validées par le client)

- **Logo** : uniquement `assets/img/logo-2b.png`. Ne JAMAIS recréer d'imitation SVG (explicitement refusée).
- **Couleurs** : orange `#E25B3B` (accent obligatoire), noir `#090909` (texte, jamais en fond dominant), blanc dominant, gris `#808080`. **Aucune teinte bleue nulle part** (le client a fait retirer les blancs bleutés). Exception sombre unique : le bloc vidéo du hero.
- **Rythme de fonds par section** : via les variables `--bg-*` de `:root` (hero dégradé `#F5F1ED`→blanc→pêche `#FDEEE4` ; services blanc ; portfolio `#F7F5F3` ; contact+footer pêche). Appliquer la même logique sur chaque nouvelle page.
- **Typo** : Raleway 600/700 (titres), Roboto 300/400 (corps), avec `font-variant-numeric: lining-nums tabular-nums` hérité du body (chiffres Raleway old-style refusés).
- **Courbes de section** : `.curve-top` (top:-58px), path `M0,60 C360,0 1080,0 1440,60 Z` rempli avec la couleur de SA PROPRE section (chevauche la précédente).
- **Nav desktop** : n'apparaît qu'à ≥1280px (en dessous : burger) ; flex uniquement sur `.main-nav > ul`, items en nowrap.

## Effet curseur — sujet sensible

Simulation de fluide `webgl-fluid-enhanced` (global `WebGLFluidEnhanced`, API `new Ctor(container)` + `setConfig` camelCase + `start()`), conteneur div `#cursor-glow` en `position: fixed !important` (la lib force `relative`), `mix-blend-mode: multiply`. Le client exige de l'**eau mate — jamais de lumière/néon** (nombreux allers-retours). Verrous en place : `brightness: 0.35` (plafond anti-accumulation — validé par le client à cette valeur), `colorPalette` limitée aux oranges 2B, `colorful: false`. Pour ajuster l'intensité, toucher **uniquement** `brightness`. L'aperçu intégré de VS Code ignore le `multiply` et sur-expose l'effet : toujours juger dans un vrai navigateur. Les événements souris sont retransmis de `window` vers le canvas de la lib (canvas en pointer-events:none ; `offsetX` patché via `defineProperty`).

## SEO (à coder dans chaque nouvelle page, pas à corriger après)

Un seul `<h1>` avec le mot-clé principal ; "Dakar" ou "Sénégal" dans les 100 premiers mots ; `<title>` ≤ 60 caractères et meta description ≤ 160 (valeurs déjà rédigées dans le cahier des charges SEO — les reprendre telles quelles, en élargissant « PME » aux cibles du CR 10/07/2026 quand la longueur le permet) ; `alt` descriptif sur chaque image ; JSON-LD Organization + LocalBusiness avec le NAP exact (Rue Tolbiac x Brazza, Dakar ; +221 77 193 43 43 ; info@businessbooster.sn) identique sur toutes les pages ; CTA "Demander un devis" fixe dans le header ; bouton WhatsApp flottant (https://wa.me/221771934343).
