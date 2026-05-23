import React, { useEffect } from "react";
import MessageList  from "./MessageList.jsx";
import MessageInput from "./MessageInput.jsx";

const STATUS_CONFIG = {
  online:    { color:"bg-online",   label:"Online",    text:"text-online"   },
  away:      { color:"bg-away",     label:"Away",      text:"text-away"     },
  busy:      { color:"bg-busy",     label:"Busy",      text:"text-busy"     },
  invisible: { color:"bg-tx-muted", label:"Invisible", text:"text-tx-muted" },
};

export default function DMView({ targetId, state, onSend, onTypingStart, onTypingStop, onMarkRead, onMenuClick }){
  const target = state.dmConversations[targetId]
    || state.onlineUsers.find(u=>u.id===targetId)
    || { id:targetId, username:"Unknown", avatar:"", status:"offline" };
  const messages   = state.dmMessages[targetId]||[];
  const typingUsers = state.typingMap[`dm:${targetId}`]||[];
  const cfg = STATUS_CONFIG[target.status]||{ color:"bg-tx-muted", label:"Offline", text:"text-tx-muted" };

  useEffect(()=>{
    if (messages.length) onMarkRead();
  },[messages.length]);

  return (
    <div className="flex flex-col flex-1 min-h-0">
      {/* Header */}
      <header className="flex items-center gap-3 px-4 sm:px-6 py-3 border-b border-border bg-surface flex-shrink-0">
        <button onClick={onMenuClick}
          className="md:hidden p-2 rounded-lg text-tx-muted hover:text-tx-primary hover:bg-elevated transition-colors flex-shrink-0">
          <MenuIcon/>
        </button>

        {/* Avatar */}
        <div className="relative flex-shrink-0">
          <img src={target.avatar} alt=""
            className="w-10 h-10 rounded-full bg-elevated block border border-border"/>
          <span className={`absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full ${cfg.color} border-2 border-surface`}/>
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="font-bold text-base truncate">{target.username}</div>
          <div className={`text-xs font-mono ${cfg.text}`}>{cfg.label}</div>
        </div>

        {/* DM badge */}
        <div className="hidden sm:flex flex-shrink-0 items-center gap-2 text-xs font-mono text-tx-secondary bg-accent/5 border border-accent/20 rounded-lg px-3 py-1.5">
          <span>💬</span> Direct Message
        </div>
      </header>

      <MessageList messages={messages} me={state.me} typingUsers={typingUsers}
        isDM={true} otherUser={target}/>
      <MessageInput onSend={onSend} onTypingStart={onTypingStart} onTypingStop={onTypingStop}
        placeholder={`Message ${target.username}`}/>
    </div>
  );
}
function MenuIcon(){ return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>; }
