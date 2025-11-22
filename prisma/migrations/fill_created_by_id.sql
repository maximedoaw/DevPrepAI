-- Script de migration pour remplir createdById pour les cours existants
-- Ce script doit être exécuté après avoir rendu createdById optionnel

-- Option 1: Si vous avez un utilisateur BOOTCAMP par défaut, utilisez son ID
-- UPDATE bootcamp_courses 
-- SET "createdById" = (SELECT id FROM users WHERE role = 'BOOTCAMP' LIMIT 1)
-- WHERE "createdById" IS NULL;

-- Option 2: Si vous voulez supprimer les cours sans créateur
-- DELETE FROM bootcamp_courses WHERE "createdById" IS NULL;

-- Option 3: Si vous voulez assigner à un utilisateur spécifique (remplacez 'USER_ID' par l'ID réel)
-- UPDATE bootcamp_courses 
-- SET "createdById" = 'USER_ID'
-- WHERE "createdById" IS NULL;

