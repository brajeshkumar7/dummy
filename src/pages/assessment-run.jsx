import { useEffect, useMemo, useState } from 'react'
import { useParams, useNavigate, Link, useSearchParams } from 'react-router-dom'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { ArrowLeftIcon } from 'lucide-react'
import { useJobAssessment, useSubmitJobAssessment, useAssessment, useAssessmentResponses } from '@/hooks/useApplications'

export default function AssessmentRunPage() {
    const { jobId } = useParams()
    const [searchParams] = useSearchParams()
    const assessmentId = searchParams.get('assessmentId')
    const navigate = useNavigate()
    const { data: jobAssessment, isLoading: isLoadingJob, error } = useJobAssessment(jobId)
    // If a specific assessmentId is provided, prefer fetching that assessment by id
    const { data: specificAssessment, isLoading: isLoadingSpecific } = useAssessment(assessmentId || undefined)
    const isLoading = isLoadingJob || (assessmentId ? isLoadingSpecific : false)
    const assessment = assessmentId ? specificAssessment : jobAssessment
    const submitMutation = useSubmitJobAssessment()

    const [answers, setAnswers] = useState({})
    const [submitted, setSubmitted] = useState(false)

    // If assessmentId is provided, fetch any existing responses for review
    const { data: respList } = useAssessmentResponses(
        assessmentId ? { page: 1, limit: 1000, assessment_id: assessmentId, job_id: jobId } : {}
    )

    // visible questions with basic conditional logic
    const visibleQuestions = useMemo(() => {
        const list = Array.isArray(assessment?.questions) ? assessment.questions : []
        const evaluate = (conditions) => {
            if (!conditions || conditions.length === 0) return true
            return conditions.every((c) => {
                const ans = answers[c.questionId]
                switch (c.operator) {
                    case 'equals': return ans === c.value
                    case 'not_equals': return ans !== c.value
                    case 'contains': return (ans || '').toString().toLowerCase().includes((c.value || '').toLowerCase())
                    case 'greater_than': return Number(ans) > Number(c.value)
                    case 'less_than': return Number(ans) < Number(c.value)
                    case 'is_empty': return !ans || ans === ''
                    case 'is_not_empty': return !!ans && ans !== ''
                    default: return true
                }
            })
        }
        return list.filter(q => evaluate(q.conditions))
    }, [assessment, answers])

    const requiredViolations = useMemo(() => {
        return visibleQuestions.filter(q => q.required && (answers[q.id] === undefined || answers[q.id] === null || answers[q.id] === '' || (Array.isArray(answers[q.id]) && answers[q.id].length === 0)))
    }, [visibleQuestions, answers])

    const handleSubmit = async () => {
        if (requiredViolations.length > 0) return
        await submitMutation.mutateAsync({
            jobId,
            submission: {
                assessment_id: assessment?.id,
                candidate_id: 0,
                responses: answers
            }
        })
        setSubmitted(true)
    }

    // Initialize from existing response (latest)
    const existingResponses = Array.isArray(respList?.data) ? respList.data : (respList || [])
    if (!submitted && existingResponses.length > 0 && Object.keys(answers).length === 0) {
        const latest = existingResponses.sort((a, b) => new Date(b.submitted_at || 0) - new Date(a.submitted_at || 0))[0]
        if (latest && latest.responses) {
            setAnswers(latest.responses)
            setSubmitted(true)
        }
    }

    if (isLoading) return <div className="p-6">Loading assessment...</div>
    if (error || !assessment) return <div className="p-6">No assessment found.</div>

    if (submitted) {
        return (
            <div className="p-6 space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <div className="text-2xl font-semibold">{assessment.title || 'Assessment'}</div>
                        {assessment.description && <div className="text-sm text-muted-foreground">Submitted</div>}
                    </div>
                    <div className="flex gap-2">
                        <Button variant="outline" onClick={() => navigate(`/app/jobs/${jobId}/assessments`)}>Back to Assessments</Button>
                        <Button onClick={() => navigate(`/app/jobs/${jobId}`)}>Back to Job</Button>
                    </div>
                </div>

                {visibleQuestions.map((q, idx) => (
                    <Card key={q.id}>
                        <CardHeader>
                            <div className="flex items-center gap-2">
                                <Badge variant="secondary">Q{idx + 1}</Badge>
                                <CardTitle className="text-base">{q.question}</CardTitle>
                            </div>
                            {q.description && <CardDescription>{q.description}</CardDescription>}
                        </CardHeader>
                        <CardContent>
                            <SubmittedAnswer question={q} value={answers[q.id]} />
                        </CardContent>
                    </Card>
                ))}
            </div>
        )
    }

    return (
        <div className="p-6 space-y-6">
            {/* Back to Job Details Button (no page headings) */}
            <div className="flex items-center justify-between mb-4">
                <Button
                    asChild
                    variant="ghost"
                    size="sm"
                    className="border-white/20 text-gray-300 hover:bg-white/10 hover:text-white rounded-xl backdrop-blur-sm transition-all duration-200"
                >
                    <Link to={`/app/jobs/${jobId}`}>
                        <ArrowLeftIcon className="h-4 w-4 mr-2" />
                        Back to Job Details
                    </Link>
                </Button>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigate(`/app/jobs/${jobId}/assessments`)}
                    className="bg-white/10 border-white/20 text-white hover:bg-white/20"
                >
                    Back to Assessments
                </Button>
            </div>

            <div className="mb-4">
                <div className="text-2xl font-semibold">{assessment.title || 'Assessment'}</div>
                {assessment.description && <div className="text-sm text-muted-foreground">{assessment.description}</div>}
            </div>

            {visibleQuestions.map((q, idx) => (
                <Card key={q.id}>
                    <CardHeader>
                        <div className="flex items-center gap-2">
                            <Badge variant="secondary">Q{idx + 1}</Badge>
                            <CardTitle className="text-base">{q.question}</CardTitle>
                            {q.required && <Badge variant="destructive">Required</Badge>}
                        </div>
                        {q.description && <CardDescription>{q.description}</CardDescription>}
                    </CardHeader>
                    <CardContent>
                        <QuestionInput question={q} value={answers[q.id]} onChange={(val) => setAnswers(a => ({ ...a, [q.id]: val }))} />
                    </CardContent>
                </Card>
            ))}

            <div className="flex items-center gap-4">
                {requiredViolations.length > 0 && (
                    <span className="text-sm text-red-600">Please answer all required questions.</span>
                )}
                <Button onClick={handleSubmit} disabled={requiredViolations.length > 0 || submitMutation.isPending}>Submit</Button>
            </div>
        </div>
    )
}

