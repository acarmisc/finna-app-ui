import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ProviderBadge } from '@/components/shared/provider-badge'
import { StatusBadge } from '@/components/shared/status-badge'
import { money } from '@/components/shared/money'
import { Plus, Edit3, Activity, Trash2, Play } from 'lucide-react'

const CONFIGS = [
  {
    id:'cfg1', name:'acme-prod-azure', provider:'azure',
    credential_type:'service_principal',
    tenant_id:'8f2c-…-a1e9', subscription_id:'7795…',
    created_at:'Jan 15, 2026', last_test:'completed', last_test_at:'Apr 23 06:00',
    err:null,
  },
  {
    id:'cfg2', name:'gcp-production', provider:'gcp',
    credential_type:'service_account',
    project_id:'abs-digital-playground',
    created_at:'Feb 3, 2026', last_test:'completed', last_test_at:'Apr 23 06:00',
    err:null,
  },
  {
    id:'cfg3', name:'llm-gateway', provider:'llm',
    credential_type:'api_key',
    created_at:'Mar 10, 2026', last_test:'failed', last_test_at:'Apr 22 14:30',
    err:'rate limit exceeded · 429',
  },
]

function ConfirmDialog({ open, onClose, onConfirm, title, children }: {
  open: boolean
  onClose: ()=>void
  onConfirm: ()=>void
  title: string
  children: React.ReactNode
}) {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/55" onClick={onClose}>
      <div className="bg-surface border border-border w-full max-w-md" onClick={e=>e.stopPropagation()}>
        <div className="px-4 py-3 border-b border-border">
          <h3 className="font-mono text-xs uppercase tracking-widest text-muted-foreground">{title}</h3>
        </div>
        <div className="px-4 py-4 text-sm text-foreground">{children}</div>
        <div className="px-4 py-3 border-t border-border flex justify-end gap-2">
          <Button size="sm" variant="outline" onClick={onClose}>cancel</Button>
          <Button size="sm" variant="destructive" onClick={onConfirm}>delete</Button>
        </div>
      </div>
    </div>
  )
}

export function ConfigsListPage() {
  const [testing, setTesting] = useState<string|null>(null)
  const [results, setResults] = useState<Record<string,'ok'|'err'|null>>({})
  const [confirmDel, setConfirmDel] = useState<typeof CONFIGS[0]|null>(null)

  const testConn = (c: typeof CONFIGS[0]) => {
    setTesting(c.id)
    setTimeout(() => {
      setTesting(null)
      const ok = c.last_test !== 'failed'
      setResults(r => ({...r, [c.id]: ok ? 'ok' : 'err'}))
      setTimeout(() => setResults(r => ({...r, [c.id]: null})), 2200)
    }, 900)
  }

  return (
    <div className="page">
      <div className="page-head">
        <div>
          <h1>Cloud configs</h1>
          <div className="sub">// {CONFIGS.length} configured · 1 test failure in last 24h</div>
        </div>
        <div className="actions">
          <Button variant="default" size="sm" onClick={()=>window.location.hash='#/configs/new'}>
            <Plus className="w-3 h-3"/>new config
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
        {CONFIGS.map(c => {
          const flash = results[c.id]
          return (
            <Card key={c.id} style={{
              borderColor: flash==='ok' ? 'var(--accent)' : flash==='err' ? 'var(--danger)' : 'var(--border)',
              transition:'border-color 150ms'
            }}>
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-sm font-semibold text-foreground">{c.name}</CardTitle>
                    <div className="font-mono text-[10px] text-muted-foreground mt-0.5">{c.credential_type}</div>
                  </div>
                  <ProviderBadge provider={c.provider} size="lg"/>
                </div>
              </CardHeader>
              <CardContent className="pb-3">
                <dl className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
                  {c.tenant_id && <>
                    <dt className="font-mono text-[10px] text-muted-foreground uppercase tracking-wider">TENANT</dt>
                    <dd className="font-mono text-[10px] text-foreground">{c.tenant_id}</dd>
                  </>}
                  {c.subscription_id && <>
                    <dt className="font-mono text-[10px] text-muted-foreground uppercase tracking-wider">SUB</dt>
                    <dd className="font-mono text-[10px] text-foreground">{c.subscription_id}</dd>
                  </>}
                  {c.project_id && <>
                    <dt className="font-mono text-[10px] text-muted-foreground uppercase tracking-wider">PROJECT</dt>
                    <dd className="font-mono text-[10px] text-foreground">{c.project_id}</dd>
                  </>}
                  <dt className="font-mono text-[10px] text-muted-foreground uppercase tracking-wider">CREATED</dt>
                  <dd className="font-mono text-[10px] text-foreground">{c.created_at}</dd>
                  <dt className="font-mono text-[10px] text-muted-foreground uppercase tracking-wider">LAST TEST</dt>
                  <dd className="flex items-center gap-1.5">
                    <StatusBadge status={c.last_test}/>
                    <span className="font-mono text-[10px] text-muted-foreground">{c.last_test_at}</span>
                  </dd>
                </dl>
                {c.err && (
                  <div className="mt-3 px-3 py-2 text-[11px] font-mono text-danger border border-danger/20 bg-danger/5">
                    // {c.err}
                  </div>
                )}
              </CardContent>
              <div className="px-4 py-2 border-t border-border flex items-center justify-between">
                <div className="flex gap-1">
                  <Button size="sm" variant="outline" onClick={()=>window.location.hash=`#/configs/${c.id}`}>
                    <Edit3 className="w-3 h-3"/>edit
                  </Button>
                  <Button size="sm" variant="outline" disabled={testing===c.id} onClick={()=>testConn(c)}>
                    <Activity className="w-3 h-3"/>{testing===c.id ? 'testing…' : 'test'}
                  </Button>
                </div>
                <Button size="sm" variant="ghost" onClick={()=>setConfirmDel(c)}>
                  <Trash2 className="w-3 h-3"/>
                </Button>
              </div>
            </Card>
          )
        })}
      </div>

      <ConfirmDialog
        open={!!confirmDel}
        onClose={()=>setConfirmDel(null)}
        onConfirm={()=>{ setConfirmDel(null); }}
        title={`Delete config · ${confirmDel?.name || ''}`}
      >
        <p className="text-sm text-foreground">This will remove the config and stop all scheduled extractions using it. Historical cost records remain.</p>
        <p className="font-mono text-xs text-danger mt-2">// this action cannot be undone</p>
      </ConfirmDialog>
    </div>
  )
}

export default ConfigsListPage
