import React, { useState, useMemo, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { format } from 'date-fns'
import { useVirtualizer } from '@tanstack/react-virtual'
import { DndContext, DragOverlay, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, useDroppable, defaultDropAnimation } from '@dnd-kit/core'
import { arrayMove, SortableContext, sortableKeyboardCoordinates, horizontalListSortingStrategy, verticalListSortingStrategy } from '@dnd-kit/sortable'
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
  DialogTitle
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
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  AdvancedFilterPanel,
  SavedSearchesDropdown,
  SaveSearchDialog,
  savedSearchUtils
} from '@/components/saved-searches'
import { ExportDialog, BulkExportDialog } from '@/components/export-dialog'
import {
  useCandidates,
  useCandidatesPositions,
  useCandidatesLocations,
  useCandidatesByStage,
  useCreateCandidate,
  useUpdateCandidate,
  useDeleteCandidate,
  useUpdateCandidateStage,
  useBulkUpdateCandidates
} from '@/hooks/useCandidates'
import {
  PlusIcon,
  EditIcon,
  TrashIcon,
  EyeIcon,
  UserIcon,
  MapPinIcon,
  BriefcaseIcon,
  CalendarIcon,
  PhoneIcon,
  MailIcon,
  FileTextIcon,
  ArrowRightIcon,
  GridIcon,
  ListIcon,
  FilterIcon,
  DownloadIcon,
  SaveIcon
} from 'lucide-react'
import { cn } from '@/lib/utils'

