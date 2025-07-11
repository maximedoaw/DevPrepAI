"use client"

import { useState, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Calendar } from "@/components/ui/calendar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Slider } from "@/components/ui/slider"
import { toast } from "sonner"
import {
  MapPin,
  Clock,
  DollarSign,
  Star,
  Sparkles,
  CalendarIcon,
  Building2,
  Users,
  TrendingUp,
  Award,
  Briefcase,
  Filter,
  X,
  Search,
  Heart,
  Share2,
  ExternalLink,
} from "lucide-react"

const jobOffers = [
  {
    id: 1,
    title: "Senior Full Stack Developer",
    company: "TechCorp Solutions",
    logo: "/placeholder.svg?height=60&width=60",
    location: "Paris",
    country: "France",
    type: "CDI",
    salary: "42M - 55M FCFA",
    salaryMin: 42000000,
    salaryMax: 55000000,
    aiScore: 95,
    matchReason: "Excellente correspondance avec vos compétences React et Node.js",
    description:
      "Rejoignez notre équipe pour développer des applications web innovantes dans un environnement dynamique et créatif.",
    skills: ["React", "Node.js", "TypeScript", "AWS"],
    hardSkillMatch: 92,
    softSkillMatch: 88,
    companyRating: 4.8,
    employees: "200-500",
    growth: "+25%",
    posted: "Il y a 2 jours",
    remote: false,
  },
  {
    id: 2,
    title: "Lead Frontend Developer",
    company: "InnovateLab",
    logo: "/placeholder.svg?height=60&width=60",
    location: "Lyon",
    country: "France",
    type: "CDI",
    salary: "45M - 58M FCFA",
    salaryMin: 45000000,
    salaryMax: 58000000,
    aiScore: 89,
    matchReason: "Votre expertise en design systems correspond parfaitement",
    description: "Dirigez une équipe de développeurs frontend dans un environnement agile et innovant.",
    skills: ["Vue.js", "Design Systems", "Leadership", "Figma"],
    hardSkillMatch: 85,
    softSkillMatch: 94,
    companyRating: 4.6,
    employees: "50-200",
    growth: "+40%",
    posted: "Il y a 1 jour",
    remote: true,
  },
  {
    id: 3,
    title: "DevOps Engineer",
    company: "CloudFirst",
    logo: "/placeholder.svg?height=60&width=60",
    location: "Remote",
    country: "France",
    type: "CDI",
    salary: "39M - 52M FCFA",
    salaryMin: 39000000,
    salaryMax: 52000000,
    aiScore: 82,
    matchReason: "Vos compétences en infrastructure cloud sont très recherchées",
    description: "Optimisez notre infrastructure cloud et nos pipelines CI/CD dans une équipe internationale.",
    skills: ["Docker", "Kubernetes", "Terraform", "CI/CD"],
    hardSkillMatch: 88,
    softSkillMatch: 76,
    companyRating: 4.4,
    employees: "100-300",
    growth: "+15%",
    posted: "Il y a 3 jours",
    remote: true,
  },
  {
    id: 4,
    title: "Product Manager Tech",
    company: "StartupXYZ",
    logo: "/placeholder.svg?height=60&width=60",
    location: "Bordeaux",
    country: "France",
    type: "CDD",
    salary: "36M - 49M FCFA",
    salaryMin: 36000000,
    salaryMax: 49000000,
    aiScore: 78,
    matchReason: "Votre background technique et vos soft skills sont idéaux",
    description: "Pilotez le développement produit d'une startup en forte croissance avec des défis passionnants.",
    skills: ["Product Management", "Agile", "Analytics", "UX"],
    hardSkillMatch: 70,
    softSkillMatch: 86,
    companyRating: 4.2,
    employees: "20-50",
    growth: "+60%",
    posted: "Il y a 5 jours",
    remote: false,
  },
]

const timeSlots = ["09:00", "10:00", "11:00", "14:00", "15:00", "16:00", "17:00"]

