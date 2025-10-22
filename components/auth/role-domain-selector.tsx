"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Code, Database, Calculator, BarChart3, Cpu, Palette, Cloud, Shield, 
  MessageSquare, GitBranch, Server, Smartphone, Globe, Mail, Calendar, 
  BookOpen, Heart, ChevronLeft, Building, School, GraduationCap, User, 
  Briefcase, ArrowRight, Check, Target, Rocket
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useMutation } from "@tanstack/react-query";
import { useKindeBrowserClient } from "@kinde-oss/kinde-auth-nextjs";
import { domainMapping, roleMapping } from "@/types";
import { createOrUpdateUserWithRole } from "@/actions/user.action";

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
    description: "Mettez en avant vos formations en plaçant vos étudiants ou en les matchant avec des entreprises",
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
    description: "Mettez en avant vos formations en plaçant vos étudiants ou en les matchant avec des entreprises",
    multipleDomains: true
  }
];

const domains: Domain[] = [
  { id: "dev", name: "Développement", icon: Code, color: "text-blue-600 dark:text-blue-400" },
  { id: "data", name: "Data Science", icon: Database, color: "text-purple-600 dark:text-purple-400" },
  { id: "finance", name: "Finance", icon: Calculator, color: "text-green-600 dark:text-green-400" },
  { id: "business", name: "Business", icon: BarChart3, color: "text-yellow-600 dark:text-yellow-400" },
  { id: "ingenierie", name: "Ingénierie", icon: Cpu, color: "text-red-600 dark:text-red-400" },
  { id: "design", name: "Design", icon: Palette, color: "text-pink-600 dark:text-pink-400" },
  { id: "devops", name: "DevOps", icon: Cloud, color: "text-indigo-600 dark:text-indigo-400" },
  { id: "cybersecurite", name: "Cybersécurité", icon: Shield, color: "text-orange-600 dark:text-orange-400" },
  { id: "marketing", name: "Marketing", icon: MessageSquare, color: "text-teal-600 dark:text-teal-400" },
  { id: "product", name: "Product", icon: GitBranch, color: "text-cyan-600 dark:text-cyan-400" },
  { id: "architecture", name: "Architecture", icon: Server, color: "text-amber-600 dark:text-amber-400" },
  { id: "mobile", name: "Mobile", icon: Smartphone, color: "text-lime-600 dark:text-lime-400" },
  { id: "web", name: "Web", icon: Globe, color: "text-emerald-600 dark:text-emerald-400" },
  { id: "communication", name: "Communication", icon: Mail, color: "text-rose-600 dark:text-rose-400" },
  { id: "management", name: "Management", icon: Calendar, color: "text-violet-600 dark:text-violet-400" },
  { id: "education", name: "Éducation", icon: BookOpen, color: "text-fuchsia-600 dark:text-fuchsia-400" },
  { id: "sante", name: "Santé", icon: Heart, color: "text-sky-600 dark:text-sky-400" }
];
 
interface RoleDomainSelectorProps {
  onComplete: () => void;
}

