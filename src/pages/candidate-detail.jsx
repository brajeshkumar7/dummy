import { useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  ArrowLeft,
  Edit,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Star,
  Eye,
  Clock,
  User,
  Building2,
  GraduationCap,
  ChevronRight,
  FileTextIcon,
  ClipboardCheck,
  Award,
  Briefcase,
  XCircle
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from 'sonner'
import { formatDistanceToNow, format } from 'date-fns'
import { useUpdateCandidateStatus } from '@/hooks/useCandidates'; // Adjust path if necessary


export default function CandidateDetailPage() {
  const { candidateId } = useParams()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [newNote, setNewNote] = useState('')

  // Fetch candidate details
  const { data: candidate, isLoading, error } = useQuery({
    queryKey: ['candidate', candidateId],
    queryFn: async () => {
      const response = await fetch(`/api/candidates/${candidateId}`)
      if (!response.ok) {
        throw new Error('Candidate not found')
      }
      return response.json()
    }
  })

  // Fetch candidate notes
  const { data: notes = [] } = useQuery({
    queryKey: ['candidate-notes', candidateId],
    queryFn: async () => {
      const response = await fetch(`/api/candidates/${candidateId}/notes`)
      if (!response.ok) {
        throw new Error('Failed to fetch notes')
      }
      const data = await response.json()
      // Ensure we always return an array
      return Array.isArray(data) ? data : []
    },
    enabled: !!candidateId
  })

  // Fetch job details for this candidate
  const { data: job } = useQuery({
    queryKey: ['job', candidate?.jobId],
    queryFn: async () => {
      const response = await fetch(`/api/jobs/${candidate.jobId}`)
      return response.json()
    },
    enabled: !!candidate?.jobId
  })

  // Update candidate status mutation
  /*const updateStatusMutation = useMutation({
    mutationFn: async ({ candidateId, status }) => {
      const response = await fetch(`/api/candidates/${candidateId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status })
      })
      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['candidate', candidateId])
      queryClient.invalidateQueries(['candidates'])
      toast.success('Candidate status updated successfully')
    },
    onError: () => {
      toast.error('Failed to update candidate status')
    }
  })*/

  /*const updateStatusMutation = useMutation({
    mutationFn: async ({ candidateId, status }) => {
      const response = await fetch(`/api/candidates/${candidateId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status })
      })
      return response.json()
    },
    onSuccess: () => {
      // Invalidate the specific candidate query
      queryClient.invalidateQueries({ queryKey: ['candidate', candidateId] })
      // Invalidate ALL queries that start with ['candidates'] to refresh the list and kanban views
      queryClient.invalidateQueries({ queryKey: ['candidates'] })
      toast.success('Candidate status updated successfully')
    },
    onError: () => {
      toast.error('Failed to update candidate status')
    }
  })*/

  const { mutate: updateStatus, isLoading: isUpdatingStatus } = useUpdateCandidateStatus();

  // Add note mutation
  const addNoteMutation = useMutation({
    mutationFn: async ({ candidateId, content }) => {
      const response = await fetch(`/api/candidates/${candidateId}/notes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content,
          author: 'Current User', // In real app, get from auth context
          createdAt: new Date().toISOString()
        })
      })
      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['candidate-notes', candidateId])
      setNewNote('')
      toast.success('Note added successfully')
    },
    onError: () => {
      toast.error('Failed to add note')
    }
  })

  const handleStatusChange = (stage) => {
    //updateStatusMutation.mutate({ candidateId, stage })
    updateStatus({ id: candidateId, stage: stage })
  }

  const handleAddNote = () => {
    if (newNote.trim()) {
      addNoteMutation.mutate({ candidateId, content: newNote.trim() })
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-sm text-muted-foreground">Loading candidate details...</p>
        </div>
      </div>
    )
  }

  if (error || !candidate) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-lg font-semibold text-destructive">Candidate not found</p>
          <p className="text-sm text-muted-foreground mt-1">
            The candidate you're looking for doesn't exist or has been removed.
          </p>
          <Button
            variant="outline"
            onClick={() => navigate('/app/candidates')}
            className="mt-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Candidates
          </Button>
        </div>
      </div>
    )
  }

  const getTimelineIcon = (stage) => {
    switch (stage) {
      case 'applied': return <User className="h-4 w-4 text-white" />;
      case 'screen': return <FileTextIcon className="h-4 w-4 text-white" />;
      case 'test': return <ClipboardCheck className="h-4 w-4 text-white" />;
      case 'offer': return <Award className="h-4 w-4 text-white" />;
      case 'hired': return <Briefcase className="h-4 w-4 text-white" />;
      case 'rejected': return <XCircle className="h-4 w-4 text-white" />;
      default: return <Eye className="h-4 w-4 text-white" />;
    }
  };

  const getTimelineColor = (stage) => {
    switch (stage) {
      case 'applied': return 'from-purple-500 to-pink-500';
      case 'screen': return 'from-yellow-500 to-orange-500';
      case 'test': return 'from-blue-500 to-cyan-500';
      case 'offer': return 'from-lime-500 to-green-500';
      case 'hired': return 'from-emerald-500 to-teal-500';
      case 'rejected': return 'from-red-500 to-rose-500';
      default: return 'from-gray-500 to-gray-600';
    }
  };
  const sortedHistory = Array.isArray(candidate.stage_history)
    ? [...candidate.stage_history].sort((a, b) => new Date(a.date) - new Date(b.date))
    : [];

  const getStatusBadgeVariant = (status) => {
    switch (status) {
      case 'applied': return 'default'
      case 'screen': return 'secondary'
      case 'test': return 'outline'
      case 'offer': return 'default'
      case 'hired': return 'default'
      case 'rejected': return 'destructive'
      default: return 'outline'
    }
  }

  const stageOptions = [
    { value: 'applied', label: 'Applied' },
    { value: 'screen', label: 'Screening' },
    { value: 'test', label: 'Test' },
    { value: 'offer', label: 'Offer' },
    { value: 'hired', label: 'Hired' },
    { value: 'rejected', label: 'Rejected' }
  ]

  // Process notes to handle @mentions
  const processNoteContent = (content) => {
    return content.replace(/@(\w+)/g, '<span class="text-blue-600 font-medium">@$1</span>')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 dark:from-black dark:via-slate-950 dark:to-black relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-2000"></div>
        <div className="absolute top-40 left-40 w-80 h-80 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-4000"></div>
      </div>

      {/* Grid pattern overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>

      <div className="relative z-20 space-y-6 p-6 lg:p-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/app/candidates')}
              className="bg-white/10 border-white/20 text-white hover:bg-white/20"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Candidates
            </Button>
            <div className="flex items-center space-x-4">
              <Avatar className="h-12 w-12">
                <AvatarImage src={candidate.avatar} alt={candidate.name} />
                <AvatarFallback className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">
                  {candidate.name.split(' ').map(n => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
              <div>
                <h1 className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-white via-purple-200 to-pink-200 bg-clip-text text-transparent">
                  {candidate.name}
                </h1>
                <p className="text-gray-300 text-lg">{candidate.email}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Status and Job Info */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium text-gray-300">Stage:</span>
              <Select value={candidate.stage} onValueChange={handleStatusChange}>
                <SelectTrigger className="w-40 bg-white/10 border-white/20 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-white/20">
                  {stageOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value} className="text-white hover:bg-white/10">
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {job && (
              <div className="flex items-center space-x-2 text-sm text-gray-300">
                <span>Applied for:</span>
                <Link
                  to={`/app/jobs/${job.id}`}
                  className="text-purple-300 hover:text-purple-200 hover:underline font-medium"
                >
                  {job.title}
                </Link>
              </div>
            )}
          </div>
          <p className="text-sm text-gray-400">
            {candidate.appliedAt ? (
              `Applied ${formatDistanceToNow(new Date(candidate.appliedAt), { addSuffix: true })}`
            ) : (
              `Created ${formatDistanceToNow(new Date(candidate.created_at), { addSuffix: true })}`
            )}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Contact Information */}
            <Card className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-lg border border-white/20 shadow-2xl rounded-3xl">
              <CardHeader>
                <CardTitle className="text-white text-xl">Contact Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center space-x-2">
                    <Mail className="h-4 w-4 text-gray-400" />
                    <div>
                      <p className="text-sm font-medium text-gray-300">Email</p>
                      <p className="text-sm text-white">{candidate.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Phone className="h-4 w-4 text-gray-400" />
                    <div>
                      <p className="text-sm font-medium text-gray-300">Phone</p>
                      <p className="text-sm text-white">{candidate.phone}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <MapPin className="h-4 w-4 text-gray-400" />
                    <div>
                      <p className="text-sm font-medium text-gray-300">Location</p>
                      <p className="text-sm text-white">{candidate.location}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-4 w-4 text-gray-400" />
                    <div>
                      <p className="text-sm font-medium text-gray-300">Experience</p>
                      <p className="text-sm text-white">{candidate.experience} years</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Timeline */}
            <Card className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-lg border border-white/20 shadow-2xl rounded-3xl">
              <CardHeader>
                <CardTitle className="text-white text-xl">Application Timeline</CardTitle>
              </CardHeader>
              <CardContent>
                {/*<div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <div className="h-8 w-8 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
                      <User className="h-4 w-4 text-white" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-white">Application Submitted</p>
                      <p className="text-xs text-gray-400">
                        {candidate.appliedAt ? format(new Date(candidate.appliedAt), 'PPp') : format(new Date(candidate.created_at), 'PPp')}
                      </p>
                    </div>
                  </div>

                  {candidate.stage !== 'applied' && (
                    <div className="flex items-center space-x-3">
                      <div className="h-8 w-8 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 flex items-center justify-center">
                        <Eye className="h-4 w-4 text-white" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-white">Stage Updated to {candidate.stage}</p>
                        <p className="text-xs text-gray-400">
                          {format(new Date(candidate.updatedAt || candidate.updated_at || candidate.created_at), 'PPp')}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
                */}

                <div className="space-y-4 max-h-40 overflow-y-auto pr-2">
                  {sortedHistory.length > 0 ? (
                    sortedHistory.map((event, index) => (
                      <div key={index} className="flex items-center space-x-3">
                        <div className={`h-8 w-8 rounded-full bg-gradient-to-r ${getTimelineColor(event.stage)} flex items-center justify-center`}>
                          {getTimelineIcon(event.stage)}
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-white">
                            Stage: <span className="capitalize">{event.stage}</span>
                          </p>
                          <p className="text-xs text-gray-400">
                            {format(new Date(event.date), 'PPp')}
                          </p>
                        </div>
                      </div>
                    ))
                  ) : (
                    // Fallback for candidates without history yet
                    <div className="flex items-center space-x-3">
                      <div className="h-8 w-8 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
                        <User className="h-4 w-4 text-white" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-white">Application Submitted</p>
                        <p className="text-xs text-gray-400">
                          {format(new Date(candidate.created_at), 'PPp')}
                        </p>
                      </div>
                    </div>
                  )}
                </div>

              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Notes Section */}
            <Card className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-lg border border-white/20 shadow-2xl rounded-3xl">
              <CardHeader>
                <CardTitle className="text-white text-xl">Notes & Comments</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Add New Note */}
                <div className="space-y-2">
                  <Textarea
                    placeholder="Add a note... Use @username to mention team members"
                    value={newNote}
                    onChange={(e) => setNewNote(e.target.value)}
                    className="min-h-[80px] bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                  />
                  <Button
                    onClick={handleAddNote}
                    disabled={!newNote.trim() || addNoteMutation.isLoading}
                    size="sm"
                    className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white border-none"
                  >
                    Add Note
                  </Button>
                </div>

                <Separator className="bg-white/20" />

                {/* Notes List */}
                <div className="space-y-3 max-h-40 overflow-y-auto pr-2">
                  {Array.isArray(notes) && notes.map((note, index) => (
                    <div key={index} className="border border-white/20 rounded-2xl p-3 space-y-2 bg-white/5">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-white">{note?.author || 'Unknown'}</span>
                        <span className="text-xs text-gray-400">
                          {note?.createdAt ? formatDistanceToNow(new Date(note.createdAt), { addSuffix: true }) : 'Unknown time'}
                        </span>
                      </div>
                      <div
                        className="text-sm text-gray-300"
                        dangerouslySetInnerHTML={{ __html: processNoteContent(note?.content || '') }}
                      />
                    </div>
                  ))}

                  {(!notes || !Array.isArray(notes) || notes.length === 0) && (
                    <p className="text-sm text-gray-400 text-center py-4">
                      No notes yet. Add one above!
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

// Named export for compatibility
export { CandidateDetailPage }