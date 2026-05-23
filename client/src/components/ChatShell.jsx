import React, { useState } from "react";
import { useApp }      from "../context/AppContext.jsx";
import { useSocket }   from "../hooks/useSocket.js";
import Sidebar         from "./Sidebar.jsx";
import ChannelView     from "./ChannelView.jsx";
import DMView          from "./DMView.jsx";
import NotifToast      from "./NotifToast.jsx";
import EmptyState      from "./EmptyState.jsx";

export default function ChatShell(){
  const { user } = useApp();
  const { state, joinChannel, openDM, sendChannelMsg, sendDM, markDMRead,
          sendTypingStart, sendTypingStop, setStatus } = useSocket(user);
  const { activeView, notifications } = state;
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleJoinChannel = id => { joinChannel(id); setSidebarOpen(false); };
  const handleOpenDM      = u  => { openDM(u);       setSidebarOpen(false); };

  return (
    <div className="flex h-screen overflow-hidden bg-base">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/60 z-20 md:hidden" onClick={()=>setSidebarOpen(false)}/>
      )}

      {/* Sidebar */}
      <aside className={`
        fixed md:static inset-y-0 left-0 z-30 md:z-auto w-64 flex-shrink-0
        transition-transform duration-300 ease-in-out
        ${sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
      `}>
        <Sidebar state={state} joinChannel={handleJoinChannel} openDM={handleOpenDM}
          setStatus={setStatus} onClose={()=>setSidebarOpen(false)}/>
      </aside>

      {/* Main */}
      <main className="flex-1 flex flex-col min-w-0 border-l border-border">
        {!activeView && (
          <EmptyState onMenuClick={()=>setSidebarOpen(true)} hasView={false}/>
        )}
        {activeView?.type==="channel" && (
          <ChannelView
            key={activeView.id}
            roomId={activeView.id}
            state={state}
            onSend={text=>sendChannelMsg(activeView.id,text)}
            onTypingStart={()=>sendTypingStart({type:"channel",id:activeView.id})}
            onTypingStop={()=>sendTypingStop({type:"channel",id:activeView.id})}
            onMenuClick={()=>setSidebarOpen(true)}
          />
        )}
        {activeView?.type==="dm" && (
          <DMView
            key={activeView.id}
            targetId={activeView.id}
            state={state}
            onSend={text=>sendDM(activeView.id,text)}
            onTypingStart={()=>sendTypingStart({type:"dm",id:activeView.id})}
            onTypingStop={()=>sendTypingStop({type:"dm",id:activeView.id})}
            onMarkRead={()=>markDMRead(activeView.id)}
            onMenuClick={()=>setSidebarOpen(true)}
          />
        )}
      </main>

      {/* Toast notifications */}
      <div className="fixed bottom-6 right-4 sm:right-6 flex flex-col gap-3 z-50 pointer-events-none">
        {notifications.map(n=>(
          <div key={n.id} className="pointer-events-auto">
            <NotifToast notif={n} onOpen={()=>{
              openDM({id:n.from.id,username:n.from.username,avatar:n.from.avatar,status:"online"});
              setSidebarOpen(false);
            }}/>
          </div>
        ))}
      </div>
    </div>
  );
}
