import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { SettingsMenu } from '@/components/settings-menu'
import { DemoDialog } from '@/components/demo-dialog'
import { Card } from '@/components/ui/card'
import { ThemeToggle } from '@/components/theme-toggle'
import {
  Users,
  Briefcase,
  FileText,
  ArrowRight,
  ChevronRight,
  Zap,
  Target,
  TrendingUp,
  Shield,
  Clock,
  Award,
  CheckCircle,
  Star,
  Sparkles
} from 'lucide-react'
import { motion } from 'framer-motion'

export function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 dark:from-black dark:via-slate-950 dark:to-black relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
        <div className="absolute top-40 left-40 w-80 h-80 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
      </div>

      {/* Grid pattern overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
      {/* Header */}
      <header className="relative z-50 flex items-center justify-between p-6 lg:px-8 backdrop-blur-md bg-white/10 dark:bg-black/20 border-b border-white/20">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center space-x-2"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 shadow-lg">
            <Briefcase className="h-6 w-6 text-white" />
          </div>
          <span className="text-2xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">TALENT FLOW</span>
        </motion.div>

        <nav className="hidden md:flex items-center space-x-8">
          <a href="#features" className="text-sm font-medium text-gray-300 hover:text-white transition-colors">
            Features
          </a>
          <div className="flex items-center space-x-4">
            <ThemeToggle />
            <SettingsMenu />
            <Button asChild className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white border-none shadow-lg">
              <Link to="/app">Get Started</Link>
            </Button>
          </div>
        </nav>

        <div className="md:hidden flex items-center space-x-2">
          <ThemeToggle />
          <SettingsMenu />
          <Button size="sm" asChild className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">
            <Link to="/app">Get started</Link>
          </Button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative z-20 px-6 lg:px-8 py-24 lg:py-32">
        <div className="mx-auto max-w-7xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Hero Content */}
            <div className="text-left">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-500/20 border border-purple-500/30 text-purple-300 text-sm font-medium mb-6"
              >
                <Sparkles className="h-4 w-4" />
                Smart Hiring Platform
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-5xl lg:text-7xl font-bold tracking-tight mb-6"
              >
                <span className="bg-gradient-to-r from-white via-purple-200 to-pink-200 bg-clip-text text-transparent">
                  Hire
                </span>
                <br />
                <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                  Exceptional
                </span>
                <br />
                <span className="bg-gradient-to-r from-white via-blue-200 to-purple-200 bg-clip-text text-transparent">
                  Talent
                </span>
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-xl lg:text-2xl text-gray-300 leading-relaxed mb-8 max-w-2xl"
              >
                Transform your hiring process with our cutting-edge platform.
                <span className="text-purple-300 font-semibold"> Smart assessments</span>,
                <span className="text-pink-300 font-semibold"> Smart insights</span>, and
                <span className="text-blue-300 font-semibold"> seamless collaboration</span>.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-8"
              >
                <Button size="lg" asChild className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white border-none shadow-2xl text-lg px-8 py-4 rounded-xl">
                  <Link to="/app" className="flex items-center gap-2">
                    Start Hiring Now
                    <ArrowRight className="h-5 w-5" />
                  </Link>
                </Button>
                <DemoDialog triggerLabel="Watch Demo" />
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="flex items-center gap-6 text-sm text-gray-400"
              >
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-400" />
                  Free 14-day trial
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-400" />
                  No credit card required
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-400" />
                  Setup in 5 minutes
                </div>
              </motion.div>
            </div>

            {/* Hero Image */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6 }}
              className="relative"
            >
              <div className="relative z-10 bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-lg rounded-3xl p-8 border border-white/20 shadow-2xl">
                {/* Dashboard mockup */}
                <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-6 shadow-inner">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                    <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 bg-purple-500/20 rounded-lg border border-purple-500/30">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg"></div>
                        <div>
                          <div className="text-white text-sm font-medium">Senior Developer</div>
                          <div className="text-gray-400 text-xs">12 candidates</div>
                        </div>
                      </div>
                      <div className="text-green-400 text-sm font-medium">Active</div>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-blue-500/20 rounded-lg border border-blue-500/30">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg"></div>
                        <div>
                          <div className="text-white text-sm font-medium">Product Manager</div>
                          <div className="text-gray-400 text-xs">8 candidates</div>
                        </div>
                      </div>
                      <div className="text-yellow-400 text-sm font-medium">Review</div>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-green-500/20 rounded-lg border border-green-500/30">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg"></div>
                        <div>
                          <div className="text-white text-sm font-medium">UX Designer</div>
                          <div className="text-gray-400 text-xs">15 candidates</div>
                        </div>
                      </div>
                      <div className="text-green-400 text-sm font-medium">Filled</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Floating elements */}
              <div className="absolute -top-4 -right-4 w-20 h-20 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl opacity-80 blur-sm"></div>
              <div className="absolute -bottom-4 -left-4 w-16 h-16 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-2xl opacity-80 blur-sm"></div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="relative z-20 py-24 lg:py-32 px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="text-center mb-20"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-500/20 border border-purple-500/30 text-purple-300 text-sm font-medium mb-6">
              <Target className="h-4 w-4" />
              Core Features
            </div>
            <h2 className="text-4xl lg:text-6xl font-bold tracking-tight mb-6">
              <span className="bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                Everything you need to
              </span>
              <br />
              <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                hire the best talent
              </span>
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Powerful features designed to make your hiring process efficient, effective, and enjoyable
            </p>
          </motion.div>

          <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
            {[
              {
                icon: Briefcase,
                title: "Smart Job Management",
                description: "Create, edit, and manage job postings with Smart suggestions. Track applications and optimize your workflow with intelligent insights.",
                delay: 0.1,
                gradient: "from-purple-500 to-pink-500",
                bgGradient: "from-purple-500/20 to-pink-500/20",
                borderGradient: "from-purple-500/50 to-pink-500/50",
                features: ["Smart job descriptions", "Automated posting to multiple boards", "Real-time analytics"],
                mockup: (
                  <div className="bg-gray-900/50 rounded-lg p-4 border border-purple-500/30">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-6 h-6 bg-gradient-to-r from-purple-500 to-pink-500 rounded"></div>
                      <div className="text-white text-sm font-medium">Senior React Developer</div>
                    </div>
                    <div className="space-y-2">
                      <div className="h-2 bg-purple-500/30 rounded w-3/4"></div>
                      <div className="h-2 bg-purple-500/30 rounded w-1/2"></div>
                      <div className="flex justify-between text-xs text-gray-400 mt-3">
                        <span>24 Applications</span>
                        <span className="text-green-400">Active</span>
                      </div>
                    </div>
                  </div>
                )
              },
              {
                icon: Users,
                title: "Advanced Candidate Tracking",
                description: "Visualize your hiring pipeline with dynamic Kanban boards. Track candidate progress from initial application to successful hire.",
                delay: 0.2,
                gradient: "from-blue-500 to-cyan-500",
                bgGradient: "from-blue-500/20 to-cyan-500/20",
                borderGradient: "from-blue-500/50 to-cyan-500/50",
                features: ["Drag-and-drop pipeline", "Automated status updates", "Collaboration tools"],
                mockup: (
                  <div className="bg-gray-900/50 rounded-lg p-4 border border-blue-500/30">
                    <div className="flex gap-2 mb-3">
                      <div className="flex-1">
                        <div className="text-xs text-gray-400 mb-1">Applied</div>
                        <div className="w-full h-12 bg-blue-500/20 rounded border border-blue-500/30 flex items-center justify-center text-blue-300 text-xs">3</div>
                      </div>
                      <div className="flex-1">
                        <div className="text-xs text-gray-400 mb-1">Interview</div>
                        <div className="w-full h-12 bg-yellow-500/20 rounded border border-yellow-500/30 flex items-center justify-center text-yellow-300 text-xs">2</div>
                      </div>
                      <div className="flex-1">
                        <div className="text-xs text-gray-400 mb-1">Hired</div>
                        <div className="w-full h-12 bg-green-500/20 rounded border border-green-500/30 flex items-center justify-center text-green-300 text-xs">1</div>
                      </div>
                    </div>
                  </div>
                )
              },
              {
                icon: FileText,
                title: "Dynamic Assessment Builder",
                description: "Build custom assessments with live preview, conditional logic, and file uploads. Validate skills and find the perfect fit for your team.",
                delay: 0.3,
                gradient: "from-green-500 to-emerald-500",
                bgGradient: "from-green-500/20 to-emerald-500/20",
                borderGradient: "from-green-500/50 to-emerald-500/50",
                features: ["Conditional question logic", "File upload support", "Real-time preview"],
                mockup: (
                  <div className="bg-gray-900/50 rounded-lg p-4 border border-green-500/30">
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 bg-green-500 rounded"></div>
                        <div className="text-white text-xs">Technical Skills Assessment</div>
                      </div>
                      <div className="space-y-1">
                        <div className="h-1.5 bg-green-500/30 rounded w-full"></div>
                        <div className="h-1.5 bg-green-500/30 rounded w-2/3"></div>
                        <div className="h-1.5 bg-green-500/30 rounded w-1/2"></div>
                      </div>
                      <div className="text-xs text-green-400">85% Complete</div>
                    </div>
                  </div>
                )
              }
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: feature.delay }}
                viewport={{ once: true }}
                className="group"
              >
                <Card className={`p-8 h-full bg-gradient-to-br ${feature.bgGradient} backdrop-blur-lg border-0 rounded-2xl shadow-2xl hover:shadow-purple-500/25 transition-all duration-300 group-hover:scale-105 relative overflow-hidden`}>
                  {/* Gradient border effect */}
                  <div className={`absolute inset-0 bg-gradient-to-r ${feature.borderGradient} rounded-2xl opacity-20 blur-sm`}></div>
                  <div className="relative z-10">
                    <div className={`flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-r ${feature.gradient} mb-6 shadow-lg`}>
                      <feature.icon className="h-8 w-8 text-white" />
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-4">
                      {feature.title}
                    </h3>
                    <p className="text-gray-300 leading-relaxed mb-6">
                      {feature.description}
                    </p>

                    {/* Feature list */}
                    <ul className="space-y-2 mb-6">
                      {feature.features.map((item, i) => (
                        <li key={i} className="flex items-center gap-2 text-sm text-gray-400">
                          <CheckCircle className="h-4 w-4 text-green-400 flex-shrink-0" />
                          {item}
                        </li>
                      ))}
                    </ul>

                    {/* Mini mockup */}
                    <div className="mt-6">
                      {feature.mockup}
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="relative z-20 py-24 px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">
              <span className="bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                Trusted by teams worldwide
              </span>
            </h2>
          </motion.div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { number: "10K+", label: "Companies", icon: Briefcase },
              { number: "500K+", label: "Candidates", icon: Users },
              { number: "95%", label: "Success Rate", icon: TrendingUp },
              { number: "24/7", label: "Support", icon: Shield }
            ].map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="text-center group"
              >
                <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-lg rounded-2xl p-6 border border-white/20 group-hover:border-purple-500/50 transition-all duration-300">
                  <stat.icon className="h-8 w-8 text-purple-400 mx-auto mb-4" />
                  <div className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent mb-2">
                    {stat.number}
                  </div>
                  <div className="text-gray-400 font-medium">{stat.label}</div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Demo Section */}
      <section id="demo" className="relative z-20 py-24 lg:py-32 px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/20 border border-blue-500/30 text-blue-300 text-sm font-medium mb-6">
              <Zap className="h-4 w-4" />
              See it in action
            </div>
            <h2 className="text-4xl lg:text-6xl font-bold tracking-tight mb-6">
              <span className="bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                Experience the platform
              </span>
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Watch how our platform transforms the hiring experience for both recruiters and candidates
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            viewport={{ once: true }}
            className="relative"
          >
            <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-lg rounded-3xl p-8 border border-white/20 shadow-2xl">
              {/* Large App Screenshot Mockup */}
              <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-6 shadow-inner">
                <div className="flex items-center gap-2 mb-6">
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <div className="ml-4 text-gray-400 text-sm">talent-flow.web</div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Jobs Panel */}
                  <div className="bg-purple-500/10 rounded-xl p-4 border border-purple-500/30">
                    <div className="flex items-center gap-2 mb-4">
                      <Briefcase className="h-5 w-5 text-purple-400" />
                      <div className="text-white font-medium">Active Jobs</div>
                    </div>
                    <div className="space-y-3">
                      {['Senior Developer', 'Product Manager', 'UX Designer'].map((job, i) => (
                        <div key={i} className="bg-gray-800/50 rounded-lg p-3 border border-gray-700">
                          <div className="text-white text-sm font-medium">{job}</div>
                          <div className="text-gray-400 text-xs">{Math.floor(Math.random() * 20) + 5} candidates</div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Pipeline Panel */}
                  <div className="bg-blue-500/10 rounded-xl p-4 border border-blue-500/30">
                    <div className="flex items-center gap-2 mb-4">
                      <Users className="h-5 w-5 text-blue-400" />
                      <div className="text-white font-medium">Pipeline</div>
                    </div>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-300 text-sm">Applied</span>
                        <span className="text-blue-400 font-medium">24</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-300 text-sm">Screening</span>
                        <span className="text-yellow-400 font-medium">12</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-300 text-sm">Interview</span>
                        <span className="text-orange-400 font-medium">8</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-300 text-sm">Offer</span>
                        <span className="text-green-400 font-medium">3</span>
                      </div>
                    </div>
                  </div>

                  {/* Assessment Panel */}
                  <div className="bg-green-500/10 rounded-xl p-4 border border-green-500/30">
                    <div className="flex items-center gap-2 mb-4">
                      <FileText className="h-5 w-5 text-green-400" />
                      <div className="text-white font-medium">Assessments</div>
                    </div>
                    <div className="space-y-3">
                      <div className="bg-gray-800/50 rounded-lg p-3 border border-gray-700">
                        <div className="text-white text-sm font-medium">Technical Skills</div>
                        <div className="w-full bg-gray-700 rounded-full h-2 mt-2">
                          <div className="bg-green-400 h-2 rounded-full" style={{ width: '85%' }}></div>
                        </div>
                        <div className="text-green-400 text-xs mt-1">85% avg score</div>
                      </div>
                      <div className="bg-gray-800/50 rounded-lg p-3 border border-gray-700">
                        <div className="text-white text-sm font-medium">Culture Fit</div>
                        <div className="w-full bg-gray-700 rounded-full h-2 mt-2">
                          <div className="bg-blue-400 h-2 rounded-full" style={{ width: '92%' }}></div>
                        </div>
                        <div className="text-blue-400 text-xs mt-1">92% avg score</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Floating action buttons */}
            <div className="absolute -top-6 -right-6 flex gap-4">
              <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg">
                <Star className="h-6 w-6 text-white" />
              </div>
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center shadow-lg">
                <Award className="h-6 w-6 text-white" />
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative z-20 py-24 lg:py-32 px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="mx-auto max-w-5xl"
        >
          <div className="relative overflow-hidden">
            <Card className="border-0 bg-gradient-to-br from-purple-500/20 via-pink-500/20 to-blue-500/20 backdrop-blur-lg rounded-3xl shadow-2xl">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-3xl blur-xl"></div>
              <div className="relative z-10 p-12 lg:p-16 text-center">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/20 border border-white/30 text-white text-sm font-medium mb-8">
                  <Clock className="h-4 w-4" />
                  Limited time offer
                </div>

                <h2 className="text-4xl lg:text-6xl font-bold tracking-tight mb-6">
                  <span className="bg-gradient-to-r from-white via-purple-200 to-pink-200 bg-clip-text text-transparent">
                    Ready to revolutionize
                  </span>
                  <br />
                  <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                    your hiring process?
                  </span>
                </h2>

                <p className="text-xl lg:text-2xl text-gray-300 mb-8 max-w-3xl mx-auto">
                  Join thousands of forward-thinking companies that trust TALENT FLOW
                  to find their next great hire. Start your free trial today.
                </p>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8">
                  <Button size="lg" asChild className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white border-none shadow-2xl text-lg px-10 py-4 rounded-xl">
                    <Link to="/app" className="flex items-center gap-2">
                      Start Free Trial
                      <ChevronRight className="h-5 w-5" />
                    </Link>
                  </Button>
                  <DemoDialog triggerLabel="Schedule Demo" />
                </div>

                <div className="flex flex-wrap items-center justify-center gap-8 text-sm text-gray-400">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-green-400" />
                    14-day free trial
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-green-400" />
                    No setup fees
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-green-400" />
                    Cancel anytime
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-green-400" />
                    24/7 support
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="relative z-20 border-t border-white/10 bg-black/20 backdrop-blur-md">
        <div className="mx-auto max-w-7xl px-6 py-12 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Brand */}
            <div className="lg:col-span-1">
              <div className="flex items-center space-x-2 mb-4">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-r from-purple-500 to-pink-500">
                  <Briefcase className="h-5 w-5 text-white" />
                </div>
                <span className="text-xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">TALENT FLOW</span>
              </div>
              <p className="text-gray-400 text-sm max-w-xs">
                The future of hiring is here. Transform your recruitment process with Smart insights and seamless collaboration.
              </p>
            </div>

            {/* Links */}
            <div className="lg:col-span-3 grid grid-cols-2 lg:grid-cols-3 gap-8">
              <div>
                <h3 className="text-white font-semibold mb-4">Product</h3>
                <ul className="space-y-2 text-sm text-gray-400">
                  <li><a href="#" className="hover:text-white transition-colors">Features</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">Pricing</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">Integrations</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">API</a></li>
                </ul>
              </div>
              <div>
                <h3 className="text-white font-semibold mb-4">Company</h3>
                <ul className="space-y-2 text-sm text-gray-400">
                  <li><a href="#" className="hover:text-white transition-colors">About</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">Careers</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
                </ul>
              </div>
              <div>
                <h3 className="text-white font-semibold mb-4">Support</h3>
                <ul className="space-y-2 text-sm text-gray-400">
                  <li><a href="#" className="hover:text-white transition-colors">Help Center</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">Documentation</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">Status</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">Privacy</a></li>
                </ul>
              </div>
            </div>
          </div>

          <div className="mt-12 pt-8 border-t border-white/10 flex flex-col lg:flex-row items-center justify-between">
            <p className="text-sm text-gray-400">
              © 2025 TALENT FLOW. All rights reserved. Built with ❤️ for modern hiring teams.
            </p>
            <div className="flex items-center gap-6 mt-4 lg:mt-0">
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <span className="sr-only">Twitter</span>
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M6.29 18.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0020 3.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.073 4.073 0 01.8 7.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 010 16.407a11.616 11.616 0 006.29 1.84" />
                </svg>
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <span className="sr-only">GitHub</span>
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 0C4.477 0 0 4.484 0 10.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0110 4.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.203 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.942.359.31.678.921.678 1.856 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0020 10.017C20 4.484 15.522 0 10 0z" clipRule="evenodd" />
                </svg>
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <span className="sr-only">LinkedIn</span>
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.338 16.338H13.67V12.16c0-.995-.017-2.277-1.387-2.277-1.39 0-1.601 1.086-1.601 2.207v4.248H8.014v-8.59h2.559v1.174h.037c.356-.675 1.227-1.387 2.526-1.387 2.703 0 3.203 1.778 3.203 4.092v4.711zM5.005 6.575a1.548 1.548 0 11-.003-3.096 1.548 1.548 0 01.003 3.096zm-1.337 9.763H6.34v-8.59H3.667v8.59zM17.668 1H2.328C1.595 1 1 1.581 1 2.298v15.403C1 18.418 1.595 19 2.328 19h15.34c.734 0 1.332-.582 1.332-1.299V2.298C19 1.581 18.402 1 17.668 1z" clipRule="evenodd" />
                </svg>
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}