// app/api/gemini/route.ts
// Ce code s'exécute uniquement sur le serveur.
import prisma from "@/db/prisma";
import { PROMPTS } from "@/lib/prompts";
import { GoogleGenAI } from "@google/genai";
import { NextResponse, NextRequest } from "next/server";

const apiKey = process.env.GEMINI_API_KEY;
interface GenerateInterviewRequest {
  type: 'generate-course' | 'generate-interview' | 'simple-prompt' | 'evaluate-code' | 'evaluate-mock-interview' | 'evaluate-technical-text' | 'evaluate-motivation-letters' | 'generate-career-plan' | 'generate-formation-plan' | 'generate-interview-recommendations' | 'generate-job-recommendations';
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
  // Pour l'évaluation des lettres de motivation
  motivationLetters?: Array<{
    applicationId: string;
    candidateName: string;
    content: string;
  }>;
  // Pour les recommandations
  careerProfile?: any;
}

// Les prompts sont maintenant centralisés dans @/lib/prompts.ts

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

    if (body.type === 'generate-course') {
      // ------------------------------------------------------------------
      // NOUVELLE LOGIQUE : GÉNÉRATION DE COURS PAR L'IA (SCHOOL)
      // ------------------------------------------------------------------
      const { title, domain, description, difficultyLevel } = body as any;

      if (!title || !domain) {
        return NextResponse.json(
          { error: "Titre et domaine sont requis pour générer un cours." },
          { status: 400 }
        );
      }

      const prompt = PROMPTS.generateCoursePlan({
        title,
        domain,
        description: description || "",
        difficultyLevel: difficultyLevel || "JUNIOR"
      });

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt
      });

      const generatedText = response.text;

      if (!generatedText) {
        throw new Error("No text was generated");
      }

      try {
        let jsonText = generatedText.trim();
        const jsonMatch = jsonText.match(/```json\s*([\s\S]*?)\s*```/) || jsonText.match(/```\s*([\s\S]*?)\s*```/);
        if (jsonMatch) {
          jsonText = jsonMatch[1].trim();
        }
        const parsedResult = JSON.parse(jsonText);
        return NextResponse.json({ success: true, data: parsedResult });
      } catch (parseError) {
        console.error("Error parsing course generation response:", parseError);
        return NextResponse.json(
          { 
            error: "Failed to parse course generation response",
            rawResponse: generatedText.substring(0, 500)
          },
          { status: 500 }
        );
      }
    } else if (body.type === 'generate-interview') {
      // Génération automatique d'interview
      if (!body.quizType || !body.domain || !body.difficulty || !body.numberOfQuestions || !body.totalPoints) {
        return NextResponse.json(
          { error: "Missing required parameters for interview generation: quizType, domain, difficulty, numberOfQuestions, totalPoints" },
          { status: 400 }
        );
      }

      const prompt = PROMPTS.generateQuiz({
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
        console.error(`[Gemini Route] Error parsing ${body.type} response:`, parseError);
        console.error(`[Gemini Route] Raw text for ${body.type}:`, generatedText);
        
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

      const evaluationPrompt = PROMPTS.evaluateCode({
        userCode: body.userCode,
        problemDescription: body.problemDescription,
        expectedSolution: body.expectedSolution,
        codeSnippet: body.codeSnippet
      });

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

      const evaluationPrompt = PROMPTS.evaluateMockInterview({
        transcription: candidateResponses,
        jobRequirements: body.jobRequirements,
        questions: body.questions
      });

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

      const evaluationPrompt = PROMPTS.evaluateTechnicalText({
        answersText,
        domain: domainLabel
      });

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

    } else if (body.type === 'generate-career-plan') {
      // ------------------------------------------------------------------
      // NOUVELLE LOGIQUE : GÉNÉRATION DE PLAN DE CARRIÈRE
      // ------------------------------------------------------------------
      const { answers, onboardingContext } = body as any;

      if (!answers || !Array.isArray(answers) || answers.length === 0) {
         return NextResponse.json(
           { error: "Le tableau 'answers' est requis et ne doit pas être vide pour générer un plan de carrière." },
           { status: 400 }
         );
       }

      const answersText = answers
        .map((a: any, idx: number) => `Question ${idx + 1} (${a.questionId}): ${a.answer}`)
        .join('\n\n');

      const role = onboardingContext?.role || 'Non spécifié';
      const domains = Array.isArray(onboardingContext?.domains) 
        ? onboardingContext.domains.join(', ') 
        : 'Non spécifié';
      
      const onboardingDetails = onboardingContext?.onboardingDetails || {};
      const onboardingGoals = onboardingContext?.onboardingGoals || {};

      const prompt = PROMPTS.generateCareerPlan({
        answersText,
        role,
        domains,
        onboardingDetails,
        onboardingGoals
      });

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt
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
        console.error("Error parsing career plan response:", parseError);
        return NextResponse.json(
          { 
            error: "Failed to parse career plan response",
            rawResponse: generatedText.substring(0, 500)
          },
          { status: 500 }
        );
      }
    } else if (body.type === 'generate-formation-plan') {
      // ------------------------------------------------------------------
      // GÉNÉRATION DE PLAN DE FORMATION (DIRECTEUR)
      // ------------------------------------------------------------------
      const { answers, onboardingContext } = body as any;

      if (!answers || !Array.isArray(answers) || answers.length === 0) {
         return NextResponse.json(
           { error: "Le tableau 'answers' est requis pour générer un plan de formation." },
           { status: 400 }
         );
       }

      const processedAnswers = [...answers]
      const customValue = answers.find((a: any) => a.questionId === "target_market_custom")?.answer

      const finalAnswers = processedAnswers.map((a: any) => {
        if (a.questionId === "target_market" && a.answer === "other" && customValue) {
          return { ...a, answer: `Autre: ${customValue}` }
        }
        return a
      }).filter((a: any) => a.questionId !== "target_market_custom")

      const answersText = finalAnswers
        .map((a: any, idx: number) => `Question ${idx + 1} (${a.questionId}): ${a.answer}`)
        .join('\n\n');

      const role = onboardingContext?.role || 'Directeur';
      const domains = Array.isArray(onboardingContext?.domains) 
        ? onboardingContext.domains.join(', ') 
        : 'Général';
      
      const onboardingDetails = onboardingContext?.onboardingDetails || {};
      const onboardingGoals = onboardingContext?.onboardingGoals || {};

      const prompt = PROMPTS.generateFormationPlan({
        answersText,
        role,
        domains,
        onboardingDetails,
        onboardingGoals
      });

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt
      });

      const generatedText = response.text;
      if (!generatedText) throw new Error("No text was generated");

       try {
        let jsonText = generatedText.trim();
        const jsonMatch = jsonText.match(/```json\s*([\s\S]*?)\s*```/) || jsonText.match(/```\s*([\s\S]*?)\s*```/);
        if (jsonMatch) jsonText = jsonMatch[1].trim();
        
        const parsedResult = JSON.parse(jsonText);
        return NextResponse.json({ success: true, data: parsedResult });
      } catch (parseError) {
        console.error("Error parsing formation plan response:", parseError);
        return NextResponse.json(
          { 
            error: "Failed to parse formation plan response",
            rawResponse: generatedText.substring(0, 500)
          },
          { status: 500 }
        );
      }
    } else if (body.type === 'generate-interview-recommendations') {
      if (!body.careerProfile) return NextResponse.json({ error: "careerProfile is required" }, { status: 400 });

      const prompt = PROMPTS.generateInterviewRecommendations({ careerProfile: body.careerProfile });
      const response = await ai.models.generateContent({ model: "gemini-2.5-flash", contents: prompt });
      const generatedText = response.text || "";
      
      try {
        let jsonText = generatedText.trim();
        const jsonMatch = jsonText.match(/```json\s*([\s\S]*?)\s*```/) || jsonText.match(/```\s*([\s\S]*?)\s*```/);
        if (jsonMatch) jsonText = jsonMatch[1].trim();
        const parsedResult = JSON.parse(jsonText);
        return NextResponse.json({ success: true, data: parsedResult });
      } catch (e) {
        return NextResponse.json({ error: "Failed to parse AI response", rawResponse: generatedText }, { status: 500 });
      }

    } else if (body.type === 'generate-job-recommendations') {
      if (!body.careerProfile) return NextResponse.json({ error: "careerProfile is required" }, { status: 400 });

      const prompt = PROMPTS.generateJobRecommendations({ careerProfile: body.careerProfile });
      const response = await ai.models.generateContent({ model: "gemini-2.5-flash", contents: prompt });
      const generatedText = response.text || "";
      
      try {
        let jsonText = generatedText.trim();
        const jsonMatch = jsonText.match(/```json\s*([\s\S]*?)\s*```/) || jsonText.match(/```\s*([\s\S]*?)\s*```/);
        if (jsonMatch) jsonText = jsonMatch[1].trim();
        const parsedResult = JSON.parse(jsonText);
        return NextResponse.json({ success: true, data: parsedResult });
      } catch (e) {
        return NextResponse.json({ error: "Failed to parse AI response", rawResponse: generatedText }, { status: 500 });
      }

    } else if (body.type === 'evaluate-motivation-letters') {
      // ------------------------------------------------------------------
      // LOGIQUE : ÉVALUATION LETTRES DE MOTIVATION (BATCH)
      // ------------------------------------------------------------------
      if (!body.motivationLetters || !Array.isArray(body.motivationLetters) || body.motivationLetters.length === 0) {
        return NextResponse.json(
          { error: "motivationLetters array is required." },
          { status: 400 }
        );
      }

      const lettersText = body.motivationLetters.map((l, index) => 
        `ID: ${l.applicationId}
Candidat: ${l.candidateName}
Lettre:
"${l.content}"
---`
      ).join('\n\n');

      const prompt = PROMPTS.evaluateMotivationLetters({
        lettersText
      });

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt
      });
      
      const generatedText = response.text;
      if (!generatedText) throw new Error("No text generated form Gemini");

       try {
        let jsonText = generatedText.trim();
        const jsonMatch = jsonText.match(/```json\s*([\s\S]*?)\s*```/) || jsonText.match(/```\s*([\s\S]*?)\s*```/);
        if (jsonMatch) {
          jsonText = jsonMatch[1].trim();
        }
        const parsedResult = JSON.parse(jsonText);
        
        // --- PERSISTENCE LOGIC START ---
        // We must save these evaluations to the database so they persist on reload.
        if (parsedResult.evaluations && Array.isArray(parsedResult.evaluations)) {
           await prisma.$transaction(
             parsedResult.evaluations.map((evalItem: any) => 
               prisma.application.update({
                 where: { id: evalItem.applicationId },
                 data: { 
                   motivationAnalysis: evalItem 
                 }
               })
             )
           );
        }
        // --- PERSISTENCE LOGIC END ---

        return NextResponse.json({ success: true, data: parsedResult });
      } catch (parseError) {
        console.error("Error parsing motivation letters evaluation:", parseError);
        return NextResponse.json(
          { error: "Failed to parse API response", rawResponse: generatedText.substring(0, 500) },
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
    console.error("Error in gemini route:", error);
    return NextResponse.json(
      { error: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}