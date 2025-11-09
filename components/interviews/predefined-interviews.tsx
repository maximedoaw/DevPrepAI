"use client"

import { InterviewData } from "./vocal-interview"

// Conversion des données MOCK_INTERVIEW existantes en format InterviewData
export const PREDEFINED_INTERVIEWS: InterviewData[] = [
  {
    id: "ecommerce-architecture",
    title: "Architecture d'Application E-commerce",
    company: "Shopify",
    domain: "DEVELOPMENT",
    technologies: ["Microservices", "AWS", "React", "Node.js", "Docker"],
    description: "Design system et questions d'architecture avancée pour une plateforme e-commerce supportant 1 million d'utilisateurs simultanés",
    duration: 90,
    difficulty: "SENIOR"
  },
  {
    id: "data-science-ml",
    title: "Data Science & Machine Learning",
    company: "Google",
    domain: "DATA_SCIENCE",
    technologies: ["Python", "TensorFlow", "Pandas", "Scikit-learn", "Jupyter"],
    description: "Entretien technique sur l'analyse de données, machine learning et statistiques avancées",
    duration: 60,
    difficulty: "SENIOR"
  },
  {
    id: "mobile-development",
    title: "Développement Mobile Cross-Platform",
    company: "Meta",
    domain: "MOBILE",
    technologies: ["React Native", "Flutter", "Swift", "Kotlin", "Firebase"],
    description: "Questions sur le développement d'applications mobiles cross-platform et native",
    duration: 45,
    difficulty: "MID"
  },
  {
    id: "web-development",
    title: "Développement Web Full-Stack",
    company: "Netflix",
    domain: "WEB",
    technologies: ["React", "Next.js", "TypeScript", "Node.js", "PostgreSQL"],
    description: "Entretien sur les technologies web modernes et l'architecture full-stack",
    duration: 60,
    difficulty: "MID"
  },
  {
    id: "devops-cloud",
    title: "DevOps & Cloud Architecture",
    company: "Amazon",
    domain: "DEVOPS",
    technologies: ["AWS", "Docker", "Kubernetes", "Terraform", "CI/CD"],
    description: "Questions sur l'infrastructure cloud, l'automatisation et les pratiques DevOps",
    duration: 75,
    difficulty: "SENIOR"
  },
  {
    id: "cybersecurity",
    title: "Cybersécurité & Sécurité Informatique",
    company: "CrowdStrike",
    domain: "CYBERSECURITY",
    technologies: ["Security", "Penetration Testing", "SIEM", "Firewall", "Encryption"],
    description: "Entretien sur la sécurité informatique, la gestion des risques et les bonnes pratiques",
    duration: 60,
    difficulty: "SENIOR"
  },
  {
    id: "product-management",
    title: "Product Management & Strategy",
    company: "Stripe",
    domain: "PRODUCT",
    technologies: ["Product Strategy", "Analytics", "User Research", "Agile", "Roadmapping"],
    description: "Questions sur la gestion de produit, la stratégie et l'analyse des besoins utilisateurs",
    duration: 45,
    difficulty: "MID"
  },
  {
    id: "ui-ux-design",
    title: "Design UX/UI & User Experience",
    company: "Figma",
    domain: "DESIGN",
    technologies: ["Figma", "User Research", "Prototyping", "Design Systems", "Accessibility"],
    description: "Entretien sur la conception d'interface, l'expérience utilisateur et les principes de design",
    duration: 45,
    difficulty: "MID"
  },
  {
    id: "business-analysis",
    title: "Business Analysis & Strategy",
    company: "McKinsey",
    domain: "BUSINESS",
    technologies: ["Business Strategy", "Data Analysis", "Process Improvement", "Stakeholder Management"],
    description: "Questions sur l'analyse business, la stratégie d'entreprise et l'amélioration des processus",
    duration: 60,
    difficulty: "SENIOR"
  },
  {
    id: "finance-tech",
    title: "Finance & Fintech",
    company: "Goldman Sachs",
    domain: "FINANCE",
    technologies: ["Financial Modeling", "Risk Management", "Blockchain", "Quantitative Analysis"],
    description: "Entretien sur la finance quantitative, la gestion des risques et les technologies financières",
    duration: 75,
    difficulty: "SENIOR"
  }
]

// Fonction pour obtenir une interview prédéfinie par ID
export function getPredefinedInterview(id: string): InterviewData | undefined {
  return PREDEFINED_INTERVIEWS.find(interview => interview.id === id)
}

// Fonction pour filtrer les interviews par domaine
export function getInterviewsByDomain(domain: string): InterviewData[] {
  return PREDEFINED_INTERVIEWS.filter(interview => interview.domain === domain)
}

// Fonction pour filtrer les interviews par difficulté
export function getInterviewsByDifficulty(difficulty: string): InterviewData[] {
  return PREDEFINED_INTERVIEWS.filter(interview => interview.difficulty === difficulty)
}

// Fonction pour obtenir des interviews aléatoires
export function getRandomInterviews(count: number = 3): InterviewData[] {
  const shuffled = [...PREDEFINED_INTERVIEWS].sort(() => 0.5 - Math.random())
  return shuffled.slice(0, count)
}
