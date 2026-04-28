import React, { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { ProviderBadge } from '@/components/shared/provider-badge'
import { ProgressBar } from '@/components/shared/progress-bar'
import { StatusBadge } from '@/components/shared/status-badge'
import CostDeltaCell from '@/components/shared/cost-delta-cell'
import { money } from '@/components/shared/money'
import { ArrowLeft, Edit3, Trash2 } from 'lucide-react'

const PROJECTS = [
  {id:'p1', name:'production', slug:'production', provider:'azure', owner:'alice@acme.co', cost_center:'ENG-001', budget_cap:5000, mtd:3210.50, tags:['prod','critical']},
  {id:'p2', name:'staging',    slug:'staging',    provider:'gcp',   owner:'bob@acme.co',   cost_center:'ENG-002', budget_cap:2000, mtd:890.25,  tags:['staging']},
  {id:'p3', name:'ml-platform',slug:'ml-platform',provider:'llm',   owner:'carol@acme.co', cost_center:'ML-001',  budget_cap:1500, mtd:1240.00, tags:['ml','internal']},
  {id:'p4', name:'dev-sandbox',slug:'dev-sandbox',provider:'azure', owner:'dave@acme.co',  cost_center:'ENG-003', budget_cap:500,  mtd:145.00,  tags:['dev']},
]

const COST_SKUS: Record<string,Array<{sku:string,mtd:number,prev:number,delta:number}>> = {
  'production': [
    {sku:'Virtual Machines', mtd:1820.00, prev:1540.00, delta:18.2},
    {sku:'Blob Storage',      mtd:640.50,  prev:580.00,  delta:10.4},
    {sku:'SQL Database',      mtd:450.00,  prev:420.00,  delta:7.1},
    {sku:'AKS Cluster',       mtd:300.00,  prev:280.00,  delta:7.1},
  ],
  'staging': [
    {sku:'Compute Engine',   mtd:520.00,  prev:480.00,  delta:8.3},
    {sku:'Cloud Storage',    mtd:210.25,  prev:195.00,  delta:7.8},
    {sku:'BigQuery',         mtd:160.00,  prev:140.00,  delta:14.3},
  ],
  'ml-platform': [
    {sku:'Claude API',       mtd:780.00,  prev:620.00,  delta:25.8},
    {sku:'GPT-4o',           mtd:320.00,  prev:280.00,  delta:14.3},
    {sku:'Embeddings',       mtd:140.00,  prev:110.00,  delta:27.3},
  ],
  'dev-sandbox': [
    {sku:'VM Instances',     mtd:95.00,   prev:90.00,   delta:5.6},
    {sku:'Cloud Storage',    mtd:50.00,   prev:45.00,   delta:11.1},
  ],
}

export function ProjectDetailPage() {
  const { slug } = useParams<{slug:string}>()
  const p = PROJECTS.find(x => x.slug === slug)
  const [note, setNote] = useState('')

  if (!p) {
    return (
      <div className="page">
        <div className="page-head">
          <h1>Project not found</h1>
        </div>
        <Card>
          <CardContent className="pt-6 text-center text-muted-foreground">
            no project matches slug "{slug}"
          </CardContent>
        </Card>
      </div>
    )
  }

  const pct = (p.mtd/p.budget_cap)*100
  const skus = COST_SKUS[slug!] || []

  return (
    <div className="page">
      <div className="page-head">
        <div>
          <Link to="/projects" className="font-mono text-[11px] text-muted-foreground hover:text-foreground mb-1 inline-block">
            ← projects
          </Link>
          <h1 className="flex items-center gap-2">
            <ProviderBadge provider={p.provider} size="lg"/>
            {p.name}
          </h1>
          <div className="flex gap-4 mt-1 text-[11px] font-mono text-muted-foreground">
            <span>owner · <b className="text-foreground">{p.owner}</b></span>
            <span>cost_center · <b className="text-foreground">{p.cost_center}</b></span>
            <span>slug · <b className="text-foreground">{p.slug}</b></span>
          </div>
        </div>
        <div className="actions">
          <Button variant="outline" size="sm"><Edit3 className="w-3 h-3"/>edit</Button>
          <Button variant="destructive" size="sm"><Trash2 className="w-3 h-3"/>delete</Button>
        </div>
      </div>

      <div className="row" style={{gridTemplateColumns:'1fr 340px', gap:16, marginBottom:16}}>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-mono uppercase tracking-widest text-muted-foreground">
              Monthly budget · Apr 2026
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between items-start mb-4">
              <div>
                <div className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground mb-1">MTD</div>
                <div className="text-3xl font-mono font-semibold text-foreground tabular-nums">
                  {money(p.mtd)}<span className="text-sm text-muted-foreground ml-1">USD</span>
                </div>
              </div>
              <div className="text-right">
                <div className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground mb-1">cap</div>
                <div className="text-xl font-mono text-muted-foreground tabular-nums">{money(p.budget_cap,0)}</div>
              </div>
            </div>
            <ProgressBar value={p.mtd} max={p.budget_cap} stepped segments={20}/>
            <div className="flex justify-between mt-2">
              <span className="font-mono text-[10px] text-muted-foreground">{pct.toFixed(1)}% utilized</span>
              <span className="font-mono text-[10px]"
                style={{color: pct>=90?'var(--danger)':pct>=70?'var(--warning)':'var(--accent)'}}>
                {pct>=90?'OVER THRESHOLD':pct>=70?'NEAR CAP':'HEALTHY'}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-mono uppercase tracking-widest text-muted-foreground">
              Notes <span className="text-[10px] text-muted-foreground normal-case tracking-normal">// editable</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              className="font-mono text-xs mb-2"
              rows={4}
              value={note}
              onChange={e=>setNote(e.target.value)}
              placeholder="// operator notes…"
            />
            <div className="flex justify-end">
              <Button size="sm" variant="default">save</Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-xs font-mono uppercase tracking-widest text-muted-foreground">
            Cost breakdown · SKU
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-surface-alt">
                  <th className="text-left px-4 py-2 text-[10px] font-mono uppercase tracking-widest text-muted-foreground font-normal">SKU</th>
                  <th className="text-right px-4 py-2 text-[10px] font-mono uppercase tracking-widest text-muted-foreground font-normal">MTD</th>
                  <th className="text-right px-4 py-2 text-[10px] font-mono uppercase tracking-widest text-muted-foreground font-normal">Previous</th>
                  <th className="text-right px-4 py-2 text-[10px] font-mono uppercase tracking-widest text-muted-foreground font-normal">Δ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {skus.map(c => (
                  <tr key={c.sku} className="hover:bg-surface-alt transition-colors">
                    <td className="px-4 py-2 font-mono text-xs text-foreground">{c.sku}</td>
                    <td className="px-4 py-2 text-right font-mono text-xs text-foreground tabular-nums">{money(c.mtd)}</td>
                    <td className="px-4 py-2 text-right font-mono text-xs text-muted-foreground tabular-nums">{money(c.prev)}</td>
                    <td className="px-4 py-2 text-right"><CostDeltaCell value={c.delta}/></td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t border-border font-semibold">
                  <td className="px-4 py-2 text-sm">Total</td>
                  <td className="px-4 py-2 text-right font-mono text-xs text-foreground tabular-nums">{money(skus.reduce((s,c)=>s+c.mtd,0))}</td>
                  <td className="px-4 py-2 text-right font-mono text-xs text-muted-foreground tabular-nums">{money(skus.reduce((s,c)=>s+c.prev,0))}</td>
                  <td></td>
                </tr>
              </tfoot>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default ProjectDetailPage
