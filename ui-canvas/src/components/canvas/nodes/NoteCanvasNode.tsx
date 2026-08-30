import React from "react";
import { useWorkspaceStore } from "../../../stores/workspaceStore";
import { StickyNote, X } from "lucide-react";

export const NoteCanvasNode: React.FC<{
  id: string;
  data: Record<string, any>;
  isSelected: boolean;
  onSelect: () => void;
}> = ({ id, data, isSelected, onSelect }) => {
  const { removeCanvasNode, updateCanvasNodeData } = useWorkspaceStore();

  return (
    <div
      onClick={onSelect}
      className={`w-64 p-4 rounded-3xl border bg-amber-50/70 dark:bg-stone-900/90 shadow-lg flex flex-col space-y-2 transition-all ${
        isSelected
          ? "border-amber-500 dark:border-amber-400 ring-2 ring-amber-500/20 shadow-xl"
          : "border-amber-200/80 dark:border-stone-800/80"
      }`}
    >
      <div className="flex items-center justify-between pb-1 border-b border-amber-200/60 dark:border-stone-800">
        <div className="flex items-center space-x-1.5">
          <StickyNote className="w-3.5 h-3.5 text-amber-600" />
          <span className="font-display font-bold text-xs uppercase text-amber-900 dark:text-amber-200">
            {data.title || "Note"}
          </span>
        </div>

        <button
          onClick={(e) => {
            e.stopPropagation();
            removeCanvasNode(id);
          }}
          className="p-0.5 rounded text-stone-400 hover:text-rose-500"
        >
          <X className="w-3 h-3" />
        </button>
      </div>

      <textarea
        value={data.content || ""}
        onChange={(e) => updateCanvasNodeData(id, { content: e.target.value })}
        placeholder="Write architectural thought or constraint..."
        className="w-full bg-transparent text-xs font-editorial leading-relaxed text-stone-800 dark:text-stone-200 outline-none resize-none min-h-[70px]"
      />
    </div>
  );
};
