import React, { useEffect, useRef } from 'react';
import { Mic, Square } from 'lucide-react';

interface VoiceVisualizerProps {
  isListening: boolean;
  onStop: () => void;
}

export const VoiceVisualizer: React.FC<VoiceVisualizerProps> = ({ isListening, onStop }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animationFrameRef = useRef<number | null>(null);

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
        analyser.fftSize = 512;
        analyser.smoothingTimeConstant = 0.85;
        analyserRef.current = analyser;

        const source = ctx.createMediaStreamSource(stream);
        source.connect(analyser);
        sourceRef.current = source;

        const canvas = canvasRef.current;
        if (!canvas) return;
        const canvasCtx = canvas.getContext('2d');
        if (!canvasCtx) return;

        const timeData = new Uint8Array(analyser.fftSize);
        let phase = 0;

        const renderWaveform = () => {
          if (!analyserRef.current || !canvasRef.current) return;

          analyserRef.current.getByteTimeDomainData(timeData);

          const width = canvas.width;
          const height = canvas.height;
          const centerY = height / 2;

          canvasCtx.clearRect(0, 0, width, height);

          // Calculate average audio amplitude
          let sum = 0;
          for (let i = 0; i < timeData.length; i++) {
            const val = (timeData[i] - 128) / 128;
            sum += Math.abs(val);
          }
          const avgAmp = sum / timeData.length;
          const ampScale = Math.max(0.1, avgAmp * 3.5);

          phase += 0.08;

          // Draw Glowing Oscilloscope Wave 1 (Central Crisp Beam)
          canvasCtx.beginPath();
          canvasCtx.lineWidth = 2;
          canvasCtx.strokeStyle = 'rgba(255, 255, 255, 0.95)';
          canvasCtx.shadowColor = 'rgba(255, 255, 255, 0.8)';
          canvasCtx.shadowBlur = 8;

          for (let x = 0; x < width; x++) {
            const normalizedX = (x / width) * 4 * Math.PI;
            const wave = Math.sin(normalizedX + phase) * Math.cos(normalizedX * 0.5 - phase);
            const timeSample = (timeData[Math.floor((x / width) * timeData.length)] - 128) / 128;
            const y = centerY + (wave * 8 + timeSample * (height * 0.45)) * ampScale;

            if (x === 0) {
              canvasCtx.moveTo(x, y);
            } else {
              canvasCtx.lineTo(x, y);
            }
          }
          canvasCtx.stroke();

          // Draw Secondary Harmonic Wave (Subtle Diffusion Glow)
          canvasCtx.beginPath();
          canvasCtx.lineWidth = 1;
          canvasCtx.strokeStyle = 'rgba(200, 200, 220, 0.4)';
          canvasCtx.shadowBlur = 0;

          for (let x = 0; x < width; x++) {
            const normalizedX = (x / width) * 6 * Math.PI;
            const wave = Math.sin(normalizedX - phase * 1.2);
            const timeSample = (timeData[Math.floor((x / width) * timeData.length)] - 128) / 128;
            const y = centerY + (wave * 5 + timeSample * (height * 0.35)) * ampScale;

            if (x === 0) {
              canvasCtx.moveTo(x, y);
            } else {
              canvasCtx.lineTo(x, y);
            }
          }
          canvasCtx.stroke();

          animationFrameRef.current = requestAnimationFrame(renderWaveform);
        };

        renderWaveform();
      } catch (err) {
        console.error('Audio visualizer error:', err);
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

  return (
    <div className="flex items-center justify-between gap-3 px-4 py-2 rounded-2xl bg-black/90 border border-zinc-700 shadow-2xl animate-fade-in select-none">
      <div className="flex items-center gap-2">
        <div className="w-2.5 h-2.5 rounded-full bg-white animate-ping" />
        <span className="text-xs font-mono font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
          <Mic className="w-3.5 h-3.5 text-white" />
          <span>Voice Live Stream</span>
        </span>
      </div>

      <div className="flex-1 max-w-sm sm:max-w-md h-7 relative flex items-center justify-center">
        <canvas
          ref={canvasRef}
          width={380}
          height={28}
          className="w-full h-full block"
        />
      </div>

      <button
        onClick={onStop}
        className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-white hover:bg-zinc-200 text-black text-xs font-semibold transition cursor-pointer shadow-sm"
      >
        <Square className="w-3 h-3 fill-black" />
        <span>Done</span>
      </button>
    </div>
  );
};
