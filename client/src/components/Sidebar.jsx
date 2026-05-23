import React, { useState } from "react";

const STATUS_CONFIG = {
  online:    { color:"bg-online",  label:"Online",    text:"text-online"  },
  away:      { color:"bg-away",    label:"Away",      text:"text-away"    },
  busy:      { color:"bg-busy",    label:"Busy",      text:"text-busy"    },
  invisible: { color:"bg-tx-muted",label:"Invisible", text:"text-tx-muted"},
};

export default function Sidebar({ state, joinChannel, openDM, setStatus, onClose }){
  const { me, rooms, onlineUsers, activeView, unreadDMs, connected } = state;
  const [showStatus, setShowStatus] = useState(false);
  const dmUsers = onlineUsers.filter(u=>u.id!==me?.id);
  const totalUnread = Object.values(unreadDMs).reduce((a,b)=>a+(b||0),0);

  return (
    <div className="h-full bg-surface flex flex-col border-r border-border">
      {/* Brand bar */}
      <div className="flex items-center gap-3 px-4 py-4 border-b border-border flex-shrink-0">
        <div className="w-8 h-8 rounded-xl bg-accent flex items-center justify-center text-base flex-shrink-0">💬</div>
        <span className="font-extrabold text-lg tracking-tight flex-1">RealChat</span>
        <span className={`text-[10px] font-mono px-2.5 py-1 rounded-full ${connected?"bg-online/15 text-online":"bg-busy/15 text-busy"}`}>
          {connected?"LIVE":"OFF"}
        </span>
        {/* Mobile close */}
        <button onClick={onClose}
          className="md:hidden p-1.5 rounded-lg text-tx-muted hover:text-tx-primary hover:bg-elevated transition-colors">
          <XIcon/>
        </button>
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto py-2 space-y-0.5">
        {/* Channels */}
        <SectionLabel label="CHANNELS"/>
        {rooms.map(room=>(
          <NavButton
            key={room.id}
            active={activeView?.type==="channel"&&activeView?.id===room.id}
            onClick={()=>joinChannel(room.id)}
          >
            <span className="flex-1 truncate text-sm">{room.name}</span>
            {room.memberCount>0&&(
              <span className="text-[10px] font-mono text-tx-muted bg-elevated rounded-full px-2 py-0.5">
                {room.memberCount}
              </span>
            )}
          </NavButton>
        ))}

        {/* Direct Messages */}
        <SectionLabel label="DIRECT MESSAGES" className="mt-4"/>
        {dmUsers.length===0 ? (
          <p className="px-4 py-2 text-xs font-mono text-tx-muted">No one else online</p>
        ) : (
          dmUsers.map(u=>{
            const unread = unreadDMs[u.id]||0;
            const cfg = STATUS_CONFIG[u.status]||STATUS_CONFIG.invisible;
            return (
              <button key={u.id}
                onClick={()=>openDM(u)}
                className={`w-full text-left flex items-center gap-3 px-3 py-2 mx-1 rounded-xl transition-all ${
                  activeView?.type==="dm"&&activeView?.id===u.id
                    ? "bg-active text-tx-primary"
                    : "text-tx-secondary hover:bg-hover hover:text-tx-primary"
                }`}
                style={{width:"calc(100% - 8px)"}}>
                {/* Avatar with status dot */}
                <div className="relative flex-shrink-0">
                  <img src={u.avatar} alt="" className="w-8 h-8 rounded-full bg-elevated block"/>
                  <span className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full ${cfg.color} border-2 border-surface`}/>
                </div>
                <span className={`flex-1 text-sm truncate ${unread?"font-bold text-tx-primary":"font-medium"}`}>
                  {u.username}
                </span>
                {unread>0&&(
                  <span className="bg-busy text-white rounded-full min-w-[18px] h-[18px] flex items-center justify-center text-[10px] font-mono font-bold px-1.5">
                    {unread>99?"99+":unread}
                  </span>
                )}
              </button>
            );
          })
        )}
      </div>

      {/* Me / Status */}
      {me && (
        <div className="border-t border-border p-3 flex-shrink-0 relative">
          {showStatus && (
            <div className="absolute bottom-full left-2 right-2 mb-1 bg-elevated border border-border rounded-xl overflow-hidden shadow-card z-50">
              {Object.entries(STATUS_CONFIG).map(([s,cfg])=>(
                <button key={s}
                  onClick={()=>{setStatus(s);setShowStatus(false);}}
                  className="w-full text-left flex items-center gap-3 px-4 py-2.5 hover:bg-hover text-tx-primary text-sm transition-colors">
                  <span className={`w-2.5 h-2.5 rounded-full ${cfg.color} flex-shrink-0`}/>
                  {cfg.label}
                </button>
              ))}
            </div>
          )}
          <button
            onClick={()=>setShowStatus(v=>!v)}
            className="w-full flex items-center gap-3 p-1 rounded-xl hover:bg-hover transition-colors group">
            <div className="relative flex-shrink-0">
              <img src={me.avatar} alt="" className="w-9 h-9 rounded-full bg-elevated block"/>
              <span className={`absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full ${STATUS_CONFIG[me.status]?.color||"bg-online"} border-2 border-surface`}/>
            </div>
            <div className="flex-1 text-left min-w-0">
              <div className="font-bold text-sm text-tx-primary truncate">{me.username}</div>
              <div className={`text-[11px] font-mono ${STATUS_CONFIG[me.status]?.text||"text-online"}`}>
                {STATUS_CONFIG[me.status]?.label||"Online"}
              </div>
            </div>
            <span className="text-tx-muted text-xs group-hover:text-tx-secondary transition-colors">⌄</span>
          </button>
        </div>
      )}
    </div>
  );
}

function SectionLabel({ label, className="" }){
  return <p className={`px-4 pt-4 pb-1.5 text-[10px] font-mono text-tx-muted tracking-widest ${className}`}>{label}</p>;
}
function NavButton({ active, onClick, children }){
  return (
    <button onClick={onClick}
      className={`w-full text-left flex items-center gap-2 px-3 py-2 mx-1 rounded-xl transition-all ${
        active ? "bg-active text-tx-primary font-semibold" : "text-tx-secondary hover:bg-hover hover:text-tx-primary"
      }`}
      style={{width:"calc(100% - 8px)"}}>
      {children}
    </button>
  );
}
function XIcon(){ return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12"/></svg>; }
