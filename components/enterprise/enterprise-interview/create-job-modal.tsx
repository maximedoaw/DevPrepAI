"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { 
  Plus, 
  Trash2, 
  Building, 
  MapPin, 
  DollarSign, 
  Users, 
  BookOpen, 
  Target, 
  Zap,
  Check,
  ArrowRight,
  Eye,
  Info,
  Loader2,
  Smartphone,
  Cloud,
  Settings,
  BarChart3,
  Shield,
  Link,
  Laptop,
  Brain,
  Calculator,
  Briefcase,
  Palette,
  Megaphone,
  Package,
  Home,
  MessageSquare,
  Users2,
  GraduationCap,
  Heart
} from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { jobFormSchema, JobFormData, Difficulty, JobType, WorkMode, Domain } from "@/lib/validations/job-validation-form"
import { useJobMutations } from "@/hooks/use-job-queries"

interface CreateJobModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

// Icônes pour chaque domaine
const domainIcons: Record<Domain, React.ReactNode> = {
  MACHINE_LEARNING: <Brain className="w-4 h-4" />,
  DEVELOPMENT: <Laptop className="w-4 h-4" />,
  DATA_SCIENCE: <BarChart3 className="w-4 h-4" />,
  FINANCE: <Calculator className="w-4 h-4" />,
  BUSINESS: <Briefcase className="w-4 h-4" />,
  ENGINEERING: <Settings className="w-4 h-4" />,
  DESIGN: <Palette className="w-4 h-4" />,
  DEVOPS: <Cloud className="w-4 h-4" />,
  CYBERSECURITY: <Shield className="w-4 h-4" />,
  MARKETING: <Megaphone className="w-4 h-4" />,
  PRODUCT: <Package className="w-4 h-4" />,
  ARCHITECTURE: <Home className="w-4 h-4" />,
  MOBILE: <Smartphone className="w-4 h-4" />,
  WEB: <Laptop className="w-4 h-4" />,
  COMMUNICATION: <MessageSquare className="w-4 h-4" />,
  MANAGEMENT: <Users2 className="w-4 h-4" />,
  EDUCATION: <GraduationCap className="w-4 h-4" />,
  HEALTH: <Heart className="w-4 h-4" />
}

// Labels pour les types de job
const jobTypeLabels: Record<JobType, string> = {
  FULL_TIME: "Temps plein",
  PART_TIME: "Temps partiel", 
  CONTRACT: "Contrat",
  INTERNSHIP: "Stage",
  MISSION: "Mission",
  CDI: "CDI",
  STAGE: "Stage"
}

// Labels pour les modes de travail
const workModeLabels: Record<WorkMode, string> = {
  REMOTE: "Télétravail",
  ON_SITE: "Sur site", 
  HYBRID: "Hybride"
}

// Labels pour les niveaux de difficulté
const difficultyLabels: Record<Difficulty, string> = {
  JUNIOR: "Junior",
  MID: "Intermédiaire",
  SENIOR: "Senior"
}

