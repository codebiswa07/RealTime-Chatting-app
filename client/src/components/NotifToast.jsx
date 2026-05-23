import React from "react";
import { fmtRelative } from "../utils/time.js";

export default function NotifToast({ notif, onOpen }){
  return (
    <div onClick={onOpen}
      className="flex items-start gap-3 bg-elevated border border-border rounded-2xl p-3 sm:p-4
        cursor-pointer shadow-card animate-notif-in max-w-[300px] min-w-[240px]
        hover:bg-hover hover:border-accent/40 transition-all">
      <img src={notif.from.avatar} alt=""
        className="w-10 h-10 rounded-full bg-base flex-shrink-0 border border-border"/>
      <div className="flex-1 min-w-0">
        <div className="flex justify-between items-baseline mb-0.5">
          <span className="font-bold text-sm truncate">{notif.from.username}</span>
          <span className="text-[10px] font-mono text-tx-muted ml-2 flex-shrink-0">{fmtRelative(notif.timestamp)}</span>
        </div>
        <p className="text-xs text-tx-secondary truncate">{notif.preview}</p>
      </div>
    </div>
  );
}
