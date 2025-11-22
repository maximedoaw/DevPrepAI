# Configuration Inngest - Génération automatique des matchings

## 📦 Installation requise

**Important :** Vous devez d'abord installer Inngest :

```bash
npm install inngest
```

## 🔧 Configuration

Une fois Inngest installé, suivez les instructions dans `INNGEST_SETUP.md` pour configurer votre compte Inngest et ajouter les variables d'environnement.

## 📁 Fichiers créés

- `lib/inngest.ts` - Client Inngest
- `app/api/inngest/route.ts` - Serve endpoint pour Inngest
- `inngest/functions.ts` - Fonctions Inngest (cron jobs)
- `INNGEST_SETUP.md` - Documentation complète

## ✅ Fichiers supprimés

Les fichiers de gestion manuelle des cron jobs ont été supprimés :
- ❌ `app/api/cron/generate-matchings/route.ts`
- ❌ `vercel.json` (configuration cron)
- ❌ `.github/workflows/cron-matchings.yml`
- ❌ `CRON_JOB_SETUP.md`

## 🚀 Prochaines étapes

1. Installez Inngest : `npm install inngest`
2. Créez un compte sur [app.inngest.com](https://app.inngest.com)
3. Ajoutez les variables d'environnement (voir `INNGEST_SETUP.md`)
4. Le cron job s'exécutera automatiquement tous les jours à minuit UTC