export function CreateJobModal({ open, onOpenChange }: CreateJobModalProps) {
  const [skillInput, setSkillInput] = useState("")
  const [activeStep, setActiveStep] = useState(1)
  
  // Utilisation du hook de mutations
  const { createJobMutation } = useJobMutations()

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
    reset,
    trigger
  } = useForm<JobFormData>({
    resolver: zodResolver(jobFormSchema) as any,
    defaultValues: {
      currency: "FCFA",
      domains: [],
      skills: [],
      location: "",
      salaryMin: undefined,
      salaryMax: undefined
    }
  })

  const selectedDomains = watch("domains") || []
  const selectedSkills = watch("skills") || []
  const companyName = watch("companyName")
  const title = watch("title")
  const type = watch("type")
  const workMode = watch("workMode")
  const experienceLevel = watch("experienceLevel")

  const addSkill = () => {
    if (skillInput.trim() && !selectedSkills.includes(skillInput.trim())) {
      setValue("skills", [...selectedSkills, skillInput.trim()])
      setSkillInput("")
    }
  }

  const removeSkill = (skillToRemove: string) => {
    setValue("skills", selectedSkills.filter(skill => skill !== skillToRemove))
  }

  const toggleDomain = (domain: Domain) => {
    const currentDomains = selectedDomains
    if (currentDomains.includes(domain)) {
      setValue("domains", currentDomains.filter(d => d !== domain))
    } else {
      setValue("domains", [...currentDomains, domain])
    }
  }

  const handleFormSubmit = async (data: JobFormData) => {
    try {
      // Utilisation de la mutation pour créer le job
      await createJobMutation.mutateAsync(data)
      reset()
      setActiveStep(1)
      onOpenChange(false)
    } catch (error) {
      console.error("Erreur lors de la soumission:", error)
      // La gestion d'erreur est déjà faite dans le hook useJobMutations
    }
  }

  const nextStep = async () => {
    const fields = getStepFields(activeStep)
    const isValid = await trigger(fields as any)
    if (isValid) {
      setActiveStep(prev => prev + 1)
    }
  }

  const prevStep = () => {
    setActiveStep(prev => prev - 1)
  }

  const getStepFields = (step: number): (keyof JobFormData)[] => {
    switch (step) {
      case 1: return ['companyName', 'title', 'type', 'workMode']
      case 2: return ['location', 'experienceLevel']
      case 3: return ['domains', 'skills']
      case 4: return ['description']
      default: return []
    }
  }

  const steps = [
    { number: 1, title: "Informations de base", icon: <Building className="w-4 h-4" /> },
    { number: 2, title: "Détails du poste", icon: <MapPin className="w-4 h-4" /> },
    { number: 3, title: "Compétences", icon: <Target className="w-4 h-4" /> },
    { number: 4, title: "Description", icon: <BookOpen className="w-4 h-4" /> },
  ]

  // Utiliser l'état de soumission de la mutation
  const isSubmittingForm = isSubmitting || createJobMutation.isPending

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700">
        <DialogHeader className="text-center space-y-4 pb-6 border-b border-slate-200 dark:border-slate-700">
          <div className="flex justify-center">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-green-500 to-emerald-600 flex items-center justify-center">
              <Building className="w-6 h-6 text-white" />
            </div>
          </div>
          <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-green-600 to-emerald-700 bg-clip-text text-transparent">
            Créer une nouvelle offre
          </DialogTitle>
          <p className="text-slate-600 dark:text-slate-400 text-sm">
            Remplissez les informations pour publier votre offre d'emploi
          </p>
        </DialogHeader>

        {/* Progress Steps */}
        <div className="flex justify-center mb-6">
          <div className="flex items-center space-x-2">
            {steps.map((step, index) => (
              <div key={step.number} className="flex items-center">
                <div className={`
                  flex items-center justify-center w-8 h-8 rounded-full border-2 text-sm transition-all duration-300
                  ${activeStep >= step.number 
                    ? 'bg-green-500 border-green-500 text-white shadow' 
                    : 'border-slate-300 text-slate-400 dark:border-slate-600'
                  }
                `}>
                  {activeStep > step.number ? (
                    <Check className="w-4 h-4" />
                  ) : (
                    step.icon
                  )}
                </div>
                {index < steps.length - 1 && (
                  <div className={`
                    w-8 h-0.5 transition-all duration-300
                    ${activeStep > step.number ? 'bg-green-500' : 'bg-slate-300 dark:bg-slate-600'}
                  `} />
                )}
              </div>
            ))}
          </div>
        </div>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
          {/* Step 1: Informations de base */}
          {activeStep === 1 && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <div className="text-center">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Informations de base</h3>
                <p className="text-slate-600 dark:text-slate-400 text-sm mt-1">
                  Commencez par les informations essentielles du poste
                </p>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="companyName" className="flex items-center gap-2 text-sm font-medium">
                    <Building className="w-4 h-4 text-green-600" />
                    Nom de l'entreprise *
                  </Label>
                  <Input
                    id="companyName"
                    {...register("companyName")}
                    className={errors.companyName ? "border-red-500" : ""}
                    placeholder="Ex: TechCorp SAS"
                  />
                  {errors.companyName && (
                    <p className="text-red-500 text-sm mt-1">{errors.companyName.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="title" className="flex items-center gap-2 text-sm font-medium">
                    <Users className="w-4 h-4 text-green-600" />
                    Titre du poste *
                  </Label>
                  <Input
                    id="title"
                    {...register("title")}
                    className={errors.title ? "border-red-500" : ""}
                    placeholder="Ex: Développeur Full Stack"
                  />
                  {errors.title && (
                    <p className="text-red-500 text-sm mt-1">{errors.title.message}</p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="type" className="text-sm font-medium">
                      Type de contrat *
                    </Label>
                    <Select 
                      value={type} 
                      onValueChange={(value: JobType) => setValue("type", value)}
                    >
                      <SelectTrigger className={errors.type ? "border-red-500" : ""}>
                        <SelectValue placeholder="Type de contrat" />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(jobTypeLabels).map(([value, label]) => (
                          <SelectItem key={value} value={value}>
                            {label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.type && (
                      <p className="text-red-500 text-sm mt-1">{errors.type.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="workMode" className="text-sm font-medium">
                      Mode de travail *
                    </Label>
                    <Select 
                      value={workMode} 
                      onValueChange={(value: WorkMode) => setValue("workMode", value)}
                    >
                      <SelectTrigger className={errors.workMode ? "border-red-500" : ""}>
                        <SelectValue placeholder="Mode de travail" />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(workModeLabels).map(([value, label]) => (
                          <SelectItem key={value} value={value}>
                            {label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.workMode && (
                      <p className="text-red-500 text-sm mt-1">{errors.workMode.message}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Détails du poste */}
          {activeStep === 2 && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <div className="text-center">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Détails du poste</h3>
                <p className="text-slate-600 dark:text-slate-400 text-sm mt-1">
                  Précisez la localisation et le niveau d'expérience
                </p>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="location" className="flex items-center gap-2 text-sm font-medium">
                    <MapPin className="w-4 h-4 text-green-600" />
                    Localisation
                  </Label>
                  <Input
                    id="location"
                    {...register("location")}
                    placeholder="Ex: Paris, France"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="experienceLevel" className="flex items-center gap-2 text-sm font-medium">
                    <Target className="w-4 h-4 text-green-600" />
                    Niveau d'expérience
                  </Label>
                  <Select 
                    value={experienceLevel} 
                    onValueChange={(value: Difficulty) => setValue("experienceLevel", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Choisir le niveau" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(difficultyLabels).map(([value, label]) => (
                        <SelectItem key={value} value={value}>
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-3 gap-4 pt-2">
                  <div className="space-y-2">
                    <Label htmlFor="salaryMin" className="text-sm font-medium">
                      Salaire min
                    </Label>
                    <Input
                      id="salaryMin"
                      type="number"
                      {...register("salaryMin", { valueAsNumber: true })}
                      placeholder="30000"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="salaryMax" className="text-sm font-medium">
                      Salaire max
                    </Label>
                    <Input
                      id="salaryMax"
                      type="number"
                      {...register("salaryMax", { valueAsNumber: true })}
                      placeholder="50000"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="currency" className="text-sm font-medium">
                      Devise
                    </Label>
                    <Input
                      id="currency"
                      {...register("currency")}
                      placeholder="FCFA"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Compétences */}
          {activeStep === 3 && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <div className="text-center">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Compétences requises</h3>
                <p className="text-slate-600 dark:text-slate-400 text-sm mt-1">
                  Sélectionnez les domaines et compétences nécessaires
                </p>
              </div>

              <div className="space-y-6">
                <div className="space-y-3">
                  <Label className="flex items-center gap-2 text-sm font-medium">
                    <Zap className="w-4 h-4 text-green-600" />
                    Domaines *
                  </Label>
                  <div className="grid grid-cols-3 gap-2 max-h-48 overflow-y-auto p-1">
                    {(Object.values(Domain.Enum) as Domain[]).map((domain) => (
                      <div
                        key={domain}
                        className={`
                          p-3 rounded-lg border cursor-pointer transition-all duration-200 text-center
                          ${selectedDomains.includes(domain)
                            ? 'border-green-500 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300'
                            : 'border-slate-200 dark:border-slate-600 hover:border-green-300 dark:hover:border-green-700'
                          }
                        `}
                        onClick={() => toggleDomain(domain)}
                      >
                        <div className="flex flex-col items-center gap-1">
                          <div className={`
                            p-1 rounded transition-colors
                            ${selectedDomains.includes(domain) 
                              ? 'text-green-600 dark:text-green-400' 
                              : 'text-slate-600 dark:text-slate-400'
                            }
                          `}>
                            {domainIcons[domain]}
                          </div>
                          <span className="text-xs font-medium leading-tight">{domain.replace('_', ' ')}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                  {errors.domains && (
                    <p className="text-red-500 text-sm mt-1">{errors.domains.message}</p>
                  )}
                </div>

                <div className="space-y-3">
                  <Label className="flex items-center gap-2 text-sm font-medium">
                    <Target className="w-4 h-4 text-green-600" />
                    Compétences techniques *
                  </Label>
                  <div className="flex gap-2">
                    <Input
                      value={skillInput}
                      onChange={(e) => setSkillInput(e.target.value)}
                      placeholder="Ex: React, Node.js, TypeScript..."
                      onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addSkill())}
                    />
                    <Button type="button" onClick={addSkill} size="sm">
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2 min-h-8">
                    {selectedSkills.map((skill) => (
                      <Badge 
                        key={skill} 
                        variant="secondary" 
                        className="bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300 px-2 py-1 text-xs"
                      >
                        {skill}
                        <button
                          type="button"
                          onClick={() => removeSkill(skill)}
                          className="ml-1 hover:text-red-600 transition-colors"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                  {errors.skills && (
                    <p className="text-red-500 text-sm mt-1">{errors.skills.message}</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Description */}
          {activeStep === 4 && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <div className="text-center">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Description du poste</h3>
                <p className="text-slate-600 dark:text-slate-400 text-sm mt-1">
                  Décrivez les missions et responsabilités
                </p>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="description" className="flex items-center gap-2 text-sm font-medium">
                    <BookOpen className="w-4 h-4 text-green-600" />
                    Description détaillée *
                  </Label>
                  <Textarea
                    id="description"
                    {...register("description")}
                    rows={6}
                    className={errors.description ? "border-red-500" : ""}
                    placeholder="Décrivez en détail les missions, responsabilités, avantages et ce qui rend ce poste unique..."
                  />
                  {errors.description && (
                    <p className="text-red-500 text-sm mt-1">{errors.description.message}</p>
                  )}
                  <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                    <Info className="w-3 h-3" />
                    Une description détaillée attire plus de candidats qualifiés
                  </div>
                </div>

                {/* Aperçu */}
                {(companyName || title) && (
                  <Card className="border-green-200 dark:border-green-800 bg-green-50/50 dark:bg-green-900/20">
                    <CardContent className="p-4">
                      <h4 className="font-semibold text-green-800 dark:text-green-300 mb-2 flex items-center gap-2 text-sm">
                        <Eye className="w-4 h-4" />
                        Aperçu de votre offre
                      </h4>
                      <div className="space-y-1 text-xs">
                        {companyName && <p><strong>Entreprise:</strong> {companyName}</p>}
                        {title && <p><strong>Poste:</strong> {title}</p>}
                        {type && <p><strong>Type:</strong> {jobTypeLabels[type]}</p>}
                        {workMode && <p><strong>Mode:</strong> {workModeLabels[workMode]}</p>}
                        {selectedDomains.length > 0 && (
                          <p><strong>Domaines:</strong> {selectedDomains.map(d => d.replace('_', ' ')).join(", ")}</p>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="flex justify-between pt-4 border-t border-slate-200 dark:border-slate-700">
            <div>
              {activeStep > 1 && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={prevStep}
                >
                  Précédent
                </Button>
              )}
            </div>
            
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Annuler
              </Button>
              
              {activeStep < 4 ? (
                <Button 
                  type="button" 
                  onClick={nextStep}
                  className="bg-green-600 hover:bg-green-700"
                >
                  Continuer
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              ) : (
                <Button 
                  type="submit" 
                  className="bg-green-600 hover:bg-green-700"
                  disabled={isSubmittingForm}
                >
                  {isSubmittingForm ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Publication...
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4 mr-2" />
                      Publier l'offre
                    </>
                  )}
                </Button>
              )}
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}