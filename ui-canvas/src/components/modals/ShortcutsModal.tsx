import React from "react";
import { useWorkspaceStore } from "../../stores/workspaceStore";
import { Keyboard, X } from "lucide-react";

export const ShortcutsModal: React.FC = () => {
  const { isShortcutsOpen, toggleShortcuts } = useWorkspaceStore();

  if (!isShortcutsOpen) return null;

  const shortcuts = [
    { key: "1 - 8", desc: "Switch view mode (Chat, Canvas, Browser, DAG, Timeline, Terminal, Diff, Swarm)" },
    { key: "Ctrl + K", desc: "Focus Command OmniBar" },
    { key: "Space + Drag", desc: "Pan Spatial Canvas infinite viewport" },
    { key: "Enter", desc: "Transmit prompt in Chat Studio" },
    { key: "Shift + ?", desc: "Toggle this Keyboard Shortcuts guide" },
    { key: "Ctrl + E", desc: "Open Session Snapshot Export / Import modal" },
    { key: "Ctrl + B", desc: "Toggle Navigation Sidebar visibility" },
    { key: "Esc", desc: "Close active modal / drawer" },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-stone-900/60 dark:bg-black/80 backdrop-blur-md">
      <div className="w-[94vw] max-w-md rounded-2xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 shadow-2xl p-4 sm:p-6 space-y-4 text-mono text-xs max-h-[85vh] overflow-y-auto transition-colors duration-200">
        <div className="flex items-center justify-between pb-3 border-b border-stone-200 dark:border-stone-800">
          <div className="flex items-center space-x-2">
            <div className="p-1.5 rounded-xl bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300">
              <Keyboard className="w-4 h-4" />
            </div>
            <span className="font-bold font-display tracking-wider text-stone-900 dark:text-stone-100 uppercase">
              Keyboard Shortcuts
            </span>
          </div>
          <button
            onClick={toggleShortcuts}
            className="p-1.5 rounded-lg hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 transition-all cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-2">
          {shortcuts.map((sc, i) => (
            <div key={i} className="flex items-center justify-between py-2 px-3 rounded-xl bg-stone-50 dark:bg-stone-950 border border-stone-200/80 dark:border-stone-800/80 gap-2">
              <span className="text-stone-600 dark:text-stone-400 truncate">{sc.desc}</span>
              <kbd className="px-2 py-0.5 rounded-lg bg-white dark:bg-stone-800 border border-stone-300 dark:border-stone-700 text-stone-800 dark:text-stone-200 font-bold font-mono text-[10px] shadow-xs shrink-0">
                {sc.key}
              </kbd>
            </div>
          ))}
        </div>

        <div className="pt-2 text-[10px] text-stone-400 text-center font-mono">
          Press <kbd className="text-stone-600 dark:text-stone-300 font-bold">Esc</kbd> anytime to dismiss.
        </div>
      </div>
    </div>
  );
};
