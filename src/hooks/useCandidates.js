import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from '@tanstack/react-query'

// Candidates API endpoints
const candidatesApi = {
  getAll: async (params = {}) => {
    const url = new URL('/api/candidates', window.location.origin)

    // Add query parameters
    if (params.page) url.searchParams.set('page', params.page)
    if (params.limit) url.searchParams.set('limit', params.limit)
    if (params.search) url.searchParams.set('search', params.search)
    if (params.position) url.searchParams.set('position', params.position)
    if (params.stage) url.searchParams.set('stage', params.stage)
    if (params.location) url.searchParams.set('location', params.location)
    if (params.experience) url.searchParams.set('experience', params.experience)
    if (params.sort_by) url.searchParams.set('sort_by', params.sort_by)
    if (params.sort_order) url.searchParams.set('sort_order', params.sort_order)

    const response = await fetch(url)
    if (!response.ok) throw new Error('Failed to fetch candidates')
    return response.json()
  },

  getById: async (id) => {
    const response = await fetch(`/api/candidates/${id}`)
    if (!response.ok) throw new Error('Failed to fetch candidate')
    return response.json()
  },

  create: async (candidateData) => {
    const response = await fetch('/api/candidates', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(candidateData)
    })
    if (!response.ok) throw new Error('Failed to create candidate')
    return response.json()
  },

  update: async ({ id, ...candidateData }) => {
    const response = await fetch(`/api/candidates/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(candidateData)
    })
    if (!response.ok) throw new Error('Failed to update candidate')
    return response.json()
  },

  patch: async ({ id, ...updateData }) => {
    const response = await fetch(`/api/candidates/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updateData)
    });
    if (!response.ok) throw new Error('Failed to patch candidate');
    return response.json();
  },

  delete: async (id) => {
    const response = await fetch(`/api/candidates/${id}`, { method: 'DELETE' })
    if (!response.ok) throw new Error('Failed to delete candidate')
    return response.json()
  },

  updateStage: async ({ id, stage, notes }) => {
    const response = await fetch(`/api/candidates/${id}/stage`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ stage, notes })
    })
    if (!response.ok) throw new Error('Failed to update candidate stage')
    return response.json()
  },

  bulkUpdate: async (candidateUpdates) => {
    const response = await fetch('/api/candidates/bulk', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ updates: candidateUpdates })
    })
    if (!response.ok) throw new Error('Failed to bulk update candidates')
    return response.json()
  }
}

// Hooks for candidates data
export function useCandidates(params = {}) {
  return useQuery({
    queryKey: ['candidates', params],
    queryFn: () => candidatesApi.getAll(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false
  })
}

export function useCandidate(id) {
  return useQuery({
    queryKey: ['candidates', id],
    queryFn: () => candidatesApi.getById(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000
  })
}

export function useCreateCandidate() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: candidatesApi.create,
    onSuccess: (newCandidate) => {
      // Invalidate and refetch candidates list
      queryClient.invalidateQueries({ queryKey: ['candidates'] })

      // Add the new candidate to existing cache
      queryClient.setQueryData(['candidates', newCandidate.id], newCandidate)
    }
  })
}

export function useUpdateCandidate() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: candidatesApi.update,
    onSuccess: (updatedCandidate) => {
      // Update specific candidate in cache
      //queryClient.setQueryData(['candidates', updatedCandidate.id], updatedCandidate)
      queryClient.invalidateQueries({ queryKey: ['candidate', String(updatedCandidate.id)] });

      // Invalidate candidates list to ensure consistency
      queryClient.invalidateQueries({ queryKey: ['candidates'], exact: false })
    }
  })
}

