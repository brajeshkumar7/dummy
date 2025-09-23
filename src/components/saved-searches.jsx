import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import {
  SaveIcon,
  SearchIcon,
  StarIcon,
  TrashIcon,
  FilterIcon,
  XIcon,
  BookmarkIcon,
  FolderIcon,
  ClockIcon
} from 'lucide-react'
import { cn } from '@/lib/utils'

// Local storage keys
const SAVED_SEARCHES_KEY = 'talentflow_saved_searches'
const RECENT_SEARCHES_KEY = 'talentflow_recent_searches'

// Saved search helper functions
export const savedSearchUtils = {
  getSavedSearches: () => {
    try {
      return JSON.parse(localStorage.getItem(SAVED_SEARCHES_KEY) || '[]')
    } catch {
      return []
    }
  },

  saveSearch: (search) => {
    const searches = savedSearchUtils.getSavedSearches()
    const newSearch = {
      ...search,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      lastUsed: new Date().toISOString()
    }
    searches.push(newSearch)
    localStorage.setItem(SAVED_SEARCHES_KEY, JSON.stringify(searches))
    return newSearch
  },

  deleteSearch: (id) => {
    const searches = savedSearchUtils.getSavedSearches()
    const filtered = searches.filter(s => s.id !== id)
    localStorage.setItem(SAVED_SEARCHES_KEY, JSON.stringify(filtered))
  },

  updateLastUsed: (id) => {
    const searches = savedSearchUtils.getSavedSearches()
    const updated = searches.map(s =>
      s.id === id ? { ...s, lastUsed: new Date().toISOString() } : s
    )
    localStorage.setItem(SAVED_SEARCHES_KEY, JSON.stringify(updated))
  },

  getRecentSearches: () => {
    try {
      return JSON.parse(localStorage.getItem(RECENT_SEARCHES_KEY) || '[]')
    } catch {
      return []
    }
  },

  addRecentSearch: (searchQuery) => {
    if (!searchQuery.trim()) return

    const recent = savedSearchUtils.getRecentSearches()
    const filtered = recent.filter(s => s.query !== searchQuery.trim())
    const updated = [
      { query: searchQuery.trim(), timestamp: new Date().toISOString() },
      ...filtered
    ].slice(0, 10) // Keep only 10 recent searches

    localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated))
  }
}

