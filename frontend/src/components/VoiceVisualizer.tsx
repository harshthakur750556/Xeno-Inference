import React, { useEffect, useRef, useState } from 'react';
import { Mic, Square, Activity } from 'lucide-react';

interface VoiceVisualizerProps {
  isListening: boolean;
  onStop: () => void;
  inline?: boolean;
}

export const VoiceVisualizer: React.FC<VoiceVisualizerProps> = ({ isListening, onStop, inline = false }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const [audioLevel, setAudioLevel] = useState<number>(0);

  useEffect(() => {
    if (!isListening) {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
      }
      if (audioContextRef.current) {
        audioContextRef.current.close().catch(() => {});
        audioContextRef.current = null;
      }
      return;
    }

    let isCancelled = false;

    const setupAudio = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        if (isCancelled) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        streamRef.current = stream;

        const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
        const ctx = new AudioCtx();
        audioContextRef.current = ctx;

        const analyser = ctx.createAnalyser();
        analyser.fftSize = 256;
        analyser.smoothingTimeConstant = 0.8;
        analyserRef.current = analyser;

        const source = ctx.createMediaStreamSource(stream);
        source.connect(analyser);
        sourceRef.current = source;

        const canvas = canvasRef.current;
        if (!canvas) return;
        const canvasCtx = canvas.getContext('2d');
        if (!canvasCtx) return;

        const freqData = new Uint8Array(analyser.frequencyBinCount);
        const timeData = new Uint8Array(analyser.fftSize);

        // Previous bar heights for smooth interpolation (lerp)
        const barCount = 36;
        const barHeights = new Float32Array(barCount).fill(4);
        let phase = 0;

        const render = () => {
          if (!analyserRef.current || !canvasRef.current) return;

          analyserRef.current.getByteFrequencyData(freqData);
          analyserRef.current.getByteTimeDomainData(timeData);

          const width = canvas.width;
          const height = canvas.height;
          const centerY = height / 2;

          canvasCtx.clearRect(0, 0, width, height);

          // Calculate overall RMS volume
          let sumSquares = 0;
          for (let i = 0; i < timeData.length; i++) {
            const val = (timeData[i] - 128) / 128;
            sumSquares += val * val;
          }
          const rms = Math.sqrt(sumSquares / timeData.length);
          const scaledRms = Math.min(1, rms * 4.5);
          setAudioLevel(Math.round(scaledRms * 100));

          phase += 0.06;

          // 1. Draw Symmetric Equalizer Frequency Bars
          const barWidth = 3.5;
          const gap = (width - barCount * barWidth) / (barCount + 1);

          for (let i = 0; i < barCount; i++) {
            // Map bar index to frequency bin with logarithmic distribution
            const binIdx = Math.floor(Math.pow(i / barCount, 1.4) * (freqData.length * 0.75));
            const freqVal = freqData[binIdx] / 255;

            // Idle wave motion if user is not speaking
            const idleMotion = Math.sin(phase * 2 + i * 0.35) * 3 + 3;
            const targetHeight = Math.max(3, freqVal * (height * 0.82) + idleMotion);

            // Smooth interpolation (lerp)
            barHeights[i] += (targetHeight - barHeights[i]) * 0.28;
            const currentHeight = barHeights[i];

            const x = gap + i * (barWidth + gap);
            const y = centerY - currentHeight / 2;

            // Create glowing gradient
            const gradient = canvasCtx.createLinearGradient(0, y, 0, y + currentHeight);
            if (scaledRms > 0.2) {
              gradient.addColorStop(0, 'rgba(255, 255, 255, 0.95)');
              gradient.addColorStop(0.5, 'rgba(210, 230, 255, 0.9)');
              gradient.addColorStop(1, 'rgba(160, 190, 255, 0.7)');
            } else {
              gradient.addColorStop(0, 'rgba(220, 220, 230, 0.7)');
              gradient.addColorStop(1, 'rgba(120, 120, 140, 0.4)');
            }

            canvasCtx.fillStyle = gradient;

            // Rounded pill caps
            canvasCtx.beginPath();
            if (canvasCtx.roundRect) {
              canvasCtx.roundRect(x, y, barWidth, currentHeight, [2]);
            } else {
              canvasCtx.rect(x, y, barWidth, currentHeight);
            }
            canvasCtx.fill();
          }

          // 2. Draw Center Waveform Ribbon (Subtle ambient glow)
          canvasCtx.beginPath();
          canvasCtx.lineWidth = 1.5;
          canvasCtx.strokeStyle = scaledRms > 0.15 ? 'rgba(255, 255, 255, 0.85)' : 'rgba(255, 255, 255, 0.25)';
          canvasCtx.shadowColor = 'rgba(255, 255, 255, 0.6)';
          canvasCtx.shadowBlur = scaledRms > 0.2 ? 6 : 2;

          for (let x = 0; x < width; x += 3) {
            const normX = (x / width) * 4 * Math.PI;
            const wave = Math.sin(normX - phase * 1.5) * Math.cos(normX * 0.5 + phase);
            const sampleIdx = Math.floor((x / width) * timeData.length);
            const timeSample = (timeData[sampleIdx] - 128) / 128;
            const y = centerY + wave * 2 + timeSample * (height * 0.35) * (scaledRms * 1.5 + 0.3);

            if (x === 0) {
              canvasCtx.moveTo(x, y);
            } else {
              canvasCtx.lineTo(x, y);
            }
          }
          canvasCtx.stroke();
          canvasCtx.shadowBlur = 0; // reset shadow

          animationFrameRef.current = requestAnimationFrame(render);
        };

        render();
      } catch (err) {
        console.error('Audio visualizer initialization error:', err);
      }
    };

    setupAudio();

    return () => {
      isCancelled = true;
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
        streamRef.current = null;
      }
      if (audioContextRef.current) {
        audioContextRef.current.close().catch(() => {});
        audioContextRef.current = null;
      }
    };
  }, [isListening]);

  if (!isListening) return null;

  if (inline) {
    return (
      <div className="flex items-center justify-between gap-2 px-3 py-1.5 mb-1.5 rounded-xl bg-zinc-900/90 border border-red-500/30 select-none animate-fade-in">
        <div className="flex items-center gap-2">
          <div className="relative flex items-center justify-center w-2.5 h-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500" />
          </div>
          <span className="text-[11px] font-mono text-zinc-200 font-semibold flex items-center gap-1">
            <Mic className="w-3 h-3 text-red-400" />
            <span>Listening...</span>
          </span>
          <span className="text-[10px] font-mono text-zinc-400 hidden sm:inline">
            {audioLevel > 15 ? 'Speaking' : 'Speak now'}
          </span>
        </div>

        <div className="flex-1 max-w-[220px] sm:max-w-xs h-5 mx-2">
          <canvas ref={canvasRef} width={280} height={20} className="w-full h-full block" />
        </div>

        <button
          type="button"
          onClick={onStop}
          className="flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-300 border border-red-500/40 text-[10px] font-mono transition cursor-pointer"
          title="Finish voice recording"
        >
          <Square className="w-2.5 h-2.5 fill-current" />
          <span>Done</span>
        </button>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-between gap-3 px-4 py-2.5 rounded-2xl bg-[#0b0b0f]/95 border border-zinc-700 shadow-2xl backdrop-blur-xl animate-fade-in select-none">
      
      {/* Listening Status Badge */}
      <div className="flex items-center gap-2">
        <div className="relative flex items-center justify-center w-3 h-3">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500" />
        </div>
        
        <div className="flex items-center gap-1.5 font-mono">
          <Mic className="w-3.5 h-3.5 text-white" />
          <span className="text-xs font-bold text-white tracking-wide">
            LIVE VOICE
          </span>
          <span className="text-[10px] text-zinc-400 ml-1">
            {audioLevel > 15 ? 'Speaking...' : 'Listening...'}
          </span>
        </div>
      </div>

      {/* Multi-Band Equalizer Canvas */}
      <div className="flex-1 max-w-xs sm:max-w-md h-8 relative flex items-center justify-center px-2">
        <canvas
          ref={canvasRef}
          width={360}
          height={32}
          className="w-full h-full block"
        />
      </div>

      {/* Audio Level Indicator & Done Button */}
      <div className="flex items-center gap-2">
        <div className="hidden sm:flex items-center gap-1 px-2 py-0.5 rounded-md bg-black border border-zinc-800 text-[10px] font-mono text-zinc-400">
          <Activity className="w-3 h-3 text-emerald-400" />
          <span>{audioLevel}%</span>
        </div>

        <button
          type="button"
          onClick={onStop}
          className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-white hover:bg-zinc-200 text-black text-xs font-bold transition cursor-pointer shadow-md"
        >
          <Square className="w-3 h-3 fill-black" />
          <span>Done</span>
        </button>
      </div>

    </div>
  );
};
