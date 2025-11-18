// components/edit-job-modal.tsx
"use client"

import { useState, useEffect } from "react"
import { 
  Building, 
  MapPin, 
  Users, 
  BookOpen, 
  Target, 
  Check,
  ArrowRight,
  ArrowLeft,
  Loader2,
  Smartphone,
  Cloud,
  Settings,
  BarChart3,
  Shield,
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
  Heart,
  Plus,
  X
} from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { useJobMutations } from "@/hooks/useJobQueries"
import { JobPosting, JobType, WorkMode } from "@/types/job"
import { Difficulty, Domain } from "@prisma/client"

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

const jobTypeLabels: Record<JobType, string> = {
  FULL_TIME: "Temps plein",
  PART_TIME: "Temps partiel", 
  CONTRACT: "Contrat",
  INTERNSHIP: "Stage",
  MISSION: "Mission",
  CDI: "CDI",
  STAGE: "Stage"
}

const workModeLabels: Record<WorkMode, string> = {
  REMOTE: "Télétravail",
  ON_SITE: "Sur site", 
  HYBRID: "Hybride"
}

const difficultyLabels: Record<Difficulty, string> = {
  JUNIOR: "Junior",
  MID: "Intermédiaire",
  SENIOR: "Senior"
}

const ALL_DOMAINS: Domain[] = [
  "MACHINE_LEARNING", "DEVELOPMENT", "DATA_SCIENCE", "FINANCE", "BUSINESS", 
  "ENGINEERING", "DESIGN", "DEVOPS", "CYBERSECURITY", "MARKETING", "PRODUCT", 
  "ARCHITECTURE", "MOBILE", "WEB", "COMMUNICATION", "MANAGEMENT", "EDUCATION", "HEALTH"
]

interface EditJobModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  job: JobPosting | null
}