function QuestionInput({ question, value, onChange }) {
    const { type, data = {} } = question
    switch (type) {
        case 'multiple_choice':
            return (
                <RadioGroup value={value} onValueChange={onChange}>
                    {data.options?.map((opt, i) => (
                        <div key={i} className="flex items-center gap-2 py-1">
                            <RadioGroupItem value={i.toString()} />
                            <Label className="cursor-pointer">{opt}</Label>
                        </div>
                    ))}
                </RadioGroup>
            )
        case 'multiple_select':
            return (
                <div className="space-y-2">
                    {data.options?.map((opt, i) => {
                        const arr = Array.isArray(value) ? value : []
                        const checked = arr.includes(i)
                        return (
                            <div key={i} className="flex items-center gap-2 py-1">
                                <Checkbox checked={checked} onCheckedChange={(c) => {
                                    const next = new Set(arr)
                                    c ? next.add(i) : next.delete(i)
                                    onChange(Array.from(next))
                                }} />
                                <Label className="cursor-pointer">{opt}</Label>
                            </div>
                        )
                    })}
                </div>
            )
        case 'true_false':
            return (
                <RadioGroup value={value} onValueChange={onChange} className="flex gap-6">
                    <div className="flex items-center gap-2"><RadioGroupItem value="true" /><Label>True</Label></div>
                    <div className="flex items-center gap-2"><RadioGroupItem value="false" /><Label>False</Label></div>
                </RadioGroup>
            )
        case 'short_answer':
            return <Input value={value || ''} onChange={(e) => onChange(e.target.value)} maxLength={data.max_length || 200} />
        case 'essay':
            return <Textarea value={value || ''} onChange={(e) => onChange(e.target.value)} rows={6} />
        case 'rating_scale': {
            const min = data.min_value ?? 1
            const max = data.max_value ?? 5
            const buttons = []
            for (let v = min; v <= max; v += (data.step || 1)) {
                buttons.push(
                    <Button key={v} variant={value == v ? 'default' : 'outline'} size="sm" className="mr-2" onClick={() => onChange(v)}>{v}</Button>
                )
            }
            return <div>{buttons}</div>
        }
        default:
            return <div className="text-sm text-muted-foreground">Unsupported question type</div>
    }
}

function SubmittedAnswer({ question, value }) {
    const { type, data = {} } = question
    switch (type) {
        case 'multiple_choice': {
            const idx = value != null ? Number(value) : null
            return <div className="text-sm">{idx != null ? data.options?.[idx] : 'No answer'}</div>
        }
        case 'multiple_select': {
            const arr = Array.isArray(value) ? value : []
            return <div className="text-sm">{arr.length ? arr.map(i => data.options?.[i]).join(', ') : 'No answer'}</div>
        }
        case 'true_false':
            return <div className="text-sm">{value === 'true' ? 'True' : value === 'false' ? 'False' : 'No answer'}</div>
        case 'short_answer':
        case 'essay':
            return <div className="text-sm whitespace-pre-wrap">{value || 'No answer'}</div>
        case 'rating_scale':
            return <div className="text-sm">{value != null ? String(value) : 'No answer'}</div>
        case 'likert_scale': {
            const idx = value != null ? Number(value) : null
            return <div className="text-sm">{idx != null ? data.options?.[idx] : 'No answer'}</div>
        }
        case 'file_upload':
            return value?.name ? (
                <div className="text-sm">{value.name} ({Math.round((value.size || 0) / 1024)} KB)</div>
            ) : <div className="text-sm">No file uploaded</div>
        case 'coding':
            return <pre className="bg-gray-950 text-green-400 p-3 rounded text-xs overflow-auto">{value || data.starter_code || 'No answer'}</pre>
        default:
            return <div className="text-sm text-muted-foreground">No answer</div>
    }
}


