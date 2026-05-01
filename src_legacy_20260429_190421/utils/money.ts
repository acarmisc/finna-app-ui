export function fmtMoney(n?:number|null, currency="EUR"):string{ if(n==null) return "—"; return new Intl.NumberFormat("it-IT",{style:"currency",currency}).format(n); }
export function fmtNumber(n?:number|null, digits=2):string{ if(n==null) return "—"; return n.toLocaleString("it-IT",{minimumFractionDigits:digits,maximumFractionDigits:digits}); }
