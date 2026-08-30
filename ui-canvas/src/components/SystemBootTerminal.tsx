import React, { useState, useEffect } from 'react';
import { PuzzleBoxLoader } from './PuzzleBoxLoader';
import { Terminal, Activity, Cpu, Network, ShieldCheck, Zap } from 'lucide-react';

const BOOT_LOGS = [
  { level: 'SYS', text: 'INIT KERNEL :: Xeno-Inference Core v2.4.0 (x86_64-quantum)', color: 'text-violet-400' },
  { level: 'AST', text: 'BINDING SYNTAX TREES -> Rust Semantic Parser loaded (0.42ms)', color: 'text-cyan-400' },
  { level: 'GPU', text: 'VRAM ALLOCATED :: 14.8 GB / 24 GB [Tensor Core Array #0-#7]', color: 'text-emerald-400' },
  { level: 'ROU', text: 'CONSENSUS ROUTER -> DeepSeek V3 + Claude 3.7 + Gemini 2.5', color: 'text-fuchsia-400' },
  { level: 'DAG', text: 'SPATIAL RUNTIME :: Mounting infinite nodular constellation...', color: 'text-amber-400' },
  { level: 'SEC', text: 'TOR SANDBOX :: Ephemeral isolation channel established', color: 'text-emerald-400' },
  { level: 'CIP', text: '3301 CIPHER ENIGMA :: Prime verification hash: 0x9AF4...OK', color: 'text-cyan-300' },
  { level: 'RUN', text: 'LIVE INFERENCE DAEMON READY // LISTENING ON IPC & WS PORT 5173', color: 'text-white font-bold' },
];

