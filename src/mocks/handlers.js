 import { http, HttpResponse } from 'msw'
import { db } from '../lib/db'

// Simulate network conditions according to PDF requirements
// 200-1200ms latency and 5-10% error rates
function simulateNetworkConditions() {
  const delay = Math.floor(Math.random() * 1000) + 200 // 200-1200ms delay
  const shouldError = Math.random() < 0.075 // 7.5% error rate (between 5-10%)
  
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({ shouldError })
    }, delay)
  })
}

// Helper function to handle network simulation results
async function handleNetworkSimulation() {
  const result = await simulateNetworkConditions()
  if (result.shouldError) {
    return HttpResponse.json(
      { error: 'Network simulation error', message: 'Simulated network failure' }, 
      { status: 500 }
    )
  }
  return null // No error, continue with normal response
}

// Helper function for pagination
function paginate(data, page = 1, limit = 10) {
  const offset = (page - 1) * limit
  const paginatedData = data.slice(offset, offset + limit)
  
  return {
    data: paginatedData,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total: data.length,
      total_pages: Math.ceil(data.length / limit),
      has_more: offset + limit < data.length
    }
  }
}

// Helper function for filtering and searching
function filterAndSearch(data, params) {
  let filtered = [...data]
  
  // Search functionality
  if (params.search) {
    const searchTerm = params.search.toLowerCase()
    filtered = filtered.filter(item => {
      return Object.values(item).some(value => 
        value && value.toString().toLowerCase().includes(searchTerm)
      )
    })
  }
  
  // Department filter (for jobs)
  if (params.department && params.department !== 'all') {
    filtered = filtered.filter(item => item.department === params.department)
  }
  
  // Status filter
  if (params.status && params.status !== 'all') {
    filtered = filtered.filter(item => item.status === params.status)
  }
  
  // Position filter (for candidates)
  if (params.position && params.position !== 'all') {
    filtered = filtered.filter(item => item.position === params.position)
  }
  
  // Stage filter (for candidates)
  if (params.stage && params.stage !== 'all') {
    filtered = filtered.filter(item => item.stage === params.stage)
  }
  
  // Location filter (for candidates)
  if (params.location && params.location !== 'all') {
    filtered = filtered.filter(item => item.location === params.location)
  }
  
  // Experience filter (for candidates)
  if (params.experience && params.experience !== 'all') {
    filtered = filtered.filter(item => item.experience === params.experience)
  }
  
  // Job ID filter (for applications)
  if (params.job_id) {
    filtered = filtered.filter(item => item.job_id === parseInt(params.job_id))
  }
  
  // Candidate ID filter (for applications)
  if (params.candidate_id) {
    filtered = filtered.filter(item => item.candidate_id === parseInt(params.candidate_id))
  }
  
  // Assessment ID filter (for responses)
  if (params.assessment_id) {
    filtered = filtered.filter(item => item.assessment_id === parseInt(params.assessment_id))
  }
  
  // Sorting
  if (params.sort_by) {
    const sortField = params.sort_by
    const sortOrder = params.sort_order === 'desc' ? -1 : 1
    
    filtered.sort((a, b) => {
      let aVal = a[sortField]
      let bVal = b[sortField]
      
      // Handle null/undefined values
      if (aVal == null && bVal == null) return 0
      if (aVal == null) return sortOrder // null values go to end
      if (bVal == null) return -sortOrder
      
      // Handle date fields
      if (sortField.includes('_at') || sortField.includes('date')) {
        aVal = new Date(aVal)
        bVal = new Date(bVal)
      }
      
      // Handle string fields - ensure both are strings before toLowerCase
      if (typeof aVal === 'string' && typeof bVal === 'string') {
        aVal = aVal.toLowerCase()
        bVal = bVal.toLowerCase()
      } else if (typeof aVal === 'string') {
        aVal = aVal.toLowerCase()
        bVal = String(bVal).toLowerCase()
      } else if (typeof bVal === 'string') {
        aVal = String(aVal).toLowerCase()
        bVal = bVal.toLowerCase()
      }
      
      if (aVal < bVal) return -1 * sortOrder
      if (aVal > bVal) return 1 * sortOrder
      return 0
    })
  } else {
    // Default sorting: if items have an 'order' field, sort by that, otherwise by created_at desc
    filtered.sort((a, b) => {
      // If both items have an order field, use that for sorting
      if (a.order !== undefined && b.order !== undefined) {
        return a.order - b.order
      }
      // If only one has an order field, prioritize it
      if (a.order !== undefined && b.order === undefined) {
        return -1
      }
      if (a.order === undefined && b.order !== undefined) {
        return 1
      }
      // If neither has an order field, sort by created_at desc
      return new Date(b.created_at) - new Date(a.created_at)
    })
  }
  
  return filtered
}

