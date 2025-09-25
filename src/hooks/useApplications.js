import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from '@tanstack/react-query'

// Applications API endpoints
const applicationsApi = {
  getAll: async (params = {}) => {
    const url = new URL('/api/applications', window.location.origin)

    // Add query parameters
    if (params.page) url.searchParams.set('page', params.page)
    if (params.limit) url.searchParams.set('limit', params.limit)
    if (params.job_id) url.searchParams.set('job_id', params.job_id)
    if (params.candidate_id) url.searchParams.set('candidate_id', params.candidate_id)
    if (params.status) url.searchParams.set('status', params.status)
    if (params.sort_by) url.searchParams.set('sort_by', params.sort_by)
    if (params.sort_order) url.searchParams.set('sort_order', params.sort_order)

    const response = await fetch(url)
    if (!response.ok) throw new Error('Failed to fetch applications')
    return response.json()
  },

  getById: async (id) => {
    const response = await fetch(`/api/applications/${id}`)
    if (!response.ok) throw new Error('Failed to fetch application')
    return response.json()
  },

  create: async (applicationData) => {
    const response = await fetch('/api/applications', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(applicationData)
    })
    if (!response.ok) throw new Error('Failed to create application')
    return response.json()
  },

  update: async ({ id, ...applicationData }) => {
    const response = await fetch(`/api/applications/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(applicationData)
    })
    if (!response.ok) throw new Error('Failed to update application')
    return response.json()
  },

  delete: async (id) => {
    const response = await fetch(`/api/applications/${id}`, { method: 'DELETE' })
    if (!response.ok) throw new Error('Failed to delete application')
    return response.json()
  },

  updateStage: async ({ id, status, notes }) => {
    const response = await fetch(`/api/applications/${id}/status`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status, notes })
    })
    if (!response.ok) throw new Error('Failed to update application status')
    return response.json()
  }
}

// Assessments API endpoints
const assessmentsApi = {
  getAll: async (params = {}) => {
    const url = new URL('/api/assessments', window.location.origin)

    if (params.job_id) url.searchParams.set('job_id', params.job_id)
    if (params.page) url.searchParams.set('page', params.page)
    if (params.limit) url.searchParams.set('limit', params.limit)

    const response = await fetch(url)
    if (!response.ok) throw new Error('Failed to fetch assessments')
    return response.json()
  },

  getById: async (id) => {
    const response = await fetch(`/api/assessments/id/${id}`)
    if (!response.ok) throw new Error('Failed to fetch assessment')
    return response.json()
  },

  create: async (assessmentData) => {
    const response = await fetch('/api/assessments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(assessmentData)
    })
    if (!response.ok) throw new Error('Failed to create assessment')
    return response.json()
  },

  update: async ({ id, ...assessmentData }) => {
    const response = await fetch(`/api/assessments/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(assessmentData)
    })
    if (!response.ok) throw new Error('Failed to update assessment')
    return response.json()
  },

  delete: async (id) => {
    const response = await fetch(`/api/assessments/${id}`, { method: 'DELETE' })
    if (!response.ok) throw new Error('Failed to delete assessment')
    return response.json()
  },

  duplicate: async (id) => {
    const response = await fetch(`/api/assessments/${id}/duplicate`, {
      method: 'POST'
    })
    if (!response.ok) throw new Error('Failed to duplicate assessment')
    return response.json()
  },
  // Job-scoped endpoints
  getForJob: async (jobId) => {
    const response = await fetch(`/api/assessments/${jobId}`)
    if (!response.ok) throw new Error('Failed to fetch job assessment')
    return response.json()
  },
  createForJob: async ({ jobId, assessment }) => {
    const response = await fetch(`/api/jobs/${jobId}/assessments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(assessment)
    })
    if (!response.ok) throw new Error('Failed to create job assessment')
    return response.json()
  },
  upsertForJob: async ({ jobId, assessment }) => {
    const response = await fetch(`/api/assessments/${jobId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(assessment)
    })
    if (!response.ok) throw new Error('Failed to save job assessment')
    return response.json()
  },
  submitForJob: async ({ jobId, submission }) => {
    const response = await fetch(`/api/assessments/${jobId}/submit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(submission)
    })
    if (!response.ok) throw new Error('Failed to submit assessment')
    return response.json()
  }
}

// Assessment responses API endpoints
const assessmentResponsesApi = {
  getAll: async (params = {}) => {
    const url = new URL('/api/assessment-responses', window.location.origin)

    if (params.assessment_id) url.searchParams.set('assessment_id', params.assessment_id)
    if (params.candidate_id) url.searchParams.set('candidate_id', params.candidate_id)
    if (params.page) url.searchParams.set('page', params.page)
    if (params.limit) url.searchParams.set('limit', params.limit)

    const response = await fetch(url)
    if (!response.ok) throw new Error('Failed to fetch assessment responses')
    return response.json()
  },

  getById: async (id) => {
    const response = await fetch(`/api/assessment-responses/${id}`)
    if (!response.ok) throw new Error('Failed to fetch assessment response')
    return response.json()
  },

  create: async (responseData) => {
    const response = await fetch('/api/assessment-responses', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(responseData)
    })
    if (!response.ok) throw new Error('Failed to create assessment response')
    return response.json()
  },

  update: async ({ id, ...responseData }) => {
    const response = await fetch(`/api/assessment-responses/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(responseData)
    })
    if (!response.ok) throw new Error('Failed to update assessment response')
    return response.json()
  }
}