// Save Search Dialog Component
export function SaveSearchDialog({
  currentFilters,
  searchQuery,
  isOpen,
  onOpenChange,
  onSave,
  type = 'jobs' // 'jobs' | 'candidates'
}) {
  const [searchName, setSearchName] = useState('')
  const [description, setDescription] = useState('')

  const handleSave = () => {
    if (!searchName.trim()) return

    const search = {
      name: searchName.trim(),
      description: description.trim(),
      type,
      filters: currentFilters,
      searchQuery: searchQuery.trim(),
      filterCount: Object.values(currentFilters).filter(v => v && v !== 'all').length
    }

    const savedSearch = savedSearchUtils.saveSearch(search)
    // Notify any listeners (e.g., dropdown) that saved searches were updated
    try {
      window.dispatchEvent(new CustomEvent('saved-searches:updated', { detail: { type } }))
    } catch { }
    onSave?.(savedSearch)
    setSearchName('')
    setDescription('')
    onOpenChange(false)
  }

  const activeFilters = Object.entries(currentFilters)
    .filter(([key, value]) => value && value !== 'all')
    .map(([key, value]) => ({ key, value }))

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Save Search</DialogTitle>
          <DialogDescription>
            Save your current search and filters for quick access later
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label htmlFor="search-name">Search Name</Label>
            <Input
              id="search-name"
              value={searchName}
              onChange={(e) => setSearchName(e.target.value)}
              placeholder="Enter a name for this search"
            />
          </div>

          <div>
            <Label htmlFor="search-description">Description (Optional)</Label>
            <Input
              id="search-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief description of this search"
            />
          </div>

          <Separator />

          <div>
            <Label className="text-sm font-medium">Current Search & Filters</Label>
            <div className="mt-2 space-y-2">
              {searchQuery && (
                <div className="flex items-center gap-2">
                  <SearchIcon className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">"{searchQuery}"</span>
                </div>
              )}

              {activeFilters.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {activeFilters.map(({ key, value }) => (
                    <Badge key={key} variant="secondary" className="text-xs">
                      {key}: {value}
                    </Badge>
                  ))}
                </div>
              )}

              {!searchQuery && activeFilters.length === 0 && (
                <p className="text-sm text-muted-foreground">No search or filters applied</p>
              )}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={!searchName.trim()}>
            <SaveIcon className="h-4 w-4 mr-2" />
            Save Search
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// Saved Searches Dropdown Component
export function SavedSearchesDropdown({
  onApplySearch,
  onDeleteSearch,
  type = 'jobs',
  className
}) {
  const [savedSearches, setSavedSearches] = useState([])
  const [recentSearches, setRecentSearches] = useState([])

  useEffect(() => {
    const load = () => {
      setSavedSearches(savedSearchUtils.getSavedSearches().filter(s => s.type === type))
      setRecentSearches(savedSearchUtils.getRecentSearches())
    }
    load()
    const onStorage = (e) => {
      if (e.key === 'talentflow_saved_searches' || e.key === 'talentflow_recent_searches') load()
    }
    const onCustom = (e) => {
      if (!e?.detail?.type || e.detail.type === type) load()
    }
    window.addEventListener('storage', onStorage)
    window.addEventListener('saved-searches:updated', onCustom)
    return () => {
      window.removeEventListener('storage', onStorage)
      window.removeEventListener('saved-searches:updated', onCustom)
    }
  }, [type])

  const handleApplySearch = (search) => {
    savedSearchUtils.updateLastUsed(search.id)
    setSavedSearches(savedSearchUtils.getSavedSearches().filter(s => s.type === type))
    onApplySearch?.(search)
  }

  const handleDeleteSearch = (searchId) => {
    savedSearchUtils.deleteSearch(searchId)
    setSavedSearches(savedSearchUtils.getSavedSearches().filter(s => s.type === type))
    onDeleteSearch?.(searchId)
  }

  const handleApplyRecentSearch = (query) => {
    onApplySearch?.({ searchQuery: query, filters: {} })
  }

  const recentlySaved = savedSearches
    .sort((a, b) => new Date(b.lastUsed) - new Date(a.lastUsed))
    .slice(0, 5)

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className={cn("justify-start", className)}>
          <BookmarkIcon className="h-4 w-4 mr-2" />
          Saved Searches
          {savedSearches.length > 0 && (
            <Badge variant="secondary" className="ml-2">
              {savedSearches.length}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent className="w-80" align="start">
        {/* Recently Used Saved Searches */}
        {recentlySaved.length > 0 && (
          <>
            <DropdownMenuLabel className="flex items-center gap-2">
              <StarIcon className="h-4 w-4" />
              Recently Used
            </DropdownMenuLabel>
            {recentlySaved.map((search) => (
              <DropdownMenuItem
                key={search.id}
                className="flex items-center justify-between p-3"
                onClick={() => handleApplySearch(search)}
              >
                <div className="flex-1 min-w-0">
                  <div className="font-medium truncate">{search.name}</div>
                  <div className="text-xs text-muted-foreground flex items-center gap-2">
                    <span>
                      {search.filterCount} filter{search.filterCount !== 1 ? 's' : ''}
                    </span>
                    {search.searchQuery && (
                      <span className="truncate">"{search.searchQuery}"</span>
                    )}
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100"
                  onClick={(e) => {
                    e.stopPropagation()
                    handleDeleteSearch(search.id)
                  }}
                >
                  <TrashIcon className="h-3 w-3" />
                </Button>
              </DropdownMenuItem>
            ))}
            <DropdownMenuSeparator />
          </>
        )}

        {/* All Saved Searches */}
        {savedSearches.length > 0 && (
          <>
            <DropdownMenuLabel className="flex items-center gap-2">
              <FolderIcon className="h-4 w-4" />
              All Saved Searches ({savedSearches.length})
            </DropdownMenuLabel>
            <div className="max-h-48 overflow-y-auto">
              {savedSearches.map((search) => (
                <DropdownMenuItem
                  key={search.id}
                  className="flex items-center justify-between p-3 group"
                  onClick={() => handleApplySearch(search)}
                >
                  <div className="flex-1 min-w-0">
                    <div className="font-medium truncate">{search.name}</div>
                    {search.description && (
                      <div className="text-xs text-muted-foreground truncate">
                        {search.description}
                      </div>
                    )}
                    <div className="text-xs text-muted-foreground flex items-center gap-2 mt-1">
                      <span>
                        {search.filterCount} filter{search.filterCount !== 1 ? 's' : ''}
                      </span>
                      {search.searchQuery && (
                        <span className="truncate">"{search.searchQuery}"</span>
                      )}
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleDeleteSearch(search.id)
                    }}
                  >
                    <TrashIcon className="h-3 w-3" />
                  </Button>
                </DropdownMenuItem>
              ))}
            </div>
            <DropdownMenuSeparator />
          </>
        )}

        {/* Recent Searches */}
        {recentSearches.length > 0 && (
          <>
            <DropdownMenuLabel className="flex items-center gap-2">
              <ClockIcon className="h-4 w-4" />
              Recent Searches
            </DropdownMenuLabel>
            {recentSearches.slice(0, 5).map((recent, index) => (
              <DropdownMenuItem
                key={index}
                onClick={() => handleApplyRecentSearch(recent.query)}
              >
                <SearchIcon className="h-4 w-4 mr-2" />
                <span className="truncate">"{recent.query}"</span>
              </DropdownMenuItem>
            ))}
          </>
        )}

        {savedSearches.length === 0 && recentSearches.length === 0 && (
          <div className="p-4 text-center text-sm text-muted-foreground">
            No saved or recent searches yet
          </div>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

// Advanced Filter Panel Component
export function AdvancedFilterPanel({
  filters,
  onFilterChange,
  filterOptions,
  isOpen,
  onOpenChange
}) {
  if (!isOpen) return null

  const activeFiltersCount = Object.values(filters).filter(v => v && v !== 'all').length

  return (
    <Card className="mb-4">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FilterIcon className="h-4 w-4" />
            <CardTitle className="text-sm">Advanced Filters</CardTitle>
            {activeFiltersCount > 0 && (
              <Badge variant="secondary" className="text-xs">
                {activeFiltersCount} active
              </Badge>
            )}
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onOpenChange(false)}
          >
            <XIcon className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filterOptions.map((option) => (
            <div key={option.key} className="space-y-2">
              <Label className="text-xs font-medium text-muted-foreground">
                {option.label}
              </Label>
              <select
                value={filters[option.key] || 'all'}
                onChange={(e) => onFilterChange(option.key, e.target.value)}
                className="w-full h-8 px-2 text-sm border border-input bg-background rounded-md"
              >
                <option value="all">{option.placeholder}</option>
                {option.options.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          ))}
        </div>

        {activeFiltersCount > 0 && (
          <div className="mt-4 pt-3 border-t">
            <div className="flex items-center justify-between">
              <div className="text-xs text-muted-foreground">
                {activeFiltersCount} filter{activeFiltersCount !== 1 ? 's' : ''} applied
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  Object.keys(filters).forEach(key => {
                    onFilterChange(key, 'all')
                  })
                }}
              >
                Clear All
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}