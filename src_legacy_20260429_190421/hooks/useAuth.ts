import {useState,useEffect,useCallback} from "react"; import API from "../api/client";
export interface AuthUser { username:string; full_name?:string; }
export function useAuth(){
  const [user,setUser]=useState<AuthUser|null>(null);
  const [ready,setReady]=useState(false);
  const me=useCallback(async()=>{ try{ const r=await API.get("/api/v1/auth/me"); const u=r.data; if(u.username) setUser({username:u.username,full_name:u.full_name}); }catch{ setUser(null); } setReady(true); },[]);
  useEffect(()=>{ me(); },[me]);
  const login=useCallback(async(payload:{username:string;password:string})=>{ const r=await API.post("/api/v1/auth/login",payload); const token=r.data?.access_token; if(!token) throw new Error("Nessun token ricevuto"); localStorage.setItem("finna_token",token); await me(); return token; },[me]);
  const logout=useCallback(()=>{ localStorage.removeItem("finna_token"); setUser(null); },[]);
  return {user,ready,login,logout};
}
