import {useLocation,Link} from "react-router-dom"; import {LayoutDashboard,FolderKanban,Coins,Settings,AlertTriangle,Wifi,Puzzle,User,LogOut} from "lucide-react"; import {useAuth} from "../hooks/useAuth";
const items=[{path:"/dashboard",Icon:LayoutDashboard,label:"Dashboard"},{path:"/projects",Icon:FolderKanban,label:"Progetti"},{path:"/costs",Icon:Coins,label:"Costi"},{path:"/configs",Icon:Settings,label:"Config"},{path:"/extractors",Icon:Wifi,label:"Estrattori"},{path:"/alerts",Icon:AlertTriangle,label:"Alert"}];

export function Sidebar({collapsed,setCollapsed}:{collapsed:boolean;setCollapsed(v:boolean):void}){
  const loc=useLocation(); const {user,logout}=useAuth();
  return <aside className={"sidebar"+(collapsed?" collapsed":"")}>
    <div className="sb-logo" onClick={()=>setCollapsed(!collapsed)}><Puzzle size={18} />{!collapsed&&<span className="ml-2">FINNA v2</span>}</div>
    <div className="sb-section">MENU</div>
    <nav className="sb-nav">
      {items.map(({path,Icon,label})=>{
        const active=loc.pathname===path||loc.pathname.startsWith(path+"/");
        return <Link key={path} to={path} className={"sb-item"+(active?" active":"")}><Icon size={18} />{!collapsed&&<span className="sb-label">{label}</span>}</Link>;
      })}
    </nav>
    <div className="sb-foot">
      {collapsed?<button className="btn btn-ghost btn-sm" onClick={logout} title="Logout"><LogOut size={14} /></button>
      :<div className="flex items-center gap-2 w-full"><User size={14} className="text-fg-muted" /><span className="sb-user flex-1 truncate">{user?.full_name||user?.username||"\u2014"}</span><button className="btn btn-ghost btn-sm" onClick={logout} title="Logout"><LogOut size={14} /></button></div>}
    </div>
  </aside>;
}
