import axios from "axios"; import type { AxiosError } from "axios";
const API = axios.create({ baseURL:"http://95.216.165.97:8000", headers:{"Content-Type":"application/json"} });
API.interceptors.request.use((config)=>{
  const t = localStorage.getItem("finna_token");
  if(t && config.headers) config.headers.Authorization = `Bearer ${t}`;
  return config;
});
export default API;
export type ApiError = AxiosError<{ detail?: string }>;
