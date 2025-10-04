import { InterviewContainer } from "../../interviews/components/interview-container"
import ProtectedPage from "@/components/protected-routes"

interface InterviewPageProps {
  params: { id: string }
}

export default function InterviewPage({ params }: InterviewPageProps) {
  return (
    <ProtectedPage>
      <InterviewContainer interviewId={params.id} />
    </ProtectedPage>
  )
}