const locations = ["Toutes", "Paris", "Lyon", "Bordeaux", "Remote"]
const contractTypes = ["Tous", "CDI", "CDD", "Freelance", "Stage"]
const allSkills = [
  "React",
  "Node.js",
  "TypeScript",
  "AWS",
  "Vue.js",
  "Design Systems",
  "Leadership",
  "Figma",
  "Docker",
  "Kubernetes",
  "Terraform",
  "CI/CD",
  "Product Management",
  "Agile",
  "Analytics",
  "UX",
]

export default function JobsPage() {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date())
  const [selectedTime, setSelectedTime] = useState("")
  const [meetingNotes, setMeetingNotes] = useState("")
  const [contactEmail, setContactEmail] = useState("")
  const [scheduledMeetings, setScheduledMeetings] = useState<{ [key: number]: { date: string; time: string } }>({})
  const [favorites, setFavorites] = useState<Set<number>>(new Set())

  // Filtres
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedLocation, setSelectedLocation] = useState("Toutes")
  const [selectedContractType, setSelectedContractType] = useState("Tous")
  const [minAiScore, setMinAiScore] = useState([70])
  const [salaryRange, setSalaryRange] = useState([30000000, 60000000])
  const [selectedSkills, setSelectedSkills] = useState<string[]>([])
  const [remoteOnly, setRemoteOnly] = useState(false)

  const filteredJobs = useMemo(() => {
    return jobOffers.filter((job) => {
      const matchesSearch =
        job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.description.toLowerCase().includes(searchTerm.toLowerCase())

      const matchesLocation = selectedLocation === "Toutes" || job.location === selectedLocation
      const matchesContractType = selectedContractType === "Tous" || job.type === selectedContractType
      const matchesAiScore = job.aiScore >= minAiScore[0]
      const matchesSalary = job.salaryMin >= salaryRange[0] && job.salaryMax <= salaryRange[1]
      const matchesSkills = selectedSkills.length === 0 || selectedSkills.some((skill) => job.skills.includes(skill))
      const matchesRemote = !remoteOnly || job.remote

      return (
        matchesSearch &&
        matchesLocation &&
        matchesContractType &&
        matchesAiScore &&
        matchesSalary &&
        matchesSkills &&
        matchesRemote
      )
    })
  }, [searchTerm, selectedLocation, selectedContractType, minAiScore, salaryRange, selectedSkills, remoteOnly])

  const handleScheduleMeeting = (jobTitle: string, company: string, jobId: number) => {
    if (!selectedDate || !selectedTime || !contactEmail) {
      toast.error("Veuillez remplir tous les champs requis")
      return
    }

    const formattedDate = selectedDate.toLocaleDateString("fr-FR", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    })

    toast.success(`🎉 Rendez-vous confirmé !`, {
      description: `${company} - ${jobTitle}\n📅 ${formattedDate} à ${selectedTime}\n📧 Confirmation envoyée à ${contactEmail}`,
      duration: 6000,
      action: {
        label: "Voir mes RDV",
        onClick: () => console.log("Voir tous les rendez-vous"),
      },
    })

    setScheduledMeetings((prev) => ({
      ...prev,
      [jobId]: {
        date: formattedDate,
        time: selectedTime,
      },
    }))

    setSelectedTime("")
    setMeetingNotes("")
    setContactEmail("")
  }

  const toggleFavorite = (jobId: number) => {
    setFavorites((prev) => {
      const newFavorites = new Set(prev)
      if (newFavorites.has(jobId)) {
        newFavorites.delete(jobId)
        toast.success("Retiré des favoris")
      } else {
        newFavorites.add(jobId)
        toast.success("Ajouté aux favoris")
      }
      return newFavorites
    })
  }

  const clearFilters = () => {
    setSearchTerm("")
    setSelectedLocation("Toutes")
    setSelectedContractType("Tous")
    setMinAiScore([70])
    setSalaryRange([30000000, 60000000])
    setSelectedSkills([])
    setRemoteOnly(false)
  }

  const activeFiltersCount = [
    searchTerm,
    selectedLocation !== "Toutes" ? selectedLocation : null,
    selectedContractType !== "Tous" ? selectedContractType : null,
    minAiScore[0] > 70 ? "Score IA" : null,
    salaryRange[0] > 30000000 || salaryRange[1] < 60000000 ? "Salaire" : null,
    selectedSkills.length > 0 ? "Compétences" : null,
    remoteOnly ? "Remote" : null,
  ].filter(Boolean).length

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header avec animation */}
        <div className="mb-8 animate-in slide-in-from-top duration-500">
          <div className="flex items-center gap-4 mb-6">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl blur opacity-75"></div>
              <div className="relative p-3 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl">
                <Sparkles className="h-8 w-8 text-white" />
              </div>
            </div>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                Offres Recommandées par IA
              </h1>
              <p className="text-lg text-gray-600 dark:text-gray-300 mt-1">
                Basées sur vos résultats aux tests de compétences
              </p>
            </div>
          </div>

          {/* Barre de recherche et statistiques */}
          <div className="flex flex-col lg:flex-row gap-6 items-start lg:items-center justify-between mb-6">
            <div className="flex-1 max-w-md">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Rechercher un poste, entreprise..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-white/80 backdrop-blur-sm border-gray-200 focus:border-blue-500 transition-all duration-200"
                />
              </div>
            </div>

            <div className="flex items-center gap-6 text-sm text-gray-600 dark:text-gray-300">
              <div className="flex items-center gap-2 bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm px-3 py-2 rounded-lg">
                <Award className="h-4 w-4 text-blue-600" />
                <span className="font-medium">{filteredJobs.length} offres</span>
              </div>
              <div className="flex items-center gap-2 bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm px-3 py-2 rounded-lg">
                <TrendingUp className="h-4 w-4 text-green-600" />
                <span className="font-medium">
                  Score moyen:{" "}
                  {Math.round(filteredJobs.reduce((acc, job) => acc + job.aiScore, 0) / filteredJobs.length)}%
                </span>
              </div>
            </div>
          </div>

          {/* Filtres */}
          <div className="flex flex-wrap items-center gap-3">
            <Sheet>
              <SheetTrigger asChild>
                <Button
                  variant="outline"
                  className="gap-2 bg-white/80 backdrop-blur-sm hover:bg-white transition-all duration-200"
                >
                  <Filter className="h-4 w-4" />
                  Filtres
                  {activeFiltersCount > 0 && (
                    <Badge variant="secondary" className="ml-1 bg-blue-100 text-blue-800">
                      {activeFiltersCount}
                    </Badge>
                  )}
                </Button>
              </SheetTrigger>
              <SheetContent className="w-[400px] sm:w-[540px]">
                <SheetHeader>
                  <SheetTitle>Filtres de recherche</SheetTitle>
                  <SheetDescription>Affinez votre recherche d'emploi selon vos critères</SheetDescription>
                </SheetHeader>

                <div className="space-y-6 mt-6">
                  {/* Localisation */}
                  <div>
                    <Label className="text-base font-medium">Localisation</Label>
                    <Select value={selectedLocation} onValueChange={setSelectedLocation}>
                      <SelectTrigger className="mt-2">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {locations.map((location) => (
                          <SelectItem key={location} value={location}>
                            {location}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Type de contrat */}
                  <div>
                    <Label className="text-base font-medium">Type de contrat</Label>
                    <Select value={selectedContractType} onValueChange={setSelectedContractType}>
                      <SelectTrigger className="mt-2">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {contractTypes.map((type) => (
                          <SelectItem key={type} value={type}>
                            {type}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Télétravail uniquement */}
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="remote"
                      checked={remoteOnly}
                      onCheckedChange={(checked) => setRemoteOnly(checked === true)}
                    />
                    <Label htmlFor="remote" className="text-base font-medium">
                      Télétravail uniquement
                    </Label>
                  </div>

                  {/* Score IA minimum */}
                  <div>
                    <Label className="text-base font-medium">Score IA minimum: {minAiScore[0]}%</Label>
                    <Slider
                      value={minAiScore}
                      onValueChange={setMinAiScore}
                      max={100}
                      min={50}
                      step={5}
                      className="mt-3"
                    />
                  </div>

                  {/* Fourchette salariale */}
                  <div>
                    <Label className="text-base font-medium">
                      Salaire: {(salaryRange[0] / 1000000).toFixed(0)}M - {(salaryRange[1] / 1000000).toFixed(0)}M FCFA
                    </Label>
                    <Slider
                      value={salaryRange}
                      onValueChange={setSalaryRange}
                      max={70000000}
                      min={25000000}
                      step={1000000}
                      className="mt-3"
                    />
                  </div>

                  {/* Compétences */}
                  <div>
                    <Label className="text-base font-medium">Compétences</Label>
                    <div className="grid grid-cols-2 gap-2 mt-3">
                      {allSkills.map((skill) => (
                        <div key={skill} className="flex items-center space-x-2">
                          <Checkbox
                            id={skill}
                            checked={selectedSkills.includes(skill)}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                setSelectedSkills([...selectedSkills, skill])
                              } else {
                                setSelectedSkills(selectedSkills.filter((s) => s !== skill))
                              }
                            }}
                          />
                          <Label htmlFor={skill} className="text-sm">
                            {skill}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex gap-3 pt-4">
                    <Button onClick={clearFilters} variant="outline" className="flex-1 bg-transparent">
                      Effacer les filtres
                    </Button>
                  </div>
                </div>
              </SheetContent>
            </Sheet>

            {/* Filtres actifs */}
            {activeFiltersCount > 0 && (
              <div className="flex flex-wrap gap-2">
                {searchTerm && (
                  <Badge variant="secondary" className="gap-1">
                    Recherche: {searchTerm}
                    <X className="h-3 w-3 cursor-pointer" onClick={() => setSearchTerm("")} />
                  </Badge>
                )}
                {selectedLocation !== "Toutes" && (
                  <Badge variant="secondary" className="gap-1">
                    {selectedLocation}
                    <X className="h-3 w-3 cursor-pointer" onClick={() => setSelectedLocation("Toutes")} />
                  </Badge>
                )}
                {selectedContractType !== "Tous" && (
                  <Badge variant="secondary" className="gap-1">
                    {selectedContractType}
                    <X className="h-3 w-3 cursor-pointer" onClick={() => setSelectedContractType("Tous")} />
                  </Badge>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Job Cards avec animations */}
        <div className="grid gap-8">
          {filteredJobs.map((job, index) => (
            <Card
              key={job.id}
              className="group overflow-hidden hover:shadow-2xl transition-all duration-500 border-0 bg-white/80 backdrop-blur-sm hover:bg-white animate-in slide-in-from-bottom"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600/5 to-purple-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

              <CardHeader className="pb-4 relative">
                <div className="flex flex-col lg:flex-row lg:items-start gap-6">
                  <div className="flex items-start gap-4 flex-1">
                    <div className="relative">
                      <Avatar className="h-20 w-20 border-4 border-white shadow-lg">
                        <AvatarImage src={job.logo || "/placeholder.svg"} alt={job.company} />
                        <AvatarFallback className="text-xl font-bold bg-gradient-to-br from-blue-500 to-purple-600 text-white">
                          {job.company.slice(0, 2)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="absolute -top-1 -right-1 w-6 h-6 bg-green-500 rounded-full border-2 border-white flex items-center justify-center">
                        <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                      </div>
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4 mb-3">
                        <div>
                          <CardTitle className="text-2xl mb-2 group-hover:text-blue-600 transition-colors duration-300">
                            {job.title}
                          </CardTitle>
                          <CardDescription className="flex items-center gap-2 text-lg">
                            <Building2 className="h-5 w-5 text-blue-600" />
                            <span className="font-medium">{job.company}</span>
                          </CardDescription>
                        </div>

                        <div className="flex items-center gap-2">
                          <Badge
                            variant="secondary"
                            className="bg-gradient-to-r from-blue-100 to-purple-100 text-blue-800 border-blue-200 font-bold text-sm px-3 py-1"
                          >
                            <Sparkles className="h-4 w-4 mr-1" />
                            {job.aiScore}% Match IA
                          </Badge>

                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => toggleFavorite(job.id)}
                            className="text-gray-400 hover:text-red-500 transition-colors duration-200"
                          >
                            <Heart className={`h-5 w-5 ${favorites.has(job.id) ? "fill-red-500 text-red-500" : ""}`} />
                          </Button>
                        </div>
                      </div>

                      {scheduledMeetings[job.id] && (
                        <div className="mb-4">
                          <Badge variant="default" className="bg-green-100 text-green-800 border-green-200 px-3 py-1">
                            <CalendarIcon className="h-4 w-4 mr-2" />
                            RDV: {scheduledMeetings[job.id].date} à {scheduledMeetings[job.id].time}
                          </Badge>
                        </div>
                      )}

                      <div className="flex flex-wrap gap-4 text-sm text-gray-600 dark:text-gray-300 mb-4">
                        <div className="flex items-center gap-2 bg-gray-50 px-3 py-1 rounded-full">
                          <MapPin className="h-4 w-4 text-blue-600" />
                          <span>
                            {job.location}, {job.country}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 bg-gray-50 px-3 py-1 rounded-full">
                          <Briefcase className="h-4 w-4 text-green-600" />
                          <span>{job.type}</span>
                        </div>
                        <div className="flex items-center gap-2 bg-gray-50 px-3 py-1 rounded-full">
                          <DollarSign className="h-4 w-4 text-purple-600" />
                          <span className="font-medium">{job.salary}</span>
                        </div>
                        <div className="flex items-center gap-2 bg-gray-50 px-3 py-1 rounded-full">
                          <Clock className="h-4 w-4 text-orange-600" />
                          <span>{job.posted}</span>
                        </div>
                      </div>

                      <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/30 dark:to-purple-950/30 p-4 rounded-xl mb-4 border border-blue-100">
                        <div className="flex items-start gap-3">
                          <div className="p-2 bg-blue-100 rounded-lg">
                            <Sparkles className="h-5 w-5 text-blue-600" />
                          </div>
                          <div>
                            <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-1">Recommandation IA</h4>
                            <p className="text-sm text-blue-800 dark:text-blue-200">{job.matchReason}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="pt-0 relative">
                <p className="text-gray-700 dark:text-gray-300 mb-6 text-lg leading-relaxed">{job.description}</p>

                {/* Skills and Metrics avec design amélioré */}
                <div className="grid md:grid-cols-2 gap-8 mb-8">
                  <div>
                    <h4 className="font-bold mb-4 flex items-center gap-2 text-lg">
                      <Award className="h-5 w-5 text-yellow-600" />
                      Compétences requises
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {job.skills.map((skill) => (
                        <Badge
                          key={skill}
                          variant="outline"
                          className="px-3 py-1 bg-gradient-to-r from-gray-50 to-gray-100 hover:from-blue-50 hover:to-purple-50 transition-all duration-200"
                        >
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="bg-white p-4 rounded-xl border border-gray-100">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-gray-700">Hard Skills</span>
                        <span className="text-lg font-bold text-green-600">{job.hardSkillMatch}%</span>
                      </div>
                      <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-green-400 to-green-600 transition-all duration-1000 ease-out"
                          style={{ width: `${job.hardSkillMatch}%` }}
                        />
                      </div>
                    </div>

                    <div className="bg-white p-4 rounded-xl border border-gray-100">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-gray-700">Soft Skills</span>
                        <span className="text-lg font-bold text-blue-600">{job.softSkillMatch}%</span>
                      </div>
                      <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-blue-400 to-blue-600 transition-all duration-1000 ease-out"
                          style={{ width: `${job.softSkillMatch}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Company Info avec design premium */}
                <div className="flex flex-wrap items-center gap-6 mb-8 p-6 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800/50 dark:to-gray-700/50 rounded-2xl border border-gray-200">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-yellow-100 rounded-lg">
                      <Star className="h-5 w-5 text-yellow-600" />
                    </div>
                    <div>
                      <span className="text-2xl font-bold text-gray-900">{job.companyRating}</span>
                      <p className="text-sm text-gray-600">Note entreprise</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <Users className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <span className="font-semibold text-gray-900">{job.employees}</span>
                      <p className="text-sm text-gray-600">employés</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-green-100 rounded-lg">
                      <TrendingUp className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <span className="font-semibold text-green-600">{job.growth}</span>
                      <p className="text-sm text-gray-600">croissance</p>
                    </div>
                  </div>
                </div>

                {/* Actions avec design moderne */}
                <div className="flex flex-col sm:flex-row gap-4">
                  <Button className="flex-1 h-12 text-lg font-semibold bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl">
                    <ExternalLink className="h-5 w-5 mr-2" />
                    Postuler maintenant
                  </Button>

                  <Dialog>
                    <DialogTrigger asChild>
                      <Button
                        variant="outline"
                        className="flex-1 h-12 text-lg font-semibold gap-2 bg-white hover:bg-gray-50 border-2 border-gray-200 hover:border-blue-300 transition-all duration-300"
                      >
                        <CalendarIcon className="h-5 w-5" />
                        Planifier un entretien
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-md">
                      <DialogHeader>
                        <DialogTitle className="text-xl">Planifier un entretien</DialogTitle>
                        <DialogDescription className="text-base">
                          {job.title} chez {job.company}
                        </DialogDescription>
                      </DialogHeader>

                      <div className="space-y-6">
                        <div>
                          <Label htmlFor="email" className="text-base font-medium">
                            Email de contact
                          </Label>
                          <Input
                            id="email"
                            type="email"
                            placeholder="votre@email.com"
                            value={contactEmail}
                            onChange={(e) => setContactEmail(e.target.value)}
                            className="mt-2 h-12"
                          />
                        </div>

                        <div>
                          <Label className="text-base font-medium">Date souhaitée</Label>
                          <Calendar
                            mode="single"
                            selected={selectedDate}
                            onSelect={setSelectedDate}
                            disabled={(date) => date < new Date()}
                            className="rounded-md border mt-2"
                          />
                        </div>

                        <div>
                          <Label className="text-base font-medium">Créneau horaire</Label>
                          <Select value={selectedTime} onValueChange={setSelectedTime}>
                            <SelectTrigger className="mt-2 h-12">
                              <SelectValue placeholder="Choisir un horaire" />
                            </SelectTrigger>
                            <SelectContent>
                              {timeSlots.map((time) => (
                                <SelectItem key={time} value={time}>
                                  {time}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <div>
                          <Label htmlFor="notes" className="text-base font-medium">
                            Message (optionnel)
                          </Label>
                          <Textarea
                            id="notes"
                            placeholder="Ajoutez un message pour l'entreprise..."
                            value={meetingNotes}
                            onChange={(e) => setMeetingNotes(e.target.value)}
                            className="mt-2"
                          />
                        </div>

                        <Button
                          onClick={() => handleScheduleMeeting(job.title, job.company, job.id)}
                          className="w-full h-12 text-lg font-semibold bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                        >
                          Confirmer le rendez-vous
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>

                  <Button variant="ghost" size="lg" className="gap-2 text-gray-600 hover:text-blue-600">
                    <Share2 className="h-5 w-5" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Message si aucun résultat */}
        {filteredJobs.length === 0 && (
          <div className="text-center py-16">
            <div className="w-24 h-24 mx-auto mb-6 bg-gray-100 rounded-full flex items-center justify-center">
              <Search className="h-12 w-12 text-gray-400" />
            </div>
            <h3 className="text-2xl font-semibold text-gray-900 mb-2">Aucune offre trouvée</h3>
            <p className="text-gray-600 mb-6">Essayez de modifier vos critères de recherche</p>
            <Button onClick={clearFilters} variant="outline">
              Effacer tous les filtres
            </Button>
          </div>
        )}

        {/* Load More */}
        {filteredJobs.length > 0 && (
          <div className="text-center mt-12">
            <Button
              size="lg"
              variant="outline"
              className="px-8 py-4 text-lg bg-white hover:bg-gray-50 border-2 border-gray-200 hover:border-blue-300 transition-all duration-300"
            >
              Charger plus d'offres
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
