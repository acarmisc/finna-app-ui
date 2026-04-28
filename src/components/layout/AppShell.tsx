import React, { useState } from 'react'
import Sidebar from './Sidebar'
import TopBar from './TopBar'

export interface AppShellProps {
  children: React.ReactNode | ((route: RouteState, ctx: { range: string; customRange: { start: string; end: string } | null }) => React.ReactNode)
  title?: string
  collapsed?: boolean
  onToggleSidebar?: () => void
  onLogout?: () => void
}

interface RouteState {
  path: string
  base: string
  sub: string | null
  parts: string[]
  qs: URLSearchParams
}

function useHashRoute(): RouteState {
  const [route, setRoute] = useState<RouteState>(() => parseHash())

  React.useEffect(() => {
    const onChange = () => setRoute(parseHash())
    window.addEventListener('hashchange', onChange)
    return () => window.removeEventListener('hashchange', onChange)
  }, [])

  return route
}

function parseHash(): RouteState {
  const raw = window.location.hash.replace(/^#/, '') || '/dashboard'
  const [path, query = ''] = raw.split('?')
  const parts = path.split('/').filter(Boolean)
  const base = '/' + (parts[0] || 'dashboard')
  const sub = parts[1] || null
  const qs = new URLSearchParams(query)
  return { path, base, sub, parts, qs }
}

const AppShell: React.FC<AppShellProps> = ({
  children,
  title = 'FinOps Console',
  collapsed: initialCollapsed = false,
  onToggleSidebar,
  onLogout,
}) => {
  const route = useHashRoute()
  const [collapsed, setCollapsed] = useState(initialCollapsed)
  const [range, setRange] = useState('mtd')
  const [customRange, setCustomRange] = useState<{ start: string; end: string } | null>(null)
  const [theme, setTheme] = useState<'dark' | 'light'>('dark')

  // Expose range to window for child components
  ;(window as any).__finnaRange = range
  ;(window as any).__finnaCustomRange = customRange

  const handleToggle = onToggleSidebar || (() => { setCollapsed((v: boolean) => !v) })

  return (
    <div className={`app ${collapsed ? 'collapsed' : ''}`}>
      <Sidebar
        collapsed={collapsed}
        onToggle={handleToggle}
        activeBase={route.base}
        onLogout={onLogout}
      />
      <TopBar
        route={route}
        theme={theme}
        setTheme={setTheme}
        range={range}
        setRange={setRange}
        customRange={customRange}
        setCustomRange={setCustomRange}
      />
      <main className="main">
        {typeof children === 'function'
          ? children(route, { range, customRange })
          : children}
      </main>
    </div>
  )
}

export { useHashRoute }
export default AppShell
