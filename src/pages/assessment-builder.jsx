import React, { useState, useMemo, useRef } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core'
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'
import { Checkbox } from '@/components/ui/checkbox'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Switch } from '@/components/ui/switch'
import {
  useAssessments,
  useCreateAssessment,
  useUpdateAssessment,
  useDeleteAssessment
} from '@/hooks/useApplications'
import { useJobAssessment, useUpsertJobAssessment, useCreateJobAssessment } from '@/hooks/useApplications'
import {
  PlusIcon,
  GripVerticalIcon,
  EditIcon,
  TrashIcon,
  EyeIcon,
  ClockIcon,
  BookOpenIcon,
  CheckCircleIcon,
  XCircleIcon,
  FileTextIcon,
  CopyIcon,
  PlayIcon,
  SaveIcon,
  Settings2Icon,
  ListIcon,
  TypeIcon,
  MessageSquareIcon,
  ToggleLeftIcon,
  StarIcon,
  SlidersHorizontalIcon,
  BarChart3Icon,
  FileIcon,
  CodeIcon,
  ArrowLeftIcon,
  UserIcon,
  BriefcaseIcon
} from 'lucide-react'
import { cn } from '@/lib/utils'

// Question type configurations
const QUESTION_TYPES = {
  multiple_choice: {
    label: 'Multiple Choice',
    icon: CheckCircleIcon,
    description: 'Single correct answer from multiple options',
    color: 'bg-blue-100 text-blue-800',
    defaultData: {
      options: ['Option A', 'Option B', 'Option C', 'Option D'],
      correct_answer: 0
    }
  },
  multiple_select: {
    label: 'Multiple Select',
    icon: ListIcon,
    description: 'Multiple correct answers from options',
    color: 'bg-green-100 text-green-800',
    defaultData: {
      options: ['Option A', 'Option B', 'Option C', 'Option D'],
      correct_answers: [0, 1]
    }
  },
  true_false: {
    label: 'True/False',
    icon: ToggleLeftIcon,
    description: 'Binary true or false question',
    color: 'bg-purple-100 text-purple-800',
    defaultData: {
      correct_answer: true
    }
  },
  short_answer: {
    label: 'Short Answer',
    icon: TypeIcon,
    description: 'Brief text response',
    color: 'bg-orange-100 text-orange-800',
    defaultData: {
      max_length: 100
    }
  },
  essay: {
    label: 'Essay',
    icon: FileTextIcon,
    description: 'Long-form written response',
    color: 'bg-red-100 text-red-800',
    defaultData: {
      min_words: 100,
      max_words: 500
    }
  },
  rating_scale: {
    label: 'Rating Scale',
    icon: StarIcon,
    description: 'Numerical rating from 1 to N',
    color: 'bg-yellow-100 text-yellow-800',
    defaultData: {
      min_value: 1,
      max_value: 5,
      step: 1
    }
  },
  likert_scale: {
    label: 'Likert Scale',
    icon: SlidersHorizontalIcon,
    description: 'Agreement scale (Strongly Disagree to Strongly Agree)',
    color: 'bg-indigo-100 text-indigo-800',
    defaultData: {
      options: ['Strongly Disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly Agree']
    }
  },
  ranking: {
    label: 'Ranking',
    icon: BarChart3Icon,
    description: 'Rank items in order of preference',
    color: 'bg-teal-100 text-teal-800',
    defaultData: {
      items: ['Item 1', 'Item 2', 'Item 3', 'Item 4']
    }
  },
  file_upload: {
    label: 'File Upload',
    icon: FileIcon,
    description: 'Upload document or media file',
    color: 'bg-pink-100 text-pink-800',
    defaultData: {
      allowed_types: ['pdf', 'doc', 'docx'],
      max_size: 10
    }
  },
  coding: {
    label: 'Coding Challenge',
    icon: CodeIcon,
    description: 'Programming problem with code editor',
    color: 'bg-gray-100 text-gray-800',
    defaultData: {
      language: 'javascript',
      starter_code: '// Write your solution here\nfunction solution() {\n  \n}',
      test_cases: []
    }
  }
}

