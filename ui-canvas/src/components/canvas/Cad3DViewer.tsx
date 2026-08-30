import React, { useEffect, useRef, useState } from "react";
import { useWorkspaceStore } from "../../stores/workspaceStore";
import { 
  Box, 
  RotateCw, 
  Layers, 
  Maximize2, 
  Sparkles, 
  Sliders, 
  Compass, 
  Eye, 
  Check, 
  RefreshCw 
} from "lucide-react";

interface Point3D {
  x: number;
  y: number;
  z: number;
}

interface Face3D {
  indices: number[];
  color?: string;
}

interface Mesh3D {
  vertices: Point3D[];
  edges: [number, number][];
  faces: Face3D[];
}

export const Cad3DViewer: React.FC<{
  shape?: "column" | "gear" | "lattice" | "torus" | "cube";
  compact?: boolean;
}> = ({ shape = "column", compact = false }) => {
  const { activeCadShape, setActiveCadShape, themeMode } = useWorkspaceStore();
  const currentShape = shape || activeCadShape;

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [rotX, setRotX] = useState(25);
  const [rotY, setRotY] = useState(45);
  const [zoom, setZoom] = useState(compact ? 1.0 : 1.3);
  const [isWireframe, setIsWireframe] = useState(false);
  const [isAutoRotate, setIsAutoRotate] = useState(true);
  const [material, setMaterial] = useState<"alabaster" | "bronze" | "wire">("alabaster");

  const isDragging = useRef(false);
  const lastMousePos = useRef({ x: 0, y: 0 });

  // Generate Procedural 3D Meshes
  const generateMesh = (type: string): Mesh3D => {
    const vertices: Point3D[] = [];
    const edges: [number, number][] = [];
    const faces: Face3D[] = [];

    if (type === "column") {
      // Classical Roman Column Model
      const rings = 12;
      const segments = 16;
      const height = 180;
      const baseRadius = 45;
      const shaftRadius = 32;

      for (let r = 0; r <= rings; r++) {
        const vRatio = r / rings;
        const y = -height / 2 + vRatio * height;
        let radius = shaftRadius;

        // Fluting & Pedestal Base / Capital flare
        if (r < 2) radius = baseRadius + (2 - r) * 12;
        else if (r > rings - 2) radius = baseRadius + (r - (rings - 2)) * 12;
        else radius = shaftRadius + Math.sin(vRatio * Math.PI) * 2;

        for (let s = 0; s < segments; s++) {
          const theta = (s / segments) * Math.PI * 2;
          // Fluting ripples
          const flute = r > 2 && r < rings - 2 ? Math.sin(theta * 8) * 1.5 : 0;
          const rad = radius + flute;
          vertices.push({
            x: Math.cos(theta) * rad,
            y: y,
            z: Math.sin(theta) * rad,
          });
        }
      }

      // Generate quad edges and faces
      for (let r = 0; r < rings; r++) {
        for (let s = 0; s < segments; s++) {
          const nextS = (s + 1) % segments;
          const i1 = r * segments + s;
          const i2 = r * segments + nextS;
          const i3 = (r + 1) * segments + nextS;
          const i4 = (r + 1) * segments + s;

          edges.push([i1, i2], [i1, i4]);
          faces.push({ indices: [i1, i2, i3, i4] });
        }
      }
    } else if (type === "gear") {
      // Involute CAD Gear Assembly
      const teeth = 12;
      const innerRad = 30;
      const rootRad = 55;
      const tipRad = 75;
      const thickness = 25;

      for (let layer = 0; layer < 2; layer++) {
        const z = layer === 0 ? -thickness / 2 : thickness / 2;
        for (let t = 0; t < teeth; t++) {
          const baseAngle = (t / teeth) * Math.PI * 2;
          const step = (Math.PI * 2) / teeth;

          // 4 points per tooth
          const a1 = baseAngle;
          const a2 = baseAngle + step * 0.25;
          const a3 = baseAngle + step * 0.55;
          const a4 = baseAngle + step * 0.8;

          vertices.push({ x: Math.cos(a1) * rootRad, y: Math.sin(a1) * rootRad, z });
          vertices.push({ x: Math.cos(a2) * tipRad, y: Math.sin(a2) * tipRad, z });
          vertices.push({ x: Math.cos(a3) * tipRad, y: Math.sin(a3) * tipRad, z });
          vertices.push({ x: Math.cos(a4) * rootRad, y: Math.sin(a4) * rootRad, z });
        }
      }

      const totalPerLayer = teeth * 4;
      for (let i = 0; i < totalPerLayer; i++) {
        const next = (i + 1) % totalPerLayer;
        edges.push([i, next]);
        edges.push([i + totalPerLayer, next + totalPerLayer]);
        edges.push([i, i + totalPerLayer]);
        faces.push({ indices: [i, next, next + totalPerLayer, i + totalPerLayer] });
      }
    } else if (type === "lattice") {
      // Neural 3D Lattice Matrix
      const size = 3;
      const spacing = 45;
      const offset = (size - 1) * spacing * 0.5;

      for (let x = 0; x < size; x++) {
        for (let y = 0; y < size; y++) {
          for (let z = 0; z < size; z++) {
            vertices.push({
              x: x * spacing - offset,
              y: y * spacing - offset,
              z: z * spacing - offset,
            });
          }
        }
      }

      for (let i = 0; i < vertices.length; i++) {
        for (let j = i + 1; j < vertices.length; j++) {
          const v1 = vertices[i];
          const v2 = vertices[j];
          const dist = Math.hypot(v1.x - v2.x, v1.y - v2.y, v1.z - v2.z);
          if (Math.abs(dist - spacing) < 1) {
            edges.push([i, j]);
          }
        }
      }
    } else if (type === "torus") {
      // Torus Geometry
      const rings = 16;
      const pipeSegments = 10;
      const R = 60;
      const r = 24;

      for (let i = 0; i < rings; i++) {
        const u = (i / rings) * Math.PI * 2;
        for (let j = 0; j < pipeSegments; j++) {
          const v = (j / pipeSegments) * Math.PI * 2;
          vertices.push({
            x: (R + r * Math.cos(v)) * Math.cos(u),
            y: (R + r * Math.cos(v)) * Math.sin(u),
            z: r * Math.sin(v),
          });
        }
      }

      for (let i = 0; i < rings; i++) {
        for (let j = 0; j < pipeSegments; j++) {
          const nextI = (i + 1) % rings;
          const nextJ = (j + 1) % pipeSegments;
          const i1 = i * pipeSegments + j;
          const i2 = nextI * pipeSegments + j;
          const i3 = nextI * pipeSegments + nextJ;
          const i4 = i * pipeSegments + nextJ;

          edges.push([i1, i2], [i1, i4]);
          faces.push({ indices: [i1, i2, i3, i4] });
        }
      }
    } else {
      // Standard Solid Cube
      const s = 50;
      vertices.push(
        { x: -s, y: -s, z: -s },
        { x: s, y: -s, z: -s },
        { x: s, y: s, z: -s },
        { x: -s, y: s, z: -s },
        { x: -s, y: -s, z: s },
        { x: s, y: -s, z: s },
        { x: s, y: s, z: s },
        { x: -s, y: s, z: s }
      );
      edges.push(
        [0, 1], [1, 2], [2, 3], [3, 0],
        [4, 5], [5, 6], [6, 7], [7, 4],
        [0, 4], [1, 5], [2, 6], [3, 7]
      );
      faces.push(
        { indices: [0, 1, 2, 3] },
        { indices: [4, 5, 6, 7] },
        { indices: [0, 1, 5, 4] },
        { indices: [2, 3, 7, 6] },
        { indices: [1, 2, 6, 5] },
        { indices: [0, 3, 7, 4] }
      );
    }

    return { vertices, edges, faces };
  };

  // Render Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId: number;
    let autoAngle = rotY;

    const render = () => {
      const w = (canvas.width = canvas.parentElement?.clientWidth || 400);
      const h = (canvas.height = canvas.parentElement?.clientHeight || 300);

      ctx.clearRect(0, 0, w, h);

      if (isAutoRotate && !isDragging.current) {
        autoAngle = (autoAngle + 0.6) % 360;
      }

      const mesh = generateMesh(currentShape);
      const radX = (rotX * Math.PI) / 180;
      const radY = (autoAngle * Math.PI) / 180;

      const cosX = Math.cos(radX);
      const sinX = Math.sin(radX);
      const cosY = Math.cos(radY);
      const sinY = Math.sin(radY);

      // Project 3D Points to 2D
      const projected = mesh.vertices.map((v) => {
        // Y rotation
        const x1 = v.x * cosY + v.z * sinY;
        const y1 = v.y;
        const z1 = -v.x * sinY + v.z * cosY;

        // X rotation
        const x2 = x1;
        const y2 = y1 * cosX - z1 * sinX;
        const z2 = y1 * sinX + z1 * cosX;

        // Perspective projection
        const fov = 350;
        const scale = (fov / (fov + z2 + 180)) * zoom;

        return {
          x: w / 2 + x2 * scale,
          y: h / 2 + y2 * scale,
          z: z2,
        };
      });

      const isDark = themeMode === "dark";

      // Draw Faces (Shading)
      if (!isWireframe && mesh.faces.length > 0) {
        // Sort faces by average Z depth (painter's algorithm)
        const sortedFaces = mesh.faces
          .map((f) => {
            const avgZ = f.indices.reduce((sum, idx) => sum + projected[idx].z, 0) / f.indices.length;
            return { ...f, avgZ };
          })
          .sort((a, b) => b.avgZ - a.avgZ);

        sortedFaces.forEach((f) => {
          ctx.beginPath();
          f.indices.forEach((idx, i) => {
            const p = projected[idx];
            if (i === 0) ctx.moveTo(p.x, p.y);
            else ctx.lineTo(p.x, p.y);
          });
          ctx.closePath();

          // Lighting calculation
          const depthRatio = Math.max(0.2, Math.min(1.0, (f.avgZ + 120) / 240));
          if (material === "bronze") {
            ctx.fillStyle = isDark
              ? `rgba(180, 83, 9, ${0.45 + depthRatio * 0.4})`
              : `rgba(146, 95, 46, ${0.25 + depthRatio * 0.45})`;
          } else {
            ctx.fillStyle = isDark
              ? `rgba(214, 211, 209, ${0.15 + depthRatio * 0.3})`
              : `rgba(245, 244, 238, ${0.65 + depthRatio * 0.35})`;
          }
          ctx.fill();

          ctx.strokeStyle = isDark ? "rgba(255,255,255,0.08)" : "rgba(140, 133, 123, 0.15)";
          ctx.lineWidth = 0.6;
          ctx.stroke();
        });
      }

      // Draw Wireframe Edges
      ctx.strokeStyle = material === "bronze"
        ? (isDark ? "#f59e0b" : "#925f2e")
        : (isDark ? "rgba(243, 244, 246, 0.7)" : "rgba(40, 40, 45, 0.65)");
      ctx.lineWidth = isWireframe ? 1.2 : 0.8;

      mesh.edges.forEach(([i1, i2]) => {
        const p1 = projected[i1];
        const p2 = projected[i2];
        if (p1 && p2) {
          ctx.beginPath();
          ctx.moveTo(p1.x, p1.y);
          ctx.lineTo(p2.x, p2.y);
          ctx.stroke();
        }
      });

      // Draw Vertices
      ctx.fillStyle = isDark ? "#fbbf24" : "#925f2e";
      projected.forEach((p) => {
        ctx.beginPath();
        ctx.arc(p.x, p.y, compact ? 1.2 : 2.0, 0, Math.PI * 2);
        ctx.fill();
      });

      animId = requestAnimationFrame(render);
    };

    render();

    return () => cancelAnimationFrame(animId);
  }, [rotX, rotY, zoom, isWireframe, isAutoRotate, material, currentShape, themeMode, compact]);

  const handleMouseDown = (e: React.MouseEvent) => {
    isDragging.current = true;
    lastMousePos.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging.current) return;
    const dx = e.clientX - lastMousePos.current.x;
    const dy = e.clientY - lastMousePos.current.y;
    lastMousePos.current = { x: e.clientX, y: e.clientY };

    setRotY((prev) => (prev + dx * 0.75) % 360);
    setRotX((prev) => Math.max(-85, Math.min(85, prev - dy * 0.75)));
  };

  const handleMouseUp = () => {
    isDragging.current = false;
  };

  const shapes: { id: "column" | "gear" | "lattice" | "torus" | "cube"; label: string }[] = [
    { id: "column", label: "Roman Column" },
    { id: "gear", label: "CAD Gear" },
    { id: "lattice", label: "Tensor Lattice" },
    { id: "torus", label: "Torus Ring" },
    { id: "cube", label: "Solid Cube" },
  ];

  return (
    <div className="flex flex-col w-full h-full relative rounded-2xl overflow-hidden bg-white/90 dark:bg-stone-900/90 border border-stone-200/90 dark:border-stone-800/90 shadow-sm select-none">
      {/* 3D CAD Top Controls */}
      <div className="h-10 px-3 border-b border-stone-200/80 dark:border-stone-800/80 flex items-center justify-between bg-stone-50/60 dark:bg-stone-950/60 z-10 shrink-0 font-mono text-[11px]">
        <div className="flex items-center space-x-1.5">
          <Box className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
          <span className="font-bold font-display uppercase tracking-wider text-stone-800 dark:text-stone-200 text-xs">
            3D CAD Engine
          </span>
        </div>

        <div className="flex items-center space-x-1">
          {shapes.map((s) => (
            <button
              key={s.id}
              onClick={() => setActiveCadShape(s.id)}
              className={`px-2 py-0.5 rounded text-[10px] transition-all cursor-pointer ${
                currentShape === s.id
                  ? "bg-amber-600 text-white font-bold"
                  : "text-stone-500 hover:text-stone-900 dark:hover:text-stone-200"
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {/* Interactive 3D Canvas Viewport */}
      <div
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        className="flex-1 w-full h-full relative cursor-grab active:cursor-grabbing canvas-grid-pattern overflow-hidden flex items-center justify-center"
      >
        <canvas ref={canvasRef} className="w-full h-full" />

        {/* Viewport Overlay HUD */}
        <div className="absolute bottom-2.5 left-3 pointer-events-none text-[10px] font-mono text-stone-400 dark:text-stone-500 space-y-0.5">
          <div>Pitch: {Math.round(rotX)}° • Yaw: {Math.round(rotY)}°</div>
          <div>Shading: {material.toUpperCase()} • Zoom: {zoom.toFixed(1)}x</div>
        </div>

        {/* Quick Material / Mode Controls */}
        <div className="absolute bottom-2.5 right-3 flex items-center space-x-1 p-1 rounded-xl bg-white/90 dark:bg-stone-900/90 border border-stone-200 dark:border-stone-800 shadow-md font-mono text-[10px]">
          <button
            onClick={() => setIsWireframe(!isWireframe)}
            className={`px-2 py-0.5 rounded transition-colors cursor-pointer ${
              isWireframe ? "bg-amber-600 text-white font-bold" : "text-stone-500 hover:text-stone-800"
            }`}
          >
            Wire
          </button>
          <button
            onClick={() => setMaterial(material === "alabaster" ? "bronze" : "alabaster")}
            className="px-2 py-0.5 rounded text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800 cursor-pointer"
          >
            {material === "alabaster" ? "Alabaster" : "Bronze"}
          </button>
          <button
            onClick={() => setIsAutoRotate(!isAutoRotate)}
            className={`p-1 rounded cursor-pointer ${isAutoRotate ? "text-amber-600 font-bold" : "text-stone-400"}`}
            title="Toggle Auto Rotation"
          >
            <RotateCw className="w-3 h-3" />
          </button>
        </div>
      </div>
    </div>
  );
};
