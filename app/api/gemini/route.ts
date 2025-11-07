// app/api/gemini/route.ts
// Ce code s'exécute uniquement sur le serveur.
import { GoogleGenAI } from "@google/genai";
import { NextResponse, type NextRequest } from 'next/server';

interface GenerateInterviewRequest {
  type: 'generate-interview' | 'simple-prompt' | 'evaluate-code' | 'evaluate-mock-interview' | 'evaluate-technical-text';
  quizType?: 'QCM' | 'TECHNICAL' | 'MOCK_INTERVIEW' | 'SOFT_SKILLS';
  domain?: string; // Domaine du test (utilisé pour generate-interview et evaluate-technical-text)
  difficulty?: 'JUNIOR' | 'MID' | 'SENIOR';
  numberOfQuestions?: number;
  technology?: string[];
  totalPoints?: number;
  description?: string; // Description du problème/test pour l'élaboration
  prompt?: string; // Pour les requêtes simples
  // Pour l'évaluation de code
  userCode?: string;
  expectedSolution?: string;
  problemDescription?: string;
  codeSnippet?: string;
  // Pour l'évaluation MOCK_INTERVIEW
  transcription?: any; // Transcription de l'entretien vocal
  jobRequirements?: {
    title?: string;
    description?: string;
    skills?: string[];
    experienceLevel?: string;
    domain?: string; // Domaine du poste
  };
  questions?: any[]; // Questions posées lors de l'entretien
  // Pour l'évaluation TECHNICAL text
  textAnswers?: Array<{
    questionId: string | number;
    questionText: string;
    answer: string;
    points?: number;
  }>;
}

