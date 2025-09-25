import React, { useMemo, useState } from 'react'
import { Link, useParams, useNavigate } from 'react-router-dom'
import { useJobs } from '@/hooks/useJobs'
import { useAssessments, useAssessmentResponses } from '@/hooks/useApplications'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { DataTable } from '@/components/ui/data-table'
import { BarChart3, Plus, BriefcaseIcon, FileText, UsersIcon, FileTextIcon, ListIcon, StarIcon, ClockIcon, ArrowLeftIcon } from 'lucide-react'

export default function AssessmentsPage() {
    const { jobId, assessmentId } = useParams()
    const navigate = useNavigate()
    const [page, setPage] = useState(1)
    const [pageSize, setPageSize] = useState(10)
    const [search, setSearch] = useState('')

    // If on job-specific view, limit to that job; else list all jobs
    const { data: jobsResp, isLoading } = useJobs({ page, limit: pageSize, search })
    const jobs = jobsResp?.data || []
    const pagination = jobsResp?.pagination

    // Resolve selected job by numeric id OR slug
    const selectedJob = jobId ? jobs.find(j => String(j.id) === String(jobId) || j.slug === jobId) : null

    // All assessments
    const { data: assessmentsResp } = useAssessments({ page: 1, limit: 1000 })
    const assessments = Array.isArray(assessmentsResp?.data) ? assessmentsResp.data : (assessmentsResp || [])

    // All responses, filterable by job
    const { data: responsesResp } = useAssessmentResponses(selectedJob ? { page: 1, limit: 1000, job_id: selectedJob.id } : { page: 1, limit: 1000 })
    const responses = Array.isArray(responsesResp?.data) ? responsesResp.data : (responsesResp || [])

    const responsesByAssessmentId = useMemo(() => {
        const map = new Map()
        responses.forEach(r => {
            const list = map.get(r.assessment_id) || []
            list.push(r)
            map.set(r.assessment_id, list)
        })
        return map
    }, [responses])

    const stats = useMemo(() => ({
        totalAssessments: assessments.length,
        jobsWithAssessments: Array.from(new Set(assessments.map(a => a.job_id))).length,
        avgPerJob: (jobsResp?.pagination?.total ? (assessments.length / jobsResp.pagination.total) : 0).toFixed(1)
    }), [assessments, jobsResp])

    const columns = [
        {
            accessorKey: 'title',
            header: 'Job',
            sortable: false,
            cell: ({ row }) => (
                <div className="flex items-center gap-2 min-w-0">
                    <BriefcaseIcon className="h-4 w-4 text-white/70" />
                    <div className="min-w-0">
                        <div className="font-medium text-white truncate max-w-[32rem]">{row.title}</div>
                        <div className="text-xs text-white/70 truncate">{row.department}</div>
                    </div>
                </div>
            )
        },
        {
            accessorKey: 'assessment',
            header: 'Assessments',
            cell: ({ row }) => {
                const list = assessments.filter(a => a.job_id === row.id)
                return list.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                        {list.map(a => (
                            <Badge key={a.id} variant="secondary">{a.title || `Assessment ${a.id}`}</Badge>
                        ))}
                    </div>
                ) : <Badge variant="outline">Not Created</Badge>
            }
        },
        {
            accessorKey: 'applications_count',
            header: 'Applications',
            cell: ({ row }) => (
                <div className="flex items-center gap-1"><UsersIcon className="h-4 w-4 text-white/70" /><span>{row.applications_count || 0}</span></div>
            )
        },
        {
            accessorKey: 'actions',
            header: 'Actions',
            cell: ({ row }) => (
                <div className="flex items-center gap-2">
                    <Button asChild variant="outline" size="sm"><Link to={`/app/jobs/${row.id}/assessments`}>Show Assessments</Link></Button>
                    <Button asChild size="sm"><Link to={`/app/jobs/${row.id}/assessment`}><Plus className="h-4 w-4 mr-1" />Build / Edit</Link></Button>
                </div>
            )
        }
    ]

    const tableConfig = {
        data: selectedJob ? [selectedJob] : jobs,
        columns,
        isLoading,
        filtering: {
            searchable: true,
            searchValue: search,
            searchPlaceholder: 'Search jobs...',
            onSearchChange: (val) => { setSearch(val); setPage(1) }
        },
        pagination: pagination ? {
            page: pagination.page,
            pageSize: pagination.limit,
            total: pagination.total,
            totalPages: pagination.total_pages,
            onPageChange: setPage,
            onPageSizeChange: setPageSize,
            pageSizeOptions: [10, 25, 50, 100]
        } : null
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
                {/* Header Section - hidden on job-specific view */}
                {!jobId && (
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-4xl lg:text-6xl font-bold tracking-tight mb-4">
                                <span className="bg-gradient-to-r from-white via-purple-200 to-pink-200 bg-clip-text text-transparent">
                                    Assessments
                                </span>
                            </h1>
                            <p className="text-white text-lg lg:text-xl">
                                Manage assessments across all stages of your hiring pipeline
                            </p>
                        </div>
                    </div>
                )}

                {/* Enhanced Stats Cards - hidden on job-specific view */}
                {!jobId && (
                    <div className="grid gap-6 md:grid-cols-3">
                        <Card className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 backdrop-blur-lg border border-white/20 shadow-2xl rounded-3xl hover:shadow-purple-500/25 transition-all duration-300 hover:scale-105">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium text-white">Total Assessments</CardTitle>
                                <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
                                    <FileTextIcon className="h-4 w-4 text-white" />
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="text-3xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                                    {stats.totalAssessments}
                                </div>
                                <p className="text-xs text-gray-400">
                                    Across all jobs
                                </p>
                            </CardContent>
                        </Card>

                        <Card className="bg-gradient-to-br from-blue-500/20 to-cyan-500/20 backdrop-blur-lg border border-white/20 shadow-2xl rounded-3xl hover:shadow-blue-500/25 transition-all duration-300 hover:scale-105">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium text-white">Jobs With Assessments</CardTitle>
                                <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-blue-500 to-cyan-500 flex items-center justify-center">
                                    <BriefcaseIcon className="h-4 w-4 text-white" />
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="text-3xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                                    {stats.jobsWithAssessments}
                                </div>
                                <p className="text-xs text-gray-400">
                                    Active assessments
                                </p>
                            </CardContent>
                        </Card>

                        <Card className="bg-gradient-to-br from-green-500/20 to-emerald-500/20 backdrop-blur-lg border border-white/20 shadow-2xl rounded-3xl hover:shadow-green-500/25 transition-all duration-300 hover:scale-105">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium text-white">Avg / Job</CardTitle>
                                <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-green-500 to-emerald-500 flex items-center justify-center">
                                    <BarChart3 className="h-4 w-4 text-white" />
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="text-3xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                                    {stats.avgPerJob}
                                </div>
                                <p className="text-xs text-gray-400">
                                    Average per job
                                </p>
                            </CardContent>
                        </Card>
                    </div>
                )}

                {/* Enhanced Table Section */}
                <div className="relative">
                    <div className="absolute -top-10 -left-10 w-32 h-32 bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-full blur-3xl"></div>
                    <div className="absolute -bottom-10 -right-10 w-24 h-24 bg-gradient-to-r from-blue-500/10 to-cyan-500/10 rounded-full blur-2xl"></div>

                    <Card className="relative bg-gradient-to-br from-white/10 via-white/5 to-transparent backdrop-blur-2xl border border-white/10 shadow-2xl rounded-3xl overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 via-transparent to-blue-500/5 opacity-50"></div>
                        <CardHeader className="relative border-b border-white/10 bg-gradient-to-r from-white/5 to-transparent">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 backdrop-blur-sm border border-white/10 flex items-center justify-center">
                                    <FileText className="h-5 w-5 text-purple-300" />
                                </div>
                                <div>
                                    <CardTitle className="text-2xl font-bold bg-gradient-to-r from-white via-purple-200 to-pink-200 bg-clip-text text-transparent">
                                        {jobId ? 'Assessments for Job' : 'Assessments by Job'}
                                    </CardTitle>
                                    <CardDescription className="text-gray-300">
                                        Create or open an assessment for each job
                                    </CardDescription>
                                </div>
                            </div>
                            {selectedJob && (
                                <div className="mt-4">
                                    <Button asChild variant="ghost" size="sm" className="border-white/20 text-gray-300 hover:bg-white/10 hover:text-white rounded-xl backdrop-blur-sm transition-all duration-200">
                                        <Link to={`/app/jobs/${selectedJob.slug || selectedJob.id}`}>
                                            <ArrowLeftIcon className="h-4 w-4 mr-2" />
                                            Back to Job Details
                                        </Link>
                                    </Button>
                                </div>
                            )}
                        </CardHeader>
                        <CardContent className="relative p-6">
                            <DataTable {...tableConfig} />
                            {selectedJob && (
                                <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <Card>
                                        <CardHeader><CardTitle>Unsubmitted Assessments</CardTitle></CardHeader>
                                        <CardContent className="space-y-2">
                                            {assessments.filter(a => String(a.job_id) === String(selectedJob.id) && !responsesByAssessmentId.has(a.id)).map(a => (
                                                <Button key={a.id} variant="outline" className="w-full justify-start" onClick={() => navigate(`/app/jobs/${selectedJob.slug || selectedJob.id}/assessment/run?assessmentId=${a.id}`)}>
                                                    {a.title || `Assessment ${a.id}`}
                                                </Button>
                                            ))}
                                            {assessments.filter(a => String(a.job_id) === String(selectedJob.id) && !responsesByAssessmentId.has(a.id)).length === 0 && (
                                                <div className="text-sm text-muted-foreground">No unsubmitted assessments</div>
                                            )}
                                        </CardContent>
                                    </Card>
                                    <Card>
                                    <CardHeader><CardTitle>Submitted Assessments</CardTitle></CardHeader>
                                        <CardContent className="space-y-2">
                                            {assessments.filter(a => String(a.job_id) === String(selectedJob.id) && responsesByAssessmentId.has(a.id)).map(a => (
                                                <Button key={a.id} variant="outline" className="w-full justify-start" onClick={() => navigate(`/app/jobs/${selectedJob.slug || selectedJob.id}/assessment/run?assessmentId=${a.id}`)}>
                                                    {a.title || `Assessment ${a.id}`}
                                                </Button>
                                            ))}
                                            {assessments.filter(a => String(a.job_id) === String(selectedJob.id) && responsesByAssessmentId.has(a.id)).length === 0 && (
                                                <div className="text-sm text-muted-foreground">No submitted assessments</div>
                                            )}
                                        </CardContent>
                                    </Card>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}


