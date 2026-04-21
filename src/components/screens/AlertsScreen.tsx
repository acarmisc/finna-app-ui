import React, { useState, useMemo } from 'react';
import { TopBar } from '../common/TopBar';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';
import { Icon } from '../common/Icon';
import { useAlerts } from '../../hooks/useApi';
import type { Toast, Alert } from '../../types';

interface AlertsScreenProps {
  pushToast: (toast: Omit<Toast, 'id'>) => void;
}

export function AlertsScreen({ pushToast }: AlertsScreenProps) {
  const [tab, setTab] = useState<'firing' | 'resolved' | 'all'>('firing');

  const { data, loading, error } = useAlerts(tab === 'firing' ? { status: 'firing' } : tab === 'resolved' ? { status: 'resolved' } : undefined);

  const allAlerts = useMemo(() => {
    if (!data?.alerts) return [];
    return data.alerts as Alert[];
  }, [data]);

  const list = tab === 'firing'
    ? allAlerts.filter(a => a.severity !== 'ok')
    : tab === 'resolved'
    ? allAlerts.filter(a => a.severity === 'ok')
    : allAlerts;

  const firingCount = allAlerts.filter(a => a.severity !== 'ok').length;

  return (
    <div className="fn-screen" data-screen-label="Alerts">
      <TopBar title="Alerts"
        subtitle={`${firingCount} firing · ${allAlerts.length} rules`}
        actions={<>
          <Button variant="outline" size="sm" icon="bell-off">Snooze all</Button>
          <Button variant="primary" size="sm" icon="plus">New rule</Button>
        </>}
      />
      <div className="fn-tabs-bar">
        {([
          ['firing', 'Firing', firingCount],
          ['resolved', 'Resolved', allAlerts.filter(a => a.severity === 'ok').length],
          ['all', 'All', allAlerts.length],
        ] as [string, string, number][]).map(([k, l, n]) => (
          <button key={k} className={`fn-tab ${tab === k ? 'is-active' : ''}`} onClick={() => setTab(k as typeof tab)}>
            {l}<span className="fn-tab-count">{n}</span>
          </button>
        ))}
      </div>
      {error ? (
        <div style={{ padding: 24, textAlign: 'center', color: 'var(--danger)' }}>
          Failed to load alerts: {error.message}
        </div>
      ) : loading ? (
        <div style={{ padding: 48, textAlign: 'center' }} className="fn-muted">Loading alerts…</div>
      ) : (
        <div className="fn-alerts">
          {list.length > 0
            ? list.map(a => (
              <AlertCard key={a.id} a={a}
                onSnooze={() => pushToast({ tone: 'info', title: `Snoozed ${a.title}`, body: 'Will recheck in 1h' })} />
            ))
            : <div className="fn-empty" style={{ padding: 48 }}>
                <Icon name="bell" size={24} style={{ color: 'var(--fg-subtle)' }} />
                <div>No {tab === 'all' ? '' : tab} alerts</div>
              </div>}
        </div>
      )}
    </div>
  );
}

function AlertCard({ a, onSnooze }: { a: Alert; onSnooze: () => void }) {
  const label = { ok: 'Resolved', warn: 'Firing · warn', err: 'Firing · critical' }[a.severity];
  return (
    <div className={`fn-panel fn-alert fn-alert-${a.severity}`}>
      <div className="fn-alert-head">
        <Badge tone={a.severity} dot>{label}</Badge>
        <h3>{a.title}</h3>
        {a.firing && <span className="fn-sub">triggered {a.firing}</span>}
      </div>
      <div className="fn-alert-body">{a.body}</div>
      <pre className="fn-alert-rule mono">{a.rule}</pre>
      <div className="fn-alert-chans">
        <Icon name="send" size={12} />
        <span>Notifies</span>
        {a.channels.map((ch, i) => <span key={i} className="fn-chip fn-chip-sm mono">{ch}</span>)}
      </div>
      <div className="fn-alert-foot">
        <Button variant="outline" size="sm" icon="chart-line">View in Explorer</Button>
        <Button variant="ghost" size="sm" icon="bell-off" onClick={onSnooze}>Snooze 1h</Button>
        <Button variant="ghost" size="sm" icon="pencil">Edit rule</Button>
      </div>
    </div>
  );
}