export const handlers = [
  // Jobs endpoints
  http.get('/api/jobs', async ({ request }) => {
    const networkError = await handleNetworkSimulation()
    if (networkError) return networkError
    
    const url = new URL(request.url)
    const page = parseInt(url.searchParams.get('page')) || 1
    const limit = parseInt(url.searchParams.get('limit')) || 10
    const search = url.searchParams.get('search') || ''
    const department = url.searchParams.get('department') || ''
    const status = url.searchParams.get('status') || ''
    const sort_by = url.searchParams.get('sort_by') || 'created_at'
    const sort_order = url.searchParams.get('sort_order') || 'desc'
    
    const jobs = await db.jobs.toArray()
    const filtered = filterAndSearch(jobs, { search, department, status, sort_by, sort_order })
    const result = paginate(filtered, page, limit)
    
    return HttpResponse.json(result)
  }),
  
  http.get('/api/jobs/stats', async () => {
    const networkError = await handleNetworkSimulation()
    if (networkError) return networkError
    
    const jobs = await db.jobs.toArray()
    const stats = {
      total: jobs.length,
      active: jobs.filter(j => j.status === 'active').length,
      draft: jobs.filter(j => j.status === 'draft').length,
      paused: jobs.filter(j => j.status === 'paused').length,
      archived: jobs.filter(j => j.status === 'archived').length,
      recent: jobs.filter(j => new Date(j.created_at) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)).length
    }
    
    return HttpResponse.json(stats)
  }),
  
  http.get('/api/jobs/departments', async () => {
    const networkError = await handleNetworkSimulation()
    if (networkError) return networkError
    
    const jobs = await db.jobs.toArray()
    const departments = [...new Set(jobs.map(j => j.department))].sort()
    
    return HttpResponse.json(departments)
  }),
  
  http.get('/api/jobs/:id', async ({ params }) => {
    const networkError = await handleNetworkSimulation()
    if (networkError) return networkError
    
    const idOrSlug = params.id
    let job
    
    // Check if it's a numeric ID or a slug
    if (/^\d+$/.test(idOrSlug)) {
      // It's a numeric ID
      job = await db.jobs.get(parseInt(idOrSlug))
    } else {
      // It's a slug
      const jobs = await db.jobs.toArray()
      job = jobs.find(j => j.slug === idOrSlug)
    }
    
    if (!job) {
      return HttpResponse.json({ error: 'Job not found' }, { status: 404 })
    }
    
    return HttpResponse.json(job)
  }),
  
  http.get('/api/jobs/slug/:slug', async ({ params }) => {
    const networkError = await handleNetworkSimulation()
    if (networkError) return networkError
    
    const jobs = await db.jobs.toArray()
    const job = jobs.find(j => j.slug === params.slug)
    
    if (!job) {
      return HttpResponse.json({ error: 'Job not found' }, { status: 404 })
    }
    
    return HttpResponse.json(job)
  }),
  
  http.post('/api/jobs', async ({ request }) => {
    const networkError = await handleNetworkSimulation()
    if (networkError) return networkError
    
    const jobData = await request.json()
    const newJob = {
      ...jobData,
      id: Date.now(),
      created_at: new Date(),
      updated_at: new Date(),
      slug: jobData.title.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') + '-' + Date.now()
    }
    
    await db.jobs.add(newJob)
    return HttpResponse.json(newJob, { status: 201 })
  }),
  
  http.put('/api/jobs/:id', async ({ params, request }) => {
    const networkError = await handleNetworkSimulation()
    if (networkError) return networkError
    
    const jobData = await request.json()
    const identifier = params.id
    
    // Try to find job by ID (numeric) or slug
    let existingJob
    const numericId = parseInt(identifier)
    if (!isNaN(numericId)) {
      existingJob = await db.jobs.get(numericId)
    } else {
      // Find by slug
      existingJob = await db.jobs.where('slug').equals(identifier).first()
    }
    
    if (!existingJob) {
      return HttpResponse.json({ error: 'Job not found' }, { status: 404 })
    }
    
    const updatedJob = {
      ...jobData,
      id: existingJob.id,
      updated_at: new Date()
    }
    
    await db.jobs.update(existingJob.id, updatedJob)
    const job = await db.jobs.get(existingJob.id)
    return HttpResponse.json(job)
  }),

  http.patch('/api/jobs/:id', async ({ params, request }) => {
    const networkError = await handleNetworkSimulation()
    if (networkError) return networkError
    
    const jobData = await request.json()
    const identifier = params.id
    
    // Try to find job by ID (numeric) or slug
    let job
    const numericId = parseInt(identifier)
    if (!isNaN(numericId)) {
      job = await db.jobs.get(numericId)
    } else {
      // Find by slug
      job = await db.jobs.where('slug').equals(identifier).first()
    }
    
    if (!job) {
      return HttpResponse.json({ error: 'Job not found' }, { status: 404 })
    }
    
    const updatedData = {
      ...jobData,
      updated_at: new Date()
    }
    
    await db.jobs.update(job.id, updatedData)
    const updatedJob = await db.jobs.get(job.id)
    return HttpResponse.json(updatedJob)
  }),
  
  http.delete('/api/jobs/:id', async ({ params }) => {
    console.log(`DELETE job handler called for: ${params.id}`)
    
    const networkError = await handleNetworkSimulation()
    if (networkError) {
      console.log('Network simulation error in job DELETE handler')
      return networkError
    }
    
    try {
      const identifier = params.id
      console.log(`Looking for job to delete with identifier: ${identifier}`)
      
      // Try to find job by ID (numeric) or slug
      let job
      const numericId = parseInt(identifier)
      if (!isNaN(numericId)) {
        console.log(`Searching for job by numeric ID: ${numericId}`)
        job = await db.jobs.get(numericId)
      } else {
        console.log(`Searching for job by slug: ${identifier}`)
        // Find by slug
        job = await db.jobs.where('slug').equals(identifier).first()
      }
      
      if (!job) {
        console.log(`Job not found: ${identifier}`)
        return HttpResponse.json({ error: 'Job not found' }, { status: 404 })
      }
      
      console.log(`Found job to delete: ${job.title} (ID: ${job.id})`)
      await db.jobs.delete(job.id)
      console.log(`Successfully deleted job ${job.id}`)
      
      return HttpResponse.json({ success: true })
    } catch (error) {
      console.error('Error in job DELETE handler:', error)
      console.error('Error stack:', error.stack)
      return HttpResponse.json({ error: 'Failed to delete job' }, { status: 500 })
    }
  }),

  // Job reorder with PATCH method
  http.patch('/api/jobs/:id/reorder', async ({ params, request }) => {
    const networkError = await handleNetworkSimulation()
    if (networkError) return networkError
    
    // Occasionally return 500 to test rollback as specified
    if (Math.random() < 0.1) {
      return HttpResponse.json({ error: 'Reorder failed' }, { status: 500 })
    }
    
    const { fromOrder, toOrder } = await request.json()
    const identifier = params.id
    
    // Find job by ID or slug
    let job
    const numericId = parseInt(identifier)
    if (!isNaN(numericId)) {
      job = await db.jobs.get(numericId)
    } else {
      job = await db.jobs.where('slug').equals(identifier).first()
    }
    
    if (!job) {
      return HttpResponse.json({ error: 'Job not found' }, { status: 404 })
    }
    
    // Update job order
    await db.jobs.update(job.id, { order: toOrder })
    
    return HttpResponse.json({ success: true, fromOrder, toOrder })
  }),
  
  http.post('/api/jobs/reorder', async ({ request }) => {
    const networkError = await handleNetworkSimulation()
    if (networkError) return networkError
    
    const { jobs } = await request.json()
    console.log('Reordering jobs:', jobs.map(j => ({ id: j.id, title: j.title })))
    
    // Update the order in database
    for (const [index, job] of jobs.entries()) {
      await db.jobs.update(job.id, { order: index, updated_at: new Date() })
      console.log(`Updated job ${job.id} (${job.title}) to order ${index}`)
    }
    
    return HttpResponse.json({ success: true })
  }),

  // Candidates endpoints
  http.get('/api/candidates', async ({ request }) => {
    const networkError = await handleNetworkSimulation()
    if (networkError) return networkError
    
    const url = new URL(request.url)
    const page = parseInt(url.searchParams.get('page')) || 1
    const limit = parseInt(url.searchParams.get('limit')) || 50
    const search = url.searchParams.get('search') || ''
    const position = url.searchParams.get('position') || ''
    const stage = url.searchParams.get('stage') || ''
    const location = url.searchParams.get('location') || ''
    const experience = url.searchParams.get('experience') || ''
    const sort_by = url.searchParams.get('sort_by') || 'created_at'
    const sort_order = url.searchParams.get('sort_order') || 'desc'
    const jobId = url.searchParams.get('jobId')
    
    let candidates = await db.candidates.toArray()
    
    // If jobId is provided, filter candidates by applications to that job
    if (jobId) {
      const applications = await db.applications.toArray()
      const jobApplications = applications.filter(app => app.job_id === parseInt(jobId))
      const candidateIds = jobApplications.map(app => app.candidate_id)
      candidates = candidates.filter(candidate => candidateIds.includes(candidate.id))
    }
    
    const filtered = filterAndSearch(candidates, { search, position, stage, location, experience, sort_by, sort_order })
    const result = paginate(filtered, page, limit)
    
    return HttpResponse.json(result)
  }),
  
  http.get('/api/candidates/stats', async () => {
    const networkError = await handleNetworkSimulation()
    if (networkError) return networkError
    
    const candidates = await db.candidates.toArray()
    const stats = {
      total: candidates.length,
      applied: candidates.filter(c => c.stage === 'applied').length,
      review: candidates.filter(c => c.stage === 'review').length,
      interview: candidates.filter(c => c.stage === 'interview').length,
      assessment: candidates.filter(c => c.stage === 'assessment').length,
      offer: candidates.filter(c => c.stage === 'offer').length,
      hired: candidates.filter(c => c.stage === 'hired').length,
      rejected: candidates.filter(c => c.stage === 'rejected').length
    }
    
    return HttpResponse.json(stats)
  }),
  
  http.get('/api/candidates/positions', async () => {
    const networkError = await handleNetworkSimulation()
    if (networkError) return networkError
    
    const candidates = await db.candidates.toArray()
    const positions = [...new Set(candidates.map(c => c.position))].sort()
    
    return HttpResponse.json(positions)
  }),
  
  http.get('/api/candidates/locations', async () => {
    const networkError = await handleNetworkSimulation()
    if (networkError) return networkError
    
    const candidates = await db.candidates.toArray()
    const locations = [...new Set(candidates.map(c => c.location))].sort()
    
    return HttpResponse.json(locations)
  }),
  
  http.get('/api/candidates/by-stage', async () => {
    const networkError = await handleNetworkSimulation()
    if (networkError) return networkError
    
    const candidates = await db.candidates.toArray()
    const byStage = {
      applied: candidates.filter(c => c.stage === 'applied'),
      review: candidates.filter(c => c.stage === 'review'),
      interview: candidates.filter(c => c.stage === 'interview'),
      assessment: candidates.filter(c => c.stage === 'assessment'),
      offer: candidates.filter(c => c.stage === 'offer'),
      hired: candidates.filter(c => c.stage === 'hired'),
      rejected: candidates.filter(c => c.stage === 'rejected')
    }
    
    return HttpResponse.json(byStage)
  }),
  
  http.get('/api/candidates/:id', async ({ params }) => {
    console.log(`GET candidate handler called for: ${params.id}`)
    
    const networkError = await handleNetworkSimulation()
    if (networkError) {
      console.log('Network simulation error in candidate GET handler')
      return networkError
    }
    
    try {
      const identifier = params.id
      let candidate
      
      // Try to find candidate by ID (numeric) or slug
      const numericId = parseInt(identifier)
      if (!isNaN(numericId)) {
        console.log(`Searching for candidate by numeric ID: ${numericId}`)
        candidate = await db.candidates.get(numericId)
      } else {
        console.log(`Searching for candidate by slug: ${identifier}`)
        // Find by slug
        candidate = await db.candidates.where('slug').equals(identifier).first()
      }
      
      if (!candidate) {
        console.log(`Candidate not found: ${identifier}`)
        return HttpResponse.json({ error: 'Candidate not found' }, { status: 404 })
      }
      
      console.log(`Candidate found: ${candidate.name} (ID: ${candidate.id})`)
      return HttpResponse.json(candidate)
    } catch (error) {
      console.error('Error in candidate GET handler:', error)
      console.error('Error stack:', error.stack)
      return HttpResponse.json({ error: 'Failed to fetch candidate' }, { status: 500 })
    }
  }),
  
  http.post('/api/candidates', async ({ request }) => {
    const networkError = await handleNetworkSimulation()
    if (networkError) return networkError
    
    const candidateData = await request.json()
    const newCandidate = {
      ...candidateData,
      id: Date.now(),
      created_at: new Date(),
      updated_at: new Date()
    }
    
    await db.candidates.add(newCandidate)
    return HttpResponse.json(newCandidate, { status: 201 })
  }),
  
  http.put('/api/candidates/:id', async ({ params, request }) => {
    const networkError = await handleNetworkSimulation()
    if (networkError) return networkError
    
    const candidateData = await request.json()
    const id = parseInt(params.id)
    
    const updatedCandidate = {
      ...candidateData,
      id,
      updated_at: new Date()
    }
    
    await db.candidates.update(id, updatedCandidate)
    const candidate = await db.candidates.get(id)
    return HttpResponse.json(candidate)
  }),

  http.patch('/api/candidates/:id', async ({ params, request }) => {
    const networkError = await handleNetworkSimulation()
    if (networkError) return networkError
    
    const candidateData = await request.json()
    const id = parseInt(params.id)
    
    await db.candidates.update(id, { 
      ...candidateData,
      updated_at: new Date() 
    })
    
    const candidate = await db.candidates.get(id)
    return HttpResponse.json(candidate)
  }),

  http.get('/api/candidates/:id/notes', async ({ params }) => {
    console.log(`Notes handler called for candidate: ${params.id}`)
    
    const networkError = await handleNetworkSimulation()
    if (networkError) {
      console.log('Network simulation error in notes handler')
      return networkError
    }
    
    try {
      const identifier = params.id
      console.log(`Looking for candidate with identifier: ${identifier}`)
      
      let candidate
      
      // Try to find candidate by ID (numeric) or slug
      const numericId = parseInt(identifier)
      if (!isNaN(numericId)) {
        console.log(`Searching by numeric ID: ${numericId}`)
        candidate = await db.candidates.get(numericId)
      } else {
        console.log(`Searching by slug: ${identifier}`)
        // Find by slug
        candidate = await db.candidates.where('slug').equals(identifier).first()
      }
      
      console.log(`Candidate found:`, candidate ? `ID ${candidate.id}` : 'Not found')
      
      if (!candidate) {
        // Still return empty notes array even if candidate doesn't exist
        console.log(`Notes requested for non-existent candidate ${identifier}`)
        return HttpResponse.json([])
      }
      
      // Get notes from candidate record (stored as JSON array) or return empty array
      let notes = []
      if (candidate.notes) {
        try {
          notes = typeof candidate.notes === 'string' ? JSON.parse(candidate.notes) : candidate.notes
          if (!Array.isArray(notes)) {
            notes = []
          }
        } catch (e) {
          console.error('Error parsing candidate notes:', e)
          notes = []
        }
      }
      
      // If no notes exist, add some default mock notes for demonstration
      if (notes.length === 0) {
        notes = [
          {
            id: 1,
            candidateId: candidate.id,
            content: "Great candidate with strong technical skills. @john please review the portfolio.",
            author: "Sarah Johnson",
            createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString() // 2 days ago
          },
          {
            id: 2,
            candidateId: candidate.id,
            content: "Scheduled for technical interview next week. @mike can you prepare the coding challenge?",
            author: "David Chen",
            createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString() // 1 day ago
          }
        ]
        
        // Save these default notes back to the candidate
        await db.candidates.update(candidate.id, { 
          notes: JSON.stringify(notes) 
        })
      }
      
      console.log(`Returning ${notes.length} notes for candidate ${candidate.id}`)
      return HttpResponse.json(notes)
    } catch (error) {
      console.error('Error in notes handler:', error)
      console.error('Error stack:', error.stack)
      return HttpResponse.json({ error: 'Failed to fetch notes' }, { status: 500 })
    }
  }),

  http.post('/api/candidates/:id/notes', async ({ params, request }) => {
    console.log(`POST notes handler called for candidate: ${params.id}`)
    
    const networkError = await handleNetworkSimulation()
    if (networkError) {
      console.log('Network simulation error in POST notes handler')
      return networkError
    }
    
    try {
      const noteData = await request.json()
      console.log('Note data received:', noteData)
      
      const candidateId = parseInt(params.id)
      console.log(`Looking for candidate with ID: ${candidateId}`)
      
      // Find the candidate
      const candidate = await db.candidates.get(candidateId)
      if (!candidate) {
        console.log(`Candidate ${candidateId} not found`)
        return HttpResponse.json({ error: 'Candidate not found' }, { status: 404 })
      }
      
      console.log(`Candidate found:`, candidate.name)
      
      // Get existing notes
      let existingNotes = []
      if (candidate.notes) {
        try {
          existingNotes = typeof candidate.notes === 'string' ? JSON.parse(candidate.notes) : candidate.notes
          if (!Array.isArray(existingNotes)) {
            existingNotes = []
          }
          console.log(`Found ${existingNotes.length} existing notes`)
        } catch (e) {
          console.error('Error parsing existing notes:', e)
          existingNotes = []
        }
      } else {
        console.log('No existing notes found')
      }
      
      // Create new note
      const newNote = {
        id: Date.now(),
        candidateId: candidateId,
        content: noteData.content,
        author: noteData.author || 'Current User',
        createdAt: new Date().toISOString()
      }
      
      console.log('Created new note:', newNote)
      
      // Add new note to existing notes
      const updatedNotes = [newNote, ...existingNotes]
      console.log(`Total notes after adding: ${updatedNotes.length}`)
      
      // Save back to database
      console.log('Saving notes to database...')
      await db.candidates.update(candidateId, {
        notes: JSON.stringify(updatedNotes)
      })
      
      console.log(`Successfully added note to candidate ${candidateId}. Total notes: ${updatedNotes.length}`)
      return HttpResponse.json(newNote, { status: 201 })
    } catch (error) {
      console.error('Error adding note:', error)
      console.error('Error stack:', error.stack)
      return HttpResponse.json({ error: 'Failed to add note' }, { status: 500 })
    }
  }),

  // Candidate timeline endpoint
  http.get('/api/candidates/:id/timeline', async ({ params }) => {
    const networkError = await handleNetworkSimulation()
    if (networkError) return networkError
    
    const candidateId = parseInt(params.id)
    const candidate = await db.candidates.get(candidateId)
    
    if (!candidate) {
      return HttpResponse.json({ error: 'Candidate not found' }, { status: 404 })
    }
    
    // Generate mock timeline events
    const timeline = [
      {
        id: 1,
        type: 'application_submitted',
        title: 'Application Submitted',
        description: 'Candidate submitted application',
        timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        stage: 'applied'
      },
      {
        id: 2,
        type: 'screen_scheduled',
        title: 'Phone Screen Scheduled',
        description: 'Initial phone screen scheduled',
        timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        stage: 'screen'
      },
      {
        id: 3,
        type: 'screen_completed',
        title: 'Phone Screen Completed',
        description: 'Candidate passed initial phone screen',
        timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        stage: 'screen'
      },
      {
        id: 4,
        type: 'tech_interview_scheduled',
        title: 'Technical Interview Scheduled',
        description: 'Technical interview with engineering team',
        timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        stage: 'tech'
      }
    ]
    
    return HttpResponse.json(timeline)
  }),
  
  http.put('/api/candidates/:id/stage', async ({ params, request }) => {
    const networkError = await handleNetworkSimulation()
    if (networkError) return networkError
    
    const { stage, notes } = await request.json()
    const id = parseInt(params.id)
    
    await db.candidates.update(id, { 
      stage, 
      notes: notes || '', 
      updated_at: new Date() 
    })
    
    const candidate = await db.candidates.get(id)
    return HttpResponse.json(candidate)
  }),
  
  http.put('/api/candidates/bulk', async ({ request }) => {
    const networkError = await handleNetworkSimulation()
    if (networkError) return networkError
    
    const { updates } = await request.json()
    
    for (const update of updates) {
      await db.candidates.update(update.id, { 
        ...update, 
        updated_at: new Date() 
      })
    }
    
    return HttpResponse.json({ success: true })
  }),
  
  http.delete('/api/candidates/:id', async ({ params }) => {
    const networkError = await handleNetworkSimulation()
    if (networkError) return networkError
    
    const id = parseInt(params.id)
    await db.candidates.delete(id)
    return HttpResponse.json({ success: true })
  }),

  // Applications endpoints
  http.get('/api/applications', async ({ request }) => {
    const networkError = await handleNetworkSimulation()
    if (networkError) return networkError
    
    const url = new URL(request.url)
    const page = parseInt(url.searchParams.get('page')) || 1
    const limit = parseInt(url.searchParams.get('limit')) || 20
    const job_id = url.searchParams.get('job_id')
    const candidate_id = url.searchParams.get('candidate_id')
    const status = url.searchParams.get('status') || ''
    const sort_by = url.searchParams.get('sort_by') || 'applied_at'
    const sort_order = url.searchParams.get('sort_order') || 'desc'
    
    const applications = await db.applications.toArray()
    const filtered = filterAndSearch(applications, { job_id, candidate_id, status, sort_by, sort_order })
    const result = paginate(filtered, page, limit)
    
    return HttpResponse.json(result)
  }),
  
  http.get('/api/applications/stats', async () => {
    const networkError = await handleNetworkSimulation()
    if (networkError) return networkError
    
    const applications = await db.applications.toArray()
    const stats = {
      total: applications.length,
      applied: applications.filter(a => a.status === 'applied').length,
      review: applications.filter(a => a.status === 'review').length,
      interview: applications.filter(a => a.status === 'interview').length,
      assessment: applications.filter(a => a.status === 'assessment').length,
      offer: applications.filter(a => a.status === 'offer').length,
      hired: applications.filter(a => a.status === 'hired').length,
      rejected: applications.filter(a => a.status === 'rejected').length
    }
    
    return HttpResponse.json(stats)
  }),
  
  http.get('/api/applications/:id', async ({ params }) => {
    const networkError = await handleNetworkSimulation()
    if (networkError) return networkError
    
    const application = await db.applications.get(parseInt(params.id))
    if (!application) {
      return HttpResponse.json({ error: 'Application not found' }, { status: 404 })
    }
    
    return HttpResponse.json(application)
  }),
  
  http.post('/api/applications', async ({ request }) => {
    const networkError = await handleNetworkSimulation()
    if (networkError) return networkError
    
    const applicationData = await request.json()
    const newApplication = {
      ...applicationData,
      id: Date.now(),
      applied_at: new Date(),
      stage_history: [
        { stage: 'applied', date: new Date(), notes: 'Application submitted' }
      ]
    }
    
    await db.applications.add(newApplication)
    return HttpResponse.json(newApplication, { status: 201 })
  }),
  
  http.put('/api/applications/:id', async ({ params, request }) => {
    const networkError = await handleNetworkSimulation()
    if (networkError) return networkError
    
    const applicationData = await request.json()
    const id = parseInt(params.id)
    
    await db.applications.update(id, applicationData)
    const application = await db.applications.get(id)
    return HttpResponse.json(application)
  }),
  
  http.put('/api/applications/:id/status', async ({ params, request }) => {
    const networkError = await handleNetworkSimulation()
    if (networkError) return networkError
    
    const { status, notes } = await request.json()
    const id = parseInt(params.id)
    
    const application = await db.applications.get(id)
    if (!application) {
      return HttpResponse.json({ error: 'Application not found' }, { status: 404 })
    }
    
    const updatedStageHistory = [
      ...application.stage_history,
      { stage: status, date: new Date(), notes: notes || '' }
    ]
    
    await db.applications.update(id, { 
      status, 
      notes: notes || '', 
      stage_history: updatedStageHistory 
    })
    
    const updatedApplication = await db.applications.get(id)
    return HttpResponse.json(updatedApplication)
  }),
  
  http.delete('/api/applications/:id', async ({ params }) => {
    const networkError = await handleNetworkSimulation()
    if (networkError) return networkError
    
    const id = parseInt(params.id)
    await db.applications.delete(id)
    return HttpResponse.json({ success: true })
  }),

  // Assessments endpoints
  http.get('/api/assessments', async ({ request }) => {
    const networkError = await handleNetworkSimulation()
    if (networkError) return networkError
    
    const url = new URL(request.url)
    const page = parseInt(url.searchParams.get('page')) || 1
    const limit = parseInt(url.searchParams.get('limit')) || 10
    const job_id = url.searchParams.get('job_id')
    
    const assessments = await db.assessments.toArray()
    const filtered = filterAndSearch(assessments, { job_id })
    const result = paginate(filtered, page, limit)
    
    return HttpResponse.json(result)
  }),
  
  http.get('/api/assessments/stats', async () => {
    const networkError = await handleNetworkSimulation()
    if (networkError) return networkError
    
    const assessments = await db.assessments.toArray()
    const responses = await db.assessment_responses.toArray()
    
    const stats = {
      total_assessments: assessments.length,
      total_responses: responses.length,
      completion_rate: responses.length / (assessments.length * 100) * 100, // Rough estimate
      average_score: responses.reduce((sum, r) => sum + (r.score || 0), 0) / responses.length || 0
    }
    
    return HttpResponse.json(stats)
  }),
  
  http.get('/api/assessments/:id', async ({ params }) => {
    const networkError = await handleNetworkSimulation()
    if (networkError) return networkError
    
    const assessment = await db.assessments.get(parseInt(params.id))
    if (!assessment) {
      return HttpResponse.json({ error: 'Assessment not found' }, { status: 404 })
    }
    
    return HttpResponse.json(assessment)
  }),
  
  http.post('/api/assessments', async ({ request }) => {
    const networkError = await handleNetworkSimulation()
    if (networkError) return networkError
    
    const assessmentData = await request.json()
    const newAssessment = {
      ...assessmentData,
      id: Date.now(),
      created_at: new Date(),
      updated_at: new Date()
    }
    
    await db.assessments.add(newAssessment)
    return HttpResponse.json(newAssessment, { status: 201 })
  }),
  
  http.put('/api/assessments/:id', async ({ params, request }) => {
    const networkError = await handleNetworkSimulation()
    if (networkError) return networkError
    
    const assessmentData = await request.json()
    const id = parseInt(params.id)
    
    const updatedAssessment = {
      ...assessmentData,
      id,
      updated_at: new Date()
    }
    
    await db.assessments.update(id, updatedAssessment)
    const assessment = await db.assessments.get(id)
    return HttpResponse.json(assessment)
  }),
  
  http.post('/api/assessments/:id/duplicate', async ({ params }) => {
    const networkError = await handleNetworkSimulation()
    if (networkError) return networkError
    
    const originalAssessment = await db.assessments.get(parseInt(params.id))
    if (!originalAssessment) {
      return HttpResponse.json({ error: 'Assessment not found' }, { status: 404 })
    }
    
    const duplicatedAssessment = {
      ...originalAssessment,
      id: Date.now(),
      title: `${originalAssessment.title} (Copy)`,
      created_at: new Date(),
      updated_at: new Date()
    }
    
    await db.assessments.add(duplicatedAssessment)
    return HttpResponse.json(duplicatedAssessment, { status: 201 })
  }),
  
  http.delete('/api/assessments/:id', async ({ params }) => {
    const networkError = await handleNetworkSimulation()
    if (networkError) return networkError
    
    const id = parseInt(params.id)
    await db.assessments.delete(id)
    return HttpResponse.json({ success: true })
  }),

  // Job-specific assessment endpoints
  http.get('/api/assessments/:jobId', async ({ params }) => {
    const networkError = await handleNetworkSimulation()
    if (networkError) return networkError
    
    const jobId = parseInt(params.jobId)
    
    // Find assessments for this specific job
    const assessments = await db.assessments.where('job_id').equals(jobId).toArray()
    
    return HttpResponse.json(assessments)
  }),

  http.put('/api/assessments/:jobId', async ({ params, request }) => {
    const networkError = await handleNetworkSimulation()
    if (networkError) return networkError
    
    const jobId = parseInt(params.jobId)
    const assessmentData = await request.json()
    
    // Find existing assessment for this job or create new one
    let assessment = await db.assessments.where('job_id').equals(jobId).first()
    
    if (assessment) {
      // Update existing assessment
      await db.assessments.update(assessment.id, {
        ...assessmentData,
        updated_at: new Date()
      })
      assessment = await db.assessments.get(assessment.id)
    } else {
      // Create new assessment for this job
      const newAssessment = {
        id: Date.now(),
        job_id: jobId,
        ...assessmentData,
        created_at: new Date(),
        updated_at: new Date()
      }
      await db.assessments.add(newAssessment)
      assessment = newAssessment
    }
    
    return HttpResponse.json(assessment)
  }),

  http.post('/api/assessments/:jobId/submit', async ({ params, request }) => {
    const networkError = await handleNetworkSimulation()
    if (networkError) return networkError
    
    const jobId = parseInt(params.jobId)
    const responseData = await request.json()
    
    // Create assessment response and store locally
    const response = {
      id: Date.now(),
      job_id: jobId,
      assessment_id: responseData.assessment_id,
      candidate_id: responseData.candidate_id,
      responses: responseData.responses,
      score: responseData.score || null,
      submitted_at: new Date(),
      status: 'submitted'
    }
    
    // Store in IndexedDB for local persistence
    await db.assessment_responses.add(response)
    
    return HttpResponse.json(response, { status: 201 })
  }),

  // Assessment responses endpoints
  http.get('/api/assessment-responses', async ({ request }) => {
    const networkError = await handleNetworkSimulation()
    if (networkError) return networkError
    
    const url = new URL(request.url)
    const page = parseInt(url.searchParams.get('page')) || 1
    const limit = parseInt(url.searchParams.get('limit')) || 20
    const assessment_id = url.searchParams.get('assessment_id')
    const candidate_id = url.searchParams.get('candidate_id')
    
    const responses = await db.assessment_responses.toArray()
    const filtered = filterAndSearch(responses, { assessment_id, candidate_id })
    const result = paginate(filtered, page, limit)
    
    return HttpResponse.json(result)
  }),
  
  http.get('/api/assessment-responses/:id', async ({ params }) => {
    const networkError = await handleNetworkSimulation()
    if (networkError) return networkError
    
    const response = await db.assessment_responses.get(parseInt(params.id))
    if (!response) {
      return HttpResponse.json({ error: 'Assessment response not found' }, { status: 404 })
    }
    
    return HttpResponse.json(response)
  }),
  
  http.post('/api/assessment-responses', async ({ request }) => {
    const networkError = await handleNetworkSimulation()
    if (networkError) return networkError
    
    const responseData = await request.json()
    const newResponse = {
      ...responseData,
      id: Date.now(),
      completed_at: new Date()
    }
    
    await db.assessment_responses.add(newResponse)
    return HttpResponse.json(newResponse, { status: 201 })
  }),
  
  http.put('/api/assessment-responses/:id', async ({ params, request }) => {
    const networkError = await handleNetworkSimulation()
    if (networkError) return networkError
    
    const responseData = await request.json()
    const id = parseInt(params.id)
    
    await db.assessment_responses.update(id, responseData)
    const response = await db.assessment_responses.get(id)
    return HttpResponse.json(response)
  }),

  // Dashboard stats
  http.get('/api/stats', async () => {
    const networkError = await handleNetworkSimulation()
    if (networkError) return networkError
    
    const totalJobs = await db.jobs.count()
    const activeJobs = await db.jobs.where('status').equals('active').count()
    const totalCandidates = await db.candidates.count()
    const totalAssessments = await db.assessments.count()
    
    // Calculate hire rate (mock calculation)
    const hireRate = Math.round((activeJobs / totalJobs) * 100) || 0
    
    return HttpResponse.json({
      activeJobs,
      totalCandidates,
      totalAssessments,
      hireRate: `${hireRate}%`
    })
  })
]