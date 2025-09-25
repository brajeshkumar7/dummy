import React, { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import {
  Users,
  Briefcase,
  FileText,
  TrendingUp,
  Plus,
  Clock,
  Target,
  Award,
  Activity,
  BarChart3,
  PieChart,
  TrendingDown,
  Calendar,
  UserCheck,
  UserX,
  Filter,
  Download,
  RefreshCw,
  Sparkles,
  Zap
} from 'lucide-react'
import { Link } from 'react-router-dom'
import { BulkExportDialog } from '@/components/export-dialog'

// Analytics Charts Components (simplified for now)
function HiringFunnelChart({ data, total }) {
  const stages = [
    { name: 'Applied', count: data.applied || 0, color: 'bg-gradient-to-r from-blue-500 to-blue-600' },
    { name: 'Screening', count: data.screening || 0, color: 'bg-gradient-to-r from-yellow-500 to-yellow-600' },
    { name: 'Test', count: data.test || 0, color: 'bg-gradient-to-r from-orange-500 to-orange-600' },
    { name: 'Offer', count: data.offer || 0, color: 'bg-gradient-to-r from-green-500 to-green-600' },
    { name: 'Hired', count: data.hired || 0, color: 'bg-gradient-to-r from-emerald-500 to-emerald-600' },
    { name: 'Rejected', count: data.rejected || 0, color: 'bg-gradient-to-r from-red-500 to-rose-600' }
  ]

  // Scale bars against the total candidate count so proportions are correct
  const denominator = typeof total === 'number' && total > 0
    ? total
    : Math.max(1, stages.reduce((acc, s) => acc + (s.count || 0), 0))

  return (
    <div className="space-y-4">
      {stages.map((stage, index) => (
        <div key={stage.name} className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-white">{stage.name}</span>
            <span className="text-sm text-gray-400">{stage.count}</span>
          </div>
          <div className="w-full bg-white/10 rounded-full h-3 backdrop-blur-sm">
            <div
              className={`h-3 rounded-full ${stage.color} transition-all duration-500 shadow-lg`}
              style={{ width: `${denominator > 0 ? (stage.count / denominator) * 100 : 0}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  )
}

function TimeToHireChart({ data }) {
  const metrics = [
    { role: 'Frontend Dev', days: 28, target: 30 },
    { role: 'Product Manager', days: 45, target: 35 },
    { role: 'UX Designer', days: 22, target: 25 },
    { role: 'Backend Dev', days: 35, target: 30 }
  ]

  return (
    <div className="space-y-4">
      {metrics.map((metric) => (
        <div key={metric.role} className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-white">{metric.role}</span>
            <span className="text-sm text-gray-400">
              {metric.days}d / {metric.target}d target
            </span>
          </div>
          <div className="w-full bg-white/10 rounded-full h-3 backdrop-blur-sm">
            <div
              className={`h-3 rounded-full transition-all duration-500 shadow-lg ${metric.days <= metric.target
                  ? 'bg-gradient-to-r from-green-500 to-emerald-600'
                  : 'bg-gradient-to-r from-red-500 to-red-600'
                }`}
              style={{ width: `${Math.min((metric.days / metric.target) * 100, 100)}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  )
}

function RecentActivityFeed({ activities }) {
  return (
    <div className="space-y-3">
      {activities.map((activity, index) => (
        <div key={index} className="flex items-start gap-3 p-3 rounded-2xl border border-white/20 bg-white/5 hover:bg-white/10 transition-all duration-300">
          <div className={`rounded-full p-2 ${activity.color} shadow-lg`}>
            <activity.icon className="h-4 w-4 text-white" />
          </div>
          <div className="flex-1 space-y-1">
            <p className="text-sm text-white">{activity.message}</p>
            <p className="text-xs text-gray-400">{activity.time}</p>
          </div>
        </div>
      ))}
    </div>
  )
}

export function Dashboard() {
  const [isRefreshing, setIsRefreshing] = useState(false)

  // Fetch real analytics data
  const { data: jobsStats, refetch: refetchJobsStats } = useQuery({
    queryKey: ['jobs', 'stats'],
    queryFn: async () => {
      const response = await fetch('/api/jobs/stats')
      return response.json()
    }
  })

  const { data: candidatesStats, refetch: refetchCandidatesStats } = useQuery({
    queryKey: ['candidates', 'stats'],
    queryFn: async () => {
      const response = await fetch('/api/candidates/stats')
      return response.json()
    }
  })

  const { data: applicationsStats, refetch: refetchApplicationsStats } = useQuery({
    queryKey: ['applications', 'stats'],
    queryFn: async () => {
      const response = await fetch('/api/applications/stats')
      return response.json()
    }
  })

  const { data: assessmentsStats, refetch: refetchAssessmentsStats } = useQuery({
    queryKey: ['assessments', 'stats'],
    queryFn: async () => {
      const response = await fetch('/api/assessments/stats')
      return response.json()
    }
  })

  // Fetch actual data for bulk export
  const { data: jobsData, refetch: refetchJobsData } = useQuery({
    queryKey: ['jobs'],
    queryFn: async () => {
      const response = await fetch('/api/jobs?limit=1000')
      const result = await response.json()
      return result.data || []
    }
  })
  // Robust active jobs count: fall back to client-side computation if stats not ready
  const activeJobsCount =
    (jobsStats && typeof jobsStats.active === 'number')
      ? jobsStats.active
      : Array.isArray(jobsData)
        ? jobsData.filter(j => j?.status === 'active').length
        : 0


  const { data: candidatesData, refetch: refetchCandidatesData } = useQuery({
    queryKey: ['candidates'],
    queryFn: async () => {
      const response = await fetch('/api/candidates?limit=1000')
      const result = await response.json()
      return result.data || []
    }
  })

  // Refresh function to reload all data
  const handleRefresh = async () => {
    setIsRefreshing(true)
    try {
      await Promise.all([
        refetchJobsStats(),
        refetchCandidatesStats(),
        refetchApplicationsStats(),
        refetchAssessmentsStats(),
        refetchJobsData(),
        refetchCandidatesData()
      ])
    } catch (error) {
      console.error('Error refreshing data:', error)
    } finally {
      setIsRefreshing(false)
    }
  }

  // Normalize funnel stats across different stage naming conventions
  // Prioritize candidate-based counts so totals match the overall candidate total
  const normalizedFunnel = React.useMemo(() => {
    const cStats = candidatesStats || {}

    // If we have the full candidates list, compute counts from it for accuracy
    if (Array.isArray(candidatesData) && candidatesData.length > 0) {
      const counts = candidatesData.reduce((acc, cand) => {
        const stage = (cand?.stage || '').toLowerCase()
        if (stage === 'applied') acc.applied += 1
        else if (stage === 'screen' || stage === 'screening' || stage === 'review') acc.screening += 1
        else if (stage === 'test' || stage === 'assessment' || stage === 'interview') acc.test += 1
        else if (stage === 'offer') acc.offer += 1
        else if (stage === 'hired') acc.hired += 1
        else if (stage === 'rejected') acc.rejected += 1
        return acc
      }, { applied: 0, screening: 0, test: 0, offer: 0, hired: 0, rejected: 0 })
      return counts
    }

    // Fall back to server-provided candidate stats (already aligned to stages)
    const getNumber = (value) => (typeof value === 'number' ? value : 0)
    if (cStats && Object.keys(cStats).length > 0) {
      return {
        applied: getNumber(cStats.applied),
        screening: getNumber(cStats.screening) || getNumber(cStats.screen) || getNumber(cStats.review),
        test: getNumber(cStats.test) || getNumber(cStats.assessment) || getNumber(cStats.interview),
        offer: getNumber(cStats.offer),
        hired: getNumber(cStats.hired),
        rejected: getNumber(cStats.rejected)
      }
    }

    // Last resort: use applications stats if candidate stats are unavailable
    const a = applicationsStats || {}
    return {
      applied: getNumber(a.applied),
      screening: getNumber(a.screening),
      test: getNumber(a.test) || getNumber(a.assessment) || getNumber(a.interview),
      offer: getNumber(a.offer),
      hired: getNumber(a.hired),
      rejected: getNumber(a.rejected)
    }
  }, [applicationsStats, candidatesStats, candidatesData])

  // Total candidates for scaling funnel bars
  const totalCandidatesForFunnel = React.useMemo(() => {
    if (candidatesStats?.total) return candidatesStats.total
    if (Array.isArray(candidatesData)) return candidatesData.length
    const sum = Object.values(normalizedFunnel || {}).reduce((acc, v) => acc + (typeof v === 'number' ? v : 0), 0)
    return sum
  }, [candidatesStats, candidatesData, normalizedFunnel])

  // Prepare datasets for bulk export
  const exportDatasets = [
    {
      type: 'jobs',
      data: jobsData || [],
      config: {
        columns: ['title', 'department', 'status', 'location', 'type', 'experience_level', 'applications_count', 'created_at'],
        filename: (type) => `jobs_export_${new Date().toISOString().split('T')[0]}.${type}`,
        title: 'Jobs Export Report'
      }
    },
    {
      type: 'candidates',
      data: candidatesData || [],
      config: {
        columns: ['name', 'email', 'phone', 'position', 'stage', 'location', 'experience', 'created_at'],
        filename: (type) => `candidates_export_${new Date().toISOString().split('T')[0]}.${type}`,
        title: 'Candidates Export Report'
      }
    },
    {
      type: 'analytics',
      data: [
        { metric: 'Active Jobs', value: jobsStats?.active || 0, category: 'Jobs' },
        { metric: 'Total Candidates', value: candidatesStats?.total || 0, category: 'Candidates' },
        { metric: 'Assessments', value: assessmentsStats?.total_assessments || 0, category: 'Assessments' },
        { metric: 'Hire Rate', value: candidatesStats?.hired && candidatesStats?.total ? ((candidatesStats.hired / candidatesStats.total) * 100).toFixed(1) + '%' : '0%', category: 'Performance' }
      ],
      config: {
        columns: ['metric', 'value', 'category'],
        filename: (type) => `analytics_export_${new Date().toISOString().split('T')[0]}.${type}`,
        title: 'Analytics Report'
      }
    }
  ]

  // Sample recent activity data
  const recentActivities = [
    {
      icon: UserCheck,
      message: 'Sarah Johnson hired for Senior Frontend Developer',
      time: '2 hours ago',
      color: 'bg-green-500'
    },
    {
      icon: FileText,
      message: 'New assessment created for React Developer position',
      time: '4 hours ago',
      color: 'bg-blue-500'
    },
    {
      icon: Users,
      message: '12 new candidates applied to UX Designer role',
      time: '6 hours ago',
      color: 'bg-purple-500'
    },
    {
      icon: UserX,
      message: 'Interview declined for Product Manager position',
      time: '1 day ago',
      color: 'bg-red-500'
    }
  ]

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
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-500/20 border border-purple-500/30 text-purple-300 text-sm font-medium mb-4">
              <Sparkles className="h-4 w-4" />
              Analytics Dashboard
            </div>
            <h1 className="text-4xl lg:text-6xl font-bold tracking-tight mb-4">
              <span className="bg-gradient-to-r from-white via-purple-200 to-pink-200 bg-clip-text text-transparent">
                Hiring Insights
              </span>
            </h1>
            <p className="text-gray-300 text-lg lg:text-xl">
              Overview of your hiring pipeline performance and key metrics
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white border-none shadow-lg">
              <Filter className="h-4 w-4 mr-2" />
              Filter
            </Button>
            <BulkExportDialog
              datasets={exportDatasets}
              title="Export All Data"
              description="Export all hiring data including jobs, candidates, and analytics"
              trigger={
                <Button className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white border-none shadow-lg">
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
              }
              onExportComplete={(format, datasetCount) => {
                console.log(`Bulk export completed: ${datasetCount} datasets in ${format} format`)
              }}
            />
            <Button 
              variant="outline" 
              size="sm" 
              className="border-white/20 text-gray-300 hover:bg-white/10"
              onClick={handleRefresh}
              disabled={isRefreshing}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
              {isRefreshing ? 'Refreshing...' : 'Refresh'}
            </Button>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <Card className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 backdrop-blur-lg border border-white/20 shadow-2xl rounded-3xl hover:shadow-purple-500/25 transition-all duration-300 hover:scale-105">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-300">Active Jobs</CardTitle>
              <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
                <Briefcase className="h-4 w-4 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                {activeJobsCount}
              </div>
              <p className="text-xs text-gray-400 mt-1">
                +{jobsStats?.recent || 0} this week
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-blue-500/20 to-cyan-500/20 backdrop-blur-lg border border-white/20 shadow-2xl rounded-3xl hover:shadow-blue-500/25 transition-all duration-300 hover:scale-105">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-300">Total Candidates</CardTitle>
              <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-blue-500 to-cyan-500 flex items-center justify-center">
                <Users className="h-4 w-4 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                {candidatesStats?.total || 0}
              </div>
              <p className="text-xs text-gray-400 mt-1">
                +{candidatesStats?.recent || 0} this month
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-amber-500/20 to-orange-500/20 backdrop-blur-lg border border-white/20 shadow-2xl rounded-3xl hover:shadow-amber-500/25 transition-all duration-300 hover:scale-105">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-300">Assessments</CardTitle>
              <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-amber-500 to-orange-500 flex items-center justify-center">
                <FileText className="h-4 w-4 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                {assessmentsStats?.total_assessments || 0}
              </div>
              <p className="text-xs text-gray-400 mt-1">
                {assessmentsStats?.completion_rate?.toFixed(1) || 0}% completion rate
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-500/20 to-emerald-500/20 backdrop-blur-lg border border-white/20 shadow-2xl rounded-3xl hover:shadow-green-500/25 transition-all duration-300 hover:scale-105">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-300">Hire Rate</CardTitle>
              <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-green-500 to-emerald-500 flex items-center justify-center">
                <TrendingUp className="h-4 w-4 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                {candidatesStats?.hired && candidatesStats?.total
                  ? ((candidatesStats.hired / candidatesStats.total) * 100).toFixed(1)
                  : 0
                }%
              </div>
              <p className="text-xs text-gray-400 mt-1">
                +2.1% from last month
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {/* Hiring Funnel */}
          <Card className="col-span-1 bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-lg border border-white/20 shadow-2xl rounded-3xl">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-white text-lg">Hiring Funnel</CardTitle>
                  <CardDescription className="text-gray-300">
                    Candidate progression through stages
                  </CardDescription>
                </div>
                <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center">
                  <BarChart3 className="h-4 w-4 text-white" />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <HiringFunnelChart data={normalizedFunnel} total={totalCandidatesForFunnel} />
            </CardContent>
          </Card>

          {/* Time to Hire */}
          <Card className="col-span-1 bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-lg border border-white/20 shadow-2xl rounded-3xl">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-white text-lg">Time to Hire</CardTitle>
                  <CardDescription className="text-gray-300">
                    Average days to hire by role
                  </CardDescription>
                </div>
                <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-amber-500 to-orange-500 flex items-center justify-center">
                  <Clock className="h-4 w-4 text-white" />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <TimeToHireChart />
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card className="col-span-1 bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-lg border border-white/20 shadow-2xl rounded-3xl">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-white text-lg">Recent Activity</CardTitle>
                  <CardDescription className="text-gray-300">
                    Latest hiring pipeline updates
                  </CardDescription>
                </div>
                <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-green-500 to-emerald-500 flex items-center justify-center">
                  <Activity className="h-4 w-4 text-white" />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <RecentActivityFeed activities={recentActivities} />
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Performance Metrics */}
          <Card className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-lg border border-white/20 shadow-2xl rounded-3xl">
            <CardHeader>
              <CardTitle className="text-white text-lg">Performance Metrics</CardTitle>
              <CardDescription className="text-gray-300">
                Key hiring performance indicators
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-sm font-medium text-white">Source Quality</p>
                  <p className="text-xs text-gray-400">LinkedIn leads conversion rate</p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-green-400">87%</p>
                  <p className="text-xs text-gray-400">+5.2%</p>
                </div>
              </div>
              <Separator className="bg-white/20" />
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-sm font-medium text-white">Interview Show Rate</p>
                  <p className="text-xs text-gray-400">Scheduled vs attended</p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-blue-400">92%</p>
                  <p className="text-xs text-gray-400">-1.8%</p>
                </div>
              </div>
              <Separator className="bg-white/20" />
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-sm font-medium text-white">Offer Acceptance</p>
                  <p className="text-xs text-gray-400">Offers accepted vs sent</p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-purple-400">78%</p>
                  <p className="text-xs text-gray-400">+3.4%</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Top Performing Jobs */}
          <Card className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-lg border border-white/20 shadow-2xl rounded-3xl">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-white text-lg">Top Performing Jobs</CardTitle>
                  <CardDescription className="text-gray-300">
                    Jobs with highest candidate engagement
                  </CardDescription>
                </div>
                <Button size="sm" asChild className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white border-none">
                  <Link to="/app/jobs">View All</Link>
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { title: 'Senior Frontend Developer', applications: 124, hired: 2, rate: '87%' },
                  { title: 'Product Manager', applications: 89, hired: 1, rate: '78%' },
                  { title: 'UX Designer', applications: 67, hired: 3, rate: '92%' },
                  { title: 'DevOps Engineer', applications: 45, hired: 1, rate: '71%' }
                ].map((job, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border border-white/20 rounded-2xl bg-white/5 hover:bg-white/10 transition-all duration-300">
                    <div className="space-y-1">
                      <p className="font-medium text-sm text-white">{job.title}</p>
                      <p className="text-xs text-gray-400">
                        {job.applications} applications • {job.hired} hired
                      </p>
                    </div>
                    <Badge variant="outline" className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 border-green-500/30 text-green-300">
                      {job.rate}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-lg border border-white/20 shadow-2xl rounded-3xl">
          <CardHeader>
            <CardTitle className="text-white text-lg">Quick Actions</CardTitle>
            <CardDescription className="text-gray-300">
              Common tasks and shortcuts
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <Button asChild className="justify-start bg-gradient-to-r from-green-500/20 to-emerald-500/20 border-green-500/30 text-white hover:bg-gradient-to-r hover:from-green-500/30 hover:to-emerald-500/30" variant="outline">
                <Link to="/app/jobs/new">
                  <Plus className="h-4 w-4 mr-2" />
                  Create Job
                </Link>
              </Button>
              <Button asChild className="justify-start bg-gradient-to-r from-blue-500/20 to-cyan-500/20 border-blue-500/30 text-white hover:bg-gradient-to-r hover:from-blue-500/30 hover:to-cyan-500/30" variant="outline">
                <Link to="/app/candidates">
                  <Users className="h-4 w-4 mr-2" />
                  Review Candidates
                </Link>
              </Button>
              <Button asChild className="justify-start bg-gradient-to-r from-purple-500/20 to-pink-500/20 border-purple-500/30 text-white hover:bg-gradient-to-r hover:from-purple-500/30 hover:to-pink-500/30" variant="outline">
                <Link to="/app/assessments">
                  <FileText className="h-4 w-4 mr-2" />
                  Create Assessment
                </Link>
              </Button>
              <Button asChild className="justify-start bg-gradient-to-r from-amber-500/20 to-orange-500/20 border-amber-500/30 text-white hover:bg-gradient-to-r hover:from-amber-500/30 hover:to-orange-500/30" variant="outline">
                <Link to="/app/candidates?view=kanban">
                  <Target className="h-4 w-4 mr-2" />
                  Pipeline View
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}