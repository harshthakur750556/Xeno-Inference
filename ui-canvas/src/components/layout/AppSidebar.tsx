import React from "react";
import { useWorkspaceStore, ViewMode } from "../../stores/workspaceStore";
import { 
  MessageSquare,
  LayoutGrid, 
  Globe, 
  BrainCircuit, 
  Terminal, 
  FileCode, 
  Cpu, 
  FileJson, 
  Keyboard, 
  Volume2, 
  VolumeX, 
  ShieldCheck, 
  ShieldAlert, 
  X,
  Sparkles,
  Key,
  Box
} from "lucide-react";

export const AppSidebar: React.FC = () => {
  const {
    isSidebarOpen,
    setSidebarOpen,
    activeView,
    setActiveView,
    toggleMcpModal,
    toggleExport,
    toggleShortcuts,
    openProviderModal,
    soundEnabled,
    toggleSound,
    isAirGapped,
    toggleAirGap,
    isDaemonOnline,
    mcpServers,
  } = useWorkspaceStore();

  const navItems: { id: ViewMode; label: string; icon: React.ReactNode; badge?: string }[] = [
    { id: "home", label: "Chat Studio", icon: <MessageSquare className="w-4 h-4" /> },
    { id: "thinking", label: "Thinking Studio", icon: <BrainCircuit className="w-4 h-4 text-amber-500" />, badge: "Swarm/DAG" },
    { id: "canvas", label: "Creative Canvas", icon: <LayoutGrid className="w-4 h-4 text-blue-500" />, badge: "3D CAD" },
    { id: "diff", label: "AST Diff Studio", icon: <FileCode className="w-4 h-4 text-purple-500" /> },
    { id: "terminal", label: "Virtual Terminal", icon: <Terminal className="w-4 h-4" />, badge: "PTY" },
    { id: "browser", label: "Tor Browser", icon: <Globe className="w-4 h-4 text-emerald-500" />, badge: "9050" },
  ];

  const activeMcpTools = mcpServers.reduce(
    (acc, s) => acc + s.tools.filter((t) => t.enabled && s.status === "connected").length,
    0
  );

  const handleSelectView = (view: ViewMode) => {
    setActiveView(view);
    setSidebarOpen(false);
  };

  return (
    <aside 
      className={`
        fixed inset-y-0 left-0 z-50 w-72 lg:w-64 h-full border-r border-stone-200/90 dark:border-stone-800/90 bg-white/95 dark:bg-stone-900/95 backdrop-blur-2xl flex flex-col shrink-0 select-none transition-transform duration-300 shadow-2xl lg:shadow-xs lg:static
        ${isSidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
      `}
    >
      {/* Sidebar Header */}
      <div className="px-4 py-3.5 border-b border-stone-200/80 dark:border-stone-800/80 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Sparkles className="w-4 h-4 text-amber-500" />
          <span className="text-xs font-semibold tracking-wider uppercase text-stone-800 dark:text-stone-200 font-mono">
            Navigation Hub
          </span>
        </div>
        
        <button
          onClick={() => setSidebarOpen(false)}
          className="lg:hidden p-1.5 rounded-lg text-stone-400 hover:text-stone-800 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Main Views Section */}
      <div className="p-2.5 space-y-1 overflow-y-auto flex-1 font-mono text-xs">
        {navItems.map((item) => {
          const isActive = activeView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => handleSelectView(item.id)}
              className={`w-full px-3 py-2.5 rounded-xl font-medium flex items-center justify-between transition-all duration-150 text-left cursor-pointer ${
                isActive
                  ? "bg-stone-900 dark:bg-stone-100 text-stone-100 dark:text-stone-900 shadow-sm font-semibold"
                  : "text-stone-600 dark:text-stone-400 hover:bg-stone-100/80 dark:hover:bg-stone-800/80 hover:text-stone-900 dark:hover:text-stone-100"
              }`}
            >
              <div className="flex items-center space-x-2.5">
                <span className={isActive ? "text-amber-400 dark:text-amber-600" : "text-stone-400 dark:text-stone-500"}>
                  {item.icon}
                </span>
                <span>{item.label}</span>
              </div>
              {item.badge && (
                <span className={`text-[9px] font-mono px-1.5 py-0.2 rounded ${
                  isActive 
                    ? "bg-stone-800 dark:bg-stone-200 text-stone-300 dark:text-stone-700 font-bold" 
                    : "bg-stone-100 dark:bg-stone-800 text-stone-500"
                }`}>
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}

        {/* Tools & Settings Section */}
        <div className="pt-3 mt-3 border-t border-stone-200/80 dark:border-stone-800/80 space-y-1">
          <div className="px-2 pb-1.5 flex items-center justify-between">
            <span className="text-[10px] font-semibold tracking-wider uppercase text-stone-400 dark:text-stone-500 font-mono">
              Inference & Tools
            </span>
          </div>

          {/* Provider & API Keys Modal Trigger */}
          <button
            onClick={() => { openProviderModal(); setSidebarOpen(false); }}
            className="w-full px-3 py-2 rounded-xl text-xs font-medium text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800/80 flex items-center justify-between transition-colors text-left cursor-pointer"
          >
            <div className="flex items-center space-x-2.5">
              <Key className="w-4 h-4 text-amber-500" />
              <span>Providers & Keys</span>
            </div>
            <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-900/60 font-bold">
              Config
            </span>
          </button>

          {/* MCP Tools Trigger */}
          <button
            onClick={() => { toggleMcpModal(); setSidebarOpen(false); }}
            className="w-full px-3 py-2 rounded-xl text-xs font-medium text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800/80 flex items-center justify-between transition-colors text-left cursor-pointer"
          >
            <div className="flex items-center space-x-2.5">
              <Cpu className="w-4 h-4 text-blue-500" />
              <span>MCP Arsenal</span>
            </div>
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400">
              {activeMcpTools} Armed
            </span>
          </button>

          {/* Air-Gap Guard Toggle */}
          <button
            onClick={toggleAirGap}
            className="w-full px-3 py-2 rounded-xl text-xs font-medium text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800/80 flex items-center justify-between transition-colors text-left cursor-pointer"
          >
            <div className="flex items-center space-x-2.5">
              {isAirGapped ? <ShieldAlert className="w-4 h-4 text-amber-500" /> : <ShieldCheck className="w-4 h-4 text-emerald-500" />}
              <span>Air-Gap Guard</span>
            </div>
            <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded font-bold ${
              isAirGapped 
                ? "bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300" 
                : "bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300"
            }`}>
              {isAirGapped ? "STRICT" : "TOR SOCKS5"}
            </span>
          </button>

          {/* Session Export */}
          <button
            onClick={() => { toggleExport(); setSidebarOpen(false); }}
            className="w-full px-3 py-2 rounded-xl text-xs font-medium text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800/80 flex items-center justify-between transition-colors text-left cursor-pointer"
          >
            <div className="flex items-center space-x-2.5">
              <FileJson className="w-4 h-4 text-stone-500" />
              <span>Export Session</span>
            </div>
            <span className="text-[9px] font-mono text-stone-400">Ctrl+E</span>
          </button>

          {/* Shortcuts */}
          <button
            onClick={() => { toggleShortcuts(); setSidebarOpen(false); }}
            className="w-full px-3 py-2 rounded-xl text-xs font-medium text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800/80 flex items-center justify-between transition-colors text-left cursor-pointer"
          >
            <div className="flex items-center space-x-2.5">
              <Keyboard className="w-4 h-4 text-stone-500" />
              <span>Shortcuts</span>
            </div>
            <span className="text-[9px] font-mono text-stone-400">?</span>
          </button>

          {/* Audio Feedback */}
          <button
            onClick={toggleSound}
            className="w-full px-3 py-2 rounded-xl text-xs font-medium text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800/80 flex items-center justify-between transition-colors text-left cursor-pointer"
          >
            <div className="flex items-center space-x-2.5">
              {soundEnabled ? <Volume2 className="w-4 h-4 text-stone-600 dark:text-stone-300" /> : <VolumeX className="w-4 h-4 text-stone-400" />}
              <span>Audio Feedback</span>
            </div>
            <span className="text-[9px] font-mono text-stone-400">
              {soundEnabled ? "ON" : "MUTED"}
            </span>
          </button>
        </div>
      </div>

      {/* Sidebar Host Status Footer */}
      <div className="p-3 border-t border-stone-200/80 dark:border-stone-800/80 bg-stone-50/50 dark:bg-stone-950/50 text-[11px] font-mono shrink-0">
        <div className="flex items-center justify-between text-stone-500 dark:text-stone-400">
          <span className="flex items-center gap-1.5">
            <span className={`w-2 h-2 rounded-full ${isDaemonOnline ? "bg-emerald-500" : "bg-amber-500"}`} />
            <span>Daemon: {isDaemonOnline ? "Online" : "Standby"}</span>
          </span>
          <span>127.0.0.1:8080</span>
        </div>
      </div>
    </aside>
  );
};
