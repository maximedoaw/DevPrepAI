// lib/types.ts
// Types pour le client (ne pas importer depuis @prisma/client)

export const ClientRole = {
    ENTERPRISE: 'ENTERPRISE',
    BOOTCAMP: 'BOOTCAMP',
    SCHOOL: 'SCHOOL',
    CANDIDATE: 'CANDIDATE',
    RECRUITER: 'RECRUITER',
    CAREER_CHANGER: 'CAREER_CHANGER',
  } as const;
  
  export type ClientRoleType = keyof typeof ClientRole;
  
  export const ClientDomain = {
    DEVELOPMENT: 'DEVELOPMENT',
    DATA_SCIENCE: 'DATA_SCIENCE',
    FINANCE: 'FINANCE',
    BUSINESS: 'BUSINESS',
    ENGINEERING: 'ENGINEERING',
    DESIGN: 'DESIGN',
    DEVOPS: 'DEVOPS',
    CYBERSECURITY: 'CYBERSECURITY',
    MARKETING: 'MARKETING',
    PRODUCT: 'PRODUCT',
    ARCHITECTURE: 'ARCHITECTURE',
    MOBILE: 'MOBILE',
    WEB: 'WEB',
    COMMUNICATION: 'COMMUNICATION',
    MANAGEMENT: 'MANAGEMENT',
    EDUCATION: 'EDUCATION',
    HEALTH: 'HEALTH',
  } as const;
  
  export type ClientDomainType = keyof typeof ClientDomain;
  
  // Mappings entre les IDs du frontend et les enums
  export const roleMapping: Record<string, ClientRoleType> = {
    "entreprise": "ENTERPRISE",
    "bootcamp": "BOOTCAMP",
    "ecole": "SCHOOL",
    "etudiant": "CANDIDATE",
    "reconversion": "CAREER_CHANGER",
    "recruteur": "RECRUITER"
  };
  
  export const domainMapping: Record<string, ClientDomainType> = {
    "dev": "DEVELOPMENT",
    "data": "DATA_SCIENCE",
    "finance": "FINANCE",
    "business": "BUSINESS",
    "ingenierie": "ENGINEERING",
    "design": "DESIGN",
    "devops": "DEVOPS",
    "cybersecurite": "CYBERSECURITY",
    "marketing": "MARKETING",
    "product": "PRODUCT",
    "architecture": "ARCHITECTURE",
    "mobile": "MOBILE",
    "web": "WEB",
    "communication": "COMMUNICATION",
    "management": "MANAGEMENT",
    "education": "EDUCATION",
    "sante": "HEALTH"
  };