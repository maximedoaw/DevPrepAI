import { CheckCircle, Code, Users, Brain, Zap, BarChart, Clock } from "lucide-react"

export default function Features() {
  return (
    <section id="features" className="py-20">
      <div className="container">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Fonctionnalités puissantes</h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Tout ce dont vous avez besoin pour réussir vos entretiens techniques
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <div className="bg-background/30 border border-border/50 p-6 rounded-lg backdrop-blur-sm">
            <Code className="h-10 w-10 text-indigo-400 mb-4" />
            <h3 className="text-xl font-semibold mb-2">Questions techniques</h3>
            <p className="text-muted-foreground mb-4">
              Plus de 1000 questions techniques couvrant tous les langages et frameworks populaires.
            </p>
            <ul className="space-y-2">
              <li className="flex items-center">
                <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                <span className="text-sm">JavaScript, Python, Java, etc.</span>
              </li>
              <li className="flex items-center">
                <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                <span className="text-sm">React, Angular, Vue, Next.js</span>
              </li>
              <li className="flex items-center">
                <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                <span className="text-sm">Algorithmes et structures de données</span>
              </li>
            </ul>
          </div>

          <div className="bg-background/30 border border-border/50 p-6 rounded-lg backdrop-blur-sm">
            <Users className="h-10 w-10 text-purple-400 mb-4" />
            <h3 className="text-xl font-semibold mb-2">Simulations d'entretien</h3>
            <p className="text-muted-foreground mb-4">
              Pratiquez des entretiens réalistes avec notre IA qui s'adapte à votre niveau.
            </p>
            <ul className="space-y-2">
              <li className="flex items-center">
                <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                <span className="text-sm">Entretiens personnalisés</span>
              </li>
              <li className="flex items-center">
                <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                <span className="text-sm">Feedback en temps réel</span>
              </li>
              <li className="flex items-center">
                <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                <span className="text-sm">Différents niveaux de difficulté</span>
              </li>
            </ul>
          </div>

          <div className="bg-background/30 border border-border/50 p-6 rounded-lg backdrop-blur-sm">
            <Brain className="h-10 w-10 text-pink-400 mb-4" />
            <h3 className="text-xl font-semibold mb-2">Coaching soft skills</h3>
            <p className="text-muted-foreground mb-4">
              Améliorez vos compétences en communication et comportementales.
            </p>
            <ul className="space-y-2">
              <li className="flex items-center">
                <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                <span className="text-sm">Questions comportementales</span>
              </li>
              <li className="flex items-center">
                <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                <span className="text-sm">Conseils de présentation</span>
              </li>
              <li className="flex items-center">
                <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                <span className="text-sm">Gestion du stress</span>
              </li>
            </ul>
          </div>

          <div className="bg-background/30 border border-border/50 p-6 rounded-lg backdrop-blur-sm">
            <Zap className="h-10 w-10 text-yellow-400 mb-4" />
            <h3 className="text-xl font-semibold mb-2">Apprentissage accéléré</h3>
            <p className="text-muted-foreground mb-4">
              Apprenez plus rapidement grâce à notre système d'apprentissage adaptatif.
            </p>
            <ul className="space-y-2">
              <li className="flex items-center">
                <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                <span className="text-sm">Répétition espacée</span>
              </li>
              <li className="flex items-center">
                <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                <span className="text-sm">Contenu personnalisé</span>
              </li>
              <li className="flex items-center">
                <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                <span className="text-sm">Recommandations intelligentes</span>
              </li>
            </ul>
          </div>

          <div className="bg-background/30 border border-border/50 p-6 rounded-lg backdrop-blur-sm">
            <BarChart className="h-10 w-10 text-blue-400 mb-4" />
            <h3 className="text-xl font-semibold mb-2">Analyse de performance</h3>
            <p className="text-muted-foreground mb-4">Suivez vos progrès et identifiez vos points forts et faibles.</p>
            <ul className="space-y-2">
              <li className="flex items-center">
                <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                <span className="text-sm">Tableaux de bord détaillés</span>
              </li>
              <li className="flex items-center">
                <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                <span className="text-sm">Statistiques de progression</span>
              </li>
              <li className="flex items-center">
                <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                <span className="text-sm">Recommandations d'amélioration</span>
              </li>
            </ul>
          </div>

          <div className="bg-background/30 border border-border/50 p-6 rounded-lg backdrop-blur-sm">
            <Clock className="h-10 w-10 text-green-400 mb-4" />
            <h3 className="text-xl font-semibold mb-2">Préparation efficace</h3>
            <p className="text-muted-foreground mb-4">
              Optimisez votre temps de préparation avec des sessions ciblées.
            </p>
            <ul className="space-y-2">
              <li className="flex items-center">
                <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                <span className="text-sm">Sessions courtes et efficaces</span>
              </li>
              <li className="flex items-center">
                <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                <span className="text-sm">Planification intelligente</span>
              </li>
              <li className="flex items-center">
                <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                <span className="text-sm">Rappels et notifications</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  )
}
