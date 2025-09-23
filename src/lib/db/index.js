import Dexie from 'dexie'

export class TalentFlowDatabase extends Dexie {
  constructor() {
    super('TalentFlowDB')

    this.version(1).stores({
      jobs: '++id, title, department, status, description, requirements, created_at, updated_at, slug, tags, archived',
      candidates: '++id, name, email, phone, position, stage, experience, location, resume_url, notes, created_at, updated_at, stage_history',
      applications: '++id, job_id, candidate_id, stage, applied_at, notes, stage_history',
      assessments: '++id, job_id, title, description, questions, created_at, updated_at',
      assessment_responses: '++id, assessment_id, candidate_id, responses, score, completed_at'
    })
  }
}

export const db = new TalentFlowDatabase()

// Generate comprehensive seed data exactly as required by PDF
const departments = ['Engineering', 'Product', 'Design', 'Marketing', 'Sales', 'Operations', 'HR', 'Finance']
const jobTitles = [
  'Senior Frontend Developer', 'Backend Engineer', 'Full Stack Developer', 'DevOps Engineer', 'Data Scientist',
  'Product Manager', 'Senior Product Manager', 'Product Owner', 'Product Designer', 'UX Designer',
  'UI Designer', 'UX Researcher', 'Marketing Manager', 'Digital Marketing Specialist', 'Content Manager',
  'Sales Manager', 'Account Executive', 'Customer Success Manager', 'Operations Manager', 'HR Manager',
  'Financial Analyst', 'QA Engineer', 'Mobile Developer', 'Security Engineer', 'Machine Learning Engineer'
]

const candidateNames = [
  'Sarah Chen', 'Marcus Rodriguez', 'Elena Kowalski', 'James Thompson', 'Priya Patel', 'David Kim', 'Maya Johnson',
  'Alex Turner', 'Sofia Garcia', 'Michael Brown', 'Zoe Wang', 'Ryan O\'Connor', 'Aisha Kumar', 'Nathan Lee',
  'Isabella Santos', 'Connor Murphy', 'Aria Nguyen', 'Lucas Silva', 'Chloe Anderson', 'Ethan Davis'
]

const locations = [
  'San Francisco, CA', 'New York, NY', 'Seattle, WA', 'Austin, TX', 'Boston, MA', 'Los Angeles, CA',
  'Chicago, IL', 'Denver, CO', 'Portland, OR', 'Atlanta, GA', 'Miami, FL', 'Dallas, TX'
]

const stages = ['applied', 'screen', 'test', 'offer', 'hired', 'rejected']
const jobStatuses = ['active', 'draft', 'paused', 'archived', 'closed']
const techTags = ['React', 'Node.js', 'Python', 'TypeScript', 'AWS', 'Docker', 'Kubernetes', 'GraphQL',
  'Machine Learning', 'Data Science', 'Frontend', 'Backend', 'Full Stack', 'DevOps',
  'UI/UX', 'Product Management', 'Marketing', 'Sales', 'Remote', 'Senior', 'Junior']

// Generate exactly 25 jobs as required
function generateJobs() {
  const jobs = []
  for (let i = 1; i <= 25; i++) {
    const title = jobTitles[i - 1] || `${jobTitles[i % jobTitles.length]} ${Math.floor(i / jobTitles.length) + 1}`
    const department = departments[i % departments.length]
    const status = jobStatuses[i % jobStatuses.length]
    const slug = title.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')

    jobs.push({
      id: i,
      title,
      department,
      status,
      slug: `${slug}-${i}`,
      description: `We are seeking a talented ${title} to join our ${department} team. This role involves working on cutting-edge projects and collaborating with cross-functional teams to deliver exceptional results.`,
      requirements: [
        `3+ years of experience in ${title.toLowerCase()}`,
        'Strong communication skills',
        'Bachelor\'s degree or equivalent experience',
        'Experience with modern development practices'
      ],
      tags: techTags.slice(0, Math.floor(Math.random() * 4) + 2),
      archived: status === 'archived',
      created_at: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000), // Last 30 days
      updated_at: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000)   // Last 7 days
    })
  }
  return jobs
}

