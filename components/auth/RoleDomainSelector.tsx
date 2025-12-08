"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Code, Database, Calculator, BarChart3, Cpu, Palette, Cloud, Shield, 
  MessageSquare, GitBranch, Server, Smartphone, Globe, Mail, Calendar, 
  BookOpen, Heart, ChevronLeft, Building, School, GraduationCap, User, 
  Briefcase, ArrowRight, Check, Target, Rocket, Lightbulb, Compass,
  Users, Trophy, Search, Zap, Crown, TrendingUp, Award, Target as TargetIcon,
  Clock, MapPin, DollarSign, Globe as GlobeIcon, Brain, Layers, Eye, Upload, X,
  Headphones, Video, PenTool, ShoppingBag, Car, Home, Coffee, Music,
  FileText
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { useMutation } from "@tanstack/react-query";
import { useKindeBrowserClient } from "@kinde-oss/kinde-auth-nextjs";
import { domainMapping, roleMapping } from "@/types";
import { createOrUpdateUserWithRole } from "@/actions/user.action";
import { useUploadThing } from "@/lib/uploadthing";

interface Role {
  id: string;
  name: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
  multipleDomains: boolean;
}

interface Domain {
  id: string;
  name: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
}

interface QuestionOption {
  id: string;
  label: string;
  icon?: React.ComponentType<{ className?: string }>;
}

interface RoleQuestions {
  step3: {
    title: string;
    description: string;
    options: QuestionOption[];
    multiChoice: boolean;
  };
  step4: {
    title: string;
    description: string;
    options: QuestionOption[];
    multiChoice: boolean;
  };
}

const roles: Role[] = [
  {
    id: "entreprise",
    name: "Entreprise",
    icon: Building,
    description: "Recherchez des talents tech qualifiés",
    multipleDomains: true
  },
  {
    id: "bootcamp",
    name: "Bootcamp",
    icon: School,
    description: "Formez et placez vos talents dans l'industrie tech",
    multipleDomains: true
  },
  {
    id: "etudiant",
    name: "Étudiant",
    icon: GraduationCap,
    description: "Préparez votre entrée sur le marché du travail",
    multipleDomains: false
  },
  {
    id: "reconversion",
    name: "En reconversion",
    icon: User,
    description: "Changez de carrière vers le domaine tech",
    multipleDomains: false
  },
  {
    id: "recruteur",
    name: "Recruteur",
    icon: Briefcase,
    description: "Trouvez les meilleurs talents pour vos équipes",
    multipleDomains: true
  },
  {
    id: "ecole",
    name: "École/Université",
    icon: BookOpen,
    description: "Connectez vos étudiants aux opportunités tech",
    multipleDomains: true
  }
];

const domains: Domain[] = [
  { id: "dev", name: "Développement", icon: Code, color: "text-emerald-600 dark:text-emerald-400" },
  { id: "data", name: "Data Science", icon: Database, color: "text-green-600 dark:text-green-400" },
  { id: "finance", name: "Finance", icon: Calculator, color: "text-lime-600 dark:text-lime-400" },
  { id: "business", name: "Business", icon: BarChart3, color: "text-teal-600 dark:text-teal-400" },
  { id: "ingenierie", name: "Ingénierie", icon: Cpu, color: "text-cyan-600 dark:text-cyan-400" },
  { id: "design", name: "Design", icon: Palette, color: "text-emerald-500 dark:text-emerald-300" },
  { id: "devops", name: "DevOps", icon: Cloud, color: "text-green-500 dark:text-green-300" },
  { id: "cybersecurite", name: "Cybersécurité", icon: Shield, color: "text-lime-500 dark:text-lime-300" },
  { id: "marketing", name: "Marketing", icon: MessageSquare, color: "text-teal-500 dark:text-teal-300" },
  { id: "product", name: "Product", icon: GitBranch, color: "text-cyan-500 dark:text-cyan-300" },
  { id: "architecture", name: "Architecture", icon: Server, color: "text-emerald-400 dark:text-emerald-200" },
  { id: "mobile", name: "Mobile", icon: Smartphone, color: "text-green-400 dark:text-green-200" },
  { id: "web", name: "Web", icon: Globe, color: "text-lime-400 dark:text-lime-200" },
  { id: "communication", name: "Communication", icon: Mail, color: "text-teal-400 dark:text-teal-200" },
  { id: "management", name: "Management", icon: Calendar, color: "text-cyan-400 dark:text-cyan-200" },
  { id: "education", name: "Éducation", icon: BookOpen, color: "text-emerald-300 dark:text-emerald-100" },
  { id: "sante", name: "Santé", icon: Heart, color: "text-green-300 dark:text-green-100" }
];

// Messages personnalisés pour chaque rôle à l'étape 2
const getDomainStepMessage = (roleId: string | null) => {
  switch(roleId) {
    case 'reconversion':
      return "Dans quel domaine souhaitez-vous vous reconvertir ?";
    case 'etudiant':
      return "Quel domaine vous intéresse le plus pour votre future carrière ?";
    case 'entreprise':
      return "Dans quels domaines recherchez-vous des talents ?";
    case 'bootcamp':
      return "Dans quels domaines formez-vous vos étudiants ?";
    case 'recruteur':
      return "Pour quels domaines recrutez-vous ?";
    case 'ecole':
      return "Dans quels domaines vos étudiants se spécialisent-ils ?";
    default:
      return "Sélectionnez vos domaines d'intérêt";
  }
};

