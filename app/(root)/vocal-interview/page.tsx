import { VocalInterview } from "@/components/interviews/vocal-interview"
import ProtectedPage from "@/components/protected-routes"

export default function VocalInterviewPage() {
  return (
    <ProtectedPage>
      <VocalInterview showConfig={true} />
    </ProtectedPage>
  )
}