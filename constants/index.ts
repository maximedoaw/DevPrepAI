import { TypeConfig } from "@/types"


export type Difficulty = "JUNIOR" | "MID" | "SENIOR"

export interface Interview {
  id: string
  type: string
  title: string
  company: string
  technology: string[]
  difficulty: "JUNIOR" | "MID" | "SENIOR"
  duration: number // en minutes
  questions: Question[]
  description: string
  totalPoints: number
}

export interface Question {
  id: string
  question: string
  type: "multiple-choice" | "coding" | "open-ended"
  options?: string[]
  correctAnswer?: string | number
  codeTemplate?: string
  expectedOutput?: string
  points: number
  explanation?: string
}

export interface UserStats {
  completedInterviews: number
  averageScore: number
  totalTime: number
  streak: number
  weeklyProgress: { day: string; score: number }[]
  skillsProgress: { skill: string; level: number; maxLevel: number }[]
  recentInterviews: { id: string; title: string; score: number; date: string; company: string }[]
}

export const MOCK_INTERVIEWS: Interview[] = [
  {
    id: "1",
    type: "QCM",
    title: "React.js Fundamentals",
    company: "Google",
    technology: ["React", "JavaScript", "TypeScript"],
    difficulty: "MID",
    duration: 30,
    description:
      "Testez vos connaissances fondamentales en React.js avec des questions sur les hooks, le state management et les bonnes pratiques.",
    totalPoints: 100,
    questions: [
      {
        id: "1",
        question: "Quel hook React permet de gérer l'état local d'un composant ?",
        type: "multiple-choice",
        options: ["useEffect", "useState", "useContext", "useReducer"],
        correctAnswer: 1,
        points: 25,
        explanation: "useState est le hook principal pour gérer l'état local dans les composants fonctionnels React.",
      },
      {
        id: "2",
        question: "Que fait useEffect avec un tableau de dépendances vide ?",
        type: "multiple-choice",
        options: [
          "S'exécute à chaque render",
          "S'exécute seulement au montage",
          "S'exécute au montage et démontage",
          "Ne s'exécute jamais",
        ],
        correctAnswer: 1,
        points: 25,
        explanation: "Un useEffect avec un tableau vide [] ne s'exécute qu'une seule fois au montage du composant.",
      },
      {
        id: "3",
        question: "Comment optimiser les re-renders dans React ?",
        type: "multiple-choice",
        options: ["React.memo", "useMemo", "useCallback", "Toutes les réponses"],
        correctAnswer: 3,
        points: 25,
        explanation:
          "React.memo, useMemo et useCallback sont tous des outils d'optimisation pour éviter les re-renders inutiles.",
      },
      {
        id: "4",
        question: "Quelle est la différence entre props et state ?",
        type: "multiple-choice",
        options: [
          "Props sont mutables, state immutable",
          "Props sont immutables, state mutable",
          "Aucune différence",
          "Props pour les classes, state pour les fonctions",
        ],
        correctAnswer: 1,
        points: 25,
        explanation:
          "Les props sont immutables (passées par le parent), tandis que le state est mutable (géré localement).",
      },
    ],
  },
  {
    id: "2",
    type: "CODING",
    title: "Algorithmes et Structures de Données",
    company: "Meta",
    technology: ["JavaScript", "Algorithms", "Data Structures"],
    difficulty: "SENIOR",
    duration: 45,
    description:
      "Résolvez des problèmes algorithmiques complexes et démontrez votre maîtrise des structures de données.",
    totalPoints: 200,
    questions: [
      {
        id: "1",
        question: "Implémentez une fonction qui trouve le plus long sous-tableau avec une somme égale à k",
        type: "coding",
        codeTemplate: `function longestSubarrayWithSumK(arr, k) {
  // Votre code ici
  // Retournez la longueur du plus long sous-tableau
  
}

// Test
console.log(longestSubarrayWithSumK([1, 2, 3, 7, 5], 12)); // 4
console.log(longestSubarrayWithSumK([1, 2, 1, 0, 1], 4)); // 4`,
        expectedOutput: "4",
        points: 100,
        explanation: "Utilisez une HashMap pour stocker les sommes cumulatives et leurs indices.",
      },
      {
        id: "2",
        question: "Implémentez une fonction qui vérifie si un arbre binaire est équilibré",
        type: "coding",
        codeTemplate: `class TreeNode {
  constructor(val, left = null, right = null) {
    this.val = val;
    this.left = left;
    this.right = right;
  }
}

function isBalanced(root) {
  // Votre code ici
  // Un arbre est équilibré si la différence de hauteur
  // entre les sous-arbres gauche et droit est <= 1
  
}

// Test
const root = new TreeNode(1, new TreeNode(2), new TreeNode(3));
console.log(isBalanced(root)); // true`,
        expectedOutput: "true",
        points: 100,
        explanation: "Calculez récursivement la hauteur de chaque sous-arbre et vérifiez la différence.",
      },
    ],
  },
  {
    id: "3",
    type: "SOFT_SKILLS",
    title: "Leadership & Communication",
    company: "Netflix",
    technology: ["Communication", "Leadership", "Team Management"],
    difficulty: "MID",
    duration: 25,
    description: "Évaluez vos compétences en leadership et communication à travers des scénarios réalistes.",
    totalPoints: 150,
    questions: [
      {
        id: "1",
        question:
          "Décrivez une situation où vous avez dû convaincre votre équipe d'adopter une nouvelle technologie. Comment avez-vous procédé ?",
        type: "open-ended",
        points: 50,
      },
      {
        id: "2",
        question: "Comment gérez-vous les conflits techniques au sein de votre équipe ?",
        type: "open-ended",
        points: 50,
      },
      {
        id: "3",
        question: "Racontez-moi un moment où vous avez échoué dans un projet. Qu'avez-vous appris ?",
        type: "open-ended",
        points: 50,
      },
    ],
  },
  {
    id: "4",
    type: "MOCK_INTERVIEW",
    title: "Entretien Système & Architecture",
    company: "Microsoft",
    technology: ["System Design", "Architecture", "Cloud"],
    difficulty: "SENIOR",
    duration: 60,
    description: "Testez vos compétences en conception de systèmes distribués et architecture logicielle.",
    totalPoints: 150,
    questions: [
      {
        id: "1",
        question: "Expliquez comment concevoir un système de messagerie scalable (type Slack).",
        type: "open-ended",
        points: 150,
      },
    ],
  },
  {
    id: "5",
    type: "QCM",
    title: "Bases de données & SQL",
    company: "Oracle",
    technology: ["SQL", "Databases", "PostgreSQL"],
    difficulty: "MID",
    duration: 30,
    description: "Évaluez vos connaissances sur les bases de données relationnelles et le langage SQL.",
    totalPoints: 100,
    questions: [
      {
        id: "1",
        question: "Quelle commande SQL permet de récupérer toutes les lignes d'une table ?",
        type: "multiple-choice",
        options: ["SELECT *", "GET ALL", "FETCH", "SHOW ALL"],
        correctAnswer: 0,
        points: 25,
      },
      {
        id: "2",
        question: "Quelle clause permet de filtrer les résultats ?",
        type: "multiple-choice",
        options: ["ORDER BY", "WHERE", "GROUP BY", "HAVING"],
        correctAnswer: 1,
        points: 25,
      },
      {
        id: "3",
        question: "Comment faire une jointure entre deux tables ?",
        type: "multiple-choice",
        options: ["JOIN", "MERGE", "LINK", "COMBINE"],
        correctAnswer: 0,
        points: 25,
      },
      {
        id: "4",
        question: "Quelle commande supprime une table ?",
        type: "multiple-choice",
        options: ["DROP TABLE", "DELETE TABLE", "REMOVE TABLE", "CLEAR TABLE"],
        correctAnswer: 0,
        points: 25,
      },
    ],
  },
  {
    id: "6",
    type: "CODING",
    title: "Développement Mobile avec Flutter",
    company: "FlutterFlow",
    technology: ["Flutter", "Dart", "Mobile"],
    difficulty: "JUNIOR",
    duration: 25,
    description: "Testez vos bases en développement mobile cross-platform avec Flutter.",
    totalPoints: 80,
    questions: [
      {
        id: "1",
        question: "Créez un widget Flutter affichant une liste de tâches.",
        type: "coding",
        codeTemplate: "// Votre code ici\n",
        expectedOutput: "Affichage d'une liste de tâches",
        points: 80,
      },
    ],
  },
  {
    id: "7",
    type: "SOFT_SKILLS",
    title: "Gestion du temps & Productivité",
    company: "Asana",
    technology: ["Productivity", "Time Management"],
    difficulty: "MID",
    duration: 20,
    description: "Évaluez vos méthodes d'organisation et de gestion du temps.",
    totalPoints: 60,
    questions: [
      {
        id: "1",
        question: "Comment priorisez-vous vos tâches dans un projet complexe ?",
        type: "open-ended",
        points: 30,
      },
      {
        id: "2",
        question: "Donnez un exemple d'outil ou de méthode que vous utilisez pour rester productif.",
        type: "open-ended",
        points: 30,
      },
    ],
  },
  {
    id: "8",
    type: "MOCK_INTERVIEW",
    title: "Entretien DevOps & CI/CD",
    company: "GitHub",
    technology: ["DevOps", "CI/CD", "Docker", "Kubernetes"],
    difficulty: "MID",
    duration: 40,
    description: "Simulez un entretien sur les pratiques DevOps et l'automatisation CI/CD.",
    totalPoints: 120,
    questions: [
      {
        id: "1",
        question: "Expliquez le concept d'intégration continue et ses avantages.",
        type: "open-ended",
        points: 60,
      },
      {
        id: "2",
        question: "Comment déployer une application avec Docker et Kubernetes ?",
        type: "open-ended",
        points: 60,
      },
    ],
  },
  {
    id: "9",
    type: "QCM",
    title: "Sécurité Web & OWASP",
    company: "Cloudflare",
    technology: ["Security", "Web", "OWASP"],
    difficulty: "SENIOR",
    duration: 35,
    description: "Testez vos connaissances sur la sécurité des applications web et les risques OWASP.",
    totalPoints: 100,
    questions: [
      {
        id: "1",
        question: "Quel est le risque n°1 selon l'OWASP Top 10 ?",
        type: "multiple-choice",
        options: ["Injection", "XSS", "CSRF", "IDOR"],
        correctAnswer: 0,
        points: 25,
      },
      {
        id: "2",
        question: "Que signifie le principe du 'least privilege' ?",
        type: "multiple-choice",
        options: ["Accès minimal", "Accès total", "Accès temporaire", "Accès partagé"],
        correctAnswer: 0,
        points: 25,
      },
      {
        id: "3",
        question: "Quel outil détecte les failles XSS ?",
        type: "multiple-choice",
        options: ["Burp Suite", "Photoshop", "Excel", "Figma"],
        correctAnswer: 0,
        points: 25,
      },
      {
        id: "4",
        question: "Comment protéger une API contre le brute force ?",
        type: "multiple-choice",
        options: ["Rate limiting", "Caching", "Compression", "Minification"],
        correctAnswer: 0,
        points: 25,
      },
    ],
  },
  {
    id: "10",
    type: "CODING",
    title: "Algorithmique Python",
    company: "DataCamp",
    technology: ["Python", "Algorithms"],
    difficulty: "JUNIOR",
    duration: 30,
    description: "Résolvez des exercices d'algorithmique en Python.",
    totalPoints: 80,
    questions: [
      {
        id: "1",
        question: "Écrivez une fonction qui inverse une chaîne de caractères.",
        type: "coding",
        codeTemplate: "def reverse_string(s):\n    # Votre code ici\n    return s[::-1]",
        expectedOutput: "gnirts",
        points: 40,
      },
      {
        id: "2",
        question: "Écrivez une fonction qui calcule la factorielle d'un nombre.",
        type: "coding",
        codeTemplate: "def factorial(n):\n    # Votre code ici\n    return 1 if n==0 else n*factorial(n-1)",
        expectedOutput: "120",
        points: 40,
      },
    ],
  },
  {
    id: "11",
    type: "SOFT_SKILLS",
    title: "Communication Interpersonnelle",
    company: "Slack",
    technology: ["Communication", "Teamwork"],
    difficulty: "JUNIOR",
    duration: 15,
    description: "Testez votre capacité à communiquer efficacement en équipe.",
    totalPoints: 50,
    questions: [
      {
        id: "1",
        question: "Comment réagissez-vous à un feedback négatif ?",
        type: "open-ended",
        points: 25,
      },
      {
        id: "2",
        question: "Donnez un exemple de résolution de conflit en équipe.",
        type: "open-ended",
        points: 25,
      },
    ],
  },
  {
    id: "12",
    type: "MOCK_INTERVIEW",
    title: "Entretien Frontend Avancé",
    company: "Vercel",
    technology: ["React", "Next.js", "CSS"],
    difficulty: "SENIOR",
    duration: 50,
    description: "Passez un entretien technique avancé sur le développement frontend moderne.",
    totalPoints: 120,
    questions: [
      {
        id: "1",
        question: "Expliquez le fonctionnement du SSR dans Next.js.",
        type: "open-ended",
        points: 60,
      },
      {
        id: "2",
        question: "Comment optimiser les performances d'une SPA React ?",
        type: "open-ended",
        points: 60,
      },
    ],
  },
  {
    id: "13",
    type: "QCM",
    title: "Cloud & AWS Basics",
    company: "Amazon",
    technology: ["AWS", "Cloud", "DevOps"],
    difficulty: "MID",
    duration: 30,
    description: "Testez vos bases sur le cloud computing et les services AWS.",
    totalPoints: 100,
    questions: [
      {
        id: "1",
        question: "Quel service AWS permet de stocker des objets ?",
        type: "multiple-choice",
        options: ["EC2", "S3", "Lambda", "RDS"],
        correctAnswer: 1,
        points: 25,
      },
      {
        id: "2",
        question: "Quel service gère les bases de données relationnelles ?",
        type: "multiple-choice",
        options: ["DynamoDB", "S3", "RDS", "CloudFront"],
        correctAnswer: 2,
        points: 25,
      },
      {
        id: "3",
        question: "Comment déployer une application serverless sur AWS ?",
        type: "multiple-choice",
        options: ["Lambda", "EC2", "S3", "ECS"],
        correctAnswer: 0,
        points: 25,
      },
      {
        id: "4",
        question: "Quel service AWS est utilisé pour le CDN ?",
        type: "multiple-choice",
        options: ["CloudFront", "S3", "EC2", "IAM"],
        correctAnswer: 0,
        points: 25,
      },
    ],
  },
]

