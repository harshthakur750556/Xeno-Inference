import React, { useState } from "react";
import { useWorkspaceStore } from "../../stores/workspaceStore";
import { 
  FileCode, 
  Check, 
  RotateCcw, 
  ShieldCheck, 
  GitCompare, 
  Sparkles, 
  Plus, 
  Columns, 
  Rows,
  Layers,
  Save
} from "lucide-react";

export const ASTDiffStudioView: React.FC = () => {
  const { diffFiles, toggleStageDiff, updateDiffFileContent, applyDiffToFile, addDiffFile } = useWorkspaceStore();
  const [selectedDiffId, setSelectedDiffId] = useState(diffFiles[0]?.id || "");
  const [layoutMode, setLayoutMode] = useState<"split" | "stacked">("split");
  const [isAddingFile, setIsAddingFile] = useState(false);
  const [newFilePath, setNewFilePath] = useState("");

  const activeDiff = diffFiles.find((d) => d.id === selectedDiffId) || diffFiles[0];

  const handleAddNewFile = () => {
    if (!newFilePath.trim()) return;
    addDiffFile(
      newFilePath.trim(),
      `// Original code stub\npub fn calculate() -> i32 {\n    0\n}`,
      `// Synthesized AST replacement\npub fn calculate() -> i32 {\n    42\n}`
    );
    setNewFilePath("");
    setIsAddingFile(false);
  };

  // Calculate real line differences dynamically
  const origLines = (activeDiff?.originalCode || "").split("\n");
  const modLines = (activeDiff?.modifiedCode || "").split("\n");
  const additions = Math.max(0, modLines.length - origLines.length);
  const totalLines = Math.max(origLines.length, modLines.length);

  return (
    <div className="flex-1 flex flex-col md:flex-row h-full bg-stone-50 dark:bg-stone-950 text-xs font-mono overflow-hidden transition-colors duration-200">
      {/* Left / Top File Selector Panel */}
      <div className="w-full md:w-72 lg:w-80 border-b md:border-b-0 md:border-r border-stone-200 dark:border-stone-800 bg-white/95 dark:bg-stone-900/95 p-3 sm:p-4 space-y-3 flex flex-col shrink-0 select-none">
        <div className="flex items-center justify-between pb-2.5 border-b border-stone-200 dark:border-stone-800">
          <div className="flex items-center space-x-2">
            <GitCompare className="w-4 h-4 text-amber-500" />
            <span className="font-bold text-stone-900 dark:text-stone-100 font-display text-xs sm:text-sm">
              AST DIFF STUDIO
            </span>
          </div>
          <button
            onClick={() => setIsAddingFile(!isAddingFile)}
            className="p-1 rounded-lg bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-300 transition-colors"
            title="Add File for Diff"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Add New File Dialog */}
        {isAddingFile && (
          <div className="p-3 rounded-xl bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800 space-y-2">
            <input
              type="text"
              value={newFilePath}
              onChange={(e) => setNewFilePath(e.target.value)}
              placeholder="crates/xeno-tools/src/..."
              className="w-full bg-white dark:bg-stone-900 px-2 py-1 rounded-lg border border-stone-300 dark:border-stone-700 text-[11px] text-stone-900 dark:text-stone-100 outline-none"
            />
            <div className="flex justify-end space-x-1.5">
              <button
                onClick={() => setIsAddingFile(false)}
                className="px-2 py-0.5 rounded text-[10px] text-stone-500 hover:text-stone-800 dark:hover:text-stone-200"
              >
                Cancel
              </button>
              <button
                onClick={handleAddNewFile}
                className="px-2.5 py-0.5 rounded bg-amber-600 text-white font-bold text-[10px]"
              >
                Create
              </button>
            </div>
          </div>
        )}

        {/* File Cards List */}
        <div className="flex md:flex-col gap-2 overflow-x-auto md:overflow-y-auto flex-1 pb-1">
          {diffFiles.map((diff) => {
            const isSelected = diff.id === activeDiff?.id;
            return (
              <div
                key={diff.id}
                onClick={() => setSelectedDiffId(diff.id)}
                className={`p-2.5 sm:p-3 rounded-xl border cursor-pointer transition-all shrink-0 md:shrink md:w-full space-y-1 ${
                  isSelected 
                    ? "bg-amber-50/60 dark:bg-amber-950/30 border-amber-300 dark:border-amber-700 shadow-2xs" 
                    : "bg-stone-50/50 dark:bg-stone-950/40 border-stone-200 dark:border-stone-800 hover:border-stone-400"
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="font-bold text-stone-900 dark:text-stone-100 truncate max-w-[140px]">
                    {diff.filePath.split("/").pop()}
                  </span>
                  {diff.staged ? (
                    <span className="text-[9px] px-1.5 py-0.2 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-bold border border-emerald-300 dark:border-emerald-800">
                      STAGED
                    </span>
                  ) : (
                    <span className="text-[9px] px-1.5 py-0.2 rounded bg-stone-100 dark:bg-stone-800 text-stone-500">
                      UNSTAGED
                    </span>
                  )}
                </div>
                <div className="text-[10px] text-stone-400 truncate max-w-[200px]">{diff.filePath}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Right / Main AST Diff Surface */}
      <div className="flex-1 flex flex-col bg-white dark:bg-stone-950 overflow-hidden">
        {/* Editor Top Bar */}
        <div className="h-12 border-b border-stone-200 dark:border-stone-800 bg-stone-50/80 dark:bg-stone-900/80 px-3 sm:px-6 flex items-center justify-between z-10 shrink-0">
          <div className="flex items-center space-x-2 sm:space-x-3 truncate">
            <FileCode className="w-4 h-4 text-cyan-600 dark:text-cyan-400 shrink-0" />
            <span className="font-bold text-stone-900 dark:text-stone-100 text-xs truncate max-w-[180px] sm:max-w-md">
              {activeDiff?.filePath}
            </span>
            <span className="hidden sm:flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
              <ShieldCheck className="w-3 h-3" /> syn Validated
            </span>
          </div>

          <div className="flex items-center space-x-2 shrink-0">
            {/* View Mode Toggle (Split / Stacked) */}
            <div className="hidden sm:flex items-center space-x-1 p-0.5 rounded-lg bg-stone-100 dark:bg-stone-800 border border-stone-200 dark:border-stone-700">
              <button
                onClick={() => setLayoutMode("split")}
                className={`p-1 rounded ${layoutMode === "split" ? "bg-white dark:bg-stone-900 shadow-2xs" : "text-stone-400"}`}
                title="Side-by-Side Split"
              >
                <Columns className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setLayoutMode("stacked")}
                className={`p-1 rounded ${layoutMode === "stacked" ? "bg-white dark:bg-stone-900 shadow-2xs" : "text-stone-400"}`}
                title="Stacked Unified"
              >
                <Rows className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Apply & Stage Button */}
            <button
              onClick={() => activeDiff && toggleStageDiff(activeDiff.id)}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all active:scale-95 cursor-pointer ${
                activeDiff?.staged
                  ? "bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800"
                  : "bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 border-stone-900 dark:border-stone-100"
              }`}
            >
              <Check className="w-3.5 h-3.5" />
              <span>{activeDiff?.staged ? "Staged" : "Stage Diff"}</span>
            </button>
          </div>
        </div>

        {/* Live Interactive Code & Diff Panels */}
        <div className={`flex-1 overflow-y-auto p-3 sm:p-6 ${layoutMode === "split" ? "grid grid-cols-1 lg:grid-cols-2 gap-4" : "space-y-4"}`}>
          {/* Target / Original AST Panel */}
          <div className="flex flex-col space-y-2">
            <div className="flex items-center justify-between text-[10px] uppercase font-bold tracking-wider text-rose-600 dark:text-rose-400 px-1">
              <span>Original Source (Target File)</span>
              <span>{origLines.length} Lines</span>
            </div>
            <div className="flex-1 p-3.5 rounded-2xl bg-stone-100/70 dark:bg-stone-950 border border-stone-200 dark:border-stone-800 font-mono text-xs overflow-x-auto leading-relaxed shadow-inner">
              <pre className="text-stone-700 dark:text-stone-300 select-text">
                {activeDiff?.originalCode}
              </pre>
            </div>
          </div>

          {/* Synthesized / Live Editable Replacement Panel */}
          <div className="flex flex-col space-y-2">
            <div className="flex items-center justify-between text-[10px] uppercase font-bold tracking-wider text-emerald-600 dark:text-emerald-400 px-1">
              <span>Synthesized AST (Editable)</span>
              <span>{modLines.length} Lines ({additions > 0 ? `+${additions}` : "synced"})</span>
            </div>
            <textarea
              value={activeDiff?.modifiedCode || ""}
              onChange={(e) => activeDiff && updateDiffFileContent(activeDiff.id, e.target.value)}
              className="flex-1 p-3.5 rounded-2xl bg-emerald-50/20 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/60 font-mono text-xs text-stone-900 dark:text-stone-100 outline-none focus:ring-2 focus:ring-emerald-500/20 resize-none min-h-[220px] leading-relaxed shadow-inner"
              placeholder="Edit synthesized replacement code..."
            />
          </div>
        </div>
      </div>
    </div>
  );
};
