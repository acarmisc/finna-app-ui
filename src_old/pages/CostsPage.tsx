import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { StackedAreaChart } from '@/components/shared/stacked-area-chart'
import { ProviderBadge } from '@/components/shared/provider-badge'
import CostDeltaCell from '@/components/shared/cost-delta-cell'
import { money } from '@/components/shared/money'
import { Download, Filter } from 'lucide-react'

const COSTS = [
  {id:'c1', prov:'azure', name:'production',    sku:'Virtual Machines', mtd:1820.00, prev:1540.00, delta:18.2},
  {id:'c2', prov:'azure', name:'production',    sku:'Blob Storage',      mtd:640.50,  prev:580.00,  delta:10.4},
  {id:'c3', prov:'azure', name:'production',    sku:'SQL Database',      mtd:450.00,  prev:420.00,  delta:7.1},
  {id:'c4', prov:'gcp',   name:'staging',       sku:'Compute Engine',    mtd:520.00,  prev:480.00,  delta:8.3},
  {id:'c5', prov:'gcp',   name:'staging',       sku:'BigQuery',          mtd:160.00,  prev:140.00,  delta:14.3},
  {id:'c6', prov:'llm',   name:'ml-platform',   sku:'Claude API',        mtd:780.00,  prev:620.00,  delta:25.8},
  {id:'c7', prov:'llm',   name:'ml-platform',   sku:'GPT-4o',            mtd:320.00,  prev:280.00,  delta:14.3},
  {id:'c8', prov:'llm',   name:'ml-platform',   sku:'Embeddings',        mtd:140.00,  prev:110.00,  delta:27.3},
  {id:'c9', prov:'azure', name:'dev-sandbox',   sku:'VM Instances',      mtd:95.00,   prev:90.00,   delta:5.6},
  {id:'c10',prov:'gcp',   name:'staging',        sku:'Cloud Storage',     mtd:210.25,  prev:195.00,  delta:7.8},
]

const DAILY = {
  azure: [
    {label:'Apr 1',value:38},{label:'Apr 3',value:42},{label:'Apr 5',value:41},
    {label:'Apr 7',value:45},{label:'Apr 9',value:52},{label:'Apr 11',value:48},
    {label:'Apr 13',value:55},{label:'Apr 15',value:50},{label:'Apr 17',value:58},
    {label:'Apr 19',value:54},{label:'Apr 21',value:62},{label:'Apr 23',value:60},
  ],
  gcp: [
    {label:'Apr 1',value:22},{label:'Apr 3',value:25},{label:'Apr 5',value:24},
    {label:'Apr 7',value:28},{label:'Apr 9',value:30},{label:'Apr 11',value:27},
    {label:'Apr 13',value:32},{label:'Apr 15',value:29},{label:'Apr 17',value:35},
    {label:'Apr 19',value:33},{label:'Apr 21',value:38},{label:'Apr 23',value:36},
  ],
  llm: [
    {label:'Apr 1',value:12},{label:'Apr 3',value:14},{label:'Apr 5',value:13},
    {label:'Apr 7',value:16},{label:'Apr 9',value:18},{label:'Apr 11',value:15},
    {label:'Apr 13',value:20},{label:'Apr 15',value:17},{label:'Apr 17',value:22},
    {label:'Apr 19',value:19},{label:'Apr 21',value:24},{label:'Apr 23',value:21},
  ],
}

