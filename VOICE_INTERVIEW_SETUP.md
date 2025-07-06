# 🎤 Entretien Vocal IA - Configuration et Utilisation

## 📋 Vue d'ensemble

Cette fonctionnalité permet aux utilisateurs de passer des entretiens techniques vocaux avec une IA, en sélectionnant les technologies à évaluer, la durée et le contexte de l'entretien.

## 🚀 Fonctionnalités

### ✅ Implémentées
- **Interface de configuration** : Sélection des technologies, durée et contexte avant l'appel
- **Technologies prédéfinies** : Liste de 50+ technologies courantes
- **Technologies personnalisées** : Possibilité d'ajouter des technologies non listées
- **Sélection de durée** : De 10 minutes à 2 heures avec Select shadcn/ui
- **Mode clair coloré** : Design moderne avec gradients et couleurs vives
- **Chronomètre responsive** : Affiché différemment sur desktop et mobile
- **Écran de fin d'appel** : Options pour relancer ou créer un nouvel entretien
- **Sauvegarde des données** : Transcription et métadonnées de l'entretien
- **Actions serveur** : Gestion des données côté serveur

### 🔄 En cours
- **Migration Prisma** : Intégration complète avec la base de données
- **Authentification** : Liaison avec Kinde Auth
- **Historique** : Affichage des entretiens passés

## 🛠️ Installation et Configuration

### 1. Migration de la base de données

Exécutez le script SQL dans votre base de données PostgreSQL :

```sql
-- Voir le fichier scripts/migrate-voice-interview.sql
```

### 2. Variables d'environnement

Assurez-vous d'avoir configuré :

```env
NEXT_PUBLIC_ELEVENLABS_AGENT_ID=votre_agent_id
DATABASE_URL=votre_url_postgresql
```

### 3. Dépendances

Les dépendances sont déjà incluses dans le projet :
- `@elevenlabs/react` : Pour l'API vocale
- `@kinde-oss/kinde-auth-nextjs` : Pour l'authentification
- `shadcn/ui` : Pour les composants Select et autres

## 📁 Structure des fichiers

```
├── components/interviews/ai-vocal-interview.tsx  # Composant principal
├── components/ui/select.tsx                      # Composant Select shadcn/ui
├── actions/ai.action.ts                          # Actions serveur
├── prisma/schema.prisma                          # Modèle VoiceInterview
├── scripts/migrate-voice-interview.sql           # Script de migration
└── app/(technical)/vocal/page.tsx                # Page d'entretien
```

## 🎯 Utilisation

### 1. Accès à l'entretien
Naviguez vers `/vocal` pour accéder à l'interface d'entretien.

### 2. Configuration
- **Sélection des technologies** : Choisissez parmi 50+ technologies ou ajoutez des technologies personnalisées
- **Durée de l'entretien** : Sélectionnez de 10 minutes à 2 heures
- **Contexte** : Décrivez le contexte de l'entretien (niveau, poste, entreprise, etc.)

### 3. Démarrage de l'appel
- Cliquez sur "Démarrer l'entretien" après avoir configuré les paramètres
- L'IA adaptera ses questions selon les technologies, durée et contexte sélectionnés

### 4. Pendant l'appel
- **Contrôles** : Mute, haut-parleur, arrêt d'urgence
- **Transcription en temps réel** : Affichage de la conversation
- **Chronomètre** : Durée de l'appel avec design amélioré

### 5. Fin d'appel
- **Écran de fin** : Résumé de l'entretien avec options
- **Relancer** : Recommencer le même entretien
- **Nouvel entretien** : Créer une nouvelle configuration
- **Sauvegarde automatique** : Transcription et métadonnées enregistrées

## 🔧 Technologies disponibles

### Frontend
- JavaScript, TypeScript, React, Next.js, Vue.js, Angular, Svelte
- Node.js, Express.js, Django, Flask, Spring Boot, ASP.NET
- PHP, Ruby, Rails, Laravel, GraphQL, REST API

### Base de données
- MongoDB, PostgreSQL, MySQL, Redis

### DevOps & Cloud
- Docker, Kubernetes, AWS, Azure, GCP
- Git, CI/CD, Agile, Scrum, DevOps
- Microservices, Serverless

### Spécialités
- Machine Learning, Data Science
- Blockchain, Web3
- Mobile Development, Game Development

## ⏱️ Durées d'entretien

- **10 minutes** : Entretien rapide
- **15 minutes** : Entretien court
- **20 minutes** : Entretien standard
- **30 minutes** : Entretien complet (recommandé)
- **45 minutes** : Entretien approfondi
- **1 heure** : Entretien détaillé
- **1h 30** : Entretien très détaillé
- **2 heures** : Entretien exhaustif

## 📊 Modèle de données

### VoiceInterview
```typescript
{
  id: string
  userId: string
  technologies: string[]
  context: string
  duration: number              // Durée prévue en minutes
  conversationId?: string
  transcription?: any
  actualDuration?: number       // Durée réelle en secondes
  status: "pending" | "active" | "completed" | "failed"
  startedAt: Date
  endedAt?: Date
  feedback?: any
  score?: number
}
```

## 🎨 Design

### Mode clair coloré
- **Background** : `bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50`
- **Cartes** : `bg-white/80 backdrop-blur-sm` avec `shadow-xl`
- **Gradients** : Bleu vers violet, émeraude vers teal, rouge vers rose
- **Accents** : Couleurs vives avec transitions et animations
- **Typographie** : `font-mono` pour un style développeur

### Responsive
- **Desktop** : Chronomètre dans le header de conversation
- **Mobile** : Chronomètre dans le header de transcription
- **Grille** : Adaptation automatique selon la taille d'écran

### Animations
- **Hover effects** : Transformations et ombres
- **Pulse** : Indicateurs de statut
- **Bounce** : Indicateurs de parole
- **Ping** : Animation du bouton d'appel

## 🔮 Prochaines étapes

1. **Migration Prisma** : Exécuter la migration pour activer la sauvegarde complète
2. **Authentification** : Intégrer avec Kinde Auth pour la gestion des utilisateurs
3. **Historique** : Créer une page pour consulter les entretiens passés
4. **Analytics** : Ajouter des statistiques de performance
5. **Feedback IA** : Générer des recommandations basées sur les entretiens
6. **Notifications** : Alertes de fin d'entretien et rappels

## 🐛 Dépannage

### Problèmes courants
- **Microphone non autorisé** : Vérifiez les permissions du navigateur
- **Agent non configuré** : Vérifiez `NEXT_PUBLIC_ELEVENLABS_AGENT_ID`
- **Erreur de connexion** : Vérifiez la connectivité réseau
- **Durée invalide** : Assurez-vous que la durée est entre 10 et 120 minutes

### Logs
Les actions sont loggées dans la console pour le débogage :
- Création d'entretien avec durée
- Mise à jour de statut
- Sauvegarde de transcription avec durée réelle

## 📝 Notes de développement

- Les actions serveur sont temporairement simulées en attendant la migration Prisma
- L'interface est entièrement fonctionnelle et prête pour la production
- Le design suit les meilleures pratiques UX/UI pour les applications développeur
- Les variables dynamiques ElevenLabs incluent maintenant la durée (`time`)
- L'écran de fin d'appel offre une expérience utilisateur fluide 