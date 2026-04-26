import React, { useState, useEffect, useCallback, useMemo } from 'react'
import { Link, useLocation, Routes, Route, Navigate } from 'react-router-dom'
import { getApiClient } from './services/apiClient'
import { useCostTotals, useDailyCosts, useAlertStats, useProjects, useCosts, useAlerts, useConnections } from './hooks/useData'

function Sidebar({ onLogout }: { onLogout: () => void }) {
  const location = useLocation()
  const items = [
    { path: '/dashboard', label: 'Dashboard', icon: '📊' },
    { path: '/costs', label: 'Costs', icon: '💰' },
    { path: '/alerts', label: 'Alerts', icon: '🚨' },
    { path: '/config', label: 'Config', icon: '⚙️' },
  ]
  return (
    <nav className="w-64 bg-slate-900 min-h-screen p-6 flex flex-col gap-6 text-white border-r border-slate-800">
      <h1 className="text-xl font-bold tracking-tight text-white">FinOps Console</h1>
      <ul className="flex flex-col gap-2">
        {items.map(item => (
          <li key={item.path}>
            <Link to={item.path} className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${location.pathname === item.path ? 'bg-slate-700 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}>
              <span>{item.icon}</span>
              <span className="font-medium">{item.label}</span>
            </Link>
          </li>
        ))}
      </ul>
      <div className="mt-auto">
        <button onClick={onLogout} className="flex items-center gap-3 px-3 py-2 text-slate-400 hover:text-white transition-colors cursor-pointer">
          <span>🚪</span>
          <span>Logout</span>
        </button>
      </div>
    </nav>
  )
}

function MiniBarChart({ data, color }: { data: number[]; color: string }) {
  const max = Math.max(...data, 1)
  return (
    <div className="flex items-end gap-1 h-16">
      {data.map((v, i) => (
        <div key={i} className="flex-1 rounded-sm transition-all" style={{ width: `${v / (max || 1) * 100}%`, background: color }} />
      ))}
    </div>
  )
}

export function Dashboard() {
  const { data: totals } = useCostTotals()
  const { data: daily } = useDailyCosts()
  const { data: alertStats } = useAlertStats()
  const { data: projects } = useProjects()

  const dailyAzure = useMemo(() => (daily?.days || []).map((d: any) => d.azure || 0).reverse(), [daily])
  const dailyGcp = useMemo(() => (daily?.days || []).map((d: any) => d.gcp || 0).reverse(), [daily])
  const dailyLlm = useMemo(() => (daily?.days || []).map((d: any) => d.llm || 0).reverse(), [daily])

  const totalCost = useMemo(() => Object.entries(totals?.totals || {}).reduce((acc, [, val]) => acc + (val as number), 0), [totals])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Dashboard</h1>
        <span className="text-slate-400 text-sm">Last 30 days</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card title="Total Cost" value={`$${totalCost.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`} color="#2563eb" />
        <Card title="Providers" value={Object.keys(totals?.totals || {}).length.toString()} color="#059669" />
        <Card title="Active Alerts" value={(alertStats?.pending || 0).toString()} color="#dc2626" />
        <Card title="Projects" value={(projects?.length || 0).toString()} color="#7c3aed" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-slate-800 rounded-xl p-4 border border-slate-700">
          <h3 className="text-sm font-semibold text-slate-300 mb-3">Cost by Provider</h3>
          <div className="space-y-3">
            {Object.entries(totals?.totals || {} as Record<string, number>).map(([prov, val]) => (
              <div key={prov} className="flex items-center gap-3">
                <span className="w-16 text-xs font-medium uppercase text-slate-400">{prov}</span>
                <div className="flex-1 h-2 bg-slate-700 rounded-full overflow-hidden">
                  <div className="h-full rounded-full transition-all" style={{ width: `${(val as number) / (totalCost || 1) * 100}%`, background: prov === 'azure' ? '#2563eb' : prov === 'gcp' ? '#059669' : '#dc2626' }} />
                </div>
                <span className="w-20 text-right text-sm text-white font-medium">${(val as number).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-slate-800 rounded-xl p-4 border border-slate-700">
          <h3 className="text-sm font-semibold text-slate-300 mb-3">Daily Trend</h3>
          <div className="space-y-2">
            {dailyAzure.length > 0 && <MiniBarChart data={dailyAzure} color="#2563eb" />}
            {dailyGcp.length > 0 && <MiniBarChart data={dailyGcp} color="#059669" />}
            {dailyLlm.length > 0 && <MiniBarChart data={dailyLlm} color="#dc2626" />}
          </div>
          <div className="flex gap-4 mt-2 text-xs text-slate-400">
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-blue-500 inline-block" /> Azure</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-green-500 inline-block" /> GCP</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-500 inline-block" /> LLM</span>
          </div>
        </div>
      </div>

      <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
        <div className="px-4 py-3 border-b border-slate-700 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-slate-300">Projects</h3>
        </div>
        <div className="divide-y divide-slate-700">
          {(projects || []).map((p: any) => (
            <div key={p.id} className="px-4 py-3 flex items-center justify-between hover:bg-slate-750 transition-colors">
              <div>
                <div className="text-sm font-medium text-white">{p.name}</div>
                <div className="text-xs text-slate-400">{p.owner} · {p.cost_center}</div>
              </div>
              <div className="text-right">
                <div className="text-sm font-medium text-white">${(p.mtd ?? 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                <div className="text-xs text-slate-400">of ${(p.budget_cap ?? 0).toLocaleString()}</div>
              </div>
            </div>
          ))}
          {!projects?.length && <div className="px-4 py-6 text-center text-slate-500 text-sm">No projects found</div>}
        </div>
      </div>
    </div>
  )
}

function Card({ title, value, color }: { title: string; value: string; color: string }) {
  return (
    <div className="bg-slate-800 rounded-xl p-4 border border-slate-700">
      <div className="text-xs font-medium text-slate-400 uppercase tracking-wide mb-1">{title}</div>
      <div className="text-2xl font-bold" style={{ color }}>{value}</div>
    </div>
  )
}

export function Costs() {
  const { data, loading, refresh } = useCosts()
  const [filterProvider, setFilterProvider] = useState('')
  const summary = data?.totals || {}

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Costs</h1>
        <div className="flex gap-2">
          <select value={filterProvider} onChange={e => setFilterProvider(e.target.value)} className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-slate-500">
            <option value="">All Providers</option>
            <option value="azure">Azure</option>
            <option value="gcp">GCP</option>
            <option value="llm">LLM</option>
          </select>
          <button onClick={refresh} className="bg-slate-700 hover:bg-slate-600 text-white px-3 py-2 rounded-lg text-sm transition-colors cursor-pointer">Refresh</button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {Object.entries(summary).map(([prov, val]: [string, any]) => (
          <div key={prov} className="bg-slate-800 rounded-xl p-4 border border-slate-700">
            <div className="text-xs font-medium text-slate-400 uppercase">{prov}</div>
            <div className="text-xl font-bold text-white mt-1">${(val as number).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
          </div>
        ))}
      </div>

      <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-700/50 text-slate-300">
            <tr>
              <th className="px-4 py-3 font-medium">Provider</th>
              <th className="px-4 py-3 font-medium">Project</th>
              <th className="px-4 py-3 font-medium">SKU</th>
              <th className="px-4 py-3 font-medium text-right">Cost</th>
              <th className="px-4 py-3 font-medium">Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-700">
            {loading ? (
              <tr><td colSpan={5} className="px-4 py-6 text-center text-slate-500">Loading...</td></tr>
            ) : (
              (data?.costs || []).slice(0, 100).map((c: any, i: number) => (
                <tr key={i} className="hover:bg-slate-750 transition-colors">
                  <td className="px-4 py-3 text-white capitalize">{c.prov}</td>
                  <td className="px-4 py-3 text-slate-300">{c.name}</td>
                  <td className="px-4 py-3 text-slate-300">{c.sku}</td>
                  <td className="px-4 py-3 text-right text-white font-medium">${(c.mtd ?? 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                  <td className="px-4 py-3 text-slate-400">{c.date?.slice(0, 10)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export function Alerts() {
  const { data, loading, refreshing, refresh } = useAlerts()
  const [ackLoading, setAckLoading] = useState<string | null>(null)

  const handleAck = async (id: string) => {
    setAckLoading(id)
    const client = getApiClient()
    await client.acknowledgeAlert(id)
    setAckLoading(null)
    refresh()
  }

  const alertsList = data?.alerts || []

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Alerts</h1>
        <button onClick={refresh} disabled={refreshing} className="bg-slate-700 hover:bg-slate-600 text-white px-3 py-2 rounded-lg text-sm transition-colors disabled:opacity-50 cursor-pointer">
          {refreshing ? 'Refreshing...' : 'Refresh'}
        </button>
      </div>

      <div className="flex gap-3">
        <Badge label={`Total: ${data?.count || 0}`} color="slate" />
        <Badge label={`Firing: ${alertsList.filter((a: any) => !a.is_acknowledged).length}`} color="red" />
        <Badge label={`Resolved: ${alertsList.filter((a: any) => a.is_acknowledged).length}`} color="green" />
      </div>

      <div className="space-y-3">
        {loading ? (
          <div className="text-slate-400 text-center py-8">Loading...</div>
        ) : (
          alertsList.map((alert: any) => (
            <div key={alert.id} className={`bg-slate-800 rounded-xl p-4 border transition-colors ${alert.severity === 'err' ? 'border-red-900/50' : alert.severity === 'warn' ? 'border-amber-900/50' : 'border-slate-700'}`}>
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`text-xs font-bold uppercase px-2 py-0.5 rounded ${severityStyle(alert.severity)}`}>
                      {alert.severity}
                    </span>
                    {alert.is_acknowledged && <span className="text-xs text-slate-500">· Resolved</span>}
                  </div>
                  <h3 className="text-sm font-semibold text-white">{alert.title}</h3>
                  <p className="text-sm text-slate-400 mt-1">{alert.description}</p>
                </div>
                {!alert.is_acknowledged && (
                  <button
                    onClick={() => handleAck(alert.id)}
                    disabled={ackLoading === alert.id}
                    className="shrink-0 bg-slate-700 hover:bg-slate-600 text-white px-3 py-1.5 rounded-lg text-xs transition-colors disabled:opacity-50 cursor-pointer"
                  >
                    {ackLoading === alert.id ? '...' : 'Ack'}
                  </button>
                )}
              </div>
            </div>
          ))
        )}
        {!loading && alertsList.length === 0 && (
          <div className="text-center py-8 text-slate-500">No alerts found</div>
        )}
      </div>
    </div>
  )
}

function severityStyle(sev: string) {
  if (sev === 'err') return 'bg-red-500/20 text-red-300'
  if (sev === 'warn') return 'bg-amber-500/20 text-amber-300'
  return 'bg-green-500/20 text-green-300'
}

function Badge({ label, color }: { label: string; color: string }) {
  const colors: Record<string, string> = {
    slate: 'bg-slate-700 text-slate-300',
    red: 'bg-red-500/20 text-red-300',
    green: 'bg-green-500/20 text-green-300',
  }
  return <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${colors[color] || colors.slate}`}>{label}</span>
}

export function Config() {
  const { data: connections, loading: connsLoading } = useConnections()
  const { data: projects, loading: projLoading } = useProjects()

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-white">Configuration</h1>

      <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
        <div className="px-4 py-3 border-b border-slate-700 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-slate-300">Cloud Connections</h3>
          <span className="text-xs text-slate-500">{connections?.length || 0} items</span>
        </div>
        <div className="divide-y divide-slate-700">
          {connsLoading ? (
            <div className="px-4 py-6 text-center text-slate-500 text-sm">Loading...</div>
          ) : (
            (connections || []).map((c: any) => (
              <div key={c.id} className="px-4 py-3 flex items-center justify-between hover:bg-slate-750 transition-colors">
                <div>
                  <div className="text-sm font-medium text-white">{c.name}</div>
                  <div className="text-xs text-slate-400">{c.provider} · {c.credential_type}</div>
                </div>
                <span className={`text-xs font-medium px-2 py-0.5 rounded ${c.provider === 'azure' ? 'bg-blue-500/20 text-blue-300' : c.provider === 'gcp' ? 'bg-green-500/20 text-green-300' : 'bg-purple-500/20 text-purple-300'}`}>
                  {c.provider}
                </span>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
        <div className="px-4 py-3 border-b border-slate-700 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-slate-300">Projects</h3>
          <span className="text-xs text-slate-500">{projects?.length || 0} items</span>
        </div>
        <div className="divide-y divide-slate-700">
          {projLoading ? (
            <div className="px-4 py-6 text-center text-slate-500 text-sm">Loading...</div>
          ) : (
            (projects || []).map((p: any) => (
              <div key={p.id} className="px-4 py-3 flex items-center justify-between hover:bg-slate-750 transition-colors">
                <div>
                  <div className="text-sm font-medium text-white">{p.name}</div>
                  <div className="text-xs text-slate-400">{p.owner} · {p.cost_center}</div>
                </div>
                <div className="text-right">
                  <div className="text-sm text-white font-medium">${(p.mtd ?? 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
                  <div className="text-xs text-slate-500">of ${(p.budget_cap ?? 0).toLocaleString()}</div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}

export default function App({ onLogout }: { onLogout: () => void }) {
  return (
    <div className="flex min-h-screen bg-slate-950">
      <Sidebar onLogout={onLogout} />
      <main className="flex-1 p-6 overflow-auto">
        <Routes>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/costs" element={<Costs />} />
          <Route path="/alerts" element={<Alerts />} />
          <Route path="/config" element={<Config />} />
          <Route path="/" element={<Navigate to="/dashboard" />} />
        </Routes>
      </main>
    </div>
  )
}
