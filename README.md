# TALENT FLOW - Enterprise Hiring Platform

<div align="center">
  <img src="https://img.shields.io/badge/React-18.x-blue?logo=react" alt="React" />
  <img src="https://img.shields.io/badge/Vite-5.x-purple?logo=vite" alt="Vite" />
  <img src="https://img.shields.io/badge/TanStack_Query-5.x-red?logo=react-query" alt="TanStack Query" />
  <img src="https://img.shields.io/badge/MSW-2.x-orange?logo=mock-service-worker" alt="MSW" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-3.x-cyan?logo=tailwindcss" alt="Tailwind" />
</div>

## 🚀 Overview

TALENT FLOW is a comprehensive, modern hiring platform built with React 18 and enterprise-grade features. It provides end-to-end recruitment management with advanced search capabilities, real-time analytics, and seamless candidate tracking.

## ✨ Key Features

### 🎯 **Core Functionality**

#### **Job Management**
- ✅ **Complete CRUD Operations**: Create, read, update, delete jobs
- ✅ **Deep Linking**: Each job accessible via dedicated route (`/app/jobs/marketing-manager-13`)
- ✅ **Slug-based URLs**: SEO-friendly job URLs with auto-generated slugs
- ✅ **Status Management**: Draft, published, paused, and closed states
- ✅ **Archive/Unarchive**: Soft delete functionality with archive status
- ✅ **Job Templates**: Reusable job posting templates
- ✅ **Rich Job Details**: Comprehensive job descriptions, requirements, and metadata

#### **Candidate Management**
- ✅ **Candidate Profiles**: Complete candidate information management
- ✅ **Application Tracking**: Link candidates to job applications
- ✅ **Deep Linking**: Direct candidate access (`/app/candidates/jane-smith-456`)
- ✅ **Profile Management**: Skills, experience, and contact information
- ✅ **Application History**: Track candidate application journey

#### **Advanced Search & Filtering**
- ✅ **Global Search**: Search across jobs and candidates
- ✅ **Advanced Filters**: Department, status, location, experience level
- ✅ **Saved Searches**: Save and reuse complex search queries
- ✅ **Recent Searches**: Quick access to recently used search terms
- ✅ **Real-time Results**: Instant search with debounced queries
- ✅ **Multi-parameter Search**: Combine multiple filters simultaneously

### 📊 **Analytics & Reporting**

#### **Real-time Dashboard**
- ✅ **Key Metrics**: Job counts, application statistics, hiring funnel
- ✅ **Performance Indicators**: Time-to-hire, application-to-hire ratios
- ✅ **Visual Charts**: Interactive charts and graphs
- ✅ **Department Breakdown**: Hiring metrics by department
- ✅ **Trend Analysis**: Historical data and trend visualization

#### **Export & Reporting**
- ✅ **Multi-format Export**: CSV, Excel, JSON, PDF support
- ✅ **Bulk Export**: Export entire datasets or filtered results
- ✅ **Custom Reports**: Generate reports with selected columns
- ✅ **Scheduled Exports**: Automated report generation
- ✅ **Data Visualization**: Export charts and analytics

### 🔧 **Assessment & Evaluation**

#### **Assessment Builder**
- ✅ **Question Management**: Create and manage assessment questions
- ✅ **Multiple Question Types**: Multiple choice, text, coding challenges
- ✅ **Assessment Templates**: Reusable assessment structures
- ✅ **Preview Mode**: Test assessments before publishing
- ✅ **Scoring System**: Automated and manual scoring options

#### **Interview Management**
- ✅ **Interview Scheduling**: Calendar integration and scheduling
- ✅ **Interview Notes**: Structured feedback and notes system
- ✅ **Evaluation Forms**: Standardized interview evaluation
- ✅ **Collaborative Reviews**: Multi-interviewer feedback

### 🛠 **Technical Features**

#### **Performance & UX**
- ✅ **Network Simulation**: Realistic API response times (200-1200ms latency)
- ✅ **Error Handling**: 5-10% simulated network failure rate
- ✅ **Caching Strategy**: Intelligent data caching with TanStack Query
- ✅ **Optimistic Updates**: Immediate UI feedback for user actions
- ✅ **Loading States**: Comprehensive loading indicators and skeletons
- ✅ **Error Boundaries**: Graceful error handling and recovery

#### **Data Management**
- ✅ **IndexedDB Storage**: Client-side data persistence with Dexie.js
- ✅ **API Simulation**: Complete MSW-powered API simulation
- ✅ **Data Validation**: Form validation and data integrity checks
- ✅ **Conflict Resolution**: Handle concurrent data updates
- ✅ **Offline Support**: Basic offline functionality with cached data

#### **Developer Experience**
- ✅ **Hot Module Replacement**: Fast development with Vite
- ✅ **TypeScript Support**: Type-safe development environment
- ✅ **Component Library**: Reusable UI components with shadcn/ui
- ✅ **Design System**: Consistent styling with Tailwind CSS
- ✅ **Code Organization**: Modular architecture with clear separation