export default function RoleDomainSelector({ onComplete }: RoleDomainSelectorProps) {
  const [step, setStep] = useState<"role" | "domain">("role");
  const [selectedRole, setSelectedRole] = useState<string | null>(null);
  const [selectedDomains, setSelectedDomains] = useState<string[]>([]);
  const { user, isLoading } = useKindeBrowserClient();

  const mutation = useMutation({
    mutationFn: async () => {
      if (isLoading) {
        throw new Error("Chargement des données utilisateur en cours");
      }

      if (!user?.id) {
        throw new Error("ID utilisateur manquant");
      }

      if (!user.email) {
        throw new Error("Email utilisateur manquant");
      }

      if (!selectedRole) {
        throw new Error("Rôle non sélectionné");
      }

      if (selectedDomains.length === 0) {
        throw new Error("Domaines non sélectionnés");
      }

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
        domainEnums
      );
    },
    onSuccess: (data) => {
      if (data?.success) {
        onComplete();
      } else {
        console.error("Erreur côté serveur:", data?.error || "Erreur inconnue");
        // Afficher un message d'erreur à l'utilisateur
      }
    },
    onError: (error) => {
      console.error("Erreur lors de la création/mise à jour:", error);
      // Afficher un message d'erreur à l'utilisateur
    }
  });

  const handleRoleSelect = (roleId: string) => {
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

  const handleBack = () => {
    setStep("role");
    setSelectedDomains([]);
  };

  const handleComplete = () => {
    if (isLoading) return;

    if (!user || !selectedRole || selectedDomains.length === 0) {
      console.error("Données manquantes");
      return;
    }

    mutation.mutate();
  };

  const currentRole = roles.find(role => role.id === selectedRole);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 transition-colors flex items-center justify-center py-8 px-4">
      <div className="max-w-2xl w-full">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="flex justify-center mb-4">
            <div className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 rounded-full border border-slate-200 dark:border-slate-700 shadow-sm">
              <Rocket className="h-4 w-4 text-blue-500" />
              <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                Accélérateur de Carrière
              </span>
            </div>
          </div>
          
          <h1 className="text-2xl font-semibold text-slate-900 dark:text-white mb-3">
            Personnalisez votre expérience
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            Sélectionnez votre profil pour commencer
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6"
        >
          {/* Progress indicator */}
          <div className="flex justify-center mb-8">
            <div className="flex items-center">
              <div className={`flex items-center justify-center w-8 h-8 rounded-full transition-colors ${
                step === "role" 
                  ? "bg-blue-500 text-white" 
                  : "bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400"
              }`}>
                <span className="text-sm font-medium">1</span>
              </div>
              <div className="w-12 h-0.5 bg-slate-200 dark:bg-slate-600 mx-2"></div>
              <div className={`flex items-center justify-center w-8 h-8 rounded-full transition-colors ${
                step === "domain" 
                  ? "bg-blue-500 text-white" 
                  : "bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400"
              }`}>
                <span className="text-sm font-medium">2</span>
              </div>
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
                              ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20 brightness-100"
                              : "border-slate-200 dark:border-slate-600 hover:border-slate-300 dark:hover:border-slate-500"
                          }`}
                          onClick={() => handleRoleSelect(role.id)}
                        >
                          <div className="flex items-center gap-3 mb-2">
                            <role.icon className={`h-5 w-5 ${
                              isSelected ? "text-blue-500" : "text-slate-500 dark:text-slate-400"
                            }`} />
                            <span className={`font-medium ${
                              isSelected ? "text-blue-700 dark:text-blue-300" : "text-slate-700 dark:text-slate-300"
                            }`}>
                              {role.name}
                            </span>
                            {isSelected && (
                              <Check className="h-4 w-4 text-blue-500 ml-auto" />
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
                      className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    
                    <div className="flex-1">
                      <h2 className="text-lg font-medium text-slate-900 dark:text-white">
                        Domaines d'intérêt
                      </h2>
                      <p className="text-sm text-slate-500 dark:text-slate-400">
                        {currentRole.name}
                      </p>
                    </div>
                  </div>

                  <div className="text-center mb-4">
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      {currentRole.multipleDomains 
                        ? "Sélectionnez un ou plusieurs domaines" 
                        : "Choisissez votre domaine principal"}
                    </p>
                  </div>

                  <div className="flex flex-wrap justify-center gap-2 max-h-64 overflow-y-auto p-2">
                    {domains.map((domain) => {
                      const isSelected = selectedDomains.includes(domain.id);
                      
                      return (
                        <motion.button
                          key={domain.id}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          className={`px-3 py-2 rounded-full border text-sm font-medium transition-all duration-200 flex items-center gap-2 brightness-100 ${
                            isSelected
                              ? "bg-blue-500 text-white border-blue-500"
                              : "bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-600 hover:border-slate-300 dark:hover:border-slate-500"
                          }`}
                          onClick={() => handleDomainToggle(domain.id)}
                        >
                          <domain.icon className={`h-4 w-4 ${
                            isSelected ? "text-white" : domain.color
                          }`} />
                          {domain.name}
                          {isSelected && (
                            <Check className="h-3 w-3 ml-1" />
                          )}
                        </motion.button>
                      );
                    })}
                  </div>

                  <div className="flex justify-center mt-8">
                    <Button 
                      onClick={handleComplete}
                      disabled={selectedDomains.length === 0 || mutation.isPending}
                      className="px-6 py-2 font-medium bg-blue-500 hover:bg-blue-600 text-white rounded-full transition-colors"
                    >
                      {mutation.isPending ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Finalisation...
                        </>
                      ) : (
                        <>
                          Commencer
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </>
                      )}
                    </Button>
                  </div>

                  {(mutation.isError || mutation.data?.success === false) && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="text-center p-3 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 rounded-lg border border-red-200 dark:border-red-800 text-sm"
                    >
                      {mutation.data?.error || mutation.error?.message || "Une erreur s'est produite. Veuillez réessayer."}
                    </motion.div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-center mt-8"
        >
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Votre parcours professionnel personnalisé vous attend
          </p>
        </motion.div>
      </div>
    </div>
  );
}