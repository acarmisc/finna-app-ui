/**
 * Custom hooks for API data management
 * All hooks connect to the real backend API via APIClient
 */

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { getApiClient, APIClient } from '../services/apiClient';

// Types for data states
interface UseDataResult<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
  refresh: () => void;
}

interface UsePaginationResult<T> {
  items: T[];
  loading: boolean;
  error: Error | null;
  refresh: () => void;
  hasMore: boolean;
}

// Main hook for fetching data
export function useData<T>(key: string, fetchFn: () => Promise<T>, deps: unknown[] = []): UseDataResult<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const trigger = useRef(0);
  const fetchFnRef = useRef(fetchFn);
  fetchFnRef.current = fetchFn;

  const doFetch = useCallback(() => {
    setLoading(true);
    fetchFnRef.current()
      .then(setData)
      .catch(setError)
      .finally(() => setLoading(false));
  }, []);

  const refresh = useCallback(() => {
    trigger.current += 1;
    doFetch();
  }, [doFetch]);

  useEffect(() => {
    doFetch();
  }, [trigger.current, doFetch]);

  return useMemo(() => ({ data, loading, error, refresh }), [data, loading, error, refresh]);
}

// ─── Costs Hooks ─────────────────────────────────────────────────────────────

export function useCosts(params?: {
  provider?: string;
  project?: string;
  startDate?: string;
  endDate?: string;
}) {
  return useData('costs', async () => {
    const client = getApiClient();
    const response = await client.getCosts(params);
    if (response.error) {
      throw new Error(response.error.message || 'Failed to fetch costs');
    }
    // Backend returns { costs: [...], totals: {...} }
    return response.data as any;
  }, [JSON.stringify(params)]);
}

export function useCostTotals(params?: { startDate?: string; endDate?: string }) {
  return useData('costTotals', async () => {
    const client = getApiClient();
    const response = await client.getCostTotals(params);
    if (response.error) {
      throw new Error(response.error.message || 'Failed to fetch cost totals');
    }
    return response.data as any;
  }, [JSON.stringify(params)]);
}

export function useDailyCosts(params?: {
  startDate?: string;
  endDate?: string;
  provider?: string;
}) {
  return useData('dailyCosts', async () => {
    const client = getApiClient();
    const response = await client.getDailyCosts(params);
    if (response.error) {
      throw new Error(response.error.message || 'Failed to fetch daily costs');
    }
    // Backend returns { days: [...], startDate, endDate }
    return response.data as any;
  }, [JSON.stringify(params)]);
}

export function useCostsBySku(limit: number = 50) {
  return useData('costsBySku', async () => {
    const client = getApiClient();
    const response = await client.getCostsBySku(limit);
    if (response.error) {
      throw new Error(response.error.message || 'Failed to fetch costs by SKU');
    }
    return response.data as any;
  }, [limit]);
}

// ─── Config/Connections Hooks ────────────────────────────────────────────────

export function useConfigs() {
  return useData('configs', async () => {
    const client = getApiClient();
    const response = await client.getConnections();
    if (response.error) {
      throw new Error(response.error.message || 'Failed to fetch connections');
    }
    return response.data as any;
  }, []);
}

export function useCreateConfig() {
  const client = getApiClient();
  return useCallback(async (data: any) => {
    const response = await client.createConnection(data);
    if (response.error) {
      throw new Error(response.error.message || 'Failed to create connection');
    }
    return response.data;
  }, []);
}

export function useDeleteConfig() {
  const client = getApiClient();
  return useCallback(async (configId: string) => {
    // Use fetch directly for DELETE with 204
    const result = await client.request(`api/v1/config/${configId}`, { method: 'DELETE' });
    if (result.error) {
      throw new Error(result.error.message || 'Failed to delete connection');
    }
    return result;
  }, []);
}

// ─── Alerts Hooks ────────────────────────────────────────────────────────────

export function useAlerts(params?: {
  status?: string;
  severity?: string;
  limit?: number;
}) {
  return useData('alerts', async () => {
    const client = getApiClient();
    const response = await client.getAlerts(params);
    if (response.error) {
      throw new Error(response.error.message || 'Failed to fetch alerts');
    }
    // Backend returns { alerts: [...], count }
    return response.data as any;
  }, [JSON.stringify(params)]);
}

export function useActiveAlerts() {
  return useData('activeAlerts', async () => {
    const client = getApiClient();
    const response = await client.getActiveAlerts();
    if (response.error) {
      throw new Error(response.error.message || 'Failed to fetch active alerts');
    }
    return response.data as any;
  }, []);
}

