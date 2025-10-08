import { Difficulty, Domain, QuizType } from "@prisma/client";
import { nanoid } from "nanoid";


export interface QuizQuestion {
  id: string;
  question: string;
  type: 'multiple_choice' | 'coding' | 'text' | 'scenario';
  options?: string[];
  correctAnswer: string | string[];
  explanation?: string;
  image?: string
  points: number;
  codeSnippet?: string;
  expectedOutput?: string;
}

export interface Quiz {
  id: string;
  title: string;
  description?: string;
  type: QuizType;
  questions: QuizQuestion[];
  difficulty: Difficulty;
  domain? : Domain,
  company: string;
  technology: string[];
  duration: number;
  totalPoints: number;
}

// Données des exercices par métier
export const QUIZZES_BY_PROFESSION: Record<string, Quiz[]> = {
  "Développement Fullstack": [
    // QCM - JUNIOR
    {
      id: nanoid(),
      title: "Fondamentaux HTML/CSS/JavaScript",
      description: "Testez vos connaissances de base en développement web",
      type: QuizType.QCM,
      difficulty: Difficulty.JUNIOR,
      domain: Domain.WEB,
      company: "Google",
      technology: ["HTML", "CSS", "JavaScript"],
      duration: 1800,
      totalPoints: 100,
      questions: [
        {
          id: "q1",
          question: "Quelle balise HTML est utilisée pour créer un lien?",
          type: "multiple_choice",
          options: ["<link>", "<a>", "<href>", "<url>"],
          correctAnswer: "<a>",
          points: 10,
          explanation: "La balise <a> avec l'attribut href est utilisée pour créer des liens hypertextes."
        },
        {
          id: "q2",
          question: "Quelle propriété CSS permet de centrer un élément horizontalement?",
          type: "multiple_choice",
          options: ["text-align", "margin: auto", "align-center", "horizontal-align"],
          correctAnswer: "margin: auto",
          points: 10,
          explanation: "margin: auto centrera l'élément horizontalement dans son conteneur."
        },
        {
          id: "q3",
          question: "Comment déclarer une variable en JavaScript ES6?",
          type: "multiple_choice",
          options: ["var x = 1", "let x = 1", "const x = 1", "Toutes ces réponses"],
          correctAnswer: "Toutes ces réponses",
          points: 15,
          explanation: "ES6 a introduit let et const, mais var existe toujours."
        },
        {
          id: "q4",
          question: "Qu'est-ce que le DOM?",
          type: "multiple_choice",
          options: [
            "Document Object Model - Représentation structurée du document HTML",
            "Digital Output Management",
            "Data Object Mapper", 
            "Document Optimization Method"
          ],
          correctAnswer: "Document Object Model - Représentation structurée du document HTML",
          points: 15,
          explanation: "Le DOM est une interface de programmation pour les documents HTML et XML."
        },
        {
          id: "q5",
          question: "Quelle méthode JavaScript permet d'ajouter un élément à un tableau?",
          type: "multiple_choice",
          options: ["array.add()", "array.push()", "array.insert()", "array.append()"],
          correctAnswer: "array.push()",
          points: 10,
          explanation: "La méthode push() ajoute un ou plusieurs éléments à la fin d'un tableau."
        },
        {
          id: "q6",
          question: "Quelle est la différence entre == et === en JavaScript?",
          type: "multiple_choice",
          options: [
            "== compare les valeurs, === compare les valeurs et les types",
            "=== est plus rapide que ==",
            "== convertit les types avant comparaison",
            "Les deux premières réponses"
          ],
          correctAnswer: "Les deux premières réponses",
          points: 20,
          explanation: "=== est l'opérateur d'égalité stricte qui ne convertit pas les types."
        },
        {
          id: "q7",
          question: "Qu'est-ce que Flexbox en CSS?",
          type: "multiple_choice",
          options: [
            "Un modèle de mise en page unidimensionnel",
            "Un framework JavaScript",
            "Une méthode d'optimisation d'images",
            "Un préprocesseur CSS"
          ],
          correctAnswer: "Un modèle de mise en page unidimensionnel",
          points: 20,
          explanation: "Flexbox est conçu pour la mise en page unidimensionnelle soit en ligne soit en colonne."
        }
      ]
    },

    // TECHNICAL - MID
    {
      id: nanoid(),
      title: "Développement d'une API RESTful",
      description: "Créez une API REST complète avec Node.js et Express",
      type: QuizType.TECHNICAL,
      difficulty: Difficulty.MID,
      domain: Domain.WEB,
      company: "Amazon",
      technology: ["Node.js", "Express", "MongoDB", "REST"],
      duration: 3600,
      totalPoints: 200,
      questions: [
        {
          id: "q1",
          question: "Implémentez un endpoint GET /api/users qui retourne la liste des utilisateurs",
          type: "coding",
          codeSnippet: "// Modèle User\nconst User = {\n  id: number,\n  name: string,\n  email: string\n}\n\n// Votre code ici:",
          correctAnswer: "app.get('/api/users', async (req, res) => {\n  try {\n    const users = await User.find();\n    res.json(users);\n  } catch (error) {\n    res.status(500).json({ error: 'Erreur serveur' });\n  }\n});",
          points: 50,
          explanation: "L'endpoint doit gérer les erreurs et retourner un format JSON cohérent."
        },
        {
          id: "q2", 
          question: "Créez un middleware d'authentification JWT",
          type: "coding",
          codeSnippet: "// Middleware à compléter\nconst authMiddleware = (req, res, next) => {\n  // Votre code ici\n};",
          correctAnswer: "const authMiddleware = (req, res, next) => {\n  const token = req.header('Authorization')?.replace('Bearer ', '');\n  \n  if (!token) {\n    return res.status(401).json({ error: 'Token manquant' });\n  }\n  \n  try {\n    const decoded = jwt.verify(token, process.env.JWT_SECRET);\n    req.user = decoded;\n    next();\n  } catch (error) {\n    res.status(401).json({ error: 'Token invalide' });\n  }\n};",
          points: 75,
          explanation: "Le middleware doit vérifier la présence et la validité du token JWT."
        },
        {
          id: "q3",
          question: "Optimisez cette requête MongoDB pour récupérer seulement les champs nécessaires",
          type: "coding", 
          codeSnippet: "// Requête actuelle\nconst users = await User.find({ active: true });\n\n// Version optimisée:",
          correctAnswer: "const users = await User.find({ active: true }, { name: 1, email: 1, _id: 0 });",
          points: 35,
          explanation: "La projection réduit la quantité de données transférées depuis la base."
        },
        {
          id: "q4",
          question: "Implémentez la validation des données pour la création d'utilisateur",
          type: "coding",
          codeSnippet: "// Schéma de validation\nconst userSchema = {\n  name: 'string, requis, min 2 caractères',\n  email: 'email valide, requis',\n  password: 'min 6 caractères'\n};\n\n// Votre code de validation:",
          correctAnswer: "const validateUser = (userData) => {\n  const errors = [];\n  \n  if (!userData.name || userData.name.length < 2) {\n    errors.push('Le nom doit contenir au moins 2 caractères');\n  }\n  \n  const emailRegex = /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/;\n  if (!userData.email || !emailRegex.test(userData.email)) {\n    errors.push('Email invalide');\n  }\n  \n  if (!userData.password || userData.password.length < 6) {\n    errors.push('Le mot de passe doit contenir au moins 6 caractères');\n  }\n  \n  return errors;\n};",
          points: 40,
          explanation: "Une validation robuste prévient les données corrompues et améliore la sécurité."
        }
      ]
    },

    // MOCK_INTERVIEW - SENIOR
    {
      id: nanoid(), 
      title: "Architecture d'Application E-commerce",
      description: "Design system et questions d'architecture avancée",
      type: QuizType.MOCK_INTERVIEW,
      difficulty: Difficulty.SENIOR,
      domain: Domain.DEVELOPMENT,
      company: "Shopify",
      technology: ["Microservices", "AWS", "React", "Node.js", "Docker"],
      duration: 5400,
      totalPoints: 300,
      questions: [
        {
          id: "q1",
          question: "Comment concevriez-vous une architecture microservices pour une plateforme e-commerce supportant 1 million d'utilisateurs simultanés?",
          type: "scenario",
          correctAnswer: "Décrivez la séparation en services (users, products, orders, payments), la communication inter-services, la gestion des données, et les patterns de résilience.",
          points: 100,
          explanation: "Une bonne réponse inclurait: API Gateway, service discovery, circuit breaker, base de données par service, et stratégies de cache."
        },
        {
          id: "q2",
          question: "Quelles stratégies mettriez-vous en place pour gérer les pics de traffic pendant le Black Friday?",
          type: "scenario", 
          correctAnswer: "Auto-scaling, cache distribué (Redis), mise en file d'attente, limitation de débit, et base de données read-replicas.",
          points: 80,
          explanation: "L'auto-scaling horizontal combiné avec du caching agressif est essentiel pour les pics de charge."
        },
        {
          id: "q3",
          question: "Comment garantiriez-vous la cohérence des données entre les services dans un système distribué?",
          type: "scenario",
          correctAnswer: "Patterns Saga, événements asynchrones, compensation transactions, et conception pour l'idempotence.",
          points: 70,
          explanation: "Les Sagas gèrent les transactions longues vivantes en coordonnant les événements entre services."
        },
        {
          id: "q4",
          question: "Quelles métriques surveilleriez-vous en production et pourquoi?",
          type: "scenario",
          correctAnswer: "Latence, taux d'erreur, saturation, débit (Four Golden Signals), ainsi que les métriques business comme le taux de conversion.",
          points: 50,
          explanation: "Les Four Golden Signals de Google fournissent une vue complète de la santé du système."
        }
      ]
    },

    // SOFT_SKILLS - MID
    {
      id: nanoid(),
      title: "Leadership Technique et Collaboration",
      description: "Scénarios de leadership et résolution de conflits",
      type: QuizType.SOFT_SKILLS, 
      difficulty: Difficulty.MID,
      domain: Domain.COMMUNICATION,
      company: "Microsoft",
      technology: ["Agile", "Team Leadership", "Communication"],
      duration: 2700,
      totalPoints: 150,
      questions: [
        {
          id: "q1",
          question: "Un membre de votre équipe rate constamment ses deadlines. Comment abordez-vous la situation?",
          type: "scenario",
          correctAnswer: "Organiser une rencontre privée, comprendre les obstacles, offrir du support, et définir un plan d'action clair avec des objectifs mesurables.",
          points: 40,
          explanation: "Approche constructive qui identifie la cause racine plutôt que de blâmer."
        },
        {
          id: "q2",
          question: "Comment gérez-vous un conflit entre deux développeurs sur l'approche technique à adopter?",
          type: "scenario",
          correctAnswer: "Faciliter une discussion structurée, établir des critères objectifs, et si nécessaire, prendre une décision basée sur les données.",
          points: 35,
          explanation: "Encourager le débat sain tout en maintenant la focalisation sur les objectifs du projet."
        },
        {
          id: "q3", 
          question: "Vous devez présenter une refactoring technique coûteuse à des stakeholders non-techniques. Quelle stratégie adoptez-vous?",
          type: "scenario",
          correctAnswer: "Présenter les bénéfices business, les risques actuels, le ROI, et un plan de migration progressive.",
          points: 45,
          explanation: "Traduire les concepts techniques en impacts business concrets."
        },
        {
          id: "q4",
          question: "Comment motivez-vous une équipe pendant une période de crunch intense?",
          type: "scenario", 
          correctAnswer: "Reconnaissance transparente, communication honnête sur les objectifs, soutien managérial, et planification de récupération post-crunch.",
          points: 30,
          explanation: "L'équilibre entre pousser pour les résultats et préserver le bien-être de l'équipe."
        }
      ]
    },

    // QCM - MID (NOUVEAU)
    {
      id: nanoid(),
      title: "Frameworks Frontend Modernes",
      description: "React, Vue et Angular - Concepts avancés",
      type: QuizType.QCM,
      difficulty: Difficulty.MID,
      domain: Domain.WEB,
      company: "Netflix",
      technology: ["React", "Vue", "Angular", "State Management"],
      duration: 2400,
      totalPoints: 150,
      questions: [
        {
          id: "q1",
          question: "Qu'est-ce que le Virtual DOM dans React?",
          type: "multiple_choice",
          options: [
            "Une représentation en mémoire du DOM réel",
            "Un DOM temporaire pour les tests",
            "Un DOM virtuel pour la réalité virtuelle",
            "Une copie de sauvegarde du DOM"
          ],
          correctAnswer: "Une représentation en mémoire du DOM réel",
          points: 20,
          explanation: "Le Virtual DOM permet à React d'optimiser les mises à jour en comparant les états."
        },
        {
          id: "q2",
          question: "Quel hook React est utilisé pour les effets de bord?",
          type: "multiple_choice",
          options: ["useState", "useEffect", "useContext", "useMemo"],
          correctAnswer: "useEffect",
          points: 20,
          explanation: "useEffect gère les effets de bord comme les appels API, abonnements, etc."
        },
        {
          id: "q3",
          question: "Dans Vue.js, que représente 'v-model'?",
          type: "multiple_choice",
          options: [
            "Un two-way data binding",
            "Un one-way data binding",
            "Une validation de modèle",
            "Une mutation de state"
          ],
          correctAnswer: "Un two-way data binding",
          points: 25,
          explanation: "v-model crée une liaison bidirectionnelle entre le modèle et la vue."
        },
        {
          id: "q4",
          question: "Qu'est-ce que Redux Toolkit?",
          type: "multiple_choice",
          options: [
            "Une bibliothèque officielle pour simplifier Redux",
            "Un framework concurrent à Redux",
            "Un outil de débogage Redux",
            "Une extension Chrome pour Redux"
          ],
          correctAnswer: "Une bibliothèque officielle pour simplifier Redux",
          points: 25,
          explanation: "Redux Toolkit réduit le boilerplate et intègre les meilleures pratiques."
        },
        {
          id: "q5",
          question: "Quelle est la différence entre 'let' et 'const' en JavaScript?",
          type: "multiple_choice",
          options: [
            "const ne peut pas être réassigné",
            "let est plus rapide que const",
            "const est block-scoped, let est function-scoped",
            "Aucune différence"
          ],
          correctAnswer: "const ne peut pas être réassigné",
          points: 20,
          explanation: "const empêche la réassignation mais n'empêche pas la mutation d'objets."
        },
        {
          id: "q6",
          question: "Qu'est-ce que le Server-Side Rendering (SSR)?",
          type: "multiple_choice",
          options: [
            "Rendu des pages sur le serveur avant envoi au client",
            "Hébergement d'applications sur un serveur",
            "Compilation côté serveur",
            "Stockage de données sur le serveur"
          ],
          correctAnswer: "Rendu des pages sur le serveur avant envoi au client",
          points: 40,
          explanation: "SSR améliore le SEO et les performances de chargement initial."
        }
      ]
    }
  ],

  "Data Science": [
    // QCM - JUNIOR
    {
      id: nanoid(),
      title: "Fondamentaux Python et Pandas",
      description: "Connaissances de base en data manipulation avec Python",
      type: QuizType.QCM,
      difficulty: Difficulty.JUNIOR, 
      domain: Domain.DATA_SCIENCE,
      company: "Meta",
      technology: ["Python", "Pandas", "NumPy"],
      duration: 1800,
      totalPoints: 100,
      questions: [
        {
          id: "q1",
          question: "Quelle méthode Pandas utilise-t-on pour lire un fichier CSV?",
          type: "multiple_choice",
          options: ["pd.read_csv()", "pd.open_csv()", "pd.load_csv()", "pd.csv_reader()"],
          correctAnswer: "pd.read_csv()",
          points: 15,
          explanation: "pd.read_csv() est la fonction standard pour importer des données CSV dans un DataFrame."
        },
        {
          id: "q2",
          question: "Comment sélectionner une colonne spécifique dans un DataFrame Pandas?",
          type: "multiple_choice", 
          options: ["df.column_name", "df['column_name']", "df.column()", "Les deux premières réponses"],
          correctAnswer: "Les deux premières réponses",
          points: 20,
          explanation: "Les deux syntaxes sont valides mais df['column_name'] est plus robuste pour les noms avec espaces."
        },
        {
          id: "q3",
          question: "Quelle library Python est utilisée pour le machine learning?",
          type: "multiple_choice",
          options: ["scikit-learn", "TensorFlow", "PyTorch", "Toutes ces réponses"],
          correctAnswer: "Toutes ces réponses", 
          points: 25,
          explanation: "scikit-learn pour ML classique, TensorFlow/PyTorch pour le deep learning."
        },
        {
          id: "q4",
          question: "Qu'est-ce qu'un DataFrame?",
          type: "multiple_choice",
          options: [
            "Une structure de données tabulaire 2D",
            "Un type de graphique",
            "Une base de données relationnelle", 
            "Un algorithme de clustering"
          ],
          correctAnswer: "Une structure de données tabulaire 2D",
          points: 20,
          explanation: "Le DataFrame est la structure centrale de Pandas pour manipuler des données tabulaires."
        },
        {
          id: "q5",
          question: "Comment gérer les valeurs manquantes dans un DataFrame?",
          type: "multiple_choice",
          options: ["df.dropna()", "df.fillna()", "df.interpolate()", "Toutes ces réponses"],
          correctAnswer: "Toutes ces réponses",
          points: 20,
          explanation: "Chaque méthode a son use-case selon la nature des données manquantes."
        }
      ]
    },

    // QCM - MID (NOUVEAU)
    {
      id: nanoid(),
      title: "Statistiques et Visualisation de Données",
      description: "Concepts statistiques et outils de visualisation",
      type: QuizType.QCM,
      difficulty: Difficulty.MID,
      domain: Domain.DATA_SCIENCE,
      company: "Airbnb",
      technology: ["Statistics", "Matplotlib", "Seaborn", "Plotly"],
      duration: 2100,
      totalPoints: 140,
      questions: [
        {
          id: "q1",
          question: "Quelle est la différence entre variance et écart-type?",
          type: "multiple_choice",
          options: [
            "L'écart-type est la racine carrée de la variance",
            "La variance est la racine carrée de l'écart-type",
            "Ils sont identiques",
            "La variance est toujours négative"
          ],
          correctAnswer: "L'écart-type est la racine carrée de la variance",
          points: 25,
          explanation: "L'écart-type est dans la même unité que les données originales."
        },
        {
          id: "q2",
          question: "Qu'est-ce qu'un test de corrélation de Pearson mesure?",
          type: "multiple_choice",
          options: [
            "La relation linéaire entre deux variables continues",
            "La causalité entre deux variables",
            "La normalité d'une distribution",
            "La variance d'un échantillon"
          ],
          correctAnswer: "La relation linéaire entre deux variables continues",
          points: 30,
          explanation: "Le coefficient de Pearson varie de -1 à 1, mesurant la corrélation linéaire."
        },
        {
          id: "q3",
          question: "Quel type de graphique est le plus approprié pour montrer une distribution?",
          type: "multiple_choice",
          options: ["Histogramme", "Ligne", "Scatter plot", "Camembert"],
          correctAnswer: "Histogramme",
          points: 20,
          explanation: "L'histogramme montre la fréquence des valeurs dans différents intervalles."
        },
        {
          id: "q4",
          question: "Qu'est-ce que le p-value dans un test statistique?",
          type: "multiple_choice",
          options: [
            "La probabilité d'observer les données si l'hypothèse nulle est vraie",
            "La probabilité que l'hypothèse nulle soit vraie",
            "Le niveau de confiance du test",
            "La taille de l'effet"
          ],
          correctAnswer: "La probabilité d'observer les données si l'hypothèse nulle est vraie",
          points: 35,
          explanation: "Un p-value < 0.05 est généralement considéré comme statistiquement significatif."
        },
        {
          id: "q5",
          question: "Quelle bibliothèque Python est spécialisée dans les visualisations interactives?",
          type: "multiple_choice",
          options: ["Plotly", "Matplotlib", "NumPy", "Pandas"],
          correctAnswer: "Plotly",
          points: 30,
          explanation: "Plotly crée des graphiques interactifs avec zoom, hover, et export."
        }
      ]
    },

    // TECHNICAL - SENIOR
    {
      id: nanoid(),
      title: "Optimisation de Modèles de Machine Learning",
      description: "Techniques avancées d'optimisation et feature engineering",
      type: QuizType.TECHNICAL,
      difficulty: Difficulty.SENIOR,
      domain: Domain.DATA_SCIENCE,
      company: "Netflix", 
      technology: ["Python", "scikit-learn", "XGBoost", "Feature Engineering"],
      duration: 4800,
      totalPoints: 250,
      questions: [
        {
          id: "q1",
          question: "Implémentez un pipeline de feature engineering avec scaling et encoding",
          type: "coding",
          codeSnippet: "from sklearn.pipeline import Pipeline\nfrom sklearn.preprocessing import StandardScaler, OneHotEncoder\nfrom sklearn.compose import ColumnTransformer\n\n# Données: numerical_features = ['age', 'income']\n# categorical_features = ['gender', 'category']\n\n# Votre code:",
          correctAnswer: "preprocessor = ColumnTransformer(\n    transformers=[\n        ('num', StandardScaler(), numerical_features),\n        ('cat', OneHotEncoder(), categorical_features)\n    ])\n\npipeline = Pipeline(steps=[\n    ('preprocessor', preprocessor),\n    ('classifier', RandomForestClassifier())\n])",
          points: 80,
          explanation: "ColumnTransformer permet d'appliquer différents préprocesseurs sur différentes colonnes."
        },
        {
          id: "q2",
          question: "Optimisez les hyperparamètres d'un modèle XGBoost avec Bayesian Optimization",
          type: "coding",
          codeSnippet: "from skopt import BayesSearchCV\nfrom xgboost import XGBClassifier\n\n# Votre code d'optimisation:",
          correctAnswer: "param_space = {\n    'learning_rate': (0.01, 1.0, 'log-uniform'),\n    'max_depth': (3, 10),\n    'n_estimators': (100, 1000),\n    'subsample': (0.5, 1.0)\n}\n\nopt = BayesSearchCV(\n    XGBClassifier(),\n    param_space,\n    n_iter=50,\n    cv=5,\n    scoring='accuracy'\n)\n\nopt.fit(X_train, y_train)",
          points: 90,
          explanation: "Bayesian Optimization est plus efficace que GridSearch pour les espaces de paramètres larges."
        },
        {
          id: "q3",
          question: "Créez des features temporelles à partir d'un timestamp",
          type: "coding",
          codeSnippet: "import pandas as pd\n\n# df['timestamp'] contient des datetime\n# Créez des features: hour, day_of_week, month, is_weekend\n\n# Votre code:",
          correctAnswer: "df['hour'] = df['timestamp'].dt.hour\ndf['day_of_week'] = df['timestamp'].dt.dayofweek\ndf['month'] = df['timestamp'].dt.month\ndf['is_weekend'] = df['day_of_week'].isin([5, 6]).astype(int)",
          points: 50,
          explanation: "Les features temporelles capturent les patterns saisonniers et cycliques."
        },
        {
          id: "q4",
          question: "Implémentez une custom metric pour un problème de classification déséquilibré",
          type: "coding", 
          codeSnippet: "from sklearn.metrics import make_scorer\n\n# Créez une métrique qui pénalise plus les faux négatifs\n\n# Votre code:",
          correctAnswer: "def custom_f2_score(y_true, y_pred):\n    from sklearn.metrics import precision_recall_fscore_support\n    precision, recall, fbeta, support = precision_recall_fscore_support(\n        y_true, y_pred, beta=2, average='binary'\n    )\n    return fbeta\n\ncustom_scorer = make_scorer(custom_f2_score)",
          points: 30,
          explanation: "F2-score donne plus d'importance au recall qu'au precision pour les problèmes où les faux négatifs sont critiques."
        }
      ]
    },

    // QCM - SENIOR (NOUVEAU)
    {
      id: nanoid(),
      title: "Deep Learning et Réseaux de Neurones",
      description: "Architectures avancées et optimisation",
      type: QuizType.QCM,
      difficulty: Difficulty.SENIOR,
      domain: Domain.DATA_SCIENCE,
      company: "OpenAI",
      technology: ["TensorFlow", "PyTorch", "Neural Networks", "CNN", "RNN"],
      duration: 3000,
      totalPoints: 180,
      questions: [
        {
          id: "q1",
          question: "Qu'est-ce que le gradient vanishing problem?",
          type: "multiple_choice",
          options: [
            "Les gradients deviennent très petits dans les couches profondes",
            "Les gradients disparaissent complètement",
            "La fonction de perte ne converge pas",
            "Le modèle overfit sur les données"
          ],
          correctAnswer: "Les gradients deviennent très petits dans les couches profondes",
          points: 35,
          explanation: "Ce problème rend l'entraînement des réseaux profonds difficile."
        },
        {
          id: "q2",
          question: "Quelle fonction d'activation est recommandée pour les couches cachées?",
          type: "multiple_choice",
          options: ["ReLU", "Sigmoid", "Tanh", "Softmax"],
          correctAnswer: "ReLU",
          points: 30,
          explanation: "ReLU évite le vanishing gradient et accélère l'entraînement."
        },
        {
          id: "q3",
          question: "Qu'est-ce que le Dropout dans les réseaux de neurones?",
          type: "multiple_choice",
          options: [
            "Une technique de régularisation qui désactive aléatoirement des neurones",
            "Une méthode d'optimisation des poids",
            "Une fonction de perte",
            "Une architecture de réseau"
          ],
          correctAnswer: "Une technique de régularisation qui désactive aléatoirement des neurones",
          points: 35,
          explanation: "Le Dropout prévient l'overfitting en forçant le réseau à être plus robuste."
        },
        {
          id: "q4",
          question: "Quelle est la principale différence entre CNN et RNN?",
          type: "multiple_choice",
          options: [
            "CNN pour données spatiales, RNN pour données séquentielles",
            "CNN est plus rapide que RNN",
            "RNN utilise plus de mémoire",
            "CNN ne peut pas être entraîné avec backpropagation"
          ],
          correctAnswer: "CNN pour données spatiales, RNN pour données séquentielles",
          points: 40,
          explanation: "CNN excelle en vision, RNN en traitement de séquences temporelles."
        },
        {
          id: "q5",
          question: "Qu'est-ce que le Transfer Learning?",
          type: "multiple_choice",
          options: [
            "Réutiliser un modèle pré-entraîné pour une nouvelle tâche",
            "Transférer des données entre serveurs",
            "Copier les poids d'un modèle",
            "Entraîner plusieurs modèles simultanément"
          ],
          correctAnswer: "Réutiliser un modèle pré-entraîné pour une nouvelle tâche",
          points: 40,
          explanation: "Le Transfer Learning accélère l'entraînement et améliore les performances."
        }
      ]
    }
  ],

  "Cybersécurité": [
    // QCM - MID
    {
      id: nanoid(),
      title: "Sécurité des Applications Web",
      description: "Vulnérabilités OWASP et bonnes pratiques",
      type: QuizType.QCM,
      difficulty: Difficulty.MID,
      domain: Domain.CYBERSECURITY,
      company: "CrowdStrike",
      technology: ["OWASP", "Web Security", "Cryptography"],
      duration: 2100,
      totalPoints: 120,
      questions: [
        {
          id: "q1", 
          question: "Qu'est-ce qu'une attaque XSS?",
          type: "multiple_choice",
          options: [
            "Cross-Site Scripting - Injection de code malveillant",
            "Cross-Site Request Forgery",
            "XML Security Standard", 
            "Extended Security System"
          ],
          correctAnswer: "Cross-Site Scripting - Injection de code malveillant",
          points: 25,
          explanation: "XSS permet à un attaquant d'injecter du code JavaScript qui s'exécute dans le navigateur des victimes."
        },
        {
          id: "q2",
          question: "Comment prévenir les attaques CSRF?",
          type: "multiple_choice",
          options: [
            "Utiliser des tokens CSRF",
            "Valider l'origine des requêtes",
            "Utiliser SameSite cookies",
            "Toutes ces réponses"
          ],
          correctAnswer: "Toutes ces réponses",
          points: 30,
          explanation: "Une défense en profondeur combine plusieurs mécanismes de protection."
        },
        {
          id: "q3",
          question: "Quel algorithme de hash est recommandé pour les mots de passe?",
          type: "multiple_choice", 
          options: ["bcrypt", "MD5", "SHA-1", "SHA-256"],
          correctAnswer: "bcrypt",
          points: 35,
          explanation: "bcrypt est conçu spécifiquement pour le hachage de mots de passe avec salage intégré."
        },
        {
          id: "q4",
          question: "Qu'est-ce que le principe de moindre privilège?",
          type: "multiple_choice",
          options: [
            "Accorder seulement les permissions nécessaires",
            "Utiliser le moins de code possible", 
            "Minimiser la taille des données",
            "Réduire les dépendances"
          ],
          correctAnswer: "Accorder seulement les permissions nécessaires",
          points: 30,
          explanation: "Ce principe limite les dommages potentiels en cas de compromission."
        }
      ]
    },

    // QCM - JUNIOR (NOUVEAU)
    {
      id: nanoid(),
      title: "Fondamentaux de la Cybersécurité",
      description: "Concepts de base en sécurité informatique",
      type: QuizType.QCM,
      difficulty: Difficulty.JUNIOR,
      domain: Domain.CYBERSECURITY,
      company: "Cisco",
      technology: ["Network Security", "Encryption", "Authentication"],
      duration: 1800,
      totalPoints: 100,
      questions: [
        {
          id: "q1",
          question: "Qu'est-ce qu'un firewall?",
          type: "multiple_choice",
          options: [
            "Un système de filtrage du trafic réseau",
            "Un antivirus",
            "Un système d'exploitation sécurisé",
            "Un protocole de chiffrement"
          ],
          correctAnswer: "Un système de filtrage du trafic réseau",
          points: 15,
          explanation: "Le firewall contrôle le trafic entrant et sortant selon des règles de sécurité."
        },
        {
          id: "q2",
          question: "Quelle est la différence entre chiffrement symétrique et asymétrique?",
          type: "multiple_choice",
          options: [
            "Symétrique utilise une clé, asymétrique utilise deux clés",
            "Asymétrique est plus rapide",
            "Symétrique est plus sécurisé",
            "Aucune différence"
          ],
          correctAnswer: "Symétrique utilise une clé, asymétrique utilise deux clés",
          points: 25,
          explanation: "L'asymétrique utilise une paire clé publique/privée."
        },
        {
          id: "q3",
          question: "Qu'est-ce que l'authentification à deux facteurs (2FA)?",
          type: "multiple_choice",
          options: [
            "Utilisation de deux méthodes d'authentification différentes",
            "Deux mots de passe différents",
            "Connexion sur deux appareils",
            "Validation par deux personnes"
          ],
          correctAnswer: "Utilisation de deux méthodes d'authentification différentes",
          points: 20,
          explanation: "Combine généralement quelque chose que vous connaissez et quelque chose que vous possédez."
        },
        {
          id: "q4",
          question: "Qu'est-ce qu'un VPN?",
          type: "multiple_choice",
          options: [
            "Virtual Private Network - Réseau privé virtuel",
            "Virus Protection Network",
            "Variable Password Notation",
            "Verified Public Network"
          ],
          correctAnswer: "Virtual Private Network - Réseau privé virtuel",
          points: 20,
          explanation: "Le VPN crée un tunnel chiffré pour sécuriser les communications."
        },
        {
          id: "q5",
          question: "Qu'est-ce qu'une attaque par phishing?",
          type: "multiple_choice",
          options: [
            "Usurpation d'identité pour voler des informations",
            "Saturation d'un serveur",
            "Injection SQL",
            "Attaque par force brute"
          ],
          correctAnswer: "Usurpation d'identité pour voler des informations",
          points: 20,
          explanation: "Le phishing utilise des emails ou sites frauduleux pour tromper les victimes."
        }
      ]
    },

    // TECHNICAL - SENIOR  
    {
      id: nanoid(),
      title: "Analyse de Malware et Reverse Engineering",
      description: "Techniques avancées d'analyse de code malveillant",
      type: QuizType.TECHNICAL,
      difficulty: Difficulty.SENIOR,
      domain: Domain.CYBERSECURITY,
      company: "Palo Alto Networks",
      technology: ["Reverse Engineering", "Malware Analysis", "Digital Forensics"],
      duration: 7200,
      totalPoints: 350,
      questions: [
        {
          id: "q1",
          question: "Analysez ce code assembleur et identifiez la technique d'obfuscation utilisée",
          type: "coding",
          codeSnippet: "mov eax, [ebp+8]\nxor eax, 0xDEADBEEF\nadd eax, 0x12345678\nnot eax\njmp eax",
          correctAnswer: "Obfuscation par XOR et opérations arithmétiques multiples pour masquer l'adresse de saut.",
          points: 90,
          explanation: "La combinaison XOR, addition et NOT rend l'analyse statique difficile."
        },
        {
          id: "q2",
          question: "Créez un script pour détecter les processus suspects avec des connexions réseau",
          type: "coding",
          codeSnippet: "import psutil\nimport socket\n\n# Détectez les processus avec des connexions sur des ports suspects (ex: 4444, 1337)\n\n# Votre code:",
          correctAnswer: "def detect_suspicious_processes():\n    suspicious_ports = [4444, 1337, 31337, 9999]\n    suspicious_procs = []\n    \n    for proc in psutil.process_iter(['pid', 'name']):\n        try:\n            connections = proc.connections()\n            for conn in connections:\n                if conn.laddr.port in suspicious_ports or conn.raddr.port in suspicious_ports:\n                    suspicious_procs.append({\n                        'pid': proc.info['pid'],\n                        'name': proc.info['name'],\n                        'port': conn.laddr.port\n                    })\n        except (psutil.NoSuchProcess, psutil.AccessDenied):\n            continue\n    \n    return suspicious_procs",
          points: 120,
          explanation: "La détection basée sur les ports connus utilisés par les malwares est une première ligne de défense."
        },
        {
          id: "q3",
          question: "Implémentez un détecteur de shellcode dans un fichier binaire",
          type: "coding",
          codeSnippet: "def detect_shellcode(file_path):\n    # Recherchez les patterns communs de shellcode\n    # NOP sleds (\\x90), appels système, instructions suspectes\n    \n    # Votre code:",
          correctAnswer: "def detect_shellcode(file_path):\n    import re\n    \n    with open(file_path, 'rb') as f:\n        data = f.read()\n    \n    # Pattern NOP sled\n    nop_pattern = b'\\x90' * 10\n    # Pattern common shellcode instructions\n    shellcode_patterns = [\n        b'\\xcd\\x80',  # int 0x80\n        b'\\x0f\\x05',  # syscall\n        b'\\xff\\xe4',  # jmp esp\n    ]\n    \n    indicators = []\n    \n    if nop_pattern in data:\n        indicators.append('NOP sled detected')\n    \n    for pattern in shellcode_patterns:\n        if pattern in data:\n            indicators.append(f'Shellcode pattern: {pattern.hex()}')\n    \n    return indicators",
          points: 80,
          explanation: "La détection heuristique basée sur les patterns connus est efficace contre les shellcodes non polymorphiques."
        },
        {
          id: "q4",
          question: "Analysez ce code PowerShell suspect",
          type: "coding",
          codeSnippet: "$code = [System.Text.Encoding]::Unicode.GetString([System.Convert]::FromBase64String('UwB0AGEAcgB0AC0AUAByAG8AYwBlAHMAcwAgAG4AbwB0AGUAcABhAGQALgBlAHgAZQA='))\nInvoke-Expression $code",
          correctAnswer: "Ce code décode une commande base64 et l'exécute avec Invoke-Expression. La commande décodée lance le processus notepad.",
          points: 60,
          explanation: "L'utilisation de base64 et Invoke-Expression est courante dans les attaques pour obfusquer le code malveillant."
        }
      ]
    }
  ],

  "Analyse Financière": [
    // QCM - MID
    {
      id: nanoid(),
      title: "Analyse des États Financiers",
      description: "Évaluation des compétences en analyse financière fondamentale",
      type: QuizType.QCM,
      difficulty: Difficulty.MID,
      domain: Domain.FINANCE,
      company: "Goldman Sachs",
      technology: ["Excel", "Financial Modeling", "Ratio Analysis"],
      duration: 2400,
      totalPoints: 150,
      questions: [
        {
          id: "q1",
          question: "Quel ratio mesure la capacité d'une entreprise à payer ses dettes à court terme?",
          type: "multiple_choice",
          options: ["Ratio de liquidité générale", "ROE", "Marge nette", "P/E ratio"],
          correctAnswer: "Ratio de liquidité générale",
          points: 25,
          explanation: "Le ratio de liquidité générale (Current Ratio) = Actif circulant / Passif circulant"
        },
        {
          id: "q2",
          question: "Que représente l'EBITDA?",
          type: "multiple_choice",
          options: [
            "Bénéfice avant intérêts, impôts, dépréciation et amortissement",
            "Bénéfice net après impôts",
            "Chiffre d'affaires total",
            "Trésorerie disponible"
          ],
          correctAnswer: "Bénéfice avant intérêts, impôts, dépréciation et amortissement",
          points: 30,
          explanation: "L'EBITDA est une mesure de la performance opérationnelle"
        },
        {
          id: "q3",
          question: "Qu'est-ce que le ROE (Return on Equity)?",
          type: "multiple_choice",
          options: [
            "Bénéfice net / Capitaux propres",
            "Chiffre d'affaires / Actifs",
            "EBITDA / Dette",
            "Dividendes / Prix de l'action"
          ],
          correctAnswer: "Bénéfice net / Capitaux propres",
          points: 35,
          explanation: "Le ROE mesure la rentabilité par rapport aux capitaux propres investis."
        },
        {
          id: "q4",
          question: "Quelle est la formule du Free Cash Flow?",
          type: "multiple_choice",
          options: [
            "Cash Flow opérationnel - Dépenses en capital",
            "Bénéfice net + Amortissements",
            "Revenus - Coûts variables",
            "EBITDA - Impôts"
          ],
          correctAnswer: "Cash Flow opérationnel - Dépenses en capital",
          points: 35,
          explanation: "Le FCF représente la trésorerie disponible après les investissements nécessaires."
        },
        {
          id: "q5",
          question: "Qu'indique un ratio dette/capitaux propres élevé?",
          type: "multiple_choice",
          options: [
            "L'entreprise est fortement endettée",
            "L'entreprise est très profitable",
            "L'entreprise a beaucoup de liquidités",
            "L'entreprise est sous-évaluée"
          ],
          correctAnswer: "L'entreprise est fortement endettée",
          points: 25,
          explanation: "Un ratio élevé indique un levier financier important et un risque accru."
        }
      ]
    },

    // QCM - JUNIOR (NOUVEAU)
    {
      id: nanoid(),
      title: "Comptabilité et Finance de Base",
      description: "Principes fondamentaux de la finance d'entreprise",
      type: QuizType.QCM,
      difficulty: Difficulty.JUNIOR,
      domain: Domain.FINANCE,
      company: "Deloitte",
      technology: ["Accounting", "Financial Statements", "Excel"],
      duration: 1800,
      totalPoints: 100,
      questions: [
        {
          id: "q1",
          question: "Quels sont les trois états financiers principaux?",
          type: "multiple_choice",
          options: [
            "Bilan, Compte de résultat, Tableau des flux de trésorerie",
            "Budget, Forecast, Actuals",
            "Actifs, Passifs, Capitaux propres",
            "Revenus, Coûts, Bénéfices"
          ],
          correctAnswer: "Bilan, Compte de résultat, Tableau des flux de trésorerie",
          points: 20,
          explanation: "Ces trois documents donnent une vue complète de la santé financière."
        },
        {
          id: "q2",
          question: "Qu'est-ce qu'un actif?",
          type: "multiple_choice",
          options: [
            "Une ressource économique contrôlée par l'entreprise",
            "Une dette de l'entreprise",
            "Un revenu futur",
            "Une dépense passée"
          ],
          correctAnswer: "Une ressource économique contrôlée par l'entreprise",
          points: 20,
          explanation: "Les actifs génèrent des bénéfices économiques futurs."
        },
        {
          id: "q3",
          question: "Que représente le bilan comptable?",
          type: "multiple_choice",
          options: [
            "La situation financière à un moment donné",
            "Les revenus sur une période",
            "Les flux de trésorerie annuels",
            "Les prévisions budgétaires"
          ],
          correctAnswer: "La situation financière à un moment donné",
          points: 20,
          explanation: "Le bilan est un instantané de la position financière à une date précise."
        },
        {
          id: "q4",
          question: "Quelle est la formule comptable fondamentale?",
          type: "multiple_choice",
          options: [
            "Actifs = Passifs + Capitaux propres",
            "Revenus - Coûts = Bénéfices",
            "Assets = Liabilities - Equity",
            "Cash In - Cash Out = Net Cash"
          ],
          correctAnswer: "Actifs = Passifs + Capitaux propres",
          points: 20,
          explanation: "Cette équation fondamentale doit toujours être en équilibre."
        },
        {
          id: "q5",
          question: "Qu'est-ce que l'amortissement?",
          type: "multiple_choice",
          options: [
            "La répartition du coût d'un actif sur sa durée de vie",
            "Le remboursement d'une dette",
            "Une perte de valeur immédiate",
            "Un gain en capital"
          ],
          correctAnswer: "La répartition du coût d'un actif sur sa durée de vie",
          points: 20,
          explanation: "L'amortissement reflète l'usure et l'obsolescence des actifs."
        }
      ]
    },

    // TECHNICAL - SENIOR
    {
      id: nanoid(),
      title: "Modélisation Financière Avancée",
      description: "Construction d'un modèle DCF complet",
      type: QuizType.TECHNICAL,
      difficulty: Difficulty.SENIOR,
      domain: Domain.FINANCE,
      company: "J.P. Morgan",
      technology: ["DCF Modeling", "Valuation", "Excel", "VBA"],
      duration: 5400,
      totalPoints: 300,
      questions: [
        {
          id: "q1",
          question: "Implémentez le calcul du WACC dans Excel",
          type: "coding",
          codeSnippet: "// Formule WACC = (E/V * Re) + (D/V * Rd * (1-T))\n// E = valeur marché equity, D = valeur marché debt\n// V = E + D, Re = cost of equity, Rd = cost of debt, T = tax rate\n\n// Créez la formule Excel:",
          correctAnswer: "=(E6/(E6+D6))*F6 + (D6/(E6+D6))*G6*(1-H6)",
          points: 100,
          explanation: "Le WACC est le taux d'actualisation utilisé dans les modèles DCF"
        },
        {
          id: "q2",
          question: "Calculez la valeur terminale avec la méthode Gordon Growth",
          type: "coding",
          codeSnippet: "// Terminal Value = FCF * (1 + g) / (WACC - g)\n// FCF = Free Cash Flow dernière année\n// g = taux de croissance perpétuel\n// WACC = coût moyen pondéré du capital\n\n// Formule Excel:",
          correctAnswer: "=FCF_LastYear*(1+GrowthRate)/(WACC-GrowthRate)",
          points: 100,
          explanation: "La valeur terminale représente la valeur au-delà de la période de projection."
        },
        {
          id: "q3",
          question: "Créez une table de sensibilité pour le WACC et le taux de croissance",
          type: "coding",
          codeSnippet: "// Utilisez une Data Table Excel à deux variables\n// Variable 1: WACC (7%-11%)\n// Variable 2: Growth Rate (2%-4%)\n\n// Décrivez les étapes:",
          correctAnswer: "1. Créer une formule de valorisation\n2. Insérer > Table de données\n3. Ligne d'entrée: cellule WACC\n4. Colonne d'entrée: cellule Growth Rate\n5. Excel calculera automatiquement toutes les combinaisons",
          points: 100,
          explanation: "La table de sensibilité permet d'analyser l'impact des hypothèses clés."
        }
      ]
    }
  ],

  "Stratégie Business": [
    // MOCK_INTERVIEW - SENIOR
    {
      id: nanoid(),
      title: "Stratégie de Croissance Internationale",
      description: "Élaboration d'un plan d'expansion mondiale",
      type: QuizType.MOCK_INTERVIEW,
      difficulty: Difficulty.SENIOR,
      domain: Domain.BUSINESS,
      company: "McKinsey & Company",
      technology: ["Market Analysis", "Business Strategy", "SWOT"],
      duration: 4800,
      totalPoints: 280,
      questions: [
        {
          id: "q1",
          question: "Comment évalueriez-vous l'opportunité d'entrée sur le marché asiatique pour un retailer européen?",
          type: "scenario",
          correctAnswer: "Analyse PESTEL, étude de marché, analyse concurrentielle, evaluation des risques réglementaires et culturels",
          points: 120,
          explanation: "Une approche structurée couvrant tous les aspects du marché cible"
        },
        {
          id: "q2",
          question: "Quelle stratégie d'entrée recommanderiez-vous: acquisition, joint-venture, ou greenfield?",
          type: "scenario",
          correctAnswer: "Analyse comparative basée sur: contrôle désiré, rapidité d'entrée, risques, investissement requis, et connaissance du marché local",
          points: 80,
          explanation: "Chaque mode d'entrée a ses avantages selon le contexte."
        },
        {
          id: "q3",
          question: "Comment adapteriez-vous le business model aux spécificités culturelles locales?",
          type: "scenario",
          correctAnswer: "Localisation du produit, adaptation du pricing, canaux de distribution adaptés, marketing culturellement pertinent",
          points: 80,
          explanation: "La localisation est cruciale pour le succès sur de nouveaux marchés."
        }
      ]
    },

    // QCM - MID (NOUVEAU)
    {
      id: nanoid(),
      title: "Analyse Stratégique et Frameworks",
      description: "Maîtrise des outils d'analyse stratégique",
      type: QuizType.QCM,
      difficulty: Difficulty.MID,
      domain: Domain.BUSINESS,
      company: "BCG",
      technology: ["Porter's Five Forces", "SWOT", "Value Chain"],
      duration: 2400,
      totalPoints: 140,
      questions: [
        {
          id: "q1",
          question: "Que représente la matrice BCG?",
          type: "multiple_choice",
          options: [
            "Un outil de gestion de portefeuille produits",
            "Une analyse de la concurrence",
            "Un framework de pricing",
            "Une méthode de segmentation client"
          ],
          correctAnswer: "Un outil de gestion de portefeuille produits",
          points: 30,
          explanation: "La matrice BCG classe les produits en Stars, Cash Cows, Question Marks et Dogs."
        },
        {
          id: "q2",
          question: "Quelles sont les 5 forces de Porter?",
          type: "multiple_choice",
          options: [
            "Concurrence, nouveaux entrants, substituts, pouvoir fournisseurs et clients",
            "Produit, Prix, Place, Promotion, People",
            "Strengths, Weaknesses, Opportunities, Threats, Trends",
            "Market share, Growth, Profitability, Innovation, Quality"
          ],
          correctAnswer: "Concurrence, nouveaux entrants, substituts, pouvoir fournisseurs et clients",
          points: 35,
          explanation: "Les 5 forces analysent l'attractivité et la compétitivité d'une industrie."
        },
        {
          id: "q3",
          question: "Qu'est-ce qu'un avantage concurrentiel durable?",
          type: "multiple_choice",
          options: [
            "Un avantage difficile à copier par les concurrents",
            "Un avantage temporaire",
            "Un avantage basé uniquement sur le prix",
            "Un avantage géographique"
          ],
          correctAnswer: "Un avantage difficile à copier par les concurrents",
          points: 35,
          explanation: "La durabilité vient de barrières à l'imitation comme les brevets ou la culture."
        },
        {
          id: "q4",
          question: "Que signifie 'Blue Ocean Strategy'?",
          type: "multiple_choice",
          options: [
            "Créer un nouveau marché sans concurrence",
            "Dominer les marchés maritimes",
            "Stratégie de prix bas",
            "Expansion internationale"
          ],
          correctAnswer: "Créer un nouveau marché sans concurrence",
          points: 40,
          explanation: "La stratégie Océan Bleu consiste à innover pour créer un espace de marché incontesté."
        }
      ]
    }
  ],

  "Ingénierie Logicielle": [
    // TECHNICAL - MID
    {
      id: nanoid(),
      title: "Conception de Systèmes Distribués",
      description: "Architecture de systèmes hautement disponibles",
      type: QuizType.TECHNICAL,
      difficulty: Difficulty.MID,
      domain: Domain.ENGINEERING,
      company: "Uber",
      technology: ["Microservices", "Kubernetes", "Docker", "AWS"],
      duration: 3600,
      totalPoints: 220,
      questions: [
        {
          id: "q1",
          question: "Concevez un système de matching ride-driver scalable pour 1M d'utilisateurs simultanés",
          type: "coding",
          codeSnippet: "// Architecture proposée:\n// - Service de géolocalisation\n// - Service de matching\n// - Service de notification\n// - Base de données Redis pour cache\n\n// Implémentez le service de matching:",
          correctAnswer: "class RideMatchingService {\n  async findBestDriver(riderLocation, radius) {\n    const nearbyDrivers = await locationService.getDriversInRadius(riderLocation, radius);\n    return this.calculateBestMatch(riderLocation, nearbyDrivers);\n  }\n}",
          points: 90,
          explanation: "Utilisation de géohashing et algorithmes de matching optimisés"
        },
        {
          id: "q2",
          question: "Implémentez un circuit breaker pattern",
          type: "coding",
          codeSnippet: "// Pattern pour gérer les défaillances de services\n// Votre implémentation:",
          correctAnswer: "class CircuitBreaker {\n  constructor(threshold, timeout) {\n    this.failureCount = 0;\n    this.threshold = threshold;\n    this.timeout = timeout;\n    this.state = 'CLOSED';\n  }\n  \n  async call(fn) {\n    if (this.state === 'OPEN') {\n      throw new Error('Circuit breaker is OPEN');\n    }\n    try {\n      const result = await fn();\n      this.onSuccess();\n      return result;\n    } catch (error) {\n      this.onFailure();\n      throw error;\n    }\n  }\n  \n  onSuccess() {\n    this.failureCount = 0;\n  }\n  \n  onFailure() {\n    this.failureCount++;\n    if (this.failureCount >= this.threshold) {\n      this.state = 'OPEN';\n      setTimeout(() => { this.state = 'CLOSED'; }, this.timeout);\n    }\n  }\n}",
          points: 130,
          explanation: "Le circuit breaker protège le système en arrêtant les appels vers des services défaillants."
        }
      ]
    },

    // QCM - JUNIOR (NOUVEAU)
    {
      id: nanoid(),
      title: "Fondamentaux de l'Ingénierie Logicielle",
      description: "Principes de base et bonnes pratiques",
      type: QuizType.QCM,
      difficulty: Difficulty.JUNIOR,
      domain: Domain.ENGINEERING,
      company: "IBM",
      technology: ["Software Development", "Git", "Testing", "Design Patterns"],
      duration: 1800,
      totalPoints: 100,
      questions: [
        {
          id: "q1",
          question: "Qu'est-ce que le principe SOLID en programmation orientée objet?",
          type: "multiple_choice",
          options: [
            "Un ensemble de 5 principes de conception",
            "Un langage de programmation",
            "Un framework JavaScript",
            "Un outil de test"
          ],
          correctAnswer: "Un ensemble de 5 principes de conception",
          points: 20,
          explanation: "SOLID: Single Responsibility, Open/Closed, Liskov Substitution, Interface Segregation, Dependency Inversion."
        },
        {
          id: "q2",
          question: "Quelle commande Git permet de créer une nouvelle branche?",
          type: "multiple_choice",
          options: ["git branch nom_branche", "git create branch", "git new branch", "git add branch"],
          correctAnswer: "git branch nom_branche",
          points: 15,
          explanation: "On peut aussi utiliser 'git checkout -b nom_branche' pour créer et basculer."
        },
        {
          id: "q3",
          question: "Qu'est-ce qu'un test unitaire?",
          type: "multiple_choice",
          options: [
            "Un test qui vérifie une unité isolée de code",
            "Un test de l'application complète",
            "Un test de performance",
            "Un test manuel"
          ],
          correctAnswer: "Un test qui vérifie une unité isolée de code",
          points: 20,
          explanation: "Les tests unitaires testent des fonctions ou méthodes individuelles."
        },
        {
          id: "q4",
          question: "Qu'est-ce que le pattern Singleton?",
          type: "multiple_choice",
          options: [
            "Un pattern garantissant une seule instance d'une classe",
            "Un pattern pour gérer les collections",
            "Un pattern de communication réseau",
            "Un pattern de conception UI"
          ],
          correctAnswer: "Un pattern garantissant une seule instance d'une classe",
          points: 25,
          explanation: "Le Singleton est utilisé pour les ressources partagées comme les connexions DB."
        },
        {
          id: "q5",
          question: "Que signifie 'refactoring'?",
          type: "multiple_choice",
          options: [
            "Améliorer le code sans changer son comportement",
            "Ajouter de nouvelles fonctionnalités",
            "Corriger des bugs",
            "Optimiser les performances"
          ],
          correctAnswer: "Améliorer le code sans changer son comportement",
          points: 20,
          explanation: "Le refactoring améliore la lisibilité, la maintenabilité et la structure du code."
        }
      ]
    }
  ],

  "Design UX/UI": [
    // SOFT_SKILLS - MID
    {
      id: nanoid(),
      title: "Recherche Utilisateur et Tests Utilisabilité",
      description: "Méthodologies de design centré utilisateur",
      type: QuizType.SOFT_SKILLS,
      difficulty: Difficulty.MID,
      domain: Domain.DESIGN,
      company: "Apple",
      technology: ["User Research", "Figma", "Prototyping", "Usability Testing"],
      duration: 2700,
      totalPoints: 160,
      questions: [
        {
          id: "q1",
          question: "Comment convaincre un client de l'importance des tests utilisateurs itératifs?",
          type: "scenario",
          correctAnswer: "Présenter le ROI, montrer des cas concrets d'échecs évités, démontrer l'impact sur la satisfaction client et les revenus",
          points: 60,
          explanation: "Focus sur les bénéfices business plutôt que sur les processus"
        },
        {
          id: "q2",
          question: "Un stakeholder demande de copier une interface concurrente. Comment gérez-vous cette demande?",
          type: "scenario",
          correctAnswer: "Analyser les besoins réels, comprendre pourquoi cette interface fonctionne, adapter aux utilisateurs spécifiques, proposer une solution originale basée sur la recherche",
          points: 50,
          explanation: "Le design doit être basé sur les besoins utilisateurs, pas la copie."
        },
        {
          id: "q3",
          question: "Comment priorisez-vous les retours utilisateurs contradictoires?",
          type: "scenario",
          correctAnswer: "Identifier les patterns, quantifier les impacts, aligner avec les objectifs business, tester avec des prototypes",
          points: 50,
          explanation: "Les décisions doivent être data-driven et alignées avec la stratégie."
        }
      ]
    },

    // QCM - JUNIOR (NOUVEAU)
    {
      id: nanoid(),
      title: "Principes Fondamentaux du Design UI/UX",
      description: "Bases du design d'interface et expérience utilisateur",
      type: QuizType.QCM,
      difficulty: Difficulty.JUNIOR,
      domain: Domain.DESIGN,
      company: "Adobe",
      technology: ["UI Design", "UX Principles", "Figma", "Wireframing"],
      duration: 1800,
      totalPoints: 100,
      questions: [
        {
          id: "q1",
          question: "Qu'est-ce que la loi de Fitts?",
          type: "multiple_choice",
          options: [
            "Le temps pour atteindre une cible dépend de sa taille et distance",
            "Les utilisateurs préfèrent les designs simples",
            "Les couleurs chaudes attirent plus l'attention",
            "Le scroll infini améliore l'engagement"
          ],
          correctAnswer: "Le temps pour atteindre une cible dépend de sa taille et distance",
          points: 25,
          explanation: "Plus un élément est grand et proche, plus il est facile à atteindre."
        },
        {
          id: "q2",
          question: "Que signifie l'acronyme WCAG?",
          type: "multiple_choice",
          options: [
            "Web Content Accessibility Guidelines",
            "World Creative Arts Group",
            "Website Color And Graphics",
            "Web Component Architecture Guide"
          ],
          correctAnswer: "Web Content Accessibility Guidelines",
          points: 20,
          explanation: "WCAG définit les standards d'accessibilité web."
        },
        {
          id: "q3",
          question: "Qu'est-ce qu'un wireframe?",
          type: "multiple_choice",
          options: [
            "Un schéma basse-fidélité de l'interface",
            "Un prototype interactif",
            "Une maquette haute-fidélité",
            "Un guide de style"
          ],
          correctAnswer: "Un schéma basse-fidélité de l'interface",
          points: 20,
          explanation: "Le wireframe se concentre sur la structure et l'organisation du contenu."
        },
        {
          id: "q4",
          question: "Quelle est la règle du contraste minimum pour le texte selon WCAG AA?",
          type: "multiple_choice",
          options: ["4.5:1", "3:1", "7:1", "2:1"],
          correctAnswer: "4.5:1",
          points: 20,
          explanation: "Un ratio de 4.5:1 assure une lisibilité suffisante pour la plupart des utilisateurs."
        },
        {
          id: "q5",
          question: "Qu'est-ce que la hiérarchie visuelle?",
          type: "multiple_choice",
          options: [
            "L'organisation des éléments par ordre d'importance",
            "La structure des fichiers de design",
            "L'organisation de l'équipe design",
            "La liste des composants UI"
          ],
          correctAnswer: "L'organisation des éléments par ordre d'importance",
          points: 15,
          explanation: "La hiérarchie guide l'œil de l'utilisateur vers les éléments importants."
        }
      ]
    }
  ],

  "DevOps & Cloud": [
    // TECHNICAL - SENIOR
    {
      id: nanoid(),
      title: "Architecture Cloud Native",
      description: "Design de systèmes cloud résilients",
      type: QuizType.TECHNICAL,
      difficulty: Difficulty.SENIOR,
      domain: Domain.DEVOPS,
      company: "AWS",
      technology: ["Terraform", "Kubernetes", "Prometheus", "Grafana"],
      duration: 5400,
      totalPoints: 320,
      questions: [
        {
          id: "q1",
          question: "Automatisez le déploiement blue-green avec Terraform et Kubernetes",
          type: "coding",
          codeSnippet: "# Configuration Terraform pour déploiement blue-green\n# Créez les ressources nécessaires:",
          correctAnswer: `resource "kubernetes_service" "app" {
  metadata {
    name = "app-service"
  }
  spec {
    selector = {
      app = "app"
      version = "v2.0.0"
    }
    port {
      port = 80
      target_port = 8080
    }
    type = "LoadBalancer"
  }
}`,
          points: 120,
          explanation: "Pattern blue-green pour déploiements sans downtime"
        },
        {
          id: "q2",
          question: "Configurez un pipeline CI/CD complet avec GitLab CI",
          type: "coding",
          codeSnippet: "# Créez un .gitlab-ci.yml avec stages: build, test, deploy\n# Votre configuration:",
          correctAnswer: `stages:
  - build
  - test
  - deploy

build:
  stage: build
  script:
    - docker build -t myapp:$CI_COMMIT_SHA .
    - docker push myapp:$CI_COMMIT_SHA

test:
  stage: test
  script:
    - npm test
    - npm run lint

deploy:
  stage: deploy
  script:
    - kubectl set image deployment/myapp myapp=myapp:$CI_COMMIT_SHA
  only:
    - main`,
          points: 100,
          explanation: "Pipeline automatisé pour build, test et déploiement continu."
        },
        {
          id: "q3",
          question: "Implémentez une configuration Prometheus pour monitoring",
          type: "coding",
          codeSnippet: "# Configuration prometheus.yml\n# Surveillez les métriques d'une application Node.js:",
          correctAnswer: `scrape_configs:
  - job_name: 'nodejs-app'
    static_configs:
      - targets: ['localhost:3000']
    metrics_path: '/metrics'
    scrape_interval: 15s
    
  - job_name: 'kubernetes-pods'
    kubernetes_sd_configs:
      - role: pod
    relabel_configs:
      - source_labels: [__meta_kubernetes_pod_annotation_prometheus_io_scrape]
        action: keep
        regex: true`,
          points: 100,
          explanation: "Configuration pour collecter les métriques applicatives et infrastructure."
        }
      ]
    },

    // QCM - MID (NOUVEAU)
    {
      id: nanoid(),
      title: "Containerisation et Orchestration",
      description: "Docker et Kubernetes - Concepts intermédiaires",
      type: QuizType.QCM,
      difficulty: Difficulty.MID,
      domain: Domain.DEVOPS,
      company: "Red Hat",
      technology: ["Docker", "Kubernetes", "Container Registry", "Helm"],
      duration: 2400,
      totalPoints: 150,
      questions: [
        {
          id: "q1",
          question: "Quelle est la différence entre CMD et ENTRYPOINT dans un Dockerfile?",
          type: "multiple_choice",
          options: [
            "ENTRYPOINT définit l'exécutable, CMD fournit les arguments par défaut",
            "CMD est obligatoire, ENTRYPOINT est optionnel",
            "ENTRYPOINT s'exécute au build, CMD au runtime",
            "Ils sont identiques"
          ],
          correctAnswer: "ENTRYPOINT définit l'exécutable, CMD fournit les arguments par défaut",
          points: 30,
          explanation: "ENTRYPOINT et CMD peuvent être combinés pour plus de flexibilité."
        },
        {
          id: "q2",
          question: "Qu'est-ce qu'un Pod dans Kubernetes?",
          type: "multiple_choice",
          options: [
            "La plus petite unité déployable contenant un ou plusieurs conteneurs",
            "Un cluster Kubernetes",
            "Un nœud worker",
            "Un namespace"
          ],
          correctAnswer: "La plus petite unité déployable contenant un ou plusieurs conteneurs",
          points: 25,
          explanation: "Les conteneurs dans un Pod partagent le réseau et le stockage."
        },
        {
          id: "q3",
          question: "Qu'est-ce qu'un Helm Chart?",
          type: "multiple_choice",
          options: [
            "Un package manager pour Kubernetes",
            "Un outil de monitoring",
            "Un type de conteneur",
            "Un dashboard Kubernetes"
          ],
          correctAnswer: "Un package manager pour Kubernetes",
          points: 30,
          explanation: "Helm simplifie le déploiement et la gestion d'applications Kubernetes."
        },
        {
          id: "q4",
          question: "Que fait la commande 'kubectl rollout undo'?",
          type: "multiple_choice",
          options: [
            "Annule le dernier déploiement",
            "Supprime un pod",
            "Redémarre un service",
            "Crée un backup"
          ],
          correctAnswer: "Annule le dernier déploiement",
          points: 30,
          explanation: "Permet un rollback rapide en cas de problème après déploiement."
        },
        {
          id: "q5",
          question: "Qu'est-ce qu'un Kubernetes Service de type LoadBalancer?",
          type: "multiple_choice",
          options: [
            "Expose le service via un load balancer externe",
            "Balance la charge entre les pods",
            "Gère les certificats SSL",
            "Optimise les ressources CPU"
          ],
          correctAnswer: "Expose le service via un load balancer externe",
          points: 35,
          explanation: "Le type LoadBalancer provisionne automatiquement un load balancer cloud."
        }
      ]
    }
  ],

  "Marketing Digital": [
    // QCM - JUNIOR
    {
      id: nanoid(),
      title: "Fondamentaux du Marketing Digital",
      description: "Concepts de base en marketing en ligne",
      type: QuizType.QCM,
      difficulty: Difficulty.JUNIOR,
      domain: Domain.MARKETING,
      company: "Google",
      technology: ["SEO", "Google Analytics", "Social Media"],
      duration: 1800,
      totalPoints: 100,
      questions: [
        {
          id: "q1",
          question: "Qu'est-ce que le CTR dans la publicité en ligne?",
          type: "multiple_choice",
          options: [
            "Click-Through Rate",
            "Conversion Tracking Ratio", 
            "Cost Per Click",
            "Customer Retention Rate"
          ],
          correctAnswer: "Click-Through Rate",
          points: 20,
          explanation: "CTR = (Clicks / Impressions) * 100%"
        },
        {
          id: "q2",
          question: "Que signifie SEO?",
          type: "multiple_choice",
          options: [
            "Search Engine Optimization",
            "Social Engagement Optimization",
            "Sales Efficiency Optimization",
            "Security and Encryption Online"
          ],
          correctAnswer: "Search Engine Optimization",
          points: 15,
          explanation: "Le SEO vise à améliorer le positionnement dans les résultats de recherche."
        },
        {
          id: "q3",
          question: "Qu'est-ce qu'un KPI?",
          type: "multiple_choice",
          options: [
            "Key Performance Indicator",
            "Keyword Position Index",
            "Knowledge Process Integration",
            "Keep Promoting Ideas"
          ],
          correctAnswer: "Key Performance Indicator",
          points: 20,
          explanation: "Les KPIs mesurent l'atteinte des objectifs marketing."
        },
        {
          id: "q4",
          question: "Quelle plateforme est principalement B2B?",
          type: "multiple_choice",
          options: ["LinkedIn", "Instagram", "TikTok", "Snapchat"],
          correctAnswer: "LinkedIn",
          points: 20,
          explanation: "LinkedIn est le réseau social professionnel par excellence."
        },
        {
          id: "q5",
          question: "Qu'est-ce que le marketing de contenu?",
          type: "multiple_choice",
          options: [
            "Créer du contenu de valeur pour attirer des clients",
            "Acheter de la publicité",
            "Envoyer des emails en masse",
            "Optimiser le site web"
          ],
          correctAnswer: "Créer du contenu de valeur pour attirer des clients",
          points: 25,
          explanation: "Le content marketing attire et engage l'audience avec du contenu pertinent."
        }
      ]
    },

    // QCM - MID (NOUVEAU)
    {
      id: nanoid(),
      title: "Marketing Analytics et Conversion",
      description: "Analyse de données et optimisation des conversions",
      type: QuizType.QCM,
      difficulty: Difficulty.MID,
      domain: Domain.MARKETING,
      company: "HubSpot",
      technology: ["Google Analytics", "A/B Testing", "Conversion Optimization"],
      duration: 2100,
      totalPoints: 140,
      questions: [
        {
          id: "q1",
          question: "Qu'est-ce qu'un funnel de conversion?",
          type: "multiple_choice",
          options: [
            "Le parcours de l'utilisateur de la découverte à l'achat",
            "Un outil de collecte d'emails",
            "Un type de publicité",
            "Une métrique de trafic"
          ],
          correctAnswer: "Le parcours de l'utilisateur de la découverte à l'achat",
          points: 30,
          explanation: "Le funnel visualise les étapes et les taux de conversion à chaque niveau."
        },
        {
          id: "q2",
          question: "Que teste un test A/B?",
          type: "multiple_choice",
          options: [
            "Deux versions d'une page pour voir laquelle performe mieux",
            "La vitesse du site",
            "La compatibilité navigateur",
            "Les bugs d'interface"
          ],
          correctAnswer: "Deux versions d'une page pour voir laquelle performe mieux",
          points: 35,
          explanation: "L'A/B testing permet d'optimiser basé sur des données réelles."
        },
        {
          id: "q3",
          question: "Qu'est-ce que le taux de rebond (bounce rate)?",
          type: "multiple_choice",
          options: [
            "Pourcentage de visiteurs qui quittent après une seule page",
            "Taux de retour des clients",
            "Taux d'ouverture des emails",
            "Taux de clics sur les publicités"
          ],
          correctAnswer: "Pourcentage de visiteurs qui quittent après une seule page",
          points: 30,
          explanation: "Un taux de rebond élevé peut indiquer un problème de pertinence ou UX."
        },
        {
          id: "q4",
          question: "Que mesure le ROI marketing?",
          type: "multiple_choice",
          options: [
            "(Revenus - Coûts marketing) / Coûts marketing",
            "Le nombre total de conversions",
            "Le trafic organique",
            "L'engagement sur les réseaux sociaux"
          ],
          correctAnswer: "(Revenus - Coûts marketing) / Coûts marketing",
          points: 45,
          explanation: "Le ROI mesure la rentabilité des investissements marketing."
        }
      ]
    }
  ],

  "Product Management": [
    // MOCK_INTERVIEW - SENIOR
    {
      id: nanoid(),
      title: "Stratégie Produit et Roadmap",
      description: "Développement de vision produit et priorisation",
      type: QuizType.MOCK_INTERVIEW,
      difficulty: Difficulty.SENIOR,
      domain: Domain.PRODUCT,
      company: "Airbnb",
      technology: ["Product Strategy", "Roadmapping", "User Stories"],
      duration: 4500,
      totalPoints: 260,
      questions: [
        {
          id: "q1",
          question: "Comment prioriseriez-vous les features pour un nouveau produit B2B?",
          type: "scenario",
          correctAnswer: "Framework RICE, analyse coût-bénéfice, alignment avec la vision stratégique, feedback clients",
          points: 100,
          explanation: "Approche data-driven combinant métriques et insights qualitatifs"
        },
        {
          id: "q2",
          question: "Un client majeur demande une feature qui ne correspond pas à votre vision. Comment gérez-vous cela?",
          type: "scenario",
          correctAnswer: "Comprendre le besoin sous-jacent, évaluer l'impact sur les autres clients, proposer des alternatives alignées avec la stratégie, négocier un compromis si critique",
          points: 80,
          explanation: "Équilibrer les besoins clients et la vision produit à long terme."
        },
        {
          id: "q3",
          question: "Comment mesureriez-vous le succès d'une nouvelle feature?",
          type: "scenario",
          correctAnswer: "Définir des métriques clés (adoption, engagement, rétention, impact business), établir une baseline, monitorer l'évolution, itérer basé sur les données",
          points: 80,
          explanation: "Les métriques doivent être définies avant le lancement."
        }
      ]
    },

    // QCM - MID (NOUVEAU)
    {
      id: nanoid(),
      title: "Méthodologies Agile et Scrum",
      description: "Gestion de produit en environnement Agile",
      type: QuizType.QCM,
      difficulty: Difficulty.MID,
      domain: Domain.PRODUCT,
      company: "Spotify",
      technology: ["Agile", "Scrum", "Kanban", "User Stories"],
      duration: 2100,
      totalPoints: 130,
      questions: [
        {
          id: "q1",
          question: "Qu'est-ce qu'un sprint dans Scrum?",
          type: "multiple_choice",
          options: [
            "Une période de temps fixe (généralement 2 semaines) pour développer des features",
            "Une réunion quotidienne",
            "Un outil de gestion de projet",
            "Une métrique de performance"
          ],
          correctAnswer: "Une période de temps fixe (généralement 2 semaines) pour développer des features",
          points: 25,
          explanation: "Le sprint est l'unité de base de développement en Scrum."
        },
        {
          id: "q2",
          question: "Quel est le rôle principal du Product Owner?",
          type: "multiple_choice",
          options: [
            "Maximiser la valeur du produit et gérer le backlog",
            "Écrire le code",
            "Gérer l'équipe de développement",
            "Faire les tests"
          ],
          correctAnswer: "Maximiser la valeur du produit et gérer le backlog",
          points: 30,
          explanation: "Le PO est le pont entre les stakeholders et l'équipe de développement."
        },
        {
          id: "q3",
          question: "Que signifie 'MVP' en product management?",
          type: "multiple_choice",
          options: [
            "Minimum Viable Product",
            "Maximum Value Proposition",
            "Most Valuable Player",
            "Minimum Verification Process"
          ],
          correctAnswer: "Minimum Viable Product",
          points: 30,
          explanation: "Le MVP permet de tester rapidement une hypothèse avec le minimum de features."
        },
        {
          id: "q4",
          question: "Qu'est-ce qu'une user story?",
          type: "multiple_choice",
          options: [
            "Une description courte d'une fonctionnalité du point de vue utilisateur",
            "L'historique d'utilisation d'un client",
            "Un témoignage client",
            "Un cas d'usage technique"
          ],
          correctAnswer: "Une description courte d'une fonctionnalité du point de vue utilisateur",
          points: 45,
          explanation: "Format typique: 'En tant que [rôle], je veux [action] afin de [bénéfice]'."
        }
      ]
    }
  ],

  "Architecture Cloud": [
    // TECHNICAL - SENIOR
    {
      id: nanoid(), 
      title: "Design Multi-Cloud",
      description: "Architecture cloud hybride et multi-fournisseur",
      type: QuizType.TECHNICAL,
      difficulty: Difficulty.SENIOR,
      domain: Domain.ARCHITECTURE,
      company: "Microsoft Azure",
      technology: ["AWS", "Azure", "GCP", "Terraform"],
      duration: 6000,
      totalPoints: 350,
      questions: [
        {
          id: "q1",
          question: "Concevez une architecture multi-cloud pour haute disponibilité",
          type: "coding",
          codeSnippet: "# Configuration Terraform multi-cloud\n# AWS + Azure pour redondance\n\n# Votre code:",
          correctAnswer: `# AWS Resources
resource "aws_instance" "primary" {
  ami           = "ami-123456"
  instance_type = "t3.large"
}

# Azure Resources  
resource "azurerm_virtual_machine" "secondary" {
  name                  = "vm-backup"
  location              = "East US"
  resource_group_name   = azurerm_resource_group.example.name
  network_interface_ids = [azurerm_network_interface.example.id]
  vm_size               = "Standard_DS2_v2"
}`,
          points: 150,
          explanation: "Architecture active-active avec load balancing multi-cloud"
        },
        {
          id: "q2",
          question: "Implémentez une stratégie de disaster recovery cross-cloud",
          type: "coding",
          codeSnippet: "# Stratégie de backup automatisé AWS vers Azure\n# Votre solution:",
          correctAnswer: `# Backup Lambda Function
resource "aws_lambda_function" "backup" {
  function_name = "cross-cloud-backup"
  runtime       = "python3.9"
  handler       = "backup.handler"
  
  environment {
    variables = {
      AZURE_STORAGE_CONNECTION = var.azure_connection
      BACKUP_SCHEDULE = "0 2 * * *"
    }
  }
}

# CloudWatch Event Rule
resource "aws_cloudwatch_event_rule" "backup_schedule" {
  name                = "daily-backup"
  schedule_expression = "cron(0 2 * * ? *)"
}`,
          points: 200,
          explanation: "Automatisation des backups cross-cloud pour garantir la continuité."
        }
      ]
    }
  ],

  "Développement Mobile": [
    // TECHNICAL - MID
    {
      id: nanoid(),
      title: "Développement React Native Avancé",
      description: "Performance et optimisation mobile",
      type: QuizType.TECHNICAL,
      difficulty: Difficulty.MID,
      domain: Domain.MOBILE,
      company: "Facebook",
      technology: ["React Native", "Redux", "Firebase", "iOS", "Android"],
      duration: 3600,
      totalPoints: 200,
      questions: [
        {
          id: "q1",
          question: "Optimisez les performances d'une liste avec 1000+ éléments",
          type: "coding",
          codeSnippet: "// Composant React Native avec FlatList\n// Implémentez le virtual scrolling:",
          correctAnswer: `<FlatList
  data={data}
  renderItem={renderItem}
  keyExtractor={item => item.id}
  initialNumToRender={10}
  maxToRenderPerBatch={5}
  windowSize={5}
  removeClippedSubviews={true}
  getItemLayout={(data, index) => ({
    length: ITEM_HEIGHT,
    offset: ITEM_HEIGHT * index,
    index,
  })}
/>`,
          points: 80,
          explanation: "Virtualisation pour éviter le rendu de tous les éléments simultanément"
        },
        {
          id: "q2",
          question: "Implémentez l'authentification biométrique (Face ID / Touch ID)",
          type: "coding",
          codeSnippet: "// Utilisez react-native-biometrics\n// Votre implémentation:",
          correctAnswer: `import ReactNativeBiometrics from 'react-native-biometrics';\n\nconst authenticateUser = async () => {\n  const rnBiometrics = new ReactNativeBiometrics();\n  \n  try {\n    const { available, biometryType } = await rnBiometrics.isSensorAvailable();\n    \n    if (available) {\n      const { success } = await rnBiometrics.simplePrompt({\n        promptMessage: 'Authentifiez-vous'\n      });\n      \n      if (success) {\n        console.log('Authentification réussie');\n        return true;\n      }\n    }\n  } catch (error) {\n    console.error('Erreur biométrique:', error);\n  }\n  return false;\n};`,
          points: 120,
          explanation: "L'authentification biométrique améliore la sécurité et l'UX."
        }
      ]
    },

    // QCM - JUNIOR (NOUVEAU)
    {
      id: nanoid(),
      title: "Fondamentaux du Développement Mobile",
      description: "Bases du développement iOS et Android",
      type: QuizType.QCM,
      difficulty: Difficulty.JUNIOR,
      domain: Domain.MOBILE,
      company: "Samsung",
      technology: ["iOS", "Android", "Mobile UI", "App Store"],
      duration: 1800,
      totalPoints: 100,
      questions: [
        {
          id: "q1",
          question: "Quelle est la différence entre natif et cross-platform?",
          type: "multiple_choice",
          options: [
            "Natif utilise les langages spécifiques à la plateforme, cross-platform partage du code",
            "Natif est plus lent que cross-platform",
            "Cross-platform ne fonctionne que sur Android",
            "Aucune différence"
          ],
          correctAnswer: "Natif utilise les langages spécifiques à la plateforme, cross-platform partage du code",
          points: 25,
          explanation: "Natif: Swift/Objective-C pour iOS, Kotlin/Java pour Android. Cross-platform: React Native, Flutter."
        },
        {
          id: "q2",
          question: "Qu'est-ce qu'une Activity dans Android?",
          type: "multiple_choice",
          options: [
            "Un écran ou interface utilisateur",
            "Un processus en arrière-plan",
            "Une base de données",
            "Un service réseau"
          ],
          correctAnswer: "Un écran ou interface utilisateur",
          points: 20,
          explanation: "L'Activity représente un écran unique dans une application Android."
        },
        {
          id: "q3",
          question: "Quel format d'image est recommandé pour les icônes d'applications?",
          type: "multiple_choice",
          options: ["PNG", "JPEG", "GIF", "BMP"],
          correctAnswer: "PNG",
          points: 15,
          explanation: "PNG supporte la transparence et offre une bonne qualité sans perte."
        },
        {
          id: "q4",
          question: "Qu'est-ce que le lifecycle d'une application mobile?",
          type: "multiple_choice",
          options: [
            "Les différents états par lesquels passe l'application",
            "La durée de vie de l'application",
            "Le processus de publication",
            "La version de l'application"
          ],
          correctAnswer: "Les différents états par lesquels passe l'application",
          points: 20,
          explanation: "États typiques: Created, Started, Resumed, Paused, Stopped, Destroyed."
        },
        {
          id: "q5",
          question: "Pourquoi optimiser la consommation de batterie est-il important?",
          type: "multiple_choice",
          options: [
            "Impact direct sur l'expérience utilisateur et les notes",
            "Obligation légale",
            "Pour accélérer l'application",
            "Pour réduire la taille de l'app"
          ],
          correctAnswer: "Impact direct sur l'expérience utilisateur et les notes",
          points: 20,
          explanation: "Une mauvaise gestion de la batterie entraîne des désinstallations."
        }
      ]
    }
  ],

  "Communication": [
    // SOFT_SKILLS - MID
    {
      id: nanoid(),
      title: "Communication Interculturelle",
      description: "Communication efficace en environnement international",
      type: QuizType.SOFT_SKILLS,
      difficulty: Difficulty.MID,
      domain: Domain.COMMUNICATION,
      company: "UNESCO",
      technology: ["Public Speaking", "Cross-cultural", "Negotiation"],
      duration: 2400,
      totalPoints: 140,
      questions: [
        {
          id: "q1",
          question: "Comment adapter votre communication pour une équipe distribuée sur 4 continents?",
          type: "scenario",
          correctAnswer: "Respect des fuseaux horaires, sensibilité culturelle, communication asynchrone, outils collaboratifs adaptés",
          points: 50,
          explanation: "L'adaptation culturelle et technique est cruciale pour les équipes distribuées"
        },
        {
          id: "q2",
          question: "Un collègue japonais semble éviter la confrontation directe. Comment abordez-vous un désaccord?",
          type: "scenario",
          correctAnswer: "Communication indirecte et respectueuse, sauvegarder la face, discussion privée, suggestion plutôt qu'ordre",
          points: 45,
          explanation: "Certaines cultures privilégient l'harmonie et la communication indirecte."
        },
        {
          id: "q3",
          question: "Comment présenter des résultats négatifs à un client important?",
          type: "scenario",
          correctAnswer: "Transparence honnête, contextualisation, plan d'action correctif, focus sur les solutions plutôt que les problèmes",
          points: 45,
          explanation: "La confiance se construit par l'honnêteté et la proactivité."
        }
      ]
    },

    // QCM - JUNIOR (NOUVEAU)
    {
      id: nanoid(),
      title: "Communication Professionnelle de Base",
      description: "Principes essentiels de communication en entreprise",
      type: QuizType.QCM,
      difficulty: Difficulty.JUNIOR,
      domain: Domain.COMMUNICATION,
      company: "Toastmasters",
      technology: ["Email Writing", "Presentation", "Active Listening"],
      duration: 1500,
      totalPoints: 90,
      questions: [
        {
          id: "q1",
          question: "Quelle est la structure recommandée pour un email professionnel?",
          type: "multiple_choice",
          options: [
            "Objet clair, salutation, contexte, demande, clôture",
            "Salutation, longue introduction, demande cachée",
            "Demande directe sans contexte",
            "Texte informel sans structure"
          ],
          correctAnswer: "Objet clair, salutation, contexte, demande, clôture",
          points: 20,
          explanation: "Une structure claire facilite la compréhension et la réponse."
        },
        {
          id: "q2",
          question: "Qu'est-ce que l'écoute active?",
          type: "multiple_choice",
          options: [
            "Écouter attentivement et reformuler pour confirmer la compréhension",
            "Écouter en préparant sa réponse",
            "Écouter sans poser de questions",
            "Écouter de la musique en travaillant"
          ],
          correctAnswer: "Écouter attentivement et reformuler pour confirmer la compréhension",
          points: 25,
          explanation: "L'écoute active montre l'engagement et évite les malentendus."
        },
        {
          id: "q3",
          question: "Comment gérer le trac avant une présentation?",
          type: "multiple_choice",
          options: [
            "Préparation approfondie, respiration, visualisation positive",
            "Improviser complètement",
            "Éviter les présentations",
            "Boire du café"
          ],
          correctAnswer: "Préparation approfondie, respiration, visualisation positive",
          points: 25,
          explanation: "La confiance vient de la préparation et des techniques de gestion du stress."
        },
        {
          id: "q4",
          question: "Quel ton adopter dans une communication professionnelle écrite?",
          type: "multiple_choice",
          options: [
            "Courtois, clair et professionnel",
            "Très formel et distant",
            "Décontracté avec des emojis",
            "Autoritaire et direct"
          ],
          correctAnswer: "Courtois, clair et professionnel",
          points: 20,
          explanation: "Le ton doit être adapté au contexte et au destinataire."
        }
      ]
    }
  ],

  "Management": [
    // SOFT_SKILLS - SENIOR
    {
      id: nanoid(),
      title: "Leadership Transformationnel",
      description: "Gestion du changement et développement d'équipe",
      type: QuizType.SOFT_SKILLS,
      difficulty: Difficulty.SENIOR,
      domain: Domain.MANAGEMENT,
      company: "Google",
      technology: ["Team Leadership", "Change Management", "Coaching"],
      duration: 3600,
      totalPoints: 200,
      questions: [
        {
          id: "q1",
          question: "Comment manageriez-vous une équipe en transition vers l'agilité?",
          type: "scenario",
          correctAnswer: "Communication transparente, formation progressive, célébration des petites victoires, support continu",
          points: 80,
          explanation: "Le changement doit être progressif et soutenu par le management"
        },
        {
          id: "q2",
          question: "Un membre senior résiste au changement et influence négativement l'équipe. Quelle approche adoptez-vous?",
          type: "scenario",
          correctAnswer: "Dialogue individuel pour comprendre les craintes, impliquer dans la solution, démontrer les bénéfices, établir des attentes claires",
          points: 70,
          explanation: "Les résistants peuvent devenir des champions s'ils sont bien accompagnés."
        },
        {
          id: "q3",
          question: "Comment développer les compétences de votre équipe tout en maintenant la productivité?",
          type: "scenario",
          correctAnswer: "Plan de formation structuré, mentorat, temps dédié à l'apprentissage, projets stretch, feedback régulier",
          points: 50,
          explanation: "Investir dans le développement améliore la rétention et la performance long terme."
        }
      ]
    },

    // QCM - MID (NOUVEAU)
    {
      id: nanoid(),
      title: "Gestion d'Équipe et Performance",
      description: "Techniques de management et motivation d'équipe",
      type: QuizType.QCM,
      difficulty: Difficulty.MID,
      domain: Domain.MANAGEMENT,
      company: "Salesforce",
      technology: ["Team Management", "Performance Review", "Motivation"],
      duration: 2100,
      totalPoints: 130,
      questions: [
        {
          id: "q1",
          question: "Qu'est-ce que le modèle de leadership situationnel?",
          type: "multiple_choice",
          options: [
            "Adapter son style de leadership selon la maturité de l'équipe",
            "Changer de leader selon la situation",
            "Gérer les situations de crise",
            "Diriger depuis n'importe quel endroit"
          ],
          correctAnswer: "Adapter son style de leadership selon la maturité de l'équipe",
          points: 35,
          explanation: "Le style varie de directif à délégatif selon le niveau d'autonomie."
        },
        {
          id: "q2",
          question: "Quelle est la fréquence idéale pour des 1-on-1 avec les membres de l'équipe?",
          type: "multiple_choice",
          options: [
            "Hebdomadaire ou bi-hebdomadaire",
            "Une fois par mois",
            "Une fois par trimestre",
            "Seulement quand nécessaire"
          ],
          correctAnswer: "Hebdomadaire ou bi-hebdomadaire",
          points: 30,
          explanation: "Des points réguliers permettent de détecter et résoudre les problèmes rapidement."
        },
        {
          id: "q3",
          question: "Qu'est-ce que le feedback sandwich?",
          type: "multiple_choice",
          options: [
            "Positif - Constructif - Positif",
            "Manger pendant le feedback",
            "Donner trois feedbacks en même temps",
            "Alterner feedback oral et écrit"
          ],
          correctAnswer: "Positif - Constructif - Positif",
          points: 30,
          explanation: "Cette technique adoucit le feedback critique, mais peut être perçue comme manipulatrice."
        },
        {
          id: "q4",
          question: "Comment mesurer l'engagement de l'équipe?",
          type: "multiple_choice",
          options: [
            "Enquêtes régulières, taux de rétention, productivité, participation",
            "Seulement les heures travaillées",
            "Le nombre de réunions",
            "Les revenus générés"
          ],
          correctAnswer: "Enquêtes régulières, taux de rétention, productivité, participation",
          points: 35,
          explanation: "L'engagement est multidimensionnel et nécessite plusieurs indicateurs."
        }
      ]
    }
  ],

  "Formation": [
    // MOCK_INTERVIEW - MID
    {
      id: nanoid(),
      title: "Conception de Programme Pédagogique",
      description: "Développement de curriculum et méthodes d'enseignement",
      type: QuizType.MOCK_INTERVIEW,
      difficulty: Difficulty.MID,
      domain: Domain.EDUCATION,
      company: "Coursera",
      technology: ["Curriculum Design", "EdTech", "Learning Methods"],
      duration: 3000,
      totalPoints: 180,
      questions: [
        {
          id: "q1",
          question: "Comment concevriez-vous un cours en ligne engageant sur l'IA?",
          type: "scenario",
          correctAnswer: "Apprentissage par projets, contenu interactif, communauté d'apprentissage, évaluations pratiques",
          points: 70,
          explanation: "L'engagement vient de l'interactivité et de l'applicabilité pratique"
        },
        {
          id: "q2",
          question: "Comment adapteriez-vous votre contenu pour différents styles d'apprentissage?",
          type: "scenario",
          correctAnswer: "Contenu multimodal: vidéos, textes, exercices pratiques, discussions, infographies",
          points: 60,
          explanation: "Varier les formats répond aux préférences visuelles, auditives et kinesthésiques."
        },
        {
          id: "q3",
          question: "Comment mesureriez-vous l'efficacité de votre formation?",
          type: "scenario",
          correctAnswer: "Taux de complétion, évaluations pré/post, feedback apprenant, application pratique des compétences",
          points: 50,
          explanation: "Les métriques doivent mesurer l'apprentissage réel, pas juste la participation."
        }
      ]
    },

    // QCM - JUNIOR (NOUVEAU)
    {
      id: nanoid(),
      title: "Pédagogie et Méthodes d'Enseignement",
      description: "Fondamentaux de l'éducation et de la formation",
      type: QuizType.QCM,
      difficulty: Difficulty.JUNIOR,
      domain: Domain.EDUCATION,
      company: "Khan Academy",
      technology: ["Teaching Methods", "Learning Theory", "Assessment"],
      duration: 1800,
      totalPoints: 100,
      questions: [
        {
          id: "q1",
          question: "Qu'est-ce que la taxonomie de Bloom?",
          type: "multiple_choice",
          options: [
            "Une hiérarchie des objectifs d'apprentissage",
            "Une classification des étudiants",
            "Un type d'examen",
            "Une méthode d'enseignement"
          ],
          correctAnswer: "Une hiérarchie des objectifs d'apprentissage",
          points: 25,
          explanation: "De base à avancé: Se souvenir, Comprendre, Appliquer, Analyser, Évaluer, Créer."
        },
        {
          id: "q2",
          question: "Qu'est-ce que l'apprentissage actif?",
          type: "multiple_choice",
          options: [
            "Impliquer activement les apprenants dans le processus",
            "Faire du sport pendant les cours",
            "Apprendre rapidement",
            "Enseigner debout"
          ],
          correctAnswer: "Impliquer activement les apprenants dans le processus",
          points: 20,
          explanation: "L'apprentissage actif augmente la rétention et l'engagement."
        },
        {
          id: "q3",
          question: "Quelle est la différence entre évaluation formative et sommative?",
          type: "multiple_choice",
          options: [
            "Formative pendant l'apprentissage, sommative à la fin",
            "Formative est écrite, sommative est orale",
            "Formative est obligatoire, sommative est optionnelle",
            "Aucune différence"
          ],
          correctAnswer: "Formative pendant l'apprentissage, sommative à la fin",
          points: 30,
          explanation: "Formative guide l'apprentissage, sommative mesure les acquis finaux."
        },
        {
          id: "q4",
          question: "Qu'est-ce que la classe inversée (flipped classroom)?",
          type: "multiple_choice",
          options: [
            "Théorie à la maison, pratique en classe",
            "Enseigner à l'envers",
            "Cours le soir au lieu du matin",
            "Les étudiants enseignent"
          ],
          correctAnswer: "Théorie à la maison, pratique en classe",
          points: 25,
          explanation: "Maximise le temps en classe pour l'interaction et l'application."
        }
      ]
    }
  ],

  "Santé Digitale": [
    // TECHNICAL - SENIOR
    {
      id: nanoid(),
      title: "Sécurité des Données Médicales",
      description: "Conformité HIPAA et protection des données patients",
      type: QuizType.TECHNICAL,
      difficulty: Difficulty.SENIOR,
      domain: Domain.HEALTH,
      company: "Teladoc",
      technology: ["HIPAA", "Security", "AWS", "Encryption"],
      duration: 4800,
      totalPoints: 280,
      questions: [
        {
          id: "q1",
          question: "Implémentez le chiffrement des données patients au repos et en transit",
          type: "coding",
          codeSnippet: "// Configuration AWS pour données médicales HIPAA compliant\n// Votre code:",
          correctAnswer: `# Chiffrement S3 pour données au repos
resource "aws_s3_bucket" "medical_data" {
  bucket = "medical-records"
  
  server_side_encryption_configuration {
    rule {
      apply_server_side_encryption_by_default {
        sse_algorithm = "AES256"
      }
    }
  }
}

# Chiffrement en transit avec TLS 1.2+
resource "aws_lb_listener" "https" {
  load_balancer_arn = aws_lb.main.arn
  port              = 443
  protocol          = "HTTPS"
  ssl_policy        = "ELBSecurityPolicy-TLS-1-2-2017-01"
  certificate_arn   = aws_acm_certificate.main.arn
}`,
          points: 120,
          explanation: "Double chiffrement requis pour la conformité HIPAA"
        },
        {
          id: "q2",
          question: "Créez un système d'audit trail pour l'accès aux dossiers patients",
          type: "coding",
          codeSnippet: "// Système de logging conforme HIPAA\n// Votre implémentation:",
          correctAnswer: `const logPatientAccess = async (userId, patientId, action) => {
  const auditEntry = {
    timestamp: new Date().toISOString(),
    userId,
    patientId,
    action,
    ipAddress: request.ip,
    userAgent: request.headers['user-agent'],
    outcome: 'SUCCESS'
  };
  
  await auditLog.insert(auditEntry);
  
  // Retention obligatoire de 6 ans minimum
  await s3.putObject({
    Bucket: 'hipaa-audit-logs',
    Key: \`\${patientId}/\${Date.now()}.json\`,
    Body: JSON.stringify(auditEntry),
    ServerSideEncryption: 'AES256'
  });
};`,
          points: 160,
          explanation: "HIPAA exige un audit trail complet de tous les accès aux données patients."
        }
      ]
    },

    // QCM - MID (NOUVEAU)
    {
      id: nanoid(),
      title: "Télémédecine et Applications de Santé",
      description: "Technologies et réglementations en e-santé",
      type: QuizType.QCM,
      difficulty: Difficulty.MID,
      domain: Domain.HEALTH,
      company: "Doctolib",
      technology: ["Telemedicine", "HL7", "FHIR", "Medical Devices"],
      duration: 2100,
      totalPoints: 140,
      questions: [
        {
          id: "q1",
          question: "Qu'est-ce que le standard HL7 FHIR?",
          type: "multiple_choice",
          options: [
            "Un standard d'interopérabilité pour les données de santé",
            "Un algorithme de chiffrement médical",
            "Un protocole réseau",
            "Une certification de sécurité"
          ],
          correctAnswer: "Un standard d'interopérabilité pour les données de santé",
          points: 35,
          explanation: "FHIR facilite l'échange de données médicales entre systèmes différents."
        },
        {
          id: "q2",
          question: "Quelles sont les exigences principales de la réglementation RGPD pour les données de santé?",
          type: "multiple_choice",
          options: [
            "Consentement explicite, minimisation des données, droit à l'oubli",
            "Seulement le chiffrement",
            "Stockage obligatoire en Europe",
            "Anonymisation systématique"
          ],
          correctAnswer: "Consentement explicite, minimisation des données, droit à l'oubli",
          points: 40,
          explanation: "Les données de santé sont des données sensibles nécessitant une protection renforcée."
        },
        {
          id: "q3",
          question: "Qu'est-ce qu'un dispositif médical connecté?",
          type: "multiple_choice",
          options: [
            "Un appareil médical qui collecte et transmet des données de santé",
            "Un ordinateur dans un hôpital",
            "Une application mobile de santé",
            "Un réseau d'hôpitaux"
          ],
          correctAnswer: "Un appareil médical qui collecte et transmet des données de santé",
          points: 30,
          explanation: "Exemples: glucomètres connectés, moniteurs cardiaques, pompes à insuline."
        },
        {
          id: "q4",
          question: "Qu'est-ce que la téléconsultation?",
          type: "multiple_choice",
          options: [
            "Une consultation médicale à distance par vidéo",
            "Un appel téléphonique simple",
            "Une visite à domicile",
            "Un email au médecin"
          ],
          correctAnswer: "Une consultation médicale à distance par vidéo",
          points: 35,
          explanation: "La téléconsultation doit garantir le secret médical et la qualité des soins."
        }
      ]
    }
  ]
};

