export interface MatchedCandidate {
  id: string
  matchScore: number
  skillsMatch: number
  domainMatch: number
  experienceMatch: number | null
  aiReason: string | null
  candidate: {
    id: string
    firstName: string | null
    lastName: string | null
    email: string
    skills: string[]
    domains: string[]
    matchingJobs: number
    portfolio?: {
      id: string
      avatarUrl: string | null
      headline: string | null
      bio: string | null
      skills: string[]
    } | null
  }
}
