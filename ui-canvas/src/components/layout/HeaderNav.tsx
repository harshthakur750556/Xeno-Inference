import React, { useState } from "react";
import { useWorkspaceStore, ViewMode } from "../../stores/workspaceStore";
import { 
  Menu, 
  Cpu, 
  Zap, 
  ShieldCheck, 
  ShieldAlert, 
  Sun, 
  Moon,
  Sparkles,
  ChevronDown,
  Monitor,
  Activity,
  Layers,
  X,
  Bot,
  Key
} from "lucide-react";

export const HeaderNav: React.FC = () => {
  const { 
    toggleSidebar, 
    themeMode, 
    toggleTheme,
    systemMetrics,
    isAirGapped,
    activeView,
    setActiveView,
    selectedModel,
    providers,
    selectedProviderId,
    openProviderModal
  } = useWorkspaceStore();

  const [isMobileMetricsOpen, setIsMobileMetricsOpen] = useState(false);

  const viewTitles: Record<ViewMode, string> = {
    home: "Chat Studio",
    thinking: "Cognitive Thinking Hub",
    canvas: "Infinite Creative Workbench",
    diff: "AST Diff Studio",
    terminal: "Virtual Terminal",
    browser: "Tor Browser",
  };

  const activeProvider = providers.find((p) => p.id === selectedProviderId) || providers[0];

  return (
    <header className="h-14 border-b border-stone-200/90 dark:border-stone-800/90 bg-white/95 dark:bg-stone-900/95 backdrop-blur-2xl px-3 sm:px-6 flex items-center justify-between z-30 relative select-none transition-colors duration-200 shrink-0">
      {/* Brand & Navigation Trigger */}
      <div className="flex items-center space-x-2.5 sm:space-x-3.5">
        <button 
          onClick={toggleSidebar}
          className="p-2 rounded-xl border border-stone-200 dark:border-stone-800 hover:border-stone-400 dark:hover:border-stone-600 bg-stone-50/80 dark:bg-stone-800/80 text-stone-700 dark:text-stone-300 transition-all cursor-pointer shadow-xs active:scale-95"
          title="Toggle Navigation Menu"
        >
          <Menu className="w-4 h-4" />
        </button>

        <div 
          onClick={() => setActiveView("home")}
          className="flex items-center space-x-2.5 cursor-pointer group"
        >
          <div className="w-7 h-7 rounded-xl bg-linear-to-br from-amber-500 to-amber-700 flex items-center justify-center shadow-xs text-white group-hover:scale-105 transition-transform">
            <Sparkles className="w-4 h-4" />
          </div>
          <div className="flex flex-col">
            <span className="font-display font-bold text-xs sm:text-sm tracking-wider uppercase text-stone-900 dark:text-stone-100 flex items-center gap-1">
              XENO INFERENCE
            </span>
            <span className="text-[9px] font-mono text-stone-400 dark:text-stone-500 leading-none hidden sm:block">
              {viewTitles[activeView]}
            </span>
          </div>
        </div>
      </div>

      {/* Real Dynamic Host Telemetry Chips (Desktop) */}
      <div className="hidden lg:flex items-center space-x-2 text-xs font-mono">
        {/* Model Provider Quick Button */}
        <button
          onClick={() => openProviderModal()}
          className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-stone-50 dark:bg-stone-800/60 border border-stone-200/80 dark:border-stone-700/80 text-stone-700 dark:text-stone-300 hover:border-amber-400 transition-all cursor-pointer"
          title="Configure AI Models & Keys"
        >
          <Bot className="w-3.5 h-3.5 text-amber-500" />
          <span className="truncate max-w-[130px]">{selectedModel}</span>
          <Key className="w-2.5 h-2.5 text-stone-400" />
        </button>

        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-stone-50 dark:bg-stone-800/60 border border-stone-200/80 dark:border-stone-700/80 text-stone-700 dark:text-stone-300">
          <Cpu className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
          <span>{systemMetrics.cpuCores} Cores</span>
        </div>

        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-stone-50 dark:bg-stone-800/60 border border-stone-200/80 dark:border-stone-700/80 text-stone-700 dark:text-stone-300">
          <Zap className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
          <span>{systemMetrics.ramHeapMb} MB Heap</span>
        </div>

        <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-xl border ${
          isAirGapped 
            ? "bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800" 
            : "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800"
        }`}>
          {isAirGapped ? <ShieldAlert className="w-3.5 h-3.5 text-amber-600" /> : <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />}
          <span>{isAirGapped ? "Air-Gap Guard" : "Tor SOCKS5"}</span>
        </div>
      </div>

      {/* Right Controls: Provider Key Quick Trigger & Theme Mode Toggle */}
      <div className="flex items-center space-x-1.5 sm:space-x-2">
        <button
          onClick={() => openProviderModal()}
          className="lg:hidden flex items-center gap-1 px-2.5 py-1.5 rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-800 text-[11px] font-mono text-stone-700 dark:text-stone-300 active:scale-95"
          title="Inference Providers"
        >
          <Key className="w-3.5 h-3.5 text-amber-500" />
        </button>

        {/* Mobile Telemetry Pill */}
        <button
          onClick={() => setIsMobileMetricsOpen(!isMobileMetricsOpen)}
          className="lg:hidden flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-800 text-[11px] font-mono text-stone-700 dark:text-stone-300 active:scale-95"
        >
          <Activity className="w-3.5 h-3.5 text-emerald-500" />
          <span>{systemMetrics.cpuCores}c</span>
        </button>

        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-xl border border-stone-200 dark:border-stone-800 hover:border-stone-400 dark:hover:border-stone-600 bg-stone-50/80 dark:bg-stone-800/80 text-stone-700 dark:text-stone-300 transition-all shadow-xs cursor-pointer active:scale-95"
          title={`Switch to ${themeMode === "light" ? "Dark" : "Light"} mode`}
        >
          {themeMode === "light" ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4 text-amber-400" />}
        </button>
      </div>

      {/* Mobile Telemetry Sheet */}
      {isMobileMetricsOpen && (
        <div className="absolute top-14 left-0 right-0 p-4 bg-white/95 dark:bg-stone-900/95 backdrop-blur-2xl border-b border-stone-200 dark:border-stone-800 z-40 shadow-xl lg:hidden font-mono text-xs space-y-2.5">
          <div className="flex items-center justify-between pb-2 border-b border-stone-100 dark:border-stone-800">
            <span className="font-bold text-stone-900 dark:text-stone-100 uppercase tracking-wider">Host Machine Specs</span>
            <button onClick={() => setIsMobileMetricsOpen(false)} className="p-1 text-stone-400 hover:text-stone-800">
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="grid grid-cols-2 gap-2 text-[11px]">
            <div className="p-2 rounded-xl bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800">
              <div className="text-stone-400 text-[9px] uppercase font-bold">CPU Cores</div>
              <div className="font-bold text-stone-800 dark:text-stone-200">{systemMetrics.cpuCores} Threads</div>
            </div>
            <div className="p-2 rounded-xl bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800">
              <div className="text-stone-400 text-[9px] uppercase font-bold">RAM Heap</div>
              <div className="font-bold text-stone-800 dark:text-stone-200">{systemMetrics.ramHeapMb} MB</div>
            </div>
            <div className="p-2 rounded-xl bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800 col-span-2">
              <div className="text-stone-400 text-[9px] uppercase font-bold">GPU Accelerator</div>
              <div className="font-bold text-stone-800 dark:text-stone-200 truncate">{systemMetrics.gpuRenderer}</div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
