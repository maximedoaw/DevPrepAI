// app/api/gemini/route.ts
// Ce code s'exécute uniquement sur le serveur.
import { GoogleGenAI } from "@google/genai";
import { NextResponse, type NextRequest } from 'next/server';

interface GenerateInterviewRequest {
  type: 'generate-interview' | 'simple-prompt' | 'evaluate-code';
  quizType?: 'QCM' | 'TECHNICAL' | 'MOCK_INTERVIEW' | 'SOFT_SKILLS';
  domain?: string;
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
      return `Tu es un expert en création de tests techniques de programmation pour le domaine ${domain} au niveau ${difficulty}.

Crée exactement ${numberOfQuestions} problèmes de programmation sur ${techString}.
Chaque problème doit valoir ${pointsPerQuestion} points.${descriptionContext}

Format JSON strict à respecter (IMPORTANT : retourne UNIQUEMENT du JSON valide, sans texte supplémentaire) :
{
  "title": "Titre du test technique (max 60 caractères)",
  "description": "Description du test technique (2-3 phrases)",
  "questions": [
    {
      "id": "q1",
      "text": "Énoncé du problème à résoudre",
      "type": "coding",
      "points": ${pointsPerQuestion},
      "codeSnippet": "// Code de départ ou contexte fourni",
      "correctAnswer": "Solution attendue ou description de la solution",
      "explanation": "Explication de la solution"
    }
  ]
}

Règles :
- Problèmes adaptés au niveau ${difficulty}
- Chaque question doit avoir un codeSnippet de départ
- Solutions claires et testables
- Couvrir différents concepts de ${techString}
- Total des points = ${totalPoints}`;

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