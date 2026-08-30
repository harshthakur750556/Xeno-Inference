import React from "react";
import { Cad3DViewer } from "../Cad3DViewer";
import { useWorkspaceStore } from "../../../stores/workspaceStore";
import { Box, X } from "lucide-react";

export const CadCanvasNode: React.FC<{
  id: string;
  data: Record<string, any>;
  isSelected: boolean;
  onSelect: () => void;
}> = ({ id, data, isSelected, onSelect }) => {
  const { removeCanvasNode } = useWorkspaceStore();

  return (
    <div
      onClick={onSelect}
      className={`w-80 h-72 rounded-3xl border bg-white/95 dark:bg-stone-900/95 shadow-xl flex flex-col overflow-hidden transition-all ${
        isSelected
          ? "border-amber-500 dark:border-amber-400 ring-2 ring-amber-500/20 shadow-2xl"
          : "border-stone-200/90 dark:border-stone-800/90"
      }`}
    >
      <div className="h-9 px-3 border-b border-stone-200/80 dark:border-stone-800/80 bg-stone-50/80 dark:bg-stone-950/80 flex items-center justify-between z-10 shrink-0 font-mono text-[11px]">
        <div className="flex items-center space-x-1.5 truncate">
          <Box className="w-3.5 h-3.5 text-amber-600" />
          <span className="font-bold font-display uppercase tracking-wider text-stone-800 dark:text-stone-200 truncate">
            {data.title || "3D CAD Model"}
          </span>
        </div>

        <button
          onClick={(e) => {
            e.stopPropagation();
            removeCanvasNode(id);
          }}
          className="p-1 rounded-md text-stone-400 hover:text-rose-500"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="flex-1 w-full h-full relative overflow-hidden">
        <Cad3DViewer shape={data.shape || "column"} compact />
      </div>
    </div>
  );
};
