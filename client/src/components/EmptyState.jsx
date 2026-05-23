import React from "react";

export default function EmptyState({ onMenuClick }){
  return (
    <div className="flex-1 flex flex-col items-center justify-center gap-4 p-8 animate-fade-up">
      {/* Mobile menu button */}
      <button onClick={onMenuClick}
        className="md:hidden absolute top-4 left-4 p-2 rounded-lg bg-elevated border border-border text-tx-secondary hover:text-tx-primary transition-colors">
        <MenuIcon/>
      </button>

      <div className="text-6xl select-none">💬</div>
      <div className="text-center">
        <p className="font-extrabold text-2xl tracking-tight mb-2">Pick a conversation</p>
        <p className="text-tx-secondary text-sm">Join a channel or start a direct message from the sidebar</p>
      </div>

      {/* Feature pills */}
      <div className="flex flex-wrap justify-center gap-2 mt-4 max-w-sm">
        {["# Channels","💬 Direct Messages","✓✓ Read Receipts","● Live Presence","⌨ Typing Indicators","🔔 Notifications"].map(f=>(
          <span key={f} className="text-xs font-mono px-3 py-1.5 rounded-full bg-elevated border border-border text-tx-secondary">
            {f}
          </span>
        ))}
      </div>
    </div>
  );
}
function MenuIcon(){ return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>; }