// Fonction pour générer un prompt de test technique selon le domaine
function getTechnicalTestPromptByDomain(
  domain: string,
  difficulty: string,
  techString: string,
  numberOfQuestions: number,
  pointsPerQuestion: number,
  totalPoints: number,
  descriptionContext: string
): string {
  const baseFormat = {
    title: "Titre du test technique (max 60 caractères)",
    description: "Description du test technique (2-3 phrases)",
    questions: [{
      id: "q1",
      text: "Énoncé du problème/exercice/projet",
      type: "technical",
      points: pointsPerQuestion,
      title: "Titre de la question (optionnel)",
      codeSnippet: "Code/contexte de départ (si applicable)",
      examples: [{ input: "Exemple input", output: "Exemple output" }],
      correctAnswer: "Solution attendue ou critères d'évaluation",
      explanation: "Explication de la solution ou critères de réussite"
    }]
  };

  const domainPrompts: Record<string, string> = {
    'DEVELOPMENT': `Tu es un expert en création de tests techniques de programmation pour le développement logiciel au niveau ${difficulty}.
Crée exactement ${numberOfQuestions} problèmes de programmation/exercices pratiques sur ${techString}.
Chaque exercice doit valoir ${pointsPerQuestion} points.${descriptionContext}
Les exercices peuvent inclure : algorithmes, structures de données, design patterns, architecture, debugging, optimisation.`,
    
    'MACHINE_LEARNING': `Tu es un expert en création de tests techniques pour le Machine Learning au niveau ${difficulty}.
Crée exactement ${numberOfQuestions} exercices pratiques/projets ML sur ${techString}.
Chaque exercice doit valoir ${pointsPerQuestion} points.${descriptionContext}
Les exercices peuvent inclure : preprocessing de données, modélisation, évaluation de modèles, feature engineering, optimisation d'hyperparamètres, visualisation de résultats.`,
    
    'DATA_SCIENCE': `Tu es un expert en création de tests techniques pour la Data Science au niveau ${difficulty}.
Crée exactement ${numberOfQuestions} exercices pratiques/analyses de données sur ${techString}.
Chaque exercice doit valoir ${pointsPerQuestion} points.${descriptionContext}
Les exercices peuvent inclure : analyse exploratoire, visualisation, statistiques, nettoyage de données, modélisation prédictive, interprétation de résultats.`,
    
    'FINANCE': `Tu es un expert en création de tests techniques pour la finance au niveau ${difficulty}.
Crée exactement ${numberOfQuestions} exercices pratiques/cas d'étude financiers sur ${techString}.
Chaque exercice doit valoir ${pointsPerQuestion} points.${descriptionContext}
Les exercices peuvent inclure : calculs financiers, modélisation financière, analyse de risques, valorisation, reporting financier, tableaux de bord.`,
    
    'BUSINESS': `Tu es un expert en création de tests techniques pour le business au niveau ${difficulty}.
Crée exactement ${numberOfQuestions} exercices pratiques/cas d'étude business sur ${techString}.
Chaque exercice doit valoir ${pointsPerQuestion} points.${descriptionContext}
Les exercices peuvent inclure : analyse de marché, stratégie business, modélisation de processus, KPIs, tableaux de bord, analyses de performance.`,
    
    'ENGINEERING': `Tu es un expert en création de tests techniques pour l'ingénierie au niveau ${difficulty}.
Crée exactement ${numberOfQuestions} exercices pratiques/projets d'ingénierie sur ${techString}.
Chaque exercice doit valoir ${pointsPerQuestion} points.${descriptionContext}
Les exercices peuvent inclure : calculs techniques, conception, simulations, analyses de systèmes, optimisation, documentation technique.`,
    
    'DESIGN': `Tu es un expert en création de tests techniques pour le design au niveau ${difficulty}.
Crée exactement ${numberOfQuestions} exercices pratiques/projets de design sur ${techString}.
Chaque exercice doit valoir ${pointsPerQuestion} points.${descriptionContext}
Les exercices peuvent inclure : création de maquettes, prototypage, design system, UX/UI, wireframing, design thinking, présentation de concepts.`,
    
    'DEVOPS': `Tu es un expert en création de tests techniques pour le DevOps au niveau ${difficulty}.
Crée exactement ${numberOfQuestions} exercices pratiques/configurations DevOps sur ${techString}.
Chaque exercice doit valoir ${pointsPerQuestion} points.${descriptionContext}
Les exercices peuvent inclure : configuration CI/CD, infrastructure as code, containerisation, monitoring, automation, scripts de déploiement.`,
    
    'CYBERSECURITY': `Tu es un expert en création de tests techniques pour la cybersécurité au niveau ${difficulty}.
Crée exactement ${numberOfQuestions} exercices pratiques/cas de sécurité sur ${techString}.
Chaque exercice doit valoir ${pointsPerQuestion} points.${descriptionContext}
Les exercices peuvent inclure : analyse de vulnérabilités, configuration sécurisée, audit de sécurité, scripts de sécurité, documentation de procédures.`,
    
    'MARKETING': `Tu es un expert en création de tests techniques pour le marketing au niveau ${difficulty}.
Crée exactement ${numberOfQuestions} exercices pratiques/campagnes marketing sur ${techString}.
Chaque exercice doit valoir ${pointsPerQuestion} points.${descriptionContext}
Les exercices peuvent inclure : stratégie de campagne, analyse de données marketing, création de contenu, SEO, analytics, tableaux de bord marketing.`,
    
    'PRODUCT': `Tu es un expert en création de tests techniques pour le product management au niveau ${difficulty}.
Crée exactement ${numberOfQuestions} exercices pratiques/cas produit sur ${techString}.
Chaque exercice doit valoir ${pointsPerQuestion} points.${descriptionContext}
Les exercices peuvent inclure : roadmap produit, user stories, prioritisation, métriques produit, analyses de marché, documentation produit.`,
    
    'ARCHITECTURE': `Tu es un expert en création de tests techniques pour l'architecture au niveau ${difficulty}.
Crée exactement ${numberOfQuestions} exercices pratiques/projets d'architecture sur ${techString}.
Chaque exercice doit valoir ${pointsPerQuestion} points.${descriptionContext}
Les exercices peuvent inclure : conception architecturale, diagrammes, modélisation, documentation technique, choix technologiques, schémas de système.`,
    
    'MOBILE': `Tu es un expert en création de tests techniques pour le développement mobile au niveau ${difficulty}.
Crée exactement ${numberOfQuestions} exercices pratiques/applications mobiles sur ${techString}.
Chaque exercice doit valoir ${pointsPerQuestion} points.${descriptionContext}
Les exercices peuvent inclure : développement d'écrans, intégration d'APIs, gestion d'état, performance mobile, UX mobile, tests d'applications.`,
    
    'WEB': `Tu es un expert en création de tests techniques pour le développement web au niveau ${difficulty}.
Crée exactement ${numberOfQuestions} exercices pratiques/applications web sur ${techString}.
Chaque exercice doit valoir ${pointsPerQuestion} points.${descriptionContext}
Les exercices peuvent inclure : développement frontend/backend, intégration d'APIs, responsive design, performance web, SEO, accessibilité.`,
    
    'COMMUNICATION': `Tu es un expert en création de tests techniques pour la communication au niveau ${difficulty}.
Crée exactement ${numberOfQuestions} exercices pratiques/cas de communication sur ${techString}.
Chaque exercice doit valoir ${pointsPerQuestion} points.${descriptionContext}
Les exercices peuvent inclure : stratégie de communication, création de contenu, planification média, analyse d'audience, campagnes de communication.`,
    
    'MANAGEMENT': `Tu es un expert en création de tests techniques pour le management au niveau ${difficulty}.
Crée exactement ${numberOfQuestions} exercices pratiques/cas de management sur ${techString}.
Chaque exercice doit valoir ${pointsPerQuestion} points.${descriptionContext}
Les exercices peuvent inclure : planification stratégique, gestion d'équipe, analyse de performance, tableaux de bord management, processus décisionnels.`,
    
    'EDUCATION': `Tu es un expert en création de tests techniques pour l'éducation au niveau ${difficulty}.
Crée exactement ${numberOfQuestions} exercices pratiques/contenus pédagogiques sur ${techString}.
Chaque exercice doit valoir ${pointsPerQuestion} points.${descriptionContext}
Les exercices peuvent inclure : création de contenu éducatif, scénarios pédagogiques, évaluations, supports de cours, activités d'apprentissage.`,
    
    'HEALTH': `Tu es un expert en création de tests techniques pour la santé au niveau ${difficulty}.
Crée exactement ${numberOfQuestions} exercices pratiques/cas médicaux sur ${techString}.
Chaque exercice doit valoir ${pointsPerQuestion} points.${descriptionContext}
Les exercices peuvent inclure : analyse de données médicales, documentation clinique, systèmes d'information santé, protocoles, rapports médicaux.`
  };

  const domainPrompt = domainPrompts[domain] || domainPrompts['DEVELOPMENT'];
  
  return `${domainPrompt}

Format JSON strict à respecter (IMPORTANT : retourne UNIQUEMENT du JSON valide, sans texte supplémentaire) :
{
  "title": "Titre du test technique (max 60 caractères)",
  "description": "Description du test technique (2-3 phrases)",
  "questions": [
    {
      "id": "q1",
      "title": "Titre de l'exercice/projet (optionnel)",
      "text": "Énoncé détaillé du problème/exercice/projet à réaliser",
      "type": "technical",
      "points": ${pointsPerQuestion},
      "codeSnippet": "Code/contexte de départ ou template (si applicable, sinon chaîne vide)",
      "examples": [{"input": "Exemple d'input ou contexte", "output": "Exemple d'output ou résultat attendu"}],
      "correctAnswer": "Solution attendue, critères d'évaluation ou description du livrable",
      "explanation": "Explication de la solution ou critères de réussite détaillés"
    }
  ]
}

Règles :
- Exercices adaptés au niveau ${difficulty} et au domaine ${domain}
- Chaque question doit être un exercice concret et réalisable
- Inclure des exemples concrets quand c'est pertinent
- Solutions/critères clairs et évaluables
- Total des points = ${totalPoints}
- Les exercices peuvent être des mini-projets, des séries d'exercices, ou des cas pratiques`;
}

