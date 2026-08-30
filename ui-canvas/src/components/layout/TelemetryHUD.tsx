import React, { useState } from "react";
import { useWorkspaceStore } from "../../stores/workspaceStore";
import { Zap, Coins, HardDrive, Gauge, Layers, Activity, ChevronDown, ChevronUp } from "lucide-react";

export const TelemetryHUD: React.FC = () => {
  const { systemMetrics, soundEnabled } = useWorkspaceStore();
  const [isExpanded, setIsExpanded] = useState(false);

  const maxContext = 128000;
  const contextPct = ((systemMetrics.liveTokenCount / maxContext) * 100).toFixed(1);

  return (
    <div className="fixed top-16 right-3 sm:right-6 z-30 flex flex-col items-end">
      {/* Mini Responsive Pill for Mobile */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="sm:hidden flex items-center space-x-2 px-3 py-1.5 rounded-2xl border border-stone-200/90 dark:border-stone-800/90 bg-white/95 dark:bg-stone-900/95 backdrop-blur-2xl shadow-lg text-[11px] font-mono font-bold text-stone-800 dark:text-stone-200 active:scale-95"
      >
        <Zap className="w-3.5 h-3.5 text-amber-500" />
        <span>{systemMetrics.liveTokPerSec > 0 ? `${systemMetrics.liveTokPerSec} tok/s` : `${systemMetrics.ramHeapMb}MB`}</span>
        {isExpanded ? <ChevronUp className="w-3 h-3 text-stone-400" /> : <ChevronDown className="w-3 h-3 text-stone-400" />}
      </button>

      {/* Full Desktop HUD / Expanded Mobile Modal Bar */}
      <div className={`
        ${isExpanded ? "flex mt-2" : "hidden sm:flex"}
        p-2.5 sm:p-3 rounded-2xl border border-stone-200/90 dark:border-stone-800/90 bg-white/95 dark:bg-stone-900/95 backdrop-blur-2xl shadow-xl items-center space-x-3 sm:space-x-5 text-xs font-mono transition-all duration-200 max-w-[92vw] overflow-x-auto
      `}>
        {/* Speed */}
        <div className="flex items-center space-x-2 shrink-0">
          <div className="p-1.5 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400">
            <Zap className="w-3.5 h-3.5" />
          </div>
          <div>
            <div className="text-stone-400 uppercase text-[9px] font-bold">Speed</div>
            <div className="text-stone-900 dark:text-stone-100 font-bold text-xs">
              {systemMetrics.liveTokPerSec.toFixed(1)} <span className="text-[9px] font-normal text-stone-400">tok/s</span>
            </div>
          </div>
        </div>

        <div className="w-[1px] h-6 bg-stone-200 dark:bg-stone-800 shrink-0" />

        {/* RAM Heap */}
        <div className="flex items-center space-x-2 shrink-0">
          <div className="p-1.5 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400">
            <HardDrive className="w-3.5 h-3.5" />
          </div>
          <div>
            <div className="text-stone-400 uppercase text-[9px] font-bold">RAM Heap</div>
            <div className="text-stone-900 dark:text-stone-100 font-bold text-xs">
              {systemMetrics.ramHeapMb} <span className="text-[9px] font-normal text-stone-400">MB</span>
            </div>
          </div>
        </div>

        <div className="w-[1px] h-6 bg-stone-200 dark:bg-stone-800 shrink-0" />

        {/* Session Cost */}
        <div className="flex items-center space-x-2 shrink-0">
          <div className="p-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
            <Coins className="w-3.5 h-3.5" />
          </div>
          <div>
            <div className="text-stone-400 uppercase text-[9px] font-bold">Tokens</div>
            <div className="text-emerald-600 dark:text-emerald-400 font-bold text-xs">
              {systemMetrics.liveTokenCount.toLocaleString()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
