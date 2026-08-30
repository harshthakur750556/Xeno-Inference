import React, { useState, useEffect } from "react";
import { useWorkspaceStore } from "../../stores/workspaceStore";
import { CicadaDesignerSvg } from "./CicadaDesignerSvg";
import { PuzzleBoxLoader } from "./PuzzleBoxLoader";
import { 
  Terminal, 
  Cpu, 
  Sparkles, 
  ArrowRight, 
  ShieldCheck, 
  Radio, 
  Layers, 
  Activity, 
  Bot, 
  Key,
  Server,
  Zap,
  Globe
} from "lucide-react";

export const WelcomeSplitView: React.FC<{ onEnterStudio: () => void }> = ({ onEnterStudio }) => {
  const { 
    systemMetrics, 
    isAirGapped, 
    selectedModel, 
    openProviderModal, 
    providers,
    handleSmartPrompt 
  } = useWorkspaceStore();

  const [promptInput, setPromptInput] = useState("");
  const [logIndex, setLogIndex] = useState(0);

  const initLogs = [
    { tag: "SYS_CORE", text: `Probing bare machine hardware... ${systemMetrics.cpuCores} Threads Allocated`, status: "DONE" },
    { tag: "GPU_RASTER", text: `${systemMetrics.gpuRenderer} WebGL 2.0 Kernel Armed`, status: "DONE" },
    { tag: "AIRGAP_GUARD", text: isAirGapped ? "Air-Gap Isolation L3 Active • Zero External Sockets" : "Tor SOCKS5 Proxy 127.0.0.1:9050 Routing Enabled", status: "SECURE" },
    { tag: "SYN_ENGINE", text: "AST character-exact diff & verification matrix mounted", status: "READY" },
    { tag: "SWARM_BUS", text: "Autonomous 5-Role Agent Council initialized", status: "READY" },
    { tag: "3D_CAD", text: "Parametric geometry & procedural mesh generator online", status: "READY" },
    { tag: "XENO_NODE", text: "Sovereign inference pipeline initialized. Ready for directive transmission.", status: "LIVE" },
  ];

  // Auto-advancing progressive initialization animation
  useEffect(() => {
    if (logIndex < initLogs.length - 1) {
      const timer = setTimeout(() => {
        setLogIndex((prev) => prev + 1);
      }, 350);
      return () => clearTimeout(timer);
    }
  }, [logIndex, initLogs.length]);

  const handleLaunch = (e: React.FormEvent) => {
    e.preventDefault();
    if (promptInput.trim()) {
      handleSmartPrompt(promptInput);
    }
    onEnterStudio();
  };

  const visibleLogs = initLogs.slice(0, logIndex + 1);

  return (
    <div className="flex-1 w-full h-full min-h-screen bg-[#020204] text-stone-100 flex flex-col lg:flex-row items-center justify-between p-4 sm:p-8 lg:p-14 overflow-y-auto relative select-none font-sans">
      {/* Background Matrix Grid */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#09090b_1px,transparent_1px),linear-gradient(to_bottom,#09090b_1px,transparent_1px)] bg-[size:36px_36px] opacity-40 pointer-events-none" />

      {/* Ambient Lighting Spheres */}
      <div className="absolute top-1/4 left-10 w-96 h-96 bg-amber-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-[450px] h-[450px] bg-cyan-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* ================= LEFT COLUMN: ROMANIAN IDENTITY & INITIALIZATION ================= */}
      <div className="w-full lg:w-[54%] z-10 flex flex-col justify-center space-y-6 lg:pr-8">
        {/* Sacred Badge */}
        <div className="inline-flex items-center space-x-2.5 px-3.5 py-1 rounded-full border border-amber-500/30 bg-amber-950/20 backdrop-blur-md shadow-[0_0_15px_rgba(245,158,11,0.15)] w-fit text-xs font-mono">
          <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
          <span className="font-display font-bold uppercase tracking-widest text-amber-300">
            OPUS INFÈRE • SOVEREIGN WORKSTATION
          </span>
          <span className="text-stone-600">•</span>
          <span className="text-emerald-400 font-bold">AIR-GAP VERIFIED</span>
        </div>

        {/* Big Romanian Font Title */}
        <div className="space-y-2">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-display font-black text-transparent bg-clip-text bg-linear-to-r from-stone-100 via-amber-100 to-stone-300 tracking-tight leading-[1.08] drop-shadow-sm uppercase">
            XENO INFERENCE
          </h1>
          <p className="text-sm sm:text-base font-editorial italic text-stone-400 max-w-xl leading-relaxed">
            Autonomous multi-agent intelligence, character-exact AST synthesis, and sovereign local & cloud inference.
          </p>
        </div>

        {/* ================= COMMAND ANIMATION STREAM & PUZZLE LOADER ================= */}
        <div className="p-4 sm:p-5 rounded-3xl border border-stone-800/90 bg-[#07070a]/95 backdrop-blur-2xl shadow-2xl space-y-3.5 relative overflow-hidden">
          {/* Header of Stream */}
          <div className="flex items-center justify-between pb-2.5 border-b border-stone-800/80 text-xs font-mono">
            <div className="flex items-center space-x-2">
              <Terminal className="w-4 h-4 text-amber-500" />
              <span className="font-bold text-stone-300 uppercase tracking-wider">
                System Kernel Initialization
              </span>
            </div>

            {/* Puzzle Box Reloader Animated Symbol */}
            <div className="flex items-center space-x-2">
              <PuzzleBoxLoader size={26} />
              <span className="text-[10px] text-amber-400 font-bold uppercase">
                {logIndex < initLogs.length - 1 ? "Booting" : "Ready"}
              </span>
            </div>
          </div>

          {/* Half-Blurry Fading Animated Log Lines */}
          <div className="space-y-1.5 font-mono text-[11px] max-h-36 overflow-y-auto leading-relaxed">
            {visibleLogs.map((log, idx) => {
              const isLatest = idx === visibleLogs.length - 1;
              const isOlder = idx < visibleLogs.length - 2;

              return (
                <div
                  key={idx}
                  className={`flex items-start space-x-2 transition-all duration-300 ${
                    isLatest
                      ? "text-stone-100 font-bold animate-in fade-in"
                      : isOlder
                      ? "text-stone-500 opacity-60 blur-[0.4px]"
                      : "text-stone-300 opacity-90"
                  }`}
                >
                  <span className="text-amber-500 font-bold">[{log.tag}]</span>
                  <span className="flex-1 truncate">{log.text}</span>
                  <span className={`text-[9px] px-1.5 py-0.2 rounded font-bold ${
                    log.status === "DONE" || log.status === "READY" || log.status === "LIVE"
                      ? "text-emerald-400 bg-emerald-950/40"
                      : "text-amber-400 bg-amber-950/40"
                  }`}>
                    {log.status}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Micro Telemetry Blocks & Graphs Design */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-stone-800/80 font-mono text-[10px]">
            <div className="p-2 rounded-xl bg-stone-900/60 border border-stone-800">
              <div className="text-stone-500 uppercase font-bold">Hardware</div>
              <div className="text-stone-200 font-bold truncate">{systemMetrics.cpuCores} Threads</div>
            </div>

            <div className="p-2 rounded-xl bg-stone-900/60 border border-stone-800">
              <div className="text-stone-500 uppercase font-bold">RAM Heap</div>
              <div className="text-stone-200 font-bold truncate">{systemMetrics.ramHeapMb} MB</div>
            </div>

            <div className="p-2 rounded-xl bg-stone-900/60 border border-stone-800">
              <div className="text-stone-500 uppercase font-bold">Engine</div>
              <div className="text-amber-400 font-bold truncate">{selectedModel}</div>
            </div>

            <div className="p-2 rounded-xl bg-stone-900/60 border border-stone-800">
              <div className="text-stone-500 uppercase font-bold">Security</div>
              <div className="text-emerald-400 font-bold truncate">{isAirGapped ? "Air-Gap" : "Tor SOCKS5"}</div>
            </div>
          </div>
        </div>

        {/* Direct Action Launch Bar */}
        <form
          onSubmit={handleLaunch}
          className="flex items-center space-x-2 bg-[#09090d]/90 p-2 rounded-2xl border border-stone-700/80 focus-within:border-amber-500 shadow-xl"
        >
          <input
            type="text"
            value={promptInput}
            onChange={(e) => setPromptInput(e.target.value)}
            placeholder="Type directive (or press Launch to enter Studio)..."
            className="flex-1 bg-transparent px-3 py-2 text-xs sm:text-sm text-stone-100 placeholder:text-stone-500 outline-none font-sans"
          />

          <button
            type="submit"
            className="px-5 py-2.5 rounded-xl bg-linear-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-stone-950 font-display font-bold text-xs sm:text-sm flex items-center space-x-2 transition-all shadow-[0_0_20px_rgba(245,158,11,0.3)] active:scale-95 cursor-pointer shrink-0"
          >
            <span>Enter Studio</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Secondary Quick Access Links */}
        <div className="flex flex-wrap items-center gap-3 text-xs font-mono text-stone-400 pt-1">
          <button
            onClick={() => openProviderModal()}
            className="hover:text-amber-400 flex items-center gap-1.5 underline decoration-stone-700 underline-offset-4 cursor-pointer"
          >
            <Key className="w-3.5 h-3.5 text-amber-500" />
            <span>Configure AI Models & Keys</span>
          </button>
          <span>•</span>
          <button
            onClick={onEnterStudio}
            className="hover:text-cyan-400 flex items-center gap-1.5 underline decoration-stone-700 underline-offset-4 cursor-pointer"
          >
            <Layers className="w-3.5 h-3.5 text-cyan-400" />
            <span>Infinite 3D Canvas</span>
          </button>
        </div>
      </div>

      {/* ================= RIGHT COLUMN: RESPONSIVE DESIGNER CICADA SVG ================= */}
      <div className="w-full lg:w-[46%] mt-8 lg:mt-0 flex items-center justify-center relative p-2 sm:p-4">
        <CicadaDesignerSvg className="max-h-[68vh]" />
      </div>
    </div>
  );
};
