import React from "react";
import { useWorkspaceStore } from "../../stores/workspaceStore";
import { 
  Menu, 
  Cpu, 
  Zap, 
  ShieldCheck, 
  ShieldAlert, 
  Sun, 
  Moon,
  Sparkles,
  Activity,
  Sliders
} from "lucide-react";

export const HeaderNav: React.FC = () => {
  const { 
    toggleSidebar, 
    themeMode, 
    toggleTheme,
    systemMetrics,
    isAirGapped,
    isDaemonOnline,
    setActiveView
  } = useWorkspaceStore();

  return (
    <header className="h-14 border-b border-stone-200 dark:border-stone-800 bg-white/95 dark:bg-stone-900/95 backdrop-blur-xl px-4 sm:px-6 flex items-center justify-between z-40 relative select-none transition-colors duration-200 shadow-2xs">
      {/* Brand & Sidebar Toggle */}
      <div className="flex items-center space-x-3">
        <button 
          onClick={toggleSidebar}
          className="p-1.5 rounded-lg border border-stone-200 dark:border-stone-800 hover:border-stone-400 dark:hover:border-stone-600 bg-stone-50 dark:bg-stone-800 text-stone-600 dark:text-stone-300 transition-all cursor-pointer"
          title="Toggle Navigation Sidebar"
        >
          <Menu className="w-4 h-4" />
        </button>

        <div 
          onClick={() => setActiveView("home")}
          className="flex items-center space-x-2.5 cursor-pointer"
        >
          <span className="font-display font-bold text-sm tracking-wider uppercase text-stone-900 dark:text-stone-100 flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-amber-600 dark:text-amber-400" />
            XENO INFERENCE
          </span>
          <span className="hidden sm:inline-block text-[10px] px-2 py-0.5 rounded-full bg-stone-100 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-600 dark:text-stone-400 font-mono">
            Sovereign Workstation
          </span>
        </div>
      </div>

      {/* Real Dynamic Host Telemetry Chips (Real Host Data, Zero Fabrication) */}
      <div className="hidden lg:flex items-center space-x-2.5 text-xs font-mono">
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-stone-50 dark:bg-stone-800/80 border border-stone-200 dark:border-stone-700 text-stone-700 dark:text-stone-300">
          <Cpu className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
          <span>{systemMetrics.cpuCores} Cores</span>
        </div>

        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-stone-50 dark:bg-stone-800/80 border border-stone-200 dark:border-stone-700 text-stone-700 dark:text-stone-300">
          <Zap className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
          <span>{systemMetrics.ramHeapMb} MB Heap</span>
        </div>

        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-stone-50 dark:bg-stone-800/80 border border-stone-200 dark:border-stone-700 text-stone-700 dark:text-stone-300">
          <Sliders className="w-3.5 h-3.5 text-blue-500" />
          <span>{systemMetrics.screenResolution} @ {systemMetrics.devicePixelRatio}x</span>
        </div>

        <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border ${
          isAirGapped 
            ? "bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800" 
            : "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800"
        }`}>
          {isAirGapped ? <ShieldAlert className="w-3.5 h-3.5 text-amber-600" /> : <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />}
          <span>{isAirGapped ? "Air-Gap Local" : "Tor SOCKS5"}</span>
        </div>

        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-stone-50 dark:bg-stone-800/80 border border-stone-200 dark:border-stone-700 text-stone-700 dark:text-stone-300">
          <span className={`w-2 h-2 rounded-full ${isDaemonOnline ? "bg-emerald-500" : "bg-amber-500 animate-pulse"}`} />
          <span>{isDaemonOnline ? "Daemon Online" : "Daemon Standby"}</span>
        </div>
      </div>

      {/* Right Controls: Theme Toggle */}
      <div className="flex items-center space-x-2">
        <button
          onClick={toggleTheme}
          className="p-1.5 rounded-lg border border-stone-200 dark:border-stone-800 hover:border-stone-400 dark:hover:border-stone-600 bg-stone-50 dark:bg-stone-800 text-stone-700 dark:text-stone-300 transition-all shadow-xs cursor-pointer"
          title={`Switch to ${themeMode === "light" ? "Dark" : "Light"} mode`}
        >
          {themeMode === "light" ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4 text-amber-400" />}
        </button>
      </div>
    </header>
  );
};