// S'assurer qu'on a au moins 1 quiz de chaque type (QCM, TECHNICAL, MOCK_INTERVIEW, SOFT_SKILLS) par métier
const REQUIRED_TYPES: QuizType[] = [QuizType.QCM, QuizType.TECHNICAL, QuizType.MOCK_INTERVIEW, QuizType.SOFT_SKILLS];

function defaultTechForProfession(profession: string): string[] {
  const key = profession.toLowerCase();
  if (key.includes('data')) return ['Python','Pandas','NumPy'];
  if (key.includes('fullstack') || key.includes('ingénierie') || key.includes('dev')) return ['JavaScript','Node.js','React'];
  if (key.includes('cyber')) return ['OWASP','Security'];
  if (key.includes('marketing')) return ['SEO','Analytics'];
  if (key.includes('product')) return ['Roadmap','Analytics'];
  if (key.includes('mobile')) return ['React Native','Android','iOS'];
  if (key.includes('design')) return ['Figma','UX','UI'];
  if (key.includes('cloud') || key.includes('devops')) return ['Kubernetes','Terraform'];
  if (key.includes('finance')) return ['Excel','Modeling'];
  return ['General'];
}

function makeDefaultQuiz(profession: string, type: QuizType): Quiz {
  const baseTitle = `${profession} - ${type} (Par défaut)`;
  const tech = defaultTechForProfession(profession);
  const difficulty = type === QuizType.QCM ? Difficulty.JUNIOR
                   : type === QuizType.TECHNICAL ? Difficulty.MID
                   : type === QuizType.MOCK_INTERVIEW ? Difficulty.SENIOR
                   : Difficulty.MID;
  const duration = type === QuizType.TECHNICAL ? 3600 : type === QuizType.QCM ? 1800 : 2700;
  const totalPoints = type === QuizType.TECHNICAL ? 200 : type === QuizType.QCM ? 100 : 150;
  const questions: QuizQuestion[] = type === QuizType.QCM
    ? [
        { id: 'q1', question: 'Question QCM par défaut', type: 'multiple_choice', options: ['A','B','C','D'], correctAnswer: 'A', points: 20 },
        { id: 'q2', question: 'Deuxième question QCM', type: 'multiple_choice', options: ['A','B','C','D'], correctAnswer: 'B', points: 20 }
      ]
    : type === QuizType.TECHNICAL
    ? [
        { id: 'q1', question: "Implémentez une fonction par défaut", type: 'coding', codeSnippet: '// votre code', correctAnswer: 'function ok(){}', points: 100 }
      ]
    : type === QuizType.MOCK_INTERVIEW
    ? [
        { id: 'q1', question: "Décrivez votre approche pour un cas d'entretien type", type: 'scenario', correctAnswer: 'Réponse structurée (STAR)', points: 80 }
      ]
    : [
        { id: 'q1', question: "Gérez un conflit d'équipe (défaut)", type: 'scenario', correctAnswer: 'Communication, plan d’action, suivi', points: 60 }
      ];

  return {
    id: `${profession.toLowerCase().replace(/\s+/g,'-')}-${type.toLowerCase()}-default-1`,
    title: baseTitle,
    description: `Quiz par défaut ajouté pour compléter les types d'interviews (${type}).`,
    type,
    questions,
    difficulty,
    company: 'DevPrepAI',
    technology: tech,
    duration,
    totalPoints,
  };
}