const roleQuestionsConfig: Record<string, RoleQuestions> = {
  entreprise: {
    step3: {
      title: "Quel type de talents recherchez-vous ?",
      description: "Sélectionnez le niveau d'expérience recherché",
      multiChoice: true,
      options: [
        { id: "stagiaire", label: "Stagiaires", icon: GraduationCap },
        { id: "alternant", label: "Alternants", icon: BookOpen },
        { id: "junior", label: "Juniors (0-2 ans)", icon: Target },
        { id: "intermediaire", label: "Intermédiaires (2-5 ans)", icon: Compass },
        { id: "senior", label: "Séniors (5+ ans)", icon: Crown },
        { id: "expert", label: "Experts (lead/architect)", icon: Award },
      ]
    },
    step4: {
      title: "Quels sont vos principaux défis de recrutement ?",
      description: "Sélectionnez jusqu'à 3 défis majeurs",
      multiChoice: true,
      options: [
        { id: "volume", label: "Volume de candidatures trop faible", icon: Search },
        { id: "qualite", label: "Qualité des profils insuffisante", icon: Trophy },
        { id: "temps", label: "Temps de recrutement trop long", icon: Clock },
        { id: "concurrence", label: "Forte concurrence sur le marché", icon: Users },
        { id: "retention", label: "Difficulté à retenir les talents", icon: Heart },
        { id: "budget", label: "Contraintes budgétaires", icon: DollarSign },
        { id: "technique", label: "Évaluation des compétences techniques", icon: Code },
        { id: "diversite", label:"Manque de diversité dans les candidatures", icon: GlobeIcon },
      ]
    }
  },
  bootcamp: {
    step3: {
      title: "Quel est votre modèle principal ?",
      description: "Comment fonctionne votre programme de formation",
      multiChoice: false,
      options: [
        { id: "presentiel", label: "Formation en présentiel", icon: MapPin },
        { id: "distanciel", label: "Formation à distance", icon: Cloud },
        { id: "hybride", label: "Formation hybride (mixte)", icon: Layers },
        { id: "intensif", label: "Bootcamp intensif (3-6 mois)", icon: Zap },
        { id: "etendu", label: "Programme étendu (6-12 mois)", icon: Clock },
      ]
    },
    step4: {
      title: "Quels services proposez-vous aux étudiants ?",
      description: "Sélectionnez vos principaux services d'accompagnement",
      multiChoice: true,
      options: [
        { id: "placement", label: "Service de placement garanti", icon: Briefcase },
        { id: "mentorat", label: "Mentorat individuel", icon: User },
        { id: "reseau", label: "Accès au réseau d'entreprises", icon: Globe },
        { id: "projets", label: "Projets concrets avec entreprises", icon: Rocket },
        { id: "suivi", label: "Suivi post-formation", icon: TrendingUp },
        { id: "financement", label: "Options de financement", icon: DollarSign },
        { id: "carriere", label: "Coaching de carrière", icon: TargetIcon },
        { id: "communaute", label: "Communauté active d'anciens", icon: Users },
      ]
    }
  },
  etudiant: {
    step3: {
      title: "Quelle est votre situation académique ?",
      description: "Cela nous aide à personnaliser votre parcours",
      multiChoice: false,
      options: [
        { id: "recherche_stage", label: "À la recherche d'un stage", icon: Compass },
        { id: "recherche_alternance", label: "À la recherche d'une alternance", icon: Briefcase },
        { id: "fin_etudes", label: "En fin d'études / Premier emploi", icon: GraduationCap },
        { id: "en_formation", label: "En cours de formation", icon: BookOpen },
        { id: "projet_fin_etudes", label: "Projet de fin d'études", icon: Rocket },
      ]
    },
    step4: {
      title: "Quels sont vos objectifs prioritaires ?",
      description: "Sélectionnez vos 3 principaux objectifs",
      multiChoice: true,
      options: [
        { id: "competences", label: "Développer mes compétences techniques", icon: Code },
        { id: "mentor", label: "Trouver un mentor expérimenté", icon: User },
        { id: "reseau", label: "Élargir mon réseau professionnel", icon: Globe },
        { id: "entretiens", label: "Préparer mes entretiens techniques", icon: MessageSquare },
        { id: "projets", label: "Travailler sur des projets concrets", icon: Rocket },
        { id: "portfolio", label: "Construire mon portfolio", icon: PenTool },
        { id: "stage", label: "Décrocher un stage de qualité", icon: Target },
        { id: "premier_emploi", label: "Trouver mon premier emploi", icon: Briefcase },
      ]
    }
  },
  reconversion: {
    step3: {
      title: "D'où venez-vous professionnellement ?",
      description: "Quel était votre domaine précédent",
      multiChoice: false,
      options: [
        { id: "commerce", label: "Commerce / Vente", icon: ShoppingBag },
        { id: "sante", label: "Santé / Social", icon: Heart },
        { id: "enseignement", label: "Enseignement / Éducation", icon: BookOpen },
        { id: "art", label: "Arts / Culture", icon: Music },
        { id: "industrie", label: "Industrie / Manufacture", icon: Car },
        { id: "admin", label: "Administration / Bureau", icon: Building },
        { id: "service", label: "Services / Hôtellerie", icon: Coffee },
        { id: "autre", label: "Autre domaine", icon: Compass },
      ]
    },
    step4: {
      title: "Quels sont vos principaux besoins ?",
      description: "Sélectionnez ce qui est le plus important pour vous",
      multiChoice: true,
      options: [
        { id: "formation", label: "Une formation adaptée aux débutants", icon: School },
        { id: "rythme", label: "Un rythme compatible avec mon emploi actuel", icon: Clock },
        { id: "financement", label: "Des solutions de financement", icon: DollarSign },
        { id: "accompagnement", label: "Un accompagnement personnalisé", icon: User },
        { id: "projets", label: "Des projets pratiques pour apprendre", icon: Rocket },
        { id: "reseau", label: "Un réseau professionnel dans la tech", icon: Globe },
        { id: "stage", label: "Des opportunités de stage/alternance", icon: Briefcase },
        { id: "emploi", label: "Une garantie d'emploi à la fin", icon: TargetIcon },
      ]
    }
  },
  recruteur: {
    step3: {
      title: "Quel type de recrutement gérez-vous ?",
      description: "Sélectionnez vos principales missions",
      multiChoice: true,
      options: [
        { id: "permanent", label: "CDI / Permanent", icon: Briefcase },
        { id: "contractuel", label: "Contrat / Freelance", icon: FileText },
        { id: "stage", label: "Stages", icon: GraduationCap },
        { id: "alternance", label: "Alternances", icon: BookOpen },
        { id: "interim", label: "Intérim / Mission", icon: Clock },
        { id: "executif", label: "Cadres dirigeants", icon: Crown },
        { id: "technique", label: "Profils techniques uniquement", icon: Code },
        { id: "volume", label: "Recrutement de masse", icon: Users },
      ]
    },
    step4: {
      title: "Quels sont vos outils et méthodes ?",
      description: "Comment recrutez-vous habituellement",
      multiChoice: true,
      options: [
        { id: "linkedin", label: "LinkedIn Recruiter", icon: Globe },
        { id: "ats", label: "Logiciel ATS (Applicant Tracking)", icon: Database },
        { id: "reseaux", label: "Réseaux sociaux professionnels", icon: Users },
        { id: "evenements", label: "Salons et événements", icon: Calendar },
        { id: "chasse", label: "Chasse de tête active", icon: Search },
        { id: "partenaires", label: "Partenariats écoles/formations", icon: School },
        { id: "recommandation", label: "Programme de recommandation", icon: Heart },
        { id: "ia", label: "Outils d'IA et d'automatisation", icon: Brain },
      ]
    }
  },
  ecole: {
    step3: {
      title: "Quel est votre type d'établissement ?",
      description: "Cela nous aide à mieux comprendre vos besoins",
      multiChoice: false,
      options: [
        { id: "universite", label: "Université publique", icon: Building },
        { id: "grande_ecole", label: "Grande école", icon: School },
        { id: "ecole_specialisee", label: "École spécialisée", icon: BookOpen },
        { id: "institut", label: "Institut/Conservatoire", icon: GraduationCap },
        { id: "formation_continue", label: "Formation continue", icon: TrendingUp },
        { id: "international", label: "Établissement international", icon: Globe },
      ]
    },
    step4: {
      title: "Quels services souhaitez-vous offrir à vos étudiants ?",
      description: "Sélectionnez vos priorités d'accompagnement",
      multiChoice: true,
      options: [
        { id: "placement", label: "Service de placement amélioré", icon: Briefcase },
        { id: "reseau_entreprises", label: "Réseau d'entreprises partenaires", icon: Building },
        { id: "projets_reels", label: "Projets avec entreprises réelles", icon: Rocket },
        { id: "mentorat", label: "Programme de mentorat", icon: User },
        { id: "ateliers", label: "Ateliers carrière réguliers", icon: Users },
        { id: "plateforme", label: "Plateforme dédiée aux étudiants", icon: Cloud },
        { id: "statistiques", label: "Suivi statistique des diplômés", icon: BarChart3 },
        { id: "international", label: "Opportunités internationales", icon: Globe },
      ]
    }
  }
};

