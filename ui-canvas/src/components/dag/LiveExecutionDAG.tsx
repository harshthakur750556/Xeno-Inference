import React, { useState } from "react";
import { useWorkspaceStore, DAGNodeItem } from "../../stores/workspaceStore";
import { 
  GitFork, 
  Crown, 
  Box, 
  Code2, 
  FlaskConical, 
  ShieldAlert, 
  CheckCircle2, 
  Clock, 
  Activity, 
  Play,
  Terminal,
  Plus
} from "lucide-react";

export const LiveExecutionDAG: React.FC = () => {
  const { dagNodes, selectedDagNodeId, setSelectedDagNodeId, runDagExecution, addDagNode } = useWorkspaceStore();
  const [isExecuting, setIsExecuting] = useState(false);
  const activeNode = dagNodes.find((n) => n.id === selectedDagNodeId) || dagNodes[0];

  const getRoleIcon = (role: string) => {
    switch (role) {
      case "commander": return <Crown className="w-4 h-4 text-amber-500" />;
      case "architect": return <Box className="w-4 h-4 text-purple-500" />;
      case "coder": return <Code2 className="w-4 h-4 text-blue-500" />;
      case "qa": return <FlaskConical className="w-4 h-4 text-emerald-500" />;
      case "red_team": return <ShieldAlert className="w-4 h-4 text-rose-500" />;
      default: return <GitFork className="w-4 h-4 text-stone-500" />;
    }
  };

  const handleRunExecution = async () => {
    setIsExecuting(true);
    await runDagExecution();
    setIsExecuting(false);
  };

  return (
    <div className="flex-1 flex flex-col lg:flex-row h-full bg-stone-50 dark:bg-stone-950 overflow-hidden text-xs font-mono transition-colors duration-200">
      {/* Left / Center: Interactive DAG Canvas */}
      <div className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto canvas-grid-pattern relative flex flex-col items-center space-y-6">
        <div className="w-full max-w-2xl flex items-center justify-between pb-3 border-b border-stone-200 dark:border-stone-800">
          <div className="flex items-center space-x-2">
            <GitFork className="w-4 h-4 text-amber-500" />
            <span className="font-display font-bold text-xs sm:text-sm tracking-wider uppercase text-stone-900 dark:text-stone-100">
              Live Topological Execution DAG
            </span>
          </div>

          <button
            onClick={handleRunExecution}
            disabled={isExecuting}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 text-xs font-semibold shadow-xs active:scale-95 cursor-pointer disabled:opacity-50"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>{isExecuting ? "Executing..." : "Execute DAG"}</span>
          </button>
        </div>

        {/* Node Hierarchy Chain */}
        <div className="w-full max-w-2xl space-y-4">
          {dagNodes.map((node, index) => {
            const isSelected = node.id === activeNode?.id;
            return (
              <div key={node.id} className="relative flex flex-col items-center">
                <div
                  onClick={() => setSelectedDagNodeId(node.id)}
                  className={`w-full p-3.5 sm:p-4 rounded-2xl border bg-white dark:bg-stone-900 shadow-sm cursor-pointer transition-all ${
                    isSelected 
                      ? "border-amber-500 dark:border-amber-400 ring-2 ring-amber-500/20" 
                      : "border-stone-200 dark:border-stone-800 hover:border-stone-400"
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center space-x-2.5 sm:space-x-3 truncate">
                      <div className="p-2 rounded-xl bg-stone-50 dark:bg-stone-800 shrink-0">
                        {getRoleIcon(node.role)}
                      </div>
                      <div className="truncate">
                        <div className="font-bold text-stone-900 dark:text-stone-100 text-xs font-display truncate">{node.label}</div>
                        <div className="text-[10px] text-stone-400 font-mono">{node.model}</div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2 shrink-0">
                      {node.latencyMs > 0 && (
                        <span className="text-[10px] text-stone-500 font-mono">
                          {node.latencyMs}ms
                        </span>
                      )}
                      {node.status === "completed" ? (
                        <span className="flex items-center gap-1 text-[9px] text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800 font-bold">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" /> PASS
                        </span>
                      ) : node.status === "running" ? (
                        <span className="flex items-center gap-1 text-[9px] text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/60 px-2 py-0.5 rounded-full border border-amber-200 dark:border-amber-800 font-bold">
                          <Activity className="w-3 h-3 animate-spin text-amber-600" /> RUNNING
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-[9px] text-stone-500 bg-stone-100 dark:bg-stone-800 px-2 py-0.5 rounded-full">
                          <Clock className="w-3 h-3" /> PENDING
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {index < dagNodes.length - 1 && (
                  <div className="h-5 w-[2px] bg-stone-300 dark:bg-stone-700 my-0.5 relative">
                    <div className="absolute -bottom-1 -left-[3px] w-2 h-2 border-r-2 border-b-2 border-stone-400 dark:border-stone-600 rotate-45" />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Right / Bottom: Node Telemetry Inspector */}
      <div className="w-full lg:w-96 border-t lg:border-t-0 lg:border-l border-stone-200 dark:border-stone-800 bg-white/95 dark:bg-stone-900/95 p-4 sm:p-5 space-y-4 shrink-0 overflow-y-auto">
        <div className="flex items-center justify-between pb-2.5 border-b border-stone-200 dark:border-stone-800">
          <span className="font-display font-bold uppercase tracking-wider text-stone-800 dark:text-stone-200 text-xs">
            Node Inspector
          </span>
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400 font-mono">
            {activeNode?.id}
          </span>
        </div>

        <div className="space-y-1.5">
          <div className="text-stone-400 uppercase text-[9px] font-bold">Label</div>
          <div className="p-2.5 rounded-xl bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800 text-stone-900 dark:text-stone-100 font-semibold text-xs">
            {activeNode?.label}
          </div>
        </div>

        <div className="space-y-1.5">
          <div className="flex items-center space-x-1 text-stone-400 uppercase text-[9px] font-bold">
            <Terminal className="w-3 h-3" />
            <span>Stdout Stream</span>
          </div>
          <pre className="p-3 rounded-xl bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800 text-[11px] text-stone-700 dark:text-stone-300 max-h-36 overflow-y-auto leading-relaxed font-mono whitespace-pre-wrap">
            {activeNode?.stdout || "// Awaiting node execution..."}
          </pre>
        </div>
      </div>
    </div>
  );
};
