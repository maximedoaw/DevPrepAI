import { Code2 } from "lucide-react"

export default function Logo() {
  return (
    <div className="flex items-center gap-2 transform">
      <span className="font-bold text-xl bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500">
        Dev Prep AI
      </span>
      <Code2 className="h-8 w-8 text-primary" />
    </div>
  )
}