const AUGMENTED_QUIZZES_BY_PROFESSION: Record<string, Quiz[]> = Object.fromEntries(
  Object.entries(QUIZZES_BY_PROFESSION).map(([profession, quizzes]) => {
    const present = new Set(quizzes.map(q => q.type));
    const missing = REQUIRED_TYPES.filter(t => !present.has(t));
    const additions = missing.map(t => makeDefaultQuiz(profession, t));
    return [profession, [...quizzes, ...additions]] as const;
  })
);

// Fonction utilitaire pour récupérer les quizzes par critères (sur le catalogue augmenté)
export function getQuizzesByCriteria(profession: string, difficulty?: Difficulty, type?: QuizType): Quiz[] {
  let quizzes = AUGMENTED_QUIZZES_BY_PROFESSION[profession] || [];
  
  if (difficulty) {
    quizzes = quizzes.filter(quiz => quiz.difficulty === difficulty);
  }
  
  if (type) {
    quizzes = quizzes.filter(quiz => quiz.type === type);
  }
  
  return quizzes;
}

// Fonction pour récupérer tous les quizzes disponibles
export function getAllQuizzes(): Quiz[] {
  return Object.values(QUIZZES_BY_PROFESSION).flat();
}

// Exemple d'utilisation:
// const fullstackJuniorQCM = getQuizzesByCriteria("Développement Fullstack", Difficulty.JUNIOR, QuizType.QCM);
// const allDataScience = getQuizzesByCriteria("Data Science");