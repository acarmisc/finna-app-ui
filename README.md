# FinOps Console

A modern FinOps monitoring dashboard built with React, TypeScript, Vite, and Tailwind CSS.

## 🚀 Features

- **Multi-cloud Cost Monitoring**: Track Azure, GCP, and LLM costs in one place
- **Real-time Dashboard**: Visualize cost trends with interactive charts
- **Alert Management**: Monitor andacknowledge alerts from all providers
- **Job Scheduler**: Trigger and monitor cost extraction jobs
- **Configuration Management**: Manage cloud provider credentials securely
- **Responsive Design**: Works on desktop, tablet, and mobile devices

## 🎨 Design System

FinOps Console follows a "pixel-art corporate" design philosophy:
- Sharp corners, visible borders
- Mono numerics for consistent data display
- Flat color blocks
- Bracketed button labels like `[ RUN EXTRACTOR ]`

## 🛠️ Tech Stack

- **Frontend**: React 18, TypeScript, Vite
- **UI Library**: shadcn/ui (new-york-v4 registry)
- **Styling**: Tailwind CSS v4 with custom design tokens
- **State Management**: Zustand, TanStack Query
- **Authentication**: JWT Bearer tokens

## 📸 Screenshots

### Dashboard
The main dashboard provides a high-level overview of costs, alerts, and extractors.

### Extractors Page
Manage and trigger cost extraction jobs with detailed run history.

### Configuration
Securely manage cloud provider credentials for Azure and GCP.

## 🚀 Getting Started

### Prerequisites

- Node.js 20+
- pnpm (recommended) or npm

### Installation

```bash
# Clone the repository
git clone https://github.com/acarmisc/finna-app-ui.git
cd finna-app-ui

# Install dependencies
pnpm install

# Start the development server
pnpm dev
```

### Build

```bash
pnpm build
pnpm preview
```

## 🌍 API Endpoints

The frontend connects to the FinOps Backend API at `/api/v1/`:

- `POST /api/v1/auth/login` - Login and get JWT token
- `GET /api/v1/config` - List cloud configurations
- `GET /api/v1/config/projects` - List FinOps projects
- `GET /api/v1/costs` - List cost records
- `GET /api/v1/costs/totals` - Get aggregated costs
- `GET /api/v1/costs/daily` - Daily cost breakdown
- `GET /api/v1/alerts` - List alerts
- `GET /api/v1/extractors/status` - Get extractor runs
- `POST /api/v1/extractors/run` - Trigger an extractor

## 🔐 Authentication

All API endpoints (except `/healthz`) require a JWT Bearer token:

```bash
curl -X POST https://api.example.com/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin"}'
```

## 🐳 Docker

```bash
docker build -t finna-app-ui .
docker run -p 80:80 finna-app-ui
```

## 📦 Kubernetes

Deploy to GKE in the `finna-app-staging` namespace:

```bash
kubectl apply -f k8s/deployment.yaml
```

## 📄 License

MIT License - see LICENSE file for details.

## 👤 Author

Andrea Carmisciano

## 🌐 Live Demo Access

**Frontend (UI):** `https://finna-app-ui.ces.abssrv.it`  
**Backend (API):** `https://finna-app.ces.abssrv.it`  
**Namespace:** `finna-app-staging`  
**Credentials:** Username: `admin` | Password: `admin`
