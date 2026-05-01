import {format,parseISO} from "date-fns"; import {it} from "date-fns/locale";
export function fmtDate(d?:string|null):string{ if(!d) return "—"; try{return format(parseISO(d),"dd MMM yyyy",{locale:it});}catch{return d;} }
export function fmtShortDate(d?:string|null):string{ if(!d) return "—"; try{return format(parseISO(d),"dd/MM/yyyy",{locale:it});}catch{return d;} }
export function fmtDateTime(d?:string|null):string{ if(!d) return "—"; try{return format(parseISO(d),"dd/MM/yyyy HH:mm",{locale:it});}catch{return d;} }
