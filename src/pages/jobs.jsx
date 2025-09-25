import React, { useState, useMemo } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { format } from 'date-fns'
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core'
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { DataTable } from '@/components/ui/data-table'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import {
  AdvancedFilterPanel
} from '@/components/saved-searches'
import { ExportDialog, BulkExportDialog } from '@/components/export-dialog'
import { useJobs, useJobsDepartments, useCreateJob, useUpdateJob, useDeleteJob, useReorderJobs } from '@/hooks/useJobs'
import {
  PlusIcon,
  EditIcon,
  TrashIcon,
  EyeIcon,
  GripVerticalIcon,
  BriefcaseIcon,
  UsersIcon,
  CalendarIcon,
  TagIcon,
  ArchiveIcon,
  PlayIcon,
  PauseIcon,
  FilterIcon,
  PencilIcon,
  CheckIcon
} from 'lucide-react'
import { cn } from '@/lib/utils'

// Sortable Row Component for drag and drop
function SortableRow({ job, children }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: job.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn('flex items-center gap-2', isDragging && 'z-50')}
    >
      <div
        {...attributes}
        {...listeners}
        className="cursor-grab active:cursor-grabbing p-1 hover:bg-muted rounded"
      >
        <GripVerticalIcon className="h-4 w-4 text-muted-foreground" />
      </div>
      {children}
    </div>
  )
}

// Job Form Component
function JobForm({ job = null, onSave, onCancel }) {
  const [formData, setFormData] = useState({
    title: job?.title || '',
    department: job?.department || '',
    status: job?.status || 'draft',
    description: job?.description || '',
    requirements: job?.requirements?.join('\n') || '',
    tags: job?.tags?.join(', ') || ''
  })

  const handleSubmit = (e) => {
    e.preventDefault()

    const jobData = {
      ...formData,
      requirements: formData.requirements.split('\n').filter(req => req.trim()),
      tags: formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag)
    }

    onSave(jobData)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <Label htmlFor="title" className="text-gray-300">Job Title</Label>
        <Input
          id="title"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          placeholder="Enter job title"
          required
          className="bg-white/10 border-white/20 text-white placeholder:text-gray-400 focus:border-purple-500/50 focus:ring-purple-500/20"
        />
      </div>

      <div>
        <Label htmlFor="department" className="text-gray-300">Department</Label>
        <Select value={formData.department} onValueChange={(value) => setFormData({ ...formData, department: value })}>
          <SelectTrigger className="bg-white/10 border-white/20 text-white focus:border-purple-500/50 focus:ring-purple-500/20">
            <SelectValue placeholder="Select department" />
          </SelectTrigger>
          <SelectContent className="bg-slate-800 border-white/20 text-white">
            <SelectItem value="Engineering">Engineering</SelectItem>
            <SelectItem value="Product">Product</SelectItem>
            <SelectItem value="Design">Design</SelectItem>
            <SelectItem value="Marketing">Marketing</SelectItem>
            <SelectItem value="Sales">Sales</SelectItem>
            <SelectItem value="Operations">Operations</SelectItem>
            <SelectItem value="HR">HR</SelectItem>
            <SelectItem value="Finance">Finance</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="status" className="text-gray-300">Status</Label>
        <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
          <SelectTrigger className="bg-white/10 border-white/20 text-white focus:border-purple-500/50 focus:ring-purple-500/20">
            <SelectValue placeholder="Select status" />
          </SelectTrigger>
          <SelectContent className="bg-slate-800 border-white/20 text-white">
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="draft">Draft</SelectItem>
            <SelectItem value="paused">Paused</SelectItem>
            <SelectItem value="archived">Archived</SelectItem>
            <SelectItem value="archived">Closed</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="description" className="text-gray-300">Description</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          placeholder="Enter job description"
          rows={4}
          required
          className="bg-white/10 border-white/20 text-white placeholder:text-gray-400 focus:border-purple-500/50 focus:ring-purple-500/20"
        />
      </div>

      <div>
        <Label htmlFor="requirements" className="text-gray-300">Requirements (one per line)</Label>
        <Textarea
          id="requirements"
          value={formData.requirements}
          onChange={(e) => setFormData({ ...formData, requirements: e.target.value })}
          placeholder="Enter requirements, one per line"
          rows={3}
          className="bg-white/10 border-white/20 text-white placeholder:text-gray-400 focus:border-purple-500/50 focus:ring-purple-500/20"
        />
      </div>

      <div>
        <Label htmlFor="tags" className="text-gray-300">Tags (comma separated)</Label>
        <Input
          id="tags"
          value={formData.tags}
          onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
          placeholder="React, TypeScript, Remote"
          className="bg-white/10 border-white/20 text-white placeholder:text-gray-400 focus:border-purple-500/50 focus:ring-purple-500/20"
        />
      </div>

      <DialogFooter>
        <Button type="button" variant="outline" onClick={onCancel} className="border-white/20 text-gray-300 hover:bg-white/10">
          Cancel
        </Button>
        <Button type="submit" className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white border-none">
          {job ? 'Update Job' : 'Create Job'}
        </Button>
      </DialogFooter>
    </form>
  )
}

