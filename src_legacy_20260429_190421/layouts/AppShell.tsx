import {useState} from "react"; import {Outlet} from "react-router-dom"; import {Sidebar} from "./Sidebar";
export function AppShell(){
  const [collapsed,setCollapsed]=useState(false);
  return <div className={"app-layout"+(collapsed?" collapsed"")}>
    <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} />
    <main className="main"><Outlet /></main>
  </div>;
}
