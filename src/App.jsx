import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ThemeProvider } from '@/components/theme-provider'
import { LandingPage } from '@/pages/landing'
import { AppLayout } from '@/pages/app-layout'
import { Dashboard } from '@/pages/dashboard'
import AssessmentsPage from '@/pages/assessments'
import JobsPage from '@/pages/jobs'
import { JobCreatePage } from '@/pages/job-create'
import { JobEditPage } from '@/pages/job-edit'
import { CandidatesPage } from '@/pages/candidates'
import { AssessmentBuilderPage } from '@/pages/assessment-builder'
import AssessmentRunPage from '@/pages/assessment-run'
import { JobDetailPage } from '@/pages/job-detail'
import { CandidateDetailPage } from '@/pages/candidate-detail'
import './App.css'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      refetchOnWindowFocus: false,
    },
  },
})

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <Router>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/app" element={<AppLayout />}>
              <Route index element={<Dashboard />} />
              <Route path="jobs" element={<JobsPage />} />
              <Route path="jobs/new" element={<JobCreatePage />} />
              <Route path="jobs/:jobId" element={<JobDetailPage />} />
              <Route path="jobs/:jobId/edit" element={<JobEditPage />} />
              <Route path="jobs/:jobId/assessment" element={<AssessmentBuilderPage />} />
              <Route path="jobs/:jobId/assessments" element={<AssessmentsPage />} />
              <Route path="jobs/:jobId/assessments/submitted/:assessmentId" element={<AssessmentsPage />} />
              <Route path="jobs/:jobId/assessment/run" element={<AssessmentRunPage />} />
              <Route path="candidates" element={<CandidatesPage />} />
              <Route path="candidates/:candidateId" element={<CandidateDetailPage />} />
              <Route path="assessments" element={<AssessmentsPage />} />
            </Route>
          </Routes>
        </Router>
      </ThemeProvider>
    </QueryClientProvider>
  )
}

export default App
