# Configuration Inngest pour la génération automatique des matchings

Ce document explique comment configurer Inngest pour recalculer automatiquement les matchings candidat-entreprise tous les jours à minuit.

## 🎯 Objectif

Inngest recalcule automatiquement les matchings pour :
- Tous les postes actifs
- Tous les candidats (y compris les nouveaux arrivés sur la plateforme)
- En utilisant les critères de matching définis (domaines, compétences, tests techniques, feedbacks des recruteurs, etc.)

## 🚀 Installation

### 1. Installer Inngest

```bash
npm install inngest
```

### 2. Variables d'environnement

Ajoutez dans votre `.env.local` ou variables d'environnement :

```env
# Inngest
INNGEST_EVENT_KEY=votre-event-key-inngest
INNGEST_SIGNING_KEY=votre-signing-key-inngest
```

**Note :** Ces clés sont disponibles dans votre dashboard Inngest (https://app.inngest.com)

### 3. Créer un compte Inngest

1. Allez sur [https://app.inngest.com](https://app.inngest.com)
2. Créez un compte ou connectez-vous
3. Créez une nouvelle application
4. Copiez les clés `Event Key` et `Signing Key`
5. Ajoutez-les dans vos variables d'environnement

## 📁 Structure des fichiers

```
lib/
  └── inngest.ts              # Client Inngest
app/api/inngest/
  └── route.ts                # Serve endpoint pour Inngest
inngest/
  └── functions.ts            # Fonctions Inngest (cron jobs)
scripts/
  └── generate-matchings.ts   # Script de génération des matchings
```

## ⚙️ Configuration

### Fonction Inngest

La fonction `generateMatchingsDaily` est définie dans `inngest/functions.ts` :

- **ID** : `generate-matchings-daily`
- **Nom** : "Générer les matchings quotidiennement"
- **Schedule** : Tous les jours à minuit UTC (`0 0 * * *`)

### Serve Endpoint

L'endpoint `/api/inngest` sert de webhook pour Inngest. Inngest appelle cet endpoint pour exécuter les fonctions.

## 🔧 Fonctionnement

1. **Inngest appelle l'endpoint** : `/api/inngest` à minuit UTC chaque jour
2. **Exécution de la fonction** : `generateMatchingsDaily` est déclenchée
3. **Génération des matchings** : Le script `generateMatchings()` est exécuté
4. **Stockage en base** : Les 50 meilleurs matchings sont stockés dans `CandidateMatching`

## 📊 Critères de matching

Le cron job utilise les mêmes critères que l'API de matching :

1. **Correspondance des compétences (25%)**
   - Au moins une compétence doit correspondre
   - Bonus si le candidat a plus de compétences que requises

2. **Correspondance des domaines (20%)**
   - **Au moins un domaine doit correspondre** (critère obligatoire)
   - Bonus si le candidat couvre tous les domaines du poste

3. **Portfolio et expérience (15%)**
   - Qualité et pertinence du portfolio
   - Expériences professionnelles

4. **Feedback des recruteurs (15%)**
   - Score moyen sur les tests techniques passés
   - Nombre et qualité des feedbacks

5. **Tests d'entraînement (10%)**
   - Score moyen aux quiz
   - Nombre de quiz complétés

6. **Progression (8%)**
   - Amélioration des scores dans le temps

7. **Badges (4%)**
   - Reconnaissance de l'excellence

8. **Pertinence globale (3%)**

## 🗄️ Stockage en base de données

Les matchings sont stockés dans la table `CandidateMatching` avec :
- `jobPostingId` : ID du poste
- `candidateId` : ID du candidat
- `matchScore` : Score de matching (0-100)
- `skillsMatch` : Pourcentage de correspondance des compétences
- `domainMatch` : Pourcentage de correspondance des domaines
- `experienceMatch` : Pourcentage de correspondance de l'expérience
- `aiReason` : Raison du matching générée par l'IA
- `status` : Statut (PENDING, VIEWED, CONTACTED, REJECTED)

## 📈 Limites

- Le cron job génère les **50 meilleurs matchings** pour chaque poste actif
- Seuls les candidats ayant **au moins 1 domaine correspondant** sont pris en compte
- Les candidats doivent également avoir **au moins 1 compétence correspondante**

## 🧪 Test manuel

Vous pouvez déclencher la fonction manuellement depuis le dashboard Inngest :

1. Allez sur [https://app.inngest.com](https://app.inngest.com)
2. Sélectionnez votre application
3. Allez dans "Functions"
4. Trouvez `generate-matchings-daily`
5. Cliquez sur "Trigger" pour exécuter manuellement

## 🔍 Monitoring

Inngest fournit un dashboard complet pour monitorer :
- **Exécutions** : Historique de toutes les exécutions
- **Logs** : Logs détaillés de chaque exécution
- **Erreurs** : Erreurs avec stack traces
- **Métriques** : Temps d'exécution, taux de succès, etc.

## 🔄 Mise à jour automatique

Le cron job :
1. Supprime les anciens matchings pour chaque poste
2. Recalcule les matchings avec les dernières données
3. Stocke les 50 meilleurs matchings dans la base de données
4. Les matchings sont immédiatement disponibles via l'API `/api/matching`

## 📝 Configuration du serve endpoint

Assurez-vous que l'endpoint `/api/inngest` est accessible publiquement. Inngest doit pouvoir l'appeler.

Pour Vercel/Netlify, l'endpoint sera automatiquement accessible à :
```
https://votre-domaine.com/api/inngest
```

## 🔐 Sécurité

Inngest utilise des clés de signature pour authentifier les requêtes :
- `INNGEST_SIGNING_KEY` : Pour signer les requêtes
- Les requêtes sont automatiquement vérifiées par Inngest

## 📞 Support

En cas de problème :
1. Vérifiez les logs dans le dashboard Inngest
2. Vérifiez que les variables d'environnement sont correctement configurées
3. Vérifiez que la base de données est accessible
4. Vérifiez que la clé API Gemini est valide

## 🎯 Avantages d'Inngest

- ✅ **Fiabilité** : Retry automatique en cas d'erreur
- ✅ **Monitoring** : Dashboard complet avec logs et métriques
- ✅ **Scalabilité** : Gestion automatique de la charge
- ✅ **Simplicité** : Configuration simple avec fonctions déclaratives
- ✅ **Déclenchement manuel** : Possibilité de tester manuellement depuis le dashboard

