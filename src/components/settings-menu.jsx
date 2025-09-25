import React from 'react'
import { Link } from 'react-router-dom'
import { Settings, Home, LayoutDashboard, Briefcase, Users, FileText } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator
} from '@/components/ui/dropdown-menu'

export function SettingsMenu() {
  const items = [
    { label: 'Home', to: '/', icon: Home },
    { label: 'Dashboard', to: '/app', icon: LayoutDashboard },
    { label: 'Jobs', to: '/app/jobs', icon: Briefcase },
    { label: 'Candidates', to: '/app/candidates', icon: Users },
    { label: 'Assessments', to: '/app/assessments', icon: FileText }
  ]

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          size="icon"
          className="bg-white/10 border border-white/20 text-white hover:bg-white/20 rounded-xl"
        >
          <Settings className="h-4 w-4" />
          <span className="sr-only">Open quick navigation</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-[12rem]">
        <DropdownMenuLabel>Quick Navigation</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {items.map(({ label, to, icon: Icon }) => (
          <DropdownMenuItem key={label} asChild>
            <Link to={to} className="flex items-center gap-2">
              <Icon className="h-4 w-4" />
              <span>{label}</span>
            </Link>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export default SettingsMenu


