import React, { useRef, useState } from "react";
import { useWorkspaceStore } from "../../stores/workspaceStore";
import { PromptCanvasNode } from "./nodes/PromptCanvasNode";
import { AgentCanvasNode } from "./nodes/AgentCanvasNode";
import { CodeEditorCanvasNode } from "./nodes/CodeEditorCanvasNode";
import { DiffCanvasNode } from "./nodes/DiffCanvasNode";
import { NodePaletteBar } from "./NodePaletteBar";
import { ZoomIn, ZoomOut, Maximize2, Move } from "lucide-react";

export const SpatialCanvas: React.FC = () => {
  const { 
    canvasNodes, 
    selectedNodeId, 
    setSelectedNodeId, 
    canvasScale, 
    setCanvasScale, 
    canvasPan, 
    setCanvasPan,
    updateCanvasNodePosition
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

  // Touch Support for Mobile Viewports
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

      const sx = source.x + 320;
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
            strokeWidth="2"
            strokeDasharray="4 4"
          />
          <circle
            cx={tx}
            cy={ty}
            r="4"
            className="fill-amber-500"
          />
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
      className="flex-1 relative w-full h-full overflow-hidden canvas-grid-pattern cursor-grab active:cursor-grabbing bg-stone-100/60 dark:bg-stone-950 transition-colors duration-200"
    >
      {/* Floating Node Palette */}
      <NodePaletteBar />

      {/* Zoom Controls (Positioned cleanly for mobile and desktop) */}
      <div className="absolute bottom-6 sm:bottom-8 right-4 sm:right-6 z-20 flex items-center space-x-1 p-1 rounded-2xl border border-stone-200/90 dark:border-stone-800/90 bg-white/95 dark:bg-stone-900/95 backdrop-blur-2xl shadow-lg">
        <button
          onClick={() => setCanvasScale(Math.min(canvasScale + 0.15, 2.5))}
          className="p-1.5 rounded-lg hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-700 dark:text-stone-300 transition-all cursor-pointer"
          title="Zoom In"
        >
          <ZoomIn className="w-4 h-4" />
        </button>
        <span className="text-[11px] font-mono px-2 text-stone-700 dark:text-stone-300 font-bold">
          {Math.round(canvasScale * 100)}%
        </span>
        <button
          onClick={() => setCanvasScale(Math.max(canvasScale - 0.15, 0.4))}
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

      {/* Infinite Canvas Surface with Transform Matrix */}
      <div
        style={{
          transform: `translate(${canvasPan.x}px, ${canvasPan.y}px) scale(${canvasScale})`,
          transformOrigin: "0 0",
        }}
        className="absolute inset-0 w-full h-full pointer-events-none"
      >
        <svg className="absolute inset-0 w-[5000px] h-[5000px] pointer-events-none overflow-visible">
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
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
