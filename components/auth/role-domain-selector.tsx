"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Code, Database, Calculator, BarChart3, Cpu, Palette, Cloud, Shield, 
  MessageSquare, GitBranch, Server, Smartphone, Globe, Mail, Calendar, 
  BookOpen, Heart, ChevronLeft, Building, School, GraduationCap, User, 
  Briefcase, ArrowRight, Sparkles, Check, Target, Users, Lightbulb,
  Rocket, Star, Zap, Crown, Award, TrendingUp, Brain
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
  bgColor: string;
  borderColor: string;
}

const roles: Role[] = [
  {
    id: "entreprise",
    name: "Entreprise",
    icon: Building,
    description: "Recherchez des talents ou proposez des services",
    multipleDomains: true
  },
  {
    id: "bootcamp",
    name: "Bootcamp",
    icon: School,
    description: "Formez la prochaine génération de talents tech",
    multipleDomains: true
  },
  {
    id: "etudiant",
    name: "Étudiant",
    icon: GraduationCap,
    description: "Préparez-vous à entrer sur le marché du travail",
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
    description: "Offrez des formations académiques en tech",
    multipleDomains: true
  }
];

const domains: Domain[] = [
  { id: "dev", name: "Développement", icon: Code, color: "text-blue-600 dark:text-blue-400", bgColor: "bg-blue-500", borderColor: "border-blue-500" },
  { id: "data", name: "Data Science", icon: Database, color: "text-purple-600 dark:text-purple-400", bgColor: "bg-purple-500", borderColor: "border-purple-500" },
  { id: "finance", name: "Finance", icon: Calculator, color: "text-green-600 dark:text-green-400", bgColor: "bg-green-500", borderColor: "border-green-500" },
  { id: "business", name: "Business", icon: BarChart3, color: "text-yellow-600 dark:text-yellow-400", bgColor: "bg-yellow-500", borderColor: "border-yellow-500" },
  { id: "ingenierie", name: "Ingénierie", icon: Cpu, color: "text-red-600 dark:text-red-400", bgColor: "bg-red-500", borderColor: "border-red-500" },
  { id: "design", name: "Design", icon: Palette, color: "text-pink-600 dark:text-pink-400", bgColor: "bg-pink-500", borderColor: "border-pink-500" },
  { id: "devops", name: "DevOps", icon: Cloud, color: "text-indigo-600 dark:text-indigo-400", bgColor: "bg-indigo-500", borderColor: "border-indigo-500" },
  { id: "cybersecurite", name: "Cybersécurité", icon: Shield, color: "text-orange-600 dark:text-orange-400", bgColor: "bg-orange-500", borderColor: "border-orange-500" },
  { id: "marketing", name: "Marketing", icon: MessageSquare, color: "text-teal-600 dark:text-teal-400", bgColor: "bg-teal-500", borderColor: "border-teal-500" },
  { id: "product", name: "Product", icon: GitBranch, color: "text-cyan-600 dark:text-cyan-400", bgColor: "bg-cyan-500", borderColor: "border-cyan-500" },
  { id: "architecture", name: "Architecture", icon: Server, color: "text-amber-600 dark:text-amber-400", bgColor: "bg-amber-500", borderColor: "border-amber-500" },
  { id: "mobile", name: "Mobile", icon: Smartphone, color: "text-lime-600 dark:text-lime-400", bgColor: "bg-lime-500", borderColor: "border-lime-500" },
  { id: "web", name: "Web", icon: Globe, color: "text-emerald-600 dark:text-emerald-400", bgColor: "bg-emerald-500", borderColor: "border-emerald-500" },
  { id: "communication", name: "Communication", icon: Mail, color: "text-rose-600 dark:text-rose-400", bgColor: "bg-rose-500", borderColor: "border-rose-500" },
  { id: "management", name: "Management", icon: Calendar, color: "text-violet-600 dark:text-violet-400", bgColor: "bg-violet-500", borderColor: "border-violet-500" },
  { id: "education", name: "Éducation", icon: BookOpen, color: "text-fuchsia-600 dark:text-fuchsia-400", bgColor: "bg-fuchsia-500", borderColor: "border-fuchsia-500" },
  { id: "sante", name: "Santé", icon: Heart, color: "text-sky-600 dark:text-sky-400", bgColor: "bg-sky-500", borderColor: "border-sky-500" }
];

interface RoleDomainSelectorProps {
  onComplete: () => void;
}

