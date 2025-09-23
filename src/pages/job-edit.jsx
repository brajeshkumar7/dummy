import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useJobBySlug, useUpdateJob } from '@/hooks/useJobs'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, Plus, X, Edit } from 'lucide-react'
import { toast } from 'sonner'

const departments = [
  'Engineering', 'Product', 'Design', 'Marketing', 'Sales', 'Operations', 'HR', 'Finance'
]

const availableTags = [
  'React', 'Node.js', 'Python', 'TypeScript', 'AWS', 'Docker', 'Kubernetes', 'GraphQL',
  'Machine Learning', 'Data Science', 'Frontend', 'Backend', 'Full Stack', 'DevOps',
  'UI/UX', 'Product Management', 'Marketing', 'Sales', 'Remote', 'Senior', 'Junior'
]

export function JobEditPage() {
  const { jobId } = useParams()
  const navigate = useNavigate()
  //const queryClient = useQueryClient()

  const { data: job, isLoading, error } = useJobBySlug(jobId)

  const [formData, setFormData] = useState({
    title: '',
    department: '',
    description: '',
    requirements: '',
    location: '',
    salary_range: '',
    employment_type: '',
    experience_level: '',
    status: '',
    order: ""
  })

  const [tags, setTags] = useState([])
  const [newTag, setNewTag] = useState('')

  // Populate form when job data loads
  useEffect(() => {
    if (job) {
      const normalize = (value, map) => {
        if (!value) return ''
        const v = String(value).toLowerCase()
        return map.includes(v) ? v : map[0]
      }

      const employmentOptions = ['full-time', 'part-time', 'contract', 'freelance']
      const experienceOptions = ['junior', 'mid', 'senior', 'lead', 'principal']
      const statusOptions = ['active', 'draft', 'paused', 'archived', 'closed']

      const normalizedDepartment = departments.includes(job.department) ? job.department : departments[0]

      setFormData({
        title: job.title || '',
        department: normalizedDepartment,
        description: job.description || '',
        requirements: job.requirements || '',
        location: job.location || '',
        salary_range: job.salary_range || '',
        employment_type: normalize(job.employment_type || 'full-time', employmentOptions),
        experience_level: normalize(job.experience_level || 'mid', experienceOptions),
        status: normalize(job.status || 'draft', statusOptions),
        order: job.order
      })
      setTags(job.tags || [])
    }
  }, [job])

  // Update job mutation
  /*const updateJobMutation = useMutation({
    mutationFn: async (jobData) => {
      const response = await fetch(`/api/jobs/${job.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(jobData)
      })

      if (!response.ok) {
        throw new Error('Failed to update job')
      }

      return response.json()
    },
    onSuccess: (updatedJob) => {
      queryClient.invalidateQueries(['jobs'])
      queryClient.setQueryData(['job', 'slug', jobId], updatedJob)
      toast.success('Job updated successfully!')
      navigate(`/app/jobs/${jobId}`)
    },
    onError: (error) => {
      console.error('Error updating job:', error)
      toast.error('Failed to update job. Please try again.')
    }
  })*/

  const updateJobMutation = useUpdateJob()

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleAddTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setTags([...tags, newTag.trim()])
      setNewTag('')
    }
  }

  const handleRemoveTag = (tagToRemove) => {
    setTags(tags.filter(tag => tag !== tagToRemove))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!formData.title.trim()) {
      toast.error('Please enter a job title')
      return
    }

    // Do not hard-block on department; backend will preserve existing when omitted

    // Build PATCH payload; omit department if empty so server keeps existing
    const jobData = {
      id: job.id,
      title: formData.title,
      description: formData.description,
      requirements: formData.requirements,
      location: formData.location,
      salary_range: formData.salary_range,
      employment_type: formData.employment_type,
      experience_level: formData.experience_level,
      status: formData.status,
      order: formData.order === '' || formData.order == null ? undefined : Number(formData.order),
      tags
    }
    if (formData.department) jobData.department = formData.department

    //updateJobMutation.mutate(jobData)
    updateJobMutation.mutate(jobData, {
      onSuccess: (updatedJob) => {
        toast.success('Job updated successfully!')
        // Navigate to the job's detail page using its slug
        navigate(`/app/jobs/${updatedJob.slug}`)
      },
      onError: (error) => {
        console.error('Error updating job:', error)
        toast.error('Failed to update job. Please try again.')
      }
    })
  }


  const handleCancel = () => {
    navigate(`/app/jobs/${jobId}`)
  }

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded mb-4"></div>
          <div className="h-96 bg-gray-200 rounded"></div>
        </div>
      </div>
    )
  }

  if (error || !job) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Job Not Found</h2>
          <p className="text-gray-600 mb-4">
            The job you're trying to edit could not be found.
          </p>
          <Button onClick={() => navigate('/app/jobs')}>
            Back to Jobs
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 dark:from-black dark:via-slate-950 dark:to-black relative overflow-hidden">
      {/* Enhanced animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-r from-orange-500 to-red-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute top-40 left-40 w-80 h-80 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      {/* Enhanced grid pattern overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-[size:32px_32px]"></div>

      <div className="relative z-20 max-w-4xl mx-auto p-6 space-y-8">
        {/* Enhanced Header */}
        <div className="relative">
          <div className="absolute -top-5 -left-5 w-20 h-20 bg-gradient-to-r from-orange-500/20 to-red-500/20 rounded-full blur-2xl"></div>
          <div className="relative mb-8">
            <Button
              variant="ghost"
              onClick={() => navigate(`/app/jobs/${jobId}`)}
              className="mb-6 border-white/20 text-gray-300 hover:bg-white/10 hover:text-white rounded-xl backdrop-blur-sm transition-all duration-200"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Job Details
            </Button>

            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-orange-500/20 to-red-500/20 backdrop-blur-sm border border-white/10 flex items-center justify-center">
                  <Edit className="h-6 w-6 text-orange-300" />
                </div>
                <div>
                  <h1 className="text-4xl lg:text-5xl font-bold tracking-tight">
                    <span className="bg-gradient-to-r from-white via-orange-200 to-red-200 bg-clip-text text-transparent">
                      Edit Job
                    </span>
                  </h1>
                  <p className="text-gray-300 text-lg mt-1">
                    Update the details for "{job.title}"
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} noValidate>
          {/* Enhanced Job Information Card */}
          <div className="relative">
            <div className="absolute -top-10 -left-10 w-32 h-32 bg-gradient-to-r from-orange-500/10 to-red-500/10 rounded-full blur-3xl"></div>
            <div className="absolute -bottom-10 -right-10 w-24 h-24 bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-full blur-2xl"></div>

            <Card className="relative bg-gradient-to-br from-white/10 via-white/5 to-transparent backdrop-blur-2xl border border-white/10 shadow-2xl rounded-3xl overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 via-transparent to-red-500/5 opacity-50"></div>
              <CardHeader className="relative border-b border-white/10 bg-gradient-to-r from-white/5 to-transparent">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500/20 to-red-500/20 backdrop-blur-sm border border-white/10 flex items-center justify-center">
                    <Edit className="h-5 w-5 text-orange-300" />
                  </div>
                  <CardTitle className="text-2xl font-bold bg-gradient-to-r from-white via-orange-200 to-red-200 bg-clip-text text-transparent">
                    Job Information
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent className="relative space-y-8 p-8">
                {/* Enhanced Basic Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <Label htmlFor="title" className="text-gray-300 font-medium">Job Title *</Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={e => handleInputChange('title', e.target.value)}
                      placeholder="e.g. Senior Frontend Developer"
                      required
                      className="bg-white/5 border-white/10 text-white placeholder-gray-400 focus:border-orange-400/50 focus:ring-orange-400/20 rounded-xl backdrop-blur-sm transition-all duration-200"
                    />
                  </div>

                  <div className="space-y-3">
                    <Label htmlFor="department" className="text-gray-300 font-medium">Department *</Label>
                    <Select
                      value={formData.department}
                      onValueChange={value => handleInputChange('department', value)}
                    >
                      <SelectTrigger className="bg-white/5 border-white/10 text-white focus:border-orange-400/50 focus:ring-orange-400/20 rounded-xl backdrop-blur-sm">
                        <SelectValue placeholder="Select department" />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-800/95 backdrop-blur-xl border-white/10 rounded-xl">
                        {departments.map(dept => (
                          <SelectItem key={dept} value={dept} className="text-white hover:bg-white/10">{dept}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>



                  <div className="space-y-3">
                    <Label htmlFor="location" className="text-gray-300 font-medium">Location</Label>
                    <Input
                      id="location"
                      value={formData.location}
                      onChange={(e) => handleInputChange('location', e.target.value)}
                      placeholder="e.g. New York, NY or Remote"
                      className="bg-white/5 border-white/10 text-white placeholder-gray-400 focus:border-orange-400/50 focus:ring-orange-400/20 rounded-xl backdrop-blur-sm transition-all duration-200"
                    />
                  </div>

                  <div className="space-y-3">
                    <Label htmlFor="salary_range" className="text-gray-300 font-medium">Salary Range</Label>
                    <Input
                      id="salary_range"
                      value={formData.salary_range}
                      onChange={(e) => handleInputChange('salary_range', e.target.value)}
                      placeholder="e.g. $80,000 - $120,000"
                      className="bg-white/5 border-white/10 text-white placeholder-gray-400 focus:border-orange-400/50 focus:ring-orange-400/20 rounded-xl backdrop-blur-sm transition-all duration-200"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-3">
                    <Label htmlFor="employment_type" className="text-gray-300 font-medium">Employment Type</Label>
                    <Select
                      value={formData.employment_type}
                      onValueChange={(value) => handleInputChange('employment_type', value)}
                      required
                    >
                      <SelectTrigger className="bg-white/5 border-white/10 text-white focus:border-orange-400/50 focus:ring-orange-400/20 rounded-xl backdrop-blur-sm">
                        <SelectValue placeholder="Select employement-type" />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-800/95 backdrop-blur-xl border-white/10 rounded-xl">
                        <SelectItem value="full-time" className="text-white hover:bg-white/10">Full-time</SelectItem>
                        <SelectItem value="part-time" className="text-white hover:bg-white/10">Part-time</SelectItem>
                        <SelectItem value="contract" className="text-white hover:bg-white/10">Contract</SelectItem>
                        <SelectItem value="freelance" className="text-white hover:bg-white/10">Internship</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-3">
                    <Label htmlFor="experience_level" className="text-gray-300 font-medium">Experience Level</Label>
                    <Select
                      value={formData.experience_level}
                      onValueChange={value => handleInputChange('experience_level', value)}
                      required
                    >
                      <SelectTrigger className="bg-white/5 border-white/10 text-white focus:border-orange-400/50 focus:ring-orange-400/20 rounded-xl backdrop-blur-sm">
                        <SelectValue placeholder="Select experience-level" />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-800/95 backdrop-blur-xl border-white/10 rounded-xl">
                        <SelectItem value="junior" className="text-white hover:bg-white/10">Entry-Level</SelectItem>
                        <SelectItem value="mid" className="text-white hover:bg-white/10">Mid-Level</SelectItem>
                        <SelectItem value="senior" className="text-white hover:bg-white/10">Senior-Level</SelectItem>
                        <SelectItem value="lead" className="text-white hover:bg-white/10">Lead</SelectItem>
                        <SelectItem value="principal" className="text-white hover:bg-white/10">Executive</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-3">
                    <Label htmlFor="status" className="text-gray-300 font-medium">Status</Label>
                    <Select
                      value={formData.status}
                      onValueChange={(value) => handleInputChange('status', value)}
                      required
                    >
                      <SelectTrigger className="bg-white/5 border-white/10 text-white focus:border-orange-400/50 focus:ring-orange-400/20 rounded-xl backdrop-blur-sm">
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-800/95 backdrop-blur-xl border-white/10 rounded-xl">
                        <SelectItem value="active" className="text-white hover:bg-white/10">Active</SelectItem>
                        <SelectItem value="draft" className="text-white hover:bg-white/10">Draft</SelectItem>
                        <SelectItem value="paused" className="text-white hover:bg-white/10">Paused</SelectItem>
                        <SelectItem value="archived" className="text-white hover:bg-white/10">Archived</SelectItem>
                        <SelectItem value="closed" className="text-white hover:bg-white/10">Closed</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Added Order input field */}
                  <div className="space-y-3">
                    <Label htmlFor="order" className="text-gray-300 font-medium">
                      Order
                    </Label>
                    <Input
                      id="order"
                      type="number"
                      value={formData.order}
                      onChange={e => handleInputChange('order', e.target.value)}
                      placeholder="Enter order (number)"
                      className="bg-white/5 border-white/10 text-white placeholder-gray-400 focus:border-green-400/50 focus:ring-green-400/20 rounded-xl backdrop-blur-sm transition-all duration-200"
                    />
                  </div>
                </div>
                {/* Enhanced Description */}
                <div className="space-y-3">
                  <Label htmlFor="description" className="text-gray-300 font-medium">Job Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    placeholder="Describe the role, responsibilities, and what makes this position exciting..."
                    rows={6}
                    className="bg-white/5 border-white/10 text-white placeholder-gray-400 focus:border-orange-400/50 focus:ring-orange-400/20 rounded-xl backdrop-blur-sm min-h-[150px] resize-none transition-all duration-200"
                  />
                </div>

                {/* Enhanced Requirements */}
                <div className="space-y-3">
                  <Label htmlFor="requirements" className="text-gray-300 font-medium">Requirements</Label>
                  <Textarea
                    id="requirements"
                    value={formData.requirements}
                    onChange={(e) => handleInputChange('requirements', e.target.value)}
                    placeholder="List the required skills, experience, and qualifications..."
                    rows={4}
                    className="bg-white/5 border-white/10 text-white placeholder-gray-400 focus:border-orange-400/50 focus:ring-orange-400/20 rounded-xl backdrop-blur-sm min-h-[120px] resize-none transition-all duration-200"
                  />
                </div>

                {/* Enhanced Tags */}
                <div className="space-y-4">
                  <Label className="text-gray-300 font-medium">Tags</Label>
                  <div className="flex flex-wrap gap-2 mb-4 p-4 rounded-2xl bg-gradient-to-r from-white/5 to-white/10 backdrop-blur-sm border border-white/10">
                    {tags.map((tag, index) => (
                      <Badge key={index} variant="secondary" className="flex items-center gap-2 bg-gradient-to-r from-orange-500/20 to-red-500/20 border border-orange-500/30 text-orange-200 rounded-xl px-3 py-1">
                        {tag}
                        <X
                          className="h-3 w-3 cursor-pointer hover:text-red-300 transition-colors duration-200"
                          onClick={() => handleRemoveTag(tag)}
                        />
                      </Badge>
                    ))}
                    {tags.length === 0 && (
                      <p className="text-gray-400 text-sm">No tags added yet</p>
                    )}
                  </div>

                  <div className="flex gap-3">
                    <Input
                      value={newTag}
                      onChange={(e) => setNewTag(e.target.value)}
                      placeholder="Add a tag..."
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault()
                          handleAddTag()
                        }
                      }}
                      className="flex-1 bg-white/5 border-white/10 text-white placeholder-gray-400 focus:border-orange-400/50 focus:ring-orange-400/20 rounded-xl backdrop-blur-sm transition-all duration-200"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleAddTag}
                      className="border-white/20 text-gray-300 hover:bg-white/10 hover:text-white rounded-xl backdrop-blur-sm transition-all duration-200 px-4"
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>

                  <div className="flex flex-wrap gap-2 mt-3">
                    {availableTags.filter(tag => !tags.includes(tag)).slice(0, 10).map(tag => (
                      <Badge
                        key={tag}
                        variant="outline"
                        className="cursor-pointer hover:bg-white/10 border-white/20 text-gray-300 hover:text-white rounded-xl transition-all duration-200"
                        onClick={() => {
                          setTags([...tags, tag])
                        }}
                      >
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Enhanced Action Buttons */}
                <div className="flex justify-end space-x-4 pt-8">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleCancel}
                    disabled={updateJobMutation.isLoading}
                    className="border-white/20 text-gray-300 hover:bg-white/10 hover:text-white rounded-xl backdrop-blur-sm transition-all duration-200 px-6"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={updateJobMutation.isLoading}
                    className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white border-none shadow-lg hover:shadow-orange-500/25 rounded-xl transition-all duration-200 transform hover:scale-[1.02] px-6"
                  >
                    {updateJobMutation.isLoading ? 'Updating...' : 'Update Job'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </form>
      </div>
    </div>
  )
}