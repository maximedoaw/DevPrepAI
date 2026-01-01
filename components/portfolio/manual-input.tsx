"use client"

import type React from "react"
import { useState, useCallback } from "react"
import { useDropzone } from "react-dropzone"
import { useUploadThing } from "@/lib/uploadthing"
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
  Trash2,
  Languages,
  Heart,
  Code,
  Save,
  Loader,
  Image as ImageIcon,
} from "lucide-react"
import { cn } from "@/lib/utils"

// Reusable Image Upload Component
interface ImageUploadProps {
  value?: string | null
  onChange: (url: string) => void
  onRemove: () => void
  disabled?: boolean
  label?: string
  className?: string
}

function ImageUpload({ value, onChange, onRemove, disabled, label = "Glissez ou cliquez pour uploader", className }: ImageUploadProps) {
  const { startUpload, isUploading } = useUploadThing("mediaUploader", {
    onClientUploadComplete: (res) => {
      if (res && res[0]) {
        onChange(res[0].url)
      }
    },
    onUploadError: (error: Error) => {
      console.error("Upload error:", error)
    }
  })

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      startUpload(acceptedFiles)
    }
  }, [startUpload])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': [] },
    maxFiles: 1,
    disabled: disabled || isUploading
  })

  if (value) {
    return (
      <div className={cn("relative rounded-xl overflow-hidden group border border-slate-200 dark:border-slate-800", className)}>
        <img src={value} alt="Upload" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <Button
            type="button"
            variant="destructive"
            size="icon"
            onClick={(e) => { e.stopPropagation(); onRemove(); }}
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div
      {...getRootProps()}
      className={cn(
        "border-2 border-dashed rounded-xl flex flex-col items-center justify-center cursor-pointer transition-all duration-200 text-center p-4",
        isDragActive ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-950/20" : "border-slate-200 dark:border-slate-700 hover:border-emerald-400 hover:bg-slate-50 dark:hover:bg-slate-800/50",
        className
      )}
    >
      <Input {...getInputProps()} />
      {isUploading ? (
        <Loader className="w-6 h-6 animate-spin text-emerald-500" />
      ) : (
        <>
          <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-2">
            <Upload className="w-5 h-5 text-slate-500 dark:text-slate-400" />
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium px-2">{label}</p>
        </>
      )}
    </div>
  )
}

interface ManualInputProps {
  portfolioData: any
  setPortfolioData: (data: any) => void
  onSave?: () => void
  isSaving?: boolean
  className?: string
}