export default function RoleDomainSelector({ onComplete }: RoleDomainSelectorProps) {
  const [step, setStep] = useState<"role" | "domain">("role");
  const [selectedRole, setSelectedRole] = useState<string | null>(null);
  const [selectedDomains, setSelectedDomains] = useState<string[]>([]);
  const { user } = useKindeBrowserClient();

  const mutation = useMutation({
    mutationFn: async () => {
      if (!user?.id || !selectedRole || !user.email || !user.given_name || !user.family_name) {
        throw new Error("Informations utilisateur manquantes");
      }

      const roleEnum = roleMapping[selectedRole];
      const domainEnums = selectedDomains.map(id => domainMapping[id]);

      return await createOrUpdateUserWithRole(
        user.id,
        user.email,
        user.given_name,
        user.family_name,
        roleEnum,
        domainEnums
      );
    },
    onSuccess: (data) => {
      if (data.success) {
        console.log("Utilisateur créé/mis à jour avec succès");
        onComplete();
      }
    },
    onError: (error) => {
      console.error("Erreur lors de la création/mise à jour:", error);
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
    if (selectedRole && selectedDomains.length > 0) {
      mutation.mutate();
    }
  };

  const currentRole = roles.find(role => role.id === selectedRole);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/30 dark:from-slate-950 dark:via-slate-900/50 dark:to-indigo-950/20 py-8 px-4 sm:px-6 lg:px-8 transition-colors flex items-center justify-center">
      <div className="max-w-4xl w-full">
        {/* Header avec badge d'accélérateur */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="flex flex-col items-center"
          >
            <Badge variant="secondary" className="mb-6 px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white border-0 text-sm font-semibold shadow-lg">
              <Rocket className="h-4 w-4 mr-2" />
              Accélérateur de Carrière TurboIntMax
            </Badge>
            
            <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-100 mb-3">
              Personnalisez votre parcours
            </h1>
            <p className="text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
              Sélectionnez votre profil et domaines d'intérêt pour une expérience sur mesure
            </p>
            
            <div className="flex justify-center mt-4 gap-1">
              {[TrendingUp, Brain, Award, Crown].map((Icon, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.1 + 0.5 }}
                >
                  <Icon className="h-4 w-4 text-blue-500" />
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="relative"
        >
          {/* Indicateur de progression minimaliste */}
          <div className="flex justify-center mb-8">
            <div className="flex items-center bg-slate-100 dark:bg-slate-800 rounded-full p-1 border border-slate-200 dark:border-slate-700 shadow-sm">
              <div className={`flex items-center justify-center w-10 h-10 rounded-full transition-all duration-300 ${step === "role" ? "bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg" : "bg-white dark:bg-slate-700 text-slate-500 dark:text-slate-400"}`}>
                <span className="font-bold text-sm">1</span>
              </div>
              <div className="w-8 h-0.5 bg-slate-300 dark:bg-slate-600 mx-2"></div>
              <div className={`flex items-center justify-center w-10 h-10 rounded-full transition-all duration-300 ${step === "domain" ? "bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg" : "bg-white dark:bg-slate-700 text-slate-500 dark:text-slate-400"}`}>
                <span className="font-bold text-sm">2</span>
              </div>
            </div>
          </div>

          <div className="relative bg-white/80 dark:bg-slate-800/80 backdrop-blur-md rounded-2xl p-6 shadow-lg border border-slate-200/50 dark:border-slate-700/50">
            <div className="min-h-[350px] overflow-hidden">
              <AnimatePresence mode="wait">
                {step === "role" && (
                  <motion.div
                    key="role-selection"
                    initial={{ opacity: 0, x: -30 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 30 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-6"
                  >
                    <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-100 text-center mb-6">
                      Qui êtes-vous ?
                    </h2>
                    
                    <div className="flex flex-wrap justify-center gap-3">
                      {roles.map((role) => {
                        const isSelected = selectedRole === role.id;
                        return (
                          <motion.div
                            key={role.id}
                            whileHover={{ scale: 1.03 }}
                            whileTap={{ scale: 0.97 }}
                            transition={{ duration: 0.15 }}
                          >
                            <Badge
                              variant={isSelected ? "default" : "outline"}
                              className={`cursor-pointer px-4 py-3 text-sm font-medium transition-all duration-200 flex items-center gap-2 ${isSelected 
                                ? "bg-gradient-to-r from-blue-500 to-purple-500 text-white border-0 shadow-md" 
                                : "bg-white/80 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/80"
                              }`}
                              onClick={() => handleRoleSelect(role.id)}
                            >
                              <role.icon className="h-4 w-4" />
                              {role.name}
                              {isSelected && (
                                <Check className="h-4 w-4 ml-1" />
                              )}
                            </Badge>
                          </motion.div>
                        );
                      })}
                    </div>

                    {selectedRole && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-center mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-800"
                      >
                        <p className="text-sm text-blue-700 dark:text-blue-300">
                          {roles.find(r => r.id === selectedRole)?.description}
                        </p>
                      </motion.div>
                    )}
                  </motion.div>
                )}

                {step === "domain" && currentRole && (
                  <motion.div
                    key="domain-selection"
                    initial={{ opacity: 0, x: 30 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -30 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-6"
                  >
                    <div className="flex items-center justify-between mb-6">
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={handleBack}
                        className="flex items-center text-slate-600 dark:text-slate-300 hover:text-slate-800 dark:hover:text-slate-100 px-3 py-1 rounded-lg transition-colors"
                      >
                        <ChevronLeft className="mr-1 h-4 w-4" />
                        Retour
                      </Button>
                      
                      <div className="text-center flex-1">
                        <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-100">
                          Domaines d'intérêt
                        </h2>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                          Profil: {currentRole.name}
                        </p>
                      </div>
                      
                      <div className="w-16"></div>
                    </div>

                    <div className="text-center mb-6">
                      <p className="text-sm text-slate-600 dark:text-slate-300">
                        {currentRole.multipleDomains 
                          ? "Sélectionnez un ou plusieurs domaines" 
                          : "Choisissez votre domaine principal"}
                      </p>
                    </div>

                    <div className="flex flex-wrap justify-center gap-3 max-h-64 overflow-y-auto p-2 custom-scrollbar">
                      {domains.map((domain) => {
                        const isSelected = selectedDomains.includes(domain.id);
                        
                        return (
                          <motion.div
                            key={domain.id}
                            whileHover={{ scale: 1.03 }}
                            whileTap={{ scale: 0.97 }}
                            transition={{ duration: 0.15 }}
                          >
                            <Badge
                              variant={isSelected ? "default" : "outline"}
                              className={`cursor-pointer px-4 py-2.5 text-sm font-medium transition-all duration-200 flex items-center gap-2 ${isSelected 
                                ? `${domain.bgColor} text-white border-0 shadow-md` 
                                : "bg-white/80 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700"
                              }`}
                              onClick={() => handleDomainToggle(domain.id)}
                            >
                              <domain.icon className={`h-4 w-4 ${isSelected ? "text-white" : domain.color}`} />
                              {domain.name}
                              {isSelected && (
                                <Check className="h-4 w-4 ml-1" />
                              )}
                            </Badge>
                          </motion.div>
                        );
                      })}
                    </div>

                    <div className="flex justify-center mt-8">
                      <motion.div
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <Button 
                          onClick={handleComplete}
                          disabled={selectedDomains.length === 0 || mutation.isPending}
                          className="px-8 py-3 font-medium text-base bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 transition-all duration-300 shadow-lg hover:shadow-xl rounded-full group"
                        >
                          {mutation.isPending ? (
                            <>
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                              Finalisation...
                            </>
                          ) : (
                            <>
                              <Rocket className="mr-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                              Lancer l'accélérateur
                              <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                            </>
                          )}
                        </Button>
                      </motion.div>
                    </div>

                    {mutation.isError && (
                      <motion.div
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-center mt-4 p-3 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-lg border border-red-200 dark:border-red-800 text-xs"
                      >
                        <p>
                          Une erreur s'est produite. Veuillez réessayer.
                        </p>
                      </motion.div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </motion.div>

        {/* Footer avec informations supplémentaires */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="text-center mt-8"
        >
          <p className="text-xs text-slate-500 dark:text-slate-400">
            TurboIntMax s'adapte à votre profil pour optimiser votre parcours professionnel
          </p>
        </motion.div>
      </div>

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
          height: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(0, 0, 0, 0.03);
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(0, 0, 0, 0.1);
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(0, 0, 0, 0.2);
        }
        .dark .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.03);
        }
        .dark .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.1);
        }
        .dark .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.2);
        }
      `}</style>
    </div>
  );
}