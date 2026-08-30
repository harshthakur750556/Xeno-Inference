import React, { useState, useRef, useEffect } from "react";
import { useWorkspaceStore } from "../../stores/workspaceStore";
import { Terminal, Shield, Trash2, CheckCircle2, Play, Sparkles, Cpu, HardDrive } from "lucide-react";

export const SandboxedTerminalView: React.FC = () => {
  const { terminalLogs, executeCommand, clearTerminalLogs, systemMetrics, isAirGapped } = useWorkspaceStore();
  const [cmdInput, setCmdInput] = useState("");
  const endRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [terminalLogs]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!cmdInput.trim()) return;
    executeCommand(cmdInput);
    setCmdInput("");
  };

  const quickCommands = [
    { label: "sysinfo", cmd: "sysinfo" },
    { label: "gpu", cmd: "gpu" },
    { label: "models", cmd: "models" },
    { label: "providers", cmd: "providers" },
    { label: "eval 2**10", cmd: "eval Math.pow(2, 10)" },
    { label: "help", cmd: "help" },
  ];

  return (
    <div className="flex-1 flex flex-col h-full bg-stone-900 text-stone-100 text-xs font-mono select-text transition-colors duration-200 overflow-hidden">
      {/* Terminal Top Bar */}
      <div className="h-12 border-b border-stone-800 bg-stone-950 px-3 sm:px-6 flex items-center justify-between z-10 shrink-0 select-none">
        <div className="flex items-center space-x-2.5 sm:space-x-3">
          <div className="flex items-center space-x-2">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="font-bold text-stone-100 font-display text-xs sm:text-sm tracking-wide">
              SOVEREIGN REPL #pty-node
            </span>
          </div>
          <span className="hidden md:inline-block text-[10px] px-2 py-0.5 rounded-md bg-stone-850 border border-stone-700 text-stone-400">
            {systemMetrics.osPlatform}
          </span>
        </div>

        <div className="flex items-center space-x-2">
          <span className="flex items-center gap-1.5 text-[10px] px-2.5 py-1 rounded-lg bg-stone-850 text-emerald-400 border border-stone-700 font-semibold">
            <Shield className="w-3 h-3 text-emerald-400" />
            {isAirGapped ? "Air-Gap Isolated" : "Tor SOCKS5 Guard"}
          </span>

          <button
            onClick={clearTerminalLogs}
            className="p-1.5 rounded-lg hover:bg-stone-800 text-stone-400 hover:text-stone-100 transition-colors cursor-pointer"
            title="Clear Terminal Output"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Terminal Output Area */}
      <div className="flex-1 p-3 sm:p-6 overflow-y-auto space-y-2 bg-stone-950/90 font-mono leading-relaxed">
        {terminalLogs.map((log) => {
          let textStyle = "text-stone-300";
          let badge = null;

          if (log.type === "command") {
            textStyle = "text-amber-400 font-bold";
          } else if (log.type === "stderr") {
            textStyle = "text-rose-400";
          } else if (log.type === "intervention") {
            textStyle = "text-emerald-300 bg-emerald-950/40 p-3 rounded-xl border border-emerald-800/80 my-2";
            badge = <CheckCircle2 className="w-4 h-4 text-emerald-400 inline mr-1.5" />;
          } else if (log.type === "system") {
            textStyle = "text-stone-400";
          }

          return (
            <div key={log.id} className="flex items-start space-x-2 sm:space-x-3 leading-relaxed">
              <span className="text-stone-600 select-none text-[10px] min-w-[50px] sm:min-w-[65px] pt-0.5">{log.timestamp}</span>
              <div className={`flex-1 break-all whitespace-pre-wrap ${textStyle}`}>
                {badge}
                {log.content}
              </div>
            </div>
          );
        })}
        <div ref={endRef} />
      </div>

      {/* Quick Action Command Chips */}
      <div className="px-3 sm:px-6 py-2 border-t border-stone-800 bg-stone-950/70 flex items-center space-x-2 overflow-x-auto select-none shrink-0">
        <span className="text-stone-500 uppercase text-[9px] font-bold">Quick:</span>
        {quickCommands.map((qc) => (
          <button
            key={qc.cmd}
            onClick={() => {
              executeCommand(qc.cmd);
              inputRef.current?.focus();
            }}
            className="px-2.5 py-1 rounded-lg bg-stone-850 hover:bg-stone-750 text-stone-300 hover:text-white border border-stone-700/80 text-[11px] font-mono transition-colors shrink-0 cursor-pointer active:scale-95"
          >
            {qc.label}
          </button>
        ))}
      </div>

      {/* Terminal Input Line */}
      <form
        onSubmit={handleSubmit}
        className="h-12 border-t border-stone-800 bg-stone-950 px-3 sm:px-6 flex items-center space-x-2.5 shrink-0"
      >
        <span className="text-emerald-400 font-bold text-sm select-none">$</span>
        <input
          ref={inputRef}
          type="text"
          value={cmdInput}
          onChange={(e) => setCmdInput(e.target.value)}
          placeholder="Execute shell command (sysinfo, gpu, models, providers, eval, help)..."
          className="flex-1 bg-transparent text-xs sm:text-sm text-stone-100 placeholder:text-stone-500 outline-none font-mono"
        />
        <button
          type="submit"
          className="px-3 py-1.5 bg-stone-100 hover:bg-white text-stone-900 font-bold rounded-lg text-xs transition-all shadow-xs shrink-0 cursor-pointer active:scale-95"
        >
          Send
        </button>
      </form>
    </div>
  );
};
