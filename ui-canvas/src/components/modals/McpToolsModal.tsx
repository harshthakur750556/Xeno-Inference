import React from "react";
import { useWorkspaceStore } from "../../stores/workspaceStore";
import { 
  Cpu, 
  X, 
  CheckCircle2, 
  AlertCircle, 
  Sliders, 
  Terminal, 
  FileCode, 
  Globe, 
  ShieldCheck, 
  Activity, 
  Power 
} from "lucide-react";

export const McpToolsModal: React.FC = () => {
  const { 
    isMcpModalOpen, 
    toggleMcpModal, 
    mcpServers, 
    toggleMcpTool, 
    toggleMcpServer 
  } = useWorkspaceStore();

  if (!isMcpModalOpen) return null;

  const getCategoryIcon = (category: string) => {
    switch (category.toLowerCase()) {
      case "3d graphics":
      case "assets":
        return <Sliders className="w-3.5 h-3.5 text-purple-500" />;
      case "code analysis":
      case "file ops":
        return <FileCode className="w-3.5 h-3.5 text-blue-500" />;
      case "execution":
        return <Terminal className="w-3.5 h-3.5 text-amber-500" />;
      case "network":
      case "security":
        return <Globe className="w-3.5 h-3.5 text-emerald-500" />;
      default:
        return <Cpu className="w-3.5 h-3.5 text-stone-500" />;
    }
  };

  const totalTools = mcpServers.reduce((acc, s) => acc + s.tools.length, 0);
  const activeTools = mcpServers.reduce(
    (acc, s) => acc + s.tools.filter((t) => t.enabled && s.status === "connected").length, 
    0
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl shadow-2xl w-full max-w-3xl max-h-[85vh] flex flex-col overflow-hidden transition-colors">
        {/* Header */}
        <div className="px-6 py-4 border-b border-stone-200 dark:border-stone-800 flex items-center justify-between bg-stone-50/50 dark:bg-stone-950/50">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-xl bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-900/50 text-amber-600 dark:text-amber-400">
              <Cpu className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-stone-900 dark:text-stone-100 flex items-center gap-2">
                MCP Tools Arsenal Configuration
                <span className="text-xs px-2 py-0.5 rounded-full font-mono bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                  {activeTools} / {totalTools} Tools Armed
                </span>
              </h2>
              <p className="text-xs text-stone-500 dark:text-stone-400 font-editorial">
                Model Context Protocol servers providing character-exact file AST tools, 3D engines, and Tor sockets
              </p>
            </div>
          </div>

          <button
            onClick={toggleMcpModal}
            className="p-1.5 rounded-lg hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 transition-colors"
            title="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Server List & Tool Arsenal */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {mcpServers.map((server) => {
            const isConnected = server.status === "connected";
            const serverActiveTools = server.tools.filter((t) => t.enabled).length;

            return (
              <div 
                key={server.id}
                className={`border rounded-xl p-4 transition-all duration-200 ${
                  isConnected 
                    ? "border-stone-200 dark:border-stone-800 bg-stone-50/30 dark:bg-stone-900/40" 
                    : "border-stone-200 dark:border-stone-800/50 bg-stone-100/40 dark:bg-stone-950/40 opacity-70"
                }`}
              >
                {/* Server Header */}
                <div className="flex items-center justify-between mb-3 pb-3 border-b border-stone-200 dark:border-stone-800/80">
                  <div className="flex items-center space-x-3">
                    <button
                      onClick={() => toggleMcpServer(server.id)}
                      className={`p-1.5 rounded-lg border transition-colors ${
                        isConnected
                          ? "bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800 text-emerald-600 dark:text-emerald-400"
                          : "bg-stone-100 dark:bg-stone-800 border-stone-300 dark:border-stone-700 text-stone-400"
                      }`}
                      title={isConnected ? "Disable Server" : "Enable Server"}
                    >
                      <Power className="w-3.5 h-3.5" />
                    </button>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-semibold text-stone-900 dark:text-stone-100">
                          {server.name}
                        </h3>
                        <span className={`text-[10px] px-1.5 py-0.5 rounded font-mono font-medium ${
                          isConnected 
                            ? "bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-400" 
                            : "bg-stone-200 dark:bg-stone-800 text-stone-500"
                        }`}>
                          {isConnected ? "ACTIVE" : "STANDBY"}
                        </span>
                        <span className="text-[10px] font-mono text-stone-400 flex items-center gap-1">
                          <Activity className="w-2.5 h-2.5" /> {server.pingMs}ms
                        </span>
                      </div>
                      <span className="text-xs text-stone-400 font-mono">
                        {serverActiveTools} of {server.tools.length} active
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <span className="text-xs text-stone-500 dark:text-stone-400 font-mono text-right">
                      Sovereign Sandbox
                    </span>
                  </div>
                </div>

                {/* Tools Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                  {server.tools.map((tool) => (
                    <div
                      key={tool.name}
                      onClick={() => isConnected && toggleMcpTool(server.id, tool.name)}
                      className={`p-3 rounded-lg border text-left transition-all cursor-pointer flex items-start justify-between ${
                        tool.enabled && isConnected
                          ? "bg-white dark:bg-stone-800/90 border-stone-300 dark:border-stone-700 shadow-xs"
                          : "bg-stone-100/50 dark:bg-stone-950/60 border-stone-200 dark:border-stone-800/40 text-stone-400"
                      }`}
                    >
                      <div className="flex items-start space-x-2.5">
                        <div className="mt-0.5">
                          {getCategoryIcon(tool.category)}
                        </div>
                        <div>
                          <div className="font-mono text-xs font-semibold text-stone-800 dark:text-stone-200 flex items-center gap-1.5">
                            {tool.name}
                          </div>
                          <p className="text-[11px] text-stone-500 dark:text-stone-400 mt-0.5 line-clamp-2">
                            {tool.description}
                          </p>
                        </div>
                      </div>

                      <input
                        type="checkbox"
                        checked={tool.enabled && isConnected}
                        disabled={!isConnected}
                        onChange={() => toggleMcpTool(server.id, tool.name)}
                        className="mt-0.5 accent-amber-600 rounded cursor-pointer"
                      />
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-stone-200 dark:border-stone-800 bg-stone-50/50 dark:bg-stone-950/50 flex items-center justify-between text-xs text-stone-500 dark:text-stone-400">
          <div className="flex items-center gap-2 font-mono">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
            Air-Gap IPC isolation enabled for all MCP socket transports
          </div>
          <button
            onClick={toggleMcpModal}
            className="px-4 py-1.5 rounded-lg bg-stone-900 dark:bg-stone-100 text-stone-100 dark:text-stone-900 font-medium text-xs hover:opacity-90 transition-opacity"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
