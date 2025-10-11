import { Difficulty } from "@prisma/client";

export enum Domain {
  MACHINE_LEARNING = "MACHINE_LEARNING",
  DEVELOPMENT = "DEVELOPMENT",
  DATA_SCIENCE = "DATA_SCIENCE",
  FINANCE = "FINANCE",
  BUSINESS = "BUSINESS",
  ENGINEERING = "ENGINEERING",
  DESIGN = "DESIGN",
  DEVOPS = "DEVOPS",
  CYBERSECURITY = "CYBERSECURITY",
  MARKETING = "MARKETING",
  PRODUCT = "PRODUCT",
  ARCHITECTURE = "ARCHITECTURE",
  MOBILE = "MOBILE",
  WEB = "WEB",
  COMMUNICATION = "COMMUNICATION",
  MANAGEMENT = "MANAGEMENT",
  EDUCATION = "EDUCATION",
  HEALTH = "HEALTH"
}

export enum JobType {
  FULL_TIME = "FULL_TIME",
  PART_TIME = "PART_TIME",
  CONTRACT = "CONTRACT",
  INTERNSHIP = "INTERNSHIP",
  MISSION = "MISSION",
  CDI = "CDI",
  STAGE = "STAGE",
}

export enum WorkMode {
  REMOTE = "REMOTE",
  ON_SITE = "ON_SITE",
  HYBRID = "HYBRID",
}

export interface JobPosting {
  id: string;
  applications?: Application[];
  companyId: string;
  companyName: string;
  companyLogo?: string;
  title: string;
  description: string;
  location?: string;
  domains: Domain[];
  skills: string[];
  createdAt: Date;
  updatedAt: Date;
  salaryMin?: number;
  salaryMax?: number;
  currency?: string;
  experienceLevel?: Difficulty; // Corrigé : utilisation de l'enum Difficulty
  isActive: boolean;
  metadata?: Record<string, any>;
  matchScore?: number;
  salary?: {
    min: number;
    max: number;
    currency: string;
  };
  type?: JobType;
  workMode?: WorkMode;
}

export interface Application {
  id: string;
  jobId: string;
  userId: string;
  status: 'PENDING' | 'SCREENING' | 'INTERVIEW' | 'ACCEPTED' | 'REJECTED';
  appliedAt: Date;
  screeningCompleted?: boolean;
  screeningScore?: number;
}

export interface JobFilters {
  domains?: Domain[];
  location?: string;
  search?: string;
  jobTypes?: JobType[];
  workModes?: WorkMode[];
  experienceLevels?: Difficulty[]; // Ajouté pour la cohérence
}