import React, { useState, useRef, useCallback } from "react";

export default function MessageInput({ onSend, onTypingStart, onTypingStop, placeholder="Message…" }){
  const [text,setText] = useState("");
  const typing = useRef(false);
  const timer  = useRef(null);

  const handleChange = e => {
    setText(e.target.value);
    if (!typing.current){ onTypingStart(); typing.current=true; }
    clearTimeout(timer.current);
    timer.current = setTimeout(()=>{ onTypingStop(); typing.current=false; }, 1500);
  };

  const send = useCallback(()=>{
    const t = text.trim();
    if (!t) return;
    onSend(t);
    setText("");
    onTypingStop();
    typing.current=false;
    clearTimeout(timer.current);
  },[text,onSend,onTypingStop]);

  const onKey = e => { if(e.key==="Enter"&&!e.shiftKey){ e.preventDefault(); send(); } };

  return (
    <div className="px-4 sm:px-6 pb-5 pt-3 border-t border-border bg-surface flex-shrink-0">
      <div className="flex items-end gap-2 bg-elevated border border-border rounded-2xl pl-4 pr-2 py-2
        focus-within:border-accent/60 transition-colors">
        <textarea
          value={text}
          onChange={handleChange}
          onKeyDown={onKey}
          placeholder={placeholder}
          rows={1}
          className="flex-1 bg-transparent border-none outline-none text-tx-primary text-sm leading-relaxed
            placeholder:text-tx-muted py-2 max-h-36 overflow-y-auto font-sans"
        />
        <button onClick={send} disabled={!text.trim()}
          className="w-9 h-9 rounded-xl flex-shrink-0 flex items-center justify-center text-base transition-all
            disabled:bg-active disabled:text-tx-muted disabled:opacity-50 disabled:cursor-not-allowed
            bg-accent hover:bg-accent-hover text-white shadow-inner">
          ↑
        </button>
      </div>
      <p className="mt-1.5 text-[10px] font-mono text-tx-muted">Enter to send · Shift+Enter for new line</p>
    </div>
  );
}