// Applications hooks
export function useApplications(params = {}) {
  return useQuery({
    queryKey: ['applications', params],
    queryFn: () => applicationsApi.getAll(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false
  })
}

export function useApplication(id) {
  return useQuery({
    queryKey: ['applications', id],
    queryFn: () => applicationsApi.getById(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000
  })
}

export function useCreateApplication() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: applicationsApi.create,
    onSuccess: (newApplication) => {
      queryClient.invalidateQueries({ queryKey: ['applications'] })
      queryClient.setQueryData(['applications', newApplication.id], newApplication)
    }
  })
}

export function useUpdateApplication() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: applicationsApi.update,
    onSuccess: (updatedApplication) => {
      queryClient.setQueryData(['applications', updatedApplication.id], updatedApplication)
      queryClient.invalidateQueries({ queryKey: ['applications'], exact: false })
    }
  })
}

export function useDeleteApplication() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: applicationsApi.delete,
    onSuccess: (_, deletedId) => {
      queryClient.removeQueries({ queryKey: ['applications', deletedId] })
      queryClient.invalidateQueries({ queryKey: ['applications'], exact: false })
    }
  })
}

export function useUpdateApplicationStage() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: applicationsApi.updateStage,
    onSuccess: (updatedApplication) => {
      queryClient.setQueryData(['applications', updatedApplication.id], updatedApplication)
      queryClient.invalidateQueries({ queryKey: ['applications'], exact: false })
      queryClient.invalidateQueries({ queryKey: ['candidates'], exact: false })
    }
  })
}

// Assessments hooks
export function useAssessments(params = {}) {
  return useQuery({
    queryKey: ['assessments', params],
    queryFn: () => assessmentsApi.getAll(params),
    staleTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: false
  })
}

export function useAssessment(id) {
  return useQuery({
    queryKey: ['assessments', id],
    queryFn: () => assessmentsApi.getById(id),
    enabled: !!id,
    staleTime: 10 * 60 * 1000
  })
}

export function useCreateAssessment() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: assessmentsApi.create,
    onSuccess: (newAssessment) => {
      queryClient.invalidateQueries({ queryKey: ['assessments'] })
      queryClient.setQueryData(['assessments', newAssessment.id], newAssessment)
    }
  })
}

