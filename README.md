🗓️ Roadmap MVP : du simple au complexe
Mois 1 : Fondations & Core

Setup projet & stack

Next.js + TypeScript + Tailwind + shadcnUI.

Prisma + Neon (PostgreSQL).

Upstash Redis (sessions, cache).

Sentry (monitoring).

Auth (LinkedIn OAuth via NextAuth/BetterAuth).
🎯 Cas : un utilisateur peut se connecter en 1 clic et créer un compte.

Profil utilisateur basique

Import LinkedIn : nom, photo, expériences, compétences.

Stockage en DB.

Dashboard → affichage profil minimal.
🎯 Cas : un étudiant peut voir son profil enrichi.

QCM simple (premier test)

Stockage questions/réponses en DB.

UI QCM avec score auto.

Enregistrement résultat (QuizResult).
🎯 Cas : un développeur peut passer un test technique basique.

Mois 2 : Fonctionnalités IA & enrichissement

CV auto-généré

OpenAI → classification Hard Skills / Soft Skills.

Génération PDF via Inngest.

Section « CV » dans le dashboard.
🎯 Cas : un candidat obtient un CV optimisé à partir de LinkedIn.

Badges & progression

Ajout modèle Badge + ProgressTracking.

Attribution automatique après tests réussis.

Progression affichée dans dashboard.
🎯 Cas : un étudiant voit ses progrès gamifiés.

Mock Interview IA (v1)

Chat IA simulant un entretien.

OpenAI → génération questions + analyse réponses.

Stockage des retours en DB.
🎯 Cas : un commercial s’entraîne à gérer une objection client.

Portfolio dynamique

Import projets LinkedIn.

Génération mini-site portfolio (hébergé sur Vercel → SSG).

Export PDF.
🎯 Cas : un ingénieur affiche ses projets en ligne.

Mois 3 : Cibles B2B & Matching

Matching IA basique

Générer embeddings candidats & offres via OpenAI.

Stockage dans Upstash Vector.

Matching → suggestions d’opportunités (Redis cache).
🎯 Cas : une entreprise voit 5 candidats pertinents pour son offre.

Dashboard Écoles / Bootcamps (lite)

Vue liste étudiants.

Progression, badges, CV.

Statistiques insertion (connecté LinkedIn).
🎯 Cas : un bootcamp suit la progression d’une promo.

Dashboard Entreprises / Recruteurs (lite)

Liste candidats filtrables.

Accès CV + portfolio.

Matching intégré.
🎯 Cas : un recruteur trouve un profil junior qualifié.

Paiements & abonnements

Stripe pour gestion paiements.

Plans : Gratuit, Pro, Expert, École, Entreprise.
🎯 Cas : une école s’abonne pour 100 étudiants.

⚙️ Stack technique et détails

Frontend : Next.js 13 App Router + Tailwind CSS + shadcnUI.

Backend API : API Routes Next.js (peut évoluer en microservices).

DB : Neon (PostgreSQL) + Prisma ORM.

Temps réel : Upstash Redis (sessions interview, matching live).

IA : OpenAI (analyse tests, génération CV), HumeAI (émotions mock interviews).

Queue/Jobs : Upstash QStash (emails, batch CV, CRON mensuels).

Matching IA : Upstash Vector (embeddings pour candidats ↔ offres).

Workflow orchestration : Inngest (entretiens multi-étapes, onboarding).

Monitoring : Sentry.

Déploiement : Vercel (app + portfolios dynamiques).

Media : AWS S3 (images, vidéos, audio).

📈 Scales futures (6-24 mois)

Amélioration IA

Mock Interviews voix + émotion (HumeAI deep integration).

Correction code live (Judge0 API).

Marketplace intégrée

Relier recruteurs ↔ candidats avec commissions.

Matching avancé : soft skills + personnalité.

Microtransactions

Achat de CV premium, audits de code, portfolios brandés.

API B2B

API pour écoles (intégrer PrepwiseAI dans leurs LMS).

API entreprises (recrutement en marque blanche).

Internationalisation

Extension vers Afrique francophone (Sénégal, Côte d’Ivoire).

Traduction multi-langue (anglais/français).

Multi-domaines

Étendre au-delà dev : finance, santé, ingénierie, management.

IA personnalisée

Coach personnel par utilisateur (fine-tuning embeddings).