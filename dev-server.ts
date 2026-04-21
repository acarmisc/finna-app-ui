/**
 * Combined dev server: serves static files + mock API on one port
 * Usage: bun dev-server.ts
 */

import { serve } from 'bun';
import { readFileSync } from 'fs';
import { join } from 'path';

const DIST_DIR = join(__dirname, 'dist');
const INDEX_HTML = readFileSync(join(DIST_DIR, 'index.html'), 'utf-8');

// Import mock data and logic
const COSTS = [
  { prov: 'gcp' as const, name: 'prod-platform', sku: 'BigQuery · analysis', mtd: 4120.02, delta: 18.4, prev: 3480 },
  { prov: 'gcp' as const, name: 'prod-platform', sku: 'Compute Engine', mtd: 812.40, delta: 4.1, prev: 780 },
  { prov: 'gcp' as const, name: 'prod-platform', sku: 'Cloud Storage', mtd: 214.08, delta: -2.2, prev: 219 },
  { prov: 'gcp' as const, name: 'staging-ml', sku: 'Compute Engine', mtd: 412.08, delta: 8.2, prev: 380 },
  { prov: 'gcp' as const, name: 'staging-ml', sku: 'Vertex AI · endpoints', mtd: 188.40, delta: 32.0, prev: 142 },
  { prov: 'azure' as const, name: 'rg-analytics', sku: 'Virtual Machines', mtd: 2880.41, delta: 64.2, prev: 1754 },
  { prov: 'azure' as const, name: 'rg-analytics', sku: 'Synapse Analytics', mtd: 1214.00, delta: 11.2, prev: 1091 },
  { prov: 'azure' as const, name: 'rg-infra', sku: 'Storage', mtd: 842.12, delta: -4.1, prev: 878 },
  { prov: 'azure' as const, name: 'rg-infra', sku: 'Log Analytics', mtd: 318.20, delta: 1.2, prev: 314 },
  { prov: 'azure' as const, name: 'rg-dev', sku: 'App Service', mtd: 124.00, delta: -3.4, prev: 128 },
  { prov: 'azure' as const, name: 'rg-dev', sku: 'PostgreSQL flex', mtd: 84.00, delta: 0.0, prev: 84 },
  { prov: 'llm' as const, name: 'claude-sonnet-4', sku: 'Input tokens', mtd: 381.22, delta: 120.0, prev: 173 },
  { prov: 'llm' as const, name: 'claude-sonnet-4', sku: 'Output tokens', mtd: 188.28, delta: 96.4, prev: 96 },
  { prov: 'llm' as const, name: 'gpt-4o-mini', sku: 'Input tokens', mtd: 44.10, delta: 18.0, prev: 37 },
  { prov: 'llm' as const, name: 'gpt-4o-mini', sku: 'Output tokens', mtd: 18.30, delta: 22.0, prev: 15 },
];

const RUNS = [
  { id: 'r_01jf2kn8b3', type: 'azure_cost', prov: 'azure', status: 'success', started: '4 min ago', dur: '42s', rows: 1204 },
  { id: 'r_01jf2kn7a1', type: 'gcp_billing', prov: 'gcp', status: 'success', started: '4 min ago', dur: '1m 08s', rows: 3092 },
  { id: 'r_01jf2kn6x9', type: 'exchange_rates', prov: 'ecb', status: 'success', started: '4 min ago', dur: '2s', rows: 31 },
  { id: 'r_01jf2kn5v4', type: 'otel_llm', prov: 'llm', status: 'running', started: '1 min ago', dur: '—', rows: 0 },
  { id: 'r_01jf1zna2b', type: 'azure_cost', prov: 'azure', status: 'failed', started: '1 day ago', dur: '5s', rows: 0, err: 'AADSTS700082: token expired' },
];

const CONNECTIONS = [
  { id: 'c_az_prod', prov: 'azure', name: 'acme-prod', scope: 'Subscription · Cost Management Reader', status: 'ok', lastRun: '4m ago', rows: '1,204', auth: 'service_principal', expires: 'in 42 days', projectId: 'p_platform' },
  { id: 'c_gcp_prod', prov: 'gcp', name: 'prod-platform', scope: 'BQ billing export · dataset: billing', status: 'ok', lastRun: '4m ago', rows: '3,092', auth: 'adc', expires: 'n/a', projectId: 'p_platform' },
  { id: 'c_gcp_ml', prov: 'gcp', name: 'staging-ml', scope: 'BQ billing export · dataset: billing_ml', status: 'ok', lastRun: '4m ago', rows: '208', auth: 'service_account_key', expires: 'in 184 days', projectId: 'p_ml' },
  { id: 'c_llm_us', prov: 'llm', name: 'otel-gateway-us', scope: 'OTel collector · 0.0.0.0:4317', status: 'warn', lastRun: '12m ago', auth: 'otlp', expires: 'n/a', projectId: 'p_ml' },
];