export function useUpdateAssessment() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: assessmentsApi.update,
    onSuccess: (updatedAssessment) => {
      queryClient.setQueryData(['assessments', updatedAssessment.id], updatedAssessment)
      queryClient.invalidateQueries({ queryKey: ['assessments'], exact: false })
    }
  })
}

export function useDeleteAssessment() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: assessmentsApi.delete,
    onSuccess: (_, deletedId) => {
      queryClient.removeQueries({ queryKey: ['assessments', deletedId] })
      queryClient.invalidateQueries({ queryKey: ['assessments'], exact: false })
    }
  })
}

export function useDuplicateAssessment() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: assessmentsApi.duplicate,
    onSuccess: (duplicatedAssessment) => {
      queryClient.invalidateQueries({ queryKey: ['assessments'] })
      queryClient.setQueryData(['assessments', duplicatedAssessment.id], duplicatedAssessment)
    }
  })
}

// Job-scoped assessment hooks
export function useJobAssessment(jobId) {
  return useQuery({
    queryKey: ['job-assessment', jobId],
    queryFn: () => assessmentsApi.getForJob(jobId),
    enabled: !!jobId,
    staleTime: 10 * 60 * 1000
  })
}

export function useUpsertJobAssessment() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: assessmentsApi.upsertForJob,
    onSuccess: (saved) => {
      queryClient.invalidateQueries({ queryKey: ['job-assessment', saved.job_id], exact: false })
      queryClient.invalidateQueries({ queryKey: ['assessments'], exact: false })
      queryClient.invalidateQueries({ queryKey: ['assessment-responses'], exact: false })
    }
  })
}

export function useCreateJobAssessment() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: assessmentsApi.createForJob,
    onSuccess: (saved) => {
      queryClient.invalidateQueries({ queryKey: ['job-assessment', saved.job_id], exact: false })
      queryClient.invalidateQueries({ queryKey: ['assessments'], exact: false })
      queryClient.invalidateQueries({ queryKey: ['assessment-responses'], exact: false })
    }
  })
}

export function useSubmitJobAssessment() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: assessmentsApi.submitForJob,
    onSuccess: (resp) => {
      queryClient.invalidateQueries({ queryKey: ['assessment-responses'] })
    }
  })
}

// Assessment responses hooks
export function useAssessmentResponses(params = {}) {
  return useQuery({
    queryKey: ['assessment-responses', params],
    queryFn: () => assessmentResponsesApi.getAll(params),
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false
  })
}

export function useAssessmentResponse(id) {
  return useQuery({
    queryKey: ['assessment-responses', id],
    queryFn: () => assessmentResponsesApi.getById(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000
  })
}

export function useCreateAssessmentResponse() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: assessmentResponsesApi.create,
    onSuccess: (newResponse) => {
      queryClient.invalidateQueries({ queryKey: ['assessment-responses'] })
      queryClient.setQueryData(['assessment-responses', newResponse.id], newResponse)
    }
  })
}

export function useUpdateAssessmentResponse() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: assessmentResponsesApi.update,
    onSuccess: (updatedResponse) => {
      queryClient.setQueryData(['assessment-responses', updatedResponse.id], updatedResponse)
      queryClient.invalidateQueries({ queryKey: ['assessment-responses'], exact: false })
    }
  })
}

// Helper hooks for dashboard stats
export function useApplicationsStats() {
  return useQuery({
    queryKey: ['applications', 'stats'],
    queryFn: async () => {
      const response = await fetch('/api/applications/stats')
      if (!response.ok) throw new Error('Failed to fetch applications stats')
      return response.json()
    },
    staleTime: 10 * 60 * 1000 // 10 minutes
  })
}

export function useAssessmentsStats() {
  return useQuery({
    queryKey: ['assessments', 'stats'],
    queryFn: async () => {
      const response = await fetch('/api/assessments/stats')
      if (!response.ok) throw new Error('Failed to fetch assessments stats')
      return response.json()
    },
    staleTime: 10 * 60 * 1000 // 10 minutes
  })
}