import { Zap, TrendingUp, Rocket } from "lucide-react"

export default function Logo() {
  return (
    <div className="flex items-center gap-2 transform hover:scale-105 transition-transform duration-200">
      <div className="relative">
        {/* Background gradient circle */}
        <div className="absolute inset-0 rounded-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 blur-sm opacity-30 scale-110"></div>
        
        {/* Main icon container */}
        <div className="relative bg-gradient-to-r from-indigo-600 to-pink-600 rounded-full p-2">
          <Rocket className="h-6 w-6 text-white" />
        </div>
        
        {/* Acceleration lines */}
        <div className="absolute -right-1 top-1/2 -translate-y-1/2">
          <div className="flex flex-col gap-0.5">
            <div className="w-3 h-0.5 bg-gradient-to-r from-indigo-500 to-transparent rounded-full opacity-70"></div>
            <div className="w-4 h-0.5 bg-gradient-to-r from-purple-500 to-transparent rounded-full"></div>
            <div className="w-3 h-0.5 bg-gradient-to-r from-pink-500 to-transparent rounded-full opacity-70"></div>
          </div>
        </div>
      </div>
      
      <div className="flex flex-col">
        <span className="font-bold text-xl bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600">
          TurboIntMax
        </span>
        <span className="text-xs text-muted-foreground font-medium tracking-wide">
          Accélérateur Carrière
        </span>
      </div>
      
      {/* Trending up indicator */}
      <div className="ml-1">
        <TrendingUp className="h-4 w-4 text-green-500" />
      </div>
    </div>
  )
}