// Fonction pour générer un prompt spécialisé selon le type de quiz
function generateQuizPrompt(params: {
  quizType: string;
  domain: string;
  difficulty: string;
  numberOfQuestions: number;
  technology?: string[];
  totalPoints: number;
  description?: string;
}): string {
  const { quizType, domain, difficulty, numberOfQuestions, technology, totalPoints, description } = params;
  const techString = technology && technology.length > 0 ? technology.join(', ') : 'technologies générales';
  const pointsPerQuestion = Math.floor(totalPoints / numberOfQuestions);
  const descriptionContext = description ? `\n\nCONTEXTE ET DESCRIPTION DU TEST:\n${description}\n\nUtilise cette description pour guider la création des questions et les adapter au contexte spécifique.` : '';
  
  switch (quizType) {
    case 'QCM':
      return `Tu es un expert en création de tests QCM (Questions à Choix Multiples) pour le domaine ${domain} au niveau ${difficulty}.
      
Crée exactement ${numberOfQuestions} questions QCM de qualité professionnelle sur ${techString}.
Chaque question doit valoir ${pointsPerQuestion} points.${descriptionContext}

Format JSON strict à respecter (IMPORTANT : retourne UNIQUEMENT du JSON valide, sans texte supplémentaire) :
{
  "title": "Titre du test (max 60 caractères)",
  "description": "Description brève du test (2-3 phrases)",
  "questions": [
    {
      "id": "q1",
      "text": "Question claire et précise",
      "type": "multiple_choice",
      "points": ${pointsPerQuestion},
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctAnswer": 0,
      "explanation": "Explication de la bonne réponse"
    }
  ]
}

Règles :
- Questions adaptées au niveau ${difficulty}
- 4 options par question minimum
- correctAnswer = index de la bonne réponse (0, 1, 2, ou 3)
- Questions progressives en difficulté
- Couvrir différents aspects de ${techString}
- Total des points = ${totalPoints}`;

    case 'TECHNICAL':
      // Adapter le prompt selon le domaine
      const domainSpecificPrompt = getTechnicalTestPromptByDomain(domain, difficulty, techString, numberOfQuestions, pointsPerQuestion, totalPoints, descriptionContext);
      return domainSpecificPrompt;

    case 'MOCK_INTERVIEW':
      return `Tu es un expert en création de simulations d'entretiens techniques pour le domaine ${domain} au niveau ${difficulty}.

Crée exactement ${numberOfQuestions} questions d'entretien de type technique/comportemental sur ${techString}.
Chaque question doit valoir ${pointsPerQuestion} points.${descriptionContext}

Format JSON strict à respecter (IMPORTANT : retourne UNIQUEMENT du JSON valide, sans texte supplémentaire) :
{
  "title": "Titre de la simulation d'entretien (max 60 caractères)",
  "description": "Description de la simulation (2-3 phrases)",
  "questions": [
    {
      "id": "q1",
      "text": "Question/scénario d'entretien",
      "type": "open_ended",
      "points": ${pointsPerQuestion},
      "correctAnswer": "Réponse attendue ou éléments clés à évaluer",
      "explanation": "Points à évaluer et critères de réussite"
    }
  ]
}

Règles :
- Questions adaptées au niveau ${difficulty}
- Scénarios réalistes d'entretien
- Évaluer compétences techniques ET soft skills
- Format STAR (Situation, Tâche, Action, Résultat) pour les réponses
- Total des points = ${totalPoints}`;

    case 'SOFT_SKILLS':
      return `Tu es un expert en création de tests de compétences comportementales (soft skills) pour le domaine ${domain}.

Crée exactement ${numberOfQuestions} questions/scénarios évaluant les soft skills.
Chaque question doit valoir ${pointsPerQuestion} points.${descriptionContext}

Format JSON strict à respecter (IMPORTANT : retourne UNIQUEMENT du JSON valide, sans texte supplémentaire) :
{
  "title": "Titre du test de soft skills (max 60 caractères)",
  "description": "Description du test (2-3 phrases)",
  "questions": [
    {
      "id": "q1",
      "text": "Scénario ou question comportementale",
      "type": "open_ended",
      "points": ${pointsPerQuestion},
      "correctAnswer": "Éléments clés à évaluer dans la réponse",
      "explanation": "Critères d'évaluation et bonnes pratiques"
    }
  ]
}

Règles :
- Scénarios réalistes du monde professionnel
- Évaluer : communication, leadership, gestion du stress, collaboration, résolution de problèmes
- Format STAR pour les réponses
- Adapté au domaine ${domain}
- Total des points = ${totalPoints}`;

    default:
      throw new Error(`Type de quiz non supporté: ${quizType}`);
  }
}

