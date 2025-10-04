import { Difficulty, QuizType } from "@prisma/client";


export interface QuizQuestion {
  id: string;
  question: string;
  type: 'multiple_choice' | 'coding' | 'text' | 'scenario';
  options?: string[];
  correctAnswer: string | string[];
  explanation?: string;
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
      id: "fs-qcm-junior-1",
      title: "Fondamentaux HTML/CSS/JavaScript",
      description: "Testez vos connaissances de base en développement web",
      type: QuizType.QCM,
      difficulty: Difficulty.JUNIOR,
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
      id: "fs-technical-mid-1",
      title: "Développement d'une API RESTful",
      description: "Créez une API REST complète avec Node.js et Express",
      type: QuizType.TECHNICAL,
      difficulty: Difficulty.MID,
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
      id: "fs-mock-senior-1", 
      title: "Architecture d'Application E-commerce",
      description: "Design system et questions d'architecture avancée",
      type: QuizType.MOCK_INTERVIEW,
      difficulty: Difficulty.SENIOR,
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
      id: "fs-soft-mid-1",
      title: "Leadership Technique et Collaboration",
      description: "Scénarios de leadership et résolution de conflits",
      type: QuizType.SOFT_SKILLS, 
      difficulty: Difficulty.MID,
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
    }
  ],

  "Data Science": [
    // QCM - JUNIOR
    {
      id: "ds-qcm-junior-1",
      title: "Fondamentaux Python et Pandas",
      description: "Connaissances de base en data manipulation avec Python",
      type: QuizType.QCM,
      difficulty: Difficulty.JUNIOR, 
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

    // TECHNICAL - SENIOR
    {
      id: "ds-technical-senior-1",
      title: "Optimisation de Modèles de Machine Learning",
      description: "Techniques avancées d'optimisation et feature engineering",
      type: QuizType.TECHNICAL,
      difficulty: Difficulty.SENIOR,
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
    }
  ],

  "Cybersécurité": [
    // QCM - MID
    {
      id: "sec-qcm-mid-1",
      title: "Sécurité des Applications Web",
      description: "Vulnérabilités OWASP et bonnes pratiques",
      type: QuizType.QCM,
      difficulty: Difficulty.MID,
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

    // TECHNICAL - SENIOR  
    {
      id: "sec-technical-senior-1",
      title: "Analyse de Malware et Reverse Engineering",
      description: "Techniques avancées d'analyse de code malveillant",
      type: QuizType.TECHNICAL,
      difficulty: Difficulty.SENIOR,
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
      id: "finance-qcm-mid-1",
      title: "Analyse des États Financiers",
      description: "Évaluation des compétences en analyse financière fondamentale",
      type: QuizType.QCM,
      difficulty: Difficulty.MID,
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
        }
      ]
    },

    // TECHNICAL - SENIOR
    {
      id: "finance-technical-senior-1",
      title: "Modélisation Financière Avancée",
      description: "Construction d'un modèle DCF complet",
      type: QuizType.TECHNICAL,
      difficulty: Difficulty.SENIOR,
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
        }
      ]
    }
  ],

  "Stratégie Business": [
    // MOCK_INTERVIEW - SENIOR
    {
      id: "business-mock-senior-1",
      title: "Stratégie de Croissance Internationale",
      description: "Élaboration d'un plan d'expansion mondiale",
      type: QuizType.MOCK_INTERVIEW,
      difficulty: Difficulty.SENIOR,
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
        }
      ]
    }
  ],

  "Ingénierie Logicielle": [
    // TECHNICAL - MID
    {
      id: "eng-technical-mid-1",
      title: "Conception de Systèmes Distribués",
      description: "Architecture de systèmes hautement disponibles",
      type: QuizType.TECHNICAL,
      difficulty: Difficulty.MID,
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
        }
      ]
    }
  ],

  "Design UX/UI": [
    // SOFT_SKILLS - MID
    {
      id: "design-soft-mid-1",
      title: "Recherche Utilisateur et Tests Utilisabilité",
      description: "Méthodologies de design centré utilisateur",
      type: QuizType.SOFT_SKILLS,
      difficulty: Difficulty.MID,
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
        }
      ]
    }
  ],

  "DevOps & Cloud": [
    // TECHNICAL - SENIOR
    {
      id: "devops-technical-senior-1",
      title: "Architecture Cloud Native",
      description: "Design de systèmes cloud résilients",
      type: QuizType.TECHNICAL,
      difficulty: Difficulty.SENIOR,
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
        }
      ]
    }
  ],

  "Marketing Digital": [
    // QCM - JUNIOR
    {
      id: "marketing-qcm-junior-1",
      title: "Fondamentaux du Marketing Digital",
      description: "Concepts de base en marketing en ligne",
      type: QuizType.QCM,
      difficulty: Difficulty.JUNIOR,
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
        }
      ]
    }
  ],

  "Product Management": [
    // MOCK_INTERVIEW - SENIOR
    {
      id: "product-mock-senior-1",
      title: "Stratégie Produit et Roadmap",
      description: "Développement de vision produit et priorisation",
      type: QuizType.MOCK_INTERVIEW,
      difficulty: Difficulty.SENIOR,
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
        }
      ]
    }
  ],

  "Architecture Cloud": [
    // TECHNICAL - SENIOR
    {
      id: "archi-technical-senior-1", 
      title: "Design Multi-Cloud",
      description: "Architecture cloud hybride et multi-fournisseur",
      type: QuizType.TECHNICAL,
      difficulty: Difficulty.SENIOR,
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
        }
      ]
    }
  ],

  "Développement Mobile": [
    // TECHNICAL - MID
    {
      id: "mobile-technical-mid-1",
      title: "Développement React Native Avancé",
      description: "Performance et optimisation mobile",
      type: QuizType.TECHNICAL,
      difficulty: Difficulty.MID,
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
/>`,
          points: 80,
          explanation: "Virtualisation pour éviter le rendu de tous les éléments simultanément"
        }
      ]
    }
  ],

  "Communication": [
    // SOFT_SKILLS - MID
    {
      id: "com-soft-mid-1",
      title: "Communication Interculturelle",
      description: "Communication efficace en environnement international",
      type: QuizType.SOFT_SKILLS,
      difficulty: Difficulty.MID,
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
        }
      ]
    }
  ],

  "Management": [
    // SOFT_SKILLS - SENIOR
    {
      id: "mgmt-soft-senior-1",
      title: "Leadership Transformationnel",
      description: "Gestion du changement et développement d'équipe",
      type: QuizType.SOFT_SKILLS,
      difficulty: Difficulty.SENIOR,
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
        }
      ]
    }
  ],

  "Formation": [
    // MOCK_INTERVIEW - MID
    {
      id: "edu-mock-mid-1",
      title: "Conception de Programme Pédagogique",
      description: "Développement de curriculum et méthodes d'enseignement",
      type: QuizType.MOCK_INTERVIEW,
      difficulty: Difficulty.MID,
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
        }
      ]
    }
  ],

  "Santé Digitale": [
    // TECHNICAL - SENIOR
    {
      id: "health-technical-senior-1",
      title: "Sécurité des Données Médicales",
      description: "Conformité HIPAA et protection des données patients",
      type: QuizType.TECHNICAL,
      difficulty: Difficulty.SENIOR,
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
  return Object.values(AUGMENTED_QUIZZES_BY_PROFESSION).flat();
}

// Exemple d'utilisation:
// const fullstackJuniorQCM = getQuizzesByCriteria("Développement Fullstack", Difficulty.JUNIOR, QuizType.QCM);
// const allDataScience = getQuizzesByCriteria("Data Science");