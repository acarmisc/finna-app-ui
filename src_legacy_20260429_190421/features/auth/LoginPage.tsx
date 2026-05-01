import {useState} from "react"; import {useNavigate} from "react-router-dom"; import {useAuth} from "../../hooks/useAuth";
export function LoginPage(){
  const [uname,setUname]=useState(""); const [pwd,setPwd]=useState(""); const [err,setErr]=useState(""); const [loading,setLoading]=useState(false);
  const nav=useNavigate(); const {login}=useAuth();
  const submit=async(e:React.FormEvent)=>{ e.preventDefault(); setErr(""); setLoading(true); try{ await login({username:uname,password:pwd}); nav("/dashboard",{replace:true}); }catch(e:any){ setErr(e?.response?.data?.detail||"Credenziali non valide"); }finally{ setLoading(false); } };
  return <div className="min-h-screen flex items-center justify-center bg-bg p-4">
    <div className="card w-full max-w-sm">
      <div className="card-hd justify-center"><h3 className="pixel-headline tracking-widest">FINNA v2</h3></div>
      <div className="card-bd">
        <form onSubmit={submit} className="space-y-4">
          <div><label className="label">Username</label><input className="inp" value={uname} onChange={e=>setUname(e.target.value)} required /></div>
          <div><label className="label">Password</label><input className="inp" type="password" value={pwd} onChange={e=>setPwd(e.target.value)} required /></div>
          {err&&<p className="hint error">{err}</p>}
          <button type="submit" className="btn btn-primary btn-block" disabled={loading}>{loading?"VERIFICA...":"ENTRA"}</button>
        </form>
      </div>
    </div>
  </div>;
}
