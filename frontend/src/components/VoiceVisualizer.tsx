import React, { useEffect, useRef } from 'react';

interface VoiceVisualizerProps {
  isListening: boolean;
  onStop: () => void;
}

export const VoiceVisualizer: React.FC<VoiceVisualizerProps> = ({ isListening, onStop }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  useEffect(() => {
    if (!isListening) {
      cleanupAudio();
      return;
    }

    let isMounted = true;

    async function initAudio() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
        if (!isMounted) {
          stream.getTracks().forEach((track) => track.stop());
          return;
        }
        streamRef.current = stream;

        const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
        const audioCtx = new AudioContextClass();
        audioContextRef.current = audioCtx;

        const analyser = audioCtx.createAnalyser();
        analyser.fftSize = 64;
        analyser.smoothingTimeConstant = 0.8;
        analyserRef.current = analyser;

        const source = audioCtx.createMediaStreamSource(stream);
        source.connect(analyser);
        sourceRef.current = source;

        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const bufferLength = analyser.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);

        const draw = () => {
          if (!isMounted) return;
          animationFrameRef.current = requestAnimationFrame(draw);

          analyser.getByteFrequencyData(dataArray);

          const width = canvas.width;
          const height = canvas.height;

          ctx.clearRect(0, 0, width, height);

          const barCount = 28;
          const barWidth = 3;
          const gap = 3;
          const totalWidth = barCount * (barWidth + gap) - gap;
          let startX = (width - totalWidth) / 2;

          for (let i = 0; i < barCount; i++) {
            // Map index to frequency bin
            const binIdx = Math.floor((i / barCount) * bufferLength * 0.7);
            const value = dataArray[binIdx] || 0;
            const percent = value / 255;
            const minHeight = 4;
            const barHeight = Math.max(minHeight, percent * (height - 6));

            const y = (height - barHeight) / 2;

            // Crisp monochrome white to light zinc bars
            ctx.fillStyle = percent > 0.4 ? '#ffffff' : '#a1a1aa';
            ctx.beginPath();
            ctx.roundRect(startX, y, barWidth, barHeight, 2);
            ctx.fill();

            startX += barWidth + gap;
          }
        };

        draw();
      } catch (err) {
        console.warn('Microphone access for visualizer failed:', err);
      }
    }

    initAudio();

    return () => {
      isMounted = false;
      cleanupAudio();
    };
  }, [isListening]);

  const cleanupAudio = () => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    if (sourceRef.current) {
      sourceRef.current.disconnect();
      sourceRef.current = null;
    }
    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      audioContextRef.current.close().catch(() => {});
      audioContextRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
  };

  if (!isListening) return null;

  return (
    <div className="flex items-center justify-between px-3.5 py-2 rounded-2xl bg-[#0e0e12] border border-white/20 shadow-lg animate-fade-in mb-2">
      <div className="flex items-center gap-2 text-xs font-mono text-zinc-300">
        <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
        <span>Listening...</span>
      </div>

      <canvas
        ref={canvasRef}
        width={180}
        height={24}
        className="w-[140px] sm:w-[180px] h-[24px]"
      />

      <button
        type="button"
        onClick={onStop}
        className="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-white text-[11px] font-mono transition cursor-pointer"
      >
        Done
      </button>
    </div>
  );
};
