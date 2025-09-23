import { Outlet, Link, useLocation } from 'react-router-dom'
import React, { useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { ThemeToggle } from '@/components/theme-toggle'
import { Briefcase, Users, FileText, Home, Settings } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useThemeStore } from '@/stores/theme'

const navigation = [
  { name: 'Dashboard', href: '/app', icon: Home },
  { name: 'Jobs', href: '/app/jobs', icon: Briefcase },
  { name: 'Candidates', href: '/app/candidates', icon: Users },
  { name: "Assessment",href:'/app/assessments',icon:FileText}
]

export function AppLayout() {
  const location = useLocation()
  const { theme, initializeTheme } = useThemeStore()

  useEffect(() => {
    initializeTheme()
  }, [initializeTheme])

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 dark:from-black dark:via-slate-950 dark:to-black relative overflow-hidden">
      {/* Animated background blobs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-20 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob"></div>
        <div className="absolute top-40 right-20 w-96 h-96 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-20 left-40 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-4000"></div>
      </div>
      
      {/* Grid pattern overlay */}
      <div className="fixed inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none"></div>
      {/* Sidebar */}
      <div className="fixed inset-y-0 left-0 z-50 w-64 bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-lg border-r border-white/20 shadow-2xl">
        <div className="flex h-16 items-center px-6 border-b border-white/20">
          <Link to="/" className="flex items-center space-x-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 shadow-lg">
              <Briefcase className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">TALENT FLOW</span>
          </Link>
        </div>
        
        <nav className="mt-8 px-4">
          {navigation.map((item) => {
            const isActive = location.pathname === item.href || 
              (item.href !== '/app' && location.pathname.startsWith(item.href))
            
            return (
              <Link
                key={item.name}
                to={item.href}
                className={cn(
                  'flex items-center space-x-3 rounded-xl px-3 py-3 text-sm font-medium transition-all duration-200 mb-2 relative group',
                  isActive
                    ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg'
                    : 'text-gray-300 hover:bg-white/10 hover:text-white'
                )}
              >
                {React.createElement(item.icon, { 
                  className: cn(
                    "h-4 w-4 transition-colors",
                    isActive ? "text-white" : "text-gray-400 group-hover:text-white"
                  )
                })}
                <span>{item.name}</span>
                {isActive && (
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-600/20 to-pink-600/20 rounded-xl blur-xl"></div>
                )}
              </Link>
            )
          })}
        </nav>
      </div>

      {/* Main content */}
      <div className="ml-64 relative z-10">
        {/* Top bar */}
        <header className="flex h-16 items-center justify-between px-6 border-b border-white/20 bg-gradient-to-r from-white/10 to-white/5 backdrop-blur-lg shadow-2xl">
          <h1 className="text-lg font-semibold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
            {navigation.find(nav => location.pathname === nav.href || 
              (nav.href !== '/app' && location.pathname.startsWith(nav.href)))?.name || 'Dashboard'}
          </h1>
          
          <div className="flex items-center space-x-4">
            <ThemeToggle />
            <Button 
              variant="ghost" 
              size="icon"
              className="bg-white/10 border border-white/20 text-white hover:bg-white/20 rounded-xl"
            >
              <Settings className="h-4 w-4" />
            </Button>
          </div>
        </header>

        {/* Page content */}
        <main className="p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}