// ─── Runs/Extractors Hooks ───────────────────────────────────────────────────

export function useExtractorRuns(limit: number = 50) {
  return useData('extractorRuns', async () => {
    const client = getApiClient();
    const response = await client.getRuns(limit);
    if (response.error) {
      throw new Error(response.error.message || 'Failed to fetch runs');
    }
    // Backend returns { runs: [...], count }
    return response.data as any;
  }, [limit]);
}

export function useTriggerExtractor() {
  const client = getApiClient();
  return useCallback(async (type: string, provider: string, configId?: string) => {
    const response = await client.runExtractor(type, provider, configId);
    if (response.error) {
      throw new Error(response.error.message || 'Failed to trigger extractor');
    }
    return response.data;
  }, []);
}

// ─── Dashboard Summary ───────────────────────────────────────────────────────

export function useDashboardSummary() {
  return useData('dashboardSummary', async () => {
    const client = getApiClient();
    const [costsRes, alertsRes, runsRes] = await Promise.all([
      client.getCostTotals(),
      client.getAlerts({ limit: 100 }),
      client.getRuns(5),
    ]);

    if (costsRes.error) throw new Error(costsRes.error.message);
    if (alertsRes.error) throw new Error(alertsRes.error.message);
    if (runsRes.error) throw new Error(runsRes.error.message);

    return {
      costs: costsRes.data,
      alerts: alertsRes.data,
      runs: runsRes.data,
    };
  }, []);
}

// ─── Transform Helpers ───────────────────────────────────────────────────────

/**
 * Transform backend daily cost data to chart format.
 * Backend: { days: [{ date, gcp?, azure?, llm? }] }
 * Chart expects: [{ day, label, gcp, azure, llm, total }]
 */
export function transformDailyData(days: any[]): Array<{
  day: number;
  label: string;
  gcp: number;
  azure: number;
  llm: number;
  total: number;
}> {
  return days.map((d, i) => {
    const date = new Date(d.date);
    const label = `Nov ${date.getDate()}`;
    const gcp = Number(d.gcp || d.GCP || 0);
    const azure = Number(d.azure || d.Azure || 0);
    const llm = Number(d.llm || d.LLM || 0);
    return {
      day: i + 1,
      label,
      gcp,
      azure,
      llm,
      total: gcp + azure + llm,
    };
  });
}

/**
 * Transform backend configs to connections format.
 * Backend: [{ id, provider, name, credential_type, config, created_at }]
 * Frontend expects: [{ id, prov, name, scope, status, lastRun, rows, auth, expires, projectId?, resources? }]
 */
export function transformConfigsToConnections(configs: any[]): any[] {
  return (configs || []).map(c => ({
    id: c.id,
    prov: c.provider || c.prov,
    name: c.name,
    scope: `Provider · ${c.credential_type || 'unknown'}`,
    status: 'ok' as const,
    lastRun: 'unknown',
    rows: '—',
    auth: c.credential_type || 'unknown',
    expires: 'unknown',
    projectId: c.projectId || null,
    resources: c.resources || [],
  }));
}

export function transformRuns(runs: any[]): any[] {
  return (runs || []).map(r => ({
    id: r.id,
    type: r.extractor_type || r.type || 'unknown',
    prov: r.provider || 'unknown',
    status: r.status || 'unknown',
    started: r.started_at ? new Date(r.started_at).toLocaleString() : '—',
    dur: calcDuration(r.started_at, r.finished_at),
    rows: r.records_extracted || 0,
    err: r.error_message || null,
  }));
}

function calcDuration(startedAt: string | null, finishedAt: string | null): string {
  if (!startedAt) return '—';
  const start = new Date(startedAt).getTime();
  const end = finishedAt ? new Date(finishedAt).getTime() : Date.now();
  const secs = Math.round((end - start) / 1000);
  if (secs < 60) return `${secs}s`;
  const mins = Math.floor(secs / 60);
  const remainingSecs = secs % 60;
  return remainingSecs > 0 ? `${mins}m ${remainingSecs}s` : `${mins}m`;
}

// ─── Auth Hook ───────────────────────────────────────────────────────────────

export function useAuth() {
  const client = getApiClient();

  const login = useCallback(async (username: string, password: string) => {
    const response = await client.login(username, password);
    if (response.error) {
      throw new Error(response.error.message || 'Login failed');
    }
    return response.data;
  }, []);

  const logout = useCallback(async () => {
    await client.logout();
    window.location.href = '/login';
  }, []);

  return { login, logout };
}
