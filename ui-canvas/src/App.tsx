import React, { useEffect } from "react";
import { useWorkspaceStore, ViewMode } from "./stores/workspaceStore";
import { HeaderNav } from "./components/layout/HeaderNav";
import { AppSidebar } from "./components/layout/AppSidebar";
import { TelemetryHUD } from "./components/layout/TelemetryHUD";
import { OmniBar } from "./components/layout/OmniBar";
import { WelcomeSplitView } from "./components/welcome/WelcomeSplitView";
import { ChatStudioView } from "./components/chat/ChatStudioView";
import { UnifiedThinkingView } from "./components/thinking/UnifiedThinkingView";
import { SpatialCanvas } from "./components/canvas/SpatialCanvas";
import { TorSandboxedBrowserView } from "./components/browser/TorSandboxedBrowserView";
import { SandboxedTerminalView } from "./components/terminal/SandboxedTerminalView";
import { ASTDiffStudioView } from "./components/diff/ASTDiffStudioView";
import { ShortcutsModal } from "./components/modals/ShortcutsModal";
import { SessionExportModal } from "./components/modals/SessionExportModal";
import { McpToolsModal } from "./components/modals/McpToolsModal";
import { ModelProviderModal } from "./components/modals/ModelProviderModal";
import { 
  Sparkles,
  MessageSquare, 
  BrainCircuit, 
  LayoutGrid, 
  FileCode, 
  Terminal, 
  Globe 
} from "lucide-react";

