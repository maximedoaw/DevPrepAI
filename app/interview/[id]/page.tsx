import { InterviewContainer } from "./components/interview-container"

interface InterviewPageProps {
  params: { id: string }
}

export default function InterviewPage({ params }: InterviewPageProps) {
  return <InterviewContainer interviewId={params.id} />
}