// Generate exactly 1,000 candidates as required
function generateCandidates() {
  const candidates = []
  for (let i = 1; i <= 1000; i++) {
    const name = i <= candidateNames.length
      ? candidateNames[i - 1]
      : `${candidateNames[i % candidateNames.length]} ${Math.floor(i / candidateNames.length)}`

    const position = jobTitles[i % jobTitles.length]
    const location = locations[i % locations.length]
    const stage = stages[i % stages.length]
    const experience = `${Math.floor(Math.random() * 10) + 1} years`
    const createdAt = new Date(Date.now() - Math.random() * 60 * 24 * 60 * 60 * 1000); // Last 60 days
    const stageHistory = [{
      stage: 'applied',
      date: createdAt.toISOString(),
      notes: 'Initial application received'
    }];
    if (stage !== 'applied') {
      stageHistory.push({
        stage: stage,
        date: new Date(createdAt.getTime() + Math.random() * 10 * 24 * 60 * 60 * 1000).toISOString(), // Sometime after applying
        notes: `Stage updated to ${stage}`
      });
    }

    candidates.push({
      id: i,
      name,
      email: `${name.toLowerCase().replace(/\s+/g, '.')}${i > candidateNames.length ? i : ''}@email.com`,
      phone: `+1-555-${String(Math.floor(Math.random() * 10000)).padStart(4, '0')}`,
      position,
      stage,
      experience,
      location,
      resume_url: `https://example.com/resume-${i}.pdf`,
      notes: `${name} is a ${experience} experienced ${position} with excellent skills and strong background.`,
      //created_at: new Date(Date.now() - Math.random() * 60 * 24 * 60 * 60 * 1000), // Last 60 days
      created_at: createdAt,
      updated_at: new Date(Date.now() - Math.random() * 14 * 24 * 60 * 60 * 1000),  // Last 14 days
      stage_history: stageHistory // ADD THIS LINE
    })
  }
  return candidates
}

// Generate applications linking candidates to jobs
function generateApplications(jobs, candidates) {
  const applications = []
  let id = 1

  // Ensure each job has some applications (random 5-20 per job)
  jobs.forEach(job => {
    const numApplications = Math.floor(Math.random() * 16) + 5 // 5-20 applications per job
    const selectedCandidates = candidates
      .sort(() => 0.5 - Math.random())
      .slice(0, numApplications)

    selectedCandidates.forEach(candidate => {
      applications.push({
        id: id++,
        job_id: job.id,
        candidate_id: candidate.id,
        stage: candidate.stage,
        applied_at: new Date(Date.now() - Math.random() * 45 * 24 * 60 * 60 * 1000), // Last 45 days
        notes: `Application for ${job.title}`,
        stage_history: [
          { stage: 'applied', date: new Date(Date.now() - Math.random() * 45 * 24 * 60 * 60 * 1000), notes: 'Initial application received' },
          ...(candidate.stage !== 'applied' ? [{ stage: candidate.stage, date: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000), notes: `Moved to ${candidate.stage}` }] : [])
        ]
      })
    })
  })

  return applications
}