export const MOCK_USER_STATS: UserStats = {
  completedInterviews: 24,
  averageScore: 82,
  totalTime: 480,
  streak: 7,
  weeklyProgress: [
    { day: "Lun", score: 75 },
    { day: "Mar", score: 82 },
    { day: "Mer", score: 78 },
    { day: "Jeu", score: 85 },
    { day: "Ven", score: 90 },
    { day: "Sam", score: 88 },
    { day: "Dim", score: 92 },
  ],
  skillsProgress: [
    { skill: "React", level: 85, maxLevel: 100 },
    { skill: "JavaScript", level: 92, maxLevel: 100 },
    { skill: "Algorithms", level: 78, maxLevel: 100 },
    { skill: "System Design", level: 65, maxLevel: 100 },
    { skill: "Soft Skills", level: 88, maxLevel: 100 },
  ],
  recentInterviews: [
    { id: "1", title: "React Fundamentals", score: 92, date: "2024-01-15", company: "Google" },
    { id: "2", title: "JavaScript Advanced", score: 88, date: "2024-01-14", company: "Meta" },
    { id: "3", title: "System Design", score: 75, date: "2024-01-13", company: "Netflix" },
    { id: "4", title: "Algorithms", score: 85, date: "2024-01-12", company: "Amazon" },
  ],
}

