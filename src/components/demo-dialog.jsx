import React from 'react'
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Briefcase, Users, FileText, Home as HomeIcon, LayoutDashboard } from 'lucide-react'

function RoutePreview({ path }) {
  // Base viewport representing a typical page; we scale it down for a screenshot-like preview
  const baseWidth = 1280
  const baseHeight = 800
  const scale = 0.55

  return (
    <div className="w-full rounded-xl border border-white/20 bg-black/30 overflow-hidden">
      <div className="relative" style={{ height: baseHeight * scale + 'px' }}>
        <iframe
          title={`preview-${path}`}
          src={path}
          style={{
            width: baseWidth + 'px',
            height: baseHeight + 'px',
            transform: `scale(${scale})`,
            transformOrigin: 'top left',
            pointerEvents: 'none',
            border: '0',
          }}
          className="absolute top-0 left-0 bg-black"
        />
      </div>
    </div>
  )
}

export function DemoDialog({ triggerLabel }) {
  const sections = [
    { key: 'home', title: 'Home', icon: HomeIcon, content: <RoutePreview path="/" /> },
    { key: 'dashboard', title: 'Dashboard', icon: LayoutDashboard, content: <RoutePreview path="/app" /> },
    { key: 'jobs', title: 'Jobs', icon: Briefcase, content: <RoutePreview path="/app/jobs" /> },
    { key: 'candidates', title: 'Candidates', icon: Users, content: <RoutePreview path="/app/candidates" /> },
    { key: 'assessments', title: 'Assessments', icon: FileText, content: <RoutePreview path="/app/assessments" /> }
  ]

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant={triggerLabel === 'Watch Demo' ? 'outline' : 'default'} size="lg" className={triggerLabel === 'Watch Demo' ? 'border-gray-600 text-gray-300 hover:bg-white/10 hover:text-white text-lg px-8 py-4 rounded-xl' : 'bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white border-none shadow-2xl text-lg px-8 py-4 rounded-xl'}>
          {triggerLabel}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl bg-gradient-to-br from-white/10 to-white/5 text-white border border-white/20">
        <DialogHeader>
          <DialogTitle>Demo</DialogTitle>
        </DialogHeader>
        <div className="max-h-[70vh] overflow-y-auto pr-1 space-y-6">
          {sections.map(({ key, title, icon: Icon, content }) => (
            <div key={key} className="space-y-3">
              <div className="flex items-center gap-2">
                <Icon className="h-4 w-4 text-purple-300" />
                <div className="text-sm font-medium text-gray-200">{title}</div>
              </div>
              {content}
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default DemoDialog


