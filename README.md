# Finna App UI

React frontend for the FinOps dashboard — cloud cost visibility and governance.

## Quick Start

### Mock Data (local dev)

```bash
# Mock API server (port 3000 — serves static files + mock data)
bun dev-server.ts
```

→ http://localhost:3000

### With real backend

Configure `src/services/api.ts` (or set `VITE_API_URL` env var) to point to the backend:

```bash
# Frontend dev server (port 3000)
npm run dev
```

## Project Structure

```
finna-app-ui/
├── src/                          # React frontend
│   ├── main.tsx                  # App entry + auth flow
│   ├── components/
│   │   ├── console/              # Layout shell (Sidebar, Console, Toaster)
│   │   ├── common/               # Shared UI (Button, Badge, Icon, TopBar…)
│   │   ├── screens/              # Page components (Dashboard, Explorer…)
│   │   ├── modals/               # Dialog components
│   │   └── drawers/              # Slide-out panels
│   ├── hooks/
│   │   ├── useApi.ts             # Data hooks (useCosts, useAlerts, useConfigs…)
│   │   ├── useTheme.ts           # Theme/density/accent state
│   │   └── useLocalStorage.ts    # Persistent state
│   ├── services/
│   │   ├── api.ts                # API client configuration
│   │   └── apiClient.ts          # HTTP client + auth (login/logout/token)
│   ├── data/
│   │   └── index.ts              # Mock data seed
│   ├── types/
│   │   └── index.ts              # TypeScript types
│   └── utils/
│       └── fmt.ts                # Currency/date formatters
├── frontend/
│   ├── Dockerfile                # Multi-stage Dockerfile
│   └── nginx.conf                # Nginx config (SPA + API proxy)
├── index.html                    # HTML entry point
├── package.json
├── tsconfig.json
├── vite.config.ts                # Vite config
└── Dockerfile                    # Build + runtime (nginx)
```

## Screens

- **Dashboard** — Overview with charts, stats, alerts, recent runs
- **Cost Explorer** — Filterable/sortable cost records table
- **Connections** — Cloud provider connections (cards/table)
- **Alerts** — Firing/resolved alert rules
- **Run Log** — Extractor run history
- **Projects** — Project budget governance
- **Budgets** — Monthly caps per scope
- **Settings** — Workspace configuration

## Authentication

Default credentials: `admin` / `admin`

Returns a JWT token stored in `localStorage` as `finna-auth-token`.

## Build

```bash
npm run build    # Production build to dist/
npm run preview  # Preview production build
```

## Docker

```bash
docker build -t finna-app-ui .
docker run -p 3000:80 finna-app-ui
```

In Docker Compose, this service depends on the `api` service from `finna-app` for the backend.

## CI/CD

- **CI**: Runs TypeScript type-check and build on every push/PR to `main`
- **Docker**: Builds and pushes to GHCR on `v*` tags

## Monorepo Note

This is now a standalone repo. The backend API lives in the parent `finna-app` repo.
For local full-stack development, run both repos separately and configure the
frontend's `api.ts` to point to `http://localhost:8000`.
