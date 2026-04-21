import React, { useState, useMemo } from 'react';
import { TopBar } from '../common/TopBar';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';
import { ProviderTag } from '../common/ProviderTag';
import { Icon } from '../common/Icon';
import { useExtractorRuns, transformRuns } from '../../hooks/useApi';
import { RunRow } from './DashboardScreen';
import type { Run } from '../../types';

interface RunsScreenProps {
  onOpenRun: (run: Run) => void;
}

export function RunsScreen({ onOpenRun }: RunsScreenProps) {
  const [flt, setFlt] = useState<'all' | 'success' | 'running' | 'failed'>('all');

  const { data, loading, error, refresh } = useExtractorRuns(50);

  const allRuns = useMemo(() => {
    if (!data?.runs) return [];
    return transformRuns(data.runs as Run[]);
  }, [data]);

  const rows = flt === 'all' ? allRuns : allRuns.filter(r => r.status === flt);

  return (
    <div className="fn-screen" data-screen-label="Run log">
      <TopBar title="Run log"
        subtitle={`Last ${allRuns.length} subprocess runs · from extractor_runs`}
        actions={<Button variant="outline" size="sm" icon="refresh-cw" onClick={refresh}>Refresh</Button>}
      />
      <div className="fn-filter-bar">
        <div className="fn-seg">
          {([['all', 'All'], ['success', 'Success'], ['running', 'Running'], ['failed', 'Failed']] as [typeof flt, string][]).map(([k, l]) => (
            <button key={k} className={`fn-seg-btn ${flt === k ? 'is-active' : ''}`} onClick={() => setFlt(k)}>{l}</button>
          ))}
        </div>
      </div>
      <div className="fn-panel fn-panel-flush">
        {error ? (
          <div style={{ padding: 24, textAlign: 'center', color: 'var(--danger)' }}>
            Failed to load runs: {error.message}
          </div>
        ) : loading ? (
          <div style={{ padding: 48, textAlign: 'center' }} className="fn-muted">Loading runs…</div>
        ) : (
          <table className="fn-table">
            <thead><tr>
              <th>Status</th><th>Run ID</th><th>Extractor</th><th>Provider</th>
              <th>Started</th><th>Duration</th><th className="num">Rows</th><th></th>
            </tr></thead>
            <tbody>
              {rows.map(r => (
                <tr key={r.id} className="is-clickable" onClick={() => onOpenRun(r)}>
                  <td><Badge tone={r.status === 'success' ? 'ok' : r.status === 'running' ? 'info' : 'err'} dot>{r.status}</Badge></td>
                  <td className="mono fn-muted">{r.id}</td>
                  <td className="mono">{r.type}</td>
                  <td><ProviderTag p={r.prov} /></td>
                  <td>{r.started}</td>
                  <td className="mono">{r.dur}</td>
                  <td className="num mono">{r.rows.toLocaleString()}</td>
                  <td><Icon name="chevron-right" size={14} style={{ color: 'var(--fg-subtle)' }} /></td>
                </tr>
              ))}
              {rows.length === 0 && (
                <tr><td colSpan={8} className="fn-empty">No runs found.</td></tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