## 🏗 **Architecture Overview**

### **Frontend Stack**
- **React 18**: Modern React with hooks and concurrent features
- **Vite**: Lightning-fast build tool and dev server
- **TanStack Query**: Powerful data fetching and state management
- **React Router v6**: Client-side routing with nested routes
- **Tailwind CSS**: Utility-first CSS framework
- **shadcn/ui**: High-quality, accessible UI components

### **Data Layer**
- **MSW (Mock Service Worker)**: API simulation with realistic network conditions
- **Dexie.js**: IndexedDB wrapper for client-side storage
- **TanStack Query Cache**: Intelligent query caching and synchronization

### **Development Tools**
- **ESLint**: Code linting and quality assurance
- **Prettier**: Code formatting and consistency
- **Git**: Version control with conventional commits

## 📱 **User Interface**

### **Design Principles**
- **Mobile-First**: Responsive design for all screen sizes
- **Accessibility**: WCAG compliant with keyboard navigation
- **Dark Mode**: Full dark/light theme support
- **Intuitive Navigation**: Clear information architecture
- **Performance**: Optimized for speed and efficiency

### **Key UI Components**
- **Data Tables**: Sortable, filterable tables with pagination
- **Forms**: Comprehensive form validation and error handling
- **Modals & Dialogs**: Contextual actions and confirmations
- **Navigation**: Sidebar navigation with active state indicators
- **Charts**: Interactive data visualization
- **Toast Notifications**: User feedback and status updates

## 🚦 **Getting Started**

### **Prerequisites**
- Node.js 18+ 
- npm or yarn
- Modern web browser

### **Installation**

```bash
# Clone the repository
git clone <repository-url>
cd talent-flow

# Install dependencies
npm install

# Start development server
npm run dev
```

### **Available Scripts**

```bash
# Development
npm run dev          # Start dev server with hot reload

# Building
npm run build        # Build for production
npm run preview      # Preview production build

# Code Quality
npm run lint         # Run ESLint
npm run lint:fix     # Fix ESLint issues
```

## 🔌 **API Endpoints**

### **Jobs**
- `GET /api/jobs` - List jobs with filtering and pagination
- `POST /api/jobs` - Create new job
- `GET /api/jobs/:id` - Get job by ID or slug
- `PUT /api/jobs/:id` - Update job
- `PATCH /api/jobs/:id` - Partial job update
- `DELETE /api/jobs/:id` - Delete job

### **Candidates**
- `GET /api/candidates` - List candidates with filtering
- `POST /api/candidates` - Create new candidate
- `GET /api/candidates/:id` - Get candidate by ID or slug
- `PUT /api/candidates/:id` - Update candidate
- `DELETE /api/candidates/:id` - Delete candidate

### **Applications**
- `GET /api/applications` - List applications
- `POST /api/applications` - Create new application
- `GET /api/applications/:id` - Get application details
- `PUT /api/applications/:id` - Update application status

## 🎨 **Customization**

### **Theming**
The application supports full theming through CSS custom properties:

```css
:root {
  --primary: 222.2 84% 4.9%;
  --primary-foreground: 210 40% 98%;
  --background: 0 0% 100%;
  --foreground: 222.2 84% 4.9%;
  /* ... more theme variables */
}
```

### **Component Customization**
Components are built with Tailwind CSS and can be easily customized:

```jsx
// Example: Custom button variant
<Button variant="outline" size="lg" className="custom-styles">
  Custom Button
</Button>
```

## 📈 **Performance Features**

### **Optimizations**
- **Code Splitting**: Dynamic imports for route-based splitting
- **Tree Shaking**: Dead code elimination in production builds
- **Asset Optimization**: Compressed images and optimized bundles
- **Caching Strategy**: Aggressive caching for static assets
- **Lazy Loading**: Components and routes loaded on demand

### **Monitoring**
- **Network Simulation**: Realistic API response times
- **Error Tracking**: Comprehensive error logging
- **Performance Metrics**: Core Web Vitals monitoring
- **User Analytics**: Usage patterns and feature adoption

## 🔒 **Security Features**

### **Data Protection**
- **Client-side Validation**: Input validation and sanitization
- **XSS Prevention**: Safe rendering of user content
- **CSRF Protection**: Token-based request validation
- **Data Encryption**: Sensitive data encryption in storage

## 🤝 **Contributing**

### **Development Workflow**
1. Fork the repository
2. Create a feature branch
3. Make changes with tests
4. Submit a pull request

### **Code Standards**
- Follow ESLint configuration
- Use conventional commit messages
- Maintain test coverage
- Document new features

## 📄 **License**

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 **Acknowledgments**

- **shadcn/ui** for the excellent component library
- **TanStack** for powerful data fetching tools
- **Tailwind CSS** for utility-first styling
- **MSW** for realistic API mocking
- **React Team** for the amazing framework

---

<div align="center">
  <p><strong>Built with ❤️ using modern web technologies</strong></p>
  <p>TALENT FLOW - Making hiring simple, efficient, and enjoyable</p>
</div>
