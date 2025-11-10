import { TrendingUp } from "lucide-react"

export default function Logo() {
  return (
    <div className="flex items-center gap-3 transform hover:scale-105 transition-transform duration-200">
      {/* Logo Image */}
      <div className="relative">
        {/* Background gradient circle */}
        <div className="absolute inset-0 rounded-full blur-sm opacity-30 scale-110"></div>
        
        {/* Main logo container */}
        <div className="relative">
          <img 
            src="/SkillWokz.PNG" 
            alt="SkillWokz Logo" 
            className="h-20 w-20 md:h-16 md:w-16 lg:h-20 lg:w-20 object-contain"
          />
        </div>
      </div>
    </div>
  )
}