export const DIFFICULTY_CONFIG = {
  junior: {
    color: "from-green-400 to-green-600",
    bg: "bg-green-50",
    text: "text-green-700",
    border: "border-green-200",
  },
  mid: {
    color: "from-yellow-400 to-orange-500",
    bg: "bg-yellow-50",
    text: "text-yellow-700",
    border: "border-yellow-200",
  },
  senior: {
    color: "from-red-400 to-red-600",
    bg: "bg-red-50",
    text: "text-red-700",
    border: "border-red-200",
  },
}

export const TYPE_CONFIG = {
  qcm: {
    icon: "📝",
    color: "from-blue-400 to-blue-600",
    bg: "bg-blue-50",
    name: "QCM",
  },
  coding: {
    icon: "💻",
    color: "from-purple-400 to-purple-600",
    bg: "bg-purple-50",
    name: "Coding",
  },
  "soft-skills": {
    icon: "🗣️",
    color: "from-pink-400 to-pink-600",
    bg: "bg-pink-50",
    name: "Soft Skills",
  },
  mock: {
    icon: "🎭",
    color: "from-indigo-400 to-indigo-600",
    bg: "bg-indigo-50",
    name: "Mock Interview",
  },
}

export const DIFFICULTY_COLORS = {
  junior: "bg-green-50 text-green-700",
  mid: "bg-yellow-50 text-yellow-700",
  senior: "bg-red-50 text-red-700",
}

export const TYPE_ICONS = {
  qcm: "📝",
  coding: "💻",
  "soft-skills": "🗣️",
  mock: "🎭",
}
