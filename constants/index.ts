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
