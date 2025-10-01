🗓️ Roadmap MVP sur 3 mois (10 étapes)
Mois 1 : Fondations techniques & core features

1. Semaine 1 → Setup & architecture

Mise en place du repo Git + CI/CD avec Vercel.

Setup Next.js (frontend + backend API routes).

Intégration Tailwind + shadcnUI.

Setup Neon (PostgreSQL) + Prisma ORM.

Ajout monitoring (Sentry) & analytics (Vercel).

🎯 Livrable : stack prête à coder, base de données fonctionnelle.

2. Semaine 2 → Authentification LinkedIn

Implémentation OAuth2 avec API LinkedIn.

Import automatique : nom, photo, expériences, éducation, compétences.

Stockage utilisateur en DB.

🎯 Livrable : connexion en 1 clic → profil importé dans la DB.

3. Semaine 3 → Profil enrichi + CV auto

Utilisation OpenAI pour classer compétences en hard skills / soft skills.

Génération d’un CV optimisé (format PDF via Inngest).

Interface profil utilisateur avec prévisualisation du CV.

🎯 Livrable : chaque utilisateur a un profil enrichi + CV généré.

4. Semaine 4 → Tests IA (première version)

Définir 2 tests par métier (ex : développeur → QCM logique, commercial → scénario client).

Correction automatique avec OpenAI (texte/choix multiples).

Attribution de badges (stockés en DB).

🎯 Livrable : tests disponibles, scoring auto, badges visibles sur profil.

Mois 2 : Fonctionnalités utilisateur avancées

5. Semaine 5 → Portfolio dynamique

Import projets depuis LinkedIn.

Génération de portfolio en ligne (mini-site SSG via Vercel).

Ajout export PDF portfolio.

🎯 Livrable : chaque utilisateur a un portfolio public + PDF exportable.

6. Semaine 6 → Matching intelligent (v1 basique)

Stockage embeddings des profils (Upstash Redis + OpenAI).

Matching candidat ↔ entreprise basé sur compétences + secteur.

Dashboard utilisateur → suggestions d’opportunités.

🎯 Livrable : moteur de matching simple fonctionnel.

7. Semaine 7 → Dashboard Écoles (lite)

Création comptes “Écoles / Bootcamps”.

Vue liste étudiants + progression (badges obtenus, CV, portfolio).

Statistiques insertion de base (données LinkedIn importées).

🎯 Livrable : écoles peuvent suivre progression de leurs étudiants.

8. Semaine 8 → Dashboard Entreprises (lite)

Création comptes “Entreprise / Recruteur”.

Vue liste candidats disponibles.

Accès aux CV optimisés & portfolios.

Filtrage par compétences + badges.

🎯 Livrable : entreprises peuvent consulter candidats filtrés.

Mois 3 : Finalisation & polish

9. Semaine 9-10 → UX/UI + tests utilisateurs

Amélioration design (dark/light mode).

Tests utilisateurs (étudiants, freelances, entreprises locales).

Optimisation performance + corrections bugs.

🎯 Livrable : MVP utilisable et stable, design épuré & responsive.

10. Semaine 11-12 → Packaging & Go-To-Market

Mise en place plans tarifaires (Stripe intégration).

Rédaction documentation & onboarding.

Déploiement production Vercel + annonces.

Préparation roadmap Scale (phase 2).

🎯 Livrable : MVP lancé officiellement → premiers 500 utilisateurs onboardés.

📊 Résumé visuel

Mois 1 (sem. 1-4) : Fondations techniques + Auth LinkedIn + CV auto + tests IA + badges.

Mois 2 (sem. 5-8) : Portfolio + matching intelligent + dashboards écoles & entreprises.

Mois 3 (sem. 9-12) : UX/UI + tests utilisateurs + intégration paiements + lancement.

👉 En 3 mois, tu obtiens un MVP fonctionnel complet, adressant individus, écoles, entreprises, avec features monétisables dès le jour 1 (abonnements + lifetime).