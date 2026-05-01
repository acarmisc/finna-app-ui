// API types based on FINNA-APP API specification

// --- Enums ---

export type Provider = 'azure' | 'gcp' | 'llm'
export type CredentialType = 'service_principal' | 'managed_identity' | 'cli' | 'device_code'
export type RunStatus = 'running' | 'completed' | 'failed' | 'cancelled' | 'pending'
export type AlertSeverity = 'err' | 'warn' | 'ok'
export type AlertStatus = 'firing' | 'resolved' | 'all'

// --- Authentication DTOs ---

export interface TokenRequest {
  username: string
  password: string
}

export interface TokenResponse {
  token: string
  access_token?: string
}

export interface ErrorResponse {
  detail: string
  error?: string
}

// --- Configuration DTOs ---

export interface CloudConfigCreate {
  provider: 'azure' | 'gcp'
  name: string
  credential_type: CredentialType
  config: Record<string, unknown>
}

export interface CloudConfigUpdate {
  name?: string | null
  credential_type?: CredentialType | null
  config?: Record<string, unknown> | null
}

export interface CloudConfigResponse {
  id: string
  provider: Provider
  name: string
  credential_type: string
  config: Record<string, unknown>
  created_at: string
  updated_at: string
}

export interface ConfigTestResult {
  ok: boolean
  provider: 'azure' | 'gcp'
  token_expires_at?: number
  checks: {
    auth: string
    scope?: string
    cost_management_api: string
    sample_rows?: number
  }
  error?: string
}

export interface AzureConfigInput {
  tenant_id: string
  client_id: string
  client_secret?: string
  subscription_id: string
  resource_groups?: string[]
  scope?: 'resourcegroup' | 'subscription'
  environment?: 'prod' | 'staging' | 'dev'
  team?: string
}

export interface GCPConfigInput {
  project_id: string
  billing_account_id?: string
  bigquery_dataset?: string
  bigquery_table?: string
  environment?: 'prod' | 'staging' | 'dev'
  team?: string
}

// --- Project DTOs ---

export interface ProjectResponse {
  id: string
  name: string
  slug?: string
  owner?: string
  cost_center?: string
  budget_cap?: number | null
  mtd?: number
  tags?: Record<string, string>
  created_at?: string
  note?: string
}

export interface ProjectCreate {
  name: string
  slug?: string
  owner?: string
  cost_center?: string
  budget_cap?: number
  tags?: Record<string, string>
  note?: string
}

// --- Cost DTOs ---

export interface CostRecord {
  id: string
  prov: Provider
  name: string
  sku: string
  mtd: number
  delta?: number
  prev?: number
  tags?: Record<string, string>
  date?: string
}

export interface CostListResponse {
  costs: CostRecord[]
  totals: Record<string, number>
  filtered: boolean
  startDate: string
  endDate: string
}

export interface CostTotalsResponse {
  totals: Record<string, number>
  startDate: string
  endDate: string
}

export interface CostBySkuResponse {
  costs: CostRecord[]
  totalRows: number
}

export interface CostDailyResponse {
  days: Array<{ date: string; azure?: number; gcp?: number; llm?: number }>
  startDate: string
  endDate: string
}

// --- Alert DTOs ---

export interface AlertRecord {
  id: string
  title: string
  description: string
  severity: AlertSeverity
  resource: string
  service: string
  provider: string
  cost_impact: number
  first_seen: string
  last_seen: string
  is_acknowledged: boolean
}

export interface AlertListResponse {
  alerts: AlertRecord[]
  count: number
}

export interface AlertStatsResponse {
  total: number
  by_severity: Record<string, number>
  by_provider: Record<string, number>
  acknowledged: number
  pending: number
  stats?: Array<{ status: string; severity: string; count: number }>
}

// --- Extractor Registry DTOs ---

export interface ExtractorCreate {
  name: string
  provider: string
  extractor_type: string
  enabled?: boolean
  schedule?: string
  config_id?: string
}

export interface ExtractorUpdate {
  name?: string
  enabled?: boolean
  schedule?: string
  config_id?: string
}

export interface ExtractorResponse {
  id: string
  name: string
  provider: string
  extractor_type: string
  enabled: boolean
  schedule?: string
  config_id?: string
  status: 'idle' | 'running' | 'completed' | 'failed'
  last_run_id?: string
  last_run_at?: string
  created_at: string
  updated_at: string
}

export interface ExtractorListResponse {
  extractors: ExtractorResponse[]
  count: number
}

export interface ExtractorRunTriggerRequest {
  config_id?: string
}

export interface ExtractorRunTriggerResponse {
  run_id: string
  status: string
  extractor_id: string
}

// --- Legacy Extractor Run DTOs ---

export interface ExtractorRunRequest {
  provider: 'azure' | 'gcp'
  config_id: string
  extractor_type?: string
}

export interface ExtractorRunResponse {
  id: string
  config_id: string
  provider: string
  extractor_type: string
  status: string
  started_at: string
}

export interface ExtractorRunStatus {
  id: string
  provider: string
  extractor_type: string
  status: string
  started_at: string
  finished_at?: string
  records_extracted?: number
  error_message?: string
}

// --- Health DTOs ---

export interface HealthResponse {
  status: 'ok' | 'degraded'
  api: string
  database: string
}

// --- UI Store Types ---

export interface ViewState {
  sidebarCollapsed: boolean
  theme: 'dark' | 'light'
  dateRange: {
    start: Date | null
    end: Date | null
  }
}