const ALERTS = [
  { id: 'a1', severity: 'err', title: 'rg-analytics over budget', body: '$8,200 of $10,000 used. Forecast exceeds cap by Nov 28.', rule: "cost_mtd('rg-analytics') > 0.8 * budget", firing: '12m ago', channels: ['#finops · Slack', 'oncall@acme.co'] },
  { id: 'a2', severity: 'warn', title: 'LLM cost anomaly — claude-sonnet-4', body: '+120% vs 7d average. 3 traces flagged for review.', rule: "zscore(cost_1d, 'claude-sonnet-4', window=7) > 2.0", firing: '2h ago', channels: ['#finops · Slack'] },
  { id: 'a3', severity: 'ok', title: 'Nightly extraction SLA', body: 'All 4 extractors completed within 15 min window.', rule: 'extractor_health.last_success < 6h', firing: null, channels: ['oncall@acme.co'] },
  { id: 'a5', severity: 'warn', title: 'BigQuery scan cost spike — prod-platform', body: '$412 in the last 6 hours across 18 queries.', rule: "sum(cost_1h, 'prod-platform', sku='BigQuery') > 60 for 3h", firing: '42m ago', channels: ['#finops · Slack'] },
];

const DAYS = Array.from({ length: 30 }, (_, i) => {
  const day = i + 1;
  const seasonal = Math.sin((i - 2) * 0.55);
  const gcp = Math.round(260 + seasonal * 70 + i * 4);
  const azure = Math.round(170 + Math.cos(i * 0.4) * 50 + i * 3);
  const llm = Math.round(18 + i * 1.6 + Math.max(0, i - 20) * 8);
  return { day, label: `Nov ${day}`, gcp, azure, llm, total: gcp + azure + llm };
});

const FIN_PROJECTS = [
  { id: 'p_platform', name: 'Platform', slug: 'platform', owner: 'platform-eng@acme.co', costCenter: 'eng-001', budgetCap: 14000, mtd: 8412.22, tags: { env: 'prod', business_unit: 'core' }, created: '2025-02-14', note: 'Core platform + shared data infra.' },
  { id: 'p_ml', name: 'ML & AI', slug: 'ml-ai', owner: 'ml-team@acme.co', costCenter: 'ml-002', budgetCap: 3500, mtd: 1241.40, tags: { env: 'mixed', business_unit: 'ai' }, created: '2025-04-02', note: 'Training, serving and LLM spend.' },
  { id: 'p_analytics', name: 'Analytics', slug: 'analytics', owner: 'data@acme.co', costCenter: 'data-004', budgetCap: 10000, mtd: 4094.41, tags: { env: 'prod', business_unit: 'data' }, created: '2024-11-06', note: 'BI, dashboards, warehouse.' },
  { id: 'p_dev', name: 'Dev & Staging', slug: 'dev', owner: 'devops@acme.co', costCenter: 'eng-002', budgetCap: 900, mtd: 208.00, tags: { env: 'dev', business_unit: 'core' }, created: '2025-01-20', note: 'Developer sandboxes and CI.' },
];

const VALID_USERS = [
  { username: 'admin', password: 'admin', role: 'admin' },
  { username: 'user', password: 'password', role: 'user' },
];

function generateToken(username: string): string {
  const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
  const payload = Buffer.from(JSON.stringify({ sub: username, iat: Date.now(), exp: Date.now() + 3600000 })).toString('base64url');
  const signature = Buffer.from('mock-signature-12345').toString('base64url');
  return `${header}.${payload}.${signature}`;
}