export const App: React.FC = () => {
  const { 
    activeView, 
    setActiveView, 
    toggleSidebar, 
    isSidebarOpen,
    setSidebarOpen,
    toggleShortcuts, 
    toggleExport, 
    isShortcutsOpen, 
    isExportOpen,
    updateMetricsTick,
    themeMode
  } = useWorkspaceStore();

  // Sync Theme with Document Root and Body
  useEffect(() => {
    if (typeof document !== "undefined") {
      const root = document.documentElement;
      const body = document.body;
      if (themeMode === "dark" || activeView === "welcome") {
        root.classList.add("dark");
        root.classList.remove("light");
        body.classList.add("dark");
        body.classList.remove("light");
      } else {
        root.classList.remove("dark");
        root.classList.add("light");
        body.classList.remove("dark");
        body.classList.add("light");
      }
    }
  }, [themeMode, activeView]);

  // Dynamic Telemetry Engine Tick
  useEffect(() => {
    const interval = setInterval(() => {
      updateMetricsTick();
    }, 1000);
    return () => clearInterval(interval);
  }, [updateMetricsTick]);

  // Global Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.target instanceof HTMLInputElement || 
        e.target instanceof HTMLTextAreaElement || 
        e.target instanceof HTMLSelectElement
      ) {
        if (e.key === "Escape") {
          (e.target as HTMLElement).blur();
        }
        return;
      }

      if (e.key === "Escape") {
        if (isShortcutsOpen) toggleShortcuts();
        if (isExportOpen) toggleExport();
        if (isSidebarOpen) setSidebarOpen(false);
        return;
      }

      if (e.key === "?" || (e.shiftKey && e.key === "/")) {
        e.preventDefault();
        toggleShortcuts();
        return;
      }

      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "e") {
        e.preventDefault();
        toggleExport();
        return;
      }

      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "b") {
        e.preventDefault();
        toggleSidebar();
        return;
      }

      const views: ViewMode[] = ["welcome", "home", "thinking", "canvas", "diff", "terminal", "browser"];
      const keyNum = parseInt(e.key, 10);
      if (keyNum >= 1 && keyNum <= views.length) {
        e.preventDefault();
        setActiveView(views[keyNum - 1]);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [setActiveView, toggleSidebar, setSidebarOpen, toggleShortcuts, toggleExport, isShortcutsOpen, isExportOpen, isSidebarOpen]);

  const mobileNavItems: { id: ViewMode; label: string; icon: React.ReactNode }[] = [
    { id: "welcome", label: "Start", icon: <Sparkles className="w-4 h-4" /> },
    { id: "home", label: "Studio", icon: <MessageSquare className="w-4 h-4" /> },
    { id: "thinking", label: "Thinking", icon: <BrainCircuit className="w-4 h-4" /> },
    { id: "canvas", label: "Canvas", icon: <LayoutGrid className="w-4 h-4" /> },
    { id: "terminal", label: "Term", icon: <Terminal className="w-4 h-4" /> },
  ];

  // If user is on Welcome landing page, render dedicated split hero with pitch dark aesthetic
  if (activeView === "welcome") {
    return (
      <div className="w-full h-dvh max-h-dvh bg-[#020204] text-stone-100 flex flex-col justify-between relative overflow-hidden font-sans select-none">
        <ShortcutsModal />
        <SessionExportModal />
        <McpToolsModal />
        <ModelProviderModal />

        <HeaderNav />

        <div className="flex-1 flex overflow-hidden relative w-full">
          {isSidebarOpen && (
            <div 
              onClick={() => setSidebarOpen(false)}
              className="fixed inset-0 bg-black/70 backdrop-blur-xs z-40 lg:hidden transition-opacity duration-300"
            />
          )}

          <AppSidebar />

          <main className="flex-1 flex flex-col overflow-y-auto relative w-full h-full">
            <WelcomeSplitView onEnterStudio={() => setActiveView("home")} />
          </main>
        </div>

        {/* Mobile Quick Bottom Navigation Bar */}
        <div className="md:hidden h-14 border-t border-stone-800 bg-[#07070a]/95 backdrop-blur-xl px-2 flex items-center justify-around z-30 shrink-0">
          {mobileNavItems.map((item) => {
            const isActive = activeView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveView(item.id)}
                className={`flex flex-col items-center justify-center flex-1 py-1 rounded-xl transition-all ${
                  isActive
                    ? "text-amber-400 font-bold"
                    : "text-stone-500 hover:text-stone-300"
                }`}
              >
                <div className={`p-1 rounded-lg ${isActive ? "bg-amber-950/60" : ""}`}>
                  {item.icon}
                </div>
                <span className="text-[10px] font-medium tracking-tight mt-0.5">{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-dvh max-h-dvh bg-stone-50 dark:bg-stone-950 text-stone-900 dark:text-stone-100 flex flex-col justify-between relative overflow-hidden font-sans select-none transition-colors duration-300">
      {/* Universal Modals */}
      <ShortcutsModal />
      <SessionExportModal />
      <McpToolsModal />
      <ModelProviderModal />

      {/* Top Header Navigation */}
      <HeaderNav />

      {/* Real-Time Floating Telemetry HUD (Shown on canvas view) */}
      {activeView === "canvas" && (
        <TelemetryHUD />
      )}

      {/* Main Workspace Frame */}
      <div className="flex-1 flex overflow-hidden relative w-full">
        {/* Mobile Drawer Backdrop */}
        {isSidebarOpen && (
          <div 
            onClick={() => setSidebarOpen(false)}
            className="fixed inset-0 bg-stone-950/60 backdrop-blur-xs z-40 lg:hidden transition-opacity duration-300"
          />
        )}

        {/* Sidebar Component */}
        <AppSidebar />

        {/* Dynamic Viewport Surface */}
        <main className="flex-1 flex flex-col overflow-hidden relative w-full h-full">
          {activeView === "home" && <ChatStudioView />}
          {activeView === "thinking" && <UnifiedThinkingView />}
          {activeView === "canvas" && <SpatialCanvas />}
          {activeView === "diff" && <ASTDiffStudioView />}
          {activeView === "terminal" && <SandboxedTerminalView />}
          {activeView === "browser" && <TorSandboxedBrowserView />}
        </main>
      </div>

      {/* Mobile Quick Bottom Navigation Bar */}
      <div className="md:hidden h-14 border-t border-stone-200/90 dark:border-stone-800/90 bg-white/95 dark:bg-stone-900/95 backdrop-blur-xl px-2 flex items-center justify-around z-30 shrink-0">
        {mobileNavItems.map((item) => {
          const isActive = activeView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveView(item.id)}
              className={`flex flex-col items-center justify-center flex-1 py-1 rounded-xl transition-all ${
                isActive
                  ? "text-amber-700 dark:text-amber-400 font-bold"
                  : "text-stone-500 hover:text-stone-800 dark:hover:text-stone-300"
              }`}
            >
              <div className={`p-1 rounded-lg ${isActive ? "bg-amber-50 dark:bg-amber-950/60" : ""}`}>
                {item.icon}
              </div>
              <span className="text-[10px] font-medium tracking-tight mt-0.5">{item.label}</span>
            </button>
          );
        })}
      </div>

      {/* Bottom Command & Routing Omni-Bar (Shown on desktop non-home pages) */}
      {activeView !== "home" && (
        <div className="hidden md:block">
          <OmniBar />
        </div>
      )}
    </div>
  );
};

export default App;
