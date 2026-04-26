import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import { LayoutDashboard, FileText, TrendingUp, AlertTriangle, Settings, LogOut, Menu } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface SidebarProps {
  collapsed?: boolean
  onLogout?: () => void
}

const Sidebar: React.FC<SidebarProps> = ({ collapsed = false, onLogout }) => {
  const location = useLocation()

  const menuItems = [
    { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/projects', label: 'Projects', icon: FileText },
    { path: '/costs', label: 'Cost Explorer', icon: TrendingUp },
    { path: '/alerts', label: 'Alerts', icon: AlertTriangle },
    { path: '/configs', label: 'Configurations', icon: Settings },
  ]

  return (
    <aside
      className={cn(
        'bg-slate-900 border-r border-slate-800 flex flex-col transition-all duration-300',
        collapsed ? 'w-16' : 'w-64'
      )}
    >
      <div className="p-4 border-b border-slate-800 flex items-center gap-3 h-16">
        <div className={cn('flex items-center gap-2', collapsed ? 'justify-center' : '')}>
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
            <span className="text-white font-bold text-lg">F</span>
          </div>
          {!collapsed && <span className="text-white font-bold text-lg">FinOps Console</span>}
        </div>
      </div>

      <nav className="flex-1 py-4">
        <ul className="space-y-1 px-2">
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path
            return (
              <li key={item.path}>
                <Link
                  to={item.path}
                  className={cn(
                    'flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200 group',
                    isActive
                      ? 'bg-blue-600 text-white'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800'
                  )}
                >
                  <item.icon className="w-5 h-5 flex-shrink-0" />
                  {!collapsed && <span className="font-medium">{item.label}</span>}
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>

      {onLogout && (
        <div className="p-4 border-t border-slate-800">
          <button
            onClick={onLogout}
            className={cn(
              'flex items-center gap-3 px-3 py-2 w-full rounded-lg transition-colors',
              'text-slate-400 hover:text-red-400 hover:bg-slate-800/50'
            )}
          >
            <LogOut className="w-5 h-5" />
            {!collapsed && <span className="font-medium">Logout</span>}
          </button>
        </div>
      )}
    </aside>
  )
}

export default Sidebar
