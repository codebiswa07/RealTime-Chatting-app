import React from "react";
import MessageList  from "./MessageList.jsx";
import MessageInput from "./MessageInput.jsx";

export default function ChannelView({ roomId, state, onSend, onTypingStart, onTypingStop, onMenuClick }){
  const room     = state.rooms.find(r=>r.id===roomId);
  const messages = state.channelMessages[roomId]||[];
  const members  = state.channelMembers[roomId]||[];
  const typingUsers = state.typingMap[`ch:${roomId}`]||[];

  return (
    <div className="flex flex-col flex-1 min-h-0">
      {/* Header */}
      <header className="flex items-center gap-3 px-4 sm:px-6 py-4 border-b border-border bg-surface flex-shrink-0">
        <button onClick={onMenuClick}
          className="md:hidden p-2 rounded-lg text-tx-muted hover:text-tx-primary hover:bg-elevated transition-colors flex-shrink-0">
          <MenuIcon/>
        </button>
        <div className="flex-1 min-w-0">
          <h2 className="font-bold text-base sm:text-lg truncate">{room?.name??roomId}</h2>
          <p className="text-tx-secondary text-xs sm:text-sm truncate hidden sm:block">{room?.description}</p>
        </div>
        {/* Member avatars */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <div className="flex">
            {members.slice(0,4).map((m,i)=>(
              <img key={m.id} src={m.avatar} alt="" title={m.username}
                className="w-7 h-7 rounded-full border-2 border-surface bg-elevated"
                style={{marginLeft:i?"-10px":0, zIndex:10-i}}/>
            ))}
          </div>
          <span className="text-xs font-mono text-tx-secondary hidden sm:block">
            {members.length} online
          </span>
        </div>
      </header>

      <MessageList messages={messages} me={state.me} typingUsers={typingUsers}/>
      <MessageInput onSend={onSend} onTypingStart={onTypingStart} onTypingStop={onTypingStop}
        placeholder={`Message ${room?.name??roomId}`}/>
    </div>
  );
}
function MenuIcon(){ return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>; }
