// Export utilities for TALENT FLOW
// Supports CSV, Excel, JSON, and PDF exports

import { format } from 'date-fns'

// CSV Export Utility
export function exportToCSV(data, filename, columns = null) {
  if (!data || data.length === 0) {
    throw new Error('No data to export')
  }

  // If columns not specified, use all keys from first object
  const headers = columns || Object.keys(data[0])
  
  // Create CSV content
  const csvContent = [
    // Headers
    headers.join(','),
    // Data rows
    ...data.map(row => 
      headers.map(header => {
        const value = row[header]
        // Handle special characters and commas
        if (typeof value === 'string' && (value.includes(',') || value.includes('"') || value.includes('\n'))) {
          return `"${value.replace(/"/g, '""')}"`
        }
        return value
      }).join(',')
    )
  ].join('\n')

  // Download file
  downloadFile(csvContent, `${filename}.csv`, 'text/csv')
}

// JSON Export Utility
export function exportToJSON(data, filename) {
  if (!data || data.length === 0) {
    throw new Error('No data to export')
  }

  const jsonContent = JSON.stringify(data, null, 2)
  downloadFile(jsonContent, `${filename}.json`, 'application/json')
}

// Excel Export Utility (using simple XML format for .xlsx compatibility)
export function exportToExcel(data, filename, sheetName = 'Sheet1') {
  if (!data || data.length === 0) {
    throw new Error('No data to export')
  }

  // Create a simple Excel XML structure
  const headers = Object.keys(data[0])
  
  let excelContent = `<?xml version="1.0"?>
<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:o="urn:schemas-microsoft-com:office:office"
 xmlns:x="urn:schemas-microsoft-com:office:excel"
 xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:html="http://www.w3.org/TR/REC-html40">
 <Worksheet ss:Name="${sheetName}">
  <Table>
   <Row>
    ${headers.map(header => `<Cell><Data ss:Type="String">${header}</Data></Cell>`).join('')}
   </Row>`

  data.forEach(row => {
    excelContent += `
   <Row>
    ${headers.map(header => {
      const value = row[header]
      const type = typeof value === 'number' ? 'Number' : 'String'
      return `<Cell><Data ss:Type="${type}">${value}</Data></Cell>`
    }).join('')}
   </Row>`
  })

  excelContent += `
  </Table>
 </Worksheet>
</Workbook>`

  downloadFile(excelContent, `${filename}.xlsx`, 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
}

// PDF Export Utility (Basic HTML to PDF)
export function exportToPDF(data, filename, title = 'Export Report') {
  if (!data || data.length === 0) {
    throw new Error('No data to export')
  }

  const headers = Object.keys(data[0])
  
  const htmlContent = `
<!DOCTYPE html>
<html>
<head>
    <title>${title}</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        h1 { color: #333; border-bottom: 2px solid #666; padding-bottom: 10px; }
        table { width: 100%; border-collapse: collapse; margin-top: 20px; }
        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
        th { background-color: #f5f5f5; font-weight: bold; }
        tr:nth-child(even) { background-color: #f9f9f9; }
        .export-info { font-size: 12px; color: #666; margin-bottom: 20px; }
    </style>
</head>
<body>
    <h1>${title}</h1>
    <div class="export-info">
        Generated on: ${format(new Date(), 'PPpp')}<br>
        Total Records: ${data.length}
    </div>
    <table>
        <thead>
            <tr>
                ${headers.map(header => `<th>${header}</th>`).join('')}
            </tr>
        </thead>
        <tbody>
            ${data.map(row => `
                <tr>
                    ${headers.map(header => `<td>${row[header] || ''}</td>`).join('')}
                </tr>
            `).join('')}
        </tbody>
    </table>
</body>
</html>`

  // For a real PDF, you'd use a library like jsPDF or puppeteer
  // For now, we'll download as HTML that can be printed as PDF
  downloadFile(htmlContent, `${filename}.html`, 'text/html')
}

// Helper function to download file
function downloadFile(content, filename, mimeType) {
  const blob = new Blob([content], { type: mimeType })
  const url = window.URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  window.URL.revokeObjectURL(url)
}

// Predefined export configurations for different data types
export const exportConfigs = {
  jobs: {
    columns: ['title', 'department', 'status', 'location', 'type', 'experience_level', 'applications_count', 'created_at'],
    filename: (type) => `jobs_export_${format(new Date(), 'yyyy-MM-dd')}.${type}`,
    title: 'Jobs Export Report'
  },
  candidates: {
    columns: ['name', 'email', 'phone', 'position', 'stage', 'location', 'experience', 'created_at'],
    filename: (type) => `candidates_export_${format(new Date(), 'yyyy-MM-dd')}.${type}`,
    title: 'Candidates Export Report'
  },
  applications: {
    columns: ['candidate_name', 'job_title', 'status', 'applied_date', 'last_activity', 'notes'],
    filename: (type) => `applications_export_${format(new Date(), 'yyyy-MM-dd')}.${type}`,
    title: 'Applications Export Report'
  },
  assessments: {
    columns: ['title', 'job_title', 'total_questions', 'time_limit', 'pass_score', 'created_at'],
    filename: (type) => `assessments_export_${format(new Date(), 'yyyy-MM-dd')}.${type}`,
    title: 'Assessments Export Report'
  }
}

// Main export function with format selection
export async function exportData(data, config, exportFormat = 'csv') {
  try {
    // Validate inputs
    if (!data || data.length === 0) {
      throw new Error('No data to export')
    }
    
    if (!config || !config.columns || !Array.isArray(config.columns)) {
      throw new Error('Invalid export configuration: columns array is required')
    }

    const processedData = data.map(item => {
      const processed = {}
      config.columns.forEach(col => {
        processed[col] = item[col] || ''
        // Format dates
        if (col.includes('date') || col.includes('_at')) {
          const date = new Date(item[col])
          if (!isNaN(date.getTime())) {
            processed[col] = format(date, 'yyyy-MM-dd HH:mm')
          }
        }
      })
      return processed
    })

    const filename = typeof config.filename === 'function' 
      ? config.filename(exportFormat) 
      : `export_${format(new Date(), 'yyyy-MM-dd')}.${exportFormat}`

    switch (exportFormat.toLowerCase()) {
      case 'csv':
        exportToCSV(processedData, filename.replace(`.${exportFormat}`, ''), config.columns)
        break
      case 'json':
        exportToJSON(processedData, filename.replace(`.${exportFormat}`, ''))
        break
      case 'excel':
      case 'xlsx':
        exportToExcel(processedData, filename.replace(`.${exportFormat}`, ''), config.title)
        break
      case 'pdf':
      case 'html':
        exportToPDF(processedData, filename.replace(`.${exportFormat}`, ''), config.title)
        break
      default:
        throw new Error(`Unsupported export format: ${exportFormat}`)
    }

    return { success: true, message: `Export completed: ${filename}` }
  } catch (error) {
    console.error('Export failed:', error)
    throw error
  }
}

// Bulk export function for multiple datasets
export async function bulkExport(datasets, exportFormat = 'csv') {
  try {
    if (!datasets || !Array.isArray(datasets)) {
      throw new Error('Invalid datasets: array expected')
    }

    const results = []
    
    for (const dataset of datasets) {
      const { data, config } = dataset
      
      // Validate dataset structure
      if (!data || !Array.isArray(data)) {
        console.warn(`Skipping dataset: invalid data array`, dataset)
        continue
      }
      
      if (!config) {
        console.warn(`Skipping dataset: missing config`, dataset)
        continue
      }
      
      if (data.length > 0) {
        try {
          await exportData(data, config, exportFormat)
          results.push({ success: true, type: config.title || 'Unknown' })
        } catch (error) {
          console.error(`Failed to export dataset:`, dataset, error)
          results.push({ success: false, type: config.title || 'Unknown', error: error.message })
        }
      }
    }
    
    return {
      success: true,
      message: `Bulk export completed. ${results.length} files exported.`,
      results
    }
  } catch (error) {
    console.error('Bulk export failed:', error)
    throw error
  }
}

// Export analytics data
export function exportAnalytics(analyticsData, exportFormat = 'csv') {
  const config = {
    columns: ['metric', 'value', 'change', 'period'],
    filename: (type) => `analytics_export_${format(new Date(), 'yyyy-MM-dd')}.${type}`,
    title: 'Analytics Report'
  }

  // Transform analytics data to exportable format
  const exportableData = Object.entries(analyticsData).map(([key, value]) => ({
    metric: key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
    value: typeof value === 'object' ? JSON.stringify(value) : value,
    change: 'N/A', // Could be calculated based on historical data
    period: format(new Date(), 'MMMM yyyy')
  }))

  return exportData(exportableData, config, exportFormat)
}