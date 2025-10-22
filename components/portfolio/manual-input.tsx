// manual-input.tsx
"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { format } from "date-fns"
import { fr } from "date-fns/locale"
import {
  X,
  Plus,
  User,
  Briefcase,
  BookOpen,
  Award,
  CalendarIcon,
  Upload,
  ImageIcon,
  Trash2,
  ExternalLink,
  Github,
  Languages,
  Heart,
  Code,
  Edit,
  Save,
} from "lucide-react"

// Import Uploadcare correct
import { Widget } from '@uploadcare/react-widget'

interface ManualInputProps {
  portfolioData: any
  setPortfolioData: (data: any) => void
  onSave?: () => void
  isSaving?: boolean
}

export default function ManualInput({ portfolioData, setPortfolioData, onSave, isSaving = false }: ManualInputProps) {
  const [newSkill, setNewSkill] = useState("")
  const [newLanguage, setNewLanguage] = useState("")
  const [newInterest, setNewInterest] = useState("")
  const [uploadingImageType, setUploadingImageType] = useState<"profile" | "project">("profile")
  const [currentProjectIndex, setCurrentProjectIndex] = useState<number | null>(null)
  const widgetApiRef = useRef<any>(null)
  const projectWidgetApiRef = useRef<any>(null)

  const [newExperience, setNewExperience] = useState({
    company: "",
    position: "",
    startDate: new Date(),
    endDate: new Date(),
    current: false,
    description: "",
  })

  const [newEducation, setNewEducation] = useState({
    institution: "",
    degree: "",
    field: "",
    startDate: new Date(),
    endDate: new Date(),
    current: false,
    description: "",
  })

  const [newCertification, setNewCertification] = useState({
    name: "",
    issuer: "",
    date: new Date(),
    expiryDate: null as Date | null,
    credentialId: "",
    url: "",
  })

  const [newProject, setNewProject] = useState({
    title: "",
    description: "",
    technologies: [] as string[],
    projectUrl: "",
    githubUrl: "",
    images: [] as string[],
    startDate: new Date(),
    endDate: new Date(),
    current: false,
  })

  const [newTech, setNewTech] = useState("")

  const skills = portfolioData.skills || []
  const languages = portfolioData.languages || []
  const interests = portfolioData.interests || []
  const experiences = portfolioData.experiences || []
  const education = portfolioData.education || []
  const certifications = portfolioData.certifications || []
  const projects = portfolioData.projects || []

  const validateDates = (startDate: Date, endDate: Date, current: boolean) => {
    if (current) return true
    return startDate <= endDate
  }

  // Gestion de l'upload avec Uploadcare
  const handleImageUpload = (type: "profile" | "project", projectIndex?: number) => {
    setUploadingImageType(type)
    if (type === "project" && projectIndex !== undefined) {
      setCurrentProjectIndex(projectIndex)
    }
    
    if (type === "profile" && widgetApiRef.current) {
      widgetApiRef.current.openDialog()
    } else if (type === "project" && projectWidgetApiRef.current) {
      projectWidgetApiRef.current.openDialog()
    }
  }

  const handleUploadComplete = (info: any) => {
    if (info && info.cdnUrl) {
      const imageUrl = info.cdnUrl

      if (uploadingImageType === "profile") {
        setPortfolioData({
          ...portfolioData,
          profileImage: imageUrl,
        })
      } else if (uploadingImageType === "project" && currentProjectIndex !== null) {
        const updatedProjects = [...projects]
        if (!updatedProjects[currentProjectIndex].images) {
          updatedProjects[currentProjectIndex].images = []
        }
        updatedProjects[currentProjectIndex] = {
          ...updatedProjects[currentProjectIndex],
          images: [...updatedProjects[currentProjectIndex].images, imageUrl],
        }
        setPortfolioData({
          ...portfolioData,
          projects: updatedProjects,
        })
      }
    }
    setCurrentProjectIndex(null)
  }

  const addItem = (field: string, value: string, setter: (value: string) => void) => {
    if (value.trim()) {
      const currentItems = portfolioData[field] || []
      if (!currentItems.includes(value.trim())) {
        setPortfolioData({
          ...portfolioData,
          [field]: [...currentItems, value.trim()],
        })
        setter("")
      }
    }
  }

  const removeItem = (field: string, index: number) => {
    const currentItems = portfolioData[field] || []
    const newItems = currentItems.filter((_: any, i: number) => i !== index)
    setPortfolioData({
      ...portfolioData,
      [field]: newItems,
    })
  }

  const addExperience = () => {
    if (newExperience.company.trim() && newExperience.position.trim()) {
      if (!validateDates(newExperience.startDate, newExperience.endDate, newExperience.current)) {
        alert("La date de fin ne peut pas être antérieure à la date de début")
        return
      }
      setPortfolioData({
        ...portfolioData,
        experiences: [...experiences, { ...newExperience }],
      })
      setNewExperience({
        company: "",
        position: "",
        startDate: new Date(),
        endDate: new Date(),
        current: false,
        description: "",
      })
    }
  }

  const removeExperience = (index: number) => {
    const newExperiences = experiences.filter((_: any, i: number) => i !== index)
    setPortfolioData({
      ...portfolioData,
      experiences: newExperiences,
    })
  }

  const addEducation = () => {
    if (newEducation.institution.trim() && newEducation.degree.trim()) {
      if (!validateDates(newEducation.startDate, newEducation.endDate, newEducation.current)) {
        alert("La date de fin ne peut pas être antérieure à la date de début")
        return
      }
      setPortfolioData({
        ...portfolioData,
        education: [...education, { ...newEducation }],
      })
      setNewEducation({
        institution: "",
        degree: "",
        field: "",
        startDate: new Date(),
        endDate: new Date(),
        current: false,
        description: "",
      })
    }
  }

  const removeEducation = (index: number) => {
    const newEducationList = education.filter((_: any, i: number) => i !== index)
    setPortfolioData({
      ...portfolioData,
      education: newEducationList,
    })
  }

  const addCertification = () => {
    if (newCertification.name.trim() && newCertification.issuer.trim()) {
      setPortfolioData({
        ...portfolioData,
        certifications: [...certifications, { ...newCertification }],
      })
      setNewCertification({
        name: "",
        issuer: "",
        date: new Date(),
        expiryDate: null,
        credentialId: "",
        url: "",
      })
    }
  }

  const removeCertification = (index: number) => {
    const newCertifications = certifications.filter((_: any, i: number) => i !== index)
    setPortfolioData({
      ...portfolioData,
      certifications: newCertifications,
    })
  }

  const addProject = () => {
    if (newProject.title.trim()) {
      if (!validateDates(newProject.startDate, newProject.endDate, newProject.current)) {
        alert("La date de fin ne peut pas être antérieure à la date de début")
        return
      }
      setPortfolioData({
        ...portfolioData,
        projects: [...projects, { ...newProject }],
      })
      setNewProject({
        title: "",
        description: "",
        technologies: [],
        projectUrl: "",
        githubUrl: "",
        images: [],
        startDate: new Date(),
        endDate: new Date(),
        current: false,
      })
      setNewTech("")
    }
  }

  const removeProject = (index: number) => {
    const newProjects = projects.filter((_: any, i: number) => i !== index)
    setPortfolioData({
      ...portfolioData,
      projects: newProjects,
    })
  }

  const addTechToProject = () => {
    if (newTech.trim()) {
      setNewProject({
        ...newProject,
        technologies: [...newProject.technologies, newTech.trim()],
      })
      setNewTech("")
    }
  }

  const removeTechFromProject = (techIndex: number) => {
    setNewProject({
      ...newProject,
      technologies: newProject.technologies.filter((_, index) => index !== techIndex),
    })
  }

  const removeProjectImage = (projectIndex: number, imageIndex: number) => {
    const updatedProjects = [...projects]
    updatedProjects[projectIndex] = {
      ...updatedProjects[projectIndex],
      images: updatedProjects[projectIndex].images.filter((_: any, index: number) => index !== imageIndex),
    }
    setPortfolioData({
      ...portfolioData,
      projects: updatedProjects,
    })
  }

  const handleSave = () => {
    if (onSave) {
      onSave()
    }
  }

  return (
    <Card className="h-full bg-gradient-to-b dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 from-slate-50 via-blue-50 to-slate-100">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <User className="h-5 w-5 text-blue-600" />
            <CardTitle className="text-lg">Saisie Manuelle</CardTitle>
          </div>
          <Button 
            onClick={handleSave} 
            disabled={isSaving}
            size="sm"
            className="flex items-center gap-2"
          >
            {isSaving ? (
              <>
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                <span>Sauvegarde...</span>
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                <span>Sauvegarder</span>
              </>
            )}
          </Button>
        </div>
        <CardDescription className="text-sm">Ajoutez et modifiez votre contenu manuellement</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6 max-h-[calc(100vh-200px)] overflow-y-auto pb-6">
        {/* Photo de profil avec Uploadcare */}
        <div className="space-y-4">
          <label className="text-sm font-medium block">Photo de profil</label>
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-4 border rounded-lg bg-slate-50 dark:bg-slate-800/50">
            <div className="flex-shrink-0">
              {portfolioData.profileImage ? (
                <img
                  src={portfolioData.profileImage}
                  alt="Profile"
                  className="w-20 h-20 rounded-full object-cover border-2 border-slate-200"
                />
              ) : (
                <div className="w-20 h-20 rounded-full bg-slate-200 flex items-center justify-center border-2 border-slate-200">
                  <User className="h-8 w-8 text-slate-400" />
                </div>
              )}
            </div>
            <div className="flex-1 space-y-2 min-w-0">
              {/* Widget Uploadcare caché pour la photo de profil */}
              <div style={{ display: 'none' }}>
                <Widget
                  publicKey={process.env.NEXT_PUBLIC_UPLOADCARE_PUBLIC_KEY || 'demopublickey'}
                  tabs="file camera url"
                  previewStep={true}
                  clearable={true}
                  crop="1:1"
                  imageShrink="800x600 60%"
                  imagesOnly={true}
                  multiple={false}
                  onChange={handleUploadComplete}
                  ref={widgetApiRef}
                />
              </div>
              
              <div className="flex flex-col gap-2">
                <Button
                  onClick={() => handleImageUpload("profile")}
                  variant="outline"
                  size="sm"
                  className="w-full sm:w-auto"
                >
                  {portfolioData.profileImage ? (
                    <>
                      <Edit className="h-4 w-4 mr-2" />
                      Mettre à jour la photo
                    </>
                  ) : (
                    <>
                      <Upload className="h-4 w-4 mr-2" />
                      Choisir une photo
                    </>
                  )}
                </Button>
                {portfolioData.profileImage && (
                  <Button
                    onClick={() => setPortfolioData({ ...portfolioData, profileImage: null })}
                    variant="outline"
                    size="sm"
                    className="w-full sm:w-auto text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Supprimer
                  </Button>
                )}
              </div>
              <p className="text-xs text-slate-500 break-words">
                Format recommandé : JPG, PNG, WebP • Max 5MB • Photo carrée recommandée
              </p>
            </div>
          </div>
        </div>

        {/* Informations de base */}
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block">Nom complet</label>
            <Input
              placeholder="Ex: John Doe"
              value={portfolioData.name || ""}
              onChange={(e) => setPortfolioData({ ...portfolioData, name: e.target.value })}
              className="w-full"
            />
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Phrase d'accroche</label>
            <Input
              placeholder="Ex: Développeur Full-Stack Passionné..."
              value={portfolioData.headline || ""}
              onChange={(e) => setPortfolioData({ ...portfolioData, headline: e.target.value })}
              className="w-full"
            />
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Biographie</label>
            <Textarea
              placeholder="Décrivez votre parcours professionnel, vos compétences et vos aspirations..."
              rows={4}
              value={portfolioData.bio || ""}
              onChange={(e) => setPortfolioData({ ...portfolioData, bio: e.target.value })}
              className="w-full resize-vertical min-h-[100px]"
            />
          </div>
        </div>

        {/* Expériences Professionnelles */}
        <div className="border-t pt-6">
          <div className="flex items-center gap-2 mb-4">
            <Briefcase className="h-5 w-5 text-blue-600" />
            <h3 className="text-lg font-semibold">Expériences Professionnelles</h3>
          </div>

          <div className="space-y-4 mb-4 p-4 border rounded-lg bg-slate-50 dark:bg-slate-800/50">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Entreprise *</label>
                <Input
                  placeholder="Nom de l'entreprise"
                  value={newExperience.company}
                  onChange={(e) => setNewExperience({ ...newExperience, company: e.target.value })}
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Poste *</label>
                <Input
                  placeholder="Votre poste"
                  value={newExperience.position}
                  onChange={(e) => setNewExperience({ ...newExperience, position: e.target.value })}
                />
              </div>
            </div>

            <div className="flex flex-col gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Date de début</label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start text-left font-normal bg-transparent">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {newExperience.startDate
                        ? format(newExperience.startDate, "PPP", { locale: fr })
                        : "Sélectionner une date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={newExperience.startDate}
                      onSelect={(date) => date && setNewExperience({ ...newExperience, startDate: date })}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Date de fin</label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-start text-left font-normal bg-transparent"
                      disabled={newExperience.current}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {newExperience.endDate
                        ? format(newExperience.endDate, "PPP", { locale: fr })
                        : "Sélectionner une date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={newExperience.endDate}
                      onSelect={(date) => date && setNewExperience({ ...newExperience, endDate: date })}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <div className="flex items-center gap-2 mt-2">
                  <input
                    type="checkbox"
                    id="current-job"
                    checked={newExperience.current}
                    onChange={(e) =>
                      setNewExperience({
                        ...newExperience,
                        current: e.target.checked,
                        endDate: e.target.checked ? new Date() : newExperience.endDate,
                      })
                    }
                    className="rounded border-slate-300"
                  />
                  <label htmlFor="current-job" className="text-sm text-slate-600 dark:text-slate-400">
                    Poste actuel
                  </label>
                </div>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Description</label>
              <Textarea
                placeholder="Décrivez vos responsabilités, réalisations et compétences acquises..."
                rows={3}
                value={newExperience.description}
                onChange={(e) => setNewExperience({ ...newExperience, description: e.target.value })}
              />
            </div>

            <Button
              onClick={addExperience}
              className="w-full"
              disabled={!newExperience.company.trim() || !newExperience.position.trim()}
            >
              <Plus className="h-4 w-4 mr-2" />
              Ajouter l'expérience
            </Button>
          </div>

          <div className="space-y-3">
            {experiences.map((exp: any, index: number) => (
              <div
                key={index}
                className="flex flex-col lg:flex-row lg:items-start lg:justify-between p-4 border rounded-lg bg-white dark:bg-slate-800 gap-4"
              >
                <div className="flex-1 space-y-2 min-w-0">
                  <div className="font-semibold text-base break-words">{exp.position}</div>
                  <div className="text-sm text-slate-600 dark:text-slate-400 break-words">{exp.company}</div>
                  <div className="text-xs text-slate-500">
                    {format(exp.startDate, "MMM yyyy", { locale: fr })} -{" "}
                    {exp.current ? "Présent" : format(exp.endDate, "MMM yyyy", { locale: fr })}
                  </div>
                  {exp.description && (
                    <p className="text-sm text-slate-700 dark:text-slate-300 break-words mt-2">{exp.description}</p>
                  )}
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeExperience(index)}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 flex-shrink-0 self-start"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
            {experiences.length === 0 && (
              <div className="text-center py-8 text-slate-500 text-sm border-2 border-dashed border-slate-200 rounded-lg">
                <Briefcase className="h-8 w-8 mx-auto mb-2 text-slate-400" />
                <p>Aucune expérience professionnelle ajoutée</p>
                <p className="text-xs mt-1">Ajoutez votre première expérience professionnelle</p>
              </div>
            )}
          </div>
        </div>

        {/* Formations */}
        <div className="border-t pt-6">
          <div className="flex items-center gap-2 mb-4">
            <BookOpen className="h-5 w-5 text-blue-600" />
            <h3 className="text-lg font-semibold">Formations</h3>
          </div>

          <div className="space-y-4 mb-4 p-4 border rounded-lg bg-slate-50 dark:bg-slate-800/50">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Établissement *</label>
                <Input
                  placeholder="Nom de l'établissement"
                  value={newEducation.institution}
                  onChange={(e) => setNewEducation({ ...newEducation, institution: e.target.value })}
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Diplôme *</label>
                <Input
                  placeholder="Ex: Master, Licence..."
                  value={newEducation.degree}
                  onChange={(e) => setNewEducation({ ...newEducation, degree: e.target.value })}
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Domaine d'étude</label>
              <Input
                placeholder="Ex: Informatique, Marketing..."
                value={newEducation.field}
                onChange={(e) => setNewEducation({ ...newEducation, field: e.target.value })}
              />
            </div>

            <div className="flex flex-col gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Date de début</label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start text-left font-normal bg-transparent">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {newEducation.startDate
                        ? format(newEducation.startDate, "PPP", { locale: fr })
                        : "Sélectionner une date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={newEducation.startDate}
                      onSelect={(date) => date && setNewEducation({ ...newEducation, startDate: date })}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Date de fin</label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-start text-left font-normal bg-transparent"
                      disabled={newEducation.current}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {newEducation.endDate
                        ? format(newEducation.endDate, "PPP", { locale: fr })
                        : "Sélectionner une date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={newEducation.endDate}
                      onSelect={(date) => date && setNewEducation({ ...newEducation, endDate: date })}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <div className="flex items-center gap-2 mt-2">
                  <input
                    type="checkbox"
                    id="current-education"
                    checked={newEducation.current}
                    onChange={(e) =>
                      setNewEducation({
                        ...newEducation,
                        current: e.target.checked,
                        endDate: e.target.checked ? new Date() : newEducation.endDate,
                      })
                    }
                    className="rounded border-slate-300"
                  />
                  <label htmlFor="current-education" className="text-sm text-slate-600 dark:text-slate-400">
                    Formation en cours
                  </label>
                </div>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Description</label>
              <Textarea
                placeholder="Décrivez votre formation, les matières principales, les projets réalisés..."
                rows={3}
                value={newEducation.description}
                onChange={(e) => setNewEducation({ ...newEducation, description: e.target.value })}
              />
            </div>

            <Button
              onClick={addEducation}
              className="w-full"
              disabled={!newEducation.institution.trim() || !newEducation.degree.trim()}
            >
              <Plus className="h-4 w-4 mr-2" />
              Ajouter la formation
            </Button>
          </div>

          <div className="space-y-3">
            {education.map((edu: any, index: number) => (
              <div
                key={index}
                className="flex flex-col lg:flex-row lg:items-start lg:justify-between p-4 border rounded-lg bg-white dark:bg-slate-800 gap-4"
              >
                <div className="flex-1 space-y-2 min-w-0">
                  <div className="font-semibold text-base break-words">{edu.degree}</div>
                  <div className="text-sm text-slate-600 dark:text-slate-400 break-words">{edu.institution}</div>
                  <div className="text-xs text-slate-500 break-words">{edu.field}</div>
                  <div className="text-xs text-slate-500">
                    {format(edu.startDate, "MMM yyyy", { locale: fr })} -{" "}
                    {edu.current ? "Présent" : format(edu.endDate, "MMM yyyy", { locale: fr })}
                  </div>
                  {edu.description && (
                    <p className="text-sm text-slate-700 dark:text-slate-300 break-words mt-2">{edu.description}</p>
                  )}
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeEducation(index)}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 flex-shrink-0 self-start"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
            {education.length === 0 && (
              <div className="text-center py-8 text-slate-500 text-sm border-2 border-dashed border-slate-200 rounded-lg">
                <BookOpen className="h-8 w-8 mx-auto mb-2 text-slate-400" />
                <p>Aucune formation ajoutée</p>
                <p className="text-xs mt-1">Ajoutez votre première formation</p>
              </div>
            )}
          </div>
        </div>

        {/* Certifications */}
        <div className="border-t pt-6">
          <div className="flex items-center gap-2 mb-4">
            <Award className="h-5 w-5 text-blue-600" />
            <h3 className="text-lg font-semibold">Certifications</h3>
          </div>

          <div className="space-y-4 mb-4 p-4 border rounded-lg bg-slate-50 dark:bg-slate-800/50">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Nom de la certification *</label>
                <Input
                  placeholder="Ex: AWS Certified Developer"
                  value={newCertification.name}
                  onChange={(e) => setNewCertification({ ...newCertification, name: e.target.value })}
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Organisme *</label>
                <Input
                  placeholder="Ex: Amazon Web Services"
                  value={newCertification.issuer}
                  onChange={(e) => setNewCertification({ ...newCertification, issuer: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Date d'obtention</label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start text-left font-normal bg-transparent">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {newCertification.date
                        ? format(newCertification.date, "PPP", { locale: fr })
                        : "Sélectionner une date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={newCertification.date}
                      onSelect={(date) => date && setNewCertification({ ...newCertification, date: date })}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Date d'expiration (optionnel)</label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start text-left font-normal bg-transparent">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {newCertification.expiryDate
                        ? format(newCertification.expiryDate, "PPP", { locale: fr })
                        : "Sélectionner une date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={newCertification.expiryDate || undefined}
                      onSelect={(date) => setNewCertification({ ...newCertification, expiryDate: date })}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">ID de certification</label>
                <Input
                  placeholder="Ex: AWS-DEV-12345"
                  value={newCertification.credentialId}
                  onChange={(e) => setNewCertification({ ...newCertification, credentialId: e.target.value })}
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">URL (optionnel)</label>
                <Input
                  placeholder="https://..."
                  value={newCertification.url}
                  onChange={(e) => setNewCertification({ ...newCertification, url: e.target.value })}
                />
              </div>
            </div>

            <Button
              onClick={addCertification}
              className="w-full"
              disabled={!newCertification.name.trim() || !newCertification.issuer.trim()}
            >
              <Plus className="h-4 w-4 mr-2" />
              Ajouter la certification
            </Button>
          </div>

          <div className="space-y-3">
            {certifications.map((cert: any, index: number) => (
              <div
                key={index}
                className="flex flex-col lg:flex-row lg:items-start lg:justify-between p-4 border rounded-lg bg-white dark:bg-slate-800 gap-4"
              >
                <div className="flex-1 space-y-2 min-w-0">
                  <div className="font-semibold text-base break-words">{cert.name}</div>
                  <div className="text-sm text-slate-600 dark:text-slate-400 break-words">{cert.issuer}</div>
                  <div className="text-xs text-slate-500">
                    Obtenu le {format(cert.date, "dd/MM/yyyy", { locale: fr })}
                    {cert.expiryDate && ` • Expire le ${format(cert.expiryDate, "dd/MM/yyyy", { locale: fr })}`}
                  </div>
                  {cert.credentialId && (
                    <div className="text-xs text-slate-500 break-words">ID: {cert.credentialId}</div>
                  )}
                  {cert.url && (
                    <a
                      href={cert.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline text-xs break-all"
                    >
                      Voir la certification
                    </a>
                  )}
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeCertification(index)}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 flex-shrink-0 self-start"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
            {certifications.length === 0 && (
              <div className="text-center py-8 text-slate-500 text-sm border-2 border-dashed border-slate-200 rounded-lg">
                <Award className="h-8 w-8 mx-auto mb-2 text-slate-400" />
                <p>Aucune certification ajoutée</p>
                <p className="text-xs mt-1">Ajoutez votre première certification</p>
              </div>
            )}
          </div>
        </div>

        {/* Compétences */}
        <div className="border-t pt-6">
          <div className="flex items-center gap-2 mb-4">
            <Code className="h-5 w-5 text-blue-600" />
            <h3 className="text-lg font-semibold">Compétences</h3>
          </div>

          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-2">
              <Input
                placeholder="Ajouter une compétence..."
                value={newSkill}
                onChange={(e) => setNewSkill(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === "Enter") {
                    addItem("skills", newSkill, setNewSkill)
                  }
                }}
                className="flex-1"
              />
              <Button
                onClick={() => addItem("skills", newSkill, setNewSkill)}
                className="flex-shrink-0"
                disabled={!newSkill.trim()}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>

            <div className="flex flex-wrap gap-2">
              {skills.map((skill: string, index: number) => (
                <Badge
                  key={index}
                  variant="secondary"
                  className="gap-1 pl-3 pr-2 py-1 text-sm group hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-default break-all"
                >
                  <span className="break-words">{skill}</span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      removeItem("skills", index)
                    }}
                    className="h-3 w-3 cursor-pointer text-slate-500 hover:text-red-600 hover:scale-110 transition-all duration-200 flex items-center justify-center flex-shrink-0"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
              {skills.length === 0 && (
                <div className="text-center w-full py-4 text-slate-500 text-sm border-2 border-dashed border-slate-200 rounded-lg">
                  <Code className="h-6 w-6 mx-auto mb-1 text-slate-400" />
                  <p>Aucune compétence ajoutée</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Langues */}
        <div className="border-t pt-6">
          <div className="flex items-center gap-2 mb-4">
            <Languages className="h-5 w-5 text-blue-600" />
            <h3 className="text-lg font-semibold">Langues</h3>
          </div>

          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-2">
              <Input
                placeholder="Ajouter une langue..."
                value={newLanguage}
                onChange={(e) => setNewLanguage(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === "Enter") {
                    addItem("languages", newLanguage, setNewLanguage)
                  }
                }}
                className="flex-1"
              />
              <Button
                onClick={() => addItem("languages", newLanguage, setNewLanguage)}
                className="flex-shrink-0"
                disabled={!newLanguage.trim()}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>

            <div className="flex flex-wrap gap-2">
              {languages.map((language: string, index: number) => (
                <Badge
                  key={index}
                  variant="secondary"
                  className="gap-1 pl-3 pr-2 py-1 text-sm group hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-default break-all"
                >
                  <span className="break-words">{language}</span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      removeItem("languages", index)
                    }}
                    className="h-3 w-3 cursor-pointer text-slate-500 hover:text-red-600 hover:scale-110 transition-all duration-200 flex items-center justify-center flex-shrink-0"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
              {languages.length === 0 && (
                <div className="text-center w-full py-4 text-slate-500 text-sm border-2 border-dashed border-slate-200 rounded-lg">
                  <Languages className="h-6 w-6 mx-auto mb-1 text-slate-400" />
                  <p>Aucune langue ajoutée</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Centres d'intérêt */}
        <div className="border-t pt-6">
          <div className="flex items-center gap-2 mb-4">
            <Heart className="h-5 w-5 text-blue-600" />
            <h3 className="text-lg font-semibold">Centres d'intérêt</h3>
          </div>

          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-2">
              <Input
                placeholder="Ajouter un centre d'intérêt..."
                value={newInterest}
                onChange={(e) => setNewInterest(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === "Enter") {
                    addItem("interests", newInterest, setNewInterest)
                  }
                }}
                className="flex-1"
              />
              <Button
                onClick={() => addItem("interests", newInterest, setNewInterest)}
                className="flex-shrink-0"
                disabled={!newInterest.trim()}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>

            <div className="flex flex-wrap gap-2">
              {interests.map((interest: string, index: number) => (
                <Badge
                  key={index}
                  variant="secondary"
                  className="gap-1 pl-3 pr-2 py-1 text-sm group hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-default break-all"
                >
                  <span className="break-words">{interest}</span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      removeItem("interests", index)
                    }}
                    className="h-3 w-3 cursor-pointer text-slate-500 hover:text-red-600 hover:scale-110 transition-all duration-200 flex items-center justify-center flex-shrink-0"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
              {interests.length === 0 && (
                <div className="text-center w-full py-4 text-slate-500 text-sm border-2 border-dashed border-slate-200 rounded-lg">
                  <Heart className="h-6 w-6 mx-auto mb-1 text-slate-400" />
                  <p>Aucun centre d'intérêt ajouté</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Projets */}
        <div className="border-t pt-6">
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="projects" className="border rounded-lg px-4">
              <AccordionTrigger className="hover:no-underline">
                <div className="flex items-center gap-2">
                  <ImageIcon className="h-5 w-5 text-blue-600" />
                  <h3 className="text-lg font-semibold">Projets (Optionnel)</h3>
                  <Badge variant="secondary" className="ml-2">
                    {projects.length}
                  </Badge>
                </div>
              </AccordionTrigger>
              <AccordionContent className="pt-4">
                <div className="space-y-6">
                  {/* Formulaire d'ajout de projet */}
                  <div className="space-y-4 p-4 border rounded-lg bg-slate-50 dark:bg-slate-800/50">
                    <div className="grid grid-cols-1 gap-4">
                      <div>
                        <label className="text-sm font-medium mb-2 block">Titre du projet *</label>
                        <Input
                          placeholder="Nom du projet"
                          value={newProject.title}
                          onChange={(e) => setNewProject({ ...newProject, title: e.target.value })}
                          className="w-full"
                        />
                      </div>

                      <div>
                        <label className="text-sm font-medium mb-2 block">Description</label>
                        <Textarea
                          placeholder="Décrivez le projet, ses fonctionnalités, vos contributions et les résultats obtenus..."
                          rows={3}
                          value={newProject.description}
                          onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
                          className="w-full resize-vertical min-h-[80px]"
                        />
                      </div>

                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        <div>
                          <label className="text-sm font-medium mb-2 block">URL du projet (optionnel)</label>
                          <Input
                            placeholder="https://votre-projet.com"
                            value={newProject.projectUrl}
                            onChange={(e) => setNewProject({ ...newProject, projectUrl: e.target.value })}
                            className="w-full"
                          />
                        </div>
                        <div>
                          <label className="text-sm font-medium mb-2 block">GitHub (optionnel)</label>
                          <Input
                            placeholder="https://github.com/votre-repo"
                            value={newProject.githubUrl}
                            onChange={(e) => setNewProject({ ...newProject, githubUrl: e.target.value })}
                            className="w-full"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="text-sm font-medium mb-2 block">Technologies utilisées</label>
                        <div className="flex flex-col sm:flex-row gap-2 mb-3">
                          <Input
                            placeholder="Ajouter une technologie..."
                            value={newTech}
                            onChange={(e) => setNewTech(e.target.value)}
                            onKeyPress={(e) => {
                              if (e.key === "Enter") {
                                addTechToProject()
                              }
                            }}
                            className="flex-1"
                          />
                          <Button size="sm" onClick={addTechToProject} className="flex-shrink-0">
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {newProject.technologies.map((tech, index) => (
                            <Badge
                              key={index}
                              variant="secondary"
                              className="gap-1 pl-3 pr-2 py-1 text-xs group hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-default break-all"
                            >
                              <span className="break-words">{tech}</span>
                              <button
                                onClick={() => removeTechFromProject(index)}
                                className="h-3 w-3 cursor-pointer text-slate-500 hover:text-red-600 hover:scale-110 transition-all duration-200 flex items-center justify-center flex-shrink-0"
                              >
                                <X className="h-3 w-3" />
                              </button>
                            </Badge>
                          ))}
                        </div>
                      </div>

                      <div className="flex flex-col gap-4">
                        <div>
                          <label className="text-sm font-medium mb-2 block">Date de début</label>
                          <Popover>
                            <PopoverTrigger asChild>
                              <Button
                                variant="outline"
                                className="w-full justify-start text-left font-normal bg-transparent"
                              >
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {newProject.startDate
                                  ? format(newProject.startDate, "PPP", { locale: fr })
                                  : "Sélectionner une date"}
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0">
                              <Calendar
                                mode="single"
                                selected={newProject.startDate}
                                onSelect={(date) => date && setNewProject({ ...newProject, startDate: date })}
                                initialFocus
                              />
                            </PopoverContent>
                          </Popover>
                        </div>
                        <div>
                          <label className="text-sm font-medium mb-2 block">Date de fin</label>
                          <Popover>
                            <PopoverTrigger asChild>
                              <Button
                                variant="outline"
                                className="w-full justify-start text-left font-normal bg-transparent"
                                disabled={newProject.current}
                              >
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {newProject.endDate
                                  ? format(newProject.endDate, "PPP", { locale: fr })
                                  : "Sélectionner une date"}
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0">
                              <Calendar
                                mode="single"
                                selected={newProject.endDate}
                                onSelect={(date) => date && setNewProject({ ...newProject, endDate: date })}
                                initialFocus
                              />
                            </PopoverContent>
                          </Popover>
                          <div className="flex items-center gap-2 mt-2">
                            <input
                              type="checkbox"
                              id="current-project"
                              checked={newProject.current}
                              onChange={(e) =>
                                setNewProject({
                                  ...newProject,
                                  current: e.target.checked,
                                  endDate: e.target.checked ? new Date() : newProject.endDate,
                                })
                              }
                              className="rounded border-slate-300"
                            />
                            <label htmlFor="current-project" className="text-sm text-slate-600 dark:text-slate-400">
                              Projet en cours
                            </label>
                          </div>
                        </div>
                      </div>
                    </div>

                    <Button onClick={addProject} className="w-full" disabled={!newProject.title.trim()}>
                      <Plus className="h-4 w-4 mr-2" />
                      Ajouter le projet
                    </Button>
                  </div>

                  {/* Liste des projets existants */}
                  <div className="space-y-4">
                    {projects.map((project: any, index: number) => (
                      <div key={index} className="p-4 border rounded-lg bg-white dark:bg-slate-800 space-y-4">
                        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                          <div className="flex-1 space-y-2 min-w-0">
                            <div className="font-semibold text-lg break-words">{project.title}</div>
                            <div className="text-sm text-slate-600 dark:text-slate-400">
                              {format(project.startDate, "MMM yyyy", { locale: fr })} -{" "}
                              {project.current ? "Présent" : format(project.endDate, "MMM yyyy", { locale: fr })}
                            </div>
                            {project.description && (
                              <p className="text-sm text-slate-700 dark:text-slate-300 break-words">
                                {project.description}
                              </p>
                            )}
                            {project.technologies && project.technologies.length > 0 && (
                              <div className="flex flex-wrap gap-1 mt-2">
                                {project.technologies.map((tech: string, techIndex: number) => (
                                  <Badge key={techIndex} variant="secondary" className="text-xs break-words">
                                    {tech}
                                  </Badge>
                                ))}
                              </div>
                            )}
                            {(project.projectUrl || project.githubUrl) && (
                              <div className="flex flex-wrap gap-4 mt-2 text-sm">
                                {project.projectUrl && (
                                  <a
                                    href={project.projectUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-blue-600 hover:underline flex items-center gap-1 break-all"
                                  >
                                    <ExternalLink className="h-3 w-3" />
                                    Lien du projet
                                  </a>
                                )}
                                {project.githubUrl && (
                                  <a
                                    href={project.githubUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-blue-600 hover:underline flex items-center gap-1 break-all"
                                  >
                                    <Github className="h-3 w-3" />
                                    GitHub
                                  </a>
                                )}
                              </div>
                            )}
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeProject(index)}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 flex-shrink-0 self-start"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>

                        <div>
                          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-3">
                            <label className="text-sm font-medium">Images du projet</label>
                            {/* Widget Uploadcare caché pour les projets */}
                            <div style={{ display: 'none' }}>
                              <Widget
                                publicKey={process.env.NEXT_PUBLIC_UPLOADCARE_PUBLIC_KEY || 'demopublickey'}
                                tabs="file camera url"
                                previewStep={true}
                                clearable={true}
                                crop="free"
                                imageShrink="800x600 60%"
                                imagesOnly={true}
                                multiple={true}
                                onChange={handleUploadComplete}
                                ref={projectWidgetApiRef}
                              />
                            </div>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleImageUpload("project", index)}
                              className="flex-shrink-0"
                            >
                              <Plus className="h-3 w-3 mr-1" />
                              Ajouter une image
                            </Button>
                          </div>
                          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                            {project.images?.map((image: string, imageIndex: number) => (
                              <div key={imageIndex} className="relative group">
                                <img
                                  src={image}
                                  alt={`${project.title} ${imageIndex + 1}`}
                                  className="w-full h-20 object-cover rounded border"
                                />
                                <button
                                  onClick={() => removeProjectImage(index, imageIndex)}
                                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                  <X className="h-3 w-3" />
                                </button>
                              </div>
                            ))}
                            {(!project.images || project.images.length === 0) && (
                              <div className="col-span-full text-center py-4 text-slate-500 text-sm border-2 border-dashed border-slate-200 rounded-lg">
                                Aucune image ajoutée
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                    {projects.length === 0 && (
                      <div className="text-center py-8 text-slate-500 text-sm border-2 border-dashed border-slate-200 rounded-lg">
                        <ImageIcon className="h-8 w-8 mx-auto mb-2 text-slate-400" />
                        <p>Aucun projet ajouté</p>
                        <p className="text-xs mt-1">Commencez par ajouter votre premier projet</p>
                      </div>
                    )}
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </CardContent>
    </Card>
  )
}