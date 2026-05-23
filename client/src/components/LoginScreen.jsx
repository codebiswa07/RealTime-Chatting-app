import React, { useState } from "react";
import { useApp } from "../context/AppContext.jsx";

const STYLES = ["bottts","pixel-art","lorelei","fun-emoji","adventurer","micah","croodles","avataaars","big-ears","thumbs"];

export default function LoginScreen(){
  const { login } = useApp();
  const [username, setUsername] = useState("");
  const [seed,  setSeed]  = useState(()=>Math.random().toString(36).slice(2,9));
  const [style, setStyle] = useState("bottts");
  const avatar = `https://api.dicebear.com/8.x/${style}/svg?seed=${seed}`;

  const submit = e => { e.preventDefault(); if(username.trim()) login({username, avatar}); };

  return (
    <div className="min-h-screen bg-base flex items-center justify-center p-4 relative overflow-hidden">
      {/* Ambient orbs */}
      <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-accent/10 blur-3xl pointer-events-none"/>
      <div className="absolute -bottom-24 -right-16 w-80 h-80 rounded-full bg-accent/5 blur-3xl pointer-events-none"/>

      <div className="w-full max-w-md bg-surface border border-border rounded-2xl p-8 sm:p-10 shadow-glow animate-fade-up relative z-10">
        {/* Header */}
        <div className="flex items-center gap-3 mb-2">
          <div className="w-9 h-9 rounded-xl bg-accent flex items-center justify-center text-lg shadow-inner flex-shrink-0">💬</div>
          <span className="font-extrabold text-2xl tracking-tight">RealChat</span>
        </div>
        <p className="text-tx-secondary text-sm mb-8">Channels · Direct Messages · Live Presence</p>

        {/* Avatar Picker */}
        <div className="flex gap-4 mb-8 items-start">
          <div className="relative flex-shrink-0">
            <img src={avatar} alt="avatar"
              className="w-20 h-20 rounded-full border-2 border-border bg-elevated block"/>
            <span className="absolute bottom-0 right-0 w-5 h-5 rounded-full bg-online border-2 border-surface"/>
          </div>
          <div className="flex-1 min-w-0">
            <button type="button" onClick={()=>setSeed(Math.random().toString(36).slice(2,9))}
              className="mb-3 text-xs font-mono px-4 py-2 rounded-lg bg-elevated border border-border text-tx-secondary hover:text-tx-primary hover:border-accent/50 transition-all">
              ↺ Randomise
            </button>
            <div className="flex flex-wrap gap-1.5">
              {STYLES.map(s=>(
                <button key={s} type="button" onClick={()=>setStyle(s)}
                  className={`text-[10px] font-mono px-2.5 py-1 rounded-md border transition-all ${
                    style===s
                      ? "bg-accent/20 border-accent/60 text-accent-hover"
                      : "bg-elevated border-border text-tx-muted hover:border-accent/30 hover:text-tx-secondary"
                  }`}>
                  {s}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={submit} className="flex flex-col gap-3">
          <label className="text-[11px] font-mono text-tx-secondary tracking-widest">USERNAME</label>
          <input
            value={username}
            onChange={e=>setUsername(e.target.value)}
            maxLength={20}
            placeholder="Enter your username..."
            autoFocus
            className="bg-elevated border border-border rounded-xl text-tx-primary px-4 py-3 text-base outline-none
              focus:border-accent transition-colors placeholder:text-tx-muted"
          />
          <button
            type="submit"
            disabled={!username.trim()}
            className="mt-1 py-3.5 rounded-xl font-bold text-base transition-all
              disabled:bg-elevated disabled:text-tx-muted disabled:opacity-60 disabled:cursor-not-allowed
              bg-accent hover:bg-accent-hover text-white shadow-glow"
          >
            Start chatting →
          </button>
        </form>
      </div>
    </div>
  );
}