function json(data: any, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

export default serve({
  port: 3000,
  fetch(req, server) {
    const url = new URL(req.url);

    // Health check
    if (url.pathname === '/healthz') {
      return json({ status: 'ok', api: 'finops-mock', database: 'mock' });
    }

    // Auth endpoint
    if (req.method === 'POST' && url.pathname === '/api/v1/auth/token') {
      return req.text().then(async (body) => {
        try {
          const { username, password } = JSON.parse(body);
          const user = VALID_USERS.find(u => u.username === username && u.password === password);
          if (!user) return json({ error: 'authentication_failed', message: 'Invalid credentials' }, 401);
          return json({ token: generateToken(username) });
        } catch {
          return json({ error: 'invalid_request', message: 'Invalid JSON' }, 400);
        }
      });
    }

    // Static files (before auth check)
    if (url.pathname === '/' || url.pathname === '/index.html') {
      return new Response(INDEX_HTML, {
        headers: { 'Content-Type': 'text/html' },
      });
    }

    // Serve static files from dist
    const filePath = join(DIST_DIR, url.pathname);
    try {
      const content = readFileSync(filePath);
      const ext = url.pathname.split('.').pop()?.toLowerCase();
      const types: Record<string, string> = {
        js: 'application/javascript',
        mjs: 'application/javascript',
        css: 'text/css',
        html: 'text/html',
        json: 'application/json',
        svg: 'image/svg+xml',
        png: 'image/png',
        jpg: 'image/jpeg',
        gif: 'image/gif',
        woff: 'font/woff',
        woff2: 'font/woff2',
        ttf: 'font/ttf',
        eot: 'application/vnd.ms-fontobject',
        ico: 'image/x-icon',
      };
      return new Response(content, {
        headers: { 'Content-Type': types[ext || ''] || 'application/octet-stream' },
      });
    } catch {
      // Not a static file, continue to API handlers
    }

    // API endpoints (require token for non-auth)
    const auth = req.headers.get('Authorization');
    const hasToken = auth?.startsWith('Bearer ');

    if (!hasToken) {
      return json({ error: 'unauthorized', message: 'Missing token' }, 401);
    }

    // Costs
    if (url.pathname === '/api/v1/costs') {
      return json({
        costs: COSTS.map((c, i) => ({ ...c, id: `cost_${i}`, date: '2025-11-14', currency: 'USD', tags: {} })),
        totals: {
          gcp: DAYS.reduce((a, d) => a + d.gcp, 0),
          azure: DAYS.reduce((a, d) => a + d.azure, 0),
          llm: DAYS.reduce((a, d) => a + d.llm, 0),
        },
        filtered: true,
        startDate: '2025-11-01',
        endDate: '2025-11-14',
      });
    }

    if (url.pathname === '/api/v1/costs/totals') {
      return json({
        totals: {
          gcp: { total: DAYS.reduce((a, d) => a + d.gcp, 0), records: DAYS.length },
          azure: { total: DAYS.reduce((a, d) => a + d.azure, 0), records: DAYS.length },
          llm: { total: DAYS.reduce((a, d) => a + d.llm, 0), records: DAYS.length },
        },
        startDate: '2025-11-01',
        endDate: '2025-11-14',
      });
    }

    if (url.pathname === '/api/v1/costs/by-sku') {
      return json({ costs: COSTS, totalRows: COSTS.length });
    }

    if (url.pathname === '/api/v1/costs/daily') {
      const dailyData = DAYS.flatMap(d => [
        { date: d.label, gcp: d.gcp, azure: 0, llm: 0 },
        { date: d.label, gcp: 0, azure: d.azure, llm: 0 },
        { date: d.label, gcp: 0, azure: 0, llm: d.llm },
      ]);
      return json({ days: dailyData, startDate: '2025-11-01', endDate: '2025-11-14' });
    }

    // Config/Connections
    if (url.pathname === '/api/v1/config') {
      return json(CONNECTIONS.map(c => ({
        id: c.id, provider: c.prov, name: c.name,
        credential_type: c.auth.replace(/\s+/g, '_'),
        config: {}, created_at: new Date().toISOString(), updated_at: new Date().toISOString(),
      })));
    }

    if (req.method === 'POST' && url.pathname === '/api/v1/config') {
      return json({
        id: `c_mock_${Date.now()}`, provider: 'azure', name: 'New Connection',
        credential_type: 'service_principal', config: {},
        created_at: new Date().toISOString(), updated_at: new Date().toISOString(),
      }, 201);
    }

    if (req.method === 'DELETE' && url.pathname.match(/^\/api\/v1\/config\/.+$/)) {
      return new Response(null, { status: 204 });
    }

    // Alerts
    if (url.pathname === '/api/v1/alerts') {
      return json({ alerts: ALERTS, count: ALERTS.length });
    }

    if (url.pathname === '/api/v1/alerts/active') {
      const active = ALERTS.filter(a => a.severity !== 'ok');
      return json({ alerts: active, count: active.length });
    }

    if (url.pathname === '/api/v1/alerts/stats') {
      return json({ stats: [] });
    }

    // Extractors/Runs
    if (url.pathname === '/api/v1/extractors/status') {
      return json({ runs: RUNS, count: RUNS.length });
    }

    if (req.method === 'POST' && url.pathname === '/api/v1/extractors/run') {
      return json({ run_id: `r_mock_${Date.now()}`, status: 'started' });
    }

    // Projects
    if (url.pathname === '/api/v1/config/projects') {
      return json(FIN_PROJECTS);
    }

    return json({ error: 'not_found' }, 404);
  },
});

console.log('🚀 Finna dev server → http://localhost:3000');
console.log('🔑 Credentials: admin/admin');
