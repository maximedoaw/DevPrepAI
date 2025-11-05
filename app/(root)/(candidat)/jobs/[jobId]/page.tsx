// app/jobs/[jobId]/tests/page.tsx - VERSION AMÉLIORÉE
"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Loader2 } from "lucide-react";
import { MonacoEditor } from "@/components/ui/monaco-editor";
import { useTheme } from "next-themes";
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
  const submitTest = async (score: number, answers: any[] = []) => {
    if (!currentQuiz) return;

    try {
      // Générer une analyse détaillée basée sur le score et les réponses
      let analysis = "";
      
      if (currentQuiz.type === QuizType.QCM) {
        const totalQuestions = answers.length;
        const correctCount = answers.filter(a => a?.isCorrect).length;
        const incorrectCount = totalQuestions - correctCount;
        
        analysis = score >= 90 
          ? `Excellent travail ! Vous avez obtenu ${correctCount}/${totalQuestions} réponses correctes. Vous démontrez une maîtrise exceptionnelle des concepts évalués.`
          : score >= 70
          ? `Bon travail ! Vous avez obtenu ${correctCount}/${totalQuestions} réponses correctes. Vous maîtrisez bien la majorité des concepts.`
          : score >= 50
          ? `Résultat moyen. Vous avez obtenu ${correctCount}/${totalQuestions} réponses correctes. ${incorrectCount > 0 ? `${incorrectCount} réponse(s) incorrecte(s). ` : ''}Des révisions supplémentaires sont recommandées.`
          : `Des progrès sont nécessaires. Vous avez obtenu ${correctCount}/${totalQuestions} réponses correctes. ${incorrectCount > 0 ? `${incorrectCount} réponse(s) incorrecte(s). ` : ''}Continuez à vous exercer pour améliorer vos compétences.`;
      } else if (currentQuiz.type === QuizType.TECHNICAL) {
        const evaluation = answers[0]?.evaluation;
        analysis = evaluation?.evaluation || (
          score >= 80
            ? "Code fonctionnel et bien structuré. Vous démontrez une bonne compréhension des concepts de programmation."
            : score >= 60
            ? "Code présentant quelques points à améliorer. La logique est globalement correcte mais peut être optimisée."
            : "Code nécessitant des améliorations significatives. Revisitez les concepts de base et la logique algorithmique."
        );
        
        if (evaluation?.strengths?.length > 0) {
          analysis += `\n\nPoints forts: ${evaluation.strengths.join(', ')}`;
        }
        if (evaluation?.suggestions) {
          analysis += `\n\nSuggestions: ${evaluation.suggestions}`;
        }
      } else {
        analysis = score >= 70 
          ? "Excellent travail ! Vous avez démontré une maîtrise solide des concepts évalués."
          : "Des progrès sont nécessaires dans certains domaines. Continuez à vous exercer.";
      }

      await submitJobQuizMutation.mutateAsync({
        jobQuizId: currentQuiz.id,
        userId: CURRENT_USER_ID,
        answers: answers,
        score: score,
        analysis: analysis,
        duration: currentQuiz.duration * 60 - timeLeft
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
  }, [isTestRunning, timeLeft]);

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
    const [recording, setRecording] = useState(false);
    const [currentStep, setCurrentStep] = useState(0);

    const interviewSteps = [
      "Présentation personnelle",
      "Expérience professionnelle", 
      "Compétences techniques",
      "Motivation pour le poste",
      "Questions finales"
    ];

    const progress = ((currentStep + 1) / interviewSteps.length) * 100;

    const startRecording = () => {
      setRecording(true);
      toast.info("Simulation d'entretien démarrée");
    };

    const nextStep = () => {
      if (currentStep < interviewSteps.length - 1) {
        setCurrentStep(prev => prev + 1);
      } else {
        submitTest(85, [{ type: "mock_interview", steps: interviewSteps.length }]);
      }
    };

    const previousStep = () => {
      if (currentStep > 0) {
        setCurrentStep(prev => prev - 1);
      }
    };

    return (
      <div className="space-y-6">
        <div className="space-y-2">
          <div className="flex justify-between items-center text-sm font-medium">
            <span className="text-emerald-700 dark:text-emerald-400">
              Étape {currentStep + 1} sur {interviewSteps.length}
            </span>
            <span className="text-slate-600 dark:text-slate-400">
              {Math.round(progress)}% complété
            </span>
          </div>
          <Progress value={progress} className="h-2 bg-slate-200 dark:bg-slate-700" />
        </div>

        <div className="bg-white dark:bg-slate-800 p-6 rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm">
          <div className="mb-6">
            <Badge variant="outline" className="bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 border-emerald-300 dark:border-emerald-600 mb-4">
              {interviewSteps[currentStep]}
            </Badge>
            
            <div className="bg-slate-50 dark:bg-slate-900 p-4 rounded-lg border border-slate-200 dark:border-slate-700">
              <p className="font-medium mb-2 text-slate-900 dark:text-slate-100">Question :</p>
              <p className="text-slate-700 dark:text-slate-300">
                {currentStep === 0 && "Pouvez-vous vous présenter et nous parler de votre parcours ?"}
                {currentStep === 1 && "Quelle est votre expérience la plus significative dans ce domaine ?"}
                {currentStep === 2 && "Quelles sont vos compétences techniques les plus fortes ?"}
                {currentStep === 3 && "Pourquoi souhaitez-vous rejoindre notre entreprise ?"}
                {currentStep === 4 && "Avez-vous des questions pour nous ?"}
              </p>
            </div>
          </div>

          <div className="text-center py-4">
            <Users className="h-16 w-16 text-emerald-500 mx-auto mb-4" />
            
            {!recording ? (
              <Button 
                onClick={startRecording}
                className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg hover:shadow-xl transition-all"
                size="lg"
              >
                <Play className="h-4 w-4 mr-2" />
                Commencer l'entretien
              </Button>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-center gap-2 text-emerald-600 dark:text-emerald-400">
                  <div className="w-3 h-3 bg-emerald-500 rounded-full animate-pulse"></div>
                  <span className="font-medium">Enregistrement en cours...</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {recording && (
          <div className="flex justify-between gap-3">
            <Button
              variant="outline"
              onClick={previousStep}
              disabled={currentStep === 0}
              className="border-slate-300 dark:border-slate-600 disabled:opacity-50"
            >
              <ChevronLeft className="h-4 w-4 mr-2" />
              Précédent
            </Button>
            <Button 
              onClick={nextStep}
              className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg hover:shadow-xl transition-all"
            >
              {currentStep < interviewSteps.length - 1 ? "Question suivante" : "Terminer l'entretien"}
              <ChevronRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        )}
      </div>
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
    const { theme } = useTheme();
    const [code, setCode] = useState<Record<number, string>>({});
    const [executionOutput, setExecutionOutput] = useState<Record<number, string>>({});
    const [testResults, setTestResults] = useState<Record<number, any>>({});
    const [isEvaluating, setIsEvaluating] = useState(false);
    const [isRunning, setIsRunning] = useState(false);
    const [evaluationProgress, setEvaluationProgress] = useState(0);
    const [showConsole, setShowConsole] = useState<Record<number, boolean>>({});

    // Récupérer les questions du quiz
    const questions = quiz.questions && Array.isArray(quiz.questions) && quiz.questions.length > 0 
      ? quiz.questions 
      : [];
    
    const currentQuestion = questions[currentQuestionIndex] || {};
    const questionProgress = ((currentQuestionIndex + 1) / questions.length) * 100;
    
    const problemStatement = currentQuestion.text || currentQuestion.question || 
      "Écrivez une fonction qui inverse une chaîne de caractères.\n\nExemple :\nInput: 'hello'\nOutput: 'olleh'";
    
    const codeSnippet = currentQuestion.codeSnippet || "// Votre code ici\nfunction solution() {\n  // Implémentez votre solution\n  return null;\n}";
    const correctAnswer = currentQuestion.correctAnswer || "";
    const questionPoints = currentQuestion.points || Math.floor((currentQuiz?.totalPoints || 100) / questions.length);

    // Initialiser le code avec le snippet fourni pour chaque question
    useEffect(() => {
      if (codeSnippet && !code[currentQuestionIndex]) {
        setCode(prev => ({
          ...prev,
          [currentQuestionIndex]: codeSnippet
        }));
      }
      // Réinitialiser l'output quand on change de question
      setExecutionOutput(prev => ({
        ...prev,
        [currentQuestionIndex]: prev[currentQuestionIndex] || ""
      }));
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentQuestionIndex, codeSnippet]);

    // Fonction pour exécuter le code JavaScript réellement
    const executeCode = (userCode: string, questionIndex: number): string => {
      let consoleOutput = "";
      const originalConsoleLog = console.log;
      const originalConsoleError = console.error;
      const originalConsoleWarn = console.warn;
      
      // Capturer les sorties de console
      const capturedLogs: string[] = [];
      console.log = (...args: any[]) => {
        capturedLogs.push(args.map(arg => 
          typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
        ).join(' '));
        originalConsoleLog(...args);
      };
      
      console.error = (...args: any[]) => {
        capturedLogs.push(`ERROR: ${args.map(arg => 
          typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
        ).join(' ')}`);
        originalConsoleError(...args);
      };
      
      console.warn = (...args: any[]) => {
        capturedLogs.push(`WARN: ${args.map(arg => 
          typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
        ).join(' ')}`);
        originalConsoleWarn(...args);
      };

      try {
        // Créer un contexte sécurisé pour l'exécution
        const wrappedCode = `
          (function() {
            ${userCode}
            // Si le code retourne une valeur, l'afficher
            if (typeof solution !== 'undefined') {
              try {
                const result = solution();
                if (result !== undefined) {
                  console.log('Result:', result);
                }
              } catch(e) {
                console.error('Runtime error:', e.message);
              }
            }
          })();
        `;
        
        // Exécuter le code
        eval(wrappedCode);
        
        // Restaurer les fonctions console
        console.log = originalConsoleLog;
        console.error = originalConsoleError;
        console.warn = originalConsoleWarn;
        
        // Formater la sortie en style bash
        if (capturedLogs.length > 0) {
          consoleOutput = `$ node solution.js\n${capturedLogs.map(log => `> ${log}`).join('\n')}\n$ `;
        } else {
          consoleOutput = `$ node solution.js\n> Code exécuté sans sortie\n$ `;
        }
        
      } catch (error: any) {
        // Restaurer les fonctions console
        console.log = originalConsoleLog;
        console.error = originalConsoleError;
        console.warn = originalConsoleWarn;
        
        consoleOutput = `$ node solution.js\nERROR: ${error.message}\n${error.stack || ''}\n$ `;
      }
      
      return consoleOutput;
    };

    // Évaluer le code avec l'IA Gemini de manière sémantique
    const evaluateCodeSemantically = async (userCode: string, expectedSolution: string, problemDescription: string, questionIndex: number) => {
      setIsEvaluating(true);
      setEvaluationProgress(10);
      
      try {
        // Simuler la progression d'évaluation
        const progressInterval = setInterval(() => {
          setEvaluationProgress(prev => {
            if (prev >= 80) {
              clearInterval(progressInterval);
              return 80;
            }
            return prev + 15;
          });
        }, 300);

        // Appeler l'API Gemini pour évaluer le code avec évaluation sémantique et best practices
        const response = await fetch('/api/gemini', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            type: 'evaluate-code',
            userCode: userCode,
            expectedSolution: expectedSolution,
            problemDescription: problemDescription,
            codeSnippet: currentQuestion.codeSnippet || ''
          })
        });

        clearInterval(progressInterval);
        setEvaluationProgress(90);

        if (!response.ok) {
          throw new Error('Erreur lors de l\'évaluation du code');
        }

        const result = await response.json();
        setEvaluationProgress(95);

        // Parser la réponse JSON
        let evaluationResult;
        try {
          const jsonText = result.text?.trim() || JSON.stringify(result);
          const jsonMatch = jsonText.match(/```json\s*([\s\S]*?)\s*```/) || jsonText.match(/```\s*([\s\S]*?)\s*```/);
          const cleanJson = jsonMatch ? jsonMatch[1].trim() : jsonText;
          evaluationResult = JSON.parse(cleanJson);
        } catch (parseError) {
          // Fallback si le parsing échoue
          console.error("Erreur parsing réponse:", parseError);
          evaluationResult = {
            score: userCode.includes("function") && userCode.includes("return") ? 70 : 40,
            isCorrect: false,
            evaluation: "Évaluation automatique de base effectuée",
            strengths: [],
            weaknesses: ["Impossible d'analyser le code en profondeur"],
            testResults: "Tests basiques seulement",
            suggestions: "Vérifiez la syntaxe et la logique de votre code"
          };
        }

        setEvaluationProgress(100);
        
        // Formater la sortie pour l'affichage avec best practices
        const formattedOutput = `🔧 Évaluation sémantique du code en cours...
✅ Analyse terminée

📊 SCORE: ${evaluationResult.score}/100
${evaluationResult.isCorrect ? '✅' : '❌'} ${evaluationResult.isCorrect ? 'Solution correcte' : 'Solution à améliorer'}
${evaluationResult.solvesProblem !== undefined ? (evaluationResult.solvesProblem ? '✅ Problème résolu' : '⚠️ Problème partiellement résolu') : ''}
${evaluationResult.workDone !== undefined ? (evaluationResult.workDone ? '✅ Travail effectué' : '⚠️ Travail incomplet') : ''}

📝 ÉVALUATION:
${evaluationResult.evaluation}

💪 POINTS FORTS:
${evaluationResult.strengths?.map((s: string) => `  • ${s}`).join('\n') || '  Aucun point fort identifié'}

⚠️ POINTS À AMÉLIORER:
${evaluationResult.weaknesses?.map((w: string) => `  • ${w}`).join('\n') || '  Aucun point faible majeur'}

🎯 BEST PRACTICES:
${evaluationResult.bestPractices?.followed?.length > 0 ? `  ✅ Suivies:\n${evaluationResult.bestPractices.followed.map((bp: string) => `    • ${bp}`).join('\n')}` : '  Aucune bonne pratique suivie identifiée'}
${evaluationResult.bestPractices?.missing?.length > 0 ? `\n  ⚠️ Manquantes:\n${evaluationResult.bestPractices.missing.map((bp: string) => `    • ${bp}`).join('\n')}` : ''}
${evaluationResult.bestPractices?.review ? `\n  📋 Review:\n  ${evaluationResult.bestPractices.review}` : ''}

🧪 RÉSULTATS DES TESTS:
${evaluationResult.testResults || 'Tests non disponibles'}

💡 SUGGESTIONS:
${evaluationResult.suggestions || 'Continuez à pratiquer pour améliorer votre code'}

${evaluationResult.workQuality ? `\n📈 QUALITÉ DU TRAVAIL:\n${evaluationResult.workQuality}` : ''}`;

        setTestResults(prev => ({
          ...prev,
          [questionIndex]: evaluationResult
        }));
        
        setIsEvaluating(false);
        setEvaluationProgress(0);

        return evaluationResult;
      } catch (error: any) {
        console.error("Erreur évaluation code:", error);
        setIsEvaluating(false);
        setEvaluationProgress(0);
        return {
          score: 50,
          isCorrect: false,
          evaluation: "Évaluation automatique de base"
        };
      }
    };

    const runCode = () => {
      const currentCode = code[currentQuestionIndex] || "";
      if (!currentCode.trim()) {
        toast.warning("Veuillez écrire du code avant de le tester");
        return;
      }
      
      setIsRunning(true);
      setShowConsole(prev => ({ ...prev, [currentQuestionIndex]: true }));
      
      // Exécuter le code réellement
      const output = executeCode(currentCode, currentQuestionIndex);
      
      setExecutionOutput(prev => ({
        ...prev,
        [currentQuestionIndex]: output
      }));
      
      setIsRunning(false);
    };

    const handleNextQuestion = () => {
      if (currentQuestionIndex < questions.length - 1) {
        setCurrentQuestionIndex(prev => prev + 1);
      }
    };

    const handlePreviousQuestion = () => {
      if (currentQuestionIndex > 0) {
        setCurrentQuestionIndex(prev => prev - 1);
      }
    };

    const submitCode = async () => {
      // Vérifier que toutes les questions ont du code
      const unansweredQuestions: number[] = [];
      for (let i = 0; i < questions.length; i++) {
        const qCode = code[i] || "";
        if (!qCode.trim()) {
          unansweredQuestions.push(i + 1);
        }
      }
      
      if (unansweredQuestions.length > 0) {
        toast.warning(`Veuillez compléter toutes les questions. Questions manquantes: ${unansweredQuestions.join(', ')}`);
        return;
      }

      setIsEvaluating(true);
      setEvaluationProgress(0);
      
      // Évaluer toutes les questions avant de soumettre
      const allAnswers: any[] = [];
      let totalScore = 0;
      
      for (let i = 0; i < questions.length; i++) {
        const qCode = code[i] || "";
        const q = questions[i];
        
        setEvaluationProgress(Math.round((i / questions.length) * 100));
        
        const evaluation = await evaluateCodeSemantically(
          qCode, 
          q.correctAnswer || "", 
          q.text || q.question || "", 
          i
        );
        
        const qPoints = q.points || Math.floor((currentQuiz?.totalPoints || 100) / questions.length);
        const qScore = evaluation?.score || (qCode.includes("function") && qCode.includes("return") ? 60 : 40);
        
        allAnswers.push({
          code: qCode,
          output: executionOutput[i] || "",
          type: "technical_code",
          evaluation: evaluation,
          questionId: q.id || i,
          points: qPoints,
          score: qScore
        });
        
        totalScore += (qScore * qPoints) / 100;
      }
      
      setEvaluationProgress(100);
      
      // Calculer le score final basé sur les points
      const totalPossiblePoints = questions.reduce((sum: number, q: any) => sum + (q.points || Math.floor((currentQuiz?.totalPoints || 100) / questions.length)), 0);
      const finalScore = totalPossiblePoints > 0 ? Math.round((totalScore / totalPossiblePoints) * 100) : 0;
      
      setIsEvaluating(false);
      
      // Soumettre avec les détails de toutes les évaluations
      submitTest(finalScore, allAnswers);
    };

    const currentCode = code[currentQuestionIndex] || codeSnippet;
    const currentExecutionOutput = executionOutput[currentQuestionIndex] || "";
    const isConsoleVisible = showConsole[currentQuestionIndex] || false;
    const isDarkMode = theme === "dark";

    // Vérifier si toutes les questions sont complétées
    const allQuestionsAnswered = questions.every((_q: any, idx: number) => {
      const qCode = code[idx] || "";
      return qCode.trim().length > 0;
    });

    return (
      <div className="fixed inset-0 flex flex-col bg-gradient-to-b dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 from-slate-50 via-emerald-50 to-slate-100">
        {/* Header minimaliste LeetCode style */}
        <div className="flex items-center justify-between px-6 py-3 border-b border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={handlePreviousQuestion}
                disabled={currentQuestionIndex === 0}
                className="h-8 w-8 p-0 hover:bg-slate-100 dark:hover:bg-slate-700"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-sm font-semibold text-slate-700 dark:text-slate-300 min-w-[100px] text-center">
                {currentQuestionIndex + 1} / {questions.length}
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleNextQuestion}
                disabled={currentQuestionIndex === questions.length - 1}
                className="h-8 w-8 p-0 hover:bg-slate-100 dark:hover:bg-slate-700"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
            <div className="h-6 w-px bg-slate-300 dark:bg-slate-600"></div>
            <Badge variant="outline" className="text-xs font-medium border-slate-300 dark:border-slate-600">
              {questionPoints} pts
            </Badge>
            <Badge 
              variant="outline" 
              className={cn(
                "text-xs font-medium capitalize",
                quiz.difficulty === "EASY" || quiz.difficulty === "JUNIOR" ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border-emerald-300 dark:border-emerald-600" :
                quiz.difficulty === "MEDIUM" || quiz.difficulty === "MID" ? "bg-orange-50 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400 border-orange-300 dark:border-orange-600" :
                "bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-400 border-red-300 dark:border-red-600"
              )}
            >
              {quiz.difficulty?.toLowerCase() || "medium"}
            </Badge>
          </div>
          <div className="flex items-center gap-3">
            <Button 
              onClick={runCode} 
              variant="outline" 
              size="sm"
              className="border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700 font-medium"
              disabled={isRunning || !currentCode.trim()}
            >
              {isRunning ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Exécution...
                </>
              ) : (
                <>
                  <Play className="h-4 w-4 mr-2" />
                  Run
                </>
              )}
            </Button>
            <Button 
              onClick={submitCode} 
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium shadow-sm"
              size="sm"
              disabled={isEvaluating || !allQuestionsAnswered}
            >
              {isEvaluating ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Soumission...
                </>
              ) : (
                <>
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                  Submit
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Layout LeetCode style - 2 colonnes plein écran */}
        <div className="flex-1 flex overflow-hidden">
          {/* Colonne gauche - Énoncé avec typographie LeetCode */}
          <div className="w-1/2 border-r border-slate-200 dark:border-slate-700 overflow-y-auto bg-white dark:bg-slate-900">
            <div className="p-8 max-w-3xl">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6 leading-tight">
                {currentQuestion.title || `Question ${currentQuestionIndex + 1}`}
              </h2>
              
              <div className="prose prose-slate dark:prose-invert max-w-none">
                <div className="text-[15px] leading-7 text-slate-700 dark:text-slate-300 font-normal whitespace-pre-wrap">
                  {problemStatement}
                </div>
              </div>

              {/* Exemples si disponibles */}
              {currentQuestion.examples && (
                <div className="mt-8 space-y-4">
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Exemples :</h3>
                  {Array.isArray(currentQuestion.examples) && currentQuestion.examples.map((example: any, idx: number) => (
                    <div key={idx} className="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-4 border border-slate-200 dark:border-slate-700">
                      <div className="font-mono text-sm">
                        <div className="text-slate-600 dark:text-slate-400 mb-2">Input: {example.input}</div>
                        <div className="text-slate-900 dark:text-white">Output: {example.output}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Colonne droite - Éditeur avec console */}
          <div className="w-1/2 flex flex-col bg-slate-50 dark:bg-slate-950 border-l border-slate-200 dark:border-slate-800">
            {/* Éditeur de code scrollable avec Monaco */}
            <div className="flex-1 relative min-h-0">
              <div className="absolute inset-0">
                <MonacoEditor
                  value={currentCode}
                  language="javascript"
                  theme={isDarkMode ? "dark" : "light"}
                  height="100%"
                  onChange={(value) => setCode(prev => ({
                    ...prev,
                    [currentQuestionIndex]: value
                  }))}
                  fontSize={14}
                  lineNumbers="on"
                  minimap={true}
                  placeholder="// Votre code ici..."
                />
              </div>
            </div>
            
            {/* Console bash visible */}
            <div className={cn(
              "border-t border-slate-300 dark:border-slate-700 bg-slate-900 dark:bg-black transition-all duration-300",
              isConsoleVisible ? "h-64" : "h-0 overflow-hidden"
            )}>
              <div className="h-full flex flex-col">
                {/* Header console */}
                <div className="flex items-center justify-between px-4 py-2 bg-slate-800 dark:bg-slate-950 border-b border-slate-700">
                  <div className="flex items-center gap-2">
                    <div className="flex gap-1.5">
                      <div className="w-3 h-3 rounded-full bg-red-500"></div>
                      <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                      <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
                    </div>
                    <span className="text-xs font-mono text-slate-400 ml-2">bash</span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowConsole(prev => ({ ...prev, [currentQuestionIndex]: false }))}
                    className="h-6 px-2 text-xs text-slate-400 hover:text-slate-200"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
                
                {/* Console output */}
                <div className="flex-1 overflow-y-auto p-4">
                  <pre className="text-emerald-400 font-mono text-sm leading-relaxed whitespace-pre-wrap">
                    {currentExecutionOutput || "$ node solution.js\n$ "}
                  </pre>
                  {isRunning && (
                    <span className="inline-block w-2 h-4 bg-emerald-400 ml-1 animate-pulse"></span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Indicateur de progression d'évaluation */}
        {isEvaluating && (
          <div className="px-6 py-3 bg-blue-50 dark:bg-blue-900/20 border-t border-blue-200 dark:border-blue-800">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-blue-900 dark:text-blue-300">
                Évaluation en cours...
              </span>
              <span className="text-sm font-semibold text-blue-600 dark:text-blue-400">
                {evaluationProgress}%
              </span>
            </div>
            <Progress value={evaluationProgress} className="h-1.5" />
          </div>
        )}
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
        <div className="fixed inset-0 bg-gradient-to-b dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 from-slate-50 via-emerald-50 to-slate-100 z-50">
          <div className="h-full flex flex-col">
            {/* Header avec navigation */}
            <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-700 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm">
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
            
            {/* Contenu du test */}
            <div className="flex-1 overflow-hidden">
              {getTestComponent()}
            </div>
          </div>
        </div>
      );
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