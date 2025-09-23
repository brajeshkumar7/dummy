import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { toast } from 'sonner'
import {
  DownloadIcon,
  FileTextIcon,
  TableIcon,
  FileSpreadsheetIcon,
  FileJsonIcon,
  Loader2Icon
} from 'lucide-react'
import { exportData, exportConfigs, bulkExport } from '@/lib/export'

const formatIcons = {
  csv: TableIcon,
  excel: FileSpreadsheetIcon,
  json: FileJsonIcon,
  pdf: FileTextIcon
}

const formatDescriptions = {
  csv: 'Comma-separated values for spreadsheet applications',
  excel: 'Microsoft Excel format (.xlsx)',
  json: 'JavaScript Object Notation for data interchange',
  pdf: 'Portable Document Format for reports (HTML version)'
}

export function ExportDialog({ 
  data, 
  type, 
  title = 'Export Data',
  description = 'Choose your export format and options',
  trigger = null,
  onExportComplete = null 
}) {
  const [isOpen, setIsOpen] = useState(false)
  const [selectedFormat, setSelectedFormat] = useState('csv')
  const [selectedColumns, setSelectedColumns] = useState([])
  const [isExporting, setIsExporting] = useState(false)
  const [includeMetadata, setIncludeMetadata] = useState(true)

  const config = exportConfigs[type] || {
    columns: data.length > 0 ? Object.keys(data[0]) : [],
    filename: (format) => `export_${new Date().toISOString().split('T')[0]}.${format}`,
    title: 'Data Export'
  }

  // Initialize selected columns when dialog opens
  React.useEffect(() => {
    if (isOpen && selectedColumns.length === 0) {
      setSelectedColumns(config.columns)
    }
  }, [isOpen, config.columns])

  const handleExport = async () => {
    if (!data || data.length === 0) {
      toast.error('No data to export')
      return
    }

    if (selectedColumns.length === 0) {
      toast.error('Please select at least one column to export')
      return
    }

    setIsExporting(true)

    try {
      // Create custom config with selected columns
      const customConfig = {
        ...config,
        columns: selectedColumns,
        includeMetadata
      }

      // Filter data to only include selected columns
      const filteredData = data.map(item => {
        const filtered = {}
        selectedColumns.forEach(col => {
          filtered[col] = item[col]
        })
        if (includeMetadata) {
          filtered._exported_at = new Date().toISOString()
          filtered._record_count = data.length
        }
        return filtered
      })

      await exportData(filteredData, customConfig, selectedFormat)
      
      toast.success(`Export completed! Downloaded as ${selectedFormat.toUpperCase()}`)
      
      if (onExportComplete) {
        onExportComplete(selectedFormat, selectedColumns.length, data.length)
      }
      
      setIsOpen(false)
    } catch (error) {
      console.error('Export failed:', error)
      toast.error(`Export failed: ${error.message}`)
    } finally {
      setIsExporting(false)
    }
  }

  const toggleColumn = (column) => {
    setSelectedColumns(prev => 
      prev.includes(column)
        ? prev.filter(col => col !== column)
        : [...prev, column]
    )
  }

  const selectAllColumns = () => {
    setSelectedColumns(config.columns)
  }

  const deselectAllColumns = () => {
    setSelectedColumns([])
  }

  const FormatIcon = formatIcons[selectedFormat] || FileTextIcon

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm">
            <DownloadIcon className="h-4 w-4 mr-2" />
            Export
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>
            {description}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Format Selection */}
          <div className="space-y-3">
            <Label className="text-base font-medium">Export Format</Label>
            <Select value={selectedFormat} onValueChange={setSelectedFormat}>
              <SelectTrigger>
                <SelectValue placeholder="Select format" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="csv">
                  <div className="flex items-center gap-2">
                    <TableIcon className="h-4 w-4" />
                    <span>CSV</span>
                  </div>
                </SelectItem>
                <SelectItem value="excel">
                  <div className="flex items-center gap-2">
                    <FileSpreadsheetIcon className="h-4 w-4" />
                    <span>Excel (.xlsx)</span>
                  </div>
                </SelectItem>
                <SelectItem value="json">
                  <div className="flex items-center gap-2">
                    <FileJsonIcon className="h-4 w-4" />
                    <span>JSON</span>
                  </div>
                </SelectItem>
                <SelectItem value="pdf">
                  <div className="flex items-center gap-2">
                    <FileTextIcon className="h-4 w-4" />
                    <span>PDF Report</span>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
            <p className="text-sm text-muted-foreground">
              {formatDescriptions[selectedFormat]}
            </p>
          </div>

          <Separator />

          {/* Column Selection */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-base font-medium">Columns to Export</Label>
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={selectAllColumns}
                >
                  Select All
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={deselectAllColumns}
                >
                  Clear All
                </Button>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-3 max-h-40 overflow-y-auto p-2 border rounded">
              {config.columns.map((column) => (
                <div key={column} className="flex items-center space-x-2">
                  <Checkbox
                    id={column}
                    checked={selectedColumns.includes(column)}
                    onCheckedChange={() => toggleColumn(column)}
                  />
                  <Label
                    htmlFor={column}
                    className="text-sm font-normal cursor-pointer"
                  >
                    {column.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  </Label>
                </div>
              ))}
            </div>
            
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>Selected:</span>
              <Badge variant="outline">{selectedColumns.length} of {config.columns.length}</Badge>
            </div>
          </div>

          <Separator />

          {/* Export Options */}
          <div className="space-y-3">
            <Label className="text-base font-medium">Export Options</Label>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="metadata"
                checked={includeMetadata}
                onCheckedChange={setIncludeMetadata}
              />
              <Label htmlFor="metadata" className="text-sm font-normal cursor-pointer">
                Include export metadata (timestamp, record count)
              </Label>
            </div>
          </div>

          {/* Export Summary */}
          <div className="bg-muted/50 rounded-lg p-4 space-y-2">
            <div className="flex items-center gap-2">
              {React.createElement(FormatIcon, { className: "h-4 w-4" })}
              <span className="font-medium">Export Summary</span>
            </div>
            <div className="text-sm text-muted-foreground space-y-1">
              <p>• Format: {selectedFormat.toUpperCase()}</p>
              <p>• Records: {data?.length || 0}</p>
              <p>• Columns: {selectedColumns.length}</p>
              <p>• Estimated size: {Math.round((data?.length || 0) * selectedColumns.length * 10 / 1024)} KB</p>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            Cancel
          </Button>
          <Button 
            onClick={handleExport} 
            disabled={isExporting || selectedColumns.length === 0}
          >
            {isExporting && <Loader2Icon className="h-4 w-4 mr-2 animate-spin" />}
            {isExporting ? 'Exporting...' : 'Export Data'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// Bulk Export Dialog for exporting multiple datasets
export function BulkExportDialog({ 
  datasets, 
  title = 'Bulk Export',
  description = 'Export multiple datasets at once',
  trigger = null,
  onExportComplete = null 
}) {
  const [isOpen, setIsOpen] = useState(false)
  const [selectedFormat, setSelectedFormat] = useState('csv')
  const [selectedDatasets, setSelectedDatasets] = useState([])
  const [isExporting, setIsExporting] = useState(false)

  React.useEffect(() => {
    if (isOpen && selectedDatasets.length === 0) {
      setSelectedDatasets(datasets.map(d => d.type))
    }
  }, [isOpen, datasets])

  const handleBulkExport = async () => {
    if (selectedDatasets.length === 0) {
      toast.error('Please select at least one dataset to export')
      return
    }

    setIsExporting(true)

    try {
      const datasetsToExport = datasets
        .filter(d => selectedDatasets.includes(d.type))
        .filter(d => d.data && d.data.length > 0)

      if (datasetsToExport.length === 0) {
        toast.error('No data available for selected datasets')
        return
      }

      await bulkExport(datasetsToExport, selectedFormat)
      
      toast.success(`Bulk export completed! ${datasetsToExport.length} files downloaded`)
      
      if (onExportComplete) {
        onExportComplete(selectedFormat, datasetsToExport.length)
      }
      
      setIsOpen(false)
    } catch (error) {
      console.error('Bulk export failed:', error)
      toast.error(`Bulk export failed: ${error.message}`)
    } finally {
      setIsExporting(false)
    }
  }

  const toggleDataset = (type) => {
    setSelectedDatasets(prev => 
      prev.includes(type)
        ? prev.filter(t => t !== type)
        : [...prev, type]
    )
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm">
            <DownloadIcon className="h-4 w-4 mr-2" />
            Bulk Export
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>
            {description}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Format Selection */}
          <div className="space-y-2">
            <Label>Export Format</Label>
            <Select value={selectedFormat} onValueChange={setSelectedFormat}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="csv">CSV</SelectItem>
                <SelectItem value="excel">Excel</SelectItem>
                <SelectItem value="json">JSON</SelectItem>
                <SelectItem value="pdf">PDF</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Dataset Selection */}
          <div className="space-y-2">
            <Label>Datasets to Export</Label>
            <div className="space-y-2">
              {datasets.map((dataset) => (
                <div key={dataset.type} className="flex items-center justify-between p-2 border rounded">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      checked={selectedDatasets.includes(dataset.type)}
                      onCheckedChange={() => toggleDataset(dataset.type)}
                    />
                    <Label className="font-medium capitalize">
                      {dataset.type}
                    </Label>
                  </div>
                  <Badge variant="outline">
                    {dataset.data?.length || 0} records
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            Cancel
          </Button>
          <Button 
            onClick={handleBulkExport} 
            disabled={isExporting || selectedDatasets.length === 0}
          >
            {isExporting && <Loader2Icon className="h-4 w-4 mr-2 animate-spin" />}
            {isExporting ? 'Exporting...' : `Export ${selectedDatasets.length} datasets`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}