export function CostsPage() {
  const [tab, setTab] = useState('overview')
  const [providers, setProviders] = useState({azure:true, gcp:true, llm:true})
  const [sku, setSku] = useState('')
  const [applied, setApplied] = useState({providers:{azure:true,gcp:true,llm:true}, sku:''})

  const apply = () => setApplied({providers:{...providers}, sku})
  const reset = () => {
    setProviders({azure:true,gcp:true,llm:true})
    setSku('')
    setApplied({providers:{azure:true,gcp:true,llm:true}, sku:''})
  }

  const filtered = COSTS.filter(c =>
    applied.providers[c.prov as keyof typeof applied.providers] &&
    (!applied.sku || c.sku.toLowerCase().includes(applied.sku.toLowerCase()))
  )

  // By-SKU grouping
  const grouped: Record<string, {sku:string,count:number,mtd:number,prev:number,providers:Set<string>}> = {}
  filtered.forEach(c => {
    if (!grouped[c.sku]) grouped[c.sku] = {sku:c.sku, count:0, mtd:0, prev:0, providers:new Set()}
    grouped[c.sku].count++
    grouped[c.sku].mtd += c.mtd
    grouped[c.sku].prev += c.prev
    grouped[c.sku].providers.add(c.prov)
  })
  const bySku = Object.values(grouped).sort((a,b)=>b.mtd-a.mtd)

  const grand = filtered.reduce((s,c)=>s+c.mtd, 0)
  const grandPrev = filtered.reduce((s,c)=>s+c.prev, 0)

  const dailySeries = []
  if (applied.providers.azure) dailySeries.push({name:'Azure', color:'var(--azure)', data:DAILY.azure})
  if (applied.providers.gcp) dailySeries.push({name:'GCP', color:'var(--gcp)', data:DAILY.gcp})
  if (applied.providers.llm) dailySeries.push({name:'LLM', color:'var(--llm)', data:DAILY.llm})

  return (
    <div className="page">
      <div className="page-head">
        <div>
          <h1>Cost explorer</h1>
          <div className="sub">// {filtered.length} records · normalized USD · cost_records</div>
        </div>
        <div className="actions">
          <Button variant="outline" size="sm"><Filter className="w-3 h-3"/>add filter</Button>
          <Button variant="default" size="sm"><Download className="w-3 h-3"/>export csv</Button>
        </div>
      </div>

      {/* Filters */}
      <Card style={{marginBottom:16}}>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-xs font-mono uppercase tracking-widest text-muted-foreground">Filters</CardTitle>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" onClick={reset}>reset</Button>
              <Button size="sm" variant="default" onClick={apply}>apply filters</Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-6">
            {/* Providers */}
            <div>
              <div className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground mb-2">providers</div>
              <div className="flex flex-col gap-2">
                {(['azure','gcp','llm'] as const).map(p => (
                  <label key={p} className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={providers[p]} onChange={e=>setProviders(s=>({...s,[p]:e.target.checked}))}
                      className="w-3.5 h-3.5 accent-primary"/>
                    <ProviderBadge provider={p}/>
                    <span className="font-mono text-xs uppercase">{p}</span>
                  </label>
                ))}
              </div>
            </div>
            {/* SKU search */}
            <div>
              <div className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground mb-2">SKU search</div>
              <Input className="font-mono text-xs w-48" placeholder="e.g. BigQuery, VM…" value={sku} onChange={e=>setSku(e.target.value)}/>
              <div className="text-[10px] font-mono text-muted-foreground mt-1">// applies after [apply filters]</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="mb-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="sku">By SKU</TabsTrigger>
          <TabsTrigger value="daily">Daily trend</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-mono uppercase tracking-widest text-muted-foreground">
                Records · {filtered.length} rows · {money(grand)}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border bg-surface-alt">
                      <th className="text-left px-4 py-2 text-[10px] font-mono uppercase tracking-widest text-muted-foreground font-normal">Provider</th>
                      <th className="text-left px-4 py-2 text-[10px] font-mono uppercase tracking-widest text-muted-foreground font-normal">Project</th>
                      <th className="text-left px-4 py-2 text-[10px] font-mono uppercase tracking-widest text-muted-foreground font-normal">SKU</th>
                      <th className="text-right px-4 py-2 text-[10px] font-mono uppercase tracking-widest text-muted-foreground font-normal">MTD</th>
                      <th className="text-right px-4 py-2 text-[10px] font-mono uppercase tracking-widest text-muted-foreground font-normal">Previous</th>
                      <th className="text-right px-4 py-2 text-[10px] font-mono uppercase tracking-widest text-muted-foreground font-normal">Δ</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {filtered.map(r => (
                      <tr key={r.id} className="hover:bg-surface-alt transition-colors">
                        <td className="px-4 py-2"><ProviderBadge provider={r.prov}/></td>
                        <td className="px-4 py-2 font-mono text-xs text-foreground">{r.name}</td>
                        <td className="px-4 py-2 text-sm">{r.sku}</td>
                        <td className="px-4 py-2 text-right font-mono text-xs text-foreground tabular-nums">{money(r.mtd)}</td>
                        <td className="px-4 py-2 text-right font-mono text-xs text-muted-foreground tabular-nums">{money(r.prev)}</td>
                        <td className="px-4 py-2 text-right"><CostDeltaCell value={r.delta}/></td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="border-t border-border font-semibold">
                      <td colSpan={3} className="px-4 py-2 text-sm">Grand total</td>
                      <td className="px-4 py-2 text-right font-mono text-xs text-foreground">{money(grand)}</td>
                      <td className="px-4 py-2 text-right font-mono text-xs text-muted-foreground">{money(grandPrev)}</td>
                      <td className="px-4 py-2 text-right"><CostDeltaCell value={grandPrev ? ((grand-grandPrev)/grandPrev*100):0}/></td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sku">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-mono uppercase tracking-widest text-muted-foreground">
                Grouped by SKU · {bySku.length} SKUs
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border bg-surface-alt">
                      <th className="text-left px-4 py-2 text-[10px] font-mono uppercase tracking-widest text-muted-foreground font-normal">SKU</th>
                      <th className="text-left px-4 py-2 text-[10px] font-mono uppercase tracking-widest text-muted-foreground font-normal">Providers</th>
                      <th className="text-right px-4 py-2 text-[10px] font-mono uppercase tracking-widest text-muted-foreground font-normal">Instances</th>
                      <th className="text-right px-4 py-2 text-[10px] font-mono uppercase tracking-widest text-muted-foreground font-normal">MTD</th>
                      <th className="text-right px-4 py-2 text-[10px] font-mono uppercase tracking-widest text-muted-foreground font-normal">Previous</th>
                      <th className="text-right px-4 py-2 text-[10px] font-mono uppercase tracking-widest text-muted-foreground font-normal">Δ</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {bySku.map(g => (
                      <tr key={g.sku} className="hover:bg-surface-alt transition-colors">
                        <td className="px-4 py-2 font-mono text-xs text-foreground">{g.sku}</td>
                        <td className="px-4 py-2"><div className="flex gap-1">{[...g.providers].map(p=><ProviderBadge key={p} provider={p}/>)}</div></td>
                        <td className="px-4 py-2 text-right font-mono text-xs text-foreground tabular-nums">{g.count}</td>
                        <td className="px-4 py-2 text-right font-mono text-xs text-foreground tabular-nums">{money(g.mtd)}</td>
                        <td className="px-4 py-2 text-right font-mono text-xs text-muted-foreground tabular-nums">{money(g.prev)}</td>
                        <td className="px-4 py-2 text-right"><CostDeltaCell value={g.prev ? ((g.mtd-g.prev)/g.prev*100):0}/></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="daily">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-mono uppercase tracking-widest text-muted-foreground">
                Daily · stacked by provider · 30 days
              </CardTitle>
            </CardHeader>
            <CardContent>
              {dailySeries.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground text-sm">select at least one provider</div>
              ) : (
                <StackedAreaChart series={dailySeries} height={300}/>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default CostsPage
