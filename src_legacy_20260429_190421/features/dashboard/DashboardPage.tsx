import {useMemo} from "react"; import {useNavigate} from "react-router-dom"; import {useQuery} from "@tanstack/react-query";
import {TrendingUp,TrendingDown,AlertTriangle,Layers,Cpu} from "lucide-react";
import {AreaChart,Area,XAxis,YAxis,Tooltip,CartesianGrid,ResponsiveContainer} from "recharts";
import {fmtMoney,fmtNumber} from "../../utils/money"; import {fmtShortDate,fmtDateTime} from "../../utils/time"; import API from "../../api/client";

function CardStat({label,value,delta,Icon}:any){ const up=(delta||0)\u003e=0; return <div className="card"><div className="card-bd"><div className="flex items-center justify-between mb-2"><span className="text-xs uppercase tracking-widest text-fg-muted font-semibold">{label}</span><Icon size={16} className="text-fg-subtle" /></div><div className="text-2xl font-mono font-bold leading-none">{value}</div><div className="mt-2 flex items-center gap-1 text-xs font-mono">{up?<TrendingUp size={12} className="text-accent" />:<TrendingDown size={12} className="text-danger" />}<span className={up?"text-accent":"text-danger"}>{fmtNumber(Math.abs(delta||0),1)}%</span><span className="text-fg-subtle ml-1">vs mese scorso</span></div></div></div>; }

export function DashboardPage(){
  const nav=useNavigate();
  const kpis=useQuery({queryKey:["costs","totals"],queryFn:async()=>(await API.get("/api/v1/costs/totals")).data});
  const daily=useQuery({queryKey:["costs","daily"],queryFn:async()=>(await API.get("/api/v1/costs/daily?days=30")).data});
  const alerts=useQuery({queryKey:["alerts","active"],queryFn:async()=>(await API.get("/api/v1/alerts/active")).data});
  const projects=useQuery({queryKey:["projects"],queryFn:async()=>(await API.get("/api/v1/config/projects")).data});
  const runs=useQuery({queryKey:["extractors","runs"],queryFn:async()=>(await API.get("/api/v1/extractors/runs?limit=5")).data});
  const chartData=useMemo(()=>{ if(!Array.isArray(daily.data)) return []; return daily.data.map((d:any)=>({date:fmtShortDate(d.date),cost:Number(d.cost||0),azure:Number(d.azure||0),gcp:Number(d.gcp||0),aws:Number(d.aws||0),llm:Number(d.llm||0)})); },[daily.data]);
  const total=Number(kpis.data?.total_cost||0); const llmCost=Number(kpis.data?.llm_cost||0);
  const activeAlerts=Array.isArray(alerts.data)?alerts.data.length:0;
  const topProjects=Array.isArray(projects.data)?projects.data.slice(0,3):[];
  const recentRuns=Array.isArray(runs.data)?runs.data.slice(0,5):[];
  return <div className="page">
    <div className="page-head"><div><h1>Dashboard</h1><p className="sub">Overview dei costi cloud e LLM</p></div><div className="actions"><button className="btn btn-primary btn-sm" onClick={()=>nav("/costs")}>Vai ai costi</button></div></div>
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
      <CardStat label="Costo totale" value={fmtMoney(total)} delta={-4.2} Icon={Layers} />
      <CardStat label="Costo LLM" value={fmtMoney(llmCost)} delta={12.5} Icon={Cpu} />
      <CardStat label="Progetti attivi" value={String(topProjects.length)} delta={0} Icon={Layers} />
      <CardStat label="Alert attivi" value={String(activeAlerts)} delta={activeAlerts\u003e0?1:0} Icon={AlertTriangle} />
    </div>
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 mb-6">
      <div className="card xl:col-span-2">
        <div className="card-hd"><h3>Andamento Costi - Ultimi 30 giorni</h3></div>
        <div className="card-bd h-80"><ResponsiveContainer width="100%" height="100%"><AreaChart data={chartData}><CartesianGrid stroke="#30363d" strokeDasharray="3 3" /><XAxis dataKey="date" stroke="#8b949e" fontSize={11} tickLine={false} axisLine={false} /><YAxis stroke="#8b949e" fontSize={11} tickLine={false} axisLine={false} tickFormatter={v=>`\u20ac${v}`} /><Tooltip contentStyle={{background:'#161b22',border:'1px solid #30363d'}} /><Area type="monotone" dataKey="gcp" stackId="a" stroke="#ea4335" fill="#ea4335" fillOpacity={0.2} /><Area type="monotone" dataKey="azure" stackId="a" stroke="#0078d4" fill="#0078d4" fillOpacity={0.2} /><Area type="monotone" dataKey="aws" stackId="a" stroke="#ff9900" fill="#ff9900" fillOpacity={0.2} /><Area type="monotone" dataKey="llm" stackId="a" stroke="#7c3aed" fill="#7c3aed" fillOpacity={0.2} /></AreaChart></ResponsiveContainer></div>
      </div>
      <div className="card">
        <div className="card-hd"><h3>Top Progetti</h3></div>
        <div className="card-bd">{topProjects.length\u003e0?<ul className="divide-y divide-border">{topProjects.map((p:any)=><li key={p.id} className="py-3 flex items-center justify-between"><div><div className="font-medium">{p.name}</div><div className="text-xs text-fg-muted font-mono">{p.provider||"n/a"}</div></div><span className="font-mono font-semibold">{fmtMoney(p.cost)}</span></li>)}</ul>:<p className="text-fg-muted text-sm">Nessun dato disponibile.</p>}</div>
      </div>
    </div>
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
      <div className="card">
        <div className="card-hd"><h3>Alert Attivi</h3></div>
        <div className="card-bd">{alerts.isLoading?<p className="text-sm text-fg-muted">Caricamento...</p>:activeAlerts\u003e0?<ul className="divide-y divide-border">{alerts.data.map((a:any)=><li key={a.id} className="py-3"><div className="flex items-center gap-2 mb-1"><span className={"badge"+(a.severity==="error"?" badge-err":a.severity==="warning"?" badge-warn":" badge-info")}>{a.severity}</span><span className="text-xs text-fg-muted">{a.source}</span></div><p className="text-sm font-medium">{a.title}</p><p className="text-xs text-fg-subtle mt-1">{a.message}</p></li>)}</ul>:<p className="text-sm text-fg-muted">Nessun alert attivo. Ottimo!</p>}</div>
      </div>
      <div className="card">
        <div className="card-hd"><h3>Estrazioni Recenti</h3></div>
        <div className="card-bd">{runs.isLoading?<p className="text-sm text-fg-muted">Caricamento...</p>:recentRuns.length\u003e0?<ul className="divide-y divide-border">{recentRuns.map((r:any)=><li key={r.id} className="py-3 flex items-center justify-between"><div><div className="text-sm font-medium">{r.extractor_name}</div><div className="text-xs text-fg-muted font-mono">{fmtDateTime(r.started_at)}</div></div><span className={"badge"+(r.status==="completed"?" badge-ok":r.status==="failed"?" badge-err":" badge-warn")}>{r.status}</span></li>)}</ul>:<p className="text-sm text-fg-muted">Nessuna estrazione recente.</p>}</div>
      </div>
    </div>
  </div>;
}
