import React from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import {
  ChevronUpIcon,
  ChevronDownIcon,
  MoreHorizontalIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronsLeftIcon,
  ChevronsRightIcon,
  SearchIcon,
  FilterIcon,
  DownloadIcon
} from 'lucide-react'
import { cn } from '@/lib/utils'

export function DataTable({
  data = [],
  columns = [],
  pagination = null,
  isLoading = false,
  sorting = null,
  onSortingChange = null,
  filtering = null,
  onFilteringChange = null,
  onRowClick = null,
  selectedRows = null,
  onSelectionChange = null,
  actions = null,
  className = '',
  emptyMessage = 'No data available',
  loadingMessage = 'Loading...'
}) {
  // Handle sorting
  const handleSort = (column) => {
    if (!onSortingChange || !column.sortable) return
    
    const currentSort = sorting?.find(s => s.id === column.accessorKey)
    let newSorting = []
    
    if (!currentSort) {
      newSorting = [{ id: column.accessorKey, desc: false }]
    } else if (!currentSort.desc) {
      newSorting = [{ id: column.accessorKey, desc: true }]
    } else {
      newSorting = []
    }
    
    onSortingChange(newSorting)
  }
  
  // Get sort direction for column
  const getSortDirection = (column) => {
    if (!sorting || !column.sortable) return null
    const sort = sorting.find(s => s.id === column.accessorKey)
    if (!sort) return null
    return sort.desc ? 'desc' : 'asc'
  }
  
  // Handle pagination
  const handlePageChange = (page) => {
    if (pagination?.onPageChange) {
      pagination.onPageChange(page)
    }
  }
  
  // Handle page size change
  const handlePageSizeChange = (pageSize) => {
    if (pagination?.onPageSizeChange) {
      pagination.onPageSizeChange(pageSize)
    }
  }
  
  // Handle search
  const handleSearch = (value) => {
    if (filtering?.onSearchChange) {
      filtering.onSearchChange(value)
    }
  }
  
  // Handle filter change
  const handleFilterChange = (key, value) => {
    if (filtering?.onFilterChange) {
      filtering.onFilterChange(key, value)
    }
  }
  
  // Render cell content
  const renderCell = (row, column) => {
    if (column.cell) {
      return column.cell({ row, column })
    }
    
    const value = row[column.accessorKey]
    
    // Handle different data types
    if (column.type === 'badge') {
      const variant = column.badgeVariant?.(value) || 'default'
      return <Badge variant={variant}>{value}</Badge>
    }
    
    if (column.type === 'date') {
      return new Date(value).toLocaleDateString()
    }
    
    if (column.type === 'datetime') {
      return new Date(value).toLocaleString()
    }
    
    if (column.type === 'number') {
      return typeof value === 'number' ? value.toLocaleString() : value
    }
    
    if (column.type === 'boolean') {
      return value ? 'Yes' : 'No'
    }
    
    return value
  }
  
  // Export functionality
  const handleExport = () => {
    if (actions?.onExport) {
      actions.onExport(data)
    }
  }

  return (
    <div className={cn('space-y-4', className)}>
      {/* Filters and Actions */}
      {(filtering || actions) && (
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            {/* Search */}
            {filtering?.searchable && (
              <div className="relative">
                <SearchIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder={filtering.searchPlaceholder || 'Search...'}
                  value={filtering.searchValue || ''}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="pl-9 w-[300px]"
                />
              </div>
            )}
            
            {/* Filters */}
            {filtering?.filters?.map((filter) => (
              <Select
                key={filter.key}
                value={filter.value || 'all'}
                onValueChange={(value) => handleFilterChange(filter.key, value)}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder={filter.placeholder} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All {filter.label}</SelectItem>
                  {filter.options?.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ))}
          </div>
          
          {/* Actions */}
          {actions && (
            <div className="flex items-center gap-2">
              {actions.primary?.map((action, index) => (
                <Button
                  key={index}
                  onClick={action.onClick}
                  variant={action.variant || 'default'}
                  size="sm"
                >
                  {action.icon && React.createElement(action.icon, { className: "h-4 w-4 mr-2" })}
                  {typeof action.label === 'function' ? action.label() : action.label}
                </Button>
              ))}
              
              {actions.secondary?.length > 0 && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm">
                      <MoreHorizontalIcon className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    {actions.secondary.map((action, index) => (
                      <DropdownMenuItem
                        key={index}
                        onClick={action.onClick}
                      >
                        {action.icon && React.createElement(action.icon, { className: "h-4 w-4 mr-2" })}
                        {typeof action.label === 'function' ? action.label() : action.label}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
              
              {actions.onExport && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleExport}
                >
                  <DownloadIcon className="h-4 w-4 mr-2" />
                  Export
                </Button>
              )}
            </div>
          )}
        </div>
      )}
      
      {/* Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              {selectedRows && (
                <TableHead className="w-12">
                  <input
                    type="checkbox"
                    checked={selectedRows.length === data.length && data.length > 0}
                    onChange={(e) => {
                      if (onSelectionChange) {
                        onSelectionChange(e.target.checked ? data.map(row => row.id) : [])
                      }
                    }}
                    className="rounded border-gray-300"
                  />
                </TableHead>
              )}
              
              {columns.map((column) => (
                <TableHead
                  key={column.accessorKey}
                  className={cn(
                    column.className,
                    column.sortable && 'cursor-pointer select-none hover:bg-muted/50'
                  )}
                  onClick={() => handleSort(column)}
                >
                  <div className="flex items-center gap-2">
                    {column.header}
                    {column.sortable && (
                      <div className="flex flex-col">
                        <ChevronUpIcon
                          className={cn(
                            'h-3 w-3',
                            getSortDirection(column) === 'asc'
                              ? 'text-foreground'
                              : 'text-muted-foreground'
                          )}
                        />
                        <ChevronDownIcon
                          className={cn(
                            'h-3 w-3 -mt-1',
                            getSortDirection(column) === 'desc'
                              ? 'text-foreground'
                              : 'text-muted-foreground'
                          )}
                        />
                      </div>
                    )}
                  </div>
                </TableHead>
              ))}
              
              {actions?.row && <TableHead className="w-12"></TableHead>}
            </TableRow>
          </TableHeader>
          
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length + (selectedRows ? 1 : 0) + (actions?.row ? 1 : 0)}
                  className="h-24 text-center"
                >
                  {loadingMessage}
                </TableCell>
              </TableRow>
            ) : data.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length + (selectedRows ? 1 : 0) + (actions?.row ? 1 : 0)}
                  className="h-24 text-center"
                >
                  {emptyMessage}
                </TableCell>
              </TableRow>
            ) : (
              data.map((row, index) => (
                <TableRow
                  key={row.id || index}
                  className={cn(
                    onRowClick && 'cursor-pointer hover:bg-muted/50',
                    selectedRows?.includes(row.id) && 'bg-muted/30'
                  )}
                  onClick={() => onRowClick?.(row)}
                >
                  {selectedRows && (
                    <TableCell>
                      <input
                        type="checkbox"
                        checked={selectedRows.includes(row.id)}
                        onChange={(e) => {
                          if (onSelectionChange) {
                            const newSelection = e.target.checked
                              ? [...selectedRows, row.id]
                              : selectedRows.filter(id => id !== row.id)
                            onSelectionChange(newSelection)
                          }
                        }}
                        onClick={(e) => e.stopPropagation()}
                        className="rounded border-gray-300"
                      />
                    </TableCell>
                  )}
                  
                  {columns.map((column) => (
                    <TableCell key={column.accessorKey} className={column.className}>
                      {renderCell(row, column)}
                    </TableCell>
                  ))}
                  
                  {actions?.row && (
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <MoreHorizontalIcon className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          {actions.row.map((action, index) => (
                            <DropdownMenuItem
                              key={index}
                              onClick={(e) => {
                                e.stopPropagation()
                                action.onClick(row)
                              }}
                            >
                              {action.icon && React.createElement(
                                typeof action.icon === 'function' ? action.icon(row) : action.icon, 
                                { className: "h-4 w-4 mr-2" }
                              )}
                              {typeof action.label === 'function' ? action.label(row) : action.label}
                            </DropdownMenuItem>
                          ))}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  )}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
      
      {/* Pagination */}
      {pagination && (
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>
              Showing {Math.min((pagination.page - 1) * pagination.pageSize + 1, pagination.total)} to{' '}
              {Math.min(pagination.page * pagination.pageSize, pagination.total)} of{' '}
              {pagination.total} results
            </span>
            
            {pagination.pageSizeOptions && (
              <div className="flex items-center gap-2 ml-4">
                <span>Rows per page:</span>
                <Select
                  value={pagination.pageSize.toString()}
                  onValueChange={(value) => handlePageSizeChange(parseInt(value))}
                >
                  <SelectTrigger className="w-16 h-8">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {pagination.pageSizeOptions.map((size) => (
                      <SelectItem key={size} value={size.toString()}>
                        {size}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(1)}
              disabled={pagination.page === 1}
            >
              <ChevronsLeftIcon className="h-4 w-4" />
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(pagination.page - 1)}
              disabled={pagination.page === 1}
            >
              <ChevronLeftIcon className="h-4 w-4" />
            </Button>
            
            <div className="flex items-center gap-1">
              <span className="text-sm">Page</span>
              <Input
                className="w-16 h-8 text-center"
                value={pagination.page}
                onChange={(e) => {
                  const page = parseInt(e.target.value)
                  if (page >= 1 && page <= pagination.totalPages) {
                    handlePageChange(page)
                  }
                }}
              />
              <span className="text-sm">of {pagination.totalPages}</span>
            </div>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(pagination.page + 1)}
              disabled={pagination.page === pagination.totalPages}
            >
              <ChevronRightIcon className="h-4 w-4" />
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(pagination.totalPages)}
              disabled={pagination.page === pagination.totalPages}
            >
              <ChevronsRightIcon className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}