export function EditJobModal({ open, onOpenChange, job }: EditJobModalProps) {
  const [skillInput, setSkillInput] = useState("")
  const [activeStep, setActiveStep] = useState(1)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  // États individuels pour chaque champ du formulaire
  const [companyName, setCompanyName] = useState("")
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [location, setLocation] = useState("")
  const [domains, setDomains] = useState<Domain[]>([])
  const [skills, setSkills] = useState<string[]>([])
  const [salaryMin, setSalaryMin] = useState<number | undefined>(undefined)
  const [salaryMax, setSalaryMax] = useState<number | undefined>(undefined)
  const [currency, setCurrency] = useState("FCFA")
  const [type, setType] = useState<JobType | undefined>(undefined)
  const [workMode, setWorkMode] = useState<WorkMode | undefined>(undefined)
  const [experienceLevel, setExperienceLevel] = useState<Difficulty | undefined>(undefined)
  const [isActive, setIsActive] = useState(true)

  const { updateJobMutation } = useJobMutations()

  // Initialiser les champs avec les données du job
  useEffect(() => {
    if (job) {
      setCompanyName(job.companyName)
      setTitle(job.title)
      setDescription(job.description)
      setLocation(job.location || "")
      setDomains(job.domains)
      setSkills(job.skills)
      setSalaryMin(job.salaryMin || undefined)
      setSalaryMax(job.salaryMax || undefined)
      setCurrency(job.currency || "FCFA")
      setType(job.type)
      setWorkMode(job.workMode)
      setExperienceLevel(job.experienceLevel || undefined)
      setIsActive(job.isActive)
    }
  }, [job])

  const addSkill = () => {
    if (skillInput.trim() && !skills.includes(skillInput.trim())) {
      setSkills(prev => [...prev, skillInput.trim()])
      setSkillInput("")
      if (errors.skills) {
        setErrors(prev => ({ ...prev, skills: "" }))
      }
    }
  }

  const removeSkill = (skillToRemove: string) => {
    setSkills(prev => prev.filter(skill => skill !== skillToRemove))
  }

  const toggleDomain = (domain: Domain) => {
    setDomains(prev => {
      if (prev.includes(domain)) {
        return prev.filter(d => d !== domain)
      } else {
        return [...prev, domain]
      }
    })
    if (errors.domains) {
      setErrors(prev => ({ ...prev, domains: "" }))
    }
  }

  const validateStep = (step: number): boolean => {
    const newErrors: Record<string, string> = {}

    switch (step) {
      case 1:
        if (!companyName.trim()) {
          newErrors.companyName = "Le nom de l'entreprise est requis"
        }
        if (!title.trim()) {
          newErrors.title = "Le titre du poste est requis"
        }
        if (!type) {
          newErrors.type = "Le type de contrat est requis"
        }
        if (!workMode) {
          newErrors.workMode = "Le mode de travail est requis"
        }
        break

      case 2:
        break

      case 3:
        if (domains.length === 0) {
          newErrors.domains = "Au moins un domaine doit être sélectionné"
        }
        if (skills.length === 0) {
          newErrors.skills = "Au moins une compétence doit être ajoutée"
        }
        break

      case 4:
        if (!description.trim()) {
          newErrors.description = "La description est requise"
        } else if (description.trim().length < 10) {
          newErrors.description = "La description doit contenir au moins 10 caractères"
        }
        break
    }

    if (salaryMin && salaryMin < 0) {
      newErrors.salaryMin = "Le salaire minimum doit être positif"
    }
    if (salaryMax && salaryMax < 0) {
      newErrors.salaryMax = "Le salaire maximum doit être positif"
    }
    if (salaryMin && salaryMax && salaryMax < salaryMin) {
      newErrors.salaryMax = "Le salaire maximum doit être supérieur ou égal au salaire minimum"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!job) return

    let isValid = true
    for (let step = 1; step <= 4; step++) {
      if (!validateStep(step)) {
        isValid = false
        setActiveStep(step)
        break
      }
    }

    if (!isValid) return

    try {
      setIsSubmitting(true)
      
      const jobData = {
        companyName,
        title,
        description,
        location: location || undefined,
        domains,
        skills,
        salaryMin,
        salaryMax,
        currency,
        type,
        workMode,
        experienceLevel,
        isActive
      }

      await updateJobMutation.mutateAsync({
        id: job.id,
        data: jobData
      })
      
      setActiveStep(1)
      setErrors({})
      onOpenChange(false)
    } catch (error) {
      console.error("Erreur lors de la mise à jour:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const nextStep = () => {
    if (validateStep(activeStep)) {
      setActiveStep(prev => prev + 1)
    }
  }

  const prevStep = () => {
    setActiveStep(prev => prev - 1)
  }

  const saveAndClose = async () => {
    if (!job) return

    // Valider l'étape actuelle seulement
    if (!validateStep(activeStep)) return

    try {
      setIsSubmitting(true)
      
      const jobData = {
        companyName,
        title,
        description,
        location: location || undefined,
        domains,
        skills,
        salaryMin,
        salaryMax,
        currency,
        type,
        workMode,
        experienceLevel,
        isActive
      }

      await updateJobMutation.mutateAsync({
        id: job.id,
        data: jobData
      })
      
      onOpenChange(false)
    } catch (error) {
      console.error("Erreur lors de la mise à jour:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const steps = [
    { number: 1, title: "Informations de base", icon: <Building className="w-4 h-4" /> },
    { number: 2, title: "Détails du poste", icon: <MapPin className="w-4 h-4" /> },
    { number: 3, title: "Compétences", icon: <Target className="w-4 h-4" /> },
    { number: 4, title: "Description", icon: <BookOpen className="w-4 h-4" /> },
  ]

  const isSubmittingForm = isSubmitting || updateJobMutation.isPending

  if (!job) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700">
        <DialogHeader className="text-center space-y-4 pb-6 border-b border-slate-200 dark:border-slate-700">
          <div className="flex justify-center">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
              <Building className="w-6 h-6 text-white" />
            </div>
          </div>
          <div className="text-center">
            <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-700 bg-clip-text text-transparent">
              Modifier l'offre
            </DialogTitle>
            <p className="text-slate-600 dark:text-slate-400 text-sm mt-2">
              Modifiez les informations de votre offre d'emploi
            </p>
          </div>

          {/* Switch dans l'en-tête */}
          <div className="flex items-center justify-center gap-3 pt-2">
            <Switch
              checked={isActive}
              onCheckedChange={setIsActive}
              className="data-[state=checked]:bg-green-600"
            />
            <span className={`text-sm font-medium ${
              isActive 
                ? 'text-green-700 dark:text-green-400' 
                : 'text-slate-600 dark:text-slate-400'
            }`}>
              Offre {isActive ? "active" : "inactive"}
            </span>
          </div>
        </DialogHeader>

        {/* Progress Steps */}
        <div className="flex justify-center mb-6">
          <div className="flex items-center space-x-2">
            {steps.map((step, index) => (
              <div key={step.number} className="flex items-center">
                <div className={`
                  flex items-center justify-center w-8 h-8 rounded-full border-2 text-sm transition-all duration-300
                  ${activeStep >= step.number 
                    ? 'bg-blue-500 border-blue-500 text-white shadow' 
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
                    ${activeStep > step.number ? 'bg-blue-500' : 'bg-slate-300 dark:bg-slate-600'}
                  `} />
                )}
              </div>
            ))}
          </div>
        </div>

        <form onSubmit={handleFormSubmit} className="space-y-6">
          {/* Étape 1: Informations de base */}
          {activeStep === 1 && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="companyName" className="flex items-center gap-2 text-sm font-medium">
                    <Building className="w-4 h-4 text-blue-600" />
                    Nom de l'entreprise *
                  </Label>
                  <Input
                    id="companyName"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    className={errors.companyName ? "border-red-500" : ""}
                    placeholder="Ex: TechCorp SAS"
                  />
                  {errors.companyName && (
                    <p className="text-red-500 text-sm mt-1">{errors.companyName}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="title" className="flex items-center gap-2 text-sm font-medium">
                    <Users className="w-4 h-4 text-blue-600" />
                    Titre du poste *
                  </Label>
                  <Input
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className={errors.title ? "border-red-500" : ""}
                    placeholder="Ex: Développeur Full Stack"
                  />
                  {errors.title && (
                    <p className="text-red-500 text-sm mt-1">{errors.title}</p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="type" className="text-sm font-medium">
                      Type de contrat *
                    </Label>
                    <Select 
                      value={type} 
                      onValueChange={(value: JobType) => setType(value)}
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
                      <p className="text-red-500 text-sm mt-1">{errors.type}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="workMode" className="text-sm font-medium">
                      Mode de travail *
                    </Label>
                    <Select 
                      value={workMode} 
                      onValueChange={(value: WorkMode) => setWorkMode(value)}
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
                      <p className="text-red-500 text-sm mt-1">{errors.workMode}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Étape 2: Détails du poste */}
          {activeStep === 2 && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="location" className="flex items-center gap-2 text-sm font-medium">
                    <MapPin className="w-4 h-4 text-blue-600" />
                    Localisation
                  </Label>
                  <Input
                    id="location"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="Ex: Paris, France"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="experienceLevel" className="text-sm font-medium">
                    Niveau d'expérience
                  </Label>
                  <Select 
                    value={experienceLevel} 
                    onValueChange={(value: Difficulty) => setExperienceLevel(value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner un niveau" />
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

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="salaryMin" className="text-sm font-medium">
                      Salaire minimum
                    </Label>
                    <Input
                      id="salaryMin"
                      type="number"
                      value={salaryMin || ""}
                      onChange={(e) => setSalaryMin(e.target.value ? Number(e.target.value) : undefined)}
                      className={errors.salaryMin ? "border-red-500" : ""}
                      placeholder="Ex: 30000"
                    />
                    {errors.salaryMin && (
                      <p className="text-red-500 text-sm mt-1">{errors.salaryMin}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="salaryMax" className="text-sm font-medium">
                      Salaire maximum
                    </Label>
                    <Input
                      id="salaryMax"
                      type="number"
                      value={salaryMax || ""}
                      onChange={(e) => setSalaryMax(e.target.value ? Number(e.target.value) : undefined)}
                      className={errors.salaryMax ? "border-red-500" : ""}
                      placeholder="Ex: 45000"
                    />
                    {errors.salaryMax && (
                      <p className="text-red-500 text-sm mt-1">{errors.salaryMax}</p>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="currency" className="text-sm font-medium">
                    Devise
                  </Label>
                  <Select value={currency} onValueChange={setCurrency}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="FCFA">FCFA</SelectItem>
                      <SelectItem value="EUR">EUR</SelectItem>
                      <SelectItem value="USD">USD</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          )}

          {/* Étape 3: Compétences */}
          {activeStep === 3 && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <div className="space-y-4">
                <div>
                  <Label className="text-sm font-medium mb-3 block">
                    Domaines *
                  </Label>
                  <div className="grid grid-cols-3 gap-2 max-h-48 overflow-y-auto">
                    {ALL_DOMAINS.map((domain) => (
                      <Button
                        key={domain}
                        type="button"
                        variant={domains.includes(domain) ? "default" : "outline"}
                        size="sm"
                        onClick={() => toggleDomain(domain)}
                        className="justify-start h-auto py-2 px-3 text-xs"
                      >
                        <span className="flex items-center gap-2">
                          {domainIcons[domain]}
                          {domain.toLowerCase().replace('_', ' ')}
                        </span>
                      </Button>
                    ))}
                  </div>
                  {errors.domains && (
                    <p className="text-red-500 text-sm mt-2">{errors.domains}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="skills" className="text-sm font-medium">
                    Compétences techniques *
                  </Label>
                  <div className="flex gap-2">
                    <Input
                      id="skills"
                      value={skillInput}
                      onChange={(e) => setSkillInput(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
                      placeholder="Ex: React, Node.js, Python..."
                      className="flex-1"
                    />
                    <Button type="button" onClick={addSkill} size="sm">
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                  {errors.skills && (
                    <p className="text-red-500 text-sm mt-1">{errors.skills}</p>
                  )}
                  
                  <div className="flex flex-wrap gap-2 mt-2">
                    {skills.map((skill, index) => (
                      <Badge 
                        key={index} 
                        variant="secondary" 
                        className="px-2 py-1 text-xs bg-green-100 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-800"
                      >
                        {skill}
                        <button
                          type="button"
                          onClick={() => removeSkill(skill)}
                          className="ml-1 hover:text-red-500"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Étape 4: Description */}
          {activeStep === 4 && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <div className="space-y-2">
                <Label htmlFor="description" className="flex items-center gap-2 text-sm font-medium">
                  <BookOpen className="w-4 h-4 text-blue-600" />
                  Description du poste *
                </Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className={`min-h-[200px] ${errors.description ? "border-red-500" : ""}`}
                  placeholder="Décrivez les responsabilités, exigences et avantages du poste..."
                />
                {errors.description && (
                  <p className="text-red-500 text-sm mt-1">{errors.description}</p>
                )}
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {description.length} caractères
                </p>
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
                  <ArrowLeft className="w-4 h-4 mr-2" />
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

              {/* Bouton Sauvegarder après Suivant */}
              <Button
                type="button"
                variant="outline"
                onClick={saveAndClose}
                disabled={isSubmittingForm}
              >
                {isSubmittingForm ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  "Sauvegarder"
                )}
              </Button>
              
              {activeStep < 4 ? (
                <Button 
                  type="button" 
                  onClick={nextStep}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  Suivant
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              ) : (
                <Button 
                  type="submit" 
                  className="bg-blue-600 hover:bg-blue-700"
                  disabled={isSubmittingForm}
                >
                  {isSubmittingForm ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Mise à jour...
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4 mr-2" />
                      Mettre à jour
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