export const SystemBootTerminal: React.FC = () => {
  const [displayedLogs, setDisplayedLogs] = useState<typeof BOOT_LOGS>([]);
  const [activeBlocks, setActiveBlocks] = useState<boolean[]>([true, true, true, false, true, true, false, true]);
  const [tokenVelocity, setTokenVelocity] = useState(142.8);
  const [latency, setLatency] = useState(18.4);

  // Stream logs with terminal typewriter delay
  useEffect(() => {
    let index = 0;
    const interval = setInterval(() => {
      if (index < BOOT_LOGS.length) {
        setDisplayedLogs((prev) => [...prev, BOOT_LOGS[index]]);
        index++;
      } else {
        // Subtle loop to add fresh telemetry pulse
        index = 0;
        setDisplayedLogs([BOOT_LOGS[0]]);
      }
    }, 1100);

    return () => clearInterval(interval);
  }, []);

  // Animate dynamic telemetry graphs and block states
  useEffect(() => {
    const blockInterval = setInterval(() => {
      setActiveBlocks((prev) =>
        prev.map(() => Math.random() > 0.3)
      );
      setTokenVelocity(+(135 + Math.random() * 25).toFixed(1));
      setLatency(+(16 + Math.random() * 6).toFixed(1));
    }, 800);
    return () => clearInterval(blockInterval);
  }, []);

  return (
    <div className="w-full space-y-4">
      {/* Half-blurry frosted command terminal card */}
      <div className="relative rounded-2xl bg-black/45 backdrop-blur-xl border border-white/10 p-5 shadow-[0_0_35px_rgba(0,0,0,0.8)] overflow-hidden transition-all duration-300 hover:border-violet-500/30">
        
        {/* Subtle background glow gradient */}
        <div className="absolute -right-20 -top-20 w-48 h-48 bg-violet-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -left-20 -bottom-20 w-48 h-48 bg-cyan-600/10 rounded-full blur-3xl pointer-events-none" />

        {/* Terminal Header with Puzzle Box and Status */}
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-white/10 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-3 h-3 rounded-full bg-rose-500/80 border border-rose-400" />
            <div className="w-3 h-3 rounded-full bg-amber-500/80 border border-amber-400" />
            <div className="w-3 h-3 rounded-full bg-emerald-500/80 border border-emerald-400" />
            <span className="text-xs font-mono tracking-wider text-zinc-400 ml-2 flex items-center gap-1.5">
              <Terminal className="w-3.5 h-3.5 text-cyan-400" />
              xeno-inference://kernel-init
            </span>
          </div>

          {/* Animated Square Box Puzzle Loader */}
          <PuzzleBoxLoader size="sm" label="MATRIX BOOT" />
        </div>

        {/* Streaming Command Log Lines with Half-Blurry Aesthetic */}
        <div className="font-mono text-xs space-y-2 h-44 overflow-y-auto pr-1">
          {displayedLogs.map((log, idx) => (
            <div 
              key={idx} 
              className="flex items-start gap-2.5 animate-fadeIn transition-all duration-300"
            >
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-zinc-800/80 border border-zinc-700/60 text-zinc-400 font-semibold tracking-wider">
                [{log.level}]
              </span>
              <span className={`${log.color} tracking-wide text-shadow-sm`}>
                {log.text}
              </span>
            </div>
          ))}
          <div className="flex items-center gap-1 text-cyan-400 animate-pulse pt-1">
            <span className="text-xs font-bold">&gt;</span>
            <span className="w-2 h-4 bg-cyan-400 inline-block ml-0.5" />
          </div>
        </div>

        {/* Mini HUD Graphs and Cybernetic Blocks Design */}
        <div className="mt-4 pt-3 border-t border-white/10 grid grid-cols-2 sm:grid-cols-4 gap-3">
          
          {/* Telemetry Block 1: Tensor VRAM */}
          <div className="bg-zinc-950/60 border border-white/5 rounded-lg p-2.5">
            <div className="flex items-center justify-between text-[10px] text-zinc-400 mb-1 font-mono">
              <span className="flex items-center gap-1 text-violet-400">
                <Cpu className="w-3 h-3" /> VRAM CORE
              </span>
              <span className="text-zinc-300 font-semibold">14.8 / 24 GB</span>
            </div>
            {/* Memory Blocks Visualizer */}
            <div className="grid grid-cols-6 gap-1 h-2">
              {[...Array(6)].map((_, i) => (
                <div 
                  key={i} 
                  className={`rounded-sm transition-all duration-300 ${
                    i < 4 ? 'bg-violet-500 shadow-[0_0_6px_#8b5cf6]' : 'bg-zinc-800'
                  }`} 
                />
              ))}
            </div>
          </div>

          {/* Telemetry Block 2: Token Velocity */}
          <div className="bg-zinc-950/60 border border-white/5 rounded-lg p-2.5">
            <div className="flex items-center justify-between text-[10px] text-zinc-400 mb-1 font-mono">
              <span className="flex items-center gap-1 text-cyan-400">
                <Zap className="w-3 h-3" /> VELOCITY
              </span>
              <span className="text-cyan-300 font-semibold">{tokenVelocity} t/s</span>
            </div>
            {/* Mini Sparkline Graph */}
            <div className="h-2 flex items-end gap-0.5">
              {[40, 60, 55, 80, 70, 95, 85, 100, 90, 80, 95].map((val, i) => (
                <div 
                  key={i} 
                  style={{ height: `${val}%` }} 
                  className="w-full bg-cyan-400/80 rounded-t-xs"
                />
              ))}
            </div>
          </div>

          {/* Telemetry Block 3: Latency Waveform */}
          <div className="bg-zinc-950/60 border border-white/5 rounded-lg p-2.5">
            <div className="flex items-center justify-between text-[10px] text-zinc-400 mb-1 font-mono">
              <span className="flex items-center gap-1 text-emerald-400">
                <Activity className="w-3 h-3" /> LATENCY
              </span>
              <span className="text-emerald-300 font-semibold">{latency} ms</span>
            </div>
            {/* Live Waveform Indicator */}
            <div className="h-2 flex items-center justify-between gap-0.5">
              {[6, 12, 18, 14, 8, 16, 20, 10, 15].map((h, i) => (
                <div 
                  key={i}
                  style={{ height: `${h}px` }} 
                  className="w-1 bg-emerald-400 rounded-full"
                />
              ))}
            </div>
          </div>

          {/* Telemetry Block 4: DAG Swarm Matrix Blocks */}
          <div className="bg-zinc-950/60 border border-white/5 rounded-lg p-2.5">
            <div className="flex items-center justify-between text-[10px] text-zinc-400 mb-1 font-mono">
              <span className="flex items-center gap-1 text-amber-400">
                <Network className="w-3 h-3" /> DAG SWARM
              </span>
              <span className="text-amber-300 font-semibold">8 NODES</span>
            </div>
            {/* 8-Node Swarm Matrix Grid */}
            <div className="grid grid-cols-8 gap-0.5 h-2">
              {activeBlocks.map((active, i) => (
                <div 
                  key={i}
                  className={`rounded-xs transition-colors duration-200 ${
                    active ? 'bg-amber-400 shadow-[0_0_4px_#ffd166]' : 'bg-zinc-800'
                  }`}
                />
              ))}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
