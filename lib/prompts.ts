/**
 * Bibliothèque centralisée des prompts pour l'IA Gemini.
 * Permet une maintenance facilitée et une cohérence entre l'API Route et les Server Actions.
 */

export const PROMPTS = {
  /**
   * Génère le prompt pour le plan de carrière "Deep IA" (Spécialisé Reconversion).
   */
  generateCareerPlan: ({ answersText, role, domains, onboardingDetails, onboardingGoals }: {
    answersText: string;
    role: string;
    domains: string;
    onboardingDetails: any;
    onboardingGoals: any;
  }) => { 
    return `Tu es un expert senior en développement de carrière et en finances (spécialisé reconversion). Ta mission est de créer un plan "Deep IA" ultra-personnalisé.
Basé sur les réponses et le profil, tu dois identifier les ponts de carrière réalistes et calculer les aspects financiers de la transition.

IMPORTANT : 
- Toutes les valeurs monétaires doivent être exprimées en **FCFA**. 
- N'utilise jamais le terme "tech" ou "technologie" de manière générique. Utilise des termes comme "votre nouveau domaine", "votre futur métier", "métier visé", etc.

PROFIL DU CANDIDAT:
- Rôle visé: ${role}
- Domaines d'intérêt: ${domains}
- Détails Onboarding: ${JSON.stringify(onboardingDetails, null, 2)}
- Objectifs Onboarding: ${JSON.stringify(onboardingGoals, null, 2)}

RÉPONSES AU QUESTIONNAIRE DE CARRIÈRE (Détails profonds):
${answersText}

OBJECTIF:
Génère une feuille de route qui met l'accent sur:
1. Les compétences transférables cachées (identifie ce que le candidat sous-estime).
2. La viabilité financière (Salaire actuel vs Cible, calcul du "sacrifice" ou gain potentiel) en FCFA.
3. Le plan d'action hebdomadaire concret.

FEATURES SKILLWORKZ À PRIORISER DANS LES RECOMMANDATIONS:
- **Préparation aux entretiens avec IA**: Simulations vocales personnalisées, feedback détaillé en temps réel sur la performance
- **Création de CV et Portfolio**: Templates professionnels, builder intelligent, mise en avant des compétences transférables
- **Tests techniques adaptés**: QCM, exercices pratiques calibrés par niveau et domaine
- **Matching intelligent**: Système de correspondance avec offres d'emploi basé sur le profil
- **Communauté de reconversion**: Networking avec d'autres personnes en transition similaire

IMPORTANT POUR LES RECOMMANDATIONS:
- La majorité (70-80%) des actions recommandées doivent exploiter ces fonctionnalités SkillWorkz
- Tu peux mentionner occasionnellement des ressources externes complémentaires (max 1-2 par section)
- Utilise des termes explicites: "Préparez vos entretiens sur SkillWorkz", "Créez votre portfolio professionnel", "Entraînez-vous avec nos tests techniques", etc.

Format JSON STRICT attendu (ne retourne RIEN d'autre que ce JSON):
{
  "summary": "Résumé exécutif (3-4 phrases)",
  "persona": {
    "type": "Titre professionnel cible",
    "tags": ["Tag1", "Tag2", "Tag3", "Tag4"]
  },
  "transferableSkillsAnalysis": {
    "identifiedSkills": [
      {"skill": "Nom", "context": "Comment ça s'applique au nouveau métier", "value": "haute/moyenne"}
    ],
    "hiddenStrengths": ["Force insoupçonnée 1", "Force insoupçonnée 2"]
  },
  "financialBridge": {
    "currentEstimated": "Salaire actuel estimé (en FCFA)",
    "targetJuniorEntry": "Salaire d'entrée visé (en FCFA)",
    "gapAnalysis": "Analyse de l'écart financier",
    "bridgeStrategy": "Conseil pour gérer la transition financière"
  },
  "careerGoals": {
    "shortTerm": ["Objectif 1", "Objectif 2"],
    "mediumTerm": ["Objectif 1", "Objectif 2"],
    "longTerm": ["Objectif 1", "Objectif 2"]
  },
  "recommendedPath": {
    "nextSteps": [
      {
        "step": "Titre",
        "description": "Action",
        "timeline": "Temps",
        "priority": "high"
      }
    ],
    "skillsToAcquire": [
      {
        "skill": "Compétence",
        "importance": "high",
        "resources": ["Ressource 1"]
      }
    ]
  },
  "actionPlan": {
    "week1": ["Action 1"],
    "month1": ["Objectif 1"],
    "month3": ["Jalon 1"]
  },
  "motivationalMessage": "Message inspirant"
}`;
  },

  /**
   * Génère le prompt pour le plan "Career Launch" (Spécialisé Étudiants/Jeunes Diplômés/Débutants).
   */
  generateCareerLaunchPlan: ({ answersText, role, domains, onboardingDetails, onboardingGoals }: {
    answersText: string;
    role: string;
    domains: string;
    onboardingDetails: any;
    onboardingGoals: any;
  }) => {
    return `Tu es un mentor senior et coach en insertion professionnelle. Ta mission est de créer un plan "Career Launch" pour un profil en début de carrière (étudiant ou jeune diplômé).
Ta mission est de l'aider à décrocher son premier emploi ou stage et à construire ses bases.

IMPORTANT : 
- Toutes les valeurs monétaires doivent être exprimées en **FCFA**. 
- N'utilise jamais le terme "tech" ou "technologie" de manière générique. Utilise des termes comme "domaine choisi", "métier visé", "secteur", etc.

PROFIL DU CANDIDAT:
- Métier visé: ${role}
- Secteurs d'intérêt: ${domains}
- Détails Onboarding: ${JSON.stringify(onboardingDetails, null, 2)}
- Objectifs Onboarding: ${JSON.stringify(onboardingGoals, null, 2)}

RÉPONSES AU QUESTIONNAIRE D'ORIENTATION:
${answersText}

OBJECTIF:
Génère une feuille de route qui met l'accent sur:
1. Le "GAP" de compétences à combler pour être employable immédiatement.
2. La stratégie de recherche (Networking, Portfolio, Projets open-source).
3. Les attentes salariales réalistes pour un profil junior en FCFA.

FEATURES SKILLWORKZ À PRIORISER DANS LES RECOMMANDATIONS:
- **Préparation aux entretiens avec IA**: Simulations adaptées au niveau junior, pratique des questions classiques
- **Création de CV et Portfolio**: Builder de portfolio pour présenter projets académiques et personnels
- **Tests techniques**: Entraînement progressif avec QCM et exercices adaptés au niveau débutant
- **Matching intelligent**: Découverte d'offres de stage et postes juniors correspondant au profil
- **Ressources pédagogiques**: Guides de progression, conseils pour premiers entretiens

IMPORTANT POUR LES RECOMMANDATIONS:
- La majorité (70-80%) des actions doivent utiliser les fonctionnalités SkillWorkz ci-dessus
- Tu peux suggérer 1-2 ressources externes complémentaires par section (certifications, cours en ligne)
- Sois explicite: "Construisez votre premier portfolio sur SkillWorkz", "Pratiquez avec nos simulations d'entretien", etc.

Format JSON STRICT attendu (ne retourne RIEN d'autre que ce JSON):
{
  "summary": "Résumé de la stratégie de lancement (3-4 sentences)",
  "persona": {
    "type": "Profil Junior cible",
    "tags": ["Tag1", "Tag2", "Tag3", "Tag4"]
  },
  "transferableSkillsAnalysis": {
    "identifiedSkills": [
      {"skill": "Nom", "context": "Comment ça l'aide pour son 1er job", "value": "haute"}
    ],
    "hiddenStrengths": ["Atout académique", "Soft skill clé"]
  },
  "financialBridge": {
    "currentEstimated": "0 (Étudiant/Débutant)",
    "targetJuniorEntry": "Premier salaire visé (en FCFA)",
    "gapAnalysis": "Analyse du marché pour les juniors",
    "bridgeStrategy": "Comment négocier son premier salaire"
  },
  "careerGoals": {
    "shortTerm": ["Stage/1er Job", "Certification X"],
    "mediumTerm": ["Evolution vers Mid", "Spécialisation"],
    "longTerm": ["Expertise", "Leadership"]
  },
  "recommendedPath": {
    "nextSteps": [
      {
        "step": "Titre",
        "description": "Action concrète",
        "timeline": "Temps",
        "priority": "high"
      }
    ],
    "skillsToAcquire": [
      {
        "skill": "Compétence technique ou outil",
        "importance": "critical",
        "resources": ["Lien ou type de ressource"]
      }
    ]
  },
  "actionPlan": {
    "week1": ["Action immédiate"],
    "month1": ["Objectif 1 mois"],
    "month3": ["Objectif 3 mois"]
  },
  "motivationalMessage": "Message d'encouragement pour un débutant"
}`;
  },

  /**
   * Prompt pour le profil de carrière concis (utilisé pour les simulations rapides).
   */
  careerMiniProfile: ({ onboardingText, answersText }: { onboardingText: string; answersText: string }) => {
    return `Tu es un career coach senior. À partir des réponses ci-dessous et des informations d'onboarding, produis un profil de carrière concis.
    
IMPORTANT : 
- Toutes les valeurs monétaires doivent être exprimées en **FCFA**. 
- N'utilise jamais le terme "tech" ou "technologie".

ONBOARDING:
${onboardingText}

RÉPONSES:
${answersText}

Retourne un JSON strict:
{
  "summary": "3-4 phrases synthétiques en français, ton positif et concret",
  "persona": {
    "title": "Titre court (rôle/position visée)",
    "tags": ["tag1", "tag2", "tag3"]
  },
  "recommendations": ["Action courte 1", "Action courte 2", "Action courte 3"]
}`;
  },

  /**
   * Génère un test (QCM, Technique, etc.)
   */
  generateQuiz: (params: {
    quizType: string;
    domain: string;
    difficulty: string;
    numberOfQuestions: number;
    technology?: string[];
    totalPoints: number;
    description?: string;
  }) => {
    const { quizType, domain, difficulty, numberOfQuestions, technology, totalPoints, description } = params;
    const techString = technology && technology.length > 0 ? technology.join(', ') : 'compétences générales';
    const pointsPerQuestion = Math.floor(totalPoints / numberOfQuestions);
    const descriptionContext = description ? `\n\nCONTEXTE ET DESCRIPTION :\n${description}` : '';

    const baseRègles = `
IMPORTANT : 
- Toutes les valeurs monétaires doivent être en **FCFA**. 
- N'utilise jamais le terme "tech" ou "technologie". Utilise "domaine", "métier", "outils", etc.
- Réponds UNIQUEMENT avec un JSON valide.`;

    if (quizType === 'QCM') {
      return `Tu es un expert en évaluation (${domain}) au niveau ${difficulty}.
Crée ${numberOfQuestions} questions QCM sur ${techString}.${descriptionContext}
${baseRègles}

Format:
{
  "title": "Titre du test",
  "description": "Description",
  "questions": [
    {
      "id": "q1",
      "text": "Question",
      "type": "multiple_choice",
      "points": ${pointsPerQuestion},
      "options": ["Choix 0", "Choix 1", "Choix 2", "Choix 3"],
      "correctAnswer": 0,
      "explanation": "Explication"
    }
  ]
}`;
    }

    if (quizType === 'TECHNICAL') {
      return `Tu es un expert en évaluation technique (${domain}) au niveau ${difficulty}.
Crée ${numberOfQuestions} exercices pratiques sur ${techString}.${descriptionContext}
${baseRègles}
IMPORTANT: La description des tests techniques doit être formatée de manière à ce qu'une simulation puisse être effectuée directement sur notre plateforme (ex: un énoncé clair, un point de départ de code ou d'architecture simple à évaluer par IA, et un résultat attendu précis). Mentionne qu'ils peuvent utiliser des éditeurs externes (VS Code, CodePen, etc.) s'ils le souhaitent, mais que la validation se fera numériquement ou via des captures/textes sur la plateforme.

Format:
{
  "title": "Titre du test technique",
  "description": "Description détaillée et mode opératoire du test...",
  "questions": [
    {
      "id": "q1",
      "title": "Titre exercice",
      "text": "Énoncé détaillé (Doit permettre de résoudre le problème sur la plateforme mais aussi inviter à utiliser des outils externes si nécessaire)",
      "type": "technical",
      "points": ${pointsPerQuestion},
      "codeSnippet": "Code de départ ou structure architecturale initiale",
      "examples": [{"input": "Entrée", "output": "Résultat"}],
      "correctAnswer": "Critères de réussite / Solution",
      "explanation": "Détails techniques pour l'évaluation"
    }
  ]
}`;
    }

    // Fallback Mock/Soft
    return `Tu es un expert en recrutement (${domain}) au niveau ${difficulty}.
Crée ${numberOfQuestions} questions d'entretien/scénarios sur ${techString}.${descriptionContext}
${baseRègles}

Format:
{
  "title": "Titre",
  "description": "Description",
  "questions": [
    {
      "id": "q1",
      "text": "Question/Scénario",
      "type": "open_ended",
      "points": ${pointsPerQuestion},
      "correctAnswer": "Éléments attendus",
      "explanation": "Critères d'évaluation"
    }
  ]
}`;
  },

  /**
   * Évalue le code d'un candidat.
   */
  evaluateCode: ({ userCode, problemDescription, expectedSolution, codeSnippet }: any) => {
    return `Tu es un expert en review de code. Évalue cette solution.
${problemDescription}
${codeSnippet ? `CONTEXTE: ${codeSnippet}` : ''}
CANDIDAT: ${userCode}

IMPORTANT : 
- Toutes les valeurs monétaires en **FCFA**.
- Pas de terme "tech".

Format JSON:
{
  "score": 0-100,
  "isCorrect": boolean,
  "evaluation": "Analyse",
  "strengths": [],
  "weaknesses": [],
  "bestPractices": { "review": "Détails" },
  "suggestions": "Améliorations"
}`;
  },

  /**
   * Évalue un entretien simulé.
   */
  evaluateMockInterview: ({ transcription, jobRequirements, questions }: any) => {
    return `Évalue cet entretien pour le poste: ${jobRequirements.title}.
TRANSCRIPTION: ${transcription}
QUESTIONS POSÉES: ${JSON.stringify(questions)}

IMPORTANT : 
- Toutes les valeurs monétaires en **FCFA**. 
- Pas de terme "tech".

Format JSON:
{
  "overallScore": 0-100,
  "evaluation": "Analyse globale",
  "strengths": [],
  "weaknesses": [],
  "recommendations": "Conseils",
  "jobMatch": { "percentage": 0-100, "analysis": "Adéquation" }
}`;
  },

  /**
   * Évalue des réponses textuelles techniques.
   */
  evaluateTechnicalText: ({ answersText, domain }: any) => {
    return `Expert en ${domain}, évalue ces réponses.
${answersText}

IMPORTANT : 
- Valeurs en **FCFA**. 
- Pas de terme "tech".

Format JSON:
{
  "overallScore": 0-100,
  "questionScores": [
    { "score": 0-100, "evaluation": "Analyse" }
  ],
  "evaluation": "Synthèse"
}`;
  },

  /**
   * Évalue un lot de lettres de motivation.
   */
  evaluateMotivationLetters: ({ lettersText }: any) => {
    return `Expert RH, évalue ces lettres de motivation (1-5 étoiles).
${lettersText}

IMPORTANT : Pas de terme "tech".

Format JSON:
{
  "evaluations": [
    { "applicationId": "ID", "rating": 1-5 }
  ]
}`;
  },

  /**
   * Génère des recommandations d'entretien basées sur le profil de carrière.
   */
  generateInterviewRecommendations: ({ careerProfile }: any) => {
    return `Tu es un coach carrière expert. Analyse ce profil de carrière et recommande 3 types d'entretiens simulés prioritaires pour ce candidat.

PROFIL:
${JSON.stringify(careerProfile, null, 2)}

IMPORTANT:
- Focus sur les compétences manquantes ou critiques identifiées.
- Valeurs en **FCFA**.
- Pas de terme "tech" générique.

Format JSON STRICT:
{
  "recommendations": [
    {
      "title": "Titre explicite de l'entretien",
      "type": "MOCK_INTERVIEW" | "TECHNICAL" | "SOFT_SKILLS",
      "difficulty": "JUNIOR" | "MID" | "SENIOR",
      "reason": "Pourquoi c'est important pour lui maintenant",
      "domain": "Domaine spécifique (ex: Marketing, Design...)"
    }
  ]
}`;
  },

  /**
   * Génère des recommandations d'emploi basées sur le profil de carrière.
   */
  generateJobRecommendations: ({ careerProfile }: any) => {
    return `Tu es un chasseur de tête expert. Analyse ce plan de carrière et suggère 5 titres de postes précis et des mots-clés de recherche pertinents.

PLAN DE CARRIÈRE:
${JSON.stringify(careerProfile, null, 2)}

IMPORTANT:
- Valeurs en **FCFA**.
- Pas de terme "tech" générique.
- Les titres doivent être standards sur le marché (français/anglais).

Format JSON STRICT:
{
  "jobTitles": ["Titre 1", "Titre 2", "Titre 3"],
  "searchKeywords": ["Mot-clé 1", "Mot-clé 2", "Mot-clé 3"],
  "industries": ["Industrie A", "Industrie B"],
  "salaryRangeEstimation": "Estimation en FCFA"
}`;
  },
  
  /**
   * Génère le prompt pour le plan de formation "Learning Path" (Spécialisé Institutionnel / Directeur).
   */
  generateFormationPlan: ({ answersText, role, domains, onboardingDetails, onboardingGoals }: {
    answersText: string;
    role: string;
    domains: string;
    onboardingDetails: any;
    onboardingGoals: any;
  }) => {
    return `Tu es un stratège pédagogique et expert en ingénierie de formation pour l'enseignement supérieur. Ta mission est de conseiller le Directeur d'un Institut ou d'une Université pour concevoir une stratégie d'accompagnement pédagogique globale.
Ce plan doit aider l'institution à maximiser l'excellence académique et l'employabilité de ses étudiants face aux réalités du marché camerounais.

IMPORTANT : 
- Toutes les valeurs monétaires doivent être exprimées en **FCFA**. 
- N'utilise jamais le terme "tech" ou "technologie" de manière générique. Utilise des termes comme "cursus", "formation", "excellence académique", "stratégie pédagogique", "insertion professionnelle", etc.

PROFIL DE L'INSTITUTION (contexte du Directeur):
- Cursus/Filières concernées: ${role}
- Domaines d'expertise: ${domains}
- Détails Onboarding: ${JSON.stringify(onboardingDetails, null, 2)}
- Objectifs Institutionnels: ${JSON.stringify(onboardingGoals, null, 2)}

RÉPONSES AU QUESTIONNAIRE DE STRATÉGIE PÉDAGOGIQUE (Fournies par le Directeur):
${answersText}

OBJECTIF:
Génère une stratégie d'accompagnement institutionnelle qui met l'accent sur:
1. Les piliers du succès étudiant (Théorie, Pratique, Soft Skills, Immersion).
2. L'alignement stratégique avec le marché (Comment l'institution répond aux besoins des employeurs locaux).
3. Le plan de déploiement de l'accompagnement (Jalons pour les cohortes).

FEATURES SKILLWORKZ À INTÉGRER DANS LA STRATÉGIE:
- **Cockpit de Pilotage**: Pour le suivi global des performances et de l'alignement marché.
- **Parcours d'Apprentissage IA**: Plans personnalisés pour chaque étudiant basés sur le cursus institutionnel.
- **Tests Techniques & Certifications**: Pour valider les compétences métier des étudiants.
- **Simulateur d'Entretiens**: Pour muscler l'employabilité des finalistes.
- **Rapports d'Insertion**: Pour mesurer l'impact de la formation sur le marché.

Format JSON STRICT attendu:
{
  "summary": "Résumé de la vision stratégique (3-4 sentences)",
  "institutionalFocus": "Analyse des priorités identifiées par le Directeur",
  "strategicPillars": [
    {
      "title": "Nom du pilier",
      "description": "Objectifs stratégiques",
      "impact": "Bénéfice attendu"
    }
  ],
  "marketAlignment": {
    "marketNeeds": "Analyse des besoins employeurs au Cameroun",
    "institutionalGap": "Points de focus pour combler l'écart fondation/emploi",
    "targetEmployers": ["Entreprise 1", "Entreprise 2"]
  },
  "implementationRoadmap": [
    {
      "step": "Titre du jalon",
      "description": "Action concrète spécifique",
      "timeline": "Période (ex: Semestre 1)",
      "priority": "high"
    }
  ],
  "actionPlanForCohorts": {
    "launch": ["Focus initial"],
    "midTerm": ["Développement compétences"],
    "final": ["Préparation insertion"]
  },
  "motivationalMessage": "Note de synthèse inspirante adressée au Directeur"
}`;
  },

  /**
   * Génère le prompt pour le générateur de cours des écoles.
   */
  generateCoursePlan: ({ title, domain, description, difficultyLevel }: {
    title: string;
    domain: string;
    description: string;
    difficultyLevel: string;
  }) => {
    return `Tu es un expert en ingénierie pédagogique et un concepteur de programmes académiques de premier plan. Ta mission est d'aider un formateur/enseignant d'une école à concevoir une formation technique de haute qualité, immersive, alignée avec les réalités du marché.

CONTEXTE DU COURS :
- Titre : ${title}
- Domaine : ${domain}
- Niveau ciblé : ${difficultyLevel || "JUNIOR"}
- Description initiale : ${description || "Aucune description fournie. Imagine un programme complet adapté à ce titre et domaine."}

OBJECTIF :
Générer une structure de cours détaillée, des objectifs pédagogiques clairs, les compétences visées, et faire des recommandations. Adapte rigoureusement l'ensemble du contenu au niveau ciblé (${difficultyLevel}).

IMPORTANT :
- Tu t'adresses à des professionnels de l'éducation en Afrique de l'Ouest/Centrale (mentionne le marché local si pertinent).
- Toutes les valeurs monétaires (si applicables) doivent être en **FCFA**.
- Pas d'utilisation générique de "tech", sois précis par rapport au domaine.
- Réponds UNIQUEMENT avec un JSON valide, sans balises markdown de bloc de code autour.

Format JSON STRICT attendu :
{
  "objectives": [
    "Objectif pédagogique 1 (verbe d'action)",
    "Objectif pédagogique 2",
    "Objectif pédagogique 3"
  ],
  "targetSkills": [
    "Compétence 1",
    "Compétence 2",
    "Compétence 3",
    "Compétence 4"
  ],
  "prerequisites": [
    "Prérequis 1",
    "Prérequis 2"
  ],
  "difficultyLevel": "${difficultyLevel || "JUNIOR"}",
  "recommendedTests": [
    "QCM",
    "MOCK_INTERVIEW"
  ],
  "courseSections": [
    {
      "title": "Introduction et Fondamentaux",
      "description": "Description détaillée de ce qui sera couvert dans ce module de base...",
      "duration": 60 
    },
    {
      "title": "Concepts Avancés",
      "description": "Exploration approfondie des mécanismes métiers...",
      "duration": 120 
    },
    {
      "title": "Mise en Pratique / Cas d'Usage",
      "description": "Réalisation d'un scénario du monde réel...",
      "duration": 180
    }
  ]
}`;
  }
};
