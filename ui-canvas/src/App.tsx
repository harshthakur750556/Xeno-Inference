import React from 'react';
import { TelemetryHUD } from './components/TelemetryHUD';
import { CicadaHeroSvg } from './components/CicadaHeroSvg';
import { SystemBootTerminal } from './components/SystemBootTerminal';
import { ChatInterface } from './components/ChatInterface';
import { Sparkles, Terminal, ArrowDown, Shield, Cpu, Zap, Layers } from 'lucide-react';

export function App() {
  const scrollToChat = () => {
    const chatElement = document.getElementById('chat-section');
    chatElement?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-[#030306] text-zinc-100 relative overflow-x-hidden selection:bg-cyan-500/30 selection:text-cyan-200">
      
      {/* Background Ambient Radial Glows */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        {/* Deep Violet Glow Top-Left */}
        <div className="absolute -top-40 -left-40 w-[600px] h-[600px] rounded-full bg-violet-900/20 blur-[130px]" />
        
        {/* Cyan Ambient Glow Top-Right */}
        <div className="absolute top-10 right-0 w-[650px] h-[650px] rounded-full bg-cyan-900/20 blur-[140px]" />
        
        {/* Magenta Glow Bottom */}
        <div className="absolute bottom-20 left-1/3 w-[700px] h-[700px] rounded-full bg-fuchsia-950/15 blur-[160px]" />
        
        {/* Subtle Cyber Grid */}
        <div className="absolute inset-0 cyber-grid opacity-30" />
      </div>

      {/* Top Telemetry Navigation HUD */}
      <TelemetryHUD />

      {/* Main Container */}
      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-16 lg:space-y-24">
        
        {/* ========================================================================= */}
        {/* SPLIT PAGED WELCOME / START HERO SECTION IN PITCH DARK THEME             */}
        {/* ========================================================================= */}
        <section className="min-h-[calc(100vh-8rem)] flex items-center justify-center">
          <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
            
            {/* ------------------------------------------------------------------- */}
            {/* LEFT SIDE: ROMANIAN BIG FONTS + ANIMATED COMMAND TERMINAL & HUD    */}
            {/* ------------------------------------------------------------------- */}
            <div className="lg:col-span-7 flex flex-col justify-center space-y-6">
              
              {/* Top Sub-Badge */}
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/[0.03] border border-white/10 w-fit backdrop-blur-md">
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                <span className="text-xs font-mono tracking-widest text-cyan-300 uppercase font-semibold">
                  CIPHER 3301 // NEURAL CONSENSUS KERNEL
                </span>
              </div>

              {/* Big Romanian Serif Typography Title */}
              <div className="space-y-2">
                <h1 className="font-roman text-4xl sm:text-6xl xl:text-7xl font-extrabold tracking-tight leading-[1.08] text-transparent bg-clip-text bg-gradient-to-br from-white via-zinc-200 to-zinc-500 drop-shadow-[0_0_35px_rgba(255,255,255,0.2)]">
                  XENO INFERENCE
                </h1>
                <p className="font-roman text-sm sm:text-base tracking-[0.25em] text-cyan-400/90 font-medium uppercase drop-shadow-[0_0_15px_rgba(0,245,212,0.4)]">
                  AUTONOMOUS SPATIAL INTELLIGENCE MATRIX
                </p>
              </div>

              {/* Description Statement */}
              <p className="text-sm sm:text-base text-zinc-400 max-w-xl font-sans leading-relaxed">
                Next-generation distributed reasoning matrix with real-time AST verification, 
                multi-agent spatial DAG execution, and quantum routed consensus.
              </p>

              {/* Half-Blurry Shades Animated Command Terminal & Block Graphs & Puzzle Box */}
              <SystemBootTerminal />

              {/* Action Buttons to Enter Chat or Explore */}
              <div className="flex flex-wrap items-center gap-4 pt-2">
                <button
                  type="button"
                  onClick={scrollToChat}
                  className="px-6 py-3 rounded-2xl bg-gradient-to-r from-cyan-500 via-violet-600 to-fuchsia-600 hover:from-cyan-400 hover:via-violet-500 hover:to-fuchsia-500 text-white font-mono text-xs sm:text-sm font-semibold tracking-wider shadow-[0_0_25px_rgba(0,245,212,0.4)] hover:shadow-[0_0_35px_rgba(139,92,246,0.6)] transition-all flex items-center gap-2 hover:scale-[1.02] active:scale-[0.98]"
                >
                  <Sparkles className="w-4 h-4 text-cyan-200" />
                  <span>INITIALIZE CONVERSATION</span>
                  <ArrowDown className="w-4 h-4 ml-1 animate-bounce" />
                </button>

                <div className="flex items-center gap-2 text-xs font-mono text-zinc-500 px-3 py-2 rounded-xl bg-zinc-950/60 border border-white/5">
                  <Cpu className="w-3.5 h-3.5 text-violet-400" />
                  <span>100% Rust AST Safe</span>
                </div>
              </div>

            </div>

            {/* ------------------------------------------------------------------- */}
            {/* RIGHT SIDE: LARGE DESIGNER SVG CICADA WITH GRADIENT WINGS           */}
            {/* ------------------------------------------------------------------- */}
            <div className="lg:col-span-5 flex items-center justify-center">
              <div className="w-full flex flex-col items-center justify-center relative">
                
                {/* Autoadjustable Large Designer Cicada SVG */}
                <CicadaHeroSvg className="w-full max-w-[540px] xl:max-w-[620px]" />

                {/* Cicada Holographic Metadata Caption */}
                <div className="mt-2 text-center space-y-1">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-black/60 border border-violet-500/30 backdrop-blur-md text-[11px] font-mono text-zinc-400">
                    <span className="w-1.5 h-1.5 rounded-full bg-violet-400" />
                    <span>ENTOMOLOGICAL CIPHER // SPECIMEN 3301</span>
                  </div>
                  <p className="text-[10px] font-mono text-zinc-600">
                    IRIDESCENT VECTOR MEMBRANE • 800×800 AUTO-SCALING VIEWPORT
                  </p>
                </div>

              </div>
            </div>

          </div>
        </section>

        {/* ========================================================================= */}
        {/* CHATBOX SECTION                                                           */}
        {/* ========================================================================= */}
        <section id="chat-section" className="pt-12 sm:pt-16 pb-20 scroll-mt-20">
          
          <div className="text-center space-y-3 mb-8">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/50 border border-cyan-500/30 text-cyan-300 text-xs font-mono">
              <Terminal className="w-3.5 h-3.5" />
              <span>INTERACTIVE OPERATOR CONSOLE</span>
            </div>
            <h2 className="font-roman text-2xl sm:text-4xl font-bold tracking-wide text-zinc-100">
              COMMENCE INFERENCE
            </h2>
            <p className="text-xs sm:text-sm text-zinc-400 font-mono max-w-xl mx-auto">
              Dispatch high-order reasoning prompts, AST validation directives, or multi-agent workflows.
            </p>
          </div>

          {/* Fully Interactive Chat Interface */}
          <ChatInterface />

        </section>

      </main>

      {/* Futuristic Footer */}
      <footer className="relative z-10 border-t border-white/10 bg-black/80 py-8 px-4 text-center font-mono text-xs text-zinc-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-roman font-bold text-zinc-300">XENO INFERENCE</span>
            <span>—</span>
            <span>Pitch Dark Spatial Matrix</span>
          </div>
          <div className="flex items-center gap-4 text-zinc-400 text-[11px]">
            <span>ENGINE: RUST 1.97</span>
            <span>•</span>
            <span>TAURI V2 IPC</span>
            <span>•</span>
            <span>REACT 19</span>
          </div>
        </div>
      </footer>

    </div>
  );
}

export default App;
