export const fmtTime = iso => new Date(iso).toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"});
export const fmtDate = iso => {
  const d=new Date(iso), n=new Date();
  if(d.toDateString()===n.toDateString()) return "Today";
  const y=new Date(n); y.setDate(n.getDate()-1);
  if(d.toDateString()===y.toDateString()) return "Yesterday";
  return d.toLocaleDateString([],{month:"short",day:"numeric",year:"numeric"});
};
export const fmtRelative = iso => {
  const diff = Date.now()-new Date(iso).getTime();
  if(diff<60000) return "just now";
  if(diff<3600000) return `${Math.floor(diff/60000)}m ago`;
  if(diff<86400000) return `${Math.floor(diff/3600000)}h ago`;
  return fmtDate(iso);
};
