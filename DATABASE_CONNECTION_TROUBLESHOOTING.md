# 🔧 Résolution des Problèmes de Connexion à la Base de Données Neon

## ❌ Erreur Rencontrée

```
Error: P1001: Can't reach database server at `ep-twilight-dew-a8pc7nv0-pooler.eastus2.azure.neon.tech:5432`
```

## 🔍 Causes Possibles

### 1. **Base de données Neon suspendue** (cause la plus fréquente)
Neon suspend automatiquement les bases de données du plan gratuit après 5 minutes d'inactivité.

### 2. **Variable DATABASE_URL manquante ou incorrecte**
La variable d'environnement `DATABASE_URL` n'est pas définie ou contient une URL incorrecte.

### 3. **URL de connexion expirée**
L'URL de connexion dans le fichier `.env` est périmée ou invalide.

## ✅ Solutions

### Solution 1 : Réactiver la Base de Données Neon

1. **Connectez-vous à votre compte Neon** : https://console.neon.tech
2. **Sélectionnez votre projet** (probablement nommé "prepwise" ou similaire)
3. **Cliquez sur votre base de données** pour la réactiver
4. Une fois réactivée, **copiez la nouvelle URL de connexion** depuis le dashboard

### Solution 2 : Vérifier et Configurer DATABASE_URL

1. **Créez un fichier `.env`** à la racine du projet (s'il n'existe pas)
2. **Ajoutez votre URL de connexion** dans ce format :

```env
DATABASE_URL="postgresql://username:password@ep-twilight-dew-a8pc7nv0-pooler.eastus2.azure.neon.tech:5432/neondb?sslmode=require"
```

**Important** : 
- Remplacez `username`, `password`, et l'URL complète par vos vraies valeurs depuis le dashboard Neon
- Utilisez l'URL avec `-pooler` pour les connexions via Prisma (recommandé)

### Solution 3 : Vérifier le Format de l'URL

L'URL Neon doit suivre ce format :

```
postgresql://[user]:[password]@[hostname]:[port]/[database]?sslmode=require
```

**Format pour le pooler (recommandé)** :
```
postgresql://username:password@ep-xxxx-pooler.region.azure.neon.tech:5432/dbname?sslmode=require
```

**Format direct** :
```
postgresql://username:password@ep-xxxx.region.azure.neon.tech:5432/dbname?sslmode=require
```

### Solution 4 : Tester la Connexion

Après avoir configuré votre `.env`, testez la connexion :

```bash
npx prisma db push
```

Si cela fonctionne, vous devriez voir :
```
✔ Your database is now in sync with your schema.
```

## 🛠️ Commandes Utiles

### Générer le client Prisma
```bash
npx prisma generate
```

### Vérifier l'état de la connexion
```bash
npx prisma db pull
```

### Ouvrir Prisma Studio (interface visuelle)
```bash
npx prisma studio
```

## 📝 Vérification Rapide

1. ✅ Fichier `.env` existe à la racine du projet
2. ✅ Variable `DATABASE_URL` est définie dans `.env`
3. ✅ Base de données Neon est active (non suspendue)
4. ✅ URL de connexion est au format correct
5. ✅ URL contient `?sslmode=require` pour la sécurité

## 🔒 Sécurité

⚠️ **IMPORTANT** : Ne commitez jamais votre fichier `.env` dans Git !

Vérifiez que `.env` est dans votre `.gitignore` :
```
.env
.env.local
.env*.local
```

## 📞 Besoin d'Aide ?

Si le problème persiste :
1. Vérifiez les logs dans le dashboard Neon
2. Vérifiez que votre IP n'est pas bloquée
3. Essayez de générer une nouvelle URL de connexion depuis Neon
4. Vérifiez que vous utilisez bien le plan gratuit et non un plan expiré