interface RoleDomainSelectorProps {
  onComplete: () => void;
}

export default function RoleDomainSelector({ onComplete }: RoleDomainSelectorProps) {
  const [step, setStep] = useState<"role" | "domain" | "details" | "goals" | "profile">("role");
  const [selectedRole, setSelectedRole] = useState<string | null>(null);
  const [selectedDomains, setSelectedDomains] = useState<string[]>([]);
  const [detailsAnswer, setDetailsAnswer] = useState<string[]>([]);
  const [goalsAnswer, setGoalsAnswer] = useState<string[]>([]);
  const [username, setUsername] = useState<string>("");
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [zoom, setZoom] = useState(1);
  const [offsetX, setOffsetX] = useState(0); // -1 to 1
  const [offsetY, setOffsetY] = useState(0); // -1 to 1
  const [isDragging, setIsDragging] = useState(false);
  const [lastPos, setLastPos] = useState<{ x: number; y: number } | null>(null);
  
  const { user, isLoading } = useKindeBrowserClient();
  const { startUpload, isUploading } = useUploadThing("mediaUploader");

  useEffect(() => {
    if (user && !username) {
      const base =
        user.given_name ||
        (user.email ? user.email.split("@")[0] : "");
      setUsername(base || "");
    }
  }, [user, username]);

  // Utilitaire de recadrage (canvas)
  const getCroppedFile = useCallback(async (file: File, _croppedArea: any) => {
    return new Promise<File | null>((resolve, reject) => {
    const image = new Image();
      image.onload = () => {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          reject(new Error("Canvas non supporté"));
          return;
        }

        const minDim = Math.min(image.width, image.height);
        const cropSize = minDim / zoom;

        // Offsets en pixels (on limite l'amplitude pour rester dans l'image)
        const maxOffset = (minDim - cropSize) / 2;
        let cx = image.width / 2 + offsetX * maxOffset;
        let cy = image.height / 2 + offsetY * maxOffset;

        // Clamp pour éviter de sortir du cadre
        cx = Math.min(image.width - cropSize, Math.max(0, cx - cropSize / 2));
        cy = Math.min(image.height - cropSize, Math.max(0, cy - cropSize / 2));

        canvas.width = cropSize;
        canvas.height = cropSize;

        ctx.drawImage(
          image,
          cx,
          cy,
          cropSize,
          cropSize,
          0,
          0,
          cropSize,
          cropSize
        );

        canvas.toBlob((blob) => {
          if (!blob) {
            resolve(null);
            return;
          }
          const croppedFile = new File([blob], file.name, { type: file.type });
          resolve(croppedFile);
        }, file.type);
      };
      image.onerror = reject;
      image.src = URL.createObjectURL(file);
    });
  }, []);

  const mutation = useMutation({
    mutationFn: async () => {
      if (isLoading) throw new Error("Chargement des données utilisateur en cours");
      if (!user?.id) throw new Error("ID utilisateur manquant");
      if (!user.email) throw new Error("Email utilisateur manquant");
      if (!selectedRole) throw new Error("Rôle non sélectionné");
      if (selectedDomains.length === 0) throw new Error("Domaines non sélectionnés");
      if (!username.trim()) throw new Error("Nom d'utilisateur requis");

      const firstName = user.given_name || "Utilisateur";
      const lastName = user.family_name || "";

      const roleEnum = roleMapping[selectedRole];
      const domainEnums = selectedDomains.map(id => domainMapping[id]);

      return await createOrUpdateUserWithRole(
        user.id,
        user.email,
        firstName,
        lastName,
        roleEnum,
        domainEnums,
        detailsAnswer,
        goalsAnswer,
        username.trim(),
        avatarUrl || undefined
      );
    },
    onSuccess: (data) => {
      if (data?.success) {
        onComplete();
      } else {
        console.error("Erreur côté serveur:", data?.error || "Erreur inconnue");
      }
    },
    onError: (error) => {
      console.error("Erreur lors de la création/mise à jour:", error);
    }
  });

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
    setUploadError(null);
    setZoom(1);
    setOffsetX(0);
    setOffsetY(0);
    setIsDragging(false);
    setLastPos(null);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    multiple: false,
    accept: {
      "image/*": []
    }
  });

  const handleRoleSelect = (roleId: string) => {
    if (selectedRole !== roleId) {
      setSelectedDomains([]);
      setDetailsAnswer([]);
      setGoalsAnswer([]);
      setUsername("");
      setAvatarFile(null);
      setAvatarPreview(null);
      setAvatarUrl(null);
      setUploadError(null);
    }
    setSelectedRole(roleId);
    setTimeout(() => setStep("domain"), 300);
  };

  const handleDomainToggle = (domainId: string) => {
    const currentRole = roles.find(role => role.id === selectedRole);
    
    if (currentRole?.multipleDomains) {
      setSelectedDomains(prev => 
        prev.includes(domainId) 
          ? prev.filter(id => id !== domainId)
          : [...prev, domainId]
      );
    } else {
      setSelectedDomains(prev => 
        prev.includes(domainId) ? [] : [domainId]
      );
    }
  };

  const handleDomainNext = () => {
    if (selectedDomains.length > 0) {
      setStep("details");
    }
  };

  const handleDetailsSelect = (optionId: string, multi: boolean) => {
    if (multi) {
      setDetailsAnswer(prev => 
        prev.includes(optionId) 
          ? prev.filter(id => id !== optionId)
          : [...prev, optionId]
      );
    } else {
      setDetailsAnswer([optionId]);
      setTimeout(() => setStep("goals"), 300);
    }
  };

  const handleDetailsNext = () => {
    if (detailsAnswer.length > 0) {
      setStep("goals");
    }
  };

  const handleGoalsSelect = (optionId: string, multi: boolean) => {
    if (multi) {
      setGoalsAnswer(prev => 
        prev.includes(optionId) 
          ? prev.filter(id => id !== optionId)
          : [...prev, optionId]
      );
    } else {
      setGoalsAnswer([optionId]);
    }
  };

  const handleBack = () => {
    if (step === "domain") {
      setStep("role");
    } else if (step === "details") {
      setStep("domain");
    } else if (step === "goals") {
      setStep("details");
    } else if (step === "profile") {
      setStep("goals");
    }
  };

  const handleComplete = () => {
    if (isLoading) return;
    if (!user || !selectedRole || selectedDomains.length === 0) return;
    setStep("profile");
  };

  const handleProfileSubmit = async () => {
    if (isLoading || mutation.isPending || isUploading) return;
    if (!user || !selectedRole || selectedDomains.length === 0) return;
    if (!username.trim()) {
      setUploadError("Veuillez saisir un nom d'utilisateur");
      return;
    }

    try {
      setUploadError(null);
      let finalAvatarUrl = avatarUrl || null;

      if (avatarFile) {
        // Recadrer l'image si une zone de crop est définie
        let fileToUpload: File = avatarFile;
        const cropped = await getCroppedFile(avatarFile, null);
        if (cropped) {
          fileToUpload = cropped;
        }

        const res = await startUpload([fileToUpload]);
        finalAvatarUrl = res?.[0]?.url || null;
        if (!finalAvatarUrl) {
          setUploadError("Échec de l'upload de l'avatar");
          return;
        }
        setAvatarUrl(finalAvatarUrl);
      }

      mutation.mutate();
    } catch (error) {
      console.error("Erreur d'upload avatar:", error);
      setUploadError("Impossible de téléverser l'avatar. Réessayez.");
    }
  };

  const currentRole = roles.find(role => role.id === selectedRole);
  const currentQuestions = selectedRole && roleQuestionsConfig[selectedRole] 
    ? roleQuestionsConfig[selectedRole] 
    : roleQuestionsConfig.etudiant;

  const getStepNumber = (s: string) => {
    switch(s) {
      case "role": return 1;
      case "domain": return 2;
      case "details": return 3;
      case "goals": return 4;
      case "profile": return 5;
      default: return 1;
    }
  };

  const currentStepNum = getStepNumber(step);

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50/50 via-green-50/30 to-teal-50/50 dark:from-slate-950 dark:via-emerald-950/10 dark:to-slate-950 transition-colors flex items-center justify-center py-6 px-4">
      <div className="max-w-2xl w-full">
        {/* Header avec logo repositionné plus bas */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-6"
        >
          <div className="flex flex-col items-center justify-center mb-6 mt-6">
            <div className="relative w-40 h-40 mb-3">
              <img 
                src="/Skillwokz.png" 
                alt="Skillwokz"
                className="w-full h-full object-contain drop-shadow-lg"
              />
            </div>
            
            <h1 className="text-2xl font-semibold text-slate-900 dark:text-white mb-2">
              Personnalisez votre expérience
            </h1>
            <p className="text-sm text-slate-600 dark:text-slate-400 max-w-md mx-auto">
              Répondez aux étapes ci-dessous pour adapter la plateforme à vos besoins
            </p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 p-6"
        >
          {/* Progress indicator - version verte */}
          <div className="flex justify-center mb-8">
            <div className="flex items-center gap-2">
              {[1, 2, 3, 4, 5].map((num) => (
                <React.Fragment key={num}>
                  <div className={`flex items-center justify-center w-8 h-8 rounded-full transition-all duration-300 ${
                    currentStepNum >= num
                      ? "bg-emerald-500 text-white shadow-md shadow-emerald-200 dark:shadow-emerald-900/30" 
                      : "bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400"
                  }`}>
                    <span className="text-sm font-medium">{num}</span>
                  </div>
                  {num < 5 && (
                    <div className={`w-8 h-0.5 transition-all duration-300 ${
                      currentStepNum > num ? "bg-emerald-300 dark:bg-emerald-500" : "bg-slate-200 dark:bg-slate-600"
                    }`}></div>
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>

          <div className="min-h-[400px]">
            <AnimatePresence mode="wait">
              {step === "role" && (
                <motion.div
                  key="role-selection"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="space-y-6"
                >
                  <h2 className="text-lg font-medium text-slate-900 dark:text-white text-center mb-2">
                    Qui êtes-vous ?
                  </h2>
                  <p className="text-sm text-slate-600 dark:text-slate-400 text-center mb-6">
                    Sélectionnez le profil qui vous correspond le mieux
                  </p>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {roles.map((role) => {
                      const isSelected = selectedRole === role.id;
                      return (
                        <motion.button
                          key={role.id}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          className={`p-4 rounded-lg border-2 transition-all duration-200 text-left ${
                            isSelected
                              ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-900/10 shadow-sm"
                              : "border-slate-200 dark:border-slate-600 hover:border-slate-300 dark:hover:border-slate-500"
                          }`}
                          onClick={() => handleRoleSelect(role.id)}
                        >
                          <div className="flex items-center gap-3 mb-2">
                            <role.icon className={`h-5 w-5 ${
                              isSelected ? "text-emerald-500" : "text-slate-500 dark:text-slate-400"
                            }`} />
                            <span className={`font-medium ${
                              isSelected ? "text-emerald-700 dark:text-emerald-300" : "text-slate-700 dark:text-slate-300"
                            }`}>
                              {role.name}
                            </span>
                            {isSelected && (
                              <Check className="h-4 w-4 text-emerald-500 ml-auto" />
                            )}
                          </div>
                          <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                            {role.description}
                          </p>
                        </motion.button>
                      );
                    })}
                  </div>
                </motion.div>
              )}

              {step === "domain" && currentRole && (
                <motion.div
                  key="domain-selection"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  <div className="flex items-center gap-4 mb-6">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={handleBack} 
                      className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <div className="flex-1">
                      <h2 className="text-lg font-medium text-slate-900 dark:text-white">
                        {getDomainStepMessage(selectedRole)}
                      </h2>
                      <div className="flex items-center gap-2 mt-1">
                        <currentRole.icon className="h-4 w-4 text-emerald-500" />
                        <p className="text-sm text-slate-500 dark:text-slate-400">{currentRole.name}</p>
                      </div>
                    </div>
                  </div>

                  <div className="text-center mb-6">
                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">
                      {currentRole.multipleDomains 
                        ? "Sélectionnez les domaines qui vous intéressent"
                        : "Choisissez votre domaine principal"}
                    </p>
                    <p className="text-xs text-emerald-500 dark:text-emerald-400 font-medium">
                      {selectedDomains.length > 0 && `${selectedDomains.length} sélectionné(s)`}
                    </p>
                  </div>

                  {/* Domains as compact badges - version améliorée */}
                  <div className="flex flex-wrap justify-center gap-2 p-4 max-h-72 overflow-y-auto bg-slate-50 dark:bg-slate-900/30 rounded-xl">
                    {domains.map((domain) => {
                      const isSelected = selectedDomains.includes(domain.id);
                      return (
                        <motion.button
                          key={domain.id}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          className={`px-3 py-2.5 rounded-lg border transition-all duration-200 flex items-center gap-2 ${
                            isSelected
                              ? "bg-emerald-500 text-white border-emerald-500 shadow-md"
                              : "bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-600 hover:border-emerald-300 dark:hover:border-emerald-700 hover:shadow-sm"
                          }`}
                          onClick={() => handleDomainToggle(domain.id)}
                        >
                          <domain.icon className={`h-4 w-4 ${isSelected ? "text-white" : domain.color}`} />
                          <span className="font-medium text-sm whitespace-nowrap">{domain.name}</span>
                          {isSelected && <Check className="h-3 w-3 ml-1" />}
                        </motion.button>
                      );
                    })}
                  </div>

                  <div className="flex justify-center mt-8">
                    <Button 
                      onClick={handleDomainNext}
                      disabled={selectedDomains.length === 0}
                      className="px-8 py-3 font-medium bg-emerald-500 hover:bg-emerald-600 text-white rounded-full transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105"
                    >
                      {selectedDomains.length === 0 ? "Sélectionnez au moins un domaine" : "Continuer"}
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                </motion.div>
              )}

              {step === "details" && currentQuestions && (
                <motion.div
                  key="details-selection"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  <div className="flex items-center gap-4 mb-6">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={handleBack} 
                      className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <div className="flex-1">
                      <h2 className="text-lg font-medium text-slate-900 dark:text-white">
                        {currentQuestions.step3.title}
                      </h2>
                      <p className="text-sm text-slate-500 dark:text-slate-400">
                        {currentQuestions.step3.description}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-3">
                    {currentQuestions.step3.options.map((option) => {
                      const isSelected = detailsAnswer.includes(option.id);
                      return (
                        <motion.button
                          key={option.id}
                          whileHover={{ scale: 1.01 }}
                          whileTap={{ scale: 0.99 }}
                          className={`p-4 rounded-xl border transition-all duration-200 text-left flex items-center gap-4 ${
                            isSelected
                              ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-900/10 shadow-sm"
                              : "border-slate-200 dark:border-slate-600 hover:border-slate-300 dark:hover:border-slate-500 hover:shadow-sm"
                          }`}
                          onClick={() => handleDetailsSelect(option.id, currentQuestions.step3.multiChoice)}
                        >
                          {option.icon && (
                            <div className={`p-2 rounded-lg ${
                              isSelected ? "bg-emerald-100 dark:bg-emerald-800" : "bg-slate-100 dark:bg-slate-700"
                            }`}>
                              <option.icon className={`h-5 w-5 ${isSelected ? "text-emerald-500" : "text-slate-500"}`} />
                            </div>
                          )}
                          <span className={`flex-1 ${isSelected ? "text-emerald-700 dark:text-emerald-300 font-medium" : "text-slate-700 dark:text-slate-300"}`}>
                            {option.label}
                          </span>
                          {isSelected && (
                            <div className="p-1 bg-emerald-500 rounded-full">
                              <Check className="h-3 w-3 text-white" />
                            </div>
                          )}
                        </motion.button>
                      );
                    })}
                  </div>

                  {currentQuestions.step3.multiChoice ? (
                    <div className="flex justify-between items-center mt-8">
                      <p className="text-sm text-slate-500 dark:text-slate-400">
                        {detailsAnswer.length > 0 ? `${detailsAnswer.length} sélectionné(s)` : "Sélectionnez au moins une option"}
                      </p>
                      <Button 
                        onClick={handleDetailsNext}
                        disabled={detailsAnswer.length === 0}
                        className="px-6 py-2 font-medium bg-emerald-500 hover:bg-emerald-600 text-white rounded-full transition-colors shadow-sm hover:shadow-md hover:scale-105"
                      >
                        Continuer
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    <div className="text-center mt-8">
                      <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
                        Une seule réponse possible
                      </p>
                    </div>
                  )}
                </motion.div>
              )}

              {step === "goals" && currentQuestions && (
                <motion.div
                  key="goals-selection"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  <div className="flex items-center gap-4 mb-6">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={handleBack} 
                      className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <div className="flex-1">
                      <h2 className="text-lg font-medium text-slate-900 dark:text-white">
                        {currentQuestions.step4.title}
                      </h2>
                      <p className="text-sm text-slate-500 dark:text-slate-400">
                        {currentQuestions.step4.description}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-3">
                    {currentQuestions.step4.options.map((option) => {
                      const isSelected = goalsAnswer.includes(option.id);
                      return (
                        <motion.button
                          key={option.id}
                          whileHover={{ scale: 1.01 }}
                          whileTap={{ scale: 0.99 }}
                          className={`p-4 rounded-xl border transition-all duration-200 text-left flex items-center gap-4 ${
                            isSelected
                              ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-900/10 shadow-sm"
                              : "border-slate-200 dark:border-slate-600 hover:border-slate-300 dark:hover:border-slate-500 hover:shadow-sm"
                          }`}
                          onClick={() => handleGoalsSelect(option.id, currentQuestions.step4.multiChoice)}
                        >
                          {option.icon && (
                            <div className={`p-2 rounded-lg ${
                              isSelected ? "bg-emerald-100 dark:bg-emerald-800" : "bg-slate-100 dark:bg-slate-700"
                            }`}>
                              <option.icon className={`h-5 w-5 ${isSelected ? "text-emerald-500" : "text-slate-500"}`} />
                            </div>
                          )}
                          <span className={`flex-1 ${isSelected ? "text-emerald-700 dark:text-emerald-300 font-medium" : "text-slate-700 dark:text-slate-300"}`}>
                            {option.label}
                          </span>
                          {isSelected && (
                            <div className="p-1 bg-emerald-500 rounded-full">
                              <Check className="h-3 w-3 text-white" />
                            </div>
                          )}
                        </motion.button>
                      );
                    })}
                  </div>

                  <div className="flex justify-between items-center mt-8">
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      {goalsAnswer.length > 0 
                        ? `${goalsAnswer.length} objectif(s) sélectionné(s)` 
                        : currentQuestions.step4.multiChoice 
                          ? "Sélectionnez au moins un objectif"
                          : "Sélectionnez votre objectif principal"}
                    </p>
                    <Button 
                      onClick={handleComplete}
                      disabled={goalsAnswer.length === 0}
                      className="px-6 py-2 font-medium bg-emerald-500 hover:bg-emerald-600 text-white rounded-full transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105"
                    >
                      Continuer
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                </motion.div>
              )}
              {step === "profile" && (
                <motion.div
                  key="profile-step"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  <div className="flex items-center gap-4 mb-2">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => setStep("goals")} 
                      className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <div className="flex-1">
                      <h2 className="text-lg font-medium text-slate-900 dark:text-white">
                        Personnalisez votre profil
                      </h2>
                      <p className="text-sm text-slate-500 dark:text-slate-400">
                        Choisissez une photo de profil et un nom d'utilisateur
                      </p>
                    </div>
                  </div>

                  {/* Avatar uploader avec recadrage style réseau social */}
                  <div className="space-y-3">
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300 flex items-center gap-2">
                      <Upload className="h-4 w-4 text-emerald-500" />
                      Photo de profil
                    </label>

                    <div className="grid gap-4 md:grid-cols-[1.5fr_1fr]">
                      <div
                        className="relative w-full h-64 rounded-2xl overflow-hidden border border-emerald-200/70 dark:border-emerald-800/70 bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 flex items-center justify-center select-none"
                        onMouseDown={(e) => {
                          setIsDragging(true);
                          setLastPos({ x: e.clientX, y: e.clientY });
                        }}
                        onMouseUp={() => setIsDragging(false)}
                        onMouseLeave={() => setIsDragging(false)}
                        onMouseMove={(e) => {
                          if (!isDragging || !lastPos) return;
                          const dx = e.clientX - lastPos.x;
                          const dy = e.clientY - lastPos.y;
                          const scale = 0.005;
                          setOffsetX((prev) => Math.max(-1, Math.min(1, prev + dx * scale)));
                          setOffsetY((prev) => Math.max(-1, Math.min(1, prev + dy * scale)));
                          setLastPos({ x: e.clientX, y: e.clientY });
                        }}
                      >
                        {avatarPreview ? (
                          <div 
                            className="w-48 h-48 rounded-full border-4 border-emerald-400/70 shadow-[0_0_30px_rgba(16,185,129,0.25)] overflow-hidden relative"
                            style={{
                              backgroundImage: `url(${avatarPreview})`,
                              backgroundSize: `${zoom * 100}%`,
                              backgroundRepeat: "no-repeat",
                              backgroundPosition: `${50 + offsetX * 50}% ${50 + offsetY * 50}%`,
                              cursor: isDragging ? "grabbing" : "grab",
                            }}
                          />
                        ) : (
                          <div className="text-center text-slate-300 space-y-2">
                            <Avatar className="w-20 h-20 mx-auto border-2 border-emerald-300/50 shadow-inner">
                              <AvatarImage src="" alt="avatar" />
                              <AvatarFallback className="bg-emerald-900/40 text-emerald-200">
                                <User className="h-10 w-10" />
                              </AvatarFallback>
                            </Avatar>
                            <p className="text-sm">Ajoutez une photo</p>
                          </div>
                        )}
                        <div className="absolute bottom-3 left-3 text-xs text-white/80 bg-black/40 px-3 py-1 rounded-full border border-white/10 backdrop-blur">
                          Glissez pour recadrer
                        </div>
                        <div className="absolute bottom-3 right-3 flex items-center gap-2 text-xs text-emerald-200 bg-emerald-600/40 px-3 py-1 rounded-full border border-emerald-200/50 backdrop-blur">
                          <button
                            type="button"
                            className="w-6 h-6 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center text-sm font-bold"
                            onClick={(e) => {
                              e.preventDefault();
                              setZoom((prev) => Math.max(0.8, prev - 0.1));
                            }}
                          >
                            –
                          </button>
                          <span>Zoom</span>
                          <button
                            type="button"
                            className="w-6 h-6 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center text-sm font-bold"
                            onClick={(e) => {
                              e.preventDefault();
                              setZoom((prev) => Math.min(3, prev + 0.1));
                            }}
                          >
                            +
                          </button>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <div
                          {...getRootProps()}
                          className={`border-2 border-dashed rounded-xl p-4 cursor-pointer transition-all ${
                            isDragActive
                              ? "border-emerald-500 bg-emerald-50"
                              : "border-slate-200 dark:border-slate-700 bg-slate-50/60 dark:bg-slate-900/40"
                          }`}
                        >
                          <input {...getInputProps()} />
                          <div className="flex items-center gap-3">
                            <Avatar className="w-12 h-12 border border-emerald-200 dark:border-emerald-800">
                              <AvatarImage src={avatarPreview || ""} alt="avatar" />
                              <AvatarFallback className="bg-emerald-900/30 text-emerald-200">
                                <User className="h-6 w-6" />
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                              <p className="text-sm text-slate-700 dark:text-slate-200 font-medium">
                                Déposez une image ou cliquez pour choisir
                              </p>
                              <p className="text-xs text-slate-500 dark:text-slate-400">
                                PNG / JPG, max 4MB
                              </p>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                          <span>Glissez pour recadrer, molette pour zoomer.</span>
                          {avatarFile && (
                            <button
                              onClick={() => {
                                setAvatarFile(null);
                                setAvatarPreview(null);
                                setAvatarUrl(null);
                                setZoom(1);
                                setOffsetX(0);
                                setOffsetY(0);
                              }}
                              className="text-red-500 hover:text-red-600 font-medium"
                            >
                              Réinitialiser
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Username input */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                      Nom d'utilisateur
                    </label>
                    <input
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="ex: johndoe"
                      className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 py-2.5 text-sm text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-400"
                    />
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Ce nom apparaîtra pour vos sessions et votre profil.
                    </p>
                  </div>

                  {uploadError && (
                    <div className="text-sm text-red-600 dark:text-red-300 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
                      {uploadError}
                    </div>
                  )}

                  {(mutation.isError || mutation.data?.success === false) && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="text-center p-3 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 rounded-lg border border-red-200 dark:border-red-800 text-sm"
                    >
                      {mutation.data?.error || mutation.error?.message || "Une erreur s'est produite. Veuillez réessayer."}
                    </motion.div>
                  )}

                  <div className="flex justify-end gap-3 pt-2">
                    <Button 
                      variant="outline" 
                      onClick={() => setStep("goals")}
                    >
                      Retour
                    </Button>
                    <Button 
                      onClick={handleProfileSubmit}
                      disabled={mutation.isPending || isUploading}
                      className="px-6 py-2 font-medium bg-emerald-500 hover:bg-emerald-600 text-white rounded-full transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105"
                    >
                      {(mutation.isPending || isUploading) ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Enregistrement...
                        </>
                      ) : (
                        <>
                          Terminer
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </>
                      )}
                    </Button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </div>
    </div>
  );
}