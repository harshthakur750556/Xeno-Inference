import React from "react";
import { useWorkspaceStore } from "../../stores/workspaceStore";
import { Plus, MessageSquare, Bot, FileCode, GitCompare, Trash2 } from "lucide-react";

export const NodePaletteBar: React.FC = () => {
  const { addCanvasNode, clearCanvasNodes, canvasNodes } = useWorkspaceStore();

  return (
    <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20 flex items-center space-x-1 p-1 rounded-2xl border border-stone-200/90 dark:border-stone-800/90 bg-white/95 dark:bg-stone-900/95 backdrop-blur-2xl shadow-xl max-w-[94vw] overflow-x-auto">
      <div className="px-2 py-1 flex items-center space-x-1 text-[10px] text-stone-400 font-mono border-r border-stone-200 dark:border-stone-800 font-bold shrink-0">
        <Plus className="w-3 h-3 text-amber-500" />
        <span className="hidden sm:inline">ADD</span>
      </div>

      <button
        onClick={() => addCanvasNode("prompt")}
        className="flex items-center space-x-1 px-2.5 py-1 rounded-xl hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-700 dark:text-stone-300 text-xs font-mono font-semibold transition-all shrink-0 cursor-pointer active:scale-95"
      >
        <MessageSquare className="w-3.5 h-3.5 text-stone-400" />
        <span>Prompt</span>
      </button>

      <button
        onClick={() => addCanvasNode("subagent")}
        className="flex items-center space-x-1 px-2.5 py-1 rounded-xl hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-700 dark:text-stone-300 text-xs font-mono font-semibold transition-all shrink-0 cursor-pointer active:scale-95"
      >
        <Bot className="w-3.5 h-3.5 text-purple-500" />
        <span>Subagent</span>
      </button>

      <button
        onClick={() => addCanvasNode("code")}
        className="flex items-center space-x-1 px-2.5 py-1 rounded-xl hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-700 dark:text-stone-300 text-xs font-mono font-semibold transition-all shrink-0 cursor-pointer active:scale-95"
      >
        <FileCode className="w-3.5 h-3.5 text-emerald-500" />
        <span>Code</span>
      </button>

      <button
        onClick={() => addCanvasNode("diff")}
        className="flex items-center space-x-1 px-2.5 py-1 rounded-xl hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-700 dark:text-stone-300 text-xs font-mono font-semibold transition-all shrink-0 cursor-pointer active:scale-95"
      >
        <GitCompare className="w-3.5 h-3.5 text-amber-500" />
        <span>Diff</span>
      </button>

      {canvasNodes.length > 0 && (
        <button
          onClick={clearCanvasNodes}
          className="p-1.5 rounded-xl hover:bg-rose-50 dark:hover:bg-rose-950/60 text-stone-400 hover:text-rose-500 transition-colors shrink-0"
          title="Clear all canvas nodes"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );
};
