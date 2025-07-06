# Système de Réputation et Badges - DevPrepAi

## 🏆 Vue d'ensemble

Le système de réputation de DevPrepAi est inspiré de Duolingo et offre une expérience gamifiée complète avec classement en temps réel, système de badges avancé et interface moderne utilisant shadcn/ui.

## 🎯 Fonctionnalités principales

### 1. **Interface avec Onglets (Tabs)**
- **Vue d'ensemble** : Statistiques principales et progression
- **Badges** : Collection complète avec raretés
- **Classement** : Classement en temps réel des utilisateurs
- **Activité** : Graphiques et analyses détaillées

### 2. **Système de Niveaux Gamifié**
- **Calcul d'expérience** : 10 XP par point de score obtenu
- **Progression** : 1000 XP requis pour passer au niveau suivant
- **Affichage** : Barre de progression visuelle avec XP restants
- **Badges de niveau** : Débloqués aux niveaux 1, 5, 10, 20

### 3. **Classement en Temps Réel**
- **Mise à jour automatique** : Toutes les 5 secondes
- **Tri intelligent** : Par niveau puis par expérience
- **Indicateurs de tendance** : Flèches montantes/descendantes
- **Badges de rang** : 🏆 pour #1, 🥈 pour #2, 🥉 pour #3
- **Mise en évidence** : L'utilisateur actuel est surligné

### 4. **Badges et Récompenses**
- **5 raretés** : Common, Uncommon, Rare, Epic, Legendary
- **Types de badges** :
  - 🏆 Niveaux (1, 5, 10, 20)
  - 🔥 Séries (3, 7, 30 jours consécutifs)
  - 📝 Quiz (10, 50, 100 quiz complétés)
  - 💯 Scores parfaits (5, 20 scores ≥ 95%)
  - 🎯 Spécialisations par type (QCM, CODING, MOCK_INTERVIEW, SOFT_SKILLS)
  - 🏅 Moyennes (≥ 80%, ≥ 90%)

### 5. **Composants shadcn/ui Utilisés**
- **Tabs** : Navigation entre les sections
- **ScrollArea** : Défilement fluide pour les listes longues
- **Avatar** : Profils utilisateurs avec fallback
- **Button** : Actions et navigation
- **Card** : Organisation du contenu
- **Badge** : Indicateurs de statut
- **Progress** : Barres de progression
- **Separator** : Séparation visuelle

### 6. **Graphiques interactifs avec Recharts**
- **Graphique de progression hebdomadaire** : Graphique en aire avec dégradés et tooltips
- **Graphique de répartition par type** : Graphique en barres avec données de quiz et scores moyens
- **Graphique de répartition des badges** : Graphique en camembert par rareté
- **Composants réutilisables** : WeeklyProgressChart et TypeDistributionChart
- **Design cohérent** : Couleurs et styles harmonisés avec l'interface

### 7. **Navigation et UX**
- **Bouton de retour** : Navigation arrière intégrée
- **Responsive design** : Adapté à tous les écrans
- **Animations** : Transitions fluides et hover effects
- **Icônes Lucide React** : Cohérence visuelle complète

## 🎨 Interface Utilisateur

### Design Responsive
- **Desktop** : Layout 3 colonnes avec onglets
- **Mobile** : Layout vertical avec navigation par onglets
- **Tablet** : Layout hybride optimisé

### Composants Visuels
- **Gradients** : Arrière-plans colorés inspirés de Duolingo
- **Cartes** : Interface moderne avec shadcn/ui
- **Badges** : Couleurs par rareté avec icônes Lucide
- **Animations** : Transitions fluides et hover effects

### Graphiques Interactifs
- **Recharts** : Bibliothèque de graphiques React moderne
- **Progression hebdomadaire** : Graphique en aire avec dégradés
- **Répartition par type** : Graphique en barres avec données multiples
- **Répartition des badges** : Graphique en camembert par rareté
- **Tooltips personnalisés** : Informations détaillées au survol
- **Responsive** : Adaptation automatique à la taille d'écran

## 🔧 Utilisation Technique

### Accès à la page
```typescript
// URL avec paramètre utilisateur
/reputation?id=user-id-here

// Composant de lien
<ReputationLink userId="user-id" />

// Composant de navigation rapide
<ReputationNav userId="user-id" level={5} badgesCount={3} rank={12} />
```

### Données requises
La page nécessite les données suivantes depuis la base de données :
- **User** : Informations de base (nom, email, crédits, date de création)
- **QuizResult** : Tous les résultats de quiz de l'utilisateur
- **Quiz** : Informations sur les quiz (titre, type, difficulté, entreprise)
- **SkillAnalysis** : Analyses de compétences associées

