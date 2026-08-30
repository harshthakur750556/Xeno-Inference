import React, { useState } from "react";
import { useWorkspaceStore, ViewMode } from "../../stores/workspaceStore";
import { 
  MessageSquare,
  LayoutGrid, 
  Globe, 
  GitFork, 
  BrainCircuit, 
  Terminal, 
  FileCode, 
  Users, 
  Cpu, 
  Folder, 
  FolderOpen,
  FileJson, 
  Keyboard, 
  Volume2, 
  VolumeX, 
  ShieldCheck, 
  ShieldAlert, 
  ChevronDown, 
  ChevronRight, 
  Activity,
  Sliders,
  CheckCircle2
} from "lucide-react";

export const AppSidebar: React.FC = () => {
  const {
    isSidebarOpen,
    activeView,
    setActiveView,
    toggleMcpModal,
    toggleExport,
    toggleShortcuts,
    soundEnabled,
    toggleSound,
    isAirGapped,
    toggleAirGap,
    isDaemonOnline,
    mcpServers,
  } = useWorkspaceStore();

  const [isFilesSectionOpen, setIsFilesSectionOpen] = useState(false);
  const [openFolders, setOpenFolders] = useState<Record<string, boolean>>({
    "crates": true,
    "crates/xeno-tools": true,
    "crates/xeno-router": true,
  });

  if (!isSidebarOpen) return null;

  const toggleFolder = (path: string) => {
    setOpenFolders((prev) => ({ ...prev, [path]: !prev[path] }));
  };

  const navItems: { id: ViewMode; label: string; icon: React.ReactNode; badge?: string }[] = [
    { id: "home", label: "Chat Studio", icon: <MessageSquare className="w-4 h-4" /> },
    { id: "canvas", label: "Spatial Canvas", icon: <LayoutGrid className="w-4 h-4" /> },
    { id: "browser", label: "Tor Browser", icon: <Globe className="w-4 h-4" />, badge: "9050" },
    { id: "dag", label: "Live Execution DAG", icon: <GitFork className="w-4 h-4" /> },
    { id: "timeline", label: "Thinking Timeline", icon: <BrainCircuit className="w-4 h-4" /> },
    { id: "terminal", label: "Virtual Terminal", icon: <Terminal className="w-4 h-4" />, badge: "PTY" },
    { id: "diff", label: "AST Diff Studio", icon: <FileCode className="w-4 h-4" /> },
    { id: "swarm", label: "Swarm Council", icon: <Users className="w-4 h-4" /> },
  ];

  const fileTree = [
    {
      name: "crates",
      isFolder: true,
      path: "crates",
      children: [
        {
          name: "xeno-tools",
          isFolder: true,
          path: "crates/xeno-tools",
          children: [
            { name: "ast_validator.rs", path: "crates/xeno-tools/src/ast_validator.rs" },
            { name: "file_engine.rs", path: "crates/xeno-tools/src/file_engine.rs" },
            { name: "pty.rs", path: "crates/xeno-tools/src/pty.rs" },
          ],
        },
        {
          name: "xeno-router",
          isFolder: true,
          path: "crates/xeno-router",
          children: [
            { name: "router.rs", path: "crates/xeno-router/src/router.rs" },
            { name: "privacy.rs", path: "crates/xeno-router/src/privacy.rs" },
          ],
        },
      ],
    },
  ];

  const activeMcpTools = mcpServers.reduce(
    (acc, s) => acc + s.tools.filter((t) => t.enabled && s.status === "connected").length,
    0
  );

  return (
    <aside className="w-64 h-full border-r border-stone-200 dark:border-stone-800 bg-white/95 dark:bg-stone-900/95 backdrop-blur-xl flex flex-col z-30 shrink-0 select-none transition-colors duration-200 shadow-sm">
      {/* Sidebar Header */}
      <div className="px-4 py-3 border-b border-stone-200 dark:border-stone-800 flex items-center justify-between">
        <span className="text-[11px] font-semibold tracking-wider uppercase text-stone-400 dark:text-stone-500 font-mono">
          Workstation Navigation
        </span>
        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300">
          8 Views
        </span>
      </div>

      {/* Main Views Section */}
      <div className="p-2 space-y-1 overflow-y-auto flex-1">
        {navItems.map((item) => {
          const isActive = activeView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveView(item.id)}
              className={`w-full px-3 py-2 rounded-xl text-xs font-medium flex items-center justify-between transition-all duration-150 text-left ${
                isActive
                  ? "bg-stone-900 dark:bg-stone-100 text-stone-100 dark:text-stone-900 shadow-xs font-semibold"
                  : "text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800/80 hover:text-stone-900 dark:hover:text-stone-200"
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
                    ? "bg-stone-800 dark:bg-stone-200 text-stone-300 dark:text-stone-700" 
                    : "bg-stone-100 dark:bg-stone-800 text-stone-500"
                }`}>
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}

        {/* Tools & Arsenal Section */}
        <div className="pt-3 mt-3 border-t border-stone-200/80 dark:border-stone-800/80">
          <div className="px-2 pb-1.5 flex items-center justify-between">
            <span className="text-[10px] font-semibold tracking-wider uppercase text-stone-400 dark:text-stone-500 font-mono">
              Tools & Extensions
            </span>
          </div>

          {/* MCP Tools Modal Trigger */}
          <button
            onClick={toggleMcpModal}
            className="w-full px-3 py-2 rounded-xl text-xs font-medium text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800/80 flex items-center justify-between transition-colors text-left"
            title="Configure Model Context Protocol Servers & Tools"
          >
            <div className="flex items-center space-x-2.5">
              <Cpu className="w-4 h-4 text-amber-500" />
              <span>MCP Arsenal</span>
            </div>
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-900/60">
              {activeMcpTools} Armed
            </span>
          </button>

          {/* Collapsible Workspace File Tree Toggle */}
          <button
            onClick={() => setIsFilesSectionOpen(!isFilesSectionOpen)}
            className="w-full px-3 py-2 rounded-xl text-xs font-medium text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800/80 flex items-center justify-between transition-colors text-left"
          >
            <div className="flex items-center space-x-2.5">
              <Folder className="w-4 h-4 text-blue-500" />
              <span>Workspace Files</span>
            </div>
            {isFilesSectionOpen ? <ChevronDown className="w-3.5 h-3.5 text-stone-400" /> : <ChevronRight className="w-3.5 h-3.5 text-stone-400" />}
          </button>

          {/* File Explorer Tree */}
          {isFilesSectionOpen && (
            <div className="pl-4 pr-1 py-1 space-y-1 font-mono text-[11px] text-stone-600 dark:text-stone-400 border-l border-stone-200 dark:border-stone-800 ml-4 my-1">
              <div 
                onClick={() => toggleFolder("crates/xeno-tools")}
                className="flex items-center space-x-1.5 py-0.5 cursor-pointer hover:text-stone-900 dark:hover:text-stone-200"
              >
                <FolderOpen className="w-3 h-3 text-amber-500" />
                <span>xeno-tools/</span>
              </div>
              {openFolders["crates/xeno-tools"] && (
                <div className="pl-3.5 space-y-1">
                  <div className="flex items-center space-x-1.5 py-0.5 hover:text-blue-500 cursor-pointer">
                    <FileCode className="w-2.5 h-2.5 text-stone-400" />
                    <span>ast_validator.rs</span>
                  </div>
                  <div className="flex items-center space-x-1.5 py-0.5 hover:text-blue-500 cursor-pointer">
                    <FileCode className="w-2.5 h-2.5 text-stone-400" />
                    <span>file_engine.rs</span>
                  </div>
                  <div className="flex items-center space-x-1.5 py-0.5 hover:text-blue-500 cursor-pointer">
                    <FileCode className="w-2.5 h-2.5 text-stone-400" />
                    <span>pty.rs</span>
                  </div>
                </div>
              )}

              <div 
                onClick={() => toggleFolder("crates/xeno-router")}
                className="flex items-center space-x-1.5 py-0.5 cursor-pointer hover:text-stone-900 dark:hover:text-stone-200"
              >
                <FolderOpen className="w-3 h-3 text-amber-500" />
                <span>xeno-router/</span>
              </div>
              {openFolders["crates/xeno-router"] && (
                <div className="pl-3.5 space-y-1">
                  <div className="flex items-center space-x-1.5 py-0.5 hover:text-blue-500 cursor-pointer">
                    <FileCode className="w-2.5 h-2.5 text-stone-400" />
                    <span>router.rs</span>
                  </div>
                  <div className="flex items-center space-x-1.5 py-0.5 hover:text-blue-500 cursor-pointer">
                    <FileCode className="w-2.5 h-2.5 text-stone-400" />
                    <span>privacy.rs</span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Air-Gap Guard Toggle */}
          <button
            onClick={toggleAirGap}
            className="w-full px-3 py-2 rounded-xl text-xs font-medium text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800/80 flex items-center justify-between transition-colors text-left"
            title="Toggle Strict Air-Gap Socket Guard"
          >
            <div className="flex items-center space-x-2.5">
              {isAirGapped ? (
                <ShieldAlert className="w-4 h-4 text-amber-500" />
              ) : (
                <ShieldCheck className="w-4 h-4 text-emerald-500" />
              )}
              <span>Air-Gap Guard</span>
            </div>
            <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded font-medium ${
              isAirGapped 
                ? "bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300" 
                : "bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300"
            }`}>
              {isAirGapped ? "STRICT" : "TOR SOCKS5"}
            </span>
          </button>

          {/* Session Export */}
          <button
            onClick={toggleExport}
            className="w-full px-3 py-2 rounded-xl text-xs font-medium text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800/80 flex items-center justify-between transition-colors text-left"
            title="Export / Import Session State"
          >
            <div className="flex items-center space-x-2.5">
              <FileJson className="w-4 h-4 text-stone-500" />
              <span>Export Session</span>
            </div>
            <span className="text-[9px] font-mono text-stone-400">Ctrl+E</span>
          </button>

          {/* Shortcuts */}
          <button
            onClick={toggleShortcuts}
            className="w-full px-3 py-2 rounded-xl text-xs font-medium text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800/80 flex items-center justify-between transition-colors text-left"
            title="View Keyboard Shortcuts"
          >
            <div className="flex items-center space-x-2.5">
              <Keyboard className="w-4 h-4 text-stone-500" />
              <span>Shortcuts</span>
            </div>
            <span className="text-[9px] font-mono text-stone-400">?</span>
          </button>

          {/* Audio Feedback Toggle */}
          <button
            onClick={toggleSound}
            className="w-full px-3 py-2 rounded-xl text-xs font-medium text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800/80 flex items-center justify-between transition-colors text-left"
            title="Toggle Audio Feedback"
          >
            <div className="flex items-center space-x-2.5">
              {soundEnabled ? (
                <Volume2 className="w-4 h-4 text-stone-600 dark:text-stone-300" />
              ) : (
                <VolumeX className="w-4 h-4 text-stone-400" />
              )}
              <span>Audio Feedback</span>
            </div>
            <span className="text-[9px] font-mono text-stone-400">
              {soundEnabled ? "ON" : "MUTED"}
            </span>
          </button>
        </div>
      </div>

      {/* Sidebar Host Status Footer */}
      <div className="p-3 border-t border-stone-200 dark:border-stone-800 bg-stone-50/50 dark:bg-stone-950/50 text-[11px] font-mono">
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
