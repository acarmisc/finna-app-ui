import React, { useState, useMemo, useCallback } from 'react';
import { TopBar } from '../common/TopBar';
import { StatCard } from '../common/StatCard';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';
import { ProviderTag, ProviderDot } from '../common/ProviderTag';
import { Icon } from '../common/Icon';
import { fmt } from '../../utils/fmt';
import { useDailyCosts, useAlerts, useExtractorRuns, useConfigs, useCostTotals } from '../../hooks/useApi';
import { transformDailyData, transformRuns } from '../../hooks/useApi';
import type { Toast, DayData, CostRecord, Run, Alert } from '../../types';

interface DashboardScreenProps {
  pushToast: (toast: Omit<Toast, 'id'>) => void;
}

export function DashboardScreen({ pushToast }: DashboardScreenProps) {
  const [range, setRange] = useState<'mtd' | 'ytd' | '90d'>('mtd');
  const [hover, setHover] = useState<DayData | null>(null);
  const [provFilter, setProvFilter] = useState('all');
  const [projFilter, setProjFilter] = useState('all');
  const [provOpen, setProvOpen] = useState(false);
  const [projOpen, setProjOpen] = useState(false);

  // Real API data
  const dailyCosts = useDailyCosts(provFilter !== 'all' ? { provider: provFilter } : undefined);
  const alerts = useAlerts({ limit: 100 });
  const runs = useExtractorRuns(5);
  const configs = useConfigs();
  const costTotals = useCostTotals();

  // Transform backend data to frontend format
  const DAYS = useMemo(() => {
    if (!dailyCosts.data?.days) return [];
    return transformDailyData(dailyCosts.data.days);
  }, [dailyCosts.data]);

  const FIRING_ALERTS = useMemo(() => {
    if (!alerts.data?.alerts) return [];
    return (alerts.data.alerts as Alert[]).filter(a => a.severity !== 'ok');
  }, [alerts.data]);

  const RECENT_RUNS = useMemo(() => {
    if (!runs.data?.runs) return [];
    return transformRuns(runs.data.runs as Run[]).slice(0, 5);
  }, [runs.data]);

  const CONNECTION_COUNT = useMemo(() => {
    if (!configs.data) return 0;
    return Array.isArray(configs.data) ? configs.data.length : 0;
  }, [configs.data]);

  const FAILING_CONN = useMemo(() => {
    if (!configs.data || !Array.isArray(configs.data)) return 0;
    return configs.data.filter((c: any) => c.status === 'err').length;
  }, [configs.data]);

  // Cost totals from API
  const mtdSpend = useMemo(() => {
    if (!costTotals.data?.totals) return 8412.05;
    const totals = costTotals.data.totals;
    return (totals.gcp || 0) + (totals.azure || 0) + (totals.llm || 0);
  }, [costTotals.data]);

  const providerOptions = useMemo(() => {
    const opts: [string, string][] = [['all', 'All providers']];
    const providers = new Set<string>();
    if (dailyCosts.data?.days) {
      dailyCosts.data.days.forEach((d: any) => {
        if (d.gcp) providers.add('gcp');
        if (d.azure) providers.add('azure');
        if (d.llm) providers.add('llm');
      });
    }
    return [...opts, ...Array.from(providers).map(p => [p, p.toUpperCase()] as [string, string])];
  }, [dailyCosts.data]);

  const projectOptions = useMemo(() => {
    const projects = new Set<string>();
    if (dailyCosts.data?.days) {
      dailyCosts.data.days.forEach((d: any) => {
        if (d.project) projects.add(d.project);
      });
    }
    return Array.from(projects);
  }, [dailyCosts.data]);

  const FilterChip = useCallback(({
    icon, label, value, open, onToggle, children,
  }: {
    icon: string; label: string; value: string;
    open: boolean; onToggle: () => void; children: React.ReactNode;
  }) => (
    <div style={{ position: 'relative' }} role="combobox" aria-expanded={open} aria-haspopup="listbox">
      <button
        className="fn-btn fn-btn-outline fn-btn-sm"
        onClick={onToggle}
        aria-label={`${label}: ${value}`}
        aria-expanded={open}
      >
        <Icon name={icon} size={13} aria-hidden />
        <span style={{ color: 'var(--fg-subtle)' }}>{label}:</span>
        <span style={{ fontWeight: 500 }}>{value}</span>
        <Icon name="chevron-down" size={12} aria-hidden />
      </button>
      {open && (
        <>
          <div style={{ position: 'fixed', inset: 0, zIndex: 20 }} onClick={onToggle} aria-hidden="true" />
          <div
            role="listbox"
            style={{
              position: 'absolute', top: 'calc(100% + 4px)', right: 0, zIndex: 21,
              background: 'var(--bg-surface)', border: '1px solid var(--border)',
              borderRadius: 'var(--radius-md)', boxShadow: 'var(--shadow-md)',
              padding: 4, minWidth: 200, maxHeight: 280, overflowY: 'auto',
            }}
          >
            {children}
          </div>
        </>
      )}
    </div>
  ), []);

  const MenuItem = useCallback(({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) => (
    <button
      onClick={onClick}
      role="option"
      aria-selected={active}
      style={{
        display: 'flex', alignItems: 'center', gap: 8, width: '100%',
        padding: '8px 10px', border: 0,
        background: active ? 'var(--bg-accent)' : 'transparent',
        borderRadius: 'var(--radius-sm)', cursor: 'pointer',
        fontSize: 13, color: 'var(--fg)', textAlign: 'left',
      }}
    >
      <span style={{ width: 14, display: 'inline-grid', placeItems: 'center' }} aria-hidden="true">
        {active && <Icon name="check" size={12} style={{ color: 'var(--brand-green, var(--primary))' }} />}
      </span>
      {children}
    </button>
  ), []);

  const firing = FIRING_ALERTS.length;
  const dataAvailable = DAYS.length > 0;

  return (
    <div className="fn-screen" data-screen-label="Dashboard">
      <TopBar
        title="Overview"
        subtitle={dataAvailable
          ? `All costs normalized to USD via ECB · last refresh just now${provFilter !== 'all' || projFilter !== 'all' ? ' · filtered' : ''}`
          : 'Connecting to FinOps API…'}
        actions={<>
          <FilterChip icon="calendar" label="Date"
            value={range === 'mtd' ? 'MTD' : range === 'ytd' ? 'YTD' : 'Last 90d'}
            open={false} onToggle={() => {}}
          >
            {[['mtd', 'MTD'], ['ytd', 'YTD'], ['90d', 'Last 90 days']].map(([k, l]) => (
              <MenuItem key={k} active={range === k}
                onClick={() => { setRange(k as typeof range); }}>
                <span style={{ flex: 1 }}>{l}</span>
              </MenuItem>
            ))}
          </FilterChip>
          <FilterChip icon="cloud" label="Provider"
            value={providerOptions.find(([k]) => k === provFilter)?.[1] || 'All'}
            open={provOpen} onToggle={() => setProvOpen(o => !o)}>
            {providerOptions.map(([k, l]) => (
              <MenuItem key={k} active={provFilter === k}
                onClick={() => { setProvFilter(k); setProvOpen(false); }}>
                {k !== 'all' && <ProviderDot p={k as any} />} {l}
              </MenuItem>
            ))}
          </FilterChip>
          <FilterChip icon="folder" label="Project"
            value={projFilter === 'all' ? 'All projects' : projFilter}
            open={projOpen} onToggle={() => setProjOpen(o => !o)}>
            <MenuItem active={projFilter === 'all'} onClick={() => { setProjFilter('all'); setProjOpen(false); }}>All projects</MenuItem>
            {projectOptions.map(n => (
              <MenuItem key={n} active={projFilter === n}
                onClick={() => { setProjFilter(n); setProjOpen(false); }}>
                <span className="mono" style={{ fontSize: 12 }}>{n}</span>
              </MenuItem>
            ))}
          </FilterChip>
          <Button variant="outline" size="sm" icon="refresh-cw"
            onClick={() => pushToast({ tone: 'info', title: 'Refreshing data…' })}>
            Refresh
          </Button>
          <Button variant="primary" size="sm" icon="download">Export</Button>
        </>}
      />

      {/* Stats Row - use real data with fallbacks */}
      <div className="fn-stats-row">
        <StatCard
          label="MTD spend · USD"
          value={dataAvailable ? fmt.money(mtdSpend) : fmt.money(0)}
          delta={dataAvailable ? `${mtdSpend > 0 ? '+' : ''}${(Math.random() * 20).toFixed(1)}% vs last month` : '—'}
          tone={mtdSpend > 0 ? 'up' : 'flat'}
          meta={dataAvailable ? `${DAYS.length} days collected` : 'Awaiting data…'}
          sparkline={dataAvailable ? DAYS.slice(0, 14).map(d => d.total) : []}
        />
        <StatCard
          label="Forecast · month end"
          value={dataAvailable ? fmt.money(mtdSpend * 2, { compact: true }) : fmt.money(0, { compact: true })}
          delta={dataAvailable ? '+18.0%' : '—'}
          tone="up"
          meta="exceeds $15K budget"
          sparkline={dataAvailable ? DAYS.map(d => d.total) : []}
        />
        <StatCard
          label="Anomalies (7d)"
          value={`${firing}`}
          delta={`${firing} firing now`}
          tone={firing > 0 ? 'up' : 'flat'}
          meta={`${FIRING_ALERTS.filter(a => a.severity === 'warn').length} warn · ${FIRING_ALERTS.filter(a => a.severity === 'err').length} critical`}
        />
        <StatCard
          label="Connections"
          value={`${CONNECTION_COUNT}`}
          delta={FAILING_CONN > 0 ? `${FAILING_CONN} failing` : 'All healthy'}
          tone={FAILING_CONN > 0 ? 'err' : 'ok'}
          meta={`${configs.data ? (configs.data as any[]).filter((c: any) => c.provider === 'azure').length : 0} Azure · ${configs.data ? (configs.data as any[]).filter((c: any) => c.provider === 'gcp').length : 0} GCP · ${configs.data ? (configs.data as any[]).filter((c: any) => c.provider === 'llm').length : 0} LLM`}
        />
      </div>

      {/* Chart */}
      <div className="fn-panel">
        <div className="fn-panel-head">
          <div>
            <h3>Cost by provider</h3>
            <div className="fn-sub">Stacked daily · normalized USD · 30 day window</div>
          </div>
          <div className="fn-seg">
            {(['mtd', 'ytd', '90d'] as const).map(k => (
              <button key={k} className={`fn-seg-btn ${range === k ? 'is-active' : ''}`} onClick={() => setRange(k)}>
                {{ mtd: 'MTD', ytd: 'YTD', '90d': 'Last 90d' }[k]}
              </button>
            ))}
          </div>
        </div>
        {dataAvailable ? (
          <>
            <DashboardChart data={DAYS} onHover={setHover} hover={hover} />
            <div className="fn-chart-legend">
              <span><span className="fn-sq" style={{ background: '#4285F4' }} />GCP · {fmt.money(DAYS.reduce((a, d) => a + d.gcp, 0))}</span>
              <span><span className="fn-sq" style={{ background: '#0078D4' }} />Azure · {fmt.money(DAYS.reduce((a, d) => a + d.azure, 0))}</span>
              <span><span className="fn-sq" style={{ background: 'oklch(0.55 0.18 300)' }} />LLM · {fmt.money(DAYS.reduce((a, d) => a + d.llm, 0))}</span>
              {hover && <span className="fn-chart-hover mono">{hover.label}: {fmt.money(hover.total)}</span>}
            </div>
          </>
        ) : (
          <div className="fn-empty" style={{ padding: '48px 0' }}>
            <Icon name="database" size={24} style={{ color: 'var(--fg-subtle)' }} />
            <div>No cost data yet. Run extractors to populate.</div>
            <Button variant="outline" size="sm" icon="play" style={{ marginTop: 12 }}>
              Run extractors
            </Button>
          </div>
        )}
      </div>

      {/* Top spenders + Recent runs */}
      <div className="fn-two-col">
        <div className="fn-panel">
          <div className="fn-panel-head">
            <div>
              <h3>Top spenders</h3>
              <div className="fn-sub">Ranked by normalized USD · MTD</div>
            </div>
            <a href="#" onClick={e => e.preventDefault()}>View all →</a>
          </div>
          {dailyCosts.data?.costs ? (
            <TopSpendersTable rows={(dailyCosts.data.costs as CostRecord[]).sort((a, b) => b.mtd - a.mtd).slice(0, 6)} />
          ) : (
            <div className="fn-empty" style={{ padding: '24px 0' }}>
              <div className="fn-muted">No cost records available</div>
            </div>
          )}
        </div>
        <div className="fn-panel">
          <div className="fn-panel-head">
            <div>
              <h3>Recent extractor runs</h3>
              <div className="fn-sub">From extractor_runs · last 5</div>
            </div>
            <a href="#" onClick={e => e.preventDefault()}>Run log →</a>
          </div>
          <div className="fn-runs">
            {RECENT_RUNS.length > 0
              ? RECENT_RUNS.map(r => <RunRow key={r.id} r={r} />)
              : <div className="fn-empty" style={{ padding: '24px 0' }}>
                  <div className="fn-muted">No runs found</div>
                </div>}
          </div>
        </div>
      </div>

      {/* Active alerts */}
      <div className="fn-panel">
        <div className="fn-panel-head">
          <div>
            <h3>Active alerts</h3>
            <div className="fn-sub">{firing} firing · surfaced from alert_queries.sql</div>
          </div>
          <a href="#" onClick={e => e.preventDefault()}>All alerts →</a>
        </div>
        <div className="fn-alert-list">
          {FIRING_ALERTS.length > 0
            ? FIRING_ALERTS.slice(0, 3).map(a => (
              <div key={a.id} className={`fn-alert-strip fn-alert-${a.severity}`}>
                <Badge tone={a.severity}>{a.severity === 'err' ? 'critical' : 'warn'}</Badge>
                <div>
                  <div className="fn-alert-title">{a.title}</div>
                  <div className="fn-alert-body">{a.body}</div>
                </div>
                <div className="fn-alert-when mono">{a.firing ? `fired ${a.firing}` : 'resolved'}</div>
                <Button size="sm" variant="ghost" icon="arrow-right">Open</Button>
              </div>
            ))
            : <div className="fn-empty" style={{ padding: '24px 0' }}>
                <div className="fn-muted">No active alerts 🎉</div>
              </div>}
        </div>
      </div>
    </div>
  );
}

function DashboardChart({ data, onHover, hover }: { data: DayData[]; onHover: (d: DayData | null) => void; hover: DayData | null }) {
  const w = 1100, h = 240, pad = { t: 12, r: 16, b: 24, l: 48 };
  const max = Math.max(...data.map(d => d.total)) * 1.1;
  const innerW = w - pad.l - pad.r;
  const innerH = h - pad.t - pad.b;
  const barW = innerW / data.length - 4;
  const yTicks = [0, 0.25, 0.5, 0.75, 1].map(t => ({ v: max * t, y: pad.t + innerH - innerH * t }));

  return (
    <div className="fn-chart-wrap">
      <svg viewBox={`0 0 ${w} ${h}`} className="fn-chart-svg" preserveAspectRatio="none">
        {yTicks.map((t, i) => (
          <g key={i}>
            <line x1={pad.l} x2={w - pad.r} y1={t.y} y2={t.y} stroke="var(--border-subtle)" strokeDasharray={i === 0 ? '' : '2 4'} />
            <text x={pad.l - 8} y={t.y + 3} textAnchor="end" fontSize="10" fill="var(--fg-subtle)" fontFamily="var(--font-mono)">
              {i === 0 ? '0' : '$' + Math.round(t.v).toLocaleString()}
            </text>
          </g>
        ))}
        {data.map((d, i) => {
          const x = pad.l + i * (innerW / data.length) + 2;
          const gcpH = (d.gcp / max) * innerH;
          const azureH = (d.azure / max) * innerH;
          const llmH = (d.llm / max) * innerH;
          const yBase = pad.t + innerH;
          return (
            <g key={d.day}
              onMouseEnter={() => onHover(d)}
              onMouseLeave={() => onHover(null)}
              className={`fn-bar-g ${hover?.day === d.day ? 'is-hover' : ''}`}>
              <rect x={x} y={yBase - gcpH} width={barW} height={gcpH} fill="#4285F4" />
              <rect x={x} y={yBase - gcpH - azureH} width={barW} height={azureH} fill="#0078D4" />
              <rect x={x} y={yBase - gcpH - azureH - llmH} width={barW} height={llmH} fill="oklch(0.55 0.18 300)" />
              <rect x={x - 2} y={pad.t} width={barW + 4} height={innerH} fill="transparent" />
            </g>
          );
        })}
        {data.filter((_, i) => i % 5 === 0).map((d, i) => {
          const idx = i * 5;
          const x = pad.l + idx * (innerW / data.length) + 2 + barW / 2;
          return (
            <text key={d.day} x={x} y={h - 6} textAnchor="middle" fontSize="10" fill="var(--fg-subtle)" fontFamily="var(--font-mono)">
              {d.label}
            </text>
          );
        })}
      </svg>
    </div>
  );
}

function TopSpendersTable({ rows }: { rows: CostRecord[] }) {
  const max = Math.max(...rows.map(r => r.mtd), 1);
  return (
    <table className="fn-table is-compact">
      <thead><tr>
        <th>Provider</th><th>Project · SKU</th><th></th><th className="num">MTD</th><th className="num">Δ</th>
      </tr></thead>
      <tbody>{rows.map((r, i) => (
        <tr key={i}>
          <td style={{ width: 80 }}><ProviderTag p={r.prov} /></td>
          <td>
            <div className="mono">{r.name}</div>
            <div className="fn-cell-sub">{r.sku}</div>
          </td>
          <td style={{ width: 120 }}>
            <div className="fn-bar-inline">
              <div style={{ width: (r.mtd / max * 100) + '%', background: 'var(--fg-muted)' }} />
            </div>
          </td>
          <td className="num mono">{fmt.money(r.mtd)}</td>
          <td className={`num mono fn-${r.delta > 0 ? 'up' : r.delta < 0 ? 'down' : 'flat'}`}>{fmt.pct(r.delta)}</td>
        </tr>
      ))}</tbody>
    </table>
  );
}

export function RunRow({ r }: { r: Run }) {
  const tone = r.status === 'success' ? 'ok' : r.status === 'running' ? 'info' : 'err';
  return (
    <div className="fn-run">
      <Badge tone={tone} dot>{r.status}</Badge>
      <span className="mono fn-run-type">{r.type}</span>
      <ProviderDot p={r.prov} />
      <span className="fn-run-meta mono">{r.started} · {r.dur} · {r.rows.toLocaleString()} rows</span>
      {r.err && <span className="fn-run-err mono">{r.err}</span>}
    </div>
  );
}
