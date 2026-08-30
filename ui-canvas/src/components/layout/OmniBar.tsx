import React, { useState } from "react";
import { useWorkspaceStore, RoutingPolicy } from "../../stores/workspaceStore";
import { Zap, Brain, Shield, Coins, Send, Terminal, Users, Sparkles, Globe } from "lucide-react";

export const OmniBar: React.FC = () => {
  const [input, setInput] = useState("");
  const { 
    routingPolicy, 
    setRoutingPolicy, 
    handleSmartPrompt
  } = useWorkspaceStore();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    handleSmartPrompt(input);
    setInput("");
  };

  const policies: { id: RoutingPolicy; label: string; icon: React.ReactNode }[] = [
    { id: "speed", label: "Speed (<50ms)", icon: <Zap className="w-3 h-3 text-amber-500" /> },
    { id: "reasoning", label: "Deep Reasoning", icon: <Brain className="w-3 h-3 text-purple-500" /> },
    { id: "privacy", label: "Air-Gap Guard", icon: <Shield className="w-3 h-3 text-emerald-500" /> },
    { id: "cost", label: "Cost-Optimized", icon: <Coins className="w-3 h-3 text-stone-400" /> },
  ];

  return (
    <footer className="fixed bottom-4 sm:bottom-6 left-1/2 -translate-x-1/2 w-full max-w-2xl lg:max-w-3xl z-30 px-3 sm:px-4 pointer-events-auto">
      <div className="p-2 sm:p-2.5 rounded-2xl border border-stone-200/90 dark:border-stone-800/90 bg-white/95 dark:bg-stone-900/95 backdrop-blur-2xl shadow-2xl space-y-1.5 transition-colors duration-200">
        {/* Top Control Bar: Routing Policy Selector */}
        <div className="flex items-center justify-between px-1 text-[11px] font-mono overflow-x-auto">
          <div className="flex items-center space-x-1">
            <span className="text-stone-400 uppercase text-[9px] font-bold mr-1">Policy:</span>
            {policies.map((p) => {
              const isSelected = routingPolicy === p.id;
              return (
                <button
                  key={p.id}
                  onClick={() => setRoutingPolicy(p.id)}
                  className={`flex items-center space-x-1 px-2 py-0.5 rounded-lg border transition-all shrink-0 cursor-pointer ${
                    isSelected 
                      ? "bg-stone-100 dark:bg-stone-800 border-stone-300 dark:border-stone-700 text-stone-900 dark:text-stone-100 font-bold shadow-2xs" 
                      : "border-transparent text-stone-500 hover:text-stone-900 dark:hover:text-stone-200"
                  }`}
                >
                  {p.icon}
                  <span className="hidden sm:inline">{p.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Input Bar */}
        <form onSubmit={handleSubmit} className="flex items-center space-x-2 bg-stone-50/90 dark:bg-stone-950/90 p-1.5 rounded-xl border border-stone-200 dark:border-stone-800 focus-within:border-stone-400">
          <div className="pl-1.5 text-stone-400">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
          </div>

          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Direct command (/term, /swarm, /diff, /tor)..."
            className="flex-1 bg-transparent px-1.5 py-1 text-xs text-stone-900 dark:text-stone-100 placeholder:text-stone-400 font-sans outline-none"
          />

          <button
            type="submit"
            className="px-3 py-1 rounded-lg bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 text-xs font-mono font-bold flex items-center space-x-1 transition-all shadow-2xs active:scale-95 cursor-pointer"
          >
            <span>Run</span>
            <Send className="w-3 h-3" />
          </button>
        </form>
      </div>
    </footer>
  );
};
