import { z } from "zod"

export const Difficulty = z.enum(["JUNIOR", "MID", "SENIOR"])
export type Difficulty = z.infer<typeof Difficulty>

export const JobType = z.enum(["FULL_TIME", "PART_TIME", "CONTRACT", "INTERNSHIP", "MISSION", "CDI", "STAGE"])
export type JobType = z.infer<typeof JobType>

export const WorkMode = z.enum(["REMOTE", "ON_SITE", "HYBRID"])
export type WorkMode = z.infer<typeof WorkMode>

export const Domain = z.enum([ 
  "MACHINE_LEARNING",
  "DEVELOPMENT", 
  "DATA_SCIENCE",
  "FINANCE",
  "BUSINESS",
  "ENGINEERING",
  "DESIGN",
  "DEVOPS",
  "CYBERSECURITY",
  "MARKETING",
  "PRODUCT",
  "ARCHITECTURE",
  "MOBILE",
  "WEB",
  "COMMUNICATION",
  "MANAGEMENT",
  "EDUCATION",
  "HEALTH"
])
export type Domain = z.infer<typeof Domain>

export const jobFormSchema = z.object({
  companyName: z.string().min(1, "Le nom de l'entreprise est requis"),
  title: z.string().min(1, "Le titre du poste est requis"),
  description: z.string().min(10, "La description doit contenir au moins 10 caractères"),
  location: z.string().min(1, "La localisation est requise").optional().or(z.literal('')),
  domains: z.array(Domain).min(1, "Au moins un domaine doit être sélectionné"),
  skills: z.array(z.string()).min(1, "Au moins une compétence doit être ajoutée"),
  salaryMin: z.union([z.number().min(0, "Le salaire minimum doit être positif"), z.nan()]).optional().transform(val => isNaN(val as number) ? undefined : val),
  salaryMax: z.union([z.number().min(0, "Le salaire maximum doit être positif"), z.nan()]).optional().transform(val => isNaN(val as number) ? undefined : val),
  currency: z.string().default("FCFA"),
  type: JobType,
  workMode: WorkMode,
  experienceLevel: Difficulty.optional(),
  metadata: z.any().optional()
}).refine((data) => {
  // Vérifier que le salaire max est supérieur au salaire min si les deux sont définis
  if (data.salaryMin && data.salaryMax) {
    return data.salaryMax >= data.salaryMin
  }
  return true
}, {
  message: "Le salaire maximum doit être supérieur ou égal au salaire minimum",
  path: ["salaryMax"]
})

export type JobFormData = z.infer<typeof jobFormSchema>