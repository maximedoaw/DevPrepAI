🧩 Fonctionnalités principales du MVP
1. 🔐 Authentification & Profil

Connexion LinkedIn OAuth2 → import automatique du nom, photo, poste, parcours, compétences.

Sélection du rôle dès l’inscription :

Étudiant / Reconverti / Recruteur / École / Bootcamp / Entreprise.

Stockage utilisateur dans Neon (PostgreSQL) avec Prisma ORM.

🛠️ Stack utilisée :

NextAuth + LinkedIn Provider pour auth.

Prisma + Neon pour gestion du profil.

Upstash Redis pour cache sessions.

2. 🧠 Système d’entretiens IA (le cœur du MVP)
Types d’entretiens disponibles :

QCM → logique et connaissances de base (toutes disciplines).

TECHNICAL → code ou cas technique selon domaine.

SOFT_SKILLS → analyse émotionnelle et comportementale via Hume AI.

MOCK_INTERVIEW → simulation vocale/texte complète avec IA.

Fonctionnement :

L’utilisateur choisit son métier ou domaine (dev, finance, santé, management…).

L’IA génère automatiquement un test adapté via OpenAI GPT-4-turbo.

Les réponses sont analysées :

QCM → auto-correction instantanée.

SOFT_SKILLS → ton émotionnel, vocabulaire, confiance.

MOCK_INTERVIEW → via speech-to-text et scoring IA.

Résultats stockés + badge débloqué.

Exemple :

👨‍💻 Développeur → QCM JavaScript + correction code + simulation RH IA.
👩‍⚕️ Santé → scénario empathie patient + soft skill + gestion stress.
👨‍💼 Manager → mock interview sur leadership + résolution de conflit.

🛠️ Stack utilisée :

OpenAI API (questions, corrections, génération feedback).

Hume AI (analyse émotionnelle dans mock interview).

Upstash Workflow → orchestration des interviews et scoring.

Inngest → génération PDF des rapports d’entretien.

Redis → stockage temporaire des conversations IA.

3. 📇 CV & Portfolio IA

Transformation automatique du profil LinkedIn en CV optimisé IA.

Portfolio web généré dynamiquement (hébergé automatiquement sur Vercel).

Export PDF (via Inngest).

Possibilité de partager un lien public “portfolio.turboIntMax.ai/[username]”.

🛠️ Stack utilisée :

Next.js SSG pour génération portfolio statique.

Inngest pour générer et envoyer CV PDF.

AWS S3 pour stockage des images/media.

Neon pour stocker métadonnées du portfolio.

4. 💼 Matching intelligent IA

Algorithme de mise en relation candidats ↔ entreprises ↔ écoles.

Fonctionne via embeddings vectoriels :

Les profils (LinkedIn + résultats tests) sont vectorisés.

Les offres ou besoins d’entreprises aussi.

Upstash Vector fait le matching sémantique rapide.

Les entreprises voient les profils recommandés avec un score de pertinence.

Les candidats reçoivent les opportunités les plus proches de leurs forces.

🛠️ Stack utilisée :

OpenAI Embeddings API → encodage vectoriel des profils.

Upstash Vector → recherche de similarité.

Redis Streams → synchronisation temps réel du matching.

Next.js Server Actions → matching instantané sur demande.

5. 🏫 Dashboards différenciés par rôle
Étudiant / Reconverti :

Vue progression (badges, tests, niveau IA).

Historique des entretiens.

Statut du matching (opportunités disponibles).

Recommandations IA personnalisées.

École / Bootcamp :

Vue globale des étudiants.

Stats insertion + progression.

Génération de rapports mensuels (via Inngest).

Invitation automatique d’étudiants.

Entreprise / Recruteur :

Liste de candidats filtrés.

Matching intelligent avec filtres métiers/diplômes.

Simulation IA intégrée pour présélectionner.

Export rapport de recrutement.

🛠️ Stack utilisée :

Next.js Route Groups pour séparer les dashboards.

Upstash Redis pour cache global des analytics.

Prisma pour relations (User, ProgressTracking, InterviewResult, Recommendation).

6. 🔔 Automatisation & Sécurité

Emails automatiques (onboarding, résultats, rappels) via QStash + Upstash Workflow.

Rate limiting / anti-abus via Redis.

Sentry pour surveillance d’erreurs.

JWT + NextAuth pour sécurité auth & session.

RGPD-like compliance (opt-out IA, suppression compte).