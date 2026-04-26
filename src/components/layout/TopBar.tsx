import React from 'react'
import { Settings, Bell, User, Menu } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface TopBarProps {
  title: string
  onToggleSidebar?: () => void
  showNotifications?: boolean
  onNotificationsClick?: () => void
  user?: { name: string; email: string; avatar?: string }
}

const TopBar: React.FC<TopBarProps> = ({
  title,
  onToggleSidebar,
  showNotifications = true,
  onNotificationsClick,
  user,
}) => {
  return (
    <header className="h-16 bg-slate-950 border-b border-slate-800 flex items-center justify-between px-6 sticky top-0 z-20">
      <div className="flex items-center gap-4">
        {onToggleSidebar && (
          <button
            onClick={onToggleSidebar}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
          >
            <Menu className="w-5 h-5" />
          </button>
        )}
        <h1 className="text-xl font-semibold text-white">{title}</h1>
      </div>

      <div className="flex items-center gap-3">
        {showNotifications && onNotificationsClick && (
          <button
            onClick={onNotificationsClick}
            className="relative p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
          >
            <Bell className="w-5 h-5" />
            <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full" />
          </button>
        )}

        <button
          className="flex items-center gap-3 p-1 pr-3 rounded-lg hover:bg-slate-800 transition-colors"
          onClick={() => console.log('User menu')}
        >
          <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-medium">
            {user?.name?.[0]?.toUpperCase() || 'U'}
          </div>
          <div className="hidden md:flex flex-col items-start text-left">
            <span className="text-sm font-medium text-white">{user?.name || 'User'}</span>
            <span className="text-xs text-slate-400">{user?.email || 'user@example.com'}</span>
          </div>
        </button>
      </div>
    </header>
  )
}

export default TopBar