// Generate exactly 3 comprehensive assessments as required
function generateAssessments() {
  return [
    {
      id: 1,
      job_id: 1, // Senior Frontend Developer
      title: 'Frontend Technical Assessment',
      description: 'Comprehensive technical assessment for frontend developers focusing on React, JavaScript, and modern web development practices.',
      questions: [
        {
          id: 1,
          type: 'multiple-choice',
          question: 'What is the purpose of React.memo()?',
          options: ['To memoize component props', 'To prevent unnecessary re-renders', 'To cache API responses', 'To optimize bundle size'],
          correct_answer: 1,
          required: true
        },
        {
          id: 2,
          type: 'multiple-choice',
          question: 'Which hook would you use to perform side effects in React?',
          options: ['useState', 'useEffect', 'useContext', 'useReducer'],
          correct_answer: 1,
          required: true
        },
        {
          id: 3,
          type: 'single-choice',
          question: 'What is the virtual DOM?',
          options: ['A copy of the real DOM', 'A JavaScript representation of the DOM', 'A browser API', 'A React component'],
          correct_answer: 1,
          required: true
        },
        {
          id: 4,
          type: 'text',
          question: 'Explain the concept of "lifting state up" in React.',
          required: true,
          min_length: 50
        },
        {
          id: 5,
          type: 'code',
          question: 'Write a custom hook that manages local storage state. Include error handling.',
          required: true,
          expected_keywords: ['useState', 'useEffect', 'localStorage', 'try', 'catch']
        },
        {
          id: 6,
          type: 'numeric',
          question: 'How many years of React experience do you have?',
          required: true,
          min_value: 0,
          max_value: 20
        },
        {
          id: 7,
          type: 'multiple-choice',
          question: 'Which of the following are valid ways to handle forms in React? (Select all that apply)',
          options: ['Controlled components', 'Uncontrolled components', 'React Hook Form', 'Formik'],
          correct_answers: [0, 1, 2, 3],
          multiple: true,
          required: true
        },
        {
          id: 8,
          type: 'text',
          question: 'Describe your experience with state management libraries (Redux, Zustand, etc.)',
          required: false,
          max_length: 500
        },
        {
          id: 9,
          type: 'file-upload',
          question: 'Please upload a code sample demonstrating your React skills.',
          required: false,
          accepted_formats: ['.js', '.jsx', '.ts', '.tsx', '.zip']
        },
        {
          id: 10,
          type: 'conditional',
          question: 'Do you have TypeScript experience?',
          condition_type: 'show_if_yes',
          condition_question: 'Have you worked with TypeScript?',
          options: ['Yes', 'No'],
          follow_up: {
            type: 'text',
            question: 'Describe a complex TypeScript feature you\'ve used.',
            required: true
          }
        }
      ],
      created_at: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000),
      updated_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000)
    },
    {
      id: 2,
      job_id: 6, // Product Manager
      title: 'Product Management Assessment',
      description: 'Assessment designed to evaluate product management skills, strategic thinking, and analytical capabilities.',
      questions: [
        {
          id: 1,
          type: 'text',
          question: 'Describe how you would prioritize features for a new product launch.',
          required: true,
          min_length: 100,
          max_length: 1000
        },
        {
          id: 2,
          type: 'multiple-choice',
          question: 'Which framework is most commonly used for product prioritization?',
          options: ['RICE', 'MoSCoW', 'Kano Model', 'All of the above'],
          correct_answer: 3,
          required: true
        },
        {
          id: 3,
          type: 'numeric',
          question: 'How many years of product management experience do you have?',
          required: true,
          min_value: 0,
          max_value: 30
        },
        {
          id: 4,
          type: 'text',
          question: 'Describe a time when you had to make a difficult product decision with limited data.',
          required: true,
          min_length: 200
        },
        {
          id: 5,
          type: 'multiple-choice',
          question: 'What metrics would you track for a SaaS product? (Select all that apply)',
          options: ['Monthly Active Users', 'Churn Rate', 'Customer Lifetime Value', 'Net Promoter Score', 'Feature Adoption Rate'],
          correct_answers: [0, 1, 2, 3, 4],
          multiple: true,
          required: true
        },
        {
          id: 6,
          type: 'text',
          question: 'How do you handle conflicting stakeholder requirements?',
          required: true,
          min_length: 150
        },
        {
          id: 7,
          type: 'file-upload',
          question: 'Upload a product requirements document or case study you\'ve created.',
          required: false,
          accepted_formats: ['.pdf', '.doc', '.docx']
        },
        {
          id: 8,
          type: 'single-choice',
          question: 'What is your preferred method for user research?',
          options: ['User interviews', 'Surveys', 'A/B testing', 'Analytics review'],
          required: true
        },
        {
          id: 9,
          type: 'text',
          question: 'Describe your experience with agile methodologies.',
          required: true,
          min_length: 100
        },
        {
          id: 10,
          type: 'numeric',
          question: 'On a scale of 1-10, how comfortable are you with data analysis?',
          required: true,
          min_value: 1,
          max_value: 10
        }
      ],
      created_at: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
      updated_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)
    },
    {
      id: 3,
      job_id: 10, // UX Designer
      title: 'UX Design Portfolio Assessment',
      description: 'Comprehensive assessment evaluating UX design skills, design thinking process, and portfolio quality.',
      questions: [
        {
          id: 1,
          type: 'file-upload',
          question: 'Please upload your design portfolio showcasing your best UX work.',
          required: true,
          accepted_formats: ['.pdf', '.zip', '.url']
        },
        {
          id: 2,
          type: 'text',
          question: 'Walk us through your design process for a recent project.',
          required: true,
          min_length: 200,
          max_length: 1000
        },
        {
          id: 3,
          type: 'multiple-choice',
          question: 'Which design tools do you use regularly? (Select all that apply)',
          options: ['Figma', 'Sketch', 'Adobe XD', 'Framer', 'InVision', 'Principle'],
          multiple: true,
          required: true
        },
        {
          id: 4,
          type: 'text',
          question: 'Describe how you conduct user research and incorporate findings into your designs.',
          required: true,
          min_length: 150
        },
        {
          id: 5,
          type: 'single-choice',
          question: 'What is your primary approach to information architecture?',
          options: ['Card sorting', 'Tree testing', 'User journey mapping', 'Competitive analysis'],
          required: true
        },
        {
          id: 6,
          type: 'text',
          question: 'How do you handle design feedback and iteration?',
          required: true,
          min_length: 100
        },
        {
          id: 7,
          type: 'numeric',
          question: 'How many years of UX design experience do you have?',
          required: true,
          min_value: 0,
          max_value: 25
        },
        {
          id: 8,
          type: 'text',
          question: 'Describe a challenging design problem you solved and your approach.',
          required: true,
          min_length: 250
        },
        {
          id: 9,
          type: 'multiple-choice',
          question: 'Which accessibility guidelines do you follow?',
          options: ['WCAG 2.1', 'Section 508', 'ADA', 'I don\'t follow specific guidelines'],
          correct_answer: 0,
          required: true
        },
        {
          id: 10,
          type: 'conditional',
          question: 'Do you have experience with design systems?',
          options: ['Yes', 'No'],
          follow_up: {
            type: 'text',
            question: 'Describe your experience building or maintaining design systems.',
            required: true,
            min_length: 100
          }
        }
      ],
      created_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
      updated_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)
    }
  ]
}

// Complete seed data as required by PDF
export const seedData = {
  jobs: generateJobs(),
  candidates: generateCandidates(),
  assessments: generateAssessments()
}

// Generate applications after we have jobs and candidates
seedData.applications = generateApplications(seedData.jobs, seedData.candidates)

// Initialize database with comprehensive seed data
export async function initializeDatabase() {
  try {
    // Check if data already exists
    const jobCount = await db.jobs.count()

    if (jobCount === 0) {
      console.log('🚀 Seeding database with comprehensive data...')

      // Seed the database with exactly the required amounts
      await db.jobs.bulkAdd(seedData.jobs)
      console.log('✅ Added 25 jobs')

      await db.candidates.bulkAdd(seedData.candidates)
      console.log('✅ Added 1,000 candidates')

      await db.applications.bulkAdd(seedData.applications)
      console.log(`✅ Added ${seedData.applications.length} applications`)

      await db.assessments.bulkAdd(seedData.assessments)
      console.log('✅ Added 3 comprehensive assessments')

      console.log('🎉 Database seeded successfully with all required data!')
    } else {
      console.log('📊 Database already contains data')
    }
  } catch (error) {
    console.error('❌ Error initializing database:', error)
  }
}