import React, { useState } from "react";
import { useWorkspaceStore, SwarmAgentInfo } from "../../stores/workspaceStore";
import { 
  Users, 
  Crown, 
  Box, 
  Code2, 
  FlaskConical, 
  ShieldAlert, 
  CheckCircle2, 
  Activity, 
  MessageSquare,
  Sparkles,
  Send,
  Plus,
  Trash2
} from "lucide-react";

export const MultiAgentSwarmView: React.FC = () => {
  const { swarmAgents, consensusRate, dispatchSwarmTask, triggerSwarmConsensus, addSwarmAgent, removeSwarmAgent } = useWorkspaceStore();
  const [taskInput, setTaskInput] = useState("");
  const [isAddingAgent, setIsAddingAgent] = useState(false);
  const [newRole, setNewRole] = useState<SwarmAgentInfo["role"]>("qa");
  const [newTitle, setNewTitle] = useState("");
  const [newModel, setNewModel] = useState("Claude 3.7 Sonnet");

  const getRoleIcon = (role: string) => {
    switch (role) {
      case "commander": return <Crown className="w-4 h-4 text-amber-500" />;
      case "architect": return <Box className="w-4 h-4 text-purple-500" />;
      case "coder": return <Code2 className="w-4 h-4 text-blue-500" />;
      case "qa": return <FlaskConical className="w-4 h-4 text-emerald-500" />;
      case "red_team": return <ShieldAlert className="w-4 h-4 text-rose-500" />;
      default: return <Users className="w-4 h-4 text-stone-400" />;
    }
  };

  const handleDispatch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskInput.trim()) return;
    dispatchSwarmTask(taskInput.trim());
    setTaskInput("");
  };

  const handleCreateAgent = () => {
    if (!newTitle.trim()) return;
    addSwarmAgent(newRole, newTitle.trim(), newModel, "Awaiting instructions...");
    setNewTitle("");
    setIsAddingAgent(false);
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-stone-50 dark:bg-stone-950 text-xs font-mono overflow-y-auto p-3 sm:p-6 lg:p-8 space-y-4 sm:space-y-6 transition-colors duration-200">
      {/* Top Banner & Consensus Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-stone-200 dark:border-stone-800">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-xs text-stone-800 dark:text-stone-200">
            <Users className="w-5 h-5 text-amber-500" />
          </div>
          <div>
            <h2 className="font-display font-bold text-sm sm:text-base text-stone-900 dark:text-stone-100 tracking-wide uppercase">
              Autonomous Swarm Council
            </h2>
            <div className="text-[11px] text-stone-500 font-sans">Multi-Agent Deliberation & Topological Voting</div>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => setIsAddingAgent(!isAddingAgent)}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 hover:bg-stone-50 text-stone-800 dark:text-stone-200 text-xs font-semibold shadow-2xs active:scale-95 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Spawn Agent</span>
          </button>

          <div className="flex items-center space-x-3 bg-white dark:bg-stone-900 px-3.5 py-2 rounded-xl border border-stone-200 dark:border-stone-800 shadow-2xs">
            <div>
              <div className="text-[9px] text-stone-400 uppercase font-bold">Consensus</div>
              <div className="text-emerald-600 dark:text-emerald-400 font-bold text-xs">{consensusRate}% PASS</div>
            </div>
            <div className="w-16 h-2 bg-stone-100 dark:bg-stone-800 rounded-full overflow-hidden">
              <div className="h-full bg-emerald-500 rounded-full transition-all duration-500" style={{ width: `${consensusRate}%` }} />
            </div>
          </div>
        </div>
      </div>

      {/* Add Agent Modal/Panel */}
      {isAddingAgent && (
        <div className="p-4 rounded-2xl bg-white dark:bg-stone-900 border border-stone-300 dark:border-stone-700 shadow-lg space-y-3 max-w-lg">
          <div className="font-bold text-stone-900 dark:text-stone-100 text-xs">Spawn Specialist Subagent</div>
          <div className="grid grid-cols-2 gap-2">
            <input
              type="text"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="Agent Title (e.g. Fuzzing Unit)"
              className="px-2.5 py-1.5 rounded-xl bg-stone-50 dark:bg-stone-950 border border-stone-300 dark:border-stone-700 text-xs"
            />
            <select
              value={newRole}
              onChange={(e) => setNewRole(e.target.value as any)}
              className="px-2.5 py-1.5 rounded-xl bg-stone-50 dark:bg-stone-950 border border-stone-300 dark:border-stone-700 text-xs"
            >
              <option value="commander">Commander</option>
              <option value="architect">Architect</option>
              <option value="coder">Coder</option>
              <option value="qa">QA Tester</option>
              <option value="red_team">Red Team</option>
            </select>
          </div>
          <div className="flex justify-end space-x-2">
            <button onClick={() => setIsAddingAgent(false)} className="px-3 py-1 text-stone-500 text-xs">Cancel</button>
            <button onClick={handleCreateAgent} className="px-3.5 py-1 rounded-xl bg-amber-600 text-white text-xs font-bold">Spawn</button>
          </div>
        </div>
      )}

      {/* Task Dispatcher Bar */}
      <form onSubmit={handleDispatch} className="flex items-center space-x-2 bg-white dark:bg-stone-900 p-2 rounded-2xl border border-stone-200 dark:border-stone-800 shadow-sm">
        <Sparkles className="w-4 h-4 text-amber-500 ml-2" />
        <input
          type="text"
          value={taskInput}
          onChange={(e) => setTaskInput(e.target.value)}
          placeholder="Dispatch collective objective across swarm..."
          className="flex-1 bg-transparent px-2 py-1 text-xs text-stone-900 dark:text-stone-100 placeholder:text-stone-400 outline-none font-sans"
        />
        <button
          type="submit"
          className="px-3.5 py-1.5 rounded-xl bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 text-xs font-semibold flex items-center space-x-1.5 shadow-2xs active:scale-95 cursor-pointer"
        >
          <span>Dispatch</span>
          <Send className="w-3 h-3" />
        </button>
      </form>

      {/* Swarm Agents Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
        {swarmAgents.map((agent) => (
          <div
            key={agent.role}
            className="p-4 rounded-2xl border border-stone-200/90 dark:border-stone-800/90 bg-white/95 dark:bg-stone-900/95 shadow-sm space-y-3 flex flex-col justify-between"
          >
            <div className="space-y-2">
              <div className="flex items-center justify-between pb-2 border-b border-stone-100 dark:border-stone-800">
                <div className="flex items-center space-x-2">
                  <div className="p-1.5 rounded-xl bg-stone-50 dark:bg-stone-800">
                    {getRoleIcon(agent.role)}
                  </div>
                  <span className="font-display font-bold text-xs text-stone-900 dark:text-stone-100">{agent.title}</span>
                </div>
                <span className="text-[9px] font-mono px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 font-bold border border-emerald-200 dark:border-emerald-800">
                  {agent.voteScore}% Vote
                </span>
              </div>

              <div className="text-[10px] text-stone-400 font-mono">{agent.model}</div>

              <p className="text-[11px] text-stone-700 dark:text-stone-300 font-sans leading-tight bg-stone-50 dark:bg-stone-950 p-2.5 rounded-xl border border-stone-200 dark:border-stone-800">
                {agent.currentTask}
              </p>
            </div>

            <div className="flex items-center justify-between text-[10px] text-stone-500 pt-2 border-t border-stone-100 dark:border-stone-800 font-mono">
              <span>{agent.tokensGenerated.toLocaleString()} tokens</span>
              <span className="text-emerald-600 dark:text-emerald-400 font-semibold uppercase">{agent.status}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
