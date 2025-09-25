import { useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  ArrowLeft,
  Edit,
  Archive,
  ArchiveRestore,
  Users,
  Calendar,
  MapPin,
  DollarSign,
  Building2,
  Clock,
  Star
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { useApplications } from '@/hooks/useApplications'
import { toast } from 'sonner'
import { formatDistanceToNow } from 'date-fns'

export default function JobDetailPage() {
  const { jobId } = useParams()
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  // Fetch job details
  const { data: job, isLoading, error } = useQuery({
    queryKey: ['job', jobId],
    queryFn: async () => {
      const response = await fetch(`/api/jobs/${jobId}`)
      if (!response.ok) {
        throw new Error('Job not found')
      }
      return response.json()
    }
  })

  // Fetch candidates for this job (use numeric job.id once loaded to avoid slug issues)
  const { data: candidatesData = { data: [] } } = useQuery({
    queryKey: ['job-candidates', job?.id],
    queryFn: async () => {
      const response = await fetch(`/api/candidates?jobId=${job.id}`)
      return response.json()
    },
    enabled: !!job && !!job.id
  })

  // Extract candidates array from paginated response
  const candidates = Array.isArray(candidatesData) ? candidatesData : (candidatesData.data || [])

  // Fetch applications for this job (ensure numeric job.id)
  const { data: applicationsResp } = useApplications({ job_id: job?.id, limit: 1000 })
  const applications = Array.isArray(applicationsResp?.data) ? applicationsResp.data : (applicationsResp || [])

  // Archive/Unarchive mutation
  const archiveMutation = useMutation({
    /*mutationFn: async ({ jobId, archived }) => {
      const response = await fetch(`/api/jobs/${jobId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
       body: JSON.stringify({ archived })
       body: JSON.stringify({ status: newStatus })
      })
      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['job', jobId])
      queryClient.invalidateQueries(['jobs'])
      toast.success(job?.archived ? 'Job unarchived successfully' : 'Job archived successfully')
    },*/
    mutationFn: async ({ jobId, newStatus }) => {
      const response = await fetch(`/api/jobs/${jobId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        // Send the new status instead of the archived boolean
        body: JSON.stringify({ status: newStatus })
      })
      return response.json()
    },
    onSuccess: (updatedJob) => {
      queryClient.invalidateQueries({ queryKey: ['job', jobId] })
      queryClient.invalidateQueries({ queryKey: ['jobs'] })
      // Use the new status from the response to show the correct toast
      toast.success(updatedJob.status === 'archived' ? 'Job archived successfully' : 'Job restored successfully')
    },
    onError: () => {
      toast.error('Failed to update job status')
    }
  })

  const handleArchiveToggle = () => {
    /*archiveMutation.mutate({
      jobId,
      archived: !job.archived
    })*/
    const newStatus = job.status === 'archived' ? 'active' : 'archived'
    archiveMutation.mutate({
      jobId,
      newStatus
    })
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-sm text-muted-foreground">Loading job details...</p>
        </div>
      </div>
    )
  }

  if (error || !job) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-lg font-semibold text-destructive">Job not found</p>
          <p className="text-sm text-muted-foreground mt-1">
            The job you're looking for doesn't exist or has been removed.
          </p>
          <Button
            variant="outline"
            onClick={() => navigate('/app/jobs')}
            className="mt-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Jobs
          </Button>
        </div>
      </div>
    )
  }

  const getStatusBadgeVariant = (status) => {
    switch (status) {
      case 'active': return 'default'
      case 'paused': return 'secondary'
      case 'closed': return 'destructive'
      case 'archived': return 'outline'
      default: return 'outline'
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'active': return <Star className="h-3 w-3" />
      case 'paused': return <Clock className="h-3 w-3" />
      case 'archived': return <Archive className="h-3 w-3" />
      default: return null
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 dark:from-black dark:via-slate-950 dark:to-black relative overflow-hidden">
      {/* Enhanced animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute top-40 left-40 w-80 h-80 bg-gradient-to-r from-orange-500 to-red-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      {/* Enhanced grid pattern overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-[size:32px_32px]"></div>

      <div className="relative z-20 space-y-8 p-6 lg:p-8">
        {/* Enhanced Header */}
        <div className="relative">
          <div className="absolute -top-5 -left-5 w-20 h-20 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-full blur-2xl"></div>
          <div className="relative">
            <div className="space-y-4">
              <div className="space-y-2">
                <h1 className="text-4xl lg:text-5xl font-bold tracking-tight">
                  <span className="bg-gradient-to-r from-white via-blue-200 to-cyan-200 bg-clip-text text-transparent">
                    {job.title}
                  </span>
                </h1>
                <p className="text-gray-300 text-lg">{job.company}</p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/app/jobs')}
                className="border-white/20 text-gray-300 hover:bg-white/10 hover:text-white rounded-xl backdrop-blur-sm transition-all duration-200"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Jobs
              </Button>
            </div>
            <div className="flex items-center justify-end mt-4">
              <div className="flex items-center space-x-3">
                <Button
                  variant="outline"
                  onClick={() => navigate(`/app/jobs/${jobId}/edit`)}
                  className="border-white/20 text-gray-300 hover:bg-white/10 hover:text-white rounded-xl backdrop-blur-sm transition-all duration-200"
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Job
                </Button>
                <Button asChild variant="outline" className="border-white/20 text-gray-300 hover:bg-white/10 hover:text-white rounded-xl">
                  <Link to={`/app/jobs/${jobId}/assessment`}>Assessment Builder</Link>
                </Button>
                <Button asChild variant="outline" className="border-white/20 text-gray-300 hover:bg-white/10 hover:text-white rounded-xl">
                  <Link to={`/app/jobs/${jobId}/assessments`}>Show Assessments</Link>
                </Button>
                <Button
                  variant={job.status === 'archived' ? "default" : "outline"}
                  onClick={handleArchiveToggle}
                  disabled={archiveMutation.isPending} // Changed from isLoading
                  className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white border-none shadow-lg hover:shadow-orange-500/25 rounded-xl transition-all duration-200 transform hover:scale-[1.02]"
                >
                  {job.status === 'archived' ? (
                    <>
                      <ArchiveRestore className="h-4 w-4 mr-2" />
                      Unarchive Job
                    </>
                  ) : (
                    <>
                      <Archive className="h-4 w-4 mr-2" />
                      Archive Job
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Status and Archive Notice */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Badge variant={getStatusBadgeVariant(job.status)} className="flex items-center space-x-1 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 border border-blue-500/30 text-blue-200 rounded-xl px-3 py-1">
              {getStatusIcon(job.status)}
              <span className="capitalize">{job.status}</span>
            </Badge>
            {/*{job.archived && (
              <Badge variant="secondary" className="bg-gradient-to-r from-orange-500/20 to-red-500/20 border border-orange-500/30 text-orange-200 rounded-xl">
                <Archive className="h-3 w-3 mr-1" />
                Archived
              </Badge>
            )}*/}
          </div>
          <p className="text-sm text-gray-300">
            Posted {job.createdAt ? formatDistanceToNow(new Date(job.createdAt), { addSuffix: true }) : 'recently'}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Enhanced Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Enhanced Job Details Card */}
            <div className="relative">
              <div className="absolute -top-10 -left-10 w-32 h-32 bg-gradient-to-r from-blue-500/10 to-cyan-500/10 rounded-full blur-3xl"></div>
              <Card className="relative bg-gradient-to-br from-white/10 via-white/5 to-transparent backdrop-blur-2xl border border-white/10 shadow-2xl rounded-3xl overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-transparent to-cyan-500/5 opacity-50"></div>
                <CardHeader className="relative border-b border-white/10 bg-gradient-to-r from-white/5 to-transparent">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500/20 to-cyan-500/20 backdrop-blur-sm border border-white/10 flex items-center justify-center">
                      <Building2 className="h-5 w-5 text-blue-300" />
                    </div>
                    <CardTitle className="text-2xl font-bold bg-gradient-to-r from-white via-blue-200 to-cyan-200 bg-clip-text text-transparent">
                      Job Details
                    </CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="relative space-y-6 p-6">
                  <div className="grid grid-cols-2 gap-6">
                    <div className="flex items-center space-x-3 p-4 rounded-2xl bg-gradient-to-r from-white/5 to-white/10 backdrop-blur-sm border border-white/10">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-500/20 to-emerald-500/20 flex items-center justify-center">
                        <MapPin className="h-5 w-5 text-green-300" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-300">Location</p>
                        <p className="text-white font-medium">{job.location}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3 p-4 rounded-2xl bg-gradient-to-r from-white/5 to-white/10 backdrop-blur-sm border border-white/10">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-yellow-500/20 to-orange-500/20 flex items-center justify-center">
                        <DollarSign className="h-5 w-5 text-yellow-300" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-300">Salary</p>
                        <p className="text-white font-medium">{job.salary_range}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3 p-4 rounded-2xl bg-gradient-to-r from-white/5 to-white/10 backdrop-blur-sm border border-white/10">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center">
                        <Building2 className="h-5 w-5 text-purple-300" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-300">Department</p>
                        <p className="text-white font-medium">{job.department}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3 p-4 rounded-2xl bg-gradient-to-r from-white/5 to-white/10 backdrop-blur-sm border border-white/10">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500/20 to-indigo-500/20 flex items-center justify-center">
                        <Clock className="h-5 w-5 text-blue-300" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-300">Type</p>
                        <p className="text-white font-medium capitalize">{job.employment_type}</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Enhanced Job Description */}
            <div className="relative">
              <div className="absolute -top-4 -right-4 w-24 h-24 bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-full blur-2xl"></div>
              <Card className="relative bg-gradient-to-br from-white/10 via-white/5 to-transparent backdrop-blur-2xl border border-white/10 shadow-2xl rounded-3xl overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 via-transparent to-pink-500/5 opacity-50"></div>
                <CardHeader className="relative border-b border-white/10 bg-gradient-to-r from-white/5 to-transparent">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 backdrop-blur-sm border border-white/10 flex items-center justify-center">
                      <Edit className="h-5 w-5 text-purple-300" />
                    </div>
                    <CardTitle className="text-2xl font-bold bg-gradient-to-r from-white via-purple-200 to-pink-200 bg-clip-text text-transparent">
                      Description
                    </CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="relative p-6">
                  <div className="prose prose-sm max-w-none">
                    <p className="whitespace-pre-wrap text-gray-300 leading-relaxed">{job.description}</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Enhanced Requirements */}
            <div className="relative">
              <div className="absolute -top-4 -left-4 w-24 h-24 bg-gradient-to-r from-orange-500/10 to-red-500/10 rounded-full blur-2xl"></div>
              <Card className="relative bg-gradient-to-br from-white/10 via-white/5 to-transparent backdrop-blur-2xl border border-white/10 shadow-2xl rounded-3xl overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 via-transparent to-red-500/5 opacity-50"></div>
                <CardHeader className="relative border-b border-white/10 bg-gradient-to-r from-white/5 to-transparent">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500/20 to-red-500/20 backdrop-blur-sm border border-white/10 flex items-center justify-center">
                      <Star className="h-5 w-5 text-orange-300" />
                    </div>
                    <CardTitle className="text-2xl font-bold bg-gradient-to-r from-white via-orange-200 to-red-200 bg-clip-text text-transparent">
                      Requirements
                    </CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="relative p-6">
                  <div className="prose prose-sm max-w-none">
                    <p className="whitespace-pre-wrap text-gray-300 leading-relaxed">{job.requirements}</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Enhanced Sidebar */}
          <div className="space-y-8">
            {/* Enhanced Candidates Overview */}
            <div className="relative">
              <div className="absolute -top-6 -right-6 w-20 h-20 bg-gradient-to-r from-green-500/10 to-emerald-500/10 rounded-full blur-2xl"></div>
              <Card className="relative bg-gradient-to-br from-white/10 via-white/5 to-transparent backdrop-blur-2xl border border-white/10 shadow-2xl rounded-3xl overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 via-transparent to-emerald-500/5 opacity-50"></div>
                <CardHeader className="relative border-b border-white/10 bg-gradient-to-r from-white/5 to-transparent">
                  <CardTitle className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-500/20 to-emerald-500/20 backdrop-blur-sm border border-white/10 flex items-center justify-center">
                      <Users className="h-5 w-5 text-green-300" />
                    </div>
                    <span className="text-xl font-bold bg-gradient-to-r from-white via-green-200 to-emerald-200 bg-clip-text text-transparent">
                      Candidates
                    </span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="relative p-6">
                  <div className="space-y-6">
                    <div className="text-center p-6 rounded-2xl bg-gradient-to-r from-white/5 to-white/10 backdrop-blur-sm border border-white/10">
                      <p className="text-4xl font-bold bg-gradient-to-r from-white to-green-200 bg-clip-text text-transparent">{applications.length}</p>
                      <p className="text-sm text-gray-300 mt-1">Total Applications</p>
                    </div>

                    <Separator className="bg-white/10" />

                    <div className="space-y-3">
                      <div className="flex justify-between text-sm p-3 rounded-xl bg-gradient-to-r from-white/5 to-white/10 backdrop-blur-sm">
                        <span className="text-gray-300">Applied</span>
                        <span className="font-medium text-white">
                          {candidates.filter(c => c.stage === 'applied').length}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm p-3 rounded-xl bg-gradient-to-r from-white/5 to-white/10 backdrop-blur-sm">
                        <span className="text-gray-300">Screening</span>
                        <span className="font-medium text-white">
                          {candidates.filter(c => c.stage === 'screen').length}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm p-3 rounded-xl bg-gradient-to-r from-white/5 to-white/10 backdrop-blur-sm">
                        <span className="text-gray-300">Test</span>
                        <span className="font-medium text-white">
                          {candidates.filter(c => c.stage === 'test').length}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm p-3 rounded-xl bg-gradient-to-r from-white/5 to-white/10 backdrop-blur-sm">
                        <span className="text-gray-300">Offer</span>
                        <span className="font-medium text-white">
                          {candidates.filter(c => c.stage === 'offer').length}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm p-3 rounded-xl bg-gradient-to-r from-green-500/10 to-emerald-500/10 backdrop-blur-sm border border-green-500/20">
                        <span className="text-gray-300">Hired</span>
                        <span className="font-medium text-green-300">
                          {candidates.filter(c => c.stage === 'hired').length}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm p-3 rounded-xl bg-gradient-to-r from-red-500/10 to-pink-500/10 backdrop-blur-sm border border-red-500/20">
                        <span className="text-gray-300">Rejected</span>
                        <span className="font-medium text-red-300">
                          {candidates.filter(c => c.stage === 'rejected').length}
                        </span>
                      </div>
                    </div>

                    <Button
                      asChild
                      className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white border-none shadow-lg hover:shadow-green-500/25 rounded-xl transition-all duration-200 transform hover:scale-[1.02]"
                    >
                      <Link to={`/app/candidates?jobId=${jobId}`}>
                        View All Candidates
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

        {/* Applications List */}
        <div className="relative">
              <div className="absolute -top-4 -left-4 w-20 h-20 bg-gradient-to-r from-blue-500/10 to-indigo-500/10 rounded-full blur-2xl"></div>
          <Card className="relative bg-gradient-to-br from-white/10 via-white/5 to-transparent backdrop-blur-2xl border border-white/10 shadow-2xl rounded-3xl overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-transparent to-indigo-500/5 opacity-50"></div>
                <CardHeader className="relative border-b border-white/10 bg-gradient-to-r from-white/5 to-transparent">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500/20 to-indigo-500/20 backdrop-blur-sm border border-white/10 flex items-center justify-center">
                  <Users className="h-5 w-5 text-blue-300" />
                    </div>
                <CardTitle className="text-xl font-bold bg-gradient-to-r from-white via-blue-200 to-indigo-200 bg-clip-text text-transparent">
                  Applications
                    </CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="relative p-6">
                  <div className="space-y-4">
                    <div className="max-h-44 overflow-y-auto pr-4 space-y-4">
                {applications.map((app) => (
                      <div key={app.id} className="flex items-center space-x-3 p-3 rounded-2xl bg-gradient-to-r from-white/5 to-white/10 backdrop-blur-sm border border-white/10 hover:from-white/10 hover:to-white/15 transition-all duration-200">
                    <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-blue-500/20 to-indigo-500/20 border border-white/10 flex items-center justify-center text-white text-sm">
                      #{app.id}
                    </div>
                        <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-white">
                        Candidate #{app.candidate_id}
                      </div>
                      <p className="text-xs text-gray-400">Stage: {app.stage || app.status || 'applied'}</p>
                        </div>
                    <Badge variant="outline" className="text-xs bg-gradient-to-r from-blue-500/20 to-indigo-500/20 border border-blue-500/30 text-blue-200">
                      {new Date(app.applied_at).toLocaleDateString()}
                    </Badge>
                      </div>
                    ))}
                    </div>

                {applications.length === 0 && (
                      <div className="text-center py-8">
                        <Users className="h-12 w-12 text-gray-500 mx-auto mb-3 opacity-50" />
                        <p className="text-sm text-gray-400">
                      No applications yet for this job
                        </p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// Named export for compatibility
export { JobDetailPage }