// Virtual List Item Component for performance
const VirtualCandidateItem = React.memo(({ candidate, onEdit, onDelete, onStageChange, onClick }) => {
  const getStageColor = (stage) => {
    const colors = {
      applied: 'bg-gradient-to-r from-blue-500/20 to-blue-600/20 text-blue-300 border-blue-500/30',
      screen: 'bg-gradient-to-r from-yellow-500/20 to-yellow-600/20 text-yellow-300 border-yellow-500/30',
      test: 'bg-gradient-to-r from-orange-500/20 to-orange-600/20 text-orange-300 border-orange-500/30',
      offer: 'bg-gradient-to-r from-green-500/20 to-green-600/20 text-green-300 border-green-500/30',
      hired: 'bg-gradient-to-r from-emerald-500/20 to-emerald-600/20 text-emerald-300 border-emerald-500/30',
      rejected: 'bg-gradient-to-r from-red-500/20 to-red-600/20 text-red-300 border-red-500/30'
    }
    return colors[stage] || 'bg-gradient-to-r from-gray-500/20 to-gray-600/20 text-gray-300 border-gray-500/30'
  }

  return (
    <div
      className="flex items-center gap-4 p-4 border-b border-white/10 hover:bg-white/5 cursor-pointer transition-all duration-300 hover:scale-[1.02]"
      onClick={() => onClick(candidate)}
    >
      <Avatar className="h-10 w-10">
        <AvatarImage src={candidate.avatar_url} />
        <AvatarFallback className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">
          {(candidate.name || 'N A').split(' ').map(n => n[0] || '').join('').slice(0, 2)}
        </AvatarFallback>
      </Avatar>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <h3 className="font-medium truncate text-white">{candidate.name || 'Unknown'}</h3>
          <Badge className={cn('text-xs border', getStageColor(candidate.stage || 'applied'))}>
            {candidate.stage}
          </Badge>
        </div>
        <div className="flex items-center gap-4 mt-1 text-sm text-white/70">
          <span className="flex items-center gap-1">
            <BriefcaseIcon className="h-3 w-3" />
            {candidate.position}
          </span>
          <span className="flex items-center gap-1">
            <MapPinIcon className="h-3 w-3" />
            {candidate.location}
          </span>
          <span className="flex items-center gap-1">
            <CalendarIcon className="h-3 w-3" />
            {candidate.experience}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={(e) => {
            e.stopPropagation()
            onEdit(candidate)
          }}
          className="text-white/70 hover:text-white hover:bg-white/10"
        >
          <EditIcon className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={(e) => {
            e.stopPropagation()
            onDelete(candidate)
          }}
          className="text-white/70 hover:text-red-300 hover:bg-red-500/10"
        >
          <TrashIcon className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
})

// Kanban Column Component
function KanbanColumn({ stage, candidates, onCandidateMove }) {
  const {
    setNodeRef,
    isOver
  } = useDroppable({
    id: stage,
    data: { type: 'column', stage }
  })

  const stageLabels = {
    applied: 'Applied',
    screen: 'Screen',
    test: 'Test',
    offer: 'Offer',
    hired: 'Hired',
    rejected: 'Rejected'
  }

  const stageColors = {
    applied: 'from-blue-500/20 to-blue-600/20 border-blue-500/30',
    screen: 'from-yellow-500/20 to-yellow-600/20 border-yellow-500/30',
    test: 'from-orange-500/20 to-orange-600/20 border-orange-500/30',
    offer: 'from-green-500/20 to-green-600/20 border-green-500/30',
    hired: 'from-emerald-500/20 to-emerald-600/20 border-emerald-500/30',
    rejected: 'from-red-500/20 to-red-600/20 border-red-500/30'
  }

  return (
    <div
      ref={setNodeRef}
      className={cn(
        'flex flex-col h-full bg-gradient-to-br backdrop-blur-lg border rounded-3xl p-4 min-w-[280px] transition-all duration-300',
        stageColors[stage] || 'from-gray-500/20 to-gray-600/20 border-gray-500/30',
        isOver && 'scale-105 shadow-lg'
      )}
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-white">{stageLabels[stage]}</h3>
        <Badge variant="outline" className="bg-white/10 border-white/20 text-white">
          {candidates.length}
        </Badge>
      </div>

      {/*<div className="flex-1 space-y-2 overflow-y-auto">
        {candidates.map((candidate) => (
          <KanbanCard
            key={candidate.id}
            candidate={candidate}
            onMove={onCandidateMove}
          />
        ))}*
      </div>
    </div>*/}
      <div className="flex-1 space-y-2 overflow-y-auto">
        <SortableContext
          items={candidates.map(c => c.id)}
          strategy={verticalListSortingStrategy}
        >
          {candidates.map((candidate) => (
            <KanbanCard
              key={candidate.id}
              candidate={candidate}
              onMove={onCandidateMove}
            />
          ))}
        </SortableContext>
      </div>
    </div>
  )
}

// Draggable Kanban Card
function KanbanCard({ candidate, onMove }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: candidate.id, data: { type: 'card', stage: candidate.stage } })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.9 : 1,
    cursor: isDragging ? 'grabbing' : 'grab'
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-lg border border-white/20 rounded-2xl p-3 hover:shadow-lg hover:scale-105 transition-all duration-300"
    >
      <div className="flex items-center gap-2 mb-2">
        <Avatar className="h-8 w-8">
          <AvatarFallback className="text-xs bg-gradient-to-r from-purple-500 to-pink-500 text-white">
            {candidate.name.split(' ').map(n => n[0]).join('')}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <h4 className="font-medium text-sm truncate text-white">{candidate.name}</h4>
          <p className="text-xs text-white/70 truncate">{candidate.position}</p>
        </div>
      </div>

      <div className="text-xs text-white/70 space-y-1">
        <div className="flex items-center gap-1">
          <MapPinIcon className="h-3 w-3" />
          <span className="truncate">{candidate.location}</span>
        </div>
        <div className="flex items-center gap-1">
          <BriefcaseIcon className="h-3 w-3" />
          <span>{candidate.experience}</span>
        </div>
      </div>
    </div>
  )
}