export default function JobsPage() {
  const navigate = useNavigate()

  // State
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [search, setSearch] = useState('')
  const [departmentFilter, setDepartmentFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [sortBy, setSortBy] = useState('created_at')
  const [sortOrder, setSortOrder] = useState('desc')
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [editingJob, setEditingJob] = useState(null)
  const [selectedRows, setSelectedRows] = useState([])
  const [isDragMode, setIsDragMode] = useState(false)

  // Advanced search state
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false)

  // API calls
  const { data: jobsResponse, isLoading } = useJobs({
    page,
    limit: pageSize,
    search,
    department: departmentFilter !== 'all' ? departmentFilter : undefined,
    status: statusFilter !== 'all' ? statusFilter : undefined,
    sort_by: sortBy,
    sort_order: sortOrder
  })

  // Fetch all jobs for drag mode (without pagination)
  const { data: allJobsResponse } = useJobs({
    page: 1,
    limit: 1000, // Large limit to get all jobs
    search: '',
    department: undefined,
    status: undefined,
    sort_by: 'order', // Sort by order for drag mode
    sort_order: 'asc'
  })

  const { data: departments = [] } = useJobsDepartments()
  const createJobMutation = useCreateJob()
  const updateJobMutation = useUpdateJob()
  const deleteJobMutation = useDeleteJob()
  const reorderJobsMutation = useReorderJobs()

  // Drag and drop sensors
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates
    })
  )

  // Data processing
  const jobs = jobsResponse?.data || []
  const allJobs = allJobsResponse?.data || []
  const dragModeJobs = isDragMode ? allJobs : jobs
  const pagination = jobsResponse?.pagination

  // Totals across ALL jobs (not limited by current page)
  const totalActiveJobs = Array.isArray(allJobs) ? allJobs.filter(j => j.status === 'active').length : 0
  const totalDraftJobs = Array.isArray(allJobs) ? allJobs.filter(j => j.status === 'draft').length : 0
  const totalApplicationsAllJobs = Array.isArray(allJobs) ? allJobs.reduce((sum, j) => sum + (j.applications_count || 0), 0) : 0

  // Status badge variants
  const getStatusVariant = (status) => {
    const variants = {
      active: 'default',
      draft: 'secondary',
      paused: 'outline',
      archived: 'destructive',
      closed: 'destructive'
    }
    return variants[status] || 'default'
  }

  // Table columns
  const columns = useMemo(() => [
    {
      accessorKey: 'title',
      header: 'Job Title',
      sortable: true,
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <BriefcaseIcon className="h-4 w-4 text-white/70" />
          <div>
            <div className="font-medium text-white">{row.title}</div>
            <div className="text-sm text-white/70">{row.department}</div>
          </div>
        </div>
      )
    },
    {
      accessorKey: 'status',
      header: 'Status',
      sortable: true,
      type: 'badge',
      badgeVariant: getStatusVariant,
      cell: ({ row }) => (
        <Badge variant={getStatusVariant(row.status)}>
          {row.status.charAt(0).toUpperCase() + row.status.slice(1)}
        </Badge>
      )
    },
    {
      accessorKey: 'applications_count',
      header: 'Applications',
      sortable: true,
      cell: ({ row }) => (
        <div className="flex items-center gap-1">
          <UsersIcon className="h-4 w-4 text-white/70" />
          <span className="text-white">{row.applications_count || 0}</span>
        </div>
      )
    },
    {
      accessorKey: 'tags',
      header: 'Tags',
      cell: ({ row }) => (
        <div className="flex flex-wrap gap-1">
          {row.tags?.slice(0, 3).map((tag, index) => (
            <Badge key={index} variant="outline" className="text-xs">
              {tag}
            </Badge>
          ))}
          {row.tags?.length > 3 && (
            <Badge variant="outline" className="text-xs">
              +{row.tags.length - 3}
            </Badge>
          )}
        </div>
      )
    },
    {
      accessorKey: 'created_at',
      header: 'Created',
      sortable: true,
      type: 'date',
      cell: ({ row }) => (
        <div className="flex items-center gap-1 text-sm text-white/70">
          <CalendarIcon className="h-4 w-4" />
          {new Date(row.created_at).toLocaleDateString()}
        </div>
      )
    }
  ], [])

  // Handlers
  const handleSortingChange = (sorting) => {
    if (sorting.length > 0) {
      setSortBy(sorting[0].id)
      setSortOrder(sorting[0].desc ? 'desc' : 'asc')
    } else {
      setSortBy('created_at')
      setSortOrder('desc')
    }
    setPage(1)
  }

  const handleSearchChange = (value) => {
    setSearch(value)
    setPage(1)
    // Note: Search value saved for potential future saved search functionality
  }

  const handleCreateJob = async (jobData) => {
    try {
      await createJobMutation.mutateAsync(jobData)
      setIsCreateDialogOpen(false)
    } catch (error) {
      console.error('Failed to create job:', error)
    }
  }

  const handleUpdateJob = async (jobData) => {
    try {
      await updateJobMutation.mutateAsync({ id: editingJob.id, ...jobData })
      setEditingJob(null)
    } catch (error) {
      console.error('Failed to update job:', error)
    }
  }

  const handleDeleteJob = async (job) => {
    if (window.confirm(`Are you sure you want to delete "${job.title}"?`)) {
      try {
        await deleteJobMutation.mutateAsync(job.id)
      } catch (error) {
        console.error('Failed to delete job:', error)
      }
    }
  }

  const handleBulkDelete = async () => {
    if (window.confirm(`Are you sure you want to delete ${selectedRows.length} jobs?`)) {
      try {
        await Promise.all(selectedRows.map(id => deleteJobMutation.mutateAsync(id)))
        setSelectedRows([])
      } catch (error) {
        console.error('Failed to delete jobs:', error)
      }
    }
  }

  const handleDragEnd = async (event) => {
    const { active, over } = event

    console.log('Drag end event:', { activeId: active.id, overId: over?.id })

    if (active.id !== over?.id) {
      const currentJobs = isDragMode ? allJobs : jobs
      console.log('Current jobs for reordering:', currentJobs.length)

      const oldIndex = currentJobs.findIndex(job => job.id === active.id)
      const newIndex = currentJobs.findIndex(job => job.id === over.id)

      console.log('Reorder indices:', { oldIndex, newIndex })

      const reorderedJobs = arrayMove(currentJobs, oldIndex, newIndex)
      console.log('Reordered jobs:', reorderedJobs.map(j => ({ id: j.id, title: j.title })))

      try {
        await reorderJobsMutation.mutateAsync(reorderedJobs)
        console.log('Reorder successful')
      } catch (error) {
        console.error('Failed to reorder jobs:', error)
      }
    }
  }

  // Enhanced export functionality is now handled by ExportDialog component

  const currentFilters = {
    department: departmentFilter,
    status: statusFilter
  }

  const filterOptions = [
    {
      key: 'department',
      label: 'Department',
      placeholder: 'All Departments',
      options: departments.map(dept => ({ value: dept, label: dept }))
    },
    {
      key: 'status',
      label: 'Status',
      placeholder: 'All Statuses',
      options: [
        { value: 'active', label: 'Active' },
        { value: 'draft', label: 'Draft' },
        { value: 'paused', label: 'Paused' },
        { value: 'archived', label: 'Archived' },
        { value: 'closed', label: 'Closed' }
      ]
    }
  ]

  const handleAdvancedFilterChange = (key, value) => {
    if (key === 'department') setDepartmentFilter(value)
    if (key === 'status') setStatusFilter(value)
    setPage(1)
  }

  // Table configuration
  const tableConfig = {
    data: jobs,
    columns,
    isLoading,
    sorting: [{ id: sortBy, desc: sortOrder === 'desc' }],
    onSortingChange: handleSortingChange,
    filtering: {
      searchable: true,
      searchValue: search,
      searchPlaceholder: 'Search jobs...',
      onSearchChange: handleSearchChange,
      filters: [
        {
          key: 'department',
          label: 'Department',
          placeholder: 'All Departments',
          value: departmentFilter,
          options: departments.map(dept => ({ value: dept, label: dept }))
        },
        {
          key: 'status',
          label: 'Status',
          placeholder: 'All Statuses',
          value: statusFilter,
          options: [
            { value: 'active', label: 'Active' },
            { value: 'draft', label: 'Draft' },
            { value: 'paused', label: 'Paused' },
            { value: 'archived', label: 'Archived' },
            { value: 'closed', label: 'Closed' }
          ]
        }
      ],
      onFilterChange: (key, value) => {
        if (key === 'department') setDepartmentFilter(value)
        if (key === 'status') setStatusFilter(value)
        setPage(1)
      }
    },
    pagination: pagination ? {
      page: pagination.page,
      pageSize: pagination.limit,
      total: pagination.total,
      totalPages: pagination.total_pages,
      onPageChange: setPage,
      onPageSizeChange: setPageSize,
      pageSizeOptions: [10, 25, 50, 100]
    } : null,
    selectedRows,
    onSelectionChange: setSelectedRows,
    onRowClick: (job) => navigate(`/app/jobs/${job.slug || job.id}`),
    actions: {
      primary: [
        {
          label: 'New Job',
          icon: PlusIcon,
          //onClick: () => setIsCreateDialogOpen(true)
          onClick: () => navigate('/app/jobs/new')
        }
      ],
      secondary: [
        ...(selectedRows.length > 0 ? [
          {
            label: `Delete ${selectedRows.length} jobs`,
            icon: TrashIcon,
            onClick: handleBulkDelete
          }
        ] : []),
        {
          label: isDragMode ? 'Exit Reorder Mode' : 'Reorder Jobs',
          icon: GripVerticalIcon,
          onClick: () => setIsDragMode(!isDragMode)
        },
        {
          label: showAdvancedFilters ? 'Hide Advanced Filters' : 'Advanced Filters',
          icon: FilterIcon,
          onClick: () => setShowAdvancedFilters(!showAdvancedFilters)
        }
      ],
      row: [
        {
          label: 'View',
          icon: EyeIcon,
          onClick: (job) => navigate(`/app/jobs/${job.slug || job.id}`)
        },
        {
          label: 'Edit',
          icon: EditIcon,
          //onClick: (job) => setEditingJob(job)
          onClick: (job) => navigate(`/app/jobs/${job.slug || job.id}/edit`)
        },
        {
          label: job => job.status === 'active' ? 'Pause' : 'Activate',
          icon: job => job.status === 'active' ? PauseIcon : PlayIcon,
          onClick: async (job) => {
            const newStatus = job.status === 'active' ? 'paused' : 'active'
            await updateJobMutation.mutateAsync({ id: job.id, status: newStatus })
          }
        },
        {
          label: job => job.status === 'archived' ? 'Unarchive' : 'Archive',
          icon: ArchiveIcon,
          onClick: async (job) => {
            const newStatus = job.status === 'archived' ? 'active' : 'archived'
            await updateJobMutation.mutateAsync({ id: job.id, status: newStatus })
          }
        },
        {
          label: 'Delete',
          icon: TrashIcon,
          onClick: handleDeleteJob
        }
      ]
    }
  }

  if (isDragMode) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 dark:from-black dark:via-slate-950 dark:to-black relative overflow-hidden">
        {/* Enhanced animated background elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
          <div className="absolute top-40 left-40 w-80 h-80 bg-gradient-to-r from-orange-500 to-red-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
          <div className="absolute top-1/2 right-1/3 w-60 h-60 bg-gradient-to-r from-teal-500 to-green-500 rounded-full mix-blend-multiply filter blur-xl opacity-15 animate-blob animation-delay-6000"></div>
        </div>

        {/* Enhanced grid pattern overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-[size:32px_32px]"></div>

        <div className="relative z-20 space-y-8 p-6 lg:p-8">
          {/* Enhanced header */}
          <div className="relative">
            <div className="absolute -top-5 -left-5 w-20 h-20 bg-gradient-to-r from-purple-500/20 to-blue-500/20 rounded-full blur-2xl"></div>
            <div className="relative flex items-center justify-between">
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-orange-500/20 to-red-500/20 backdrop-blur-sm border border-white/10 flex items-center justify-center">
                    <GripVerticalIcon className="h-6 w-6 text-orange-300" />
                  </div>
                  <div>
                    <h1 className="text-4xl lg:text-5xl font-bold tracking-tight">
                      <span className="bg-gradient-to-r from-white via-orange-200 to-red-200 bg-clip-text text-transparent">
                        Reorder Jobs
                      </span>
                    </h1>
                    <p className="text-white text-lg mt-1">
                      Drag and drop to reorder jobs in your pipeline
                    </p>
                  </div>
                </div>
              </div>
              <Button
                onClick={() => setIsDragMode(false)}
                className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white border-none shadow-lg hover:shadow-orange-500/25 rounded-xl transition-all duration-200 transform hover:scale-[1.02] px-6 py-3"
              >
                <CheckIcon className="h-4 w-4 mr-2" />
                Exit Reorder Mode
              </Button>
            </div>
          </div>

          {/* Enhanced drag container */}
          <div className="relative">
            <div className="absolute -top-10 -left-10 w-32 h-32 bg-gradient-to-r from-orange-500/10 to-red-500/10 rounded-full blur-3xl"></div>
            <div className="absolute -bottom-10 -right-10 w-24 h-24 bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-full blur-2xl"></div>

            <Card className="relative bg-gradient-to-br from-white/10 via-white/5 to-transparent backdrop-blur-2xl border border-white/10 shadow-2xl rounded-3xl overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 via-transparent to-red-500/5 opacity-50"></div>
              <CardHeader className="relative border-b border-white/10 bg-gradient-to-r from-white/5 to-transparent">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500/20 to-red-500/20 backdrop-blur-sm border border-white/10 flex items-center justify-center">
                    <GripVerticalIcon className="h-5 w-5 text-orange-300" />
                  </div>
                  <div>
                    <CardTitle className="text-2xl font-bold bg-gradient-to-r from-white via-orange-200 to-red-200 bg-clip-text text-transparent">
                      Jobs Reordering
                    </CardTitle>
                    <CardDescription className="text-white">
                      Drag jobs to reorder them. Changes are saved automatically.
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="relative p-6">
                <DndContext
                  sensors={sensors}
                  collisionDetection={closestCenter}
                  onDragEnd={handleDragEnd}
                >
                  <SortableContext items={dragModeJobs.map(job => job.id)} strategy={verticalListSortingStrategy}>
                    <div className="space-y-3">
                      {dragModeJobs.map((job) => (
                        <SortableRow key={job.id} job={job}>
                          <div className="flex items-center justify-between w-full p-4 border border-white/20 rounded-xl bg-gradient-to-r from-white/5 to-white/10 backdrop-blur-sm hover:from-white/10 hover:to-white/15 transition-all duration-200">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
                                <BriefcaseIcon className="h-5 w-5 text-white" />
                              </div>
                              <div>
                                <div className="font-medium text-white">{job.title}</div>
                                <div className="text-sm text-white/70">{job.department}</div>
                              </div>
                            </div>
                            <Badge
                              variant={getStatusVariant(job.status)}
                              className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30 text-purple-200"
                            >
                              {job.status.charAt(0).toUpperCase() + job.status.slice(1)}
                            </Badge>
                          </div>
                        </SortableRow>
                      ))}
                    </div>
                  </SortableContext>
                </DndContext>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    )
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

      <div className="relative z-20 space-y-8 p-6 lg:p-8">
        {/* Header Section with Enhanced Design */}
        <div className="relative">
          <div className="absolute -top-20 -left-20 w-40 h-40 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-full blur-3xl"></div>
          <div className="absolute -top-10 -right-10 w-32 h-32 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 rounded-full blur-2xl"></div>

          <div className="relative flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-500/20 border border-purple-500/30 text-purple-300 text-sm font-medium">
                <BriefcaseIcon className="h-4 w-4" />
                Job Management
              </div>
              <h1 className="text-4xl lg:text-6xl font-bold tracking-tight">
                <span className="bg-gradient-to-r from-white via-purple-200 to-pink-200 bg-clip-text text-transparent">
                  Jobs Dashboard
                </span>
              </h1>
              <p className="text-gray-300 text-lg lg:text-xl max-w-2xl leading-relaxed">
                Create, manage, and track your job postings with powerful tools designed for modern recruitment
              </p>

              {/* Quick Stats Inline */}
              <div className="flex items-center gap-6 pt-2">
                <div className="flex items-center gap-2 text-sm text-gray-400">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span>{totalActiveJobs} Active</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-400">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                  <span>{totalDraftJobs} Draft</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-400">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span>{totalApplicationsAllJobs} Applications</span>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <Button
                variant="outline"
                className="border-white/20 text-gray-300 hover:bg-white/10 backdrop-blur-sm"
                onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
              >
                <FilterIcon className="h-4 w-4 mr-2" />
                {showAdvancedFilters ? 'Hide Filters' : 'Advanced Filters'}
              </Button>
              <Button asChild className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white border-none shadow-lg hover:shadow-purple-500/25 transition-all duration-300">
                <Link to="/app/jobs/new">
                  <PlusIcon className="h-4 w-4 mr-2" />
                  Create Job
                </Link>
              </Button>
            </div>
          </div>
        </div>

        {/* Enhanced Stats Cards with Improved Design */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <Card className="group relative overflow-hidden bg-gradient-to-br from-purple-500/10 via-purple-500/5 to-transparent border border-white/10 backdrop-blur-xl rounded-3xl hover:border-purple-500/30 transition-all duration-500 hover:scale-[1.02] hover:shadow-2xl hover:shadow-purple-500/10">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 to-pink-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <CardHeader className="relative flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-300 group-hover:text-white transition-colors">Total Jobs</CardTitle>
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg">
                <BriefcaseIcon className="h-5 w-5 text-white" />
              </div>
            </CardHeader>
            <CardContent className="relative">
              <div className="text-3xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent mb-1">
                {pagination?.total || 0}
              </div>
              <p className="text-xs text-gray-400 group-hover:text-gray-300 transition-colors">
                Across all departments
              </p>
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500"></div>
            </CardContent>
          </Card>

          <Card className="group relative overflow-hidden bg-gradient-to-br from-blue-500/10 via-blue-500/5 to-transparent border border-white/10 backdrop-blur-xl rounded-3xl hover:border-blue-500/30 transition-all duration-500 hover:scale-[1.02] hover:shadow-2xl hover:shadow-blue-500/10">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-cyan-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <CardHeader className="relative flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-300 group-hover:text-white transition-colors">Active Jobs</CardTitle>
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-r from-blue-500 to-cyan-500 flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg">
                <PlayIcon className="h-5 w-5 text-white" />
              </div>
            </CardHeader>
            <CardContent className="relative">
              <div className="text-3xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent mb-1">
                {totalActiveJobs}
              </div>
              <p className="text-xs text-gray-400 group-hover:text-gray-300 transition-colors">
                Currently recruiting
              </p>
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500"></div>
            </CardContent>
          </Card>

          <Card className="group relative overflow-hidden bg-gradient-to-br from-green-500/10 via-green-500/5 to-transparent border border-white/10 backdrop-blur-xl rounded-3xl hover:border-green-500/30 transition-all duration-500 hover:scale-[1.02] hover:shadow-2xl hover:shadow-green-500/10">
            <div className="absolute inset-0 bg-gradient-to-r from-green-500/5 to-emerald-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <CardHeader className="relative flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-300 group-hover:text-white transition-colors">Draft Jobs</CardTitle>
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-r from-green-500 to-emerald-500 flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg">
                <EditIcon className="h-5 w-5 text-white" />
              </div>
            </CardHeader>
            <CardContent className="relative">
              <div className="text-3xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent mb-1">
                {totalDraftJobs}
              </div>
              <p className="text-xs text-gray-400 group-hover:text-gray-300 transition-colors">
                Awaiting publication
              </p>
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500"></div>
            </CardContent>
          </Card>

          <Card className="group relative overflow-hidden bg-gradient-to-br from-orange-500/10 via-orange-500/5 to-transparent border border-white/10 backdrop-blur-xl rounded-3xl hover:border-orange-500/30 transition-all duration-500 hover:scale-[1.02] hover:shadow-2xl hover:shadow-orange-500/10">
            <div className="absolute inset-0 bg-gradient-to-r from-orange-500/5 to-red-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <CardHeader className="relative flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-300 group-hover:text-white transition-colors">Applications</CardTitle>
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-r from-orange-500 to-red-500 flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg">
                <UsersIcon className="h-5 w-5 text-white" />
              </div>
            </CardHeader>
            <CardContent className="relative">
              <div className="text-3xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent mb-1">
                {totalApplicationsAllJobs}
              </div>
              <p className="text-xs text-gray-400 group-hover:text-gray-300 transition-colors">
                Total submissions
              </p>
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-orange-500 to-red-500 rounded-full transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500"></div>
            </CardContent>
          </Card>
        </div>

        {/* Advanced Filters */}
        <AdvancedFilterPanel
          filters={currentFilters}
          onFilterChange={handleAdvancedFilterChange}
          filterOptions={filterOptions}
          isOpen={showAdvancedFilters}
          onOpenChange={setShowAdvancedFilters}
        />

        {/* Enhanced Export Section */}
        <div className="relative">
          <div className="absolute -top-4 -right-4 w-24 h-24 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-full blur-2xl"></div>
          <div className="relative flex justify-between items-center p-6 bg-gradient-to-r from-white/5 via-white/10 to-white/5 backdrop-blur-xl border border-white/10 rounded-3xl">
            <div className="space-y-2">
              <h3 className="text-lg font-semibold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                Export & Analytics
              </h3>
              <p className="text-sm text-gray-400">
                Download your data or generate comprehensive reports
              </p>
            </div>
            <div className="flex gap-3">
              <ExportDialog
                data={jobs}
                type="jobs"
                title="Export Jobs"
                description="Export jobs data in your preferred format"
                onExportComplete={(format, columns, records) => {
                  console.log(`Exported ${records} jobs in ${format} format with ${columns} columns`)
                }}
                trigger={
                  <Button variant="outline" className="border-white/20 text-gray-300 hover:bg-white/10 backdrop-blur-sm hover:border-blue-500/30 transition-all duration-300">
                    <TagIcon className="h-4 w-4 mr-2" />
                    Export Data
                  </Button>
                }
              />
              <BulkExportDialog
                datasets={[
                  {
                    type: 'jobs',
                    data: jobs,
                    config: {
                      title: 'Jobs Export',
                      columns: ['title', 'department', 'status', 'location', 'type', 'experience_level', 'applications_count', 'created_at'],
                      filename: (type) => `jobs_export_${format(new Date(), 'yyyy-MM-dd')}.${type}`
                    }
                  }
                ]}
                title="Bulk Export"
                description="Export all jobs data"
                trigger={
                  <Button className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white border-none shadow-lg hover:shadow-blue-500/25 transition-all duration-300">
                    <UsersIcon className="h-4 w-4 mr-2" />
                    Bulk Export
                  </Button>
                }
              />
            </div>
          </div>
        </div>

        {/* Enhanced Data Table */}
        <div className="relative">
          <div className="absolute -top-10 -left-10 w-32 h-32 bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-10 -right-10 w-24 h-24 bg-gradient-to-r from-blue-500/10 to-cyan-500/10 rounded-full blur-2xl"></div>

          <Card className="relative bg-gradient-to-br from-white/10 via-white/5 to-transparent backdrop-blur-2xl border border-white/10 shadow-2xl rounded-3xl overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 via-transparent to-blue-500/5 opacity-50"></div>
            <CardHeader className="relative border-b border-white/10 bg-gradient-to-r from-white/5 to-transparent">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <CardTitle className="text-2xl font-bold bg-gradient-to-r from-white via-purple-200 to-pink-200 bg-clip-text text-transparent">
                    Jobs Overview
                  </CardTitle>
                  <CardDescription className="text-gray-300">
                    Manage and track all your job postings with advanced filtering and search
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-white/20 text-gray-300 hover:bg-white/10 backdrop-blur-sm"
                    onClick={() => setIsDragMode(!isDragMode)}
                  >
                    <GripVerticalIcon className="h-4 w-4 mr-2" />
                    {isDragMode ? 'Exit Reorder' : 'Reorder Jobs'}
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="relative p-6">
              <DataTable {...tableConfig} />
            </CardContent>
          </Card>
        </div>

        {/* Enhanced Create Job Dialog */}
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogContent className="relative max-w-2xl bg-gradient-to-br from-slate-900/95 via-slate-800/95 to-slate-900/95 backdrop-blur-2xl border border-white/10 shadow-2xl rounded-3xl text-white overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 via-transparent to-blue-500/10 opacity-60"></div>
            <div className="absolute -top-10 -right-10 w-32 h-32 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-full blur-3xl"></div>
            <div className="absolute -bottom-5 -left-5 w-20 h-20 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 rounded-full blur-2xl"></div>

            <div className="relative z-10">
              <DialogHeader className="space-y-4 pb-6">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-500/20 to-blue-500/20 backdrop-blur-sm border border-white/10 flex items-center justify-center">
                    <PlusIcon className="h-6 w-6 text-purple-300" />
                  </div>
                  <div>
                    <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-white via-purple-200 to-pink-200 bg-clip-text text-transparent">
                      Create New Job
                    </DialogTitle>
                    <DialogDescription className="text-gray-300">
                      Add a new job posting to your talent pipeline
                    </DialogDescription>
                  </div>
                </div>
              </DialogHeader>

              <div className="relative">
                <JobForm
                  onSave={handleCreateJob}
                  onCancel={() => setIsCreateDialogOpen(false)}
                />
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Enhanced Edit Job Dialog */}
        <Dialog open={!!editingJob} onOpenChange={() => setEditingJob(null)}>
          <DialogContent className="relative max-w-2xl bg-gradient-to-br from-slate-900/95 via-slate-800/95 to-slate-900/95 backdrop-blur-2xl border border-white/10 shadow-2xl rounded-3xl text-white overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 via-transparent to-purple-500/10 opacity-60"></div>
            <div className="absolute -top-10 -right-10 w-32 h-32 bg-gradient-to-r from-orange-500/20 to-red-500/20 rounded-full blur-3xl"></div>
            <div className="absolute -bottom-5 -left-5 w-20 h-20 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-full blur-2xl"></div>

            <div className="relative z-10">
              <DialogHeader className="space-y-4 pb-6">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-orange-500/20 to-purple-500/20 backdrop-blur-sm border border-white/10 flex items-center justify-center">
                    <PencilIcon className="h-6 w-6 text-orange-300" />
                  </div>
                  <div>
                    <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-white via-orange-200 to-purple-200 bg-clip-text text-transparent">
                      Edit Job
                    </DialogTitle>
                    <DialogDescription className="text-gray-300">
                      Update job details and requirements
                    </DialogDescription>
                  </div>
                </div>
              </DialogHeader>

              <div className="relative">
                {editingJob && (
                  <JobForm
                    job={editingJob}
                    onSave={handleUpdateJob}
                    onCancel={() => setEditingJob(null)}
                  />
                )}
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}