export function useUpdateCandidateStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (updateData) => candidatesApi.patch(updateData), // Using the new patch method
    /*onSuccess: (updatedCandidate) => {
      // Update the specific candidate's cache to avoid a flash of old data
      queryClient.setQueryData(['candidate', updatedCandidate.id], updatedCandidate);

      // Invalidate all queries related to the candidate list to refetch fresh data
      // This covers the list view, kanban view, stats, etc.
      queryClient.invalidateQueries({ queryKey: ['candidates'] });
    },
    onError: (error) => {
      // You can add default error handling here if you wish
      console.error("Failed to update candidate status", error);
    }*/
    onSuccess: (updatedCandidate) => {
      // Invalidate the detail page query to trigger a refetch of this specific candidate
      queryClient.invalidateQueries({ queryKey: ['candidate', String(updatedCandidate.id)] });

      // Invalidate list-based queries to update the main list and Kanban board
      queryClient.invalidateQueries({ queryKey: ['candidates'] });

      toast.success('Candidate stage updated successfully');
    },
    onError: (error) => {
      toast.error('Failed to update candidate stage');
      console.error("Failed to update candidate stage", error);
    }
  });
}

export function useDeleteCandidate() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: candidatesApi.delete,
    onSuccess: (_, deletedId) => {
      // Remove candidate from cache
      queryClient.removeQueries({ queryKey: ['candidates', deletedId] })

      // Invalidate candidates list
      queryClient.invalidateQueries({ queryKey: ['candidates'], exact: false })
    }
  })
}

export function useUpdateCandidateStage() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: candidatesApi.updateStage,
    onSuccess: (updatedCandidate) => {
      // Update specific candidate in cache
      // queryClient.setQueryData(['candidates', updatedCandidate.id], updatedCandidate)

      queryClient.invalidateQueries({ queryKey: ['candidate', String(updatedCandidate.id)] });

      // Invalidate candidates list and applications to ensure consistency
      queryClient.invalidateQueries({ queryKey: ['candidates'], exact: false })
      queryClient.invalidateQueries({ queryKey: ['applications'], exact: false })
      // This invalidation is crucial for the Kanban UI to update.
      queryClient.invalidateQueries({ queryKey: ['candidates', 'by-stage'] });
    }
  })
}

export function useBulkUpdateCandidates() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: candidatesApi.bulkUpdate,
    onSuccess: () => {
      // Invalidate all candidates queries to refetch updated data
      queryClient.invalidateQueries({ queryKey: ['candidates'] })
      queryClient.invalidateQueries({ queryKey: ['applications'] })
    }
  })
}

// Helper hooks for common operations
export function useCandidatesStats() {
  return useQuery({
    queryKey: ['candidates', 'stats'],
    queryFn: async () => {
      const response = await fetch('/api/candidates/stats')
      if (!response.ok) throw new Error('Failed to fetch candidate stats')
      return response.json()
    },
    staleTime: 10 * 60 * 1000 // 10 minutes
  })
}

export function useCandidatesPositions() {
  return useQuery({
    queryKey: ['candidates', 'positions'],
    queryFn: async () => {
      const response = await fetch('/api/candidates/positions')
      if (!response.ok) throw new Error('Failed to fetch positions')
      return response.json()
    },
    staleTime: 30 * 60 * 1000 // 30 minutes
  })
}

export function useCandidatesLocations() {
  return useQuery({
    queryKey: ['candidates', 'locations'],
    queryFn: async () => {
      const response = await fetch('/api/candidates/locations')
      if (!response.ok) throw new Error('Failed to fetch locations')
      return response.json()
    },
    staleTime: 30 * 60 * 1000 // 30 minutes
  })
}

export function useCandidatesByStage() {
  return useQuery({
    queryKey: ['candidates', 'by-stage'],
    queryFn: async () => {
      const response = await fetch('/api/candidates/by-stage')
      if (!response.ok) throw new Error('Failed to fetch candidates by stage')
      return response.json()
    },
    staleTime: 5 * 60 * 1000 // 5 minutes
  })
}

// Hook for infinite scrolling (virtualization support)
export function useInfiniteCandidates(params = {}) {
  return useInfiniteQuery({
    queryKey: ['candidates', 'infinite', params],
    queryFn: ({ pageParam = 1 }) => candidatesApi.getAll({ ...params, page: pageParam }),
    getNextPageParam: (lastPage, pages) => {
      if (lastPage.has_more) {
        return pages.length + 1
      }
      return undefined
    },
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false
  })
}