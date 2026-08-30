import React, { useState } from "react";
import { useWorkspaceStore, SwarmAgentInfo, DAGNodeItem } from "../../stores/workspaceStore";
import { 
  BrainCircuit, 
  Users, 
  GitFork, 
  GitBranch, 
  ShieldCheck, 
  Crown, 
  Box, 
  Code2, 
  FlaskConical, 
  ShieldAlert, 
  CheckCircle2, 
  Clock, 
  Activity, 
  Play, 
  Plus, 
  Send, 
  ChevronDown, 
  ChevronRight, 
  Terminal, 
  Sparkles,
  Layers,
  Zap,
  Sliders
} from "lucide-react";

export const UnifiedThinkingView: React.FC = () => {
  const {
    thinkingActiveTab,
    setThinkingActiveTab,
    swarmAgents,
    consensusRate,
    dispatchSwarmTask,
    triggerSwarmConsensus,
    addSwarmAgent,
    dagNodes,
    selectedDagNodeId,
    setSelectedDagNodeId,
    runDagExecution,
    addDagNode,
    timelineSteps,
    speculativeBranches,
    systemMetrics,
  } = useWorkspaceStore();

  const [taskInput, setTaskInput] = useState("");
  const [isAddingAgent, setIsAddingAgent] = useState(false);
  const [newRole, setNewRole] = useState<SwarmAgentInfo["role"]>("qa");
  const [newTitle, setNewTitle] = useState("");
  const [newModel, setNewModel] = useState("Claude 3.7 Sonnet");
  const [isExecutingDag, setIsExecutingDag] = useState(false);
  const [openSteps, setOpenSteps] = useState<Record<string, boolean>>({ "step-1": true });

  const activeDagNode = dagNodes.find((n) => n.id === selectedDagNodeId) || dagNodes[0];

  const getRoleIcon = (role: string) => {
    switch (role) {
      case "commander": return <Crown className="w-4 h-4 text-amber-500" />;
      case "architect": return <Box className="w-4 h-4 text-purple-500" />;
      case "coder": return <Code2 className="w-4 h-4 text-blue-500" />;
      case "qa": return <FlaskConical className="w-4 h-4 text-emerald-500" />;
      case "red_team": return <ShieldAlert className="w-4 h-4 text-rose-500" />;
      default: return <Users className="w-4 h-4 text-stone-500" />;
    }
  };

  const handleDispatchSwarm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskInput.trim()) return;
    dispatchSwarmTask(taskInput.trim());
    setTaskInput("");
  };

  const handleCreateAgent = () => {
    if (!newTitle.trim()) return;
    addSwarmAgent(newRole, newTitle.trim(), newModel, "Awaiting collective objective...");
    setNewTitle("");
    setIsAddingAgent(false);
  };

  const handleExecuteDag = async () => {
    setIsExecutingDag(true);
    await runDagExecution();
    setIsExecutingDag(false);
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-stone-50/80 dark:bg-stone-950/80 text-stone-900 dark:text-stone-100 overflow-hidden font-sans select-none transition-colors duration-200">
      {/* Top Thinking Studio Hub Header */}
      <div className="h-14 border-b border-stone-200/90 dark:border-stone-800/90 bg-white/95 dark:bg-stone-900/95 px-4 sm:px-8 flex items-center justify-between z-20 shrink-0 shadow-2xs backdrop-blur-xl">
        <div className="flex items-center space-x-3">
          <div className="p-2 rounded-2xl bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-900/60 text-amber-700 dark:text-amber-400">
            <BrainCircuit className="w-4 h-4" />
          </div>
          <div>
            <h1 className="text-xs sm:text-sm font-display font-bold uppercase tracking-wider text-stone-900 dark:text-stone-100">
              Cognitive Thinking Studio
            </h1>
            <span className="text-[10px] text-stone-400 font-editorial hidden sm:inline">
              Unified multi-agent deliberation, topological execution DAG, & speculative reasoning
            </span>
          </div>
        </div>

        {/* Tab Switcher: Swarm, DAG, Timeline, AST */}
        <div className="flex items-center space-x-1 p-1 rounded-xl bg-stone-100 dark:bg-stone-800/80 border border-stone-200 dark:border-stone-700 font-mono text-xs">
          <button
            onClick={() => setThinkingActiveTab("swarm")}
            className={`flex items-center space-x-1.5 px-3 py-1 rounded-lg transition-all cursor-pointer ${
              thinkingActiveTab === "swarm"
                ? "bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100 font-bold shadow-2xs"
                : "text-stone-500 hover:text-stone-900 dark:hover:text-stone-200"
            }`}
          >
            <Users className="w-3.5 h-3.5 text-amber-500" />
            <span>Swarm Council</span>
          </button>

          <button
            onClick={() => setThinkingActiveTab("dag")}
            className={`flex items-center space-x-1.5 px-3 py-1 rounded-lg transition-all cursor-pointer ${
              thinkingActiveTab === "dag"
                ? "bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100 font-bold shadow-2xs"
                : "text-stone-500 hover:text-stone-900 dark:hover:text-stone-200"
            }`}
          >
            <GitFork className="w-3.5 h-3.5 text-blue-500" />
            <span>Execution DAG</span>
          </button>

          <button
            onClick={() => setThinkingActiveTab("timeline")}
            className={`flex items-center space-x-1.5 px-3 py-1 rounded-lg transition-all cursor-pointer ${
              thinkingActiveTab === "timeline"
                ? "bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100 font-bold shadow-2xs"
                : "text-stone-500 hover:text-stone-900 dark:hover:text-stone-200"
            }`}
          >
            <BrainCircuit className="w-3.5 h-3.5 text-purple-500" />
            <span>Reasoning CoT</span>
          </button>
        </div>
      </div>

      {/* Main View Area */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-6">
        {/* TAB 1: SWARM COUNCIL */}
        {thinkingActiveTab === "swarm" && (
          <div className="max-w-5xl mx-auto space-y-5">
            {/* Top Swarm Controls Bar */}
            <div className="p-4 rounded-3xl bg-white/95 dark:bg-stone-900/95 border border-stone-200/90 dark:border-stone-800/90 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <span className="font-display font-bold text-sm tracking-wide text-stone-900 dark:text-stone-100">
                    Active Multi-Agent Council
                  </span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 font-bold border border-emerald-200 dark:border-emerald-800">
                    {swarmAgents.length} Agents Armed
                  </span>
                </div>
                <p className="text-xs text-stone-500 font-editorial">
                  Autonomous 5-role deliberation with cryptographic consensus verification
                </p>
              </div>

              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-2 px-3 py-1.5 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-xs font-mono">
                  <span className="text-stone-400 text-[10px] uppercase font-bold">Consensus:</span>
                  <span className="text-emerald-600 dark:text-emerald-400 font-bold">{consensusRate}%</span>
                </div>

                <button
                  onClick={() => setIsAddingAgent(!isAddingAgent)}
                  className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-stone-900 hover:bg-stone-800 dark:bg-stone-100 dark:hover:bg-white text-white dark:text-stone-900 text-xs font-mono font-semibold transition-all shadow-xs cursor-pointer active:scale-95"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Spawn Specialist</span>
                </button>
              </div>
            </div>

            {/* Add Agent Drawer */}
            {isAddingAgent && (
              <div className="p-4 rounded-2xl bg-white dark:bg-stone-900 border border-stone-300 dark:border-stone-700 shadow-xl space-y-3">
                <div className="font-bold font-display text-xs text-stone-900 dark:text-stone-100">
                  Deploy Autonomous Subagent
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <input
                    type="text"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    placeholder="Agent Title (e.g. Fuzzing Engine)"
                    className="px-3 py-1.5 rounded-xl bg-stone-50 dark:bg-stone-950 border border-stone-300 dark:border-stone-700 text-xs font-mono outline-none"
                  />
                  <select
                    value={newRole}
                    onChange={(e) => setNewRole(e.target.value as any)}
                    className="px-3 py-1.5 rounded-xl bg-stone-50 dark:bg-stone-950 border border-stone-300 dark:border-stone-700 text-xs font-mono outline-none"
                  >
                    <option value="commander">Commander</option>
                    <option value="architect">Architect</option>
                    <option value="coder">Coder</option>
                    <option value="qa">QA Verification</option>
                    <option value="red_team">Red Team Auditor</option>
                  </select>
                  <input
                    type="text"
                    value={newModel}
                    onChange={(e) => setNewModel(e.target.value)}
                    placeholder="Inference Model"
                    className="px-3 py-1.5 rounded-xl bg-stone-50 dark:bg-stone-950 border border-stone-300 dark:border-stone-700 text-xs font-mono outline-none"
                  />
                </div>
                <div className="flex justify-end space-x-2">
                  <button onClick={() => setIsAddingAgent(false)} className="px-3 py-1 text-xs text-stone-500">Cancel</button>
                  <button onClick={handleCreateAgent} className="px-4 py-1 rounded-xl bg-amber-600 text-white text-xs font-mono font-bold">Spawn Agent</button>
                </div>
              </div>
            )}

            {/* Task Dispatcher Form */}
            <form onSubmit={handleDispatchSwarm} className="flex items-center space-x-2 bg-white/95 dark:bg-stone-900/95 p-2 rounded-2xl border border-stone-200/90 dark:border-stone-800/90 shadow-sm focus-within:border-stone-400">
              <div className="pl-2 text-amber-500">
                <Sparkles className="w-4 h-4" />
              </div>
              <input
                type="text"
                value={taskInput}
                onChange={(e) => setTaskInput(e.target.value)}
                placeholder="Broadcast mission directive to collective swarm council..."
                className="flex-1 bg-transparent px-2 py-1 text-xs sm:text-sm text-stone-900 dark:text-stone-100 placeholder:text-stone-400 outline-none font-sans"
              />
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 text-xs font-mono font-bold flex items-center space-x-1.5 shadow-xs active:scale-95 cursor-pointer"
              >
                <span>Dispatch</span>
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>

            {/* Swarm Agents Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {swarmAgents.map((agent) => (
                <div
                  key={agent.role}
                  className="p-4 rounded-3xl border border-stone-200/90 dark:border-stone-800/90 bg-white/95 dark:bg-stone-900/95 shadow-sm space-y-3 flex flex-col justify-between"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between pb-2 border-b border-stone-100 dark:border-stone-800">
                      <div className="flex items-center space-x-2.5">
                        <div className="p-2 rounded-xl bg-stone-50 dark:bg-stone-800">
                          {getRoleIcon(agent.role)}
                        </div>
                        <div>
                          <div className="font-display font-bold text-xs text-stone-900 dark:text-stone-100">{agent.title}</div>
                          <div className="text-[10px] text-stone-400 font-mono">{agent.model}</div>
                        </div>
                      </div>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 font-bold border border-emerald-200 dark:border-emerald-800">
                        {agent.voteScore}% Vote
                      </span>
                    </div>

                    <p className="text-xs text-stone-700 dark:text-stone-300 font-sans leading-relaxed bg-stone-50/70 dark:bg-stone-950/70 p-3 rounded-2xl border border-stone-200/80 dark:border-stone-800/80">
                      {agent.currentTask}
                    </p>
                  </div>

                  <div className="flex items-center justify-between text-[10px] text-stone-400 font-mono pt-2 border-t border-stone-100 dark:border-stone-800">
                    <span>{agent.tokensGenerated.toLocaleString()} tokens</span>
                    <span className="text-emerald-600 dark:text-emerald-400 font-semibold uppercase">{agent.status}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 2: EXECUTION DAG */}
        {thinkingActiveTab === "dag" && (
          <div className="max-w-5xl mx-auto space-y-5">
            <div className="p-4 rounded-3xl bg-white/95 dark:bg-stone-900/95 border border-stone-200/90 dark:border-stone-800/90 shadow-sm flex items-center justify-between">
              <div>
                <h2 className="font-display font-bold text-sm tracking-wide text-stone-900 dark:text-stone-100 uppercase">
                  Petgraph Topological Execution Pipeline
                </h2>
                <p className="text-xs text-stone-500 font-editorial">
                  Interactive dependency graph with live status transitions and zero-copy AST validation
                </p>
              </div>

              <button
                onClick={handleExecuteDag}
                disabled={isExecutingDag}
                className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-stone-900 hover:bg-stone-800 dark:bg-stone-100 dark:hover:bg-white text-white dark:text-stone-900 text-xs font-mono font-semibold shadow-xs active:scale-95 cursor-pointer disabled:opacity-50"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>{isExecutingDag ? "Executing Pipeline..." : "Execute DAG"}</span>
              </button>
            </div>

            {/* If DAG is empty, show clean creator */}
            {dagNodes.length === 0 ? (
              <div className="p-8 rounded-3xl border border-dashed border-stone-300 dark:border-stone-700 bg-white/60 dark:bg-stone-900/60 text-center space-y-3">
                <GitFork className="w-8 h-8 text-stone-400 mx-auto" />
                <h3 className="font-display font-bold text-sm text-stone-800 dark:text-stone-200">
                  Topological Execution Graph Ready
                </h3>
                <p className="text-xs text-stone-500 font-editorial max-w-md mx-auto">
                  Execute the default AST verification pipeline or dispatch tasks from the Chat Studio.
                </p>
                <button
                  onClick={handleExecuteDag}
                  className="px-4 py-2 rounded-xl bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 text-xs font-mono font-semibold shadow-xs"
                >
                  Generate & Run Standard AST Pipeline
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                {/* Left: Chain of Nodes */}
                <div className="lg:col-span-2 space-y-3">
                  {dagNodes.map((node, index) => {
                    const isSelected = node.id === activeDagNode?.id;
                    return (
                      <div key={node.id} className="relative flex flex-col items-center">
                        <div
                          onClick={() => setSelectedDagNodeId(node.id)}
                          className={`w-full p-4 rounded-2xl border bg-white dark:bg-stone-900 shadow-sm cursor-pointer transition-all ${
                            isSelected
                              ? "border-amber-500 dark:border-amber-400 ring-2 ring-amber-500/20"
                              : "border-stone-200 dark:border-stone-800 hover:border-stone-400"
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              <div className="p-2 rounded-xl bg-stone-50 dark:bg-stone-800">
                                {getRoleIcon(node.role)}
                              </div>
                              <div>
                                <div className="font-bold text-xs text-stone-900 dark:text-stone-100 font-display">{node.label}</div>
                                <div className="text-[10px] text-stone-400 font-mono">{node.model}</div>
                              </div>
                            </div>

                            <div className="flex items-center space-x-2">
                              {node.latencyMs > 0 && (
                                <span className="text-[10px] text-stone-500 font-mono">{node.latencyMs}ms</span>
                              )}
                              {node.status === "completed" ? (
                                <span className="flex items-center gap-1 text-[9px] text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 px-2.5 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800 font-bold">
                                  <CheckCircle2 className="w-3 h-3 text-emerald-600" /> PASS
                                </span>
                              ) : node.status === "running" ? (
                                <span className="flex items-center gap-1 text-[9px] text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/60 px-2.5 py-0.5 rounded-full border border-amber-200 dark:border-amber-800 font-bold">
                                  <Activity className="w-3 h-3 animate-spin text-amber-600" /> RUNNING
                                </span>
                              ) : (
                                <span className="flex items-center gap-1 text-[9px] text-stone-500 bg-stone-100 dark:bg-stone-800 px-2.5 py-0.5 rounded-full">
                                  <Clock className="w-3 h-3" /> PENDING
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        {index < dagNodes.length - 1 && (
                          <div className="h-4 w-[2px] bg-stone-300 dark:bg-stone-700 my-0.5" />
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Right: Selected Node Details */}
                <div className="p-4 rounded-3xl border border-stone-200/90 dark:border-stone-800/90 bg-white/95 dark:bg-stone-900/95 space-y-3 font-mono text-xs">
                  <div className="flex items-center justify-between pb-2 border-b border-stone-200 dark:border-stone-800">
                    <span className="font-display font-bold text-stone-800 dark:text-stone-200">Node Output & Stream</span>
                    <span className="text-[10px] text-stone-400">{activeDagNode?.id}</span>
                  </div>

                  <div className="space-y-1">
                    <div className="text-[9px] uppercase font-bold text-stone-400">Node Label</div>
                    <div className="p-2.5 rounded-xl bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800 font-semibold text-stone-800 dark:text-stone-200">
                      {activeDagNode?.label}
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="text-[9px] uppercase font-bold text-stone-400">Stdout Buffer</div>
                    <pre className="p-3 rounded-xl bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800 text-[11px] text-stone-700 dark:text-stone-300 max-h-48 overflow-y-auto whitespace-pre-wrap leading-relaxed">
                      {activeDagNode?.stdout || "// Awaiting task execution..."}
                    </pre>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 3: REASONING TIMELINE */}
        {thinkingActiveTab === "timeline" && (
          <div className="max-w-5xl mx-auto space-y-5">
            <div className="p-4 rounded-3xl bg-white/95 dark:bg-stone-900/95 border border-stone-200/90 dark:border-stone-800/90 shadow-sm flex items-center justify-between">
              <div>
                <h2 className="font-display font-bold text-sm tracking-wide text-stone-900 dark:text-stone-100 uppercase">
                  Speculative Chain-of-Thought Timeline
                </h2>
                <p className="text-xs text-stone-500 font-editorial">
                  Inspect cognitive goal decomposition, speculative branch pruning, & token verification
                </p>
              </div>

              <span className="text-[10px] font-mono px-3 py-1 rounded-full bg-purple-50 dark:bg-purple-950 text-purple-700 dark:text-purple-300 font-bold border border-purple-200 dark:border-purple-800">
                Cognitive Stream
              </span>
            </div>

            {/* Speculative Branches Scoring Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-3xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-stone-100 dark:border-stone-800">
                  <span className="font-display font-bold text-xs uppercase tracking-wider text-stone-800 dark:text-stone-200">
                    Speculative Branch Selection
                  </span>
                  <span className="text-[10px] font-mono text-emerald-600 font-bold">98% Confidence</span>
                </div>
                <div className="p-3 rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/50 space-y-1 text-xs">
                  <div className="font-bold text-emerald-900 dark:text-emerald-300">Branch 1: Zero-Copy AST Cache</div>
                  <p className="text-stone-600 dark:text-stone-400 text-[11px] font-editorial">
                    Direct memory mapping eliminates context serialization overhead and guarantees sub-millisecond AST line evaluation.
                  </p>
                </div>
              </div>

              <div className="p-4 rounded-3xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-stone-100 dark:border-stone-800">
                  <span className="font-display font-bold text-xs uppercase tracking-wider text-stone-800 dark:text-stone-200">
                    Pruned Cognitive Paths
                  </span>
                  <span className="text-[10px] font-mono text-stone-400">Evaluated & Pruned</span>
                </div>
                <div className="p-3 rounded-2xl bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800 space-y-1 text-xs opacity-75">
                  <div className="font-bold text-stone-700 dark:text-stone-300">Branch 2: IPC Socket Relay</div>
                  <p className="text-stone-500 text-[11px] font-editorial">
                    Pruned due to excessive IPC latency (+72ms) during high-throughput character-exact diff parsing.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
