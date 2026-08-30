import React, { useRef, useState } from "react";
import { useWorkspaceStore } from "../../stores/workspaceStore";
import { PromptCanvasNode } from "./nodes/PromptCanvasNode";
import { AgentCanvasNode } from "./nodes/AgentCanvasNode";
import { CodeEditorCanvasNode } from "./nodes/CodeEditorCanvasNode";
import { DiffCanvasNode } from "./nodes/DiffCanvasNode";
import { CadCanvasNode } from "./nodes/CadCanvasNode";
import { NoteCanvasNode } from "./nodes/NoteCanvasNode";
import { NodePaletteBar } from "./NodePaletteBar";
import { 
  ZoomIn, 
  ZoomOut, 
  Maximize2, 
  Box, 
  Sparkles, 
  Plus, 
  MessageSquare, 
  FileCode, 
  GitCompare, 
  StickyNote,
  Compass
} from "lucide-react";

export const SpatialCanvas: React.FC = () => {
  const { 
    canvasNodes, 
    selectedNodeId, 
    setSelectedNodeId, 
    canvasScale, 
    setCanvasScale, 
    canvasPan, 
    setCanvasPan,
    updateCanvasNodePosition,
    addCanvasNode,
    loadCanvasArchitectureTemplate
  } = useWorkspaceStore();

  const containerRef = useRef<HTMLDivElement>(null);
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });
  const [draggingNodeId, setDraggingNodeId] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.target === containerRef.current || (e.target as HTMLElement).tagName === "svg") {
      setIsPanning(true);
      setPanStart({ x: e.clientX - canvasPan.x, y: e.clientY - canvasPan.y });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isPanning) {
      setCanvasPan({
        x: e.clientX - panStart.x,
        y: e.clientY - panStart.y,
      });
    } else if (draggingNodeId) {
      const newX = (e.clientX - canvasPan.x - dragOffset.x) / canvasScale;
      const newY = (e.clientY - canvasPan.y - dragOffset.y) / canvasScale;
      updateCanvasNodePosition(draggingNodeId, Math.round(newX), Math.round(newY));
    }
  };

  const handleMouseUp = () => {
    setIsPanning(false);
    setDraggingNodeId(null);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      const touch = e.touches[0];
      setIsPanning(true);
      setPanStart({ x: touch.clientX - canvasPan.x, y: touch.clientY - canvasPan.y });
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (isPanning && e.touches.length === 1) {
      const touch = e.touches[0];
      setCanvasPan({
        x: touch.clientX - panStart.x,
        y: touch.clientY - panStart.y,
      });
    }
  };

  const handleTouchEnd = () => {
    setIsPanning(false);
  };

  const startNodeDrag = (nodeId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedNodeId(nodeId);
    setDraggingNodeId(nodeId);
    const node = canvasNodes.find((n) => n.id === nodeId);
    if (node) {
      setDragOffset({
        x: e.clientX - (node.x * canvasScale + canvasPan.x),
        y: e.clientY - (node.y * canvasScale + canvasPan.y),
      });
    }
  };

  const renderConnectors = () => {
    if (canvasNodes.length < 2) return null;
    const paths: React.ReactNode[] = [];

    for (let i = 0; i < canvasNodes.length - 1; i++) {
      const source = canvasNodes[i];
      const target = canvasNodes[i + 1];

      const sx = source.x + 300;
      const sy = source.y + 60;
      const tx = target.x;
      const ty = target.y + 60;

      const dx = Math.abs(tx - sx) * 0.5;
      const pathData = `M ${sx} ${sy} C ${sx + dx} ${sy}, ${tx - dx} ${ty}, ${tx} ${ty}`;

      paths.push(
        <g key={`edge-${source.id}-${target.id}`}>
          <path
            d={pathData}
            fill="none"
            className="stroke-stone-300 dark:stroke-stone-700"
            strokeWidth="1.5"
            strokeDasharray="4 4"
          />
          <circle cx={tx} cy={ty} r="3.5" className="fill-amber-500" />
        </g>
      );
    }
    return paths;
  };

  return (
    <div
      ref={containerRef}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      className="flex-1 relative w-full h-full overflow-hidden canvas-grid-pattern cursor-grab active:cursor-grabbing bg-stone-100/50 dark:bg-stone-950 transition-colors duration-200"
    >
      {/* Floating Node Palette Bar */}
      <NodePaletteBar />

      {/* Zoom Controls */}
      <div className="absolute bottom-6 right-6 z-20 flex items-center space-x-1 p-1 rounded-2xl border border-stone-200/90 dark:border-stone-800/90 bg-white/95 dark:bg-stone-900/95 backdrop-blur-2xl shadow-lg font-mono select-none">
        <button
          onClick={() => setCanvasScale(Math.min(canvasScale + 0.15, 2.5))}
          className="p-1.5 rounded-lg hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-700 dark:text-stone-300 transition-all cursor-pointer"
          title="Zoom In"
        >
          <ZoomIn className="w-4 h-4" />
        </button>
        <span className="text-[11px] px-2 text-stone-700 dark:text-stone-300 font-bold">
          {Math.round(canvasScale * 100)}%
        </span>
        <button
          onClick={() => setCanvasScale(Math.max(canvasScale - 0.15, 0.35))}
          className="p-1.5 rounded-lg hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-700 dark:text-stone-300 transition-all cursor-pointer"
          title="Zoom Out"
        >
          <ZoomOut className="w-4 h-4" />
        </button>
        <button
          onClick={() => { setCanvasScale(1.0); setCanvasPan({ x: 0, y: 0 }); }}
          className="p-1.5 rounded-lg hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-700 dark:text-stone-300 transition-all cursor-pointer"
          title="Reset Viewport"
        >
          <Maximize2 className="w-4 h-4" />
        </button>
      </div>

      {/* Empty State Hero (Shown when 0 canvas nodes exist) */}
      {canvasNodes.length === 0 && (
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none p-6 text-center z-10 space-y-5 select-none">
          <div className="max-w-xl space-y-3 pointer-events-auto bg-white/80 dark:bg-stone-900/80 p-8 rounded-3xl border border-stone-200/90 dark:border-stone-800/90 shadow-2xl backdrop-blur-2xl">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mx-auto text-amber-600 dark:text-amber-400">
              <Box className="w-6 h-6" />
            </div>

            <div className="space-y-1">
              <h2 className="font-display font-bold text-xl sm:text-2xl text-stone-900 dark:text-stone-100 uppercase tracking-wide">
                Infinite Creative Workbench
              </h2>
              <p className="text-xs sm:text-sm text-stone-500 font-editorial leading-relaxed max-w-md mx-auto">
                Unbounded spatial surface for 3D CAD modeling, architectural logic tinkering, and visual synthesis.
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 text-xs font-mono">
              <button
                onClick={() => addCanvasNode("cad3d")}
                className="p-3 rounded-2xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800 flex flex-col items-center gap-1.5 transition-all cursor-pointer"
              >
                <Box className="w-4 h-4" />
                <span className="font-bold">3D CAD</span>
              </button>

              <button
                onClick={() => addCanvasNode("prompt")}
                className="p-3 rounded-2xl bg-stone-50 dark:bg-stone-800 hover:bg-stone-100 text-stone-800 dark:text-stone-200 border border-stone-200 dark:border-stone-700 flex flex-col items-center gap-1.5 transition-all cursor-pointer"
              >
                <MessageSquare className="w-4 h-4 text-stone-500" />
                <span>Directive</span>
              </button>

              <button
                onClick={() => addCanvasNode("code")}
                className="p-3 rounded-2xl bg-stone-50 dark:bg-stone-800 hover:bg-stone-100 text-stone-800 dark:text-stone-200 border border-stone-200 dark:border-stone-700 flex flex-col items-center gap-1.5 transition-all cursor-pointer"
              >
                <FileCode className="w-4 h-4 text-blue-500" />
                <span>Code Block</span>
              </button>

              <button
                onClick={() => addCanvasNode("note")}
                className="p-3 rounded-2xl bg-stone-50 dark:bg-stone-800 hover:bg-stone-100 text-stone-800 dark:text-stone-200 border border-stone-200 dark:border-stone-700 flex flex-col items-center gap-1.5 transition-all cursor-pointer"
              >
                <StickyNote className="w-4 h-4 text-amber-500" />
                <span>Note</span>
              </button>
            </div>

            <div className="pt-2">
              <button
                onClick={loadCanvasArchitectureTemplate}
                className="text-xs font-mono font-semibold text-amber-600 dark:text-amber-400 hover:underline flex items-center justify-center gap-1 mx-auto"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Or load ready architectural template</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Infinite Canvas Surface with Transform Matrix */}
      <div
        style={{
          transform: `translate(${canvasPan.x}px, ${canvasPan.y}px) scale(${canvasScale})`,
          transformOrigin: "0 0",
        }}
        className="absolute inset-0 w-full h-full pointer-events-none"
      >
        <svg className="absolute inset-0 w-[6000px] h-[6000px] pointer-events-none overflow-visible">
          {renderConnectors()}
        </svg>

        <div className="absolute inset-0 pointer-events-auto">
          {canvasNodes.map((node) => {
            const isSelected = selectedNodeId === node.id;
            return (
              <div
                key={node.id}
                style={{
                  transform: `translate(${node.x}px, ${node.y}px)`,
                  position: "absolute",
                }}
                onMouseDown={(e) => startNodeDrag(node.id, e)}
              >
                {node.type === "prompt" && (
                  <PromptCanvasNode
                    id={node.id}
                    data={node.data as any}
                    isSelected={isSelected}
                    onSelect={() => setSelectedNodeId(node.id)}
                  />
                )}
                {node.type === "subagent" && (
                  <AgentCanvasNode
                    id={node.id}
                    data={node.data as any}
                    isSelected={isSelected}
                    onSelect={() => setSelectedNodeId(node.id)}
                  />
                )}
                {node.type === "code" && (
                  <CodeEditorCanvasNode
                    id={node.id}
                    data={node.data as any}
                    isSelected={isSelected}
                    onSelect={() => setSelectedNodeId(node.id)}
                  />
                )}
                {node.type === "diff" && (
                  <DiffCanvasNode
                    id={node.id}
                    data={node.data as any}
                    isSelected={isSelected}
                    onSelect={() => setSelectedNodeId(node.id)}
                  />
                )}
                {node.type === "cad3d" && (
                  <CadCanvasNode
                    id={node.id}
                    data={node.data as any}
                    isSelected={isSelected}
                    onSelect={() => setSelectedNodeId(node.id)}
                  />
                )}
                {node.type === "note" && (
                  <NoteCanvasNode
                    id={node.id}
                    data={node.data as any}
                    isSelected={isSelected}
                    onSelect={() => setSelectedNodeId(node.id)}
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
