import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

// Jobs API endpoints
const jobsApi = {
  getAll: async (params = {}) => {
    const url = new URL('/api/jobs', window.location.origin)

    // Add query parameters
    if (params.page) url.searchParams.set('page', params.page)
    if (params.limit) url.searchParams.set('limit', params.limit)
    if (params.search) url.searchParams.set('search', params.search)
    if (params.department) url.searchParams.set('department', params.department)
    if (params.status) url.searchParams.set('status', params.status)
    if (params.sort_by) url.searchParams.set('sort_by', params.sort_by)
    if (params.sort_order) url.searchParams.set('sort_order', params.sort_order)

    const response = await fetch(url)
    if (!response.ok) throw new Error('Failed to fetch jobs')
    return response.json()
  },

  getById: async (id) => {
    const response = await fetch(`/api/jobs/${id}`)
    if (!response.ok) throw new Error('Failed to fetch job')
    return response.json()
  },

  getBySlug: async (slug) => {
    const response = await fetch(`/api/jobs/slug/${slug}`)
    if (!response.ok) throw new Error('Failed to fetch job')
    return response.json()
  },

  create: async (jobData) => {
    const response = await fetch('/api/jobs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(jobData)
    })
    if (!response.ok) throw new Error('Failed to create job')
    return response.json()
  },

  /*update: async ({ id, ...jobData }) => {
    const response = await fetch(`/api/jobs/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(jobData)
    })
    if (!response.ok) throw new Error('Failed to update job')
    return response.json()
  },*/

  // useJobs.js

  update: async ({ id, ...jobData }) => {
    const response = await fetch(`/api/jobs/${id}`, {
      method: 'PATCH', // Changed from 'PUT' to 'PATCH'
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(jobData)
    })
    if (!response.ok) throw new Error('Failed to update job')
    return response.json()
  },

  delete: async (id) => {
    const response = await fetch(`/api/jobs/${id}`, { method: 'DELETE' })
    if (!response.ok) throw new Error('Failed to delete job')
    return response.json()
  },

  reorder: async (reorderedJobs) => {
    const response = await fetch('/api/jobs/reorder', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ jobs: reorderedJobs })
    })
    if (!response.ok) throw new Error('Failed to reorder jobs')
    return response.json()
  }
}

// Hooks for jobs data
export function useJobs(params = {}) {
  return useQuery({
    queryKey: ['jobs', params],
    queryFn: () => jobsApi.getAll(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false
  })
}

export function useJob(id) {
  return useQuery({
    queryKey: ['jobs', id],
    queryFn: () => jobsApi.getById(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000
  })
}

export function useJobBySlug(slug) {
  return useQuery({
    queryKey: ['jobs', 'slug', slug],
    queryFn: () => jobsApi.getBySlug(slug),
    enabled: !!slug,
    staleTime: 5 * 60 * 1000
  })
}

export function useCreateJob() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: jobsApi.create,
    onSuccess: (newJob) => {
      // Invalidate and refetch jobs list
      queryClient.invalidateQueries({ queryKey: ['jobs'] })

      // Add the new job to existing cache
      queryClient.setQueryData(['jobs', newJob.id], newJob)
    }
  })
}

export function useUpdateJob() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: jobsApi.update,
    onSuccess: (updatedJob) => {
      // Update specific job in cache
      queryClient.setQueryData(['jobs', updatedJob.id], updatedJob)
      queryClient.setQueryData(['jobs', 'slug', updatedJob.slug], updatedJob)

      // Invalidate jobs list to ensure consistency
      queryClient.invalidateQueries({ queryKey: ['jobs'], exact: false })
    }
  })
}

export function useDeleteJob() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: jobsApi.delete,
    onSuccess: (_, deletedId) => {
      // Remove job from cache
      queryClient.removeQueries({ queryKey: ['jobs', deletedId] })

      // Invalidate jobs list
      queryClient.invalidateQueries({ queryKey: ['jobs'], exact: false })
    }
  })
}

export function useReorderJobs() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: jobsApi.reorder,
    onSuccess: () => {
      // Invalidate all jobs queries to refetch with new order
      queryClient.invalidateQueries({ queryKey: ['jobs'] })
    }
  })
}

// Helper hooks for common operations
export function useJobsStats() {
  return useQuery({
    queryKey: ['jobs', 'stats'],
    queryFn: async () => {
      const response = await fetch('/api/jobs/stats')
      if (!response.ok) throw new Error('Failed to fetch job stats')
      return response.json()
    },
    staleTime: 10 * 60 * 1000 // 10 minutes
  })
}

export function useJobsDepartments() {
  return useQuery({
    queryKey: ['jobs', 'departments'],
    queryFn: async () => {
      const response = await fetch('/api/jobs/departments')
      if (!response.ok) throw new Error('Failed to fetch departments')
      return response.json()
    },
    staleTime: 30 * 60 * 1000 // 30 minutes - departments don't change often
  })
}