// Candidate Form Component
function CandidateForm({ candidate = null, onSave, onCancel }) {
  const [formData, setFormData] = useState({
    id: candidate?.id || '',
    name: candidate?.name || '',
    email: candidate?.email || '',
    phone: candidate?.phone || '',
    position: candidate?.position || '',
    stage: candidate?.stage || 'applied',
    experience: candidate?.experience || '',
    location: candidate?.location || '',
    notes: candidate?.notes || ''
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    onSave(formData)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="id">Candidate ID</Label>
          <Input
            id="id"
            value={formData.id}
            onChange={(e) => setFormData({ ...formData, id: e.target.value })}
            placeholder="Enter Cand ID(opt as auto gen for uniqueness)"
            required
          />
        </div>
        <div>
          <Label htmlFor="name">Full Name</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="Enter full name"
            required
          />
        </div>
        <div>
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            placeholder="Enter email address"
            required
          />
        </div>
        <div>
          <Label htmlFor="phone">Phone</Label>
          <Input
            id="phone"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            placeholder="Enter phone number"
          />
        </div>
        <div>
          <Label htmlFor="position">Position</Label>
          <Input
            id="position"
            value={formData.position}
            onChange={(e) => setFormData({ ...formData, position: e.target.value })}
            placeholder="Enter position"
            required
          />
        </div>
        <div>
          <Label htmlFor="stage">Stage</Label>
          <Select value={formData.stage} onValueChange={(value) => setFormData({ ...formData, stage: value })}>
            <SelectTrigger>
              <SelectValue placeholder="Select stage" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="applied">Applied</SelectItem>
              <SelectItem value="screen">Screen</SelectItem>
              <SelectItem value="test">Test</SelectItem>
              <SelectItem value="offer">Offer</SelectItem>
              <SelectItem value="hired">Hired</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="experience">Experience</Label>
          <Input
            id="experience"
            value={formData.experience}
            onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
            placeholder="e.g., 5 years"
          />
        </div>
      </div>

      <div>
        <Label htmlFor="location">Location</Label>
        <Input
          id="location"
          value={formData.location}
          onChange={(e) => setFormData({ ...formData, location: e.target.value })}
          placeholder="Enter location"
        />
      </div>

      <div>
        <Label htmlFor="notes">Notes</Label>
        <Textarea
          id="notes"
          value={formData.notes}
          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          placeholder="Add any notes about the candidate"
          rows={3}
        />
      </div>

      <DialogFooter>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">
          {candidate ? 'Update Candidate' : 'Create Candidate'}
        </Button>
      </DialogFooter>
    </form>
  )
}

export function CandidatesPage() {
  const navigate = useNavigate()

  // State
  const [viewMode, setViewMode] = useState('list') // 'list', 'kanban'
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(50)
  const [search, setSearch] = useState('')
  const [positionFilter, setPositionFilter] = useState('all')
  const [stageFilter, setStageFilter] = useState('all')
  const [locationFilter, setLocationFilter] = useState('all')
  const [sortBy, setSortBy] = useState('created_at')
  const [sortOrder, setSortOrder] = useState('desc')
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [editingCandidate, setEditingCandidate] = useState(null)
  const [selectedRows, setSelectedRows] = useState([])

  // Saved Search state
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false)
  const [isSaveSearchOpen, setIsSaveSearchOpen] = useState(false)

  // API calls
  const { data: candidatesResponse, isLoading } = useCandidates({
    page,
    limit: pageSize,
    search,
    position: positionFilter !== 'all' ? positionFilter : undefined,
    stage: stageFilter !== 'all' ? stageFilter : undefined,
    location: locationFilter !== 'all' ? locationFilter : undefined,
    sort_by: sortBy,
    sort_order: sortOrder
  })

  const { data: positions = [] } = useCandidatesPositions()
  const { data: locations = [] } = useCandidatesLocations()
  const { data: candidatesByStage = {} } = useCandidatesByStage()
  const createCandidateMutation = useCreateCandidate()
  const updateCandidateMutation = useUpdateCandidate()
  const deleteCandidateMutation = useDeleteCandidate()
  const updateStageMutation = useUpdateCandidateStage()
  const bulkUpdateMutation = useBulkUpdateCandidates()

  // Saved Search handlers
  const currentFilters = useMemo(() => ({
    position: positionFilter !== 'all' ? positionFilter : null,
    stage: stageFilter !== 'all' ? stageFilter : null,
    location: locationFilter !== 'all' ? locationFilter : null,
    sortBy,
    sortOrder
  }), [positionFilter, stageFilter, locationFilter, sortBy, sortOrder])

  const handleSaveCurrentSearch = () => {
    // Record recent query text only
    savedSearchUtils.addRecentSearch(search || '')
    // Open save search dialog
    setIsSaveSearchOpen(true)
  }

  const handleApplySavedSearch = (savedSearch) => {
    const filters = savedSearch?.filters || {}
    const queryText = savedSearch?.searchQuery || ''
    setSearch(queryText)
    setPositionFilter(filters.position || 'all')
    setStageFilter(filters.stage || 'all')
    setLocationFilter(filters.location || 'all')
    if (filters.sortBy) setSortBy(filters.sortBy)
    if (filters.sortOrder) setSortOrder(filters.sortOrder)
    setPage(1)
  }

  const handleAdvancedFilterChange = (filterKey, value) => {
    switch (filterKey) {
      case 'position':
        setPositionFilter(value || 'all')
        break
      case 'stage':
        setStageFilter(value || 'all')
        break
      case 'location':
        setLocationFilter(value || 'all')
        break
      case 'sortBy':
        setSortBy(value)
        break
      case 'sortOrder':
        setSortOrder(value)
        break
    }
    setPage(1)
  }

  // Data processing
  const candidates = candidatesResponse?.data || []
  const pagination = candidatesResponse?.pagination

  // Filter options for advanced search
  const filterOptions = useMemo(() => ({
    position: positions.map(pos => ({ label: pos, value: pos })),
    stage: [
      { label: 'Applied', value: 'applied' },
      { label: 'Screen', value: 'screen' },
      { label: 'Test', value: 'test' },
      { label: 'Offer', value: 'offer' },
      { label: 'Hired', value: 'hired' },
      { label: 'Rejected', value: 'rejected' }
    ],
    location: locations.map(loc => ({ label: loc, value: loc })),
    sortBy: [
      { label: 'Date Applied', value: 'created_at' },
      { label: 'Name', value: 'name' },
      { label: 'Position', value: 'position' },
      { label: 'Stage', value: 'stage' },
      { label: 'Experience', value: 'experience_years' }
    ],
    sortOrder: [
      { label: 'Descending', value: 'desc' },
      { label: 'Ascending', value: 'asc' }
    ]
  }), [positions, locations])

  // Virtual list setup for performance with 1000+ candidates
  const parentRef = React.useRef()
  const virtualizer = useVirtualizer({
    count: candidates.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 80,
    overscan: 10
  })

  // Stage badge variants
  const getStageVariant = (stage) => {
    const variants = {
      applied: 'default',
      screen: 'secondary',
      test: 'outline',
      offer: 'default',
      hired: 'default',
      rejected: 'destructive'
    }
    return variants[stage] || 'default'
  }

  // Drag and drop sensors for kanban
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates
    })
  )

  // Table columns
  const columns = useMemo(() => [
    {
      accessorKey: 'name',
      header: 'Candidate',
      sortable: true,
      cell: ({ row }) => (
        <div className="flex items-center gap-3">
          <Avatar className="h-8 w-8">
            <AvatarImage src={row.avatar_url} />
            <AvatarFallback>
              {(row.name || 'N A').split(' ').map(n => n[0] || '').join('').slice(0, 2)}
            </AvatarFallback>
          </Avatar>
          <div>
            <div className="font-medium text-white">{row.name || 'Unknown'}</div>
            <div className="text-sm text-white/70 flex items-center gap-1">
              <MailIcon className="h-3 w-3" />
              {row.email || 'No email'}
            </div>
          </div>
        </div>
      )
    },
    {
      accessorKey: 'position',
      header: 'Position',
      sortable: true,
      cell: ({ row }) => (
        <div className="flex items-center gap-1">
          <BriefcaseIcon className="h-4 w-4 text-white/70" />
          <span className="text-white">{row.position}</span>
        </div>
      )
    },
    {
      accessorKey: 'stage',
      header: 'Stage',
      sortable: true,
      type: 'badge',
      badgeVariant: getStageVariant,
      cell: ({ row }) => {
        const rawStage = row.stage
        let stage = 'applied' // Default stage

        // Ensure stage is a valid string
        if (typeof rawStage === 'string' && rawStage.trim()) {
          stage = rawStage.trim().toLowerCase()
        } else if (rawStage && typeof rawStage === 'object' && rawStage.value) {
          // Handle case where stage might be an object with a value property
          stage = String(rawStage.value).toLowerCase()
        }

        return (
          <Badge variant={getStageVariant(stage)}>
            {stage.charAt(0).toUpperCase() + stage.slice(1)}
          </Badge>
        )
      }
    },
    {
      accessorKey: 'location',
      header: 'Location',
      sortable: true,
      cell: ({ row }) => (
        <div className="flex items-center gap-1">
          <MapPinIcon className="h-4 w-4 text-white/70" />
          <span className="text-white">{row.location}</span>
        </div>
      )
    },
    {
      accessorKey: 'experience',
      header: 'Experience',
      sortable: true
    },
    {
      accessorKey: 'created_at',
      header: 'Applied',
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

  const handleCreateCandidate = async (candidateData) => {
    try {
      await createCandidateMutation.mutateAsync(candidateData)
      setIsCreateDialogOpen(false)
    } catch (error) {
      console.error('Failed to create candidate:', error)
    }
  }

  const handleUpdateCandidate = async (candidateData) => {
    try {
      await updateCandidateMutation.mutateAsync({ id: editingCandidate.id, ...candidateData })
      setEditingCandidate(null)
    } catch (error) {
      console.error('Failed to update candidate:', error)
    }
  }

  const handleDeleteCandidate = async (candidate) => {
    if (window.confirm(`Are you sure you want to delete "${candidate.name}"?`)) {
      try {
        await deleteCandidateMutation.mutateAsync(candidate.id)
      } catch (error) {
        console.error('Failed to delete candidate:', error)
      }
    }
  }

  const handleStageChange = async (candidateId, newStage) => {
    try {
      await updateStageMutation.mutateAsync({ id: candidateId, stage: newStage })
    } catch (error) {
      console.error('Failed to update candidate stage:', error)
    }
  }

  const handleBulkStageUpdate = async (stage) => {
    try {
      const updates = selectedRows.map(id => ({ id, stage }))
      await bulkUpdateMutation.mutateAsync(updates)
      setSelectedRows([])
    } catch (error) {
      console.error('Failed to bulk update candidates:', error)
    }
  }

  // Enhanced export functionality is now handled by ExportDialog component

  // Kanban drag end handler
  const [activeId, setActiveId] = useState(null)

  const handleKanbanDragStart = (event) => {
    setActiveId(event.active?.id ?? null)
  }

  const handleKanbanDragEnd = async (event) => {
    const { active, over } = event
    if (!over) return

    const activeStage = active.data?.current?.stage
    let targetStage = null

    const overType = over.data?.current?.type
    if (overType === 'column') {
      targetStage = over.data.current.stage || String(over.id)
    } else if (overType === 'card') {
      targetStage = over.data.current.stage
    } else {
      // Fallback: if we somehow hovered over an element without data, try id when it's a known stage
      if (typeof over.id === 'string') targetStage = over.id
    }

    if (!targetStage) return

    // Only update when the stage actually changes
    if (activeStage !== targetStage) {
      const candidateId = active.id
      await handleStageChange(candidateId, targetStage)
    }
    setTimeout(() => setActiveId(null), 150)
  }

  const handleKanbanDragCancel = () => setActiveId(null)

  // Table configuration
  const tableConfig = {
    data: candidates,
    columns,
    isLoading,
    sorting: [{ id: sortBy, desc: sortOrder === 'desc' }],
    onSortingChange: handleSortingChange,
    filtering: {
      searchable: true,
      searchValue: search,
      searchPlaceholder: 'Search candidates...',
      onSearchChange: setSearch,
      filters: [
        {
          key: 'position',
          label: 'Position',
          placeholder: 'All Positions',
          value: positionFilter,
          options: positions.map(pos => ({ value: pos, label: pos }))
        },
        {
          key: 'stage',
          label: 'Stage',
          placeholder: 'All Stages',
          value: stageFilter,
          options: [
            { value: 'applied', label: 'Applied' },
            { value: 'screen', label: 'Screen' },
            { value: 'test', label: 'Test' },
            { value: 'offer', label: 'Offer' },
            { value: 'hired', label: 'Hired' },
            { value: 'rejected', label: 'Rejected' }
          ]
        },
        {
          key: 'location',
          label: 'Location',
          placeholder: 'All Locations',
          value: locationFilter,
          options: locations.map(loc => ({ value: loc, label: loc }))
        }
      ],
      onFilterChange: (key, value) => {
        if (key === 'position') setPositionFilter(value)
        if (key === 'stage') setStageFilter(value)
        if (key === 'location') setLocationFilter(value)
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
      pageSizeOptions: [25, 50, 100, 200]
    } : null,
    selectedRows,
    onSelectionChange: setSelectedRows,
    onRowClick: (candidate) => navigate(`/app/candidates/${candidate.id}`),
    actions: {
      primary: [
        {
          label: 'New Candidate',
          icon: PlusIcon,
          onClick: () => setIsCreateDialogOpen(true)
        }
      ],
      secondary: [
        ...(selectedRows.length > 0 ? [
          {
            label: `Move ${selectedRows.length} to Screen`,
            icon: ArrowRightIcon,
            onClick: () => handleBulkStageUpdate('screen')
          },
          {
            label: `Move ${selectedRows.length} to Test`,
            icon: ArrowRightIcon,
            onClick: () => handleBulkStageUpdate('test')
          },
          {
            label: `Delete ${selectedRows.length} candidates`,
            icon: TrashIcon,
            onClick: async () => {
              if (window.confirm(`Are you sure you want to delete ${selectedRows.length} candidates?`)) {
                await Promise.all(selectedRows.map(id => deleteCandidateMutation.mutateAsync(id)))
                setSelectedRows([])
              }
            }
          }
        ] : []),
        {
          label: viewMode === 'list' ? 'Kanban View' : 'List View',
          icon: viewMode === 'list' ? GridIcon : ListIcon,
          onClick: () => setViewMode(viewMode === 'list' ? 'kanban' : 'list')
        },
        {
          label: showAdvancedFilters ? 'Hide Advanced Filters' : 'Advanced Filters',
          icon: FilterIcon,
          onClick: () => setShowAdvancedFilters(!showAdvancedFilters)
        },
        {
          label: 'Save Current Search',
          icon: SaveIcon,
          onClick: handleSaveCurrentSearch
        }
      ],
      row: [
        {
          label: 'View',
          icon: EyeIcon,
          onClick: (candidate) => navigate(`/app/candidates/${candidate.id}`)
        },
        {
          label: 'Edit',
          icon: EditIcon,
          onClick: (candidate) => setEditingCandidate(candidate)
        },
        {
          label: 'Move to Test',
          icon: ArrowRightIcon,
          onClick: (candidate) => handleStageChange(candidate.id, 'test')
        },
        {
          label: 'Delete',
          icon: TrashIcon,
          onClick: handleDeleteCandidate
        }
      ]
    }
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
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl lg:text-6xl font-bold tracking-tight mb-4">
              <span className="bg-gradient-to-r from-white via-purple-200 to-pink-200 bg-clip-text text-transparent">
                Candidates
              </span>
            </h1>
            <p className="text-white text-lg lg:text-xl">
              Manage candidates across all stages of your hiring pipeline
            </p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-6 md:grid-cols-4">
          <Card className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 backdrop-blur-lg border border-white/20 shadow-2xl rounded-3xl hover:shadow-purple-500/25 transition-all duration-300 hover:scale-105">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-white">Total Candidates</CardTitle>
              <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
                <UserIcon className="h-4 w-4 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                {pagination?.total || 0}
              </div>
              <p className="text-xs text-white/70 mt-1">
                Across all stages
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-blue-500/20 to-cyan-500/20 backdrop-blur-lg border border-white/20 shadow-2xl rounded-3xl hover:shadow-blue-500/25 transition-all duration-300 hover:scale-105">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-white">In Screen</CardTitle>
              <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-blue-500 to-cyan-500 flex items-center justify-center">
                <FileTextIcon className="h-4 w-4 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                {candidatesByStage.screen?.length || 0}
              </div>
              <p className="text-xs text-white/70 mt-1">
                Pending screen
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-amber-500/20 to-orange-500/20 backdrop-blur-lg border border-white/20 shadow-2xl rounded-3xl hover:shadow-amber-500/25 transition-all duration-300 hover:scale-105">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-white">Tests</CardTitle>
              <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-amber-500 to-orange-500 flex items-center justify-center">
                <CalendarIcon className="h-4 w-4 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                {candidatesByStage.test?.length || 0}
              </div>
              <p className="text-xs text-white/70 mt-1">
                Scheduled or completed
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-500/20 to-emerald-500/20 backdrop-blur-lg border border-white/20 shadow-2xl rounded-3xl hover:shadow-green-500/25 transition-all duration-300 hover:scale-105">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-white">Hired</CardTitle>
              <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-green-500 to-emerald-500 flex items-center justify-center">
                <BriefcaseIcon className="h-4 w-4 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                {candidatesByStage.hired?.length || 0}
              </div>
              <p className="text-xs text-white/70 mt-1">
                Successfully hired
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        {viewMode === 'kanban' ? (
          // Kanban View
          <Card className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-lg border border-white/20 shadow-2xl rounded-3xl">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-white text-xl">Candidate Pipeline</CardTitle>
                  <CardDescription className="text-white">
                    Drag candidates between stages to update their status
                  </CardDescription>
                </div>
                <Button
                  variant="outline"
                  onClick={() => setViewMode('list')}
                  className="bg-white/10 border-white/20 text-white hover:bg-white/20"
                >
                  <ListIcon className="h-4 w-4 mr-2" />
                  List View
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragStart={handleKanbanDragStart}
                onDragEnd={handleKanbanDragEnd}
                onDragCancel={handleKanbanDragCancel}
              >
                <div className="flex gap-4 overflow-x-auto pb-4">
                  {Object.entries(candidatesByStage).map(([stage, stageCandidates]) => (
                    <KanbanColumn
                      key={stage}
                      stage={stage}
                      candidates={stageCandidates}
                      onCandidateMove={handleStageChange}
                    />
                  ))}
                </div>
                <DragOverlay dropAnimation={{ ...defaultDropAnimation, duration: 200 }}>
                  {activeId ? (
                    // Render a lightweight preview; lookup candidate by id from grouped data
                    (() => {
                      const all = Object.values(candidatesByStage || {}).flat()
                      const cand = all.find(c => c.id === activeId)
                      return cand ? (
                        <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-lg border border-white/20 rounded-2xl p-3">
                          <div className="flex items-center gap-2 mb-2">
                            <Avatar className="h-8 w-8">
                              <AvatarFallback className="text-xs bg-gradient-to-r from-purple-500 to-pink-500 text-white">
                                {cand.name.split(' ').map(n => n[0]).join('')}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                              <h4 className="font-medium text-sm truncate text-white">{cand.name}</h4>
                              <p className="text-xs text-white/70 truncate">{cand.position}</p>
                            </div>
                          </div>
                        </div>
                      ) : null
                    })()
                  ) : null}
                </DragOverlay>
              </DndContext>
            </CardContent>
          </Card>
        ) : (
          // Advanced Filters and Saved Searches
          <>
            {/* Advanced Filters */}
            <AdvancedFilterPanel
              filters={currentFilters}
              onFilterChange={handleAdvancedFilterChange}
              filterOptions={filterOptions}
              isOpen={showAdvancedFilters}
              onOpenChange={setShowAdvancedFilters}
            />

            {/* Saved Searches and Export */}
            <div className="flex justify-between items-center">
              <SavedSearchesDropdown
                type="candidates"
                onApplySearch={handleApplySavedSearch}
              />
              <div className="flex gap-2">
                <ExportDialog
                  data={candidates}
                  type="candidates"
                  title="Export Candidates"
                  description="Export candidates data in your preferred format"
                  onExportComplete={(format, columns, records) => {
                    console.log(`Exported ${records} candidates in ${format} format with ${columns} columns`)
                  }}
                />
                <SaveSearchDialog
                  isOpen={isSaveSearchOpen}
                  onOpenChange={setIsSaveSearchOpen}
                  currentFilters={currentFilters}
                  searchQuery={search}
                  type="candidates"
                  onSave={(saved) => {
                    // After saving, reflect applied search immediately
                    handleApplySavedSearch(saved)
                  }}
                />
                <BulkExportDialog
                  datasets={[
                    {
                      type: 'candidates',
                      data: candidates,
                      config: {
                        title: 'Candidates Export',
                        columns: ['name', 'email', 'phone', 'position', 'stage', 'location', 'experience', 'created_at'],
                        filename: (type) => `candidates_export_${format(new Date(), 'yyyy-MM-dd')}.${type}`
                      }
                    }
                  ]}
                  title="Bulk Export"
                  description="Export all candidates data"
                />
              </div>
            </div>

            {/* List View with Virtualization for Performance */}
            <Card className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-lg border border-white/20 shadow-2xl rounded-3xl">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-white text-xl">All Candidates</CardTitle>
                    <CardDescription className="text-gray-300">
                      Efficiently browse through all candidates with virtual scrolling
                    </CardDescription>
                  </div>
                  <Button
                    variant="outline"
                    onClick={() => setViewMode('kanban')}
                    className="bg-white/10 border-white/20 text-white hover:bg-white/20"
                  >
                    <GridIcon className="h-4 w-4 mr-2" />
                    Kanban View
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <DataTable {...tableConfig} />
              </CardContent>
            </Card>
          </>
        )}

        {/* Create Candidate Dialog */}
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogContent className="max-w-2xl bg-gradient-to-br from-slate-900 to-slate-800 border border-white/20 text-white">
            <DialogHeader>
              <DialogTitle className="text-xl bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                Add New Candidate
              </DialogTitle>
              <DialogDescription className="text-gray-300">
                Add a new candidate to your talent pipeline
              </DialogDescription>
            </DialogHeader>

            <CandidateForm
              onSave={handleCreateCandidate}
              onCancel={() => setIsCreateDialogOpen(false)}
            />
          </DialogContent>
        </Dialog>

        {/* Edit Candidate Dialog */}
        <Dialog open={!!editingCandidate} onOpenChange={() => setEditingCandidate(null)}>
          <DialogContent className="max-w-2xl bg-gradient-to-br from-slate-900 to-slate-800 border border-white/20 text-white">
            <DialogHeader>
              <DialogTitle className="text-xl bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                Edit Candidate
              </DialogTitle>
              <DialogDescription className="text-gray-300">
                Update candidate information and status
              </DialogDescription>
            </DialogHeader>

            {editingCandidate && (
              <CandidateForm
                candidate={editingCandidate}
                onSave={handleUpdateCandidate}
                onCancel={() => setEditingCandidate(null)}
              />
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}