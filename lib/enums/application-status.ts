/**
 * Enum pour les statuts de candidature
 * Cette enum est utilisée pour mapper les statuts entre le frontend et la base de données
 */
export enum ApplicationStatus {
  PENDING = "PENDING",
  REVIEWING = "REVIEWING",
  INTERVIEWING = "INTERVIEWING",
  HIRED = "HIRED",
  REJECTED = "REJECTED",
}

/**
 * Type pour les statuts UI (format minuscule)
 */
export type ApplicationStatusUI = "pending" | "accepted" | "rejected";

/**
 * Fonction pour convertir un statut UI vers le statut Prisma
 */
export function mapUIStatusToPrisma(status: string | ApplicationStatusUI): ApplicationStatus {
  const statusLower = status.toLowerCase();
  switch (statusLower) {
    case "pending":
      return ApplicationStatus.PENDING;
    case "accepted":
      return ApplicationStatus.HIRED;
    case "rejected":
      return ApplicationStatus.REJECTED;
    default:
      return ApplicationStatus.PENDING;
  }
}

/**
 * Fonction pour convertir un statut Prisma vers le format UI
 */
export function mapPrismaStatusToUI(status: string | ApplicationStatus): ApplicationStatusUI {
  switch (status.toUpperCase()) {
    case ApplicationStatus.HIRED:
      return "accepted";
    case ApplicationStatus.REJECTED:
      return "rejected";
    default:
      return "pending";
  }
}
