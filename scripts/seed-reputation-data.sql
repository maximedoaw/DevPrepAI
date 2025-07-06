-- Script pour ajouter des données de test pour la page de réputation
-- À exécuter dans votre base de données PostgreSQL

-- Insérer un utilisateur de test
INSERT INTO "User" (id, email, "firstName", "lastName", credits, "createdAt", "updatedAt")
VALUES (
  'test-user-reputation',
  'test@reputation.com',
  'Jean',
  'Dupont',
  15000,
  NOW() - INTERVAL '30 days',
  NOW()
);

-- Insérer des quiz de test
INSERT INTO "Quiz" (id, title, description, type, questions, difficulty, "createdAt", "updatedAt", company, technology, duration, "totalPoints")
VALUES 
  ('quiz-1', 'Quiz JavaScript Avancé', 'Test de connaissances JavaScript', 'CODING', '{"questions": []}', 'SENIOR', NOW() - INTERVAL '25 days', NOW(), 'Google', ARRAY['JavaScript', 'ES6'], 30, 100),
  ('quiz-2', 'Entretien React', 'Questions sur React et ses concepts', 'MOCK_INTERVIEW', '{"questions": []}', 'MID', NOW() - INTERVAL '20 days', NOW(), 'Facebook', ARRAY['React', 'JavaScript'], 45, 100),
  ('quiz-3', 'QCM Algorithmes', 'Questions à choix multiples sur les algorithmes', 'QCM', '{"questions": []}', 'JUNIOR', NOW() - INTERVAL '15 days', NOW(), 'Amazon', ARRAY['Algorithms', 'Data Structures'], 20, 100),
  ('quiz-4', 'Soft Skills Communication', 'Test de communication et travail d''équipe', 'SOFT_SKILLS', '{"questions": []}', 'MID', NOW() - INTERVAL '10 days', NOW(), 'Microsoft', ARRAY['Communication', 'Teamwork'], 25, 100),
  ('quiz-5', 'Quiz Python', 'Programmation Python avancée', 'CODING', '{"questions": []}', 'SENIOR', NOW() - INTERVAL '5 days', NOW(), 'Netflix', ARRAY['Python', 'Backend'], 35, 100),
  ('quiz-6', 'Entretien System Design', 'Questions de conception système', 'MOCK_INTERVIEW', '{"questions": []}', 'SENIOR', NOW() - INTERVAL '3 days', NOW(), 'Uber', ARRAY['System Design', 'Architecture'], 60, 100),
  ('quiz-7', 'QCM Base de données', 'Questions sur les bases de données', 'QCM', '{"questions": []}', 'MID', NOW() - INTERVAL '2 days', NOW(), 'Airbnb', ARRAY['SQL', 'Database'], 15, 100),
  ('quiz-8', 'Soft Skills Leadership', 'Test de leadership et gestion', 'SOFT_SKILLS', '{"questions": []}', 'SENIOR', NOW() - INTERVAL '1 day', NOW(), 'LinkedIn', ARRAY['Leadership', 'Management'], 30, 100);