// Draggable Question Component
function DraggableQuestion({ question, index, onEdit, onDelete, onDuplicate }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: question.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1
  }

  const questionType = QUESTION_TYPES[question.type]

  return (
    <Card
      ref={setNodeRef}
      style={style}
      className={cn('cursor-default', isDragging && 'shadow-lg')}
    >
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              className="cursor-grab active:cursor-grabbing"
              {...attributes}
              {...listeners}
            >
              <GripVerticalIcon className="h-4 w-4" />
            </Button>

            <div className="flex items-center gap-2">
              <Badge className={questionType.color}>
                <questionType.icon className="h-3 w-3 mr-1" />
                {questionType.label}
              </Badge>
              <span className="text-sm text-muted-foreground">Question {index + 1}</span>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDuplicate(question)}
            >
              <CopyIcon className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onEdit(question)}
            >
              <EditIcon className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDelete(question.id)}
            >
              <TrashIcon className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <h3 className="font-medium mb-2">{question.question}</h3>

        {question.description && (
          <p className="text-sm text-muted-foreground mb-3">{question.description}</p>
        )}

        <QuestionPreview question={question} />

        <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
          {question.required && (
            <span className="flex items-center gap-1">
              <CheckCircleIcon className="h-3 w-3" />
              Required
            </span>
          )}
          {question.points && (
            <span>{question.points} points</span>
          )}
          {question.time_limit && (
            <span className="flex items-center gap-1">
              <ClockIcon className="h-3 w-3" />
              {question.time_limit}min
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

// Question Preview Component
function QuestionPreview({ question }) {
  const { type, data } = question

  switch (type) {
    case 'multiple_choice':
      return (
        <RadioGroup className="space-y-2">
          {data.options.map((option, index) => (
            <div key={index} className="flex items-center space-x-2">
              <RadioGroupItem value={index.toString()} />
              <Label className="text-sm">{option}</Label>
              {data.correct_answer === index && (
                <CheckCircleIcon className="h-4 w-4 text-green-600" />
              )}
            </div>
          ))}
        </RadioGroup>
      )

    case 'multiple_select':
      return (
        <div className="space-y-2">
          {data.options.map((option, index) => (
            <div key={index} className="flex items-center space-x-2">
              <Checkbox />
              <Label className="text-sm">{option}</Label>
              {data.correct_answers.includes(index) && (
                <CheckCircleIcon className="h-4 w-4 text-green-600" />
              )}
            </div>
          ))}
        </div>
      )

    case 'true_false':
      return (
        <RadioGroup className="flex gap-4">
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="true" />
            <Label>True</Label>
            {data.correct_answer === true && (
              <CheckCircleIcon className="h-4 w-4 text-green-600" />
            )}
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="false" />
            <Label>False</Label>
            {data.correct_answer === false && (
              <CheckCircleIcon className="h-4 w-4 text-green-600" />
            )}
          </div>
        </RadioGroup>
      )

    case 'short_answer':
      return (
        <Input
          placeholder="Short answer..."
          className="max-w-md"
          disabled
        />
      )

    case 'essay':
      return (
        <Textarea
          placeholder="Essay response..."
          rows={3}
          disabled
        />
      )

    case 'rating_scale':
      return (
        <div className="flex items-center gap-2">
          {Array.from({ length: data.max_value - data.min_value + 1 }, (_, i) => (
            <Button key={i} variant="outline" size="sm" disabled>
              {data.min_value + i}
            </Button>
          ))}
        </div>
      )

    case 'likert_scale':
      return (
        <RadioGroup className="flex flex-wrap gap-4">
          {data.options.map((option, index) => (
            <div key={index} className="flex items-center space-x-2">
              <RadioGroupItem value={index.toString()} />
              <Label className="text-xs">{option}</Label>
            </div>
          ))}
        </RadioGroup>
      )

    case 'ranking':
      return (
        <div className="space-y-2">
          {data.items.map((item, index) => (
            <div key={index} className="flex items-center gap-2 p-2 border rounded">
              <GripVerticalIcon className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">{item}</span>
            </div>
          ))}
        </div>
      )

    case 'file_upload':
      return (
        <div className="border-2 border-dashed border-muted rounded-lg p-4 text-center">
          <FileIcon className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
          <p className="text-sm text-muted-foreground">
            Upload {data.allowed_types.join(', ')} files (max {data.max_size}MB)
          </p>
        </div>
      )

    case 'coding':
      return (
        <div className="bg-gray-950 text-green-400 p-4 rounded font-mono text-sm">
          <pre>{data.starter_code}</pre>
        </div>
      )

    default:
      return <div className="text-sm text-muted-foreground">Question preview</div>
  }
}

// Question Form Component
function QuestionForm({ question, availableQuestions, onSave, onCancel }) {
  const [formData, setFormData] = useState({
    type: question?.type || 'multiple_choice',
    question: question?.question || '',
    description: question?.description || '',
    required: question?.required || false,
    points: question?.points || 1,
    time_limit: question?.time_limit || null,
    data: question?.data || QUESTION_TYPES.multiple_choice.defaultData,
    conditions: question?.conditions || []
  })

  const handleTypeChange = (newType) => {
    setFormData({
      ...formData,
      type: newType,
      data: QUESTION_TYPES[newType].defaultData
    })
  }

  const handleDataChange = (key, value) => {
    setFormData({
      ...formData,
      data: { ...formData.data, [key]: value }
    })
  }

  const handleAddCondition = () => {
    const newCondition = {
      id: Date.now(),
      questionId: '',
      operator: 'equals',
      value: '',
      logicOperator: 'AND'
    }
    setFormData({
      ...formData,
      conditions: [...formData.conditions, newCondition]
    })
  }

  const handleUpdateCondition = (conditionId, updates) => {
    setFormData({
      ...formData,
      conditions: formData.conditions.map(condition =>
        condition.id === conditionId ? { ...condition, ...updates } : condition
      )
    })
  }

  const handleRemoveCondition = (conditionId) => {
    setFormData({
      ...formData,
      conditions: formData.conditions.filter(c => c.id !== conditionId)
    })
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    onSave(formData)
  }

  // Get questions that can be used for conditions (previous questions only)
  const conditionableQuestions = availableQuestions ? availableQuestions.filter(q => q.id !== question?.id) : []

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Basic Info */}
      <div className="space-y-4">
        <div>
          <Label htmlFor="type">Question Type</Label>
          <Select value={formData.type} onValueChange={handleTypeChange}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(QUESTION_TYPES).map(([type, config]) => (
                <SelectItem key={type} value={type}>
                  <div className="flex items-center gap-2">
                    <config.icon className="h-4 w-4" />
                    {config.label}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground mt-1">
            {QUESTION_TYPES[formData.type].description}
          </p>
        </div>

        <div>
          <Label htmlFor="question">Question Text</Label>
          <Textarea
            id="question"
            value={formData.question}
            onChange={(e) => setFormData({ ...formData, question: e.target.value })}
            placeholder="Enter your question..."
            required
          />
        </div>

        <div>
          <Label htmlFor="description">Description (Optional)</Label>
          <Textarea
            id="description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="Additional instructions or context..."
            rows={2}
          />
        </div>
      </div>

      {/* Type-specific configuration */}
      <Separator />
      <div className="space-y-4">
        <h3 className="font-medium">Question Configuration</h3>

        {(formData.type === 'multiple_choice' || formData.type === 'multiple_select') && (
          <div className="space-y-3">
            <Label>Options</Label>
            {formData.data.options.map((option, index) => (
              <div key={index} className="flex items-center gap-2">
                <Input
                  value={option}
                  onChange={(e) => {
                    const newOptions = [...formData.data.options]
                    newOptions[index] = e.target.value
                    handleDataChange('options', newOptions)
                  }}
                  placeholder={`Option ${index + 1}`}
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const newOptions = formData.data.options.filter((_, i) => i !== index)
                    handleDataChange('options', newOptions)
                  }}
                >
                  <TrashIcon className="h-4 w-4" />
                </Button>
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                const newOptions = [...formData.data.options, `Option ${formData.data.options.length + 1}`]
                handleDataChange('options', newOptions)
              }}
            >
              <PlusIcon className="h-4 w-4 mr-2" />
              Add Option
            </Button>

            {formData.type === 'multiple_choice' && (
              <div>
                <Label>Correct Answer</Label>
                <Select
                  value={formData.data.correct_answer?.toString()}
                  onValueChange={(value) => handleDataChange('correct_answer', parseInt(value))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select correct option" />
                  </SelectTrigger>
                  <SelectContent>
                    {formData.data.options.map((option, index) => (
                      <SelectItem key={index} value={index.toString()}>
                        {option}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
        )}

        {formData.type === 'true_false' && (
          <div>
            <Label>Correct Answer</Label>
            <Select
              value={formData.data.correct_answer?.toString()}
              onValueChange={(value) => handleDataChange('correct_answer', value === 'true')}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select correct answer" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="true">True</SelectItem>
                <SelectItem value="false">False</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}

        {formData.type === 'short_answer' && (
          <div>
            <Label htmlFor="max_length">Maximum Length (characters)</Label>
            <Input
              id="max_length"
              type="number"
              value={formData.data.max_length}
              onChange={(e) => handleDataChange('max_length', parseInt(e.target.value))}
              min="1"
              max="1000"
            />
          </div>
        )}

        {formData.type === 'essay' && (
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="min_words">Minimum Words</Label>
              <Input
                id="min_words"
                type="number"
                value={formData.data.min_words}
                onChange={(e) => handleDataChange('min_words', parseInt(e.target.value))}
                min="1"
              />
            </div>
            <div>
              <Label htmlFor="max_words">Maximum Words</Label>
              <Input
                id="max_words"
                type="number"
                value={formData.data.max_words}
                onChange={(e) => handleDataChange('max_words', parseInt(e.target.value))}
                min="1"
              />
            </div>
          </div>
        )}

        {formData.type === 'rating_scale' && (
          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label htmlFor="min_value">Minimum Value</Label>
              <Input
                id="min_value"
                type="number"
                value={formData.data.min_value}
                onChange={(e) => handleDataChange('min_value', parseInt(e.target.value))}
              />
            </div>
            <div>
              <Label htmlFor="max_value">Maximum Value</Label>
              <Input
                id="max_value"
                type="number"
                value={formData.data.max_value}
                onChange={(e) => handleDataChange('max_value', parseInt(e.target.value))}
              />
            </div>
            <div>
              <Label htmlFor="step">Step</Label>
              <Input
                id="step"
                type="number"
                value={formData.data.step}
                onChange={(e) => handleDataChange('step', parseInt(e.target.value))}
                min="1"
              />
            </div>
          </div>
        )}

        {formData.type === 'coding' && (
          <div className="space-y-4">
            <div>
              <Label htmlFor="language">Programming Language</Label>
              <Select
                value={formData.data.language}
                onValueChange={(value) => handleDataChange('language', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="javascript">JavaScript</SelectItem>
                  <SelectItem value="python">Python</SelectItem>
                  <SelectItem value="java">Java</SelectItem>
                  <SelectItem value="cpp">C++</SelectItem>
                  <SelectItem value="go">Go</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="starter_code">Starter Code</Label>
              <Textarea
                id="starter_code"
                value={formData.data.starter_code}
                onChange={(e) => handleDataChange('starter_code', e.target.value)}
                rows={6}
                className="font-mono"
              />
            </div>
          </div>
        )}
      </div>

      {/* Settings */}
      <Separator />
      <div className="space-y-4">
        <h3 className="font-medium">Settings</h3>

        <div className="grid grid-cols-3 gap-4">
          <div className="flex items-center space-x-2">
            <Switch
              id="required"
              checked={formData.required}
              onCheckedChange={(checked) => setFormData({ ...formData, required: checked })}
            />
            <Label htmlFor="required">Required</Label>
          </div>

          <div>
            <Label htmlFor="points">Points</Label>
            <Input
              id="points"
              type="number"
              value={formData.points}
              onChange={(e) => setFormData({ ...formData, points: parseInt(e.target.value) })}
              min="0"
            />
          </div>

          <div>
            <Label htmlFor="time_limit">Time Limit (minutes)</Label>
            <Input
              id="time_limit"
              type="number"
              value={formData.time_limit || ''}
              onChange={(e) => setFormData({ ...formData, time_limit: e.target.value ? parseInt(e.target.value) : null })}
              min="1"
              placeholder="No limit"
            />
          </div>
        </div>
      </div>

      {/* Conditional Logic */}
      <Separator />
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-medium">Conditional Display</h3>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleAddCondition}
            disabled={conditionableQuestions.length === 0}
          >
            <PlusIcon className="h-4 w-4 mr-2" />
            Add Condition
          </Button>
        </div>

        {formData.conditions.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            This question will always be shown. Add conditions to control when it appears based on previous answers.
          </p>
        ) : (
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Show this question only when:
            </p>
            {formData.conditions.map((condition, index) => (
              <div key={condition.id} className="flex items-center gap-2 p-3 border rounded-lg">
                {index > 0 && (
                  <Select
                    value={condition.logicOperator}
                    onValueChange={(value) => handleUpdateCondition(condition.id, { logicOperator: value })}
                  >
                    <SelectTrigger className="w-20">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="AND">AND</SelectItem>
                      <SelectItem value="OR">OR</SelectItem>
                    </SelectContent>
                  </Select>
                )}

                <Select
                  value={condition.questionId}
                  onValueChange={(value) => handleUpdateCondition(condition.id, { questionId: value })}
                >
                  <SelectTrigger className="flex-1">
                    <SelectValue placeholder="Select question" />
                  </SelectTrigger>
                  <SelectContent>
                    {conditionableQuestions.map(q => (
                      <SelectItem key={q.id} value={q.id}>
                        {q.question.slice(0, 50)}...
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select
                  value={condition.operator}
                  onValueChange={(value) => handleUpdateCondition(condition.id, { operator: value })}
                >
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="equals">equals</SelectItem>
                    <SelectItem value="not_equals">not equals</SelectItem>
                    <SelectItem value="contains">contains</SelectItem>
                    <SelectItem value="greater_than">greater than</SelectItem>
                    <SelectItem value="less_than">less than</SelectItem>
                    <SelectItem value="is_empty">is empty</SelectItem>
                    <SelectItem value="is_not_empty">is not empty</SelectItem>
                  </SelectContent>
                </Select>

                {!['is_empty', 'is_not_empty'].includes(condition.operator) && (
                  <Input
                    value={condition.value}
                    onChange={(e) => handleUpdateCondition(condition.id, { value: e.target.value })}
                    placeholder="Value"
                    className="flex-1"
                  />
                )}

                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => handleRemoveCondition(condition.id)}
                >
                  <TrashIcon className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        )}

        {conditionableQuestions.length === 0 && (
          <p className="text-xs text-muted-foreground">
            Add more questions to enable conditional logic
          </p>
        )}
      </div>

      <DialogFooter>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">
          {question ? 'Update Question' : 'Add Question'}
        </Button>
      </DialogFooter>
    </form>
  )
}

// Assessment Preview Component - Full candidate experience with conditional logic
function AssessmentPreview({ assessment }) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [answers, setAnswers] = useState({})
  const [timeRemaining, setTimeRemaining] = useState(null)
  const [isSubmitted, setIsSubmitted] = useState(false)

  // Helper function to evaluate conditions
  const evaluateConditions = (conditions, answers) => {
    if (!conditions || conditions.length === 0) return true

    const results = conditions.map(condition => {
      const questionAnswer = answers[condition.questionId]

      switch (condition.operator) {
        case 'equals':
          return questionAnswer === condition.value
        case 'not_equals':
          return questionAnswer !== condition.value
        case 'contains':
          return questionAnswer && questionAnswer.toString().toLowerCase().includes(condition.value.toLowerCase())
        case 'greater_than':
          return Number(questionAnswer) > Number(condition.value)
        case 'less_than':
          return Number(questionAnswer) < Number(condition.value)
        case 'is_empty':
          return !questionAnswer || questionAnswer === ''
        case 'is_not_empty':
          return questionAnswer && questionAnswer !== ''
        default:
          return true
      }
    })

    // Apply logic operators (AND/OR)
    return conditions.reduce((acc, condition, index) => {
      if (index === 0) return results[index]

      if (condition.logicOperator === 'OR') {
        return acc || results[index]
      } else {
        return acc && results[index]
      }
    }, true)
  }

  // Filter questions based on conditions
  const visibleQuestions = useMemo(() => {
    return assessment.questions.filter(question =>
      evaluateConditions(question.conditions, answers)
    )
  }, [assessment.questions, answers])

  const currentQuestion = visibleQuestions[currentQuestionIndex]
  const totalQuestions = visibleQuestions.length

  // Calculate total time limit for visible questions
  const totalTimeLimit = visibleQuestions.reduce((sum, q) => sum + (q.time_limit || 0), 0)

  // Adjust currentQuestionIndex if current question becomes hidden
  React.useEffect(() => {
    if (currentQuestionIndex >= visibleQuestions.length && visibleQuestions.length > 0) {
      setCurrentQuestionIndex(Math.max(0, visibleQuestions.length - 1))
    }
  }, [visibleQuestions, currentQuestionIndex])

  // Timer effect
  React.useEffect(() => {
    if (totalTimeLimit > 0 && timeRemaining === null) {
      setTimeRemaining(totalTimeLimit * 60) // Convert minutes to seconds
    }

    if (timeRemaining > 0) {
      const timer = setTimeout(() => {
        setTimeRemaining(timeRemaining - 1)
      }, 1000)
      return () => clearTimeout(timer)
    } else if (timeRemaining === 0) {
      setIsSubmitted(true)
    }
  }, [timeRemaining, totalTimeLimit])

  const handleAnswerChange = (questionId, answer) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: answer
    }))
  }

  const handleNext = () => {
    if (currentQuestionIndex < totalQuestions - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1)
    }
  }

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1)
    }
  }

  const handleSubmit = () => {
    setIsSubmitted(true)
  }

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  if (totalQuestions === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <BookOpenIcon className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium mb-2">No Questions to Preview</h3>
          <p className="text-muted-foreground">
            Add some questions to see the assessment preview
          </p>
        </CardContent>
      </Card>
    )
  }

  if (isSubmitted) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <CheckCircleIcon className="h-16 w-16 mx-auto text-green-600 mb-4" />
          <h3 className="text-xl font-medium mb-2">Assessment Completed!</h3>
          <p className="text-muted-foreground mb-4">
            This is how candidates will see the completion screen
          </p>
          <div className="text-sm text-muted-foreground">
            <p>Questions answered: {Object.keys(answers).length} of {totalQuestions}</p>
            {totalTimeLimit > 0 && (
              <p>Time taken: {formatTime(totalTimeLimit * 60 - (timeRemaining || 0))}</p>
            )}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Assessment Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl">{assessment.title}</CardTitle>
              <CardDescription>{assessment.description}</CardDescription>
            </div>
            <div className="text-right">
              <div className="text-sm text-muted-foreground">
                Question {currentQuestionIndex + 1} of {totalQuestions}
              </div>
              {timeRemaining !== null && (
                <div className={cn(
                  "text-lg font-mono",
                  timeRemaining < 300 ? "text-red-600" : "text-foreground"
                )}>
                  {formatTime(timeRemaining)}
                </div>
              )}
            </div>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-secondary rounded-full h-2 mt-4">
            <div
              className="bg-primary h-2 rounded-full transition-all duration-300"
              style={{ width: `${((currentQuestionIndex + 1) / totalQuestions) * 100}%` }}
            />
          </div>
        </CardHeader>
      </Card>

      {/* Current Question */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="outline" className={QUESTION_TYPES[currentQuestion.type].color}>
                  {QUESTION_TYPES[currentQuestion.type].label}
                </Badge>
                {currentQuestion.required && (
                  <Badge variant="destructive" className="text-xs">Required</Badge>
                )}
                {currentQuestion.points && (
                  <Badge variant="secondary" className="text-xs">
                    {currentQuestion.points} pts
                  </Badge>
                )}
              </div>
              <CardTitle className="text-lg">{currentQuestion.question}</CardTitle>
              {currentQuestion.description && (
                <CardDescription className="mt-2">
                  {currentQuestion.description}
                </CardDescription>
              )}
            </div>
            {currentQuestion.time_limit && (
              <div className="text-sm text-muted-foreground">
                <ClockIcon className="h-4 w-4 inline mr-1" />
                {currentQuestion.time_limit} min
              </div>
            )}
          </div>
        </CardHeader>

        <CardContent>
          <InteractiveQuestionPreview
            question={currentQuestion}
            answer={answers[currentQuestion.id]}
            onAnswerChange={(answer) => handleAnswerChange(currentQuestion.id, answer)}
          />
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          onClick={handlePrevious}
          disabled={currentQuestionIndex === 0}
        >
          Previous
        </Button>

        <div className="flex items-center gap-2">
          {visibleQuestions.map((_, index) => (
            <Button
              key={index}
              variant={index === currentQuestionIndex ? "default" : "outline"}
              size="sm"
              className="w-8 h-8 p-0"
              onClick={() => setCurrentQuestionIndex(index)}
            >
              {index + 1}
            </Button>
          ))}
        </div>

        {currentQuestionIndex === totalQuestions - 1 ? (
          <Button onClick={handleSubmit} className="bg-green-600 hover:bg-green-700">
            Submit Assessment
          </Button>
        ) : (
          <Button onClick={handleNext}>
            Next
          </Button>
        )}
      </div>
    </div>
  )
}

// Interactive Question Preview Component
function InteractiveQuestionPreview({ question, answer, onAnswerChange }) {
  const { type, data } = question

  switch (type) {
    case 'multiple_choice':
      return (
        <RadioGroup value={answer} onValueChange={onAnswerChange}>
          {data.options.map((option, index) => (
            <div key={index} className="flex items-center space-x-2">
              <RadioGroupItem value={index.toString()} />
              <Label className="cursor-pointer">{option}</Label>
            </div>
          ))}
        </RadioGroup>
      )

    case 'multiple_select':
      return (
        <div className="space-y-2">
          {data.options.map((option, index) => (
            <div key={index} className="flex items-center space-x-2">
              <Checkbox
                checked={answer?.includes(index)}
                onCheckedChange={(checked) => {
                  const currentAnswers = answer || []
                  if (checked) {
                    onAnswerChange([...currentAnswers, index])
                  } else {
                    onAnswerChange(currentAnswers.filter(a => a !== index))
                  }
                }}
              />
              <Label className="cursor-pointer">{option}</Label>
            </div>
          ))}
        </div>
      )

    case 'true_false':
      return (
        <RadioGroup value={answer} onValueChange={onAnswerChange} className="flex gap-8">
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="true" />
            <Label className="cursor-pointer">True</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="false" />
            <Label className="cursor-pointer">False</Label>
          </div>
        </RadioGroup>
      )

    case 'short_answer':
      return (
        <Input
          value={answer || ''}
          onChange={(e) => onAnswerChange(e.target.value)}
          placeholder="Enter your answer..."
          maxLength={data.max_length}
        />
      )

    case 'essay':
      return (
        <div className="space-y-2">
          <Textarea
            value={answer || ''}
            onChange={(e) => onAnswerChange(e.target.value)}
            placeholder="Write your essay response..."
            rows={6}
          />
          <div className="text-xs text-muted-foreground text-right">
            {answer ? answer.split(' ').length : 0} words
            {data.min_words && ` (minimum ${data.min_words} words)`}
            {data.max_words && ` (maximum ${data.max_words} words)`}
          </div>
        </div>
      )

    case 'rating_scale':
      return (
        <div className="flex items-center gap-2 flex-wrap">
          {Array.from({ length: data.max_value - data.min_value + 1 }, (_, i) => {
            const value = data.min_value + i
            return (
              <Button
                key={i}
                variant={answer == value ? "default" : "outline"}
                size="sm"
                onClick={() => onAnswerChange(value)}
              >
                {value}
              </Button>
            )
          })}
        </div>
      )

    case 'likert_scale':
      return (
        <RadioGroup value={answer} onValueChange={onAnswerChange}>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
            {data.options.map((option, index) => (
              <div key={index} className="flex items-center space-x-2">
                <RadioGroupItem value={index.toString()} />
                <Label className="cursor-pointer text-sm">{option}</Label>
              </div>
            ))}
          </div>
        </RadioGroup>
      )

    case 'ranking':
      return (
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground mb-3">
            Drag items to rank them in order of preference (most preferred first)
          </p>
          {data.items.map((item, index) => (
            <div key={index} className="flex items-center gap-2 p-3 border rounded-lg bg-background">
              <div className="flex items-center justify-center w-6 h-6 bg-primary text-primary-foreground rounded-full text-xs font-medium">
                {index + 1}
              </div>
              <GripVerticalIcon className="h-4 w-4 text-muted-foreground cursor-grab" />
              <span className="flex-1">{item}</span>
            </div>
          ))}
        </div>
      )

    case 'file_upload':
      return (
        <FileUploadField
          answer={answer}
          onAnswerChange={onAnswerChange}
          allowedTypes={data.allowed_types}
          maxSize={data.max_size}
        />
      )

    case 'coding':
      return (
        <div className="space-y-3">
          <div className="bg-muted p-3 rounded text-sm">
            <strong>Instructions:</strong> Complete the function below
          </div>
          <div className="bg-gray-950 text-green-400 p-4 rounded font-mono text-sm min-h-[200px]">
            <textarea
              className="w-full h-full bg-transparent border-none outline-none resize-none text-green-400 font-mono"
              value={answer || data.starter_code}
              onChange={(e) => onAnswerChange(e.target.value)}
              placeholder={data.starter_code}
            />
          </div>
          <p className="text-xs text-muted-foreground">
            Language: {data.language.charAt(0).toUpperCase() + data.language.slice(1)}
          </p>
        </div>
      )

    default:
      return <div className="text-sm text-muted-foreground">Interactive preview for this question type</div>
  }
}

export function AssessmentBuilderPage() {
  const navigate = useNavigate()
  const { jobId } = useParams()

  // State
  const [assessment, setAssessment] = useState({
    title: '',
    description: '',
    instructions: '',
    time_limit: null,
    passing_score: 70,
    randomize_questions: false,
    show_results: true,
    sections: [
      {
        id: Date.now(),
        title: 'General Questions',
        description: 'Default section for questions',
        questions: []
      }
    ]
  })

  const [isQuestionDialogOpen, setIsQuestionDialogOpen] = useState(false)
  const [editingQuestion, setEditingQuestion] = useState(null)
  const [isPreviewMode, setIsPreviewMode] = useState(false)
  const [isSectionDialogOpen, setIsSectionDialogOpen] = useState(false)
  const [editingSection, setEditingSection] = useState(null)
  const [activeSectionId, setActiveSectionId] = useState(null)

  // API calls
  const { data: existingJobAssessment } = useJobAssessment(jobId)
  const upsertJobAssessment = useUpsertJobAssessment()
  const createJobAssessment = useCreateJobAssessment()

  // Set default active section
  React.useEffect(() => {
    if (!activeSectionId && assessment.sections.length > 0) {
      setActiveSectionId(assessment.sections[0].id)
    }
  }, [assessment.sections, activeSectionId])

  // Hydrate from existing job assessment
  // When entering builder, start fresh for new assessment; do not auto-hydrate from existing
  // Users can switch to preview to see current content before saving.

  // Drag and drop sensors
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates
    })
  )

  // Get all questions from all sections (for compatibility)
  const allQuestions = useMemo(() => {
    return assessment.sections.flatMap(section => section.questions.map(q => ({ ...q, sectionId: section.id })))
  }, [assessment.sections])

  // Get active section
  const activeSection = assessment.sections.find(s => s.id === activeSectionId)

  // Handlers
  const handleDragEnd = (event) => {
    const { active, over } = event

    if (active.id !== over.id) {
      setAssessment(prev => {
        const newSections = [...prev.sections]
        const sectionIndex = newSections.findIndex(s => s.id === activeSectionId)
        if (sectionIndex === -1) return prev

        const section = newSections[sectionIndex]
        const oldIndex = section.questions.findIndex(q => q.id === active.id)
        const newIndex = section.questions.findIndex(q => q.id === over.id)

        if (oldIndex !== -1 && newIndex !== -1) {
          section.questions = arrayMove(section.questions, oldIndex, newIndex)
        }

        return {
          ...prev,
          sections: newSections
        }
      })
    }
  }

  const handleAddSection = (sectionData) => {
    const newSection = {
      id: Date.now(),
      title: sectionData.title,
      description: sectionData.description,
      questions: []
    }

    setAssessment(prev => ({
      ...prev,
      sections: [...prev.sections, newSection]
    }))

    setActiveSectionId(newSection.id)
    setIsSectionDialogOpen(false)
  }

  const handleEditSection = (sectionData) => {
    setAssessment(prev => ({
      ...prev,
      sections: prev.sections.map(section =>
        section.id === editingSection.id
          ? { ...section, title: sectionData.title, description: sectionData.description }
          : section
      )
    }))

    setEditingSection(null)
    setIsSectionDialogOpen(false)
  }

  const handleDeleteSection = (sectionId) => {
    if (assessment.sections.length <= 1) {
      alert('Cannot delete the last section')
      return
    }

    setAssessment(prev => ({
      ...prev,
      sections: prev.sections.filter(s => s.id !== sectionId)
    }))

    if (activeSectionId === sectionId) {
      setActiveSectionId(assessment.sections.find(s => s.id !== sectionId)?.id)
    }
  }

  const handleAddQuestion = (questionData) => {
    const newQuestion = {
      id: Date.now().toString(),
      ...questionData,
      conditions: questionData.conditions || [] // Add conditional logic support
    }

    setAssessment(prev => ({
      ...prev,
      sections: prev.sections.map(section =>
        section.id === activeSectionId
          ? { ...section, questions: [...section.questions, newQuestion] }
          : section
      )
    }))

    setIsQuestionDialogOpen(false)
  }

  const handleEditQuestion = (questionData) => {
    setAssessment(prev => ({
      ...prev,
      sections: prev.sections.map(section => ({
        ...section,
        questions: section.questions.map(q =>
          q.id === editingQuestion.id ? { ...editingQuestion, ...questionData } : q
        )
      }))
    }))

    setEditingQuestion(null)
  }

  const handleDeleteQuestion = (questionId) => {
    if (window.confirm('Are you sure you want to delete this question?')) {
      setAssessment(prev => ({
        ...prev,
        sections: prev.sections.map(section => ({
          ...section,
          questions: section.questions.filter(q => q.id !== questionId)
        }))
      }))
    }
  }

  const handleDuplicateQuestion = (question) => {
    const duplicatedQuestion = {
      ...question,
      id: Date.now().toString(),
      question: `${question.question} (Copy)`
    }

    setAssessment(prev => ({
      ...prev,
      sections: prev.sections.map(section =>
        section.id === activeSectionId
          ? { ...section, questions: [...section.questions, duplicatedQuestion] }
          : section
      )
    }))
  }

  const handleSaveAssessment = async () => {
    if (!assessment.title || allQuestions.length === 0) {
      alert('Please add a title and at least one question')
      return
    }

    // Convert sections back to flat questions array for API compatibility
    const flatAssessment = {
      ...assessment,
      questions: allQuestions.map(({ sectionId, ...question }) => question)
    }

    try {
      if (jobId) {
        // Create a new assessment for this job instead of overwriting existing
        await createJobAssessment.mutateAsync({ jobId, assessment: flatAssessment })
        navigate(`/app/jobs/${jobId}/assessments`)
      } else {
        // fallback to generic create if no job context
        const createAssessmentMutation = useCreateAssessment()
        await createAssessmentMutation.mutateAsync(flatAssessment)
        navigate('/app/assessments')
      }
    } catch (error) {
      console.error('Failed to save assessment:', error)
    }
  }

  const totalPoints = allQuestions.reduce((sum, q) => sum + (q.points || 0), 0)
  const totalTimeLimit = allQuestions.reduce((sum, q) => sum + (q.time_limit || 0), 0)

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

      <div className="relative z-20 space-y-6 p-6 lg:p-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl lg:text-6xl font-bold tracking-tight mb-4">
              <span className="bg-gradient-to-r from-white via-purple-200 to-pink-200 bg-clip-text text-transparent">
                Assessment Builder
              </span>
            </h1>
            <p className="text-gray-300 text-lg lg:text-xl mb-4">
              Create comprehensive assessments with 10 different question types
            </p>
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
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={() => setIsPreviewMode(!isPreviewMode)}
              className="bg-white/10 border-white/20 text-white hover:bg-white/20"
            >
              <EyeIcon className="h-4 w-4 mr-2" />
              {isPreviewMode ? 'Edit Mode' : 'Preview Mode'}
            </Button>
            <Button
              onClick={handleSaveAssessment}
              disabled={!assessment.title || allQuestions.length === 0}
              className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white border-none shadow-lg"
            >
              <SaveIcon className="h-4 w-4 mr-2" />
              Save Assessment
            </Button>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-4">
          {/* Left Sidebar - Assessment Settings */}
          <div className="lg:col-span-1 space-y-4">
            <Card className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-lg border border-white/20 shadow-2xl rounded-3xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-white">
                  <Settings2Icon className="h-5 w-5" />
                  Assessment Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="title" className="text-gray-300">Assessment Title</Label>
                  <Input
                    id="title"
                    value={assessment.title || ''}
                    onChange={(e) => setAssessment(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Enter assessment title"
                    className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                  />
                </div>

                <div>
                  <Label htmlFor="description" className="text-gray-300">Description</Label>
                  <Textarea
                    id="description"
                    value={assessment.description || ''}
                    onChange={(e) => setAssessment(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Brief description of the assessment"
                    rows={3}
                    className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                  />
                </div>

                <div>
                  <Label htmlFor="instructions" className="text-gray-300">Instructions</Label>
                  <Textarea
                    id="instructions"
                    value={assessment.instructions || ''}
                    onChange={(e) => setAssessment(prev => ({ ...prev, instructions: e.target.value }))}
                    placeholder="Instructions for test takers"
                    rows={3}
                    className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                  />
                </div>

                <div>
                  <Label htmlFor="time_limit" className="text-gray-300">Time Limit (minutes)</Label>
                  <Input
                    id="time_limit"
                    type="number"
                    value={assessment.time_limit || ''}
                    onChange={(e) => setAssessment(prev => ({
                      ...prev,
                      time_limit: e.target.value ? parseInt(e.target.value) : null
                    }))}
                    placeholder="No limit"
                    className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                  />
                </div>

                <div>
                  <Label htmlFor="passing_score" className="text-gray-300">Passing Score (%)</Label>
                  <Input
                    id="passing_score"
                    type="number"
                    value={assessment.passing_score || 70}
                    onChange={(e) => setAssessment(prev => ({
                      ...prev,
                      passing_score: parseInt(e.target.value)
                    }))}
                    min="0"
                    max="100"
                    className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                  />
                </div>

                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="randomize"
                      checked={assessment.randomize_questions || false}
                      onCheckedChange={(checked) => setAssessment(prev => ({
                        ...prev,
                        randomize_questions: checked
                      }))}
                    />
                    <Label htmlFor="randomize" className="text-gray-300">Randomize Questions</Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      id="show_results"
                      checked={assessment.show_results !== false}
                      onCheckedChange={(checked) => setAssessment(prev => ({
                        ...prev,
                        show_results: checked
                      }))}
                    />
                    <Label htmlFor="show_results" className="text-gray-300">Show Results</Label>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Assessment Stats */}
            <Card className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-lg border border-white/20 shadow-2xl rounded-3xl">
              <CardHeader>
                <CardTitle className="text-lg text-white">Assessment Stats</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-300">Questions:</span>
                    <span className="font-medium text-white">{allQuestions.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-300">Sections:</span>
                    <span className="font-medium text-white">{assessment.sections.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-300">Total Points:</span>
                    <span className="font-medium text-white">{totalPoints}</span>
                  </div>
                  {totalTimeLimit > 0 && (
                    <div className="flex justify-between">
                      <span className="text-gray-300">Est. Time:</span>
                      <span className="font-medium text-white">{totalTimeLimit}min</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Question Types */}
            <Card className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-lg border border-white/20 shadow-2xl rounded-3xl">
              <CardHeader>
                <CardTitle className="text-lg text-white">Available Question Types</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 gap-2">
                  {Object.entries(QUESTION_TYPES).map(([type, config]) => (
                    <Button
                      key={type}
                      variant="outline"
                      size="sm"
                      className="justify-start h-auto p-2 bg-white/5 border-white/20 text-white hover:bg-white/10 whitespace-normal text-left break-words"
                      onClick={() => {
                        setEditingQuestion(null)
                        setIsQuestionDialogOpen(true)
                      }}
                    >
                      <config.icon className="h-4 w-4 mr-2" />
                      <div className="text-left whitespace-normal break-words">
                        <div className="font-medium text-xs">{config.label}</div>
                        <div className="text-xs text-gray-400">
                          {config.description}
                        </div>
                      </div>
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content - Questions with Sections */}
          <div className="lg:col-span-3">
            {isPreviewMode ? (
              <AssessmentPreview assessment={{ ...assessment, questions: allQuestions }} />
            ) : (
              <Card className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-lg border border-white/20 shadow-2xl rounded-3xl">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-xl text-white">Assessment Structure</CardTitle>
                      <CardDescription className="text-gray-300">
                        Organize questions into sections and configure conditional logic
                      </CardDescription>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        onClick={() => setIsSectionDialogOpen(true)}
                        className="bg-white/5 border-white/20 text-white hover:bg-white/10 rounded-xl"
                      >
                        <PlusIcon className="h-4 w-4 mr-2" />
                        Add Section
                      </Button>
                      <Button
                        onClick={() => setIsQuestionDialogOpen(true)}
                        disabled={!activeSectionId}
                        className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white border-0 rounded-xl disabled:opacity-50"
                      >
                        <PlusIcon className="h-4 w-4 mr-2" />
                        Add Question
                      </Button>
                    </div>
                  </div>
                </CardHeader>

                <CardContent>
                  {/* Section Tabs */}
                  {assessment.sections.length > 0 && (
                    <div className="mb-6">
                      <div className="flex flex-wrap gap-2 border-b border-white/20 pb-4">
                        {assessment.sections.map((section) => (
                          <Button
                            key={section.id}
                            variant={activeSectionId === section.id ? "default" : "ghost"}
                            size="sm"
                            onClick={() => setActiveSectionId(section.id)}
                            className={`relative rounded-xl ${activeSectionId === section.id
                              ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white"
                              : "bg-white/5 text-gray-300 hover:text-white hover:bg-white/10"
                              }`}
                          >
                            {section.title}
                            <Badge variant="secondary" className="ml-2 text-xs bg-white/20 text-white border-0">
                              {section.questions.length}
                            </Badge>
                            {assessment.sections.length > 1 && (
                              <Button
                                variant="ghost"
                                size="sm"
                                className="ml-2 h-4 w-4 p-0 hover:bg-red-500/20 hover:text-red-400 text-gray-400"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  handleDeleteSection(section.id)
                                }}
                              >
                                <XCircleIcon className="h-3 w-3" />
                              </Button>
                            )}
                          </Button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Active Section Content */}
                  {activeSection ? (
                    <div className="space-y-4">
                      {/* Section Header */}
                      <div className="flex items-center justify-between p-4 bg-black/20 backdrop-blur-sm border border-white/10 rounded-2xl">
                        <div className="flex-1">
                          <h3 className="font-medium text-white">{activeSection.title}</h3>
                          {activeSection.description && (
                            <p className="text-sm text-gray-300 mt-1">
                              {activeSection.description}
                            </p>
                          )}
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setEditingSection(activeSection)
                            setIsSectionDialogOpen(true)
                          }}
                          className="bg-white/5 hover:bg-white/10 text-white rounded-xl"
                        >
                          <EditIcon className="h-4 w-4" />
                        </Button>
                      </div>

                      {/* Questions in Section */}
                      {activeSection.questions.length === 0 ? (
                        <div className="text-center py-12">
                          <BookOpenIcon className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                          <h3 className="text-lg font-medium mb-2 text-white">No questions in this section</h3>
                          <p className="text-gray-300 mb-4">
                            Add questions to start building this section
                          </p>
                          <Button
                            onClick={() => setIsQuestionDialogOpen(true)}
                            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white border-0 rounded-xl"
                          >
                            <PlusIcon className="h-4 w-4 mr-2" />
                            Add First Question
                          </Button>
                        </div>
                      ) : (
                        <DndContext
                          sensors={sensors}
                          collisionDetection={closestCenter}
                          onDragEnd={handleDragEnd}
                        >
                          <SortableContext
                            items={activeSection.questions.map(q => q.id)}
                            strategy={verticalListSortingStrategy}
                          >
                            <div className="space-y-4">
                              {activeSection.questions.map((question, index) => (
                                <DraggableQuestion
                                  key={question.id}
                                  question={question}
                                  index={index}
                                  onEdit={setEditingQuestion}
                                  onDelete={handleDeleteQuestion}
                                  onDuplicate={handleDuplicateQuestion}
                                />
                              ))}
                            </div>
                          </SortableContext>
                        </DndContext>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <BookOpenIcon className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                      <h3 className="text-lg font-medium mb-2 text-white">No sections created</h3>
                      <p className="text-gray-300 mb-4">
                        Create your first section to organize questions
                      </p>
                      <Button
                        onClick={() => setIsSectionDialogOpen(true)}
                        className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white border-0 rounded-xl"
                      >
                        <PlusIcon className="h-4 w-4 mr-2" />
                        Create First Section
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Add/Edit Question Dialog */}
        <Dialog
          open={isQuestionDialogOpen || !!editingQuestion}
          onOpenChange={(open) => {
            if (!open) {
              setIsQuestionDialogOpen(false)
              setEditingQuestion(null)
            }
          }}
        >
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 border border-white/20 backdrop-blur-lg">
            <DialogHeader>
              <DialogTitle className="text-xl text-white">
                {editingQuestion ? 'Edit Question' : 'Add New Question'}
              </DialogTitle>
              <DialogDescription className="text-gray-300">
                Configure your question with the available options and settings
              </DialogDescription>
            </DialogHeader>

            <QuestionForm
              question={editingQuestion}
              availableQuestions={allQuestions}
              onSave={editingQuestion ? handleEditQuestion : handleAddQuestion}
              onCancel={() => {
                setIsQuestionDialogOpen(false)
                setEditingQuestion(null)
              }}
            />
          </DialogContent>
        </Dialog>

        {/* Add/Edit Section Dialog */}
        <Dialog
          open={isSectionDialogOpen}
          onOpenChange={setIsSectionDialogOpen}
        >
          <DialogContent className="max-w-md bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 border border-white/20 backdrop-blur-lg">
            <DialogHeader>
              <DialogTitle className="text-xl text-white">
                {editingSection ? 'Edit Section' : 'Add New Section'}
              </DialogTitle>
              <DialogDescription className="text-gray-300">
                Create logical groups to organize your questions
              </DialogDescription>
            </DialogHeader>

            <SectionForm
              section={editingSection}
              onSave={editingSection ? handleEditSection : handleAddSection}
              onCancel={() => {
                setIsSectionDialogOpen(false)
                setEditingSection(null)
              }}
            />
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}

// Section Form Component
function SectionForm({ section, onSave, onCancel }) {
  const [formData, setFormData] = useState({
    title: section?.title || '',
    description: section?.description || ''
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!formData.title.trim()) return
    onSave(formData)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="section-title" className="text-white">Section Title</Label>
        <Input
          id="section-title"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          placeholder="e.g., Technical Skills, Personality Questions"
          required
          className="bg-white/10 border-white/20 text-white placeholder:text-gray-400 focus:border-purple-400 rounded-xl"
        />
      </div>

      <div>
        <Label htmlFor="section-description" className="text-white">Description (Optional)</Label>
        <Textarea
          id="section-description"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          placeholder="Brief description of what this section covers..."
          rows={2}
          className="bg-white/10 border-white/20 text-white placeholder:text-gray-400 focus:border-purple-400 rounded-xl"
        />
      </div>

      <DialogFooter>
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          className="bg-white/5 border-white/20 text-white hover:bg-white/10 rounded-xl"
        >
          Cancel
        </Button>
        <Button
          type="submit"
          className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white border-0 rounded-xl"
        >
          {section ? 'Update Section' : 'Create Section'}
        </Button>
      </DialogFooter>
    </form>
  )
}

// File Upload Field Component
function FileUploadField({ answer, onAnswerChange, allowedTypes, maxSize }) {
  const [dragActive, setDragActive] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [error, setError] = useState('')
  const fileInputRef = useRef(null)

  const validateFile = (file) => {
    const fileExtension = file.name.split('.').pop().toLowerCase()

    if (!allowedTypes.includes(fileExtension)) {
      setError(`File type .${fileExtension} is not allowed. Allowed types: ${allowedTypes.join(', ')}`)
      return false
    }

    if (file.size > maxSize * 1024 * 1024) {
      setError(`File size exceeds ${maxSize}MB limit`)
      return false
    }

    setError('')
    return true
  }

  const handleFileSelect = (files) => {
    const file = files[0]
    if (!file || !validateFile(file)) return

    // Simulate file upload with progress
    setUploadProgress(0)
    const interval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval)
          // Store file info (in real app, this would be a URL from server)
          onAnswerChange({
            name: file.name,
            size: file.size,
            type: file.type,
            url: URL.createObjectURL(file), // For preview only
            uploadedAt: new Date().toISOString()
          })
          return 100
        }
        return prev + 10
      })
    }, 100)
  }

  const handleDrag = (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  const handleDrop = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files)
    }
  }

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  if (answer && uploadProgress === 100) {
    return (
      <div className="space-y-3">
        <div className="flex items-center gap-3 p-3 border rounded-lg bg-green-50">
          <FileIcon className="h-8 w-8 text-green-600" />
          <div className="flex-1">
            <p className="font-medium text-sm">{answer.name}</p>
            <p className="text-xs text-muted-foreground">
              {formatFileSize(answer.size)} • Uploaded {new Date(answer.uploadedAt).toLocaleString()}
            </p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              onAnswerChange(null)
              setUploadProgress(0)
            }}
          >
            <TrashIcon className="h-4 w-4" />
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <div
        className={cn(
          "border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer",
          dragActive
            ? "border-primary bg-primary/5"
            : "border-muted-foreground/25 hover:border-muted-foreground/50"
        )}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <FileIcon className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
        <p className="text-sm font-medium mb-1">
          {dragActive ? 'Drop file here' : 'Click to upload or drag and drop'}
        </p>
        <p className="text-xs text-muted-foreground">
          {allowedTypes.join(', ').toUpperCase()} files up to {maxSize}MB
        </p>
      </div>

      {uploadProgress > 0 && uploadProgress < 100 && (
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Uploading...</span>
            <span>{uploadProgress}%</span>
          </div>
          <div className="w-full bg-secondary rounded-full h-2">
            <div
              className="bg-primary h-2 rounded-full transition-all duration-300"
              style={{ width: `${uploadProgress}%` }}
            />
          </div>
        </div>
      )}

      {error && (
        <p className="text-sm text-destructive">{error}</p>
      )}

      <input
        ref={fileInputRef}
        type="file"
        className="hidden"
        accept={allowedTypes.map(type => `.${type}`).join(',')}
        onChange={(e) => {
          if (e.target.files && e.target.files[0]) {
            handleFileSelect(e.target.files)
          }
        }}
      />
    </div>
  )
}

export default AssessmentBuilderPage