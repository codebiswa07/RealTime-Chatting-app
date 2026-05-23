import React, { useEffect, useRef } from "react";
import { fmtTime, fmtDate } from "../utils/time.js";

export default function MessageList({ messages, me, typingUsers=[], isDM, otherUser }){
  const endRef = useRef(null);
  useEffect(()=>{ endRef.current?.scrollIntoView({behavior:"smooth"}); }, [messages,typingUsers]);

  const grouped = messages.reduce((acc,msg)=>{
    const d = fmtDate(msg.timestamp);
    if (!acc.length || acc[acc.length-1].date!==d) acc.push({date:d,msgs:[]});
    acc[acc.length-1].msgs.push(msg);
    return acc;
  },[]);

  return (
    <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-4 flex flex-col gap-0">
      {grouped.map(g=>(
        <div key={g.date}>
          {/* Date divider */}
          <div className="flex items-center gap-4 my-5">
            <div className="flex-1 h-px bg-border"/>
            <span className="text-[11px] font-mono text-tx-muted whitespace-nowrap px-2">{g.date}</span>
            <div className="flex-1 h-px bg-border"/>
          </div>

          {g.msgs.map((msg,i)=>{
            if (msg.type==="system") return (
              <p key={msg.id} className="text-center text-[11px] font-mono text-tx-muted my-2">{msg.text}</p>
            );
            const isMe = msg.userId===me?.id||msg.username===me?.username;
            const prev = g.msgs[i-1];
            const sameAuthor = prev && prev.userId===msg.userId && prev.type!=="system"
              && new Date(msg.timestamp)-new Date(prev.timestamp)<60000;
            const readByOther = isDM&&isMe&&msg.readBy&&otherUser&&msg.readBy.includes(otherUser.id);
            return (
              <MessageRow key={msg.id} msg={msg} isMe={isMe} sameAuthor={sameAuthor}
                readByOther={readByOther} isDM={isDM}/>
            );
          })}
        </div>
      ))}

      {typingUsers.length>0 && <TypingBubble users={typingUsers}/>}
      <div ref={endRef}/>
    </div>
  );
}

function MessageRow({ msg, isMe, sameAuthor, readByOther, isDM }){
  return (
    <div className={`flex items-end gap-2.5 ${sameAuthor?"mt-0.5":"mt-4"} ${isMe?"flex-row-reverse":"flex-row"} animate-fade-up`}>
      {/* Avatar */}
      {!sameAuthor ? (
        <img src={msg.avatar} alt="" className="w-8 h-8 rounded-full bg-elevated flex-shrink-0 self-end"/>
      ) : (
        <div className="w-8 flex-shrink-0"/>
      )}

      {/* Bubble column */}
      <div className={`max-w-[75%] sm:max-w-[65%] ${isMe?"items-end":"items-start"} flex flex-col`}>
        {!sameAuthor && !isMe && (
          <div className="flex items-baseline gap-2 mb-1 pl-1">
            <span className="font-bold text-[13px] text-accent-hover">{msg.username}</span>
            <span className="text-[10px] font-mono text-tx-muted">{fmtTime(msg.timestamp)}</span>
          </div>
        )}

        <div className={`
          px-4 py-2.5 text-sm leading-relaxed break-words
          ${isMe
            ? "bg-accent text-white rounded-2xl rounded-br-sm"
            : "bg-elevated text-tx-primary rounded-2xl rounded-bl-sm"
          }
          ${sameAuthor ? (isMe?"rounded-tr-lg":"rounded-tl-lg") : ""}
          shadow-inner
        `}>
          {msg.text}
          {sameAuthor && (
            <span className="text-[10px] opacity-50 ml-2 font-mono">{fmtTime(msg.timestamp)}</span>
          )}
        </div>

        {/* Read receipt */}
        {isDM && isMe && (
          <div className="flex justify-end mt-1 pr-0.5">
            <span className={`text-[10px] font-mono ${readByOther?"text-accent-hover":"text-tx-muted"}`}>
              {readByOther ? "✓✓ Read" : "✓ Sent"}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

function TypingBubble({ users }){
  const names = users.slice(0,3).join(", ");
  const label = users.length===1 ? `${names} is typing…` : `${names} are typing…`;
  return (
    <div className="flex items-center gap-3 mt-4 animate-fade-up">
      <div className="flex gap-1 items-center px-4 py-3 bg-elevated rounded-2xl rounded-bl-sm">
        {[0,1,2].map(i=>(
          <div key={i} className="w-1.5 h-1.5 rounded-full bg-tx-muted animate-blink"
            style={{animationDelay:`${i*0.2}s`}}/>
        ))}
      </div>
      <span className="text-xs font-mono text-tx-muted">{label}</span>
    </div>
  );
}
