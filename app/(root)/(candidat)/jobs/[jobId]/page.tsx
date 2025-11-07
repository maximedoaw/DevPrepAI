"use client";

import { useState, useEffect, useRef } from "react";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Loader2 } from "lucide-react";
import { useTheme } from "next-themes";
import { Widget } from '@uploadcare/react-widget';
import { Download, Video, Upload } from "lucide-react";
import { 
  Clock, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  Rocket, 
  MessageSquare,
  Users,
  Code,
  FileText,
  ArrowLeft,
  Play,
  RefreshCw,
  Building,
  ChevronLeft,
  ChevronRight,
  X
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useJobQuizQueries, useJobMutations } from "@/hooks/use-job-queries";
import { QuizType, Difficulty } from "@prisma/client";
import { toast } from "sonner";
import { useKindeBrowserClient } from "@kinde-oss/kinde-auth-nextjs";
import { checkIfApplied } from "@/actions/application.action";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import AIVocalInterview from "@/components/interviews/ai-vocal-interview";

export default function TestsPage() {
  const { user } = useKindeBrowserClient();
  const params = useParams();
  const router = useRouter();
  const jobId = params.jobId as string;
  
  const CURRENT_USER_ID = user?.id as string;

  const { 
    useJobQuizzes,
  } = useJobQuizQueries();
  
  const { submitJobQuizMutation } = useJobMutations();

  // Vérifier si l'utilisateur a déjà postulé
  const { data: hasApplied, isLoading: loadingApplied } = useQuery({
    queryKey: ["has-applied", jobId, CURRENT_USER_ID],
    queryFn: () => checkIfApplied(jobId),
    enabled: !!jobId && !!CURRENT_USER_ID,
  });

  // Rediriger vers "/" après 3 secondes si l'utilisateur a déjà postulé
  useEffect(() => {
    if (!loadingApplied && hasApplied) {
      const timer = setTimeout(() => {
        router.push("/");
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [hasApplied, loadingApplied, router]);

  // Récupérer les quizzes du job
  const { 
    data: quizzes = [], 
    isLoading: loadingQuizzes,
    error: quizzesError,
    refetch: refetchQuizzes
  } = useJobQuizzes(jobId);

  // État local pour la gestion du test en cours
  const [currentQuiz, setCurrentQuiz] = useState<any>(null);
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [isTestRunning, setIsTestRunning] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<any[]>([]);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [isVideoDialogOpen, setIsVideoDialogOpen] = useState(false);
  const [isImageDialogOpen, setIsImageDialogOpen] = useState(false);

  // Démarrer un test
  const startTest = (quiz: any) => {
    console.log("🚀 Démarrage du test:", quiz);
    setCurrentQuiz(quiz);
    setTimeLeft(quiz.duration * 60);
    setIsTestRunning(true);
    setCurrentQuestionIndex(0);
    setUserAnswers([]);
    setSelectedAnswer(null);
  };

  // Calculer le score pour un quiz - amélioré pour prendre en compte les points par question
  const calculateScore = (answers: any[], questions: any[]) => {
    if (!questions || questions.length === 0) return 0;
    
    let totalPointsEarned = 0;
    let totalPointsPossible = 0;
    
    answers.forEach((answer, index) => {
      const question = questions[index];
      if (!question) return;
      
      const questionPoints = question.points || 1;
      totalPointsPossible += questionPoints;
      
      // Si la réponse est correcte, ajouter les points
      if (answer?.isCorrect) {
        totalPointsEarned += questionPoints;
      }
    });
    
    // Calculer le pourcentage de score
    if (totalPointsPossible === 0) return 0;
    return Math.round((totalPointsEarned / totalPointsPossible) * 100);
  };

  // Fonction pour normaliser correctAnswer (peut être index ou option string)
  const normalizeCorrectAnswer = (correctAnswer: any, options: string[], selectedIndex: number): boolean => {
    // Si correctAnswer est un index numérique
    if (typeof correctAnswer === 'number') {
      return selectedIndex === correctAnswer;
    }
    
    // Si correctAnswer est une chaîne (option elle-même)
    if (typeof correctAnswer === 'string') {
      // Comparer directement avec l'option sélectionnée
      const selectedOption = options[selectedIndex];
      if (selectedOption === correctAnswer) {
        return true;
      }
      // Sinon, trouver l'index de la bonne réponse et comparer
      const correctIndex = options.findIndex(opt => opt.trim().toLowerCase() === correctAnswer.trim().toLowerCase());
      return selectedIndex === correctIndex && correctIndex !== -1;
    }
    
    // Fallback : comparaison par index
    return false;
  };

  // Soumettre le test avec analyse améliorée
  const submitTest = async (
    score: number,
    answersData: any = [],
    videoUrl: string | null = null,
    imageUrls: string[] | null = null
  ) => {
    if (!currentQuiz) return;

    try {
      const normalizedAnswers = Array.isArray(answersData)
        ? answersData
        : answersData && typeof answersData === "object"
        ? [answersData]
        : [];

      let finalScore = score;
      const recordedDuration =
        answersData && typeof answersData === "object" && typeof (answersData as any).callDuration === "number"
          ? Math.max(0, Math.floor((answersData as any).callDuration))
          : undefined;
      const fallbackDuration = Math.max(0, currentQuiz.duration * 60 - timeLeft);
      let analysis = "";

      if (currentQuiz.type === QuizType.QCM) {
        const totalQuestions = normalizedAnswers.length;
        const correctCount = normalizedAnswers.filter((a) => a?.isCorrect).length;
        const incorrectCount = totalQuestions - correctCount;

        analysis =
          score >= 90
            ? `Excellent travail ! Vous avez obtenu ${correctCount}/${totalQuestions} réponses correctes. Vous démontrez une maîtrise exceptionnelle des concepts évalués.`
            : score >= 70
            ? `Bon travail ! Vous avez obtenu ${correctCount}/${totalQuestions} réponses correctes. Vous maîtrisez bien la majorité des concepts.`
            : score >= 50
            ? `Résultat moyen. Vous avez obtenu ${correctCount}/${totalQuestions} réponses correctes. ${
                incorrectCount > 0 ? `${incorrectCount} réponse(s) incorrecte(s). ` : ""
              }Des révisions supplémentaires sont recommandées.`
            : `Des progrès sont nécessaires. Vous avez obtenu ${correctCount}/${totalQuestions} réponses correctes. ${
                incorrectCount > 0 ? `${incorrectCount} réponse(s) incorrecte(s). ` : ""
              }Continuez à vous exercer pour améliorer vos compétences.`;
      } else if (currentQuiz.type === QuizType.TECHNICAL) {
        const isTechnicalDomain = (domain?: string): boolean => {
          if (!domain) return false;
          const technicalDomains = [
            "DEVELOPMENT",
            "WEB",
            "MOBILE",
            "DEVOPS",
            "CYBERSECURITY",
            "MACHINE_LEARNING",
            "DATA_SCIENCE",
            "ARCHITECTURE",
          ];
          return technicalDomains.includes(domain);
        };

        const requiresCodeEditor = isTechnicalDomain(currentQuiz.domain);

        if (!requiresCodeEditor && normalizedAnswers.some((a) => a.answer && a.type === "technical_text")) {
          try {
            const textAnswers = normalizedAnswers
              .filter((a) => a.answer && a.type === "technical_text")
              .map((a) => ({
                questionId: a.questionId,
                questionText: a.questionText,
                answer: a.answer,
                points: a.points,
              }));

            if (textAnswers.length > 0) {
              toast.info("Évaluation IA en cours...");

              const evalResponse = await fetch("/api/gemini", {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({
                  type: "evaluate-technical-text",
                  textAnswers: textAnswers,
                  domain: currentQuiz.domain,
                }),
              });

              if (evalResponse.ok) {
                const evalResult = await evalResponse.json();
                if (evalResult.success && evalResult.data) {
                  finalScore = evalResult.data.overallScore || score;
                  analysis = evalResult.data.evaluation || analysis;

                  if (evalResult.data.strengths && evalResult.data.strengths.length > 0) {
                    analysis += `\n\nPoints forts: ${evalResult.data.strengths.join(", ")}`;
                  }
                  if (evalResult.data.weaknesses && evalResult.data.weaknesses.length > 0) {
                    analysis += `\n\nPoints à améliorer: ${evalResult.data.weaknesses.join(", ")}`;
                  }
                  if (evalResult.data.suggestions) {
                    analysis += `\n\nSuggestions: ${evalResult.data.suggestions}`;
                  }

                  normalizedAnswers.forEach((ans, idx) => {
                    if (ans.type === "technical_text" && evalResult.data.questionScores) {
                      const questionEval = evalResult.data.questionScores.find(
                        (qs: any) => qs.questionId === ans.questionId || qs.questionId === idx
                      );
                      if (questionEval) {
                        normalizedAnswers[idx].evaluation = questionEval;
                      }
                    }
                  });

                  toast.success("Évaluation IA terminée");
                }
              } else {
                console.error("Erreur lors de l'évaluation IA");
              }
            }
          } catch (error) {
            console.error("Error evaluating technical text:", error);
          }
        }

        if (!analysis) {
          const evaluation = normalizedAnswers[0]?.evaluation;
          const submissionType = videoUrl
            ? "vidéo"
            : imageUrls && imageUrls.length > 0
            ? "catalogue d'images"
            : normalizedAnswers.some((a) => a.answer)
            ? "réponses textuelles"
            : "code";
          analysis =
            evaluation?.evaluation ||
            (finalScore >= 80
              ? `Travail technique de qualité. Vous avez soumis ${submissionType} démontrant une bonne compréhension des concepts.`
              : finalScore >= 60
              ? `Travail présentant quelques points à améliorer. Votre ${submissionType} montre une compréhension globale mais peut être optimisé.`
              : `Travail nécessitant des améliorations. Votre ${submissionType} sera évalué manuellement par le recruteur.`);

          if (evaluation?.strengths?.length > 0) {
            analysis += `\n\nPoints forts: ${evaluation.strengths.join(", ")}`;
          }
          if (evaluation?.suggestions) {
            analysis += `\n\nSuggestions: ${evaluation.suggestions}`;
          }
        }
      } else if (currentQuiz.type === QuizType.MOCK_INTERVIEW) {
        const session = normalizedAnswers[0] || {};
        const feedback = session.feedback || {};
        if (typeof feedback.overallScore === "number") {
          finalScore = feedback.overallScore;
        }
        if (feedback.evaluation) {
          analysis = feedback.evaluation;
        } else {
          analysis = finalScore >= 70
            ? "Excellent échange ! Vos réponses démontrent une forte adéquation avec le poste."
            : finalScore >= 50
            ? "Entretien correct mais des points peuvent être approfondis."
            : "Nous recommandons de retravailler certaines réponses pour gagner en impact.";
        }
        if (feedback.strengths && feedback.strengths.length > 0) {
          analysis += `\n\nPoints forts: ${feedback.strengths.join(", ")}`;
        }
        if (feedback.weaknesses && feedback.weaknesses.length > 0) {
          analysis += `\n\nPoints à améliorer: ${feedback.weaknesses.join(", ")}`;
        }
        if (feedback.recommendations) {
          analysis += `\n\nRecommandations: ${feedback.recommendations}`;
        }
      } else {
        analysis =
          score >= 70
            ? "Excellent travail ! Vous avez démontré une maîtrise solide des concepts évalués."
            : "Des progrès sont nécessaires dans certains domaines. Continuez à vous exercer.";
      }

      await submitJobQuizMutation.mutateAsync({
        jobQuizId: currentQuiz.id,
        userId: CURRENT_USER_ID,
        answers: answersData,
        score: finalScore,
        analysis: analysis,
        duration: recordedDuration ?? fallbackDuration,
        videoUrl: videoUrl,
        imageUrls: imageUrls,
      });

      toast.success("Test terminé avec succès !");
      refetchQuizzes();
      setCurrentQuiz(null);
      setIsTestRunning(false);
      setSelectedAnswer(null);
    } catch (error) {
      toast.error("Erreur lors de la soumission du test");
      console.error("Submit test error:", error);
    }
  };

  // Timer effect
  useEffect(() => {
    if (!isTestRunning || timeLeft <= 0) return;
    if (currentQuiz?.type === QuizType.MOCK_INTERVIEW) return;

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          submitTest(0);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isTestRunning, timeLeft, currentQuiz?.type]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const isQuizCompleted = (quiz: any) => {
    if (!quiz.results || !Array.isArray(quiz.results)) return false;
    return quiz.results.some((result: any) => result.userId === CURRENT_USER_ID);
  };

  const getUserQuizResult = (quiz: any) => {
    if (!quiz.results || !Array.isArray(quiz.results)) return null;
    return quiz.results.find((result: any) => result.userId === CURRENT_USER_ID);
  };

  const completedQuizzes = quizzes.filter((quiz: any) => isQuizCompleted(quiz)).length;
  const totalQuizzes = quizzes.length;
  const globalProgress = totalQuizzes > 0 ? (completedQuizzes / totalQuizzes) * 100 : 0;

  // Skeleton Loader pour les quizzes
  const QuizSkeleton = () => (
    <div className="space-y-6">
      {[...Array(3)].map((_, index) => (
        <Card key={index} className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
          <CardContent className="p-6">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
              <div className="flex-1 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                  <div className="flex items-start gap-4">
                    <Skeleton className="w-12 h-12 rounded-xl" />
                    <div className="flex-1 min-w-0 space-y-3">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:gap-3">
                        <Skeleton className="h-7 w-64" />
                        <div className="flex gap-2 mt-2 sm:mt-0">
                          <Skeleton className="h-6 w-20" />
                          <Skeleton className="h-6 w-24" />
                        </div>
                      </div>
                      <Skeleton className="h-5 w-full max-w-2xl" />
                      <Skeleton className="h-5 w-3/4 max-w-xl" />
                      <div className="flex flex-wrap gap-4">
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-4 w-28" />
                        <Skeleton className="h-4 w-32" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="lg:w-48">
                <Skeleton className="h-12 w-full rounded-lg" />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );

  // Composant QCM amélioré
  const QCMTest = ({ quiz }: { quiz: any }) => {
    const defaultQuestions = [
      {
        id: 1,
        question: "Qu'est-ce que le principe de responsabilité unique (SRP) en POO ?",
        options: [
          "Une classe doit avoir une seule raison de changer",
          "Une méthode doit faire une seule chose",
          "Un objet doit avoir une seule propriété",
          "Une interface doit avoir une seule méthode"
        ],
        correctAnswer: 0,
        points: 1
      },
      {
        id: 2,
        question: "Quelle est la complexité temporelle de la recherche binaire ?",
        options: ["O(1)", "O(log n)", "O(n)", "O(n²)"],
        correctAnswer: 1,
        points: 1
      }
    ];

    const questions = quiz.questions && Array.isArray(quiz.questions) && quiz.questions.length > 0 
      ? quiz.questions 
      : defaultQuestions;
    
    const currentQuestion = questions[currentQuestionIndex];
    const questionProgress = ((currentQuestionIndex + 1) / questions.length) * 100;

    const handleAnswerSelect = (answerIndex: number) => {
      setSelectedAnswer(answerIndex);
    };

    const handleNextQuestion = () => {
      if (selectedAnswer === null) {
        toast.warning("Veuillez sélectionner une réponse");
        return;
      }

      // Normaliser la comparaison de correctAnswer (peut être index ou option string)
      const isCorrect = normalizeCorrectAnswer(
        currentQuestion.correctAnswer, 
        currentQuestion.options || [], 
        selectedAnswer
      );

      const newAnswers = [...userAnswers];
      newAnswers[currentQuestionIndex] = {
        questionId: currentQuestion.id || currentQuestionIndex,
        questionText: currentQuestion.question || currentQuestion.text,
        selectedAnswer: selectedAnswer,
        selectedOption: currentQuestion.options?.[selectedAnswer] || '',
        correctAnswer: currentQuestion.correctAnswer,
        isCorrect: isCorrect,
        points: currentQuestion.points || 1
      };
      setUserAnswers(newAnswers);

      if (currentQuestionIndex < questions.length - 1) {
        setCurrentQuestionIndex(prev => prev + 1);
        setSelectedAnswer(userAnswers[currentQuestionIndex + 1]?.selectedAnswer ?? null);
      } else {
        // Calculer le score basé sur les points de chaque question
        const score = calculateScore(newAnswers, questions);
        submitTest(score, newAnswers);
      }
    };

    const handlePreviousQuestion = () => {
      if (currentQuestionIndex > 0) {
        setCurrentQuestionIndex(prev => prev - 1);
        setSelectedAnswer(userAnswers[currentQuestionIndex - 1]?.selectedAnswer ?? null);
      }
    };

    if (!currentQuestion) {
      return (
        <div className="text-center py-12">
          <AlertTriangle className="h-12 w-12 text-orange-500 mx-auto mb-4" />
          <p className="text-lg font-medium">Aucune question disponible</p>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between items-center text-sm font-medium">
            <span className="text-emerald-700 dark:text-emerald-400">
              Question {currentQuestionIndex + 1} sur {questions.length}
            </span>
            <span className="text-slate-600 dark:text-slate-400">
              {Math.round(questionProgress)}% complété
            </span>
          </div>
          <Progress 
            value={questionProgress} 
            className="h-2 bg-slate-200 dark:bg-slate-700"
          />
        </div>

        <div className="flex justify-between items-center">
          <Badge variant="outline" className="bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 border-emerald-300 dark:border-emerald-600">
            {currentQuestion.points || 1} point(s)
          </Badge>
        </div>
        
        <div className="bg-white dark:bg-slate-800 p-6 rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm">
          <p className="text-lg font-medium mb-6 text-slate-900 dark:text-slate-100">
            {currentQuestion.question}
          </p>
          
          <div className="space-y-3">
            {currentQuestion.options.map((option: string, index: number) => {
              const isSelected = selectedAnswer === index;
              return (
                <Button
                  key={index}
                  variant="outline"
                  className={cn(
                    "w-full justify-start h-auto py-4 px-5 text-left transition-all duration-200",
                    isSelected 
                      ? "bg-emerald-50 dark:bg-emerald-900/40 border-2 border-emerald-500 dark:border-emerald-400 shadow-md" 
                      : "border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700/50 hover:border-slate-400 dark:hover:border-slate-500"
                  )}
                  onClick={() => handleAnswerSelect(index)}
                >
                  <span className={cn(
                    "font-bold mr-3 text-lg",
                    isSelected 
                      ? "text-emerald-600 dark:text-emerald-400" 
                      : "text-slate-500 dark:text-slate-400"
                  )}>
                    {String.fromCharCode(65 + index)}.
                  </span>
                  <span className={cn(
                    isSelected 
                      ? "text-emerald-900 dark:text-emerald-100 font-medium" 
                      : "text-slate-700 dark:text-slate-300",
                    "line-clamp-2 break-words"
                  )}>
                    {option}
                  </span>
                  {isSelected && (
                    <CheckCircle2 className="h-5 w-5 ml-auto text-emerald-600 dark:text-emerald-400" />
                  )}
                </Button>
              );
            })}
          </div>
        </div>

        <div className="flex justify-between items-center gap-3">
          <Button
            variant="outline"
            onClick={handlePreviousQuestion}
            disabled={currentQuestionIndex === 0}
            className="border-slate-300 dark:border-slate-600 disabled:opacity-50"
          >
            <ChevronLeft className="h-4 w-4 mr-2" />
            Précédent
          </Button>
          
          <Button
            onClick={handleNextQuestion}
            disabled={selectedAnswer === null}
            className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {currentQuestionIndex < questions.length - 1 ? "Suivant" : "Terminer"}
            <ChevronRight className="h-4 w-4 ml-2" />
          </Button>
        </div>
      </div>
    );
  };

  // Autres composants de tests (MockInterview, SoftSkills, Technical)
  const MockInterviewTest = ({ quiz }: { quiz: any }) => {
    const questions = Array.isArray(quiz.questions) ? quiz.questions : [];
    const formattedQuestions = questions.map((question: any, index: number) => ({
      id: question.id || `mock-question-${index}`,
      question: question.text || question.question || "",
      expectedAnswer: question.correctAnswer || question.expectedAnswer || "",
      evaluationCriteria: question.explanation || question.evaluationCriteria || "",
    }));

    return (
      <AIVocalInterview
        interviewData={{
          id: quiz.id,
          title: quiz.title,
          company: quiz.company || "",
          domain: quiz.domain,
          technologies: quiz.technology || [],
          description: quiz.description || "",
          duration: quiz.duration,
          difficulty: quiz.difficulty,
        }}
        questions={formattedQuestions}
        onComplete={(score, sessionData) => {
          const payload = {
            type: "mock_interview",
            feedback: sessionData?.feedback || null,
            transcription: sessionData?.transcription || [],
            messages: sessionData?.messages || [],
            callDuration: sessionData?.callDuration,
            technologies: quiz.technology || [],
            domain: quiz.domain,
            questions: formattedQuestions,
          };
          submitTest(score ?? 0, payload);
        }}
      />
    );
  };

  const SoftSkillsTest = ({ quiz }: { quiz: any }) => {
    const defaultScenarios = [
      {
        id: 1,
        scenario: "Votre équipe travaille sur un projet avec un délai serré. Un membre de l'équipe ne respecte pas ses engagements, mettant en péril la livraison.",
        question: "Comment gérez-vous cette situation ?",
        options: [
          "Je le confronte directement en réunion d'équipe",
          "Je discute avec lui en privé pour comprendre les raisons",
          "J'en informe immédiatement le manager",
          "Je prends en charge son travail pour respecter le délai"
        ]
      }
    ];

    const scenarios = quiz.questions && Array.isArray(quiz.questions) && quiz.questions.length > 0 
      ? quiz.questions 
      : defaultScenarios;
    
    const currentScenario = scenarios[currentQuestionIndex];
    const progress = ((currentQuestionIndex + 1) / scenarios.length) * 100;

    const handleAnswerSelect = (index: number) => {
      setSelectedAnswer(index);
    };

    const handleNext = () => {
      if (selectedAnswer === null) {
        toast.warning("Veuillez sélectionner une réponse");
        return;
      }

      const newAnswers = [...userAnswers];
      newAnswers[currentQuestionIndex] = {
        scenarioId: currentScenario.id,
        answer: currentScenario.options[selectedAnswer],
        type: "soft_skill"
      };
      setUserAnswers(newAnswers);

      if (currentQuestionIndex < scenarios.length - 1) {
        setCurrentQuestionIndex(prev => prev + 1);
        setSelectedAnswer(null);
      } else {
        submitTest(80, newAnswers);
      }
    };

    const handlePrevious = () => {
      if (currentQuestionIndex > 0) {
        setCurrentQuestionIndex(prev => prev - 1);
        setSelectedAnswer(userAnswers[currentQuestionIndex - 1]?.selectedAnswer ?? null);
      }
    };

    if (!currentScenario) return null;

    return (
      <div className="space-y-6">
        <div className="space-y-2">
          <div className="flex justify-between items-center text-sm font-medium">
            <span className="text-emerald-700 dark:text-emerald-400">
              Situation {currentQuestionIndex + 1} sur {scenarios.length}
            </span>
            <span className="text-slate-600 dark:text-slate-400">
              {Math.round(progress)}% complété
            </span>
          </div>
          <Progress value={progress} className="h-2 bg-slate-200 dark:bg-slate-700" />
        </div>
        
        <div className="bg-white dark:bg-slate-800 p-6 rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm">
          <div className="mb-6">
            <h4 className="font-semibold text-lg mb-2 text-slate-900 dark:text-slate-100">Scénario :</h4>
            <p className="text-slate-700 dark:text-slate-300 leading-relaxed bg-slate-50 dark:bg-slate-900/50 p-4 rounded-lg border border-slate-200 dark:border-slate-700">
              {currentScenario.scenario}
            </p>
          </div>
          
          <div className="mb-6">
            <h4 className="font-semibold mb-3 text-slate-900 dark:text-slate-100">Question :</h4>
            <p className="text-lg font-medium text-slate-900 dark:text-slate-100 bg-slate-50 dark:bg-slate-900/50 p-4 rounded-lg border border-slate-200 dark:border-slate-700">
              {currentScenario.question}
            </p>
          </div>
          
          <div className="space-y-3">
            {currentScenario.options.map((option: string, index: number) => {
              const isSelected = selectedAnswer === index;
              return (
                <Button
                  key={index}
                  variant="outline"
                  className={cn(
                    "w-full justify-start h-auto py-4 px-5 text-left transition-all duration-200",
                    isSelected 
                      ? "bg-emerald-50 dark:bg-emerald-900/40 border-2 border-emerald-500 dark:border-emerald-400 shadow-md" 
                      : "border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700/50"
                  )}
                  onClick={() => handleAnswerSelect(index)}
                >
                  <span className={cn(
                    "font-bold mr-3 text-lg",
                    isSelected ? "text-emerald-600 dark:text-emerald-400" : "text-slate-500 dark:text-slate-400"
                  )}>
                    {String.fromCharCode(65 + index)}.
                  </span>
                  <span className={cn(
                    isSelected ? "text-emerald-900 dark:text-emerald-100 font-medium" : "text-slate-700 dark:text-slate-300",
                    "line-clamp-2 break-words"
                  )}>
                    {option}
                  </span>
                  {isSelected && (
                    <CheckCircle2 className="h-5 w-5 ml-auto text-emerald-600 dark:text-emerald-400" />
                  )}
                </Button>
              );
            })}
          </div>
        </div>

        <div className="flex justify-between gap-3">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={currentQuestionIndex === 0}
            className="border-slate-300 dark:border-slate-600 disabled:opacity-50"
          >
            <ChevronLeft className="h-4 w-4 mr-2" />
            Précédent
          </Button>
          <Button
            onClick={handleNext}
            disabled={selectedAnswer === null}
            className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg disabled:opacity-50"
          >
            {currentQuestionIndex < scenarios.length - 1 ? "Suivant" : "Terminer"}
            <ChevronRight className="h-4 w-4 ml-2" />
          </Button>
        </div>
      </div>
    );
  };

  const TechnicalTest = ({ quiz }: { quiz: any }) => {
    const [videoUrl, setVideoUrl] = useState<string>("");
    const [imageUrls, setImageUrls] = useState<string[]>([]);
    const [submissionType, setSubmissionType] = useState<"video" | "images" | "text" | null>(null);
    const [textAnswers, setTextAnswers] = useState<Record<number, string>>({});
    const [currentAnswerDraft, setCurrentAnswerDraft] = useState<string>("");

    // Déterminer si le domaine nécessite un éditeur de code (domaines techniques)
    const isTechnicalDomain = (domain?: string): boolean => {
      if (!domain) return false;
      const technicalDomains = [
        'DEVELOPMENT', 'WEB', 'MOBILE', 'DEVOPS', 'CYBERSECURITY',
        'MACHINE_LEARNING', 'DATA_SCIENCE', 'ARCHITECTURE'
      ];
      return technicalDomains.includes(domain);
    };

    const requiresCodeEditor = isTechnicalDomain(quiz.domain);

    // Récupérer les questions du quiz
    const questions = quiz.questions && Array.isArray(quiz.questions) && quiz.questions.length > 0 
      ? quiz.questions 
      : [];
    
    const currentQuestion = questions[currentQuestionIndex] || {};
    const questionProgress = ((currentQuestionIndex + 1) / questions.length) * 100;
    const isLastQuestion = currentQuestionIndex === questions.length - 1;

    // Fonction pour générer et télécharger le PDF
    const generatePDF = () => {
      const printWindow = window.open('', '_blank');
      if (!printWindow) return;

      // Adapter le titre selon le domaine
      const domainLabels: Record<string, string> = {
        'DEVELOPMENT': 'Développement',
        'MACHINE_LEARNING': 'Machine Learning',
        'DATA_SCIENCE': 'Data Science',
        'FINANCE': 'Finance',
        'BUSINESS': 'Business',
        'ENGINEERING': 'Ingénierie',
        'DESIGN': 'Design',
        'DEVOPS': 'DevOps',
        'CYBERSECURITY': 'Cybersécurité',
        'MARKETING': 'Marketing',
        'PRODUCT': 'Produit',
        'ARCHITECTURE': 'Architecture',
        'MOBILE': 'Mobile',
        'WEB': 'Web',
        'COMMUNICATION': 'Communication',
        'MANAGEMENT': 'Management',
        'EDUCATION': 'Éducation',
        'HEALTH': 'Santé'
      };
      
      const domainLabel = domainLabels[quiz.domain || 'DEVELOPMENT'] || 'Technique';

      const pdfContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <title>Test ${domainLabel} - ${quiz.title}</title>
          <style>
            @media print {
              @page { margin: 2cm; }
              body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; }
            }
            body {
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
              max-width: 800px;
              margin: 0 auto;
              padding: 20px;
              line-height: 1.6;
              color: #333;
            }
            .header {
              border-bottom: 3px solid #10b981;
              padding-bottom: 20px;
              margin-bottom: 30px;
            }
            .header h1 {
              color: #10b981;
              margin: 0;
              font-size: 28px;
            }
            .header p {
              color: #666;
              margin: 5px 0;
            }
            .question {
              margin-bottom: 40px;
              padding: 20px;
              background: #f9fafb;
              border-left: 4px solid #10b981;
              border-radius: 4px;
            }
            .question-number {
              font-weight: bold;
              color: #10b981;
              font-size: 18px;
              margin-bottom: 10px;
            }
            .question-title {
              font-size: 20px;
              font-weight: 600;
              margin-bottom: 15px;
              color: #1f2937;
            }
            .question-text {
              color: #4b5563;
              margin-bottom: 15px;
              white-space: pre-wrap;
            }
            .question-points {
              display: inline-block;
              background: #10b981;
              color: white;
              padding: 4px 12px;
              border-radius: 12px;
              font-size: 12px;
              font-weight: 600;
              margin-bottom: 15px;
            }
            .code-snippet {
              background: #1f2937;
              color: #e5e7eb;
              padding: 15px;
              border-radius: 6px;
              font-family: 'Courier New', monospace;
              font-size: 14px;
              overflow-x: auto;
              margin: 15px 0;
            }
            .examples {
              margin-top: 20px;
              padding: 15px;
              background: #eff6ff;
              border-radius: 6px;
            }
            .examples h4 {
              margin-top: 0;
              color: #1e40af;
            }
            .example-item {
              margin: 10px 0;
              padding: 10px;
              background: white;
              border-radius: 4px;
            }
            .footer {
              margin-top: 40px;
              padding-top: 20px;
              border-top: 2px solid #e5e7eb;
              text-align: center;
              color: #6b7280;
              font-size: 12px;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>${quiz.title}</h1>
            <p><strong>Domaine:</strong> ${domainLabel}</p>
            <p><strong>Entreprise:</strong> ${quiz.company || 'Non spécifiée'}</p>
            <p><strong>Durée:</strong> ${quiz.duration} minutes</p>
            <p><strong>Difficulté:</strong> ${quiz.difficulty || 'Non spécifiée'}</p>
            <p><strong>Technologies:</strong> ${(quiz.technology || []).join(', ') || 'Non spécifiées'}</p>
            ${quiz.description ? `<p><strong>Description:</strong> ${quiz.description}</p>` : ''}
          </div>

          ${questions.map((q: any, index: number) => `
            <div class="question">
              <div class="question-number">Question ${index + 1} / ${questions.length}</div>
              <div class="question-points">${q.points || 0} point${(q.points || 0) > 1 ? 's' : ''}</div>
              ${q.title ? `<div class="question-title">${q.title}</div>` : ''}
              <div class="question-text">${(q.text || q.question || '').replace(/\n/g, '<br>')}</div>
              ${q.codeSnippet && q.codeSnippet.trim() !== '' ? `<div class="code-snippet">${q.codeSnippet.replace(/\n/g, '<br>')}</div>` : ''}
              ${q.examples && Array.isArray(q.examples) && q.examples.length > 0 ? `
                <div class="examples">
                  <h4>Exemples / Cas d'usage:</h4>
                  ${q.examples.map((ex: any) => `
                    <div class="example-item">
                      ${ex.input ? `<strong>Contexte:</strong> ${ex.input}<br>` : ''}
                      ${ex.output ? `<strong>Résultat attendu:</strong> ${ex.output}` : ''}
                      ${!ex.input && !ex.output ? `<strong>Exemple:</strong> ${JSON.stringify(ex)}` : ''}
                    </div>
                  `).join('')}
                </div>
              ` : ''}
            </div>
          `).join('')}

          <div class="footer">
            <p>Généré le ${new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
            <p>PrepWise - Plateforme de préparation aux entretiens techniques</p>
          </div>
        </body>
        </html>
      `;

      printWindow.document.write(pdfContent);
      printWindow.document.close();
      setTimeout(() => {
        printWindow.print();
      }, 250);
    };

    // Navigation entre les questions
    const handleNextQuestion = () => {
      if (!requiresCodeEditor) {
        setTextAnswers(prev => ({ ...prev, [currentQuestionIndex]: currentAnswerDraft }));
      }
      if (currentQuestionIndex < questions.length - 1) {
        setCurrentQuestionIndex(prev => prev + 1);
        // Scroll vers le haut de la page
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    };

    const handlePreviousQuestion = () => {
      if (!requiresCodeEditor) {
        setTextAnswers(prev => ({ ...prev, [currentQuestionIndex]: currentAnswerDraft }));
      }
      if (currentQuestionIndex > 0) {
        setCurrentQuestionIndex(prev => prev - 1);
        // Scroll vers le haut de la page
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    };

    // Gestion de l'upload vidéo avec Uploadcare
    const handleVideoUpload = () => {
      setSubmissionType("video");
      setIsVideoDialogOpen(true);
    };

    const handleVideoUploadComplete = (info: any) => {
      if (info && info.cdnUrl) {
        setVideoUrl(info.cdnUrl);
        setSubmissionType("video");
        toast.success("Vidéo téléversée avec succès");
      }
      setIsVideoDialogOpen(false);
    };

    // Gestion de l'upload d'images avec Uploadcare
    const handleImagesUpload = () => {
      setSubmissionType("images");
      setIsImageDialogOpen(true);
    };

    const handleImagesUploadComplete = (info: any) => {
      if (info && info.cdnUrl) {
        setImageUrls(prev => {
          const next = [...prev, info.cdnUrl];
          toast.success(`Image ${next.length} téléversée avec succès`);
          return next;
        });
        setSubmissionType("images");
      }
      setIsImageDialogOpen(false);
    };

    const removeImage = (index: number) => {
      setImageUrls(prev => {
        const next = prev.filter((_, i) => i !== index);
        if (next.length === 0 && !videoUrl) {
          setSubmissionType(null);
        }
        return next;
      });
    };

    const combinedAnswersToValidate = requiresCodeEditor
      ? textAnswers
      : { ...textAnswers, [currentQuestionIndex]: currentAnswerDraft };
    const hasTextAnswer = Object.values(combinedAnswersToValidate).some(answer => answer && answer.trim().length > 0);

    const handleSubmit = async () => {
      // Pour les domaines non-techniques, le texte est obligatoire, vidéo/image optionnel
      // Pour les domaines techniques, vidéo/image est obligatoire
      if (requiresCodeEditor) {
        if (!videoUrl && imageUrls.length === 0) {
          toast.warning("Veuillez téléverser une vidéo ou des images comme preuve de votre travail");
          return;
        }
      } else {
        // Vérifier qu'au moins une réponse textuelle est fournie
        if (!hasTextAnswer && !videoUrl && imageUrls.length === 0) {
          toast.warning("Veuillez fournir vos réponses dans le champ texte ou téléverser une vidéo/images");
          return;
        }
      }

      // Créer les réponses avec la vidéo, les images ou le texte
      const allAnswers = questions.map((q: any, index: number) => ({
        questionId: q.id || index,
        questionText: q.text || q.question || q.title,
        type: videoUrl ? "technical_video" : imageUrls.length > 0 ? "technical_images" : "technical_text",
        answer: combinedAnswersToValidate[index] || null, // Réponse textuelle
        videoUrl: videoUrl || null,
        imageUrls: imageUrls.length > 0 ? imageUrls : null,
        points: q.points || Math.floor((currentQuiz?.totalPoints || 100) / questions.length)
      }));

      // Soumettre avec un score par défaut (sera évalué par l'IA)
      // Passer videoUrl et imageUrls séparément pour le schema
      submitTest(0, allAnswers, videoUrl || null, imageUrls.length > 0 ? imageUrls : null);
    };

    useEffect(() => {
      if (!requiresCodeEditor) {
        const savedAnswer = textAnswers[currentQuestionIndex] || "";
        setCurrentAnswerDraft(savedAnswer);
      } else {
        setCurrentAnswerDraft("");
      }
    }, [currentQuestionIndex, requiresCodeEditor, quiz.id]);

    const handleTextAnswerChange = (value: string) => {
      setCurrentAnswerDraft(value);
      setTextAnswers(prev => ({ ...prev, [currentQuestionIndex]: value }));
    };

    useEffect(() => {
      setTextAnswers({});
      setCurrentAnswerDraft("");
      setVideoUrl("");
      setImageUrls([]);
      setSubmissionType(null);
      setIsVideoDialogOpen(false);
      setIsImageDialogOpen(false);
    }, [quiz?.id]);

    return (
      <div className="min-h-screen overflow-y-auto bg-gradient-to-b dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 from-slate-50 via-emerald-50 to-slate-100 p-4 sm:p-6">
        <div className="max-w-4xl mx-auto space-y-6 pb-20">
          {/* Header */}
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-lg p-6 sticky top-0 z-10 backdrop-blur-sm">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
              <div>
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
                  {quiz.title}
                </h1>
                <p className="text-slate-600 dark:text-slate-400">
                  {quiz.description || `${questions.length} question(s) technique(s)`}
                </p>
              </div>
            <div className="flex items-center gap-2">
                <Badge variant="outline" className="capitalize">
                  {quiz.difficulty?.toLowerCase() || "medium"}
                </Badge>
                <Badge variant="outline">
                  {quiz.duration} min
                </Badge>
              </div>
            </div>
            <Progress value={questionProgress} className="h-2" />
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-2">
              Question {currentQuestionIndex + 1} sur {questions.length}
            </p>
          </div>

          {/* Question actuelle */}
          <Card className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl">
                  Question {currentQuestionIndex + 1}
                </CardTitle>
                <Badge variant="outline" className="bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400">
                  {currentQuestion.points || 0} point{currentQuestion.points !== 1 ? 's' : ''}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {currentQuestion.title && (
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                  {currentQuestion.title}
                </h3>
              )}
              <div className="prose dark:prose-invert max-w-none">
                <p className="text-slate-700 dark:text-slate-300 whitespace-pre-wrap">
                  {currentQuestion.text || currentQuestion.question}
                </p>
              </div>
              {/* Afficher codeSnippet seulement s'il existe et n'est pas vide */}
              {currentQuestion.codeSnippet && currentQuestion.codeSnippet.trim() !== '' && (
                <div className="bg-slate-900 dark:bg-slate-950 p-4 rounded-lg border border-slate-700">
                  <div className="flex items-center gap-2 mb-2">
                    <Code className="h-4 w-4 text-emerald-400" />
                    <span className="text-xs text-emerald-400 font-medium">Contexte / Template fourni</span>
                  </div>
                  <pre className="text-emerald-400 font-mono text-sm overflow-x-auto">
                    <code>{currentQuestion.codeSnippet}</code>
                  </pre>
                </div>
              )}
              {currentQuestion.examples && Array.isArray(currentQuestion.examples) && currentQuestion.examples.length > 0 && (
                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
                  <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">Exemples / Cas d'usage:</h4>
                  {currentQuestion.examples.map((example: any, exIdx: number) => (
                    <div key={exIdx} className="mb-2 text-sm">
                      {example.input && (
                        <>
                          <span className="font-medium text-blue-800 dark:text-blue-200">Contexte:</span> {example.input}<br />
                        </>
                      )}
                      {example.output && (
                        <>
                          <span className="font-medium text-blue-800 dark:text-blue-200">Résultat attendu:</span> {example.output}
                        </>
                      )}
                      {!example.input && !example.output && (
                        <span className="text-blue-700 dark:text-blue-300">{JSON.stringify(example)}</span>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Zone de réponse textuelle pour domaines non-techniques - affichée sous chaque question */}
              {!requiresCodeEditor && (
                <div className="pt-4 border-t border-slate-200 dark:border-slate-700 space-y-2">
                  <Label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    Votre réponse
                  </Label>
                  <Textarea
                    value={currentAnswerDraft}
                    onChange={(e) => handleTextAnswerChange(e.target.value)}
                    placeholder={`Rédigez votre réponse pour cette question...`}
                    className="min-h-[150px] resize-y bg-white dark:bg-slate-900"
                  />
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Vous pouvez également téléverser une vidéo ou des images en complément à la fin du test (optionnel).
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Navigation entre questions */}
          <div className="flex justify-between items-center gap-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4">
              <Button
              variant="outline"
                onClick={handlePreviousQuestion}
                disabled={currentQuestionIndex === 0}
              className="flex items-center gap-2"
              >
                <ChevronLeft className="h-4 w-4" />
              Précédent
              </Button>
            <div className="text-sm text-slate-600 dark:text-slate-400">
                {currentQuestionIndex + 1} / {questions.length}
            </div>
            {!isLastQuestion ? (
              <Button
                onClick={handleNextQuestion}
                className="bg-emerald-600 hover:bg-emerald-700 text-white flex items-center gap-2"
              >
                Suivant
                <ChevronRight className="h-4 w-4" />
              </Button>
            ) : (
            <Button 
                onClick={generatePDF}
              variant="outline" 
                className="flex items-center gap-2"
              >
                <Download className="h-4 w-4" />
                Télécharger PDF
              </Button>
            )}
          </div>

          {/* Section de soumission - seulement sur la dernière question */}
          {isLastQuestion && (
            <div className="space-y-6">
              {/* Choix du type de soumission - Layout fixe pour éviter le tremblement */}
              <Card className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    {requiresCodeEditor ? "Soumettre votre travail" : "Preuves supplémentaires (optionnel)"}
                  </CardTitle>
                  <CardDescription>
                    {requiresCodeEditor ? (
                      quiz.domain === 'DESIGN' || quiz.domain === 'MARKETING' || quiz.domain === 'COMMUNICATION' 
                        ? "Téléversez une vidéo ou un catalogue d'images présentant votre travail/projet"
                        : quiz.domain === 'DATA_SCIENCE' || quiz.domain === 'MACHINE_LEARNING' || quiz.domain === 'FINANCE' || quiz.domain === 'BUSINESS'
                        ? "Téléversez une vidéo ou un catalogue d'images présentant vos analyses, résultats ou tableaux de bord"
                        : quiz.domain === 'ENGINEERING' || quiz.domain === 'ARCHITECTURE'
                        ? "Téléversez une vidéo ou un catalogue d'images présentant vos calculs, schémas ou documentation"
                        : "Téléversez une vidéo ou un catalogue d'images comme preuve de votre travail"
                    ) : (
                      "Vous pouvez téléverser une vidéo ou un catalogue d'images en complément de vos réponses textuelles (optionnel)"
                    )}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Button
                      onClick={handleVideoUpload}
                      variant={submissionType === "video" ? "default" : "outline"}
                      className={cn(
                        "h-auto py-4 flex flex-col items-center gap-2 transition-all",
                        submissionType === "video" && "bg-emerald-600 hover:bg-emerald-700 text-white"
                      )}
                    >
                      <Video className="h-6 w-6" />
                      <span>Vidéo</span>
                    </Button>
                    <Button
                      onClick={handleImagesUpload}
                      variant={submissionType === "images" ? "default" : "outline"}
                      className={cn(
                        "h-auto py-4 flex flex-col items-center gap-2 transition-all",
                        submissionType === "images" && "bg-emerald-600 hover:bg-emerald-700 text-white"
                      )}
                    >
                      <FileText className="h-6 w-6" />
                      <span>Catalogue d'images</span>
                    </Button>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Après sélection, vos fichiers seront listés ci-dessous pour vérification avant envoi.
                  </p>
                </CardContent>
              </Card>

              {/* Container fixe pour éviter le layout shift */}
              <div className="min-h-[200px]">
                {/* Aperçu vidéo */}
                {videoUrl && (
                  <Card className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 mb-6">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="flex items-center gap-2">
                          <Video className="h-5 w-5" />
                          Vidéo téléversée
                        </CardTitle>
                        <Button
                          onClick={() => {
                            setVideoUrl("");
                            setSubmissionType(null);
                          }}
                          variant="ghost"
                          size="sm"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg border border-emerald-200 dark:border-emerald-800">
                        <video
                          src={videoUrl}
                          controls
                          className="w-full rounded-lg max-h-96"
                        >
                          Votre navigateur ne supporte pas la lecture de vidéos.
                        </video>
                    </div>
                    </CardContent>
                  </Card>
                )}

                {/* Aperçu images */}
                {imageUrls.length > 0 && (
                  <Card className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 mb-6">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="flex items-center gap-2">
                          <FileText className="h-5 w-5" />
                          Images téléversées ({imageUrls.length})
                        </CardTitle>
                        <Button
                          onClick={handleImagesUpload}
                          variant="outline"
                          size="sm"
                        >
                          <Upload className="h-4 w-4 mr-2" />
                          Ajouter
                        </Button>
              </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                        {imageUrls.map((url, index) => (
                          <div key={index} className="relative group">
                            <img
                              src={url}
                              alt={`Preuve ${index + 1}`}
                              className="w-full h-32 object-cover rounded-lg border border-slate-200 dark:border-slate-700"
                            />
                  <Button
                              onClick={() => removeImage(index)}
                              variant="destructive"
                    size="sm"
                              className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
        </div>

              {/* Bouton de soumission - Sticky en bas */}
              <div className="sticky bottom-0 bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-lg -mx-4 sm:-mx-6">
                <div className="flex justify-end gap-3">
                  <Button
                    onClick={handleSubmit}
                    disabled={
                      requiresCodeEditor 
                        ? (!videoUrl && imageUrls.length === 0)
                        : (!hasTextAnswer && !videoUrl && imageUrls.length === 0)
                    }
                    className="bg-emerald-600 hover:bg-emerald-700 text-white"
                    size="lg"
                  >
                    <CheckCircle2 className="h-4 w-4 mr-2" />
                    Soumettre le test
                  </Button>
            </div>
              </div>
          </div>
        )}
        </div>
      </div>
    );
  };

  // Rendu du test en cours
  if (isTestRunning && currentQuiz) {
    const getTestComponent = () => {
      switch (currentQuiz.type) {
        case QuizType.QCM:
          return <QCMTest quiz={currentQuiz} />;
        case QuizType.MOCK_INTERVIEW:
          return <MockInterviewTest quiz={currentQuiz} />;
        case QuizType.SOFT_SKILLS:
          return <SoftSkillsTest quiz={currentQuiz} />;
        case QuizType.TECHNICAL:
          return <TechnicalTest quiz={currentQuiz} />;
        default:
          return (
            <div className="text-center py-12">
              <AlertTriangle className="h-12 w-12 text-orange-500 mx-auto mb-4" />
              <p className="text-lg font-medium">Type de test non supporté</p>
            </div>
          );
      }
    };

    const getTestIcon = (type: QuizType) => {
      switch (type) {
        case QuizType.QCM: return <FileText className="h-5 w-5" />;
        case QuizType.MOCK_INTERVIEW: return <Users className="h-5 w-5" />;
        case QuizType.SOFT_SKILLS: return <MessageSquare className="h-5 w-5" />;
        case QuizType.TECHNICAL: return <Code className="h-5 w-5" />;
        default: return <Rocket className="h-5 w-5" />;
      }
    };

    // Layout spécial pour TECHNICAL (plein écran LeetCode style)
    if (currentQuiz.type === QuizType.TECHNICAL) {
      return (
        <div className="fixed inset-0 bg-gradient-to-b dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 from-slate-50 via-emerald-50 to-slate-100 z-50 overflow-hidden">
          <div className="h-full flex flex-col">
            {/* Header avec navigation */}
            <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-700 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm flex-shrink-0">
              <div className="flex items-center gap-4">
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => router.push("/jobs")}
                  className="flex items-center gap-2 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors rounded-lg"
                >
                  <ArrowLeft className="h-4 w-4" />
                  <span>Retour aux jobs</span>
                </Button>
                <div className="h-6 w-px bg-slate-300 dark:bg-slate-600"></div>
                <div>
                  <h1 className="text-lg font-bold text-slate-900 dark:text-white line-clamp-1">
                    {currentQuiz.title}
                  </h1>
                  <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-1">
                    {currentQuiz.description}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-300">
                  <Clock className="h-4 w-4" />
                  {formatTime(timeLeft)}
                </div>
                <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg">
                  {getTestIcon(currentQuiz.type)}
                </div>
              </div>
            </div>
            
            {/* Contenu du test - scrollable */}
            <div className="flex-1 overflow-y-auto">
              {getTestComponent()}
            </div>
          </div>
        </div>
      );
    }

    if (currentQuiz.type === QuizType.MOCK_INTERVIEW) {
      return getTestComponent();
    }

    // Layout normal pour les autres types de tests
    return (
      <div className="min-h-screen bg-gradient-to-b dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 from-slate-50 via-emerald-50 to-slate-100 p-4 sm:p-6">
        <div className="max-w-4xl mx-auto">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6 sm:mb-8">
            <div className="flex items-center gap-3">
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => {
                  setCurrentQuiz(null);
                  setIsTestRunning(false);
                  setSelectedAnswer(null);
                }}
                className="flex items-center gap-2 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors rounded-lg"
              >
                <ArrowLeft className="h-4 w-4" />
                <span className="hidden sm:inline">Retour</span>
              </Button>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white line-clamp-2">
                  {currentQuiz.title}
                </h1>
                <p className="text-sm text-slate-600 dark:text-slate-400 mt-1 line-clamp-2">
                  {currentQuiz.description}
                </p>
              </div>
            </div>
            <div className="text-center sm:text-right">
              <div className="flex items-center gap-2 text-lg font-semibold text-slate-700 dark:text-slate-300 justify-center sm:justify-end">
                <Clock className="h-4 w-4 sm:h-5 sm:w-5" />
                {formatTime(timeLeft)}
              </div>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
                Temps restant
              </p>
            </div>
          </div>

          <Card className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-lg">
            <CardHeader className="flex flex-row items-center gap-3 pb-4 border-b border-slate-200 dark:border-slate-700">
              <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg">
                {getTestIcon(currentQuiz.type)}
              </div>
              <CardTitle className="text-lg sm:text-xl capitalize text-slate-900 dark:text-white">
                {currentQuiz.type.replace('_', ' ').toLowerCase()}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 sm:p-6">
              {getTestComponent()}
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Rendu principal de la liste des tests
  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 p-4 sm:p-6">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8 sm:mb-12">
          <div className="inline-flex items-center gap-2 bg-white dark:bg-slate-800 px-4 py-2 rounded-full border border-slate-300 dark:border-slate-600 mb-4">
            <Building className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
              Tests techniques
            </span>
          </div>
          
          <h1 className="text-3xl sm:text-5xl font-bold text-slate-900 dark:text-white mb-4">
            Évaluation des compétences
          </h1>
          
          <p className="text-base sm:text-lg text-slate-600 dark:text-slate-400 max-w-3xl mx-auto mt-4 px-2 leading-relaxed">
            Complétez les tests techniques pour finaliser votre candidature. 
            Chaque test évalue des compétences spécifiques requises pour le poste.
          </p>
        </div>

        {/* Vérification si l'utilisateur a déjà postulé */}
        {!loadingApplied && hasApplied && (
          <Card className="border border-amber-300 dark:border-amber-700 bg-amber-50 dark:bg-amber-900/20 mb-6">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <AlertTriangle className="h-6 w-6 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-1" />
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-amber-900 dark:text-amber-100 mb-2">
                    Tests techniques non disponibles
                  </h3>
                  <p className="text-amber-800 dark:text-amber-200 mb-4">
                    Vous avez déjà postulé à cette offre d'emploi. Vous ne pouvez plus passer les tests techniques pour cette candidature. Vous serez redirigé vers votre tableau de bord dans quelques instants où vous pourrez visualiser vos scores et le statut de votre candidature.
                  </p>
                  <div className="flex items-center gap-2 text-sm text-amber-700 dark:text-amber-300">
                    <Clock className="h-4 w-4" />
                    <span>Redirection automatique en cours...</span>
                  </div>
                  <Button 
                    variant="outline" 
                    onClick={() => router.push("/")}
                    className="mt-4 border-amber-300 dark:border-amber-700 text-amber-700 dark:text-amber-300 hover:bg-amber-100 dark:hover:bg-amber-900/40"
                  >
                    Aller au tableau de bord maintenant
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Loading State */}
        {(loadingQuizzes || loadingApplied) && <QuizSkeleton />}

        {/* Tests List */}
        {!loadingQuizzes && !loadingApplied && !quizzesError && !hasApplied && (
          <div className="grid gap-6 sm:gap-8">
            {quizzes.length === 0 ? (
              <Card className="text-center py-16 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-lg">
                <CardContent className="p-8">
                  <AlertTriangle className="h-16 w-16 text-orange-500 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold mb-3 text-slate-900 dark:text-slate-100">Aucun test disponible</h3>
                  <p className="text-slate-600 dark:text-slate-400 mb-6 text-lg">
                    Aucun test technique n'est actuellement disponible pour ce poste.
                  </p>
                  <div className="space-y-3 text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto">
                    <div className="flex items-center gap-2 justify-center">
                      <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                      <span>Vérifiez que le job existe bien</span>
                    </div>
                    <div className="flex items-center gap-2 justify-center">
                      <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                      <span>Vérifiez que des quizzes sont associés à ce job</span>
                    </div>
                    <div className="flex items-center gap-2 justify-center">
                      <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                      <span>Contactez l'administrateur si le problème persiste</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ) : (
              quizzes.map((quiz: any) => {
                const isCompleted = isQuizCompleted(quiz);
                const userResult = getUserQuizResult(quiz);

                const getQuizIcon = (type: QuizType) => {
                  switch (type) {
                    case QuizType.QCM: 
                      return <FileText className="h-5 w-5 sm:h-6 sm:w-6 text-emerald-600 dark:text-emerald-400" />;
                    case QuizType.MOCK_INTERVIEW: 
                      return <Users className="h-5 w-5 sm:h-6 sm:w-6 text-emerald-600 dark:text-emerald-400" />;
                    case QuizType.SOFT_SKILLS: 
                      return <MessageSquare className="h-5 w-5 sm:h-6 sm:w-6 text-emerald-600 dark:text-emerald-400" />;
                    case QuizType.TECHNICAL: 
                      return <Code className="h-5 w-5 sm:h-6 sm:w-6 text-emerald-600 dark:text-emerald-400" />;
                    default: 
                      return <Rocket className="h-5 w-5 sm:h-6 sm:w-6 text-emerald-600 dark:text-emerald-400" />;
                  }
                };

                const getDifficultyColor = (difficulty: Difficulty) => {
                  switch (difficulty) {
                    case Difficulty.JUNIOR: return "bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-600";
                    case Difficulty.MID: return "bg-orange-100 text-orange-800 border-orange-300 dark:bg-orange-900/30 dark:text-orange-400 dark:border-orange-600";
                    case Difficulty.SENIOR: return "bg-red-100 text-red-800 border-red-300 dark:bg-red-900/30 dark:text-red-400 dark:border-red-600";
                    default: return "bg-slate-100 text-slate-800 border-slate-300 dark:bg-slate-900/30 dark:text-slate-400 dark:border-slate-600";
                  }
                };

                return (
                  <Card 
                    key={quiz.id} 
                    className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-lg hover:shadow-xl transition-all duration-300"
                  >
                    <CardContent className="p-4 sm:p-6">
                      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 sm:gap-6">
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                            <div className="flex items-start gap-4">
                              <div className="p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl border border-emerald-200 dark:border-emerald-800">
                                {getQuizIcon(quiz.type)}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex flex-col sm:flex-row sm:items-center sm:gap-3 mb-2">
                                  <h3 className="text-lg sm:text-xl font-semibold text-slate-900 dark:text-white line-clamp-2">
                                    {quiz.title}
                                  </h3>
                                  <div className="flex flex-wrap gap-2 mt-2 sm:mt-0">
                                    <Badge 
                                      variant="outline" 
                                      className={cn("capitalize", getDifficultyColor(quiz.difficulty))}
                                    >
                                      {quiz.difficulty?.toLowerCase() || "non spécifié"}
                                    </Badge>
                                    <Badge variant="outline" className="bg-slate-100 text-slate-700 border-slate-300 dark:bg-slate-900/30 dark:text-slate-400 dark:border-slate-600">
                                      {quiz.duration} min
                                    </Badge>
                                    {isCompleted && (
                                      <Badge className="bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-600">
                                        <CheckCircle2 className="h-3 w-3 mr-1" />
                                        Complété
                                      </Badge>
                                    )}
                                  </div>
                                </div>
                                
                                <p className="text-slate-600 dark:text-slate-400 mb-3 line-clamp-2 leading-relaxed">
                                  {quiz.description}
                                </p>
                                
                                <div className="flex flex-wrap gap-4 text-sm text-slate-500 dark:text-slate-400">
                                  <div className="flex items-center gap-1.5">
                                    <Clock className="h-4 w-4" />
                                    <span>{quiz.duration} minutes</span>
                                  </div>
                                  <div className="flex items-center gap-1.5">
                                    <FileText className="h-4 w-4" />
                                    <span className="capitalize">{quiz.type.replace('_', ' ')}</span>
                                  </div>
                                  {isCompleted && userResult && (
                                    <div className="flex items-center gap-1.5">
                                      <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                                      <span className="text-emerald-600 dark:text-emerald-400 font-medium">
                                        Score: {userResult.score}%
                                      </span>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        <div className="lg:w-48 flex-shrink-0">
                          {isCompleted ? (
                            <div className="text-center space-y-2">
                              <div className="flex items-center justify-center gap-2 text-emerald-600 dark:text-emerald-400">
                                <CheckCircle2 className="h-5 w-5" />
                                <span className="font-medium">Terminé</span>
                              </div>
                              {userResult && (
                                <div className="text-sm text-slate-600 dark:text-slate-400">
                                  Score: <span className="font-semibold">{userResult.score}%</span>
                                </div>
                              )}
                              <Button 
                                variant="outline" 
                                size="sm" 
                                onClick={() => startTest(quiz)}
                                className="w-full border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700"
                              >
                                <RefreshCw className="h-4 w-4 mr-2" />
                                Recommencer
                              </Button>
                            </div>
                          ) : (
                            <Button 
                              onClick={() => startTest(quiz)}
                              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg hover:shadow-xl transition-all duration-300"
                              size="lg"
                            >
                              <Play className="h-4 w-4 mr-2" />
                              Commencer
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })
            )}
          </div>
        )}

        {/* Error State */}
        {quizzesError && (
          <Card className="text-center py-16 bg-white dark:bg-slate-800 border border-red-300 dark:border-red-800 shadow-lg">
            <CardContent className="p-8">
              <XCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-3 text-slate-900 dark:text-slate-100">Erreur de chargement</h3>
              <p className="text-slate-600 dark:text-slate-400 mb-6 text-lg">
                Impossible de charger les tests techniques.
              </p>
              <Button 
                onClick={() => refetchQuizzes()}
                variant="outline"
                className="border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Réessayer
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}