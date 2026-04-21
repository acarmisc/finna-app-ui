import React, { useState, useCallback } from 'react';
import { TopBar } from '../common/TopBar';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';
import { ProviderTag, ProviderDot } from '../common/ProviderTag';
import { Icon } from '../common/Icon';
import { useConfigs, useCreateConfig, useDeleteConfig } from '../../hooks/useApi';
import { transformConfigsToConnections } from '../../hooks/useApi';
import type { Toast, Connection, Route } from '../../types';

interface ConnectionsScreenProps {
  pushToast: (toast: Omit<Toast, 'id'>) => void;
  onNew: () => void;
  onOpen: (conn: Connection) => void;
  onNav: (route: Route) => void;
}

export function ConnectionsScreen({ pushToast, onNew, onOpen, onNav }: ConnectionsScreenProps) {
  const [view, setView] = useState<'cards' | 'table'>(
    (localStorage.getItem('finna-conn-view') as 'cards' | 'table') || 'cards'
  );

  const { data: configs, loading, error, refresh } = useConfigs();
  const createConfig = useCreateConfig();
  const deleteConfig = useDeleteConfig();

  // Transform API data to frontend format
  const CONNECTIONS = transformConfigsToConnections(configs);
  const totalConns = CONNECTIONS.length;
  const failingConns = CONNECTIONS.filter(c => c.status === 'err').length;
  const staleConns = CONNECTIONS.filter(c => c.status === 'warn').length;

  const handleViewChange = (v: 'cards' | 'table') => {
    setView(v);
    localStorage.setItem('finna-conn-view', v);
  };

  const handleRun = useCallback((c: Connection) => {
    pushToast({ tone: 'info', title: `Queued ${c.name}`, body: 'Run will start shortly' });
  }, [pushToast]);

  const handleDelete = useCallback((c: Connection) => {
    if (confirm(`Delete connection "${c.name}"?`)) {
      deleteConfig(c.id).then(() => {
        refresh();
        pushToast({ tone: 'ok', title: `Deleted ${c.name}` });
      }).catch(err => {
        pushToast({ tone: 'err', title: 'Failed to delete', body: err.message });
      });
    }
  }, [deleteConfig, refresh, pushToast]);

  return (
    <div className="fn-screen" data-screen-label="Connections">
      <TopBar title="Connections"
        subtitle={loading ? 'Loading…' : `${totalConns} active · ${failingConns} failing · ${staleConns} stale`}
        actions={<>
          <div className="fn-seg">
            {([['cards', 'Cards'], ['table', 'Table']] as const).map(([k, l]) => (
              <button key={k} className={`fn-seg-btn ${view === k ? 'is-active' : ''}`} onClick={() => handleViewChange(k)}>{l}</button>
            ))}
          </div>
          <Button variant="outline" size="sm" icon="refresh-cw" onClick={refresh}>
            Refresh
          </Button>
          <Button variant="primary" size="sm" icon="plus" onClick={onNew}>New connection</Button>
        </>}
      />
      {error && (
        <div style={{
          padding: 12, margin: '0 24px 16px', borderRadius: 'var(--radius-md)',
          background: 'var(--danger-weak)', border: '1px solid var(--danger)',
          color: 'var(--danger)', fontSize: 13,
        }}>
          Failed to load connections: {error.message}
          <button className="fn-linkbtn" onClick={refresh} style={{ marginLeft: 8 }}>Retry</button>
        </div>
      )}
      {view === 'cards' ? (
        <div className="fn-conn-grid">
          {CONNECTIONS.map(c => (
            <ConnectionCard key={c.id} c={c}
              onClick={() => onOpen(c)}
              onRun={() => handleRun(c)}
              onDelete={() => handleDelete(c)}
            />
          ))}
          {CONNECTIONS.length === 0 && !loading && (
            <div className="fn-empty" style={{ gridColumn: '1 / -1', padding: 48 }}>
              <Icon name="plug" size={24} style={{ color: 'var(--fg-subtle)' }} />
              <div>No connections yet. Create one to get started.</div>
            </div>
          )}
        </div>
      ) : (
        <div className="fn-panel fn-panel-flush">
          <table className="fn-table">
            <thead><tr>
              <th>Name</th><th>Provider</th><th>Project</th><th>Scope</th>
              <th className="num">Resources</th><th>Status</th><th>Last run</th><th></th>
            </tr></thead>
            <tbody>
              {CONNECTIONS.map(c => (
                <tr key={c.id} className="is-clickable" onClick={() => onOpen(c)}>
                  <td className="mono fn-strong">{c.name}</td>
                  <td><ProviderTag p={c.prov} /></td>
                  <td><span className="fn-muted">{c.projectId || 'Unassigned'}</span></td>
                  <td className="fn-muted" style={{ maxWidth: 240, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.scope}</td>
                  <td className="num mono">{c.resources?.length || 0}</td>
                  <td><Badge tone={c.status === 'ok' ? 'ok' : c.status === 'warn' ? 'warn' : 'err'} dot>{{ ok: 'Healthy', warn: 'Stale', err: 'Failed' }[c.status]}</Badge></td>
                  <td className="mono fn-muted">{c.lastRun}</td>
                  <td style={{ width: 48 }}>
                    <Button variant="ghost" size="xs" icon="trash-2" onClick={e => { e.stopPropagation(); handleDelete(c); }}>
                    </Button>
                  </td>
                </tr>
              ))}
              {CONNECTIONS.length === 0 && !loading && (
                <tr><td colSpan={8} className="fn-empty">No connections yet.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export function ConnectionCard({ c, onClick, onRun, onDelete }: {
  c: Connection;
  onClick: () => void;
  onRun: () => void;
  onDelete: () => void;
}) {
  const tone = c.status === 'ok' ? 'ok' : c.status === 'warn' ? 'warn' : 'err';
  const label = { ok: 'Healthy', warn: 'Stale', err: 'Failed' }[c.status];
  return (
    <div className="fn-panel fn-conn is-clickable" onClick={onClick}>
      <div className="fn-conn-head">
        <div className="fn-conn-title">
          <ProviderDot p={c.prov} />
          <span className="mono">{c.name}</span>
        </div>
        <Badge tone={tone} dot>{label}</Badge>
      </div>
      <div className="fn-conn-project">
        <span className="fn-muted">{c.projectId ? `Project: ${c.projectId}` : 'Unassigned'}</span>
      </div>
      <div className="fn-conn-scope">{c.scope}</div>
      <div className="fn-conn-grid-meta">
        <div><span className="fn-k">Last run</span><span className="fn-v mono">{c.lastRun}</span></div>
        <div><span className="fn-k">Rows</span><span className="fn-v mono">{c.rows || '—'}</span></div>
        <div><span className="fn-k">Auth</span><span className="fn-v">{c.auth}</span></div>
        <div><span className="fn-k">Token</span><span className="fn-v">{c.expires}</span></div>
      </div>
      {c.err && <div className="fn-conn-err mono">{c.err}</div>}
      {c.note && <div className="fn-conn-note">{c.note}</div>}
      <div className="fn-conn-foot" onClick={e => e.stopPropagation()}>
        <Button variant="outline" size="sm" icon="play" onClick={onRun}>Run now</Button>
        <Button variant="ghost" size="sm" icon="settings" onClick={onClick}>Configure</Button>
        <Button variant="ghost" size="sm" icon="trash-2" onClick={onDelete} style={{ color: 'var(--danger)' }}>Delete</Button>
      </div>
    </div>
  );
}