export default function ManualInput({ portfolioData, setPortfolioData, onSave, isSaving = false, className }: ManualInputProps) {
  // State definitions
  const [newSkill, setNewSkill] = useState("")
  const [newLanguage, setNewLanguage] = useState("")
  const [newInterest, setNewInterest] = useState("")

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
  const projects = portfolioData.projects || []

  // Helper function
  const updateField = (field: string, value: any) => {
    setPortfolioData({ ...portfolioData, [field]: value })
  }

  // --- Handlers ---
  const addSkill = () => {
    if (newSkill.trim() && !skills.includes(newSkill.trim())) {
      updateField("skills", [...skills, newSkill.trim()])
      setNewSkill("")
    }
  }
  const removeSkill = (skillToRemove: string) => {
    updateField("skills", skills.filter((skill: string) => skill !== skillToRemove))
  }

  const addLanguage = () => {
    if (newLanguage.trim() && !languages.includes(newLanguage.trim())) {
      updateField("languages", [...languages, newLanguage.trim()])
      setNewLanguage("")
    }
  }
  const removeLanguage = (langToRemove: string) => {
    updateField("languages", languages.filter((lang: string) => lang !== langToRemove))
  }

  const addInterest = () => {
    if (newInterest.trim() && !interests.includes(newInterest.trim())) {
      updateField("interests", [...interests, newInterest.trim()])
      setNewInterest("")
    }
  }
  const removeInterest = (interestToRemove: string) => {
    updateField("interests", interests.filter((int: string) => int !== interestToRemove))
  }

  const addExperience = () => {
    if (newExperience.company && newExperience.position) {
      updateField("experiences", [...experiences, newExperience])
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
    updateField("experiences", experiences.filter((_: any, i: number) => i !== index))
  }

  const addEducation = () => {
    if (newEducation.institution && newEducation.degree) {
      updateField("education", [...education, newEducation])
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
    updateField("education", education.filter((_: any, i: number) => i !== index))
  }

  const addProject = () => {
    if (newProject.title) {
      updateField("projects", [...projects, newProject])
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
    }
  }
  const removeProject = (index: number) => {
    updateField("projects", projects.filter((_: any, i: number) => i !== index))
  }
  const addTechToProject = () => {
    if (newTech.trim() && !newProject.technologies.includes(newTech.trim())) {
      setNewProject({ ...newProject, technologies: [...newProject.technologies, newTech.trim()] })
      setNewTech("")
    }
  }
  const removeTechFromProject = (techToRemove: string) => {
    setNewProject({
      ...newProject,
      technologies: newProject.technologies.filter((t) => t !== techToRemove),
    })
  }

  return (
    <div className={cn("space-y-6 pb-24 max-w-5xl mx-auto", className)}>
      <Accordion type="single" collapsible defaultValue="profile" className="w-full space-y-4">

        {/* --- PROFILE ITEM --- */}
        <AccordionItem value="profile" className="border-none bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
          <AccordionTrigger className="px-6 py-4 hover:no-underline hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400">
                <User className="h-5 w-5" />
              </div>
              <div className="text-left">
                <h3 className="font-semibold text-slate-900 dark:text-white text-base">Profil & Informations</h3>
                <p className="text-xs text-slate-500 font-normal mt-0.5">Photo, nom, titre et bio</p>
              </div>
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-6 pb-8 pt-4">
            <div className="space-y-6">

              {/* Image Upload Area - Full Width Stack */}
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Photo de profil</label>
                <div className="w-full h-40">
                  <ImageUpload
                    value={portfolioData.profileImage}
                    onChange={(url) => updateField("profileImage", url)}
                    onRemove={() => updateField("profileImage", null)}
                    className="w-full h-full bg-slate-50 dark:bg-slate-800/50"
                    label="Glissez votre photo ici"
                  />
                </div>
              </div>

              {/* Inputs Area - Stacked */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Nom complet</label>
                  <Input
                    value={portfolioData.name || ""}
                    onChange={(e) => updateField("name", e.target.value)}
                    placeholder="ex: Jean Dupont"
                    className="h-11"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Titre / Headline</label>
                  <Input
                    value={portfolioData.headline || ""}
                    onChange={(e) => updateField("headline", e.target.value)}
                    placeholder="ex: Développeur Full-Stack"
                    className="h-11"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Bio</label>
                  <Textarea
                    value={portfolioData.bio || ""}
                    onChange={(e) => updateField("bio", e.target.value)}
                    rows={6}
                    placeholder="Racontez votre histoire en quelques lignes..."
                    className="resize-none text-base"
                  />
                </div>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* --- EXPERIENCE ITEM --- */}
        <AccordionItem value="experiences" className="border-none bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
          <AccordionTrigger className="px-6 py-4 hover:no-underline hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                <Briefcase className="h-5 w-5" />
              </div>
              <div className="text-left">
                <h3 className="font-semibold text-slate-900 dark:text-white text-base">Expériences</h3>
                <p className="text-xs text-slate-500 font-normal mt-0.5">{experiences.length} ajoutée(s)</p>
              </div>
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-6 pb-8 pt-4 space-y-8">
            {/* List */}
            {experiences.length > 0 && (
              <div className="space-y-3">
                {experiences.map((exp: any, index: number) => (
                  <div key={index} className="flex items-center justify-between p-4 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 gap-4">
                    <div>
                      <h4 className="font-bold text-slate-900 dark:text-white">{exp.position}</h4>
                      <div className="text-sm text-slate-500 flex flex-wrap gap-2 items-center mt-1">
                        <span className="text-emerald-600 font-medium">{exp.company}</span>
                        <span>•</span>
                        <span>{new Date(exp.startDate).getFullYear()} - {exp.current ? "Présent" : new Date(exp.endDate).getFullYear()}</span>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => removeExperience(index)} className="text-slate-400 hover:text-red-500">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}

            {/* Form - Stacked */}
            <div className="p-6 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-2xl bg-slate-50/30 dark:bg-slate-800/10 space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-500 uppercase">Entreprise</label>
                <Input className="bg-white dark:bg-slate-900 h-11" placeholder="ex: Google" value={newExperience.company} onChange={(e) => setNewExperience({ ...newExperience, company: e.target.value })} />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-500 uppercase">Poste</label>
                <Input className="bg-white dark:bg-slate-900 h-11" placeholder="ex: Senior Product Designer" value={newExperience.position} onChange={(e) => setNewExperience({ ...newExperience, position: e.target.value })} />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-500 uppercase">Début</label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className={cn("w-full h-11 justify-start text-left font-normal bg-white dark:bg-slate-900", !newExperience.startDate && "text-muted-foreground")}>
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {newExperience.startDate ? format(newExperience.startDate, "MMM yyyy", { locale: fr }) : "Choisir"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0"><Calendar mode="single" selected={newExperience.startDate} onSelect={(date) => date && setNewExperience({ ...newExperience, startDate: date })} initialFocus /></PopoverContent>
                </Popover>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-500 uppercase">Fin</label>
                <div className="flex gap-2">
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className={cn("flex-1 h-11 justify-start text-left font-normal bg-white dark:bg-slate-900", !newExperience.endDate && "text-muted-foreground")} disabled={newExperience.current}>
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {newExperience.current ? "Présent" : (newExperience.endDate ? format(newExperience.endDate, "MMM yyyy", { locale: fr }) : "Choisir")}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0"><Calendar mode="single" selected={newExperience.endDate} onSelect={(date) => date && setNewExperience({ ...newExperience, endDate: date })} initialFocus /></PopoverContent>
                  </Popover>
                  <Button
                    variant={newExperience.current ? "default" : "outline"}
                    onClick={() => setNewExperience({ ...newExperience, current: !newExperience.current })}
                    className={cn("h-11", newExperience.current ? "bg-emerald-500 hover:bg-emerald-600" : "bg-white dark:bg-slate-900")}
                  >
                    Présent
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-500 uppercase">Description</label>
                <Textarea className="bg-white dark:bg-slate-900 min-h-[120px]" placeholder="Responsabilités..." value={newExperience.description} onChange={(e) => setNewExperience({ ...newExperience, description: e.target.value })} />
              </div>

              <Button onClick={addExperience} className="w-full bg-slate-900 text-white hover:bg-slate-800 h-11 mt-4">
                <Plus className="w-4 h-4 mr-2" /> Ajouter
              </Button>
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* --- EDUCATION ITEM --- */}
        <AccordionItem value="education" className="border-none bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
          <AccordionTrigger className="px-6 py-4 hover:no-underline hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center text-purple-600 dark:text-purple-400">
                <BookOpen className="h-5 w-5" />
              </div>
              <div className="text-left">
                <h3 className="font-semibold text-slate-900 dark:text-white text-base">Formation</h3>
                <p className="text-xs text-slate-500 font-normal mt-0.5">{education.length} ajoutée(s)</p>
              </div>
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-6 pb-8 pt-4 space-y-8">
            {/* List */}
            {education.length > 0 && (
              <div className="space-y-3">
                {education.map((edu: any, index: number) => (
                  <div key={index} className="flex items-center justify-between p-4 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 gap-4">
                    <div>
                      <h4 className="font-bold text-slate-900 dark:text-white">{edu.degree}</h4>
                      <div className="text-sm text-slate-500 flex flex-wrap gap-2 items-center mt-1">
                        <span className="text-purple-600 font-medium">{edu.institution}</span>
                        {edu.field && <span className="text-slate-400 italic">({edu.field})</span>}
                      </div>
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => removeEducation(index)} className="text-slate-400 hover:text-red-500">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}

            {/* Form - Stacked */}
            <div className="p-6 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-2xl bg-slate-50/30 dark:bg-slate-800/10 space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-500 uppercase">École</label>
                <Input className="bg-white dark:bg-slate-900 h-11" placeholder="ex: HEC Paris" value={newEducation.institution} onChange={(e) => setNewEducation({ ...newEducation, institution: e.target.value })} />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-500 uppercase">Diplôme</label>
                <Input className="bg-white dark:bg-slate-900 h-11" placeholder="ex: Master" value={newEducation.degree} onChange={(e) => setNewEducation({ ...newEducation, degree: e.target.value })} />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-500 uppercase">Domaine</label>
                <Input className="bg-white dark:bg-slate-900 h-11" placeholder="ex: Marketing" value={newEducation.field} onChange={(e) => setNewEducation({ ...newEducation, field: e.target.value })} />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-500 uppercase">Début</label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className={cn("w-full h-11 justify-start text-left font-normal bg-white dark:bg-slate-900", !newEducation.startDate && "text-muted-foreground")}>
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {newEducation.startDate ? format(newEducation.startDate, "yyyy", { locale: fr }) : "Année"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0"><Calendar mode="single" selected={newEducation.startDate} onSelect={(date) => date && setNewEducation({ ...newEducation, startDate: date })} initialFocus /></PopoverContent>
                </Popover>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-500 uppercase">Fin</label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className={cn("w-full h-11 justify-start text-left font-normal bg-white dark:bg-slate-900", !newEducation.endDate && "text-muted-foreground")}>
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {newEducation.endDate ? format(newEducation.endDate, "yyyy", { locale: fr }) : "Année"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0"><Calendar mode="single" selected={newEducation.endDate} onSelect={(date) => date && setNewEducation({ ...newEducation, endDate: date })} initialFocus /></PopoverContent>
                </Popover>
              </div>

              <Button onClick={addEducation} className="w-full bg-slate-900 text-white hover:bg-slate-800 h-11 mt-4">
                <Plus className="w-4 h-4 mr-2" /> Ajouter
              </Button>
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* --- PROJECTS ITEM --- */}
        <AccordionItem value="projects" className="border-none bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
          <AccordionTrigger className="px-6 py-4 hover:no-underline hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center text-amber-600 dark:text-amber-400">
                <Code className="h-5 w-5" />
              </div>
              <div className="text-left">
                <h3 className="font-semibold text-slate-900 dark:text-white text-base">Projets</h3>
                <p className="text-xs text-slate-500 font-normal mt-0.5">{projects.length} ajoutée(s)</p>
              </div>
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-6 pb-8 pt-4 space-y-8">
            <div className="space-y-4">
              {projects.map((proj: any, index: number) => (
                <div key={index} className="flex items-center gap-4 p-4 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
                  <div className="w-16 h-16 rounded-md bg-slate-200 overflow-hidden shrink-0">
                    {proj.images?.[0] ? <img src={proj.images[0]} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center"><ImageIcon className="text-slate-400" /></div>}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-slate-900 dark:text-white truncate">{proj.title}</h4>
                    <p className="text-sm text-slate-500 line-clamp-1">{proj.description}</p>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => removeProject(index)} className="text-slate-400 hover:text-red-500 shrink-0">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>

            <div className="p-6 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-2xl bg-slate-50/30 dark:bg-slate-800/10 space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-500 uppercase">Titre</label>
                <Input className="bg-white dark:bg-slate-900 h-11" placeholder="ex: E-commerce" value={newProject.title} onChange={(e) => setNewProject({ ...newProject, title: e.target.value })} />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-500 uppercase">Description</label>
                <Textarea className="bg-white dark:bg-slate-900 min-h-[140px]" placeholder="Détails..." value={newProject.description} onChange={(e) => setNewProject({ ...newProject, description: e.target.value })} />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-500 uppercase">Technologies</label>
                <div className="flex gap-2">
                  <Input className="bg-white dark:bg-slate-900 h-11" placeholder="ex: React" value={newTech} onChange={(e) => setNewTech(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && addTechToProject()} />
                  <Button onClick={addTechToProject} className="h-11 w-11 p-0 shrink-0"><Plus className="w-5 h-5" /></Button>
                </div>
                <div className="flex flex-wrap gap-2 min-h-[30px] pt-1">
                  {newProject.technologies.map((tech, i) => (
                    <Badge key={i} variant="secondary" onClick={() => removeTechFromProject(tech)} className="cursor-pointer hover:bg-red-100 hover:text-red-600">{tech} <X className="ml-1 w-3 h-3" /></Badge>
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-500 uppercase">Image de couverture</label>
                <div className="h-40 w-full">
                  <ImageUpload value={newProject.images[0]} onChange={(url) => setNewProject({ ...newProject, images: [url] })} onRemove={() => setNewProject({ ...newProject, images: [] })} className="h-full bg-white dark:bg-slate-900" label="Image du projet" />
                </div>
              </div>

              <Button onClick={addProject} className="w-full bg-slate-900 text-white hover:bg-slate-800 h-11 mt-4">
                <Plus className="w-4 h-4 mr-2" /> Ajouter Projet
              </Button>
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* --- SKILLS ITEM --- */}
        <AccordionItem value="skills" className="border-none bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
          <AccordionTrigger className="px-6 py-4 hover:no-underline hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-rose-100 dark:bg-rose-900/30 flex items-center justify-center text-rose-600 dark:text-rose-400">
                <Award className="h-5 w-5" />
              </div>
              <div className="text-left">
                <h3 className="font-semibold text-slate-900 dark:text-white text-base">Compétences</h3>
                <p className="text-xs text-slate-500 font-normal mt-0.5">{skills.length} ajoutée(s)</p>
              </div>
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-6 pb-8 pt-4">
            <div className="flex gap-3 mb-6">
              <Input
                className="h-11 bg-slate-50 dark:bg-slate-800"
                placeholder="Ajouter une compétence..."
                value={newSkill}
                onChange={(e) => setNewSkill(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && addSkill()}
              />
              <Button onClick={addSkill} className="h-11 px-6 bg-rose-600 hover:bg-rose-700 text-white"><Plus className="w-5 h-5" /></Button>
            </div>
            <div className="flex flex-wrap gap-3">
              {skills.map((skill: string, i: number) => (
                <Badge key={i} className="pl-4 pr-2 py-2 text-sm gap-2 hover:bg-rose-50 hover:text-rose-600 cursor-pointer transition-all" variant="outline" onClick={() => removeSkill(skill)}>
                  {skill} <X className="w-3.5 h-3.5 opacity-50 hover:opacity-100" />
                </Badge>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* --- LANGUAGES --- */}
        <AccordionItem value="languages" className="border-none bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
          <AccordionTrigger className="px-6 py-4 hover:no-underline hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center text-orange-600 dark:text-orange-400">
                <Languages className="h-5 w-5" />
              </div>
              <h3 className="font-semibold text-slate-900 dark:text-white">Langues</h3>
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-6 pb-6 pt-2">
            <div className="flex gap-2 mb-4">
              <Input
                className="h-11"
                placeholder="Langue..."
                value={newLanguage}
                onChange={(e) => setNewLanguage(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && addLanguage()}
              />
              <Button onClick={addLanguage} className="h-11 px-4" variant="secondary"><Plus className="w-4 h-4" /></Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {languages.map((lang: string, i: number) => (
                <Badge key={i} className="cursor-pointer py-1.5 px-3" variant="outline" onClick={() => removeLanguage(lang)}>
                  {lang} <X className="w-3 h-3 ml-2 text-slate-400" />
                </Badge>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* --- INTERESTS --- */}
        <AccordionItem value="interests" className="border-none bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
          <AccordionTrigger className="px-6 py-4 hover:no-underline hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-pink-100 dark:bg-pink-900/30 flex items-center justify-center text-pink-600 dark:text-pink-400">
                <Heart className="h-5 w-5" />
              </div>
              <h3 className="font-semibold text-slate-900 dark:text-white">Intérêts</h3>
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-6 pb-6 pt-2">
            <div className="flex gap-2 mb-4">
              <Input
                className="h-11"
                placeholder="Passion..."
                value={newInterest}
                onChange={(e) => setNewInterest(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && addInterest()}
              />
              <Button onClick={addInterest} className="h-11 px-4" variant="secondary"><Plus className="w-4 h-4" /></Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {interests.map((int: string, i: number) => (
                <Badge key={i} className="cursor-pointer py-1.5 px-3" variant="outline" onClick={() => removeInterest(int)}>
                  {int} <X className="w-3 h-3 ml-2 text-slate-400" />
                </Badge>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>

      </Accordion>

      {/* Floating Save Button */}
      <div className="fixed bottom-6 right-6 z-50">
        <Button
          onClick={onSave}
          disabled={isSaving}
          size="lg"
          className="rounded-full h-14 pl-6 pr-8 shadow-xl bg-slate-900 text-white hover:bg-slate-800 dark:bg-white dark:text-slate-900 transition-all hover:scale-105 active:scale-95 border border-slate-800 dark:border-slate-200"
        >
          {isSaving ? (
            <Loader className="w-5 h-5 animate-spin mr-2" />
          ) : (
            <Save className="w-5 h-5 mr-2" />
          )}
          <span className="font-semibold text-base">Sauvegarder</span>
        </Button>
      </div>
    </div>
  )
}