-- Insérer des résultats de quiz pour créer une progression réaliste
INSERT INTO "QuizResult" (id, "userId", "quizId", score, answers, analysis, duration, "completedAt")
VALUES 
  -- Quiz 1 - Score parfait
  ('result-1', 'test-user-reputation', 'quiz-1', 95, '{"answers": []}', 'Excellent travail sur JavaScript avancé', 1800, NOW() - INTERVAL '25 days'),
  
  -- Quiz 2 - Bon score
  ('result-2', 'test-user-reputation', 'quiz-2', 87, '{"answers": []}', 'Bonne compréhension de React', 2700, NOW() - INTERVAL '20 days'),
  
  -- Quiz 3 - Score moyen
  ('result-3', 'test-user-reputation', 'quiz-3', 78, '{"answers": []}', 'Connaissances de base solides', 1200, NOW() - INTERVAL '15 days'),
  
  -- Quiz 4 - Bon score
  ('result-4', 'test-user-reputation', 'quiz-4', 82, '{"answers": []}', 'Bonnes compétences en communication', 1500, NOW() - INTERVAL '10 days'),
  
  -- Quiz 5 - Score parfait
  ('result-5', 'test-user-reputation', 'quiz-5', 98, '{"answers": []}', 'Maîtrise exceptionnelle de Python', 2100, NOW() - INTERVAL '5 days'),
  
  -- Quiz 6 - Score élevé
  ('result-6', 'test-user-reputation', 'quiz-6', 91, '{"answers": []}', 'Excellente compréhension du system design', 3600, NOW() - INTERVAL '3 days'),
  
  -- Quiz 7 - Score moyen
  ('result-7', 'test-user-reputation', 'quiz-7', 75, '{"answers": []}', 'Connaissances de base en base de données', 900, NOW() - INTERVAL '2 days'),
  
  -- Quiz 8 - Bon score
  ('result-8', 'test-user-reputation', 'quiz-8', 85, '{"answers": []}', 'Bonnes compétences en leadership', 1800, NOW() - INTERVAL '1 day');

-- Insérer des analyses de compétences
INSERT INTO "SkillAnalysis" (id, "userId", "quizResultId", skills, "aiFeedback", "improvementTips", "analyzedAt")
VALUES 
  ('analysis-1', 'test-user-reputation', 'result-1', '{"JavaScript": 95, "ES6": 90}', 'Excellent niveau en JavaScript', ARRAY['Continuer à pratiquer les concepts avancés'], NOW() - INTERVAL '25 days'),
  ('analysis-2', 'test-user-reputation', 'result-2', '{"React": 87, "JavaScript": 85}', 'Bon niveau en React', ARRAY['Approfondir les hooks personnalisés'], NOW() - INTERVAL '20 days'),
  ('analysis-3', 'test-user-reputation', 'result-3', '{"Algorithms": 78, "Data Structures": 75}', 'Niveau intermédiaire en algorithmes', ARRAY['Pratiquer plus de problèmes complexes'], NOW() - INTERVAL '15 days'),
  ('analysis-4', 'test-user-reputation', 'result-4', '{"Communication": 82, "Teamwork": 80}', 'Bonnes compétences en communication', ARRAY['Développer la prise de parole en public'], NOW() - INTERVAL '10 days'),
  ('analysis-5', 'test-user-reputation', 'result-5', '{"Python": 98, "Backend": 95}', 'Niveau expert en Python', ARRAY['Explorer les frameworks avancés'], NOW() - INTERVAL '5 days'),
  ('analysis-6', 'test-user-reputation', 'result-6', '{"System Design": 91, "Architecture": 88}', 'Excellente compréhension du system design', ARRAY['Pratiquer les cas d''usage complexes'], NOW() - INTERVAL '3 days'),
  ('analysis-7', 'test-user-reputation', 'result-7', '{"SQL": 75, "Database": 70}', 'Connaissances de base en base de données', ARRAY['Approfondir les requêtes complexes'], NOW() - INTERVAL '2 days'),
  ('analysis-8', 'test-user-reputation', 'result-8', '{"Leadership": 85, "Management": 80}', 'Bonnes compétences en leadership', ARRAY['Développer l''empathie managériale'], NOW() - INTERVAL '1 day');

-- Insérer un abonnement de test
INSERT INTO "Subscription" (id, "userId", tier, "startDate", "endDate", "isActive", "stripeCustomerId", "stripeSubscriptionId", features)
VALUES (
  'sub-test-reputation',
  'test-user-reputation',
  'PREMIUM',
  NOW() - INTERVAL '30 days',
  NOW() + INTERVAL '30 days',
  true,
  'cus_test_reputation',
  'sub_test_reputation',
  '{"dailyCredits": 50000, "features": ["unlimited_quizzes", "ai_feedback", "progress_tracking"]}'
); 