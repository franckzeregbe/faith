# AGENTS.md

## Règles impératives

- **Ne JAMAIS générer / assembler l'APK release sans demander confirmation à l'utilisateur au préalable.** (Commande concernée : `gradlew assembleRelease`.) Les vérifications de compilation (`compileReleaseKotlin`, `compileDebugKotlin`) sont autorisées sans demande.

## Projet

- Application Android native Kotlin + Jetpack Compose (Material 3), gestion pastorale « FAITH ».
- Projet Gradle dans `android/`, signing config dans `android/local.properties` (non commité).
- Logo officiel de l'app : `LOGO FAITH png.png` à la racine du dépôt → ressource `R.drawable.logo_faith`.