import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { ArrowLeft, Plus, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'

const departments = [
  'Engineering', 'Product', 'Design', 'Marketing', 'Sales', 'Operations', 'HR', 'Finance'
]

const availableTags = [
  'React', 'Node.js', 'Python', 'TypeScript', 'AWS', 'Docker', 'Kubernetes', 'GraphQL',
  'Machine Learning', 'Data Science', 'Frontend', 'Backend', 'Full Stack', 'DevOps',
  'UI/UX', 'Product Management', 'Marketing', 'Sales', 'Remote', 'Senior', 'Junior'
]

export function JobCreatePage() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const [formData, setFormData] = useState({
    id: "",
    title: '',
    department: 'Engineering',
    description: '',
    requirements: '',
    location: '',
    salary_range: '',
    employment_type: 'Full-time',
    experience_level: 'Mid-Level',
    status: 'Draft',
    order: ""
  })

  const [tags, setTags] = useState([])
  const [newTag, setNewTag] = useState('')

  // Create job mutation
  const createJobMutation = useMutation({
    mutationFn: async (jobData) => {
      const response = await fetch('/api/jobs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(jobData),
      })

      if (!response.ok) {
        throw new Error('Failed to create job')
      }

      return response.json()
    },
    onSuccess: (newJob) => {
      queryClient.invalidateQueries({ queryKey: ['jobs'] })
      toast.success('Job created successfully!')
      navigate(`/app/jobs/${newJob.id}`)
    },
    onError: (error) => {
      toast.error('Failed to create job: ' + error.message)
    }
  })

  const handleSubmit = (e) => {
    e.preventDefault()

    // Validation
    if (!formData.title.trim()) {
      toast.error('Job title is required')
      return
    }

    if (!formData.department) {
      toast.error('Department is required')
      return
    }

    if (!formData.description.trim()) {
      toast.error('Job description is required')
      return
    }

    // Generate slug from title
    const slug = formData.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')

    const jobData = {
      ...formData,
      id: formData.id.trim() || undefined,  // Use trimmed id or undefined if empty (allow backend to generate if empty)
      order: Number(formData.order),
      slug,
      tags,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }

    createJobMutation.mutate(jobData)
  }

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const addTag = (tag) => {
    if (tag && !tags.includes(tag)) {
      setTags(prev => [...prev, tag])
      setNewTag('')
    }
  }

  const removeTag = (tagToRemove) => {
    setTags(prev => prev.filter(tag => tag !== tagToRemove))
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && newTag.trim()) {
      e.preventDefault()
      addTag(newTag.trim())
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 dark:from-black dark:via-slate-950 dark:to-black relative overflow-hidden">
      {/* Enhanced animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute top-40 left-40 w-80 h-80 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      {/* Enhanced grid pattern overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-[size:32px_32px]"></div>

      <div className="relative z-20 container mx-auto py-8 px-6 space-y-8">
        {/* Enhanced Header */}
        <div className="relative">
          <div className="absolute -top-5 -left-5 w-20 h-20 bg-gradient-to-r from-green-500/20 to-emerald-500/20 rounded-full blur-2xl"></div>
          <div className="relative flex items-center gap-6 mb-8">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/app/jobs')}
              className="border-white/20 text-gray-300 hover:bg-white/10 hover:text-white rounded-xl backdrop-blur-sm transition-all duration-200 flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Jobs
            </Button>
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-green-500/20 to-emerald-500/20 backdrop-blur-sm border border-white/10 flex items-center justify-center">
                  <Plus className="h-6 w-6 text-green-300" />
                </div>
                <div>
                  <h1 className="text-4xl lg:text-5xl font-bold tracking-tight">
                    <span className="bg-gradient-to-r from-white via-green-200 to-emerald-200 bg-clip-text text-transparent">
                      Create New Job
                    </span>
                  </h1>
                  <p className="text-gray-300 text-lg">Add a new job posting to your hiring pipeline</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="max-w-4xl space-y-8">
          {/* Enhanced Basic Information */}
          <div className="relative">
            <div className="absolute -top-10 -left-10 w-32 h-32 bg-gradient-to-r from-green-500/10 to-emerald-500/10 rounded-full blur-3xl"></div>
            <Card className="relative bg-gradient-to-br from-white/10 via-white/5 to-transparent backdrop-blur-2xl border border-white/10 shadow-2xl rounded-3xl overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 via-transparent to-emerald-500/5 opacity-50"></div>
              <CardHeader className="relative border-b border-white/10 bg-gradient-to-r from-white/5 to-transparent">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-500/20 to-emerald-500/20 backdrop-blur-sm border border-white/10 flex items-center justify-center">
                    <Plus className="h-5 w-5 text-green-300" />
                  </div>
                  <CardTitle className="text-2xl font-bold bg-gradient-to-r from-white via-green-200 to-emerald-200 bg-clip-text text-transparent">
                    Basic Information
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent className="relative space-y-6 p-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                  {/* Added Id input field */}
                  <div className="space-y-3">
                    <Label htmlFor="id" className="text-gray-300 font-medium">
                      Job ID
                    </Label>
                    <Input
                      id="id"
                      type="text"
                      value={formData.id}
                      onChange={e => handleInputChange('id', e.target.value)}
                      placeholder="Enter job ID (opt as it will be auto-generated for uniqueness)"
                      className="bg-white/5 border-white/10 text-white placeholder-gray-400 focus:border-green-400/50 focus:ring-green-400/20 rounded-xl backdrop-blur-sm transition-all duration-200"
                    />
                  </div>

                  <div className="space-y-3">
                    <Label htmlFor="title" className="text-gray-300 font-medium">Job Title *</Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) => handleInputChange('title', e.target.value)}
                      placeholder="e.g. Senior Frontend Developer"
                      required
                      className="bg-white/5 border-white/10 text-white placeholder-gray-400 focus:border-green-400/50 focus:ring-green-400/20 rounded-xl backdrop-blur-sm transition-all duration-200"
                    />
                  </div>

                  <div className="space-y-3">
                    <Label htmlFor="department" className="text-gray-300 font-medium">Department *</Label>
                    <Select onValueChange={(value) => handleInputChange('department', value)}>
                      <SelectTrigger className="bg-white/5 border-white/10 text-white focus:border-green-400/50 focus:ring-green-400/20 rounded-xl backdrop-blur-sm">
                        <SelectValue placeholder="Select department" />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-800/95 backdrop-blur-xl border-white/10 rounded-xl">
                        {departments.map((dept) => (
                          <SelectItem key={dept} value={dept} className="text-white hover:bg-white/10">
                            {dept}
                          </SelectItem>
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
                      placeholder="e.g. San Francisco, CA or Remote"
                      className="bg-white/5 border-white/10 text-white placeholder-gray-400 focus:border-green-400/50 focus:ring-green-400/20 rounded-xl backdrop-blur-sm transition-all duration-200"
                    />
                  </div>

                  <div className="space-y-3">
                    <Label htmlFor="salary" className="text-gray-300 font-medium">Salary Range</Label>
                    <Input
                      id="salary"
                      value={formData.salary_range}
                      onChange={(e) => handleInputChange('salary_range', e.target.value)}
                      placeholder="e.g. $120,000 - $150,000"
                      className="bg-white/5 border-white/10 text-white placeholder-gray-400 focus:border-green-400/50 focus:ring-green-400/20 rounded-xl backdrop-blur-sm transition-all duration-200"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-3">
                    <Label htmlFor="employment_type" className="text-gray-300 font-medium">Employment Type</Label>
                    <Select
                      value={formData.employment_type}
                      onValueChange={(value) => handleInputChange('employment_type', value)}
                    >
                      <SelectTrigger className="bg-white/5 border-white/10 text-white focus:border-green-400/50 focus:ring-green-400/20 rounded-xl backdrop-blur-sm">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-800/95 backdrop-blur-xl border-white/10 rounded-xl">
                        <SelectItem value="full-time" className="text-white hover:bg-white/10">Full-time</SelectItem>
                        <SelectItem value="part-time" className="text-white hover:bg-white/10">Part-time</SelectItem>
                        <SelectItem value="contract" className="text-white hover:bg-white/10">Contract</SelectItem>
                        <SelectItem value="internship" className="text-white hover:bg-white/10">Internship</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-3">
                    <Label htmlFor="experience_level" className="text-gray-300 font-medium">Experience Level</Label>
                    <Select
                      value={formData.experience_level}
                      onValueChange={(value) => handleInputChange('experience_level', value)}
                    >
                      <SelectTrigger className="bg-white/5 border-white/10 text-white focus:border-green-400/50 focus:ring-green-400/20 rounded-xl backdrop-blur-sm">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-800/95 backdrop-blur-xl border-white/10 rounded-xl">
                        <SelectItem value="entry" className="text-white hover:bg-white/10">Entry-Level</SelectItem>
                        <SelectItem value="mid" className="text-white hover:bg-white/10">Mid-Level</SelectItem>
                        <SelectItem value="senior" className="text-white hover:bg-white/10">Senior-Level</SelectItem>
                        <SelectItem value="lead" className="text-white hover:bg-white/10">Lead</SelectItem>
                        <SelectItem value="executive" className="text-white hover:bg-white/10">Executive</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-3">
                    <Label htmlFor="status" className="text-gray-300 font-medium">Status</Label>
                    <Select
                      value={formData.status}
                      onValueChange={(value) => handleInputChange('status', value)}
                    >
                      <SelectTrigger className="bg-white/5 border-white/10 text-white focus:border-green-400/50 focus:ring-green-400/20 rounded-xl backdrop-blur-sm">
                        <SelectValue />
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
              </CardContent>
            </Card>
          </div>

          {/* Enhanced Job Description */}
          <div className="relative">
            <div className="absolute -top-4 -right-4 w-24 h-24 bg-gradient-to-r from-blue-500/10 to-cyan-500/10 rounded-full blur-2xl"></div>
            <Card className="relative bg-gradient-to-br from-white/10 via-white/5 to-transparent backdrop-blur-2xl border border-white/10 shadow-2xl rounded-3xl overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-transparent to-cyan-500/5 opacity-50"></div>
              <CardHeader className="relative border-b border-white/10 bg-gradient-to-r from-white/5 to-transparent">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500/20 to-cyan-500/20 backdrop-blur-sm border border-white/10 flex items-center justify-center">
                    <Plus className="h-5 w-5 text-blue-300" />
                  </div>
                  <CardTitle className="text-2xl font-bold bg-gradient-to-r from-white via-blue-200 to-cyan-200 bg-clip-text text-transparent">
                    Job Description
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent className="relative space-y-6 p-8">
                <div className="space-y-3">
                  <Label htmlFor="description" className="text-gray-300 font-medium">Description *</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    placeholder="Describe the role, responsibilities, and what makes this position exciting..."
                    rows={6}
                    required
                    className="bg-white/5 border-white/10 text-white placeholder-gray-400 focus:border-blue-400/50 focus:ring-blue-400/20 rounded-xl backdrop-blur-sm min-h-[150px] resize-none transition-all duration-200"
                  />
                </div>

                <div className="space-y-3">
                  <Label htmlFor="requirements" className="text-gray-300 font-medium">Requirements</Label>
                  <Textarea
                    id="requirements"
                    value={formData.requirements}
                    onChange={(e) => handleInputChange('requirements', e.target.value)}
                    placeholder="List the required skills, experience, and qualifications..."
                    rows={4}
                    className="bg-white/5 border-white/10 text-white placeholder-gray-400 focus:border-blue-400/50 focus:ring-blue-400/20 rounded-xl backdrop-blur-sm min-h-[120px] resize-none transition-all duration-200"
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Enhanced Tags & Skills */}
          <div className="relative">
            <div className="absolute -top-4 -left-4 w-24 h-24 bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-full blur-2xl"></div>
            <Card className="relative bg-gradient-to-br from-white/10 via-white/5 to-transparent backdrop-blur-2xl border border-white/10 shadow-2xl rounded-3xl overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 via-transparent to-pink-500/5 opacity-50"></div>
              <CardHeader className="relative border-b border-white/10 bg-gradient-to-r from-white/5 to-transparent">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 backdrop-blur-sm border border-white/10 flex items-center justify-center">
                    <Plus className="h-5 w-5 text-purple-300" />
                  </div>
                  <CardTitle className="text-2xl font-bold bg-gradient-to-r from-white via-purple-200 to-pink-200 bg-clip-text text-transparent">
                    Tags & Skills
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent className="relative space-y-6 p-8">
                <div className="space-y-3">
                  <Label className="text-gray-300 font-medium">Add Tags</Label>
                  <div className="flex gap-3">
                    <Input
                      value={newTag}
                      onChange={(e) => setNewTag(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder="Add a tag and press Enter"
                      className="flex-1 bg-white/5 border-white/10 text-white placeholder-gray-400 focus:border-purple-400/50 focus:ring-purple-400/20 rounded-xl backdrop-blur-sm transition-all duration-200"
                    />
                    <Button
                      type="button"
                      onClick={() => addTag(newTag.trim())}
                      disabled={!newTag.trim()}
                      className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white border-none shadow-lg hover:shadow-purple-500/25 rounded-xl transition-all duration-200 transform hover:scale-[1.02] px-4"
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {/* Popular Tags */}
                <div className="space-y-3">
                  <Label className="text-gray-300 font-medium">Popular Tags</Label>
                  <div className="flex flex-wrap gap-2">
                    {availableTags.map((tag) => (
                      <Button
                        key={tag}
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => addTag(tag)}
                        disabled={tags.includes(tag)}
                        className="h-8 border-white/20 text-gray-300 hover:bg-white/10 hover:text-white rounded-xl backdrop-blur-sm transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {tag}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Selected Tags */}
                {tags.length > 0 && (
                  <div className="space-y-3">
                    <Label className="text-gray-300 font-medium">Selected Tags</Label>
                    <div className="flex flex-wrap gap-2 p-4 rounded-2xl bg-gradient-to-r from-white/5 to-white/10 backdrop-blur-sm border border-white/10">
                      {tags.map((tag) => (
                        <Badge key={tag} variant="secondary" className="flex items-center gap-2 bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30 text-purple-200 rounded-xl px-3 py-1">
                          {tag}
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeTag(tag)}
                            className="h-4 w-4 p-0 hover:bg-transparent text-purple-300 hover:text-red-300 transition-colors duration-200"
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Enhanced Actions */}
          <div className="flex justify-end gap-6 pt-6">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate('/app/jobs')}
              className="border-white/20 text-gray-300 hover:bg-white/10 hover:text-white rounded-xl backdrop-blur-sm transition-all duration-200 px-6"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={createJobMutation.isPending}
              className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white border-none shadow-lg hover:shadow-green-500/25 rounded-xl transition-all duration-200 transform hover:scale-[1.02] px-6"
            >
              {createJobMutation.isPending ? 'Creating...' : 'Create Job'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}