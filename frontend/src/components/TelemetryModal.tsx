import React from 'react';
import { X, Activity, Cpu, HardDrive, Zap, RefreshCw, Layers, Radio } from 'lucide-react';
import type { TelemetryData } from '../types';

interface TelemetryModalProps {
  isOpen: boolean;
  onClose: () => void;
  telemetry: TelemetryData;
  onRefresh: () => void;
}

export const TelemetryModal: React.FC<TelemetryModalProps> = ({
  isOpen,
  onClose,
  telemetry,
  onRefresh,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
      <div className="relative w-full max-w-2xl rounded-2xl border border-white/10 bg-[#09090b] shadow-2xl overflow-hidden flex flex-col">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-white/[0.02]">
          <div className="flex items-center gap-2.5">
            <Activity className="w-5 h-5 text-white" />
            <h2 className="text-base font-semibold text-white tracking-wide">
              Xeno Rust Engine Telemetry & HUD
            </h2>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onRefresh}
              className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-white/10 transition cursor-pointer"
              title="Refresh telemetry"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-white/10 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5 text-sm">
          
          {/* Status Banner */}
          <div className="flex items-center justify-between p-4 rounded-xl bg-white/[0.03] border border-white/10">
            <div className="flex items-center gap-3">
              <span className="flex h-2.5 w-2.5 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-white"></span>
              </span>
              <div>
                <div className="text-xs font-semibold text-white uppercase tracking-wider">
                  Engine Daemon: {telemetry.engineStatus === 'connected' ? 'ONLINE (Rust Axum)' : 'LOCAL SIMULATION MODE'}
                </div>
                <div className="text-[11px] font-mono text-zinc-400">
                  {telemetry.rustVersion} • Uptime: {Math.floor(telemetry.uptimeSeconds / 60)}m {telemetry.uptimeSeconds % 60}s
                </div>
              </div>
            </div>

            <div className="text-right font-mono text-xs text-zinc-400">
              <span className="text-white font-bold">{telemetry.activeStreams}</span> Active SSE Stream(s)
            </div>
          </div>

          {/* Metric Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            
            {/* Throughput */}
            <div className="p-3.5 rounded-xl bg-black border border-white/10 space-y-1">
              <div className="flex items-center gap-1.5 text-[11px] text-zinc-400 font-mono">
                <Zap className="w-3.5 h-3.5 text-zinc-300" />
                <span>THROUGHPUT</span>
              </div>
              <div className="text-xl font-bold font-mono text-white">
                {telemetry.avgThroughput} <span className="text-xs font-normal text-zinc-400">tok/s</span>
              </div>
            </div>

            {/* VRAM Allocation */}
            <div className="p-3.5 rounded-xl bg-black border border-white/10 space-y-1">
              <div className="flex items-center gap-1.5 text-[11px] text-zinc-400 font-mono">
                <HardDrive className="w-3.5 h-3.5 text-zinc-300" />
                <span>VRAM USAGE</span>
              </div>
              <div className="text-xl font-bold font-mono text-white">
                {telemetry.vramUsedGb} <span className="text-xs font-normal text-zinc-400">/ {telemetry.vramTotalGb} GB</span>
              </div>
            </div>

            {/* Total Processed Tokens */}
            <div className="p-3.5 rounded-xl bg-black border border-white/10 space-y-1">
              <div className="flex items-center gap-1.5 text-[11px] text-zinc-400 font-mono">
                <Layers className="w-3.5 h-3.5 text-zinc-300" />
                <span>TOTAL TOKENS</span>
              </div>
              <div className="text-xl font-bold font-mono text-white">
                {telemetry.totalTokensProcessed.toLocaleString()}
              </div>
            </div>

            {/* Memory Bandwidth */}
            <div className="p-3.5 rounded-xl bg-black border border-white/10 space-y-1">
              <div className="flex items-center gap-1.5 text-[11px] text-zinc-400 font-mono">
                <Radio className="w-3.5 h-3.5 text-zinc-300" />
                <span>BANDWIDTH</span>
              </div>
              <div className="text-xl font-bold font-mono text-white">
                {telemetry.memoryBandwidthGbps} <span className="text-xs font-normal text-zinc-400">GB/s</span>
              </div>
            </div>

          </div>

          {/* VRAM Utilization Bar */}
          <div className="space-y-2 p-4 rounded-xl bg-black border border-white/10">
            <div className="flex justify-between text-xs font-mono text-zinc-300">
              <span className="flex items-center gap-2">
                <Cpu className="w-3.5 h-3.5 text-zinc-400" />
                PagedAttention KV-Cache Buffer Allocation
              </span>
              <span>{Math.round((telemetry.vramUsedGb / telemetry.vramTotalGb) * 100)}%</span>
            </div>
            <div className="h-2 w-full bg-zinc-900 rounded-full overflow-hidden p-0.5 border border-white/10">
              <div
                className="h-full rounded-full bg-white"
                style={{ width: `${(telemetry.vramUsedGb / telemetry.vramTotalGb) * 100}%` }}
              />
            </div>
            <div className="flex justify-between text-[10px] text-zinc-500 font-mono">
              <span>0 GB</span>
              <span>12 GB (Weights)</span>
              <span>24 GB (128k Context)</span>
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="flex items-center justify-end px-6 py-3.5 border-t border-white/10 bg-white/[0.02]">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-white hover:bg-zinc-200 text-xs font-semibold text-black transition cursor-pointer"
          >
            Close HUD
          </button>
        </div>

      </div>
    </div>
  );
};