export async function POST(request: NextRequest) {
  try {
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      console.error("GEMINI_API_KEY is not set in environment variables.");
      return NextResponse.json(
        { error: "Gemini API Key is not configured on the server." },
        { status: 500 }
      );
    }

    const ai = new GoogleGenAI({ apiKey });
    const body: GenerateInterviewRequest = await request.json();

    // Vérifier le type de requête
    if (body.type === 'generate-interview') {
      // Génération automatique d'interview
      if (!body.quizType || !body.domain || !body.difficulty || !body.numberOfQuestions || !body.totalPoints) {
        return NextResponse.json(
          { error: "Missing required parameters for interview generation: quizType, domain, difficulty, numberOfQuestions, totalPoints" },
          { status: 400 }
        );
      }

      const prompt = generateQuizPrompt({
        quizType: body.quizType,
        domain: body.domain,
        difficulty: body.difficulty,
        numberOfQuestions: body.numberOfQuestions,
        technology: body.technology,
        totalPoints: body.totalPoints,
        description: body.description
      });

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt
      });

      const generatedText = response.text;

      if (!generatedText) {
        throw new Error("No text was generated");
      }

      // Parser le JSON depuis la réponse
      try {
        // Nettoyer le texte pour extraire uniquement le JSON
        let jsonText = generatedText.trim();
        
        // Si le JSON est entouré de markdown, l'extraire
        const jsonMatch = jsonText.match(/```json\s*([\s\S]*?)\s*```/) || jsonText.match(/```\s*([\s\S]*?)\s*```/);
        if (jsonMatch) {
          jsonText = jsonMatch[1].trim();
        }

        const parsedData = JSON.parse(jsonText);

        // Valider et formater la réponse
        if (!parsedData.title || !parsedData.questions || !Array.isArray(parsedData.questions)) {
          throw new Error("Invalid response format from AI");
        }

        // S'assurer que toutes les questions ont un ID et sont bien formatées
        const formattedQuestions = parsedData.questions.map((q: any, index: number) => ({
          id: q.id || `q${index + 1}`,
          text: q.text || q.question,
          type: q.type,
          points: q.points || Math.floor(body.totalPoints! / body.numberOfQuestions!),
          options: q.options || [],
          correctAnswer: q.correctAnswer !== undefined ? q.correctAnswer : '',
          explanation: q.explanation || '',
          codeSnippet: q.codeSnippet || ''
        }));

        return NextResponse.json({
          success: true,
          data: {
            title: parsedData.title,
            description: parsedData.description || '',
            questions: formattedQuestions,
            suggestedDifficulty: body.difficulty,
            suggestedDomain: body.domain
          }
        });

      } catch (parseError: any) {
        console.error("Error parsing AI response:", parseError);
        console.error("Generated text:", generatedText);
        
        return NextResponse.json(
          { 
            error: "Failed to parse AI response as JSON",
            rawResponse: generatedText.substring(0, 500) // Première partie pour debug
          },
          { status: 500 }
        );
      }

    } else if (body.type === 'evaluate-code') {
      // Évaluation sémantique de code avec review IA pour best practices
      if (!body.userCode || !body.problemDescription) {
        return NextResponse.json(
          { error: "userCode and problemDescription are required for code evaluation." },
          { status: 400 }
        );
      }

      const evaluationPrompt = `Tu es un expert en évaluation de code et en review de code. Tu vas évaluer le code suivant de manière sémantique, rigoureuse et pédagogique.

PROBLÈME À RÉSOUDRE:
${body.problemDescription}

${body.codeSnippet ? `CONTEXTE/CODE DE DÉPART FOURNI:\n${body.codeSnippet}\n\n` : ''}
SOLUTION ATTENDUE (référence):
${body.expectedSolution || "Solution de référence non fournie - évalue uniquement la qualité, la logique et si le problème est résolu"}

CODE SOUMIS PAR LE CANDIDAT:
${body.userCode}

ÉVALUATION REQUISE (IMPORTANT - Évalue même si le code n'est pas parfait) :
1. **Résolution du problème** : Vérifie si le code résout le problème demandé (même si la syntaxe ou l'approche diffère de la solution attendue)
2. **Qualité du code** : Évalue la lisibilité, la maintenabilité, la structure
3. **Best Practices** : Vérifie les bonnes pratiques de programmation (nommage, DRY, SOLID, gestion d'erreurs, etc.)
4. **Logique algorithmique** : Évalue la logique et l'efficacité de l'algorithme
5. **Complétude** : Vérifie si le travail demandé est fait, même imparfaitement

Retourne UNIQUEMENT un JSON valide avec ce format exact (sans texte supplémentaire):
{
  "score": 0-100,
  "isCorrect": true/false,
  "solvesProblem": true/false,
  "evaluation": "Évaluation détaillée du code",
  "strengths": ["Point fort 1", "Point fort 2"],
  "weaknesses": ["Point faible 1", "Point faible 2"],
  "bestPractices": {
    "followed": ["Bonnes pratiques suivies"],
    "missing": ["Bonnes pratiques manquantes"],
    "review": "Review détaillée des best practices"
  },
  "testResults": "Résultats des tests ou vérifications effectuées",
  "suggestions": "Suggestions d'amélioration concrètes",
  "workDone": true/false,
  "workQuality": "Évaluation de la qualité du travail effectué même si imparfait"
}`;

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: evaluationPrompt
      });

      const generatedText = response.text;

      if (!generatedText) {
        throw new Error("No text was generated");
      }

      // Parser la réponse JSON
      try {
        let jsonText = generatedText.trim();
        const jsonMatch = jsonText.match(/```json\s*([\s\S]*?)\s*```/) || jsonText.match(/```\s*([\s\S]*?)\s*```/);
        if (jsonMatch) {
          jsonText = jsonMatch[1].trim();
        }
        const parsedResult = JSON.parse(jsonText);
        return NextResponse.json({ success: true, data: parsedResult });
      } catch (parseError) {
        console.error("Error parsing evaluation response:", parseError);
        return NextResponse.json(
          { 
            error: "Failed to parse evaluation response",
            rawResponse: generatedText.substring(0, 500)
          },
          { status: 500 }
        );
      }

    } else if (body.type === 'evaluate-mock-interview') {
      // Évaluation d'un entretien simulé (MOCK_INTERVIEW)
      if (!body.transcription || !body.jobRequirements) {
        return NextResponse.json(
          { error: "transcription and jobRequirements are required for mock interview evaluation." },
          { status: 400 }
        );
      }

      // Extraire les réponses du candidat depuis la transcription
      const candidateResponses = Array.isArray(body.transcription) 
        ? body.transcription
            .filter((segment: any) => segment.speaker === 'user')
            .map((segment: any) => segment.text || segment.content || '')
            .join('\n\n')
        : typeof body.transcription === 'object' && body.transcription.messages
        ? body.transcription.messages
            .filter((msg: any) => msg.type === 'user')
            .map((msg: any) => msg.content || '')
            .join('\n\n')
        : '';

      const jobTitle = body.jobRequirements.title || 'Poste non spécifié';
      const jobDescription = body.jobRequirements.description || '';
      const requiredSkills = Array.isArray(body.jobRequirements.skills) 
        ? body.jobRequirements.skills.join(', ') 
        : '';
      const experienceLevel = body.jobRequirements.experienceLevel || '';
      const domain = body.jobRequirements.domain || '';

      const evaluationPrompt = `Tu es un expert en recrutement et évaluation de candidats. Tu vas évaluer un entretien simulé (MOCK_INTERVIEW) en comparant les réponses du candidat aux exigences du poste.

POSTE À POURVOIR:
- Titre: ${jobTitle}
- Description: ${jobDescription}
- Compétences requises: ${requiredSkills}
- Niveau d'expérience: ${experienceLevel}
- Domaine: ${domain}

RÉPONSES DU CANDIDAT (transcription de l'entretien):
${candidateResponses}

QUESTIONS POSÉES:
${body.questions && Array.isArray(body.questions) 
  ? body.questions.map((q: any, idx: number) => `${idx + 1}. ${q.text || q.question || ''}`).join('\n')
  : 'Non spécifiées'}

ÉVALUATION REQUISE:
Compare les réponses du candidat aux exigences du poste et évalue sur 100 points selon ces critères:

1. **Adéquation au poste** (0-25 points): Les réponses montrent-elles une compréhension du poste et une motivation appropriée?
2. **Compétences techniques** (0-25 points): Les compétences mentionnées correspondent-elles aux exigences?
3. **Communication** (0-20 points): Clarté, structure et qualité de la communication
4. **Expérience et réalisations** (0-15 points): Pertinence de l'expérience par rapport au poste
5. **Attitude et soft skills** (0-15 points): Professionnalisme, motivation, capacité d'adaptation

Retourne UNIQUEMENT un JSON valide avec ce format exact (sans texte supplémentaire):
{
  "overallScore": 0-100,
  "criteriaScores": {
    "jobFit": 0-25,
    "technicalSkills": 0-25,
    "communication": 0-20,
    "experience": 0-15,
    "softSkills": 0-15
  },
  "evaluation": "Évaluation détaillée globale",
  "strengths": ["Point fort 1", "Point fort 2"],
  "weaknesses": ["Point faible 1", "Point faible 2"],
  "recommendations": "Recommandations pour le candidat",
  "jobMatch": {
    "percentage": 0-100,
    "analysis": "Analyse de l'adéquation au poste"
  },
  "skillsAnalysis": {
    "matched": ["Compétence 1", "Compétence 2"],
    "missing": ["Compétence manquante 1"],
    "exceeds": ["Compétence supérieure 1"]
  }
}`;

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: evaluationPrompt
      });

      const generatedText = response.text;

      if (!generatedText) {
        throw new Error("No text was generated");
      }

      // Parser la réponse JSON
      try {
        let jsonText = generatedText.trim();
        const jsonMatch = jsonText.match(/```json\s*([\s\S]*?)\s*```/) || jsonText.match(/```\s*([\s\S]*?)\s*```/);
        if (jsonMatch) {
          jsonText = jsonMatch[1].trim();
        }
        const parsedResult = JSON.parse(jsonText);
        return NextResponse.json({ success: true, data: parsedResult });
      } catch (parseError) {
        console.error("Error parsing mock interview evaluation response:", parseError);
        return NextResponse.json(
          { 
            error: "Failed to parse evaluation response",
            rawResponse: generatedText.substring(0, 500)
          },
          { status: 500 }
        );
      }

    } else if (body.type === 'evaluate-technical-text') {
      // Évaluation des réponses textuelles pour tests techniques non-codage
      if (!body.textAnswers || !Array.isArray(body.textAnswers) || body.textAnswers.length === 0) {
        return NextResponse.json(
          { error: "textAnswers array is required for technical text evaluation." },
          { status: 400 }
        );
      }

      // Construire le prompt d'évaluation
      const answersText = body.textAnswers.map((ans: any, idx: number) => 
        `Question ${idx + 1}: ${ans.questionText || 'Question non spécifiée'}\nRéponse du candidat: ${ans.answer || 'Aucune réponse'}`
      ).join('\n\n');

      const domainLabels: Record<string, string> = {
        'DESIGN': 'Design',
        'MARKETING': 'Marketing',
        'COMMUNICATION': 'Communication',
        'BUSINESS': 'Business',
        'FINANCE': 'Finance',
        'MANAGEMENT': 'Management',
        'PRODUCT': 'Product Management',
        'EDUCATION': 'Éducation',
        'HEALTH': 'Santé'
      };

      const domainLabel = domainLabels[body.domain || ''] || body.domain || 'Technique';

      const evaluationPrompt = `Tu es un expert en évaluation de tests techniques pour le domaine ${domainLabel}. Tu vas évaluer les réponses textuelles d'un candidat de manière rigoureuse et pédagogique.

DOMAINE DU TEST: ${domainLabel}

QUESTIONS ET RÉPONSES DU CANDIDAT:
${answersText}

ÉVALUATION REQUISE:
Pour chaque question, évalue:
1. **Pertinence de la réponse** : La réponse répond-elle à la question posée?
2. **Qualité et profondeur** : La réponse est-elle détaillée, structurée et démontre-t-elle une bonne compréhension?
3. **Adéquation au domaine** : La réponse est-elle adaptée au domaine ${domainLabel}?
4. **Complétude** : La réponse couvre-t-elle tous les aspects de la question?
5. **Professionnalisme** : La réponse est-elle claire, bien rédigée et professionnelle?

Calcule un score global sur 100 points en fonction de la qualité globale de toutes les réponses.

Retourne UNIQUEMENT un JSON valide avec ce format exact (sans texte supplémentaire):
{
  "overallScore": 0-100,
  "questionScores": [
    {
      "questionId": "id ou index",
      "questionText": "Texte de la question",
      "score": 0-100,
      "maxScore": points de la question,
      "evaluation": "Évaluation détaillée de cette réponse",
      "strengths": ["Point fort 1", "Point fort 2"],
      "weaknesses": ["Point faible 1", "Point faible 2"]
    }
  ],
  "evaluation": "Évaluation globale détaillée de toutes les réponses",
  "strengths": ["Point fort global 1", "Point fort global 2"],
  "weaknesses": ["Point faible global 1", "Point faible global 2"],
  "suggestions": "Suggestions d'amélioration pour le candidat",
  "workDone": true/false,
  "workQuality": "Évaluation de la qualité globale du travail"
}`;

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: evaluationPrompt
      });

      const generatedText = response.text;

      if (!generatedText) {
        throw new Error("No text was generated");
      }

      // Parser la réponse JSON
      try {
        let jsonText = generatedText.trim();
        const jsonMatch = jsonText.match(/```json\s*([\s\S]*?)\s*```/) || jsonText.match(/```\s*([\s\S]*?)\s*```/);
        if (jsonMatch) {
          jsonText = jsonMatch[1].trim();
        }
        const parsedResult = JSON.parse(jsonText);
        return NextResponse.json({ success: true, data: parsedResult });
      } catch (parseError) {
        console.error("Error parsing technical text evaluation response:", parseError);
        return NextResponse.json(
          { 
            error: "Failed to parse evaluation response",
            rawResponse: generatedText.substring(0, 500)
          },
          { status: 500 }
        );
      }

    } else {
      // Requête simple avec prompt
      if (!body.prompt || typeof body.prompt !== 'string') {
        return NextResponse.json(
          { error: "A valid 'prompt' string is required for simple requests." },
          { status: 400 }
        );
      }

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: body.prompt
      });

      const generatedText = response.text;

      if (!generatedText) {
        throw new Error("No text was generated");
      }

      return NextResponse.json({ text: generatedText });
    }

  } catch (error: any) {
    console.error("Error calling Gemini API:", error);
    return NextResponse.json(
      { error: `Failed to generate content from Gemini: ${error.message || 'Unknown error'}` },
      { status: 500 }
    );
  }
}