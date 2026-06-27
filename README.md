# FAITH — Outil pastoral indépendant

Application multiplateforme indépendante (Ionic React + Capacitor) pour les pasteurs : gestion de visites, cultes récurrents, contacts, messages et publications quotidiennes.

Guide rapide

1. Installer dépendances

```bash
npm install
```

2. Lancer en développement

```bash
npm run dev
```

Fonctionnalités incluses dans le prototype
- Gestion des visites, cultes récurrents, contacts et posts quotidiens
- Stockage local offline et export Excel-ready (CSV) + calendrier (iCal)
- Générateur de messages SMS/WhatsApp/Facebook inspirants et centrés sur JÉSUS
- Notifications locales web / Capacitor et packaging mobile Android
- Thème couleur orange feu et interface professionnelle

Mobile Android
1. Construire l’application web : `npm run build`
2. Synchroniser Capacitor : `npm run cap:sync`
3. Ouvrir Android Studio : `npm run cap:open:android`
4. Générer l’APK dans Android Studio via `Build > Build Bundle(s) / APK(s)`

Exemples de code
- `examples/export_csv.js` : export CSV depuis les données pastorales en JavaScript
- `examples/generate_posts.py` : générateur de posts quotidiens en Python
- `examples/local_notification.kt` : snippet Kotlin pour notification locale Android

Support hors-ligne
- Le prototype fonctionne offline avec `localStorage` et exporte les données en CSV/iCal.
- Capacitor ajoute la base pour notifications locales et SQLite mobile.

Notes supplémentaires
- Pour activer les notifications web dans un navigateur, autorisez les notifications lors du chargement du composant de culte.
- Le projet peut évoluer vers un stockage SQLite natif en ajoutant le plugin Capacitor SQLite.

Intégration GitHub
- Le projet est maintenant connecté à GitHub : `https://github.com/franckzeregbe/faith`
- Un workflow GitHub Actions (`.github/workflows/ci.yml`) vérifie `npm install` et `npm run build` à chaque push sur `main`.
- Un hook Git local (`.git/hooks/post-commit`) est installé pour pousser automatiquement après chaque commit local.
- Une branche `dev` peut être utilisée pour le développement actif, tandis que `main` reste stable pour les versions prêtes à publier.
- Une page de démonstration peut être déployée via GitHub Pages à partir de la branche `gh-pages`.