### Fonctions serveur
```typescript
// Récupération des données de réputation
const reputationData = await getUserReputation(userId)

// Récupération du classement
const leaderboardData = await getLeaderboard()
```

## 🎮 Gamification

### Système de Motivation
1. **Progression visible** : Barres de progression et niveaux
2. **Récompenses** : Badges débloqués avec rareté
3. **Séries** : Encouragement à la pratique quotidienne
4. **Spécialisations** : Motivation à explorer différents types
5. **Classement** : Compétition saine entre utilisateurs

### Calculs Automatiques
- **Niveau** : `Math.floor(experience / 1000) + 1`
- **Série** : Jours consécutifs avec activité
- **Badges** : Génération automatique basée sur les performances
- **Réalisations** : Progression en temps réel
- **Classement** : Tri automatique par niveau et expérience

## 🚀 Intégration

### Dans l'application
1. **Page de réputation** : `/reputation?id=userId`
2. **Lien de profil** : Composant `ReputationLink`
3. **Navigation rapide** : Composant `ReputationNav`
4. **Résumé** : Composant `ReputationSummary`

### Exemple d'utilisation
```typescript
// Dans un composant
import ReputationLink from '@/components/reputation-link'
import ReputationNav from '@/components/reputation-nav'
import { ReputationSummary } from '@/components/reputation-nav'

// Affichage du lien
<ReputationLink userId={user.id} variant="outline" />

// Navigation rapide
<ReputationNav 
  userId={user.id} 
  level={5} 
  experience={2500} 
  badgesCount={3} 
  rank={12} 
/>

// Résumé de progression
<ReputationSummary 
  userId={user.id} 
  level={5} 
  experience={2500} 
  badgesCount={3} 
  rank={12} 
/>
```

## 📊 Données de Test

Un script SQL est fourni (`scripts/seed-reputation-data.sql`) pour créer des données de test avec :
- Utilisateur de test avec historique complet
- 8 quiz de différents types et difficultés
- Résultats variés pour tester tous les badges
- Abonnement Premium pour tester les fonctionnalités

## 🎯 Personnalisation

### Couleurs et Thèmes
- **Raretés** : Couleurs configurables dans `rarityColors`
- **Types** : Icônes Lucide personnalisables dans `typeIcons`
- **Difficultés** : Couleurs dans `difficultyColors`

### Seuils et Objectifs
- **Niveaux** : Modifiable dans le calcul d'expérience
- **Badges** : Seuils configurables dans `generateBadges`
- **Réalisations** : Objectifs dans `generateAchievements`
- **Classement** : Fréquence de mise à jour configurable

## 🔮 Évolutions Futures

### Fonctionnalités prévues
- **WebSockets** : Mises à jour en temps réel du classement
- **Défis** : Objectifs temporaires et événements
- **Récompenses** : Système de points échangeables
- **Social** : Partage de badges sur réseaux sociaux
- **Notifications** : Alertes de nouveaux badges et classements
- **Filtres** : Classement par période (semaine, mois, année)

### Améliorations techniques
- **Cache** : Mise en cache des calculs de réputation
- **Webhooks** : Notifications en temps réel
- **API** : Endpoints pour intégrations externes
- **Analytics** : Suivi des métriques de gamification
- **PWA** : Installation comme application mobile

## 🛠️ Composants shadcn/ui Utilisés

### Composants principaux
- **Tabs** : Navigation entre sections
- **ScrollArea** : Défilement fluide
- **Avatar** : Profils utilisateurs
- **Button** : Actions et navigation
- **Card** : Organisation du contenu
- **Badge** : Indicateurs de statut
- **Progress** : Barres de progression
- **Separator** : Séparation visuelle

### Icônes Lucide React
Toutes les icônes utilisent Lucide React pour une cohérence parfaite :
- **Navigation** : ArrowLeft, Home, Settings
- **Statistiques** : BarChart3, PieChart, LineChart, Activity
- **Badges** : Trophy, Star, Award, Crown, Gem, Medal
- **Progression** : TrendingUp, TrendingDown, Target
- **Types de quiz** : FileText, Code, Mic, Handshake
- **Utilisateurs** : Users, User, Avatar
- **Temps** : Clock, Calendar
- **Actions** : CheckCircle, ChevronRight

## 📱 Responsive Design

### Breakpoints
- **Mobile** : < 768px - Layout vertical, onglets empilés
- **Tablet** : 768px - 1024px - Layout hybride
- **Desktop** : > 1024px - Layout 3 colonnes avec sidebar

### Adaptations
- **Navigation** : Onglets adaptatifs sur mobile
- **Cartes** : Taille et espacement optimisés
- **Graphiques** : Responsive avec breakpoints
- **Classement** : Scroll horizontal sur mobile 