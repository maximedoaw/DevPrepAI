/**
 * Script de migration pour remplir createdById pour les cours existants
 * 
 * Ce script doit être exécuté après avoir rendu createdById optionnel dans le schéma.
 * Il assigne les cours existants à un utilisateur BOOTCAMP.
 * 
 * Usage: npx tsx scripts/migrate-bootcamp-courses.ts
 */

import prisma from "@/db/prisma"

async function migrateBootcampCourses() {
  try {
    console.log("🔄 Début de la migration des cours bootcamp...")

    // Récupérer tous les cours sans createdById
    const coursesWithoutCreator = await prisma.bootcampCourse.findMany({
      where: {
        createdById: null
      }
    })

    console.log(`📚 ${coursesWithoutCreator.length} cours trouvés sans créateur`)

    if (coursesWithoutCreator.length === 0) {
      console.log("✅ Aucun cours à migrer")
      return
    }

    // Trouver un utilisateur BOOTCAMP (le premier trouvé)
    const bootcampUser = await prisma.user.findFirst({
      where: {
        role: "BOOTCAMP"
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true
      }
    })

    if (!bootcampUser) {
      console.error("❌ Aucun utilisateur BOOTCAMP trouvé dans la base de données")
      console.log("💡 Créez d'abord un utilisateur avec le rôle BOOTCAMP")
      return
    }

    console.log(`👤 Utilisateur BOOTCAMP trouvé: ${bootcampUser.firstName} ${bootcampUser.lastName} (${bootcampUser.email})`)

    // Mettre à jour tous les cours sans créateur
    const result = await prisma.bootcampCourse.updateMany({
      where: {
        createdById: null
      },
      data: {
        createdById: bootcampUser.id
      }
    })

    console.log(`✅ ${result.count} cours(s) mis à jour avec succès`)
    console.log("🎉 Migration terminée!")

  } catch (error) {
    console.error("❌ Erreur lors de la migration:", error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

// Exécuter la migration
migrateBootcampCourses()
  .then(() => {
    console.log("✅ Script terminé avec succès")
    process.exit(0)
  })
  .catch((error) => {
    console.error("❌ Erreur fatale:", error)
    process.exit(1)
  })

