# Script de génération des matchings

## Description

Ce script calcule automatiquement les matchings candidat-entreprise pour tous les postes actifs et les stocke en base de données pour éviter de recalculer à chaque fois.

## Utilisation

### Exécution manuelle

```bash
npx tsx scripts/generate-matchings.ts
```

### Exécution automatique (cron job)

Pour exécuter ce script automatiquement, vous pouvez configurer un cron job :

```bash
# Exécuter tous les jours à 2h du matin
0 2 * * * cd /path/to/project && npx tsx scripts/generate-matchings.ts
```

Ou utiliser un service comme GitHub Actions, Vercel Cron, etc.

## Fonctionnement

1. **Récupération des postes actifs** : Le script récupère tous les postes actifs (`isActive: true`)

2. **Filtrage strict des candidats** : Pour chaque poste, le script filtre les candidats qui :
   - Travaillent dans **au moins un domaine** correspondant au poste
   - Ont **au moins une compétence** correspondante au poste

3. **Calcul des statistiques** : Pour chaque candidat, le script calcule :
   - Les résultats de quiz d'entraînement (QCM, TECHNICAL, MOCK_INTERVIEW)
   - La progression des scores (amélioration dans le temps)
   - Les badges obtenus

4. **Matching avec Gemini** : Le script utilise Gemini pour calculer les scores de matching basés sur :
   - Correspondance des compétences (30%) - avec bonus pour plus de compétences
   - Correspondance des domaines (25%) - avec bonus pour couvrir tous les domaines
   - Correspondance de l'expérience (15%)
   - Performance aux tests (10%)
   - Amélioration des scores (8%)
   - Badges obtenus (5%)
   - Pertinence globale (2%)

5. **Stockage en base** : Les matchings sont stockés dans la table `CandidateMatching` et peuvent être récupérés depuis le cache via l'API `/api/matching/cache`

## Avantages

- ✅ **Performance** : Les matchings sont pré-calculés, pas de calcul à la volée
- ✅ **Cache** : Utilisation de TanStack Query pour le cache côté client
- ✅ **Filtrage strict** : Seuls les candidats correspondants sont évalués
- ✅ **Prise en compte complète** : Résultats de quiz, badges, progression sont pris en compte

## Notes

- Le script supprime les anciens matchings avant de créer les nouveaux
- Seuls les 20 meilleurs matchings sont stockés par poste
- Le script peut prendre du temps si beaucoup de postes actifs

