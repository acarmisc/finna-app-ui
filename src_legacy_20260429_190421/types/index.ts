export type Provider = "azure" | "gcp" | "aws" | "llm";
export interface User { id:number; username:string; email:string; full_name:string; is_active:boolean; }
export interface ProjectLink { id:number; name:string; provider:Provider; linked_projects:string[]; }
export interface CloudConfig { id:number; name:string; provider:Provider; credentials:string|null; env_vars?:Record<string,string>; is_active:boolean; last_used_at?:string|null; created_at:string; updated_at:string; project_id?:number|null; }
export interface CostRecord { id?:number; date:string; provider:Provider; service_category:string; sku?:string|null; project_id?:number|null; resource_id?:string|null; cost:number; currency:string; raw_line_item?:any; llm_model?:string|null; llm_tokens_in?:number|null; llm_tokens_out?:number|null; created_at?:string; }
export interface Alert { id:number; title:string; severity:"info"|"warning"|"error"; message:string; status:"active"|"resolved"; source:string; provider?:Provider|null; created_at:string; resolved_at?:string|null; }
export interface ExtractorRun { id:number; extractor_name:string; status:"queued"|"running"|"completed"|"failed"; started_at?:string|null; finished_at?:string|null; records_processed?:number|null; error_message?:string|null; }
export interface ConfigFormData { name:string; provider:Provider; credentials?:string; envJson?:string; is_active?:boolean; project_id?:number|null; }
