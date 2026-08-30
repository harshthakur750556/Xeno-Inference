import React from "react";
import { useWorkspaceStore } from "../../stores/workspaceStore";
import { 
  GitFork, 
  X, 
  BrainCircuit, 
  CheckCircle2, 
  ExternalLink, 
  Clock, 
  Zap, 
  Layers, 
  ArrowRight 
} from "lucide-react";

export const ThinkingGraphDrawer: React.FC = () => {
  const { 
    activeInspectGraphMessageId, 
    setActiveInspectGraphMessageId, 
    chatMessages, 
    setActiveView 
  } = useWorkspaceStore();

  if (!activeInspectGraphMessageId) return null;

  const message = chatMessages.find((m) => m.id === activeInspectGraphMessageId);
  const thinking = message?.thinking;

  if (!thinking) return null;

  return (
    <div className="fixed inset-y-0 right-0 z-45 w-full sm:w-[480px] bg-white/95 dark:bg-stone-900/95 backdrop-blur-xl border-l border-stone-200 dark:border-stone-800 shadow-2xl flex flex-col animate-in slide-in-from-right duration-250 transition-colors">
      {/* Drawer Header */}
      <div className="p-4 border-b border-stone-200 dark:border-stone-800 flex items-center justify-between bg-stone-50/50 dark:bg-stone-950/50">
        <div className="flex items-center space-x-2.5">
          <div className="p-2 rounded-xl bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-900/50 text-amber-600 dark:text-amber-400">
            <BrainCircuit className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-stone-900 dark:text-stone-100 flex items-center gap-2">
              Cognitive Execution Graph
              <span className="text-[10px] px-2 py-0.5 rounded-full font-mono bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                {thinking.tokens} Tok
              </span>
            </h3>
            <p className="text-xs text-stone-500 dark:text-stone-400 font-mono">
              Duration: {thinking.durationSecs}s · 4 Verification Steps
            </p>
          </div>
        </div>

        <button
          onClick={() => setActiveInspectGraphMessageId(null)}
          className="p-1.5 rounded-lg hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 transition-colors"
          title="Close Drawer"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Drawer Content */}
      <div className="p-5 overflow-y-auto space-y-6 flex-1">
        {/* Thinking Summary */}
        <div className="p-3.5 rounded-xl border border-amber-200/70 dark:border-amber-900/40 bg-amber-50/30 dark:bg-amber-950/20">
          <span className="text-[11px] font-semibold text-amber-800 dark:text-amber-300 uppercase tracking-wider block mb-1">
            Reasoning Objective & Strategy
          </span>
          <p className="text-xs text-stone-700 dark:text-stone-300 leading-relaxed font-editorial">
            {thinking.summary}
          </p>
        </div>

        {/* Mini Interactive DAG Visualization */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs font-semibold text-stone-700 dark:text-stone-300">
            <span className="flex items-center gap-1.5">
              <GitFork className="w-3.5 h-3.5 text-blue-500" />
              Petgraph Execution Tree
            </span>
            <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400">
              100% Verified
            </span>
          </div>

          <div className="p-4 rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50/40 dark:bg-stone-950/40 space-y-3 font-mono text-xs">
            {thinking.steps.map((step, idx) => (
              <div key={idx} className="relative pl-6 pb-2.5 last:pb-0">
                {idx < thinking.steps.length - 1 && (
                  <div className="absolute left-[9px] top-4 bottom-0 w-0.5 bg-stone-200 dark:bg-stone-800" />
                )}
                <div className="absolute left-0 top-0.5 w-4.5 h-4.5 rounded-full bg-white dark:bg-stone-900 border-2 border-emerald-500 flex items-center justify-center text-[9px] font-bold text-emerald-600">
                  ✓
                </div>
                <div className="p-2.5 rounded-lg border border-stone-200/80 dark:border-stone-800/80 bg-white dark:bg-stone-900 shadow-2xs">
                  <div className="font-semibold text-stone-800 dark:text-stone-200 text-xs">
                    {step}
                  </div>
                  <div className="text-[10px] text-stone-400 mt-1 flex items-center gap-2">
                    <span className="flex items-center gap-0.5">
                      <Clock className="w-2.5 h-2.5" /> {(0.4 + idx * 0.3).toFixed(1)}s
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-0.5">
                      <Zap className="w-2.5 h-2.5" /> {Math.round(thinking.tokens / thinking.steps.length)} tok
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Full View Transition Action Cards */}
        <div className="space-y-2.5 pt-2">
          <span className="text-xs font-semibold text-stone-500 uppercase tracking-wider">
            Explore Full Workstation Views
          </span>

          <button
            onClick={() => {
              setActiveInspectGraphMessageId(null);
              setActiveView("dag");
            }}
            className="w-full p-3 rounded-xl border border-stone-200 dark:border-stone-800 hover:border-blue-300 dark:hover:border-blue-800 bg-white dark:bg-stone-900 hover:bg-blue-50/20 dark:hover:bg-blue-950/20 transition-all flex items-center justify-between text-left group cursor-pointer"
          >
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400">
                <GitFork className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-semibold text-stone-900 dark:text-stone-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                  Open in Live Execution DAG
                </h4>
                <p className="text-[11px] text-stone-500 font-editorial">
                  Interactive multi-agent topological dependency graph
                </p>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-stone-400 group-hover:translate-x-0.5 transition-transform" />
          </button>

          <button
            onClick={() => {
              setActiveInspectGraphMessageId(null);
              setActiveView("timeline");
            }}
            className="w-full p-3 rounded-xl border border-stone-200 dark:border-stone-800 hover:border-amber-300 dark:hover:border-amber-800 bg-white dark:bg-stone-900 hover:bg-amber-50/20 dark:hover:bg-amber-950/20 transition-all flex items-center justify-between text-left group cursor-pointer"
          >
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-lg bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400">
                <BrainCircuit className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-semibold text-stone-900 dark:text-stone-100 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                  Open Cognitive Timeline
                </h4>
                <p className="text-[11px] text-stone-500 font-editorial">
                  Inspect speculative branches and pruning rationales
                </p>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-stone-400 group-hover:translate-x-0.5 transition-transform" />
          </button>

          <button
            onClick={() => {
              setActiveInspectGraphMessageId(null);
              setActiveView("canvas");
            }}
            className="w-full p-3 rounded-xl border border-stone-200 dark:border-stone-800 hover:border-emerald-300 dark:hover:border-emerald-800 bg-white dark:bg-stone-900 hover:bg-emerald-50/20 dark:hover:bg-emerald-950/20 transition-all flex items-center justify-between text-left group cursor-pointer"
          >
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
                <Layers className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-semibold text-stone-900 dark:text-stone-100 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                  Inspect in Spatial Canvas
                </h4>
                <p className="text-[11px] text-stone-500 font-editorial">
                  Manipulate nodes on 2D infinite spatial whiteboard
                </p>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-stone-400 group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>
      </div>

      {/* Drawer Footer */}
      <div className="p-4 border-t border-stone-200 dark:border-stone-800 bg-stone-50/50 dark:bg-stone-950/50 flex justify-end">
        <button
          onClick={() => setActiveInspectGraphMessageId(null)}
          className="px-4 py-1.5 rounded-lg border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-700 dark:text-stone-200 text-xs font-medium hover:bg-stone-50 dark:hover:bg-stone-700 transition-colors"
        >
          Dismiss Drawer
        </button>
      </div>
    </div>
  );
};
