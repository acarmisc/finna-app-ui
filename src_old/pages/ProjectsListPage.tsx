import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ProviderBadge } from '@/components/shared/provider-badge'
import { ProgressBar } from '@/components/shared/progress-bar'
import { money } from '@/components/shared/money'
import { Search, Plus } from 'lucide-react'

const PROJECTS = [
  {id:'p1', name:'production', slug:'production', provider:'azure', owner:'alice@acme.co', cost_center:'ENG-001', budget_cap:5000, mtd:3210.50, tags:['prod','critical']},
  {id:'p2', name:'staging',    slug:'staging',    provider:'gcp',   owner:'bob@acme.co',   cost_center:'ENG-002', budget_cap:2000, mtd:890.25,  tags:['staging']},
  {id:'p3', name:'ml-platform',slug:'ml-platform',provider:'llm',   owner:'carol@acme.co', cost_center:'ML-001',  budget_cap:1500, mtd:1240.00, tags:['ml','internal']},
  {id:'p4', name:'dev-sandbox',slug:'dev-sandbox',provider:'azure', owner:'dave@acme.co',  cost_center:'ENG-003', budget_cap:500,  mtd:145.00,  tags:['dev']},
]

export function ProjectsListPage() {
  const [q, setQ] = useState('')
  const rows = PROJECTS.filter(p =>
    !q || p.name.includes(q) || p.owner.includes(q) || p.tags.some(t=>t.includes(q))
  )

  return (
    <div className="page">
      <div className="page-head">
        <div>
          <h1>Projects</h1>
          <div className="sub">// {rows.length} projects · budgets aggregated monthly</div>
        </div>
        <div className="actions">
          <Button variant="default" size="sm">
            <Plus className="w-3 h-3"/>new project
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-3">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-2.5 top-2.5 w-3.5 h-3.5 text-muted-foreground"/>
              <Input
                className="pl-8 font-mono text-xs"
                placeholder="filter name / owner / tag…"
                value={q}
                onChange={e=>setQ(e.target.value)}
              />
            </div>
            <span className="font-mono text-[10px] text-muted-foreground uppercase tracking-widest">sorted by MTD desc</span>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-surface-alt">
                  <th className="text-left px-4 py-2 text-[10px] font-mono uppercase tracking-widest text-muted-foreground font-normal">Name</th>
                  <th className="text-left px-4 py-2 text-[10px] font-mono uppercase tracking-widest text-muted-foreground font-normal">Slug</th>
                  <th className="text-left px-4 py-2 text-[10px] font-mono uppercase tracking-widest text-muted-foreground font-normal">Owner</th>
                  <th className="text-left px-4 py-2 text-[10px] font-mono uppercase tracking-widest text-muted-foreground font-normal">Cost Center</th>
                  <th className="text-right px-4 py-2 text-[10px] font-mono uppercase tracking-widest text-muted-foreground font-normal">Budget Cap</th>
                  <th className="text-right px-4 py-2 text-[10px] font-mono uppercase tracking-widest text-muted-foreground font-normal">MTD</th>
                  <th className="text-left px-4 py-2 text-[10px] font-mono uppercase tracking-widest text-muted-foreground font-normal w-40">Budget Used</th>
                  <th className="text-left px-4 py-2 text-[10px] font-mono uppercase tracking-widest text-muted-foreground font-normal">Tags</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {[...rows].sort((a,b)=>b.mtd-a.mtd).map(p => {
                  const pct = (p.mtd/p.budget_cap)*100
                  return (
                    <tr key={p.id} className="hover:bg-surface-alt transition-colors cursor-pointer">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <ProviderBadge provider={p.provider}/>
                          <span className="font-medium text-foreground">{p.name}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{p.slug}</td>
                      <td className="px-4 py-3 text-sm text-foreground">{p.owner}</td>
                      <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{p.cost_center}</td>
                      <td className="px-4 py-3 text-right font-mono text-xs text-foreground tabular-nums">{money(p.budget_cap, 0)}</td>
                      <td className="px-4 py-3 text-right font-mono text-xs text-foreground tabular-nums">{money(p.mtd)}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="flex-1"><ProgressBar value={p.mtd} max={p.budget_cap}/></div>
                          <span className="font-mono text-[10px] tabular-nums w-8 text-right"
                            style={{color: pct>=90?'var(--danger)':pct>=70?'var(--warning)':'var(--fg-muted)'}}>
                            {pct.toFixed(0)}%
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-1 flex-wrap">
                          {p.tags.map(t => (
                            <span key={t} className="font-mono text-[10px] px-1.5 py-0.5 bg-surface-2 border border-border text-muted-foreground uppercase tracking-wider">{t}</span>
                          ))}
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default ProjectsListPage
